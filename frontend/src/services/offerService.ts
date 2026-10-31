/**
 * FOCUSPOINT — Offer Service
 * 
 * Manages live promotional campaigns and coupons for the Homepage and public portal.
 * Subscribes to Super Admin Offer Management and evaluates real-time validity,
 * expiration, location targeting, and multi-offer rotations.
 */

import { HomepageOffer, OfferStatus } from '../types/homepage';
import { SuperAdminOfferDefinition } from '../types';

class OfferService {
  private eventTarget = new EventTarget();

  constructor() {
    // Listen to global window storage/custom events for cross-component sync
    if (typeof window !== 'undefined') {
      window.addEventListener('focuspoint_offers_updated', () => {
        this.eventTarget.dispatchEvent(new Event('change'));
      });
      window.addEventListener('storage', (e) => {
        if (e.key === 'fp_super_admin_offers') {
          this.eventTarget.dispatchEvent(new Event('change'));
        }
      });
    }
  }

  public subscribe(callback: () => void): () => void {
    const handler = () => callback();
    this.eventTarget.addEventListener('change', handler);
    return () => this.eventTarget.removeEventListener('change', handler);
  }

  /**
   * Computes the real-time calculated status of an offer based on dates and limits.
   */
  public evaluateStatus(offer: {
    status?: string;
    startDate: string;
    endDate: string;
    usageLimit?: number;
    timesUsed?: number;
  }): OfferStatus {
    if (offer.status === 'PAUSED') return 'PAUSED';
    if (offer.status === 'DISABLED') return 'DISABLED';

    const todayStr = new Date().toISOString().substring(0, 10);

    if (offer.startDate && todayStr < offer.startDate) {
      return 'SCHEDULED';
    }

    if (offer.endDate && todayStr > offer.endDate) {
      return 'EXPIRED';
    }

    if (offer.usageLimit && offer.usageLimit > 0 && (offer.timesUsed || 0) >= offer.usageLimit) {
      return 'EXPIRED';
    }

    // Check if expiring within 3 days
    if (offer.endDate) {
      const today = new Date(todayStr).getTime();
      const end = new Date(offer.endDate).getTime();
      const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3 && diffDays >= 0) {
        return 'EXPIRING_SOON';
      }
    }

    return 'LIVE';
  }

  /**
   * Fetches all offers from Super Admin management and maps them to HomepageOffer format.
   */
  public async getAllOffers(): Promise<HomepageOffer[]> {
    if (typeof window === 'undefined') return [];

    let rawList: SuperAdminOfferDefinition[] = [];
    const cached = localStorage.getItem('fp_super_admin_offers');
    if (cached) {
      try {
        rawList = JSON.parse(cached);
      } catch {
        rawList = [];
      }
    }

    // If cache is empty, seed defaults
    if (!rawList || rawList.length === 0) {
      rawList = [
        {
          id: 'OFFER-001',
          name: 'Saidpur Grand Launch 30% OFF',
          couponCode: 'SAIDPUR30',
          service: 'SELF_STUDY_LIBRARY',
          scope: 'LOCALITY',
          stateName: 'Uttar Pradesh',
          districtName: 'Ghazipur',
          localityName: 'Saidpur',
          discountType: 'PERCENTAGE',
          discountValue: 30,
          startDate: '2026-09-01',
          endDate: '2026-12-31',
          usageLimit: 200,
          timesUsed: 42,
          termsAndConditions: ['Valid on first month library subscription', 'Saidpur district branch only'],
          status: 'ACTIVE'
        },
        {
          id: 'OFFER-002',
          name: 'Pan-India Student Fest Flat ₹200',
          couponCode: 'FOCUSFEST',
          service: 'HOME_TUITION',
          scope: 'PAN_INDIA',
          discountType: 'FIXED',
          discountValue: 200,
          startDate: '2026-09-10',
          endDate: '2026-10-15',
          usageLimit: 1000,
          timesUsed: 138,
          termsAndConditions: ['Minimum tuition booking of ₹1500', '1 redemption per student'],
          status: 'ACTIVE'
        }
      ];
      localStorage.setItem('fp_super_admin_offers', JSON.stringify(rawList));
    }

    return rawList.map(item => {
      const calculatedStatus = this.evaluateStatus(item);

      // Determine default CTA
      let ctaText = 'Explore Offer';
      let ctaLink = '/find-library';
      if (item.service === 'HOME_TUITION') {
        ctaText = 'Book Home Tuition';
        ctaLink = '/find-tutor';
      } else if (item.service === 'SELF_STUDY_LIBRARY') {
        ctaText = 'Find a Library';
        ctaLink = '/find-library';
      }

      return {
        id: item.id,
        title: item.name,
        subtitle: item.scope === 'PAN_INDIA' 
          ? 'Pan-India Special Campaign' 
          : `${item.localityName || item.districtName || item.stateName || 'Regional'} Exclusive Offer`,
        discountType: item.discountType as 'PERCENTAGE' | 'FIXED',
        discountValue: item.discountValue,
        couponCode: item.couponCode,
        service: item.service as any,
        scope: item.scope as any,
        stateName: item.stateName,
        districtName: item.districtName,
        localityName: item.localityName,
        targetEntityId: item.targetEntityId,
        targetEntityName: item.targetEntityName,
        startDate: item.startDate,
        endDate: item.endDate,
        ctaText,
        ctaLink,
        termsAndConditions: item.termsAndConditions,
        status: calculatedStatus,
        isFeatured: item.scope === 'PAN_INDIA' || item.discountValue >= 20
      };
    });
  }

  /**
   * Returns only LIVE and EXPIRING_SOON offers, optionally filtered by user location or service.
   * Expired, scheduled, or paused offers are strictly excluded so the UI never displays dead deals.
   */
  public async getActiveOffers(params?: {
    districtName?: string;
    stateName?: string;
    localityName?: string;
    service?: string;
  }): Promise<HomepageOffer[]> {
    const all = await this.getAllOffers();

    return all.filter(offer => {
      // Must be currently active
      if (offer.status !== 'LIVE' && offer.status !== 'EXPIRING_SOON') {
        return false;
      }

      // Filter by service if specified
      if (params?.service && params.service !== 'ALL' && offer.service !== 'ALL') {
        if (offer.service !== params.service) return false;
      }

      // Location targeting check
      if (params?.districtName && offer.scope !== 'PAN_INDIA') {
        if (offer.districtName && offer.districtName.toLowerCase() !== params.districtName.toLowerCase()) {
          return false;
        }
      }

      if (params?.localityName && offer.scope === 'LOCALITY') {
        if (offer.localityName && offer.localityName.toLowerCase() !== params.localityName.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Directly saves or updates an offer definition with automatic reactive propagation.
   */
  public async saveOffer(offerData: Partial<SuperAdminOfferDefinition> & { name: string; couponCode: string }): Promise<SuperAdminOfferDefinition> {
    if (typeof window === 'undefined') {
      throw new Error('Window is undefined');
    }
    const raw = localStorage.getItem('fp_super_admin_offers');
    let list: SuperAdminOfferDefinition[] = raw ? JSON.parse(raw) : [];

    let target: SuperAdminOfferDefinition;
    if (offerData.id) {
      const idx = list.findIndex(o => o.id === offerData.id);
      if (idx !== -1) {
        target = {
          ...list[idx],
          ...offerData,
          couponCode: (offerData.couponCode || list[idx].couponCode).toUpperCase().trim()
        };
        list[idx] = target;
      } else {
        target = {
          id: offerData.id,
          name: offerData.name,
          couponCode: offerData.couponCode.toUpperCase().trim(),
          service: offerData.service || 'ALL' as any,
          scope: offerData.scope || 'PAN_INDIA' as any,
          stateName: offerData.stateName,
          districtName: offerData.districtName,
          localityName: offerData.localityName,
          discountType: offerData.discountType || 'PERCENTAGE',
          discountValue: offerData.discountValue || 10,
          startDate: offerData.startDate || new Date().toISOString().substring(0, 10),
          endDate: offerData.endDate || '2026-12-31',
          usageLimit: offerData.usageLimit || 500,
          timesUsed: offerData.timesUsed || 0,
          termsAndConditions: offerData.termsAndConditions || ['Valid across designated FocusPoint portal services'],
          status: offerData.status || 'ACTIVE'
        };
        list.unshift(target);
      }
    } else {
      target = {
        id: `OFFER-${Date.now()}`,
        name: offerData.name,
        couponCode: offerData.couponCode.toUpperCase().trim(),
        service: offerData.service || 'ALL' as any,
        scope: offerData.scope || 'PAN_INDIA' as any,
        stateName: offerData.stateName,
        districtName: offerData.districtName,
        localityName: offerData.localityName,
        discountType: offerData.discountType || 'PERCENTAGE',
        discountValue: offerData.discountValue || 10,
        startDate: offerData.startDate || new Date().toISOString().substring(0, 10),
        endDate: offerData.endDate || '2026-12-31',
        usageLimit: offerData.usageLimit || 500,
        timesUsed: 0,
        termsAndConditions: offerData.termsAndConditions || ['Valid across designated FocusPoint portal services'],
        status: offerData.status || 'ACTIVE'
      };
      list.unshift(target);
    }

    localStorage.setItem('fp_super_admin_offers', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('focuspoint_offers_updated'));
    this.eventTarget.dispatchEvent(new Event('change'));
    return target;
  }

  /**
   * Toggles the active/paused status of an offer.
   */
  public async toggleOfferStatus(id: string): Promise<SuperAdminOfferDefinition | null> {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('fp_super_admin_offers');
    let list: SuperAdminOfferDefinition[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return null;

    list[idx].status = list[idx].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    localStorage.setItem('fp_super_admin_offers', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('focuspoint_offers_updated'));
    this.eventTarget.dispatchEvent(new Event('change'));
    return list[idx];
  }

  /**
   * Deletes an offer from the system.
   */
  public async deleteOffer(id: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const raw = localStorage.getItem('fp_super_admin_offers');
    let list: SuperAdminOfferDefinition[] = raw ? JSON.parse(raw) : [];
    const initialLen = list.length;
    list = list.filter(o => o.id !== id);
    if (list.length === initialLen) return false;

    localStorage.setItem('fp_super_admin_offers', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('focuspoint_offers_updated'));
    this.eventTarget.dispatchEvent(new Event('change'));
    return true;
  }
}

export const offerService = new OfferService();
