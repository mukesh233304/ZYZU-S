const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const config = require('../config');

// Strictly require SUPER_ADMIN role
router.use(authenticateToken);
router.use(requireRoles(config.roles.SUPER_ADMIN));

router.get('/dashboard', superAdminController.getGlobalOverview);
router.get('/districts', superAdminController.getDistricts);
router.get('/teachers', superAdminController.getAllTeachers);
router.get('/libraries', superAdminController.getAllLibraries);

module.exports = router;
