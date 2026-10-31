// FOCUSPOINT Teacher Registration Pricing & Payment-Gated Onboarding Types

export type TeacherRegistrationScopeType = 'PAN_INDIA' | 'STATE' | 'DISTRICT' | 'PARTICULAR';

export type TeacherRegistrationRuleStatus = 'ACTIVE' | 'SCHEDULED' | 'PAUSED' | 'DISABLED' | 'EXPIRED';

export interface TeacherRegistrationPricingRule {
  id: string;
  service: 'TEACHER_REGISTRATION';
  scope: TeacherRegistrationScopeType;
  state?: string;
  district?: string;
  teacherId?: string;
  teacherEmail?: string;
  teacherMobile?: string;
  teacherName?: string;
  price: number; // 0 for FREE
  isFree: boolean;
  effectiveFrom: string; // YYYY-MM-DD
  effectiveUntil?: string; // YYYY-MM-DD (optional)
  status: TeacherRegistrationRuleStatus;
  createdAt: string;
  createdByRole: 'SUPER_ADMIN' | 'DISTRICT_ADMIN';
  createdByName: string;
  updatedAt: string;
  updatedByName?: string;
  reason?: string;
}

export interface TeacherRegistrationPricingHistory {
  id: string;
  ruleId: string;
  scope: TeacherRegistrationScopeType;
  state?: string;
  district?: string;
  teacherName?: string;
  teacherIdentifier?: string;
  previousFee: number;
  newFee: number;
  effectiveDate: string;
  expiryDate?: string;
  changedBy: string;
  changedByRole: string;
  reason: string;
  status: string;
  timestamp: string;
}

export interface TeacherRegistrationHierarchyBreakdown {
  particularTeacher?: {
    fee: number;
    ruleId: string;
    teacherName?: string;
    active: boolean;
  } | null;
  districtDefault?: {
    fee: number;
    ruleId: string;
    district: string;
    active: boolean;
  } | null;
  stateDefault?: {
    fee: number;
    ruleId: string;
    state: string;
    active: boolean;
  } | null;
  panIndiaDefault?: {
    fee: number;
    ruleId: string;
    active: boolean;
  } | null;
  fallbackDefault?: {
    fee: number;
    policy: string;
  };
}

export interface TeacherRegistrationPriceCalculation {
  applicableFee: number;
  isFree: boolean;
  paymentRequired: boolean;
  pricingRuleId?: string | null;
  pricingScope: TeacherRegistrationScopeType | 'DEFAULT_FREE' | 'UNCONFIGURED';
  ruleName: string;
  effectivePeriod: {
    from: string;
    until?: string;
  };
  currency: string;
  status: string;
  hierarchyBreakdown: TeacherRegistrationHierarchyBreakdown;
  offerDiscount?: number;
  offerName?: string;
  offerId?: string;
  couponDiscount?: number;
  couponCode?: string;
  finalPayableFee: number;
}

export interface TeacherRegistrationPaymentRecord {
  id: string; // tr-pay-...
  registrationId: string;
  teacherId?: string;
  teacherName: string;
  teacherEmail: string;
  teacherMobile: string;
  state: string;
  district: string;
  originalFee: number;
  offerDiscount: number;
  couponDiscount: number;
  finalAmount: number;
  currency: string;
  pricingRuleId?: string;
  pricingScope: string;
  paymentId?: string;
  paymentMethod?: string;
  paymentStatus: 'PAID' | 'PAYMENT_PENDING' | 'PAYMENT_FAILED' | 'FREE' | 'REFUNDED';
  registrationStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  confirmedAt?: string;
  refundedAt?: string;
  refundReason?: string;
}

export interface TeacherRegistrationAnalytics {
  totalRegistrations: number;
  paidRegistrations: number;
  freeRegistrations: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  grossRegistrationRevenue: number;
  discounts: number;
  couponUsageCount: number;
  couponDiscounts: number;
  netRegistrationRevenue: number;
}
