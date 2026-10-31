const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const config = require('../config');

// Require authentication on all admin routes
router.use(authenticateToken);

// Super Admin Only: Create District Admin (strictly ONE ACTIVE per district)
router.post(
  '/district-admins',
  requireRoles(config.roles.SUPER_ADMIN),
  adminController.createDistrictAdmin
);

// Super Admin Only: List District Admins
router.get(
  '/district-admins',
  requireRoles(config.roles.SUPER_ADMIN),
  adminController.listDistrictAdmins
);

// Super Admin Only: Deactivate District Admin
router.put(
  '/district-admins/:assignment_id/deactivate',
  requireRoles(config.roles.SUPER_ADMIN),
  adminController.deactivateDistrictAdmin
);

// Super Admin & District Admin: List Pending Teacher/Library Approvals
router.get(
  '/pending-approvals',
  requireRoles(config.roles.SUPER_ADMIN, config.roles.DISTRICT_ADMIN),
  adminController.listPendingApprovals
);

// Super Admin & District Admin: Approve User
router.post(
  '/users/:user_id/approve',
  requireRoles(config.roles.SUPER_ADMIN, config.roles.DISTRICT_ADMIN),
  adminController.approveUser
);

// Super Admin Only: Suspend User
router.post(
  '/users/:user_id/suspend',
  requireRoles(config.roles.SUPER_ADMIN),
  adminController.suspendUser
);

module.exports = router;
