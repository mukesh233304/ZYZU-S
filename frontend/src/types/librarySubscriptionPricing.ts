export type LibrarySubscriptionBillingCycle = 
  | 'MONTHLY' 
  | 'QUARTERLY' 
  | 'HALF_YEARLY' 
  | 'YEARLY' 
  | 'CUSTOM';

export type LibrarySubscriptionStatus =
  | 'DRAFT'
  | 'PAYMENT_REQUIRED'
  | 'PAYMENT_PENDING'
  | 'ACTIVE'
  | 'TRIAL'
  | 'GRACE_PERIOD'
  | 'CANCEL_REQUESTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'PAUSED'
  | 'SUSPENDED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'FAILED';

export type LibrarySubscriptionRefundPolicy = 
  | 'FULL_24H' 
  | 'FULL_MINUS_GATEWAY_FEE' 
  | 'PARTIAL_50' 
  | 'NO_REFUND';

export type LibrarySubscriptionPriceProtection = 
  | 'NONE' 
  | 'LOCKED' 
  | 'PROMOTIONAL';

export interface LibrarySubscriptionPlan {
  id: string;
  name: string;
  billingCycle: LibrarySubscriptionBillingCycle;
  durationMonths: number;
  durationDays: number;
  basePrice: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  isPopular?: boolean;
  savingsPercent?: number;
  features: string[];
  limits?: {
    maxDesks?: number;
    maxShifts?: number;
    featuredListing?: boolean;
  };
  effectiveFrom: string;
  effectiveUntil?: string;
}

export interface LibrarySubscriptionPricingRule {
  id: string;
  name: string;
  scope: 'PAN_INDIA' | 'STATE' | 'DISTRICT' | 'PARTICULAR';
  planId: string; // specific planId or 'ALL'
  state?: string;
  district?: string;
  libraryId?: string;
  libraryName?: string;
  price: number; // ₹0 for free or specific price
  currency: string; // 'INR'
  status: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'ARCHIVED';
  effectiveFrom: string;
  effectiveUntil?: string;
  priceProtection: LibrarySubscriptionPriceProtection;
  lockedCycles?: number;
  refundPolicy: LibrarySubscriptionRefundPolicy;
  gracePeriodDays: number;
  updatedAt: string;
  updatedBy: string;
}

export interface LibrarySubscription {
  id: string;
  libraryId: string;
  libraryName: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerMobile: string;
  state: string;
  district: string;
  planId: string;
  planName: string;
  billingCycle: LibrarySubscriptionBillingCycle;
  basePrice: number;
  pricingRuleId?: string;
  pricingScope: 'PAN_INDIA' | 'STATE' | 'DISTRICT' | 'PARTICULAR' | 'DEFAULT_FREE';
  offerDiscount: number;
  offerId?: string;
  offerName?: string;
  couponDiscount: number;
  couponCode?: string;
  finalPaidAmount: number;
  isFree: boolean;
  status: LibrarySubscriptionStatus;
  paymentId?: string;
  paymentMethod?: 'UPI_QR' | 'ONLINE_GATEWAY' | 'NETBANKING' | 'CASH_CHALLAN';
  startDate: string;
  expiryDate: string;
  renewalDate: string;
  activatedAt: string;
  autoRenew: boolean;
  cancellationDeadline: string; // ISO string calculated as activatedAt + 24 hours
  cancelledAt?: string;
  cancellationReason?: string;
  cancellationReasonCategory?: string;
  refundAmount?: number;
  refundStatus?: 'NONE' | 'PENDING' | 'PROCESSED' | 'REJECTED';
  refundReference?: string;
  priceProtection: LibrarySubscriptionPriceProtection;
  lockedPrice?: number;
  invoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LibrarySubscriptionPaymentRecord {
  id: string;
  subscriptionId: string;
  libraryId: string;
  libraryName: string;
  ownerName: string;
  ownerEmail: string;
  ownerMobile: string;
  state: string;
  district: string;
  planId: string;
  planName: string;
  billingCycle: string;
  originalFee: number;
  offerDiscount: number;
  couponDiscount: number;
  couponCode?: string;
  finalAmount: number;
  currency: string;
  paymentId: string;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PAYMENT_FAILED' | 'PENDING' | 'REFUNDED';
  subscriptionStatus: LibrarySubscriptionStatus;
  idempotencyKey?: string;
  invoiceNumber: string;
  createdAt: string;
  confirmedAt?: string;
  refundedAt?: string;
  refundAmount?: number;
}

export interface LibrarySubscriptionCancellationRequest {
  id: string;
  subscriptionId: string;
  libraryId: string;
  libraryName: string;
  ownerName: string;
  planName: string;
  paidAmount: number;
  activationTimestamp: string;
  requestTimestamp: string;
  isWithin24Hours: boolean;
  reason: string;
  reasonCategory: string;
  refundPolicy: LibrarySubscriptionRefundPolicy;
  calculatedRefundAmount: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PROCESSED' | 'REJECTED';
  processedBy?: string;
  processedAt?: string;
  refundTxnId?: string;
  adminNotes?: string;
}

export interface LibrarySubscriptionPriceCalculation {
  basePrice: number;
  applicablePrice: number;
  pricingRuleId: string | null;
  pricingScope: 'PARTICULAR' | 'DISTRICT' | 'STATE' | 'PAN_INDIA' | 'DEFAULT_FREE';
  ruleName: string;
  offerDiscount: number;
  offerName?: string;
  couponDiscount: number;
  couponCode?: string;
  finalPayableAmount: number;
  paymentRequired: boolean;
  isFree: boolean;
  selectedPlan: LibrarySubscriptionPlan;
  hierarchyBreakdown: {
    particularLibrary: { fee: number; ruleId: string; libraryName: string; active: boolean } | null;
    districtDefault: { fee: number; ruleId: string; district: string; active: boolean } | null;
    stateDefault: { fee: number; ruleId: string; state: string; active: boolean } | null;
    panIndiaDefault: { fee: number; ruleId: string; active: boolean } | null;
    fallbackDefault: { fee: number; policy: string };
  };
}

export interface LibrarySubscriptionAnalytics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  freeListings: number;
  paidListings: number;
  expiringSoon: number;
  gracePeriodCount: number;
  cancelledCount: number;
  totalGmv: number;
  totalNetRevenue: number;
  totalRefunded: number;
  planDistribution: { [planName: string]: number };
}
