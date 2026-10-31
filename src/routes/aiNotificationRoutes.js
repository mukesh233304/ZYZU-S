const express = require('express');
const router = express.Router();
const aiNotificationController = require('../controllers/aiNotificationController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const { verifyToken } = require('../utils/token');
const db = require('../db/database');
const config = require('../config');

// Optional auth helper to attach user if token exists, without rejecting guest users
function optionalAuth(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        const user = db.prepare('SELECT id, name, mobile, role_id FROM users WHERE id = ?').get(decoded.userId);
        if (user) {
          req.user = user;
        }
      }
    } catch (e) {
      // Ignore token failure for optional auth
    }
  }
  next();
}

// =========================================================================
// 1. PUBLIC & EVENT ACTIVITY ENDPOINTS
// =========================================================================

// Log user activity (search, application, etc.) & trigger AI recommendation
router.post('/events', optionalAuth, aiNotificationController.logActivityEvent);

// Query direct offer recommendations
router.get('/recommendations', aiNotificationController.getRecommendations);

// Track clicks & conversions
router.post('/track-click', aiNotificationController.trackClick);
router.post('/track-conversion', aiNotificationController.trackConversion);

// User notification preferences (Guest or Authenticated)
router.get('/preferences', optionalAuth, aiNotificationController.getUserPreferences);
router.put('/preferences', optionalAuth, aiNotificationController.updateUserPreferences);

// WhatsApp Cloud API Webhook & Inbound Simulation
router.get('/whatsapp/webhook', aiNotificationController.verifyWhatsAppWebhook);
router.post('/whatsapp/webhook', aiNotificationController.handleWhatsAppWebhook);
router.post('/whatsapp/simulate-inbound', aiNotificationController.simulateInboundWhatsApp);

// =========================================================================
// 2. AUTHENTICATED USER IN-APP NOTIFICATIONS
// =========================================================================

router.get('/in-app', authenticateToken, aiNotificationController.getUserInAppNotifications);
router.patch('/in-app/:id/read', authenticateToken, aiNotificationController.markNotificationRead);
router.post('/in-app/read-all', authenticateToken, aiNotificationController.markAllNotificationsRead);

// =========================================================================
// 3. SUPER ADMIN COMMAND CENTER CONTROLS
// =========================================================================

router.get(
  '/admin/config',
  authenticateToken,
  requireRoles(config.roles.SUPER_ADMIN),
  aiNotificationController.getAdminConfig
);

router.put(
  '/admin/config',
  authenticateToken,
  requireRoles(config.roles.SUPER_ADMIN),
  aiNotificationController.updateAdminConfig
);

router.get(
  '/admin/audit-logs',
  authenticateToken,
  requireRoles(config.roles.SUPER_ADMIN),
  aiNotificationController.getAdminAuditLogs
);

router.get(
  '/admin/delivery-queue',
  authenticateToken,
  requireRoles(config.roles.SUPER_ADMIN),
  aiNotificationController.getAdminDeliveryQueue
);

router.post(
  '/admin/delivery-queue/:id/retry',
  authenticateToken,
  requireRoles(config.roles.SUPER_ADMIN),
  aiNotificationController.retryAdminDelivery
);

router.get(
  '/admin/analytics',
  authenticateToken,
  requireRoles(config.roles.SUPER_ADMIN),
  aiNotificationController.getAdminAnalytics
);

module.exports = router;
