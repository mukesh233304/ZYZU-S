const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const config = require('../config');

// Require authentication on all attendance routes
router.use(authenticateToken);

// Student check-in / check-out
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/status', attendanceController.getStatus);
router.get('/history', attendanceController.getHistory);

// Teacher portal endpoints
router.get('/teacher/today', requireRoles(config.roles.TEACHER, config.roles.SUPER_ADMIN), attendanceController.getTeacherToday);
router.post('/teacher/mark', requireRoles(config.roles.TEACHER, config.roles.SUPER_ADMIN), attendanceController.teacherMark);

// Library owner portal endpoints
router.get('/library/today', requireRoles(config.roles.LIBRARY_OWNER, config.roles.SUPER_ADMIN), attendanceController.getLibraryToday);
router.post('/library/mark', requireRoles(config.roles.LIBRARY_OWNER, config.roles.SUPER_ADMIN), attendanceController.libraryMark);

// Admin analytics
router.get('/analytics', requireRoles(config.roles.SUPER_ADMIN, config.roles.DISTRICT_ADMIN), attendanceController.getAnalytics);

module.exports = router;
