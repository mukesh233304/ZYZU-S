/**
 * FOCUSPOINT WhatsApp Notification Controller
 * Student Notification Feeds, Provider Delivery Tracking,
 * Admin Observability, and Resilient Redelivery.
 */

const whatsappNotificationService = require('../services/whatsappNotificationService');

exports.getStudentNotifications = (req, res) => {
  try {
    const studentId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 20;

    const notifications = whatsappNotificationService.getStudentNotifications(studentId, limit);

    return res.status(200).json({
      success: true,
      notifications
    });
  } catch (err) {
    console.error('Error fetching student WhatsApp notifications:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.retryNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await whatsappNotificationService.retryNotification(id);

    return res.status(200).json({
      success: true,
      message: 'Notification retry initiated successfully.',
      ...result
    });
  } catch (err) {
    console.error('Error retrying notification:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdminStats = (req, res) => {
  try {
    const isDistrictAdmin = req.user.role_name === 'DISTRICT_ADMIN';
    const districtId = isDistrictAdmin ? req.user.district_id : (req.query.districtId || null);

    const stats = whatsappNotificationService.getAnalytics({ districtId });

    return res.status(200).json({
      success: true,
      stats
    });
  } catch (err) {
    console.error('Error fetching WhatsApp admin stats:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
