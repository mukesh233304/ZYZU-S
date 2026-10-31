/**
 * FOCUSPOINT Attendance Controller
 * Independent Dual-Service Check-In / Check-Out,
 * Live Duration Tracking, Portal Feeds, and Parent Alert Coordination.
 */

const attendanceService = require('../services/attendanceService');
const db = require('../db/database');

exports.checkIn = async (req, res) => {
  try {
    const { serviceType, teacherId, libraryId, qrId, bookingId, source, studentId: requestedStudentId } = req.body;
    const isTeacher = req.user.role_name === 'TEACHER';
    const isLibraryOwner = req.user.role_name === 'LIBRARY_OWNER';
    const isSuperAdmin = req.user.role_name === 'SUPER_ADMIN';

    // If teacher/library-owner/admin is checking in a student, allow studentId override
    let targetStudentId = req.user.id;
    if ((isTeacher || isLibraryOwner || isSuperAdmin) && requestedStudentId) {
      targetStudentId = requestedStudentId;
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const result = await attendanceService.checkIn({
      studentId: targetStudentId,
      serviceType,
      teacherId: isTeacher ? req.user.id : teacherId,
      libraryId,
      qrId,
      bookingId,
      source: source || (isTeacher ? 'TEACHER_MANUAL' : (isLibraryOwner ? 'LIBRARY_OWNER_MANUAL' : 'STUDENT_QR')),
      actorId: req.user.id,
      actorRole: req.user.role_name,
      ipAddress
    });

    if (!result.success) {
      return res.status(result.code === 'ALREADY_CHECKED_IN' ? 409 : 400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: `Checked in successfully for ${serviceType === 'HOME_TUITION' ? 'Home Tuition' : 'Digital Study Library'}.`,
      ...result
    });
  } catch (err) {
    console.error('Error during check-in:', err);
    const statusCode = err.code === 'UNPAID_FEE' ? 402 : 400;
    return res.status(statusCode).json({
      success: false,
      code: err.code || 'CHECKIN_FAILED',
      message: err.message || 'Check-in failed'
    });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { serviceType, studentId: requestedStudentId } = req.body;
    const isTeacher = req.user.role_name === 'TEACHER';
    const isLibraryOwner = req.user.role_name === 'LIBRARY_OWNER';
    const isSuperAdmin = req.user.role_name === 'SUPER_ADMIN';

    let targetStudentId = req.user.id;
    if ((isTeacher || isLibraryOwner || isSuperAdmin) && requestedStudentId) {
      targetStudentId = requestedStudentId;
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const result = await attendanceService.checkOut({
      studentId: targetStudentId,
      serviceType,
      actorId: req.user.id,
      actorRole: req.user.role_name,
      ipAddress
    });

    if (!result.success) {
      return res.status(result.code === 'NO_ACTIVE_CHECKIN' ? 404 : 400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: `Checked out successfully. Recorded Duration: ${result.duration}.`,
      ...result
    });
  } catch (err) {
    console.error('Error during check-out:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Check-out failed'
    });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const studentId = req.query.studentId || req.user.id;
    const statusData = await attendanceService.getStudentTodayStatus(studentId);

    return res.status(200).json({
      success: true,
      ...statusData
    });
  } catch (err) {
    console.error('Error fetching today attendance status:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch attendance status'
    });
  }
};

exports.getHistory = (req, res) => {
  try {
    const studentId = req.query.studentId || req.user.id;
    const records = db.prepare(`
      SELECT
        ar.*,
        tp.full_name AS teacher_name,
        l.name AS library_name
      FROM attendance_records ar
      LEFT JOIN teacher_profiles tp ON ar.teacher_id = tp.user_id
      LEFT JOIN libraries l ON ar.library_id = l.id
      WHERE ar.student_id = ?
      ORDER BY ar.date DESC, ar.id DESC
      LIMIT 100
    `).all(studentId);

    return res.status(200).json({
      success: true,
      records
    });
  } catch (err) {
    console.error('Error fetching attendance history:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to load history'
    });
  }
};

exports.getTeacherToday = (req, res) => {
  try {
    const teacherId = req.user.id;
    const students = attendanceService.getTeacherTodayStudents(teacherId);

    return res.status(200).json({
      success: true,
      students
    });
  } catch (err) {
    console.error('Error fetching teacher students today:', err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.teacherMark = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { studentId, date, status, checkInTime, checkOutTime, notes } = req.body;

    const record = await attendanceService.teacherManualMark({
      teacherId,
      studentId,
      date,
      status,
      checkInTime,
      checkOutTime,
      notes
    });

    return res.status(200).json({
      success: true,
      message: 'Attendance record saved successfully.',
      record
    });
  } catch (err) {
    console.error('Error in teacher manual mark:', err);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.getLibraryToday = (req, res) => {
  try {
    const ownerId = req.user.id;
    // Find the library owned by this user
    const lib = db.prepare('SELECT id, name FROM libraries WHERE owner_id = ? LIMIT 1').get(ownerId);
    if (!lib) {
      return res.status(404).json({ success: false, message: 'No registered library found for this owner account.' });
    }

    const students = attendanceService.getLibraryTodayStudents(lib.id);

    return res.status(200).json({
      success: true,
      library: lib,
      students
    });
  } catch (err) {
    console.error('Error fetching library students today:', err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.libraryMark = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { libraryId, studentId, date, status, checkInTime, checkOutTime, notes } = req.body;

    let targetLibraryId = libraryId;
    if (!targetLibraryId) {
      const lib = db.prepare('SELECT id FROM libraries WHERE owner_id = ? LIMIT 1').get(ownerId);
      if (!lib) return res.status(404).json({ success: false, message: 'Library not found' });
      targetLibraryId = lib.id;
    }

    const record = await attendanceService.libraryOwnerManualMark({
      ownerId,
      libraryId: targetLibraryId,
      studentId,
      date,
      status,
      checkInTime,
      checkOutTime,
      notes
    });

    return res.status(200).json({
      success: true,
      message: 'Library attendance record saved successfully.',
      record
    });
  } catch (err) {
    console.error('Error in library manual mark:', err);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.getAnalytics = (req, res) => {
  try {
    const isDistrictAdmin = req.user.role_name === 'DISTRICT_ADMIN';
    const districtId = isDistrictAdmin ? req.user.district_id : (req.query.districtId || null);

    const stats = attendanceService.getAnalytics({ districtId });

    return res.status(200).json({
      success: true,
      stats
    });
  } catch (err) {
    console.error('Error fetching attendance analytics:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
