const db = require('../db/database');
const { cleanString, normalizeMobile } = require('../middleware/validation');
const insforgeSync = require('../services/insforgeSync');

// 1. Student Dashboard Overview
exports.getOverview = (req, res) => {
  const studentId = req.user.id;

  try {
    // 1. Assigned Teachers Count
    const teachersCount = db.prepare(`
      SELECT COUNT(*) AS count
      FROM teacher_student_assignments
      WHERE student_id = ? AND status = 'ACTIVE'
    `).get(studentId).count;

    // 2. Library Enrollment
    const libraryEnrollment = db.prepare(`
      SELECT
        le.id, le.status, le.start_date, le.end_date, le.monthly_fee,
        l.name AS library_name, l.address AS library_address,
        ls.seat_number,
        lsh.name AS shift_name, lsh.start_time, lsh.end_time
      FROM library_enrollments le
      JOIN libraries l ON le.library_id = l.id
      LEFT JOIN library_seats ls ON le.seat_id = ls.id
      LEFT JOIN library_shifts lsh ON le.shift_id = lsh.id
      WHERE le.student_id = ? AND le.status = 'ACTIVE'
      ORDER BY le.id DESC
      LIMIT 1
    `).get(studentId);

    // 3. Attendance Rate
    const attStats = db.prepare(`
      SELECT
        COUNT(*) AS total_days,
        SUM(CASE WHEN status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END) AS attended_days
      FROM attendance_records
      WHERE student_id = ?
    `).get(studentId);

    const totalDays = attStats.total_days || 0;
    const attendedDays = attStats.attended_days || 0;
    const attendancePercentage = totalDays > 0 ? Math.round((attendedDays / totalDays) * 100) : 100;

    // 4. Fees Summary
    const feeSummary = db.prepare(`
      SELECT
        COUNT(*) AS pending_count,
        COALESCE(SUM(amount), 0) AS pending_amount
      FROM fee_records
      WHERE student_id = ? AND status IN ('PENDING', 'OVERDUE')
    `).get(studentId);

    // 5. Unread Notifications Count
    const unreadNotifications = db.prepare(`
      SELECT COUNT(*) AS count
      FROM notifications
      WHERE user_id = ? AND is_read = 0
    `).get(studentId).count;

    // 6. Recent Attendance (Last 5)
    const recentAttendance = db.prepare(`
      SELECT
        ar.id, ar.date, ar.status, ar.notes, ar.type,
        tp.full_name AS teacher_name
      FROM attendance_records ar
      LEFT JOIN teacher_profiles tp ON ar.teacher_id = tp.user_id
      WHERE ar.student_id = ?
      ORDER BY ar.date DESC, ar.id DESC
      LIMIT 5
    `).all(studentId);

    // 7. Recent Fees (Last 3)
    const recentFees = db.prepare(`
      SELECT id, title, amount, due_date, status, type, receipt_no
      FROM fee_records
      WHERE student_id = ?
      ORDER BY due_date DESC
      LIMIT 3
    `).all(studentId);

    return res.status(200).json({
      success: true,
      overview: {
        teachersCount,
        hasLibrary: !!libraryEnrollment,
        libraryEnrollment,
        totalDays,
        attendedDays,
        attendancePercentage,
        pendingFeesCount: feeSummary.pending_count,
        pendingFeesAmount: feeSummary.pending_amount,
        unreadNotifications,
        recentAttendance,
        recentFees
      }
    });
  } catch (err) {
    console.error('Error in student getOverview:', err);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard overview' });
  }
};

// 2. Student Profile (Read)
exports.getProfile = (req, res) => {
  const studentId = req.user.id;

  try {
    const profile = db.prepare(`
      SELECT
        u.id, u.email, u.mobile, u.account_status,
        d.id AS district_id, d.name AS district_name,
        sp.full_name, sp.dob, sp.gender, sp.city_area, sp.address, sp.pincode,
        sp.profile_photo_url, sp.school_college, sp.grade_class, sp.stream_subjects, sp.target_goals
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN districts d ON u.district_id = d.id
      WHERE u.id = ?
    `).get(studentId);

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error('Error fetching student profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to load profile' });
  }
};

// 3. Student Profile (Update)
exports.updateProfile = (req, res) => {
  const studentId = req.user.id;
  const {
    full_name,
    mobile,
    email,
    address,
    district_id,
    city_area,
    pincode,
    profile_photo_url,
    school_college,
    grade_class,
    stream_subjects,
    target_goals
  } = req.body;

  try {
    // Check email uniqueness if modified
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      const existingEmail = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(cleanEmail, studentId);
      if (existingEmail) {
        return res.status(409).json({ success: false, field: 'email', message: 'Email is already in use by another account' });
      }
    }

    // Check mobile uniqueness if modified
    if (mobile) {
      const cleanPhone = normalizeMobile(mobile);
      const existingPhone = db.prepare('SELECT id FROM users WHERE mobile = ? AND id != ?').get(cleanPhone, studentId);
      if (existingPhone) {
        return res.status(409).json({ success: false, field: 'mobile', message: 'Mobile number is already registered to another account' });
      }
    }

    const distId = district_id ? parseInt(district_id, 10) : req.user.districtId;

    db.transaction(() => {
      // Update core user attributes
      db.prepare(`
        UPDATE users
        SET email = COALESCE(?, email),
            mobile = COALESCE(?, mobile),
            district_id = COALESCE(?, district_id),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        email ? email.trim().toLowerCase() : null,
        mobile ? normalizeMobile(mobile) : null,
        distId,
        studentId
      );

      // Update student profile attributes
      db.prepare(`
        UPDATE student_profiles
        SET full_name = COALESCE(?, full_name),
            address = COALESCE(?, address),
            city_area = COALESCE(?, city_area),
            pincode = COALESCE(?, pincode),
            profile_photo_url = COALESCE(?, profile_photo_url),
            school_college = COALESCE(?, school_college),
            grade_class = COALESCE(?, grade_class),
            stream_subjects = COALESCE(?, stream_subjects),
            target_goals = COALESCE(?, target_goals)
        WHERE user_id = ?
      `).run(
        full_name ? cleanString(full_name) : null,
        address ? cleanString(address) : null,
        city_area ? cleanString(city_area) : null,
        pincode ? String(pincode).trim() : null,
        profile_photo_url ? cleanString(profile_photo_url) : null,
        school_college ? cleanString(school_college) : null,
        grade_class ? cleanString(grade_class) : null,
        stream_subjects ? cleanString(stream_subjects) : null,
        target_goals ? cleanString(target_goals) : null,
        studentId
      );
    })();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!'
    });
  } catch (err) {
    console.error('Error updating student profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// 4. My Teachers
exports.getTeachers = (req, res) => {
  const studentId = req.user.id;

  try {
    const teachers = db.prepare(`
      SELECT
        tsa.id AS assignment_id,
        tsa.subject,
        tsa.monthly_fee,
        tsa.teaching_mode,
        tsa.status,
        tsa.started_at,
        tp.full_name AS teacher_name,
        tp.qualification,
        tp.experience_years,
        tp.profile_photo_url,
        tp.availability,
        u.email AS teacher_email,
        u.mobile AS teacher_mobile
      FROM teacher_student_assignments tsa
      JOIN users u ON tsa.teacher_id = u.id
      JOIN teacher_profiles tp ON u.id = tp.user_id
      WHERE tsa.student_id = ?
      ORDER BY tsa.status ASC, tsa.started_at DESC
    `).all(studentId);

    return res.status(200).json({ success: true, teachers });
  } catch (err) {
    console.error('Error fetching student teachers:', err);
    return res.status(500).json({ success: false, message: 'Failed to load teachers' });
  }
};

// 5. Attendance Records
exports.getAttendance = (req, res) => {
  const studentId = req.user.id;

  try {
    const records = db.prepare(`
      SELECT
        ar.id, ar.date, ar.status, ar.type, ar.notes,
        tp.full_name AS teacher_name,
        l.name AS library_name
      FROM attendance_records ar
      LEFT JOIN teacher_profiles tp ON ar.teacher_id = tp.user_id
      LEFT JOIN libraries l ON ar.library_id = l.id
      WHERE ar.student_id = ?
      ORDER BY ar.date DESC
    `).all(studentId);

    const stats = db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) AS present,
        SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) AS late,
        SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) AS absent,
        SUM(CASE WHEN status = 'LEAVE' THEN 1 ELSE 0 END) AS leave
      FROM attendance_records
      WHERE student_id = ?
    `).get(studentId);

    return res.status(200).json({ success: true, records, stats });
  } catch (err) {
    console.error('Error fetching student attendance:', err);
    return res.status(500).json({ success: false, message: 'Failed to load attendance' });
  }
};

// 6. Fees
exports.getFees = (req, res) => {
  const studentId = req.user.id;

  try {
    const fees = db.prepare(`
      SELECT
        fr.id, fr.type, fr.title, fr.amount, fr.due_date, fr.paid_date, fr.status, fr.receipt_no,
        tp.full_name AS teacher_name,
        l.name AS library_name
      FROM fee_records fr
      LEFT JOIN teacher_profiles tp ON fr.teacher_id = tp.user_id
      LEFT JOIN libraries l ON fr.library_id = l.id
      WHERE fr.student_id = ?
      ORDER BY fr.status DESC, fr.due_date DESC
    `).all(studentId);

    const summary = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) AS total_paid,
        COALESCE(SUM(CASE WHEN status IN ('PENDING', 'OVERDUE') THEN amount ELSE 0 END), 0) AS total_pending
      FROM fee_records
      WHERE student_id = ?
    `).get(studentId);

    return res.status(200).json({ success: true, fees, summary });
  } catch (err) {
    console.error('Error fetching student fees:', err);
    return res.status(500).json({ success: false, message: 'Failed to load fees' });
  }
};

// 7. Library Details
exports.getLibrary = (req, res) => {
  const studentId = req.user.id;

  try {
    const enrollment = db.prepare(`
      SELECT
        le.id AS enrollment_id,
        le.status,
        le.start_date,
        le.end_date,
        le.monthly_fee,
        l.id AS library_id,
        l.name AS library_name,
        l.address AS library_address,
        l.operating_hours,
        l.amenities,
        ls.seat_number,
        lsh.name AS shift_name,
        lsh.start_time,
        lsh.end_time
      FROM library_enrollments le
      JOIN libraries l ON le.library_id = l.id
      LEFT JOIN library_seats ls ON le.seat_id = ls.id
      LEFT JOIN library_shifts lsh ON le.shift_id = lsh.id
      WHERE le.student_id = ?
      ORDER BY le.id DESC
      LIMIT 1
    `).get(studentId);

    if (enrollment && enrollment.amenities) {
      try {
        enrollment.amenities = JSON.parse(enrollment.amenities);
      } catch (e) {}
    }

    return res.status(200).json({ success: true, enrollment });
  } catch (err) {
    console.error('Error fetching student library:', err);
    return res.status(500).json({ success: false, message: 'Failed to load library details' });
  }
};

// 8. Bookings & Enquiries
exports.getBookings = (req, res) => {
  const studentId = req.user.id;

  try {
    const bookings = db.prepare(`
      SELECT
        br.id, br.target_type, br.subject_or_shift, br.message, br.status,
        br.preferred_mode, br.preferred_seat_id, br.shift_id, br.start_date,
        br.response_note, br.created_at, br.updated_at,
        tp.full_name AS teacher_name,
        CASE WHEN br.status = 'ACCEPTED' THEN tu.mobile ELSE NULL END AS teacher_mobile,
        CASE WHEN br.status = 'ACCEPTED' THEN tu.email ELSE NULL END AS teacher_email,
        l.name AS library_name,
        l.address AS library_address,
        ls.seat_number,
        d.name AS district_name
      FROM booking_requests br
      JOIN districts d ON br.district_id = d.id
      LEFT JOIN users tu ON br.teacher_id = tu.id
      LEFT JOIN teacher_profiles tp ON br.teacher_id = tp.user_id
      LEFT JOIN libraries l ON br.library_id = l.id
      LEFT JOIN library_seats ls ON br.preferred_seat_id = ls.id
      WHERE br.student_id = ?
      ORDER BY br.created_at DESC
    `).all(studentId);

    return res.status(200).json({ success: true, bookings });
  } catch (err) {
    console.error('Error fetching student bookings:', err);
    return res.status(500).json({ success: false, message: 'Failed to load bookings' });
  }
};

exports.createBooking = (req, res) => {
  const studentId = req.user.id;
  const {
    target_type,
    teacher_id,
    library_id,
    subject_or_shift,
    preferred_mode = 'OFFLINE',
    preferred_seat_id,
    shift_id,
    start_date,
    message
  } = req.body;

  if (!target_type || !['TEACHER', 'LIBRARY'].includes(target_type)) {
    return res.status(400).json({ success: false, message: 'Invalid target type. Must be TEACHER or LIBRARY.' });
  }

  if (!subject_or_shift || !subject_or_shift.trim()) {
    return res.status(400).json({ success: false, message: 'Subject or shift name is required' });
  }

  try {
    // Check student profile & district
    const studentUser = db.prepare(`
      SELECT u.district_id, sp.full_name
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ?
    `).get(studentId);

    if (!studentUser) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    let districtId = studentUser.district_id;
    let targetOwnerId = null;

    if (target_type === 'TEACHER') {
      if (!teacher_id) {
        return res.status(400).json({ success: false, message: 'Teacher ID is required' });
      }

      const teacher = db.prepare(`
        SELECT u.id, u.district_id, tp.full_name, u.account_status, tp.is_publicly_visible
        FROM users u
        JOIN teacher_profiles tp ON u.id = tp.user_id
        WHERE u.id = ?
      `).get(teacher_id);

      if (!teacher || teacher.account_status !== 'ACTIVE' || !teacher.is_publicly_visible) {
        return res.status(404).json({ success: false, message: 'Verified teacher not found or unavailable' });
      }

      districtId = teacher.district_id || districtId;
      targetOwnerId = teacher.id;
    } else if (target_type === 'LIBRARY') {
      if (!library_id) {
        return res.status(400).json({ success: false, message: 'Library ID is required' });
      }

      const library = db.prepare(`
        SELECT id, owner_id, district_id, name, status
        FROM libraries
        WHERE id = ?
      `).get(library_id);

      if (!library || library.status !== 'ACTIVE') {
        return res.status(404).json({ success: false, message: 'Active study library not found' });
      }

      districtId = library.district_id;
      targetOwnerId = library.owner_id;
    }

    const insertStmt = db.prepare(`
      INSERT INTO booking_requests (
        student_id, district_id, target_type, teacher_id, library_id,
        subject_or_shift, preferred_mode, preferred_seat_id, shift_id,
        start_date, message, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `);

    const result = insertStmt.run(
      studentId,
      districtId,
      target_type,
      target_type === 'TEACHER' ? teacher_id : null,
      target_type === 'LIBRARY' ? library_id : null,
      cleanString(subject_or_shift),
      preferred_mode,
      preferred_seat_id || null,
      shift_id || null,
      start_date || null,
      cleanString(message || '')
    );

    const newBookingId = result.lastInsertRowid;

    // Real-time Cloud Sync to InsForge
    insforgeSync.syncBooking({
      id: newBookingId,
      student_id: studentId,
      district_id: districtId,
      target_type,
      teacher_id: target_type === 'TEACHER' ? teacher_id : null,
      library_id: target_type === 'LIBRARY' ? library_id : null,
      subject_or_shift,
      preferred_mode,
      preferred_seat_id: preferred_seat_id || null,
      shift_id: shift_id || null,
      start_date: start_date || null,
      message,
      status: 'PENDING'
    });

    // Send notification to target educator or library owner
    if (targetOwnerId) {
      const notifTitle = target_type === 'TEACHER' ? 'New Home Tuition Inquiry' : 'New Study Desk Request';
      const notifMsg = target_type === 'TEACHER'
        ? `Learner ${studentUser.full_name} submitted a request for ${subject_or_shift} (${preferred_mode}).`
        : `Learner ${studentUser.full_name} submitted a seat reservation request for ${subject_or_shift}.`;

      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, 'INFO', ?)
      `).run(
        targetOwnerId,
        notifTitle,
        notifMsg,
        target_type === 'TEACHER' ? '/dashboard/teacher?tab=bookings' : '/dashboard/library-owner?tab=bookings'
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully',
      bookingId: newBookingId
    });
  } catch (err) {
    console.error('Error creating booking request:', err);
    return res.status(500).json({ success: false, message: 'Failed to create booking request' });
  }
};

exports.cancelBooking = (req, res) => {
  const studentId = req.user.id;
  const { id } = req.params;

  try {
    const booking = db.prepare('SELECT id, status, target_type, teacher_id, library_id FROM booking_requests WHERE id = ? AND student_id = ?').get(id, studentId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking request that is already ${booking.status.toLowerCase()}`
      });
    }

    db.prepare("UPDATE booking_requests SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);

    // Real-time Cloud Sync to InsForge
    insforgeSync.syncBooking({
      ...booking,
      status: 'CANCELLED'
    });

    return res.status(200).json({
      success: true,
      message: 'Booking request cancelled successfully'
    });
  } catch (err) {
    console.error('Error cancelling booking request:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel booking request' });
  }
};

// 9. Notifications
exports.getNotifications = (req, res) => {
  const studentId = req.user.id;

  try {
    const notifications = db.prepare(`
      SELECT id, title, message, type, is_read, link, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 30
    `).all(studentId);

    return res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error('Error fetching student notifications:', err);
    return res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
};

exports.markNotificationRead = (req, res) => {
  const studentId = req.user.id;
  const { id } = req.params;

  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, studentId);
    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

// 10. Support Tickets
exports.getSupportTickets = (req, res) => {
  const studentId = req.user.id;

  try {
    const tickets = db.prepare(`
      SELECT id, subject, message, status, priority, admin_response, created_at, updated_at
      FROM support_tickets
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(studentId);

    return res.status(200).json({ success: true, tickets });
  } catch (err) {
    console.error('Error fetching support tickets:', err);
    return res.status(500).json({ success: false, message: 'Failed to load support tickets' });
  }
};

exports.createSupportTicket = (req, res) => {
  const studentId = req.user.id;
  const { subject, message, priority = 'NORMAL' } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ success: false, message: 'Subject and message are required' });
  }

  try {
    db.prepare(`
      INSERT INTO support_tickets (user_id, district_id, subject, message, priority, status)
      VALUES (?, ?, ?, ?, ?, 'OPEN')
    `).run(studentId, req.user.districtId, cleanString(subject), cleanString(message), priority);

    return res.status(201).json({ success: true, message: 'Support ticket submitted successfully!' });
  } catch (err) {
    console.error('Error creating support ticket:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit support ticket' });
  }
};
