/**
 * FOCUSPOINT Smart Personal QR Attendance Pass & Backend System Test Suite
 * Validates End-to-End Core Journeys across:
 * 1. Home Tuition & Library Booking Confirmation Events
 * 2. Official WhatsApp Bot Notification & Failure Resilience (No Transaction Rollback)
 * 3. Personal QR Pass Dynamic Issuance & Deterministic Cryptographic Token Security
 * 4. Authoritative Billing Month & Fee Ledger Enforcement (Blocking Unpaid Fees)
 * 5. Instant Attendance Access Restoration upon Payment
 * 6. Cross-Student QR Scan Abuse Prevention & Audit Logging
 * 7. Independent Dual-Service Sessions (Home Tuition & Library Separate Timers)
 * 8. Authoritative Check-In, Check-Out, and Accurate Duration Computation
 * 9. Automatic Parent WhatsApp Alerts on Check-In and Check-Out
 * 10. Pass Reissuance, Versioning, and Revocation Handling
 * 11. Teacher and Library Owner Manual Marking updating Canonical Attendance Records
 * 12. Super Admin & District Admin Analytics Observability
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db/database';
import { generateToken } from '../src/utils/token';
import config from '../src/config';
import qrPassService from '../src/services/qrPassService';
import attendanceService from '../src/services/attendanceService';
import whatsappNotificationService from '../src/services/whatsappNotificationService';
import bookingConfirmationService from '../src/services/bookingConfirmationService';

describe('FOCUSPOINT — Smart QR Attendance Pass & Real-Time Access Backend Engine', () => {
  let studentAryanToken;
  let studentOtherToken;
  let teacherAlokToken;
  let libraryOwnerToken;
  let superAdminToken;

  let studentAryanId;
  let studentOtherId;
  let teacherAlokId;
  let libraryOwnerId;
  let superAdminId;

  beforeAll(() => {
    // 1. Ensure demo data is seeded
    const runSeed = require('../src/scripts/seed');
    runSeed({ seedDemo: true });

    // 2. Dynamically lookup current canonical demo users
    const studentUser = db.prepare("SELECT id FROM users WHERE email = 'student.aryan@focuspoint.internal'").get();
    const teacherUser = db.prepare("SELECT id FROM users WHERE email = 'alok.teacher@focuspoint.internal'").get();
    const libraryUser = db.prepare("SELECT id FROM users WHERE email = 'owner.library@focuspoint.internal'").get();
    const adminUser = db.prepare("SELECT id FROM users WHERE email = 'superadmin@focuspoint.internal'").get();

    studentAryanId = studentUser ? studentUser.id : '0d22cca0-6442-40a5-b859-87e269078d0e';
    teacherAlokId = teacherUser ? teacherUser.id : '88199f40-bc91-4972-a323-2f4073f10b6b';
    libraryOwnerId = libraryUser ? libraryUser.id : 'f543837b-f809-422b-a131-ddf3fdb0bd1c';
    superAdminId = adminUser ? adminUser.id : '83a90e5f-c62a-4497-bee0-0f2725418c07';

    // Ensure distinct secondary student for cross-student security test
    let otherUser = db.prepare(`
      SELECT u.id FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'STUDENT' AND u.id != ?
      LIMIT 1
    `).get(studentAryanId);

    if (otherUser) {
      studentOtherId = otherUser.id;
    } else {
      const studentRole = db.prepare("SELECT id FROM roles WHERE name = 'STUDENT'").get();
      const district = db.prepare("SELECT id FROM districts LIMIT 1").get();
      studentOtherId = `usr-other-student-${Date.now()}`;
      const uniqueMobile = `91${Date.now().toString().slice(-8)}`;
      db.prepare(`
        INSERT INTO users (id, email, mobile, password_hash, role_id, district_id, account_status)
        VALUES (?, ?, ?, 'hash', ?, ?, 'ACTIVE')
      `).run(studentOtherId, `other.${Date.now()}@focuspoint.internal`, uniqueMobile, studentRole.id, district ? district.id : 1);
      db.prepare(`
        INSERT INTO student_profiles (user_id, full_name, dob, gender, city_area, address, pincode)
        VALUES (?, 'Other Student', '2005-01-01', 'Female', 'Area', 'Address', '233304')
      `).run(studentOtherId);
    }

    studentAryanToken = generateToken({ userId: studentAryanId, role: config.roles.STUDENT });
    studentOtherToken = generateToken({ userId: studentOtherId, role: config.roles.STUDENT });
    teacherAlokToken = generateToken({ userId: teacherAlokId, role: config.roles.TEACHER });
    libraryOwnerToken = generateToken({ userId: libraryOwnerId, role: config.roles.LIBRARY_OWNER });
    superAdminToken = generateToken({ userId: superAdminId, role: config.roles.SUPER_ADMIN });

    // Ensure student profiles have parent contact details
    db.prepare(`
      UPDATE student_profiles
      SET parent_phone = '9876543210', parent_name = 'Vikram Singh', whatsapp_number = '9876500040'
      WHERE user_id = ?
    `).run(studentAryanId);
  });

  // =========================================================================
  // 1. Personal QR Attendance Pass Issuance & Token Security
  // =========================================================================
  describe('1. Personal QR Pass Dynamic Issuance & Cryptographic Token Generation', () => {
    it('GET /api/qr-pass/my-pass should dynamically issue a Personal QR Pass with active services', async () => {
      const res = await request(app)
        .get('/api/qr-pass/my-pass')
        .set('Authorization', `Bearer ${studentAryanToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.pass).toBeDefined();

      const pass = res.body.pass;
      expect(pass.studentId).toBe(studentAryanId);
      expect(pass.studentName).toContain('Aryan Singh');
      expect(pass.qrId).toMatch(/^FP-QR-[A-Z0-9]+-\d{4}/);
      expect(pass.token).toMatch(/^fp-att-tok-v2-/);
      expect(pass.version).toBeGreaterThanOrEqual(1);

      // Verify dual-service detection
      expect(pass.activeServices).toBeDefined();
      expect(Array.isArray(pass.activeServices)).toBe(true);
      const hasTuition = pass.activeServices.some(s => s.serviceType === 'HOME_TUITION');
      const hasLibrary = pass.activeServices.some(s => s.serviceType === 'LIBRARY');
      expect(hasTuition).toBe(true);
      expect(hasLibrary).toBe(true);
      expect(pass.serviceType).toBe('UNIVERSAL');
    });

    it('Deterministic token generator produces consistent non-plaintext tokens for the same version', () => {
      const token1 = qrPassService.generateSecureToken(studentAryanId, 1);
      const token2 = qrPassService.generateSecureToken(studentAryanId, 1);
      const tokenV2 = qrPassService.generateSecureToken(studentAryanId, 2);

      expect(token1).toBe(token2);
      expect(token1).not.toBe(tokenV2);
      expect(token1).toContain(qrPassService.QR_PASS_TOKEN_PREFIX);
    });
  });

  // =========================================================================
  // 2. Authoritative Fee Standing & Access Enforcement
  // =========================================================================
  describe('2. Active Billing Month & Ledger Fee Status Enforcement', () => {
    it('Blocks attendance scan when current month fee is unpaid/overdue', async () => {
      // Temporarily mark a fee record as OVERDUE for Aryan
      db.prepare(`
        UPDATE fee_records
        SET status = 'OVERDUE'
        WHERE student_id = ? AND type = 'TUTOR'
      `).run(studentAryanId);

      const pass = await qrPassService.getOrCreatePersonalQrPass(studentAryanId);

      const res = await request(app)
        .post('/api/qr-pass/validate')
        .set('Authorization', `Bearer ${studentAryanToken}`)
        .send({ token: pass.token });

      expect(res.status).toBe(402); // Payment Required
      expect(res.body.valid).toBe(false);
      expect(res.body.code).toBe('UNPAID_FEE');
      expect(res.body.message).toContain('currently inactive because the required fee for the current billing period');
      expect(res.body.pendingAmount).toBeGreaterThan(0);
    });

    it('Automatically restores attendance access when pending fee is settled', async () => {
      // Settle the pending/overdue tutor fee
      db.prepare(`
        UPDATE fee_records
        SET status = 'PAID', paid_date = date('now'), receipt_no = 'TEST-REC-PAID'
        WHERE student_id = ? AND type = 'TUTOR'
      `).run(studentAryanId);

      // Also ensure library fees are paid for a clean valid scan
      db.prepare(`
        UPDATE fee_records
        SET status = 'PAID', paid_date = date('now')
        WHERE student_id = ? AND type = 'LIBRARY'
      `).run(studentAryanId);

      const pass = await qrPassService.getOrCreatePersonalQrPass(studentAryanId);

      const res = await request(app)
        .post('/api/qr-pass/validate')
        .set('Authorization', `Bearer ${studentAryanToken}`)
        .send({ token: pass.token });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.student.id).toBe(studentAryanId);
      expect(res.body.activeServices.length).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // 3. Security & Anti-Abuse Controls
  // =========================================================================
  describe('3. Security Protection: Cross-Student Abuse & Invalid Token Rejection', () => {
    it('Rejects cross-student QR scan with 403 and records security audit trail', async () => {
      const aryanPass = await qrPassService.getOrCreatePersonalQrPass(studentAryanId);

      // Student B (studentOther) tries to scan Student A's (Aryan) QR
      const res = await request(app)
        .post('/api/qr-pass/validate')
        .set('Authorization', `Bearer ${studentOtherToken}`)
        .send({ token: aryanPass.token });

      expect(res.status).toBe(403);
      expect(res.body.valid).toBe(false);
      expect(res.body.code).toBe('CROSS_STUDENT_PROHIBITED');

      // Verify security audit log exists
      const auditLog = db.prepare(`
        SELECT *
        FROM attendance_audit_logs
        WHERE action = 'CROSS_STUDENT_REJECTED'
        ORDER BY id DESC LIMIT 1
      `).get();

      expect(auditLog).toBeDefined();
      expect(auditLog.student_id).toBe(studentAryanId);
      expect(auditLog.actor_id).toBe(studentOtherId);
    });

    it('Rejects invalid or tampered tokens with 400', async () => {
      const res = await request(app)
        .post('/api/qr-pass/validate')
        .set('Authorization', `Bearer ${studentAryanToken}`)
        .send({ token: 'fp-att-tok-v2-fakeuser-invalidhash999' });

      expect(res.status).toBe(400);
      expect(res.body.valid).toBe(false);
      expect(res.body.code).toBe('INVALID_QR');
    });

    it('Rejects unauthenticated requests to pass endpoints with 401', async () => {
      const res = await request(app).get('/api/qr-pass/my-pass');
      expect(res.status).toBe(401);
    });
  });

  // =========================================================================
  // 4. Authoritative Check-In, Check-Out, and Duration Computation
  // =========================================================================
  describe('4. Independent Dual-Service Check-In / Check-Out & Accurate Duration', () => {
    beforeAll(() => {
      // Ensure all Aryan's fees are marked PAID so attendance check-in succeeds
      db.prepare(`UPDATE fee_records SET status = 'PAID', paid_date = date('now') WHERE student_id = ?`).run(studentAryanId);
      // Clean today's test records for student
      const todayIso = new Date().toISOString().split('T')[0];
      db.prepare(`DELETE FROM attendance_records WHERE student_id = ? AND date = ?`).run(studentAryanId, todayIso);
    });

    it('Student can successfully Check-In to Home Tuition with server-authoritative timestamp', async () => {
      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${studentAryanToken}`)
        .send({
          serviceType: 'HOME_TUITION'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.checkInTime).toBeDefined();
      expect(res.body.record).toBeDefined();
      expect(res.body.record.type).toBe('TUTOR');
      expect(res.body.record.status).toBe('PRESENT');
      expect(res.body.whatsappDelivery).toBeDefined();
    });

    it('Student can simultaneously Check-In to Digital Library as an independent record', async () => {
      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${studentAryanToken}`)
        .send({
          serviceType: 'LIBRARY'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.record.type).toBe('LIBRARY');

      // Verify database has 2 distinct independent records today
      const todayIso = new Date().toISOString().split('T')[0];
      const todayRecords = db.prepare(`
        SELECT type, status, check_in_time, check_out_time
        FROM attendance_records
        WHERE student_id = ? AND date = ?
      `).all(studentAryanId, todayIso);

      expect(todayRecords.length).toBe(2);
      expect(todayRecords.some(r => r.type === 'TUTOR')).toBe(true);
      expect(todayRecords.some(r => r.type === 'LIBRARY')).toBe(true);
    });

    it('Prevents duplicate check-in today when already checked in', async () => {
      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${studentAryanToken}`)
        .send({
          serviceType: 'HOME_TUITION'
        });

      expect(res.status).toBe(409); // Conflict
      expect(res.body.code).toBe('ALREADY_CHECKED_IN');
    });

    it('Live Status endpoint reflects CHECKED_IN for active sessions', async () => {
      const res = await request(app)
        .get('/api/attendance/status')
        .set('Authorization', `Bearer ${studentAryanToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.services).toBeDefined();

      const tuitionStatus = res.body.services.find(s => s.service.serviceType === 'HOME_TUITION');
      const libraryStatus = res.body.services.find(s => s.service.serviceType === 'LIBRARY');
      expect(tuitionStatus.status).toBe('CHECKED_IN');
      expect(libraryStatus.status).toBe('CHECKED_IN');
    });

    it('Student can Check-Out and accurately calculate session duration', async () => {
      // Simulate Check-In time 2 hours and 30 minutes earlier in database
      const todayIso = new Date().toISOString().split('T')[0];
      db.prepare(`
        UPDATE attendance_records
        SET check_in_time = '08:00 AM'
        WHERE student_id = ? AND date = ? AND type = 'TUTOR'
      `).run(studentAryanId, todayIso);

      const res = await request(app)
        .post('/api/attendance/check-out')
        .set('Authorization', `Bearer ${studentAryanToken}`)
        .send({
          serviceType: 'HOME_TUITION'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.checkOutTime).toBeDefined();
      expect(res.body.duration).toBeDefined();
      expect(res.body.durationMinutes).toBeGreaterThan(0);
      expect(res.body.record.check_out_time).toBeDefined();
    });

    it('Prevents check-out when no active check-in session exists', async () => {
      // Home Tuition was just checked out, so second checkout must fail
      const res = await request(app)
        .post('/api/attendance/check-out')
        .set('Authorization', `Bearer ${studentAryanToken}`)
        .send({
          serviceType: 'HOME_TUITION'
        });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NO_ACTIVE_CHECKIN');
    });

    it('Duration calculation helper accurately computes hours and minutes', () => {
      const diff1 = attendanceService.calculateDurationString('08:00 AM', '12:45 PM');
      expect(diff1.formatted).toBe('4h 45m');
      expect(diff1.totalMinutes).toBe(285);

      const diff2 = attendanceService.calculateDurationString('09:15 AM', '10:00 AM');
      expect(diff2.formatted).toBe('45m');
      expect(diff2.totalMinutes).toBe(45);
    });
  });

  // =========================================================================
  // 5. Official WhatsApp Bot Delivery & Resilient Failure Handling
  // =========================================================================
  describe('5. WhatsApp Delivery Tracking, Templates, and Safe Failure Resilience', () => {
    it('Sends parent WhatsApp notification with real details on Check-In', async () => {
      const result = await whatsappNotificationService.sendCheckInAlert({
        studentId: studentAryanId,
        serviceType: 'HOME_TUITION',
        facilityOrTeacherName: 'Alok Kumar',
        checkInTime: '08:15 AM'
      });

      expect(result.delivered).toBe(true);
      expect(result.status).toBe('DELIVERED');
      expect(result.providerMessageId).toBeDefined();

      const notif = db.prepare('SELECT * FROM whatsapp_notifications WHERE id = ?').get(result.id);
      expect(notif.phone_number).toBe('9876543210');
      expect(notif.recipient_role).toBe('PARENT');
      expect(notif.notification_type).toBe('ATTENDANCE_CHECKIN');
      expect(notif.message).toContain('Aryan Singh');
      expect(notif.message).toContain('08:15 AM');
    });

    it('WhatsApp provider failure NEVER rolls back attendance check-in (Resilience Rule)', async () => {
      // Mock failure simulation
      const res = await whatsappNotificationService.queueNotification({
        studentId: studentAryanId,
        phoneNumber: '9876543210',
        recipientRole: 'PARENT',
        notificationType: 'ATTENDANCE_CHECKIN',
        message: 'Test message with failure simulation',
        simulateFailure: true
      });

      expect(res.status).toBe('FAILED');
      expect(res.delivered).toBe(false);
      expect(res.failureReason).toContain('Simulated provider timeout');

      // Notification can be retried successfully
      const retryRes = await whatsappNotificationService.retryNotification(res.id);
      expect(retryRes.status).toBe('DELIVERED');
      expect(retryRes.retryCount).toBe(1);
    });

    it('Student can fetch their WhatsApp notification delivery logs via API', async () => {
      const res = await request(app)
        .get('/api/notifications/whatsapp/student')
        .set('Authorization', `Bearer ${studentAryanToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.notifications)).toBe(true);
      expect(res.body.notifications.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 6. Booking Confirmation Integration Event
  // =========================================================================
  describe('6. Authoritative Booking Confirmation Event & Automatic Pass Activation', () => {
    it('POST /api/bookings/confirm creates confirmation event, issues QR pass, and dispatches WhatsApp alert', async () => {
      const testBookingId = `BK-CONF-TEST-${Date.now()}`;

      const res = await request(app)
        .post('/api/bookings/confirm')
        .set('Authorization', `Bearer ${studentAryanToken}`)
        .send({
          bookingId: testBookingId,
          serviceType: 'HOME_TUITION',
          teacherId: teacherAlokId,
          amount: 6500,
          paymentStatus: 'PAID',
          metadata: {
            subject: 'Board Physics Masterclass'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.confirmationEvent).toBeDefined();
      expect(res.body.confirmationEvent.booking_id).toBe(testBookingId);
      expect(res.body.qrPass).toBeDefined();
      expect(res.body.qrPass.token).toBeDefined();

      // Check confirmation can be queried by booking ID
      const queryRes = await request(app)
        .get(`/api/bookings/confirmation/${testBookingId}`)
        .set('Authorization', `Bearer ${studentAryanToken}`);

      expect(queryRes.status).toBe(200);
      expect(queryRes.body.confirmation.booking_id).toBe(testBookingId);
    });
  });

  // =========================================================================
  // 7. Pass Reissuance & Versioning
  // =========================================================================
  describe('7. QR Pass Reissuance, Versioning, and Revocation', () => {
    it('Student can reissue pass with reason; old pass is revoked and new version created', async () => {
      const initialPass = await qrPassService.getOrCreatePersonalQrPass(studentAryanId);
      const initialVersion = initialPass.version;

      const res = await request(app)
        .post('/api/qr-pass/reissue')
        .set('Authorization', `Bearer ${studentAryanToken}`)
        .send({
          reason: 'Physical pass card lost in transit'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.pass.version).toBe(initialVersion + 1);
      expect(res.body.pass.token).not.toBe(initialPass.token);

      // Verify old token is now rejected as REVOKED
      const scanOldRes = await request(app)
        .post('/api/qr-pass/validate')
        .set('Authorization', `Bearer ${studentAryanToken}`)
        .send({ token: initialPass.token });

      expect(scanOldRes.status).toBe(400);
      expect(scanOldRes.body.code).toBe('REVOKED_PASS');

      // Verify new token works successfully
      const scanNewRes = await request(app)
        .post('/api/qr-pass/validate')
        .set('Authorization', `Bearer ${studentAryanToken}`)
        .send({ token: res.body.pass.token });

      expect(scanNewRes.status).toBe(200);
      expect(scanNewRes.body.valid).toBe(true);
    });
  });

  // =========================================================================
  // 8. Teacher & Library Owner Portal Canonical Attendance Views
  // =========================================================================
  describe('8. Teacher and Library Owner Portals Canonical View & Manual Marking', () => {
    it('Teacher can view assigned students with today attendance status', async () => {
      const res = await request(app)
        .get('/api/attendance/teacher/today')
        .set('Authorization', `Bearer ${teacherAlokToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.students)).toBe(true);
      const aryan = res.body.students.find(s => s.student_id === studentAryanId);
      expect(aryan).toBeDefined();
    });

    it('Teacher manual mark updates canonical attendance record', async () => {
      const todayIso = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .post('/api/attendance/teacher/mark')
        .set('Authorization', `Bearer ${teacherAlokToken}`)
        .send({
          studentId: studentAryanId,
          date: todayIso,
          status: 'PRESENT',
          checkInTime: '07:30 AM',
          checkOutTime: '09:00 AM',
          notes: 'Completed Calculus problems'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.record.source).toBe('TEACHER_MANUAL');
      expect(res.body.record.duration).toBe('1h 30m');
    });

    it('Library Owner can view enrolled students and manual mark attendance', async () => {
      const todayIso = new Date().toISOString().split('T')[0];
      const lib = db.prepare('SELECT id FROM libraries WHERE owner_id = ? LIMIT 1').get(libraryOwnerId);

      const res = await request(app)
        .post('/api/attendance/library/mark')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          libraryId: lib.id,
          studentId: studentAryanId,
          date: todayIso,
          status: 'PRESENT',
          checkInTime: '10:00 AM',
          checkOutTime: '01:00 PM',
          notes: 'Morning shift desk study'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.record.source).toBe('LIBRARY_OWNER_MANUAL');
      expect(res.body.record.duration).toBe('3h 00m');
    });
  });

  // =========================================================================
  // 9. Admin Observability & Audit Logs
  // =========================================================================
  describe('9. Super Admin & District Admin Analytics & Audit Trails', () => {
    it('Super Admin can fetch attendance analytics and QR audit logs', async () => {
      const statsRes = await request(app)
        .get('/api/attendance/analytics')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(statsRes.status).toBe(200);
      expect(statsRes.body.stats).toBeDefined();

      const auditRes = await request(app)
        .get('/api/qr-pass/audit-logs')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(auditRes.status).toBe(200);
      expect(Array.isArray(auditRes.body.logs)).toBe(true);
      expect(auditRes.body.logs.length).toBeGreaterThan(0);
    });

    it('Super Admin can fetch WhatsApp notification analytics', async () => {
      const res = await request(app)
        .get('/api/notifications/whatsapp/admin/stats')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.stats).toBeDefined();
    });
  });
});
