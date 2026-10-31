import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db/database';
import { generateToken } from '../src/utils/token';
import runSeed from '../src/scripts/seed';

describe('FOCUSPOINT Mock Test Generation Operator Control & Request Workflow', () => {
  let studentToken;
  let superAdminToken;
  let studentId = 'usr-test-student-operator-control';
  let superAdminId;
  let testExamId = 'exam-ssc-cgl';

  beforeAll(() => {
    // Seed initial database
    runSeed({ seedDemo: true });

    // Ensure test student exists
    db.prepare(`
      INSERT OR IGNORE INTO users (id, email, mobile, password_hash, role_id, account_status)
      VALUES (?, 'student.strict@focuspoint.internal', '9888877771', 'hashed_pass', 1, 'ACTIVE')
    `).run(studentId);

    // Get Super Admin user
    const admin = db.prepare("SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'SUPER_ADMIN'").get();
    superAdminId = admin ? admin.id : 'usr-superadmin-001';

    // Ensure a test exam exists
    db.prepare(`
      INSERT OR IGNORE INTO government_exams (id, title, category, total_marks, duration_minutes, is_active)
      VALUES (?, 'SSC Combined Graduate Level', 'STAFF_SELECTION_COMMISSION', 200, 60, 1)
    `).run(testExamId);

    // Generate tokens
    studentToken = generateToken({ userId: studentId, role: 'STUDENT', email: 'student.strict@focuspoint.internal' });
    superAdminToken = generateToken({ userId: superAdminId, role: 'SUPER_ADMIN', email: 'superadmin@focuspoint.internal' });
  });

  describe('1. Strict Generation Prohibition for Students (Prompt Section #1, #2, #3, #24)', () => {
    it('Should strictly REJECT Student call to POST /api/mock-tests/generate with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/mock-tests/generate')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          examId: testExamId,
          title: 'Student Attempted Rogue Mock Test',
          totalQuestions: 25,
          durationMinutes: 30
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('STUDENT_MOCK_GENERATION_PROHIBITED');
      expect(res.body.message).toContain('Students are not authorized');
    });

    it('Should strictly REJECT Student call to alias POST /mock-tests/generate with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/mock-tests/generate')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          examId: testExamId,
          title: 'Student Attempted Rogue Mock Test via Alias',
          totalQuestions: 25
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('STUDENT_MOCK_GENERATION_PROHIBITED');
    });

    it('Should strictly REJECT Student call to POST /api/mock-tests/custom-mock/generate with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/mock-tests/custom-mock/generate')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          examId: testExamId,
          title: 'Student Custom Mock Generation Attempt'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('STUDENT_MOCK_GENERATION_PROHIBITED');
    });

    it('Should reject unauthenticated calls to POST /api/mock-tests/generate with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/mock-tests/generate')
        .send({
          examId: testExamId,
          title: 'Anonymous Generation Attempt'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Student Custom Mock Drill Request Submission (Prompt Section #4, #5, #6, #8, #9)', () => {
    let createdRequestId;

    it('Should allow Student to submit a Custom Mock Drill Request with preferences', async () => {
      const res = await request(app)
        .post('/api/mock-tests/custom-requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          examId: testExamId,
          examName: 'SSC CGL 2026',
          subject: 'Quantitative Aptitude',
          chapter: 'Algebra & Quadratic Equations',
          topic: 'Quadratic Roots & Factoring',
          difficulty: 'HARD',
          questionCount: 30,
          durationMinutes: 45,
          language: 'Hindi',
          testType: 'Weak Topic Practice',
          notes: 'Focus on polynomial roots and previous year pattern questions.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toMatch(/^FP-MDR-/);
      expect(res.body.data.status).toBe('REQUESTED');
      expect(res.body.data.student_id).toBe(studentId);
      expect(res.body.data.subject).toBe('Quantitative Aptitude');
      expect(res.body.data.question_count).toBe(30);

      createdRequestId = res.body.data.id;
    });

    it('Should allow Student to list their own submitted requests', async () => {
      const res = await request(app)
        .get('/api/mock-tests/custom-requests')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some(r => r.id === createdRequestId)).toBe(true);
    });

    it('Should allow retrieving a single custom request by ID', async () => {
      const res = await request(app)
        .get(`/api/mock-tests/custom-requests/${createdRequestId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdRequestId);
      expect(res.body.data.status).toBe('REQUESTED');
    });

    it('Should reject request submission with missing required fields', async () => {
      const res = await request(app)
        .post('/api/mock-tests/custom-requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          notes: 'Incomplete payload without examId and subject'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Operator / Super Admin Request Management & Generation (Prompt Section #12, #13, #14)', () => {
    let targetRequestId;

    beforeAll(async () => {
      // Create a fresh request to manipulate
      const res = await request(app)
        .post('/api/mock-tests/custom-requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          examId: testExamId,
          examName: 'SSC CGL 2026',
          subject: 'Reasoning',
          topic: 'Coding-Decoding',
          difficulty: 'MODERATE',
          questionCount: 25,
          durationMinutes: 30,
          language: 'Bilingual',
          testType: 'Chapter Drill'
        });
      targetRequestId = res.body.data.id;
    });

    it('Should allow Super Admin / Operator to view all custom drill requests', async () => {
      const res = await request(app)
        .get('/api/mock-tests/custom-requests')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('Should allow Super Admin / Operator to update request status and add operator notes', async () => {
      const res = await request(app)
        .patch(`/api/mock-tests/custom-requests/${targetRequestId}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          status: 'IN_PREPARATION',
          operatorMessage: 'FocusPoint academic team has verified the blueprint. Questions are being authored.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('IN_PREPARATION');
      expect(res.body.data.operator_message).toContain('verified the blueprint');
    });

    it('Should reject Student attempting to update status of a request with 403 Forbidden', async () => {
      const res = await request(app)
        .patch(`/api/mock-tests/custom-requests/${targetRequestId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          status: 'PUBLISHED'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('STUDENT_MOCK_GENERATION_PROHIBITED');
    });

    it('Should allow Super Admin / Operator to generate draft mock test', async () => {
      const res = await request(app)
        .post('/api/mock-tests/generate')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          examId: testExamId,
          title: 'SSC CGL Verified Custom Drill 01',
          totalQuestions: 25,
          durationMinutes: 30,
          testType: 'SECTIONAL'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toBe('SSC CGL Verified Custom Drill 01');
      expect(res.body.data.is_published).toBe(0); // Unpublished draft
    });
  });
});
