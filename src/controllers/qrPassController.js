/**
 * FOCUSPOINT Personal QR Pass Controller
 * Authenticated Pass Retrieval, Server-Authoritative Token Validation,
 * Reissuance, and Audit Trail Management.
 */

const qrPassService = require('../services/qrPassService');
const attendanceService = require('../services/attendanceService');

exports.getMyPass = async (req, res) => {
  try {
    const studentId = req.user.id;
    const pass = await qrPassService.getOrCreatePersonalQrPass(studentId);

    return res.status(200).json({
      success: true,
      pass
    });
  } catch (err) {
    console.error('Error fetching student QR pass:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to load personal QR pass'
    });
  }
};

exports.validateToken = async (req, res) => {
  try {
    const { token } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!token) {
      return res.status(400).json({
        success: false,
        valid: false,
        code: 'MISSING_TOKEN',
        message: 'QR token is required'
      });
    }

    const result = await qrPassService.validateQrToken(token, req.user, ipAddress);

    if (!result.valid) {
      const statusCode = result.code === 'CROSS_STUDENT_PROHIBITED' ? 403 : (result.code === 'UNPAID_FEE' ? 402 : 400);
      return res.status(statusCode).json({
        success: false,
        ...result
      });
    }

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Error validating QR token:', err);
    return res.status(500).json({
      success: false,
      valid: false,
      message: err.message || 'Server error while validating pass'
    });
  }
};

exports.reissuePass = async (req, res) => {
  try {
    const { reason, studentId: requestedStudentId } = req.body;
    const role = req.user.role || req.user.role_name;
    const isSuperAdmin = role === 'SUPER_ADMIN';
    const targetStudentId = isSuperAdmin && requestedStudentId ? requestedStudentId : req.user.id;

    const newPass = await qrPassService.reissuePass(
      targetStudentId,
      reason || 'Damaged or lost physical pass',
      req.user.id,
      role
    );

    return res.status(200).json({
      success: true,
      message: 'Personal QR Attendance Pass successfully reissued with security rotation.',
      pass: newPass
    });
  } catch (err) {
    console.error('Error reissuing pass:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to reissue QR pass'
    });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const userRole = req.user.role || req.user.role_name;
    const isSuperAdmin = userRole === 'SUPER_ADMIN';
    const isDistrictAdmin = userRole === 'DISTRICT_ADMIN';

    if (!isSuperAdmin && !isDistrictAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to audit logs' });
    }

    const districtId = isDistrictAdmin ? (req.user.districtId || req.user.district_id) : (req.query.districtId || null);
    const studentId = req.query.studentId || null;
    const limit = parseInt(req.query.limit, 10) || 50;

    const logs = qrPassService.getAuditLogs({ studentId, districtId, limit });

    return res.status(200).json({
      success: true,
      logs
    });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
