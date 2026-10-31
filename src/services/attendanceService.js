/**
 * FOCUSPOINT Canonical Attendance Service Layer
 * Independent Dual-Service Sessions (Home Tuition & Digital Library),
 * Authoritative Duration Calculation, Parent WhatsApp Alert Dispatch,
 * and Cross-Portal Synchronization (Student, Teacher, Library Owner, Admin).
 */

const db = require('../db/database');
const qrPassService = require('./qrPassService');
const whatsappNotificationService = require('./whatsappNotificationService');

/**
 * Format current time as "08:57 AM"
 */
function formatCurrentTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Parse time string (e.g. "08:57 AM" or "13:42") into total minutes from midnight
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AP]M)?/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[4]?.toUpperCase();

  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Calculate formatted duration string between two time strings
 */
function calculateDurationString(checkInTime, checkOutTime) {
  const inMins = parseTimeToMinutes(checkInTime);
  let outMins = parseTimeToMinutes(checkOutTime);

  // Handle crossing midnight
  if (outMins < inMins) {
    outMins += 24 * 60;
  }

  const diffMins = Math.max(1, outMins - inMins);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  let formatted = '';
  if (hours > 0) {
    formatted += `${hours}h `;
  }
  formatted += `${mins.toString().padStart(hours > 0 ? 2 : 1, '0')}m`;

  return {
    formatted: formatted.trim(),
    totalMinutes: diffMins
  };
}

const attendanceService = {
  formatCurrentTime,
  calculateDurationString,

  /**
   * Authoritative Student Check-In
   */
  async checkIn({
    studentId,
    serviceType,
    teacherId = null,
    libraryId = null,
    qrId = null,
    bookingId = null,
    source = 'STUDENT_QR',
    actorId = null,
    actorRole = 'STUDENT',
    ipAddress = null
  }) {
    if (!studentId) throw new Error('Student ID is required');
    if (!serviceType || !['HOME_TUITION', 'LIBRARY'].includes(serviceType)) {
      throw new Error("Invalid service type. Must be 'HOME_TUITION' or 'LIBRARY'");
    }

    const type = serviceType === 'HOME_TUITION' ? 'TUTOR' : 'LIBRARY';
    const now = new Date();
    const todayIso = now.toISOString().split('T')[0];
    const checkInTime = formatCurrentTime(now);

    // 1. Authoritative check on active services & fees
    const activeServices = qrPassService.resolveStudentActiveServices(studentId);
    const targetService = activeServices.find(s => s.serviceType === serviceType);

    if (!targetService) {
      throw new Error(`Student does not have an active ${serviceType === 'HOME_TUITION' ? 'Home Tuition' : 'Digital Library'} booking.`);
    }

    const feeInfo = qrPassService.resolveFeeStatus(studentId, [targetService]);
    if (!feeInfo.attendanceAllowed) {
      qrPassService.logAudit({
        actorId: actorId || studentId,
        actorRole,
        action: 'FEE_BLOCKED',
        studentId,
        serviceType,
        reason: feeInfo.restrictionReason,
        ipAddress
      });

      const err = new Error(feeInfo.restrictionReason || 'Attendance restricted due to pending fee.');
      err.code = 'UNPAID_FEE';
      err.pendingAmount = feeInfo.overdueFee?.amount;
      err.pendingInvoiceId = feeInfo.overdueFee ? `INV-${feeInfo.overdueFee.id}` : undefined;
      throw err;
    }

    // 2. Prevent Duplicate Check-In for the same service today while active
    const existingCheckIn = db.prepare(`
      SELECT *
      FROM attendance_records
      WHERE student_id = ? AND date = ? AND type = ? AND check_out_time IS NULL
      ORDER BY id DESC
      LIMIT 1
    `).get(studentId, todayIso, type);

    if (existingCheckIn) {
      return {
        success: false,
        code: 'ALREADY_CHECKED_IN',
        message: `Student is already checked in for ${serviceType === 'HOME_TUITION' ? 'Home Tuition' : 'Digital Library'} today at ${existingCheckIn.check_in_time}.`,
        record: existingCheckIn
      };
    }

    // Auto-resolve teacherId or libraryId if not explicitly passed
    let resolvedTeacherId = teacherId;
    let resolvedLibraryId = libraryId;
    if (serviceType === 'HOME_TUITION' && !resolvedTeacherId) {
      resolvedTeacherId = targetService.entityId;
    }
    if (serviceType === 'LIBRARY' && !resolvedLibraryId) {
      resolvedLibraryId = parseInt(targetService.entityId, 10);
    }

    // 3. Insert Canonical Attendance Record
    const result = db.prepare(`
      INSERT INTO attendance_records (
        student_id, teacher_id, library_id, date, status, type,
        check_in_time, booking_id, qr_id, source, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'PRESENT', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      studentId, resolvedTeacherId, resolvedLibraryId, todayIso, type,
      checkInTime, bookingId || targetService.bookingId, qrId, source,
      `Check-in via ${source}`
    );

    const recordId = result.lastInsertRowid;
    const record = db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(recordId);

    // 4. Audit Log
    qrPassService.logAudit({
      actorId: actorId || studentId,
      actorRole,
      action: 'ATTENDANCE_CHECKIN',
      studentId,
      serviceType,
      bookingId: bookingId || targetService.bookingId,
      newState: `CHECKED_IN (${checkInTime})`,
      reason: `Successful check-in via ${source}`,
      ipAddress
    });

    // 5. Automatic Parent WhatsApp Alert (Failure must NEVER rollback check-in)
    let whatsappDelivery = null;
    try {
      whatsappDelivery = await whatsappNotificationService.sendCheckInAlert({
        studentId,
        serviceType,
        facilityOrTeacherName: targetService.entityName,
        checkInTime
      });
    } catch (waErr) {
      console.warn('[CheckIn WhatsApp Notice] Failed to deliver WhatsApp alert:', waErr.message);
      whatsappDelivery = { delivered: false, failureReason: waErr.message };
    }

    return {
      success: true,
      record,
      checkInTime,
      serviceType,
      whatsappDelivery
    };
  },

  /**
   * Authoritative Student Check-Out
   */
  async checkOut({
    studentId,
    serviceType,
    actorId = null,
    actorRole = 'STUDENT',
    ipAddress = null
  }) {
    if (!studentId) throw new Error('Student ID is required');
    if (!serviceType || !['HOME_TUITION', 'LIBRARY'].includes(serviceType)) {
      throw new Error("Invalid service type. Must be 'HOME_TUITION' or 'LIBRARY'");
    }

    const type = serviceType === 'HOME_TUITION' ? 'TUTOR' : 'LIBRARY';
    const now = new Date();
    const todayIso = now.toISOString().split('T')[0];
    const checkOutTime = formatCurrentTime(now);

    // 1. Locate active checked-in session today without check-out
    const activeRecord = db.prepare(`
      SELECT *
      FROM attendance_records
      WHERE student_id = ? AND date = ? AND type = ? AND check_out_time IS NULL
      ORDER BY id DESC
      LIMIT 1
    `).get(studentId, todayIso, type);

    if (!activeRecord) {
      return {
        success: false,
        code: 'NO_ACTIVE_CHECKIN',
        message: `No active check-in session found for ${serviceType === 'HOME_TUITION' ? 'Home Tuition' : 'Digital Library'} today. Please check in first.`
      };
    }

    // 2. Authoritative Duration Calculation
    const durationData = calculateDurationString(activeRecord.check_in_time, checkOutTime);

    // 3. Update Canonical Attendance Record
    db.prepare(`
      UPDATE attendance_records
      SET check_out_time = ?, duration = ?, duration_minutes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(checkOutTime, durationData.formatted, durationData.totalMinutes, activeRecord.id);

    const updatedRecord = db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(activeRecord.id);

    // 4. Audit Log
    qrPassService.logAudit({
      actorId: actorId || studentId,
      actorRole,
      action: 'ATTENDANCE_CHECKOUT',
      studentId,
      serviceType,
      bookingId: activeRecord.booking_id,
      previousState: `CHECKED_IN (${activeRecord.check_in_time})`,
      newState: `CHECKED_OUT (${checkOutTime}, duration: ${durationData.formatted})`,
      reason: `Successful check-out. Duration: ${durationData.formatted}`,
      ipAddress
    });

    // 5. Automatic Parent WhatsApp Alert (Failure must NEVER rollback checkout)
    let whatsappDelivery = null;
    try {
      // Find facility or teacher name
      let facilityOrTeacherName = "ZYZU'S";
      if (serviceType === 'HOME_TUITION' && activeRecord.teacher_id) {
        const tp = db.prepare('SELECT full_name FROM teacher_profiles WHERE user_id = ?').get(activeRecord.teacher_id);
        if (tp) facilityOrTeacherName = tp.full_name;
      } else if (serviceType === 'LIBRARY' && activeRecord.library_id) {
        const lib = db.prepare('SELECT name FROM libraries WHERE id = ?').get(activeRecord.library_id);
        if (lib) facilityOrTeacherName = lib.name;
      }

      whatsappDelivery = await whatsappNotificationService.sendCheckOutAlert({
        studentId,
        serviceType,
        facilityOrTeacherName,
        checkInTime: activeRecord.check_in_time,
        checkOutTime,
        duration: durationData.formatted
      });
    } catch (waErr) {
      console.warn('[CheckOut WhatsApp Notice] Failed to deliver WhatsApp alert:', waErr.message);
      whatsappDelivery = { delivered: false, failureReason: waErr.message };
    }

    return {
      success: true,
      record: updatedRecord,
      checkInTime: activeRecord.check_in_time,
      checkOutTime,
      duration: durationData.formatted,
      durationMinutes: durationData.totalMinutes,
      serviceType,
      whatsappDelivery
    };
  },

  /**
   * Get Student's Live Attendance Status for Today
   */
  async getStudentTodayStatus(studentId) {
    const todayIso = new Date().toISOString().split('T')[0];
    const pass = await qrPassService.getOrCreatePersonalQrPass(studentId);

    const statuses = [];

    for (const service of pass.activeServices) {
      const type = service.serviceType === 'HOME_TUITION' ? 'TUTOR' : 'LIBRARY';
      const record = db.prepare(`
        SELECT *
        FROM attendance_records
        WHERE student_id = ? AND date = ? AND type = ?
        ORDER BY id DESC
        LIMIT 1
      `).get(studentId, todayIso, type);

      let serviceStatus = 'READY';
      if (!service.attendanceAllowed) {
        serviceStatus = 'RESTRICTED';
      } else if (record) {
        if (record.check_in_time && record.check_out_time) {
          serviceStatus = 'CHECKED_OUT';
        } else if (record.check_in_time) {
          serviceStatus = 'CHECKED_IN';
        }
      }

      statuses.push({
        service,
        status: serviceStatus,
        todayRecord: record || null,
        checkInTime: record?.check_in_time || null,
        checkOutTime: record?.check_out_time || null,
        duration: record?.duration || null
      });
    }

    return {
      studentId,
      todayDate: todayIso,
      pass,
      services: statuses
    };
  },

  /**
   * Teacher Manual Attendance Marking
   */
  async teacherManualMark({
    teacherId,
    studentId,
    date = new Date().toISOString().split('T')[0],
    status = 'PRESENT',
    checkInTime = '08:00 AM',
    checkOutTime = null,
    notes = 'Marked manually by teacher'
  }) {
    // 1. Verify teacher is assigned to student
    const assignment = db.prepare(`
      SELECT *
      FROM teacher_student_assignments
      WHERE teacher_id = ? AND student_id = ? AND status = 'ACTIVE'
    `).get(teacherId, studentId);

    if (!assignment) {
      throw new Error('Teacher is not actively assigned to this student');
    }

    let duration = null;
    let durationMinutes = 0;
    if (checkInTime && checkOutTime) {
      const dur = calculateDurationString(checkInTime, checkOutTime);
      duration = dur.formatted;
      durationMinutes = dur.totalMinutes;
    }

    // 2. Check if a record already exists for this date
    const existing = db.prepare(`
      SELECT id FROM attendance_records
      WHERE student_id = ? AND teacher_id = ? AND date = ? AND type = 'TUTOR'
    `).get(studentId, teacherId, date);

    let recordId;
    if (existing) {
      db.prepare(`
        UPDATE attendance_records
        SET status = ?, check_in_time = ?, check_out_time = ?, duration = ?,
            duration_minutes = ?, source = 'TEACHER_MANUAL', notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, checkInTime, checkOutTime, duration, durationMinutes, notes, existing.id);
      recordId = existing.id;
    } else {
      const result = db.prepare(`
        INSERT INTO attendance_records (
          student_id, teacher_id, date, status, type,
          check_in_time, check_out_time, duration, duration_minutes,
          source, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'TUTOR', ?, ?, ?, ?, 'TEACHER_MANUAL', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(studentId, teacherId, date, status, checkInTime, checkOutTime, duration, durationMinutes, notes);
      recordId = result.lastInsertRowid;
    }

    // 3. Log audit
    qrPassService.logAudit({
      actorId: teacherId,
      actorRole: 'TEACHER',
      action: 'MANUAL_ATTENDANCE',
      studentId,
      serviceType: 'HOME_TUITION',
      newState: `${status} (${checkInTime || 'No time'}${checkOutTime ? ' - ' + checkOutTime : ''})`,
      reason: notes
    });

    return db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(recordId);
  },

  /**
   * Library Owner Manual Attendance Marking
   */
  async libraryOwnerManualMark({
    ownerId,
    libraryId,
    studentId,
    date = new Date().toISOString().split('T')[0],
    status = 'PRESENT',
    checkInTime = '09:00 AM',
    checkOutTime = null,
    notes = 'Marked manually by library owner'
  }) {
    // 1. Verify library belongs to owner
    const lib = db.prepare(`
      SELECT *
      FROM libraries
      WHERE id = ? AND owner_id = ?
    `).get(libraryId, ownerId);

    if (!lib) {
      throw new Error('Unauthorized: Library does not belong to this owner');
    }

    let duration = null;
    let durationMinutes = 0;
    if (checkInTime && checkOutTime) {
      const dur = calculateDurationString(checkInTime, checkOutTime);
      duration = dur.formatted;
      durationMinutes = dur.totalMinutes;
    }

    const existing = db.prepare(`
      SELECT id FROM attendance_records
      WHERE student_id = ? AND library_id = ? AND date = ? AND type = 'LIBRARY'
    `).get(studentId, libraryId, date);

    let recordId;
    if (existing) {
      db.prepare(`
        UPDATE attendance_records
        SET status = ?, check_in_time = ?, check_out_time = ?, duration = ?,
            duration_minutes = ?, source = 'LIBRARY_OWNER_MANUAL', notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, checkInTime, checkOutTime, duration, durationMinutes, notes, existing.id);
      recordId = existing.id;
    } else {
      const result = db.prepare(`
        INSERT INTO attendance_records (
          student_id, library_id, date, status, type,
          check_in_time, check_out_time, duration, duration_minutes,
          source, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'LIBRARY', ?, ?, ?, ?, 'LIBRARY_OWNER_MANUAL', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(studentId, libraryId, date, status, checkInTime, checkOutTime, duration, durationMinutes, notes);
      recordId = result.lastInsertRowid;
    }

    qrPassService.logAudit({
      actorId: ownerId,
      actorRole: 'LIBRARY_OWNER',
      action: 'MANUAL_ATTENDANCE',
      studentId,
      serviceType: 'LIBRARY',
      newState: `${status} (${checkInTime || 'No time'}${checkOutTime ? ' - ' + checkOutTime : ''})`,
      reason: notes
    });

    return db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(recordId);
  },

  /**
   * Fetch today's assigned students for a teacher with real attendance status
   */
  getTeacherTodayStudents(teacherId) {
    const todayIso = new Date().toISOString().split('T')[0];

    const students = db.prepare(`
      SELECT
        u.id AS student_id, u.email, u.mobile,
        sp.full_name AS student_name, sp.profile_photo_url, sp.grade_class,
        tsa.id AS assignment_id, tsa.subject, tsa.teaching_mode, tsa.monthly_fee,
        ar.id AS attendance_id, ar.status AS attendance_status,
        ar.check_in_time, ar.check_out_time, ar.duration, ar.source AS attendance_source
      FROM teacher_student_assignments tsa
      JOIN users u ON tsa.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN attendance_records ar ON (
        ar.student_id = u.id AND ar.teacher_id = tsa.teacher_id AND ar.date = ? AND ar.type = 'TUTOR'
      )
      WHERE tsa.teacher_id = ? AND tsa.status = 'ACTIVE'
      ORDER BY sp.full_name ASC
    `).all(todayIso, teacherId);

    return students;
  },

  /**
   * Fetch today's enrolled students for a library with live occupancy
   */
  getLibraryTodayStudents(libraryId) {
    const todayIso = new Date().toISOString().split('T')[0];

    const students = db.prepare(`
      SELECT
        u.id AS student_id, u.email, u.mobile,
        sp.full_name AS student_name, sp.profile_photo_url,
        ls.seat_number,
        lsh.name AS shift_name, lsh.start_time, lsh.end_time,
        ar.id AS attendance_id, ar.status AS attendance_status,
        ar.check_in_time, ar.check_out_time, ar.duration, ar.source AS attendance_source
      FROM library_enrollments le
      JOIN users u ON le.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN library_seats ls ON le.seat_id = ls.id
      LEFT JOIN library_shifts lsh ON le.shift_id = lsh.id
      LEFT JOIN attendance_records ar ON (
        ar.student_id = u.id AND ar.library_id = le.library_id AND ar.date = ? AND ar.type = 'LIBRARY'
      )
      WHERE le.library_id = ? AND le.status = 'ACTIVE'
      ORDER BY ls.seat_number ASC, sp.full_name ASC
    `).all(todayIso, libraryId);

    return students;
  },

  /**
   * Analytics summary for Super Admin or District Admin
   */
  getAnalytics({ districtId = null } = {}) {
    const todayIso = new Date().toISOString().split('T')[0];

    let sql = `
      SELECT
        COUNT(*) AS total_records_today,
        SUM(CASE WHEN ar.check_in_time IS NOT NULL THEN 1 ELSE 0 END) AS total_checkins_today,
        SUM(CASE WHEN ar.check_out_time IS NOT NULL THEN 1 ELSE 0 END) AS total_checkouts_today,
        SUM(CASE WHEN ar.check_in_time IS NOT NULL AND ar.check_out_time IS NULL THEN 1 ELSE 0 END) AS currently_active_students,
        SUM(CASE WHEN ar.type = 'TUTOR' THEN 1 ELSE 0 END) AS tuition_attendance_count,
        SUM(CASE WHEN ar.type = 'LIBRARY' THEN 1 ELSE 0 END) AS library_attendance_count
      FROM attendance_records ar
      JOIN users u ON ar.student_id = u.id
      WHERE ar.date = ?
    `;

    const params = [todayIso];
    if (districtId) {
      sql += ' AND u.district_id = ?';
      params.push(districtId);
    }

    return db.prepare(sql).get(...params);
  }
};

module.exports = attendanceService;
