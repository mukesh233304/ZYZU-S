import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db/database';
import runSeed from '../src/scripts/seed';

describe('FOCUSPOINT Phase 3: Tutor & Library Discovery and Booking Engine Test Suite', () => {
  let studentToken;
  let studentUserId;
  let teacherToken;
  let teacherUserId;
  let libraryOwnerToken;
  let libraryOwnerUserId;
  let districtAdminToken;
  let superAdminToken;

  let ghazipurDistrictId;
  let varanasiDistrictId;
  let libraryId;
  let demoSeatId;

  beforeAll(async () => {
    // 1. Clean test tables
    db.pragma('foreign_keys = OFF');
    db.prepare("DELETE FROM users WHERE email != 'superadmin@focuspoint.internal'").run();
    db.prepare('DELETE FROM district_admins').run();
    db.prepare('DELETE FROM libraries').run();
    db.prepare('DELETE FROM library_seats').run();
    db.prepare('DELETE FROM library_shifts').run();
    db.prepare('DELETE FROM library_enrollments').run();
    db.prepare('DELETE FROM teacher_student_assignments').run();
    db.prepare('DELETE FROM teacher_schedules').run();
    db.prepare('DELETE FROM attendance_records').run();
    db.prepare('DELETE FROM fee_records').run();
    db.prepare('DELETE FROM booking_requests').run();
    db.prepare('DELETE FROM notifications').run();
    db.prepare('DELETE FROM support_tickets').run();
    db.pragma('foreign_keys = ON');

    // 2. Run seed with demo data
    runSeed({ seedDemo: true });

    const gzp = db.prepare('SELECT id FROM districts WHERE code = ?').get('GZP');
    const vns = db.prepare('SELECT id FROM districts WHERE code = ?').get('VNS');
    ghazipurDistrictId = gzp ? gzp.id : 1;
    varanasiDistrictId = vns ? vns.id : 3;

    // 3. Login Super Admin
    const saLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'superadmin@focuspoint.internal', password: 'SuperAdmin@FocusPoint2026!' });
    superAdminToken = saLogin.body.token;

    // 4. Login District Admin
    const daLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'admin.ghazipur@focuspoint.internal', password: 'Password@123' });
    districtAdminToken = daLogin.body.token;

    // 5. Login Active Teacher
    const teacherLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'alok.teacher@focuspoint.internal', password: 'Password@123' });
    teacherToken = teacherLogin.body.token;
    teacherUserId = teacherLogin.body.user.id;

    // 6. Login Library Owner
    const libLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'owner.library@focuspoint.internal', password: 'Password@123' });
    libraryOwnerToken = libLogin.body.token;
    libraryOwnerUserId = libLogin.body.user.id;

    const libRow = db.prepare('SELECT id FROM libraries WHERE owner_id = ?').get(libraryOwnerUserId);
    libraryId = libRow.id;

    const seatRow = db.prepare("SELECT id FROM library_seats WHERE library_id = ? AND status = 'AVAILABLE' LIMIT 1").get(libraryId);
    demoSeatId = seatRow ? seatRow.id : 1;

    // 7. Login Student
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'student.aryan@focuspoint.internal', password: 'Password@123' });
    studentToken = studentLogin.body.token;
    studentUserId = studentLogin.body.user.id;
  });

  // =========================================================
  // 1. PUBLIC DISCOVERY & SEARCH API TESTS
  // =========================================================
  describe('1. Public Discovery & Search Engine Endpoints', () => {
    it('GET /api/public/tutors returns verified active public teachers only', async () => {
      const res = await request(app).get('/api/public/tutors');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.tutors)).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(1);

      // Verify pending teachers (e.g. rohan.pending) are NOT included
      const pendingTeacher = res.body.tutors.find(t => t.fullName.includes('Rohan'));
      expect(pendingTeacher).toBeUndefined();

      // Verify active tutor fields
      const alok = res.body.tutors.find(t => t.id === teacherUserId);
      expect(alok).toBeDefined();
      expect(alok.fullName).toBe('Dr. Alok Nath Mishra');
      expect(alok.districtName).toBe('Ghazipur');
      expect(Array.isArray(alok.subjects)).toBe(true);
      expect(alok.subjects).toContain('Physics');
      expect(alok.expectedFee).toBe(7500);
    });

    it('GET /api/public/tutors filters correctly by district, subject, mode, and fee', async () => {
      // By district
      const resDistrict = await request(app).get(`/api/public/tutors?district_id=${ghazipurDistrictId}`);
      expect(resDistrict.status).toBe(200);
      expect(resDistrict.body.tutors.length).toBeGreaterThanOrEqual(1);

      // By different district (Varanasi) -> should be 0
      const resOtherDistrict = await request(app).get(`/api/public/tutors?district_id=${varanasiDistrictId}`);
      expect(resOtherDistrict.status).toBe(200);
      expect(resOtherDistrict.body.tutors.length).toBe(0);

      // By subject
      const resSubject = await request(app).get('/api/public/tutors?subject=Physics');
      expect(resSubject.status).toBe(200);
      expect(resSubject.body.tutors.length).toBeGreaterThanOrEqual(1);

      // By non-existent subject
      const resNoSubject = await request(app).get('/api/public/tutors?subject=QuantumAstrophysicsNonExistent');
      expect(resNoSubject.status).toBe(200);
      expect(resNoSubject.body.tutors.length).toBe(0);

      // By fee range
      const resFee = await request(app).get('/api/public/tutors?min_fee=5000&max_fee=10000');
      expect(resFee.status).toBe(200);
      expect(resFee.body.tutors.length).toBeGreaterThanOrEqual(1);

      // Search keyword
      const resSearch = await request(app).get('/api/public/tutors?search=Mishra');
      expect(resSearch.status).toBe(200);
      expect(resSearch.body.tutors.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/public/tutors/:id returns full dossier including weekly schedules', async () => {
      const res = await request(app).get(`/api/public/tutors/${teacherUserId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.tutor).toBeDefined();
      expect(res.body.tutor.fullName).toBe('Dr. Alok Nath Mishra');
      expect(Array.isArray(res.body.tutor.schedules)).toBe(true);
      expect(res.body.tutor.schedules.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/public/tutors/:id returns 404 for non-existent or unapproved teacher', async () => {
      const res = await request(app).get('/api/public/tutors/non-existent-uuid-12345');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/public/libraries returns active libraries with live seat calculations', async () => {
      const res = await request(app).get('/api/public/libraries');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.libraries.length).toBeGreaterThanOrEqual(1);

      const lib = res.body.libraries.find(l => l.id === libraryId);
      expect(lib).toBeDefined();
      expect(lib.name).toContain('Central Reading Hall');
      expect(lib.totalSeats).toBe(40);
      expect(lib.availableSeats).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(lib.amenities)).toBe(true);
      expect(Array.isArray(lib.shifts)).toBe(true);
      expect(lib.shifts.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/public/libraries/:id returns library details and seat grid matrix', async () => {
      const res = await request(app).get(`/api/public/libraries/${libraryId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.library.name).toBeDefined();
      expect(Array.isArray(res.body.library.seats)).toBe(true);
      expect(res.body.library.seats.length).toBe(40);
    });

    it('GET /api/public/search-meta returns aggregated discovery metadata', async () => {
      const res = await request(app).get('/api/public/search-meta');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.districts)).toBe(true);
      expect(Array.isArray(res.body.subjects)).toBe(true);
      expect(Array.isArray(res.body.classes)).toBe(true);
      expect(Array.isArray(res.body.amenities)).toBe(true);
      expect(res.body.feeBounds.minTutorFee).toBeDefined();
      expect(res.body.feeBounds.maxTutorFee).toBeDefined();
    });
  });

  // =========================================================
  // 2. STUDENT BOOKING & REQUEST LIFECYCLE TESTS
  // =========================================================
  describe('2. Student Booking Workflow Engine', () => {
    let createdTutorBookingId;
    let createdLibBookingId;

    it('POST /api/student/bookings creates a home tuition inquiry and dispatches teacher notification', async () => {
      const res = await request(app)
        .post('/api/student/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          target_type: 'TEACHER',
          teacher_id: teacherUserId,
          subject_or_shift: 'Class 12 Physics',
          preferred_mode: 'OFFLINE',
          message: 'Looking for 3 days a week home tuition in Saidpur.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.bookingId).toBeDefined();
      createdTutorBookingId = res.body.bookingId;

      // Verify notification created for teacher
      const notif = db.prepare(`
        SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
      `).get(teacherUserId);
      expect(notif).toBeDefined();
      expect(notif.title).toContain('Home Tuition Inquiry');
    });

    it('POST /api/student/bookings creates a library desk reservation and dispatches owner notification', async () => {
      const res = await request(app)
        .post('/api/student/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          target_type: 'LIBRARY',
          library_id: libraryId,
          subject_or_shift: 'Morning Shift (6:00 AM - 12:00 PM)',
          preferred_seat_id: demoSeatId,
          start_date: '2026-09-10',
          message: 'Need quiet desk near window with power plug.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.bookingId).toBeDefined();
      createdLibBookingId = res.body.bookingId;

      // Verify notification for library owner
      const notif = db.prepare(`
        SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
      `).get(libraryOwnerUserId);
      expect(notif).toBeDefined();
      expect(notif.title).toContain('Study Desk Request');
    });

    it('GET /api/student/bookings returns list with enriched status and preferred details', async () => {
      const res = await request(app)
        .get('/api/student/bookings')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.bookings)).toBe(true);

      const tutorBooking = res.body.bookings.find(b => b.id === createdTutorBookingId);
      expect(tutorBooking).toBeDefined();
      expect(tutorBooking.status).toBe('PENDING');
      expect(tutorBooking.target_type).toBe('TEACHER');
      expect(tutorBooking.teacher_name).toBe('Dr. Alok Nath Mishra');

      const libBooking = res.body.bookings.find(b => b.id === createdLibBookingId);
      expect(libBooking).toBeDefined();
      expect(libBooking.status).toBe('PENDING');
      expect(libBooking.target_type).toBe('LIBRARY');
      expect(libBooking.library_name).toContain('Central Reading Hall');
    });

    it('POST /api/student/bookings/:id/cancel allows student to cancel a pending request', async () => {
      // Create a booking specifically to cancel
      const newBooking = await request(app)
        .post('/api/student/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          target_type: 'TEACHER',
          teacher_id: teacherUserId,
          subject_or_shift: 'Mathematics Doubt Clearing',
          preferred_mode: 'ONLINE',
          message: 'Cancel test'
        });
      const cancelId = newBooking.body.bookingId;

      const res = await request(app)
        .post(`/api/student/bookings/${cancelId}/cancel`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify status in DB
      const bRow = db.prepare('SELECT status FROM booking_requests WHERE id = ?').get(cancelId);
      expect(bRow.status).toBe('CANCELLED');

      // Attempting to cancel again should fail with 400
      const resAgain = await request(app)
        .post(`/api/student/bookings/${cancelId}/cancel`)
        .set('Authorization', `Bearer ${studentToken}`);
      expect(resAgain.status).toBe(400);
    });
  });

  // =========================================================
  // 3. TEACHER BOOKING RESPONSE & ENROLLMENT WORKFLOW
  // =========================================================
  describe('3. Teacher Booking Handling & Student Enrollment', () => {
    let activeBookingId;
    let rejectBookingId;

    beforeAll(async () => {
      // Create two booking requests for testing accept and reject
      const b1 = await request(app)
        .post('/api/student/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          target_type: 'TEACHER',
          teacher_id: teacherUserId,
          subject_or_shift: 'Advanced Physics Board Batch',
          preferred_mode: 'BOTH',
          message: 'Please accept my tutoring request.'
        });
      activeBookingId = b1.body.bookingId;

      const b2 = await request(app)
        .post('/api/student/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          target_type: 'TEACHER',
          teacher_id: teacherUserId,
          subject_or_shift: 'Chemistry Crash Course',
          preferred_mode: 'OFFLINE',
          message: 'Interested in offline crash course.'
        });
      rejectBookingId = b2.body.bookingId;
    });

    it('GET /api/teacher/bookings returns incoming requests for the teacher', async () => {
      const res = await request(app)
        .get('/api/teacher/bookings')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.bookings)).toBe(true);

      const target = res.body.bookings.find(b => b.id === activeBookingId);
      expect(target).toBeDefined();
      expect(target.student_name).toBe('Aryan Singh');
      expect(target.status).toBe('PENDING');
    });

    it('POST /api/teacher/bookings/:id/respond with ACCEPT creates assignment, fee record & student alert', async () => {
      const res = await request(app)
        .post(`/api/teacher/bookings/${activeBookingId}/respond`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          action: 'ACCEPT',
          monthly_fee: 6500,
          teaching_mode: 'OFFLINE',
          response_note: 'Welcome to the Physics Board Batch!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify booking status
      const bRow = db.prepare('SELECT status, response_note FROM booking_requests WHERE id = ?').get(activeBookingId);
      expect(bRow.status).toBe('ACCEPTED');

      // Verify active assignment created in teacher_student_assignments
      const assignment = db.prepare(`
        SELECT * FROM teacher_student_assignments
        WHERE teacher_id = ? AND student_id = ? AND subject = 'Advanced Physics Board Batch'
      `).get(teacherUserId, studentUserId);
      expect(assignment).toBeDefined();
      expect(assignment.status).toBe('ACTIVE');
      expect(assignment.monthly_fee).toBe(6500);

      // Verify initial tuition fee record in fee_records
      const fee = db.prepare(`
        SELECT * FROM fee_records
        WHERE teacher_id = ? AND student_id = ? AND type = 'TUTOR'
        ORDER BY id DESC LIMIT 1
      `).get(teacherUserId, studentUserId);
      expect(fee).toBeDefined();
      expect(fee.amount).toBe(6500);
      expect(fee.status).toBe('PENDING');

      // Verify celebratory student notification
      const notif = db.prepare(`
        SELECT * FROM notifications WHERE user_id = ? AND type = 'SUCCESS' ORDER BY id DESC LIMIT 1
      `).get(studentUserId);
      expect(notif).toBeDefined();
      expect(notif.title).toContain('Tuition Request Accepted');
    });

    it('POST /api/teacher/bookings/:id/respond with REJECT updates status and alerts student', async () => {
      const res = await request(app)
        .post(`/api/teacher/bookings/${rejectBookingId}/respond`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          action: 'REJECT',
          response_note: 'Batch is currently full. Please apply for the next month.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const bRow = db.prepare('SELECT status, response_note FROM booking_requests WHERE id = ?').get(rejectBookingId);
      expect(bRow.status).toBe('REJECTED');
      expect(bRow.response_note).toContain('Batch is currently full');

      // Verify student warning notification
      const notif = db.prepare(`
        SELECT * FROM notifications WHERE user_id = ? AND type = 'WARNING' ORDER BY id DESC LIMIT 1
      `).get(studentUserId);
      expect(notif).toBeDefined();
      expect(notif.title).toContain('Tutoring Request Update');
    });

    it('Cannot respond to an already resolved booking request', async () => {
      const res = await request(app)
        .post(`/api/teacher/bookings/${activeBookingId}/respond`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ action: 'REJECT' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================
  // 4. LIBRARY OWNER BOOKING RESPONSE & SEAT OCCUPANCY
  // =========================================================
  describe('4. Library Owner Booking Response & Desk Allocation', () => {
    let libBookingId;

    beforeAll(async () => {
      const b = await request(app)
        .post('/api/student/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          target_type: 'LIBRARY',
          library_id: libraryId,
          subject_or_shift: 'Evening Shift (12:00 PM - 6:00 PM)',
          preferred_seat_id: demoSeatId,
          start_date: '2026-09-15',
          message: 'Evening desk study request.'
        });
      libBookingId = b.body.bookingId;
    });

    it('GET /api/library/bookings returns desk reservation requests', async () => {
      const res = await request(app)
        .get('/api/library/bookings')
        .set('Authorization', `Bearer ${libraryOwnerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const target = res.body.bookings.find(b => b.id === libBookingId);
      expect(target).toBeDefined();
      expect(target.status).toBe('PENDING');
      expect(target.student_name).toBe('Aryan Singh');
    });

    it('POST /api/library/bookings/:id/respond with ACCEPT allocates desk and marks seat OCCUPIED', async () => {
      const res = await request(app)
        .post(`/api/library/bookings/${libBookingId}/respond`)
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          action: 'ACCEPT',
          seat_id: demoSeatId,
          monthly_fee: 600,
          response_note: 'Desk reserved. Welcome to Central Library!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify seat is now OCCUPIED
      const seat = db.prepare('SELECT status FROM library_seats WHERE id = ?').get(demoSeatId);
      expect(seat.status).toBe('OCCUPIED');

      // Verify enrollment created
      const enroll = db.prepare(`
        SELECT * FROM library_enrollments WHERE library_id = ? AND student_id = ? AND seat_id = ?
      `).get(libraryId, studentUserId, demoSeatId);
      expect(enroll).toBeDefined();
      expect(enroll.status).toBe('ACTIVE');

      // Verify fee record created
      const fee = db.prepare(`
        SELECT * FROM fee_records WHERE library_id = ? AND student_id = ? AND type = 'LIBRARY' ORDER BY id DESC LIMIT 1
      `).get(libraryId, studentUserId);
      expect(fee).toBeDefined();
      expect(fee.amount).toBe(600);
    });
  });

  // =========================================================
  // 5. DISTRICT ADMIN REQUEST OVERSIGHT & FACILITATION
  // =========================================================
  describe('5. District Admin Booking Oversight & Matching', () => {
    let unassignedBookingId;

    beforeAll(async () => {
      // Create a student booking in Ghazipur
      const b = await request(app)
        .post('/api/student/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          target_type: 'TEACHER',
          teacher_id: teacherUserId,
          subject_or_shift: 'Class 10 Board Math Special',
          preferred_mode: 'OFFLINE',
          message: 'Need help finding experienced math tutor.'
        });
      unassignedBookingId = b.body.bookingId;
    });

    it('GET /api/district-admin/requests retrieves district-scoped booking requests', async () => {
      const res = await request(app)
        .get('/api/district-admin/requests')
        .set('Authorization', `Bearer ${districtAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.requests)).toBe(true);

      const target = res.body.requests.find(r => r.id === unassignedBookingId);
      expect(target).toBeDefined();
      expect(target.student_name).toBe('Aryan Singh');
    });

    it('POST /api/district-admin/requests/:id/assign pairs learner directly with district teacher', async () => {
      const res = await request(app)
        .post(`/api/district-admin/requests/${unassignedBookingId}/assign`)
        .set('Authorization', `Bearer ${districtAdminToken}`)
        .send({
          teacher_id: teacherUserId,
          monthly_fee: 5500,
          teaching_mode: 'OFFLINE',
          admin_notes: 'Matched via District Academic Helpdesk'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify pairing exists
      const pair = db.prepare(`
        SELECT * FROM teacher_student_assignments
        WHERE teacher_id = ? AND student_id = ? AND subject = 'Class 10 Board Math Special'
      `).get(teacherUserId, studentUserId);
      expect(pair).toBeDefined();
      expect(pair.monthly_fee).toBe(5500);

      // Verify student received admin pairing notification
      const notif = db.prepare(`
        SELECT * FROM notifications WHERE user_id = ? AND message LIKE '%District Administration%' ORDER BY id DESC LIMIT 1
      `).get(studentUserId);
      expect(notif).toBeDefined();
    });
  });

  // =========================================================
  // 6. STRICT AUTHORIZATION & ACCESS CONTROL
  // =========================================================
  describe('6. Security & Role Authorization on Bookings', () => {
    it('Unauthenticated requests are rejected with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/student/bookings');
      expect(res.status).toBe(401);
    });

    it('Student cannot respond to teacher bookings (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/teacher/bookings/1/respond')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ action: 'ACCEPT' });

      expect(res.status).toBe(403);
    });

    it('Teacher cannot cancel student bookings (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/student/bookings/1/cancel')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(403);
    });
  });
});
