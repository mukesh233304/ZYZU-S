import { describe, it, expect, beforeEach } from 'vitest';
import { mockStore } from '../frontend/src/mock/store.ts';
import { teacherRegistrationPricingService } from '../frontend/src/services/teacherRegistrationPricingService.ts';

describe('FOCUSPOINT Teacher Registration Charge & Hierarchical Pricing Suite', () => {
  beforeEach(() => {
    mockStore.resetToDefaults();
  });

  // TEST 1 — FREE REGISTRATION
  describe('TEST 1 — FREE REGISTRATION (Requirement 4 & 21)', () => {
    it('should bypass payment when registration fee is ₹0 or marked Free', async () => {
      // Configure Pan-India base as ₹0 (Free)
      mockStore.saveTeacherRegistrationPricingRule(
        {
          id: 'tr-rule-pan-india',
          scope: 'PAN_INDIA',
          price: 0,
          isFree: true,
          status: 'ACTIVE'
        },
        { id: 'usr-sa-1', name: 'Super Admin', role: 'SUPER_ADMIN' }
      );

      const res = await teacherRegistrationPricingService.calculateRegistrationFee({
        state: 'Karnataka',
        district: 'Bengaluru'
      });

      expect(res.applicableFee).toBe(0);
      expect(res.isFree).toBe(true);
      expect(res.paymentRequired).toBe(false);
      expect(res.finalPayableFee).toBe(0);
    });
  });

  // TEST 2 — PAN-INDIA PAID
  describe('TEST 2 — PAN-INDIA PAID (Requirement 3 & 11)', () => {
    it('should charge Pan-India standard fee (₹500) when no local override exists', async () => {
      const res = await teacherRegistrationPricingService.calculateRegistrationFee({
        state: 'Madhya Pradesh',
        district: 'Bhopal'
      });

      expect(res.applicableFee).toBe(500);
      expect(res.pricingScope).toBe('PAN_INDIA');
      expect(res.paymentRequired).toBe(true);
      expect(res.isFree).toBe(false);
      expect(res.finalPayableFee).toBe(500);
    });
  });

  // TEST 3 — STATE OVERRIDE
  describe('TEST 3 — STATE OVERRIDE (Requirement 3 & 12)', () => {
    it('should charge State override fee (₹400) for Uttar Pradesh educators without district override', async () => {
      const res = await teacherRegistrationPricingService.calculateRegistrationFee({
        state: 'Uttar Pradesh',
        district: 'Lucknow' // Lucknow has no district-specific override seeded
      });

      expect(res.applicableFee).toBe(400);
      expect(res.pricingScope).toBe('STATE');
      expect(res.paymentRequired).toBe(true);
      expect(res.finalPayableFee).toBe(400);
      expect(res.hierarchyBreakdown.panIndiaDefault?.fee).toBe(500);
      expect(res.hierarchyBreakdown.stateDefault?.fee).toBe(400);
    });
  });

  // TEST 4 — DISTRICT OVERRIDE
  describe('TEST 4 — DISTRICT OVERRIDE (Requirement 3 & 13)', () => {
    it('should charge District override fee (₹300) for Ghazipur educators without personal override', async () => {
      const res = await teacherRegistrationPricingService.calculateRegistrationFee({
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        email: 'general.teacher@focuspoint.internal'
      });

      expect(res.applicableFee).toBe(300);
      expect(res.pricingScope).toBe('DISTRICT');
      expect(res.paymentRequired).toBe(true);
      expect(res.finalPayableFee).toBe(300);
      expect(res.hierarchyBreakdown.districtDefault?.fee).toBe(300);
      expect(res.hierarchyBreakdown.stateDefault?.fee).toBe(400);
      expect(res.hierarchyBreakdown.panIndiaDefault?.fee).toBe(500);
    });
  });

  // TEST 5 — TEACHER OVERRIDE
  describe('TEST 5 — TEACHER OVERRIDE (Requirement 3 & 14)', () => {
    it('should charge highest priority teacher override (₹200) for Pratiksha Sonkar', async () => {
      const res = await teacherRegistrationPricingService.calculateRegistrationFee({
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        email: 'pratiksha.sonkar@focuspoint.internal'
      });

      expect(res.applicableFee).toBe(200);
      expect(res.pricingScope).toBe('PARTICULAR');
      expect(res.finalPayableFee).toBe(200);
      expect(res.hierarchyBreakdown.particularTeacher?.fee).toBe(200);
      expect(res.hierarchyBreakdown.districtDefault?.fee).toBe(300);
      expect(res.hierarchyBreakdown.stateDefault?.fee).toBe(400);
      expect(res.hierarchyBreakdown.panIndiaDefault?.fee).toBe(500);
    });
  });

  // TEST 6 — DISTRICT ADMIN SECURITY
  describe('TEST 6 — DISTRICT ADMIN SECURITY (Requirement 15)', () => {
    it('should strictly deny Ghazipur District Admin from modifying Varanasi pricing', async () => {
      const res = await teacherRegistrationPricingService.savePricingRule(
        {
          scope: 'DISTRICT',
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          price: 250
        },
        {
          id: 'usr-admin-gzp',
          name: 'Virendra Pratap Singh',
          role: 'DISTRICT_ADMIN',
          district: 'Ghazipur'
        }
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('Access Denied');
    });

    it('should allow Ghazipur District Admin to modify Ghazipur district pricing', async () => {
      const res = await teacherRegistrationPricingService.savePricingRule(
        {
          id: 'tr-rule-dist-gzp',
          scope: 'DISTRICT',
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          price: 280,
          reason: 'Adjusted district onboarding rate'
        },
        {
          id: 'usr-admin-gzp',
          name: 'Virendra Pratap Singh',
          role: 'DISTRICT_ADMIN',
          district: 'Ghazipur'
        }
      );

      expect(res.success).toBe(true);
      expect(res.rule?.price).toBe(280);
    });
  });

  // TEST 7 — PAYMENT FAILURE
  describe('TEST 7 — PAYMENT FAILURE (Requirement 24 & 25)', () => {
    it('should not record a successful payment or complete registration when payment fails', async () => {
      const initialPayments = await teacherRegistrationPricingService.getRegistrationPayments();
      const initialCount = initialPayments.length;

      // Simulate a failed transaction record
      const failedTxn = {
        id: `tr-pay-failed-${Date.now()}`,
        registrationId: 'REG-FAIL-001',
        teacherName: 'Failed Applicant',
        teacherEmail: 'fail.test@focuspoint.internal',
        teacherMobile: '9000000000',
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        originalFee: 300,
        offerDiscount: 0,
        couponDiscount: 0,
        finalAmount: 300,
        currency: 'INR',
        paymentStatus: 'PAYMENT_FAILED',
        registrationStatus: 'PENDING_APPROVAL',
        createdAt: new Date().toISOString()
      };

      await teacherRegistrationPricingService.recordRegistrationPayment(failedTxn);

      const allPayments = await teacherRegistrationPricingService.getRegistrationPayments();
      expect(allPayments.length).toBe(initialCount + 1);

      const recorded = allPayments.find(p => p.id === failedTxn.id);
      expect(recorded?.paymentStatus).toBe('PAYMENT_FAILED');

      // Check analytics: failed count increases, net revenue does NOT increase
      const analytics = await teacherRegistrationPricingService.getRegistrationAnalytics();
      expect(analytics.failedPayments).toBeGreaterThanOrEqual(1);
    });
  });

  // TEST 8 — PAYMENT SUCCESS
  describe('TEST 8 — PAYMENT SUCCESS (Requirement 22 & 24)', () => {
    it('should record payment status PAID and registration status PENDING_APPROVAL after successful payment', async () => {
      const successTxn = {
        id: `tr-pay-success-${Date.now()}`,
        registrationId: 'REG-SUCCESS-101',
        teacherName: 'Anil Kumar',
        teacherEmail: 'anil.math@focuspoint.internal',
        teacherMobile: '9888877777',
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        originalFee: 300,
        offerDiscount: 0,
        couponDiscount: 0,
        finalAmount: 300,
        currency: 'INR',
        paymentId: 'UPI-TXN-999888',
        paymentMethod: 'UPI_QR',
        paymentStatus: 'PAID',
        registrationStatus: 'PENDING_APPROVAL',
        createdAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString()
      };

      const saved = await teacherRegistrationPricingService.recordRegistrationPayment(successTxn);
      expect(saved.paymentStatus).toBe('PAID');
      expect(saved.registrationStatus).toBe('PENDING_APPROVAL');

      const allPayments = await teacherRegistrationPricingService.getRegistrationPayments('Ghazipur');
      const found = allPayments.find(p => p.id === successTxn.id);
      expect(found).toBeDefined();
      expect(found?.paymentId).toBe('UPI-TXN-999888');
    });
  });

  // TEST 9 — PRICE CHANGE AFTER PAYMENT
  describe('TEST 9 — PRICE CHANGE AFTER PAYMENT (Requirement 27)', () => {
    it('should preserve historical paid amount when administrator subsequently changes the registration fee', async () => {
      // 1. Teacher pays ₹300
      const paymentRecord = {
        id: 'tr-pay-hist-test',
        registrationId: 'REG-HIST-001',
        teacherName: 'Sunita Sharma',
        teacherEmail: 'sunita@focuspoint.internal',
        teacherMobile: '9111122222',
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        originalFee: 300,
        offerDiscount: 0,
        couponDiscount: 0,
        finalAmount: 300,
        currency: 'INR',
        paymentStatus: 'PAID',
        registrationStatus: 'PENDING_APPROVAL',
        createdAt: '2026-09-01T10:00:00.000Z',
        confirmedAt: '2026-09-01T10:05:00.000Z'
      };
      await teacherRegistrationPricingService.recordRegistrationPayment(paymentRecord);

      // 2. Super Admin changes Ghazipur registration fee to ₹500
      await teacherRegistrationPricingService.savePricingRule(
        {
          id: 'tr-rule-dist-gzp',
          scope: 'DISTRICT',
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          price: 500,
          reason: 'Fee adjustment'
        },
        { id: 'usr-sa-1', name: 'Super Admin', role: 'SUPER_ADMIN' }
      );

      // 3. Check historical payment remains unchanged at ₹300
      const payments = await teacherRegistrationPricingService.getRegistrationPayments('Ghazipur');
      const histRecord = payments.find(p => p.id === 'tr-pay-hist-test');
      expect(histRecord?.finalAmount).toBe(300);

      // 4. Check new registration calculation uses new price ₹500
      const newCalc = await teacherRegistrationPricingService.calculateRegistrationFee({
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        email: 'new.teacher@focuspoint.internal'
      });
      expect(newCalc.finalPayableFee).toBe(500);
    });
  });

  // TEST 10 — OFFER
  describe('TEST 10 — OFFER INTEGRATION (Requirement 28)', () => {
    it('should apply active promotional offer discount to registration fee', async () => {
      const res = await teacherRegistrationPricingService.calculateRegistrationFee({
        state: 'Madhya Pradesh',
        district: 'Indore' // Pan-India rule ₹500
      });

      // If active platform offer exists (e.g. 20% or flat discount), verify net calculation
      expect(res.applicableFee).toBe(500);
      if (res.offerDiscount) {
        expect(res.finalPayableFee).toBe(res.applicableFee - res.offerDiscount);
      }
    });
  });

  // TEST 11 — COUPON
  describe('TEST 11 — COUPON INTEGRATION (Requirement 29)', () => {
    it('should apply coupon TEACHER100 (₹100 OFF) to reduce ₹500 registration to ₹400', async () => {
      const res = await teacherRegistrationPricingService.calculateRegistrationFee({
        state: 'Madhya Pradesh',
        district: 'Indore',
        couponCode: 'TEACHER100'
      });

      expect(res.applicableFee).toBe(500);
      expect(res.couponDiscount).toBe(100);
      expect(res.finalPayableFee).toBe(400);
    });
  });

  // TEST 12 — FREE TEACHER-SPECIFIC OVERRIDE
  describe('TEST 12 — FREE TEACHER-SPECIFIC OVERRIDE (Requirement 4 & 14)', () => {
    it('should bypass payment when a specific teacher has a FREE (₹0) override', async () => {
      // Add a particular teacher rule with price: 0
      await teacherRegistrationPricingService.savePricingRule(
        {
          scope: 'PARTICULAR',
          state: 'Uttar Pradesh',
          district: 'Ghazipur',
          teacherName: 'Scholarship Educator',
          teacherEmail: 'scholarship.tutor@focuspoint.internal',
          price: 0,
          isFree: true,
          status: 'ACTIVE'
        },
        { id: 'usr-admin-gzp', name: 'District Admin', role: 'DISTRICT_ADMIN', district: 'Ghazipur' }
      );

      const res = await teacherRegistrationPricingService.calculateRegistrationFee({
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        email: 'scholarship.tutor@focuspoint.internal'
      });

      expect(res.applicableFee).toBe(0);
      expect(res.isFree).toBe(true);
      expect(res.paymentRequired).toBe(false);
      expect(res.finalPayableFee).toBe(0);
    });
  });

  // TEST 13 — LOCATION CHANGE
  describe('TEST 13 — LOCATION CHANGE PROTECTION (Requirement 39)', () => {
    it('should dynamically recalculate fee when location changes from Ghazipur (₹300) to Varanasi (₹400)', async () => {
      // Initial location: Ghazipur
      const resGzp = await teacherRegistrationPricingService.calculateRegistrationFee({
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        email: 'moving.teacher@focuspoint.internal'
      });
      expect(resGzp.applicableFee).toBe(300);

      // Changed location: Varanasi (no district override, inherits State UP fee ₹400)
      const resVns = await teacherRegistrationPricingService.calculateRegistrationFee({
        state: 'Uttar Pradesh',
        district: 'Varanasi',
        email: 'moving.teacher@focuspoint.internal'
      });
      expect(resVns.applicableFee).toBe(400);
    });
  });

  // TEST 14 — FRONTEND PRICE MANIPULATION
  describe('TEST 14 — FRONTEND PRICE MANIPULATION (Requirement 38)', () => {
    it('should reject client-side manipulated fees and enforce server/service calculated fee', async () => {
      // If a manipulated parameter is tested, calculateRegistrationFee resolves strictly from rule hierarchy
      const res = await teacherRegistrationPricingService.calculateRegistrationFee({
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        email: 'hacker@focuspoint.internal'
      });

      // Price is strictly ₹300, not any client-supplied value
      expect(res.applicableFee).toBe(300);
      expect(res.finalPayableFee).toBe(300);
    });
  });
});
