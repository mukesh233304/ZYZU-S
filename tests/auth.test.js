import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db/database';
import runSeed from '../src/scripts/seed';

describe('FOCUSPOINT Phase 1: Production Authentication & Registration Test Suite', () => {
  let districtId;
  let testStudentToken;
  let testTeacherToken;
  let testSuperAdminToken;
  let testDistrictAdminToken;

  beforeAll(() => {
    // Clean up test data for idempotent test execution
    db.prepare("DELETE FROM users WHERE email != 'superadmin@focuspoint.internal'").run();
    db.prepare("DELETE FROM district_admins").run();
    db.prepare("DELETE FROM otps").run();
    
    // Seed database before tests
    runSeed({ seedDemo: false });
    const district = db.prepare('SELECT id FROM districts WHERE code = ?').get('GZP');
    districtId = district.id;
  });

  // TEST 1: Student Registration
  it('1. Should successfully register a new Student and assign ACTIVE status', async () => {
    const res = await request(app)
      .post('/api/auth/register/student')
      .send({
        full_name: 'Rahul Sharma',
        mobile: '9876543210',
        email: 'rahul.student@test.com',
        password: 'Password@123',
        confirm_password: 'Password@123',
        dob: '2005-04-12',
        gender: 'Male',
        district_id: districtId || 1,
        city_area: 'Saidpur Market',
        address: 'Ward No 4, Near Gandhi Chowk',
        pincode: '233304'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('STUDENT');
    expect(res.body.user.accountStatus).toBe('ACTIVE');
    expect(res.body.token).toBeDefined();
    expect(res.body.redirectUrl).toBe('/dashboard/student');
    testStudentToken = res.body.token;

    // Verify in database
    const userInDb = db.prepare('SELECT account_status FROM users WHERE email = ?').get('rahul.student@test.com');
    expect(userInDb.account_status).toBe('ACTIVE');
  });

  // TEST 2: Teacher Registration
  it('2. Should successfully register a Teacher with PENDING_APPROVAL status and is_publicly_visible = 0', async () => {
    const res = await request(app)
      .post('/api/auth/register/teacher')
      .field('full_name', 'Priya Verma')
      .field('mobile', '9876543211')
      .field('email', 'priya.teacher@test.com')
      .field('password', 'Teacher@2026!')
      .field('confirm_password', 'Teacher@2026!')
      .field('gender', 'Female')
      .field('dob', '1995-08-20')
      .field('qualification', 'M.Sc. Mathematics, B.Ed')
      .field('experience', '5')
      .field('subjects', JSON.stringify(['Mathematics', 'Science']))
      .field('classes', JSON.stringify(['Class 9', 'Class 10']))
      .field('specialization', 'Calculus & Board Prep')
      .field('teaching_mode', 'BOTH')
      .field('district_id', districtId)
      .field('areas_served', 'Saidpur, Sadar, Khanpur')
      .field('expected_fee', '8000')
      .field('availability', 'Evenings & Weekends')
      .field('address', 'House 12, Station Road');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('TEACHER');
    expect(res.body.user.accountStatus).toBe('PENDING_APPROVAL');
    expect(res.body.user.isPubliclyVisible).toBe(false);
    expect(res.body.redirectUrl).toBe('/dashboard/teacher');
    testTeacherToken = res.body.token;

    // Verify in database
    const teacherProfile = db.prepare(`
      SELECT tp.is_publicly_visible, u.account_status
      FROM users u
      JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE u.email = ?
    `).get('priya.teacher@test.com');

    expect(teacherProfile.account_status).toBe('PENDING_APPROVAL');
    expect(teacherProfile.is_publicly_visible).toBe(0);
  });

  // TEST 3: Library Owner Registration
  it('3. Should register a Library Owner with PENDING_APPROVAL status', async () => {
    const res = await request(app)
      .post('/api/auth/register/library-owner')
      .send({
        owner_name: 'Anand Prakash',
        mobile: '9876543212',
        email: 'anand.library@test.com',
        password: 'Library@Owner2026',
        confirm_password: 'Library@Owner2026',
        district_id: districtId,
        address: 'Opposite Main College Gate, Saidpur'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('LIBRARY_OWNER');
    expect(res.body.user.accountStatus).toBe('PENDING_APPROVAL');
    expect(res.body.redirectUrl).toBe('/dashboard/library-owner');
  });

  // TEST 4: Duplicate Email Validation
  it('4. Should reject registration with an existing email address', async () => {
    const res = await request(app)
      .post('/api/auth/register/student')
      .send({
        full_name: 'Duplicate Email User',
        mobile: '9876543299',
        email: 'rahul.student@test.com', // already registered in test 1
        password: 'Password@123',
        confirm_password: 'Password@123',
        dob: '2004-01-01',
        gender: 'Male',
        district_id: districtId,
        city_area: 'Varanasi Cantt',
        address: 'Road 5',
        pincode: '221002'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.field).toBe('email');
  });

  // TEST 5: Duplicate Mobile Validation
  it('5. Should reject registration with an existing mobile number', async () => {
    const res = await request(app)
      .post('/api/auth/register/student')
      .send({
        full_name: 'Duplicate Mobile User',
        mobile: '9876543210', // already used in test 1
        email: 'unique.email@test.com',
        password: 'Password@123',
        confirm_password: 'Password@123',
        dob: '2004-01-01',
        gender: 'Male',
        district_id: districtId,
        city_area: 'Ghazipur City',
        address: 'Road 7',
        pincode: '233001'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.field).toBe('mobile');
  });

  // TEST 6: Invalid Password Strength Validation
  it('6. Should reject password that is too short or missing complexity', async () => {
    const res = await request(app)
      .post('/api/auth/register/student')
      .send({
        full_name: 'Weak Password User',
        mobile: '9876543219',
        email: 'weak.password@test.com',
        password: 'pass', // too short, no upper/number
        confirm_password: 'pass',
        dob: '2004-01-01',
        gender: 'Male',
        district_id: districtId,
        city_area: 'Ghazipur',
        address: 'Road 1',
        pincode: '233001'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.password).toBeDefined();
  });

  // TEST 7: Password Mismatch Validation
  it('7. Should reject when password and confirm_password do not match', async () => {
    const res = await request(app)
      .post('/api/auth/register/student')
      .send({
        full_name: 'Mismatch User',
        mobile: '9876543218',
        email: 'mismatch@test.com',
        password: 'Password@123',
        confirm_password: 'DifferentPassword@123',
        dob: '2004-01-01',
        gender: 'Male',
        district_id: districtId,
        city_area: 'Ghazipur',
        address: 'Road 2',
        pincode: '233001'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.confirm_password).toBe('Passwords do not match');
  });

  // TEST 8: Unified Login (Email + Mobile)
  it('8. Should allow login with email OR with 10-digit mobile number', async () => {
    // 8a: Login using Email
    const emailRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'rahul.student@test.com',
        password: 'Password@123'
      });

    expect(emailRes.status).toBe(200);
    expect(emailRes.body.success).toBe(true);
    expect(emailRes.body.token).toBeDefined();
    expect(emailRes.body.user.email).toBe('rahul.student@test.com');
    expect(emailRes.body.redirectUrl).toBe('/dashboard/student');

    // 8b: Login using Mobile number
    const mobileRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: '9876543210',
        password: 'Password@123'
      });

    expect(mobileRes.status).toBe(200);
    expect(mobileRes.body.success).toBe(true);
    expect(mobileRes.body.token).toBeDefined();
    expect(mobileRes.body.user.mobile).toBe('9876543210');
  });

  // TEST 9: Invalid Login Credentials
  it('9. Should reject login with invalid credentials securely', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'rahul.student@test.com',
        password: 'WrongPassword999!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid credentials');
  });

  // TEST 10: Suspended Account Login Rejection
  it('10. Should block login for a SUSPENDED user', async () => {
    // Suspend the student user in DB
    db.prepare("UPDATE users SET account_status = 'SUSPENDED' WHERE email = ?").run('rahul.student@test.com');

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'rahul.student@test.com',
        password: 'Password@123'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('ACCOUNT_SUSPENDED');

    // Reset back to ACTIVE
    db.prepare("UPDATE users SET account_status = 'ACTIVE' WHERE email = ?").run('rahul.student@test.com');
  });

  // TEST 11: Pending Teacher Login & Application Status
  it('11. Should allow pending teacher to log in but flag as pending with restricted status', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'priya.teacher@test.com',
        password: 'Teacher@2026!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.accountStatus).toBe('PENDING_APPROVAL');
    expect(res.body.user.isPending).toBe(true);
    expect(res.body.redirectUrl).toBe('/dashboard/teacher');
  });

  // TEST 12: Role-based Redirects
  it('12. Should provide correct role-based dashboard redirects for each user type', async () => {
    // Student redirect
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'rahul.student@test.com', password: 'Password@123' });
    expect(studentRes.body.redirectUrl).toBe('/dashboard/student');

    // Super Admin redirect
    const superAdminRes = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'superadmin@focuspoint.internal', password: 'SuperAdmin@FocusPoint2026!' });
    expect(superAdminRes.body.redirectUrl).toBe('/dashboard/super-admin');
  });

  // TEST 13: Unauthorized Dashboard Access & Middleware Blocking
  it('13. Should reject unauthorized access to protected admin routes', async () => {
    // Student attempting to access Super Admin route
    const res = await request(app)
      .get('/api/admin/district-admins')
      .set('Authorization', `Bearer ${testStudentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Forbidden: Access restricted');

    // Unauthenticated request (no token)
    const unauthRes = await request(app)
      .get('/api/admin/district-admins');

    expect(unauthRes.status).toBe(401);
    expect(unauthRes.body.success).toBe(false);
  });

  // TEST 14: District Admin Authentication & Strict Business Rule (One Active per District)
  it('14. Super Admin creates District Admin and enforces single active admin constraint', async () => {
    // 14a: Super Admin logs in
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'superadmin@focuspoint.internal',
        password: 'SuperAdmin@FocusPoint2026!'
      });
    testSuperAdminToken = loginRes.body.token;

    // 14b: Super Admin creates first District Admin for Ghazipur
    const createRes = await request(app)
      .post('/api/admin/district-admins')
      .set('Authorization', `Bearer ${testSuperAdminToken}`)
      .send({
        full_name: 'Virendra Singh',
        email: 'virendra.admin@gzp.focuspoint.internal',
        mobile: '9876500001',
        password: 'Admin@Ghazipur2026',
        district_id: districtId
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.districtAdmin.status).toBe('ACTIVE');

    // 14c: Attempt to create a SECOND active District Admin for the same district -> MUST FAIL
    const duplicateDistrictAdminRes = await request(app)
      .post('/api/admin/district-admins')
      .set('Authorization', `Bearer ${testSuperAdminToken}`)
      .send({
        full_name: 'Second Admin Candidate',
        email: 'second.admin@gzp.focuspoint.internal',
        mobile: '9876500002',
        password: 'Admin@Ghazipur2026',
        district_id: districtId
      });

    expect(duplicateDistrictAdminRes.status).toBe(409);
    expect(duplicateDistrictAdminRes.body.code).toBe('DISTRICT_ADMIN_EXISTS');

    // 14d: District Admin can log in successfully
    const daLogin = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'virendra.admin@gzp.focuspoint.internal',
        password: 'Admin@Ghazipur2026'
      });

    expect(daLogin.status).toBe(200);
    expect(daLogin.body.user.role).toBe('DISTRICT_ADMIN');
    expect(daLogin.body.redirectUrl).toBe('/dashboard/district-admin');
    testDistrictAdminToken = daLogin.body.token;
  });

  // TEST 15: Super Admin Authentication & Privilege Verification
  it('15. Super Admin can review pending approvals and approve teacher account', async () => {
    // Fetch pending list
    const pendingRes = await request(app)
      .get('/api/admin/pending-approvals')
      .set('Authorization', `Bearer ${testSuperAdminToken}`);

    expect(pendingRes.status).toBe(200);
    expect(pendingRes.body.success).toBe(true);
    expect(pendingRes.body.pendingApprovals.length).toBeGreaterThan(0);

    const pendingTeacher = pendingRes.body.pendingApprovals.find(u => u.email === 'priya.teacher@test.com');
    expect(pendingTeacher).toBeDefined();

    // Approve the teacher
    const approveRes = await request(app)
      .post(`/api/admin/users/${pendingTeacher.user_id}/approve`)
      .set('Authorization', `Bearer ${testSuperAdminToken}`);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.success).toBe(true);

    // Verify teacher is now ACTIVE and publicly visible (is_publicly_visible = 1)
    const updatedTeacher = db.prepare(`
      SELECT u.account_status, tp.is_publicly_visible
      FROM users u
      JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE u.id = ?
    `).get(pendingTeacher.user_id);

    expect(updatedTeacher.account_status).toBe('ACTIVE');
    expect(updatedTeacher.is_publicly_visible).toBe(1);
  });
});
