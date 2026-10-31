const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  validateStudentRegistration,
  validateTeacherRegistration,
  validateLibraryOwnerRegistration,
  validateLogin
} = require('../middleware/validation');
const { authenticateToken, authRateLimiter } = require('../middleware/auth');
const { teacherUpload } = require('../middleware/upload');

// Apply rate limiter to sensitive authentication routes
router.use('/login', authRateLimiter);
router.use('/register', authRateLimiter);
router.use('/request-otp', authRateLimiter);

// 1. Student Registration
router.post('/register/student', validateStudentRegistration, authController.registerStudent);

// 2. Teacher Registration (with file upload support)
router.post('/register/teacher', teacherUpload, validateTeacherRegistration, authController.registerTeacher);

// 3. Library Owner Registration
router.post('/register/library-owner', validateLibraryOwnerRegistration, authController.registerLibraryOwner);

// 4. Unified Login (Email/Mobile + Password)
router.post('/login', validateLogin, authController.login);

// 5. Configurable / Optional OTP routes
router.post('/request-otp', authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);

// 6. Password recovery routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// 7. Session profile & verification
router.get('/me', authenticateToken, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
