import { describe, it, expect, beforeEach } from 'vitest';
import { mockStore } from '../frontend/src/mock/store.ts';
import { librarySubscriptionService } from '../frontend/src/services/librarySubscriptionService.ts';

describe('FOCUSPOINT Advanced Library Listing Subscription, Pricing, Payment, Renewal & Cancellation Suite', () => {
  beforeEach(() => {
    mockStore.resetToDefaults();
  });

  // TEST 1 — FREE SUBSCRIPTION REGISTRATION
  describe('TEST 1 — FREE REGISTRATION (Section 62 - Test 1)', () => {
    it('should bypass payment when listing fee is ₹0 or marked Free', async () => {
      // Configure Ghazipur district rule as ₹0 (Free Tier)
      mockStore.saveLibrarySubscriptionPricingRule({
        id: 'rule-lib-gzp-free',
        name: 'Ghazipur Free Listing Campaign',
        scope: 'DISTRICT',
        district: 'Ghazipur',
        state: 'Uttar Pradesh',
        price: 0,
        currency: 'INR',
        status: 'ACTIVE',
        effectiveFrom: '2026-01-01',
        priceProtection: 'LOCKED',
        refundPolicy: 'FULL_24H',
        gracePeriodDays: 7,
        updatedAt: new Date().toISOString(),
        updatedBy: 'Super Admin',
      }, 'SUPER_ADMIN');

      const res = await librarySubscriptionService.calculateSubscriptionPrice({
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        libraryName: 'Ghazipur Public Study Hall',
      });

      expect(res.applicablePrice).toBe(0);
      expect(res.isFree).toBe(true);
      expect(res.paymentRequired).toBe(false);
      expect(res.finalPayableAmount).toBe(0);

      // Create subscription directly without payment
      const sub = await librarySubscriptionService.createSubscription({
        libraryId: 'lib-test-free-1',
        libraryName: 'Ghazipur Public Study Hall',
        ownerId: 'usr-owner-test',
        ownerName: 'Test Owner',
        ownerEmail: 'owner@test.org',
        ownerMobile: '9876543210',
        planId: 'plan-lib-monthly',
        planName: 'Monthly Listing Subscription',
        billingCycle: 'MONTHLY',
        basePrice: 0,
        pricingScope: 'DISTRICT',
        offerDiscount: 0,
        couponDiscount: 0,
        finalPaidAmount: 0,
        isFree: true,
        status: 'ACTIVE',
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        autoRenew: true,
      });

      expect(sub.id).toBeDefined();
      expect(sub.status).toBe('ACTIVE');
      expect(sub.isFree).toBe(true);
      expect(sub.finalPaidAmount).toBe(0);
    });
  });

  // TEST 2 — PAN-INDIA PAID
  describe('TEST 2 — PAN-INDIA PAID (Section 62 - Test 2)', () => {
    it('should charge Pan-India standard fee (₹500/mo) when no local override exists', async () => {
      const res = await librarySubscriptionService.calculateSubscriptionPrice({
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        libraryName: 'Bengaluru Tech Study Hub',
        planId: 'plan-lib-monthly',
      });

      expect(res.applicablePrice).toBe(500);
      expect(res.pricingScope).toBe('PAN_INDIA');
      expect(res.paymentRequired).toBe(true);
      expect(res.isFree).toBe(false);
      expect(res.finalPayableAmount).toBe(500);
      expect(res.hierarchyBreakdown.panIndiaDefault?.fee).toBe(500);
    });
  });

  // TEST 3 — STATE OVERRIDE
  describe('TEST 3 — STATE OVERRIDE (Section 62 - Test 3)', () => {
    it('should charge State override fee (₹400/mo) for Uttar Pradesh libraries without district override', async () => {
      const res = await librarySubscriptionService.calculateSubscriptionPrice({
        state: 'Uttar Pradesh',
        district: 'Lucknow', // Lucknow has no district-specific override seeded
        libraryName: 'Lucknow Central Study Point',
        planId: 'plan-lib-monthly',
      });

      expect(res.applicablePrice).toBe(400);
      expect(res.pricingScope).toBe('STATE');
      expect(res.paymentRequired).toBe(true);
      expect(res.finalPayableAmount).toBe(400);
      expect(res.hierarchyBreakdown.panIndiaDefault?.fee).toBe(500);
      expect(res.hierarchyBreakdown.stateDefault?.fee).toBe(400);
    });
  });

  // TEST 4 — DISTRICT OVERRIDE
  describe('TEST 4 — DISTRICT OVERRIDE (Section 62 - Test 4)', () => {
    it('should charge District override fee (₹300/mo) for Ghazipur libraries without particular override', async () => {
      const res = await librarySubscriptionService.calculateSubscriptionPrice({
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        libraryName: 'Kashi Study Library Saidpur',
        planId: 'plan-lib-monthly',
      });

      expect(res.applicablePrice).toBe(300);
      expect(res.pricingScope).toBe('DISTRICT');
      expect(res.paymentRequired).toBe(true);
      expect(res.finalPayableAmount).toBe(300);
      expect(res.hierarchyBreakdown.districtDefault?.fee).toBe(300);
      expect(res.hierarchyBreakdown.stateDefault?.fee).toBe(400);
      expect(res.hierarchyBreakdown.panIndiaDefault?.fee).toBe(500);
    });
  });

  // TEST 5 — PARTICULAR LIBRARY OVERRIDE
  describe('TEST 5 — LIBRARY OVERRIDE (Section 62 - Test 5)', () => {
    it('should charge highest priority library override (₹200/mo) for FocusPoint Premier Study Library', async () => {
      const res = await librarySubscriptionService.calculateSubscriptionPrice({
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        libraryName: 'FocusPoint Premier Study Library',
        planId: 'plan-lib-monthly',
      });

      expect(res.applicablePrice).toBe(200);
      expect(res.pricingScope).toBe('PARTICULAR');
      expect(res.finalPayableAmount).toBe(200);
      expect(res.hierarchyBreakdown.particularLibrary?.fee).toBe(200);
      expect(res.hierarchyBreakdown.districtDefault?.fee).toBe(300);
    });
  });

  // TEST 6 — PAYMENT FAILURE HANDLING
  describe('TEST 6 — PAYMENT FAILURE (Section 62 - Test 6)', () => {
    it('should record failed payment status without corrupting application state', async () => {
      const failedPayment = await librarySubscriptionService.recordPayment({
        subscriptionId: 'sub-test-fail-1',
        libraryId: 'lib-test-fail-1',
        libraryName: 'Test Failing Library',
        ownerName: 'Failing Owner',
        ownerEmail: 'fail@focuspoint.org',
        ownerMobile: '9876543211',
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        planId: 'plan-lib-monthly',
        planName: 'Monthly Subscription',
        billingCycle: 'MONTHLY',
        originalFee: 300,
        offerDiscount: 0,
        couponDiscount: 0,
        finalAmount: 300,
        currency: 'INR',
        paymentId: 'PAY-FAIL-SIM',
        paymentMethod: 'UPI_QR',
        paymentStatus: 'PAYMENT_FAILED',
        subscriptionStatus: 'PAYMENT_PENDING',
        invoiceNumber: 'INV-FAIL-01',
      });

      expect(failedPayment.paymentStatus).toBe('PAYMENT_FAILED');
      expect(failedPayment.subscriptionStatus).toBe('PAYMENT_PENDING');

      // Check payment ledger has recorded failure
      const payments = await librarySubscriptionService.getPayments('Ghazipur');
      const found = payments.find(p => p.id === failedPayment.id);
      expect(found).toBeDefined();
      expect(found?.paymentStatus).toBe('PAYMENT_FAILED');
    });
  });

  // TEST 7 — PAYMENT SUCCESS & SUBSCRIPTION ACTIVATION
  describe('TEST 7 — PAYMENT SUCCESS & ACTIVATION (Section 62 - Test 7)', () => {
    it('should process payment, issue tax invoice, and activate listing subscription', async () => {
      const payment = await librarySubscriptionService.recordPayment({
        subscriptionId: 'sub-test-act-1',
        libraryId: 'lib-test-act-1',
        libraryName: 'Active Success Library',
        ownerName: 'Success Owner',
        ownerEmail: 'success@focuspoint.org',
        ownerMobile: '9876543212',
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        planId: 'plan-lib-monthly',
        planName: 'Monthly Subscription',
        billingCycle: 'MONTHLY',
        originalFee: 300,
        offerDiscount: 0,
        couponDiscount: 0,
        finalAmount: 300,
        currency: 'INR',
        paymentId: 'PAY-SUCCESS-777',
        paymentMethod: 'UPI_QR',
        paymentStatus: 'PAID',
        subscriptionStatus: 'ACTIVE',
      });

      expect(payment.paymentStatus).toBe('PAID');
      expect(payment.invoiceNumber).toMatch(/^INV-LS-/);

      const sub = await librarySubscriptionService.createSubscription({
        libraryId: 'lib-test-act-1',
        libraryName: 'Active Success Library',
        ownerId: 'usr-owner-success',
        ownerName: 'Success Owner',
        ownerEmail: 'success@focuspoint.org',
        ownerMobile: '9876543212',
        planId: 'plan-lib-monthly',
        planName: 'Monthly Subscription',
        billingCycle: 'MONTHLY',
        basePrice: 300,
        pricingScope: 'DISTRICT',
        offerDiscount: 0,
        couponDiscount: 0,
        finalPaidAmount: 300,
        isFree: false,
        status: 'ACTIVE',
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        paymentId: payment.id,
        paymentMethod: 'UPI_QR',
        autoRenew: true,
      });

      expect(sub.status).toBe('ACTIVE');
      expect(sub.finalPaidAmount).toBe(300);
      expect(sub.cancellationDeadline).toBeDefined();

      // Verify cancellation deadline is exactly activatedAt + 24 hours
      const activatedTime = new Date(sub.activatedAt).getTime();
      const deadlineTime = new Date(sub.cancellationDeadline).getTime();
      expect(deadlineTime - activatedTime).toBe(24 * 60 * 60 * 1000);
    });
  });

  // TEST 8 — 24-HOUR CANCELLATION SUCCESS
  describe('TEST 8 — 24-HOUR CANCELLATION (Section 62 - Test 8)', () => {
    it('should cancel subscription and issue full refund within 24 hours of activation', async () => {
      // Create a brand new active subscription
      const sub = await librarySubscriptionService.createSubscription({
        libraryId: 'lib-cancel-valid-1',
        libraryName: 'Cancellation Eligible Library',
        ownerId: 'usr-owner-canc',
        ownerName: 'Canc Owner',
        ownerEmail: 'canc@focuspoint.org',
        ownerMobile: '9876543213',
        planId: 'plan-lib-monthly',
        planName: 'Monthly Subscription',
        billingCycle: 'MONTHLY',
        basePrice: 300,
        pricingScope: 'DISTRICT',
        offerDiscount: 0,
        couponDiscount: 0,
        finalPaidAmount: 300,
        isFree: false,
        status: 'ACTIVE',
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        autoRenew: true,
      });

      // Request cancellation within 24 hours
      const cancelRes = await librarySubscriptionService.requestCancellation(
        sub.id,
        'Changed mind regarding listing shifts',
        'ACCIDENTAL_PURCHASE'
      );

      expect(cancelRes.success).toBe(true);
      expect(cancelRes.refundAmount).toBe(300);
      expect(cancelRes.cancellationRequest).toBeDefined();
      expect(cancelRes.cancellationRequest?.isWithin24Hours).toBe(true);

      // Verify subscription status is updated to CANCELLED
      const updatedSub = await librarySubscriptionService.getSubscriptionById(sub.id);
      expect(updatedSub?.status).toBe('CANCELLED');
      expect(updatedSub?.refundStatus).toBe('PROCESSED');
      expect(updatedSub?.refundAmount).toBe(300);
    });
  });

  // TEST 9 — CANCELLATION AFTER 24 HOURS REJECTED
  describe('TEST 9 — CANCELLATION AFTER 24H REJECTED (Section 62 - Test 9)', () => {
    it('should strictly reject cancellation requested after 24 hours deadline', async () => {
      // Create subscription with activation time 48 hours in past
      const sub = await librarySubscriptionService.createSubscription({
        libraryId: 'lib-cancel-expired-1',
        libraryName: 'Expired Cancellation Window Library',
        ownerId: 'usr-owner-old',
        ownerName: 'Old Owner',
        ownerEmail: 'old@focuspoint.org',
        ownerMobile: '9876543214',
        planId: 'plan-lib-monthly',
        planName: 'Monthly Subscription',
        billingCycle: 'MONTHLY',
        basePrice: 300,
        pricingScope: 'DISTRICT',
        offerDiscount: 0,
        couponDiscount: 0,
        finalPaidAmount: 300,
        isFree: false,
        status: 'ACTIVE',
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        autoRenew: true,
      });

      // Manually backdate activatedAt and cancellationDeadline
      sub.activatedAt = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      sub.cancellationDeadline = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const cancelRes = await librarySubscriptionService.requestCancellation(
        sub.id,
        'Attempting late cancellation',
        'OTHER'
      );

      expect(cancelRes.success).toBe(false);
      expect(cancelRes.error).toContain('Cancellation window expired');

      // Verify subscription remains ACTIVE
      const rechecked = await librarySubscriptionService.getSubscriptionById(sub.id);
      expect(rechecked?.status).toBe('ACTIVE');
    });
  });

  // TEST 10 — PRICE PROTECTION
  describe('TEST 10 — PRICE PROTECTION (Section 62 - Test 10)', () => {
    it('should protect existing active subscriptions when admin changes pricing rule', async () => {
      // 1. Create subscription at current Ghazipur price (₹300)
      const sub = await librarySubscriptionService.createSubscription({
        libraryId: 'lib-price-prot-1',
        libraryName: 'Protected Price Study Space',
        ownerId: 'usr-owner-prot',
        ownerName: 'Protected Owner',
        ownerEmail: 'prot@focuspoint.org',
        ownerMobile: '9876543215',
        planId: 'plan-lib-monthly',
        planName: 'Monthly Subscription',
        billingCycle: 'MONTHLY',
        basePrice: 300,
        pricingScope: 'DISTRICT',
        offerDiscount: 0,
        couponDiscount: 0,
        finalPaidAmount: 300,
        isFree: false,
        status: 'ACTIVE',
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        priceProtection: 'LOCKED',
        lockedPrice: 300,
        autoRenew: true,
      });

      // 2. Admin increases Ghazipur district rule to ₹450
      mockStore.saveLibrarySubscriptionPricingRule({
        id: 'rule-lib-gzp',
        name: 'Ghazipur District Override Rule (Increased)',
        scope: 'DISTRICT',
        district: 'Ghazipur',
        state: 'Uttar Pradesh',
        price: 450,
        currency: 'INR',
        status: 'ACTIVE',
        effectiveFrom: '2026-01-01',
        priceProtection: 'LOCKED',
        refundPolicy: 'FULL_24H',
        gracePeriodDays: 7,
        updatedAt: new Date().toISOString(),
        updatedBy: 'Super Admin',
      }, 'SUPER_ADMIN');

      // 3. New calculation reflects increased fee for new subscribers
      const newCalc = await librarySubscriptionService.calculateSubscriptionPrice({
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        libraryName: 'Another Library',
        planId: 'plan-lib-monthly',
      });
      expect(newCalc.finalPayableAmount).toBe(450);

      // 4. Existing subscription renewal honors lockedPrice (₹300)
      const renewedSub = await librarySubscriptionService.renewSubscription(sub.id);
      expect(renewedSub.finalPaidAmount).toBe(300);
      expect(renewedSub.status).toBe('ACTIVE');
    });
  });

  // TEST 11 — DURATION SCALING / OFFERS
  describe('TEST 11 — DURATION SCALING (Section 62 - Test 11)', () => {
    it('should scale duration discounts correctly (Quarterly -15%, Half-Yearly -20%, Yearly -25%)', async () => {
      // Pan-India monthly base is ₹500
      const monthlyRes = await librarySubscriptionService.calculateSubscriptionPrice({
        planId: 'plan-lib-monthly',
      });
      expect(monthlyRes.finalPayableAmount).toBe(500);

      const quarterlyRes = await librarySubscriptionService.calculateSubscriptionPrice({
        planId: 'plan-lib-quarterly',
      });
      // 3 months * 500 = 1500; 15% discount = 225; Expected = 1275
      expect(quarterlyRes.offerDiscount).toBe(225);
      expect(quarterlyRes.finalPayableAmount).toBe(1275);

      const halfYearlyRes = await librarySubscriptionService.calculateSubscriptionPrice({
        planId: 'plan-lib-half-yearly',
      });
      // 6 months * 500 = 3000; 20% discount = 600; Expected = 2400
      expect(halfYearlyRes.offerDiscount).toBe(600);
      expect(halfYearlyRes.finalPayableAmount).toBe(2400);

      const yearlyRes = await librarySubscriptionService.calculateSubscriptionPrice({
        planId: 'plan-lib-yearly',
      });
      // 12 months * 500 = 6000; 25% discount = 1500; Expected = 4500
      expect(yearlyRes.offerDiscount).toBe(1500);
      expect(yearlyRes.finalPayableAmount).toBe(4500);
    });
  });

  // TEST 12 — COUPON CODES
  describe('TEST 12 — COUPON CODES (Section 62 - Test 12)', () => {
    it('should apply LIBRARY50 (flat ₹50 off) and WELCOMEFREE (100% off)', async () => {
      // Pan-India Monthly ₹500 - LIBRARY50 => ₹450
      const res50 = await librarySubscriptionService.calculateSubscriptionPrice({
        planId: 'plan-lib-monthly',
        couponCode: 'LIBRARY50',
      });
      expect(res50.couponDiscount).toBe(50);
      expect(res50.finalPayableAmount).toBe(450);

      // Pan-India Monthly ₹500 - WELCOMEFREE => ₹0 (Free)
      const resFree = await librarySubscriptionService.calculateSubscriptionPrice({
        planId: 'plan-lib-monthly',
        couponCode: 'WELCOMEFREE',
      });
      expect(resFree.couponDiscount).toBe(500);
      expect(resFree.finalPayableAmount).toBe(0);
      expect(resFree.isFree).toBe(true);
      expect(resFree.paymentRequired).toBe(false);
    });
  });

  // TEST 13 — DISTRICT ADMIN PERMISSION BOUNDARY
  describe('TEST 13 — DISTRICT ADMIN SECURITY (Section 62 - Test 13)', () => {
    it('should reject District Admin attempting to set Pan-India rule or rule in other districts', () => {
      // District admin of Ghazipur trying to set Pan-India rule
      expect(() => {
        mockStore.saveLibrarySubscriptionPricingRule({
          id: 'rule-illegal-pan-india',
          name: 'Illegal Pan-India by District Admin',
          scope: 'PAN_INDIA',
          price: 100,
          currency: 'INR',
          status: 'ACTIVE',
          effectiveFrom: '2026-01-01',
          priceProtection: 'NONE',
          refundPolicy: 'FULL_24H',
          gracePeriodDays: 7,
          updatedAt: new Date().toISOString(),
          updatedBy: 'Ghazipur Admin',
        }, 'DISTRICT_ADMIN', 'Ghazipur');
      }).toThrow(/District Admins cannot configure Pan-India/);

      // District admin of Ghazipur trying to set rule for Varanasi
      expect(() => {
        mockStore.saveLibrarySubscriptionPricingRule({
          id: 'rule-illegal-varanasi',
          name: 'Illegal Varanasi Rule',
          scope: 'DISTRICT',
          district: 'Varanasi',
          state: 'Uttar Pradesh',
          price: 250,
          currency: 'INR',
          status: 'ACTIVE',
          effectiveFrom: '2026-01-01',
          priceProtection: 'NONE',
          refundPolicy: 'FULL_24H',
          gracePeriodDays: 7,
          updatedAt: new Date().toISOString(),
          updatedBy: 'Ghazipur Admin',
        }, 'DISTRICT_ADMIN', 'Ghazipur');
      }).toThrow(/District Admins can only configure pricing for their assigned district/);
    });
  });

  // TEST 14 — NEGATIVE PRICE REJECTION
  describe('TEST 14 — NEGATIVE PRICE REJECTION (Section 62 - Test 14)', () => {
    it('should throw an error if a pricing rule is configured with negative price', () => {
      expect(() => {
        mockStore.saveLibrarySubscriptionPricingRule({
          id: 'rule-negative-price',
          name: 'Invalid Negative Rule',
          scope: 'DISTRICT',
          district: 'Ghazipur',
          state: 'Uttar Pradesh',
          price: -150,
          currency: 'INR',
          status: 'ACTIVE',
          effectiveFrom: '2026-01-01',
          priceProtection: 'NONE',
          refundPolicy: 'FULL_24H',
          gracePeriodDays: 7,
          updatedAt: new Date().toISOString(),
          updatedBy: 'Super Admin',
        }, 'SUPER_ADMIN');
      }).toThrow(/Subscription fee cannot be negative/);
    });
  });

  // TEST 15 — DUPLICATE PAYMENT PREVENTION
  describe('TEST 15 — DUPLICATE PAYMENT PROTECTION (Section 62 - Test 15)', () => {
    it('should prevent duplicate payments for the same transactionId or idempotency key', async () => {
      const p1 = await librarySubscriptionService.recordPayment({
        subscriptionId: 'sub-dup-test-1',
        libraryId: 'lib-dup-1',
        libraryName: 'Duplicate Test Library',
        ownerName: 'Owner D',
        ownerEmail: 'd@focuspoint.org',
        ownerMobile: '9876543216',
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        planId: 'plan-lib-monthly',
        planName: 'Monthly Subscription',
        billingCycle: 'MONTHLY',
        originalFee: 300,
        offerDiscount: 0,
        couponDiscount: 0,
        finalAmount: 300,
        currency: 'INR',
        paymentId: 'PAY-UNIQUE-IDEMPOTENT-123',
        idempotencyKey: 'IDEMP-KEY-999',
        paymentMethod: 'UPI_QR',
        paymentStatus: 'PAID',
        subscriptionStatus: 'ACTIVE',
      });

      // Submit identical payment with same idempotencyKey
      const p2 = await librarySubscriptionService.recordPayment({
        subscriptionId: 'sub-dup-test-1',
        libraryId: 'lib-dup-1',
        libraryName: 'Duplicate Test Library',
        ownerName: 'Owner D',
        ownerEmail: 'd@focuspoint.org',
        ownerMobile: '9876543216',
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        planId: 'plan-lib-monthly',
        planName: 'Monthly Subscription',
        billingCycle: 'MONTHLY',
        originalFee: 300,
        offerDiscount: 0,
        couponDiscount: 0,
        finalAmount: 300,
        currency: 'INR',
        paymentId: 'PAY-UNIQUE-IDEMPOTENT-123',
        idempotencyKey: 'IDEMP-KEY-999',
        paymentMethod: 'UPI_QR',
        paymentStatus: 'PAID',
        subscriptionStatus: 'ACTIVE',
      });

      // Must return identical existing record without creating a second entry
      expect(p1.id).toBe(p2.id);
      expect(p1.invoiceNumber).toBe(p2.invoiceNumber);

      const allPayments = await librarySubscriptionService.getPayments('Ghazipur');
      const duplicates = allPayments.filter(p => p.idempotencyKey === 'IDEMP-KEY-999');
      expect(duplicates.length).toBe(1);
    });
  });
});
