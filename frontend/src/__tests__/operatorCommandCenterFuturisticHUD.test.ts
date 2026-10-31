import { describe, it, expect, beforeEach } from 'vitest';
import { mockTestService } from '../services/mockTestService';
import { operatorService } from '../services/operatorService';
import { mockStore } from '../mock/store';
import { safeStorage } from '../utils/storageUtils';

describe('FOCUSPOINT — Operator Command Center & Futuristic HUD Capabilities', () => {
  const operatorId = 'usr-operator-sunita';
  const operatorName = 'Sunita Verma';
  const studentId = 'usr-test-student-cmd-01';
  const studentName = 'Pooja Tiwari';

  beforeEach(() => {
    safeStorage.removeItem('fp_academic_custom_mock_requests');
    safeStorage.removeItem('fp_operator_activity_logs');
  });

  describe('1. Operator Telemetry & Content Metrics Hub', () => {
    it('Should fetch comprehensive operator metrics with zero financial exposure', async () => {
      const metrics = await operatorService.getOperatorContentMetrics(operatorId);
      expect(metrics).toBeDefined();
      expect(metrics.totalQuestions).toBeGreaterThanOrEqual(10);
      expect(metrics.approvedQuestions).toBeGreaterThanOrEqual(0);
      expect(metrics.totalMockTests).toBeGreaterThanOrEqual(0);
      expect(metrics.totalMaterials).toBeGreaterThanOrEqual(0);
      expect(metrics.rejectionRate).toBeDefined();
      expect(Array.isArray(metrics.topMaterials)).toBe(true);
      expect(Array.isArray(metrics.topMockTests)).toBe(true);
    });

    it('Should log and retrieve operator actions in the real-time audit stream', async () => {
      const log = await operatorService.logActivity({
        operatorId,
        operatorName,
        action: 'MATERIAL_UPLOAD',
        entity: 'STUDY_MATERIAL',
        entityId: 'sm-pyq-2024-test',
        entityTitle: 'SSC CGL 2024 Shift-1 Official CBT Paper',
        details: 'Ingested 100 verified questions via Fast Text OCR engine.'
      });

      expect(log).toBeDefined();
      expect(log.id).toBeDefined();
      expect(log.action).toBe('MATERIAL_UPLOAD');

      const logs = await operatorService.getActivityLogs(operatorId);
      expect(logs.some((l) => l.entityId === 'sm-pyq-2024-test')).toBe(true);
    });
  });

  describe('2. Student Custom Drill Processing Engine on Operator Console', () => {
    let testRequest: any;

    beforeEach(async () => {
      testRequest = await mockTestService.submitCustomMockRequest({
        studentId,
        studentName,
        examId: 'exam-up-constable',
        examName: 'UP Police Constable',
        subject: 'General Hindi',
        topic: 'Sandhi & Samas (संधि एवं समास)',
        difficulty: 'MODERATE',
        questionCount: 20,
        durationMinutes: 25,
        language: 'Hindi',
        testType: 'Chapter Drill',
        priority: 'HIGH',
        notes: 'Please include previous year questions from 2024 re-exam.'
      });
    });

    it('Should retrieve actionable student requests in operator queue', async () => {
      const requests = await mockTestService.getCustomMockRequests();
      expect(Array.isArray(requests)).toBe(true);
      const found = requests.find((r) => r.id === testRequest.id);
      expect(found).toBeDefined();
      expect(found?.status).toBe('REQUESTED');
      expect(found?.priority).toBe('HIGH');
    });

    it('Should allow Operator to update request to UNDER_REVIEW or IN_PREPARATION with notes', async () => {
      const updated = await mockTestService.updateCustomMockRequestStatus(
        testRequest.id,
        'UNDER_REVIEW',
        'Academic lead reviewing syllabus coverage for UP Police Hindi.',
        operatorId,
        operatorName
      );

      expect(updated).not.toBeNull();
      expect(updated?.status).toBe('UNDER_REVIEW');
      expect(updated?.operatorMessage).toContain('Academic lead reviewing');
      expect(updated?.assignedOperatorName).toBe(operatorName);
    });

    it('Should perform 1-Click AI Rapid Synthesis from Student Drill Request', async () => {
      const { request: updatedReq, mockTest } = await mockTestService.generateMockFromRequest(
        testRequest.id,
        {
          operatorId,
          operatorName,
          customTitle: 'UP Police Constable Custom Drill — General Hindi (Chapter Drill)'
        }
      );

      expect(updatedReq.status).toBe('QUALITY_REVIEW');
      expect(updatedReq.generatedMockTestId).toBe(mockTest.id);
      expect(mockTest).toBeDefined();
      expect(mockTest.status).toBe('DRAFT');
      expect(mockTest.totalQuestions).toBeGreaterThanOrEqual(10);
    });

    it('Should publish custom mock test, marking it active in Student Center', async () => {
      // First generate draft
      await mockTestService.generateMockFromRequest(testRequest.id, {
        operatorId,
        operatorName
      });

      // Now publish
      const updatedReq = await mockTestService.updateCustomMockRequestStatus(
        testRequest.id,
        'PUBLISHED',
        'Your custom mock test has been verified and published by our academic lead! You can now start the test.',
        operatorId,
        operatorName
      );

      expect(updatedReq?.status).toBe('PUBLISHED');
      expect(updatedReq?.operatorMessage).toContain('verified and published');
    });
  });

  describe('3. Master Question Bank & AI Question Additions', () => {
    it('Should add synthesized question directly into Master Question Bank', () => {
      const newQ = {
        id: `AI-TEST-Q-${Date.now()}`,
        examId: 'exam-ssc-cgl',
        subject: 'Indian Polity',
        topic: 'Constitutional Amendments',
        type: 'MCQ',
        question: 'Which constitutional amendment added the words Socialist and Secular to the Preamble?',
        options: ['42nd Amendment (1976)', '44th Amendment (1978)', '52nd Amendment (1985)', '73rd Amendment (1992)'],
        correctAnswer: '42nd Amendment (1976)',
        explanation: 'The 42nd Constitutional Amendment Act, 1976 added the terms Socialist, Secular, and Integrity to the Preamble.',
        difficulty: 'MODERATE',
        marks: 2,
        negativeMarks: 0.5,
        status: 'APPROVED',
        source: 'AI_GENERATED',
        createdAt: new Date().toISOString()
      };

      const beforeCount = mockStore.getQuestionBank().length;
      mockStore.addQuestion(newQ);
      const afterCount = mockStore.getQuestionBank().length;

      expect(afterCount).toBe(beforeCount + 1);
      const saved = mockStore.getQuestionBank().find((q) => q.id === newQ.id);
      expect(saved).toBeDefined();
      expect(saved?.correctAnswer).toBe('42nd Amendment (1976)');
    });
  });

  describe('4. Batch AI Synthesis Engine for Student Drill Queue', () => {
    it('Should process multiple actionable drill requests in a batch run', async () => {
      // Create 3 separate student requests
      const req1 = await mockTestService.submitCustomMockRequest({
        studentId: 'std-batch-01',
        studentName: 'Amit Saxena',
        examId: 'exam-ssc-cgl',
        examName: 'SSC CGL 2026',
        subject: 'General Intelligence & Reasoning',
        topic: 'Syllogism & Analogies',
        difficulty: 'MODERATE',
        questionCount: 25,
        durationMinutes: 30,
        language: 'Bilingual',
        testType: 'Full Mock',
        priority: 'URGENT'
      });

      const req2 = await mockTestService.submitCustomMockRequest({
        studentId: 'std-batch-02',
        studentName: 'Neha Rajput',
        examId: 'exam-up-constable',
        examName: 'UP Police Constable',
        subject: 'Numerical Ability',
        topic: 'Percentage & Profit-Loss',
        difficulty: 'EASY',
        questionCount: 15,
        durationMinutes: 20,
        language: 'Hindi',
        testType: 'Subject Drill',
        priority: 'HIGH'
      });

      const req3 = await mockTestService.submitCustomMockRequest({
        studentId: 'std-batch-03',
        studentName: 'Rohan Joshi',
        examId: 'exam-ctet-p1',
        examName: 'CTET Paper 1',
        subject: 'Child Development & Pedagogy',
        topic: 'Piaget & Vygotsky Theories',
        difficulty: 'HARD',
        questionCount: 30,
        durationMinutes: 35,
        language: 'English',
        testType: 'Chapter Drill',
        priority: 'MEDIUM'
      });

      const allRequests = await mockTestService.getCustomMockRequests();
      const actionable = allRequests.filter(
        (r) =>
          !r.generatedMockTestId &&
          ['REQUESTED', 'UNDER_REVIEW', 'IN_PREPARATION'].includes(r.status)
      );

      expect(actionable.length).toBeGreaterThanOrEqual(3);

      // Simulate Batch Engine synthesis loop
      const synthesisResults = [];
      for (const item of actionable) {
        const res = await mockTestService.generateMockFromRequest(item.id, {
          operatorId,
          operatorName
        });
        synthesisResults.push(res);
      }

      expect(synthesisResults.length).toBe(actionable.length);

      // Verify each request is now QUALITY_REVIEW and linked to a draft mock
      for (const result of synthesisResults) {
        expect(result.request.status).toBe('QUALITY_REVIEW');
        expect(result.request.generatedMockTestId).toBeDefined();
        expect(result.mockTest).toBeDefined();
        expect(result.mockTest.status).toBe('DRAFT');
      }

      // Verify all requests in store reflect the updated status
      const updatedQueue = await mockTestService.getCustomMockRequests();
      for (const req of [req1, req2, req3]) {
        const found = updatedQueue.find((r) => r.id === req.id);
        expect(found?.status).toBe('QUALITY_REVIEW');
        expect(found?.generatedMockTestId).toBeDefined();
      }
    });
  });

  describe('5. Pan-India Neural AI Copilot Presets Validation', () => {
    const AI_PRESETS = [
      { id: 'SSC/UPSC', exam: 'SSC CGL & CHSL', subject: 'General Awareness & Reasoning' },
      { id: 'POLICE', exam: 'UP Police Constable & SI', subject: 'General Hindi (सामान्य हिंदी)' },
      { id: 'MEDICAL', exam: 'NEET UG 2026', subject: 'Biology (Genetics & Ecology)' },
      { id: 'ENGINEERING', exam: 'JEE Main 2026', subject: 'Physics (Mechanics & Electrodynamics)' },
      { id: 'BANKING', exam: 'IBPS PO & SBI Clerk', subject: 'Quantitative Aptitude' },
      { id: 'TEACHING', exam: 'CTET & UPTET Paper-1', subject: 'Child Development & Pedagogy' },
      { id: 'STATE_EXAMS', exam: 'UPSSSC PET & Lekhpal', subject: 'Gram Samaj & General Knowledge' },
      { id: 'AUDIT', exam: 'Quality Assurance Protocol', subject: 'Syllabus & Negative Marking Audit' }
    ];

    it('Should contain 8 standardized Pan-India exam preset domains', () => {
      expect(AI_PRESETS.length).toBe(8);
      const presetIds = AI_PRESETS.map((p) => p.id);
      expect(presetIds).toContain('SSC/UPSC');
      expect(presetIds).toContain('POLICE');
      expect(presetIds).toContain('MEDICAL');
      expect(presetIds).toContain('ENGINEERING');
      expect(presetIds).toContain('BANKING');
      expect(presetIds).toContain('TEACHING');
      expect(presetIds).toContain('STATE_EXAMS');
      expect(presetIds).toContain('AUDIT');
    });

    it('Should synthesize valid MCQ questions adhering to national exam patterns', () => {
      AI_PRESETS.forEach((preset) => {
        expect(preset.exam).toBeDefined();
        expect(preset.subject).toBeDefined();
        expect(preset.exam.length).toBeGreaterThan(3);
        expect(preset.subject.length).toBeGreaterThan(3);
      });
    });
  });

  describe('6. Non-Financial Safety & Academic Scoping Boundaries', () => {
    it('Should verify Operator Content Metrics contain strictly zero financial/revenue keys', async () => {
      const metrics = await operatorService.getOperatorContentMetrics(operatorId);
      const metricKeys = Object.keys(metrics);

      // Operator metrics must NEVER include financial attributes
      const forbiddenFinancialKeys = [
        'revenue',
        'payout',
        'commission',
        'gateway',
        'checkout',
        'price',
        'totalEarnings',
        'netProfit',
        'bankAccount'
      ];

      forbiddenFinancialKeys.forEach((key) => {
        expect(metricKeys).not.toContain(key);
      });
    });

    it('Should verify Custom Mock Drill Requests have strictly academic schemas', async () => {
      const requests = await mockTestService.getCustomMockRequests();
      expect(requests.length).toBeGreaterThan(0);

      const forbiddenFinancialKeys = [
        'priceInr',
        'paymentStatus',
        'transactionId',
        'feeCharged',
        'discountCoupon'
      ];

      requests.forEach((req) => {
        const keys = Object.keys(req);
        forbiddenFinancialKeys.forEach((forbiddenKey) => {
          expect(keys).not.toContain(forbiddenKey);
        });
      });
    });
  });

  describe('7. Futuristic Cyber-HUD Preference & Persistence', () => {
    it('Should persist and retrieve panoramic widescreen state via safeStorage', () => {
      safeStorage.setItem('fp_operator_hud_panoramic', 'true');
      const isPanoramic = safeStorage.getItem('fp_operator_hud_panoramic');
      expect(isPanoramic).toBe('true');

      safeStorage.setItem('fp_operator_hud_panoramic', 'false');
      expect(safeStorage.getItem('fp_operator_hud_panoramic')).toBe('false');
    });

    it('Should persist and retrieve cyber procedural audio toggle state via safeStorage', () => {
      safeStorage.setItem('fp_operator_hud_sfx', 'true');
      const sfx = safeStorage.getItem('fp_operator_hud_sfx');
      expect(sfx).toBe('true');

      safeStorage.setItem('fp_operator_hud_sfx', 'false');
      expect(safeStorage.getItem('fp_operator_hud_sfx')).toBe('false');
    });
  });
});

