const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const config = require('../config');

// Require authentication and TEACHER role
router.use(authenticateToken);
router.use(requireRoles(config.roles.TEACHER));

router.get('/dashboard', teacherController.getOverview);
router.get('/profile', teacherController.getProfile);
router.put('/profile', teacherController.updateProfile);
router.get('/students', teacherController.getStudents);
router.get('/attendance', teacherController.getAttendance);
router.post('/attendance', teacherController.markAttendance);
router.get('/revenue', teacherController.getRevenue);
router.get('/schedule', teacherController.getSchedule);
router.post('/schedule', teacherController.addScheduleSlot);
router.delete('/schedule/:id', teacherController.deleteScheduleSlot);
router.get('/bookings', teacherController.getBookings);
router.post('/bookings/:id/respond', teacherController.respondBooking);
router.get('/notifications', teacherController.getNotifications);
router.get('/verification-status', teacherController.getVerificationStatus);

module.exports = router;
