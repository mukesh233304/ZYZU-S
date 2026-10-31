const db = require('../db/database');
const config = require('../config');

// 1. Global Platform Overview
exports.getGlobalOverview = (req, res) => {
  try {
    // 1. Districts count
    const districtsCount = db.prepare('SELECT COUNT(*) AS count FROM districts WHERE is_active = 1').get().count;

    // 2. Students count
    const studentsCount = db.prepare(`
      SELECT COUNT(*) AS count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = ?
    `).get(config.roles.STUDENT).count;

    // 3. Teachers count
    const teacherStats = db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN u.account_status = 'ACTIVE' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN u.account_status = 'PENDING_APPROVAL' THEN 1 ELSE 0 END) AS pending
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = ?
    `).get(config.roles.TEACHER);

    // 4. Libraries count
    const libraryStats = db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = 'PENDING_APPROVAL' THEN 1 ELSE 0 END) AS pending
      FROM libraries
    `).get();

    // 5. Library Owners count
    const libraryOwnersCount = db.prepare(`
      SELECT COUNT(*) AS count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = ?
    `).get(config.roles.LIBRARY_OWNER).count;

    // 6. Total Bookings / Inquiries
    const bookingsCount = db.prepare('SELECT COUNT(*) AS count FROM booking_requests').get().count;

    // 7. Platform Total Estimated Monthly Revenue
    const totalTutorRevenue = db.prepare(`
      SELECT COALESCE(SUM(monthly_fee), 0) AS total
      FROM teacher_student_assignments
      WHERE status = 'ACTIVE'
    `).get().total;

    const totalLibraryRevenue = db.prepare(`
      SELECT COALESCE(SUM(monthly_fee), 0) AS total
      FROM library_enrollments
      WHERE status = 'ACTIVE'
    `).get().total;

    // 8. District Breakdown Matrix
    const districtBreakdown = db.prepare(`
      SELECT
        d.id, d.name, d.code, d.state,
        da_u.email AS admin_email,
        (SELECT COUNT(*) FROM users u WHERE u.district_id = d.id AND u.role_id = (SELECT id FROM roles WHERE name = 'STUDENT')) AS student_count,
        (SELECT COUNT(*) FROM users u WHERE u.district_id = d.id AND u.role_id = (SELECT id FROM roles WHERE name = 'TEACHER') AND u.account_status = 'ACTIVE') AS teacher_count,
        (SELECT COUNT(*) FROM users u WHERE u.district_id = d.id AND u.role_id = (SELECT id FROM roles WHERE name = 'TEACHER') AND u.account_status = 'PENDING_APPROVAL') AS pending_teacher_count,
        (SELECT COUNT(*) FROM libraries l WHERE l.district_id = d.id AND l.status = 'ACTIVE') AS library_count
      FROM districts d
      LEFT JOIN district_admins da ON d.id = da.district_id AND da.status = 'ACTIVE'
      LEFT JOIN users da_u ON da.user_id = da_u.id
      WHERE d.is_active = 1
      ORDER BY d.name ASC
    `).all();

    return res.status(200).json({
      success: true,
      globalOverview: {
        districtsCount,
        studentsCount,
        teachersTotal: teacherStats.total || 0,
        teachersActive: teacherStats.active || 0,
        teachersPending: teacherStats.pending || 0,
        librariesTotal: libraryStats.total || 0,
        librariesActive: libraryStats.active || 0,
        librariesPending: libraryStats.pending || 0,
        libraryOwnersCount,
        bookingsCount,
        totalPlatformRevenue: totalTutorRevenue + totalLibraryRevenue,
        totalTutorRevenue,
        totalLibraryRevenue,
        districtBreakdown
      }
    });
  } catch (err) {
    console.error('Error in superAdmin getGlobalOverview:', err);
    return res.status(500).json({ success: false, message: 'Failed to load global platform overview' });
  }
};

// 2. Global Districts List
exports.getDistricts = (req, res) => {
  try {
    const districts = db.prepare(`
      SELECT
        d.id, d.name, d.code, d.state, d.is_active,
        da.id AS admin_assignment_id,
        u.email AS admin_email,
        u.mobile AS admin_mobile
      FROM districts d
      LEFT JOIN district_admins da ON d.id = da.district_id AND da.status = 'ACTIVE'
      LEFT JOIN users u ON da.user_id = u.id
      ORDER BY d.name ASC
    `).all();

    return res.status(200).json({ success: true, districts });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load districts' });
  }
};

// 3. Global All Teachers
exports.getAllTeachers = (req, res) => {
  try {
    const teachers = db.prepare(`
      SELECT
        u.id, u.email, u.mobile, u.account_status,
        d.name AS district_name,
        tp.full_name, tp.qualification, tp.experience_years,
        tp.subjects, tp.expected_fee, tp.is_publicly_visible
      FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN teacher_profiles tp ON u.id = tp.user_id
      LEFT JOIN districts d ON u.district_id = d.id
      WHERE r.name = ?
      ORDER BY u.created_at DESC
    `).all(config.roles.TEACHER);

    teachers.forEach(t => {
      try { t.subjects = JSON.parse(t.subjects); } catch (e) {}
    });

    return res.status(200).json({ success: true, teachers });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load global teachers' });
  }
};

// 4. Global All Libraries
exports.getAllLibraries = (req, res) => {
  try {
    const libraries = db.prepare(`
      SELECT
        l.id, l.name, l.address, l.total_seats, l.status, l.created_at,
        d.name AS district_name,
        u.email AS owner_email, u.mobile AS owner_mobile,
        lop.owner_name
      FROM libraries l
      JOIN districts d ON l.district_id = d.id
      JOIN users u ON l.owner_id = u.id
      LEFT JOIN library_owner_profiles lop ON u.id = lop.user_id
      ORDER BY l.created_at DESC
    `).all();

    return res.status(200).json({ success: true, libraries });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load global libraries' });
  }
};
