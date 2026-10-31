const express = require('express');
const router = express.Router();
const whatsappNotificationController = require('../controllers/whatsappNotificationController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const config = require('../config');

router.use(authenticateToken);

// Student fetches their WhatsApp messages
router.get('/student', requireRoles(config.roles.STUDENT), whatsappNotificationController.getStudentNotifications);

// Admin stats
router.get('/admin/stats', requireRoles(config.roles.SUPER_ADMIN, config.roles.DISTRICT_ADMIN), whatsappNotificationController.getAdminStats);

// Retry failed notification
router.post('/retry/:id', requireRoles(config.roles.SUPER_ADMIN, config.roles.DISTRICT_ADMIN), whatsappNotificationController.retryNotification);

module.exports = router;
