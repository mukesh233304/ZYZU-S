const express = require('express');
const router = express.Router();
const mockTestController = require('../controllers/mockTestController');
const { authenticateToken } = require('../middleware/auth');
const config = require('../config');

/**
 * CRITICAL BUSINESS RULE ENFORCEMENT:
 * Students must NEVER be able to generate mock tests.
 * Any attempt by a Student directly hitting /generate or /custom-mock/generate
 * returns a strict 403 Forbidden with STUDENT_MOCK_GENERATION_PROHIBITED code.
 */
function requireOperatorOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  const role = req.user.role_name || req.user.role;
  if (role === 'STUDENT' || role === config.roles.STUDENT) {
    return res.status(403).json({
      success: false,
      code: 'STUDENT_MOCK_GENERATION_PROHIBITED',
      error: 'Forbidden',
      message: "Access Denied: Students are not authorized to directly generate mock tests. Custom mock drills are operator-controlled and prepared by ZYZU'S academic faculty. Please submit a Custom Mock Drill Request."
    });
  }
  next();
}

// Public/catalog endpoints (can be browsed before login)
router.get('/exams', mockTestController.listExams);
router.get('/list', mockTestController.listMockTests);

// Student Custom Mock Drill Request System (Students REQUEST, Operators PREPARE & PUBLISH)
router.post('/custom-requests', authenticateToken, mockTestController.createCustomRequest);
router.get('/custom-requests', authenticateToken, mockTestController.listCustomRequests);
router.get('/custom-requests/:requestId', authenticateToken, mockTestController.getCustomRequestById);
router.patch('/custom-requests/:requestId/status', authenticateToken, requireOperatorOrAdmin, mockTestController.updateCustomRequestStatus);

// Operator-only Mock Test Generation Endpoints (STRICT 403 FOR STUDENTS)
router.post('/generate', authenticateToken, requireOperatorOrAdmin, mockTestController.generateMockTest);
router.post('/custom-mock/generate', authenticateToken, requireOperatorOrAdmin, mockTestController.generateMockTest);
router.post('/ai-builder/generate', authenticateToken, requireOperatorOrAdmin, mockTestController.generateMockTest);

// Authenticated endpoints for taking tests and viewing results
router.post('/attempt/start', authenticateToken, mockTestController.startAttempt);
router.post('/attempt/:attemptId/answer', authenticateToken, mockTestController.saveAnswer);
router.post('/attempt/:attemptId/submit', authenticateToken, mockTestController.submitAttempt);
router.get('/attempt/:attemptId/result', authenticateToken, mockTestController.getAttemptResult);
router.get('/history', authenticateToken, mockTestController.getHistory);
router.get('/history/:studentId', authenticateToken, mockTestController.getHistory);

module.exports = router;
