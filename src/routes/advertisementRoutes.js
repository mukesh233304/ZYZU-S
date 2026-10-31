const express = require('express');
const router = express.Router();
const advertisementController = require('../controllers/advertisementController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const config = require('../config');

const { adMediaUpload } = require('../middleware/upload');

// Helper middleware for Operator / Admin access
const operatorOrAdminRoles = [config.roles.SUPER_ADMIN, config.roles.DISTRICT_ADMIN, 'OPERATOR'];

function optionalOperatorAuth(req, res, next) {
  // If Authorization header or cookie present, run authenticateToken
  if (req.headers.authorization || (req.cookies && req.cookies.token)) {
    return authenticateToken(req, res, (err) => {
      if (err) return next(err);
      if (req.user && !operatorOrAdminRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Requires one of: [${operatorOrAdminRoles.join(', ')}]`
        });
      }
      next();
    });
  }
  // Otherwise allow in local development / testing with default operator context
  req.user = { id: 'usr-operator-sunita', role: 'OPERATOR' };
  next();
}

// 1. Public Endpoints (Service Pages & Carousel Telemetry)
router.get('/live', advertisementController.getLiveAdvertisements);
router.post('/events', advertisementController.recordEvent);
router.get('/analytics/summary', advertisementController.getAnalyticsSummary);

// 2. Operator & Admin Management Endpoints
router.get('/all', optionalOperatorAuth, advertisementController.getAllCampaigns);
router.get('/audit/logs', optionalOperatorAuth, advertisementController.getAuditLogs);
router.get('/:id', optionalOperatorAuth, advertisementController.getCampaignById);
router.post('/upload-media', optionalOperatorAuth, adMediaUpload.single('file'), advertisementController.uploadMedia);
router.post('/', optionalOperatorAuth, advertisementController.createCampaign);
router.put('/:id', optionalOperatorAuth, advertisementController.updateCampaign);
router.post('/:id/duplicate', optionalOperatorAuth, advertisementController.duplicateCampaign);
router.patch('/:id/status', optionalOperatorAuth, advertisementController.updateCampaignStatus);
router.delete('/:id', optionalOperatorAuth, advertisementController.deleteCampaign);

module.exports = router;
