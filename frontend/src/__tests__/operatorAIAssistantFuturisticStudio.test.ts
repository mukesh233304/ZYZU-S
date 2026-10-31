import { describe, it, expect, beforeEach } from 'vitest';
import { aiExamAssistantService } from '../services/aiExamAssistantService';
import { mockStore } from '../mock/store';
import { operatorService } from '../services/operatorService';
import { QuestionItem, MockTest } from '../types/academicIntelligence';

describe('FOCUSPOINT — Operator AI Exam Assistant & Cognitive Authoring Studio Suite', () => {
  const operatorId = 'usr-operator-sunita';
  const operatorName = 'Sunita Verma';

  beforeEach(() => {
    // Fresh setup if needed
  });

  describe('1. AI Exam Assistant Session Lifecycle & Telemetry', () => {
    it('Should fetch existing sessions and initialize initial workspace if empty', () => {
      const sessions = aiExamAssistantService.getSessions(operatorId);
      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBeGreaterThanOrEqual(1);

      const activeSession = sessions[0];
      expect(activeSession.operatorId).toBe(operatorId);
      expect(activeSession.messages.length).toBeGreaterThan(0);
    });

    it('Should create, rename, and delete authoring sessions reliably', () => {
      const created = aiExamAssistantService.createSession(operatorId, 'Test SSC CGL Quants Workspace');
      expect(created.id).toBeDefined();
      expect(created.title).toBe('Test SSC CGL Quants Workspace');

      // Rename
      const renamed = aiExamAssistantService.renameSession(created.id, 'Renamed SSC CGL Tier-1 Workspace');
      expect(renamed).toBe(true);
      const fetched = aiExamAssistantService.getSessionById(created.id);
      expect(fetched?.title).toBe('Renamed SSC CGL Tier-1 Workspace');

      // Delete
      const deleted = aiExamAssistantService.deleteSession(created.id);
      expect(deleted).toBe(true);
      expect(aiExamAssistantService.getSessionById(created.id)).toBeNull();
    });

    it('Should purge conversation messages while preserving session shell', () => {
      const created = aiExamAssistantService.createSession(operatorId, 'Temporary Chat to Purge');
      expect(created.messages.length).toBeGreaterThan(0);

      const cleared = aiExamAssistantService.clearSessionMessages(created.id);
      expect(cleared).toBe(true);
      const fetched = aiExamAssistantService.getSessionById(created.id);
      expect(fetched?.messages.length).toBe(1);
      expect(fetched?.messages[0].sender).toBe('SYSTEM');

      // Cleanup
      aiExamAssistantService.deleteSession(created.id);
    });
  });

  describe('2. Multi-Domain Cognitive Prompt Synthesis & Structured Drafts', () => {
    it('Should synthesize high-yield Mathematics questions with options and pedagogical proofs', async () => {
      const session = aiExamAssistantService.createSession(operatorId, 'Math Studio');
      const response = await aiExamAssistantService.sendPrompt(
        session.id, 
        'Create 5 Quantitative Aptitude questions on Time & Work with formula derivations'
      );

      expect(response.sender).toBe('AI');
      expect(response.structuredData).toBeDefined();
      expect(response.structuredData?.type).toBe('QUESTIONS_DRAFT');

      const items = response.structuredData?.payload;
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);

      const q = items[0];
      expect(q.questionText).toBeDefined();
      expect(q.options.length).toBe(4);
      expect(q.options.some((o: any) => o.isCorrect)).toBe(true);
      expect(q.correctAnswer).toBeDefined();
      expect(q.explanation).toBeDefined();
      expect(q.qualityCheck?.ambiguityScore).toBeDefined();

      aiExamAssistantService.deleteSession(session.id);
    });

    it('Should synthesize NCERT General Science questions with SI units and bilingual derivations', async () => {
      const session = aiExamAssistantService.createSession(operatorId, 'Science Studio');
      const response = await aiExamAssistantService.sendPrompt(
        session.id, 
        'Create 5 CHS Class 9 Science questions on Force and Pressure'
      );

      expect(response.sender).toBe('AI');
      expect(response.structuredData?.type).toBe('QUESTIONS_DRAFT');
      const q = response.structuredData?.payload[0];
      expect(q.subject).toBe('General Science');
      expect(q.topic).toBe('Force and Pressure');
      expect(q.questionText).toContain('force');
      expect(q.explanation).toMatch(/Newton|न्यूटन|10 \\text\{ N\}/);

      aiExamAssistantService.deleteSession(session.id);
    });

    it('Should synthesize Indian Constitution & Polity questions with official amendments', async () => {
      const session = aiExamAssistantService.createSession(operatorId, 'Polity Studio');
      const response = await aiExamAssistantService.sendPrompt(
        session.id, 
        'Generate questions on Indian Polity and Constitutional Amendments'
      );

      expect(response.sender).toBe('AI');
      expect(response.structuredData?.type).toBe('QUESTIONS_DRAFT');
      const q = response.structuredData?.payload[0];
      expect(q.subject).toBe('General Awareness');
      expect(q.topic).toContain('Constitution');
      expect(q.questionText).toContain('Amendment');

      aiExamAssistantService.deleteSession(session.id);
    });

    it('Should synthesize Assertion-Reason questions with dual-statement causal validation', async () => {
      const session = aiExamAssistantService.createSession(operatorId, 'Assertion Reason Studio');
      const response = await aiExamAssistantService.sendPrompt(
        session.id, 
        'Generate Assertion-Reason questions on Ecology and Photosynthesis'
      );

      expect(response.sender).toBe('AI');
      expect(response.structuredData?.type).toBe('QUESTIONS_DRAFT');
      const q = response.structuredData?.payload[0];
      expect(q.questionText).toContain('Assertion (A)');
      expect(q.questionText).toContain('Reason (R)');
      expect(q.options.length).toBe(4);

      aiExamAssistantService.deleteSession(session.id);
    });

    it('Should synthesize Full Mock Paper blueprints adhering to official patterns', async () => {
      const session = aiExamAssistantService.createSession(operatorId, 'Mock Test Studio');
      const response = await aiExamAssistantService.sendPrompt(
        session.id, 
        'Generate a 50-question UP PET mock test draft following the official pattern'
      );

      expect(response.sender).toBe('AI');
      expect(response.structuredData?.type).toBe('MOCK_PAPER_DRAFT');
      const paper = response.structuredData?.payload;
      expect(paper.title).toContain('UP PET');
      expect(paper.totalQuestions).toBe(50);
      expect(paper.sampleQuestions.length).toBeGreaterThan(0);

      aiExamAssistantService.deleteSession(session.id);
    });

    it('Should audit active questions for ambiguity and distractor overlap', async () => {
      const session = aiExamAssistantService.createSession(operatorId, 'Audit Studio');
      const response = await aiExamAssistantService.sendPrompt(
        session.id, 
        'Check my questions for ambiguity and duplicate distractors'
      );

      expect(response.sender).toBe('AI');
      expect(response.structuredData?.type).toBe('QUALITY_REPORT');
      const report = response.structuredData?.payload;
      expect(report.confidence).toBeGreaterThan(95);
      expect(report.duplicateCount).toBe(0);

      aiExamAssistantService.deleteSession(session.id);
    });

    it('Should generate bilingual Hindi Devanagari explanations and formulas', async () => {
      const session = aiExamAssistantService.createSession(operatorId, 'Hindi Studio');
      const response = await aiExamAssistantService.sendPrompt(
        session.id, 
        'Explain the percentage increase/decrease formula in simple Hindi'
      );

      expect(response.sender).toBe('AI');
      expect(response.structuredData?.type).toBe('EXPLANATION');
      expect(response.text).toMatch(/सरल व्याख्या|Hindi Explanation/);

      aiExamAssistantService.deleteSession(session.id);
    });
  });

  describe('3. Cognitive Question Refinement Tools', () => {
    const sampleQuestion: QuestionItem = {
      id: 'test-refine-q-1',
      examId: 'exam-up-pet',
      examName: 'UP PET',
      subject: 'Elementary Arithmetic',
      topic: 'Percentage',
      difficulty: 'MEDIUM',
      questionType: 'MCQ',
      questionText: 'Two pipes operate simultaneously and subordinate to pressure.',
      options: [
        { id: 'opt_1', text: '10 hrs', isCorrect: true },
        { id: 'opt_2', text: '12 hrs', isCorrect: false },
        { id: 'opt_3', text: '14 hrs', isCorrect: false },
        { id: 'opt_4', text: '16 hrs', isCorrect: false }
      ],
      correctAnswer: '10 hrs',
      explanation: 'Basic rate formula applied.',
      marks: 2,
      negativeMarks: 0.5,
      language: 'English',
      source: 'AI_GENERATED',
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    it('Should simplify complex vocabulary for elementary grade comprehension', async () => {
      const res = await aiExamAssistantService.refineQuestion(sampleQuestion, 'SIMPLIFY');
      expect(res.difficulty).toBe('EASY');
      expect(res.refinedText).toContain('at the same time');
      expect(res.feedback).toContain('simplified');
    });

    it('Should elevate question cognitive complexity to advanced tier', async () => {
      const res = await aiExamAssistantService.refineQuestion(sampleQuestion, 'MAKE_HARDER');
      expect(res.difficulty).toBe('HARD');
      expect(res.refinedText).toContain('evaporation leakage');
    });

    it('Should generate step-by-step mathematical proof and explanation', async () => {
      const res = await aiExamAssistantService.refineQuestion(sampleQuestion, 'GENERATE_EXPLANATION');
      expect(res.explanation).toContain('Step-by-step Mathematical Proof');
    });

    it('Should generate bilingual Hindi translation wrapper', async () => {
      const res = await aiExamAssistantService.refineQuestion(sampleQuestion, 'TRANSLATE_HINDI');
      expect(res.refinedText).toContain('(हिन्दी अनुवाद)');
    });
  });

  describe('4. Store Synchronization: Master Question Bank & Mock Test Command Center', () => {
    it('Should save AI-synthesized question directly into mockStore question bank', () => {
      const newQuestionId = `qb-ai-test-${Date.now()}`;
      const itemToCommit: QuestionItem = {
        id: newQuestionId,
        examId: 'exam-up-pet',
        examName: 'UP PET',
        subject: 'Elementary Arithmetic',
        topic: 'Percentage & Ratios',
        difficulty: 'MEDIUM',
        questionType: 'MCQ',
        questionText: 'What is 25% of 800 added to 15% of 400?',
        options: [
          { id: 'opt_1', text: '260', isCorrect: true },
          { id: 'opt_2', text: '240', isCorrect: false },
          { id: 'opt_3', text: '280', isCorrect: false },
          { id: 'opt_4', text: '300', isCorrect: false }
        ],
        correctAnswer: '260',
        explanation: '(0.25 * 800) + (0.15 * 400) = 200 + 60 = 260.',
        marks: 2,
        negativeMarks: 0.5,
        language: 'Bilingual (Hindi + English)',
        source: 'AI_GENERATED',
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockStore.saveQuestion(itemToCommit);

      const bank = mockStore.getQuestionBank();
      const persisted = bank.find(q => q.id === newQuestionId);
      expect(persisted).toBeDefined();
      expect(persisted?.questionText).toBe('What is 25% of 800 added to 15% of 400?');
      expect(persisted?.source).toBe('AI_GENERATED');
    });

    it('Should convert AI mock paper blueprint directly into mockStore Mock Test repository', () => {
      const testId = `mock-ai-test-${Date.now()}`;
      const testToCreate: MockTest = {
        id: testId,
        examId: 'exam-up-pet',
        examName: 'UP PET',
        title: 'UP PET 2026 AI-Calibrated Practice Drill',
        description: 'Auto-calibrated paper following UPSSSC PET 2026 official pattern.',
        isFullMock: true,
        durationMinutes: 60,
        totalQuestions: 50,
        totalMarks: 100,
        negativeMarkingPerQuestion: 0.25,
        passingMarks: 40,
        difficulty: 'MIXED',
        status: 'PUBLISHED',
        questionIds: ['qb-001', 'qb-002'],
        attemptCount: 0,
        createdAt: new Date().toISOString()
      };

      const created = mockStore.createMockTest(testToCreate);
      expect(created).toBeDefined();

      const allMockTests = mockStore.getMockTests();
      const found = allMockTests.find(m => m.id === created.id || m.title === testToCreate.title);
      expect(found).toBeDefined();
      expect(found?.title).toBe('UP PET 2026 AI-Calibrated Practice Drill');
      expect(found?.status).toBe('PUBLISHED');
    });

    it('Should log operator activity with valid entity fields for audit compliance', async () => {
      const log = await operatorService.logActivity({
        operatorId,
        operatorName,
        action: 'AI_QUESTION_APPROVE',
        entity: 'QUESTION',
        entityId: 'qb-ai-test-sample',
        entityTitle: 'UP PET Arithmetic Percentage Item',
        details: 'Operator approved AI question into Master Question Bank'
      });

      expect(log).toBeDefined();
      expect(log.action).toBe('AI_QUESTION_APPROVE');
      expect(log.entity).toBe('QUESTION');
      expect(log.operatorId).toBe(operatorId);
    });
  });
});
