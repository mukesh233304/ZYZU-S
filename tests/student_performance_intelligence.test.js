import { describe, it, expect, beforeEach } from 'vitest';
import { academicStoreEngine } from '../frontend/src/mock/academicStoreEngine';
import { initialAcademicThresholds, initialAIControlConfig, mockGovernmentExams, mockQuestionBank, mockTestsList } from '../frontend/src/mock/data/academicData';

describe('FOCUSPOINT Academic Intelligence, Mock Test & Performance Engine Suite', () => {
  beforeEach(() => {
    // Reset state before each test run
    academicStoreEngine.resetToDefaults();
  });

  describe('1. Zero Fake Data & Empty State Integrity', () => {
    it('Should return strict zero fake data for a brand new student with no test records', () => {
      const emptyStudentId = 'usr-student-new-empty';
      const metrics = academicStoreEngine.getStudentPerformance(emptyStudentId);

      expect(metrics.studentId).toBe(emptyStudentId);
      expect(metrics.totalTests).toBe(0);
      expect(metrics.totalQuestionsAttempted).toBe(0);
      expect(metrics.averagePercentage).toBe(0);
      expect(metrics.overallAccuracy).toBe(0);
      expect(metrics.hasSufficientData).toBe(false);
      expect(metrics.strongestSubject).toBeUndefined();
      expect(metrics.subjectNeedingAttention).toBeUndefined();
      expect(metrics.subjectSummaries.length).toBe(0);
      expect(metrics.recentTests.length).toBe(0);
    });

    it('Should require minimum test threshold before classifying a subject as strong or weak', () => {
      const studentId = 'usr-student-single-test';

      // Record only 1 test in Mathematics with 90%
      academicStoreEngine.recordTeacherTestResult(
        {
          studentId,
          studentName: 'Single Test Learner',
          testName: 'Algebra Quiz #1',
          subject: 'Mathematics',
          topic: 'Quadratic Equations',
          testDate: '2026-09-20',
          totalMarks: 50,
          marksObtained: 45,
          percentage: 90,
          source: 'TEACHER_ENTERED'
        },
        'usr-teacher-rajesh',
        true, // isSuperAdmin override
        [studentId]
      );

      const metrics = academicStoreEngine.getStudentPerformance(studentId);
      expect(metrics.totalTests).toBe(1);
      // Because minTestsRequiredForClassification is 2 (or 3), classification must be INSUFFICIENT_DATA
      const mathSummary = metrics.subjectSummaries.find(s => s.subject === 'Mathematics');
      expect(mathSummary).toBeDefined();
      expect(mathSummary.classification).toBe('INSUFFICIENT_DATA');
      expect(metrics.hasSufficientData).toBe(false);
    });

    it('Should classify subject once minimum test threshold is reached', () => {
      const studentId = 'usr-student-multi-test';

      // Record 2 tests in Mathematics (>= threshold of 2)
      academicStoreEngine.recordTeacherTestResult(
        {
          studentId,
          studentName: 'Multi Test Learner',
          testName: 'Algebra Quiz #1',
          subject: 'Mathematics',
          topic: 'Quadratic Equations',
          testDate: '2026-09-18',
          totalMarks: 50,
          marksObtained: 46,
          percentage: 92,
          source: 'TEACHER_ENTERED'
        },
        'usr-teacher-rajesh',
        true,
        [studentId]
      );

      academicStoreEngine.recordTeacherTestResult(
        {
          studentId,
          studentName: 'Multi Test Learner',
          testName: 'Geometry Quiz #1',
          subject: 'Mathematics',
          topic: 'Circles',
          testDate: '2026-09-20',
          totalMarks: 50,
          marksObtained: 44,
          percentage: 88,
          source: 'TEACHER_ENTERED'
        },
        'usr-teacher-rajesh',
        true,
        [studentId]
      );

      const metrics = academicStoreEngine.getStudentPerformance(studentId);
      expect(metrics.totalTests).toBe(2);
      const mathSummary = metrics.subjectSummaries.find(s => s.subject === 'Mathematics');
      expect(mathSummary.testCount).toBe(2);
      expect(mathSummary.classification).toBe('EXCELLENT');
      expect(metrics.strongestSubject).toBe('Mathematics');
      expect(metrics.hasSufficientData).toBe(true);
    });
  });

  describe('2. Teacher Test Score Entry & Scoped Access Control', () => {
    it('Should forbid teacher from recording scores for a student not allotted to them', () => {
      const teacherId = 'usr-teacher-rajesh';
      const unauthorizedStudentId = 'usr-student-other-unallotted';
      const allottedList = ['usr-student-aryan'];

      const result = academicStoreEngine.recordTeacherTestResult(
        {
          studentId: unauthorizedStudentId,
          studentName: 'Other Student',
          testName: 'Weekly Test',
          subject: 'Science',
          topic: 'Optics',
          testDate: '2026-09-21',
          totalMarks: 50,
          marksObtained: 40,
          percentage: 80,
          source: 'TEACHER_ENTERED'
        },
        teacherId,
        false, // not super admin
        allottedList
      );

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/not allotted|not assigned/i);
    });

    it('Should allow allotted teacher to record test scores successfully', () => {
      const teacherId = 'usr-teacher-rajesh';
      const studentId = 'usr-student-aryan';
      const allottedList = ['usr-student-aryan'];

      const result = academicStoreEngine.recordTeacherTestResult(
        {
          studentId,
          studentName: 'Aryan Sharma',
          testName: 'Physics Forces Test',
          subject: 'Science',
          topic: 'Newton Laws of Motion',
          testDate: '2026-09-21',
          totalMarks: 100,
          marksObtained: 84,
          percentage: 84,
          source: 'TEACHER_ENTERED',
          remarks: 'Good conceptual clarity'
        },
        teacherId,
        false,
        allottedList
      );

      expect(result.success).toBe(true);
      expect(result.record).toBeDefined();
      expect(result.record.percentage).toBe(84);
      expect(result.record.marksObtained).toBe(84);
    });
  });

  describe('3. Live Mock Test Lifecycle & Penalty Evaluation Engine', () => {
    it('Should correctly score a mock test with positive marks and negative penalty deduction', () => {
      const studentId = 'usr-student-aryan';
      const mockTestId = 'mt-ssc-cgl-01'; // 8 questions, 16 marks, 0.5 negative penalty per wrong

      // Start attempt
      const attempt = academicStoreEngine.startMockTestAttempt(studentId, 'Aryan Sharma', mockTestId);
      expect(attempt.status).toBe('IN_PROGRESS');
      expect(attempt.totalQuestions).toBeGreaterThan(0);

      // Fetch questions in test
      const testDef = academicStoreEngine.getMockTestById(mockTestId);
      const q1Id = testDef.questionIds[0];
      const q2Id = testDef.questionIds[1];
      const q3Id = testDef.questionIds[2];

      const bank = academicStoreEngine.getQuestionBank();
      const q1 = bank.find(q => q.id === q1Id);
      const q2 = bank.find(q => q.id === q2Id);

      // Answer Q1 correctly
      academicStoreEngine.saveMockTestAnswer(attempt.id, q1Id, [q1.correctAnswer], undefined, false, 45);

      // Answer Q2 incorrectly (choose wrong option)
      const wrongOpt = q2.options.find(o => o.id !== q2.correctAnswer);
      academicStoreEngine.saveMockTestAnswer(attempt.id, q2Id, [wrongOpt.id], undefined, false, 50);

      // Leave Q3 unattempted

      // Submit test
      const completed = academicStoreEngine.submitMockTestAttempt(attempt.id);
      expect(completed.status).toBe('COMPLETED');
      expect(completed.attemptedCount).toBe(2);
      expect(completed.correctCount).toBe(1);
      expect(completed.incorrectCount).toBe(1);
      expect(completed.unansweredCount).toBe(completed.totalQuestions - 2);

      // Negative marks deducted should equal testDef.negativeMarkingPerQuestion (0.5)
      expect(completed.negativeMarksPenalty).toBe(testDef.negativeMarkingPerQuestion);

      // Marks per correct is totalMarks / totalQuestions (16 / 8 = 2)
      const expectedScore = (1 * (testDef.totalMarks / testDef.totalQuestions)) - testDef.negativeMarkingPerQuestion;
      expect(completed.score).toBeCloseTo(expectedScore, 2);
    });

    it('Should automatically record incorrect answers into the student Mistake Book upon submission', () => {
      const studentId = 'usr-student-mistake-check';
      const mockTestId = 'mt-ssc-cgl-01';

      const attempt = academicStoreEngine.startMockTestAttempt(studentId, 'Mistake Checker', mockTestId);
      const testDef = academicStoreEngine.getMockTestById(mockTestId);
      const qId = testDef.questionIds[0];
      const bank = academicStoreEngine.getQuestionBank();
      const q = bank.find(item => item.id === qId);

      // Submit wrong answer
      const wrongOpt = q.options.find(o => o.id !== q.correctAnswer);
      academicStoreEngine.saveMockTestAnswer(attempt.id, qId, [wrongOpt.id], undefined, false, 30);
      academicStoreEngine.submitMockTestAttempt(attempt.id);

      // Inspect Mistake Book
      const mistakes = academicStoreEngine.getStudentMistakeBook(studentId);
      expect(mistakes.length).toBeGreaterThan(0);
      const logged = mistakes.find(m => m.questionId === qId);
      expect(logged).toBeDefined();
      expect(logged.studentAnswer).toBe(wrongOpt.id);
      expect(logged.correctAnswer).toBe(q.correctAnswer);
      expect(logged.isUnderstood).toBe(false);
    });
  });

  describe('4. Mistake Book Interactive Retry & Resolution', () => {
    it('Should allow student to retry an incorrect question and mark as understood upon correct answer', () => {
      const studentId = 'usr-student-aryan';
      const mistakes = academicStoreEngine.getStudentMistakeBook(studentId);
      expect(mistakes.length).toBeGreaterThan(0);

      const targetMistake = mistakes[0];
      expect(targetMistake.isUnderstood).toBe(false);

      // Retry with correct answer
      const res = academicStoreEngine.retryMistakeQuestion(targetMistake.id, targetMistake.correctAnswer);
      expect(res.isCorrect).toBe(true);
      expect(res.explanation).toBeTruthy();

      // Verify item updated in store
      const updatedList = academicStoreEngine.getStudentMistakeBook(studentId);
      const updatedItem = updatedList.find(m => m.id === targetMistake.id);
      expect(updatedItem.isUnderstood).toBe(true);
    });

    it('Should keep question unmastered when retried with incorrect answer', () => {
      const studentId = 'usr-student-aryan';
      const mistakes = academicStoreEngine.getStudentMistakeBook(studentId);
      const targetMistake = mistakes.find(m => !m.isUnderstood) || mistakes[0];

      const wrongOpt = targetMistake.options.find(o => o.id !== targetMistake.correctAnswer);
      const res = academicStoreEngine.retryMistakeQuestion(targetMistake.id, wrongOpt.id);
      expect(res.isCorrect).toBe(false);

      const updatedList = academicStoreEngine.getStudentMistakeBook(studentId);
      const updatedItem = updatedList.find(m => m.id === targetMistake.id);
      expect(updatedItem.isUnderstood).toBe(false);
      expect(updatedItem.retryCount).toBeGreaterThan(0);
    });
  });

  describe('5. Graduated Learning Recommendations (Level 1 to 4)', () => {
    it('Should generate transparent graduated recommendations based on evaluated weak areas', () => {
      const studentId = 'usr-student-aryan';
      const recommendations = academicStoreEngine.getGraduatedRecommendations(studentId);

      expect(recommendations.length).toBeGreaterThan(0);
      recommendations.forEach(rec => {
        expect(['LEVEL_1_MATERIAL', 'LEVEL_2_REVISION', 'LEVEL_3_TEACHER', 'LEVEL_4_PLAN']).toContain(rec.level);
        expect(rec.transparentReason).toBeTruthy();
        expect(rec.title).toBeTruthy();
      });
    });
  });

  describe('6. AI Question Generation & Human Approval Workflow', () => {
    it('Should generate questions in AI_GENERATED status requiring human review before publishing', () => {
      const generated = academicStoreEngine.generateAIQuestions({
        examId: 'exam-ssc-cgl',
        subject: 'General Intelligence',
        topic: 'Blood Relations',
        difficulty: 'MEDIUM',
        count: 2,
        questionType: 'MCQ'
      });

      expect(generated.length).toBe(2);
      generated.forEach(q => {
        expect(q.status).toBe('AI_GENERATED');
        expect(q.source).toBe('AI_GENERATED');
        expect(q.options.length).toBe(4);
        expect(q.correctAnswer).toBeTruthy();
        expect(q.explanation).toBeTruthy();
      });

      const q1 = generated[0];

      // Admin approves question
      const approved = academicStoreEngine.approveQuestion(q1.id, 'Super Admin');
      expect(approved.status).toBe('APPROVED');
      expect(approved.approvedBy).toBe('Super Admin');

      // Admin publishes question
      const published = academicStoreEngine.publishQuestion(q1.id, 'Super Admin');
      expect(published.status).toBe('PUBLISHED');
    });
  });
});
