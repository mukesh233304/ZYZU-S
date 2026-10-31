const mockTestAttemptService = require('../services/mockTestAttemptService');
const db = require('../db/database');
const config = require('../config');

class MockTestController {
  async listExams(req, res) {
    try {
      const exams = db.prepare(`
        SELECT ge.*, COUNT(mt.id) as mock_test_count
        FROM government_exams ge
        LEFT JOIN mock_tests mt ON ge.id = mt.exam_id AND mt.is_published = 1
        WHERE ge.is_active = 1
        GROUP BY ge.id
        ORDER BY ge.title ASC
      `).all();

      return res.status(200).json({
        success: true,
        data: exams
      });
    } catch (err) {
      console.error('Error listing government exams:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve exams catalog'
      });
    }
  }

  async listMockTests(req, res) {
    try {
      const { examId, testType } = req.query;
      let query = `
        SELECT mt.*, ge.title as exam_title, ge.category as exam_category
        FROM mock_tests mt
        JOIN government_exams ge ON mt.exam_id = ge.id
        WHERE mt.is_published = 1
      `;
      const params = [];

      if (examId) {
        query += ' AND mt.exam_id = ?';
        params.push(examId);
      }
      if (testType) {
        query += ' AND mt.test_type = ?';
        params.push(testType);
      }

      query += ' ORDER BY mt.created_at DESC';
      const tests = db.prepare(query).all(...params);

      return res.status(200).json({
        success: true,
        count: tests.length,
        data: tests
      });
    } catch (err) {
      console.error('Error listing mock tests:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve mock tests'
      });
    }
  }

  async startAttempt(req, res) {
    try {
      const studentId = req.user.id;
      const { mockTestId } = req.body;

      if (!mockTestId) {
        return res.status(400).json({
          success: false,
          message: 'mockTestId is required to start a test attempt'
        });
      }

      const attemptSession = mockTestAttemptService.startAttempt(studentId, mockTestId);
      return res.status(201).json({
        success: true,
        data: attemptSession
      });
    } catch (err) {
      console.error('Error starting mock test attempt:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to start mock test attempt'
      });
    }
  }

  async saveAnswer(req, res) {
    try {
      const studentId = req.user.id;
      const { attemptId } = req.params;
      const { questionId, selectedOptionIds, timeSpentSeconds, isMarkedForReview } = req.body;

      if (!questionId) {
        return res.status(400).json({
          success: false,
          message: 'questionId is required'
        });
      }

      const result = mockTestAttemptService.saveAnswer(
        attemptId,
        studentId,
        questionId,
        selectedOptionIds,
        timeSpentSeconds,
        isMarkedForReview
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      console.error('Error saving mock test answer:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to save test answer'
      });
    }
  }

  async submitAttempt(req, res) {
    try {
      const studentId = req.user.id;
      const { attemptId } = req.params;
      const { durationSeconds } = req.body;

      const evaluation = mockTestAttemptService.submitAttempt(attemptId, studentId, durationSeconds || 0);

      return res.status(200).json({
        success: true,
        data: evaluation
      });
    } catch (err) {
      console.error('Error submitting mock test attempt:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to submit test attempt'
      });
    }
  }

  async getAttemptResult(req, res) {
    try {
      const studentId = req.user.id;
      const { attemptId } = req.params;

      const result = mockTestAttemptService.getAttemptResult(attemptId, studentId);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      console.error('Error fetching test attempt result:', err);
      return res.status(404).json({
        success: false,
        message: err.message || 'Test attempt not found'
      });
    }
  }

  async getHistory(req, res) {
    try {
      const studentId = req.params.studentId || req.user.id;

      if (req.user.role_name === config.roles.STUDENT && req.user.id !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You cannot view test history of another student'
        });
      }

      const history = mockTestAttemptService.getStudentHistory(studentId);
      return res.status(200).json({
        success: true,
        count: history.length,
        data: history
      });
    } catch (err) {
      console.error('Error fetching mock test history:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve test history'
      });
    }
  }

  /**
   * CRITICAL SECURITY RULE:
   * Only operators and admins can generate mock tests.
   * If a student calls this directly, reject with 403 Forbidden.
   */
  async generateMockTest(req, res) {
    try {
      const userRole = req.user.role_name || req.user.role;
      if (userRole === config.roles.STUDENT) {
        return res.status(403).json({
          success: false,
          code: 'STUDENT_MOCK_GENERATION_PROHIBITED',
          error: 'Forbidden',
          message: "Access Denied: Students are not authorized to generate mock tests. Custom mock drills are operator-controlled and prepared by ZYZU'S academic faculty."
        });
      }

      const { examId, title, totalQuestions = 25, durationMinutes = 30, testType = 'SECTIONAL' } = req.body;
      if (!examId || !title) {
        return res.status(400).json({
          success: false,
          message: 'examId and title are required to generate a mock test'
        });
      }

      const id = `mt-gen-${Date.now()}`;
      db.prepare(`
        INSERT INTO mock_tests (id, exam_id, title, test_type, total_questions, duration_minutes, is_published)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `).run(id, examId, title, testType, totalQuestions, durationMinutes);

      const created = db.prepare('SELECT * FROM mock_tests WHERE id = ?').get(id);

      return res.status(201).json({
        success: true,
        message: 'Draft mock test generated successfully for review',
        data: created
      });
    } catch (err) {
      console.error('Error generating mock test:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate mock test'
      });
    }
  }

  /**
   * Student submits a custom mock drill request
   */
  async createCustomRequest(req, res) {
    try {
      const studentId = req.user.id;
      const studentName = req.user.name || req.body.studentName || "ZYZU'S Student";
      const {
        examId,
        examName,
        subject,
        chapter,
        topic,
        difficulty = 'MODERATE',
        questionCount = 25,
        durationMinutes = 30,
        language = 'Hindi',
        testType = 'Chapter Drill',
        notes
      } = req.body;

      if (!examId || !subject) {
        return res.status(400).json({
          success: false,
          message: 'examId and subject are required'
        });
      }

      const requestId = `FP-MDR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      db.prepare(`
        INSERT INTO custom_mock_drill_requests (
          id, student_id, student_name, exam_id, exam_name, subject, chapter, topic,
          difficulty, question_count, duration_minutes, language, test_type, notes, status, priority
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'REQUESTED', 'MEDIUM')
      `).run(
        requestId, studentId, studentName, examId, examName || 'General Competition',
        subject, chapter || null, topic || null, difficulty, questionCount, durationMinutes,
        language, testType, notes || null
      );

      const created = db.prepare('SELECT * FROM custom_mock_drill_requests WHERE id = ?').get(requestId);

      return res.status(201).json({
        success: true,
        message: "Custom mock drill request submitted successfully to ZYZU'S academic operators.",
        data: created
      });
    } catch (err) {
      console.error('Error creating custom mock request:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit custom drill request'
      });
    }
  }

  /**
   * List custom mock drill requests
   */
  async listCustomRequests(req, res) {
    try {
      const userRole = req.user.role_name || req.user.role;
      let query = 'SELECT * FROM custom_mock_drill_requests';
      const params = [];

      if (userRole === config.roles.STUDENT) {
        query += ' WHERE student_id = ?';
        params.push(req.user.id);
      } else {
        const { status, examId } = req.query;
        const conditions = [];
        if (status && status !== 'ALL') {
          conditions.push('status = ?');
          params.push(status);
        }
        if (examId && examId !== 'ALL') {
          conditions.push('exam_id = ?');
          params.push(examId);
        }
        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
      }

      query += ' ORDER BY created_at DESC';
      const requests = db.prepare(query).all(...params);

      return res.status(200).json({
        success: true,
        count: requests.length,
        data: requests
      });
    } catch (err) {
      console.error('Error listing custom mock requests:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to list custom mock requests'
      });
    }
  }

  /**
   * Get single request details
   */
  async getCustomRequestById(req, res) {
    try {
      const { requestId } = req.params;
      const request = db.prepare('SELECT * FROM custom_mock_drill_requests WHERE id = ?').get(requestId);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }

      const userRole = req.user.role_name || req.user.role;
      if (userRole === config.roles.STUDENT && request.student_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You cannot view another student\'s request'
        });
      }

      return res.status(200).json({
        success: true,
        data: request
      });
    } catch (err) {
      console.error('Error fetching custom mock request:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch custom mock request'
      });
    }
  }

  /**
   * Operator updates request status & message
   */
  async updateCustomRequestStatus(req, res) {
    try {
      const { requestId } = req.params;
      const { status, operatorMessage } = req.body;
      const operatorId = req.user.id;
      const operatorName = req.user.name || 'Academic Operator';

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'status is required'
        });
      }

      const existing = db.prepare('SELECT * FROM custom_mock_drill_requests WHERE id = ?').get(requestId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }

      db.prepare(`
        UPDATE custom_mock_drill_requests
        SET status = ?,
            operator_message = COALESCE(?, operator_message),
            assigned_operator_id = COALESCE(assigned_operator_id, ?),
            assigned_operator_name = COALESCE(assigned_operator_name, ?),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, operatorMessage || null, operatorId, operatorName, requestId);

      const updated = db.prepare('SELECT * FROM custom_mock_drill_requests WHERE id = ?').get(requestId);

      return res.status(200).json({
        success: true,
        message: `Request status updated to ${status}`,
        data: updated
      });
    } catch (err) {
      console.error('Error updating custom mock request status:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to update request status'
      });
    }
  }
}

module.exports = new MockTestController();
