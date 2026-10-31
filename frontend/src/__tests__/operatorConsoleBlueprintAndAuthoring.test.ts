import { describe, it, expect, beforeEach } from 'vitest';
import { blueprintValidationService } from '../services/blueprintValidationService';
import { mockStore } from '../mock/store';
import { 
  MockTest, 
  GovernmentExam, 
  QuestionItem, 
  QuestionDifficulty, 
  QuestionType 
} from '../types/academicIntelligence';

describe('FOCUSPOINT Operator Console: Blueprint Validator & Manual Authoring Tools', () => {
  const dummyExam: GovernmentExam = {
    id: 'exam-test-ssc',
    name: 'SSC Combined Graduate Level',
    shortName: 'SSC CGL',
    category: 'SSC',
    conductingAuthority: 'Staff Selection Commission',
    isNational: true,
    level: 'GRADUATE',
    subjects: ['Quantitative Aptitude', 'General Intelligence', 'English Comprehension', 'General Awareness'],
    durationMinutes: 60,
    totalQuestions: 20,
    totalMarks: 40,
    negativeMarkingPerQuestion: 0.5,
    languages: ['Hindi', 'English'],
    status: 'ACTIVE',
    patternVersion: '2026.1',
    description: 'Tier 1 Preliminary Examination'
  };

  const createDummyQuestion = (id: string, text: string, subject: string, difficulty: QuestionDifficulty = 'MEDIUM', marks: number = 2.0): QuestionItem => ({
    id,
    examId: dummyExam.id,
    examName: dummyExam.name,
    subject,
    topic: 'Sample Topic',
    difficulty,
    questionType: 'MCQ' as QuestionType,
    questionText: text,
    options: [
      { id: 'opt_1', text: 'Alpha Option', isCorrect: true },
      { id: 'opt_2', text: 'Beta Option', isCorrect: false },
      { id: 'opt_3', text: 'Gamma Option', isCorrect: false },
      { id: 'opt_4', text: 'Delta Option', isCorrect: false }
    ],
    correctAnswer: 'A',
    explanation: 'Detailed step-by-step mathematical reasoning and theorem proof for student review.',
    marks,
    negativeMarks: 0.5,
    language: 'English',
    source: 'STAFF_AUTHORED',
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const createDummyMockTest = (overrides: Partial<MockTest> = {}): MockTest => ({
    id: 'mt-balanced-01',
    examId: dummyExam.id,
    examName: dummyExam.name,
    title: 'SSC CGL Verified Full Mock Drill 01',
    description: 'Blueprint audit test description',
    isFullMock: true,
    totalQuestions: 20,
    totalMarks: 40,
    passingMarks: 16,
    durationMinutes: 60,
    negativeMarkingPerQuestion: 0.5,
    status: 'DRAFT',
    difficulty: 'MIXED',
    isFree: true,
    questionIds: [],
    attemptCount: 0,
    createdAt: new Date().toISOString(),
    ...overrides
  });

  describe('1. Blueprint Validation Service: Pattern & Rule Compliance', () => {
    it('Should successfully audit a balanced, compliant test and award >= 90% readiness score', () => {
      const questions: QuestionItem[] = [];
      const subjects = dummyExam.subjects;
      // 20 questions total, 5 per subject, mixed difficulty
      const sampleTexts = [
        "In a triangle ABC, find the length of median AD when AB=6 and AC=8.",
        "A train traveling at 72 kmph crosses a platform of length 200m in 25 seconds.",
        "Evaluate the definite integral of sin(x) from 0 to pi divided by two.",
        "Simplify the algebraic expression (x+y)^3 minus (x-y)^3 completely.",
        "Find the compound interest on 10000 rupees for two years at 10 percent per annum.",
        "Which of the following numbers completes the series: 3, 7, 15, 31, 63?",
        "If CLOCK is coded as KCOLC, how is WATCH written in that code?",
        "Pointing to a photograph, a woman says: He is the only son of my grandfather.",
        "Select the related word from the given alternatives: Ocean : Water :: Glacier : ?",
        "Statements: All cups are books. Some books are pens. Find conclusions.",
        "Choose the correct synonym for the word 'METICULOUS' from the following.",
        "Identify the grammatical error in: Neither the teacher nor the students was present.",
        "Select the most appropriate one-word substitute: A person who loves books.",
        "Fill in the blank with the correct preposition: She has been living here ___ 2018.",
        "Convert the active sentence into passive voice: The chef prepares a delicious meal.",
        "Which constitutional article deals with the proclamation of National Emergency in India?",
        "Who was the founder of the Maurya Empire in ancient Indian history?",
        "Which hormone is responsible for regulating blood sugar levels in the human body?",
        "What is the SI unit of electric potential difference in physics?",
        "In which year was the Reserve Bank of India established under the RBI Act?"
      ];

      for (let i = 0; i < 20; i++) {
        const sub = subjects[i % subjects.length];
        const diff: QuestionDifficulty = i < 6 ? 'EASY' : i < 16 ? 'MEDIUM' : 'HARD';
        questions.push(createDummyQuestion(`q-${i + 1}`, sampleTexts[i], sub, diff, 2.0));
      }

      const mockTest = createDummyMockTest({
        id: 'mt-balanced-01',
        title: 'SSC CGL Verified Full Mock Drill 01',
        totalQuestions: 20,
        totalMarks: 40
      });

      const report = blueprintValidationService.auditMockTestBlueprint(mockTest, dummyExam, questions, 'Senior Academician');

      expect(report).toBeDefined();
      expect(report.isValid).toBe(true);
      expect(report.errorCount).toBe(0);
      expect(report.readinessScore).toBeGreaterThanOrEqual(90);
      expect(report.totalQuestions).toBe(20);
      expect(report.totalMarks).toBe(40);
      expect(report.sectionCoverage.length).toBe(4);
      expect(report.complianceSummary).toContain('EXCELLENT');
    });

    it('Should detect QUESTION_COUNT_MISMATCH as an error when questions count is insufficient', () => {
      const questions: QuestionItem[] = [
        createDummyQuestion('q-1', 'Only Question 1 in whole test', 'Quantitative Aptitude'),
        createDummyQuestion('q-2', 'Only Question 2 in whole test', 'Quantitative Aptitude')
      ];

      const mockTest = createDummyMockTest({
        id: 'mt-short-01',
        title: 'Incomplete Test with 2 Questions',
        totalQuestions: 20,
        totalMarks: 40
      });

      const report = blueprintValidationService.auditMockTestBlueprint(mockTest, dummyExam, questions);

      expect(report.isValid).toBe(false);
      expect(report.errorCount).toBeGreaterThanOrEqual(1);
      const countIssue = report.issues.find(i => i.ruleCode === 'QUESTION_COUNT_MISMATCH');
      expect(countIssue).toBeDefined();
      expect(countIssue?.severity).toBe('ERROR');
      expect(report.readinessScore).toBeLessThan(70);
    });

    it('Should detect DUPLICATE_OPTIONS within a question as a blocking ERROR', () => {
      const rogueQ: QuestionItem = {
        ...createDummyQuestion('q-dup-opt', 'Calculate value of X in triangle', 'Quantitative Aptitude'),
        options: [
          { id: 'opt_1', text: '42 cm', isCorrect: true },
          { id: 'opt_2', text: '42 cm', isCorrect: false }, // DUPLICATE OPTION!
          { id: 'opt_3', text: '50 cm', isCorrect: false },
          { id: 'opt_4', text: '60 cm', isCorrect: false }
        ]
      };

      const mockTest = createDummyMockTest({
        id: 'mt-dup-opt-test',
        title: 'Test with Duplicate Options',
        totalQuestions: 1,
        totalMarks: 2,
        durationMinutes: 10
      });

      const report = blueprintValidationService.auditMockTestBlueprint(mockTest, dummyExam, [rogueQ]);

      expect(report.isValid).toBe(false);
      const dupOptIssue = report.issues.find(i => i.ruleCode === 'DUPLICATE_OPTIONS');
      expect(dupOptIssue).toBeDefined();
      expect(dupOptIssue?.severity).toBe('ERROR');
      expect(dupOptIssue?.message).toContain('duplicate options');
    });

    it('Should detect MISSING_CORRECT_ANSWER when no option is marked correct', () => {
      const rogueQ: QuestionItem = {
        ...createDummyQuestion('q-no-ans', 'Find the chemical formula of limestone', 'General Science'),
        options: [
          { id: 'opt_1', text: 'CaCO3', isCorrect: false },
          { id: 'opt_2', text: 'CaO', isCorrect: false },
          { id: 'opt_3', text: 'Ca(OH)2', isCorrect: false },
          { id: 'opt_4', text: 'CaCl2', isCorrect: false }
        ]
      };

      const mockTest = createDummyMockTest({
        id: 'mt-no-ans-test',
        title: 'Test with Missing Correct Option',
        totalQuestions: 1,
        totalMarks: 2,
        durationMinutes: 10
      });

      const report = blueprintValidationService.auditMockTestBlueprint(mockTest, dummyExam, [rogueQ]);
      const noAnsIssue = report.issues.find(i => i.ruleCode === 'MISSING_CORRECT_ANSWER');
      expect(noAnsIssue).toBeDefined();
      expect(noAnsIssue?.severity).toBe('ERROR');

      // Test auto-fix
      const fixed = blueprintValidationService.autoFixMissingCorrectAnswers([rogueQ]);
      expect(fixed[0].options[0].isCorrect).toBe(true);
      expect(fixed[0].correctAnswer).toBe('A');
    });

    it('Should detect DUPLICATE_QUESTION between questions having >=80% similarity', () => {
      const q1 = createDummyQuestion('q-orig', 'What is the capital of Uttar Pradesh located along Gomti river?', 'General Awareness');
      const q2 = createDummyQuestion('q-clone', 'What is the capital of Uttar Pradesh located along Gomti river?', 'General Awareness');

      const duplicates = blueprintValidationService.findDuplicateQuestions([q1, q2], 80);
      expect(duplicates.length).toBe(1);
      expect(duplicates[0].similarityScorePct).toBe(100);
      expect(duplicates[0].questionAId).toBe('q-orig');
      expect(duplicates[0].questionBId).toBe('q-clone');
    });

    it('Should auto-balance marks when marks total does not match target', () => {
      const questions = [
        createDummyQuestion('q-1', 'Sample 1', 'Quantitative Aptitude', 'MEDIUM', 1.0),
        createDummyQuestion('q-2', 'Sample 2', 'Quantitative Aptitude', 'MEDIUM', 1.0),
      ];

      const balanced = blueprintValidationService.autoBalanceMarks(questions, 10.0);
      expect(balanced[0].marks).toBe(5.0);
      expect(balanced[1].marks).toBe(5.0);
    });

    it('Should auto-fix negative marks to match official standard', () => {
      const questions = [
        createDummyQuestion('q-1', 'Sample 1', 'Quantitative Aptitude', 'MEDIUM', 2.0),
      ];
      questions[0].negativeMarks = 1.0; // Non-standard

      const fixed = blueprintValidationService.autoFixNegativeMarking(questions, 0.5);
      expect(fixed[0].negativeMarks).toBe(0.5);
    });
  });

  describe('2. Question Bank: Bulk Operations & Multi-format Storage', () => {
    const testQId1 = `qb-test-bulk-1-${Date.now()}`;
    const testQId2 = `qb-test-bulk-2-${Date.now()}`;

    beforeEach(() => {
      mockStore.addQuestion({
        ...createDummyQuestion(testQId1, 'Bulk Test Item 1', 'Quantitative Aptitude'),
        status: 'AI_GENERATED'
      });
      mockStore.addQuestion({
        ...createDummyQuestion(testQId2, 'Bulk Test Item 2', 'English Comprehension'),
        status: 'AI_GENERATED'
      });
    });

    it('Should bulk approve selected questions', () => {
      const approvedCount = mockStore.bulkApproveQuestions([testQId1, testQId2], 'Master Lead Examiner');
      expect(approvedCount).toBe(2);

      const bank = mockStore.getQuestionBank();
      const q1 = bank.find(q => q.id === testQId1);
      const q2 = bank.find(q => q.id === testQId2);

      expect(q1?.status).toBe('APPROVED');
      expect(q2?.status).toBe('APPROVED');
      expect(q1?.approvedBy).toBe('Master Lead Examiner');
    });

    it('Should bulk reject selected questions', () => {
      const rejectCount = mockStore.bulkRejectQuestions([testQId1]);
      expect(rejectCount).toBe(1);

      const bank = mockStore.getQuestionBank();
      const q1 = bank.find(q => q.id === testQId1);
      expect(q1?.status).toBe('REJECTED');
    });

    it('Should bulk delete questions from the repository', () => {
      const deletedCount = mockStore.bulkDeleteQuestions([testQId1, testQId2]);
      expect(deletedCount).toBe(2);

      const bank = mockStore.getQuestionBank();
      expect(bank.some(q => q.id === testQId1)).toBe(false);
      expect(bank.some(q => q.id === testQId2)).toBe(false);
    });

    it('Should correctly store and preserve bilingual questions and numerical values', () => {
      const bilingualQId = `qb-bilingual-${Date.now()}`;
      const bilingualQ: QuestionItem = {
        ...createDummyQuestion(bilingualQId, 'If x^2 + 5x + 6 = 0, find the integer roots of equation.', 'Quantitative Aptitude'),
        hindiQuestionText: 'यदि x^2 + 5x + 6 = 0, तो समीकरण के मूल ज्ञात कीजिए।',
        hindiExplanation: 'गुणनखंड विधि द्वारा: (x+2)(x+3) = 0 अतः x = -2, -3',
        numericalAnswer: -2,
        numericalTolerance: 0.1,
        questionType: 'NUMERICAL',
        language: 'Bilingual (Hindi + English)'
      };

      mockStore.addQuestion(bilingualQ);
      const bank = mockStore.getQuestionBank();
      const retrieved = bank.find(q => q.id === bilingualQId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.hindiQuestionText).toContain('समीकरण के मूल');
      expect(retrieved?.hindiExplanation).toContain('गुणनखंड विधि');
      expect(retrieved?.numericalAnswer).toBe(-2);
      expect(retrieved?.numericalTolerance).toBe(0.1);
      expect(retrieved?.questionType).toBe('NUMERICAL');
    });
  });
});
