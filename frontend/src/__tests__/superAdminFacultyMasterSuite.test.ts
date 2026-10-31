import { describe, it, expect, beforeEach } from 'vitest';
import { superAdminService, TEACHERS_STORAGE_KEY } from '../services/superAdminService';
import { auditService } from '../services/auditService';
import { mockStore } from '../mock/store';
import { safeStorage } from '../utils/storageUtils';

describe('FOCUSPOINT — Super Admin Faculty & Home Tutor Master Suite', () => {
  beforeEach(() => {
    safeStorage.removeItem(TEACHERS_STORAGE_KEY);
  });

  it('retrieves comprehensive Pan-India faculty roster with credentials and telemetry', async () => {
    const faculty = await superAdminService.getPanIndiaFaculty();
    expect(faculty).toBeDefined();
    expect(faculty.length).toBeGreaterThanOrEqual(2);

    const rajesh = faculty.find(t => t.name === 'Dr. Rajesh Sharma');
    expect(rajesh).toBeDefined();
    expect(rajesh?.districtName || rajesh?.district).toBe('Ghazipur');
    expect(rajesh?.highestQualification).toBe('Ph.D. in Physics');
    expect(rajesh?.verificationStatus).toBe('APPROVED');
    expect(rajesh?.subjects).toContain('Physics');
  });

  it('performs master profile modification and records audit trail', async () => {
    const faculty = await superAdminService.getPanIndiaFaculty();
    const rajesh = faculty.find(t => t.name === 'Dr. Rajesh Sharma') || faculty[0];

    const updated = await superAdminService.updateTeacherMasterProfile(rajesh.id, {
      expectedFeeMonthly: 4200,
      experienceYears: 10,
      reason: 'Senior Faculty distinction approved by Super Admin'
    });

    expect(updated).toBeDefined();
    expect(updated?.expectedFeeMonthly).toBe(4200);
    expect(updated?.experienceYears).toBe(10);

    // Verify audit log
    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'UPDATE_TEACHER_PROFILE' && l.targetId === rajesh.id);
    expect(log).toBeDefined();
    expect(log?.module).toBe('TEACHERS_REGISTRY');
    expect(log?.newValue).toContain('Senior Faculty distinction');
  });

  it('toggles teacher status between ACTIVE and SUSPENDED with security audit log', async () => {
    const faculty = await superAdminService.getPanIndiaFaculty();
    const teacher = faculty[0];

    // Suspend
    const suspended = await superAdminService.toggleTeacherStatus(teacher.id, 'SUSPENDED');
    expect(suspended?.isActive).toBe(false);
    expect(suspended?.accountStatus).toBe('SUSPENDED');

    // Reactivate
    const reactivated = await superAdminService.toggleTeacherStatus(teacher.id, 'ACTIVE');
    expect(reactivated?.isActive).toBe(true);
    expect(reactivated?.accountStatus).toBe('ACTIVE');

    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'TOGGLE_TEACHER_STATUS' && l.targetId === teacher.id);
    expect(log).toBeDefined();
  });

  it('verifies and accredits educator credentials with statutory reason', async () => {
    const faculty = await superAdminService.getPanIndiaFaculty();
    const teacher = faculty[0];

    const verified = await superAdminService.verifyTeacherCredentials(
      teacher.id,
      'APPROVED',
      'Degrees and police affidavit verified via state portal'
    );

    expect(verified?.verificationStatus).toBe('APPROVED');

    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'TEACHER_CREDENTIALS_VERIFIED' && l.targetId === teacher.id);
    expect(log).toBeDefined();
    expect(log?.newValue).toContain('Degrees and police affidavit verified');
  });

  it('rejects educator credentials with mandatory remediation reason', async () => {
    const faculty = await superAdminService.getPanIndiaFaculty();
    const teacher = faculty[0];

    const rejected = await superAdminService.verifyTeacherCredentials(
      teacher.id,
      'REJECTED',
      'Address proof mismatch with Aadhaar record'
    );

    expect(rejected?.verificationStatus).toBe('REJECTED');
    expect(rejected?.rejectionReason).toBe('Address proof mismatch with Aadhaar record');

    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'TEACHER_CREDENTIALS_REJECTED' && l.targetId === teacher.id);
    expect(log).toBeDefined();
  });

  it('onboards a direct verified educator with full academic portfolio', async () => {
    const newEducator = await superAdminService.createDirectTeacher({
      name: 'Dr. Sunita Sen',
      mobile: '9876543999',
      highestQualification: 'Ph.D. in Organic Chemistry',
      subjects: ['Chemistry', 'Biology'],
      expectedFeeMonthly: 3800,
      districtName: 'Varanasi',
      stateName: 'Uttar Pradesh',
      area: 'Sigra'
    });

    expect(newEducator).toBeDefined();
    expect(newEducator.id).toBeDefined();
    expect(newEducator.name).toBe('Dr. Sunita Sen');
    expect(newEducator.districtName).toBe('Varanasi');
    expect(newEducator.verificationStatus).toBe('APPROVED');

    // Verify in retrieved faculty list
    const all = await superAdminService.getPanIndiaFaculty();
    const found = all.find(t => t.id === newEducator.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Dr. Sunita Sen');

    // Verify audit log
    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'ONBOARD_TEACHER_DIRECT' && l.targetId === newEducator.id);
    expect(log).toBeDefined();
  });

  it('generates official monthly teacher salary slip with platform commission and TDS breakdown', async () => {
    const faculty = await superAdminService.getPanIndiaFaculty();
    const teacher = faculty[0];

    const slip = await superAdminService.generateTeacherSalarySlip(teacher.id, 'October 2026');

    expect(slip).toBeDefined();
    expect(slip.slipNumber).toMatch(/^FP-SAL-2026-OCT-/);
    expect(slip.teacherId).toBe(teacher.id);
    expect(slip.month).toBe('October 2026');
    expect(slip.grossTuitionRevenue).toBeGreaterThan(0);
    expect(slip.platformCommissionRate).toBe(10);
    expect(slip.platformCommissionAmount).toBe(Math.round(slip.grossTuitionRevenue * 0.1));
    expect(slip.tdsDeduction).toBe(Math.round(slip.grossTuitionRevenue * 0.01));
    expect(slip.netDisbursedAmount).toBe(
      slip.grossTuitionRevenue - slip.platformCommissionAmount - slip.tdsDeduction
    );
    expect(slip.utrNumber).toMatch(/^UTR/);
    expect(slip.status).toBe('DISBURSED');

    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'GENERATE_TEACHER_SALARY_SLIP' && l.targetId === teacher.id);
    expect(log).toBeDefined();
  });

  it('awards and toggles cryptographic educator accreditation badges', async () => {
    const faculty = await superAdminService.getPanIndiaFaculty();
    const teacher = faculty[0];

    const updated = await superAdminService.awardEducatorAccreditationBadge(
      teacher.id,
      'MASTER_PEDAGOGY_CERTIFIED',
      'Distinction awarded for scoring top tier in quarterly student reviews'
    );

    expect(updated).not.toBeNull();
    expect(updated?.accreditationBadges).toContain('MASTER_PEDAGOGY_CERTIFIED');

    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'AWARD_EDUCATOR_BADGE' && l.targetId === teacher.id);
    expect(log).toBeDefined();
    expect(log?.newValue).toContain('MASTER_PEDAGOGY_CERTIFIED');
  });

  it('dispatches and assigns a student to verified educator with session fee agreement', async () => {
    const faculty = await superAdminService.getPanIndiaFaculty();
    const teacher = faculty[0];
    const initialCount = teacher.assignedStudentsCount || 0;

    const updated = await superAdminService.assignStudentToEducator(
      teacher.id,
      'Prashant Varma',
      'Physics (Electromagnetism)',
      4000,
      'Evening home tuition slot authorized'
    );

    expect(updated).not.toBeNull();
    expect(updated?.assignedStudentsCount).toBe(initialCount + 1);

    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'ASSIGN_STUDENT_TO_EDUCATOR' && l.targetId === teacher.id);
    expect(log).toBeDefined();
    expect(log?.newValue).toContain('Prashant Varma');
  });

  it('executes AI-powered credential and biometric radar scan with cryptographic compliance', async () => {
    const scanResult = await superAdminService.runAutomatedAiCredentialScan();

    expect(scanResult).toBeDefined();
    expect(scanResult.totalScanned).toBeGreaterThanOrEqual(2);
    expect(scanResult.tamperProofCompliance).toBe(99.4);
    expect(scanResult.scanHash).toMatch(/^SHA3-512-BIO-/);

    const auditLogs = await auditService.getAuditLogs();
    const log = auditLogs.find(l => l.action === 'RUN_AI_CREDENTIAL_SCAN');
    expect(log).toBeDefined();
    expect(log?.newValue).toContain('Compliance: 99.4%');
  });
});
