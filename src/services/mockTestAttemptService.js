const db = require('../db/database');
const crypto = require('crypto');

class MockTestAttemptService {
  /**
   * Start a new test attempt
   */
  startAttempt(studentId, mockTestId) {
    const mockTest = db.prepare(`
      SELECT mt.*, ge.title as exam_title, ge.negative_marking_ratio
      FROM mock_tests mt
      JOIN government_exams ge ON mt.exam_id = ge.id
      WHERE mt.id = ? AND mt.is_published = 1
    `).get(mockTestId);

    if (!mockTest) {
      throw new Error('Mock test not found or not published');
    }

    const attemptId = `att-${crypto.randomUUID()}`;

    // Create attempt session
    db.prepare(`
      INSERT INTO mock_test_attempts
      (id, mock_test_id, student_id, started_at, max_marks, status)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, 'IN_PROGRESS')
    `).run(attemptId, mockTestId, studentId, mockTest.total_marks);

    // Fetch questions for this test
    const questions = db.prepare(`
      SELECT qb.id, qb.subject_name, qb.topic_name, qb.question_text, qb.question_type, 
             qb.options, qb.marks, qb.negative_marks, mtq.question_order
      FROM mock_test_questions mtq
      JOIN question_bank qb ON mtq.question_id = qb.id
      WHERE mtq.mock_test_id = ?
      ORDER BY mtq.question_order ASC
    `).all(mockTestId);

    // Prepare questions for student view (do NOT reveal correct answers or explanations yet)
    const sanitizedQuestions = questions.map(q => ({
      id: q.id,
      order: q.question_order,
      subject: q.subject_name,
      topic: q.topic_name,
      text: q.question_text,
      type: q.question_type,
      options: JSON.parse(q.options || '[]'),
      marks: q.marks,
      negativeMarks: q.negative_marks
    }));

    return {
      attemptId,
      mockTest: {
        id: mockTest.id,
        title: mockTest.title,
        examTitle: mockTest.exam_title,
        durationMinutes: mockTest.duration_minutes,
        totalQuestions: mockTest.total_questions,
        totalMarks: mockTest.total_marks,
        negativeMarkingRatio: mockTest.negative_marking_ratio
      },
      questions: sanitizedQuestions,
      startedAt: new Date().toISOString()
    };
  }

  /**
   * Save / update answer for a specific question in active attempt
   */
  saveAnswer(attemptId, studentId, questionId, selectedOptionIds, timeSpentSeconds = 0, isMarkedForReview = 0) {
    const attempt = db.prepare(`
      SELECT * FROM mock_test_attempts 
      WHERE id = ? AND student_id = ? AND status = 'IN_PROGRESS'
    `).get(attemptId, studentId);

    if (!attempt) {
      throw new Error('Active test attempt session not found or already submitted');
    }

    const answerId = `ans-${crypto.randomUUID()}`;
    const optionsJson = JSON.stringify(selectedOptionIds || []);

    const existing = db.prepare(`
      SELECT id FROM mock_test_answers WHERE attempt_id = ? AND question_id = ?
    `).get(attemptId, questionId);

    if (existing) {
      db.prepare(`
        UPDATE mock_test_answers 
        SET selected_option_ids = ?,
            time_spent_seconds = time_spent_seconds + ?,
            is_marked_for_review = ?
        WHERE id = ?
      `).run(optionsJson, timeSpentSeconds, isMarkedForReview ? 1 : 0, existing.id);
    } else {
      db.prepare(`
        INSERT INTO mock_test_answers
        (id, attempt_id, question_id, selected_option_ids, time_spent_seconds, is_marked_for_review)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(answerId, attemptId, questionId, optionsJson, timeSpentSeconds, isMarkedForReview ? 1 : 0);
    }

    return { success: true };
  }

  /**
   * Submit and automatically evaluate mock test attempt
   */
  submitAttempt(attemptId, studentId, durationSeconds = 0) {
    const attempt = db.prepare(`
      SELECT mta.*, mt.total_marks as max_total_marks, mt.negative_marking_ratio
      FROM mock_test_attempts mta
      JOIN mock_tests mt ON mta.mock_test_id = mt.id
      WHERE mta.id = ? AND mta.student_id = ?
    `).get(attemptId, studentId);

    if (!attempt) {
      throw new Error('Attempt not found or access denied');
    }

    if (attempt.status === 'SUBMITTED' || attempt.status === 'EVALUATED') {
      return this.getAttemptResult(attemptId, studentId);
    }

    // Fetch all test questions
    const testQuestions = db.prepare(`
      SELECT qb.*
      FROM mock_test_questions mtq
      JOIN question_bank qb ON mtq.question_id = qb.id
      WHERE mtq.mock_test_id = ?
    `).all(attempt.mock_test_id);

    // Fetch all submitted answers
    const studentAnswers = db.prepare(`
      SELECT * FROM mock_test_answers WHERE attempt_id = ?
    `).all(attemptId);

    const answerMap = {};
    for (const a of studentAnswers) {
      answerMap[a.question_id] = a;
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let totalMarksObtained = 0;
    let negativeDeductions = 0;

    const mistakeEntries = [];

    for (const q of testQuestions) {
      const ans = answerMap[q.id];
      const selected = ans && ans.selected_option_ids ? JSON.parse(ans.selected_option_ids) : [];
      const correct = JSON.parse(q.correct_option_ids || '[]');

      if (!selected || selected.length === 0) {
        unansweredCount += 1;
        // Unanswered awards 0 marks, 0 deduction
      } else {
        // Compare options arrays
        const isMatch = selected.length === correct.length && selected.every(val => correct.includes(val));

        if (isMatch) {
          correctCount += 1;
          const marksAwarded = q.marks || 2.0;
          totalMarksObtained += marksAwarded;

          // Update answer record
          db.prepare(`
            UPDATE mock_test_answers 
            SET is_correct = 1, marks_awarded = ? 
            WHERE attempt_id = ? AND question_id = ?
          `).run(marksAwarded, attemptId, q.id);
        } else {
          incorrectCount += 1;
          const penalty = q.negative_marks || (q.marks * (attempt.negative_marking_ratio || 0.25));
          negativeDeductions += penalty;
          totalMarksObtained -= penalty;

          // Update answer record
          db.prepare(`
            UPDATE mock_test_answers 
            SET is_correct = 0, marks_awarded = ? 
            WHERE attempt_id = ? AND question_id = ?
          `).run(-penalty, attemptId, q.id);

          // Queue for Mistake Book
          mistakeEntries.push({
            studentId,
            questionId: q.id,
            attemptId,
            subject: q.subject_name,
            topic: q.topic_name,
            selected
          });
        }
      }
    }

    // Floor score at 0 if desired or allow negative
    const finalScore = Math.max(0, Math.round(totalMarksObtained * 100) / 100);
    const attemptedCount = correctCount + incorrectCount;
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const percentage = attempt.max_total_marks > 0 ? Math.round((finalScore / attempt.max_total_marks) * 100) : 0;

    // Update attempt record
    db.prepare(`
      UPDATE mock_test_attempts
      SET completed_at = CURRENT_TIMESTAMP,
          duration_seconds = ?,
          total_marks_obtained = ?,
          percentage = ?,
          accuracy = ?,
          questions_attempted = ?,
          correct_answers = ?,
          incorrect_answers = ?,
          unanswered = ?,
          negative_deductions = ?,
          status = 'EVALUATED'
      WHERE id = ?
    `).run(
      durationSeconds,
      finalScore,
      percentage,
      accuracy,
      attemptedCount,
      correctCount,
      incorrectCount,
      unansweredCount,
      negativeDeductions,
      attemptId
    );

    // Sync incorrect questions to Mistake Book non-destructively
    const insertMistake = db.prepare(`
      INSERT OR REPLACE INTO student_mistake_book
      (id, student_id, question_id, attempt_id, subject, topic, user_incorrect_answers, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'NEEDS_REVISION')
    `);

    for (const m of mistakeEntries) {
      const mistakeId = `mst-${crypto.randomUUID()}`;
      insertMistake.run(mistakeId, m.studentId, m.questionId, m.attemptId, m.subject, m.topic, JSON.stringify(m.selected));
    }

    return this.getAttemptResult(attemptId, studentId);
  }

  /**
   * Get full result review with detailed explanations
   */
  getAttemptResult(attemptId, studentId) {
    const attempt = db.prepare(`
      SELECT mta.*, mt.title as test_title, ge.title as exam_title
      FROM mock_test_attempts mta
      JOIN mock_tests mt ON mta.mock_test_id = mt.id
      JOIN government_exams ge ON mt.exam_id = ge.id
      WHERE mta.id = ? AND mta.student_id = ?
    `).get(attemptId, studentId);

    if (!attempt) {
      throw new Error('Attempt not found or access denied');
    }

    // Fetch questions with explanations and student selected answers
    const questionsWithReview = db.prepare(`
      SELECT qb.id, qb.subject_name, qb.topic_name, qb.question_text, qb.options, 
             qb.correct_option_ids, qb.explanation, qb.difficulty, qb.marks, qb.negative_marks,
             mta.selected_option_ids, mta.is_correct, mta.marks_awarded, mta.time_spent_seconds
      FROM mock_test_questions mtq
      JOIN question_bank qb ON mtq.question_id = qb.id
      LEFT JOIN mock_test_answers mta ON mta.question_id = qb.id AND mta.attempt_id = ?
      WHERE mtq.mock_test_id = ?
      ORDER BY mtq.question_order ASC
    `).all(attemptId, attempt.mock_test_id);

    return {
      attempt: {
        id: attempt.id,
        testTitle: attempt.test_title,
        examTitle: attempt.exam_title,
        startedAt: attempt.started_at,
        completedAt: attempt.completed_at,
        durationSeconds: attempt.duration_seconds,
        score: attempt.total_marks_obtained,
        maxScore: attempt.max_marks,
        percentage: attempt.percentage,
        accuracy: attempt.accuracy,
        attempted: attempt.questions_attempted,
        correct: attempt.correct_answers,
        incorrect: attempt.incorrect_answers,
        unanswered: attempt.unanswered,
        negativeDeductions: attempt.negative_deductions,
        status: attempt.status
      },
      questions: questionsWithReview.map(q => ({
        id: q.id,
        subject: q.subject_name,
        topic: q.topic_name,
        questionText: q.question_text,
        options: JSON.parse(q.options || '[]'),
        correctOptionIds: JSON.parse(q.correct_option_ids || '[]'),
        selectedOptionIds: q.selected_option_ids ? JSON.parse(q.selected_option_ids) : [],
        explanation: q.explanation,
        difficulty: q.difficulty,
        isCorrect: Boolean(q.is_correct),
        marksAwarded: q.marks_awarded || 0,
        timeSpentSeconds: q.time_spent_seconds || 0
      }))
    };
  }

  /**
   * Get student's historical test attempts
   */
  getStudentHistory(studentId) {
    return db.prepare(`
      SELECT mta.*, mt.title as test_title, ge.title as exam_title
      FROM mock_test_attempts mta
      JOIN mock_tests mt ON mta.mock_test_id = mt.id
      JOIN government_exams ge ON mt.exam_id = ge.id
      WHERE mta.student_id = ? AND mta.status IN ('SUBMITTED', 'EVALUATED')
      ORDER BY mta.created_at DESC
    `).all(studentId);
  }
}

module.exports = new MockTestAttemptService();
