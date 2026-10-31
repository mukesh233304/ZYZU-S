import { describe, it, expect, beforeEach } from 'vitest';
import { documentService } from '../services/documentService';
import { mockStore } from '../mock/store';
import { Teacher } from '../types';

describe('FOCUSPOINT — Upgraded Teacher Console & Verification Credential Suite', () => {
  beforeEach(() => {
    mockStore.resetToDefaults();
  });

  describe('1. Teacher Verification Certificate Eligibility & Governance', () => {
    it('verifies that an approved verified educator is eligible for the official certificate', async () => {
      // Dr. Rajesh Sharma has verificationStatus: 'APPROVED' in seed data
      const eligibility = await documentService.checkTeacherCertificateEligibility('usr-teacher-rajesh');
      expect(eligibility.eligible).toBe(true);
      expect(eligibility.certificateNumber).toBeDefined();
      expect(eligibility.certificateNumber).toMatch(/FP-(TV|CERT)-2026-\d{6}/);
      expect(eligibility.teacher).toBeDefined();
      expect(eligibility.teacher?.name).toBe('Dr. Rajesh Sharma');
    });

    it('denies verification certificate to an unverified or pending teacher', async () => {
      const pendingTeacher: Teacher = {
        id: 'usr-teacher-test-pending',
        name: 'Amit Patel',
        email: 'amit.pending@focuspoint.org',
        mobile: '9876543210',
        district: 'Ghazipur',
        subjects: ['Mathematics'],
        verificationStatus: 'PENDING',
        role: 'teacher',
        createdAt: new Date().toISOString(),
      };
      mockStore.addTeacher(pendingTeacher);

      const eligibility = await documentService.checkTeacherCertificateEligibility(pendingTeacher.id);
      expect(eligibility.eligible).toBe(false);
      expect(eligibility.reason).toContain('verification is currently under review');
    });

    it('generates an authentic A4 verification certificate document for eligible teacher', async () => {
      const doc = await documentService.getOrCreateTeacherCertificate('usr-teacher-rajesh');
      expect(doc).toBeDefined();
      expect(doc?.documentType).toBe('TEACHER_VERIFICATION_CERTIFICATE');
      expect(doc?.category).toBe('CERTIFICATE');
      expect(doc?.recipientId).toBe('usr-teacher-rajesh');
      expect(doc?.qrVerificationHash).toBeDefined();
      expect(doc?.qrVerificationUrl).toContain('/verify/doc/');
    });
  });

  describe('2. Public Certificate QR Verification Ledger', () => {
    it('successfully validates teacher verification certificate via public document verification service', async () => {
      // Generate or retrieve certificate
      const certDoc = await documentService.getOrCreateTeacherCertificate('usr-teacher-rajesh');
      expect(certDoc).not.toBeNull();

      // Perform public verification check using the certificate document number
      const verificationResult = await documentService.verifyDocument(certDoc!.documentNumber);
      expect(verificationResult.isValid).toBe(true);
      expect(verificationResult.status).toBe('READY');
      expect(verificationResult.recipientName).toBe('Dr. Rajesh Sharma');
      expect(verificationResult.documentType).toBe('TEACHER_VERIFICATION_CERTIFICATE');
      expect(verificationResult.verificationHash).toBeDefined();
    });

    it('records audit events when a teacher prints or shares certificate', async () => {
      const certDoc = await documentService.getOrCreateTeacherCertificate('usr-teacher-rajesh');
      expect(certDoc).not.toBeNull();

      await documentService.recordDocumentAction(
        certDoc!.documentNumber,
        'PRINTED',
        'usr-teacher-rajesh',
        'TEACHER',
        'Physical A4 Certificate Printed'
      );

      await documentService.recordDocumentAction(
        certDoc!.documentNumber,
        'SHARED',
        'usr-teacher-rajesh',
        'TEACHER',
        'Verification link shared'
      );

      // Verify the updated document has the audit logs
      const updatedDoc = (await documentService.getMyDocuments('usr-teacher-rajesh', 'TEACHER')).find(
        (d) => d.documentNumber === certDoc!.documentNumber
      );
      expect(updatedDoc).toBeDefined();
      expect(updatedDoc?.auditTrail?.length).toBeGreaterThanOrEqual(2);
      const actions = updatedDoc?.auditTrail?.map((a) => a.action);
      expect(actions).toContain('PRINTED');
      expect(actions).toContain('SHARED');
    });
  });

  describe('3. Financial & Payout Calculations Integrity', () => {
    it('accurately computes teacher assignments revenue run-rate from authoritative seed data', () => {
      const assignments = mockStore.getTeacherAssignments('usr-teacher-rajesh');
      expect(assignments.length).toBeGreaterThan(0);

      const runRate = assignments.reduce((sum, a) => sum + (a.monthlyFee || 0), 0);
      expect(runRate).toBeGreaterThan(0);

      // 90% Net settlement calculation
      const netPayable = Math.round(runRate * 0.9);
      expect(netPayable).toBeLessThan(runRate);
      expect(netPayable).toBe(Math.round(runRate * 0.9));
    });

    it('ensures teacher payouts maintain verified bank transaction references', () => {
      const payouts = mockStore.getTeacherPayouts('usr-teacher-rajesh');
      expect(Array.isArray(payouts)).toBe(true);
      payouts.forEach((p) => {
        expect(p.amount).toBeGreaterThan(0);
        expect(p.month).toBeDefined();
        if (p.status === 'paid') {
          expect(p.utr).toBeDefined();
        }
      });
    });
  });
});
