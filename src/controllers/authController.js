const crypto = require('crypto');
const db = require('../db/database');
const config = require('../config');
const insforgeSync = require('../services/insforgeSync');
const {
  generateToken,
  hashPassword,
  comparePassword,
  generateOtp,
  sanitizeUser
} = require('../utils/token');

// Helper to determine role-based redirect route
function getRedirectUrl(role) {
  switch (role) {
    case config.roles.STUDENT:
      return '/dashboard/student';
    case config.roles.TEACHER:
      return '/dashboard/teacher';
    case config.roles.LIBRARY_OWNER:
      return '/dashboard/library-owner';
    case config.roles.DISTRICT_ADMIN:
      return '/dashboard/district-admin';
    case config.roles.SUPER_ADMIN:
      return '/dashboard/super-admin';
    default:
      return '/login';
  }
}

// 1. Student Registration
exports.registerStudent = (req, res) => {
  const {
    full_name,
    mobile,
    email,
    password,
    dob,
    gender,
    district_id,
    city_area,
    address,
    pincode
  } = req.body;

  try {
    // Check email uniqueness
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        field: 'email',
        message: 'This email address is already registered. Please log in or use a different email.'
      });
    }

    // Check mobile uniqueness
    const existingMobile = db.prepare('SELECT id FROM users WHERE mobile = ?').get(mobile);
    if (existingMobile) {
      return res.status(409).json({
        success: false,
        field: 'mobile',
        message: 'This mobile number is already registered. Please log in or use a different number.'
      });
    }

    // Verify district
    const district = db.prepare('SELECT id, name FROM districts WHERE id = ? AND is_active = 1').get(district_id);
    if (!district) {
      return res.status(400).json({
        success: false,
        field: 'district_id',
        message: 'Selected district is invalid or inactive.'
      });
    }

    const studentRole = db.prepare('SELECT id, name FROM roles WHERE name = ?').get(config.roles.STUDENT);
    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    // Atomic transaction for user creation and student profile
    const createStudent = db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, email, mobile, password_hash, role_id, district_id, account_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        email,
        mobile,
        passwordHash,
        studentRole.id,
        district_id,
        config.statuses.ACTIVE
      );

      db.prepare(`
        INSERT INTO user_roles (user_id, role_id)
        VALUES (?, ?)
      `).run(userId, studentRole.id);

      db.prepare(`
        INSERT INTO student_profiles (user_id, full_name, dob, gender, city_area, address, pincode)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(userId, full_name, dob, gender, city_area, address, pincode);
    });

    createStudent();

    // Real-time Cloud Persistence to InsForge
    insforgeSync.syncUserRegistration({
      user: { id: userId, email, mobile, password_hash: passwordHash, role_id: studentRole.id, district_id, account_status: config.statuses.ACTIVE },
      roleName: config.roles.STUDENT,
      profile: { full_name, dob, gender, city_area, address, pincode }
    });

    // Generate JWT token
    const token = generateToken({
      userId,
      role: config.roles.STUDENT,
      accountStatus: config.statuses.ACTIVE
    });

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      message: 'Student registration completed successfully!',
      token,
      redirectUrl: '/dashboard/student',
      user: {
        id: userId,
        fullName: full_name,
        email,
        mobile,
        role: config.roles.STUDENT,
        accountStatus: config.statuses.ACTIVE,
        district: district.name
      }
    });
  } catch (err) {
    console.error('Error during student registration:', err);
    return res.status(500).json({
      success: false,
      message: 'Registration failed due to a server error. Please try again.'
    });
  }
};

// 2. Teacher Registration
exports.registerTeacher = (req, res) => {
  const {
    full_name,
    mobile,
    email,
    password,
    gender,
    dob,
    qualification,
    experience,
    subjects,
    classes,
    specialization,
    teaching_mode,
    district_id,
    areas_served,
    expected_fee,
    availability,
    address
  } = req.body;

  try {
    // Check email uniqueness
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        field: 'email',
        message: 'This email address is already registered.'
      });
    }

    // Check mobile uniqueness
    const existingMobile = db.prepare('SELECT id FROM users WHERE mobile = ?').get(mobile);
    if (existingMobile) {
      return res.status(409).json({
        success: false,
        field: 'mobile',
        message: 'This mobile number is already registered.'
      });
    }

    // Verify district
    const district = db.prepare('SELECT id, name FROM districts WHERE id = ? AND is_active = 1').get(district_id);
    if (!district) {
      return res.status(400).json({
        success: false,
        field: 'district_id',
        message: 'Selected district is invalid or inactive.'
      });
    }

    const teacherRole = db.prepare('SELECT id, name FROM roles WHERE name = ?').get(config.roles.TEACHER);
    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    // Extract uploaded files if present
    let profilePhotoUrl = null;
    let verificationDocUrls = [];

    if (req.files) {
      if (req.files.profile_photo && req.files.profile_photo.length > 0) {
        profilePhotoUrl = `/uploads/${req.files.profile_photo[0].filename}`;
      }
      if (req.files.verification_docs && req.files.verification_docs.length > 0) {
        verificationDocUrls = req.files.verification_docs.map(f => `/uploads/${f.filename}`);
      }
    }

    // Atomic transaction for user creation and teacher profile
    const createTeacher = db.transaction(() => {
      // Must be PENDING_APPROVAL upon registration
      db.prepare(`
        INSERT INTO users (id, email, mobile, password_hash, role_id, district_id, account_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        email,
        mobile,
        passwordHash,
        teacherRole.id,
        district_id,
        config.statuses.PENDING_APPROVAL
      );

      db.prepare(`
        INSERT INTO user_roles (user_id, role_id)
        VALUES (?, ?)
      `).run(userId, teacherRole.id);

      // Must NOT be publicly visible initially (is_publicly_visible = 0)
      db.prepare(`
        INSERT INTO teacher_profiles (
          user_id, full_name, gender, dob, qualification, experience_years,
          subjects, classes, specialization, teaching_mode, areas_served,
          expected_fee, availability, address, profile_photo_url,
          verification_doc_urls, is_publicly_visible
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `).run(
        userId,
        full_name,
        gender,
        dob,
        qualification,
        experience,
        subjects,
        classes,
        specialization || '',
        teaching_mode,
        areas_served,
        expected_fee,
        availability,
        address,
        profilePhotoUrl,
        JSON.stringify(verificationDocUrls)
      );
    });

    createTeacher();

    // Real-time Cloud Persistence to InsForge
    insforgeSync.syncUserRegistration({
      user: { id: userId, email, mobile, password_hash: passwordHash, role_id: teacherRole.id, district_id, account_status: config.statuses.PENDING_APPROVAL },
      roleName: config.roles.TEACHER,
      profile: {
        full_name, gender, dob, qualification, experience_years: experience,
        subjects, classes, specialization, teaching_mode, areas_served,
        expected_fee, availability, address, profile_photo_url: profilePhotoUrl,
        verification_doc_urls: verificationDocUrls, is_publicly_visible: 0
      }
    });

    // Issue token for the teacher so they can access their application status portal
    const token = generateToken({
      userId,
      role: config.roles.TEACHER,
      accountStatus: config.statuses.PENDING_APPROVAL
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      message: 'Teacher application submitted successfully! Your account is pending verification.',
      token,
      redirectUrl: '/dashboard/teacher',
      accountStatus: config.statuses.PENDING_APPROVAL,
      user: {
        id: userId,
        fullName: full_name,
        email,
        mobile,
        role: config.roles.TEACHER,
        accountStatus: config.statuses.PENDING_APPROVAL,
        district: district.name,
        isPubliclyVisible: false
      }
    });
  } catch (err) {
    console.error('Error during teacher registration:', err);
    return res.status(500).json({
      success: false,
      message: 'Teacher registration failed due to a server error. Please try again.'
    });
  }
};

// 3. Library Owner Registration
exports.registerLibraryOwner = (req, res) => {
  const {
    owner_name,
    mobile,
    email,
    password,
    district_id,
    address
  } = req.body;

  try {
    // Check email uniqueness
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        field: 'email',
        message: 'This email address is already registered.'
      });
    }

    // Check mobile uniqueness
    const existingMobile = db.prepare('SELECT id FROM users WHERE mobile = ?').get(mobile);
    if (existingMobile) {
      return res.status(409).json({
        success: false,
        field: 'mobile',
        message: 'This mobile number is already registered.'
      });
    }

    // Verify district
    const district = db.prepare('SELECT id, name FROM districts WHERE id = ? AND is_active = 1').get(district_id);
    if (!district) {
      return res.status(400).json({
        success: false,
        field: 'district_id',
        message: 'Selected district is invalid or inactive.'
      });
    }

    const libraryRole = db.prepare('SELECT id, name FROM roles WHERE name = ?').get(config.roles.LIBRARY_OWNER);
    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    // Atomic transaction for user creation and library owner profile
    const createLibraryOwner = db.transaction(() => {
      // Must be PENDING_APPROVAL upon registration
      db.prepare(`
        INSERT INTO users (id, email, mobile, password_hash, role_id, district_id, account_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        email,
        mobile,
        passwordHash,
        libraryRole.id,
        district_id,
        config.statuses.PENDING_APPROVAL
      );

      db.prepare(`
        INSERT INTO user_roles (user_id, role_id)
        VALUES (?, ?)
      `).run(userId, libraryRole.id);

      db.prepare(`
        INSERT INTO library_owner_profiles (user_id, owner_name, address)
        VALUES (?, ?, ?)
      `).run(userId, owner_name, address);
    });

    createLibraryOwner();

    // Real-time Cloud Persistence to InsForge
    insforgeSync.syncUserRegistration({
      user: { id: userId, email, mobile, password_hash: passwordHash, role_id: libraryRole.id, district_id, account_status: config.statuses.PENDING_APPROVAL },
      roleName: config.roles.LIBRARY_OWNER,
      profile: { owner_name, address }
    });

    // Issue token so owner can view verification status
    const token = generateToken({
      userId,
      role: config.roles.LIBRARY_OWNER,
      accountStatus: config.statuses.PENDING_APPROVAL
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      message: 'Library Owner registration submitted! Your account is pending administrator approval.',
      token,
      redirectUrl: '/dashboard/library-owner',
      accountStatus: config.statuses.PENDING_APPROVAL,
      user: {
        id: userId,
        ownerName: owner_name,
        email,
        mobile,
        role: config.roles.LIBRARY_OWNER,
        accountStatus: config.statuses.PENDING_APPROVAL,
        district: district.name
      }
    });
  } catch (err) {
    console.error('Error during library owner registration:', err);
    return res.status(500).json({
      success: false,
      message: 'Library Owner registration failed due to a server error.'
    });
  }
};

// 4. Unified Login (Email or Mobile + Password)
exports.login = (req, res) => {
  const { cleanIdentifier, password } = req.body;

  try {
    // Find user by either email or mobile
    const user = db.prepare(`
      SELECT
        u.id,
        u.email,
        u.mobile,
        u.password_hash,
        u.role_id,
        u.district_id,
        u.account_status,
        r.name AS role_name,
        d.name AS district_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN districts d ON u.district_id = d.id
      WHERE u.email = ? OR u.mobile = ?
    `).get(cleanIdentifier, cleanIdentifier);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/mobile and password.'
      });
    }

    // Verify password securely
    const isValidPassword = comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/mobile and password.'
      });
    }

    // Account status enforcement
    if (user.account_status === config.statuses.SUSPENDED) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended by administration. Access is denied.'
      });
    }

    if (user.account_status === config.statuses.REJECTED) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_REJECTED',
        message: 'Your application has been rejected. Please contact support.'
      });
    }

    if (user.account_status === config.statuses.INACTIVE) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_INACTIVE',
        message: 'Your account is currently inactive.'
      });
    }

    // Update last login timestamp
    db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      role: user.role_name,
      accountStatus: user.account_status
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const redirectUrl = getRedirectUrl(user.role_name);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      redirectUrl,
      user: {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        role: user.role_name,
        accountStatus: user.account_status,
        district: user.district_name,
        isPending: user.account_status === config.statuses.PENDING_APPROVAL
      }
    });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({
      success: false,
      message: 'Login failed due to a server error. Please try again.'
    });
  }
};

// 5. Request OTP (Configurable/Optional OTP login architecture)
exports.requestOtp = (req, res) => {
  const { identifier, purpose = 'LOGIN' } = req.body;

  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: 'Email or mobile number is required to receive OTP.'
    });
  }

  const cleanId = String(identifier).trim().toLowerCase();

  try {
    const user = db.prepare('SELECT id, account_status FROM users WHERE email = ? OR mobile = ?').get(cleanId, cleanId);

    if (purpose === 'LOGIN' && !user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email or mobile.'
      });
    }

    if (user && user.account_status === config.statuses.SUSPENDED) {
      return res.status(403).json({
        success: false,
        message: 'Account suspended. OTP requests are blocked.'
      });
    }

    const otpCode = generateOtp(6);
    // Expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO otps (identifier, otp_code, purpose, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(cleanId, otpCode, purpose, expiresAt);

    // Development/Test mock delivery logger
    console.log(`🔑 [FOCUSPOINT OTP SERVICE] Generated OTP for ${cleanId}: [${otpCode}] (Expires in 10 min)`);

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${cleanId}`,
      expiresInMinutes: 10,
      // For development/testing ease, we expose devOtp if not in production
      ...(config.nodeEnv !== 'production' ? { devOtp: otpCode } : {})
    });
  } catch (err) {
    console.error('Error requesting OTP:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to dispatch OTP. Please try again.'
    });
  }
};

// 6. Verify OTP and authenticate
exports.verifyOtp = (req, res) => {
  const { identifier, otp_code, purpose = 'LOGIN' } = req.body;

  if (!identifier || !otp_code) {
    return res.status(400).json({
      success: false,
      message: 'Both identifier and OTP code are required.'
    });
  }

  const cleanId = String(identifier).trim().toLowerCase();

  try {
    const otpRecord = db.prepare(`
      SELECT id, expires_at, consumed_at
      FROM otps
      WHERE identifier = ? AND otp_code = ? AND purpose = ? AND consumed_at IS NULL
      ORDER BY id DESC
      LIMIT 1
    `).get(cleanId, String(otp_code).trim(), purpose);

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or already consumed OTP code.'
      });
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This OTP has expired. Please request a new one.'
      });
    }

    // Mark OTP as consumed
    db.prepare('UPDATE otps SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?').run(otpRecord.id);

    if (purpose === 'LOGIN') {
      const user = db.prepare(`
        SELECT u.id, u.email, u.mobile, u.role_id, u.account_status, r.name AS role_name, d.name AS district_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN districts d ON u.district_id = d.id
        WHERE u.email = ? OR u.mobile = ?
      `).get(cleanId, cleanId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found.'
        });
      }

      if (user.account_status === config.statuses.SUSPENDED) {
        return res.status(403).json({
          success: false,
          message: 'Account is suspended.'
        });
      }

      const token = generateToken({
        userId: user.id,
        role: user.role_name,
        accountStatus: user.account_status
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully! Logged in.',
        token,
        redirectUrl: getRedirectUrl(user.role_name),
        user: {
          id: user.id,
          email: user.email,
          mobile: user.mobile,
          role: user.role_name,
          accountStatus: user.account_status,
          district: user.district_name
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.'
    });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return res.status(500).json({
      success: false,
      message: 'OTP verification failed due to server error.'
    });
  }
};

// 7. Forgot Password
exports.forgotPassword = (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: 'Email or mobile number is required.'
    });
  }

  const cleanId = String(identifier).trim().toLowerCase();

  try {
    const user = db.prepare('SELECT id, email, mobile FROM users WHERE email = ? OR mobile = ?').get(cleanId, cleanId);
    // Generic response to avoid user enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this credential, a password reset code has been sent.'
      });
    }

    const otpCode = generateOtp(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO otps (identifier, otp_code, purpose, expires_at)
      VALUES (?, ?, 'PASSWORD_RESET', ?)
    `).run(cleanId, otpCode, expiresAt);

    console.log(`🔑 [FOCUSPOINT PASSWORD RESET] Reset code for ${cleanId}: [${otpCode}]`);

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this credential, a password reset code has been sent.',
      ...(config.nodeEnv !== 'production' ? { devOtp: otpCode } : {})
    });
  } catch (err) {
    console.error('Error requesting password reset:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while initiating password reset.'
    });
  }
};

// 8. Reset Password
exports.resetPassword = (req, res) => {
  const { identifier, reset_code, new_password, confirm_password } = req.body;

  if (!identifier || !reset_code || !new_password || !confirm_password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.'
    });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match.'
    });
  }

  if (new_password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long.'
    });
  }

  const cleanId = String(identifier).trim().toLowerCase();

  try {
    const otpRecord = db.prepare(`
      SELECT id, expires_at, consumed_at
      FROM otps
      WHERE identifier = ? AND otp_code = ? AND purpose = 'PASSWORD_RESET' AND consumed_at IS NULL
      ORDER BY id DESC
      LIMIT 1
    `).get(cleanId, String(reset_code).trim());

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code.'
      });
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new one.'
      });
    }

    const user = db.prepare('SELECT id FROM users WHERE email = ? OR mobile = ?').get(cleanId, cleanId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    const passwordHash = hashPassword(new_password);

    db.transaction(() => {
      db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(passwordHash, user.id);
      db.prepare('UPDATE otps SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?').run(otpRecord.id);
    })();

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully! You can now log in.'
    });
  } catch (err) {
    console.error('Error resetting password:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password.'
    });
  }
};

// 9. Get current session info (Profile / Me)
exports.getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  try {
    let profileData = null;

    if (req.user.role === config.roles.STUDENT) {
      profileData = db.prepare('SELECT full_name, dob, gender, city_area, address, pincode FROM student_profiles WHERE user_id = ?').get(req.user.id);
    } else if (req.user.role === config.roles.TEACHER) {
      profileData = db.prepare('SELECT full_name, gender, dob, qualification, experience_years, subjects, classes, specialization, teaching_mode, areas_served, expected_fee, availability, address, profile_photo_url, is_publicly_visible FROM teacher_profiles WHERE user_id = ?').get(req.user.id);
      if (profileData) {
        try { profileData.subjects = JSON.parse(profileData.subjects); } catch (e) {}
        try { profileData.classes = JSON.parse(profileData.classes); } catch (e) {}
      }
    } else if (req.user.role === config.roles.LIBRARY_OWNER) {
      profileData = db.prepare('SELECT owner_name, address FROM library_owner_profiles WHERE user_id = ?').get(req.user.id);
    } else if (req.user.role === config.roles.DISTRICT_ADMIN) {
      profileData = db.prepare('SELECT da.status, d.name AS district_name, d.code AS district_code FROM district_admins da JOIN districts d ON da.district_id = d.id WHERE da.user_id = ?').get(req.user.id);
    }

    return res.status(200).json({
      success: true,
      user: {
        ...req.user,
        profile: profileData,
        redirectUrl: getRedirectUrl(req.user.role)
      }
    });
  } catch (err) {
    console.error('Error fetching current user profile:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load user profile'
    });
  }
};

// 10. Logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
