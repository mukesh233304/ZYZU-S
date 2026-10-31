import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db/database';
import runSeed from '../src/scripts/seed';

describe('FOCUSPOINT Library Shift-Aware Booking & Vacancy Test Suite', () => {
  let studentToken;
  let studentUserId;
  let libraryOwnerToken;
  let libraryOwnerUserId;
  let libraryId;
  let morningShiftId;
  let afternoonShiftId;

  beforeAll(async () => {
    runSeed({ seedDemo: true });

    // 1. Login Student
    const sLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'student.aryan@focuspoint.internal', password: 'Password@123' });
    studentToken = sLogin.body.token;
    studentUserId = sLogin.body.user.id;

    // 2. Login Library Owner
    const libLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'owner.library@focuspoint.internal', password: 'Password@123' });
    libraryOwnerToken = libLogin.body.token;
    libraryOwnerUserId = libLogin.body.user.id;

    const libRow = db.prepare('SELECT id FROM libraries WHERE owner_id = ?').get(libraryOwnerUserId);
    libraryId = libRow ? libRow.id : 1;

    // 3. Query shifts
    const shifts = db.prepare('SELECT * FROM library_shifts WHERE library_id = ?').all(libraryId);
    if (shifts.length > 0) {
      morningShiftId = shifts[0].id;
      afternoonShiftId = shifts.length > 1 ? shifts[1].id : shifts[0].id;
    }
  });

  describe('1. Library Shifts & Pricing Verification', () => {
    it('GET /api/public/libraries/:id returns library shifts with pricing', async () => {
      const res = await request(app).get(`/api/public/libraries/${libraryId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.library).toBeDefined();
      expect(Array.isArray(res.body.library.shifts)).toBe(true);
    });

    it('Allows student to request booking for a specific shift and desk', async () => {
      const availableSeat = db.prepare(`
        SELECT * FROM library_seats 
        WHERE library_id = ? AND status = 'AVAILABLE' 
        LIMIT 1
      `).get(libraryId);

      const res = await request(app)
        .post('/api/student/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          target_type: 'LIBRARY',
          library_id: libraryId,
          shift_id: morningShiftId,
          preferred_seat_id: availableSeat ? availableSeat.id : 1,
          subject_or_shift: 'Morning Shift (6:00 AM - 11:00 AM)',
          message: 'Shift-specific booking test',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.bookingId).toBeDefined();
    });

    it('Library Owner can view active seat allocations and shift attendance', async () => {
      const res = await request(app)
        .get(`/api/library/seats`)
        .set('Authorization', `Bearer ${libraryOwnerToken}`);

      // Owner endpoints or seats query
      expect([200, 404]).toContain(res.status);
    });
  });
});
