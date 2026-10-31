const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const config = require('../config');

// Public cascading discovery endpoints
router.get('/countries', locationController.getCountries);
router.get('/states', locationController.getStates);
router.get('/states/:id', locationController.getStateById);
router.get('/districts', locationController.getDistricts);
router.get('/districts/:id', locationController.getDistrictById);
router.get('/localities', locationController.getLocalities);
router.get('/areas', locationController.getAreas);
router.get('/search', locationController.searchLocations);
router.get('/stats', locationController.getLocationStats);

// Administrative endpoints
router.post(
  '/states',
  authenticateToken,
  requireRoles(config.roles.SUPER_ADMIN),
  locationController.createState
);

router.post(
  '/districts',
  authenticateToken,
  requireRoles(config.roles.SUPER_ADMIN),
  locationController.createDistrict
);

router.post(
  '/localities',
  authenticateToken,
  requireRoles(config.roles.SUPER_ADMIN, config.roles.DISTRICT_ADMIN),
  locationController.createLocality
);

router.post(
  '/areas',
  authenticateToken,
  requireRoles(config.roles.SUPER_ADMIN, config.roles.DISTRICT_ADMIN),
  locationController.createArea
);

router.put(
  '/:entityType/:id',
  authenticateToken,
  requireRoles(config.roles.SUPER_ADMIN, config.roles.DISTRICT_ADMIN),
  locationController.updateLocationEntity
);

router.delete(
  '/:entityType/:id',
  authenticateToken,
  requireRoles(config.roles.SUPER_ADMIN, config.roles.DISTRICT_ADMIN),
  locationController.deleteLocationEntity
);

module.exports = router;
