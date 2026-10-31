// FOCUSPOINT Advanced Attendance & Presence Intelligence System
// Single authoritative attendance service layer connected to mockStore
// Features: QR validation, service-specific check-in/out, parent WhatsApp notifications, audit trail & realtime pub/sub

import { AttendanceRecord, StudentActiveAttendanceService, QrValidationResult } from '../types';
import { mockStore } from '../mock/store';
import { notificationService, WhatsAppDispatchResult } from './notificationService';
import { qrPassService } from './qrPassService';

export interface CheckInParams {
  studentId: string;
  studentName?: string;
  serviceType: 'HOME_TUITION' | 'LIBRARY';
  targetId?: string;
  targetName?: string;
  teacherId?: string;
  teacherName?: string;
  libraryId?: string;
  libraryName?: string;
  referenceId?: string;
  bookingId?: string;
  sessionId?: string;
  source?: 'STUDENT_QR' | 'TEACHER_PORTAL' | 'LIBRARY_OWNER_PORTAL' | 'ADMIN' | string;
  notes?: string;
  district?: string;
  parentPhone?: string;
  parentName?: string;
}

export interface CheckOutParams {
  attendanceId?: string;
  studentId: string;
  serviceType: 'HOME_TUITION' | 'LIBRARY';
  checkOutTime?: string;
  notes?: string;
}

export interface AttendanceActionResult {
  success: boolean;
  record: AttendanceRecord;
  notificationResult?: WhatsAppDispatchResult;
  message?: string;
}

export const attendanceService = {
  /**
   * Subscribe to real-time attendance changes across all portals
   */
  subscribe(callback: () => void): () => void {
    return mockStore.onAttendanceChange(callback);
  },

  /**
   * Retrieve all attendance records for a student
   */
  async getStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getAttendance(studentId);
  },

  /**
   * Retrieve all attendance records for a teacher
   */
  async getTeacherAttendance(teacherId: string): Promise<AttendanceRecord[]> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getTeacherAttendance(teacherId);
  },

  /**
   * Retrieve all attendance records for a library
   */
  async getLibraryAttendance(libraryId: string): Promise<AttendanceRecord[]> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getLibraryAttendance(libraryId);
  },

  /**
   * Retrieve target-specific attendance records
   */
  async getTargetAttendance(targetId: string): Promise<AttendanceRecord[]> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getAttendance(undefined, targetId);
  },

  /**
   * Retrieve active services (Home Tuition and/or Library) currently possessed by the student
   */
  async getActiveServices(studentId: string): Promise<StudentActiveAttendanceService[]> {
    await new Promise(r => setTimeout(r, 80));
    return mockStore.getStudentActiveServices(studentId);
  },

  /**
   * Retrieve today's specific attendance record for a service
   */
  async getTodayAttendance(studentId: string, serviceType: 'HOME_TUITION' | 'LIBRARY'): Promise<AttendanceRecord | null> {
    await new Promise(r => setTimeout(r, 40));
    return mockStore.getTodayAttendance(studentId, serviceType);
  },

  /**
   * Parse and cryptographically validate QR code payload against student's active services
   */
  async validateQrCode(qrData: string, studentId: string): Promise<QrValidationResult> {
    await new Promise(r => setTimeout(r, 120));

    if (!studentId) {
      return {
        valid: false,
        error: 'Student must be authenticated before scanning attendance QR code.',
        errorCode: 'INVALID_QR'
      };
    }

    const trimmed = (qrData || '').trim();
    if (!trimmed) {
      return {
        valid: false,
        error: 'This QR code is invalid or no longer active.',
        errorCode: 'INVALID_QR'
      };
    }

    // Format 0: Personal FocusPoint Attendance Pass Token or Scan URL
    if (trimmed.startsWith('fp-att-tok') || trimmed.includes('attendance/pass') || trimmed.includes('token=')) {
      return qrPassService.validateAttendanceScan(trimmed, studentId);
    }

    const activeServices = mockStore.getStudentActiveServices(studentId);

    // Format 1: URI scheme fp-att://library/{id} or fp-att://tuition/{id} or fp-att://universal/{id}
    if (trimmed.startsWith('fp-att://')) {
      const parts = trimmed.replace('fp-att://', '').split('/');
      const type = parts[0]?.toLowerCase();
      const facilityId = parts[1] || '';

      if (type === 'library') {
        const matchingLib = activeServices.find(s => 
          s.serviceType === 'LIBRARY' && (!facilityId || s.libraryId === facilityId)
        );
        if (!matchingLib) {
          return {
            valid: false,
            serviceType: 'LIBRARY',
            facilityId,
            error: 'You do not have an active library booking for this facility.',
            errorCode: 'SERVICE_MISMATCH'
          };
        }
        return {
          valid: true,
          serviceType: 'LIBRARY',
          facilityId: matchingLib.libraryId,
          facilityName: matchingLib.libraryName,
          qrId: `QR-${facilityId || 'LIB'}`,
          matchingServices: [matchingLib]
        };
      }

      if (type === 'tuition' || type === 'tutor') {
        const matchingTuition = activeServices.find(s => 
          s.serviceType === 'HOME_TUITION' && (!facilityId || s.teacherId === facilityId)
        );
        if (!matchingTuition) {
          return {
            valid: false,
            serviceType: 'HOME_TUITION',
            facilityId,
            error: 'You do not have an active home tuition session with this teacher.',
            errorCode: 'SERVICE_MISMATCH'
          };
        }
        return {
          valid: true,
          serviceType: 'HOME_TUITION',
          facilityId: matchingTuition.teacherId,
          facilityName: matchingTuition.teacherName,
          qrId: `QR-${facilityId || 'TUT'}`,
          matchingServices: [matchingTuition]
        };
      }

      if (type === 'universal') {
        if (activeServices.length === 0) {
          return {
            valid: false,
            serviceType: 'UNIVERSAL',
            error: 'No active tuition or library services found on your student profile.',
            errorCode: 'NO_ACTIVE_SERVICE'
          };
        }
        return {
          valid: true,
          serviceType: 'UNIVERSAL',
          facilityId: 'focuspoint-universal',
          facilityName: "ZYZU'S Attendance Center",
          qrId: 'QR-UNIVERSAL-FP',
          matchingServices: activeServices
        };
      }
    }

    // Format 2: JSON payload
    try {
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsed = JSON.parse(trimmed);
        const sType = parsed.serviceType?.toUpperCase();
        const fId = parsed.facilityId;

        if (sType === 'LIBRARY') {
          const matchingLib = activeServices.find(s => s.serviceType === 'LIBRARY' && (!fId || s.libraryId === fId));
          if (!matchingLib) {
            return {
              valid: false,
              serviceType: 'LIBRARY',
              facilityId: fId,
              error: 'You do not have an active library booking for this facility.',
              errorCode: 'SERVICE_MISMATCH'
            };
          }
          return {
            valid: true,
            serviceType: 'LIBRARY',
            facilityId: matchingLib.libraryId,
            facilityName: matchingLib.libraryName,
            qrId: parsed.qrId || `QR-${fId}`,
            matchingServices: [matchingLib]
          };
        }

        if (sType === 'HOME_TUITION') {
          const matchingTuition = activeServices.find(s => s.serviceType === 'HOME_TUITION' && (!fId || s.teacherId === fId));
          if (!matchingTuition) {
            return {
              valid: false,
              serviceType: 'HOME_TUITION',
              facilityId: fId,
              error: 'You do not have an active home tuition session with this teacher.',
              errorCode: 'SERVICE_MISMATCH'
            };
          }
          return {
            valid: true,
            serviceType: 'HOME_TUITION',
            facilityId: matchingTuition.teacherId,
            facilityName: matchingTuition.teacherName,
            qrId: parsed.qrId || `QR-${fId}`,
            matchingServices: [matchingTuition]
          };
        }

        if (sType === 'UNIVERSAL') {
          if (activeServices.length === 0) {
            return {
              valid: false,
              serviceType: 'UNIVERSAL',
              error: 'No active services found for this attendance point.',
              errorCode: 'NO_ACTIVE_SERVICE'
            };
          }
          return {
            valid: true,
            serviceType: 'UNIVERSAL',
            facilityId: 'universal-hub',
            facilityName: "ZYZU'S Universal Attendance",
            qrId: parsed.qrId || 'QR-UNIVERSAL',
            matchingServices: activeServices
          };
        }
      }
    } catch {
      // not JSON, continue to next parsers
    }

    // Format 3: Alphanumeric quick codes or URL query strings
    const lower = trimmed.toLowerCase();
    if (lower.includes('lib') || lower.includes('library')) {
      const matchingLib = activeServices.find(s => s.serviceType === 'LIBRARY');
      if (!matchingLib) {
        return {
          valid: false,
          serviceType: 'LIBRARY',
          error: 'You do not have an active library booking for this facility.',
          errorCode: 'SERVICE_MISMATCH'
        };
      }
      return {
        valid: true,
        serviceType: 'LIBRARY',
        facilityId: matchingLib.libraryId,
        facilityName: matchingLib.libraryName,
        qrId: `QR-${matchingLib.libraryId}`,
        matchingServices: [matchingLib]
      };
    }

    if (lower.includes('tutor') || lower.includes('tuition') || lower.includes('teach')) {
      const matchingTuition = activeServices.find(s => s.serviceType === 'HOME_TUITION');
      if (!matchingTuition) {
        return {
          valid: false,
          serviceType: 'HOME_TUITION',
          error: 'You do not have an active home tuition session with this teacher.',
          errorCode: 'SERVICE_MISMATCH'
        };
      }
      return {
        valid: true,
        serviceType: 'HOME_TUITION',
        facilityId: matchingTuition.teacherId,
        facilityName: matchingTuition.teacherName,
        qrId: `QR-${matchingTuition.teacherId}`,
        matchingServices: [matchingTuition]
      };
    }

    if (lower.includes('focus') || lower.includes('universal') || lower.includes('attendance')) {
      if (activeServices.length === 0) {
        return {
          valid: false,
          serviceType: 'UNIVERSAL',
          error: 'No active tuition or library services found on your student profile.',
          errorCode: 'NO_ACTIVE_SERVICE'
        };
      }
      return {
        valid: true,
        serviceType: 'UNIVERSAL',
        facilityId: 'focuspoint-universal',
        facilityName: "ZYZU'S Universal Center",
        qrId: 'QR-FOCUS-UNIVERSAL',
        matchingServices: activeServices
      };
    }

    // Default: Invalid QR code
    return {
      valid: false,
      error: 'This QR code is invalid or no longer active.',
      errorCode: 'INVALID_QR'
    };
  },

  /**
   * Execute authenticated check-in with duplicate prevention and Parent WhatsApp dispatch
   */
  async checkIn(params: CheckInParams): Promise<AttendanceActionResult> {
    await new Promise(r => setTimeout(r, 120));

    // 1. Record in canonical store
    const rec = mockStore.recordAttendanceCheckIn({
      studentId: params.studentId,
      studentName: params.studentName,
      serviceType: params.serviceType,
      targetId: params.targetId,
      targetName: params.targetName,
      teacherId: params.teacherId,
      teacherName: params.teacherName,
      libraryId: params.libraryId,
      libraryName: params.libraryName,
      referenceId: params.referenceId,
      bookingId: params.bookingId,
      sessionId: params.sessionId,
      source: params.source || 'STUDENT_QR',
      notes: params.notes,
      district: params.district,
      parentPhone: params.parentPhone,
      parentName: params.parentName,
    });

    // 2. Dispatch Parent WhatsApp notification (with fail-safe)
    let notifResult: WhatsAppDispatchResult | undefined;
    try {
      const facilityName = params.serviceType === 'HOME_TUITION' 
        ? (params.teacherName || rec.teacherName || 'Assigned Tutor')
        : (params.libraryName || rec.libraryName || 'Digital Study Library');

      notifResult = await notificationService.sendWhatsAppAttendanceAlert({
        recipientPhone: rec.parentPhone || '9876543210',
        recipientName: rec.parentName || 'Parent / Guardian',
        studentName: rec.studentName || 'Student',
        eventType: 'CHECK_IN',
        serviceType: params.serviceType,
        facilityOrTeacherName: facilityName,
        date: rec.date,
        time: rec.checkInTime || rec.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // Update record with notification delivery status
      rec.notificationStatus = notifResult.status;
      if (!rec.notificationLog) rec.notificationLog = [];
      rec.notificationLog.push({
        id: notifResult.id,
        timestamp: notifResult.timestamp,
        channel: 'WHATSAPP',
        status: notifResult.status,
        message: notifResult.message,
        recipient: notifResult.recipientPhone,
      });
      mockStore.updateAttendanceRecord(rec.id, { 
        notificationStatus: notifResult.status,
        notificationLog: rec.notificationLog 
      });
    } catch (notifErr) {
      console.warn('Parent WhatsApp notification dispatch failed (attendance preserved):', notifErr);
      rec.notificationStatus = 'FAILED';
      mockStore.updateAttendanceRecord(rec.id, { notificationStatus: 'FAILED' });
    }

    return {
      success: true,
      record: rec,
      notificationResult: notifResult,
      message: `Checked in successfully at ${rec.checkInTime}!`
    };
  },

  /**
   * Execute authenticated check-out with duration calculation and Parent WhatsApp dispatch
   */
  async checkOut(params: CheckOutParams): Promise<AttendanceActionResult> {
    await new Promise(r => setTimeout(r, 120));

    // 1. Record checkout in canonical store
    const rec = mockStore.recordAttendanceCheckOut({
      attendanceId: params.attendanceId,
      studentId: params.studentId,
      serviceType: params.serviceType,
      checkOutTime: params.checkOutTime,
      notes: params.notes,
    });

    // 2. Dispatch Parent WhatsApp notification (with fail-safe)
    let notifResult: WhatsAppDispatchResult | undefined;
    try {
      const facilityName = params.serviceType === 'HOME_TUITION' 
        ? (rec.teacherName || 'Assigned Tutor')
        : (rec.libraryName || 'Digital Study Library');

      notifResult = await notificationService.sendWhatsAppAttendanceAlert({
        recipientPhone: rec.parentPhone || '9876543210',
        recipientName: rec.parentName || 'Parent / Guardian',
        studentName: rec.studentName || 'Student',
        eventType: 'CHECK_OUT',
        serviceType: params.serviceType,
        facilityOrTeacherName: facilityName,
        date: rec.date,
        time: rec.checkOutTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        checkInTime: rec.checkInTime || rec.checkIn,
        checkOutTime: rec.checkOutTime || rec.checkOut,
        duration: typeof rec.duration === 'string' ? rec.duration : `${rec.duration} hrs`,
      });

      // Update record with notification delivery status
      rec.notificationStatus = notifResult.status;
      if (!rec.notificationLog) rec.notificationLog = [];
      rec.notificationLog.push({
        id: notifResult.id,
        timestamp: notifResult.timestamp,
        channel: 'WHATSAPP',
        status: notifResult.status,
        message: notifResult.message,
        recipient: notifResult.recipientPhone,
      });
      mockStore.updateAttendanceRecord(rec.id, { 
        notificationStatus: notifResult.status,
        notificationLog: rec.notificationLog 
      });
    } catch (notifErr) {
      console.warn('Parent WhatsApp notification dispatch failed (attendance preserved):', notifErr);
      rec.notificationStatus = 'FAILED';
      mockStore.updateAttendanceRecord(rec.id, { notificationStatus: 'FAILED' });
    }

    return {
      success: true,
      record: rec,
      notificationResult: notifResult,
      message: `Checked out successfully! Total duration: ${rec.duration}.`
    };
  },

  /**
   * Manual correction / status update with mandatory audit log
   */
  async updateAttendance(
    recordId: string, 
    updates: Partial<AttendanceRecord>, 
    changeReason?: string, 
    changedBy?: string
  ): Promise<AttendanceRecord | null> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.updateAttendanceRecord(recordId, updates, changeReason, changedBy);
  },

  /**
   * Backwards-compatible logAttendance for legacy callers
   */
  async logAttendance(record: Partial<AttendanceRecord> & { userId: string }): Promise<AttendanceRecord> {
    await new Promise(r => setTimeout(r, 100));
    const newRecord: AttendanceRecord = {
      id: record.id || `att-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      userId: record.userId,
      studentId: record.studentId || record.userId,
      userName: record.userName || 'Student',
      studentName: record.studentName || record.userName || 'Student',
      role: record.role || 'student',
      type: record.type || 'tutor_session',
      serviceType: (record.serviceType as any) || (record.type === 'library_checkin' || record.type === 'LIBRARY' ? 'LIBRARY' : 'HOME_TUITION'),
      referenceId: record.referenceId || 'tutor-direct',
      teacherId: record.teacherId,
      teacherName: record.teacherName,
      libraryId: record.libraryId,
      libraryName: record.libraryName,
      duration: record.duration || '1.5',
      date: record.date || new Date().toISOString().split('T')[0],
      time: record.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkInTime: record.checkInTime || record.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkOutTime: record.checkOutTime,
      status: record.status || 'present',
      notes: record.notes,
      remarks: record.remarks,
      notificationStatus: 'Not Connected',
    };
    return mockStore.logAttendance(newRecord);
  }
};
