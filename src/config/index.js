const path = require('path');
const brand = require('./brand');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  brand: brand.BRAND_CONFIG,
  brandName: brand.BRAND_NAME,
  brandTagline: brand.BRAND_TAGLINE,
  brandFullTitle: brand.BRAND_FULL_TITLE,
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'focuspoint-super-secret-jwt-key-2026-production-ready',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'focuspoint-cookie-signing-secret-key-32chars',
  dbPath: process.env.DB_PATH || path.join(__dirname, '../../data/focuspoint.db'),
  authOtpEnabled: process.env.AUTH_OTP_ENABLED === 'true', // Configurable OTP toggle
  insforge: {
    url: process.env.INSFORGE_URL || 'https://2vp4avxh.ap-southeast.insforge.app',
    anonKey: process.env.INSFORGE_ANON_KEY || '',
    apiKey: process.env.INSFORGE_API_KEY || ''
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // General requests
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20 // Stricter for auth attempts
  },
  roles: {
    STUDENT: 'STUDENT',
    TEACHER: 'TEACHER',
    LIBRARY_OWNER: 'LIBRARY_OWNER',
    DISTRICT_ADMIN: 'DISTRICT_ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN'
  },
  statuses: {
    ACTIVE: 'ACTIVE',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    SUSPENDED: 'SUSPENDED',
    REJECTED: 'REJECTED',
    INACTIVE: 'INACTIVE'
  }
};
