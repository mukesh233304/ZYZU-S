/**
 * FOCUSPOINT Authoritative Booking Confirmation & Event Service Layer
 * Triggers on successful booking/payment, issues/reactivates Personal QR Pass,
 * dispatches official WhatsApp notifications, and logs confirmation events.
 */

const db = require('../db/database');
const qrPassService = require('./qrPassService');
const whatsappNotificationService = require('./whatsappNotificationService');

const bookingConfirmationService = {
  /**
   * Process and finalize a booking confirmation
   */
  async confirmBooking({
    studentId,
    bookingId,
    serviceType, // 'HOME_TUITION', 'LIBRARY', or 'BOTH'
    teacherId = null,
    libraryId = null,
    startDate = new Date().toISOString().split('T')[0],
    endDate = null,
    amount = 0,
    paymentStatus = 'PAID',
    metadata = {},
    skipInAppNotification = false
  }) {
    if (!studentId || !bookingId || !serviceType) {
      throw new Error('studentId, bookingId, and serviceType are required');
    }

    const now = new Date();
    const currentMonthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const computedEndDate = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    const eventId = `BCE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 1. Look up student and relevant teacher/library details for notification formatting
    const student = db.prepare(`
      SELECT u.id, u.email, u.mobile, sp.full_name, sp.whatsapp_number
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ?
    `).get(studentId);

    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    let teacherName = metadata.teacherName;
    let subject = metadata.subject;
    if (teacherId && !teacherName) {
      const tp = db.prepare('SELECT full_name, subjects FROM teacher_profiles WHERE user_id = ?').get(teacherId);
      if (tp) {
        teacherName = tp.full_name;
        if (!subject && tp.subjects) {
          try { subject = JSON.parse(tp.subjects)[0]; } catch (e) { subject = tp.subjects; }
        }
      }
    }

    let libraryName = metadata.libraryName;
    let libraryAddress = metadata.libraryAddress;
    if (libraryId && !libraryName) {
      const lib = db.prepare('SELECT name, address FROM libraries WHERE id = ?').get(libraryId);
      if (lib) {
        libraryName = lib.name;
        libraryAddress = lib.address;
      }
    }

    // 2. Insert into booking_confirmation_events
    db.prepare(`
      INSERT INTO booking_confirmation_events (
        id, student_id, booking_id, service_type, teacher_id, library_id,
        start_date, active_month, valid_until, total_amount, payment_status,
        whatsapp_status, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'QUEUED', ?, CURRENT_TIMESTAMP)
    `).run(
      eventId, studentId, bookingId, serviceType, teacherId, libraryId,
      startDate, currentMonthLabel, computedEndDate, amount, paymentStatus,
      JSON.stringify({ ...metadata, teacherName, subject, libraryName, libraryAddress })
    );

    // 3. Automatically generate or reactivate student's Personal QR Pass
    let qrPass = null;
    try {
      qrPass = await qrPassService.getOrCreatePersonalQrPass(studentId);
    } catch (qrErr) {
      console.error('Error issuing QR pass on booking confirmation:', qrErr);
    }

    // 4. Dispatch Official WhatsApp Confirmation Message
    let whatsappResult = null;
    try {
      whatsappResult = await whatsappNotificationService.sendBookingConfirmation(studentId, {
        bookingId,
        serviceType,
        teacherName,
        subject,
        libraryName,
        libraryAddress,
        startDate,
        endDate: computedEndDate,
        activeMonth: currentMonthLabel
      });

      // Update whatsapp status on confirmation event
      if (whatsappResult && whatsappResult.status) {
        db.prepare(`
          UPDATE booking_confirmation_events
          SET whatsapp_status = ?
          WHERE id = ?
        `).run(whatsappResult.status, eventId);
      }
    } catch (waErr) {
      console.warn('Failed to send WhatsApp confirmation (non-fatal):', waErr.message);
      db.prepare(`
        UPDATE booking_confirmation_events
        SET whatsapp_status = 'FAILED'
        WHERE id = ?
      `).run(eventId);
    }

    // 5. In-app Notification
    if (!skipInAppNotification) {
      try {
        const serviceTitle = serviceType === 'BOTH' ? 'Home Tuition & Library' : (serviceType === 'HOME_TUITION' ? 'Home Tuition' : 'Digital Library');
        db.prepare(`
          INSERT INTO notifications (user_id, title, message, type, link, created_at)
          VALUES (?, ?, ?, 'SUCCESS', ?, CURRENT_TIMESTAMP)
        `).run(
          studentId,
          'Booking Confirmed!',
          `Your ${serviceTitle} booking (${bookingId}) has been confirmed. Your Personal QR Attendance Pass is now active.`,
          `/booking/confirmation/${bookingId}`
        );
      } catch (notifErr) {}
    }

    // 6. Audit log
    qrPassService.logAudit({
      actorId: studentId,
      actorRole: 'STUDENT',
      action: 'QR_GENERATED',
      studentId,
      serviceType,
      bookingId,
      reason: `Booking confirmed: ${serviceType}`
    });

    const confirmationEvent = db.prepare('SELECT * FROM booking_confirmation_events WHERE id = ?').get(eventId);

    return {
      success: true,
      confirmationEvent,
      qrPass,
      whatsappResult
    };
  },

  /**
   * Fetch booking confirmation event by bookingId
   */
  getConfirmation(bookingId, studentId = null) {
    let sql = 'SELECT * FROM booking_confirmation_events WHERE booking_id = ?';
    const params = [bookingId];

    if (studentId) {
      sql += ' AND student_id = ?';
      params.push(studentId);
    }

    const event = db.prepare(sql).get(...params);
    if (!event) return null;

    let parsedMeta = {};
    try {
      parsedMeta = JSON.parse(event.metadata || '{}');
    } catch (e) {}

    return {
      ...event,
      metadata: parsedMeta
    };
  },

  /**
   * Analytics for Super Admin / District Admin
   */
  getAnalytics({ districtId = null } = {}) {
    let sql = `
      SELECT
        COUNT(*) AS total_confirmations,
        SUM(CASE WHEN bce.service_type = 'HOME_TUITION' THEN 1 ELSE 0 END) AS tuition_confirmations,
        SUM(CASE WHEN bce.service_type = 'LIBRARY' THEN 1 ELSE 0 END) AS library_confirmations,
        SUM(CASE WHEN bce.service_type = 'BOTH' THEN 1 ELSE 0 END) AS dual_confirmations,
        SUM(CASE WHEN bce.whatsapp_status = 'DELIVERED' OR bce.whatsapp_status = 'SENT' THEN 1 ELSE 0 END) AS whatsapp_sent,
        SUM(CASE WHEN bce.whatsapp_status = 'FAILED' THEN 1 ELSE 0 END) AS whatsapp_failed
      FROM booking_confirmation_events bce
      JOIN users u ON bce.student_id = u.id
    `;

    const params = [];
    if (districtId) {
      sql += ' WHERE u.district_id = ?';
      params.push(districtId);
    }

    return db.prepare(sql).get(...params);
  }
};

module.exports = bookingConfirmationService;
