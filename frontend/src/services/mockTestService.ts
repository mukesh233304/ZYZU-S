// FOCUSPOINT Government Exam & Mock Test Attempt Engine Service

import { mockStore } from '../mock/store';
import {
  GovernmentExam,
  MockTest,
  MockTestAttempt,
  QuestionItem,
  MockTestSeries,
  ExamTestCategoryConfig,
  TestCategoryType,
  CustomMockDrillRequest,
  CustomMockDrillRequestStatus
} from '../types/academicIntelligence';

export class MockTestService {
  /**
   * Retrieves active government exam categories & exams
   */
  public async getGovernmentExams(category?: string): Promise<GovernmentExam[]> {
    await this.delay(80);
    return mockStore.getGovernmentExams(category);
  }

  /**
   * Retrieves a single exam with pattern metadata
   */
  public async getGovernmentExamById(id: string): Promise<GovernmentExam | undefined> {
    await this.delay(50);
    return mockStore.getGovernmentExamById(id);
  }

  /**
   * Saves or updates a government exam profile
   */
  public async saveGovernmentExam(exam: GovernmentExam): Promise<GovernmentExam> {
    await this.delay(100);
    return mockStore.saveGovernmentExam(exam);
  }

  /**
   * Deletes a government exam profile
   */
  public async deleteGovernmentExam(id: string): Promise<boolean> {
    await this.delay(80);
    return mockStore.deleteGovernmentExam(id);
  }

  /**
   * Updates dynamic categories configuration for a specific exam
   */
  public async updateExamCategoriesConfig(examId: string, categories: ExamTestCategoryConfig[]): Promise<GovernmentExam | undefined> {
    await this.delay(80);
    return mockStore.updateExamCategoriesConfig(examId, categories);
  }

  /**
   * Fetches mock test series packages for an exam
   */
  public async getMockTestSeries(examId?: string): Promise<MockTestSeries[]> {
    await this.delay(70);
    return mockStore.getMockTestSeries(examId);
  }

  /**
   * Fetches a single test series package by id
   */
  public async getMockTestSeriesById(id: string): Promise<MockTestSeries | undefined> {
    await this.delay(50);
    return mockStore.getMockTestSeriesById(id);
  }

  /**
   * Saves or creates a mock test series
   */
  public async saveMockTestSeries(series: MockTestSeries): Promise<MockTestSeries> {
    await this.delay(100);
    return mockStore.saveMockTestSeries(series);
  }

  /**
   * Deletes a mock test series
   */
  public async deleteMockTestSeries(id: string): Promise<boolean> {
    await this.delay(80);
    return mockStore.deleteMockTestSeries(id);
  }

  /**
   * Smart automatic test assembly with difficulty % and subject quotas
   */
  public async smartAssembleMockTest(params: {
    examId: string;
    category?: TestCategoryType;
    totalQuestions: number;
    difficultyDistribution?: { easy: number; medium: number; hard: number };
    subjectDistribution?: Record<string, number>;
  }): Promise<{ questions: QuestionItem[]; selectedIds: string[] }> {
    await this.delay(90);
    return mockStore.smartAssembleMockTest(params);
  }

  /**
   * Fetches mock tests available for an exam
   */
  public async getMockTests(examId?: string): Promise<MockTest[]> {
    await this.delay(80);
    return mockStore.getMockTests(examId);
  }

  /**
   * Fetches mock test details
   */
  public async getMockTestById(id: string): Promise<MockTest | undefined> {
    await this.delay(50);
    return mockStore.getMockTestById(id);
  }

  /**
   * Creates a new mock test
   */
  public async createMockTest(data: Omit<MockTest, 'id' | 'createdAt' | 'attemptCount'>): Promise<MockTest> {
    await this.delay(80);
    return mockStore.createMockTest(data);
  }

  /**
   * Updates an existing mock test
   */
  public async updateMockTest(id: string, updates: Partial<MockTest>): Promise<MockTest | null> {
    await this.delay(80);
    return mockStore.updateMockTest(id, updates);
  }

  /**
   * Deletes a mock test
   */
  public async deleteMockTest(id: string): Promise<boolean> {
    await this.delay(80);
    return mockStore.deleteMockTest(id);
  }

  /**
   * Duplicates an existing mock test
   */
  public async duplicateMockTest(id: string, newTitle?: string): Promise<MockTest | null> {
    await this.delay(80);
    return mockStore.duplicateMockTest(id, newTitle);
  }

  /**
   * Bulk updates mock tests
   */
  public async bulkUpdateMockTests(ids: string[], updates: Partial<MockTest>): Promise<number> {
    await this.delay(100);
    return mockStore.bulkUpdateMockTests(ids, updates);
  }

  /**
   * Generates a custom quick or advanced practice mock test on the fly (Operator / Admin only)
   */
  public async generateCustomMockTest(params: {
    examId: string;
    examName: string;
    title?: string;
    subject?: string;
    topics?: string[];
    questionCount: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
    durationMinutes?: number;
    includePyqs?: boolean;
    negativeMarking?: number;
    isFullMock?: boolean;
  }, requestedByRole?: string): Promise<MockTest> {
    await this.delay(120);
    return mockStore.generateCustomMockTest(params, requestedByRole);
  }

  /**
   * Fetches custom mock drill requests submitted by students
   */
  public async getCustomMockRequests(studentId?: string): Promise<CustomMockDrillRequest[]> {
    await this.delay(70);
    return mockStore.getCustomMockRequests(studentId);
  }

  /**
   * Fetches a specific custom mock drill request by ID
   */
  public async getCustomMockRequestById(id: string): Promise<CustomMockDrillRequest | undefined> {
    await this.delay(50);
    return mockStore.getCustomMockRequestById(id);
  }

  /**
   * Submits a student custom mock drill request
   */
  public async submitCustomMockRequest(data: Omit<CustomMockDrillRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<CustomMockDrillRequest> {
    await this.delay(100);
    return mockStore.submitCustomMockRequest(data);
  }

  /**
   * Updates status / operator message on a custom mock drill request
   */
  public async updateCustomMockRequestStatus(
    id: string,
    status: CustomMockDrillRequestStatus,
    operatorMessage?: string,
    assignedOperatorId?: string,
    assignedOperatorName?: string,
    generatedMockTestId?: string
  ): Promise<CustomMockDrillRequest | null> {
    await this.delay(80);
    return mockStore.updateCustomMockRequestStatus(
      id,
      status,
      operatorMessage,
      assignedOperatorId,
      assignedOperatorName,
      generatedMockTestId
    );
  }

  /**
   * Operator creates / publishes a mock test from a student's custom request
   */
  public async generateMockFromRequest(
    requestId: string,
    operatorDetails: {
      operatorId: string;
      operatorName: string;
      customTitle?: string;
      questionIds?: string[];
      durationMinutes?: number;
      negativeMarking?: number;
      passingMarks?: number;
    }
  ): Promise<{ request: CustomMockDrillRequest; mockTest: MockTest }> {
    await this.delay(150);
    return mockStore.generateMockFromRequest(requestId, operatorDetails);
  }


  /**
   * Starts a new timed mock test attempt session
   */
  public async startAttempt(studentId: string, studentName: string, mockTestId: string): Promise<MockTestAttempt> {
    await this.delay(150);
    return mockStore.startMockTestAttempt(studentId, studentName, mockTestId);
  }

  /**
   * Saves student's current response for a question during test
   */
  public async saveAnswer(
    attemptId: string,
    questionId: string,
    selectedOptions: string[],
    numericalValue?: number,
    isMarkedForReview: boolean = false,
    timeSpentSeconds: number = 0
  ): Promise<MockTestAttempt | undefined> {
    return mockStore.saveMockTestAnswer(attemptId, questionId, selectedOptions, numericalValue, isMarkedForReview, timeSpentSeconds);
  }

  /**
   * Submits a completed mock test for automatic evaluation
   */
  public async submitAttempt(attemptId: string): Promise<MockTestAttempt> {
    await this.delay(200);
    return mockStore.submitMockTestAttempt(attemptId);
  }

  /**
   * Retrieves a completed or in-progress attempt session
   */
  public async getAttempt(attemptId: string): Promise<MockTestAttempt | undefined> {
    await this.delay(60);
    return mockStore.getMockTestAttempt(attemptId);
  }

  /**
   * Retrieves full mock test history for a student
   */
  public async getStudentMockTestHistory(studentId: string): Promise<MockTestAttempt[]> {
    await this.delay(100);
    return mockStore.getStudentMockTestHistory(studentId);
  }

  /**
   * Retrieves question details for attempt review
   */
  public async getQuestionsForTest(questionIds: string[]): Promise<QuestionItem[]> {
    await this.delay(60);
    const bank = mockStore.getQuestionBank();
    return bank.filter(q => questionIds.includes(q.id));
  }

  /**
   * Exports government exams in JSON or CSV format
   */
  public exportExams(format: 'json' | 'csv', exams: GovernmentExam[]): string {
    if (format === 'json') {
      return JSON.stringify(exams, null, 2);
    }
    const headers = [
      'ID',
      'Name',
      'ShortName',
      'Category',
      'ConductingAuthority',
      'TotalQuestions',
      'TotalMarks',
      'DurationMinutes',
      'NegativeMarking',
      'Status',
      'PatternVersion'
    ];
    const rows = exams.map(e => [
      e.id,
      `"${(e.name || '').replace(/"/g, '""')}"`,
      e.shortName,
      e.category,
      `"${(e.conductingAuthority || '').replace(/"/g, '""')}"`,
      e.totalQuestions,
      e.totalMarks,
      e.durationMinutes,
      e.negativeMarkingPerQuestion,
      e.status,
      e.patternVersion
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Exports mock tests in JSON or CSV format
   */
  public exportMockTests(format: 'json' | 'csv', tests: MockTest[]): string {
    if (format === 'json') {
      return JSON.stringify(tests, null, 2);
    }
    const headers = [
      'ID',
      'ExamID',
      'ExamName',
      'Title',
      'Category',
      'IsFullMock',
      'Subject',
      'DurationMinutes',
      'TotalQuestions',
      'TotalMarks',
      'NegativePenalty',
      'PassingMarks',
      'Difficulty',
      'Status',
      'AttemptCount'
    ];
    const rows = tests.map(t => [
      t.id,
      t.examId,
      `"${(t.examName || '').replace(/"/g, '""')}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.category || '',
      t.isFullMock ? 'TRUE' : 'FALSE',
      `"${(t.subject || '').replace(/"/g, '""')}"`,
      t.durationMinutes,
      t.totalQuestions,
      t.totalMarks,
      t.negativeMarkingPerQuestion,
      t.passingMarks,
      t.difficulty,
      t.status,
      t.attemptCount
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockTestService = new MockTestService();
