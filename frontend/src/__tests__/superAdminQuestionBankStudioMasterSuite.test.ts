import { describe, it, expect, beforeEach } from 'vitest';
import { questionBankService } from '../services/questionBankService';
import { mockStore } from '../mock/store';
import { QuestionItem } from '../types/academicIntelligence';

describe('FOCUSPOINT — Super Admin Question Bank & AI Studio Master Test Suite', () => {
  beforeEach(() => {
    // Re-seed mock store if needed
  });

  describe('1. Question Bank Repository & Filtering', () => {
    it('retrieves questions and filters by exam, subject, and difficulty', async () => {
      const allQuestions = await questionBankService.getQuestions();
      expect(allQuestions.length).toBeGreaterThan(0);

      const first = allQuestions[0];
      expect(first.id).toBeDefined();
      expect(first.questionText).toBeDefined();
      expect(first.options.length).toBeGreaterThanOrEqual(2);
      expect(first.correctAnswer).toBeDefined();

      // Filter by status if available
      const approvedOnly = await questionBankService.getQuestions({ status: 'APPROVED' });
      approvedOnly.forEach(q => {
        expect(q.status).toBe('APPROVED');
      });
    });
  });

  describe('2. AI Question Generation Pipeline (Rule 17)', () => {
    it('synthesizes questions via AI Studio requiring human-in-the-loop approval', async () => {
      const generated = await questionBankService.generateQuestionsWithAI({
        examId: 'ssc-cgl',
        subject: 'Quantitative Aptitude',
        topic: 'Percentage & Profit Loss',
        difficulty: 'MEDIUM',
        count: 2,
        questionType: 'MCQ',
        customPrompt: 'Focus on multi-step discounts'
      });

      expect(generated.length).toBe(2);
      generated.forEach(q => {
        expect(q.id).toBeDefined();
        expect(q.examId).toBe('ssc-cgl');
        expect(q.subject).toBe('Quantitative Aptitude');
        expect(q.status).toBe('AI_GENERATED'); // Must be AI_GENERATED per Rule 17!
        expect(q.options.length).toBe(4);
        expect(q.correctAnswer).toBeDefined();
        expect(q.explanation).toBeDefined();
      });
    });
  });

  describe('3. Human-in-the-Loop Review Lifecycle (Approve, Publish, Reject)', () => {
    it('approves AI draft question and updates audit metadata', async () => {
      const [aiItem] = await questionBankService.generateQuestionsWithAI({
        examId: 'ssc-cgl',
        subject: 'General Awareness',
        topic: 'Indian Constitution',
        difficulty: 'EASY',
        count: 1,
        questionType: 'MCQ'
      });

      expect(aiItem.status).toBe('AI_GENERATED');

      // Human review approves item
      const approved = await questionBankService.approveQuestion(aiItem.id, 'Super Admin Lead');
      expect(approved).toBeDefined();
      expect(approved!.status).toBe('APPROVED');
      expect(approved!.approvedBy).toBe('Super Admin Lead');

      // Publish item into active student mock test circulation
      const published = await questionBankService.publishQuestion(aiItem.id, 'Super Admin Lead');
      expect(published).toBeDefined();
      expect(published!.status).toBe('PUBLISHED');

      // Reject faulty question
      const rejected = await questionBankService.rejectQuestion(aiItem.id, 'Needs revised options');
      expect(rejected).toBeDefined();
      expect(rejected!.status).toBe('REJECTED');
    });
  });

  describe('4. Batch / Bulk Operations', () => {
    it('supports bulk approval, publishing, rejection, and deletion', async () => {
      // Generate 3 items
      const items = await questionBankService.generateQuestionsWithAI({
        examId: 'upsc-cse',
        subject: 'General Studies Paper I',
        topic: 'Modern History',
        difficulty: 'HARD',
        count: 3,
        questionType: 'MCQ'
      });

      const ids = items.map(q => q.id);

      // Bulk Approve
      const approveCount = await questionBankService.bulkApproveQuestions(ids, 'Dr. Academic Lead');
      expect(approveCount).toBe(3);

      // Verify approved state
      const postApproveList = await questionBankService.getQuestions();
      ids.forEach(id => {
        const found = postApproveList.find(q => q.id === id);
        expect(found?.status).toBe('APPROVED');
      });

      // Bulk Publish
      const publishCount = await questionBankService.bulkPublishQuestions(ids, 'Dr. Academic Lead');
      expect(publishCount).toBe(3);

      // Bulk Reject
      const rejectCount = await questionBankService.bulkRejectQuestions(ids);
      expect(rejectCount).toBe(3);

      // Bulk Delete
      const deleteCount = await questionBankService.bulkDeleteQuestions(ids);
      expect(deleteCount).toBe(3);

      const postDeleteList = await questionBankService.getQuestions();
      ids.forEach(id => {
        const found = postDeleteList.find(q => q.id === id);
        expect(found).toBeUndefined();
      });
    });
  });

  describe('5. AI Pedagogical Quality & Ambiguity Radar', () => {
    it('audits question for syntactic integrity, mutual exclusivity, and readability', async () => {
      const [testQ] = await questionBankService.getQuestions();
      const audit = await questionBankService.runAiQualityAudit(testQ);

      expect(audit.overallScore).toBeGreaterThanOrEqual(60);
      expect(audit.ambiguityScore).toBeDefined();
      expect(audit.distractorQuality).toBeDefined();
      expect(audit.readabilityGrade).toContain('Grade');
      expect(audit.checks.length).toBeGreaterThanOrEqual(4);
      expect(audit.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('6. Duplicate Question Detection Scanner', () => {
    it('scans question bank and flags textual overlap pairs', async () => {
      // Add two almost identical questions
      const baseQ: QuestionItem = {
        id: `dup-test-1-${Date.now()}`,
        examId: 'ssc-cgl',
        examName: 'SSC CGL',
        subject: 'Mathematics',
        topic: 'Simple Interest',
        difficulty: 'MEDIUM',
        questionType: 'MCQ',
        questionText: 'What is the simple interest on Rs 10000 at 10 percent per annum for 3 years?',
        options: [
          { id: 'A', text: 'Rs 3000', isCorrect: true },
          { id: 'B', text: 'Rs 2000', isCorrect: false },
          { id: 'C', text: 'Rs 4000', isCorrect: false },
          { id: 'D', text: 'Rs 2500', isCorrect: false }
        ],
        correctAnswer: 'A',
        explanation: 'SI = (P * R * T) / 100 = (10000 * 10 * 3) / 100 = 3000.',
        marks: 2,
        negativeMarks: 0.5,
        language: 'English',
        source: 'STAFF_AUTHORED',
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const cloneQ: QuestionItem = {
        ...baseQ,
        id: `dup-test-2-${Date.now()}`,
        questionText: 'What is the simple interest on Rs 10000 at 10 percent per annum for 3 years exactly?'
      };

      await questionBankService.saveQuestion(baseQ);
      await questionBankService.saveQuestion(cloneQ);

      const duplicates = await questionBankService.scanDuplicateQuestions(70);
      expect(duplicates.length).toBeGreaterThanOrEqual(1);

      const match = duplicates.find(d => 
        (d.q1.id === baseQ.id && d.q2.id === cloneQ.id) ||
        (d.q1.id === cloneQ.id && d.q2.id === baseQ.id)
      );

      expect(match).toBeDefined();
      expect(match!.similarity).toBeGreaterThanOrEqual(75);

      // Cleanup
      await questionBankService.deleteQuestion(baseQ.id);
      await questionBankService.deleteQuestion(cloneQ.id);
    });
  });

  describe('7. Manual Authoring & Persistence', () => {
    it('creates and updates a custom manual question in the question bank', async () => {
      const newQuestion: QuestionItem = {
        id: `custom-manual-${Date.now()}`,
        examId: 'rrb-ntpc',
        examName: 'Railway NTPC',
        subject: 'General Intelligence',
        topic: 'Blood Relations',
        difficulty: 'EASY',
        questionType: 'MCQ',
        questionText: 'Pointing to a photograph, a man says: She is the daughter of my grandfather only son. How is she related to the man?',
        hindiQuestionText: 'एक तस्वीर की ओर इशारा करते हुए एक व्यक्ति कहता है...',
        options: [
          { id: 'A', text: 'Sister', isCorrect: true },
          { id: 'B', text: 'Mother', isCorrect: false },
          { id: 'C', text: 'Daughter', isCorrect: false },
          { id: 'D', text: 'Aunt', isCorrect: false }
        ],
        correctAnswer: 'A',
        explanation: 'Grandfather only son is the man father. His daughter is the man sister.',
        marks: 1.5,
        negativeMarks: 0.5,
        language: 'English',
        source: 'STAFF_AUTHORED',
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const saved = await questionBankService.saveQuestion(newQuestion);
      expect(saved.id).toBe(newQuestion.id);

      const all = await questionBankService.getQuestions();
      const found = all.find(q => q.id === newQuestion.id);
      expect(found).toBeDefined();
      expect(found?.questionText).toBe(newQuestion.questionText);

      // Cleanup
      await questionBankService.deleteQuestion(newQuestion.id);
    });
  });
});
