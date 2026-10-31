const express = require('express');
const router = express.Router();
const academicPerformanceController = require('../controllers/academicPerformanceController');
const { authenticateToken } = require('../middleware/auth');

// Protected endpoints
router.use(authenticateToken);

// Student growth & performance analytics
router.get('/performance', academicPerformanceController.getStudentPerformance);
router.get('/performance/:studentId', academicPerformanceController.getStudentPerformance);

// Teacher records test marks for allotted student
router.post('/teacher/test-entry', academicPerformanceController.recordTeacherTestResult);

// Mistake Book
router.get('/mistakes', academicPerformanceController.getMistakeBook);
router.get('/mistakes/:studentId', academicPerformanceController.getMistakeBook);
router.patch('/mistakes/:id/status', academicPerformanceController.updateMistakeStatus);

module.exports = router;
