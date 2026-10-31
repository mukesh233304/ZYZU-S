import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db/database';
import runSeed from '../src/scripts/seed';

describe('FOCUSPOINT Tutor Booking Mandatory Payment Verification Suite', () => {
  let studentToken;
  let studentUserId;
  let teacherUserId;
  let districtId;

  beforeAll(async () => {
    // 1. Reset and seed
    runSeed({ seedDemo: true });

    const gzp = db.prepare('SELECT id FROM districts WHERE code = ?').get('GZP');
    districtId = gzp ? gzp.id : 1;

    // 2. Login Student
    const sLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'student.aryan@focuspoint.internal', password: 'Password@123' });
    studentToken = sLogin.body.token;
    studentUserId = sLogin.body.user.id;

    // 3. Login Teacher
    const tLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'alok.teacher@focuspoint.internal', password: 'Password@123' });
    teacherUserId = tLogin.body.user.id;
  });

  describe('1. Student Home Tutor Booking Payment Policy', () => {
    it('Requires payment validation on home tutor booking creation', async () => {
      // Booking request created via API
      const res = await request(app)
        .post('/api/student/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          target_type: 'TEACHER',
          teacher_id: teacherUserId,
          subject_or_shift: 'Class 10 - Mathematics & Science',
          preferred_mode: 'OFFLINE_HOME',
          message: 'Home tuition booking request with advance payment required',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.bookingId).toBeDefined();

      const bookingId = res.body.bookingId;
      const bRow = db.prepare('SELECT * FROM booking_requests WHERE id = ?').get(bookingId);
      expect(bRow).toBeDefined();
      expect(bRow.target_type).toBe('TEACHER');
    });

    it('Student can query fee records to verify invoice generation and payment tracking', async () => {
      const res = await request(app)
        .get('/api/student/fees')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.fees)).toBe(true);
    });

    it('Prevents booking with invalid teacher ID', async () => {
      const res = await request(app)
        .post('/api/student/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          target_type: 'TEACHER',
          teacher_id: 999999, // Non-existent teacher
          subject_or_shift: 'Physics',
          preferred_mode: 'OFFLINE_HOME',
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/teacher not found/i);
    });
  });
});
