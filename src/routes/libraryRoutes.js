const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const config = require('../config');

// Require authentication and LIBRARY_OWNER role
router.use(authenticateToken);
router.use(requireRoles(config.roles.LIBRARY_OWNER));

router.get('/dashboard', libraryController.getOverview);
router.get('/profile', libraryController.getProfile);
router.put('/profile', libraryController.updateProfile);
router.get('/students', libraryController.getStudents);
router.post('/students/walk-in', libraryController.addWalkInStudent);
router.get('/seats', libraryController.getSeats);
router.get('/shifts', libraryController.getShifts);
router.post('/shifts', libraryController.addShift);
router.get('/attendance', libraryController.getAttendance);
router.post('/attendance', libraryController.markAttendance);
router.get('/fees', libraryController.getFees);
router.get('/revenue', libraryController.getRevenue);
router.get('/bookings', libraryController.getBookings);
router.post('/bookings/:id/respond', libraryController.respondBooking);
router.get('/notifications', libraryController.getNotifications);

module.exports = router;
