const express = require('express');
const router = express.Router();
const districtAdminController = require('../controllers/districtAdminController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const config = require('../config');

// Require authentication and DISTRICT_ADMIN or SUPER_ADMIN role
router.use(authenticateToken);
router.use(requireRoles(config.roles.DISTRICT_ADMIN, config.roles.SUPER_ADMIN));

router.get('/dashboard', districtAdminController.getOverview);
router.get('/students', districtAdminController.getStudents);
router.get('/teachers', districtAdminController.getTeachers);
router.get('/pending-teachers', districtAdminController.getPendingTeachers);
router.post('/teachers/:id/action', districtAdminController.actionTeacher);
router.get('/libraries', districtAdminController.getLibraries);
router.get('/pending-libraries', districtAdminController.getPendingLibraries);
router.post('/libraries/:id/action', districtAdminController.actionLibrary);
router.get('/requests', districtAdminController.getRequests);
router.post('/requests/:id/assign', districtAdminController.assignTutorRequest);
router.get('/assignments', districtAdminController.getActiveAssignments);
router.get('/revenue', districtAdminController.getRevenue);

module.exports = router;
