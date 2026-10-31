import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db/database';
import runSeed from '../src/scripts/seed';

describe('FOCUSPOINT Phase 2: User Profiles & Role-Based Dashboards Test Suite', () => {
  let superAdminToken;
  let districtAdminToken;
  let teacherToken;
  let pendingTeacherToken;
  let studentToken;
  let libraryOwnerToken;

  let ghazipurDistrictId;
  let varanasiDistrictId;
  let studentUserId;
  let teacherUserId;
  let pendingTeacherUserId;
  let libraryOwnerUserId;
  let districtAdminUserId;

  beforeAll(async () => {
    // 1. Clean test tables
    db.pragma('foreign_keys = OFF');
    db.prepare("DELETE FROM users WHERE email != 'superadmin@focuspoint.internal'").run();
    db.prepare("DELETE FROM district_admins").run();
    db.prepare("DELETE FROM libraries").run();
    db.prepare("DELETE FROM library_seats").run();
    db.prepare("DELETE FROM library_shifts").run();
    db.prepare("DELETE FROM library_enrollments").run();
    db.prepare("DELETE FROM teacher_student_assignments").run();
    db.prepare("DELETE FROM teacher_schedules").run();
    db.prepare("DELETE FROM attendance_records").run();
    db.prepare("DELETE FROM fee_records").run();
    db.prepare("DELETE FROM booking_requests").run();
    db.prepare("DELETE FROM notifications").run();
    db.prepare("DELETE FROM support_tickets").run();
    db.pragma('foreign_keys = ON');

    // 2. Run seed with demo data enabled
    runSeed({ seedDemo: true });

    const gzp = db.prepare('SELECT id FROM districts WHERE code = ?').get('GZP');
    const vns = db.prepare('SELECT id FROM districts WHERE code = ?').get('VNS');
    ghazipurDistrictId = gzp ? gzp.id : 1;
    varanasiDistrictId = vns ? vns.id : 3;

    // 3. Obtain Super Admin token
    const saLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'superadmin@focuspoint.internal', password: 'SuperAdmin@FocusPoint2026!' });
    superAdminToken = saLogin.body.token;

    // 4. Obtain District Admin token
    const daLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'admin.ghazipur@focuspoint.internal', password: 'Password@123' });
    districtAdminToken = daLogin.body.token;
    districtAdminUserId = daLogin.body.user.id;

    // 5. Obtain Active Teacher token
    const teacherLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'alok.teacher@focuspoint.internal', password: 'Password@123' });
    teacherToken = teacherLogin.body.token;
    teacherUserId = teacherLogin.body.user.id;

    // 6. Obtain Pending Teacher token
    const ptLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'rohan.pending@focuspoint.internal', password: 'Password@123' });
    pendingTeacherToken = ptLogin.body.token;
    pendingTeacherUserId = ptLogin.body.user.id;

    // 7. Obtain Active Student token
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'student.aryan@focuspoint.internal', password: 'Password@123' });
    studentToken = studentLogin.body.token;
    studentUserId = studentLogin.body.user.id;

    // 8. Obtain Library Owner token
    const libLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'owner.library@focuspoint.internal', password: 'Password@123' });
    libraryOwnerToken = libLogin.body.token;
    libraryOwnerUserId = libLogin.body.user.id;
  });

  // ==========================================
  // 1. STUDENT DASHBOARD & PROFILE
  // ==========================================
  describe('Student Dashboard & Profile APIs', () => {
    it('1.1 Should return 401 when accessed without token', async () => {
      const res = await request(app).get('/api/student/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('1.2 Should fetch student dashboard overview with accurate counts & metrics', async () => {
      const res = await request(app)
        .get('/api/student/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.overview.teachersCount).toBeGreaterThanOrEqual(1);
      expect(res.body.overview.hasLibrary).toBe(true);
      expect(res.body.overview.attendancePercentage).toBeDefined();
      expect(res.body.overview.pendingFeesCount).toBeGreaterThanOrEqual(1);
    });

    it('1.3 Should fetch student profile', async () => {
      const res = await request(app)
        .get('/api/student/profile')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.profile.full_name).toBe('Aryan Singh');
      expect(res.body.profile.school_college).toBe('St. John Senior Secondary School, Ghazipur');
    });

    it('1.4 Should allow student to update their editable profile information', async () => {
      const res = await request(app)
        .put('/api/student/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          full_name: 'Aryan Singh Chauhan',
          school_college: 'St. John High School, Ghazipur',
          grade_class: 'Class 12 CBSE',
          target_goals: 'Targeting 98% in CBSE and AIR < 5000 in JEE'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify in DB
      const updated = db.prepare('SELECT full_name, target_goals FROM student_profiles WHERE user_id = ?').get(studentUserId);
      expect(updated.full_name).toBe('Aryan Singh Chauhan');
      expect(updated.target_goals).toContain('98% in CBSE');
    });

    it('1.5 Should fetch student assigned teachers and schedule', async () => {
      const res = await request(app)
        .get('/api/student/teachers')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.teachers)).toBe(true);
      expect(res.body.teachers.length).toBeGreaterThanOrEqual(1);
      expect(res.body.teachers[0].teacher_name).toBe('Dr. Alok Nath Mishra');
    });

    it('1.6 Should fetch student attendance records', async () => {
      const res = await request(app)
        .get('/api/student/attendance')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.records)).toBe(true);
      expect(res.body.stats.total).toBeGreaterThanOrEqual(4);
    });

    it('1.7 Should fetch student fees ledger', async () => {
      const res = await request(app)
        .get('/api/student/fees')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.fees)).toBe(true);
      expect(res.body.summary.total_paid).toBeGreaterThanOrEqual(7500);
    });

    it('1.8 Should fetch student library details', async () => {
      const res = await request(app)
        .get('/api/student/library')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.enrollment.library_name).toContain('Central Reading Hall');
    });

    it('1.9 Should submit a new support ticket', async () => {
      const res = await request(app)
        .post('/api/student/support')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          subject: 'Need extra practice material for Physics Wave Optics',
          message: 'Can Dr. Alok Nath provide previous 5 years solved papers?'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 2. TEACHER DASHBOARD & PROFILE
  // ==========================================
  describe('Teacher Dashboard & Profile APIs', () => {
    it('2.1 Should fetch teacher dashboard overview with real-time stats', async () => {
      const res = await request(app)
        .get('/api/teacher/dashboard')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.overview.totalStudents).toBeGreaterThanOrEqual(1);
      expect(res.body.overview.activeStudents).toBeGreaterThanOrEqual(1);
      expect(res.body.overview.monthlyRevenue).toBe(7500);
      expect(res.body.overview.approvalStatus).toBe('ACTIVE');
    });

    it('2.2 Should fetch teacher profile', async () => {
      const res = await request(app)
        .get('/api/teacher/profile')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.profile.full_name).toBe('Dr. Alok Nath Mishra');
      expect(res.body.profile.qualification).toContain('Ph.D.');
    });

    it('2.3 Should allow teacher to update allowed profile fields', async () => {
      const res = await request(app)
        .put('/api/teacher/profile')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          expected_fee: 8000,
          bio: 'Senior Physics educator specializing in CBSE 12th Boards and JEE Advanced numerical problem solving.',
          availability: '4:30 PM - 8:30 PM (Mon-Sat)'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = db.prepare('SELECT expected_fee, bio FROM teacher_profiles WHERE user_id = ?').get(teacherUserId);
      expect(check.expected_fee).toBe(8000);
      expect(check.bio).toContain('Senior Physics educator');
    });

    it('2.4 Should list teacher assigned students with contact details', async () => {
      const res = await request(app)
        .get('/api/teacher/students')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.students.length).toBeGreaterThanOrEqual(1);
      expect(res.body.students[0].student_name).toContain('Aryan Singh');
    });

    it('2.5 Should allow teacher to mark student attendance', async () => {
      const res = await request(app)
        .post('/api/teacher/attendance')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          student_id: studentUserId,
          date: '2026-09-02',
          status: 'PRESENT',
          notes: 'Completed Modern Physics Photoelectric Effect test'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('2.6 Should reject attendance marking for a student not assigned to this teacher', async () => {
      const fakeStudentId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .post('/api/teacher/attendance')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          student_id: fakeStudentId,
          date: '2026-09-02',
          status: 'PRESENT'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('2.7 Should allow teacher to add and delete a schedule time slot', async () => {
      // Add slot
      const addRes = await request(app)
        .post('/api/teacher/schedule')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          day_of_week: 'Tuesday',
          start_time: '17:00',
          end_time: '18:30',
          title: 'Class 12 Physics Numerical Workshop',
          teaching_mode: 'OFFLINE',
          student_name: 'Aryan Singh'
        });

      expect(addRes.status).toBe(201);
      expect(addRes.body.success).toBe(true);

      // Verify list
      const listRes = await request(app)
        .get('/api/teacher/schedule')
        .set('Authorization', `Bearer ${teacherToken}`);
      expect(listRes.status).toBe(200);
      const insertedSlot = listRes.body.schedule.find(s => s.day_of_week === 'Tuesday');
      expect(insertedSlot).toBeDefined();

      // Delete slot
      const delRes = await request(app)
        .delete(`/api/teacher/schedule/${insertedSlot.id}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      expect(delRes.status).toBe(200);
    });

    it('2.8 Should check verification status for active and pending teachers', async () => {
      const activeRes = await request(app)
        .get('/api/teacher/verification-status')
        .set('Authorization', `Bearer ${teacherToken}`);
      expect(activeRes.status).toBe(200);
      expect(activeRes.body.verification.accountStatus).toBe('ACTIVE');
      expect(activeRes.body.verification.isPubliclyVisible).toBe(true);

      const pendingRes = await request(app)
        .get('/api/teacher/verification-status')
        .set('Authorization', `Bearer ${pendingTeacherToken}`);
      expect(pendingRes.status).toBe(200);
      expect(pendingRes.body.verification.accountStatus).toBe('PENDING_APPROVAL');
      expect(pendingRes.body.verification.isPubliclyVisible).toBe(false);
    });
  });

  // ==========================================
  // 3. LIBRARY OWNER DASHBOARD
  // ==========================================
  describe('Library Owner Dashboard APIs', () => {
    it('3.1 Should fetch library dashboard overview', async () => {
      const res = await request(app)
        .get('/api/library/dashboard')
        .set('Authorization', `Bearer ${libraryOwnerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.overview.totalSeats).toBe(40);
      expect(res.body.overview.activeMembers).toBeGreaterThanOrEqual(1);
      expect(res.body.overview.shiftsCount).toBeGreaterThanOrEqual(3);
    });

    it('3.2 Should fetch visual seat matrix', async () => {
      const res = await request(app)
        .get('/api/library/seats')
        .set('Authorization', `Bearer ${libraryOwnerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.seats.length).toBe(40);
      expect(res.body.seats[0].seat_number).toBe('S-01');
    });

    it('3.3 Should fetch and add shifts', async () => {
      const res = await request(app)
        .get('/api/library/shifts')
        .set('Authorization', `Bearer ${libraryOwnerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.shifts.length).toBeGreaterThanOrEqual(3);

      const addRes = await request(app)
        .post('/api/library/shifts')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          name: 'Weekend Intensive Shift',
          start_time: '08:00',
          end_time: '20:00',
          fee: 800
        });

      expect(addRes.status).toBe(201);
      expect(addRes.body.success).toBe(true);
    });

    it('3.4 Should fetch library revenue and shift breakdown', async () => {
      const res = await request(app)
        .get('/api/library/revenue')
        .set('Authorization', `Bearer ${libraryOwnerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.revenue.monthlyTotal).toBeGreaterThanOrEqual(700);
    });

    it('3.5 Should allow library owner to register a walk-in student (offline ledger)', async () => {
      // Find an available seat
      const seat = db.prepare("SELECT id FROM library_seats WHERE status = 'AVAILABLE' LIMIT 1").get();
      const shift = db.prepare("SELECT id FROM library_shifts LIMIT 1").get();

      const res = await request(app)
        .post('/api/library/students/walk-in')
        .set('Authorization', `Bearer ${libraryOwnerToken}`)
        .send({
          full_name: 'Walk-In Student Test',
          mobile: '9888877771',
          email: 'walkin.test@focuspoint.internal',
          seat_id: seat ? seat.id : undefined,
          shift_id: shift ? shift.id : undefined,
          monthly_fee: 750,
          start_date: '2026-09-01',
          end_date: '2026-10-01',
          payment_status: 'PAID',
          notes: 'Test Walk-in'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.enrollmentId).toBeDefined();

      // Verify seat status updated
      if (seat) {
        const updatedSeat = db.prepare('SELECT status FROM library_seats WHERE id = ?').get(seat.id);
        expect(updatedSeat.status).toBe('OCCUPIED');
      }

      // Verify member appears in library students list
      const studentsRes = await request(app)
        .get('/api/library/students')
        .set('Authorization', `Bearer ${libraryOwnerToken}`);

      expect(studentsRes.status).toBe(200);
      const walkin = studentsRes.body.students.find(s => s.student_mobile === '9888877771');
      expect(walkin).toBeDefined();
      expect(walkin.student_name).toBe('Walk-In Student Test');
      expect(walkin.monthly_fee).toBe(750);
    });
  });

  // ==========================================
  // 4. DISTRICT ADMIN (SCOPING & APPROVALS)
  // ==========================================
  describe('District Admin Dashboard & Scoping Enforcement', () => {
    it('4.1 Should fetch district dashboard scoped strictly to Ghazipur', async () => {
      const res = await request(app)
        .get('/api/district-admin/dashboard')
        .set('Authorization', `Bearer ${districtAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.district.name).toBe('Ghazipur');
      expect(res.body.overview.studentsCount).toBeGreaterThanOrEqual(1);
      expect(res.body.overview.teachersCount).toBeGreaterThanOrEqual(1);
      expect(res.body.overview.pendingTeachersCount).toBeGreaterThanOrEqual(1);
      expect(res.body.overview.librariesCount).toBeGreaterThanOrEqual(1);
    });

    it('4.2 Should list pending teachers in the district', async () => {
      const res = await request(app)
        .get('/api/district-admin/pending-teachers')
        .set('Authorization', `Bearer ${districtAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.pendingTeachers.length).toBeGreaterThanOrEqual(1);
      const pt = res.body.pendingTeachers.find(t => t.id === pendingTeacherUserId);
      expect(pt).toBeDefined();
      expect(pt.full_name).toBe('Rohan Sharma');
    });

    it('4.3 Should allow District Admin to approve pending teacher and make public', async () => {
      const res = await request(app)
        .post(`/api/district-admin/teachers/${pendingTeacherUserId}/action`)
        .set('Authorization', `Bearer ${districtAdminToken}`)
        .send({
          action: 'APPROVE',
          admin_notes: 'Verified M.Com degree and UGC-NET credentials in person at district office.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify in DB that status is now ACTIVE and is_publicly_visible = 1
      const userDb = db.prepare('SELECT account_status FROM users WHERE id = ?').get(pendingTeacherUserId);
      const profDb = db.prepare('SELECT is_publicly_visible, admin_notes FROM teacher_profiles WHERE user_id = ?').get(pendingTeacherUserId);
      expect(userDb.account_status).toBe('ACTIVE');
      expect(profDb.is_publicly_visible).toBe(1);
      expect(profDb.admin_notes).toContain('Verified M.Com degree');
    });

    it('4.4 Security: Should NOT allow District Admin to action teacher outside their district', async () => {
      // Create a dummy teacher in Varanasi
      const varanasiTeacherId = 'varanasi-teacher-id-test-01';
      const teacherRole = db.prepare('SELECT id FROM roles WHERE name = ?').get('TEACHER');
      db.prepare(`
        INSERT INTO users (id, email, mobile, password_hash, role_id, district_id, account_status)
        VALUES (?, 'vns.teacher@test.com', '9876599999', 'hash', ?, ?, 'PENDING_APPROVAL')
      `).run(varanasiTeacherId, teacherRole.id, varanasiDistrictId);

      const res = await request(app)
        .post(`/api/district-admin/teachers/${varanasiTeacherId}/action`)
        .set('Authorization', `Bearer ${districtAdminToken}`) // Ghazipur Admin
        .send({ action: 'APPROVE' });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Teacher not found in your district');
    });
  });

  // ==========================================
  // 5. SUPER ADMIN GLOBAL DASHBOARD
  // ==========================================
  describe('Super Admin Global Dashboard APIs', () => {
    it('5.1 Should fetch global platform overview with cross-district breakdown', async () => {
      const res = await request(app)
        .get('/api/super-admin/dashboard')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.globalOverview.districtsCount).toBeGreaterThanOrEqual(6);
      expect(res.body.globalOverview.studentsCount).toBeGreaterThanOrEqual(1);
      expect(res.body.globalOverview.teachersTotal).toBeGreaterThanOrEqual(2);
      expect(res.body.globalOverview.librariesTotal).toBeGreaterThanOrEqual(1);
      expect(res.body.globalOverview.totalPlatformRevenue).toBeGreaterThanOrEqual(8200);
      expect(Array.isArray(res.body.globalOverview.districtBreakdown)).toBe(true);
    });

    it('5.2 Should list all districts with admin assignment statuses', async () => {
      const res = await request(app)
        .get('/api/super-admin/districts')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.districts.length).toBeGreaterThanOrEqual(6);
    });

    it('5.3 Should list all platform teachers globally', async () => {
      const res = await request(app)
        .get('/api/super-admin/teachers')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.teachers.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ==========================================
  // 6. ROLE-BASED ACCESS CONTROL (RBAC) SECURITY
  // ==========================================
  describe('Strict Role-Based Access Control (RBAC)', () => {
    it('6.1 Student CANNOT access Teacher dashboard', async () => {
      const res = await request(app)
        .get('/api/teacher/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('6.2 Student CANNOT access District Admin dashboard', async () => {
      const res = await request(app)
        .get('/api/district-admin/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('6.3 Teacher CANNOT access Super Admin dashboard', async () => {
      const res = await request(app)
        .get('/api/super-admin/dashboard')
        .set('Authorization', `Bearer ${teacherToken}`);
      expect(res.status).toBe(403);
    });

    it('6.4 District Admin CANNOT access Super Admin dashboard', async () => {
      const res = await request(app)
        .get('/api/super-admin/dashboard')
        .set('Authorization', `Bearer ${districtAdminToken}`);
      expect(res.status).toBe(403);
    });
  });
});
