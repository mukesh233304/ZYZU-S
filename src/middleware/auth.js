const rateLimit = require('express-rate-limit');
const db = require('../db/database');
const config = require('../config');
const { verifyToken } = require('../utils/token');

// Main JWT Authentication Middleware
function authenticateToken(req, res, next) {
  let token = null;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    // 2. Check HTTP-only cookie
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session'
    });
  }

  // Look up user in database to ensure account is fresh and valid
  const user = db.prepare(`
    SELECT
      u.id,
      u.email,
      u.mobile,
      u.role_id,
      u.district_id,
      u.account_status,
      r.name AS role_name,
      d.name AS district_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN districts d ON u.district_id = d.id
    WHERE u.id = ?
  `).get(decoded.userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User account no longer exists'
    });
  }

  // Check account lifecycle status
  if (user.account_status === config.statuses.SUSPENDED) {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_SUSPENDED',
      message: 'Your account has been suspended. Please contact platform administration.'
    });
  }

  if (user.account_status === config.statuses.REJECTED) {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_REJECTED',
      message: 'Your application was rejected. Please contact support for more details.'
    });
  }

  if (user.account_status === config.statuses.INACTIVE) {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_INACTIVE',
      message: 'Your account is inactive. Please contact support to reactivate.'
    });
  }

  // Fetch permissions for the role
  const permissions = db.prepare(`
    SELECT p.name
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    WHERE rp.role_id = ?
  `).all(user.role_id).map(p => p.name);

  req.user = {
    id: user.id,
    email: user.email,
    mobile: user.mobile,
    role: user.role_name,
    roleId: user.role_id,
    districtId: user.district_id,
    districtName: user.district_name,
    accountStatus: user.account_status,
    isPending: user.account_status === config.statuses.PENDING_APPROVAL,
    permissions
  };

  next();
}

// Role-based Access Control (RBAC)
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
}

// Operational access gate (Requires ACTIVE account)
function requireApproved(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.accountStatus !== config.statuses.ACTIVE) {
    return res.status(403).json({
      success: false,
      code: 'APPROVAL_REQUIRED',
      message: 'This feature requires an approved and active account.'
    });
  }

  next();
}

// Rate limiters for security against brute-force
const authRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
  }
});

module.exports = {
  authenticateToken,
  requireRoles,
  requireApproved,
  authRateLimiter
};
