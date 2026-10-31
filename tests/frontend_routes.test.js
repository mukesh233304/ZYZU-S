import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db/database';
import runSeed from '../src/scripts/seed';

describe('FOCUSPOINT Frontend & Auth Routes Integration Suite', () => {
  let studentToken;
  let studentUser;
  let districtId;

  beforeAll(() => {
    // Seed test database
    runSeed({ seedDemo: true });
    const district = db.prepare('SELECT id FROM districts WHERE code = ?').get('GZP');
    districtId = district ? district.id : 1;
  });

  describe('1. Public Marketing & Information Pages', () => {
    const publicPages = [
      { path: '/', title: 'FOCUSPOINT' },
      { path: '/about', title: 'About' },
      { path: '/tutors', title: 'Tutors' },
      { path: '/explore/tutors', title: 'Tutors' },
      { path: '/libraries', title: 'Libraries' },
      { path: '/explore/libraries', title: 'Libraries' },
      { path: '/become-teacher', title: 'Teacher' },
      { path: '/list-library', title: 'Library' },
      { path: '/how-it-works', title: 'How It Works' },
      { path: '/pricing', title: 'Pricing' },
      { path: '/faq', title: 'FAQ' },
      { path: '/contact', title: 'Contact' }
    ];

    publicPages.forEach(({ path, title }) => {
      it(`Should serve ${path} as valid HTML containing "${title}"`, async () => {
        const res = await request(app).get(path);
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/text\/html/);
        expect(res.text).toMatch(new RegExp(title === 'FOCUSPOINT' ? "(FOCUSPOINT|ZYZU'S)" : title));
      });
    });
  });

  describe('2. Authentication & Onboarding Pages', () => {
    const authPages = [
      { path: '/login', title: 'FOCUSPOINT' },
      { path: '/register/student', title: 'Student' },
      { path: '/register/teacher', title: 'Teacher' },
      { path: '/register/library-owner', title: 'Library Owner' },
      { path: '/forgot-password', title: 'Reset Password' },
      { path: '/reset-password', title: 'Set New Password' },
      { path: '/verify-otp', title: 'Verification Code' }
    ];

    authPages.forEach(({ path, title }) => {
      it(`Should serve ${path} with status 200`, async () => {
        const res = await request(app).get(path);
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/text\/html/);
        expect(res.text).toMatch(new RegExp(title === 'FOCUSPOINT' ? "(FOCUSPOINT|ZYZU'S)" : title));
      });
    });
  });

  describe('3. Role Dashboard HTML Pages', () => {
    const dashboards = [
      { path: '/dashboard/student', title: 'Student Portal' },
      { path: '/dashboard/teacher', title: 'Teacher Portal' },
      { path: '/dashboard/library-owner', title: 'Library Owner Portal' },
      { path: '/dashboard/district-admin', title: 'District Admin Console' },
      { path: '/dashboard/super-admin', title: 'Super Admin Master Command' }
    ];

    dashboards.forEach(({ path, title }) => {
      it(`Should serve dashboard view at ${path}`, async () => {
        const res = await request(app).get(path);
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/text\/html/);
        expect(res.text).toContain(title);
      });
    });
  });

  describe('4. Static CSS and JS Client Assets', () => {
    it('Should serve auth.css', async () => {
      const res = await request(app).get('/css/auth.css');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/css/);
    });

    it('Should serve dashboard.css', async () => {
      const res = await request(app).get('/css/dashboard.css');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/css/);
    });

    it('Should serve auth-common.js', async () => {
      const res = await request(app).get('/js/auth-common.js');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/javascript/);
      expect(res.text).toContain('checkAuthSession');
    });

    it('Should serve dashboard-common.js', async () => {
      const res = await request(app).get('/js/dashboard-common.js');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/javascript/);
      expect(res.text).toContain('DashCommon');
    });
  });

  describe('5. Session Verification & Auth Me Endpoints', () => {
    it('Should authenticate via login, set cookie and return token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'student.aryan@focuspoint.internal',
          password: 'Password@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();

      studentToken = res.body.token;
      studentUser = res.body.user;
    });

    it('Should verify session via Bearer token on /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('student.aryan@focuspoint.internal');
      expect(res.body.user.role).toBe('STUDENT');
    });

    it('Should verify session via HTTP-only cookie on /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${studentToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('student.aryan@focuspoint.internal');
    });

    it('Should clear cookie upon /api/auth/logout', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=;/);
    });
  });

  describe('6. OTP Authentication & Password Recovery Integration', () => {
    it('Should generate OTP for login verification', async () => {
      const res = await request(app)
        .post('/api/auth/request-otp')
        .send({
          identifier: 'student.aryan@focuspoint.internal',
          purpose: 'LOGIN'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.devOtp).toBeDefined();

      // Verify the generated OTP
      const verifyRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          identifier: 'student.aryan@focuspoint.internal',
          otp_code: res.body.devOtp,
          purpose: 'LOGIN'
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.success).toBe(true);
      expect(verifyRes.body.token).toBeDefined();
      expect(verifyRes.body.user.email).toBe('student.aryan@focuspoint.internal');
    });

    it('Should handle forgot-password and reset-password flow', async () => {
      // 1. Forgot password
      const forgotRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ identifier: 'student.aryan@focuspoint.internal' });

      expect(forgotRes.status).toBe(200);
      expect(forgotRes.body.success).toBe(true);
      expect(forgotRes.body.devOtp).toBeDefined();

      // 2. Reset password using recovery code
      const resetRes = await request(app)
        .post('/api/auth/reset-password')
        .send({
          identifier: 'student.aryan@focuspoint.internal',
          reset_code: forgotRes.body.devOtp,
          new_password: 'NewSecurePassword@2026',
          confirm_password: 'NewSecurePassword@2026'
        });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.success).toBe(true);

      // 3. Login with newly set password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'student.aryan@focuspoint.internal',
          password: 'NewSecurePassword@2026'
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);

      // Reset back for test consistency
      const revertRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ identifier: 'student.aryan@focuspoint.internal' });

      await request(app)
        .post('/api/auth/reset-password')
        .send({
          identifier: 'student.aryan@focuspoint.internal',
          reset_code: revertRes.body.devOtp,
          new_password: 'Password@123',
          confirm_password: 'Password@123'
        });
    });
  });

  describe('7. Public Districts API', () => {
    it('Should fetch public list of operational districts', async () => {
      const res = await request(app).get('/api/public/districts');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.districts)).toBe(true);
      expect(res.body.districts.length).toBeGreaterThan(0);
      expect(res.body.districts[0]).toHaveProperty('name');
      expect(res.body.districts[0]).toHaveProperty('code');
    });
  });
});
