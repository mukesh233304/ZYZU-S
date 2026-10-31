const express = require('express');
const router = express.Router();
const academicSubscriptionController = require('../controllers/academicSubscriptionController');
const { authenticateToken } = require('../middleware/auth');

// Price resolution can be called anonymously or authenticated
router.post('/resolve-price', (req, res, next) => {
  // Optional auth
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}, academicSubscriptionController.resolvePricing);

// Protected endpoints
router.post('/purchase', authenticateToken, academicSubscriptionController.purchase);
router.get('/my', authenticateToken, academicSubscriptionController.getMySubscriptions);
router.get('/entitlement', authenticateToken, academicSubscriptionController.checkEntitlement);

module.exports = router;
