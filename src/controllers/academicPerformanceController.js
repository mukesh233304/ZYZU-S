const academicPerformanceService = require('../services/academicPerformanceService');
const config = require('../config');

class AcademicPerformanceController {
  async getStudentPerformance(req, res) {
    try {
      const studentId = req.params.studentId || req.user.id;

      // Access control: Students can view only own data unless user is teacher or admin
      if (req.user.role_name === config.roles.STUDENT && req.user.id !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You cannot view academic records of another student'
        });
      }

      const metrics = academicPerformanceService.getStudentPerformance(studentId);
      return res.status(200).json({
        success: true,
        data: metrics
      });
    } catch (err) {
      console.error('Error fetching student performance:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch student performance metrics'
      });
    }
  }

  async recordTeacherTestResult(req, res) {
    try {
      const teacherId = req.user.id;
      const isSuperAdmin = req.user.role_name === config.roles.SUPER_ADMIN;

      // Only Teacher or Super Admin can enter test records
      if (req.user.role_name !== config.roles.TEACHER && !isSuperAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Only authorized teachers can enter student test marks'
        });
      }

      const result = academicPerformanceService.recordTeacherTestResult(req.body, teacherId, isSuperAdmin);
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      console.error('Error recording teacher test result:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to record test result'
      });
    }
  }

  async getMistakeBook(req, res) {
    try {
      const studentId = req.params.studentId || req.user.id;

      if (req.user.role_name === config.roles.STUDENT && req.user.id !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You cannot access another student mistake book'
        });
      }

      const statusFilter = req.query.status || null;
      const mistakes = academicPerformanceService.getMistakeBook(studentId, statusFilter);

      return res.status(200).json({
        success: true,
        count: mistakes.length,
        data: mistakes
      });
    } catch (err) {
      console.error('Error fetching mistake book:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch mistake book'
      });
    }
  }

  async updateMistakeStatus(req, res) {
    try {
      const mistakeId = req.params.id;
      const studentId = req.user.id;
      const { status, personalNotes } = req.body;

      const result = academicPerformanceService.updateMistakeBookStatus(mistakeId, studentId, status, personalNotes);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      console.error('Error updating mistake record:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to update mistake record'
      });
    }
  }
}

module.exports = new AcademicPerformanceController();
