import { describe, it, expect, beforeEach } from 'vitest';
import { policyService, SYSTEM_DEFAULTS } from '../frontend/src/services/policyService.ts';

// Minimal localStorage mock for Node/Vitest environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) { return this.store[key] || null; }
  setItem(key, value) { this.store[key] = value.toString(); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}

globalThis.localStorage = new MockLocalStorage();

describe('District Admin — Commission & Offer Policy Management System', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    // Reinitialize policyService to reload clean factory data
    // @ts-ignore
    policyService['init']();
  });

  // =========================================================================
  // 1. COMMISSION POLICY — 3-TIER PRIORITY RESOLUTION
  // =========================================================================
  describe('1. 3-Tier Commission Priority Engine', () => {
    it('Tier 1: Particular Library Custom Override takes highest precedence over District Common', () => {
      // lib-gzp-01 has an 8% custom override in Ghazipur (District common is 10%)
      const resolved = policyService.resolveCommission({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-gzp-01',
      });

      expect(resolved.policySource).toBe('CUSTOM_OVERRIDE');
      expect(resolved.commissionType).toBe('PERCENTAGE');
      expect(resolved.commissionValue).toBe(8);
      expect(resolved.policy?.targetId).toBe('lib-gzp-01');
    });

    it('Tier 1: Particular Tuition/Tutor Custom Override takes highest precedence over District Common', () => {
      // usr-teacher-01 has a 12% custom override in Ghazipur (District common is 15%)
      const resolved = policyService.resolveCommission({
        districtName: 'Ghazipur',
        serviceType: 'TUITION',
        targetId: 'usr-teacher-01',
      });

      expect(resolved.policySource).toBe('CUSTOM_OVERRIDE');
      expect(resolved.commissionType).toBe('PERCENTAGE');
      expect(resolved.commissionValue).toBe(12);
      expect(resolved.policy?.targetId).toBe('usr-teacher-01');
    });

    it('Tier 2: Non-overridden entity falls back to District Common policy', () => {
      // lib-unknown-99 has no custom override; should resolve to Ghazipur common 10%
      const resolved = policyService.resolveCommission({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-unoverridden-99',
      });

      expect(resolved.policySource).toBe('DISTRICT_COMMON');
      expect(resolved.commissionType).toBe('PERCENTAGE');
      expect(resolved.commissionValue).toBe(10);
    });

    it('Tier 2: District Common applies to general district requests (without targetId)', () => {
      const resolved = policyService.resolveCommission({
        districtName: 'Ghazipur',
        serviceType: 'TUITION',
      });

      expect(resolved.policySource).toBe('DISTRICT_COMMON');
      expect(resolved.commissionType).toBe('PERCENTAGE');
      expect(resolved.commissionValue).toBe(15);
    });

    it('Tier 3: Unregistered district falls back to Super Admin System Default (10%)', () => {
      const resolved = policyService.resolveCommission({
        districtName: 'UnregisteredDistrictXYZ',
        serviceType: 'LIBRARY',
      });

      expect(resolved.policySource).toBe('SUPER_ADMIN_DEFAULT');
      expect(resolved.commissionValue).toBe(SYSTEM_DEFAULTS.LIBRARY.commissionValue);
    });

    it('Resetting a custom override restores District Common rate immediately', () => {
      // Verify override is active
      const before = policyService.resolveCommission({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-gzp-01',
      });
      expect(before.policySource).toBe('CUSTOM_OVERRIDE');
      expect(before.commissionValue).toBe(8);

      // Find the policy and remove override
      const policy = before.policy;
      expect(policy).toBeDefined();
      if (policy) {
        policyService.deletePolicy(policy.id, 'Chief District Admin', 'Standardizing library rate to district common');
      }

      // Verify it now resolves to District Common (10%)
      const after = policyService.resolveCommission({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-gzp-01',
      });
      expect(after.policySource).toBe('DISTRICT_COMMON');
      expect(after.commissionValue).toBe(10);
    });
  });

  // =========================================================================
  // 2. RATE MODIFICATION & CUSTOM OVERRIDE MANAGEMENT
  // =========================================================================
  describe('2. District Admin Policy Configuration & CRUD', () => {
    it('Should allow District Admin to update District Common Commission rate', () => {
      const updated = policyService.setCommonPolicy({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        commissionType: 'PERCENTAGE',
        commissionValue: 12,
        notes: 'Revised Ghazipur district library commission standard',
        adminName: 'Manoj Kumar Rai',
        reason: 'Q4 operational cost adjustment',
      });

      expect(updated.commissionValue).toBe(12);

      // Verify resolved rate matches updated value
      const resolved = policyService.resolveCommission({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
      });
      expect(resolved.commissionValue).toBe(12);
    });

    it('Should support Fixed (₹) Commission policies as well as Percentage (%)', () => {
      policyService.setCustomOverride({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-special-flat',
        targetName: 'Special Flat Fee Study Center',
        commissionType: 'FIXED',
        commissionValue: 120, // ₹120 flat fee per pass
        notes: 'Fixed pass fee agreement',
        adminName: 'Manoj Kumar Rai',
        reason: 'Special partnership terms',
      });

      const resolved = policyService.resolveCommission({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-special-flat',
      });

      expect(resolved.policySource).toBe('CUSTOM_OVERRIDE');
      expect(resolved.commissionType).toBe('FIXED');
      expect(resolved.commissionValue).toBe(120);
    });
  });

  // =========================================================================
  // 3. OFFER MANAGEMENT ENGINE & ELIGIBILITY
  // =========================================================================
  describe('3. Offer Resolution & Eligibility Engine', () => {
    it('Should return eligible district offers matching service type and minimum spend', () => {
      const offers = policyService.getEligibleOffers({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        amount: 1000,
      });

      expect(offers.length).toBeGreaterThan(0);
      expect(offers.every(o => o.serviceType === 'LIBRARY')).toBe(true);
      expect(offers.every(o => o.minimumAmount <= 1000)).toBe(true);
    });

    it('Should filter out offers where transaction amount is below minimum spend', () => {
      // Ghazipur Festive offer requires min ₹600
      const offersLow = policyService.getEligibleOffers({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        amount: 400, // Below ₹600 minimum spend
      });

      const hasFestive = offersLow.some(o => o.id === 'off-gzp-lib-common-01');
      expect(hasFestive).toBe(false);
    });

    it('Particular entity offers take priority over district common offers', () => {
      const offers = policyService.getEligibleOffers({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-gzp-01', // Saidpur Digital Study Hub
        amount: 1200,
      });

      expect(offers.length).toBeGreaterThanOrEqual(2);
      // First offer should be target-specific offer
      expect(offers[0].targetType).toBe('LIBRARY');
      expect(offers[0].targetId).toBe('lib-gzp-01');
    });

    it('Should allow adding a new promotional coupon code', () => {
      const newOffer = policyService.addOffer({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetType: 'DISTRICT',
        title: 'Diwali Mega Discount (₹250 OFF)',
        code: 'DIWALI250',
        description: 'Diwali special study hall pass concession',
        discountType: 'FIXED',
        discountValue: 250,
        minimumAmount: 900,
        minSpend: 900,
        offerCategory: 'FESTIVAL',
        startDate: '2024-01-01',
        usageLimit: 1000,
        perUserLimit: 1,
        allowStacking: false,
        status: 'ACTIVE',
        createdBy: 'Manoj Kumar Rai',
      });

      expect(newOffer.id).toBeDefined();
      expect(newOffer.code).toBe('DIWALI250');

      const queried = policyService.getOffers({ districtName: 'Ghazipur', serviceType: 'LIBRARY' });
      expect(queried.some(o => o.code === 'DIWALI250')).toBe(true);
    });
  });

  // =========================================================================
  // 4. FINANCIAL BREAKDOWN & STRICT ORDER OF CALCULATIONS
  // =========================================================================
  describe('4. Strict Order of Calculation Engine', () => {
    it('Order Rule: Original Gross -> Minus Offer Discount -> Equals Payable Amount', () => {
      // Gross: ₹1,000, Offer: 20% off with max discount ₹250
      const breakdown = policyService.calculateBreakdown({
        grossAmount: 1000,
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        selectedOfferId: 'off-gzp-lib-common-01', // 20% off Ghazipur Festive
      });

      expect(breakdown.grossAmount).toBe(1000);
      expect(breakdown.discountAmount).toBe(200); // 20% of 1000 = 200
      expect(breakdown.payableAmount).toBe(800); // 1000 - 200 = 800
    });

    it('Order Rule: Commission is calculated on discounted Payable Amount, NOT un-discounted gross', () => {
      // Gross: ₹1,000
      // Offer: ₹200 discount -> Payable: ₹800
      // Ghazipur Common Library Commission: 10%
      // Expected Commission: 10% of ₹800 = ₹80 (NOT 10% of ₹1,000 = ₹100!)
      // Expected Net to Library Owner: ₹800 - ₹80 = ₹720
      const breakdown = policyService.calculateBreakdown({
        grossAmount: 1000,
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        selectedOfferId: 'off-gzp-lib-common-01',
      });

      expect(breakdown.payableAmount).toBe(800);
      expect(breakdown.commissionRate).toBe(10);
      expect(breakdown.commissionAmount).toBe(80); // Correctly based on 800!
      expect(breakdown.netSettlementAmount).toBe(720); // 800 - 80 = 720
    });

    it('Order Rule with Custom Override and Fixed Discount', () => {
      // Gross: ₹1,500
      // Saidpur Library has 8% custom override
      // Saidpur Offer: ₹150 OFF (min spend ₹800)
      // Payable: 1500 - 150 = 1350
      // Commission: 8% of 1350 = 108
      // Net Settlement: 1350 - 108 = 1242
      const breakdown = policyService.calculateBreakdown({
        grossAmount: 1500,
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-gzp-01', // Saidpur Digital Study Hub (8% override)
        selectedOfferId: 'off-gzp-lib-saidpur-01', // ₹150 OFF
      });

      expect(breakdown.grossAmount).toBe(1500);
      expect(breakdown.discountAmount).toBe(150);
      expect(breakdown.payableAmount).toBe(1350);
      expect(breakdown.policySource).toBe('CUSTOM_OVERRIDE');
      expect(breakdown.commissionRate).toBe(8);
      expect(breakdown.commissionAmount).toBe(108); // 8% of 1350
      expect(breakdown.netSettlementAmount).toBe(1242);
    });

    it('Fixed Commission calculation on discounted payable amount', () => {
      // Create a fixed fee policy
      policyService.setCustomOverride({
        districtName: 'Ghazipur',
        serviceType: 'TUITION',
        targetId: 'usr-tutor-fixed',
        targetName: 'Tutor Fixed Fee',
        commissionType: 'FIXED',
        commissionValue: 150, // ₹150 flat commission
        adminName: 'Chief Admin',
      });

      const breakdown = policyService.calculateBreakdown({
        grossAmount: 2000,
        districtName: 'Ghazipur',
        serviceType: 'TUITION',
        targetId: 'usr-tutor-fixed',
        selectedOfferId: 'off-gzp-tui-common-01', // ₹300 OFF
      });

      expect(breakdown.grossAmount).toBe(2000);
      expect(breakdown.discountAmount).toBe(300);
      expect(breakdown.payableAmount).toBe(1700);
      expect(breakdown.commissionType).toBe('FIXED');
      expect(breakdown.commissionAmount).toBe(150);
      expect(breakdown.netSettlementAmount).toBe(1550); // 1700 - 150 = 1550
    });
  });

  // =========================================================================
  // 5. IMMUTABLE AUDIT TRAIL LOGGING
  // =========================================================================
  describe('5. Audit Trail & Regulatory Change Logging', () => {
    it('Should automatically record an audit entry when modifying district common rate', () => {
      const logsBefore = policyService.getAuditLogs('Ghazipur').length;

      policyService.setCommonPolicy({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        commissionType: 'PERCENTAGE',
        commissionValue: 11,
        adminName: 'Manoj Kumar Rai',
        reason: 'District annual rate review',
      });

      const logsAfter = policyService.getAuditLogs('Ghazipur');
      expect(logsAfter.length).toBe(logsBefore + 1);

      const latest = logsAfter[0];
      expect(latest.type).toBe('COMMISSION');
      expect(latest.action).toBe('UPDATE');
      expect(latest.performedBy).toBe('Manoj Kumar Rai');
      expect(latest.reason).toBe('District annual rate review');
      expect(latest.newValue).toContain('11%');
    });

    it('Should record an audit entry when adding a custom entity override', () => {
      const logsBefore = policyService.getAuditLogs('Ghazipur').length;

      policyService.setCustomOverride({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-new-audit-test',
        targetName: 'New Study Hall Audit Test',
        commissionType: 'PERCENTAGE',
        commissionValue: 7,
        adminName: 'Manoj Kumar Rai',
        reason: 'Incentive rate for remote village library',
      });

      const logsAfter = policyService.getAuditLogs('Ghazipur');
      expect(logsAfter.length).toBe(logsBefore + 1);

      const latest = logsAfter[0];
      expect(latest.action).toBe('CREATE');
      expect(latest.affectedEntity).toContain('New Study Hall Audit Test');
      expect(latest.newValue).toContain('7%');
    });

    it('Should record an audit entry when an override is deleted (RESET_COMMON)', () => {
      // Find Saidpur override
      const policy = policyService.getPolicies('Ghazipur', 'LIBRARY').find(p => p.targetId === 'lib-gzp-01');
      expect(policy).toBeDefined();

      if (policy) {
        policyService.deletePolicy(policy.id, 'Manoj Kumar Rai', 'Resetting Saidpur to common 10% standard');
        const logs = policyService.getAuditLogs('Ghazipur');
        const latest = logs[0];
        expect(latest.action).toBe('RESET_COMMON');
        expect(latest.reason).toBe('Resetting Saidpur to common 10% standard');
      }
    });

    it('Should record an audit entry when a new offer is created', () => {
      const logsBefore = policyService.getAuditLogs('Ghazipur').length;

      policyService.addOffer({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetType: 'DISTRICT',
        title: 'Monsoon Reading Pass (15% OFF)',
        code: 'MONSOON15',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minimumAmount: 500,
        offerCategory: 'LIMITED_TIME',
        startDate: '2024-07-01',
        usageLimit: 100,
        perUserLimit: 1,
        allowStacking: false,
        status: 'ACTIVE',
        createdBy: 'Manoj Kumar Rai',
      });

      const logsAfter = policyService.getAuditLogs('Ghazipur');
      expect(logsAfter.length).toBe(logsBefore + 1);

      const latest = logsAfter[0];
      expect(latest.type).toBe('OFFER');
      expect(latest.action).toBe('CREATE');
      expect(latest.newValue).toContain('Monsoon Reading Pass');
    });
  });

  // =========================================================================
  // 6. ANALYTICS & AGGREGATIONS
  // =========================================================================
  describe('6. Policy Analytics & Aggregates', () => {
    it('Should calculate comprehensive summary metrics for the district', () => {
      const summary = policyService.getAnalyticsSummary('Ghazipur');

      expect(summary.districtName).toBe('Ghazipur');
      expect(summary.totalCommissionEstThisMonth).toBeGreaterThan(0);
      expect(summary.libraryCommissionEst).toBeGreaterThan(0);
      expect(summary.tuitionCommissionEst).toBeGreaterThan(0);
      expect(summary.customOverridesCount).toBeGreaterThanOrEqual(1);
      expect(summary.commonPoliciesCount).toBe(2); // 1 Library + 1 Tuition common
      expect(summary.activeOffersCount).toBeGreaterThanOrEqual(2);
    });
  });
});
