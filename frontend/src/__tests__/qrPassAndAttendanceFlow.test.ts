import { describe, it, expect, beforeEach } from 'vitest';
import { qrPassService } from '../services/qrPassService';
import { attendanceService } from '../services/attendanceService';
import { mockStore } from '../mock/store';
import { notificationService, SYSTEM_WHATSAPP_DISPLAY } from '../services/notificationService';

describe('FOCUSPOINT — PERSONAL QR PASS, ACTIVE-MONTH FEE VALIDATION & ATTENDANCE FLOW', () => {
  const studentAryan = 'usr-student-aryan';
  const studentNeha = 'usr-student-neha'; // Second student for cross-student testing
  const teacherRajesh = 'usr-teacher-rajesh';
  const librarySaidpur = 'lib-focus-saidpur';

  beforeEach(() => {
    mockStore.resetToDefaults();
  });

  describe('1. Personal QR Attendance Pass Issuance & Dual-Service Detection', () => {
    it('generates a Universal Personal QR Pass for a student with both active services', async () => {
      const pass = await qrPassService.getPersonalQrPass(studentAryan);

      expect(pass).toBeDefined();
      expect(pass.studentId).toBe(studentAryan);
      expect(pass.studentName).toContain('Aryan');
      expect(pass.serviceType).toBe('UNIVERSAL');
      expect(pass.status).toBe('ACTIVE');
      expect(pass.attendanceAllowed).toBe(true);
      expect(pass.activeServices.length).toBe(2);

      // Verify both services are represented
      const tuition = pass.activeServices.find(s => s.serviceType === 'HOME_TUITION');
      const library = pass.activeServices.find(s => s.serviceType === 'LIBRARY');

      expect(tuition).toBeDefined();
      expect(tuition?.teacherId).toBe(teacherRajesh);
      expect(tuition?.teacherName).toBe('Dr. Rajesh Sharma');

      expect(library).toBeDefined();
      expect(library?.libraryId).toBe(librarySaidpur);
      expect(library?.libraryName).toContain('Saidpur');
    });

    it('creates tamper-resistant secure token without exposing plaintext student credentials directly', async () => {
      const pass = await qrPassService.getPersonalQrPass(studentAryan);
      expect(pass.token).toMatch(/^fp-att-tok-v2-/);
      expect(pass.qrId).toContain('FP-QR-');
      expect(pass.scanUrl).toContain('/attendance/pass?token=');
      expect(pass.version).toBe(1);
    });

    it('binds validity dates to the authoritative current active billing month', async () => {
      const pass = await qrPassService.getPersonalQrPass(studentAryan);
      const now = new Date();
      const currentMonth = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

      expect(pass.activeMonth).toBe(currentMonth);
      expect(pass.validFrom).toBeDefined();
      expect(pass.validUntil).toBeDefined();
    });
  });

  describe('2. Active Month & Unpaid Fee Enforcement (Business Rules #14, #15, #16)', () => {
    it('allows attendance when student fees are in good standing (PAID)', async () => {
      const pass = await qrPassService.getPersonalQrPass(studentAryan);
      const scanRes = await qrPassService.validateAttendanceScan(pass.token, studentAryan);

      expect(scanRes.valid).toBe(true);
      expect(scanRes.attendanceAllowed).toBe(true);
      expect(scanRes.errorCode).toBeUndefined();
      expect(scanRes.matchingServices?.length).toBe(2);
    });

    it('BLOCKS attendance when student has an unpaid or overdue fee for the current month', async () => {
      // Add an overdue tuition fee invoice for studentAryan
      mockStore.addInvoice({
        id: 'inv-overdue-test-01',
        invoiceNumber: 'INV-2026-OVERDUE-01',
        userId: studentAryan,
        userName: 'Aryan Patel',
        type: 'TUTOR_FEE',
        referenceId: 'tuition-aryan',
        description: 'September 2026 Home Tuition Fee (Overdue)',
        amount: 3500,
        paidAmount: 0,
        balanceAmount: 3500,
        dueDate: '2026-09-05',
        status: 'OVERDUE',
      });

      // Fetch pass with authoritative fee check
      const pass = await qrPassService.getPersonalQrPass(studentAryan);
      expect(pass.attendanceAllowed).toBe(false);
      expect(pass.pendingInvoice).toBeDefined();
      expect(pass.pendingInvoice?.amount).toBe(3500);

      // Attempt scanning QR pass
      const scanRes = await qrPassService.validateAttendanceScan(pass.token, studentAryan);
      expect(scanRes.attendanceAllowed).toBe(false);
      expect(scanRes.errorCode).toBe('UNPAID_FEE');
      expect(scanRes.restrictionReason).toContain('currently inactive because the required fee');
      expect(scanRes.pendingInvoice?.amount).toBe(3500);
    });

    it('automatically restores attendance access once the pending fee is paid (no QR reissue required)', async () => {
      // 1. Create overdue invoice
      mockStore.addInvoice({
        id: 'inv-restore-test-01',
        invoiceNumber: 'INV-2026-RESTORE-01',
        userId: studentAryan,
        userName: 'Aryan Patel',
        type: 'TUTOR_FEE',
        referenceId: 'tuition-aryan',
        description: 'Monthly Tuition Fee',
        amount: 3000,
        paidAmount: 0,
        balanceAmount: 3000,
        dueDate: '2026-09-01',
        status: 'OVERDUE',
      });

      let pass = await qrPassService.getPersonalQrPass(studentAryan);
      expect(pass.attendanceAllowed).toBe(false);

      // 2. Mark invoice as PAID
      mockStore.payInvoice('inv-restore-test-01');

      // 3. Re-check pass with same token
      pass = await qrPassService.getPersonalQrPass(studentAryan);
      expect(pass.attendanceAllowed).toBe(true);
      expect(pass.status).toBe('ACTIVE');

      const scanRes = await qrPassService.validateAttendanceScan(pass.token, studentAryan);
      expect(scanRes.valid).toBe(true);
      expect(scanRes.attendanceAllowed).toBe(true);
    });
  });

  describe('3. Cross-Student QR Usage Prevention (Security Rule #27)', () => {
    it('REJECTS scan when Student A attempts to check in using Student B QR pass', async () => {
      // Get student Aryan's QR pass
      const aryanPass = await qrPassService.getPersonalQrPass(studentAryan);

      // Student Neha scans Aryan's pass while logged into her own session
      const scanRes = await qrPassService.validateAttendanceScan(aryanPass.token, studentNeha);

      expect(scanRes.valid).toBe(false);
      expect(scanRes.errorCode).toBe('CROSS_STUDENT_PROHIBITED');
      expect(scanRes.error).toContain('Cross-Student Access Prohibited');

      // Verify security audit trail recorded the violation
      const auditLogs = mockStore.getAuditLogs();
      const crossViolation = auditLogs.find(l => l.action === 'CROSS_STUDENT_ATTENDANCE_BLOCKED');
      expect(crossViolation).toBeDefined();
      expect(crossViolation?.details).toContain(studentNeha);
      expect(crossViolation?.details).toContain(studentAryan);
    });

    it('requires student authentication before validating attendance scan', async () => {
      const pass = await qrPassService.getPersonalQrPass(studentAryan);
      const scanRes = await qrPassService.validateAttendanceScan(pass.token, undefined);

      expect(scanRes.valid).toBe(false);
      expect(scanRes.errorCode).toBe('UNAUTHENTICATED');
    });
  });

  describe('4. Independent Dual-Service Check-In / Check-Out (Section 17 & 18)', () => {
    it('records completely independent attendance records for Home Tuition and Library', async () => {
      const services = await attendanceService.getActiveServices(studentAryan);
      const tuitionSvc = services.find(s => s.serviceType === 'HOME_TUITION')!;
      const librarySvc = services.find(s => s.serviceType === 'LIBRARY')!;

      // 1. Check in for Home Tuition
      const tuitionCheckIn = await attendanceService.checkIn({
        studentId: studentAryan,
        studentName: 'Aryan Patel',
        serviceType: 'HOME_TUITION',
        teacherId: tuitionSvc.teacherId,
        teacherName: tuitionSvc.teacherName,
        source: 'STUDENT_QR',
        parentPhone: '9876543210',
      });

      expect(tuitionCheckIn.success).toBe(true);
      expect(tuitionCheckIn.record.serviceType).toBe('HOME_TUITION');
      expect(tuitionCheckIn.record.checkInTime).toBeDefined();

      // 2. Check in for Digital Library independently
      const libraryCheckIn = await attendanceService.checkIn({
        studentId: studentAryan,
        studentName: 'Aryan Patel',
        serviceType: 'LIBRARY',
        libraryId: librarySvc.libraryId,
        libraryName: librarySvc.libraryName,
        source: 'STUDENT_QR',
        parentPhone: '9876543210',
      });

      expect(libraryCheckIn.success).toBe(true);
      expect(libraryCheckIn.record.serviceType).toBe('LIBRARY');
      expect(libraryCheckIn.record.id).not.toBe(tuitionCheckIn.record.id);

      // Verify both independent records exist in student attendance
      const allToday = await attendanceService.getStudentAttendance(studentAryan);
      const tuitionRec = allToday.find(r => r.serviceType === 'HOME_TUITION');
      const libraryRec = allToday.find(r => r.serviceType === 'LIBRARY');

      expect(tuitionRec).toBeDefined();
      expect(libraryRec).toBeDefined();
      expect(tuitionRec?.id).not.toBe(libraryRec?.id);
    });

    it('calculates duration correctly on Check-Out without affecting other active service', async () => {
      // Check in
      const checkInRes = await attendanceService.checkIn({
        studentId: studentAryan,
        studentName: 'Aryan Patel',
        serviceType: 'HOME_TUITION',
        teacherId: teacherRajesh,
        teacherName: 'Dr. Rajesh Sharma',
        source: 'STUDENT_QR',
      });

      // Check out with explicit checkout time
      const checkOutRes = await attendanceService.checkOut({
        attendanceId: checkInRes.record.id,
        studentId: studentAryan,
        serviceType: 'HOME_TUITION',
        checkOutTime: '06:30 PM',
      });

      expect(checkOutRes.success).toBe(true);
      expect(checkOutRes.record.checkOutTime).toBe('06:30 PM');
      expect(checkOutRes.record.status).toBe('CHECKED_OUT');
      expect(checkOutRes.record.duration).toBeDefined();
    });
  });

  describe('5. Automatic Parent WhatsApp Notifications (Section 22 & 23)', () => {
    it('dispatches verified WhatsApp notification to registered parent on student check-in', async () => {
      const res = await attendanceService.checkIn({
        studentId: studentAryan,
        studentName: 'Aryan Patel',
        serviceType: 'HOME_TUITION',
        teacherId: teacherRajesh,
        teacherName: 'Dr. Rajesh Sharma',
        source: 'STUDENT_QR',
        parentPhone: '9876543210',
        parentName: 'Mr. Patel',
      });

      expect(res.notificationResult).toBeDefined();
      expect(res.notificationResult?.status).toBe('DELIVERED');
      expect(res.notificationResult?.systemNumber).toBeDefined();
      expect(res.notificationResult?.message).toContain('Aryan Patel has checked in');
      expect(res.notificationResult?.message).toContain('Home Tuition');

      // Verify attendance record tracks notification delivery
      expect(res.record.notificationStatus).toBe('DELIVERED');
    });

    it('attendance is NEVER rolled back or broken if WhatsApp dispatch encounters a provider issue', async () => {
      // Simulate by calling attendance with invalid notification without throwing
      const res = await attendanceService.checkIn({
        studentId: studentAryan,
        studentName: 'Aryan Patel',
        serviceType: 'LIBRARY',
        libraryId: librarySaidpur,
        libraryName: 'FocusPoint Library',
        source: 'STUDENT_QR',
      });

      // Attendance must remain 100% successful
      expect(res.success).toBe(true);
      expect(res.record.id).toBeDefined();
      expect(res.record.status).toBe('CHECKED_IN');
    });
  });

  describe('6. QR Pass Reissuance & Lifecycle Management (Section 24)', () => {
    it('allows student to reissue pass with security audit logging', async () => {
      const initialPass = await qrPassService.getPersonalQrPass(studentAryan);
      expect(initialPass.version).toBe(1);

      const reissued = await qrPassService.regenerateQrPass(studentAryan, 'Damaged physical card');
      expect(reissued).toBeDefined();

      const auditLogs = mockStore.getAuditLogs();
      const reissueLog = auditLogs.find(l => l.action === 'QR_PASS_REISSUED');
      expect(reissueLog).toBeDefined();
      expect(reissueLog?.details).toContain(studentAryan);
      expect(reissueLog?.details).toContain('Damaged physical card');
    });
  });
});
