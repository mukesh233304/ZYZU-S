import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db/database';
import academicPerformanceService from '../src/services/academicPerformanceService';
import mockTestAttemptService from '../src/services/mockTestAttemptService';
import academicSubscriptionService from '../src/services/academicSubscriptionService';
import pyqIngestionService from '../src/services/pyqIngestionService';
import seedAcademicData from '../src/scripts/academicSeed';
import runSeed from '../src/scripts/seed';

describe('FOCUSPOINT Academic Backend Integration Suite', () => {
  const testStudentId = 'usr-test-student-aryan';
  const testTeacherId = 'usr-teacher-rajesh';

  beforeAll(() => {
    // Seed core users and academic catalog
    runSeed({ seedDemo: true });
    seedAcademicData();

    // Ensure student and teacher records exist in users table
    db.prepare(`
      INSERT OR IGNORE INTO users (id, email, mobile, password_hash, role_id, account_status)
      VALUES (?, 'aryan.test@focuspoint.internal', '9988776655', 'hashed_pw', 1, 'ACTIVE')
    `).run(testStudentId);

    db.prepare(`
      INSERT OR IGNORE INTO users (id, email, mobile, password_hash, role_id, account_status)
      VALUES (?, 'rajesh.teacher@focuspoint.internal', '9988776644', 'hashed_pw', 2, 'ACTIVE')
    `).run(testTeacherId);
  });

  beforeEach(() => {
    // Clean student test records and attempts for testStudentId
    db.prepare('DELETE FROM mock_test_answers WHERE attempt_id IN (SELECT id FROM mock_test_attempts WHERE student_id = ?)').run(testStudentId);
    db.prepare('DELETE FROM mock_test_attempts WHERE student_id = ?').run(testStudentId);
    db.prepare('DELETE FROM student_test_records WHERE student_id = ?').run(testStudentId);
    db.prepare('DELETE FROM student_mistake_book WHERE student_id = ?').run(testStudentId);
    db.prepare('DELETE FROM academic_subscriptions WHERE student_id = ?').run(testStudentId);
  });

  describe('1. Zero Fake Data & Empty State Integrity', () => {
    it('Should strictly return zero performance metrics and empty state for a new student', () => {
      const metrics = academicPerformanceService.getStudentPerformance(testStudentId);

      expect(metrics.studentId).toBe(testStudentId);
      expect(metrics.totalTests).toBe(0);
      expect(metrics.totalQuestionsAttempted).toBe(0);
      expect(metrics.averagePercentage).toBe(0);
      expect(metrics.overallAccuracy).toBe(0);
      expect(metrics.hasSufficientData).toBe(false);
      expect(metrics.strongestSubject).toBeNull();
      expect(metrics.subjectNeedingAttention).toBeNull();
      expect(metrics.subjectSummaries.length).toBe(0);
      expect(metrics.recentTests.length).toBe(0);
      expect(metrics.message).toContain('No performance data yet');
    });

    it('Should require minimum test threshold before classifying a subject', () => {
      // Record 1 test in Mathematics with Super Admin override
      academicPerformanceService.recordTeacherTestResult(
        {
          studentId: testStudentId,
          subject: 'Mathematics',
          topic: 'Calculus',
          testName: 'Differential Calculus Sprint',
          testDate: '2026-09-21',
          totalMarks: 50,
          marksObtained: 45
        },
        testTeacherId,
        true // Super Admin override
      );

      const metrics = academicPerformanceService.getStudentPerformance(testStudentId);
      expect(metrics.totalTests).toBe(1);
      expect(metrics.averagePercentage).toBe(90);

      // Single test must have classification = INSUFFICIENT_DATA
      const mathSummary = metrics.subjectSummaries.find(s => s.subject === 'Mathematics');
      expect(mathSummary).toBeDefined();
      expect(mathSummary.classification).toBe('INSUFFICIENT_DATA');
      expect(mathSummary.hasSufficientData).toBe(false);
      expect(metrics.hasSufficientData).toBe(false);
    });

    it('Should classify subject once minimum test threshold (>=2) is reached', () => {
      // Test 1
      academicPerformanceService.recordTeacherTestResult(
        {
          studentId: testStudentId,
          subject: 'Mathematics',
          topic: 'Calculus',
          testName: 'Calculus Test 1',
          testDate: '2026-09-20',
          totalMarks: 50,
          marksObtained: 46
        },
        testTeacherId,
        true
      );

      // Test 2
      academicPerformanceService.recordTeacherTestResult(
        {
          studentId: testStudentId,
          subject: 'Mathematics',
          topic: 'Algebra',
          testName: 'Algebra Test 2',
          testDate: '2026-09-22',
          totalMarks: 50,
          marksObtained: 44
        },
        testTeacherId,
        true
      );

      const metrics = academicPerformanceService.getStudentPerformance(testStudentId);
      expect(metrics.totalTests).toBe(2);
      expect(metrics.averagePercentage).toBe(90);

      const mathSummary = metrics.subjectSummaries.find(s => s.subject === 'Mathematics');
      expect(mathSummary).toBeDefined();
      expect(mathSummary.classification).toBe('EXCELLENT');
      expect(mathSummary.hasSufficientData).toBe(true);
      expect(metrics.hasSufficientData).toBe(true);
      expect(metrics.strongestSubject).toBe('Mathematics');
    });
  });

  describe('2. Teacher Allotment Security & Authorization', () => {
    it('Should reject test record entry if teacher is not allotted to student', () => {
      // Teacher attempts to enter test result for unallotted student without superadmin flag
      expect(() => {
        academicPerformanceService.recordTeacherTestResult(
          {
            studentId: testStudentId,
            subject: 'Physics',
            testName: 'Physics Mechanics Quiz',
            testDate: '2026-09-22',
            totalMarks: 50,
            marksObtained: 30
          },
          'usr-teacher-unallotted-99',
          false
        );
      }).toThrow(/Access Denied/);
    });
  });

  describe('3. Government Exam Mock Test Lifecycle & Negative Marking', () => {
    it('Should start a mock test attempt with sanitized questions hiding correct answers', () => {
      const attemptSession = mockTestAttemptService.startAttempt(testStudentId, 'mock-ssc-cgl-01');

      expect(attemptSession.attemptId).toBeDefined();
      expect(attemptSession.mockTest.title).toBe('SSC CGL All-India Full Mock Test #1');
      expect(attemptSession.questions.length).toBeGreaterThan(0);

      // Ensure answers and explanations are not leaked
      const firstQuestion = attemptSession.questions[0];
      expect(firstQuestion.options.length).toBeGreaterThan(0);
      expect(firstQuestion.correctOptionIds).toBeUndefined();
      expect(firstQuestion.explanation).toBeUndefined();
    });

    it('Should save answers, evaluate test with negative marking, and sync errors to Mistake Book', () => {
      const session = mockTestAttemptService.startAttempt(testStudentId, 'mock-ssc-cgl-01');
      const attemptId = session.attemptId;

      // Question 1 (qb-ssc-001): Correct answer is ['opt_1']
      mockTestAttemptService.saveAnswer(attemptId, testStudentId, 'qb-ssc-001', ['opt_1'], 45, 0);

      // Question 2 (qb-ssc-002): Correct answer is ['opt_2']. Let's intentionally submit WRONG answer ['opt_3']
      mockTestAttemptService.saveAnswer(attemptId, testStudentId, 'qb-ssc-002', ['opt_3'], 60, 0);

      // Question 3 & 4: Left unanswered

      // Submit attempt
      const result = mockTestAttemptService.submitAttempt(attemptId, testStudentId, 105);

      expect(result.attempt.status).toBe('EVALUATED');
      expect(result.attempt.attempted).toBe(2);
      expect(result.attempt.correct).toBe(1);
      expect(result.attempt.incorrect).toBe(1);
      expect(result.attempt.unanswered).toBe(2);

      // Marking calculation:
      // Correct qb-ssc-001: +2.0
      // Incorrect qb-ssc-002: -0.5
      // Net score: 2.0 - 0.5 = 1.5
      expect(result.attempt.score).toBe(1.5);
      expect(result.attempt.accuracy).toBe(50); // 1 correct out of 2 attempted

      // Verify that incorrect question (qb-ssc-002) is automatically in Mistake Book
      const mistakes = academicPerformanceService.getMistakeBook(testStudentId);
      expect(mistakes.length).toBe(1);
      expect(mistakes[0].question_id).toBe('qb-ssc-002');
      expect(mistakes[0].status).toBe('NEEDS_REVISION');
    });

    it('Should allow student to update mistake book status to MASTERED with personal notes', () => {
      const session = mockTestAttemptService.startAttempt(testStudentId, 'mock-ssc-cgl-01');
      mockTestAttemptService.saveAnswer(session.attemptId, testStudentId, 'qb-ssc-002', ['opt_1'], 30, 0);
      mockTestAttemptService.submitAttempt(session.attemptId, testStudentId, 30);

      const mistakes = academicPerformanceService.getMistakeBook(testStudentId);
      expect(mistakes.length).toBe(1);

      const mistakeId = mistakes[0].id;
      academicPerformanceService.updateMistakeBookStatus(
        mistakeId,
        testStudentId,
        'MASTERED',
        'Understood profit formula: difference in profit percentage equals absolute difference in SP.'
      );

      const updated = academicPerformanceService.getMistakeBook(testStudentId, 'MASTERED');
      expect(updated.length).toBe(1);
      expect(updated[0].personal_notes).toContain('Understood profit formula');
    });
  });

  describe('4. 6-Tier Priority Pricing Engine & Coupon Validation', () => {
    it('Should resolve Pan-India default price when no specific overrides apply', () => {
      const pricing = academicSubscriptionService.resolvePrice('prod-ssc-cgl-pass');
      expect(pricing.basePrice).toBe(499);
      expect(pricing.appliedScope).toBe('PAN_INDIA');
      expect(pricing.subtotal).toBe(499);
      // 18% GST on 499 = 89.82, Total = 588.82
      expect(pricing.taxAmount).toBe(89.82);
      expect(pricing.finalPrice).toBe(588.82);
    });

    it('Should prioritize District override over State override and Pan-India base', () => {
      // State = Uttar Pradesh (price: 399), District = Ghazipur (price: 299)
      const pricing = academicSubscriptionService.resolvePrice('prod-ssc-cgl-pass', null, 'Ghazipur', 'Uttar Pradesh');
      expect(pricing.appliedScope).toBe('DISTRICT');
      expect(pricing.subtotal).toBe(299);
    });

    it('Should prioritize Student override above all other tiers (Priority 6)', () => {
      const pricing = academicSubscriptionService.resolvePrice(
        'prod-ssc-cgl-pass',
        'usr-student-aryan', // Student override price = 149
        'Ghazipur',
        'Uttar Pradesh',
        'lib-saidpur-01',
        'usr-teacher-rajesh'
      );
      expect(pricing.appliedScope).toBe('STUDENT');
      expect(pricing.subtotal).toBe(149);
    });

    it('Should validate and apply stackable coupon FOCUS50 with 50% discount capped at 500', () => {
      const pricing = academicSubscriptionService.resolvePrice('prod-jee-pass', null, null, null, null, null, 'FOCUS50');
      expect(pricing.basePrice).toBe(899);
      expect(pricing.couponValid).toBe(true);
      // 50% of 899 is 450 (under 500 cap)
      expect(pricing.couponDiscount).toBe(450);
      expect(pricing.subtotal - pricing.couponDiscount).toBe(449);
    });

    it('Should provision an active subscription and evaluate non-destructive entitlements', () => {
      const purchaseResult = academicSubscriptionService.purchaseSubscription(testStudentId, {
        productId: 'prod-ssc-cgl-pass',
        productTitle: 'SSC CGL Comprehensive Exam Pass',
        productType: 'EXAM_PASS',
        couponCode: 'MOCK100'
      });

      expect(purchaseResult.success).toBe(true);
      expect(purchaseResult.status).toBe('ACTIVE');

      const subs = academicSubscriptionService.getStudentSubscriptions(testStudentId);
      expect(subs.length).toBe(1);
      expect(subs[0].product_id).toBe('prod-ssc-cgl-pass');
      expect(subs[0].status).toBe('ACTIVE');

      // Entitlement check
      const entitlement = academicSubscriptionService.checkEntitlement(testStudentId, 'MOCK_TESTS');
      expect(entitlement.allowed).toBe(true);

      // Non-destructive historical access check
      const historyCheck = academicSubscriptionService.checkEntitlement(testStudentId, 'VIEW_HISTORY');
      expect(historyCheck.allowed).toBe(true);
    });
  });

  describe('5. PYQ Archival & 1-Click CBT Synthesis', () => {
    it('Should digitize official previous year question paper with sectional blueprint', () => {
      const pyqData = {
        examId: 'exam-ssc-cgl',
        examName: 'SSC CGL Tier 1',
        examCategory: 'SSC',
        examYear: 2024,
        tierOrStage: 'Tier-1',
        examDate: '2024-09-15',
        shift: 'Shift 3',
        shiftTiming: '04:00 PM - 05:00 PM',
        paperCode: 'Code 4C-2024',
        language: 'Bilingual (Hindi + English)',
        sections: [
          { name: 'Quantitative Aptitude', questionCount: 25, marks: 50, negativeMarks: 0.5 },
          { name: 'General Intelligence', questionCount: 25, marks: 50, negativeMarks: 0.5 }
        ],
        masterPaperPdfUrl: '/uploads/pyq/ssc_cgl_2024_t1_s3.pdf',
        officialAnswerKeyUrl: '/uploads/pyq/ssc_cgl_2024_t1_s3_key.pdf',
        isCbtAvailable: true
      };

      const result = pyqIngestionService.digitizePaper(pyqData, 'usr-operator-01');
      expect(result.success).toBe(true);
      expect(result.pyqId).toBeDefined();
      expect(result.linkedCbtMockTestId).toBeDefined();

      // Verify that linked CBT mock test exists in mock_tests table
      const synthesizedTest = db.prepare('SELECT * FROM mock_tests WHERE id = ?').get(result.linkedCbtMockTestId);
      expect(synthesizedTest).toBeDefined();
      expect(synthesizedTest.total_questions).toBe(50);
      expect(synthesizedTest.total_marks).toBe(100);
      expect(synthesizedTest.is_published).toBe(1);
    });
  });

  describe('6. Express HTTP API Endpoints Validation', () => {
    it('GET /api/mock-tests/exams should return government and school entrance exams', async () => {
      const res = await request(app).get('/api/mock-tests/exams');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.some(e => e.id === 'exam-ssc-cgl')).toBe(true);
    });

    it('GET /api/mock-tests/list should return published mock tests', async () => {
      const res = await request(app).get('/api/mock-tests/list');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('POST /api/academic-subscriptions/resolve-price should return 6-tier pricing resolution', async () => {
      const res = await request(app)
        .post('/api/academic-subscriptions/resolve-price')
        .send({
          productId: 'prod-ssc-cgl-pass',
          couponCode: 'FOCUS50'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.basePrice).toBe(499);
      expect(res.body.data.couponDiscount).toBe(250);
      expect(res.body.data.finalPrice).toBeGreaterThan(0);
    });

    it('GET /api/pyq/papers should return official digitized past year papers', async () => {
      const res = await request(app).get('/api/pyq/papers');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].sections.length).toBeGreaterThan(0);
    });
  });
});
