import { describe, it, expect } from 'vitest';
import { pinCodeService } from '../services/pinCodeService';
import { convertReceiptDataToDocument } from '../components/documents/UnifiedFeeReceipt';
import { convertSubscriptionToDocument } from '../features/student/MySubscriptionsDashboard';
import { ReceiptData } from '../components/common/OfficialReceiptModal';
import { StudentSubscription } from '../types/eligibilityAndPricing';

describe('STUDENT PORTAL ADVANCED UPGRADE — COMPONENT & SERVICE VERIFICATIONS', () => {

  describe('1. PIN Code Intelligence Service (6-Digit Indian Postal Validation & Lookup)', () => {
    it('strictly validates 6-digit Indian PIN codes', () => {
      // Valid PINs
      expect(pinCodeService.isValidPinCode('208001')).toBe(true);
      expect(pinCodeService.isValidPinCode('226001')).toBe(true);
      expect(pinCodeService.isValidPinCode('233221')).toBe(true);
      expect(pinCodeService.isValidPinCode(' 110001 ')).toBe(true);

      // Invalid PINs
      expect(pinCodeService.isValidPinCode('')).toBe(false);
      expect(pinCodeService.isValidPinCode('012345')).toBe(false); // cannot start with 0
      expect(pinCodeService.isValidPinCode('12345')).toBe(false);  // 5 digits
      expect(pinCodeService.isValidPinCode('1234567')).toBe(false); // 7 digits
      expect(pinCodeService.isValidPinCode('ABCDEF')).toBe(false);
    });

    it('resolves valid Indian PIN codes into State, District, and Localities', async () => {
      const res = await pinCodeService.resolvePinCode('226001');
      expect(res.success).toBe(true);
      expect(res.pincode).toBe('226001');
      expect(res.stateName).toBe('Uttar Pradesh');
      expect(res.districtName).toContain('Lucknow');
      expect(res.source).toBeDefined();
    });

    it('returns structured error for empty or invalid PIN codes without crashing', async () => {
      const res = await pinCodeService.resolvePinCode('000000');
      expect(res.success).toBe(false);
      expect(res.message).toContain('Invalid PIN code');
    });
  });

  describe('2. Unified Fee Receipt Adapter System', () => {
    it('converts tuition fee receipt to standard UnifiedFocusPointDocument with proper metadata', () => {
      const mockTuitionReceipt: ReceiptData = {
        receiptNumber: 'RCP-2026-9901',
        invoiceNumber: 'INV-2026-9901',
        studentName: 'Aryan Sharma',
        studentId: 'usr-student-aryan',
        studentEmail: 'aryan@example.com',
        studentMobile: '9876543210',
        serviceType: 'HOME_TUTOR',
        serviceName: 'Prof. Ramesh Gupta (Physics)',
        serviceDetails: 'Daily 2-Hour Home Sessions • Class 12th Board',
        date: '2026-09-20',
        billingPeriod: 'September 2026',
        amount: 3500,
        paymentMethod: 'UPI / Direct Clearing',
        transactionId: 'TXN-9988776655',
        status: 'PAID',
        district: 'Ghazipur'
      };

      const doc = convertReceiptDataToDocument(mockTuitionReceipt);

      expect(doc.id).toBe('doc-FP-RCP-2026-9901');
      expect(doc.documentNumber).toBe('FP-RCP-2026-9901');
      expect(doc.category).toBe('PAYMENT');
      expect(doc.documentType).toBe('TUITION_FEE_RECEIPT');
      expect(doc.recipientName).toBe('Aryan Sharma');
      expect(doc.amount).toBe(3500);
      expect(doc.currency).toBe('INR');
      expect(doc.metadata.serviceType).toBe('HOME_TUTOR');
      expect(doc.metadata.teacherName).toBe('Prof. Ramesh Gupta (Physics)');
      expect(doc.metadata.invoiceNumber).toBe('INV-2026-9901');
      expect(doc.qrVerificationUrl).toMatch(/https:\/\/(focuspoint\.org\.in|zyzus\.com)\/verify\/doc\//);
      expect(doc.auditTrail.length).toBeGreaterThan(0);
    });

    it('converts library booking receipt to standard UnifiedFocusPointDocument with library branding', () => {
      const mockLibraryReceipt: ReceiptData = {
        receiptNumber: 'RCP-LIB-2026-1024',
        invoiceNumber: 'INV-LIB-2026-1024',
        studentName: 'Priya Verma',
        studentId: 'usr-student-priya',
        serviceType: 'STUDY_LIBRARY',
        serviceName: 'FocusPoint Scholars Library — Saidpur',
        serviceDetails: 'Dedicated AC Desk #14 • Morning Shift',
        date: '2026-09-22',
        billingPeriod: 'October 2026',
        amount: 800,
        paymentMethod: 'Prepaid Digital Pass',
        transactionId: 'TXN-LIB-112233',
        status: 'PAID',
        district: 'Ghazipur'
      };

      const doc = convertReceiptDataToDocument(mockLibraryReceipt);

      expect(doc.documentType).toBe('LIBRARY_SEAT_RECEIPT');
      expect(doc.title).toContain('Library Desk Fee Receipt');
      expect(doc.recipientName).toBe('Priya Verma');
      expect(doc.amount).toBe(800);
      expect(doc.metadata.libraryName).toBe('FocusPoint Scholars Library — Saidpur');
      expect(doc.authorizedRole).toBe('LIBRARY_OWNER');
    });
  });

  describe('3. Subscription Document & Receipt Architecture', () => {
    it('converts StudentSubscription to a standardized UnifiedFocusPointDocument for instant download/preview', () => {
      const mockSub: StudentSubscription = {
        id: 'sub-upsc-pro',
        studentId: 'usr-student-aryan',
        studentName: 'Aryan Sharma',
        productId: 'prod-upsc-pro',
        productName: 'UPSC Civil Services Complete Test Series & AI Insights',
        productType: 'COMPLETE_PACKAGE',
        startDate: '2026-09-01',
        endDate: '2027-08-31',
        finalPaidAmount: 2999,
        originalPrice: 4999,
        discount: 2000,
        source: 'DIRECT_PURCHASE',
        status: 'ACTIVE',
        paymentId: 'TXN-SUB-88776655',
        invoiceNumber: 'INV-SUB-2026-0045',
        features: [
          'ALL_MOCK_TESTS',
          'GROWING_INTELLIGENCE',
          'PERFORMANCE_ANALYTICS'
        ],
        createdAt: '2026-09-01T10:00:00Z',
        updatedAt: '2026-09-01T10:00:00Z'
      };

      const doc = convertSubscriptionToDocument(mockSub, 'Aryan Sharma', 'usr-student-aryan');

      expect(doc.documentNumber).toBe('FP-SUB-UPSC-PRO');
      expect(doc.category).toBe('SUBSCRIPTION');
      expect(doc.documentType).toBe('PAYMENT_INVOICE');
      expect(doc.recipientName).toBe('Aryan Sharma');
      expect(doc.amount).toBe(2999);
      expect(doc.paymentStatus).toBe('PAID');
      expect(doc.metadata.planName).toBe('UPSC Civil Services Complete Test Series & AI Insights');
      expect(doc.metadata.invoiceNumber).toBe('INV-SUB-2026-0045');
      expect(doc.metadata.featuresIncluded).toEqual(mockSub.features);
      expect(doc.validUntil).toBe('2027-08-31');
    });
  });

  describe('4. Digital Learning Store & Subscriptions Receipt Experience', () => {
    it('generates certified receipt ledger line items with full deductions and GST exemption', () => {
      const mockSub: StudentSubscription = {
        id: 'sub-upp-pass',
        studentId: 'usr-student-aryan',
        studentName: 'Aryan Sharma',
        productId: 'prod-upp-police',
        productName: 'UP Police Constable Mock Drill Series',
        productType: 'MOCK_TEST_SUBSCRIPTION',
        startDate: '2026-10-01',
        endDate: '2026-12-31',
        finalPaidAmount: 499,
        originalPrice: 999,
        discount: 500,
        source: 'DIRECT_PURCHASE',
        status: 'ACTIVE',
        paymentId: 'TXN-UPP-112233',
        invoiceNumber: 'FP-INV-UPP-PASS',
        features: ['MOCK_TESTS', 'PERFORMANCE_ANALYTICS'],
        createdAt: '2026-10-01T09:00:00Z',
        updatedAt: '2026-10-01T09:00:00Z'
      };

      const doc = convertSubscriptionToDocument(mockSub, 'Aryan Sharma', 'usr-student-aryan');

      expect(doc.documentNumber).toBe('FP-SUB-UPP-PASS');
      expect(doc.lineItems?.length).toBeGreaterThanOrEqual(3);
      expect(doc.lineItems?.some(i => i.isHighlight && i.amount === 499)).toBe(true);
      expect(doc.qrVerificationUrl).toContain('FP-SUB-UPP-PASS');
      expect(doc.qrVerificationHash).toContain('SHA256-SUB-UPP-PASS-VERIFIED');
    });
  });
});

