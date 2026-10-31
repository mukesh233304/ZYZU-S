const express = require('express');
const router = express.Router();
const librarySubscriptionController = require('../controllers/librarySubscriptionController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const config = require('../config');

// 1. Public Endpoints
router.get('/plans', librarySubscriptionController.getPlans);
router.post('/calculate-price', librarySubscriptionController.calculatePrice);

// 2. Library Owner Endpoints (also accessible by Super Admin for testing/management)
router.post(
  '/create',
  authenticateToken,
  requireRoles(config.roles.LIBRARY_OWNER, config.roles.SUPER_ADMIN),
  librarySubscriptionController.createSubscription
);

router.get(
  '/my-subscription',
  authenticateToken,
  requireRoles(config.roles.LIBRARY_OWNER, config.roles.SUPER_ADMIN),
  librarySubscriptionController.getMySubscription
);

router.post(
  '/cancel',
  authenticateToken,
  requireRoles(config.roles.LIBRARY_OWNER, config.roles.SUPER_ADMIN),
  librarySubscriptionController.requestCancellation
);

router.post(
  '/renew',
  authenticateToken,
  requireRoles(config.roles.LIBRARY_OWNER, config.roles.SUPER_ADMIN),
  librarySubscriptionController.renewSubscription
);

router.patch(
  '/auto-renew',
  authenticateToken,
  requireRoles(config.roles.LIBRARY_OWNER, config.roles.SUPER_ADMIN),
  librarySubscriptionController.toggleAutoRenew
);

router.get(
  '/payments',
  authenticateToken,
  requireRoles(config.roles.LIBRARY_OWNER, config.roles.SUPER_ADMIN),
  librarySubscriptionController.getMyPayments
);

router.get(
  '/invoice/:invoiceNo',
  authenticateToken,
  requireRoles(config.roles.LIBRARY_OWNER, config.roles.DISTRICT_ADMIN, config.roles.SUPER_ADMIN),
  librarySubscriptionController.getInvoice
);

// 3. Admin Endpoints (District Admin strictly scoped, Super Admin platform-wide)
router.get(
  '/admin/rules',
  authenticateToken,
  requireRoles(config.roles.DISTRICT_ADMIN, config.roles.SUPER_ADMIN),
  librarySubscriptionController.getAdminRules
);

router.post(
  '/admin/rules',
  authenticateToken,
  requireRoles(config.roles.DISTRICT_ADMIN, config.roles.SUPER_ADMIN),
  librarySubscriptionController.saveAdminRule
);

router.delete(
  '/admin/rules/:id',
  authenticateToken,
  requireRoles(config.roles.DISTRICT_ADMIN, config.roles.SUPER_ADMIN),
  librarySubscriptionController.deleteAdminRule
);

router.get(
  '/admin/subscriptions',
  authenticateToken,
  requireRoles(config.roles.DISTRICT_ADMIN, config.roles.SUPER_ADMIN),
  librarySubscriptionController.getAllSubscriptions
);

router.get(
  '/admin/cancellations',
  authenticateToken,
  requireRoles(config.roles.DISTRICT_ADMIN, config.roles.SUPER_ADMIN),
  librarySubscriptionController.getCancellations
);

router.get(
  '/admin/analytics',
  authenticateToken,
  requireRoles(config.roles.DISTRICT_ADMIN, config.roles.SUPER_ADMIN),
  librarySubscriptionController.getAdminAnalytics
);

module.exports = router;
