const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const config = require('../config');

// 1. Public / Open Endpoints
router.post('/calculate-price', demoController.calculateDemoPrice);

// 2. Student Demo Booking Endpoints
router.get(
  '/eligibility',
  authenticateToken,
  demoController.checkEligibility
);

router.post(
  '/book',
  authenticateToken,
  requireRoles(config.roles.STUDENT),
  demoController.createDemoBooking
);

router.post(
  '/process-payment',
  authenticateToken,
  requireRoles(config.roles.STUDENT),
  demoController.processDemoPayment
);

router.get(
  '/my-bookings',
  authenticateToken,
  requireRoles(config.roles.STUDENT),
  demoController.getStudentDemos
);

router.get(
  '/booking/:id',
  authenticateToken,
  demoController.getDemoById
);

// 3. QR Verification Endpoint (Teachers, Library Owners, District Admins, Super Admins)
router.post(
  '/verify-qr',
  authenticateToken,
  requireRoles(
    config.roles.TEACHER,
    config.roles.LIBRARY_OWNER,
    config.roles.DISTRICT_ADMIN,
    config.roles.SUPER_ADMIN
  ),
  demoController.verifyDemoQr
);

// 4. Admin Management Endpoints (Pricing rules & booking audits)
router.get(
  '/admin/pricing-rules',
  authenticateToken,
  requireRoles(config.roles.DISTRICT_ADMIN, config.roles.SUPER_ADMIN),
  demoController.getPricingRules
);

router.post(
  '/admin/pricing-rules',
  authenticateToken,
  requireRoles(config.roles.DISTRICT_ADMIN, config.roles.SUPER_ADMIN),
  demoController.createPricingRule
);

router.put(
  '/admin/pricing-rules/:id',
  authenticateToken,
  requireRoles(config.roles.DISTRICT_ADMIN, config.roles.SUPER_ADMIN),
  demoController.updatePricingRule
);

router.delete(
  '/admin/pricing-rules/:id',
  authenticateToken,
  requireRoles(config.roles.DISTRICT_ADMIN, config.roles.SUPER_ADMIN),
  demoController.deletePricingRule
);

router.get(
  '/admin/bookings',
  authenticateToken,
  requireRoles(config.roles.DISTRICT_ADMIN, config.roles.SUPER_ADMIN),
  demoController.getAllDemoBookings
);

module.exports = router;
