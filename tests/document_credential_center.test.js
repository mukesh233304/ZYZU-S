import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { mockStore } from '../frontend/src/mock/store.ts';
import { documentService } from '../frontend/src/services/documentService.ts';

describe('FOCUSPOINT Universal Document & Credential Center Test Suite', () => {
  
  beforeEach(() => {
    mockStore.resetToDefaults();
  });

  describe('1. Universal Document Route Serving', () => {
    it('Should serve /student/documents with status 200 HTML', async () => {
      const res = await request(app).get('/student/documents');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });

    it('Should serve /teacher/documents with status 200 HTML', async () => {
      const res = await request(app).get('/teacher/documents');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });

    it('Should serve /library-owner/documents with status 200 HTML', async () => {
      const res = await request(app).get('/library-owner/documents');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });

    it('Should serve /district-admin/documents with status 200 HTML', async () => {
      const res = await request(app).get('/district-admin/documents');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });

    it('Should serve /super-admin/documents with status 200 HTML', async () => {
      const res = await request(app).get('/super-admin/documents');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });

    it('Should serve public QR document verification page /verify/doc/:id with status 200 HTML', async () => {
      const res = await request(app).get('/verify/doc/FP-SAL-2026-09-000145');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('2. Strict Role-Based Document Access & Isolation', () => {
    it('Ensures student only receives their own documents', async () => {
      const studentDocs = await documentService.getMyDocuments('usr-student-aryan', 'STUDENT');
      expect(studentDocs.length).toBeGreaterThan(0);
      
      // All documents must belong to the student
      for (const doc of studentDocs) {
        expect(doc.recipientId).toBe('usr-student-aryan');
        expect(doc.recipientRole).toBe('STUDENT');
        // Student should never have teacher salary slips or district expense receipts
        expect(doc.documentType).not.toBe('TEACHER_SALARY_SLIP');
        expect(doc.documentType).not.toBe('DISTRICT_EXPENSE_RECEIPT');
        expect(doc.documentType).not.toBe('LIBRARY_SETTLEMENT_RECEIPT');
      }
    });

    it('Ensures teacher cannot see another teacher salary slip or library settlement', async () => {
      const teacherDocs = await documentService.getMyDocuments('usr-teacher-rajesh', 'TEACHER');
      expect(teacherDocs.length).toBeGreaterThan(0);

      const hasSalarySlip = teacherDocs.some(d => d.documentType === 'TEACHER_SALARY_SLIP');
      expect(hasSalarySlip).toBe(true);

      for (const doc of teacherDocs) {
        expect(doc.recipientId).toBe('usr-teacher-rajesh');
        expect(doc.documentType).not.toBe('LIBRARY_SUBSCRIPTION_INVOICE');
        expect(doc.documentType).not.toBe('DISTRICT_EXPENSE_RECEIPT');
      }
    });

    it('Ensures Library Owner only sees library specific documents', async () => {
      const libDocs = await documentService.getMyDocuments('usr-lib-suresh', 'LIBRARY_OWNER');
      expect(libDocs.length).toBeGreaterThan(0);

      for (const doc of libDocs) {
        expect(doc.recipientId).toBe('usr-lib-suresh');
        expect(doc.recipientRole).toBe('LIBRARY_OWNER');
        expect(doc.documentType).not.toBe('TEACHER_SALARY_SLIP');
        expect(doc.documentType).not.toBe('DISTRICT_ADMIN_SALARY_SLIP');
      }

      // Check presence of subscription receipt and settlement receipt
      const types = libDocs.map(d => d.documentType);
      expect(types).toContain('LIBRARY_SUBSCRIPTION_RECEIPT');
      expect(types).toContain('LIBRARY_SETTLEMENT_RECEIPT');
      expect(types).toContain('LIBRARY_PARTNER_CERTIFICATE');
    });

    it('Ensures District Admin sees district official credentials and expenditure receipts', async () => {
      const adminDocs = await documentService.getMyDocuments('usr-admin-ghazipur', 'DISTRICT_ADMIN');
      expect(adminDocs.length).toBeGreaterThan(0);

      const types = adminDocs.map(d => d.documentType);
      expect(types).toContain('DISTRICT_ADMIN_ID_CARD');
      expect(types).toContain('DISTRICT_EXPENSE_RECEIPT');
      expect(types).toContain('DISTRICT_APPOINTMENT_LETTER');
    });

    it('Grants Super Admin global access to all platform documents across roles', async () => {
      const globalDocs = await documentService.getMyDocuments('usr-super-admin', 'SUPER_ADMIN');
      expect(globalDocs.length).toBeGreaterThanOrEqual(10);

      const roles = new Set(globalDocs.map(d => d.recipientRole));
      expect(roles.has('STUDENT')).toBe(true);
      expect(roles.has('TEACHER')).toBe(true);
      expect(roles.has('LIBRARY_OWNER')).toBe(true);
      expect(roles.has('DISTRICT_ADMIN')).toBe(true);
      expect(roles.has('SUPER_ADMIN')).toBe(true);
    });
  });

  describe('3. ID Card Eligibility & Secure Generation Policy', () => {
    it('Generates or retrieves an authentic ID Card for an approved teacher', async () => {
      const idCard = await documentService.generateIdCard('usr-teacher-rajesh');
      expect(idCard).toBeDefined();
      expect(idCard.category).toBe('IDENTITY');
      expect(idCard.documentType).toBe('TEACHER_ID_CARD');
      expect(idCard.documentNumber).toMatch(/^FP-ID-\d{4}-\d{6}$/);
      expect(idCard.qrVerificationUrl).toContain('/verify/doc/');
      expect(idCard.metadata?.verificationStatus || idCard.status).toBeTruthy();
    });

    it('Rejects ID card generation if user is not in APPROVED state', async () => {
      // Register a pending unapproved teacher in the mock store
      mockStore.addUser({
        id: 'usr-teacher-pending-99',
        name: 'Pending Educator',
        email: 'pending.educator@example.com',
        role: 'TEACHER',
        mobile: '9888877777',
        districtId: 'dist-gzp',
        districtName: 'Ghazipur',
        createdAt: '2026-09-01T00:00:00Z',
        isActive: true
      });
      mockStore.updateTeacherProfile('usr-teacher-pending-99', {
        verificationStatus: 'PENDING'
      });

      await expect(
        documentService.generateIdCard('usr-teacher-pending-99')
      ).rejects.toThrow(/verified and approved|accreditation/i);
    });
  });

  describe('4. Financial Document Authenticity & Zero-Fake-Receipt Policy', () => {
    it('Never produces a fake paid receipt for free services', async () => {
      const studentDocs = await documentService.getMyDocuments('usr-student-aryan', 'STUDENT');
      const freeDemoDoc = studentDocs.find(d => d.documentType === 'HOME_TUITION_DEMO_PASS' && d.paymentStatus === 'FREE');
      
      expect(freeDemoDoc).toBeDefined();
      expect(freeDemoDoc.amount).toBe(0);
      expect(freeDemoDoc.paymentStatus).toBe('FREE');
      // Must not generate a transaction ID claiming payment occurred
      expect(freeDemoDoc.transactionRef).toBeUndefined();
    });

    it('Enforces accurate transaction references and amounts on paid receipts', async () => {
      const allDocs = await documentService.getMyDocuments('usr-super-admin', 'SUPER_ADMIN');
      const paidReceipts = allDocs.filter(d => d.paymentStatus === 'PAID');
      
      expect(paidReceipts.length).toBeGreaterThan(0);
      for (const receipt of paidReceipts) {
        expect(receipt.amount).toBeGreaterThan(0);
        const ref = receipt.transactionRef || receipt.paymentId || receipt.transactionId;
        expect(ref).toBeDefined();
        expect(ref.length).toBeGreaterThan(3);
        expect(receipt.paymentMethod).toBeDefined();
      }
    });

    it('Adheres to standardized sequential document numbering schema', async () => {
      const docs = await documentService.getMyDocuments('usr-super-admin', 'SUPER_ADMIN');
      
      for (const doc of docs) {
        expect(doc.documentNumber).toMatch(/^FP-[A-Z]+-\d{4}/);
      }
    });
  });

  describe('5. Document Search & Multi-Factor Filtering', () => {
    it('Filters documents by category correctly', async () => {
      const salaryDocs = await documentService.getMyDocuments('usr-super-admin', 'SUPER_ADMIN', {
        category: 'SALARY'
      });
      expect(salaryDocs.length).toBeGreaterThan(0);
      for (const doc of salaryDocs) {
        expect(doc.category).toBe('SALARY');
      }
    });

    it('Filters documents by payment status correctly', async () => {
      const paidDocs = await documentService.getMyDocuments('usr-super-admin', 'SUPER_ADMIN', {
        paymentStatus: 'PAID'
      });
      expect(paidDocs.length).toBeGreaterThan(0);
      for (const doc of paidDocs) {
        expect(doc.paymentStatus).toBe('PAID');
      }
    });

    it('Performs case-insensitive full-text search across title, recipient, and document number', async () => {
      const searchByDocNum = await documentService.getMyDocuments('usr-super-admin', 'SUPER_ADMIN', {
        searchQuery: 'FP-SAL-2026-09-000145'
      });
      expect(searchByDocNum.length).toBe(1);
      expect(searchByDocNum[0].documentNumber).toBe('FP-SAL-2026-09-000145');

      const searchByTitle = await documentService.getMyDocuments('usr-super-admin', 'SUPER_ADMIN', {
        searchQuery: 'Salary Slip'
      });
      expect(searchByTitle.length).toBeGreaterThan(0);
    });
  });

  describe('6. Immutable Audit Trail & Status Lifecycle', () => {
    it('Records VIEWED, DOWNLOADED, and PRINTED actions and updates status', async () => {
      const doc = await documentService.getDocumentById('FP-SAL-2026-09-000145');
      expect(doc).toBeDefined();
      const initialAuditCount = doc?.auditTrail?.length || 0;

      // Simulate download action
      await documentService.recordDocumentAction(
        'FP-SAL-2026-09-000145',
        'DOWNLOADED',
        'usr-teacher-rajesh',
        'TEACHER',
        'PDF downloaded on MacOS'
      );

      const updatedDoc = await documentService.getDocumentById('FP-SAL-2026-09-000145');
      expect(updatedDoc?.status).toBe('DOWNLOADED');
      expect(updatedDoc?.auditTrail?.length).toBe(initialAuditCount + 1);
      
      const lastAudit = updatedDoc?.auditTrail?.[updatedDoc.auditTrail.length - 1];
      expect(lastAudit?.action).toBe('DOWNLOADED');
      expect(lastAudit?.performedBy).toBe('usr-teacher-rajesh');
      expect(lastAudit?.details || lastAudit?.notes).toContain('MacOS');
    });
  });

  describe('7. Super Admin Document Reissuance & Versioning', () => {
    it('Creates a superseded historical copy and issues a new v2 document', async () => {
      const originalNumber = 'FP-SUB-2026-09-000054';
      const originalDoc = await documentService.getDocumentById(originalNumber);
      expect(originalDoc).toBeDefined();
      expect(originalDoc?.version).toBe(1);
      expect(originalDoc?.isCurrent).toBe(true);

      const reissuedDoc = await documentService.reissueDocument(
        originalNumber,
        'Address correction requested by Library Owner',
        'usr-super-admin',
        'Prof. Alok Tripathi (Super Admin)'
      );

      expect(reissuedDoc).toBeDefined();
      expect(reissuedDoc.version).toBe(2);
      expect(reissuedDoc.isCurrent).toBe(true);
      expect(reissuedDoc.metadata?.supersededDocumentNumber || reissuedDoc.previousDocumentNumber).toBe(originalNumber);
      expect(reissuedDoc.metadata?.reissueReason || reissuedDoc.reissueReason).toContain('Address correction');
      expect(reissuedDoc.documentNumber).not.toBe(originalNumber);

      // Verify the old document is marked as REPLACED and not current
      const supersededDoc = await documentService.getDocumentById(originalNumber);
      expect(supersededDoc?.status).toBe('REPLACED');
      expect(supersededDoc?.isCurrent).toBe(false);
    });
  });

  describe('8. Public QR Cryptographic Verification Ledger', () => {
    it('Verifies authentic document with tamper-free ledger signature', async () => {
      const verification = await documentService.verifyDocument('FP-SAL-2026-09-000145');
      expect(verification.isValid).toBe(true);
      expect(verification.authenticityStatus || verification.status).toBeTruthy();
      expect(verification.documentNumber).toBe('FP-SAL-2026-09-000145');
      expect(verification.verificationHash || verification.cryptographicHash).toBeDefined();
      expect(verification.tamperEvidenceDetected).toBe(false);
      expect(verification.recipientName).toBe('Dr. Rajesh Sharma');
    });

    it('Fails verification for non-existent document numbers', async () => {
      const verification = await documentService.verifyDocument('FP-FAKE-9999-000000');
      expect(verification.isValid).toBe(false);
      expect(verification.status).toBe('REVOKED');
      expect(verification.tamperEvidenceDetected).toBe(true);
    });
  });

  describe('9. KPI Summary Aggregation', () => {
    it('Computes accurate KPI summary for user dashboard', async () => {
      const kpis = await documentService.getDocumentKPISummary('usr-teacher-rajesh', 'TEACHER');
      expect(kpis.totalDocuments).toBeGreaterThan(0);
      expect(kpis.salaryPayoutsCount || kpis.salaryDocuments).toBeGreaterThan(0);
      expect(kpis.identityCredentialsCount || kpis.idCardCount).toBeGreaterThanOrEqual(1);
    });
  });
});
