import { describe, it, expect, beforeEach } from 'vitest';
import { superAdminService, LIBRARY_STUDENTS_STORAGE_KEY } from '../services/superAdminService';
import { auditService } from '../services/auditService';
import { safeStorage } from '../utils/storageUtils';

describe('FOCUSPOINT — Super Admin Library Students Registry Master Suite', () => {
  beforeEach(() => {
    safeStorage.removeItem(LIBRARY_STUDENTS_STORAGE_KEY);
  });

  it('retrieves comprehensive Pan-India library learners with territorial metadata and telemetry', async () => {
    const students = await superAdminService.getPanIndiaLibraryStudents();
    expect(students).toBeDefined();
    expect(students.length).toBeGreaterThanOrEqual(5);

    // Verify Ghazipur student
    const aryan = students.find(s => s.name.includes('Aryan Singh'));
    expect(aryan).toBeDefined();
    expect(aryan?.districtName || aryan?.district).toBe('Ghazipur');
    expect(aryan?.status).toBe('ACTIVE');

    // Verify student from Varanasi
    const aditya = students.find(s => s.name.includes('Aditya Srivastava'));
    expect(aditya).toBeDefined();
    expect(aditya?.districtName).toBe('Varanasi');
    expect(aditya?.seatNumber).toBe('Desk 04');
    expect(aditya?.feeStatus).toBe('PAID');

    // Verify student with pending dues from Patna
    const vikash = students.find(s => s.name.includes('Vikash Kumar'));
    expect(vikash).toBeDefined();
    expect(vikash?.districtName).toBe('Patna');
    expect(vikash?.dueAmount).toBeGreaterThan(0);
    expect(vikash?.feeStatus).toBe('PARTIAL');
  });

  it('performs desk and shift reallocation with mandatory audit logging', async () => {
    const students = await superAdminService.getPanIndiaLibraryStudents();
    const student = students[0];

    const updated = await superAdminService.reallocateLibrarySeat(
      student.id,
      'Desk 99',
      'Full Day Intensive (06:00 AM - 10:00 PM)',
      'Shift upgraded to Full Day for exam sprint preparation'
    );

    expect(updated).not.toBeNull();
    expect(updated?.seatNumber).toBe('Desk 99');
    expect(updated?.shiftName).toBe('Full Day Intensive (06:00 AM - 10:00 PM)');

    // Verify persisted record in store
    const refetched = await superAdminService.getPanIndiaLibraryStudents();
    const updatedInStore = refetched.find(s => s.id === student.id);
    expect(updatedInStore?.seatNumber).toBe('Desk 99');

    // Verify audit log entry
    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'REALLOCATE_LIBRARY_SEAT' && l.targetId === student.id);
    expect(log).toBeDefined();
    expect(log?.module).toBe('LIBRARY_STUDENTS_REGISTRY');
    expect(log?.newValue).toContain('Desk 99');
  });

  it('records fee payments, reduces dues, and generates compliant digital receipts', async () => {
    const students = await superAdminService.getPanIndiaLibraryStudents();
    // Pick student with dues or Patna student
    const studentWithDue = students.find(s => s.dueAmount > 0) || students[0];
    const initialDue = studentWithDue.dueAmount > 0 ? studentWithDue.dueAmount : 300;

    if (studentWithDue.dueAmount === 0) {
      studentWithDue.dueAmount = 300;
      safeStorage.setItem(LIBRARY_STUDENTS_STORAGE_KEY, JSON.stringify(students));
    }

    const paymentAmount = 150;
    const paymentResult = await superAdminService.recordLibraryStudentFeePayment(
      studentWithDue.id,
      paymentAmount,
      'UPI (PhonePe QR)',
      'UPI-REF-9928371'
    );

    expect(paymentResult).not.toBeNull();
    expect(paymentResult?.receiptNumber).toMatch(/^FP-LIB-REC-2026-\d{6}$/);
    expect(paymentResult?.student.dueAmount).toBe(initialDue - paymentAmount);
    expect(paymentResult?.student.feeStatus).toBe(initialDue - paymentAmount === 0 ? 'PAID' : 'PARTIAL');
    expect(paymentResult?.student.lastReceiptNumber).toBe(paymentResult?.receiptNumber);

    // Verify audit log
    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'RECORD_LIBRARY_FEE_PAYMENT' && l.targetId === studentWithDue.id);
    expect(log).toBeDefined();
    expect(log?.newValue).toContain(String(paymentAmount));
  });

  it('toggles student admission status and reflects in active authorization state', async () => {
    const students = await superAdminService.getPanIndiaLibraryStudents();
    const student = students[0];

    // Suspend access
    const suspended = await superAdminService.toggleLibraryStudentStatus(
      student.id,
      'SUSPENDED',
      'Temporary hall access freeze requested by learner due to travel'
    );
    expect(suspended).not.toBeNull();
    expect(suspended?.status).toBe('SUSPENDED');

    // Reactivate access
    const reactivated = await superAdminService.toggleLibraryStudentStatus(
      student.id,
      'ACTIVE',
      'Learner returned and reinstated hall desk access'
    );
    expect(reactivated).not.toBeNull();
    expect(reactivated?.status).toBe('ACTIVE');

    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'TOGGLE_LIBRARY_STUDENT_STATUS' && l.targetId === student.id);
    expect(log).toBeDefined();
  });

  it('updates master profile details with security audit trace', async () => {
    const students = await superAdminService.getPanIndiaLibraryStudents();
    const student = students[0];

    const updated = await superAdminService.updateLibraryStudentMasterProfile(student.id, {
      monthlyFee: 750,
      targetExam: 'UPSC Civil Services 2027',
      reason: 'Special request for civil services optional preparation'
    });

    expect(updated).not.toBeNull();
    expect(updated?.monthlyFee).toBe(750);
    expect(updated?.targetExam).toBe('UPSC Civil Services 2027');

    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'UPDATE_LIBRARY_STUDENT_PROFILE' && l.targetId === student.id);
    expect(log).toBeDefined();
    expect(log?.newValue).toContain('Special request for civil services');
  });

  it('directly onboards a new walk-in library learner with seat and fee allocation', async () => {
    const newLearner = await superAdminService.onboardLibraryStudentDirect({
      name: 'Rohan Shrivastav',
      mobile: '9988776655',
      email: 'rohan.s@focuspoint.internal',
      libraryId: 'lib-ghazipur-main',
      libraryName: 'FocusPoint Central Digital Study Center',
      seatNumber: 'Desk 18',
      shiftName: 'Morning Shift (07:00 AM - 01:00 PM)',
      shiftTiming: '07:00 AM - 01:00 PM',
      monthlyFee: 600,
      paidAmount: 600,
      paymentMethod: 'CASH COUNTER',
      targetExam: 'UPPSC PCS Prelims'
    });

    expect(newLearner).toBeDefined();
    expect(newLearner.id).toMatch(/^lib-std-/);
    expect(newLearner.name).toBe('Rohan Shrivastav');
    expect(newLearner.status).toBe('ACTIVE');
    expect(newLearner.bookingChannel).toBe('COUNTER_MANUAL');
    expect(newLearner.dueAmount).toBe(0);
    expect(newLearner.feeStatus).toBe('PAID');
    expect(newLearner.lastReceiptNumber).toMatch(/^FP-LIB-REC-2026-\d{6}$/);

    // Verify learner appears in roster
    const allStudents = await superAdminService.getPanIndiaLibraryStudents();
    const found = allStudents.find(s => s.id === newLearner.id);
    expect(found).toBeDefined();
    expect(found?.seatNumber).toBe('Desk 18');

    // Verify audit log
    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'ONBOARD_LIBRARY_STUDENT_DIRECT' && l.targetId === newLearner.id);
    expect(log).toBeDefined();
    expect(log?.target).toContain('Rohan Shrivastav');
    expect(log?.newValue).toContain('FocusPoint Central Digital Study Center');
  });
});
