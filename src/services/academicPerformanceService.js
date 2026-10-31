const db = require('../db/database');
const crypto = require('crypto');

class AcademicPerformanceService {
  /**
   * Get student performance metrics with strict zero-fake-data integrity
   */
  getStudentPerformance(studentId) {
    // 1. Fetch all completed mock test attempts
    const mockAttempts = db.prepare(`
      SELECT mta.*, mt.title as test_title, ge.title as exam_title
      FROM mock_test_attempts mta
      JOIN mock_tests mt ON mta.mock_test_id = mt.id
      JOIN government_exams ge ON mt.exam_id = ge.id
      WHERE mta.student_id = ? AND mta.status IN ('SUBMITTED', 'EVALUATED')
      ORDER BY mta.created_at DESC
    `).all(studentId);

    // 2. Fetch teacher-entered and self-recorded test results
    const teacherTests = db.prepare(`
      SELECT str.*, u.id as teacher_user_id, tp.full_name as teacher_name
      FROM student_test_records str
      LEFT JOIN users u ON str.teacher_id = u.id
      LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE str.student_id = ?
      ORDER BY str.test_date DESC, str.created_at DESC
    `).all(studentId);

    const totalTests = mockAttempts.length + teacherTests.length;

    // Strict zero-data empty state for new students
    if (totalTests === 0) {
      return {
        studentId,
        totalTests: 0,
        totalQuestionsAttempted: 0,
        averagePercentage: 0,
        overallAccuracy: 0,
        hasSufficientData: false,
        strongestSubject: null,
        subjectNeedingAttention: null,
        subjectSummaries: [],
        recentTests: [],
        recommendations: [],
        message: 'No performance data yet. Complete your first assessment to start tracking your growth.'
      };
    }

    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let totalQuestionsAttempted = 0;
    let totalCorrectAnswers = 0;

    // Subject accumulator
    const subjectMap = {};

    for (const a of mockAttempts) {
      totalMarksObtained += a.total_marks_obtained || 0;
      totalMaxMarks += a.max_marks || 0;
      totalQuestionsAttempted += a.questions_attempted || 0;
      totalCorrectAnswers += a.correct_answers || 0;

      // Group question answers by subject for deep analytics
      const answers = db.prepare(`
        SELECT mta.*, qb.subject_name, qb.topic_name, qb.difficulty
        FROM mock_test_answers mta
        JOIN question_bank qb ON mta.question_id = qb.id
        WHERE mta.attempt_id = ?
      `).all(a.id);

      for (const ans of answers) {
        const sub = ans.subject_name || 'General';
        if (!subjectMap[sub]) {
          subjectMap[sub] = { subject: sub, testCount: 0, questionsAttempted: 0, correct: 0, marks: 0, maxMarks: 0, topics: {} };
        }
        subjectMap[sub].questionsAttempted += 1;
        if (ans.is_correct) subjectMap[sub].correct += 1;
        subjectMap[sub].marks += ans.marks_awarded || 0;

        const topic = ans.topic_name || 'General';
        if (!subjectMap[sub].topics[topic]) {
          subjectMap[sub].topics[topic] = { topic, attempted: 0, correct: 0 };
        }
        subjectMap[sub].topics[topic].attempted += 1;
        if (ans.is_correct) subjectMap[sub].topics[topic].correct += 1;
      }
    }

    for (const t of teacherTests) {
      totalMarksObtained += t.marks_obtained;
      totalMaxMarks += t.total_marks;
      const sub = t.subject || 'General';
      if (!subjectMap[sub]) {
        subjectMap[sub] = { subject: sub, testCount: 0, questionsAttempted: 0, correct: 0, marks: 0, maxMarks: 0, topics: {} };
      }
      subjectMap[sub].testCount += 1;
      subjectMap[sub].marks += t.marks_obtained;
      subjectMap[sub].maxMarks += t.total_marks;

      if (t.topic) {
        if (!subjectMap[sub].topics[t.topic]) {
          subjectMap[sub].topics[t.topic] = { topic: t.topic, attempted: 0, correct: 0 };
        }
      }
    }

    const averagePercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;
    const overallAccuracy = totalQuestionsAttempted > 0 ? Math.round((totalCorrectAnswers / totalQuestionsAttempted) * 100) : averagePercentage;

    // Configurable thresholds (default: min 2 tests for classification)
    const thresholdRule = db.prepare("SELECT * FROM academic_thresholds WHERE scope='GLOBAL' LIMIT 1").get();
    const minTestsRequired = thresholdRule ? thresholdRule.minimum_tests_required : 2;
    const weakCutoff = thresholdRule ? thresholdRule.weak_subject_cutoff : 60.0;
    const strongCutoff = thresholdRule ? thresholdRule.strong_subject_cutoff : 80.0;

    const subjectSummaries = Object.values(subjectMap).map(s => {
      const tests = s.testCount + (s.questionsAttempted > 0 ? 1 : 0);
      const pct = s.maxMarks > 0 ? Math.round((s.marks / s.maxMarks) * 100) : (s.questionsAttempted > 0 ? Math.round((s.correct / s.questionsAttempted) * 100) : 0);
      const acc = s.questionsAttempted > 0 ? Math.round((s.correct / s.questionsAttempted) * 100) : pct;

      let classification = 'INSUFFICIENT_DATA';
      if (tests >= minTestsRequired) {
        if (pct >= strongCutoff) classification = 'EXCELLENT';
        else if (pct >= 70) classification = 'GOOD';
        else if (pct >= weakCutoff) classification = 'AVERAGE';
        else classification = 'NEEDS_IMPROVEMENT';
      }

      return {
        subject: s.subject,
        testsCount: tests,
        averagePercentage: pct,
        accuracy: acc,
        classification,
        hasSufficientData: tests >= minTestsRequired
      };
    });

    const eligibleSubjects = subjectSummaries.filter(s => s.hasSufficientData);
    let strongestSubject = null;
    let subjectNeedingAttention = null;

    if (eligibleSubjects.length > 0) {
      eligibleSubjects.sort((a, b) => b.averagePercentage - a.averagePercentage);
      strongestSubject = eligibleSubjects[0];
      if (eligibleSubjects[eligibleSubjects.length - 1].averagePercentage < 70) {
        subjectNeedingAttention = eligibleSubjects[eligibleSubjects.length - 1];
      }
    }

    // Build unified recent tests list
    const recentTests = [
      ...mockAttempts.map(a => ({
        id: a.id,
        testName: a.test_title || 'Mock Test',
        source: 'MOCK_TEST',
        date: a.started_at,
        score: a.total_marks_obtained,
        maxScore: a.max_marks,
        percentage: a.percentage,
        accuracy: a.accuracy
      })),
      ...teacherTests.map(t => ({
        id: t.id,
        testName: t.test_name,
        subject: t.subject,
        source: 'TEACHER_ENTERED',
        date: t.test_date,
        score: t.marks_obtained,
        maxScore: t.total_marks,
        percentage: t.percentage,
        teacherName: t.teacher_name
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    // Dynamic personalized recommendations based on real weak areas
    const recommendations = [];
    if (subjectNeedingAttention) {
      recommendations.push({
        id: 'rec-study-01',
        type: 'STUDY_MATERIAL',
        subject: subjectNeedingAttention.subject,
        title: `${subjectNeedingAttention.subject} Foundation & High-Yield Practice Pack`,
        reason: `Your ${subjectNeedingAttention.subject} score (${subjectNeedingAttention.averagePercentage}%) is currently below target level across recent tests.`,
        actionLabel: 'Review Study Material',
        actionUrl: `/student/study-material?subject=${encodeURIComponent(subjectNeedingAttention.subject)}`
      });

      // Recommend specialized approved teachers in student district
      const studentProfile = db.prepare('SELECT district_id FROM users WHERE id = ?').get(studentId);
      const districtId = studentProfile ? studentProfile.district_id : null;
      
      const teacherQuery = districtId
        ? "SELECT u.id, tp.full_name, tp.subjects, tp.experience_years FROM teacher_profiles tp JOIN users u ON tp.user_id = u.id WHERE u.district_id = ? AND u.account_status = 'ACTIVE' LIMIT 2"
        : "SELECT u.id, tp.full_name, tp.subjects, tp.experience_years FROM teacher_profiles tp JOIN users u ON tp.user_id = u.id WHERE u.account_status = 'ACTIVE' LIMIT 2";
      
      const suggestedTeachers = db.prepare(teacherQuery).all(...(districtId ? [districtId] : []));

      for (const t of suggestedTeachers) {
        recommendations.push({
          id: `rec-teacher-${t.id}`,
          type: 'TEACHER_RECOMMENDATION',
          subject: subjectNeedingAttention.subject,
          title: `Book Mentorship with ${t.full_name}`,
          teacherId: t.id,
          teacherName: t.full_name,
          experience: `${t.experience_years} years experience`,
          reason: `Specialized teacher in your area available for 1-on-1 tutoring in ${subjectNeedingAttention.subject}.`,
          actionLabel: 'Request Home Tutor',
          actionUrl: `/tutors/${t.id}`
        });
      }
    }

    return {
      studentId,
      totalTests,
      totalQuestionsAttempted,
      averagePercentage,
      overallAccuracy,
      hasSufficientData: eligibleSubjects.length > 0,
      strongestSubject: strongestSubject ? strongestSubject.subject : null,
      strongestSubjectPercentage: strongestSubject ? strongestSubject.averagePercentage : null,
      subjectNeedingAttention: subjectNeedingAttention ? subjectNeedingAttention.subject : null,
      attentionSubjectPercentage: subjectNeedingAttention ? subjectNeedingAttention.averagePercentage : null,
      subjectSummaries,
      recentTests,
      recommendations
    };
  }

  /**
   * Record teacher assessment result for an allotted student
   */
  recordTeacherTestResult(data, teacherId, isSuperAdmin = false) {
    const { studentId, subject, topic, testName, testDate, totalMarks, marksObtained, remarks } = data;

    if (!studentId || !subject || !testName || totalMarks === undefined || marksObtained === undefined) {
      throw new Error('Missing required test fields (studentId, subject, testName, totalMarks, marksObtained)');
    }

    if (totalMarks <= 0 || marksObtained < 0 || marksObtained > totalMarks) {
      throw new Error('Invalid marks entered. Marks obtained must be between 0 and total marks.');
    }

    // Role verification: Verify that student is actually allotted to this teacher unless Super Admin
    if (!isSuperAdmin) {
      const activeAllotment = db.prepare(`
        SELECT id FROM booking_requests 
        WHERE student_id = ? AND teacher_id = ? AND status = 'CONFIRMED'
      `).get(studentId, teacherId);

      if (!activeAllotment) {
        throw new Error('Access Denied: Teacher is not authorized to enter test results for unallotted student');
      }
    }

    const testId = `tst-${crypto.randomUUID()}`;
    const percentage = Math.round((marksObtained / totalMarks) * 100);

    db.prepare(`
      INSERT INTO student_test_records
      (id, student_id, teacher_id, subject, topic, test_name, test_type, marks_obtained, total_marks, percentage, remarks, test_date)
      VALUES (?, ?, ?, ?, ?, ?, 'HOME_TUITION', ?, ?, ?, ?, ?)
    `).run(
      testId,
      studentId,
      teacherId,
      subject,
      topic || null,
      testName,
      marksObtained,
      totalMarks,
      percentage,
      remarks || null,
      testDate || new Date().toISOString().split('T')[0]
    );

    return {
      success: true,
      testId,
      percentage,
      message: 'Test record successfully saved and student growth recalculated.'
    };
  }

  /**
   * Get student mistake book
   */
  getMistakeBook(studentId, statusFilter = null) {
    let query = `
      SELECT smb.*, qb.question_text, qb.options, qb.correct_option_ids, qb.explanation, qb.difficulty, qb.marks, qb.negative_marks
      FROM student_mistake_book smb
      JOIN question_bank qb ON smb.question_id = qb.id
      WHERE smb.student_id = ?
    `;
    const params = [studentId];

    if (statusFilter) {
      query += ' AND smb.status = ?';
      params.push(statusFilter);
    }

    query += ' ORDER BY smb.created_at DESC';

    const mistakes = db.prepare(query).all(...params);
    return mistakes.map(m => ({
      ...m,
      options: JSON.parse(m.options || '[]'),
      correctOptionIds: JSON.parse(m.correct_option_ids || '[]'),
      userIncorrectAnswers: JSON.parse(m.user_incorrect_answers || '[]')
    }));
  }

  /**
   * Update mistake book item (e.g. mark as MASTERED or add personal notes)
   */
  updateMistakeBookStatus(mistakeId, studentId, status, personalNotes) {
    const existing = db.prepare('SELECT id FROM student_mistake_book WHERE id = ? AND student_id = ?').get(mistakeId, studentId);
    if (!existing) {
      throw new Error('Mistake record not found or access denied');
    }

    db.prepare(`
      UPDATE student_mistake_book
      SET status = COALESCE(?, status),
          personal_notes = COALESCE(?, personal_notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, personalNotes, mistakeId);

    return { success: true, message: 'Mistake record updated successfully' };
  }
}

module.exports = new AcademicPerformanceService();
