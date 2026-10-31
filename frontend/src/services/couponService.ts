/**
 * FOCUSPOINT — Coupon Service & Verification Authority
 * 
 * Handles coupon lifecycles (DRAFT, SCHEDULED, LIVE, PAUSED, EXPIRED, DISABLED, ARCHIVED),
 * multi-criteria checkout validations (product type, min spend, max discount, usage limits, territory),
 * discount calculations, clipboard copying, and session pre-fill coordination.
 */

import { CouponCopyResult, CouponStatus, CouponValidationParams, CouponValidationResult, HomepageOffer } from '../types/homepage';
import { offerService } from './offerService';
import { policyService } from './policyService';
import { safeStorage } from '../utils/storageUtils';

const LAST_COPIED_COUPON_KEY = 'fp_last_copied_coupon';

export interface CopiedCouponInfo {
  code: string;
  copiedAt: number;
}

// Built-in standard coupons directory for global promotions and edge-case testing
const STATIC_COUPON_DEFINITIONS: Array<{
  code: string;
  name: string;
  status: CouponStatus;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscount?: number;
  minSpend?: number;
  service: string; // 'ALL' | 'HOME_TUITION' | 'SELF_STUDY_LIBRARY' | 'STUDY_MATERIAL' | 'MOCK_TEST' | 'SUBSCRIPTION' | 'DIGITAL_STORE'
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  timesUsed?: number;
  terms: string[];
}> = [
  {
    code: 'FOCUS100',
    name: 'Welcome Scholar Flat ₹100',
    status: 'LIVE',
    discountType: 'FIXED',
    discountValue: 100,
    minSpend: 299,
    service: 'ALL',
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    terms: ['Valid across all FocusPoint services', 'Minimum booking/purchase of ₹299']
  },
  {
    code: 'FOCUS50',
    name: 'Digital Learning 50% Concession',
    status: 'LIVE',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    maxDiscount: 1500,
    minSpend: 199,
    service: 'DIGITAL_STORE',
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    terms: ['Valid on Digital Learning Store subscriptions & mock test series', 'Up to ₹1,500 maximum discount']
  },
  {
    code: 'MOCK100',
    name: 'Mock Test Series Flat ₹100 OFF',
    status: 'LIVE',
    discountType: 'FIXED',
    discountValue: 100,
    minSpend: 299,
    service: 'MOCK_TEST',
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    terms: ['Valid on all Government Exam & Academic Mock Test packages']
  },
  {
    code: 'SCHOLAR20',
    name: 'Academic Merit 20% Discount',
    status: 'LIVE',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    maxDiscount: 800,
    minSpend: 500,
    service: 'ALL',
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    terms: ['Applies across study materials, test series, and subscriptions']
  },
  {
    code: 'EXPIRED20',
    name: 'Past Monsoon Promotion',
    status: 'EXPIRED',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    service: 'ALL',
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    terms: ['Expired campaign']
  },
  {
    code: 'PAUSED50',
    name: 'Temporary Paused Concession',
    status: 'PAUSED',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    service: 'ALL',
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    terms: ['Campaign paused by administration']
  },
  {
    code: 'MINSPEND5000',
    name: 'High-Value Annual Booking Incentive',
    status: 'LIVE',
    discountType: 'FIXED',
    discountValue: 1000,
    minSpend: 5000,
    service: 'ALL',
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    terms: ['Requires minimum cart value of ₹5,000']
  },
  {
    code: 'TUITIONONLY',
    name: 'Verified Home Tuition Exclusive',
    status: 'LIVE',
    discountType: 'PERCENTAGE',
    discountValue: 25,
    service: 'HOME_TUITION',
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    terms: ['Valid exclusively for 1-on-1 Home Tuition bookings']
  }
];

class CouponService {
  /**
   * Copies promo coupon code to user's system clipboard and records it in session storage.
   */
  public async copyCoupon(code: string): Promise<CouponCopyResult> {
    if (!code || !code.trim()) {
      return {
        couponCode: '',
        success: false,
        message: 'No coupon code provided.'
      };
    }

    const cleanCode = code.trim().toUpperCase();

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(cleanCode);
      } else if (typeof document !== 'undefined') {
        const textArea = document.createElement('textarea');
        textArea.value = cleanCode;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      // Persist in safe storage for checkout pre-fill
      this.setLastCopiedCoupon(cleanCode);

      return {
        couponCode: cleanCode,
        success: true,
        message: `Coupon code "${cleanCode}" copied to clipboard!`
      };
    } catch {
      // Still persist locally even if clipboard write had security restriction
      this.setLastCopiedCoupon(cleanCode);

      return {
        couponCode: cleanCode,
        success: true,
        message: `Coupon code "${cleanCode}" saved for checkout!`
      };
    }
  }

  /**
   * Records the last copied coupon in session safeStorage.
   */
  public setLastCopiedCoupon(code: string): void {
    try {
      safeStorage.setItem(LAST_COPIED_COUPON_KEY, code.trim().toUpperCase());
    } catch {
      // Ignored in restricted environments
    }
  }

  /**
   * Returns the last copied coupon string or null.
   */
  public getLastCopiedCoupon(): string | null {
    try {
      const raw = safeStorage.getItem(LAST_COPIED_COUPON_KEY);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.code === 'string') return parsed.code;
      } catch {
        // Plain string
      }
      return raw;
    } catch {
      return null;
    }
  }

  /**
   * Clears the last copied coupon after redemption.
   */
  public clearLastCopiedCoupon(): void {
    try {
      safeStorage.removeItem(LAST_COPIED_COUPON_KEY);
    } catch {
      // Ignored
    }
  }

  /**
   * Normalizes service types for cross-system compatibility.
   */
  public normalizeService(service?: string): string {
    if (!service) return 'ALL';
    const s = service.toUpperCase();
    if (s.includes('TUITION') || s.includes('TUTOR') || s === 'HOME_TUITION') return 'HOME_TUITION';
    if (s.includes('LIBRARY') || s.includes('SEAT') || s.includes('DESK') || s === 'DIGITAL_LIBRARY' || s === 'SELF_STUDY_LIBRARY') return 'SELF_STUDY_LIBRARY';
    if (s.includes('MOCK') || s.includes('TEST') || s.includes('EXAM')) return 'MOCK_TEST';
    if (s.includes('STUDY') || s.includes('MATERIAL') || s.includes('NOTES')) return 'STUDY_MATERIAL';
    if (s.includes('PACKAGE') || s === 'COMPLETE_PACKAGE') return 'ALL';
    if (s.includes('SUB') || s.includes('ENTITLEMENT') || s === 'SUBSCRIPTION') return 'SUBSCRIPTION';
    if (s.includes('STORE') || s.includes('DIGITAL')) return 'DIGITAL_STORE';
    return s;
  }

  /**
   * Evaluates the real-time status of a coupon based on date, usage, and manual flags.
   */
  public evaluateCouponStatus(item: {
    status?: string;
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
    timesUsed?: number;
  }): CouponStatus {
    const rawStatus = (item.status || 'ACTIVE').toUpperCase();
    if (rawStatus === 'DRAFT') return 'DRAFT';
    if (rawStatus === 'PAUSED') return 'PAUSED';
    if (rawStatus === 'DISABLED') return 'DISABLED';
    if (rawStatus === 'ARCHIVED') return 'ARCHIVED';
    if (rawStatus === 'EXPIRED') return 'EXPIRED';

    const todayStr = new Date().toISOString().substring(0, 10);

    if (item.startDate && todayStr < item.startDate) {
      return 'SCHEDULED';
    }

    if (item.endDate && todayStr > item.endDate) {
      return 'EXPIRED';
    }

    if (item.usageLimit && item.usageLimit > 0 && (item.timesUsed || 0) >= item.usageLimit) {
      return 'EXPIRED';
    }

    return 'LIVE';
  }

  /**
   * Comprehensive Coupon Validation & Price Calculation Engine
   * Validates against Live Offers (Super Admin / District Admin) and Static Promos.
   */
  public async validateCoupon(
    input: string | CouponValidationParams,
    serviceParam?: string
  ): Promise<CouponValidationResult> {
    const params: CouponValidationParams = typeof input === 'string'
      ? { code: input, service: serviceParam, amount: 1000 }
      : input;

    const rawCode = (params.couponCode || params.code || '').trim().toUpperCase();

    if (!rawCode) {
      const requestedAmt = Math.max(0, params.purchaseAmount !== undefined ? params.purchaseAmount : (params.amount || 0));
      return {
        valid: false,
        isValid: false,
        couponCode: '',
        calculatedDiscount: 0,
        discountAmount: 0,
        payableAmount: requestedAmt,
        finalPayableAmount: requestedAmt,
        originalAmount: requestedAmt,
        status: 'DISABLED',
        errorReason: 'NO_CODE',
        message: 'Please enter a coupon code.'
      };
    }

    const requestedAmount = Math.max(0, params.purchaseAmount !== undefined ? params.purchaseAmount : (params.amount || 0));
    const requestedService = this.normalizeService(params.productServiceType || params.service || params.productType);

    // 1. Check Live Offers from offerService
    const allOffers = await offerService.getAllOffers();
    const matchedOffer = allOffers.find(
      o => o.couponCode && o.couponCode.toUpperCase() === rawCode
    );

    // 2. Check District Admin / Policy offers
    const policyOffers = policyService.getOffers({ 
      districtName: params.districtName || 'Ghazipur' 
    });
    const matchedPolicy = policyOffers.find(
      p => (p.code || p.id).toUpperCase() === rawCode
    );

    // 3. Check Static Coupon Registry
    const matchedStatic = STATIC_COUPON_DEFINITIONS.find(
      s => s.code.toUpperCase() === rawCode
    );

    // Consolidate candidate coupon metadata
    let candidate: {
      code: string;
      name: string;
      status: CouponStatus;
      discountType: 'PERCENTAGE' | 'FIXED';
      discountValue: number;
      maxDiscount?: number;
      minSpend?: number;
      service: string;
      startDate?: string;
      endDate?: string;
      usageLimit?: number;
      timesUsed?: number;
      stateName?: string;
      districtName?: string;
      localityName?: string;
      terms: string[];
      offerId?: string;
    } | null = null;

    if (matchedOffer) {
      const calculatedStatus = this.evaluateCouponStatus({
        status: matchedOffer.status,
        startDate: matchedOffer.startDate,
        endDate: matchedOffer.endDate,
        usageLimit: matchedOffer.usageLimit,
        timesUsed: matchedOffer.timesUsed
      });

      candidate = {
        code: matchedOffer.couponCode || rawCode,
        name: matchedOffer.title,
        status: calculatedStatus,
        discountType: matchedOffer.discountType,
        discountValue: matchedOffer.discountValue,
        maxDiscount: matchedOffer.maxDiscount,
        minSpend: matchedOffer.minPurchaseAmount || 0,
        service: this.normalizeService(matchedOffer.service),
        startDate: matchedOffer.startDate,
        endDate: matchedOffer.endDate,
        usageLimit: matchedOffer.usageLimit,
        timesUsed: matchedOffer.timesUsed,
        stateName: matchedOffer.stateName,
        districtName: matchedOffer.districtName,
        localityName: matchedOffer.localityName,
        terms: matchedOffer.termsAndConditions || [],
        offerId: matchedOffer.id
      };
    } else if (matchedPolicy) {
      const calculatedStatus = this.evaluateCouponStatus({
        status: matchedPolicy.status,
        startDate: matchedPolicy.startDate,
        endDate: matchedPolicy.endDate,
        usageLimit: matchedPolicy.usageLimit,
        timesUsed: matchedPolicy.usageCount
      });

      candidate = {
        code: matchedPolicy.code || rawCode,
        name: matchedPolicy.title,
        status: calculatedStatus,
        discountType: matchedPolicy.discountType as any,
        discountValue: matchedPolicy.discountValue,
        maxDiscount: matchedPolicy.maxDiscount,
        minSpend: matchedPolicy.minSpend || matchedPolicy.minimumAmount || 0,
        service: this.normalizeService(matchedPolicy.serviceType),
        startDate: matchedPolicy.startDate,
        endDate: matchedPolicy.endDate,
        usageLimit: matchedPolicy.usageLimit,
        timesUsed: matchedPolicy.usageCount,
        districtName: matchedPolicy.districtName,
        terms: [matchedPolicy.termsConditions || 'Valid on designated services.'],
        offerId: matchedPolicy.id
      };
    } else if (matchedStatic) {
      const calculatedStatus = this.evaluateCouponStatus(matchedStatic);
      candidate = {
        ...matchedStatic,
        status: calculatedStatus,
        offerId: `static-${matchedStatic.code}`
      };
    }

    // Coupon not found in any register
    if (!candidate) {
      return {
        valid: false,
        isValid: false,
        couponCode: rawCode,
        calculatedDiscount: 0,
        discountAmount: 0,
        payableAmount: requestedAmount,
        finalPayableAmount: requestedAmount,
        originalAmount: requestedAmount,
        status: 'DISABLED',
        errorReason: 'NOT_FOUND',
        message: `Coupon "${rawCode}" does not exist. Please check the code and try again.`
      };
    }

    // Status Validations
    if (candidate.status === 'EXPIRED') {
      return {
        valid: false,
        isValid: false,
        couponCode: rawCode,
        calculatedDiscount: 0,
        discountAmount: 0,
        payableAmount: requestedAmount,
        finalPayableAmount: requestedAmount,
        originalAmount: requestedAmount,
        status: 'EXPIRED',
        errorReason: 'EXPIRED',
        message: candidate.endDate 
          ? `Coupon "${rawCode}" expired on ${candidate.endDate}.` 
          : `Coupon "${rawCode}" has expired.`
      };
    }

    if (candidate.status === 'PAUSED') {
      return {
        valid: false,
        isValid: false,
        couponCode: rawCode,
        calculatedDiscount: 0,
        discountAmount: 0,
        payableAmount: requestedAmount,
        finalPayableAmount: requestedAmount,
        originalAmount: requestedAmount,
        status: 'PAUSED',
        errorReason: 'OFFER_PAUSED',
        message: `This offer is currently paused by administration.`
      };
    }

    if (candidate.status === 'SCHEDULED') {
      return {
        valid: false,
        isValid: false,
        couponCode: rawCode,
        calculatedDiscount: 0,
        discountAmount: 0,
        payableAmount: requestedAmount,
        finalPayableAmount: requestedAmount,
        originalAmount: requestedAmount,
        status: 'SCHEDULED',
        errorReason: 'SCHEDULED',
        message: `Coupon "${rawCode}" is scheduled to go live on ${candidate.startDate}.`
      };
    }

    if (candidate.status === 'DISABLED' || candidate.status === 'ARCHIVED' || candidate.status === 'DRAFT') {
      return {
        valid: false,
        isValid: false,
        couponCode: rawCode,
        calculatedDiscount: 0,
        discountAmount: 0,
        payableAmount: requestedAmount,
        finalPayableAmount: requestedAmount,
        originalAmount: requestedAmount,
        status: candidate.status,
        errorReason: 'INACTIVE',
        message: `This coupon is no longer active.`
      };
    }

    // Product & Service Applicability Check
    if (candidate.service !== 'ALL' && requestedService !== 'ALL') {
      if (candidate.service !== requestedService) {
        const readableTarget = candidate.service === 'HOME_TUITION' ? 'Home Tuition'
          : candidate.service === 'SELF_STUDY_LIBRARY' ? 'Library Bookings'
          : candidate.service === 'MOCK_TEST' ? 'Mock Tests'
          : candidate.service === 'STUDY_MATERIAL' ? 'Study Materials'
          : candidate.service === 'DIGITAL_STORE' ? 'Digital Learning Store'
          : candidate.service;

        return {
          valid: false,
          isValid: false,
          couponCode: rawCode,
          calculatedDiscount: 0,
          discountAmount: 0,
          payableAmount: requestedAmount,
          finalPayableAmount: requestedAmount,
          originalAmount: requestedAmount,
          status: 'LIVE',
          errorReason: 'PRODUCT_MISMATCH',
          message: `Coupon "${rawCode}" is not applicable to this product. It applies to ${readableTarget} only.`
        };
      }
    }

    // Minimum Purchase Amount Check
    const minRequired = candidate.minSpend || 0;
    if (minRequired > 0 && requestedAmount < minRequired) {
      return {
        valid: false,
        isValid: false,
        couponCode: rawCode,
        calculatedDiscount: 0,
        discountAmount: 0,
        payableAmount: requestedAmount,
        finalPayableAmount: requestedAmount,
        originalAmount: requestedAmount,
        status: 'LIVE',
        errorReason: 'MIN_SPEND_NOT_MET',
        message: `Minimum purchase amount of ₹${minRequired.toLocaleString('en-IN')} required to apply this coupon.`
      };
    }

    // Territory Check (where applicable)
    if (params.districtName && candidate.districtName) {
      if (params.districtName.toLowerCase() !== candidate.districtName.toLowerCase()) {
        return {
          valid: false,
          isValid: false,
          couponCode: rawCode,
          calculatedDiscount: 0,
          discountAmount: 0,
          payableAmount: requestedAmount,
          finalPayableAmount: requestedAmount,
          originalAmount: requestedAmount,
          status: 'LIVE',
          errorReason: 'TERRITORY_MISMATCH',
          message: `Coupon "${rawCode}" is valid exclusively in ${candidate.districtName} district.`
        };
      }
    }

    // Usage Limit Check
    if (candidate.usageLimit && candidate.usageLimit > 0 && (candidate.timesUsed || 0) >= candidate.usageLimit) {
      return {
        valid: false,
        isValid: false,
        couponCode: rawCode,
        calculatedDiscount: 0,
        discountAmount: 0,
        payableAmount: requestedAmount,
        finalPayableAmount: requestedAmount,
        originalAmount: requestedAmount,
        status: 'EXPIRED',
        errorReason: 'USAGE_LIMIT_EXCEEDED',
        message: `Coupon usage limit has been reached.`
      };
    }

    // Calculate Discount
    let calculatedDiscount = 0;
    if (candidate.discountType === 'PERCENTAGE') {
      calculatedDiscount = Math.round((requestedAmount * candidate.discountValue) / 100);
      if (candidate.maxDiscount && candidate.maxDiscount > 0) {
        calculatedDiscount = Math.min(calculatedDiscount, candidate.maxDiscount);
      }
    } else {
      calculatedDiscount = Math.min(requestedAmount, candidate.discountValue);
    }

    const payableAmount = Math.max(0, requestedAmount - calculatedDiscount);

    return {
      valid: true,
      isValid: true,
      couponCode: candidate.code,
      discountType: candidate.discountType,
      discountValue: candidate.discountValue,
      calculatedDiscount,
      discountAmount: calculatedDiscount,
      payableAmount,
      finalPayableAmount: payableAmount,
      originalAmount: requestedAmount,
      offerId: candidate.offerId,
      offerName: candidate.name,
      status: 'LIVE',
      message: `Coupon "${candidate.code}" applied! You save ₹${calculatedDiscount.toLocaleString('en-IN')}.`,
      termsAndConditions: candidate.terms,
      coupon: {
        id: candidate.offerId || candidate.code,
        code: candidate.code,
        name: candidate.name,
        status: 'LIVE',
        discountType: candidate.discountType,
        discountValue: candidate.discountValue,
        maxDiscount: candidate.maxDiscount,
        minSpend: candidate.minSpend,
        service: candidate.service,
        startDate: candidate.startDate,
        endDate: candidate.endDate,
        usageLimit: candidate.usageLimit,
        timesUsed: candidate.timesUsed,
        terms: candidate.terms
      },
      offer: {
        id: candidate.offerId,
        title: candidate.name,
        description: candidate.terms?.[0] || '',
        startDate: candidate.startDate || '2026-01-01',
        endDate: candidate.endDate || '2028-12-31',
        status: 'LIVE'
      }
    };
  }

  /**
   * Helper to format discount text for UI badges
   */
  public getDiscountLabel(discountType: 'PERCENTAGE' | 'FIXED', discountValue: number): string {
    return discountType === 'PERCENTAGE' ? `${discountValue}% OFF` : `₹${discountValue} FLAT OFF`;
  }
}

export const couponService = new CouponService();
