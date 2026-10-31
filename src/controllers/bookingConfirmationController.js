/**
 * FOCUSPOINT Booking Confirmation Controller
 * Handles booking confirmation events, triggers Personal QR Pass issuance,
 * and coordinates WhatsApp booking messages.
 */

const bookingConfirmationService = require('../services/bookingConfirmationService');

exports.confirmBooking = async (req, res) => {
  try {
    const {
      studentId: requestedStudentId,
      bookingId,
      serviceType,
      teacherId,
      libraryId,
      startDate,
      endDate,
      amount,
      paymentStatus,
      metadata
    } = req.body;

    const studentId = requestedStudentId || req.user.id;

    const result = await bookingConfirmationService.confirmBooking({
      studentId,
      bookingId,
      serviceType,
      teacherId,
      libraryId,
      startDate,
      endDate,
      amount: parseFloat(amount) || 0,
      paymentStatus: paymentStatus || 'PAID',
      metadata: metadata || {}
    });

    return res.status(200).json({
      success: true,
      message: 'Booking confirmed, Personal QR Pass issued, and WhatsApp notification queued.',
      ...result
    });
  } catch (err) {
    console.error('Error in confirmBooking:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to process booking confirmation'
    });
  }
};

exports.getConfirmation = (req, res) => {
  try {
    const { bookingId } = req.params;
    const isStudent = req.user.role_name === 'STUDENT';
    const studentId = isStudent ? req.user.id : null;

    const confirmation = bookingConfirmationService.getConfirmation(bookingId, studentId);

    if (!confirmation) {
      return res.status(404).json({
        success: false,
        message: `Booking confirmation for ${bookingId} not found`
      });
    }

    return res.status(200).json({
      success: true,
      confirmation
    });
  } catch (err) {
    console.error('Error fetching booking confirmation:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAnalytics = (req, res) => {
  try {
    const isDistrictAdmin = req.user.role_name === 'DISTRICT_ADMIN';
    const districtId = isDistrictAdmin ? req.user.district_id : (req.query.districtId || null);

    const stats = bookingConfirmationService.getAnalytics({ districtId });

    return res.status(200).json({
      success: true,
      stats
    });
  } catch (err) {
    console.error('Error fetching booking confirmation analytics:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
