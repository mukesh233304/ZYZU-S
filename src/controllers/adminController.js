const crypto = require('crypto');
const db = require('../db/database');
const config = require('../config');
const { hashPassword } = require('../utils/token');
const { cleanString, normalizeMobile, validatePasswordStrength } = require('../middleware/validation');

// 1. Create District Admin (SUPER ADMIN ONLY)
// Business rule: Each District can have strictly ONE ACTIVE DISTRICT ADMIN (enforced in DB)
exports.createDistrictAdmin = (req, res) => {
  const { full_name, email, mobile, password, district_id } = req.body;

  const errors = {};
  if (!full_name || cleanString(full_name).length < 2) {
    errors.full_name = 'Full name is required';
  }

  const normalizedPhone = normalizeMobile(mobile);
  if (!normalizedPhone || !/^[6-9]\d{9}$/.test(normalizedPhone)) {
    errors.mobile = 'Valid 10-digit Indian mobile number is required';
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Valid email address is required';
  }

  const pwdErr = validatePasswordStrength(password);
  if (pwdErr) {
    errors.password = pwdErr;
  }

  const distId = parseInt(district_id, 10);
  if (isNaN(distId)) {
    errors.district_id = 'Valid district ID is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // Check if district exists
    const district = db.prepare('SELECT id, name FROM districts WHERE id = ?').get(distId);
    if (!district) {
      return res.status(404).json({
        success: false,
        message: 'District not found'
      });
    }

    // Check unique email and mobile
    const existingUser = db.prepare('SELECT id, email, mobile FROM users WHERE email = ? OR mobile = ?').get(cleanEmail, normalizedPhone);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email or mobile number already exists'
      });
    }

    // Check if district already has an active district admin
    const activeAdmin = db.prepare(`
      SELECT da.id, u.email, u.mobile
      FROM district_admins da
      JOIN users u ON da.user_id = u.id
      WHERE da.district_id = ? AND da.status = 'ACTIVE'
    `).get(distId);

    if (activeAdmin) {
      return res.status(409).json({
        success: false,
        code: 'DISTRICT_ADMIN_EXISTS',
        message: `District "${district.name}" already has an ACTIVE District Admin (${activeAdmin.email}). Deactivate the current admin before assigning a new one.`
      });
    }

    const role = db.prepare('SELECT id FROM roles WHERE name = ?').get(config.roles.DISTRICT_ADMIN);
    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    // Database transaction to insert user, role, and district_admin assignment
    // DB unique index `idx_one_active_district_admin` provides double safety against race conditions
    const createTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, email, mobile, password_hash, role_id, district_id, account_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(userId, cleanEmail, normalizedPhone, passwordHash, role.id, distId, config.statuses.ACTIVE);

      db.prepare(`
        INSERT INTO user_roles (user_id, role_id)
        VALUES (?, ?)
      `).run(userId, role.id);

      db.prepare(`
        INSERT INTO district_admins (user_id, district_id, status, assigned_by)
        VALUES (?, ?, 'ACTIVE', ?)
      `).run(userId, distId, req.user.id);
    });

    createTx();

    return res.status(201).json({
      success: true,
      message: `District Admin created successfully for ${district.name}!`,
      districtAdmin: {
        userId,
        fullName: cleanString(full_name),
        email: cleanEmail,
        mobile: normalizedPhone,
        districtId: distId,
        districtName: district.name,
        status: 'ACTIVE'
      }
    });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed: index \'idx_one_active_district_admin\'')) {
      return res.status(409).json({
        success: false,
        code: 'DISTRICT_ADMIN_EXISTS',
        message: 'Constraint violation: This district already has an active District Admin.'
      });
    }
    console.error('Error creating district admin:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create district admin due to a server error.'
    });
  }
};

// 2. List District Admins
exports.listDistrictAdmins = (req, res) => {
  try {
    const admins = db.prepare(`
      SELECT
        da.id AS assignment_id,
        da.status AS admin_status,
        da.assigned_at,
        u.id AS user_id,
        u.email,
        u.mobile,
        u.account_status,
        d.id AS district_id,
        d.name AS district_name,
        d.code AS district_code
      FROM district_admins da
      JOIN users u ON da.user_id = u.id
      JOIN districts d ON da.district_id = d.id
      ORDER BY d.name ASC, da.status ASC
    `).all();

    return res.status(200).json({
      success: true,
      districtAdmins: admins
    });
  } catch (err) {
    console.error('Error listing district admins:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch district admins'
    });
  }
};

// 3. Deactivate / Toggle District Admin
exports.deactivateDistrictAdmin = (req, res) => {
  const { assignment_id } = req.params;

  try {
    const record = db.prepare('SELECT id, user_id, district_id, status FROM district_admins WHERE id = ?').get(assignment_id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'District admin assignment not found'
      });
    }

    db.transaction(() => {
      db.prepare("UPDATE district_admins SET status = 'INACTIVE' WHERE id = ?").run(assignment_id);
      db.prepare("UPDATE users SET account_status = 'INACTIVE' WHERE id = ?").run(record.user_id);
    })();

    return res.status(200).json({
      success: true,
      message: 'District admin deactivated successfully.'
    });
  } catch (err) {
    console.error('Error deactivating district admin:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate district admin'
    });
  }
};

// 4. List Pending Teachers and Library Owners for Approval
exports.listPendingApprovals = (req, res) => {
  try {
    let query = `
      SELECT
        u.id AS user_id,
        u.email,
        u.mobile,
        u.account_status,
        u.created_at,
        r.name AS role_name,
        d.name AS district_name,
        tp.full_name AS teacher_name,
        tp.qualification,
        tp.experience_years,
        tp.subjects,
        tp.teaching_mode,
        tp.expected_fee,
        tp.profile_photo_url,
        tp.verification_doc_urls,
        lop.owner_name AS library_owner_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN districts d ON u.district_id = d.id
      LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
      LEFT JOIN library_owner_profiles lop ON u.id = lop.user_id
      WHERE u.account_status = 'PENDING_APPROVAL'
    `;

    // If district admin, filter strictly by their assigned district
    const params = [];
    if (req.user.role === config.roles.DISTRICT_ADMIN) {
      query += ' AND u.district_id = ?';
      params.push(req.user.districtId);
    }

    query += ' ORDER BY u.created_at DESC';

    const pendingList = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      pendingApprovals: pendingList.map(item => ({
        ...item,
        subjects: item.subjects ? JSON.parse(item.subjects) : [],
        verificationDocs: item.verification_doc_urls ? JSON.parse(item.verification_doc_urls) : []
      }))
    });
  } catch (err) {
    console.error('Error listing pending approvals:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pending approvals'
    });
  }
};

// 5. Approve User (Teacher or Library Owner)
exports.approveUser = (req, res) => {
  const { user_id } = req.params;

  try {
    const user = db.prepare(`
      SELECT u.id, u.role_id, u.district_id, u.account_status, r.name AS role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `).get(user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    // District Admin can only approve users within their assigned district
    if (req.user.role === config.roles.DISTRICT_ADMIN && user.district_id !== req.user.districtId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only approve accounts in your assigned district'
      });
    }

    db.transaction(() => {
      db.prepare("UPDATE users SET account_status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(user_id);

      // If teacher, allow public visibility once approved
      if (user.role_name === config.roles.TEACHER) {
        db.prepare('UPDATE teacher_profiles SET is_publicly_visible = 1 WHERE user_id = ?').run(user_id);
      }
    })();

    return res.status(200).json({
      success: true,
      message: `Account approved successfully! User is now ACTIVE.`
    });
  } catch (err) {
    console.error('Error approving user:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve user'
    });
  }
};

// 6. Suspend User
exports.suspendUser = (req, res) => {
  const { user_id } = req.params;

  try {
    const user = db.prepare('SELECT id, role_id FROM users WHERE id = ?').get(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    db.prepare("UPDATE users SET account_status = 'SUSPENDED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(user_id);

    return res.status(200).json({
      success: true,
      message: 'User account has been suspended.'
    });
  } catch (err) {
    console.error('Error suspending user:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to suspend user'
    });
  }
};
