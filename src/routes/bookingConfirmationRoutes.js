const express = require('express');
const router = express.Router();
const bookingConfirmationController = require('../controllers/bookingConfirmationController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const config = require('../config');

router.use(authenticateToken);

// Confirm booking event (Students, Teachers, Library Owners, or Admins)
router.post('/confirm', bookingConfirmationController.confirmBooking);

// Fetch confirmation event
router.get('/confirmation/:bookingId', bookingConfirmationController.getConfirmation);

// Admin analytics
router.get('/analytics', requireRoles(config.roles.SUPER_ADMIN, config.roles.DISTRICT_ADMIN), bookingConfirmationController.getAnalytics);

module.exports = router;
