const db = require('../db/database');
const { cleanString } = require('../middleware/validation');
const insforgeSync = require('../services/insforgeSync');
const bookingConfirmationService = require('../services/bookingConfirmationService');

// 1. Teacher Dashboard Overview
exports.getOverview = (req, res) => {
  const teacherId = req.user.id;

  try {
    // Total & Active Students
    const studentStats = db.prepare(`
      SELECT
        COUNT(*) AS total_students,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_students,
        COALESCE(SUM(CASE WHEN status = 'ACTIVE' THEN monthly_fee ELSE 0 END), 0) AS monthly_revenue
      FROM teacher_student_assignments
      WHERE teacher_id = ?
    `).get(teacherId);

    // Attendance Summary
    const attStats = db.prepare(`
      SELECT
        COUNT(*) AS total_marked,
        SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) AS late_count,
        SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) AS absent_count
      FROM attendance_records
      WHERE teacher_id = ?
    `).get(teacherId);

    const totalMarked = attStats.total_marked || 0;
    const presentCount = (attStats.present_count || 0) + (attStats.late_count || 0);
    const attendanceRate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 100;

    // Next upcoming schedule slot
    const nextClass = db.prepare(`
      SELECT day_of_week, start_time, end_time, title, teaching_mode, student_name
      FROM teacher_schedules
      WHERE teacher_id = ?
      LIMIT 1
    `).get(teacherId);

    // Profile visibility & approval status
    const profile = db.prepare(`
      SELECT is_publicly_visible, admin_notes
      FROM teacher_profiles
      WHERE user_id = ?
    `).get(teacherId);

    return res.status(200).json({
      success: true,
      overview: {
        totalStudents: studentStats.total_students || 0,
        activeStudents: studentStats.active_students || 0,
        monthlyRevenue: studentStats.monthly_revenue || 0,
        attendanceRate,
        totalClassesConducted: totalMarked,
        approvalStatus: req.user.accountStatus,
        isPubliclyVisible: profile ? !!profile.is_publicly_visible : false,
        adminNotes: profile ? profile.admin_notes : null,
        nextClass
      }
    });
  } catch (err) {
    console.error('Error in teacher getOverview:', err);
    return res.status(500).json({ success: false, message: 'Failed to load teacher overview' });
  }
};

// 2. Teacher Profile (Read)
exports.getProfile = (req, res) => {
  const teacherId = req.user.id;

  try {
    const profile = db.prepare(`
      SELECT
        u.id, u.email, u.mobile, u.account_status,
        d.id AS district_id, d.name AS district_name,
        tp.full_name, tp.gender, tp.dob, tp.qualification, tp.experience_years,
        tp.subjects, tp.classes, tp.specialization, tp.teaching_mode,
        tp.areas_served, tp.expected_fee, tp.availability, tp.address,
        tp.profile_photo_url, tp.verification_doc_urls, tp.is_publicly_visible,
        tp.bio, tp.admin_notes
      FROM users u
      JOIN teacher_profiles tp ON u.id = tp.user_id
      LEFT JOIN districts d ON u.district_id = d.id
      WHERE u.id = ?
    `).get(teacherId);

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found' });
    }

    try { profile.subjects = JSON.parse(profile.subjects); } catch (e) {}
    try { profile.classes = JSON.parse(profile.classes); } catch (e) {}
    try { profile.verification_doc_urls = JSON.parse(profile.verification_doc_urls); } catch (e) {}

    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error('Error in teacher getProfile:', err);
    return res.status(500).json({ success: false, message: 'Failed to load profile' });
  }
};

// 3. Teacher Profile (Update allowed fields)
exports.updateProfile = (req, res) => {
  const teacherId = req.user.id;
  const {
    full_name,
    qualification,
    experience_years,
    subjects,
    classes,
    specialization,
    teaching_mode,
    areas_served,
    expected_fee,
    availability,
    address,
    bio,
    profile_photo_url
  } = req.body;

  try {
    const formattedSubjects = subjects ? (Array.isArray(subjects) ? JSON.stringify(subjects) : JSON.stringify(subjects.split(',').map(s => s.trim()).filter(Boolean))) : null;
    const formattedClasses = classes ? (Array.isArray(classes) ? JSON.stringify(classes) : JSON.stringify(classes.split(',').map(c => c.trim()).filter(Boolean))) : null;

    db.transaction(() => {
      if (full_name) {
        db.prepare('UPDATE teacher_profiles SET full_name = ? WHERE user_id = ?').run(cleanString(full_name), teacherId);
      }

      db.prepare(`
        UPDATE teacher_profiles
        SET qualification = COALESCE(?, qualification),
            experience_years = COALESCE(?, experience_years),
            subjects = COALESCE(?, subjects),
            classes = COALESCE(?, classes),
            specialization = COALESCE(?, specialization),
            teaching_mode = COALESCE(?, teaching_mode),
            areas_served = COALESCE(?, areas_served),
            expected_fee = COALESCE(?, expected_fee),
            availability = COALESCE(?, availability),
            address = COALESCE(?, address),
            bio = COALESCE(?, bio),
            profile_photo_url = COALESCE(?, profile_photo_url)
        WHERE user_id = ?
      `).run(
        qualification ? cleanString(qualification) : null,
        experience_years !== undefined ? parseInt(experience_years, 10) : null,
        formattedSubjects,
        formattedClasses,
        specialization ? cleanString(specialization) : null,
        teaching_mode ? String(teaching_mode).toUpperCase() : null,
        areas_served ? cleanString(areas_served) : null,
        expected_fee !== undefined ? parseFloat(expected_fee) : null,
        availability ? cleanString(availability) : null,
        address ? cleanString(address) : null,
        bio ? cleanString(bio) : null,
        profile_photo_url ? cleanString(profile_photo_url) : null,
        teacherId
      );
    })();

    return res.status(200).json({ success: true, message: 'Teacher profile updated successfully!' });
  } catch (err) {
    console.error('Error updating teacher profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to update teacher profile' });
  }
};

// 4. Assigned Students
exports.getStudents = (req, res) => {
  const teacherId = req.user.id;

  try {
    const students = db.prepare(`
      SELECT
        tsa.id AS assignment_id,
        tsa.subject,
        tsa.monthly_fee,
        tsa.teaching_mode,
        tsa.status AS assignment_status,
        tsa.started_at,
        u.id AS student_id,
        u.email AS student_email,
        u.mobile AS student_mobile,
        sp.full_name AS student_name,
        sp.city_area,
        sp.address,
        sp.school_college,
        sp.grade_class,
        sp.target_goals
      FROM teacher_student_assignments tsa
      JOIN users u ON tsa.student_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE tsa.teacher_id = ?
      ORDER BY tsa.status ASC, sp.full_name ASC
    `).all(teacherId);

    return res.status(200).json({ success: true, students });
  } catch (err) {
    console.error('Error fetching teacher students:', err);
    return res.status(500).json({ success: false, message: 'Failed to load students' });
  }
};

// 5. Attendance Management
exports.getAttendance = (req, res) => {
  const teacherId = req.user.id;

  try {
    const records = db.prepare(`
      SELECT
        ar.id, ar.date, ar.status, ar.notes,
        sp.full_name AS student_name,
        u.mobile AS student_mobile
      FROM attendance_records ar
      JOIN users u ON ar.student_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE ar.teacher_id = ?
      ORDER BY ar.date DESC, ar.id DESC
      LIMIT 100
    `).all(teacherId);

    return res.status(200).json({ success: true, records });
  } catch (err) {
    console.error('Error fetching teacher attendance:', err);
    return res.status(500).json({ success: false, message: 'Failed to load attendance' });
  }
};

exports.markAttendance = (req, res) => {
  const teacherId = req.user.id;
  const { student_id, date, status, notes } = req.body;

  if (!student_id || !date || !status) {
    return res.status(400).json({ success: false, message: 'Student, date, and status are required' });
  }

  try {
    // Verify student is assigned to this teacher
    const isAssigned = db.prepare(`
      SELECT id FROM teacher_student_assignments
      WHERE teacher_id = ? AND student_id = ?
    `).get(teacherId, student_id);

    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'Student is not assigned to you' });
    }

    db.prepare(`
      INSERT INTO attendance_records (student_id, teacher_id, date, status, type, notes)
      VALUES (?, ?, ?, ?, 'TUTOR', ?)
    `).run(student_id, teacherId, date, status, cleanString(notes));

    // Real-time Cloud Sync to InsForge
    insforgeSync.syncAttendance({
      student_id,
      teacher_id: teacherId,
      date,
      status,
      type: 'TUTOR',
      notes: cleanString(notes)
    });

    return res.status(201).json({ success: true, message: 'Attendance marked successfully!' });
  } catch (err) {
    console.error('Error marking attendance:', err);
    return res.status(500).json({ success: false, message: 'Failed to mark attendance' });
  }
};

// 6. Revenue Breakdown
exports.getRevenue = (req, res) => {
  const teacherId = req.user.id;

  try {
    const monthlyTotal = db.prepare(`
      SELECT COALESCE(SUM(monthly_fee), 0) AS total_monthly
      FROM teacher_student_assignments
      WHERE teacher_id = ? AND status = 'ACTIVE'
    `).get(teacherId).total_monthly;

    const studentEarnings = db.prepare(`
      SELECT
        sp.full_name AS student_name,
        tsa.subject,
        tsa.monthly_fee,
        tsa.teaching_mode,
        tsa.status
      FROM teacher_student_assignments tsa
      JOIN student_profiles sp ON tsa.student_id = sp.user_id
      WHERE tsa.teacher_id = ?
    `).all(teacherId);

    const feeCollections = db.prepare(`
      SELECT
        fr.id, fr.title, fr.amount, fr.due_date, fr.paid_date, fr.status, fr.receipt_no,
        sp.full_name AS student_name
      FROM fee_records fr
      JOIN student_profiles sp ON fr.student_id = sp.user_id
      WHERE fr.teacher_id = ?
      ORDER BY fr.due_date DESC
    `).all(teacherId);

    return res.status(200).json({
      success: true,
      revenue: {
        monthlyTotal,
        studentEarnings,
        feeCollections
      }
    });
  } catch (err) {
    console.error('Error fetching teacher revenue:', err);
    return res.status(500).json({ success: false, message: 'Failed to load revenue data' });
  }
};

// 7. Schedule Management
exports.getSchedule = (req, res) => {
  const teacherId = req.user.id;

  try {
    const schedule = db.prepare(`
      SELECT id, day_of_week, start_time, end_time, title, teaching_mode, student_name
      FROM teacher_schedules
      WHERE teacher_id = ?
      ORDER BY
        CASE day_of_week
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END,
        start_time ASC
    `).all(teacherId);

    return res.status(200).json({ success: true, schedule });
  } catch (err) {
    console.error('Error fetching teacher schedule:', err);
    return res.status(500).json({ success: false, message: 'Failed to load schedule' });
  }
};

exports.addScheduleSlot = (req, res) => {
  const teacherId = req.user.id;
  const { day_of_week, start_time, end_time, title, teaching_mode = 'OFFLINE', student_name } = req.body;

  if (!day_of_week || !start_time || !end_time || !title) {
    return res.status(400).json({ success: false, message: 'Day, times, and batch title are required' });
  }

  try {
    db.prepare(`
      INSERT INTO teacher_schedules (teacher_id, day_of_week, start_time, end_time, title, teaching_mode, student_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(teacherId, day_of_week, start_time, end_time, cleanString(title), teaching_mode, cleanString(student_name));

    return res.status(201).json({ success: true, message: 'Schedule slot added!' });
  } catch (err) {
    console.error('Error adding schedule slot:', err);
    return res.status(500).json({ success: false, message: 'Failed to add schedule slot' });
  }
};

exports.deleteScheduleSlot = (req, res) => {
  const teacherId = req.user.id;
  const { id } = req.params;

  try {
    db.prepare('DELETE FROM teacher_schedules WHERE id = ? AND teacher_id = ?').run(id, teacherId);
    return res.status(200).json({ success: true, message: 'Schedule slot deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete schedule slot' });
  }
};

// 8. Notifications
exports.getNotifications = (req, res) => {
  const teacherId = req.user.id;

  try {
    const notifications = db.prepare(`
      SELECT id, title, message, type, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 30
    `).all(teacherId);

    return res.status(200).json({ success: true, notifications });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
};

// 9. Verification Status
exports.getVerificationStatus = (req, res) => {
  const teacherId = req.user.id;

  try {
    const teacher = db.prepare(`
      SELECT
        u.account_status,
        tp.is_publicly_visible,
        tp.verification_doc_urls,
        tp.qualification,
        tp.experience_years,
        tp.admin_notes
      FROM users u
      JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE u.id = ?
    `).get(teacherId);

    let docList = [];
    if (teacher && teacher.verification_doc_urls) {
      try { docList = JSON.parse(teacher.verification_doc_urls); } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      verification: {
        accountStatus: teacher ? teacher.account_status : 'PENDING_APPROVAL',
        isPubliclyVisible: teacher ? !!teacher.is_publicly_visible : false,
        documentsSubmitted: docList.length,
        documentUrls: docList,
        qualification: teacher ? teacher.qualification : '',
        experience: teacher ? teacher.experience_years : 0,
        adminNotes: teacher ? teacher.admin_notes : null
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load verification status' });
  }
};

// 10. Bookings & Inquiries
exports.getBookings = (req, res) => {
  const teacherId = req.user.id;

  try {
    const bookings = db.prepare(`
      SELECT
        br.id, br.subject_or_shift, br.preferred_mode, br.message, br.status,
        br.response_note, br.created_at, br.updated_at,
        sp.full_name AS student_name,
        sp.school_college,
        sp.grade_class,
        sp.stream_subjects,
        sp.city_area,
        u.email AS student_email,
        u.mobile AS student_mobile
      FROM booking_requests br
      JOIN users u ON br.student_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE br.teacher_id = ?
      ORDER BY
        CASE br.status
          WHEN 'PENDING' THEN 1
          WHEN 'ACCEPTED' THEN 2
          WHEN 'REJECTED' THEN 3
          WHEN 'CANCELLED' THEN 4
        END,
        br.created_at DESC
    `).all(teacherId);

    return res.status(200).json({ success: true, bookings });
  } catch (err) {
    console.error('Error fetching teacher bookings:', err);
    return res.status(500).json({ success: false, message: 'Failed to load bookings' });
  }
};

exports.respondBooking = (req, res) => {
  const teacherId = req.user.id;
  const { id } = req.params;
  const { action, response_note, monthly_fee, teaching_mode } = req.body;

  if (!['ACCEPT', 'REJECT'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Action must be ACCEPT or REJECT' });
  }

  try {
    const booking = db.prepare(`
      SELECT br.*, u.district_id AS student_district, sp.full_name AS student_name
      FROM booking_requests br
      JOIN users u ON br.student_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE br.id = ? AND br.teacher_id = ?
    `).get(id, teacherId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Booking request has already been ${booking.status.toLowerCase()}`
      });
    }

    const teacher = db.prepare(`
      SELECT u.district_id, tp.full_name, tp.expected_fee
      FROM users u
      JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE u.id = ?
    `).get(teacherId);

    const transaction = db.transaction(() => {
      if (action === 'ACCEPT') {
        const fee = parseFloat(monthly_fee) || teacher.expected_fee || 5000;
        const mode = teaching_mode || booking.preferred_mode || 'OFFLINE';

        // 1. Update booking request
        db.prepare(`
          UPDATE booking_requests
          SET status = 'ACCEPTED', response_note = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(cleanString(response_note || 'Request accepted by teacher'), id);

        // 2. Insert teacher student assignment
        db.prepare(`
          INSERT INTO teacher_student_assignments (
            teacher_id, student_id, subject, monthly_fee, teaching_mode, status
          ) VALUES (?, ?, ?, ?, ?, 'ACTIVE')
        `).run(teacherId, booking.student_id, booking.subject_or_shift, fee, mode);

        // 3. Create initial tuition fee record
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
          teacherId,
          `Tuition Fee: ${booking.subject_or_shift} (${mode})`,
          fee,
          dueStr,
          receiptNo
        );

        // 4. Send celebratory student notification
        db.prepare(`
          INSERT INTO notifications (user_id, title, message, type, link)
          VALUES (?, ?, ?, 'SUCCESS', '/dashboard/student?tab=teachers')
        `).run(
          booking.student_id,
          'Home Tuition Request Accepted!',
          `${teacher.full_name} accepted your request for ${booking.subject_or_shift}. Monthly fee: ₹${fee}. Contact details are now accessible under My Teachers!`
        );

        // 5. Send district admin notification if active admin exists
        const da = db.prepare(`
          SELECT user_id FROM district_admins
          WHERE district_id = ? AND status = 'ACTIVE'
        `).get(booking.district_id);

        if (da) {
          db.prepare(`
            INSERT INTO notifications (user_id, title, message, type, link)
            VALUES (?, ?, ?, 'INFO', '/dashboard/district-admin?tab=assignments')
          `).run(
            da.user_id,
            'New Tuition Pairing Formed',
            `Tutor ${teacher.full_name} accepted learner ${booking.student_name} for ${booking.subject_or_shift}.`
          );
        }
      } else {
        // REJECT
        db.prepare(`
          UPDATE booking_requests
          SET status = 'REJECTED', response_note = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(cleanString(response_note || 'Tutor unavailable for this slot'), id);

        db.prepare(`
          INSERT INTO notifications (user_id, title, message, type, link)
          VALUES (?, ?, ?, 'WARNING', '/dashboard/student?tab=bookings')
        `).run(
          booking.student_id,
          'Tutoring Request Update',
          `Your request with ${teacher.full_name} for ${booking.subject_or_shift} was declined. Note: ${response_note || 'Tutor currently at capacity.'}`
        );
      }
    });

    transaction();

    // Trigger Authoritative Booking Confirmation Event, QR Pass & WhatsApp notification
    if (action === 'ACCEPT') {
      bookingConfirmationService.confirmBooking({
        studentId: booking.student_id,
        bookingId: `BK-TUT-${id}`,
        serviceType: 'HOME_TUITION',
        teacherId,
        amount: parseFloat(monthly_fee) || teacher.expected_fee || 5000,
        paymentStatus: 'PAID',
        metadata: {
          teacherName: teacher.full_name,
          subject: booking.subject_or_shift
        },
        skipInAppNotification: true
      }).catch(e => console.warn('Booking confirmation hook notice:', e.message));
    }

    // Real-time Cloud Sync to InsForge
    insforgeSync.syncBooking({
      ...booking,
      status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED',
      response_note: cleanString(response_note || '')
    });

    return res.status(200).json({
      success: true,
      message: action === 'ACCEPT' ? 'Booking request accepted and student enrolled!' : 'Booking request declined'
    });
  } catch (err) {
    console.error('Error responding to booking request:', err);
    return res.status(500).json({ success: false, message: 'Failed to respond to booking request' });
  }
};

