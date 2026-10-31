// FOCUSPOINT Commission & Offer Policy Management Service Layer
// Controls centralized commission rules, custom overrides, discount offers, and audit logs.

import { 
  CommissionPolicy, 
  Offer, 
  PolicyAuditLog, 
  TransactionBreakdown, 
  PolicyAnalyticsSummary,
  ServiceType,
  CommissionType,
  DiscountType,
  OfferCategory
} from '../types/policy';
import { mockStore } from '../mock/store';

const POLICIES_KEY = 'fp_commission_policies_v1';
const OFFERS_KEY = 'fp_offers_v1';
const AUDIT_KEY = 'fp_policy_audit_logs_v1';

type Listener = () => void;

// Super Admin Hardcoded Fallback
export const SYSTEM_DEFAULTS = {
  LIBRARY: { commissionType: 'PERCENTAGE' as CommissionType, commissionValue: 10 },
  TUITION: { commissionType: 'PERCENTAGE' as CommissionType, commissionValue: 10 },
};

export interface ActiveOfferPricing {
  offer?: Offer;
  hasOffer: boolean;
  originalPrice: number;
  discountAmount: number;
  discountedPrice: number;
  discountLabel: string;      // e.g. "30% OFF" or "₹300 OFF"
  badgeText: string;          // e.g. "🔥 30% OFF" or "🏷️ ₹300 OFF"
  savingsText: string;        // e.g. "Save ₹300"
  validUntilFormatted: string;// e.g. "30 September 2026"
  policySource: 'CUSTOM_OVERRIDE' | 'DISTRICT_COMMON' | 'SUPER_ADMIN_DEFAULT' | 'NONE';
}

class PolicyService {
  private policies: CommissionPolicy[] = [];
  private offers: Offer[] = [];
  private auditLogs: PolicyAuditLog[] = [];
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const rawPol = localStorage.getItem(POLICIES_KEY);
      const rawOff = localStorage.getItem(OFFERS_KEY);
      const rawAud = localStorage.getItem(AUDIT_KEY);

      if (rawPol) this.policies = JSON.parse(rawPol);
      else this.policies = this.getInitialPolicies();

      if (rawOff) {
        const storedOffers: Offer[] = JSON.parse(rawOff);
        const existingIds = new Set(storedOffers.map(o => o.id));
        const missing = this.getInitialOffers().filter(o => !existingIds.has(o.id));
        this.offers = [...storedOffers, ...missing];
      } else {
        this.offers = this.getInitialOffers();
      }

      if (rawAud) this.auditLogs = JSON.parse(rawAud);
      else this.auditLogs = this.getInitialAuditLogs();
    } catch {
      this.policies = this.getInitialPolicies();
      this.offers = this.getInitialOffers();
      this.auditLogs = this.getInitialAuditLogs();
    }
  }

  private save() {
    try {
      localStorage.setItem(POLICIES_KEY, JSON.stringify(this.policies));
      localStorage.setItem(OFFERS_KEY, JSON.stringify(this.offers));
      localStorage.setItem(AUDIT_KEY, JSON.stringify(this.auditLogs));
      this.notify();
    } catch (e) {
      console.error('Failed to save policy data:', e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => {
      try { fn(); } catch (err) { console.error('Error in policy listener:', err); }
    });
  }

  // =========================================================
  // INITIAL FACTORY SEED DATA
  // =========================================================
  private getInitialPolicies(): CommissionPolicy[] {
    const now = '2024-01-01T00:00:00.000Z';
    return [
      // Ghazipur Common District Policies
      {
        id: 'pol-gzp-lib-common',
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetType: 'DISTRICT',
        commissionType: 'PERCENTAGE',
        commissionValue: 10,
        startDate: '2024-01-01',
        status: 'ACTIVE',
        isCustomOverride: false,
        notes: 'Standard Ghazipur district library commission rate (10%)',
        createdBy: 'Manoj Kumar Rai (Chief District Admin)',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'pol-gzp-tui-common',
        districtName: 'Ghazipur',
        serviceType: 'TUITION',
        targetType: 'DISTRICT',
        commissionType: 'PERCENTAGE',
        commissionValue: 15,
        startDate: '2024-01-01',
        status: 'ACTIVE',
        isCustomOverride: false,
        notes: 'Standard Ghazipur district home tuition commission rate (15%)',
        createdBy: 'Manoj Kumar Rai (Chief District Admin)',
        createdAt: now,
        updatedAt: now,
      },
      // Ghazipur Custom Overrides (Example from prompt)
      {
        id: 'pol-gzp-lib-saidpur-override',
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetType: 'LIBRARY',
        targetId: 'lib-gzp-01',
        targetName: 'Saidpur Digital Study Hub',
        commissionType: 'PERCENTAGE',
        commissionValue: 8, // 8% override
        startDate: '2024-02-01',
        status: 'ACTIVE',
        isCustomOverride: true,
        notes: 'Early-stage accredited partner discount incentive (8%)',
        createdBy: 'Manoj Kumar Rai (Chief District Admin)',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'pol-gzp-lib-sadat-override',
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetType: 'LIBRARY',
        targetId: 'lib-gzp-02',
        targetName: 'Sadat High-Focus Study Library',
        commissionType: 'PERCENTAGE',
        commissionValue: 12, // 12% override
        startDate: '2024-02-01',
        status: 'ACTIVE',
        isCustomOverride: true,
        notes: 'Premium desk amenities support levy (12%)',
        createdBy: 'Manoj Kumar Rai (Chief District Admin)',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'pol-gzp-tui-vikram-override',
        districtName: 'Ghazipur',
        serviceType: 'TUITION',
        targetType: 'TUITION',
        targetId: 'usr-teacher-01',
        targetName: 'Vikramaditya Pandey (Physics)',
        commissionType: 'PERCENTAGE',
        commissionValue: 12, // 12% override
        startDate: '2024-03-01',
        status: 'ACTIVE',
        isCustomOverride: true,
        notes: 'Senior faculty batch incentive (12% instead of 15%)',
        createdBy: 'Manoj Kumar Rai (Chief District Admin)',
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  private getInitialOffers(): Offer[] {
    const now = '2024-01-01T00:00:00.000Z';
    return [
      // 1. Particular Custom Library Offer: FocusPoint Digital Library (30% OFF)
      {
        id: 'off-gzp-lib-focuspoint-30',
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetType: 'LIBRARY',
        targetId: 'lib-focus-saidpur',
        targetName: 'FocusPoint Digital Library',
        title: 'FocusPoint Special 30% Inaugural Concession',
        code: 'FOCUS30',
        description: '30% flat discount applied by District Admin on full-month library seat bookings and daily shifts at FocusPoint Digital Library, Saidpur.',
        discountType: 'PERCENTAGE',
        discountValue: 30,
        maxDiscount: 1000,
        minimumAmount: 0,
        minSpend: 0,
        offerCategory: 'PROMOTIONAL',
        startDate: '2024-01-01',
        endDate: '2028-12-31',
        usageLimit: 1000,
        usageCount: 35,
        perUserLimit: 1,
        allowStacking: false,
        status: 'ACTIVE',
        termsConditions: 'Valid on all study shifts, full-day desks, and monthly subscriptions at FocusPoint Digital Library, Saidpur. Cannot be combined with other concessions.',
        createdBy: 'Manoj Kumar Rai (Chief District Admin)',
        createdAt: now,
        updatedAt: now,
      },
      // 2. Particular Custom Tuition Offer: Rahul Kumar (30% OFF)
      {
        id: 'off-gzp-tui-rahul-30',
        districtName: 'Ghazipur',
        serviceType: 'TUITION',
        targetType: 'TUITION',
        targetId: 'usr-teacher-rahul',
        targetName: 'Rahul Kumar (Home Tuition)',
        title: 'Rahul Kumar 30% Home Tuition Launch Grant',
        code: 'RAHUL30',
        description: '30% tuition fee discount applied by District Admin on home tuition enrollment with educator Rahul Kumar in Saidpur.',
        discountType: 'PERCENTAGE',
        discountValue: 30,
        maxDiscount: 1500,
        minimumAmount: 0,
        minSpend: 0,
        offerCategory: 'NEW_STUDENT',
        startDate: '2024-01-01',
        endDate: '2028-12-31',
        usageLimit: 500,
        usageCount: 24,
        perUserLimit: 1,
        allowStacking: false,
        status: 'ACTIVE',
        termsConditions: 'Valid for Class 8-12 CBSE and State Board regular home tutoring courses. Minimum 1-month commitment required.',
        createdBy: 'Manoj Kumar Rai (Chief District Admin)',
        createdAt: now,
        updatedAt: now,
      },
      // 3. District Common Library Offer: All Ghazipur Libraries (10% OFF)
      {
        id: 'off-gzp-lib-common-10',
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetType: 'DISTRICT',
        title: 'Ghazipur District Common Study Pass (10% OFF)',
        code: 'GZP10OFF',
        description: '10% standard district concession across all accredited self-study libraries in Ghazipur.',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxDiscount: 300,
        minimumAmount: 0,
        minSpend: 0,
        offerCategory: 'GENERAL',
        startDate: '2024-01-01',
        endDate: '2028-12-31',
        usageLimit: 2000,
        usageCount: 112,
        perUserLimit: 1,
        allowStacking: false,
        status: 'ACTIVE',
        termsConditions: 'Applies automatically to all accredited study libraries in Ghazipur district that do not have higher custom rates.',
        createdBy: 'Manoj Kumar Rai (Chief District Admin)',
        createdAt: now,
        updatedAt: now,
      },
      // 4. District Common Tuition Offer: All Ghazipur Home Tuition (10% OFF)
      {
        id: 'off-gzp-tui-common-10',
        districtName: 'Ghazipur',
        serviceType: 'TUITION',
        targetType: 'DISTRICT',
        title: 'Ghazipur District Common Tuition Grant (10% OFF)',
        code: 'GZPTUI10',
        description: '10% standard district tuition concession for all verified educators across Ghazipur.',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxDiscount: 600,
        minimumAmount: 0,
        minSpend: 0,
        offerCategory: 'GENERAL',
        startDate: '2024-01-01',
        endDate: '2028-12-31',
        usageLimit: 1000,
        usageCount: 88,
        perUserLimit: 1,
        allowStacking: false,
        status: 'ACTIVE',
        termsConditions: 'Applies automatically to verified home tutors across Ghazipur.',
        createdBy: 'Manoj Kumar Rai (Chief District Admin)',
        createdAt: now,
        updatedAt: now,
      },
      // 5. Additional Promotional Particular Library Offer
      {
        id: 'off-gzp-lib-saidpur-01',
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetType: 'LIBRARY',
        targetId: 'lib-gzp-01',
        targetName: 'Saidpur Digital Study Hub',
        title: 'Saidpur Student Foundation Pass (₹150 OFF)',
        code: 'SAIDPUR150',
        description: 'Special ₹150 off on full-day air-conditioned study cabin subscriptions at Saidpur Branch.',
        discountType: 'FIXED',
        discountValue: 150,
        minimumAmount: 800,
        minSpend: 800,
        offerCategory: 'PROMOTIONAL',
        startDate: '2024-01-01',
        endDate: '2028-12-31',
        usageLimit: 100,
        usageCount: 18,
        perUserLimit: 1,
        allowStacking: false,
        status: 'ACTIVE',
        termsConditions: 'Valid exclusively for Saidpur Digital Study Hub students.',
        createdBy: 'Manoj Kumar Rai (Chief District Admin)',
        createdAt: now,
        updatedAt: now,
      },
      // 6. District Common Library Festive Offer (20% OFF)
      {
        id: 'off-gzp-lib-common-01',
        districtName: 'Ghazipur',
        serviceType: 'LIBRARY',
        targetType: 'DISTRICT',
        title: 'October Festive Study Pass (20% OFF)',
        code: 'FESTIVE20',
        description: '20% off on all self-study library passes across Ghazipur district during festive enrollment season.',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        maxDiscount: 250,
        minimumAmount: 500,
        minSpend: 500,
        offerCategory: 'FESTIVAL',
        startDate: '2024-01-01',
        endDate: '2028-12-31',
        usageLimit: 500,
        usageCount: 42,
        perUserLimit: 1,
        allowStacking: false,
        status: 'ACTIVE',
        termsConditions: 'Valid on monthly subscriptions across all accredited Ghazipur study libraries.',
        createdBy: 'Manoj Kumar Rai (Chief District Admin)',
        createdAt: now,
        updatedAt: now,
      },
      // 7. District Common Tuition Promotional Offer (₹300 OFF)
      {
        id: 'off-gzp-tui-common-01',
        districtName: 'Ghazipur',
        serviceType: 'TUITION',
        targetType: 'DISTRICT',
        title: 'Ghazipur Tuition Launch Grant (₹300 OFF)',
        code: 'GZPTUI300',
        description: 'Flat ₹300 off on first-month home tuition fee for any subject across Ghazipur.',
        discountType: 'FIXED',
        discountValue: 300,
        minimumAmount: 1500,
        minSpend: 1500,
        offerCategory: 'PROMOTIONAL',
        startDate: '2024-01-01',
        endDate: '2028-12-31',
        usageLimit: 300,
        usageCount: 15,
        perUserLimit: 1,
        allowStacking: false,
        status: 'ACTIVE',
        termsConditions: 'Applicable on monthly tuition bookings above ₹1,500.',
        createdBy: 'Manoj Kumar Rai (Chief District Admin)',
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  private getInitialAuditLogs(): PolicyAuditLog[] {
    return [
      {
        id: 'aud-01',
        type: 'COMMISSION',
        districtName: 'Ghazipur',
        action: 'CREATE',
        previousValue: 'None',
        newValue: '10% (Common District Library)',
        performedBy: 'Manoj Kumar Rai (Chief District Admin)',
        affectedEntity: 'All District Libraries',
        reason: 'Initial district regulatory benchmark establishment',
        timestamp: '2024-01-01T10:00:00.000Z',
      },
      {
        id: 'aud-02',
        type: 'COMMISSION',
        districtName: 'Ghazipur',
        action: 'CREATE',
        previousValue: '10% (Common)',
        newValue: '8% (Custom Override)',
        performedBy: 'Manoj Kumar Rai (Chief District Admin)',
        affectedEntity: 'Saidpur Digital Study Hub',
        reason: 'Accreditation incentive for model tech facility',
        timestamp: '2024-02-01T11:30:00.000Z',
      },
      {
        id: 'aud-03',
        type: 'OFFER',
        districtName: 'Ghazipur',
        action: 'CREATE',
        previousValue: 'None',
        newValue: '20% OFF (October Festive Study Pass)',
        performedBy: 'Manoj Kumar Rai (Chief District Admin)',
        affectedEntity: 'All District Libraries',
        reason: 'District festive enrollment surge promotion',
        timestamp: '2024-10-01T09:00:00.000Z',
      },
    ];
  }

  // =========================================================
  // 1. COMMISSION PRIORITY RESOLUTION ENGINE
  // =========================================================

  /**
   * Resolves final applicable commission using the 3-Tier Priority System:
   * 1. Particular Library/Tuition Custom Override
   * 2. District Common Commission
   * 3. System / Super Admin Default Commission
   */
  public resolveCommission(params: {
    districtName: string;
    serviceType: ServiceType;
    targetId?: string;
    date?: string;
  }): {
    commissionType: CommissionType;
    commissionValue: number;
    policySource: 'CUSTOM_OVERRIDE' | 'DISTRICT_COMMON' | 'SUPER_ADMIN_DEFAULT';
    policy?: CommissionPolicy;
    policyDetails: string;
  } {
    const { districtName, serviceType, targetId, date = new Date().toISOString().split('T')[0] } = params;

    // 1. Check Particular Library/Tuition Custom Commission
    if (targetId) {
      const customPolicy = this.policies.find(p => 
        p.status === 'ACTIVE' &&
        p.isCustomOverride &&
        p.serviceType === serviceType &&
        p.targetId === targetId &&
        p.districtName.toLowerCase() === districtName.toLowerCase() &&
        p.startDate <= date &&
        (!p.endDate || p.endDate >= date)
      );

      if (customPolicy) {
        return {
          commissionType: customPolicy.commissionType,
          commissionValue: customPolicy.commissionValue,
          policySource: 'CUSTOM_OVERRIDE',
          policy: customPolicy,
          policyDetails: `${customPolicy.targetName || 'Specific Entity'} Custom Policy (${customPolicy.commissionValue}${customPolicy.commissionType === 'PERCENTAGE' ? '%' : '₹'})`,
        };
      }
    }

    // 2. Check District Common Commission
    const commonPolicy = this.policies.find(p =>
      p.status === 'ACTIVE' &&
      !p.isCustomOverride &&
      p.serviceType === serviceType &&
      p.districtName.toLowerCase() === districtName.toLowerCase() &&
      p.startDate <= date &&
      (!p.endDate || p.endDate >= date)
    );

    if (commonPolicy) {
      return {
        commissionType: commonPolicy.commissionType,
        commissionValue: commonPolicy.commissionValue,
        policySource: 'DISTRICT_COMMON',
        policy: commonPolicy,
        policyDetails: `${districtName} Common Policy (${commonPolicy.commissionValue}${commonPolicy.commissionType === 'PERCENTAGE' ? '%' : '₹'})`,
      };
    }

    // 3. Fallback: Super Admin / System Default
    const defaultVal = SYSTEM_DEFAULTS[serviceType];
    return {
      commissionType: defaultVal.commissionType,
      commissionValue: defaultVal.commissionValue,
      policySource: 'SUPER_ADMIN_DEFAULT',
      policyDetails: `System Default Standard (${defaultVal.commissionValue}%)`,
    };
  }

  // =========================================================
  // 2. OFFER RESOLUTION ENGINE
  // =========================================================

  /**
   * Resolves eligible offers for a transaction based on:
   * 1. Particular Library/Tutor Offer
   * 2. District Common Offer
   * 3. Eligibility rules (minimum spend, date window, usage cap)
   */
  public getEligibleOffers(params: {
    districtName: string;
    serviceType: ServiceType;
    targetId?: string;
    amount: number;
    date?: string;
  }): Offer[] {
    const { districtName, serviceType, targetId, amount, date = new Date().toISOString().split('T')[0] } = params;

    const matched = this.offers.filter(offer => {
      if (offer.status !== 'ACTIVE') return false;
      if (offer.serviceType !== serviceType) return false;
      if (offer.districtName.toLowerCase() !== districtName.toLowerCase()) return false;
      if (offer.startDate > date) return false;
      if (offer.endDate && offer.endDate < date) return false;
      if (amount < offer.minimumAmount) return false;
      if (offer.usageLimit > 0 && offer.usageCount >= offer.usageLimit) return false;

      // Scope match
      if (offer.targetType === 'DISTRICT') return true;
      if (targetId && offer.targetId === targetId) return true;
      return false;
    });

    // Sort: Custom Entity offers first, then highest discount value
    return matched.sort((a, b) => {
      if (a.targetType !== 'DISTRICT' && b.targetType === 'DISTRICT') return -1;
      if (a.targetType === 'DISTRICT' && b.targetType !== 'DISTRICT') return 1;
      return b.discountValue - a.discountValue;
    });
  }

  /**
   * Evaluates the single best applicable offer using strict priority:
   * 1. Particular Library / Tuition Custom Offer
   * 2. District Common Offer
   * 3. System / Super Admin General Offer
   * Computes originalPrice, discountAmount, discountedPrice, badgeText, savingsText.
   */
  public getBestActiveOffer(params: {
    districtName?: string;
    serviceType: ServiceType;
    targetId?: string;
    amount?: number;
    date?: string;
  }): ActiveOfferPricing {
    const districtName = (params.districtName || 'Ghazipur').trim();
    const serviceType = params.serviceType;
    const targetId = params.targetId;
    const amount = params.amount ?? 0;
    const date = params.date || new Date().toISOString().split('T')[0];

    // Priority 1: Particular Library / Tuition Custom Offer
    let matchedOffer: Offer | undefined = undefined;
    let policySource: ActiveOfferPricing['policySource'] = 'NONE';

    const computePotentialDiscount = (o: Offer, gross: number) => {
      if (gross <= 0) return o.discountType === 'PERCENTAGE' ? o.discountValue : o.discountValue;
      if (o.discountType === 'PERCENTAGE') {
        const raw = (gross * o.discountValue) / 100;
        return o.maxDiscount ? Math.min(raw, o.maxDiscount) : raw;
      }
      return Math.min(gross, o.discountValue);
    };

    if (targetId) {
      const customMatches = this.offers.filter(o =>
        o.status === 'ACTIVE' &&
        o.serviceType === serviceType &&
        o.targetType !== 'DISTRICT' &&
        (o.targetId === targetId ||
          (targetId === 'lib-focus-saidpur' && (o.targetId === 'lib-focus-saidpur' || o.targetName?.toLowerCase().includes('focuspoint'))) ||
          (targetId === 'usr-teacher-rahul' && (o.targetId === 'usr-teacher-rahul' || o.targetName?.toLowerCase().includes('rahul')))
        ) &&
        o.startDate <= date &&
        (!o.endDate || o.endDate >= date) &&
        (o.usageLimit <= 0 || (o.usageCount || 0) < o.usageLimit) &&
        (amount === 0 || amount >= (o.minimumAmount || o.minSpend || 0))
      );

      if (customMatches.length > 0) {
        customMatches.sort((a, b) => computePotentialDiscount(b, amount) - computePotentialDiscount(a, amount));
        matchedOffer = customMatches[0];
        policySource = 'CUSTOM_OVERRIDE';
      }
    }

    // Priority 2: District Common Offer
    if (!matchedOffer) {
      const commonMatches = this.offers.filter(o =>
        o.status === 'ACTIVE' &&
        o.serviceType === serviceType &&
        o.targetType === 'DISTRICT' &&
        (!districtName || !o.districtName || o.districtName.toLowerCase() === districtName.toLowerCase()) &&
        o.startDate <= date &&
        (!o.endDate || o.endDate >= date) &&
        (o.usageLimit <= 0 || (o.usageCount || 0) < o.usageLimit) &&
        (amount === 0 || amount >= (o.minimumAmount || o.minSpend || 0))
      );

      if (commonMatches.length > 0) {
        commonMatches.sort((a, b) => computePotentialDiscount(b, amount) - computePotentialDiscount(a, amount));
        matchedOffer = commonMatches[0];
        policySource = 'DISTRICT_COMMON';
      }
    }

    // Priority 3: System / Super Admin Fallback
    if (!matchedOffer) {
      const systemMatches = this.offers.filter(o =>
        o.status === 'ACTIVE' &&
        o.serviceType === serviceType &&
        (!o.districtName || o.districtName.toLowerCase() === 'all' || o.districtName.toLowerCase() === 'system') &&
        o.startDate <= date &&
        (!o.endDate || o.endDate >= date) &&
        (amount === 0 || amount >= (o.minimumAmount || o.minSpend || 0))
      );

      if (systemMatches.length > 0) {
        systemMatches.sort((a, b) => computePotentialDiscount(b, amount) - computePotentialDiscount(a, amount));
        matchedOffer = systemMatches[0];
        policySource = 'SUPER_ADMIN_DEFAULT';
      }
    }

    if (!matchedOffer) {
      return {
        hasOffer: false,
        originalPrice: amount,
        discountAmount: 0,
        discountedPrice: amount,
        discountLabel: '',
        badgeText: '',
        savingsText: '',
        validUntilFormatted: '',
        policySource: 'NONE',
      };
    }

    // Strict Calculation: Original -> Discount -> Final Payable
    let discountAmount = 0;
    if (amount > 0) {
      if (matchedOffer.discountType === 'PERCENTAGE') {
        const raw = (amount * matchedOffer.discountValue) / 100;
        discountAmount = matchedOffer.maxDiscount ? Math.min(raw, matchedOffer.maxDiscount) : raw;
      } else {
        discountAmount = Math.min(amount, matchedOffer.discountValue);
      }
      discountAmount = Math.round(discountAmount);
    }
    const discountedPrice = Math.max(0, amount - discountAmount);

    const discountLabel = matchedOffer.discountType === 'PERCENTAGE'
      ? `${matchedOffer.discountValue}% OFF`
      : `₹${matchedOffer.discountValue} OFF`;

    const badgeText = matchedOffer.discountType === 'PERCENTAGE'
      ? `🔥 ${matchedOffer.discountValue}% OFF`
      : `🏷️ ₹${matchedOffer.discountValue} OFF`;

    const savingsText = discountAmount > 0
      ? `Save ₹${discountAmount}`
      : `Save up to ${discountLabel}`;

    let validUntilFormatted = 'Limited Time';
    if (matchedOffer.endDate) {
      try {
        const [y, m, d] = matchedOffer.endDate.split('-').map(Number);
        if (y && m && d) {
          const dateObj = new Date(y, m - 1, d);
          validUntilFormatted = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        } else {
          validUntilFormatted = matchedOffer.endDate;
        }
      } catch {
        validUntilFormatted = matchedOffer.endDate;
      }
    }

    return {
      offer: matchedOffer,
      hasOffer: true,
      originalPrice: amount,
      discountAmount,
      discountedPrice,
      discountLabel,
      badgeText,
      savingsText,
      validUntilFormatted,
      policySource,
    };
  }

  // =========================================================
  // 3. TRANSACTION BREAKDOWN & CALCULATION ENGINE
  // =========================================================

  /**
   * Implements strict calculation order:
   * 1. Original Amount
   * 2. Offer Discount subtracted -> Payable Amount
   * 3. Commission calculated on Payable Amount -> Commission Amount
   * 4. Net Settlement = Payable Amount - Commission Amount
   */
  public calculateBreakdown(params: {
    grossAmount?: number;
    originalAmount?: number;
    districtName?: string;
    serviceType: ServiceType;
    targetId?: string;
    selectedOfferId?: string;
    offer?: Offer;
    offerId?: string;
    date?: string;
  }): TransactionBreakdown {
    const grossAmount = params.grossAmount ?? params.originalAmount ?? 0;
    const districtName = params.districtName || 'Ghazipur';
    const { serviceType, targetId, date } = params;
    let selectedOfferId = params.selectedOfferId || params.offerId || params.offer?.id;

    // Auto-resolve best active offer if not explicitly provided
    if (!selectedOfferId && grossAmount > 0) {
      const best = this.getBestActiveOffer({ districtName, serviceType, targetId, amount: grossAmount, date });
      if (best.hasOffer && best.offer) {
        selectedOfferId = best.offer.id;
      }
    }

    // 1. Resolve Offer Discount
    let appliedOffer: TransactionBreakdown['appliedOffer'] = undefined;
    let discountAmount = 0;

    if (selectedOfferId) {
      const offer = this.offers.find(o => o.id === selectedOfferId) || (params.offer?.id === selectedOfferId ? params.offer : undefined);
      if (offer && offer.status === 'ACTIVE' && grossAmount >= (offer.minimumAmount || offer.minSpend || 0)) {
        if (offer.discountType === 'PERCENTAGE') {
          const raw = (grossAmount * offer.discountValue) / 100;
          discountAmount = offer.maxDiscount ? Math.min(raw, offer.maxDiscount) : raw;
        } else {
          discountAmount = Math.min(grossAmount, offer.discountValue);
        }
        discountAmount = Math.round(discountAmount);

        appliedOffer = {
          id: offer.id,
          title: offer.title,
          code: offer.code,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          discountAmount,
        };
      }
    }

    // 2. Payable Amount
    const payableAmount = Math.max(0, grossAmount - discountAmount);

    // 3. Resolve Commission
    const commRes = this.resolveCommission({ districtName, serviceType, targetId, date });
    let commissionAmount = 0;

    if (commRes.commissionType === 'PERCENTAGE') {
      commissionAmount = Math.round((payableAmount * commRes.commissionValue) / 100);
    } else {
      commissionAmount = Math.min(payableAmount, Math.round(commRes.commissionValue));
    }

    // 4. Net Settlement to provider
    const netSettlementAmount = Math.max(0, payableAmount - commissionAmount);

    return {
      grossAmount,
      originalAmount: grossAmount,
      appliedOffer,
      discountAmount,
      payableAmount,
      commissionRate: commRes.commissionValue,
      commissionType: commRes.commissionType,
      commissionAmount,
      netSettlementAmount,
      providerAmount: netSettlementAmount,
      policySource: commRes.policySource,
      policyDetails: commRes.policyDetails,
    };
  }

  // =========================================================
  // 4. COMMISSION POLICY CRUD
  // =========================================================

  public getPolicies(districtName: string, serviceType?: ServiceType): CommissionPolicy[] {
    return this.policies.filter(p => {
      const matchDistrict = !districtName || p.districtName.toLowerCase() === districtName.toLowerCase();
      const matchType = !serviceType || p.serviceType === serviceType;
      return matchDistrict && matchType;
    });
  }

  public getCommonPolicy(districtName: string, serviceType: ServiceType): CommissionPolicy | undefined {
    return this.policies.find(p =>
      !p.isCustomOverride &&
      p.serviceType === serviceType &&
      p.districtName.toLowerCase() === districtName.toLowerCase()
    );
  }

  public setCommonPolicy(params: {
    districtName: string;
    serviceType: ServiceType;
    commissionType: CommissionType;
    commissionValue: number;
    startDate?: string;
    endDate?: string;
    notes?: string;
    adminName: string;
    reason?: string;
  }): CommissionPolicy {
    const { districtName, serviceType, commissionType, commissionValue, startDate, endDate, notes, adminName, reason } = params;
    const now = new Date().toISOString();

    const existingIndex = this.policies.findIndex(p => 
      !p.isCustomOverride &&
      p.serviceType === serviceType &&
      p.districtName.toLowerCase() === districtName.toLowerCase()
    );

    let updatedPolicy: CommissionPolicy;
    const prevStr = existingIndex >= 0 
      ? `${this.policies[existingIndex].commissionValue}${this.policies[existingIndex].commissionType === 'PERCENTAGE' ? '%' : '₹'}`
      : 'None';
    const newStr = `${commissionValue}${commissionType === 'PERCENTAGE' ? '%' : '₹'}`;

    if (existingIndex >= 0) {
      updatedPolicy = {
        ...this.policies[existingIndex],
        commissionType,
        commissionValue,
        startDate: startDate || this.policies[existingIndex].startDate,
        endDate: endDate || this.policies[existingIndex].endDate,
        notes: notes || this.policies[existingIndex].notes,
        updatedBy: adminName,
        updatedAt: now,
      };
      this.policies[existingIndex] = updatedPolicy;
    } else {
      updatedPolicy = {
        id: `pol-${districtName.toLowerCase().slice(0, 3)}-${serviceType.toLowerCase().slice(0, 3)}-common-${Date.now().toString(36)}`,
        districtName,
        serviceType,
        targetType: 'DISTRICT',
        commissionType,
        commissionValue,
        startDate: startDate || now.split('T')[0],
        endDate,
        status: 'ACTIVE',
        isCustomOverride: false,
        notes: notes || `Common District ${serviceType} policy for ${districtName}`,
        createdBy: adminName,
        createdAt: now,
        updatedAt: now,
      };
      this.policies.push(updatedPolicy);
    }

    // Record audit log
    this.addAuditLog({
      type: 'COMMISSION',
      policyId: updatedPolicy.id,
      districtName,
      action: existingIndex >= 0 ? 'UPDATE' : 'CREATE',
      previousValue: prevStr,
      newValue: newStr,
      performedBy: adminName,
      affectedEntity: `All ${districtName} ${serviceType === 'LIBRARY' ? 'Libraries' : 'Tuition Providers'}`,
      reason: reason || 'District common commission policy update',
    });

    this.save();
    return updatedPolicy;
  }

  public getCustomOverrides(districtName: string, serviceType?: ServiceType): CommissionPolicy[] {
    return this.policies.filter(p => {
      const matchDistrict = !districtName || p.districtName.toLowerCase() === districtName.toLowerCase();
      const matchType = !serviceType || p.serviceType === serviceType;
      return p.isCustomOverride && matchDistrict && matchType;
    });
  }

  public addCustomOverride(params: {
    districtName: string;
    serviceType: ServiceType;
    targetId: string;
    targetName: string;
    commissionType: CommissionType;
    commissionValue: number;
    startDate?: string;
    endDate?: string;
    notes?: string;
    adminName: string;
    reason?: string;
  }): CommissionPolicy {
    const { districtName, serviceType, targetId, targetName, commissionType, commissionValue, startDate, endDate, notes, adminName, reason } = params;
    const now = new Date().toISOString();

    // Check if override already exists for this target
    const existingIndex = this.policies.findIndex(p =>
      p.isCustomOverride &&
      p.serviceType === serviceType &&
      p.targetId === targetId
    );

    const common = this.getCommonPolicy(districtName, serviceType);
    const commonStr = common ? `${common.commissionValue}${common.commissionType === 'PERCENTAGE' ? '%' : '₹'}` : '10%';
    const newStr = `${commissionValue}${commissionType === 'PERCENTAGE' ? '%' : '₹'}`;

    let policy: CommissionPolicy;

    if (existingIndex >= 0) {
      policy = {
        ...this.policies[existingIndex],
        targetName,
        commissionType,
        commissionValue,
        startDate: startDate || this.policies[existingIndex].startDate,
        endDate: endDate || this.policies[existingIndex].endDate,
        notes: notes || this.policies[existingIndex].notes,
        status: 'ACTIVE',
        updatedBy: adminName,
        updatedAt: now,
      };
      this.policies[existingIndex] = policy;
    } else {
      policy = {
        id: `pol-ovr-${serviceType.toLowerCase().slice(0, 3)}-${targetId.slice(-6)}-${Date.now().toString(36)}`,
        districtName,
        serviceType,
        targetType: serviceType === 'LIBRARY' ? 'LIBRARY' : 'TUITION',
        targetId,
        targetName,
        commissionType,
        commissionValue,
        startDate: startDate || now.split('T')[0],
        endDate,
        status: 'ACTIVE',
        isCustomOverride: true,
        notes: notes || `Custom override for ${targetName}`,
        createdBy: adminName,
        createdAt: now,
        updatedAt: now,
      };
      this.policies.push(policy);
    }

    this.addAuditLog({
      type: 'COMMISSION',
      policyId: policy.id,
      districtName,
      action: existingIndex >= 0 ? 'UPDATE' : 'CREATE',
      previousValue: commonStr,
      newValue: newStr,
      performedBy: adminName,
      affectedEntity: targetName,
      reason: reason || 'Configured entity custom commission override',
    });

    this.save();
    return policy;
  }

  public removeCustomOverride(policyId: string, adminName: string, reason?: string): boolean {
    const index = this.policies.findIndex(p => p.id === policyId && p.isCustomOverride);
    if (index === -1) return false;

    const target = this.policies[index];
    const prevStr = `${target.commissionValue}${target.commissionType === 'PERCENTAGE' ? '%' : '₹'} (Custom)`;
    const common = this.getCommonPolicy(target.districtName, target.serviceType);
    const commonStr = common ? `${common.commissionValue}${common.commissionType === 'PERCENTAGE' ? '%' : '₹'} (District Common)` : '10%';

    this.policies.splice(index, 1);

    this.addAuditLog({
      type: 'COMMISSION',
      policyId,
      districtName: target.districtName,
      action: 'RESET_COMMON',
      previousValue: prevStr,
      newValue: commonStr,
      performedBy: adminName,
      affectedEntity: target.targetName || 'Specific Entity',
      reason: reason || 'Removed custom override; restored to district common policy',
    });

    this.save();
    return true;
  }

  // Convenient Aliases
  public setCustomOverride(params: Parameters<PolicyService['addCustomOverride']>[0]): CommissionPolicy {
    return this.addCustomOverride(params);
  }

  public deletePolicy(policyId: string, adminName: string, reason?: string): boolean {
    return this.removeCustomOverride(policyId, adminName, reason);
  }

  public togglePolicyStatus(policyId: string, adminName: string): CommissionPolicy | undefined {
    const policy = this.policies.find(p => p.id === policyId);
    if (!policy) return undefined;

    const oldStatus = policy.status;
    policy.status = policy.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    policy.updatedBy = adminName;
    policy.updatedAt = new Date().toISOString();

    this.addAuditLog({
      type: 'COMMISSION',
      policyId,
      districtName: policy.districtName,
      action: 'STATUS_CHANGE',
      previousValue: oldStatus,
      newValue: policy.status,
      performedBy: adminName,
      affectedEntity: policy.targetName || `All ${policy.districtName} ${policy.serviceType}s`,
      reason: `Toggled policy status to ${policy.status}`,
    });

    this.save();
    return policy;
  }

  // =========================================================
  // 5. OFFER MANAGEMENT CRUD
  // =========================================================

  public getOffers(
    districtOrOptions?: string | { districtName?: string; serviceType?: ServiceType },
    serviceTypeParam?: ServiceType
  ): Offer[] {
    let districtName = '';
    let serviceType: ServiceType | undefined = undefined;

    if (typeof districtOrOptions === 'object' && districtOrOptions !== null) {
      districtName = districtOrOptions.districtName || '';
      serviceType = districtOrOptions.serviceType;
    } else {
      districtName = districtOrOptions || '';
      serviceType = serviceTypeParam;
    }

    return this.offers.filter(o => {
      const matchDistrict = !districtName || o.districtName.toLowerCase() === districtName.toLowerCase();
      const matchType = !serviceType || o.serviceType === serviceType;
      return matchDistrict && matchType;
    });
  }

  public addOffer(params: Omit<Offer, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Offer {
    const now = new Date().toISOString();
    const newOffer: Offer = {
      ...params,
      id: `off-${params.districtName.toLowerCase().slice(0, 3)}-${Date.now().toString(36)}`,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.offers.push(newOffer);

    this.addAuditLog({
      type: 'OFFER',
      offerId: newOffer.id,
      districtName: newOffer.districtName,
      action: 'CREATE',
      previousValue: 'None',
      newValue: `${newOffer.title} (${newOffer.discountValue}${newOffer.discountType === 'PERCENTAGE' ? '%' : '₹'} OFF)`,
      performedBy: newOffer.createdBy,
      affectedEntity: newOffer.targetName || `All ${newOffer.districtName} ${newOffer.serviceType}s`,
      reason: 'Created new discount offer',
    });

    this.save();
    return newOffer;
  }

  public updateOffer(id: string, updates: Partial<Offer>, adminName: string): Offer | undefined {
    const index = this.offers.findIndex(o => o.id === id);
    if (index === -1) return undefined;

    const prev = this.offers[index];
    this.offers[index] = {
      ...prev,
      ...updates,
      updatedBy: adminName,
      updatedAt: new Date().toISOString(),
    };

    this.addAuditLog({
      type: 'OFFER',
      offerId: id,
      districtName: prev.districtName,
      action: 'UPDATE',
      previousValue: `${prev.title} (${prev.discountValue}${prev.discountType === 'PERCENTAGE' ? '%' : '₹'})`,
      newValue: `${this.offers[index].title} (${this.offers[index].discountValue}${this.offers[index].discountType === 'PERCENTAGE' ? '%' : '₹'})`,
      performedBy: adminName,
      affectedEntity: prev.targetName || `All ${prev.districtName} ${prev.serviceType}s`,
      reason: 'Modified offer parameters',
    });

    this.save();
    return this.offers[index];
  }

  public toggleOfferStatus(id: string, adminName: string): Offer | undefined {
    const offer = this.offers.find(o => o.id === id);
    if (!offer) return undefined;

    const oldStatus = offer.status;
    offer.status = offer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    offer.updatedBy = adminName;
    offer.updatedAt = new Date().toISOString();

    this.addAuditLog({
      type: 'OFFER',
      offerId: id,
      districtName: offer.districtName,
      action: 'STATUS_CHANGE',
      previousValue: oldStatus,
      newValue: offer.status,
      performedBy: adminName,
      affectedEntity: offer.targetName || `All ${offer.districtName} ${offer.serviceType}s`,
      reason: `Toggled offer status to ${offer.status}`,
    });

    this.save();
    return offer;
  }

  public deleteOffer(id: string, adminName: string): boolean {
    const index = this.offers.findIndex(o => o.id === id);
    if (index === -1) return false;

    const offer = this.offers[index];
    this.offers.splice(index, 1);

    this.addAuditLog({
      type: 'OFFER',
      offerId: id,
      districtName: offer.districtName,
      action: 'STATUS_CHANGE',
      previousValue: offer.title,
      newValue: 'DELETED',
      performedBy: adminName,
      affectedEntity: offer.targetName || `All ${offer.districtName} ${offer.serviceType}s`,
      reason: 'Deleted promotion/offer',
    });

    this.save();
    return true;
  }

  public saveOffer(offer: Offer): Offer {
    const idx = this.offers.findIndex(o => o.id === offer.id || (offer.code && o.code === offer.code));
    if (idx >= 0) {
      return this.updateOffer(this.offers[idx].id, offer, offer.updatedBy || 'District Admin') || offer;
    } else {
      return this.addOffer(offer);
    }
  }

  // =========================================================
  // 6. AUDIT LOGS & ANALYTICS
  // =========================================================

  private addAuditLog(log: Omit<PolicyAuditLog, 'id' | 'timestamp'>) {
    const newLog: PolicyAuditLog = {
      ...log,
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    // Keep max 200 logs
    if (this.auditLogs.length > 200) {
      this.auditLogs = this.auditLogs.slice(0, 200);
    }
  }

  public getAuditLogs(districtName?: string, type?: 'COMMISSION' | 'OFFER'): PolicyAuditLog[] {
    return this.auditLogs.filter(l => {
      const matchDist = !districtName || l.districtName.toLowerCase() === districtName.toLowerCase();
      const matchType = !type || l.type === type;
      return matchDist && matchType;
    });
  }

  public getAnalyticsSummary(districtName: string): PolicyAnalyticsSummary {
    const districtPolicies = this.policies.filter(p => p.districtName.toLowerCase() === districtName.toLowerCase());
    const districtOffers = this.offers.filter(o => o.districtName.toLowerCase() === districtName.toLowerCase());

    const customOverrides = districtPolicies.filter(p => p.isCustomOverride);
    const commonPolicies = districtPolicies.filter(p => !p.isCustomOverride);

    // Compute average commission rate
    const rates = districtPolicies.filter(p => p.commissionType === 'PERCENTAGE').map(p => p.commissionValue);
    const averageCommissionRate = rates.length > 0 ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 10) / 10 : 10;

    const totalRedemptions = districtOffers.reduce((sum, o) => sum + (o.usageCount || 0), 0);
    const totalDiscountDisbursed = districtOffers.reduce((sum, o) => {
      const estPerRedemption = o.discountType === 'FIXED' ? o.discountValue : 150;
      return sum + (o.usageCount || 0) * estPerRedemption;
    }, 0);

    const topOffer = [...districtOffers].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))[0];

    return {
      districtName,
      totalCommissionEstThisMonth: 38400,
      libraryCommissionEst: 14200,
      tuitionCommissionEst: 24200,
      averageCommissionRate,
      customOverridesCount: customOverrides.length,
      commonPoliciesCount: commonPolicies.length,
      activeOffersCount: districtOffers.filter(o => o.status === 'ACTIVE').length,
      expiredOffersCount: districtOffers.filter(o => o.status !== 'ACTIVE').length,
      totalRedemptions,
      totalDiscountDisbursed,
      topOfferTitle: topOffer ? topOffer.title : 'None active',
    };
  }

  public resetToDefaults() {
    this.policies = this.getInitialPolicies();
    this.offers = this.getInitialOffers();
    this.auditLogs = this.getInitialAuditLogs();
    this.save();
  }
}

export const policyService = new PolicyService();
