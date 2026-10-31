const express = require('express');
const router = express.Router();
const db = require('../db/database');
const config = require('../config');

// Public route to retrieve active districts for registration select fields
router.get('/districts', (req, res) => {
  try {
    const districts = db.prepare('SELECT id, name, state, code FROM districts WHERE is_active = 1 ORDER BY name ASC').all();
    return res.status(200).json({
      success: true,
      districts
    });
  } catch (err) {
    console.error('Error fetching districts:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve districts'
    });
  }
});

// Public route to retrieve public platform flags
router.get('/config', (req, res) => {
  return res.status(200).json({
    success: true,
    authOtpEnabled: config.authOtpEnabled,
    roles: Object.values(config.roles)
  });
});

// Phase 3 Discovery & Search Engine Endpoints
const discoveryController = require('../controllers/discoveryController');
router.get('/tutors', discoveryController.getTutors);
router.get('/tutors/:id', discoveryController.getTutorById);
router.get('/libraries', discoveryController.getLibraries);
router.get('/libraries/:id', discoveryController.getLibraryById);
router.get('/search-meta', discoveryController.getSearchMetadata);

module.exports = router;
