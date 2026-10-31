import { describe, it, expect, beforeEach } from 'vitest';
import { policyService } from '../frontend/src/services/policyService.ts';

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

describe('Offer Display System on Library & Home Tuition Listings', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    // Reinitialize policyService to reload clean factory data
    // @ts-ignore
    policyService['init']();
  });

  // =========================================================================
  // 1. PARTICULAR LIBRARY OFFER DISPLAY (FocusPoint Digital Library 30% OFF)
  // =========================================================================
  describe('1. Library Offer Display — FocusPoint Digital Library', () => {
    it('accurately resolves 30% OFF for FocusPoint Digital Library with 3-tier priority', () => {
      const pricing = policyService.getBestActiveOffer({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-focus-saidpur',
        amount: 1000,
      });

      expect(pricing.hasOffer).toBe(true);
      expect(pricing.policySource).toBe('CUSTOM_OVERRIDE');
      expect(pricing.offer?.code).toBe('FOCUS30');
      expect(pricing.offer?.discountValue).toBe(30);
      expect(pricing.badgeText).toBe('🔥 30% OFF');
      expect(pricing.originalPrice).toBe(1000);
      expect(pricing.discountAmount).toBe(300);
      expect(pricing.discountedPrice).toBe(700);
      expect(pricing.savingsText).toBe('Save ₹300');
    });

    it('accurately resolves Saidpur Digital Study Hub offer (lib-gzp-01)', () => {
      const pricing = policyService.getBestActiveOffer({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-gzp-01',
        amount: 1000,
      });

      expect(pricing.hasOffer).toBe(true);
      expect(pricing.policySource).toBe('CUSTOM_OVERRIDE');
      expect(pricing.badgeText).toBe('🏷️ ₹150 OFF');
      expect(pricing.discountedPrice).toBe(850);
    });

    it('calculates full financial breakdown: original - discount = payable, with commission & provider payout', () => {
      const breakdown = policyService.calculateBreakdown({
        grossAmount: 1000,
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-focus-saidpur',
      });

      expect(breakdown.grossAmount).toBe(1000);
      expect(breakdown.discountAmount).toBe(300);
      expect(breakdown.payableAmount).toBe(700);
      expect(breakdown.appliedOffer?.code).toBe('FOCUS30');
      // Commission is calculated on payable amount (700 * 10% Ghazipur Common = 70)
      expect(breakdown.commissionAmount).toBe(70);
      expect(breakdown.netSettlementAmount).toBe(630);
      expect(breakdown.payableAmount - breakdown.commissionAmount).toBe(breakdown.netSettlementAmount);
    });
  });

  // =========================================================================
  // 2. PARTICULAR HOME TUITION OFFER DISPLAY (Rahul Kumar 30% OFF)
  // =========================================================================
  describe('2. Home Tuition Offer Display — Rahul Kumar (Educator)', () => {
    it('accurately resolves 30% OFF for Rahul Kumar with 3-tier priority', () => {
      const pricing = policyService.getBestActiveOffer({
        districtName: 'Ghazipur',
        serviceType: 'TUITION',
        targetId: 'usr-teacher-rahul',
        amount: 3000,
      });

      expect(pricing.hasOffer).toBe(true);
      expect(pricing.policySource).toBe('CUSTOM_OVERRIDE');
      expect(pricing.offer?.code).toBe('RAHUL30');
      expect(pricing.offer?.discountValue).toBe(30);
      expect(pricing.badgeText).toBe('🔥 30% OFF');
      expect(pricing.originalPrice).toBe(3000);
      expect(pricing.discountAmount).toBe(900);
      expect(pricing.discountedPrice).toBe(2100);
      expect(pricing.savingsText).toBe('Save ₹900');
    });

    it('calculates full tuition financial breakdown: original - discount = payable', () => {
      const breakdown = policyService.calculateBreakdown({
        grossAmount: 3000,
        districtName: 'Ghazipur',
        serviceType: 'TUITION',
        targetId: 'usr-teacher-rahul',
      });

      expect(breakdown.grossAmount).toBe(3000);
      expect(breakdown.discountAmount).toBe(900);
      expect(breakdown.payableAmount).toBe(2100);
      expect(breakdown.appliedOffer?.code).toBe('RAHUL30');
      // Commission on payable amount: 2100 * 15% (District common) = 315
      expect(breakdown.commissionAmount).toBe(315);
      expect(breakdown.netSettlementAmount).toBe(1785);
      expect(breakdown.payableAmount - breakdown.commissionAmount).toBe(breakdown.netSettlementAmount);
    });
  });

  // =========================================================================
  // 3. PRIORITY PRECEDENCE: PARTICULAR OVERRIDES DISTRICT COMMON
  // =========================================================================
  describe('3. Priority Order & Fallback Logic', () => {
    it('Particular offer takes precedence over District Common offer (30% > 10%)', () => {
      // FocusPoint has 30% override; Ghazipur district has 10% common offer
      const focusPricing = policyService.getBestActiveOffer({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-focus-saidpur',
        amount: 1000,
      });

      expect(focusPricing.policySource).toBe('CUSTOM_OVERRIDE');
      expect(focusPricing.badgeText).toBe('🔥 30% OFF');
      expect(focusPricing.discountedPrice).toBe(700);

      // Other library without custom override receives District Common (20% OFF Festive)
      const otherPricing = policyService.getBestActiveOffer({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-gzp-other-99',
        amount: 1000,
      });

      expect(otherPricing.policySource).toBe('DISTRICT_COMMON');
      expect(otherPricing.badgeText).toBe('🔥 20% OFF');
      expect(otherPricing.discountedPrice).toBe(800);
    });

    it('Tutor without custom offer falls back to District Common Tuition Offer (10% OFF)', () => {
      const otherTeacherPricing = policyService.getBestActiveOffer({
        districtName: 'Ghazipur',
        serviceType: 'TUITION',
        targetId: 'usr-teacher-01',
        amount: 3500,
      });

      expect(otherTeacherPricing.policySource).toBe('DISTRICT_COMMON');
      expect(otherTeacherPricing.badgeText).toBe('🔥 10% OFF');
      expect(otherTeacherPricing.originalPrice).toBe(3500);
      expect(otherTeacherPricing.discountAmount).toBe(350);
      expect(otherTeacherPricing.discountedPrice).toBe(3150);
    });
  });

  // =========================================================================
  // 4. INACTIVE, PAUSED, AND EXPIRED OFFERS
  // =========================================================================
  describe('4. Inactive and Expired Offers', () => {
    it('does not display offer if particular offer is PAUSED / INACTIVE', () => {
      // Find FocusPoint offer and deactivate it
      const offer = policyService.getOffers().find(o => o.code === 'FOCUS30');
      expect(offer).toBeDefined();

      if (offer) {
        policyService.saveOffer({
          ...offer,
          status: 'INACTIVE',
        });
      }

      // Now FocusPoint should fall back to District Common (20% OFF Festive)
      const pricing = policyService.getBestActiveOffer({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-focus-saidpur',
        amount: 1000,
      });

      expect(pricing.policySource).toBe('DISTRICT_COMMON');
      expect(pricing.badgeText).toBe('🔥 20% OFF');
      expect(pricing.discountedPrice).toBe(800);
    });

    it('falls back to no offer if both custom and district common offers are inactive', () => {
      // Deactivate both FocusPoint and Ghazipur district common offers
      const allOffers = policyService.getOffers();
      allOffers.forEach(o => {
        policyService.saveOffer({ ...o, status: 'INACTIVE' });
      });

      const pricing = policyService.getBestActiveOffer({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-focus-saidpur',
        amount: 1000,
      });

      expect(pricing.hasOffer).toBe(false);
      expect(pricing.discountAmount).toBe(0);
      expect(pricing.discountedPrice).toBe(1000);
      expect(pricing.badgeText).toBe('');
    });
  });

  // =========================================================================
  // 5. REAL-TIME REACTIVE SUBSCRIPTION
  // =========================================================================
  describe('5. Real-Time Reactive Updates', () => {
    it('notifies subscribers immediately when District Admin updates an offer', () => {
      let notified = false;
      const unsubscribe = policyService.subscribe(() => {
        notified = true;
      });

      const offer = policyService.getOffers().find(o => o.code === 'FOCUS30');
      expect(offer).toBeDefined();

      if (offer) {
        // Change 30% to 20%
        policyService.saveOffer({
          ...offer,
          discountValue: 20,
        });
      }

      expect(notified).toBe(true);

      // Verify that getBestActiveOffer immediately reflects the change
      const updatedPricing = policyService.getBestActiveOffer({
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: 'lib-focus-saidpur',
        amount: 1000,
      });

      expect(updatedPricing.badgeText).toBe('🔥 20% OFF');
      expect(updatedPricing.discountAmount).toBe(200);
      expect(updatedPricing.discountedPrice).toBe(800);

      unsubscribe();
    });
  });
});
