import { describe, it, expect, beforeEach } from 'vitest';
import { superAdminService } from '../services/superAdminService';
import { CustomCommissionOverride, SuperAdminOfferDefinition } from '../types';
import { safeStorage } from '../utils/storageUtils';

describe('FOCUSPOINT — Super Admin Commission Overrides & Offers Master Test Suite', () => {
  beforeEach(async () => {
    // Seed initial test data
    safeStorage.removeItem('fp_super_admin_commission_overrides');
    safeStorage.removeItem('fp_super_admin_offers');
  });

  describe('1. Commission Overrides Repository & Multi-Facet Filtering', () => {
    it('retrieves default commission overrides with service and scope attributes', async () => {
      const overrides = await superAdminService.getCommissionOverrides();
      expect(overrides.length).toBeGreaterThan(0);

      const first = overrides[0];
      expect(first.id).toBeDefined();
      expect(first.service).toBeDefined();
      expect(first.scope).toBeDefined();
      expect(first.defaultCommissionRate).toBeDefined();
      expect(first.customCommissionRate).toBeDefined();
      expect(first.status).toBeDefined();

      // Filter by service
      const tuitionOnly = overrides.filter(o => o.service === 'HOME_TUITION');
      tuitionOnly.forEach(o => {
        expect(o.service).toBe('HOME_TUITION');
      });

      const libraryOnly = overrides.filter(o => o.service === 'SELF_STUDY_LIBRARY');
      libraryOnly.forEach(o => {
        expect(o.service).toBe('SELF_STUDY_LIBRARY');
      });
    });

    it('creates, persists, and toggles status of a custom commission override', async () => {
      const created = await superAdminService.saveCommissionOverride({
        service: 'HOME_TUITION',
        scope: 'LOCALITY',
        stateName: 'Uttar Pradesh',
        districtName: 'Ghazipur',
        localityName: 'Zamania',
        defaultCommissionRate: 10,
        customCommissionRate: 7,
        differenceRate: -3,
        effectiveDate: '2026-10-01',
        reason: 'Zamania rural expansion incentive',
        status: 'ACTIVE'
      });

      expect(created.id).toBeDefined();
      expect(created.customCommissionRate).toBe(7);
      expect(created.status).toBe('ACTIVE');

      // Toggle status
      const toggled = await superAdminService.toggleCommissionOverrideStatus(created.id);
      expect(toggled?.status).toBe('PAUSED');

      const toggledAgain = await superAdminService.toggleCommissionOverrideStatus(created.id);
      expect(toggledAgain?.status).toBe('ACTIVE');
    });
  });

  describe('2. Deterministic Hierarchical Inheritance Precedence', () => {
    it('resolves individual educator override first (Level 5 — Highest Priority)', async () => {
      // Create Individual override
      await superAdminService.saveCommissionOverride({
        service: 'HOME_TUITION',
        scope: 'INDIVIDUAL',
        stateName: 'Uttar Pradesh',
        districtName: 'Ghazipur',
        targetEntityId: 'tch-star-99',
        targetEntityName: 'Professor Anil Mishra',
        defaultCommissionRate: 10,
        customCommissionRate: 5,
        differenceRate: -5,
        effectiveDate: '2026-10-01',
        reason: 'Star Educator VIP tier',
        status: 'ACTIVE'
      });

      const resolution = await superAdminService.resolveCommissionHierarchy({
        service: 'HOME_TUITION',
        districtName: 'Ghazipur',
        localityName: 'Saidpur',
        entityId: 'tch-star-99',
        entityName: 'Professor Anil Mishra'
      });

      expect(resolution.effectiveRate).toBe(5);
      expect(resolution.hierarchyLevel).toBe('INDIVIDUAL');
      expect(resolution.matchedRule?.targetEntityName).toBe('Professor Anil Mishra');
    });

    it('resolves locality block override when no individual override matches (Level 4)', async () => {
      await superAdminService.saveCommissionOverride({
        service: 'SELF_STUDY_LIBRARY',
        scope: 'LOCALITY',
        stateName: 'Uttar Pradesh',
        districtName: 'Ghazipur',
        localityName: 'Mohammadabad',
        defaultCommissionRate: 8,
        customCommissionRate: 6,
        differenceRate: -2,
        effectiveDate: '2026-10-01',
        reason: 'Mohammadabad block cluster incentive',
        status: 'ACTIVE'
      });

      const resolution = await superAdminService.resolveCommissionHierarchy({
        service: 'SELF_STUDY_LIBRARY',
        districtName: 'Ghazipur',
        localityName: 'Mohammadabad'
      });

      expect(resolution.effectiveRate).toBe(6);
      expect(resolution.hierarchyLevel).toBe('LOCALITY');
    });

    it('resolves district territory override when no locality override matches (Level 3)', async () => {
      await superAdminService.saveCommissionOverride({
        service: 'HOME_TUITION',
        scope: 'DISTRICT',
        stateName: 'Uttar Pradesh',
        districtName: 'Varanasi',
        defaultCommissionRate: 10,
        customCommissionRate: 8,
        differenceRate: -2,
        effectiveDate: '2026-10-01',
        reason: 'Varanasi territory tier',
        status: 'ACTIVE'
      });

      const resolution = await superAdminService.resolveCommissionHierarchy({
        service: 'HOME_TUITION',
        stateName: 'Uttar Pradesh',
        districtName: 'Varanasi',
        localityName: 'Assi Ghat' // Not matched in locality overrides
      });

      expect(resolution.effectiveRate).toBe(8);
      expect(resolution.hierarchyLevel).toBe('DISTRICT');
    });

    it('falls back to standard Pan-India base rate when no overrides match', async () => {
      const tuitionDefault = await superAdminService.resolveCommissionHierarchy({
        service: 'HOME_TUITION',
        districtName: 'RandomUnknownDistrict'
      });
      expect(tuitionDefault.effectiveRate).toBe(10);
      expect(tuitionDefault.hierarchyLevel).toBe('PAN_INDIA');

      const libraryDefault = await superAdminService.resolveCommissionHierarchy({
        service: 'SELF_STUDY_LIBRARY',
        districtName: 'RandomUnknownDistrict'
      });
      expect(libraryDefault.effectiveRate).toBe(8);
      expect(libraryDefault.hierarchyLevel).toBe('PAN_INDIA');
    });
  });

  describe('3. Promotional Offers & Coupon Campaigns Engine', () => {
    it('creates, activates, and retrieves promotional coupon offers', async () => {
      const newOffer = await superAdminService.createSuperAdminOffer({
        name: 'New Academic Session 25% OFF',
        couponCode: 'ACADEMIC25',
        service: 'HOME_TUITION',
        scope: 'PAN_INDIA',
        discountType: 'PERCENTAGE',
        discountValue: 25,
        startDate: '2026-10-01',
        endDate: '2026-12-31',
        usageLimit: 300,
        termsAndConditions: ['Valid on all tuition packages', 'One redemption per student'],
        status: 'ACTIVE'
      });

      expect(newOffer.id).toBeDefined();
      expect(newOffer.couponCode).toBe('ACADEMIC25');
      expect(newOffer.status).toBe('ACTIVE');

      const allOffers = await superAdminService.getSuperAdminOffers();
      expect(allOffers.some(o => o.couponCode === 'ACADEMIC25')).toBe(true);
    });

    it('toggles offer active/inactive state and audits action', async () => {
      const allOffers = await superAdminService.getSuperAdminOffers();
      const sample = allOffers[0];

      const toggled = await superAdminService.toggleOfferStatus(sample.id);
      expect(toggled?.status).toBe(sample.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');

      const toggledBack = await superAdminService.toggleOfferStatus(sample.id);
      expect(toggledBack?.status).toBe(sample.status);
    });
  });

  describe('4. Transaction Yield & Revenue Breakdown Simulation', () => {
    it('simulates transaction with percentage coupon and calculates net partner payout', async () => {
      // Offer SAIDPUR30 exists in defaults (30% discount on SELF_STUDY_LIBRARY)
      const sim = await superAdminService.simulateCommissionRevenue({
        service: 'SELF_STUDY_LIBRARY',
        amount: 2000,
        stateName: 'Uttar Pradesh',
        districtName: 'Ghazipur',
        localityName: 'Saidpur',
        couponCode: 'SAIDPUR30'
      });

      expect(sim.grossAmount).toBe(2000);
      expect(sim.discountAmount).toBe(600); // 30% of 2000 = 600
      expect(sim.netBaseAmount).toBe(1400); // 2000 - 600 = 1400

      // Saidpur default locality override rate is 5%
      expect(sim.commissionRate).toBe(5);
      expect(sim.platformCommissionAmount).toBe(70); // 5% of 1400 = 70
      expect(sim.partnerPayoutAmount).toBe(1330); // 1400 - 70 = 1330
      expect(sim.couponApplied?.couponCode).toBe('SAIDPUR30');
    });

    it('simulates transaction with flat amount coupon', async () => {
      // Offer FOCUSFEST is flat ₹200 for HOME_TUITION
      const sim = await superAdminService.simulateCommissionRevenue({
        service: 'HOME_TUITION',
        amount: 3000,
        districtName: 'Ghazipur',
        couponCode: 'FOCUSFEST'
      });

      expect(sim.grossAmount).toBe(3000);
      expect(sim.discountAmount).toBe(200);
      expect(sim.netBaseAmount).toBe(2800);
      expect(sim.platformCommissionAmount).toBe(Math.round((2800 * sim.commissionRate) / 100));
      expect(sim.partnerPayoutAmount).toBe(2800 - sim.platformCommissionAmount);
    });

    it('rejects coupon code if service does not match and falls back to gross amount', async () => {
      // SAIDPUR30 is for SELF_STUDY_LIBRARY, but we try applying to HOME_TUITION
      const sim = await superAdminService.simulateCommissionRevenue({
        service: 'HOME_TUITION',
        amount: 2500,
        couponCode: 'SAIDPUR30'
      });

      expect(sim.discountAmount).toBe(0);
      expect(sim.couponApplied).toBeNull();
      expect(sim.couponMessage).toContain('valid only for SELF_STUDY_LIBRARY');
      expect(sim.netBaseAmount).toBe(2500);
    });
  });

  describe('5. Bulk Operations & Audit Export Telemetry', () => {
    it('performs bulk status update and bulk deletion across commission rules', async () => {
      const c1 = await superAdminService.saveCommissionOverride({
        service: 'HOME_TUITION',
        scope: 'DISTRICT',
        districtName: 'BulkDistrict1',
        defaultCommissionRate: 10,
        customCommissionRate: 9,
        differenceRate: -1,
        effectiveDate: '2026-10-01',
        reason: 'Bulk test 1',
        status: 'ACTIVE'
      });

      const c2 = await superAdminService.saveCommissionOverride({
        service: 'HOME_TUITION',
        scope: 'DISTRICT',
        districtName: 'BulkDistrict2',
        defaultCommissionRate: 10,
        customCommissionRate: 8,
        differenceRate: -2,
        effectiveDate: '2026-10-01',
        reason: 'Bulk test 2',
        status: 'ACTIVE'
      });

      const updated = await superAdminService.bulkUpdateCommissionOverrides([c1.id, c2.id], {
        status: 'PAUSED'
      });
      expect(updated).toBe(2);

      const all = await superAdminService.getCommissionOverrides();
      expect(all.find(x => x.id === c1.id)?.status).toBe('PAUSED');
      expect(all.find(x => x.id === c2.id)?.status).toBe('PAUSED');

      // Bulk Delete
      const deletedCount = await superAdminService.bulkDeleteCommissionOverrides([c1.id, c2.id]);
      expect(deletedCount).toBe(2);

      const afterDelete = await superAdminService.getCommissionOverrides();
      expect(afterDelete.some(x => x.id === c1.id || x.id === c2.id)).toBe(false);
    });

    it('exports commission overrides and promotional offers in valid CSV and JSON', async () => {
      const csvCommissions = await superAdminService.exportCommissionOverrides('csv');
      expect(csvCommissions).toContain('ID,Service,Scope,Geography/Entity,DefaultRate,CustomRate');
      expect(csvCommissions.split('\n').length).toBeGreaterThan(1);

      const jsonCommissions = await superAdminService.exportCommissionOverrides('json');
      const parsedComm = JSON.parse(jsonCommissions);
      expect(Array.isArray(parsedComm)).toBe(true);

      const csvOffers = await superAdminService.exportOffers('csv');
      expect(csvOffers).toContain('ID,CampaignName,CouponCode,Service,Scope');
      expect(csvOffers.split('\n').length).toBeGreaterThan(1);

      const jsonOffers = await superAdminService.exportOffers('json');
      const parsedOffers = JSON.parse(jsonOffers);
      expect(Array.isArray(parsedOffers)).toBe(true);
    });
  });
});
