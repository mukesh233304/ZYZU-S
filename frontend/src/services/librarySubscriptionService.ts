import { mockStore } from '../mock/store';
import {
  LibrarySubscriptionPlan,
  LibrarySubscriptionPricingRule,
  LibrarySubscription,
  LibrarySubscriptionPaymentRecord,
  LibrarySubscriptionCancellationRequest,
  LibrarySubscriptionPriceCalculation,
  LibrarySubscriptionAnalytics
} from '../types/librarySubscriptionPricing';

export const librarySubscriptionService = {
  async getAvailablePlans(): Promise<LibrarySubscriptionPlan[]> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getLibrarySubscriptionPlans();
  },

  async savePlan(plan: LibrarySubscriptionPlan): Promise<LibrarySubscriptionPlan> {
    await new Promise(r => setTimeout(r, 80));
    return mockStore.saveLibrarySubscriptionPlan(plan);
  },

  async calculateSubscriptionPrice(params: {
    state?: string;
    district?: string;
    libraryId?: string;
    libraryName?: string;
    planId?: string;
    couponCode?: string;
    date?: string;
  }): Promise<LibrarySubscriptionPriceCalculation> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.resolveLibrarySubscriptionPrice(params);
  },

  async getPricingRules(district?: string): Promise<LibrarySubscriptionPricingRule[]> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getLibrarySubscriptionPricingRules(district);
  },

  async savePricingRule(
    rule: LibrarySubscriptionPricingRule,
    role?: string,
    district?: string
  ): Promise<LibrarySubscriptionPricingRule> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.saveLibrarySubscriptionPricingRule(rule, role, district);
  },

  async deletePricingRule(
    ruleId: string,
    role?: string,
    district?: string
  ): Promise<boolean> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.deleteLibrarySubscriptionPricingRule(ruleId, role, district);
  },

  async createOrActivateSubscription(data: Partial<LibrarySubscription>): Promise<LibrarySubscription> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.createLibrarySubscription(data);
  },

  async createSubscription(data: Partial<LibrarySubscription>): Promise<LibrarySubscription> {
    return this.createOrActivateSubscription(data);
  },

  async getAllSubscriptions(filters?: {
    district?: string;
    state?: string;
    status?: string;
    planId?: string;
    search?: string;
  }): Promise<LibrarySubscription[]> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getLibrarySubscriptions(filters);
  },

  async getSubscriptionById(id: string): Promise<LibrarySubscription | undefined> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getLibrarySubscriptionById(id);
  },

  async getSubscriptionByLibraryId(libraryId: string): Promise<LibrarySubscription | undefined> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getLibrarySubscriptionByLibraryId(libraryId);
  },

  async requestCancellation(
    subscriptionId: string,
    reason: string,
    reasonCategory: string
  ): Promise<{
    success: boolean;
    error?: string;
    cancellationRequest?: LibrarySubscriptionCancellationRequest;
    refundAmount?: number;
  }> {
    await new Promise(r => setTimeout(r, 120));
    return mockStore.requestSubscriptionCancellation(subscriptionId, reason, reasonCategory);
  },

  async renewSubscription(
    subscriptionId: string,
    newPlanId?: string,
    paymentDetails?: Partial<LibrarySubscriptionPaymentRecord>
  ): Promise<LibrarySubscription> {
    await new Promise(r => setTimeout(r, 120));
    return mockStore.renewLibrarySubscription(subscriptionId, newPlanId, paymentDetails);
  },

  async toggleAutoRenew(subscriptionId: string, enabled: boolean): Promise<boolean> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.toggleSubscriptionAutoRenew(subscriptionId, enabled);
  },

  async recordPayment(
    paymentData: Partial<LibrarySubscriptionPaymentRecord>
  ): Promise<LibrarySubscriptionPaymentRecord> {
    await new Promise(r => setTimeout(r, 100));
    return mockStore.recordLibrarySubscriptionPayment(paymentData as any);
  },

  async getPayments(district?: string): Promise<LibrarySubscriptionPaymentRecord[]> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getLibrarySubscriptionPayments(district);
  },

  async getCancellationRequests(): Promise<LibrarySubscriptionCancellationRequest[]> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getLibrarySubscriptionCancellationRequests();
  },

  async getAnalytics(district?: string): Promise<LibrarySubscriptionAnalytics> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getLibrarySubscriptionAnalytics(district);
  },

  async validateCoupon(code: string, price: number): Promise<{
    valid: boolean;
    discount: number;
    finalPrice: number;
    message?: string;
  }> {
    await new Promise(r => setTimeout(r, 60));
    const clean = code.trim().toUpperCase();
    if (price <= 0) {
      return { valid: false, discount: 0, finalPrice: 0, message: 'Subscription is already complimentary free.' };
    }

    if (clean === 'LIBRARY50' || clean === 'FP50') {
      const discount = Math.min(price, 50);
      return { valid: true, discount, finalPrice: price - discount, message: '₹50 flat discount applied successfully!' };
    }
    if (clean === 'LIBRARY100' || clean === 'LIB100') {
      const discount = Math.min(price, 100);
      return { valid: true, discount, finalPrice: price - discount, message: '₹100 flat discount applied successfully!' };
    }
    if (clean === 'FESTIVE20' || clean === 'LIB20') {
      const discount = Math.round(price * 0.20);
      return { valid: true, discount, finalPrice: price - discount, message: '20% festive special discount applied!' };
    }
    if (clean === 'WELCOMEFREE' || clean === 'LIBFREE') {
      return { valid: true, discount: price, finalPrice: 0, message: '100% complimentary free listing coupon applied!' };
    }

    return { valid: false, discount: 0, finalPrice: price, message: 'Invalid or expired coupon code.' };
  }
};
