const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const config = require('../config');

// Require authentication and STUDENT role on all student routes
router.use(authenticateToken);
router.use(requireRoles(config.roles.STUDENT));

router.get('/dashboard', studentController.getOverview);
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);
router.get('/teachers', studentController.getTeachers);
router.get('/attendance', studentController.getAttendance);
router.get('/fees', studentController.getFees);
router.get('/library', studentController.getLibrary);
router.get('/bookings', studentController.getBookings);
router.post('/bookings', studentController.createBooking);
router.post('/bookings/:id/cancel', studentController.cancelBooking);
router.get('/notifications', studentController.getNotifications);
router.put('/notifications/:id/read', studentController.markNotificationRead);
router.get('/support', studentController.getSupportTickets);
router.post('/support', studentController.createSupportTicket);

module.exports = router;
