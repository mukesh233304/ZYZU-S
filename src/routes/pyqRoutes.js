const express = require('express');
const router = express.Router();
const pyqController = require('../controllers/pyqController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const config = require('../config');

// Public listing
router.get('/papers', pyqController.listPapers);

// Operator / Admin endpoints
router.post(
  '/digitize',
  authenticateToken,
  requireRoles(config.roles.SUPER_ADMIN, config.roles.DISTRICT_ADMIN, 'OPERATOR'),
  pyqController.digitizePaper
);

router.post(
  '/:id/synthesize-cbt',
  authenticateToken,
  requireRoles(config.roles.SUPER_ADMIN, config.roles.DISTRICT_ADMIN, 'OPERATOR'),
  pyqController.synthesizeCbt
);

module.exports = router;
