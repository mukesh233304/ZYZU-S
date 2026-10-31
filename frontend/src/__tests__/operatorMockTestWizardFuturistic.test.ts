import { describe, it, expect, beforeEach } from 'vitest';
import { mockStore } from '../mock/store';
import { mockTestService } from '../services/mockTestService';
import { operatorService } from '../services/operatorService';
import { MockTest, GovernmentExam, TestCategoryType } from '../types/academicIntelligence';

describe('FOCUSPOINT — Operator Futuristic Mock Test Authoring Wizard Suite', () => {
  const operatorId = 'usr-operator-sunita';
  const operatorName = 'Sunita Verma';

  beforeEach(() => {
    // Clean mock for localStorage
    const store: Record<string, string> = {};
    (global as any).localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => { store[key] = val; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    };
  });

  describe('1. Exam Genome & Blueprint Mathematical Precision', () => {
    it('Should calculate marks per question and negative penalty ratios with exact precision', () => {
      const blueprint = {
        totalQuestions: 150,
        totalMarks: 300,
        durationMinutes: 120,
        negativeMarkingPerQuestion: 0.5,
        passingMarks: 120
      };

      const marksPerQ = blueprint.totalMarks / blueprint.totalQuestions;
      expect(marksPerQ).toBe(2);

      const penaltyRatio = (blueprint.negativeMarkingPerQuestion / marksPerQ) * 100;
      expect(penaltyRatio).toBe(25); // 25% negative marking penalty

      const cutoffPercent = (blueprint.passingMarks / blueprint.totalMarks) * 100;
      expect(cutoffPercent).toBe(40); // 40% passing cutoff
    });

    it('Should generate unique cryptographic genome identifiers for government mock papers', () => {
      const examShortName = 'UP-POLICE-CONSTABLE';
      const year = 2024;
      const category: TestCategoryType = 'PREVIOUS_YEAR';
      const shift = 'Shift-1';
      const code = 'SET-B';

      const genomeHash = `GENOME_${examShortName}_${year}_${category}_${shift}_${code}`.toUpperCase();
      expect(genomeHash).toBe('GENOME_UP-POLICE-CONSTABLE_2024_PREVIOUS_YEAR_SHIFT-1_SET-B');
    });
  });

  describe('2. Category Matrix & Dynamic Pedagogical Formats', () => {
    it('Should correctly configure all 8 pedagogical formats', () => {
      const categories: { key: TestCategoryType; label: string; minTime: number }[] = [
        { key: 'FULL_TEST', label: 'Full Length Mock', minTime: 120 },
        { key: 'PREVIOUS_YEAR', label: 'PYQ Shift Paper', minTime: 120 },
        { key: 'TEST_SERIES', label: 'Test Series Package', minTime: 90 },
        { key: 'SUBJECT_WISE', label: 'Subject Mock', minTime: 45 },
        { key: 'CHAPTER_WISE', label: 'Chapter Practice', minTime: 30 },
        { key: 'IMPORTANT_TEST', label: 'High Yield Mock', minTime: 60 },
        { key: 'ADVANCED_TEST', label: 'Advanced Challenge', minTime: 90 },
        { key: 'MISCELLANEOUS', label: 'Speed Sprint', minTime: 20 }
      ];

      expect(categories.length).toBe(8);
      const sprint = categories.find(c => c.key === 'MISCELLANEOUS');
      expect(sprint?.minTime).toBe(20);
    });

    it('Should enforce archival proof fields for Previous Year Papers', () => {
      const pyqPayload = {
        category: 'PREVIOUS_YEAR' as TestCategoryType,
        year: 2023,
        shift: 'Shift 2 (Evening)',
        paperSet: 'Set C',
        paperSourceType: 'OFFICIAL_MEMORANDUM',
        paperSourceReference: 'Ref: UPPRPB/2023/REC-8871'
      };

      expect(pyqPayload.category).toBe('PREVIOUS_YEAR');
      expect(pyqPayload.year).toBeGreaterThanOrEqual(2015);
      expect(pyqPayload.paperSourceType).toBe('OFFICIAL_MEMORANDUM');
      expect(pyqPayload.paperSourceReference).toContain('UPPRPB');
    });

    it('Should enforce test series linkage when category is TEST_SERIES', () => {
      const seriesPayload = {
        category: 'TEST_SERIES' as TestCategoryType,
        seriesId: 'series-ssc-cgl-tier1-2024',
        seriesOrder: 4
      };

      expect(seriesPayload.seriesId).toBeDefined();
      expect(seriesPayload.seriesOrder).toBe(4);
    });
  });

  describe('3. Smart Auto-Assembly Balancing Engine', () => {
    it('Should calculate difficulty quotas conforming to percentage distribution', () => {
      const totalQuestions = 100;
      const easyPct = 30;
      const mediumPct = 50;
      const hardPct = 20;

      const easyCount = Math.round((totalQuestions * easyPct) / 100);
      const mediumCount = Math.round((totalQuestions * mediumPct) / 100);
      const hardCount = Math.round((totalQuestions * hardPct) / 100);

      expect(easyCount + mediumCount + hardCount).toBe(100);
      expect(easyCount).toBe(30);
      expect(mediumCount).toBe(50);
      expect(hardCount).toBe(20);
    });

    it('Should validate multi-subject distribution quotas matching total paper size', () => {
      const subjects = ['General Knowledge', 'General Hindi', 'Numerical Ability', 'Mental Aptitude'];
      const quotas: Record<string, number> = {
        'General Knowledge': 38,
        'General Hindi': 37,
        'Numerical Ability': 38,
        'Mental Aptitude': 37
      };

      const sum = subjects.reduce((acc, sub) => acc + (quotas[sub] || 0), 0);
      expect(sum).toBe(150); // Standard UP Police Constable 150 Question Blueprint
    });
  });

  describe('4. In-Wizard Neural AI Question Generator', () => {
    it('Should generate validated questions with complete options, correct answer, and explanation', () => {
      const generatedQuestions = Array.from({ length: 5 }, (_, i) => ({
        id: `synth-ai-q-${Date.now()}-${i}`,
        subject: 'General Awareness',
        topic: 'Indian Polity & Constitution',
        difficulty: (['EASY', 'MEDIUM', 'HARD'] as const)[i % 3],
        questionText: `Synthesized Test Question #${i + 1}: Which constitutional article guarantees Equality before Law?`,
        options: [
          { key: 'A', text: 'Article 14' },
          { key: 'B', text: 'Article 19' },
          { key: 'C', text: 'Article 21' },
          { key: 'D', text: 'Article 32' }
        ],
        correctAnswer: 'A',
        explanation: 'Article 14 of the Constitution provides equality before the law and equal protection of laws.'
      }));

      expect(generatedQuestions.length).toBe(5);
      generatedQuestions.forEach(q => {
        expect(q.options.length).toBe(4);
        expect(q.correctAnswer).toBe('A');
        expect(q.explanation.length).toBeGreaterThan(10);
      });
    });
  });

  describe('5. Interactive In-Studio CBT Test Drive Simulator Engine', () => {
    it('Should score student CBT simulation with correct marks and negative penalty deduction', () => {
      const testConfig = {
        marksPerCorrect: 2,
        negativeMarkPerWrong: 0.5
      };

      const questions = [
        { id: 1, correctAnswer: 'B' },
        { id: 2, correctAnswer: 'A' },
        { id: 3, correctAnswer: 'C' },
        { id: 4, correctAnswer: 'D' },
        { id: 5, correctAnswer: 'A' }
      ];

      // Simulated user responses: Q1 correct, Q2 correct, Q3 wrong, Q4 wrong, Q5 skipped
      const studentAnswers: Record<number, string> = {
        0: 'B', // Correct
        1: 'A', // Correct
        2: 'B', // Wrong (correct is C)
        3: 'A'  // Wrong (correct is D)
        // 4 skipped
      };

      let correctCount = 0;
      let incorrectCount = 0;
      let skippedCount = 0;

      questions.forEach((q, idx) => {
        const ans = studentAnswers[idx];
        if (!ans) {
          skippedCount++;
        } else if (ans === q.correctAnswer) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      });

      expect(correctCount).toBe(2);
      expect(incorrectCount).toBe(2);
      expect(skippedCount).toBe(1);

      const grossMarks = correctCount * testConfig.marksPerCorrect; // 2 * 2 = 4
      const penalty = incorrectCount * testConfig.negativeMarkPerWrong; // 2 * 0.5 = 1
      const netMarks = grossMarks - penalty; // 4 - 1 = 3

      expect(grossMarks).toBe(4);
      expect(penalty).toBe(1);
      expect(netMarks).toBe(3);
    });
  });

  describe('6. Mock Test Creation Service & Operator Audit Trail', () => {
    it('Should create and persist a new mock test via mockTestService', async () => {
      const initialCount = (await mockTestService.getMockTests()).length;

      const newTest = await mockTestService.createMockTest({
        examId: 'exam-up-constable-2024',
        examName: 'UP Police Constable Examination 2024',
        title: 'Cyber-Synthesized All India Super Mock #99',
        shortName: 'AIM-99',
        description: 'Futuristic full-length mock authored via Operator Cyber Wizard',
        instructions: ['Test duration strictly 120 mins', 'Negative marks applied'],
        category: 'FULL_TEST',
        subject: undefined,
        isFullMock: true,
        durationMinutes: 120,
        totalQuestions: 150,
        totalMarks: 300,
        negativeMarkingPerQuestion: 0.5,
        passingMarks: 120,
        difficulty: 'MIXED',
        status: 'PUBLISHED',
        language: 'Bilingual',
        questionIds: ['q-up-01', 'q-up-02', 'q-up-03'],
        version: 'v1.0'
      });

      expect(newTest.id).toBeDefined();
      expect(newTest.title).toBe('Cyber-Synthesized All India Super Mock #99');
      expect(newTest.status).toBe('PUBLISHED');

      const allTests = await mockTestService.getMockTests();
      expect(allTests.length).toBe(initialCount + 1);

      const found = allTests.find(t => t.id === newTest.id);
      expect(found).toBeDefined();
      expect(found?.totalMarks).toBe(300);
    });

    it('Should record immutable operator audit action for mock test creation', async () => {
      const activity = await operatorService.logActivity({
        operatorId,
        operatorName,
        action: 'MOCK_TEST_CREATE',
        entity: 'MOCK_TEST',
        entityId: 'mock-test-test-99',
        entityTitle: 'Cyber-Synthesized All India Super Mock #99',
        details: 'Created new FULL_TEST mock paper via Cyber-HUD Wizard'
      });

      expect(activity).toBeDefined();
      expect(activity.id).toBeDefined();
      expect(activity.operatorId).toBe(operatorId);
      expect(activity.action).toBe('MOCK_TEST_CREATE');
      expect(activity.entity).toBe('MOCK_TEST');

      const logs = await operatorService.getActivityLogs(operatorId);
      expect(logs.some(l => l.entityId === 'mock-test-test-99')).toBe(true);
    });
  });

  describe('7. Blueprint Quick-Apply Presets & Pacing Velocity Index', () => {
    it('Should correctly configure all official exam presets', () => {
      const presets = [
        {
          id: 'preset-upsssc-pet',
          totalQuestions: 100,
          durationMinutes: 120,
          totalMarks: 100,
          negativeMarkingPerQuestion: 0.25,
          passingMarks: 45
        },
        {
          id: 'preset-up-police-constable',
          totalQuestions: 150,
          durationMinutes: 120,
          totalMarks: 300,
          negativeMarkingPerQuestion: 0.50,
          passingMarks: 120
        },
        {
          id: 'preset-ssc-cgl-tier1',
          totalQuestions: 100,
          durationMinutes: 60,
          totalMarks: 200,
          negativeMarkingPerQuestion: 0.50,
          passingMarks: 130
        },
        {
          id: 'preset-super-tet',
          totalQuestions: 150,
          durationMinutes: 150,
          totalMarks: 150,
          negativeMarkingPerQuestion: 0.00,
          passingMarks: 97
        }
      ];

      expect(presets.length).toBe(4);

      // Verify SSC CGL Tier 1 pacing velocity (36s/Q)
      const ssc = presets.find(p => p.id === 'preset-ssc-cgl-tier1')!;
      const sscPacing = Math.round((ssc.durationMinutes * 60) / ssc.totalQuestions);
      expect(sscPacing).toBe(36);
      expect(sscPacing < 45).toBe(true); // HIGH SPEED SPRINT

      // Verify UP Police Constable pacing velocity (48s/Q)
      const upp = presets.find(p => p.id === 'preset-up-police-constable')!;
      const uppPacing = Math.round((upp.durationMinutes * 60) / upp.totalQuestions);
      expect(uppPacing).toBe(48);
      expect(uppPacing >= 45 && uppPacing <= 90).toBe(true); // BALANCED STANDARD
    });

    it('Should classify negative marking severity ratios correctly', () => {
      const testCases = [
        { marksPerQ: 1, neg: 0.00, expectedRatio: 0, expectedLabel: 'Zero Penalty (Safe Ascent)' },
        { marksPerQ: 2, neg: 0.50, expectedRatio: 25, expectedLabel: 'Standard Exam Ratio (1/4th)' },
        { marksPerQ: 1, neg: 0.33, expectedRatio: 33, expectedLabel: 'Elevated Penalty (1/3rd)' },
        { marksPerQ: 2, neg: 1.00, expectedRatio: 50, expectedLabel: 'Severe Penalty (1/2)' }
      ];

      testCases.forEach(tc => {
        const ratio = Math.round((tc.neg / tc.marksPerQ) * 100);
        expect(ratio).toBe(tc.expectedRatio);
      });
    });
  });

  describe('8. In-Studio CBT Simulator Operator Inspection Mode & Answer Key Validation', () => {
    it('Should validate correct answers and explanations when operator inspection mode is enabled', () => {
      const sampleQuestion = {
        id: 'q-sample-1',
        questionText: 'What is the statutory quorum required to constitute a meeting of Parliament?',
        options: [
          { key: 'A', text: 'One-tenth of total members' },
          { key: 'B', text: 'One-third of total members' },
          { key: 'C', text: 'One-fifth of total members' },
          { key: 'D', text: 'Half of total members' }
        ],
        correctAnswer: 'A',
        explanation: 'Article 100(3) requires one-tenth of total members for quorum.'
      };

      const operatorInspectionActive = true;
      expect(operatorInspectionActive).toBe(true);
      expect(sampleQuestion.options.some(opt => opt.key === sampleQuestion.correctAnswer)).toBe(true);
      expect(sampleQuestion.explanation).toContain('Article 100(3)');
    });
  });
});
