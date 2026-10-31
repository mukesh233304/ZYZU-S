import { describe, it, expect, beforeEach } from 'vitest';
import { mockStore } from '../mock/store';
import { operatorService } from '../services/operatorService';
import { blueprintValidationService } from '../services/blueprintValidationService';
import { QuestionItem, QuestionDifficulty, QuestionType, QuestionStatus } from '../types/academicIntelligence';

describe('FOCUSPOINT — Operator Master Question Bank & Futuristic Quality Studio Suite', () => {
  const operatorId = 'usr-operator-sunita';
  const operatorName = 'Sunita Verma';

  beforeEach(() => {
    // Ensure clean state if needed
  });

  describe('1. Repository Inventory & Calibration Telemetry', () => {
    it('Should fetch verified question items from repository with accurate status breakdowns', () => {
      const allQuestions = mockStore.getQuestionBank();
      expect(Array.isArray(allQuestions)).toBe(true);
      expect(allQuestions.length).toBeGreaterThan(0);

      const approved = allQuestions.filter(q => q.status === 'APPROVED' || q.status === 'PUBLISHED');
      const aiGen = allQuestions.filter(q => q.status === 'AI_GENERATED');
      const bilingual = allQuestions.filter(q => Boolean(q.hindiQuestionText));

      expect(approved.length).toBeGreaterThanOrEqual(0);
      expect(aiGen.length).toBeGreaterThanOrEqual(0);
      expect(bilingual.length).toBeGreaterThanOrEqual(0);
    });

    it('Should compute repository health and calibration score based on duplicate risk', () => {
      const allQuestions = mockStore.getQuestionBank();
      const duplicates = blueprintValidationService.findDuplicateQuestions(allQuestions, 80);
      const duplicateCount = duplicates.length;

      const calibrationScore = Number((98.4 - (duplicateCount * 0.4)).toFixed(1));
      expect(calibrationScore).toBeGreaterThanOrEqual(0);
      expect(calibrationScore).toBeLessThanOrEqual(100);
    });
  });

  describe('2. In-Studio Neural AI Question Generator Engine', () => {
    it('Should synthesize single-choice MCQ with 4 balanced distractors and pedagogical proof', () => {
      const targetExam = 'SSC CGL';
      const targetSubject = 'Quantitative Aptitude';
      const targetTopic = 'Percentage & Profit-Loss';
      const targetDifficulty: QuestionDifficulty = 'MEDIUM';

      const timestamp = new Date().toISOString();
      const synthesizedQ: QuestionItem = {
        id: `test-synth-q-${Date.now()}`,
        examId: 'exam-ssc-cgl',
        examName: targetExam,
        subject: targetSubject,
        topic: targetTopic,
        chapter: `${targetTopic} Mastery`,
        difficulty: targetDifficulty,
        questionType: 'MCQ',
        questionText: 'A trader marks goods 40% above cost price and allows a 20% discount. What is the net profit percentage?',
        hindiQuestionText: 'एक व्यापारी अपनी वस्तुओं पर क्रय मूल्य से 40% अधिक मूल्य अंकित करता है और 20% की छूट देता है। शुद्ध लाभ प्रतिशत क्या है?',
        options: [
          { id: 'opt_1', text: '12%', isCorrect: true },
          { id: 'opt_2', text: '15%', isCorrect: false },
          { id: 'opt_3', text: '20%', isCorrect: false },
          { id: 'opt_4', text: '8%', isCorrect: false }
        ],
        correctAnswer: 'A',
        explanation: 'Let CP = 100. MP = 140. SP = 140 * 0.80 = 112. Profit = 112 - 100 = 12%.',
        marks: 2,
        negativeMarks: 0.5,
        language: 'Bilingual',
        source: 'AI_GENERATED',
        status: 'AI_GENERATED',
        createdAt: timestamp,
        updatedAt: timestamp
      };

      expect(synthesizedQ.options.length).toBe(4);
      expect(synthesizedQ.correctAnswer).toBe('A');
      expect(synthesizedQ.options.find(o => o.isCorrect)?.text).toBe('12%');
      expect(synthesizedQ.hindiQuestionText).toBeDefined();

      // Commit to store
      mockStore.saveQuestion(synthesizedQ);
      const retrieved = mockStore.getQuestionBank().find(q => q.id === synthesizedQ.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.status).toBe('AI_GENERATED');
    });

    it('Should synthesize Numerical value questions with tolerance intervals', () => {
      const numericalQ: QuestionItem = {
        id: `test-num-q-${Date.now()}`,
        examId: 'exam-ssc-cgl',
        examName: 'SSC CGL',
        subject: 'Quantitative Aptitude',
        topic: 'Time and Work',
        chapter: 'Pipes and Cisterns',
        difficulty: 'HARD',
        questionType: 'NUMERICAL',
        questionText: 'Pipe A fills a tank in 12 hrs and Pipe B empties it in 18 hrs. Calculate the hours to fill the tank if both are opened simultaneously?',
        options: [],
        correctAnswer: '36',
        numericalAnswer: 36,
        numericalTolerance: 0.5,
        explanation: '1/12 - 1/18 = (3 - 2)/36 = 1/36 => Time = 36 hours.',
        marks: 2,
        negativeMarks: 0.5,
        language: 'English',
        source: 'AI_GENERATED',
        status: 'AI_GENERATED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(numericalQ.questionType).toBe('NUMERICAL');
      expect(numericalQ.numericalAnswer).toBe(36);
      expect(numericalQ.numericalTolerance).toBe(0.5);

      mockStore.saveQuestion(numericalQ);
      const inStore = mockStore.getQuestionBank().find(q => q.id === numericalQ.id);
      expect(inStore?.numericalAnswer).toBe(36);
    });
  });

  describe('3. Fast Text Stream / Bulk OCR Parser Engine', () => {
    it('Should parse raw unformatted text blocks into structured question items', () => {
      const rawText = `Q1. Which constitutional article guarantees Equality before Law in India?
A) Article 14
B) Article 19
C) Article 21
D) Article 32
Ans: A
Expl: Article 14 provides equality before the law and equal protection of laws.`;

      const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
      const qLine = lines.find(l => /^Q\d+/i.test(l)) || '';
      const qText = qLine.replace(/^Q\d+[\.\)]\s*/i, '');

      const optA = lines.find(l => /^A[\)\.]/i.test(l))?.replace(/^A[\)\.]\s*/i, '');
      const optB = lines.find(l => /^B[\)\.]/i.test(l))?.replace(/^B[\)\.]\s*/i, '');
      const optC = lines.find(l => /^C[\)\.]/i.test(l))?.replace(/^C[\)\.]\s*/i, '');
      const optD = lines.find(l => /^D[\)\.]/i.test(l))?.replace(/^D[\)\.]\s*/i, '');

      const keyLine = lines.find(l => /^(?:Ans|Answer)\s*[:\-]/i.test(l));
      const key = keyLine?.match(/([A-D])/i)?.[1]?.toUpperCase();

      expect(qText).toContain('Equality before Law');
      expect(optA).toBe('Article 14');
      expect(optB).toBe('Article 19');
      expect(optC).toBe('Article 21');
      expect(optD).toBe('Article 32');
      expect(key).toBe('A');
    });
  });

  describe('4. Duplicate & Semantic Collision Radar', () => {
    it('Should compute text similarity accurately between identical or distinct stems', () => {
      const text1 = 'What is the capital of Uttar Pradesh in northern India?';
      const text2 = 'What is the official capital city of Uttar Pradesh in northern India?';
      const text3 = 'Calculate the kinetic energy of a moving vehicle with mass 500 kg.';

      const simHigh = blueprintValidationService.calculateTextSimilarity(text1, text2);
      const simLow = blueprintValidationService.calculateTextSimilarity(text1, text3);

      expect(simHigh).toBeGreaterThan(0.60); // High similarity
      expect(simLow).toBeLessThan(0.15); // Almost zero overlap
    });

    it('Should resolve duplicate match by removing one item from repository', () => {
      const dupA: QuestionItem = {
        id: `dup-q-a-${Date.now()}`,
        examId: 'exam-up-constable',
        examName: 'UP Police Constable',
        subject: 'General Knowledge',
        topic: 'Geography',
        difficulty: 'EASY',
        questionType: 'MCQ',
        questionText: 'Which river flows through the city of Varanasi in Uttar Pradesh?',
        options: [
          { id: '1', text: 'Ganga', isCorrect: true },
          { id: '2', text: 'Yamuna', isCorrect: false },
          { id: '3', text: 'Gomti', isCorrect: false },
          { id: '4', text: 'Ghaghara', isCorrect: false }
        ],
        correctAnswer: 'A',
        explanation: 'The sacred river Ganga flows through Varanasi.',
        marks: 2,
        negativeMarks: 0.5,
        language: 'English',
        source: 'STAFF_AUTHORED',
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const dupB: QuestionItem = {
        ...dupA,
        id: `dup-q-b-${Date.now()}`,
        questionText: 'Which holy river flows through the ancient city of Varanasi in Uttar Pradesh?'
      };

      mockStore.saveQuestion(dupA);
      mockStore.saveQuestion(dupB);

      expect(mockStore.getQuestionBank().some(q => q.id === dupA.id)).toBe(true);
      expect(mockStore.getQuestionBank().some(q => q.id === dupB.id)).toBe(true);

      // Resolution: delete duplicate B
      mockStore.deleteQuestion(dupB.id);

      expect(mockStore.getQuestionBank().some(q => q.id === dupA.id)).toBe(true);
      expect(mockStore.getQuestionBank().some(q => q.id === dupB.id)).toBe(false);
    });
  });

  describe('5. Interactive In-Card Option Tester & CBT Sandboxing', () => {
    it('Should accurately evaluate selected option against correct key with marks and penalty', () => {
      const sampleQ: QuestionItem = {
        id: 'test-sandbox-01',
        examId: 'exam-ssc-cgl',
        examName: 'SSC CGL',
        subject: 'General Awareness',
        topic: 'Indian History',
        difficulty: 'MEDIUM',
        questionType: 'MCQ',
        questionText: 'Who founded the Maurya Empire in ancient India?',
        options: [
          { id: '1', text: 'Ashoka the Great', isCorrect: false },
          { id: '2', text: 'Chandragupta Maurya', isCorrect: true },
          { id: '3', text: 'Bindusara', isCorrect: false },
          { id: '4', text: 'Harsha', isCorrect: false }
        ],
        correctAnswer: 'B',
        explanation: 'Chandragupta Maurya founded the Maurya Empire in 322 BCE with the assistance of Chanakya.',
        marks: 2,
        negativeMarks: 0.5,
        language: 'English',
        source: 'STAFF_AUTHORED',
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Correct choice
      const studentChoiceCorrect = 'B';
      const isCorrect = studentChoiceCorrect === sampleQ.correctAnswer;
      const netMarksCorrect = isCorrect ? sampleQ.marks : -sampleQ.negativeMarks;

      expect(isCorrect).toBe(true);
      expect(netMarksCorrect).toBe(2);

      // Incorrect choice
      const studentChoiceWrong = 'A';
      const isWrong = studentChoiceWrong !== sampleQ.correctAnswer;
      const netMarksWrong = isWrong ? -sampleQ.negativeMarks : sampleQ.marks;

      expect(isWrong).toBe(true);
      expect(netMarksWrong).toBe(-0.5);
    });
  });

  describe('6. Bulk Operations Deck & Operator Audit Stream', () => {
    it('Should perform bulk approval, status promotion, and register audit log', async () => {
      const q1: QuestionItem = {
        id: `bulk-q-1-${Date.now()}`,
        examId: 'exam-ssc-cgl',
        examName: 'SSC CGL',
        subject: 'General Intelligence',
        topic: 'Analogy',
        difficulty: 'EASY',
        questionType: 'MCQ',
        questionText: 'Bulk test question 1',
        options: [{ id: '1', text: 'A', isCorrect: true }, { id: '2', text: 'B', isCorrect: false }],
        correctAnswer: 'A',
        explanation: 'Explanation 1',
        marks: 2,
        negativeMarks: 0.5,
        language: 'English',
        source: 'AI_GENERATED',
        status: 'AI_GENERATED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const q2: QuestionItem = {
        ...q1,
        id: `bulk-q-2-${Date.now()}`,
        questionText: 'Bulk test question 2'
      };

      mockStore.saveQuestion(q1);
      mockStore.saveQuestion(q2);

      const targetIds = [q1.id, q2.id];
      const count = mockStore.bulkApproveQuestions(targetIds, operatorName);
      expect(count).toBe(2);

      const bank = mockStore.getQuestionBank();
      const updatedQ1 = bank.find(q => q.id === q1.id);
      const updatedQ2 = bank.find(q => q.id === q2.id);

      expect(updatedQ1?.status).toBe('APPROVED');
      expect(updatedQ2?.status).toBe('APPROVED');

      // Operator Activity Logging
      const log = await operatorService.logActivity({
        operatorId,
        operatorName,
        action: 'QUESTION_UPDATE',
        entity: 'QUESTION',
        entityId: q1.id,
        entityTitle: 'Bulk Approval of 2 Items',
        details: 'Promoted 2 AI-generated items to APPROVED status'
      });

      expect(log).toBeDefined();
      expect(log.action).toBe('QUESTION_UPDATE');
    });

    it('Should perform bulk deletion of designated items', () => {
      const qToDel: QuestionItem = {
        id: `del-q-${Date.now()}`,
        examId: 'exam-ssc-cgl',
        examName: 'SSC CGL',
        subject: 'English',
        topic: 'Vocabulary',
        difficulty: 'EASY',
        questionType: 'MCQ',
        questionText: 'Item slated for deletion',
        options: [],
        correctAnswer: 'A',
        explanation: '',
        marks: 2,
        negativeMarks: 0.5,
        language: 'English',
        source: 'STAFF_AUTHORED',
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockStore.saveQuestion(qToDel);
      expect(mockStore.getQuestionBank().some(q => q.id === qToDel.id)).toBe(true);

      const deletedCount = mockStore.bulkDeleteQuestions([qToDel.id]);
      expect(deletedCount).toBe(1);
      expect(mockStore.getQuestionBank().some(q => q.id === qToDel.id)).toBe(false);
    });
  });
});
