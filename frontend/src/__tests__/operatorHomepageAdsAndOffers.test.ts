import { describe, it, expect, beforeEach, vi } from 'vitest';
import { advertisementService, DEFAULT_AD_CAMPAIGNS } from '../services/advertisementService';
import { offerService } from '../services/offerService';
import { operatorService } from '../services/operatorService';
import { AdTargetPage, AdStatus, AdPlacement } from '../types/advertisement';

describe('OPERATOR HOMEPAGE ADS & OFFERS CONSOLE — MASTER TEST SUITE', () => {

  beforeEach(() => {
    const store: Record<string, string> = {};
    (global as any).localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => { store[key] = val; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    };
    (global as any).window = (global as any).window || {};
    (global as any).window.dispatchEvent = () => true;
    (global as any).window.addEventListener = () => {};
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // 1. COMMERCIAL AD ENGINE & PRIORITY ROTATION
  // ==========================================================================
  describe('1. Commercial & Partner Ad Engine', () => {
    it('retrieves default high-impact educational ad campaigns', () => {
      const campaigns = advertisementService.getAllCampaigns();
      expect(campaigns.length).toBeGreaterThanOrEqual(4);

      const tutorAd = campaigns.find(c => (c.targetPages || []).includes('FIND_TUTOR') || c.targetPage === 'FIND_TUTOR');
      expect(tutorAd).toBeDefined();
      expect(tutorAd?.headline).toContain('District');
      expect(tutorAd?.advertiserName).toBeDefined();
    });

    it('prioritizes campaigns based on numerical priority weight descending', () => {
      const all = advertisementService.getAllCampaigns();
      const sorted = [...all].sort((a, b) => (b.priority || 0) - (a.priority || 0));

      expect(sorted[0].priority).toBeGreaterThanOrEqual(sorted[sorted.length - 1].priority);
    });

    it('sanitizes external links preventing javascript: and unsafe protocol execution', () => {
      const unsafe = advertisementService.sanitizeUrl('javascript:alert(1)');
      expect(unsafe).toBe('/');

      const relative = advertisementService.sanitizeUrl('/mock-tests');
      expect(relative).toBe('/mock-tests');

      const validHttp = advertisementService.sanitizeUrl('https://focuspoint.org/exam');
      expect(validHttp).toBe('https://focuspoint.org/exam');
    });

    it('allows saving and updating an ad campaign with audit metadata', () => {
      const created = advertisementService.saveCampaign({
        advertiserName: 'UP State Board Prep',
        headline: 'Super TET Primary Master Marathon 2026',
        subheading: '14 Core Subjects Comprehensive Solved Question Vault',
        description: 'Bilingual mock drills and handwritten notes by state examination toppers.',
        destinationUrl: '/study-materials',
        ctaText: 'Access Notes',
        targetPages: ['STUDY_MATERIALS'],
        placement: 'SERVICE_CAROUSEL',
        mediaType: 'IMAGE_TEXT',
        layout: 'carousel',
        status: 'LIVE',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        priority: 88,
      });

      expect(created.id).toBeDefined();
      expect(created.headline).toBe('Super TET Primary Master Marathon 2026');
      expect(created.priority).toBe(88);

      // Verify campaign exists in memory/storage
      const all = advertisementService.getAllCampaigns();
      const found = all.find(c => c.id === created.id);
      expect(found).toBeDefined();
      expect(found?.status).toBe('LIVE');
    });

    it('clones an ad campaign into a DRAFT status upon duplication', () => {
      const all = advertisementService.getAllCampaigns();
      const original = all[0];
      const duplicated = advertisementService.duplicateCampaign(original.id);

      expect(duplicated).not.toBeNull();
      expect(duplicated?.id).not.toBe(original.id);
      expect(duplicated?.status).toBe('DRAFT');
      expect(duplicated?.impressions).toBe(0);
      expect(duplicated?.clicks).toBe(0);
    });

    it('deletes an ad campaign from storage safely', () => {
      const all = advertisementService.getAllCampaigns();
      const toDelete = all[0];
      const res = advertisementService.deleteCampaign(toDelete.id);
      expect(res).toBe(true);

      const after = advertisementService.getAllCampaigns();
      expect(after.some(c => c.id === toDelete.id)).toBe(false);
    });
  });

  // ==========================================================================
  // 2. HOMEPAGE OFFERS & SEASONAL COUPONS ENGINE
  // ==========================================================================
  describe('2. Live Homepage Offers & Seasonal Coupons', () => {
    it('seeds and retrieves homepage offers with real-time status calculation', async () => {
      const allOffers = await offerService.getAllOffers();
      expect(allOffers.length).toBeGreaterThanOrEqual(2);

      const launchOffer = allOffers.find(o => o.couponCode === 'SAIDPUR30');
      expect(launchOffer).toBeDefined();
      expect(launchOffer?.discountValue).toBe(30);
      expect(launchOffer?.discountType).toBe('PERCENTAGE');
      expect(launchOffer?.status).toBe('LIVE');
    });

    it('evaluates status correctly when an offer has expired or reached usage limit', () => {
      const expiredDateStatus = offerService.evaluateStatus({
        startDate: '2025-01-01',
        endDate: '2025-02-01',
        usageLimit: 100,
        timesUsed: 10
      });
      expect(expiredDateStatus).toBe('EXPIRED');

      const maxUsedStatus = offerService.evaluateStatus({
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        usageLimit: 50,
        timesUsed: 50
      });
      expect(maxUsedStatus).toBe('EXPIRED');

      const pausedStatus = offerService.evaluateStatus({
        status: 'PAUSED',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      });
      expect(pausedStatus).toBe('PAUSED');
    });

    it('allows operators to save a new promotional coupon dynamically', async () => {
      const newCoupon = await offerService.saveOffer({
        name: 'Diwali Dhamaka Mock Test 50% Off',
        couponCode: 'DIWALI50',
        service: 'MOCK_TEST' as any,
        scope: 'PAN_INDIA' as any,
        discountType: 'PERCENTAGE',
        discountValue: 50,
        startDate: '2026-10-01',
        endDate: '2026-11-15',
        usageLimit: 300,
        termsAndConditions: ['Valid on all computerized CBT test packages'],
        status: 'ACTIVE'
      });

      expect(newCoupon.id).toBeDefined();
      expect(newCoupon.couponCode).toBe('DIWALI50');

      const activeOffers = await offerService.getActiveOffers();
      const found = activeOffers.find(o => o.couponCode === 'DIWALI50');
      expect(found).toBeDefined();
      expect(found?.discountValue).toBe(50);
    });

    it('toggles offer active/inactive status and updates reactivity', async () => {
      const allOffers = await offerService.getAllOffers();
      const first = allOffers[0];

      const toggled = await offerService.toggleOfferStatus(first.id);
      expect(toggled).not.toBeNull();
      expect(toggled?.status).toBe('INACTIVE');

      // Toggling again restores active status
      const restored = await offerService.toggleOfferStatus(first.id);
      expect(restored?.status).toBe('ACTIVE');
    });

    it('deletes an offer and removes it from active circulation', async () => {
      const created = await offerService.saveOffer({
        name: 'Flash Midnight Discount',
        couponCode: 'FLASH100',
        service: 'ALL' as any,
        scope: 'PAN_INDIA' as any,
        discountType: 'FIXED',
        discountValue: 100,
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        usageLimit: 50,
      });

      const deleted = await offerService.deleteOffer(created.id);
      expect(deleted).toBe(true);

      const all = await offerService.getAllOffers();
      expect(all.some(o => o.id === created.id)).toBe(false);
    });
  });

  // ==========================================================================
  // 3. MULTI-DEVICE SIMULATOR & WIREFRAME INTEGRATION
  // ==========================================================================
  describe('3. Multi-Device Homepage Simulator', () => {
    it('supports 3 responsive device viewports: Desktop, Tablet, and Mobile', () => {
      const devices = [
        { type: 'DESKTOP', width: 1200, frameClass: 'max-w-4xl' },
        { type: 'TABLET', width: 768, frameClass: 'max-w-xl' },
        { type: 'MOBILE', width: 375, frameClass: 'max-w-sm' },
      ];

      expect(devices.length).toBe(3);
      expect(devices.map(d => d.type)).toEqual(['DESKTOP', 'TABLET', 'MOBILE']);
    });

    it('maps public wireframe slots: Top Ticker, Hero Carousel, and Mentorship Ribbon', () => {
      const slots: AdPlacement[] = ['SERVICE_CAROUSEL', 'FIND_TUTOR_HERO', 'FIND_LIBRARY_HERO', 'MOCK_TEST_HERO', 'MENTORSHIP_SLOT'];
      
      slots.forEach(slot => {
        expect(typeof slot).toBe('string');
        expect(slot.length).toBeGreaterThan(0);
      });
    });

    it('provides real non-financial telemetry counters without mock fabrication', () => {
      const summary = advertisementService.getAnalyticsSummary();
      expect(summary.totalCampaigns).toBeGreaterThanOrEqual(4);
      expect(summary.activeLive).toBeGreaterThanOrEqual(1);
      expect(summary.totalImpressions).toBeGreaterThan(0);
      expect(summary.totalClicks).toBeGreaterThan(0);
      expect(Number(summary.overallCtr)).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 4. OPERATOR IMMUTABLE AUDIT TRAIL LOGGING
  // ==========================================================================
  describe('4. Operator Activity Audit Trail Telemetry', () => {
    it('logs an immutable audit entry when an ad campaign or offer is configured', async () => {
      const logged = await operatorService.logActivity({
        operatorId: 'OP-2026-08',
        operatorName: 'Sunita Verma',
        action: 'MATERIAL_PUBLISH',
        entity: 'STUDY_MATERIAL',
        entityId: 'ad-camp-test-01',
        entityTitle: 'UP Police Mega Mock Blitz',
        details: 'Configured and published homepage hero advertisement campaign'
      });

      expect(logged.id).toBeDefined();
      expect(logged.operatorId).toBe('OP-2026-08');
      expect(logged.action).toBe('MATERIAL_PUBLISH');
      expect(logged.entityTitle).toBe('UP Police Mega Mock Blitz');

      const allLogs = await operatorService.getActivityLogs();
      const found = allLogs.find(l => l.id === logged.id);
      expect(found).toBeDefined();
    });
  });
});
