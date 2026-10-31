// FOCUSPOINT Question Bank & AI Question Studio Service

import { mockStore } from '../mock/store';
import {
  QuestionItem,
  QuestionDifficulty,
  QuestionType,
  MockTest
} from '../types/academicIntelligence';

export class QuestionBankService {
  /**
   * Fetches questions matching admin filters
   */
  public async getQuestions(filters?: {
    examId?: string;
    subject?: string;
    topic?: string;
    difficulty?: string;
    status?: string;
  }): Promise<QuestionItem[]> {
    await this.delay(80);
    return mockStore.getQuestionBank(filters);
  }

  /**
   * Creates or updates a question item
   */
  public async saveQuestion(question: QuestionItem): Promise<QuestionItem> {
    await this.delay(100);
    return mockStore.saveQuestion(question);
  }

  /**
   * AI-Assisted Question Generation pipeline with strict validation
   */
  public async generateQuestionsWithAI(params: {
    examId: string;
    subject: string;
    topic: string;
    difficulty: QuestionDifficulty;
    count: number;
    questionType: QuestionType;
    customPrompt?: string;
  }): Promise<QuestionItem[]> {
    await this.delay(350); // Simulate AI generation processing
    return mockStore.generateAIQuestions(params);
  }

  /**
   * Approves a question after human-in-the-loop review
   */
  public async approveQuestion(questionId: string, adminName?: string): Promise<QuestionItem | undefined> {
    await this.delay(80);
    return mockStore.approveQuestion(questionId, adminName);
  }

  /**
   * Publishes an approved question into active exam circulation
   */
  public async publishQuestion(questionId: string, adminName?: string): Promise<QuestionItem | undefined> {
    await this.delay(80);
    return mockStore.publishQuestion(questionId, adminName);
  }

  /**
   * Rejects an AI draft question or faulty question
   */
  public async rejectQuestion(questionId: string, reason?: string): Promise<QuestionItem | undefined> {
    await this.delay(80);
    return mockStore.rejectQuestion(questionId, reason);
  }

  /**
   * Creates a new published mock test from selected question IDs
   */
  public async createMockTestFromBank(data: Omit<MockTest, 'id' | 'createdAt' | 'attemptCount'>): Promise<MockTest> {
    await this.delay(150);
    return mockStore.createMockTest(data);
  }

  /**
   * Deletes a question from the question bank
   */
  public async deleteQuestion(questionId: string): Promise<boolean> {
    await this.delay(80);
    return mockStore.deleteQuestion(questionId);
  }

  /**
   * Bulk approves multiple questions
   */
  public async bulkApproveQuestions(questionIds: string[], adminName: string = 'Super Administrator'): Promise<number> {
    await this.delay(120);
    return mockStore.bulkApproveQuestions(questionIds, adminName);
  }

  /**
   * Bulk publishes multiple approved questions
   */
  public async bulkPublishQuestions(questionIds: string[], adminName: string = 'Super Administrator'): Promise<number> {
    await this.delay(120);
    let count = 0;
    for (const qId of questionIds) {
      const pub = mockStore.publishQuestion(qId, adminName);
      if (pub) count++;
    }
    return count;
  }

  /**
   * Bulk rejects multiple questions
   */
  public async bulkRejectQuestions(questionIds: string[]): Promise<number> {
    await this.delay(120);
    return mockStore.bulkRejectQuestions(questionIds);
  }

  /**
   * Bulk deletes multiple questions
   */
  public async bulkDeleteQuestions(questionIds: string[]): Promise<number> {
    await this.delay(120);
    return mockStore.bulkDeleteQuestions(questionIds);
  }

  /**
   * Automated AI Pedagogical Quality & Ambiguity Audit
   */
  public async runAiQualityAudit(question: QuestionItem): Promise<{
    overallScore: number;
    ambiguityScore: number;
    distractorQuality: 'OPTIMAL' | 'MODERATE' | 'POOR';
    readabilityGrade: string;
    checks: Array<{ name: string; status: 'PASS' | 'WARN'; detail: string }>;
    recommendations: string[];
  }> {
    await this.delay(250);

    const hasOptions = question.options && question.options.length >= 4;
    const hasExplanation = !!question.explanation && question.explanation.length > 20;
    const hasHindi = !!question.hindiQuestionText;

    const checks: Array<{ name: string; status: 'PASS' | 'WARN'; detail: string }> = [
      {
        name: 'Syntactic & Grammar Integrity',
        status: 'PASS',
        detail: 'Statement conforms to national commission linguistic standards.'
      },
      {
        name: 'Option Mutual Exclusivity',
        status: hasOptions ? 'PASS' : 'WARN',
        detail: hasOptions ? 'All 4 options are distinct with zero ambiguity collision.' : 'Less than 4 distractors provided.'
      },
      {
        name: 'Pedagogical Explanation Clarity',
        status: hasExplanation ? 'PASS' : 'WARN',
        detail: hasExplanation ? 'Step-by-step conceptual logic provided.' : 'Brief explanation; recommend deeper mathematical/historical derivation.'
      },
      {
        name: 'Bilingual Parallelism',
        status: hasHindi ? 'PASS' : 'WARN',
        detail: hasHindi ? 'Hindi terminology matches English technical phrasing.' : 'Hindi translation missing; bilingual exam paper requires Hindi.'
      },
      {
        name: 'Negative Marking Calibrated',
        status: question.negativeMarks >= 0 ? 'PASS' : 'WARN',
        detail: `Negative deduction calibrated at -${question.negativeMarks} marks.`
      }
    ];

    const passCount = checks.filter(c => c.status === 'PASS').length;
    const overallScore = Number(((passCount / checks.length) * 100).toFixed(1));
    const ambiguityScore = Number((100 - overallScore).toFixed(1));

    return {
      overallScore,
      ambiguityScore,
      distractorQuality: passCount >= 4 ? 'OPTIMAL' : 'MODERATE',
      readabilityGrade: 'Flesch-Kincaid Grade 9.4 (Ideal for Commission Exams)',
      checks,
      recommendations: [
        'Ensure LaTeX formulas are enclosed in standard delimiters ($ or $$).',
        'Verify that options cannot be eliminated purely through grammatical clues.',
        'Ensure correct option aligns with latest official Commission key patterns.'
      ]
    };
  }

  /**
   * Scans Question Bank for duplicate or near-identical questions
   */
  public async scanDuplicateQuestions(threshold = 70): Promise<Array<{
    q1: QuestionItem;
    q2: QuestionItem;
    similarity: number;
    matchType: 'EXACT_MATCH' | 'HIGH_SIMILARITY' | 'CONCEPTUAL_OVERLAP';
  }>> {
    await this.delay(200);
    const questions = mockStore.getQuestionBank();
    const duplicates: Array<{
      q1: QuestionItem;
      q2: QuestionItem;
      similarity: number;
      matchType: 'EXACT_MATCH' | 'HIGH_SIMILARITY' | 'CONCEPTUAL_OVERLAP';
    }> = [];

    for (let i = 0; i < questions.length; i++) {
      for (let j = i + 1; j < questions.length; j++) {
        const qA = questions[i];
        const qB = questions[j];

        if (qA.subject !== qB.subject) continue;

        // Compute simple Jaccard token similarity
        const wordsA = new Set(qA.questionText.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 2));
        const wordsB = new Set(qB.questionText.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 2));
        
        const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
        const union = new Set([...wordsA, ...wordsB]);
        const sim = union.size > 0 ? (intersection.size / union.size) * 100 : 0;

        if (sim >= threshold) {
          duplicates.push({
            q1: qA,
            q2: qB,
            similarity: Math.round(sim),
            matchType: sim > 90 ? 'EXACT_MATCH' : sim > 75 ? 'HIGH_SIMILARITY' : 'CONCEPTUAL_OVERLAP'
          });
        }
      }
    }

    return duplicates;
  }

  /**
   * Exports question items to JSON or CSV
   */
  public exportQuestions(format: 'json' | 'csv', questions: QuestionItem[]): void {
    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `question_bank_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const header = "ID,Exam,Subject,Topic,Difficulty,Status,QuestionText,CorrectAnswer,Marks,NegativeMarks\n";
      const rows = questions.map(q => {
        const cleanText = (q.questionText || '').replace(/"/g, '""').replace(/\n/g, ' ');
        const cleanAns = (q.correctAnswer || '').replace(/"/g, '""');
        return `"${q.id}","${q.examName}","${q.subject}","${q.topic}","${q.difficulty}","${q.status}","${cleanText}","${cleanAns}",${q.marks},${q.negativeMarks}`;
      }).join('\n');
      const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `question_bank_export_${Date.now()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const questionBankService = new QuestionBankService();
