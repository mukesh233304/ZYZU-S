const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const districtAdminRoutes = require('./routes/districtAdminRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const demoRoutes = require('./routes/demoRoutes');
const librarySubscriptionRoutes = require('./routes/librarySubscriptionRoutes');
const academicRoutes = require('./routes/academicRoutes');
const mockTestRoutes = require('./routes/mockTestRoutes');
const academicSubscriptionRoutes = require('./routes/academicSubscriptionRoutes');
const pyqRoutes = require('./routes/pyqRoutes');
const locationRoutes = require('./routes/locationRoutes');
const advertisementRoutes = require('./routes/advertisementRoutes');
const qrPassRoutes = require('./routes/qrPassRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const whatsappNotificationRoutes = require('./routes/whatsappNotificationRoutes');
const bookingConfirmationRoutes = require('./routes/bookingConfirmationRoutes');
const aiNotificationRoutes = require('./routes/aiNotificationRoutes');
const config = require('./config');

const app = express();

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false // Allows CDNs for fonts and fontawesome
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookieSecret));

// Static files (CSS, JS, uploads, images)
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/district-admin', districtAdminRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/demos', demoRoutes);
app.use('/api/library-subscriptions', librarySubscriptionRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/mock-tests', mockTestRoutes);
app.use('/mock-tests', mockTestRoutes);
app.use('/api/academic-subscriptions', academicSubscriptionRoutes);
app.use('/api/pyq', pyqRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/qr-pass', qrPassRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notifications/whatsapp', whatsappNotificationRoutes);
app.use('/api/bookings', bookingConfirmationRoutes);
app.use('/api/ai-notifications', aiNotificationRoutes);

// Frontend Page Route Mappings
const publicDir = path.join(__dirname, '../public');

app.get('/login', (req, res) => res.sendFile(path.join(publicDir, 'login.html')));
app.get('/register/student', (req, res) => res.sendFile(path.join(publicDir, 'register-student.html')));
app.get('/register/teacher', (req, res) => res.sendFile(path.join(publicDir, 'register-teacher.html')));
app.get('/register/library-owner', (req, res) => res.sendFile(path.join(publicDir, 'register-library-owner.html')));
app.get('/forgot-password', (req, res) => res.sendFile(path.join(publicDir, 'forgot-password.html')));
app.get('/reset-password', (req, res) => res.sendFile(path.join(publicDir, 'reset-password.html')));
app.get('/verify-otp', (req, res) => res.sendFile(path.join(publicDir, 'verify-otp.html')));

// Dashboard & Portal Routes
app.get(['/dashboard/student', '/student*'], (req, res) => res.sendFile(path.join(publicDir, 'dashboard-student.html')));
app.get(['/dashboard/teacher', '/teacher*'], (req, res) => res.sendFile(path.join(publicDir, 'dashboard-teacher.html')));
app.get(['/dashboard/library-owner', '/library-owner*'], (req, res) => res.sendFile(path.join(publicDir, 'dashboard-library-owner.html')));
app.get(['/dashboard/district-admin', '/district-admin*'], (req, res) => res.sendFile(path.join(publicDir, 'dashboard-district-admin.html')));
app.get(['/dashboard/super-admin', '/super-admin*'], (req, res) => res.sendFile(path.join(publicDir, 'dashboard-super-admin.html')));
app.get('/verify/doc*', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));

// Public Website Pages
app.get('/', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(publicDir, 'about.html')));
app.get('/tutors', (req, res) => res.sendFile(path.join(publicDir, 'tutors.html')));
app.get('/explore/tutors', (req, res) => res.sendFile(path.join(publicDir, 'tutors.html')));
app.get('/libraries', (req, res) => res.sendFile(path.join(publicDir, 'libraries.html')));
app.get('/explore/libraries', (req, res) => res.sendFile(path.join(publicDir, 'libraries.html')));
app.get('/become-teacher', (req, res) => res.sendFile(path.join(publicDir, 'become-teacher.html')));
app.get('/list-library', (req, res) => res.sendFile(path.join(publicDir, 'list-library.html')));
app.get('/how-it-works', (req, res) => res.sendFile(path.join(publicDir, 'how-it-works.html')));
app.get('/pricing', (req, res) => res.sendFile(path.join(publicDir, 'pricing.html')));
app.get('/faq', (req, res) => res.sendFile(path.join(publicDir, 'faq.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(publicDir, 'contact.html')));

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred. Please try again later.'
  });
});

module.exports = app;
