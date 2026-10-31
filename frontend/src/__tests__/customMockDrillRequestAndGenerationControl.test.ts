import { describe, it, expect, beforeEach } from 'vitest';
import { mockTestService } from '../services/mockTestService';
import { mockStore } from '../mock/store';
import { safeStorage } from '../utils/storageUtils';

describe('FOCUSPOINT — Custom Mock Drill Generation Control & Request Architecture', () => {
  const testStudentId = 'usr-test-student-frontend-101';
  const testStudentName = 'Arjun Rajput';
  const testOperatorId = 'usr-operator-01';
  const testOperatorName = 'Dr. S. K. Verma (Academic Lead)';

  beforeEach(() => {
    safeStorage.removeItem('fp_academic_custom_mock_requests');
  });

  describe('1. Business Rule Enforcement: Students CANNOT Generate Custom Mock Tests', () => {
    it('Should strictly throw Forbidden error when student role attempts to generate a custom mock test', () => {
      expect(() => {
        mockStore.generateCustomMockTest({
          examId: 'exam-up-constable',
          subject: 'General Knowledge',
          topics: ['Uttar Pradesh History'],
          difficulty: 'MODERATE',
          questionCount: 25,
          requestedByRole: 'STUDENT'
        });
      }).toThrow(/Students are not authorized to directly generate mock tests/i);
    });

    it('Should allow Operator to generate custom mock tests directly', () => {
      const generatedMock = mockStore.generateCustomMockTest({
        examId: 'exam-up-constable',
        subject: 'General Knowledge',
        topics: ['Uttar Pradesh History'],
        difficulty: 'MODERATE',
        questionCount: 20,
        requestedByRole: 'OPERATOR'
      });

      expect(generatedMock).toBeDefined();
      expect(generatedMock.id).toMatch(/^mt-/);
      expect(generatedMock.totalQuestions).toBe(20);
      expect(generatedMock.status).toBe('PUBLISHED');
    });

    it('Should allow Super Admin to generate custom mock tests', () => {
      const generatedMock = mockStore.generateCustomMockTest({
        examId: 'exam-ssc-cgl',
        subject: 'Quantitative Aptitude',
        difficulty: 'HARD',
        questionCount: 25,
        requestedByRole: 'SUPER_ADMIN'
      });

      expect(generatedMock).toBeDefined();
      expect(generatedMock.status).toBe('PUBLISHED');
    });
  });

  describe('2. Student Custom Mock Drill Request System', () => {
    let newRequestId: string;

    it('Should allow student to submit a Custom Mock Drill Request with 6-step wizard preferences', async () => {
      const newRequest = await mockTestService.submitCustomMockRequest({
        studentId: testStudentId,
        studentName: testStudentName,
        examId: 'exam-up-constable',
        examName: 'UP Police Constable',
        subject: 'Numerical Ability',
        chapter: 'Arithmetic',
        topic: 'Percentage & Profit-Loss',
        difficulty: 'HARD',
        questionCount: 25,
        durationMinutes: 30,
        language: 'Hindi',
        testType: 'Weak Topic Practice',
        notes: 'Please include high-difficulty discount and successive profit problems.',
        priority: 'HIGH'
      });

      expect(newRequest).toBeDefined();
      expect(newRequest.id).toMatch(/^FP-MDR-/);
      expect(newRequest.status).toBe('REQUESTED');
      expect(newRequest.studentId).toBe(testStudentId);
      expect(newRequest.subject).toBe('Numerical Ability');
      expect(newRequest.questionCount).toBe(25);
      expect(newRequest.priority).toBe('HIGH');

      newRequestId = newRequest.id;
    });

    it('Should retrieve student custom requests by student ID', async () => {
      // First ensure there is at least one request submitted
      await mockTestService.submitCustomMockRequest({
        studentId: testStudentId,
        studentName: testStudentName,
        examId: 'exam-ssc-cgl',
        examName: 'SSC CGL',
        subject: 'Reasoning',
        difficulty: 'MODERATE',
        questionCount: 20,
        durationMinutes: 25,
        language: 'Hindi',
        testType: 'Chapter Drill',
        priority: 'MEDIUM'
      });

      const studentRequests = await mockTestService.getCustomMockRequests(testStudentId);
      expect(Array.isArray(studentRequests)).toBe(true);
      expect(studentRequests.length).toBeGreaterThanOrEqual(1);
      expect(studentRequests.every(r => r.studentId === testStudentId)).toBe(true);
    });

    it('Should retrieve all custom requests for operator without filtering', async () => {
      const allRequests = await mockTestService.getCustomMockRequests();
      expect(Array.isArray(allRequests)).toBe(true);
      expect(allRequests.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('3. Operator Review, AI Generation & Publishing Lifecycle', () => {
    let activeRequest: any;

    beforeEach(async () => {
      activeRequest = await mockTestService.submitCustomMockRequest({
        studentId: testStudentId,
        studentName: testStudentName,
        examId: 'exam-up-constable',
        examName: 'UP Police Constable',
        subject: 'Mental Ability',
        topic: 'Blood Relations & Direction Sense',
        difficulty: 'MODERATE',
        questionCount: 20,
        durationMinutes: 25,
        language: 'Hindi',
        testType: 'Chapter Drill',
        priority: 'MEDIUM'
      });
    });

    it('Should allow Operator to update request status to UNDER_REVIEW and IN_PREPARATION with notes', async () => {
      const updatedUnderReview = await mockTestService.updateCustomMockRequestStatus(
        activeRequest.id,
        'UNDER_REVIEW',
        'Academic team is evaluating syllabus relevance.',
        testOperatorId,
        testOperatorName
      );

      expect(updatedUnderReview).not.toBeNull();
      expect(updatedUnderReview?.status).toBe('UNDER_REVIEW');
      expect(updatedUnderReview?.operatorMessage).toContain('evaluating syllabus');
      expect(updatedUnderReview?.assignedOperatorName).toBe(testOperatorName);

      const updatedPrep = await mockTestService.updateCustomMockRequestStatus(
        activeRequest.id,
        'IN_PREPARATION',
        'Assembling questions matching recent UP Police exam shifts.'
      );

      expect(updatedPrep).not.toBeNull();
      expect(updatedPrep?.status).toBe('IN_PREPARATION');
    });

    it('Should allow Operator to generate a verified draft mock test from request', async () => {
      const { request: updatedReq, mockTest } = await mockTestService.generateMockFromRequest(
        activeRequest.id,
        {
          operatorId: testOperatorId,
          operatorName: testOperatorName,
          customTitle: 'UP Police Constable Custom Drill — Mental Ability'
        }
      );

      expect(updatedReq.status).toBe('QUALITY_REVIEW');
      expect(updatedReq.generatedMockTestId).toBe(mockTest.id);
      expect(mockTest).toBeDefined();
      expect(mockTest.totalQuestions).toBeGreaterThanOrEqual(10);
      expect(mockTest.status).toBe('DRAFT');
      expect(mockTest.questionIds?.length).toBe(mockTest.totalQuestions);
    });

    it('Should allow Operator to publish verified mock test, making it accessible to the student', async () => {
      // 1. Generate draft from request
      const { mockTest } = await mockTestService.generateMockFromRequest(
        activeRequest.id,
        {
          operatorId: testOperatorId,
          operatorName: testOperatorName
        }
      );

      // 2. Publish mock test
      await mockTestService.updateMockTest(mockTest.id, { status: 'PUBLISHED' });

      // 3. Mark request as PUBLISHED
      const finalRequest = await mockTestService.updateCustomMockRequestStatus(
        activeRequest.id,
        'PUBLISHED',
        'Your custom mock drill is ready and live in your library!',
        testOperatorId,
        testOperatorName
      );

      expect(finalRequest).not.toBeNull();
      expect(finalRequest?.status).toBe('PUBLISHED');
      expect(finalRequest?.publishedAt).toBeDefined();

      // Verify the mock test is now published
      const testInCatalog = await mockTestService.getMockTestById(mockTest.id);
      expect(testInCatalog?.status).toBe('PUBLISHED');
    });
  });
});
