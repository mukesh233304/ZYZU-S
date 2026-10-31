import { describe, it, expect, beforeEach } from 'vitest';
import { attendanceService } from '../services/attendanceService';
import { mockStore } from '../mock/store';
import { 
  notificationService, 
  SYSTEM_WHATSAPP_NUMBER, 
  SYSTEM_WHATSAPP_DISPLAY, 
  formatWhatsAppPhone, 
  getWhatsAppSendUrl, 
  getSystemBotWhatsAppUrl 
} from '../services/notificationService';

describe('FOCUSPOINT — ADVANCED ATTENDANCE & PRESENCE INTELLIGENCE SYSTEM', () => {
  const studentAryan = 'usr-student-aryan';
  const teacherRajesh = 'usr-teacher-rajesh';
  const librarySaidpur = 'lib-focus-saidpur';

  beforeEach(() => {
    // Reset store attendance to baseline
    mockStore.resetToDefaults();
  });

  describe('1. Active Service Detection & Scenarios (A, B, C)', () => {
    it('Scenario C: Intelligently detects student with both Home Tuition and Library services', async () => {
      const services = await attendanceService.getActiveServices(studentAryan);
      expect(services.length).toBe(2);

      const tuitionSvc = services.find(s => s.serviceType === 'HOME_TUITION');
      const librarySvc = services.find(s => s.serviceType === 'LIBRARY');

      expect(tuitionSvc).toBeDefined();
      expect(tuitionSvc?.teacherId).toBe(teacherRajesh);
      expect(tuitionSvc?.teacherName).toBe('Dr. Rajesh Sharma');

      expect(librarySvc).toBeDefined();
      expect(librarySvc?.libraryId).toBe(librarySaidpur);
      expect(librarySvc?.libraryName).toContain('Saidpur');
    });

    it('Scenario A & B: Maintains separate service definitions with unique IDs and metadata', async () => {
      const services = await attendanceService.getActiveServices(studentAryan);
      const tuition = services.find(s => s.serviceType === 'HOME_TUITION');
      const library = services.find(s => s.serviceType === 'LIBRARY');

      expect(tuition?.serviceType).toBe('HOME_TUITION');
      expect(library?.serviceType).toBe('LIBRARY');
      expect(tuition?.id).not.toBe(library?.id);
    });
  });

  describe('2. QR Code Validation & Security Rules', () => {
    it('authenticates valid Library QR for enrolled student', async () => {
      const res = await attendanceService.validateQrCode('fp-att://library/lib-focus-saidpur', studentAryan);
      expect(res.valid).toBe(true);
      expect(res.serviceType).toBe('LIBRARY');
      expect(res.facilityId).toBe(librarySaidpur);
      expect(res.matchingServices?.length).toBe(1);
    });

    it('authenticates valid Home Tuition QR for enrolled student', async () => {
      const res = await attendanceService.validateQrCode('fp-att://tuition/usr-teacher-rajesh', studentAryan);
      expect(res.valid).toBe(true);
      expect(res.serviceType).toBe('HOME_TUITION');
      expect(res.facilityId).toBe(teacherRajesh);
      expect(res.matchingServices?.length).toBe(1);
    });

    it('authenticates Universal FocusPoint QR and returns all available services for student', async () => {
      const res = await attendanceService.validateQrCode('fp-att://universal/focuspoint', studentAryan);
      expect(res.valid).toBe(true);
      expect(res.serviceType).toBe('UNIVERSAL');
      expect(res.matchingServices?.length).toBe(2);
    });

    it('rejects QR code with SERVICE_MISMATCH when student scans unenrolled facility', async () => {
      const res = await attendanceService.validateQrCode('fp-att://library/lib-unauthorized-random', studentAryan);
      expect(res.valid).toBe(false);
      expect(res.errorCode).toBe('SERVICE_MISMATCH');
      expect(res.error).toContain('You do not have an active library booking for this facility');
    });

    it('rejects invalid or corrupted QR payload with INVALID_QR error', async () => {
      const res = await attendanceService.validateQrCode('invalid-corrupted-qr-string-999', studentAryan);
      expect(res.valid).toBe(false);
      expect(res.errorCode).toBe('INVALID_QR');
      expect(res.error).toContain('invalid or no longer active');
    });
  });

  describe('3. Check-In & Check-Out State Machine & Duplicate Prevention', () => {
    it('records valid Check-In, calculates status and sets CHECKED_IN', async () => {
      const res = await attendanceService.checkIn({
        studentId: studentAryan,
        studentName: 'Aryan Singh',
        serviceType: 'HOME_TUITION',
        teacherId: teacherRajesh,
        teacherName: 'Dr. Rajesh Sharma',
        source: 'STUDENT_QR'
      });

      expect(res.success).toBe(true);
      expect(res.record.status).toBe('CHECKED_IN');
      expect(res.record.checkInTime).toBeDefined();
      expect(res.record.serviceType).toBe('HOME_TUITION');
      expect(res.record.source).toBe('STUDENT_QR');
    });

    it('prevents duplicate check-in if student is already checked in for that service today', async () => {
      await attendanceService.checkIn({
        studentId: studentAryan,
        studentName: 'Aryan Singh',
        serviceType: 'HOME_TUITION',
        teacherId: teacherRajesh,
      });

      // Second check-in attempt must fail
      await expect(
        attendanceService.checkIn({
          studentId: studentAryan,
          studentName: 'Aryan Singh',
          serviceType: 'HOME_TUITION',
          teacherId: teacherRajesh,
        })
      ).rejects.toThrow('already checked in');
    });

    it('records valid Check-Out, sets CHECKED_OUT and calculates session duration', async () => {
      const checkInRes = await attendanceService.checkIn({
        studentId: studentAryan,
        serviceType: 'LIBRARY',
        libraryId: librarySaidpur,
      });

      const checkOutRes = await attendanceService.checkOut({
        attendanceId: checkInRes.record.id,
        studentId: studentAryan,
        serviceType: 'LIBRARY',
      });

      expect(checkOutRes.success).toBe(true);
      expect(checkOutRes.record.status).toBe('CHECKED_OUT');
      expect(checkOutRes.record.checkOutTime).toBeDefined();
      expect(checkOutRes.record.duration).toBeDefined();
    });

    it('prevents check-out when no active check-in exists', async () => {
      await expect(
        attendanceService.checkOut({
          studentId: 'usr-student-nonexistent',
          serviceType: 'LIBRARY',
        })
      ).rejects.toThrow('No active check-in record found');
    });

    it('prevents duplicate check-out after session is already completed', async () => {
      const checkInRes = await attendanceService.checkIn({
        studentId: studentAryan,
        serviceType: 'LIBRARY',
        libraryId: librarySaidpur,
      });

      await attendanceService.checkOut({
        attendanceId: checkInRes.record.id,
        studentId: studentAryan,
        serviceType: 'LIBRARY',
      });

      // Second check-out attempt must fail
      await expect(
        attendanceService.checkOut({
          attendanceId: checkInRes.record.id,
          studentId: studentAryan,
          serviceType: 'LIBRARY',
        })
      ).rejects.toThrow('already checked out');
    });
  });

  describe('4. Dual-Service Independence (Separate Records for Tuition & Library)', () => {
    it('maintains independent, separate attendance records when student uses both services', async () => {
      // 1. Check in to Library
      const libCheckIn = await attendanceService.checkIn({
        studentId: studentAryan,
        serviceType: 'LIBRARY',
        libraryId: librarySaidpur,
      });

      // 2. Check in to Home Tuition
      const tuitionCheckIn = await attendanceService.checkIn({
        studentId: studentAryan,
        serviceType: 'HOME_TUITION',
        teacherId: teacherRajesh,
      });

      expect(libCheckIn.record.id).not.toBe(tuitionCheckIn.record.id);
      expect(libCheckIn.record.serviceType).toBe('LIBRARY');
      expect(tuitionCheckIn.record.serviceType).toBe('HOME_TUITION');

      // 3. Checkout Library independently
      const libCheckOut = await attendanceService.checkOut({
        attendanceId: libCheckIn.record.id,
        studentId: studentAryan,
        serviceType: 'LIBRARY',
      });

      expect(libCheckOut.record.status).toBe('CHECKED_OUT');

      // 4. Verify Tuition attendance is STILL active and untouched!
      const tuitionToday = await attendanceService.getTodayAttendance(studentAryan, 'HOME_TUITION');
      expect(tuitionToday?.status).toBe('CHECKED_IN');
      expect(tuitionToday?.checkOutTime).toBeUndefined();
    });
  });

  describe('5. Portal Cross-Synchronization (Single Authoritative Source of Truth)', () => {
    it('student check-in immediately appears in assigned Teacher Portal', async () => {
      const inRes = await attendanceService.checkIn({
        studentId: studentAryan,
        studentName: 'Aryan Singh',
        serviceType: 'HOME_TUITION',
        teacherId: teacherRajesh,
        teacherName: 'Dr. Rajesh Sharma',
      });

      const teacherRecords = await attendanceService.getTeacherAttendance(teacherRajesh);
      const foundInTeacher = teacherRecords.find(r => r.id === inRes.record.id);

      expect(foundInTeacher).toBeDefined();
      expect(foundInTeacher?.studentId).toBe(studentAryan);
      expect(foundInTeacher?.status).toBe('CHECKED_IN');
    });

    it('student check-in immediately appears in Library Owner Portal', async () => {
      const inRes = await attendanceService.checkIn({
        studentId: studentAryan,
        studentName: 'Aryan Singh',
        serviceType: 'LIBRARY',
        libraryId: librarySaidpur,
        libraryName: 'FocusPoint Premier Study Library - Saidpur',
      });

      const libRecords = await attendanceService.getLibraryAttendance(librarySaidpur);
      const foundInLibrary = libRecords.find(r => r.id === inRes.record.id);

      expect(foundInLibrary).toBeDefined();
      expect(foundInLibrary?.studentId).toBe(studentAryan);
      expect(foundInLibrary?.status).toBe('CHECKED_IN');
    });

    it('teacher manual check-in appears in Student Portal', async () => {
      const inRes = await attendanceService.checkIn({
        studentId: studentAryan,
        studentName: 'Aryan Singh',
        serviceType: 'HOME_TUITION',
        teacherId: teacherRajesh,
        teacherName: 'Dr. Rajesh Sharma',
        source: 'TEACHER_PORTAL',
        notes: 'In-person home visit verified by teacher'
      });

      const studentRecords = await attendanceService.getStudentAttendance(studentAryan);
      const foundInStudent = studentRecords.find(r => r.id === inRes.record.id);

      expect(foundInStudent).toBeDefined();
      expect(foundInStudent?.source).toBe('TEACHER_PORTAL');
      expect(foundInStudent?.status).toBe('CHECKED_IN');
    });
  });

  describe('6. Parent WhatsApp Notification Delivery & Failure Resilience', () => {
    it('dispatches properly formatted WhatsApp check-in alert to student parent', async () => {
      const res = await notificationService.sendWhatsAppAttendanceAlert({
        recipientPhone: '9876543210',
        recipientName: 'Sanjay Singh',
        studentName: 'Aryan Singh',
        eventType: 'CHECK_IN',
        serviceType: 'HOME_TUITION',
        facilityOrTeacherName: 'Dr. Rajesh Sharma',
        date: '2026-09-27',
        time: '04:02 PM',
      });

      expect(res.status).toBe('DELIVERED');
      expect(res.message).toMatch(/(FocusPoint|ZYZU'S) Attendance Alert/);
      expect(res.message).toContain('Aryan Singh');
      expect(res.message).toContain('Home Tuition');
      expect(res.message).toContain('Dr. Rajesh Sharma');
      expect(res.message).toContain('04:02 PM');
    });

    it('dispatches properly formatted WhatsApp check-out alert with duration to student parent', async () => {
      const res = await notificationService.sendWhatsAppAttendanceAlert({
        recipientPhone: '9876543210',
        recipientName: 'Sanjay Singh',
        studentName: 'Aryan Singh',
        eventType: 'CHECK_OUT',
        serviceType: 'LIBRARY',
        facilityOrTeacherName: 'FocusPoint Premier Study Library',
        date: '2026-09-27',
        time: '06:15 PM',
        checkInTime: '04:02 PM',
        checkOutTime: '06:15 PM',
        duration: '02h 13m',
      });

      expect(res.status).toBe('DELIVERED');
      expect(res.message).toContain('checked out from:');
      expect(res.message).toContain('02h 13m');
      expect(res.message).toContain('FocusPoint Premier Study Library');
    });

    it('CRITICAL: Attendance record is preserved and SUCCESS even if WhatsApp simulation fails', async () => {
      // Mock temporary failure
      const originalSend = notificationService.sendWhatsAppAttendanceAlert;
      notificationService.sendWhatsAppAttendanceAlert = async () => {
        throw new Error('Telecom gateway down');
      };

      try {
        const res = await attendanceService.checkIn({
          studentId: studentAryan,
          studentName: 'Aryan Singh',
          serviceType: 'HOME_TUITION',
          teacherId: teacherRajesh,
        });

        // Attendance MUST succeed regardless
        expect(res.success).toBe(true);
        expect(res.record.status).toBe('CHECKED_IN');
        expect(res.record.notificationStatus).toBe('FAILED');
      } finally {
        notificationService.sendWhatsAppAttendanceAlert = originalSend;
      }
    });
  });

  describe('7. Audit Trail & Controlled Manual Corrections', () => {
    it('logs audit event when attendance is corrected by authorized teacher', async () => {
      const inRes = await attendanceService.checkIn({
        studentId: studentAryan,
        serviceType: 'HOME_TUITION',
        teacherId: teacherRajesh,
      });

      const updated = await attendanceService.updateAttendance(
        inRes.record.id,
        { status: 'PRESENT', notes: 'Corrected duration and status' },
        'Student mobile battery discharged; class completed verified',
        'Dr. Rajesh Sharma'
      );

      expect(updated?.status).toBe('PRESENT');

      // Check audit logs
      const audits = mockStore.getAuditLogs();
      const attAudit = audits.find(a => a.action === 'ATTENDANCE_CORRECTED');
      expect(attAudit).toBeDefined();
      expect(attAudit?.details).toContain('Student mobile battery discharged');
    });
  });

  describe('8. Automated WhatsApp Booking Confirmations (Tutor & Library) via System Bot (9196434387)', () => {
    it('dispatches automated WhatsApp confirmation when student books a Home Tutor', async () => {
      const res = await notificationService.sendWhatsAppBookingConfirmation({
        recipientPhone: '9876543210',
        recipientName: 'Aryan Singh',
        studentName: 'Aryan Singh',
        serviceType: 'HOME_TUITION',
        bookingRef: 'req-tutor-901',
        facilityOrTeacherName: 'Dr. Rajesh Sharma',
        amount: 2500,
        transactionId: 'TXN-TUT-9021',
        details: {
          className: 'Class 10',
          subjects: ['Physics', 'Mathematics'],
          schedule: 'Mon, Wed, Fri (05:00 PM – 06:30 PM)',
        },
      });

      expect(res.status).toBe('DELIVERED');
      expect(res.systemNumber).toBe('9196434387');
      expect(res.message).toMatch(/(FocusPoint|ZYZU'S) Home Tuition Booking Confirmed!/);
      expect(res.message).toContain('+91 9196434387');
      expect(res.message).toContain('Dr. Rajesh Sharma');
      expect(res.message).toContain('Physics, Mathematics');
      expect(res.message).toContain('₹2,500');
      expect(res.whatsappUrl).toContain('https://wa.me/919876543210');
      expect(res.whatsappUrl).toContain(encodeURIComponent('Home Tuition Booking Confirmed!'));
    });

    it('dispatches automated WhatsApp confirmation when student books a Study Library Seat', async () => {
      const res = await notificationService.sendWhatsAppBookingConfirmation({
        recipientPhone: '9876543210',
        recipientName: 'Aryan Singh',
        studentName: 'Aryan Singh',
        serviceType: 'LIBRARY',
        bookingRef: 'FP-LIB-8801',
        facilityOrTeacherName: 'FocusPoint Premier Study Library',
        amount: 899,
        transactionId: 'TXN-LIB-5541',
        details: {
          seatNumber: 'Desk 14',
          shiftName: 'Morning Shift',
          shiftTimings: '08:00 AM – 02:00 PM',
          startDate: '2026-10-01',
          endDate: '2026-10-31',
        },
      });

      expect(res.status).toBe('DELIVERED');
      expect(res.systemNumber).toBe('9196434387');
      expect(res.message).toMatch(/(FocusPoint|ZYZU'S) Study Library Booking Confirmed!/);
      expect(res.message).toContain('+91 9196434387');
      expect(res.message).toContain('FocusPoint Premier Study Library');
      expect(res.message).toContain('Desk 14');
      expect(res.message).toContain('BIOMETRIC TURNSTILE ACTIVE');
      expect(res.whatsappUrl).toContain('https://wa.me/919876543210');
    });

    it('formats Indian mobile numbers properly with country code 91 for direct WhatsApp links', () => {
      expect(formatWhatsAppPhone('9876543210')).toBe('919876543210');
      expect(formatWhatsAppPhone('+91 9876543210')).toBe('919876543210');
      expect(formatWhatsAppPhone('919876543210')).toBe('919876543210');
      expect(formatWhatsAppPhone('')).toBe(SYSTEM_WHATSAPP_NUMBER);
    });

    it('constructs verified link to chat with official System Bot 9196434387', () => {
      const botUrl = getSystemBotWhatsAppUrl('Help with attendance check-in');
      expect(botUrl).toBe('https://wa.me/9196434387?text=Help%20with%20attendance%20check-in');
    });
  });
});
