const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config');

// Generate JWT token with user context
function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return null;
  }
}

// Password hashing
function hashPassword(plainPassword) {
  return bcrypt.hashSync(plainPassword, 10);
}

// Password comparison
function comparePassword(plainPassword, hash) {
  return bcrypt.compareSync(plainPassword, hash);
}

// Random OTP generator
function generateOtp(digits = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Safe user serializer (never exposes password_hash or internal secrets)
function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateOtp,
  sanitizeUser
};
