const express = require('express');
const router = express.Router();
const qrPassController = require('../controllers/qrPassController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const config = require('../config');

// All QR pass routes require authentication
router.use(authenticateToken);

// Student fetching their own pass
router.get('/my-pass', requireRoles(config.roles.STUDENT), qrPassController.getMyPass);

// Validate QR token (Accessible to student, teacher, library owner, or admin upon scan)
router.post('/validate', qrPassController.validateToken);

// Reissue pass
router.post('/reissue', qrPassController.reissuePass);

// Admin audit logs
router.get('/audit-logs', qrPassController.getAuditLogs);

module.exports = router;
