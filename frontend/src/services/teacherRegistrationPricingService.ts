// FOCUSPOINT Teacher Registration Pricing & Payment Service
// Abstraction layer designed for smooth transition to backend API endpoints

import { mockStore } from '../mock/store';
import { 
  TeacherRegistrationPricingRule, 
  TeacherRegistrationPricingHistory,
  TeacherRegistrationPaymentRecord, 
  TeacherRegistrationPriceCalculation,
  TeacherRegistrationAnalytics,
  TeacherRegistrationRuleStatus
} from '../types/teacherRegistrationPricing';
import { auditService } from './auditService';

export interface RegistrationFeeCalculationParams {
  state?: string;
  district?: string;
  teacherId?: string;
  email?: string;
  mobile?: string;
  couponCode?: string;
  registrationDate?: string;
}

export const teacherRegistrationPricingService = {
  /**
   * Resolves the teacher registration fee according to the 4-tier hierarchy:
   * Particular Teacher -> District -> State -> Pan-India -> Fallback Free
   */
  async calculateRegistrationFee(params: RegistrationFeeCalculationParams): Promise<TeacherRegistrationPriceCalculation> {
    await new Promise(r => setTimeout(r, 60)); // Simulate async network lookup
    return mockStore.resolveTeacherRegistrationFee(params);
  },

  /**
   * Fetches pricing rules, optionally scoped to a district
   */
  async getPricingRules(district?: string): Promise<TeacherRegistrationPricingRule[]> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getTeacherRegistrationPricingRules(district);
  },

  /**
   * Fetches a single pricing rule by ID
   */
  async getPricingRule(id: string): Promise<TeacherRegistrationPricingRule | undefined> {
    return mockStore.getTeacherRegistrationPricingRule(id);
  },

  /**
   * Saves or updates a pricing policy with permission and validation checks
   */
  async savePricingRule(
    ruleData: Partial<TeacherRegistrationPricingRule>,
    actor: { id: string; name: string; role: string; district?: string }
  ): Promise<{ success: boolean; rule?: TeacherRegistrationPricingRule; error?: string }> {
    await new Promise(r => setTimeout(r, 100));

    const result = mockStore.saveTeacherRegistrationPricingRule(ruleData, actor);
    if (result.success && result.rule) {
      await auditService.record({
        actorName: actor.name,
        actorRole: actor.role,
        actorId: actor.id,
        action: ruleData.id ? 'UPDATE_TEACHER_REGISTRATION_PRICING' : 'CREATE_TEACHER_REGISTRATION_PRICING',
        module: 'PRICING_POLICY',
        target: `${result.rule.scope} Teacher Registration Fee: ₹${result.rule.price}`,
        targetId: result.rule.id,
        district: result.rule.district,
        state: result.rule.state,
        newValue: `₹${result.rule.price} (${result.rule.status})`,
        previousValue: ruleData.id ? 'Previous Rule Amount' : 'None',
        status: 'SUCCESS'
      });
    }

    return result;
  },

  /**
   * Updates status of a pricing rule (ACTIVE, PAUSED, SCHEDULED, DISABLED)
   */
  async updateRuleStatus(
    id: string,
    status: TeacherRegistrationRuleStatus,
    actor: { id: string; name: string; role: string },
    reason?: string
  ): Promise<boolean> {
    await new Promise(r => setTimeout(r, 60));
    const ok = mockStore.updateTeacherRegistrationPricingRuleStatus(id, status, actor, reason);
    if (ok) {
      await auditService.record({
        actorName: actor.name,
        actorRole: actor.role,
        actorId: actor.id,
        action: 'UPDATE_PRICING_RULE_STATUS',
        module: 'PRICING_POLICY',
        target: `Pricing Rule ${id}`,
        targetId: id,
        newValue: status,
        previousValue: 'ACTIVE',
        status: 'SUCCESS'
      });
    }
    return ok;
  },

  /**
   * Permanently deletes a pricing rule
   */
  async deletePricingRule(
    id: string,
    actor: { id: string; name: string; role: string }
  ): Promise<boolean> {
    await new Promise(r => setTimeout(r, 60));
    const ok = mockStore.deleteTeacherRegistrationPricingRule(id, actor);
    if (ok) {
      await auditService.record({
        actorName: actor.name,
        actorRole: actor.role,
        actorId: actor.id,
        action: 'DELETE_PRICING_RULE',
        module: 'PRICING_POLICY',
        target: `Pricing Rule ${id}`,
        targetId: id,
        newValue: 'DELETED',
        status: 'SUCCESS'
      });
    }
    return ok;
  },

  /**
   * Retrieves change history for rules
   */
  async getPricingHistory(ruleId?: string): Promise<TeacherRegistrationPricingHistory[]> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getTeacherRegistrationPricingHistory(ruleId);
  },

  /**
   * Validates promotional coupon codes for registration fee discount
   */
  async validateCoupon(code: string): Promise<{ valid: boolean; discountAmount: number; message: string }> {
    await new Promise(r => setTimeout(r, 80));
    const clean = code.trim().toUpperCase();
    if (!clean) {
      return { valid: false, discountAmount: 0, message: 'Please enter a coupon code.' };
    }

    if (clean === 'TEACHER100') {
      return { valid: true, discountAmount: 100, message: 'Coupon TEACHER100 applied! ₹100 Flat discount applied.' };
    }
    if (clean === 'TEACHER50' || clean === 'FP50') {
      return { valid: true, discountAmount: 50, message: 'Coupon applied! ₹50 discount applied.' };
    }
    if (clean === 'FESTIVE20') {
      return { valid: true, discountAmount: 20, message: 'Festive offer coupon applied! 20% discount applied.' };
    }
    if (clean === 'WELCOMEFREE') {
      return { valid: true, discountAmount: 9999, message: 'Welcome voucher applied! Registration fee is 100% waived.' };
    }

    return { valid: false, discountAmount: 0, message: `Coupon "${clean}" is invalid or expired.` };
  },

  /**
   * Records a confirmed or pending teacher registration payment in the ledger
   */
  async recordRegistrationPayment(record: TeacherRegistrationPaymentRecord): Promise<TeacherRegistrationPaymentRecord> {
    await new Promise(r => setTimeout(r, 80));
    const saved = mockStore.recordTeacherRegistrationPayment(record);

    await auditService.record({
      actorName: record.teacherName,
      actorRole: 'TEACHER',
      actorId: record.teacherId,
      action: record.paymentStatus === 'PAID' ? 'TEACHER_REGISTRATION_PAYMENT_SUCCESS' : 'TEACHER_REGISTRATION_PAYMENT_INITIATED',
      module: 'PAYMENT_LEDGER',
      target: `Teacher Registration Payment ${record.registrationId}`,
      targetId: record.id,
      district: record.district,
      state: record.state,
      newValue: `₹${record.finalAmount} (${record.paymentStatus})`,
      status: 'SUCCESS'
    });

    return saved;
  },

  /**
   * Retrieves registration payments ledger
   */
  async getRegistrationPayments(district?: string): Promise<TeacherRegistrationPaymentRecord[]> {
    await new Promise(r => setTimeout(r, 60));
    return mockStore.getTeacherRegistrationPayments(district);
  },

  /**
   * Computes registration revenue & conversion analytics
   */
  async getRegistrationAnalytics(district?: string): Promise<TeacherRegistrationAnalytics> {
    await new Promise(r => setTimeout(r, 50));
    return mockStore.getTeacherRegistrationAnalytics(district);
  }
};
