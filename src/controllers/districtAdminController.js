const db = require('../db/database');
const config = require('../config');
const { cleanString } = require('../middleware/validation');

// Helper to enforce district resolution
function resolveDistrictId(req, res) {
  const districtId = req.user.districtId;
  if (!districtId) {
    res.status(403).json({
      success: false,
      message: 'Access Denied: No district assignment associated with this administrator.'
    });
    return null;
  }
  return districtId;
}

// 1. District Dashboard Overview
exports.getOverview = (req, res) => {
  const districtId = resolveDistrictId(req, res);
  if (!districtId) return;

  try {
    const districtInfo = db.prepare('SELECT id, name, state, code FROM districts WHERE id = ?').get(districtId);

    // Total Students in District
    const studentsCount = db.prepare(`
      SELECT COUNT(*) AS count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.district_id = ? AND r.name = ?
    `).get(districtId, config.roles.STUDENT).count;

    // Approved Teachers in District
    const teachersCount = db.prepare(`
      SELECT COUNT(*) AS count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.district_id = ? AND r.name = ? AND u.account_status = 'ACTIVE'
    `).get(districtId, config.roles.TEACHER).count;

    // Pending Teachers in District
    const pendingTeachersCount = db.prepare(`
      SELECT COUNT(*) AS count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.district_id = ? AND r.name = ? AND u.account_status = 'PENDING_APPROVAL'
    `).get(districtId, config.roles.TEACHER).count;

    // Approved Libraries in District
    const librariesCount = db.prepare(`
      SELECT COUNT(*) AS count
      FROM libraries
      WHERE district_id = ? AND status = 'ACTIVE'
    `).get(districtId).count;

    // Pending Libraries in District
    const pendingLibrariesCount = db.prepare(`
      SELECT COUNT(*) AS count
      FROM libraries
      WHERE district_id = ? AND status = 'PENDING_APPROVAL'
    `).get(districtId).count;

    // Tutor Requests in District
    const tutorRequestsCount = db.prepare(`
      SELECT COUNT(*) AS count
      FROM booking_requests
      WHERE district_id = ? AND status = 'PENDING'
    `).get(districtId).count;

    // Active Assignments in District
    const activeAssignmentsCount = db.prepare(`
      SELECT COUNT(tsa.id) AS count
      FROM teacher_student_assignments tsa
      JOIN users u ON tsa.teacher_id = u.id
      WHERE u.district_id = ? AND tsa.status = 'ACTIVE'
    `).get(districtId).count;

    // Estimated Monthly Revenue in District (Tutor fees + Library subscriptions)
    const tutorRevenue = db.prepare(`
      SELECT COALESCE(SUM(tsa.monthly_fee), 0) AS total
      FROM teacher_student_assignments tsa
      JOIN users u ON tsa.teacher_id = u.id
      WHERE u.district_id = ? AND tsa.status = 'ACTIVE'
    `).get(districtId).total;

    const libraryRevenue = db.prepare(`
      SELECT COALESCE(SUM(le.monthly_fee), 0) AS total
      FROM library_enrollments le
      JOIN libraries l ON le.library_id = l.id
      WHERE l.district_id = ? AND le.status = 'ACTIVE'
    `).get(districtId).total;

    return res.status(200).json({
      success: true,
      district: districtInfo,
      overview: {
        studentsCount,
        teachersCount,
        pendingTeachersCount,
        librariesCount,
        pendingLibrariesCount,
        tutorRequestsCount,
        activeAssignmentsCount,
        totalDistrictRevenue: tutorRevenue + libraryRevenue,
        tutorRevenue,
        libraryRevenue
      }
    });
  } catch (err) {
    console.error('Error in districtAdmin getOverview:', err);
    return res.status(500).json({ success: false, message: 'Failed to load district overview' });
  }
};

// 2. Students in District
exports.getStudents = (req, res) => {
  const districtId = resolveDistrictId(req, res);
  if (!districtId) return;

  try {
    const students = db.prepare(`
      SELECT
        u.id, u.email, u.mobile, u.account_status, u.created_at,
        sp.full_name, sp.city_area, sp.address, sp.pincode,
        sp.school_college, sp.grade_class, sp.stream_subjects, sp.target_goals
      FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.district_id = ? AND r.name = ?
      ORDER BY u.created_at DESC
    `).all(districtId, config.roles.STUDENT);

    return res.status(200).json({ success: true, students });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load students' });
  }
};

// 3. Teachers in District
exports.getTeachers = (req, res) => {
  const districtId = resolveDistrictId(req, res);
  if (!districtId) return;

  try {
    const teachers = db.prepare(`
      SELECT
        u.id, u.email, u.mobile, u.account_status, u.created_at,
        tp.full_name, tp.qualification, tp.experience_years,
        tp.subjects, tp.classes, tp.teaching_mode, tp.expected_fee,
        tp.is_publicly_visible, tp.areas_served, tp.admin_notes
      FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE u.district_id = ? AND r.name = ? AND u.account_status = 'ACTIVE'
      ORDER BY tp.full_name ASC
    `).all(districtId, config.roles.TEACHER);

    teachers.forEach(t => {
      try { t.subjects = JSON.parse(t.subjects); } catch (e) {}
      try { t.classes = JSON.parse(t.classes); } catch (e) {}
    });

    return res.status(200).json({ success: true, teachers });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load teachers' });
  }
};

// 4. Pending Teachers Queue
exports.getPendingTeachers = (req, res) => {
  const districtId = resolveDistrictId(req, res);
  if (!districtId) return;

  try {
    const pending = db.prepare(`
      SELECT
        u.id, u.email, u.mobile, u.account_status, u.created_at,
        tp.full_name, tp.gender, tp.dob, tp.qualification, tp.experience_years,
        tp.subjects, tp.classes, tp.specialization, tp.teaching_mode,
        tp.areas_served, tp.expected_fee, tp.availability, tp.address,
        tp.verification_doc_urls, tp.admin_notes
      FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE u.district_id = ? AND r.name = ? AND u.account_status = 'PENDING_APPROVAL'
      ORDER BY u.created_at ASC
    `).all(districtId, config.roles.TEACHER);

    pending.forEach(p => {
      try { p.subjects = JSON.parse(p.subjects); } catch (e) {}
      try { p.classes = JSON.parse(p.classes); } catch (e) {}
      try { p.verification_doc_urls = JSON.parse(p.verification_doc_urls); } catch (e) {}
    });

    return res.status(200).json({ success: true, pendingTeachers: pending });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load pending teachers' });
  }
};

// Action on Teacher (Approve or Reject)
exports.actionTeacher = (req, res) => {
  const districtId = resolveDistrictId(req, res);
  if (!districtId) return;

  const { id } = req.params;
  const { action, admin_notes } = req.body; // action: 'APPROVE' or 'REJECT'

  if (!['APPROVE', 'REJECT'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Action must be APPROVE or REJECT' });
  }

  try {
    // Verify teacher belongs to this district
    const teacher = db.prepare('SELECT id, email, account_status FROM users WHERE id = ? AND district_id = ?').get(id, districtId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found in your district' });
    }

    const newStatus = action === 'APPROVE' ? 'ACTIVE' : 'REJECTED';
    const isPublic = action === 'APPROVE' ? 1 : 0;

    db.transaction(() => {
      db.prepare('UPDATE users SET account_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, id);
      db.prepare(`
        UPDATE teacher_profiles
        SET is_publicly_visible = ?,
            admin_notes = COALESCE(?, admin_notes)
        WHERE user_id = ?
      `).run(isPublic, cleanString(admin_notes), id);

      // Create notification for teacher
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, ?, '/dashboard/teacher')
      `).run(
        id,
        action === 'APPROVE' ? 'Account Approved!' : 'Account Review Update',
        action === 'APPROVE'
          ? "Congratulations! Your teacher profile has been approved by the District Administrator. You are now live on ZYZU'S."
          : `Your teacher registration was reviewed. Feedback: ${admin_notes || 'Please contact district administration.'}`,
        action === 'APPROVE' ? 'SUCCESS' : 'ALERT'
      );
    })();

    return res.status(200).json({
      success: true,
      message: `Teacher has been ${action === 'APPROVE' ? 'approved and made active' : 'rejected'}.`
    });
  } catch (err) {
    console.error('Error updating teacher status:', err);
    return res.status(500).json({ success: false, message: 'Failed to process teacher approval' });
  }
};

// 5. Libraries in District
exports.getLibraries = (req, res) => {
  const districtId = resolveDistrictId(req, res);
  if (!districtId) return;

  try {
    const libraries = db.prepare(`
      SELECT
        l.id, l.name, l.address, l.total_seats, l.amenities, l.operating_hours,
        l.morning_fee, l.evening_fee, l.fullday_fee, l.status, l.created_at,
        u.email AS owner_email, u.mobile AS owner_mobile,
        lop.owner_name
      FROM libraries l
      JOIN users u ON l.owner_id = u.id
      LEFT JOIN library_owner_profiles lop ON u.id = lop.user_id
      WHERE l.district_id = ? AND l.status = 'ACTIVE'
      ORDER BY l.name ASC
    `).all(districtId);

    libraries.forEach(lib => {
      try { lib.amenities = JSON.parse(lib.amenities); } catch (e) {}
    });

    return res.status(200).json({ success: true, libraries });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load libraries' });
  }
};

// 6. Pending Libraries
exports.getPendingLibraries = (req, res) => {
  const districtId = resolveDistrictId(req, res);
  if (!districtId) return;

  try {
    const pending = db.prepare(`
      SELECT
        l.id, l.name, l.address, l.total_seats, l.amenities, l.operating_hours,
        l.morning_fee, l.evening_fee, l.fullday_fee, l.status, l.created_at,
        u.email AS owner_email, u.mobile AS owner_mobile,
        lop.owner_name
      FROM libraries l
      JOIN users u ON l.owner_id = u.id
      LEFT JOIN library_owner_profiles lop ON u.id = lop.user_id
      WHERE l.district_id = ? AND l.status = 'PENDING_APPROVAL'
      ORDER BY l.created_at ASC
    `).all(districtId);

    pending.forEach(lib => {
      try { lib.amenities = JSON.parse(lib.amenities); } catch (e) {}
    });

    return res.status(200).json({ success: true, pendingLibraries: pending });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load pending libraries' });
  }
};

// Action on Library (Approve or Reject)
exports.actionLibrary = (req, res) => {
  const districtId = resolveDistrictId(req, res);
  if (!districtId) return;

  const { id } = req.params;
  const { action, admin_notes } = req.body; // 'APPROVE' or 'REJECT'

  if (!['APPROVE', 'REJECT'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Action must be APPROVE or REJECT' });
  }

  try {
    const lib = db.prepare('SELECT id, owner_id FROM libraries WHERE id = ? AND district_id = ?').get(id, districtId);
    if (!lib) {
      return res.status(404).json({ success: false, message: 'Library not found in your district' });
    }

    const newStatus = action === 'APPROVE' ? 'ACTIVE' : 'INACTIVE';

    db.transaction(() => {
      db.prepare('UPDATE libraries SET status = ? WHERE id = ?').run(newStatus, id);
      db.prepare('UPDATE users SET account_status = ? WHERE id = ?').run(newStatus, lib.owner_id);

      // Notification to owner
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, ?, '/dashboard/library-owner')
      `).run(
        lib.owner_id,
        action === 'APPROVE' ? 'Library Approved!' : 'Library Application Update',
        action === 'APPROVE'
          ? 'Your study library application has been approved by the District Administrator. Your facility is now active.'
          : `Your library application was reviewed. Feedback: ${admin_notes || 'Please contact district administration.'}`,
        action === 'APPROVE' ? 'SUCCESS' : 'ALERT'
      );
    })();

    return res.status(200).json({
      success: true,
      message: `Library has been ${action === 'APPROVE' ? 'approved' : 'rejected'}.`
    });
  } catch (err) {
    console.error('Error actioning library:', err);
    return res.status(500).json({ success: false, message: 'Failed to process library approval' });
  }
};

// 7. Tutor & Library Requests in District
exports.getRequests = (req, res) => {
  const districtId = resolveDistrictId(req, res);
  if (!districtId) return;

  try {
    const requests = db.prepare(`
      SELECT
        br.id, br.target_type, br.subject_or_shift, br.message, br.status, br.created_at,
        sp.full_name AS student_name,
        u.email AS student_email,
        u.mobile AS student_mobile,
        tp.full_name AS teacher_name,
        l.name AS library_name
      FROM booking_requests br
      JOIN users u ON br.student_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN teacher_profiles tp ON br.teacher_id = tp.user_id
      LEFT JOIN libraries l ON br.library_id = l.id
      WHERE br.district_id = ?
      ORDER BY br.created_at DESC
    `).all(districtId);

    return res.status(200).json({ success: true, requests });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load requests' });
  }
};

exports.assignTutorRequest = (req, res) => {
  const districtId = resolveDistrictId(req, res);
  if (!districtId) return;

  const { id } = req.params;
  const { teacher_id, monthly_fee, teaching_mode, admin_notes } = req.body;

  if (!teacher_id) {
    return res.status(400).json({ success: false, message: 'Target Teacher ID is required for assignment' });
  }

  try {
    const booking = db.prepare(`
      SELECT br.*, sp.full_name AS student_name
      FROM booking_requests br
      JOIN users u ON br.student_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE br.id = ? AND br.district_id = ? AND br.target_type = 'TEACHER'
    `).get(id, districtId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Tutor inquiry request not found in your district' });
    }

    if (booking.status === 'ACCEPTED') {
      return res.status(400).json({ success: false, message: 'Request is already accepted and paired' });
    }

    const teacher = db.prepare(`
      SELECT u.id, u.district_id, tp.full_name, tp.expected_fee, u.account_status, tp.is_publicly_visible
      FROM users u
      JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE u.id = ? AND u.district_id = ?
    `).get(teacher_id, districtId);

    if (!teacher || teacher.account_status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Teacher must be active and registered in your district' });
    }

    const fee = parseFloat(monthly_fee) || teacher.expected_fee || 5000;
    const mode = teaching_mode || booking.preferred_mode || 'OFFLINE';

    const transaction = db.transaction(() => {
      // 1. Update booking
      db.prepare(`
        UPDATE booking_requests
        SET status = 'ACCEPTED', teacher_id = ?, response_note = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(teacher_id, cleanString(admin_notes || 'Assigned by District Administrator'), id);

      // 2. Insert pairing
      db.prepare(`
        INSERT INTO teacher_student_assignments (
          teacher_id, student_id, subject, monthly_fee, teaching_mode, status
        ) VALUES (?, ?, ?, ?, ?, 'ACTIVE')
      `).run(teacher_id, booking.student_id, booking.subject_or_shift, fee, mode);

      // 3. Create fee record
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 10);
      const dueStr = dueDate.toISOString().split('T')[0];
      const receiptNo = `TUT-${Date.now().toString().slice(-6)}`;

      db.prepare(`
        INSERT INTO fee_records (
          student_id, teacher_id, type, title, amount, due_date, status, receipt_no
        ) VALUES (?, ?, 'TUTOR', ?, ?, ?, 'PENDING', ?)
      `).run(
        booking.student_id,
        teacher_id,
        `Tuition Fee: ${booking.subject_or_shift} (${mode})`,
        fee,
        dueStr,
        receiptNo
      );

      // 4. Send student notification
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, 'SUCCESS', '/dashboard/student?tab=teachers')
      `).run(
        booking.student_id,
        'District Admin Paired You with a Home Tutor!',
        `District Administration has matched you with educator ${teacher.full_name} for ${booking.subject_or_shift}.`
      );

      // 5. Send teacher notification
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, 'INFO', '/dashboard/teacher?tab=students')
      `).run(
        teacher_id,
        'New Student Allocated by District Admin',
        `District Administration has assigned student ${booking.student_name} to you for ${booking.subject_or_shift}.`
      );
    });

    transaction();

    return res.status(200).json({
      success: true,
      message: 'Student successfully assigned to teacher by District Admin!'
    });
  } catch (err) {
    console.error('Error in district admin tutor assignment:', err);
    return res.status(500).json({ success: false, message: 'Failed to assign teacher' });
  }
};

// 8. Active Assignments
exports.getActiveAssignments = (req, res) => {
  const districtId = resolveDistrictId(req, res);
  if (!districtId) return;

  try {
    const assignments = db.prepare(`
      SELECT
        tsa.id, tsa.subject, tsa.monthly_fee, tsa.teaching_mode, tsa.status, tsa.started_at,
        tp.full_name AS teacher_name,
        tu.mobile AS teacher_mobile,
        sp.full_name AS student_name,
        su.mobile AS student_mobile,
        sp.city_area
      FROM teacher_student_assignments tsa
      JOIN users tu ON tsa.teacher_id = tu.id
      JOIN teacher_profiles tp ON tu.id = tp.user_id
      JOIN users su ON tsa.student_id = su.id
      JOIN student_profiles sp ON su.id = sp.user_id
      WHERE tu.district_id = ?
      ORDER BY tsa.started_at DESC
    `).all(districtId);

    return res.status(200).json({ success: true, assignments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load assignments' });
  }
};

// 9. District Revenue Summary
exports.getRevenue = (req, res) => {
  const districtId = resolveDistrictId(req, res);
  if (!districtId) return;

  try {
    const monthlyTutorVol = db.prepare(`
      SELECT COALESCE(SUM(tsa.monthly_fee), 0) AS total
      FROM teacher_student_assignments tsa
      JOIN users u ON tsa.teacher_id = u.id
      WHERE u.district_id = ? AND tsa.status = 'ACTIVE'
    `).get(districtId).total;

    const monthlyLibraryVol = db.prepare(`
      SELECT COALESCE(SUM(le.monthly_fee), 0) AS total
      FROM library_enrollments le
      JOIN libraries l ON le.library_id = l.id
      WHERE l.district_id = ? AND le.status = 'ACTIVE'
    `).get(districtId).total;

    return res.status(200).json({
      success: true,
      revenue: {
        totalMonthly: monthlyTutorVol + monthlyLibraryVol,
        monthlyTutorVolume: monthlyTutorVol,
        monthlyLibraryVolume: monthlyLibraryVol
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load revenue' });
  }
};
