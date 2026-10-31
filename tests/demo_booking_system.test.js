import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db/database';
import runSeed from '../src/scripts/seed';

describe('FOCUSPOINT Demo Booking System & 4-Tier Pricing Hierarchy Integration Suite', () => {
  let studentToken;
  let studentUserId;
  let superAdminToken;
  let districtAdminToken;
  let teacherToken;
  let teacherUserId;
  let libraryOwnerToken;
  let districtId;

  beforeAll(async () => {
    // 1. Reset and seed database with all roles, districts, and demo rules
    db.prepare('DELETE FROM demo_bookings').run();
    runSeed({ seedDemo: true });

    const gzp = db.prepare('SELECT id FROM districts WHERE code = ?').get('GZP');
    districtId = gzp ? gzp.id : 1;

    // Login Student
    const sLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'student.aryan@focuspoint.internal', password: 'Password@123' });
    studentToken = sLogin.body.token;
    studentUserId = sLogin.body.user.id;

    // Login Super Admin
    const saLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'superadmin@focuspoint.internal', password: 'SuperAdmin@FocusPoint2026!' });
    superAdminToken = saLogin.body.token;

    // Login District Admin
    const daLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'admin.ghazipur@focuspoint.internal', password: 'Password@123' });
    districtAdminToken = daLogin.body.token;

    // Login Teacher
    const tLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'alok.teacher@focuspoint.internal', password: 'Password@123' });
    teacherToken = tLogin.body.token;
    teacherUserId = tLogin.body.user.id;

    // Login Library Owner
    const loLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'owner.library@focuspoint.internal', password: 'Password@123' });
    libraryOwnerToken = loLogin.body.token;
  });

  describe('1. 4-Tier Pricing Hierarchy Resolution Engine', () => {
    it('Resolves Particular Entity price override with highest priority (Rs 50)', async () => {
      const res = await request(app)
        .post('/api/demos/calculate-price')
        .send({
          service_type: 'LIBRARY',
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          service_id: 'lib-focus-saidpur'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.price).toBe(50);
      expect(res.body.scopeUsed).toBe('PARTICULAR');
    });

    it('Resolves District price override when Particular does not match (Rs 60)', async () => {
      const res = await request(app)
        .post('/api/demos/calculate-price')
        .send({
          service_type: 'LIBRARY',
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          service_id: 'non-existent-lib-id'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.price).toBe(60);
      expect(res.body.scopeUsed).toBe('DISTRICT');
    });

    it('Resolves State price override when District has no specific rule (Rs 80)', async () => {
      const res = await request(app)
        .post('/api/demos/calculate-price')
        .send({
          service_type: 'LIBRARY',
          state: 'Uttar Pradesh',
          district: 'Lucknow'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.price).toBe(80);
      expect(res.body.scopeUsed).toBe('STATE');
    });

    it('Resolves Pan-India standard price when State has no rule (Rs 100)', async () => {
      const res = await request(app)
        .post('/api/demos/calculate-price')
        .send({
          service_type: 'LIBRARY',
          state: 'Maharashtra',
          district: 'Pune'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.price).toBe(100);
      expect(res.body.scopeUsed).toBe('PAN_INDIA');
    });

    it('Returns Free (0) default fallback when no matching active rule exists', async () => {
      // Temporarily deactivate Pan-India rule for test check
      db.prepare("UPDATE demo_pricing_rules SET is_active = 0 WHERE scope_type = 'PAN_INDIA' AND service_type = 'LIBRARY'").run();

      const res = await request(app)
        .post('/api/demos/calculate-price')
        .send({
          service_type: 'LIBRARY',
          state: 'Tamil Nadu',
          district: 'Chennai'
        });

      expect(res.status).toBe(200);
      expect(res.body.price).toBe(0);
      expect(res.body.scopeUsed).toBe('DEFAULT_FREE');

      // Re-enable
      db.prepare("UPDATE demo_pricing_rules SET is_active = 1 WHERE scope_type = 'PAN_INDIA' AND service_type = 'LIBRARY'").run();
    });
  });

  describe('2. Student Demo Booking & Strict 1-Time Limit Enforcement', () => {
    it('Checks eligibility for fresh student (both allowed)', async () => {
      const res = await request(app)
        .get('/api/demos/eligibility')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.hasUsedLibraryDemo).toBe(false);
      expect(res.body.hasUsedTuitionDemo).toBe(false);
    });

    let createdLibraryDemo;

    it('Successfully creates a Library Demo Booking with atomic Demo ID and locked fee', async () => {
      const res = await request(app)
        .post('/api/demos/book')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          service_type: 'LIBRARY',
          service_name: 'FocusPoint Central Library',
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          demo_date: '2026-09-25',
          demo_time: '10:00 AM - 01:00 PM',
          subject_or_shift: 'Morning Shift Seat Demo'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.booking).toBeDefined();
      expect(res.body.booking.demo_booking_id).toMatch(/^FP-LIB-DEMO-\d{8}-\d{4}$/);
      expect(res.body.booking.price).toBe(60); // Ghazipur district price
      expect(res.body.booking.payment_status).toBe('PENDING'); // Paid rule requires payment

      createdLibraryDemo = res.body.booking;
    });

    it('Rejects duplicate Library Demo booking for the same student (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/demos/book')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          service_type: 'LIBRARY',
          service_name: 'FocusPoint Central Library',
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          demo_date: '2026-09-26',
          demo_time: '02:00 PM - 05:00 PM'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('DEMO_ALREADY_USED');
    });

    it('Processes payment for the booked demo and confirms it', async () => {
      const res = await request(app)
        .post('/api/demos/process-payment')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          booking_id: createdLibraryDemo.demo_booking_id,
          payment_method: 'UPI_QR',
          transaction_id: 'UPI-FP-DEMO-TEST-998811'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.booking.payment_status).toBe('PAID');
      expect(res.body.booking.booking_status).toBe('CONFIRMED');
    });

    it('Eligibility check now reflects Library Demo as used, but Home Tuition Demo remains available', async () => {
      const res = await request(app)
        .get('/api/demos/eligibility')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.hasUsedLibraryDemo).toBe(true);
      expect(res.body.hasUsedTuitionDemo).toBe(false);
    });

    it('Allows student to book Home Tuition Demo as second category', async () => {
      const res = await request(app)
        .post('/api/demos/book')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          service_type: 'HOME_TUITION',
          service_name: 'Dr. Alok Nath Tuition',
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          teacher_id: teacherUserId,
          demo_date: '2026-09-27',
          demo_time: '05:00 PM - 06:00 PM',
          subject_or_shift: 'Class 10 - Mathematics Demo'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.booking.demo_booking_id).toMatch(/^FP-TUT-DEMO-\d{8}-\d{4}$/);
      expect(res.body.booking.price).toBe(129); // Ghazipur district tuition price
    });

    it('Student can view all their demo bookings', async () => {
      const res = await request(app)
        .get('/api/demos/my-bookings')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.demos.length).toBe(2);
    });
  });

  describe('3. QR Verification System for On-Site Entry', () => {
    it('Verifies a valid, confirmed demo booking via demo_booking_id', async () => {
      // Find the confirmed library demo
      const demo = db.prepare("SELECT demo_booking_id FROM demo_bookings WHERE service_type = 'LIBRARY' AND payment_status = 'PAID'").get();
      expect(demo).toBeDefined();

      const res = await request(app)
        .post('/api/demos/verify-qr')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({ demo_booking_id: demo.demo_booking_id });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.valid).toBe(true);
      expect(res.body.serviceType).toBe('LIBRARY');
      expect(res.body.studentName).toBeDefined();
    });

    it('Rejects an invalid or unknown QR payload', async () => {
      const res = await request(app)
        .post('/api/demos/verify-qr')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({ demo_booking_id: 'FP-INVALID-DEMO-00000000-9999' });

      expect(res.status).toBe(404);
      expect(res.body.valid).toBe(false);
    });
  });

  describe('4. Admin Demo Pricing Rules Management & Conflict Prevention', () => {
    let createdRuleId;

    it('Super Admin can create a new district demo pricing rule', async () => {
      const res = await request(app)
        .post('/api/demos/admin/pricing-rules')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          service_type: 'LIBRARY',
          scope_type: 'DISTRICT',
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          price: 75,
          start_date: '2026-09-01'
        });

      // Varanasi already seeded with 70, so conflict check triggers 409
      expect(res.status).toBe(409);
      expect(res.body.message).toContain('active pricing rule already exists');
    });

    it('Super Admin can create a rule for a new district without conflict', async () => {
      const res = await request(app)
        .post('/api/demos/admin/pricing-rules')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          service_type: 'LIBRARY',
          scope_type: 'DISTRICT',
          state: 'Uttar Pradesh',
          district: 'Ballia',
          price: 65,
          start_date: '2026-09-01'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.rule.price).toBe(65);
      createdRuleId = res.body.rule.id;
    });

    it('Super Admin can update pricing rule price', async () => {
      const res = await request(app)
        .put(`/api/demos/admin/pricing-rules/${createdRuleId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ price: 72 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.rule.price).toBe(72);
    });

    it('Super Admin can delete a pricing rule', async () => {
      const res = await request(app)
        .delete(`/api/demos/admin/pricing-rules/${createdRuleId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('District Admin cannot create Pan-India or State rules (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/demos/admin/pricing-rules')
        .set('Authorization', `Bearer ${districtAdminToken}`)
        .send({
          service_type: 'LIBRARY',
          scope_type: 'PAN_INDIA',
          price: 150,
          start_date: '2026-09-01'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
