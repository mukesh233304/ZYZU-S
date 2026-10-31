/**
 * FOCUSPOINT Official WhatsApp Bot & Notification Service Layer
 * Bot Identity: FocusPoint Official WhatsApp (+91 9196434387)
 * Authoritative message formatting, canonical phone resolution, delivery tracking,
 * and failure resilience (attendance/bookings are NEVER rolled back on WhatsApp failure).
 */

const db = require('../db/database');

const OFFICIAL_BOT_PHONE = '+91 9196434387';
const OFFICIAL_BOT_NAME = "ZYZU'S Official WhatsApp";

// Templates
const TEMPLATE_IDS = {
  BOOKING_CONFIRMED: 'FP_TPL_BOOKING_CONFIRMED',
  ATTENDANCE_CHECKIN: 'FP_TPL_ATTENDANCE_CHECKIN',
  ATTENDANCE_CHECKOUT: 'FP_TPL_ATTENDANCE_CHECKOUT',
  PASS_REISSUED: 'FP_TPL_PASS_REISSUED',
  FEE_REMINDER: 'FP_TPL_FEE_REMINDER'
};

/**
 * Format Booking Confirmation WhatsApp Message
 */
function formatBookingConfirmedMessage(data) {
  const {
    studentName,
    serviceType,
    bookingId,
    teacherName,
    subject,
    libraryName,
    libraryAddress,
    startDate,
    endDate,
    activeMonth,
  } = data;

  let body = `*ZYZU'S BOOKING CONFIRMED*\n\nHello ${studentName || 'Student'},\n\nYour ZYZU'S service has been successfully confirmed.\n\n`;

  if (serviceType === 'HOME_TUITION' || serviceType === 'BOTH') {
    body += `📚 *Home Tuition*\n`;
    if (teacherName) body += `• Teacher: ${teacherName}\n`;
    if (subject) body += `• Subject: ${subject}\n`;
    body += `• Booking/Enrollment ID: ${bookingId}\n`;
    if (activeMonth) body += `• Active Period: ${activeMonth}\n\n`;
  }

  if (serviceType === 'LIBRARY' || serviceType === 'BOTH') {
    body += `🏛️ *Digital Study Library*\n`;
    if (libraryName) body += `• Library: ${libraryName}\n`;
    if (libraryAddress) body += `• Location: ${libraryAddress}\n`;
    body += `• Membership ID: ${bookingId}\n`;
    if (startDate && endDate) body += `• Validity: ${startDate} to ${endDate}\n\n`;
  }

  body += `🪪 *Personal QR Attendance Pass Active*\n`;
  body += `Your Personal QR Attendance Pass is now ready in your ZYZU'S account.\n`;
  body += `You can download, print, and scan this QR to access your daily Check-In & Check-Out.\n\n`;
  body += `📞 Support: ${OFFICIAL_BOT_PHONE}\n`;
  body += `Thank you for choosing ZYZU'S!

*ZYZU'S | Tutors & Libraries*`;

  return body;
}

/**
 * Format Parent Check-In WhatsApp Message
 */
function formatCheckInAlertMessage(data) {
  const {
    studentName,
    serviceType,
    facilityOrTeacherName,
    date,
    checkInTime
  } = data;

  const serviceLabel = serviceType === 'HOME_TUITION' ? 'Home Tuition' : 'Digital Study Library';
  const roleLabel = serviceType === 'HOME_TUITION' ? 'Teacher' : 'Library';

  return `*ZYZU'S ATTENDANCE UPDATE*\n\n` +
    `Dear Parent/Guardian,\n\n` +
    `*${studentName || 'Your ward'}* has checked in successfully.\n\n` +
    `• Service: ${serviceLabel}\n` +
    `• ${roleLabel}: ${facilityOrTeacherName || "ZYZU'S Center"}\n` +
    `• Date: ${date}\n` +
    `• Check-In Time: ${checkInTime}\n\n` +
    `ZYZU'S Smart Attendance Automated Alert.

*ZYZU'S | Tutors & Libraries*`;
}

/**
 * Format Parent Check-Out WhatsApp Message
 */
function formatCheckOutAlertMessage(data) {
  const {
    studentName,
    serviceType,
    facilityOrTeacherName,
    date,
    checkInTime,
    checkOutTime,
    duration
  } = data;

  const serviceLabel = serviceType === 'HOME_TUITION' ? 'Home Tuition' : 'Digital Study Library';
  const roleLabel = serviceType === 'HOME_TUITION' ? 'Teacher' : 'Library';

  return `*ZYZU'S ATTENDANCE UPDATE*\n\n` +
    `Dear Parent/Guardian,\n\n` +
    `*${studentName || 'Your ward'}* has checked out successfully.\n\n` +
    `• Service: ${serviceLabel}\n` +
    `• ${roleLabel}: ${facilityOrTeacherName || "ZYZU'S Center"}\n` +
    `• Date: ${date}\n` +
    `• Check-In Time: ${checkInTime}\n` +
    `• Check-Out Time: ${checkOutTime}\n` +
    `• Duration: *${duration || 'Recorded'}*\n\n` +
    `ZYZU'S Smart Attendance Automated Alert.

*ZYZU'S | Tutors & Libraries*`;
}

/**
 * Format Pass Reissuance WhatsApp Message
 */
function formatPassReissuedMessage(data) {
  const { studentName, qrId, version, reason } = data;
  return `*ZYZU'S PASS REISSUED*\n\n` +
    `Hello ${studentName || 'Student'},\n\n` +
    `Your Personal QR Attendance Pass has been successfully reissued.\n\n` +
    `• Pass ID: ${qrId}\n` +
    `• Version: v${version}\n` +
    `• Reason: ${reason || 'Security renewal'}\n\n` +
    `Previous QR passes are now revoked. Please download or print your updated QR pass from your student dashboard.\n\n` +
    `📞 Support: ${OFFICIAL_BOT_PHONE}`;
}

const whatsappNotificationService = {
  TEMPLATE_IDS,
  OFFICIAL_BOT_PHONE,
  OFFICIAL_BOT_NAME,

  /**
   * Queue and dispatch a WhatsApp Notification with robust error containment.
   */
  async queueNotification({
    studentId,
    phoneNumber,
    recipientRole = 'STUDENT',
    notificationType,
    bookingId = null,
    serviceType = 'GENERAL',
    templateId = 'FP_TPL_CUSTOM',
    message,
    simulateFailure = false
  }) {
    const id = `WN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    try {
      // 1. Insert as QUEUED
      db.prepare(`
        INSERT INTO whatsapp_notifications (
          id, student_id, phone_number, recipient_role, notification_type,
          booking_id, service_type, template_id, message, status, retry_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'QUEUED', 0)
      `).run(
        id, studentId, phoneNumber, recipientRole, notificationType,
        bookingId, serviceType, templateId, message
      );

      // 2. Dispatch delivery simulation / provider execution
      if (simulateFailure) {
        db.prepare(`
          UPDATE whatsapp_notifications
          SET status = 'FAILED', failure_reason = 'Simulated provider timeout / network unreachable', failed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(id);

        return {
          id,
          status: 'FAILED',
          delivered: false,
          failureReason: 'Simulated provider timeout / network unreachable'
        };
      }

      // Mark SENDING then DELIVERED
      const providerMsgId = `fp_wa_msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      db.prepare(`
        UPDATE whatsapp_notifications
        SET status = 'DELIVERED', provider_message_id = ?, sent_at = CURRENT_TIMESTAMP, delivered_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(providerMsgId, id);

      return {
        id,
        status: 'DELIVERED',
        delivered: true,
        providerMessageId: providerMsgId
      };
    } catch (err) {
      console.error(`[WhatsApp Notification Error] Failed to process notification ${id}:`, err);
      try {
        db.prepare(`
          UPDATE whatsapp_notifications
          SET status = 'FAILED', failure_reason = ?, failed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(err.message, id);
      } catch (inner) {}

      return {
        id,
        status: 'FAILED',
        delivered: false,
        failureReason: err.message
      };
    }
  },

  /**
   * Send Booking Confirmed WhatsApp message to student
   */
  async sendBookingConfirmation(studentId, bookingData, options = {}) {
    // Lookup student canonical phone
    const studentUser = db.prepare(`
      SELECT u.id, u.mobile, sp.full_name, sp.whatsapp_number
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ?
    `).get(studentId);

    const phone = studentUser?.whatsapp_number || studentUser?.mobile || '9876543210';
    const studentName = studentUser?.full_name || 'Student';

    const message = formatBookingConfirmedMessage({
      ...bookingData,
      studentName
    });

    return await this.queueNotification({
      studentId,
      phoneNumber: phone,
      recipientRole: 'STUDENT',
      notificationType: 'BOOKING_CONFIRMATION',
      bookingId: bookingData.bookingId,
      serviceType: bookingData.serviceType,
      templateId: TEMPLATE_IDS.BOOKING_CONFIRMED,
      message,
      simulateFailure: options.simulateFailure || false
    });
  },

  /**
   * Send Check-In Alert to Parent/Guardian
   */
  async sendCheckInAlert({ studentId, serviceType, facilityOrTeacherName, checkInTime, options = {} }) {
    const student = db.prepare(`
      SELECT u.mobile, sp.full_name, sp.parent_phone, sp.parent_name
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ?
    `).get(studentId);

    const parentPhone = student?.parent_phone || student?.mobile || '9876543210';
    const studentName = student?.full_name || 'Student';
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const message = formatCheckInAlertMessage({
      studentName,
      serviceType,
      facilityOrTeacherName,
      date,
      checkInTime
    });

    return await this.queueNotification({
      studentId,
      phoneNumber: parentPhone,
      recipientRole: 'PARENT',
      notificationType: 'ATTENDANCE_CHECKIN',
      serviceType,
      templateId: TEMPLATE_IDS.ATTENDANCE_CHECKIN,
      message,
      simulateFailure: options.simulateFailure || false
    });
  },

  /**
   * Send Check-Out Alert to Parent/Guardian
   */
  async sendCheckOutAlert({ studentId, serviceType, facilityOrTeacherName, checkInTime, checkOutTime, duration, options = {} }) {
    const student = db.prepare(`
      SELECT u.mobile, sp.full_name, sp.parent_phone, sp.parent_name
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ?
    `).get(studentId);

    const parentPhone = student?.parent_phone || student?.mobile || '9876543210';
    const studentName = student?.full_name || 'Student';
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const message = formatCheckOutAlertMessage({
      studentName,
      serviceType,
      facilityOrTeacherName,
      date,
      checkInTime,
      checkOutTime,
      duration
    });

    return await this.queueNotification({
      studentId,
      phoneNumber: parentPhone,
      recipientRole: 'PARENT',
      notificationType: 'ATTENDANCE_CHECKOUT',
      serviceType,
      templateId: TEMPLATE_IDS.ATTENDANCE_CHECKOUT,
      message,
      simulateFailure: options.simulateFailure || false
    });
  },

  /**
   * Send Pass Reissued Alert to Student
   */
  async sendPassReissuedAlert({ studentId, qrId, version, reason }) {
    const student = db.prepare(`
      SELECT u.mobile, sp.full_name, sp.whatsapp_number
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ?
    `).get(studentId);

    const phone = student?.whatsapp_number || student?.mobile || '9876543210';
    const studentName = student?.full_name || 'Student';

    const message = formatPassReissuedMessage({
      studentName,
      qrId,
      version,
      reason
    });

    return await this.queueNotification({
      studentId,
      phoneNumber: phone,
      recipientRole: 'STUDENT',
      notificationType: 'PASS_REISSUED',
      templateId: TEMPLATE_IDS.PASS_REISSUED,
      message
    });
  },

  /**
   * Retry failed WhatsApp notification
   */
  async retryNotification(notificationId) {
    const notification = db.prepare(`
      SELECT * FROM whatsapp_notifications WHERE id = ?
    `).get(notificationId);

    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    db.prepare(`
      UPDATE whatsapp_notifications
      SET status = 'RETRYING', retry_count = retry_count + 1
      WHERE id = ?
    `).run(notificationId);

    // Simulate successful redelivery
    const providerMsgId = `fp_wa_retry_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    db.prepare(`
      UPDATE whatsapp_notifications
      SET status = 'DELIVERED', provider_message_id = ?, delivered_at = CURRENT_TIMESTAMP, failure_reason = NULL
      WHERE id = ?
    `).run(providerMsgId, notificationId);

    return {
      success: true,
      id: notificationId,
      status: 'DELIVERED',
      retryCount: notification.retry_count + 1
    };
  },

  /**
   * Fetch WhatsApp logs for a student
   */
  getStudentNotifications(studentId, limit = 20) {
    return db.prepare(`
      SELECT *
      FROM whatsapp_notifications
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(studentId, limit);
  },

  /**
   * Admin analytics query
   */
  getAnalytics({ districtId = null } = {}) {
    let sql = `
      SELECT
        COUNT(*) AS total_notifications,
        SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) AS delivered_count,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) AS failed_count,
        SUM(CASE WHEN status = 'QUEUED' OR status = 'RETRYING' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN notification_type = 'BOOKING_CONFIRMATION' THEN 1 ELSE 0 END) AS booking_confirmations,
        SUM(CASE WHEN notification_type = 'ATTENDANCE_CHECKIN' THEN 1 ELSE 0 END) AS checkin_alerts,
        SUM(CASE WHEN notification_type = 'ATTENDANCE_CHECKOUT' THEN 1 ELSE 0 END) AS checkout_alerts
      FROM whatsapp_notifications wn
    `;

    const params = [];
    if (districtId) {
      sql += `
        JOIN users u ON wn.student_id = u.id
        WHERE u.district_id = ?
      `;
      params.push(districtId);
    }

    return db.prepare(sql).get(...params);
  }
};

module.exports = whatsappNotificationService;
