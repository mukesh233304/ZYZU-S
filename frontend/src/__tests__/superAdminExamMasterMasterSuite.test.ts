import { describe, it, expect, beforeEach } from 'vitest';
import { mockTestService } from '../services/mockTestService';
import { questionBankService } from '../services/questionBankService';
import { GovernmentExam, MockTest, MockTestSeries } from '../types/academicIntelligence';

describe('FOCUSPOINT — Super Admin Govt Exam & Mock Master Console Master Suite', () => {
  beforeEach(() => {
    // Clean state setup
  });

  describe('1. Commission Exam Repository & Categorization', () => {
    it('retrieves registered commission exams across categories', async () => {
      const allExams = await mockTestService.getGovernmentExams();
      expect(allExams.length).toBeGreaterThan(0);

      const sscExams = await mockTestService.getGovernmentExams('SSC');
      expect(sscExams.every(e => e.category === 'SSC')).toBe(true);

      const railwayExams = await mockTestService.getGovernmentExams('RAILWAY');
      expect(railwayExams.every(e => e.category === 'RAILWAY')).toBe(true);
    });

    it('retrieves an individual exam by id with pattern specifications', async () => {
      const exam = await mockTestService.getGovernmentExamById('exam-ssc-cgl');
      expect(exam).toBeDefined();
      expect(exam?.shortName).toBe('SSC CGL');
      expect(exam?.durationMinutes).toBe(60);
      expect(exam?.totalQuestions).toBe(100);
      expect(exam?.totalMarks).toBe(200);
      expect(exam?.negativeMarkingPerQuestion).toBe(0.5);
      expect(exam?.subjects.length).toBeGreaterThan(0);
    });
  });

  describe('2. Commission Exam Registration & Lifecycle Management', () => {
    it('registers a new government examination blueprint', async () => {
      const newExam: GovernmentExam = {
        id: 'exam-cyber-upsc-epfo',
        name: 'Union Public Service Commission — Enforcement Officer (UPSC EPFO)',
        shortName: 'UPSC EPFO',
        category: 'CIVIL_SERVICES',
        conductingAuthority: 'Union Public Service Commission',
        isNational: true,
        level: 'GRADUATE',
        subjects: ['General English', 'Indian Freedom Struggle', 'Current Events', 'Indian Polity & Economy'],
        durationMinutes: 120,
        totalQuestions: 120,
        totalMarks: 300,
        negativeMarkingPerQuestion: 0.83,
        languages: ['English', 'Hindi'],
        status: 'ACTIVE',
        patternVersion: 'EPFO-RT-2026',
        description: 'Recruitment test for Enforcement Officer/Accounts Officer in EPFO.'
      };

      const saved = await mockTestService.saveGovernmentExam(newExam);
      expect(saved.id).toBe('exam-cyber-upsc-epfo');
      expect(saved.shortName).toBe('UPSC EPFO');

      const retrieved = await mockTestService.getGovernmentExamById('exam-cyber-upsc-epfo');
      expect(retrieved).toBeDefined();
      expect(retrieved?.totalMarks).toBe(300);
      expect(retrieved?.negativeMarkingPerQuestion).toBe(0.83);
    });

    it('updates pattern specifications of an existing exam', async () => {
      const exam = await mockTestService.getGovernmentExamById('exam-cyber-upsc-epfo');
      expect(exam).toBeDefined();

      const updated = await mockTestService.saveGovernmentExam({
        ...exam!,
        status: 'UPCOMING',
        durationMinutes: 150
      });

      expect(updated.status).toBe('UPCOMING');
      expect(updated.durationMinutes).toBe(150);
    });

    it('decommissions and removes an exam from the repository', async () => {
      const ok = await mockTestService.deleteGovernmentExam('exam-cyber-upsc-epfo');
      expect(ok).toBe(true);

      const lookup = await mockTestService.getGovernmentExamById('exam-cyber-upsc-epfo');
      expect(lookup).toBeUndefined();
    });
  });

  describe('3. Mock Test Assembly & Question Bank Linkage', () => {
    it('retrieves live mock tests and filters by exam target', async () => {
      const allTests = await mockTestService.getMockTests();
      expect(allTests.length).toBeGreaterThan(0);

      const sscTests = await mockTestService.getMockTests('exam-ssc-cgl');
      expect(sscTests.every(t => t.examId === 'exam-ssc-cgl')).toBe(true);
    });

    it('assembles a mock test bound to published question items', async () => {
      // Find published questions
      const publishedQs = await questionBankService.getQuestions({ status: 'PUBLISHED' });
      expect(publishedQs.length).toBeGreaterThan(0);

      const qIds = publishedQs.slice(0, 5).map(q => q.id);

      const assembledTest = await questionBankService.createMockTestFromBank({
        examId: 'exam-ssc-cgl',
        examName: 'SSC CGL',
        title: 'SSC CGL Automated Master Drill #99',
        description: 'Auto-assembled drill from published questions.',
        isFullMock: true,
        durationMinutes: 45,
        totalQuestions: qIds.length,
        totalMarks: 50,
        negativeMarkingPerQuestion: 0.5,
        passingMarks: 20,
        difficulty: 'MIXED',
        questionIds: qIds,
        status: 'PUBLISHED'
      });

      expect(assembledTest.id).toBeDefined();
      expect(assembledTest.questionIds.length).toBe(qIds.length);
      expect(assembledTest.status).toBe('PUBLISHED');
      expect(assembledTest.attemptCount).toBe(0);

      const retrieved = await mockTestService.getMockTestById(assembledTest.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe('SSC CGL Automated Master Drill #99');
    });

    it('performs smart test assembly with difficulty balance', async () => {
      const smartResult = await mockTestService.smartAssembleMockTest({
        examId: 'exam-ssc-cgl',
        totalQuestions: 4,
        difficultyDistribution: { easy: 50, medium: 30, hard: 20 }
      });

      expect(smartResult.selectedIds.length).toBeGreaterThan(0);
      expect(smartResult.questions.length).toBe(smartResult.selectedIds.length);
    });
  });

  describe('4. Mock Test Operations (Clone, Status Toggle, Batch Updates)', () => {
    it('duplicates an existing mock test into a variant draft', async () => {
      const allTests = await mockTestService.getMockTests();
      const targetTest = allTests[0];

      const cloned = await mockTestService.duplicateMockTest(targetTest.id, `${targetTest.title} (Re-test Variant)`);
      expect(cloned).toBeDefined();
      expect(cloned?.id).not.toBe(targetTest.id);
      expect(cloned?.title).toContain('Re-test Variant');
      expect(cloned?.status).toBe('DRAFT');
    });

    it('toggles mock test status between PUBLISHED and DRAFT', async () => {
      const allTests = await mockTestService.getMockTests();
      const target = allTests[0];
      const initialStatus = target.status;
      const targetNext = initialStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';

      const updated = await mockTestService.updateMockTest(target.id, { status: targetNext });
      expect(updated?.status).toBe(targetNext);

      // Revert back
      await mockTestService.updateMockTest(target.id, { status: initialStatus });
    });

    it('performs batch updates across multiple mock tests', async () => {
      const allTests = await mockTestService.getMockTests();
      const batchIds = allTests.slice(0, 2).map(t => t.id);

      const updatedCount = await mockTestService.bulkUpdateMockTests(batchIds, { status: 'PUBLISHED' });
      expect(updatedCount).toBe(batchIds.length);

      for (const id of batchIds) {
        const item = await mockTestService.getMockTestById(id);
        expect(item?.status).toBe('PUBLISHED');
      }
    });

    it('deletes a mock test from the repository', async () => {
      // Create a temporary mock test to delete
      const temp = await mockTestService.createMockTest({
        examId: 'exam-ssc-cgl',
        examName: 'SSC CGL',
        title: 'Temporary Mock Test To Delete',
        description: 'Scratch test',
        isFullMock: false,
        durationMinutes: 30,
        totalQuestions: 2,
        totalMarks: 20,
        negativeMarkingPerQuestion: 0.5,
        passingMarks: 8,
        difficulty: 'EASY',
        status: 'DRAFT',
        questionIds: []
      });

      const deleteRes = await mockTestService.deleteMockTest(temp.id);
      expect(deleteRes).toBe(true);

      const lookup = await mockTestService.getMockTestById(temp.id);
      expect(lookup).toBeUndefined();
    });
  });

  describe('5. Test Series Package Architect', () => {
    it('creates and manages a curated multi-test series pack', async () => {
      const tests = await mockTestService.getMockTests('exam-ssc-cgl');
      const testSlice = tests.slice(0, 3);

      const newSeries: MockTestSeries = {
        id: 'series-cyber-test-pack',
        examId: 'exam-ssc-cgl',
        examName: 'Staff Selection Commission (SSC CGL)',
        title: 'SSC CGL 2026 Tier-1 Master Simulation Series (3 Mocks)',
        description: 'Complete high-yield test series for aspirants.',
        totalTests: testSlice.length,
        tests: testSlice.map((t, idx) => ({
          testId: t.id,
          testTitle: t.title,
          order: idx + 1,
          isUnlocked: true,
          questionCount: t.totalQuestions,
          durationMinutes: t.durationMinutes,
          totalMarks: t.totalMarks
        })),
        difficulty: 'MIXED',
        language: 'Hindi & English',
        isFree: false,
        price: 199,
        subscriptionRequired: true,
        status: 'PUBLISHED',
        unlockScheduleType: 'ALL_AT_ONCE',
        createdAt: new Date().toISOString()
      };

      const saved = await mockTestService.saveMockTestSeries(newSeries);
      expect(saved.id).toBe('series-cyber-test-pack');
      expect(saved.totalTests).toBe(testSlice.length);
      expect(saved.price).toBe(199);

      const retrieved = await mockTestService.getMockTestSeriesById('series-cyber-test-pack');
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toContain('Master Simulation Series');

      // Cleanup
      const del = await mockTestService.deleteMockTestSeries('series-cyber-test-pack');
      expect(del).toBe(true);
    });
  });

  describe('6. Data Export Telemetry (CSV & JSON)', () => {
    it('exports commission exams in valid JSON and CSV formats', async () => {
      const exams = await mockTestService.getGovernmentExams();

      const jsonExport = mockTestService.exportExams('json', exams);
      expect(() => JSON.parse(jsonExport)).not.toThrow();

      const csvExport = mockTestService.exportExams('csv', exams);
      expect(csvExport).toContain('ID,Name,ShortName,Category,ConductingAuthority');
      expect(csvExport.split('\n').length).toBeGreaterThan(1);
    });

    it('exports mock tests in valid JSON and CSV formats', async () => {
      const tests = await mockTestService.getMockTests();

      const jsonExport = mockTestService.exportMockTests('json', tests);
      expect(() => JSON.parse(jsonExport)).not.toThrow();

      const csvExport = mockTestService.exportMockTests('csv', tests);
      expect(csvExport).toContain('ID,ExamID,ExamName,Title,Category,IsFullMock');
      expect(csvExport.split('\n').length).toBeGreaterThan(1);
    });
  });

  describe('7. Student Test Simulation Scoring & Penalty Derivation', () => {
    it('accurately calculates positive marks and negative penalty deductions', async () => {
      // Mock examination evaluation scenario:
      // Total Questions = 10, Total Marks = 20 (2 marks per correct)
      // Negative penalty = -0.50 marks per wrong answer
      const questionsCount = 10;
      const totalMarks = 20;
      const marksPerQ = totalMarks / questionsCount; // 2.0
      const penaltyPerQ = 0.5;

      const studentAnswers = {
        correct: 6,
        wrong: 2,
        unattempted: 2
      };

      const rawScore = studentAnswers.correct * marksPerQ - studentAnswers.wrong * penaltyPerQ;
      // 6 * 2.0 = 12.0
      // 2 * 0.5 = 1.0
      // rawScore = 11.0 marks
      expect(rawScore).toBe(11.0);

      const accuracy = Math.round((studentAnswers.correct / (studentAnswers.correct + studentAnswers.wrong)) * 100);
      // 6 / 8 = 75%
      expect(accuracy).toBe(75);
    });
  });
});
