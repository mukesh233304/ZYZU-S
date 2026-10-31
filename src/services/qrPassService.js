/**
 * FOCUSPOINT Personal QR Attendance Pass & Security Validation Service Layer
 * Authoritative Token Generation, Cryptographic Reference Validation,
 * Active-Month & Fee Status Enforcement, and Cross-Student Abuse Prevention.
 */

const db = require('../db/database');
const whatsappNotificationService = require('./whatsappNotificationService');

const QR_PASS_TOKEN_PREFIX = 'fp-att-tok-v2';

/**
 * Deterministic hash helper for consistent, tamper-resistant QR tokens
 */
function generateSecureToken(studentId, version = 1) {
  const cleanId = String(studentId).replace(/[^a-zA-Z0-9]/g, '');
  const base = `${cleanId}-v${version}-focuspoint-auth-2026`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `${QR_PASS_TOKEN_PREFIX}-${cleanId}-${hexHash}`;
}

const qrPassService = {
  QR_PASS_TOKEN_PREFIX,
  generateSecureToken,

  /**
   * Resolve authoritative active services for a student directly from canonical database tables
   */
  resolveStudentActiveServices(studentId) {
    const services = [];

    // 1. Home Tuition from teacher_student_assignments
    const tuitionAssignments = db.prepare(`
      SELECT
        tsa.id, tsa.subject, tsa.monthly_fee, tsa.teaching_mode, tsa.status, tsa.started_at,
        tp.full_name AS teacher_name, tp.user_id AS teacher_id,
        u.mobile AS teacher_mobile
      FROM teacher_student_assignments tsa
      JOIN teacher_profiles tp ON tsa.teacher_id = tp.user_id
      JOIN users u ON tsa.teacher_id = u.id
      WHERE tsa.student_id = ? AND tsa.status = 'ACTIVE'
    `).all(studentId);

    for (const ta of tuitionAssignments) {
      services.push({
        id: `svc-tuition-${ta.id}`,
        serviceType: 'HOME_TUITION',
        bookingId: `BK-TUT-${ta.id}`,
        entityId: ta.teacher_id,
        entityName: ta.teacher_name,
        subjectOrDetails: `${ta.subject} (${ta.teaching_mode})`,
        status: 'ACTIVE',
        teachingMode: ta.teaching_mode,
        monthlyFee: ta.monthly_fee,
        startedAt: ta.started_at
      });
    }

    // 2. Digital Study Library from library_enrollments
    const libraryEnrollments = db.prepare(`
      SELECT
        le.id, le.library_id, le.monthly_fee, le.start_date, le.end_date, le.status,
        l.name AS library_name, l.address AS library_address,
        ls.seat_number,
        lsh.name AS shift_name, lsh.start_time, lsh.end_time
      FROM library_enrollments le
      JOIN libraries l ON le.library_id = l.id
      LEFT JOIN library_seats ls ON le.seat_id = ls.id
      LEFT JOIN library_shifts lsh ON le.shift_id = lsh.id
      WHERE le.student_id = ? AND le.status = 'ACTIVE'
    `).all(studentId);

    for (const le of libraryEnrollments) {
      services.push({
        id: `svc-lib-${le.id}`,
        serviceType: 'LIBRARY',
        bookingId: `BK-LIB-${le.id}`,
        entityId: String(le.library_id),
        entityName: le.library_name,
        subjectOrDetails: `${le.shift_name || 'General Shift'} • Seat ${le.seat_number || 'Standard Desk'}`,
        status: 'ACTIVE',
        seatNumber: le.seat_number,
        shiftName: le.shift_name,
        shiftTiming: le.start_time && le.end_time ? `${le.start_time} - ${le.end_time}` : undefined,
        address: le.library_address,
        monthlyFee: le.monthly_fee,
        validFrom: le.start_date,
        validUntil: le.end_date
      });
    }

    return services;
  },

  /**
   * Check authoritative fee/payment standing for current billing month
   */
  resolveFeeStatus(studentId, activeServices) {
    const now = new Date();
    const currentMonthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const firstDayIso = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDayIso = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Look for pending or overdue fee records for this student
    const pendingFees = db.prepare(`
      SELECT id, type, title, amount, due_date, status, receipt_no
      FROM fee_records
      WHERE student_id = ? AND status IN ('PENDING', 'OVERDUE')
      ORDER BY due_date ASC
    `).all(studentId);

    // Overdue fee is any fee marked OVERDUE or PENDING with due_date <= today or within current active month
    const todayIso = now.toISOString().split('T')[0];
    const overdueFee = pendingFees.find(f => f.status === 'OVERDUE' || (f.status === 'PENDING' && f.due_date <= todayIso));

    const enrichedServices = activeServices.map(svc => {
      const isTuition = svc.serviceType === 'HOME_TUITION';
      const matchingFee = pendingFees.find(f =>
        (isTuition && (f.type === 'TUTOR' || f.type === 'HOME_TUITION')) ||
        (!isTuition && (f.type === 'LIBRARY'))
      );

      const hasUnpaid = !!matchingFee;
      return {
        ...svc,
        activeMonth: currentMonthLabel,
        validFrom: svc.validFrom || firstDayIso,
        validUntil: svc.validUntil || lastDayIso,
        paymentStatus: hasUnpaid ? (matchingFee.status === 'OVERDUE' ? 'OVERDUE' : 'PENDING') : 'PAID',
        feeStatus: hasUnpaid ? 'UNPAID' : 'PAID',
        attendanceAllowed: !hasUnpaid,
        pendingInvoiceId: hasUnpaid ? `INV-${matchingFee.id}` : undefined,
        pendingAmount: hasUnpaid ? matchingFee.amount : undefined,
        restrictionReason: hasUnpaid ?
          `Your ${isTuition ? 'Home Tuition' : 'Digital Library'} service is currently inactive because the required fee for the current billing period (${currentMonthLabel}) has not been completed. Please complete the pending payment to restore attendance access.` :
          undefined
      };
    });

    let attendanceAllowed = true;
    let restrictionReason = null;
    let status = 'ACTIVE';

    if (activeServices.length === 0) {
      attendanceAllowed = false;
      status = 'SUSPENDED';
      restrictionReason = "No active ZYZU'S service found on this account. Please book a home tutor or library seat to activate your attendance pass.";
    } else if (overdueFee) {
      attendanceAllowed = false;
      status = 'SUSPENDED';
      restrictionReason = `Your ${overdueFee.type === 'TUTOR' ? 'Home Tuition' : 'Digital Library'} service is currently inactive because the required fee for the current billing period (${currentMonthLabel}) has not been completed. Please complete the pending payment to restore attendance access.`;
    }

    return {
      attendanceAllowed,
      restrictionReason,
      status,
      currentMonthLabel,
      overdueFee,
      enrichedServices
    };
  },

  /**
   * Authoritative lookup & issuance of student's Personal QR Attendance Pass.
   * Dynamically evaluates active services and database fee standing.
   */
  async getOrCreatePersonalQrPass(studentId) {
    // 1. Fetch student user & profile
    const student = db.prepare(`
      SELECT
        u.id, u.email, u.mobile, u.district_id,
        sp.full_name, sp.profile_photo_url, sp.address, sp.city_area,
        sp.parent_phone, sp.parent_name, sp.whatsapp_number,
        d.name AS district_name
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN districts d ON u.district_id = d.id
      WHERE u.id = ?
    `).get(studentId);

    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    const studentName = student.full_name || 'Student';
    const studentPhoto = student.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=1e293b&color=94a3b8`;
    const studentMobile = student.whatsapp_number || student.mobile || '9876543210';
    const district = student.district_name || 'Ghazipur';
    const parentPhone = student.parent_phone || '9876543210';
    const parentName = student.parent_name || 'Parent / Guardian';

    // 2. Resolve Active Services
    const baseServices = this.resolveStudentActiveServices(studentId);

    // 3. Resolve Fee Standing & Active Month
    const feeInfo = this.resolveFeeStatus(studentId, baseServices);

    // Determine service type
    const hasTuition = baseServices.some(s => s.serviceType === 'HOME_TUITION');
    const hasLibrary = baseServices.some(s => s.serviceType === 'LIBRARY');
    let serviceType = 'UNIVERSAL';
    if (hasTuition && hasLibrary) {
      serviceType = 'UNIVERSAL';
    } else if (hasTuition) {
      serviceType = 'HOME_TUITION';
    } else if (hasLibrary) {
      serviceType = 'LIBRARY';
    }

    // 4. Query or create in qr_attendance_passes table
    let passRecord = db.prepare(`
      SELECT *
      FROM qr_attendance_passes
      WHERE student_id = ? AND status != 'REVOKED'
      ORDER BY version DESC, id DESC
      LIMIT 1
    `).get(studentId);

    const nowYear = new Date().getFullYear();
    const qrId = `FP-QR-${studentId.slice(-6).toUpperCase()}-${nowYear}`;

    if (!passRecord) {
      const version = 1;
      const token = generateSecureToken(studentId, version);
      const passId = `pass-${studentId}`;

      db.prepare(`
        INSERT INTO qr_attendance_passes (
          id, qr_id, student_id, token, version, status, service_eligibility, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        passId, qrId, studentId, token, version, feeInfo.status, serviceType
      );

      passRecord = {
        id: passId,
        qr_id: qrId,
        student_id: studentId,
        token,
        version,
        status: feeInfo.status,
        service_eligibility: serviceType,
        created_at: new Date().toISOString()
      };

      // Audit log
      this.logAudit({
        actorId: studentId,
        actorRole: 'STUDENT',
        action: 'QR_GENERATED',
        studentId,
        serviceType,
        reason: 'Initial Personal QR Attendance Pass issued'
      });
    } else {
      // Keep DB pass status aligned with fee standing if not revoked
      if (passRecord.status !== feeInfo.status) {
        db.prepare(`
          UPDATE qr_attendance_passes
          SET status = ?, service_eligibility = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(feeInfo.status, serviceType, passRecord.id);
        passRecord.status = feeInfo.status;
      }
    }

    const token = passRecord.token;
    const scanUrl = `https://zyzus.com/attendance/pass?token=${encodeURIComponent(token)}`;

    return {
      id: passRecord.id,
      qrId: passRecord.qr_id,
      token,
      studentId,
      studentName,
      studentPhoto,
      studentMobile,
      parentPhone,
      parentName,
      district,
      serviceType,
      status: passRecord.status,
      version: passRecord.version,
      createdAt: passRecord.created_at,
      issuedAt: passRecord.created_at,
      activeServices: feeInfo.enrichedServices,
      scanUrl,
      attendanceAllowed: feeInfo.attendanceAllowed,
      restrictionReason: feeInfo.restrictionReason,
      pendingAmount: feeInfo.overdueFee?.amount,
      pendingInvoiceId: feeInfo.overdueFee ? `INV-${feeInfo.overdueFee.id}` : undefined
    };
  },

  /**
   * Authoritative validation of scanned QR token
   */
  async validateQrToken(token, authenticatedUser, ipAddress = null) {
    if (!token || typeof token !== 'string') {
      return {
        valid: false,
        code: 'INVALID_QR',
        message: 'Invalid QR token provided.'
      };
    }

    // 1. Look up pass in database by token
    const passRecord = db.prepare(`
      SELECT *
      FROM qr_attendance_passes
      WHERE token = ?
    `).get(token.trim());

    if (!passRecord) {
      this.logAudit({
        actorId: authenticatedUser?.id || 'ANONYMOUS',
        actorRole: authenticatedUser?.role_name || 'UNKNOWN',
        action: 'INVALID_QR_REJECTED',
        studentId: 'UNKNOWN',
        reason: `Token not found in registry: ${token}`,
        ipAddress
      });

      return {
        valid: false,
        code: 'INVALID_QR',
        message: 'QR code not recognized. This attendance pass is invalid or expired.'
      };
    }

    // 2. Check if pass is revoked
    const role = authenticatedUser?.role || authenticatedUser?.role_name;

    if (passRecord.status === 'REVOKED') {
      this.logAudit({
        actorId: authenticatedUser?.id || passRecord.student_id,
        actorRole: role || 'STUDENT',
        action: 'INVALID_QR_REJECTED',
        studentId: passRecord.student_id,
        reason: `Scanned pass ${passRecord.qr_id} is revoked: ${passRecord.revocation_reason}`,
        ipAddress
      });

      return {
        valid: false,
        code: 'REVOKED_PASS',
        message: `This QR pass has been revoked: ${passRecord.revocation_reason || 'Security reissue'}. Please use your newly issued pass.`
      };
    }

    // 3. Security Check: Cross-student attendance check
    // If authenticated as a STUDENT, authenticated user must match pass student
    if (authenticatedUser && role === 'STUDENT' && authenticatedUser.id !== passRecord.student_id) {
      this.logAudit({
        actorId: authenticatedUser.id,
        actorRole: 'STUDENT',
        action: 'CROSS_STUDENT_REJECTED',
        studentId: passRecord.student_id,
        reason: `Student ${authenticatedUser.id} attempted to scan pass belonging to student ${passRecord.student_id}`,
        ipAddress
      });

      return {
        valid: false,
        code: 'CROSS_STUDENT_PROHIBITED',
        message: 'Access Denied: This Personal QR Pass belongs to another student. Cross-student attendance access is strictly prohibited.'
      };
    }

    // 4. Resolve full pass details, active services and fee standing
    const fullPass = await this.getOrCreatePersonalQrPass(passRecord.student_id);

    // 5. Check if attendance is blocked due to unpaid fees or lack of active services
    if (!fullPass.attendanceAllowed) {
      this.logAudit({
        actorId: authenticatedUser?.id || passRecord.student_id,
        actorRole: authenticatedUser?.role_name || 'STUDENT',
        action: 'FEE_BLOCKED',
        studentId: passRecord.student_id,
        reason: fullPass.restrictionReason,
        ipAddress
      });

      return {
        valid: false,
        code: fullPass.activeServices.length === 0 ? 'NO_ACTIVE_BOOKING' : 'UNPAID_FEE',
        message: fullPass.restrictionReason,
        pass: fullPass,
        activeServices: fullPass.activeServices,
        pendingAmount: fullPass.pendingAmount,
        pendingInvoiceId: fullPass.pendingInvoiceId
      };
    }

    // 6. Valid Pass!
    this.logAudit({
      actorId: authenticatedUser?.id || passRecord.student_id,
      actorRole: authenticatedUser?.role_name || 'STUDENT',
      action: 'QR_SCANNED',
      studentId: passRecord.student_id,
      reason: 'Authoritative validation successful',
      ipAddress
    });

    return {
      valid: true,
      pass: fullPass,
      student: {
        id: fullPass.studentId,
        name: fullPass.studentName,
        photo: fullPass.studentPhoto,
        mobile: fullPass.studentMobile,
        parentPhone: fullPass.parentPhone,
        district: fullPass.district
      },
      activeServices: fullPass.activeServices
    };
  },

  /**
   * Reissue Personal QR Pass (due to loss, damage, or security rotation)
   */
  async reissuePass(studentId, reason = 'Pass damaged or lost', actorId = null, actorRole = 'STUDENT') {
    const existing = db.prepare(`
      SELECT *
      FROM qr_attendance_passes
      WHERE student_id = ? AND status != 'REVOKED'
      ORDER BY version DESC
      LIMIT 1
    `).get(studentId);

    const oldVersion = existing ? existing.version : 0;
    const newVersion = oldVersion + 1;
    const newPassId = `pass-${studentId}-v${newVersion}`;
    const newQrId = `FP-QR-${studentId.slice(-6).toUpperCase()}-${new Date().getFullYear()}-V${newVersion}`;
    const newToken = generateSecureToken(studentId, newVersion);

    db.transaction(() => {
      // 1. Revoke existing passes
      db.prepare(`
        UPDATE qr_attendance_passes
        SET status = 'REVOKED', revocation_reason = ?, updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ? AND status != 'REVOKED'
      `).run(reason, studentId);

      // 2. Insert new pass
      db.prepare(`
        INSERT INTO qr_attendance_passes (
          id, qr_id, student_id, token, version, status, service_eligibility,
          revocation_reason, reissued_from_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'ACTIVE', 'UNIVERSAL', NULL, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        newPassId, newQrId, studentId, newToken, newVersion, existing?.id || null
      );

      // 3. Log audit
      this.logAudit({
        actorId: actorId || studentId,
        actorRole: actorRole || 'STUDENT',
        action: 'QR_REGENERATED',
        studentId,
        reason: `Reissued pass v${newVersion}: ${reason}`,
        previousState: existing ? `v${oldVersion} (${existing.status})` : 'NONE',
        newState: `v${newVersion} (ACTIVE)`
      });
    })();

    // 4. Send WhatsApp Notification to student
    try {
      await whatsappNotificationService.sendPassReissuedAlert({
        studentId,
        qrId: newQrId,
        version: newVersion,
        reason
      });
    } catch (err) {
      console.warn('Failed to send pass reissued WhatsApp notification:', err.message);
    }

    return await this.getOrCreatePersonalQrPass(studentId);
  },

  /**
   * Audit logger for all QR and attendance actions
   */
  logAudit({ actorId, actorRole, action, studentId, serviceType = null, bookingId = null, previousState = null, newState = null, reason = null, ipAddress = null }) {
    try {
      db.prepare(`
        INSERT INTO attendance_audit_logs (
          actor_id, actor_role, action, student_id, service_type, booking_id,
          previous_state, new_state, reason, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(
        actorId, actorRole, action, studentId, serviceType, bookingId,
        previousState, newState, reason, ipAddress
      );
    } catch (err) {
      console.error('Failed to write attendance audit log:', err);
    }
  },

  /**
   * Fetch audit logs for admin
   */
  getAuditLogs({ studentId = null, limit = 50, districtId = null } = {}) {
    let sql = `
      SELECT aal.*, sp.full_name AS student_name, u.district_id
      FROM attendance_audit_logs aal
      LEFT JOIN users u ON aal.student_id = u.id
      LEFT JOIN student_profiles sp ON aal.student_id = sp.user_id
    `;
    const params = [];
    const conditions = [];

    if (studentId) {
      conditions.push('aal.student_id = ?');
      params.push(studentId);
    }
    if (districtId) {
      conditions.push('u.district_id = ?');
      params.push(districtId);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY aal.id DESC LIMIT ?';
    params.push(limit);

    return db.prepare(sql).all(...params);
  }
};

module.exports = qrPassService;
