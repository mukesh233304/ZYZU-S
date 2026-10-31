// FOCUSPOINT Commission & Offer Policy Types

export type ServiceType = 'LIBRARY' | 'TUITION';
export type TargetScope = 'DISTRICT' | 'LIBRARY' | 'TUITION';
export type CommissionType = 'PERCENTAGE' | 'FIXED';
export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type PolicyStatus = 'ACTIVE' | 'INACTIVE';
export type OfferStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export type OfferCategory = 
  | 'GENERAL' 
  | 'FIRST_BOOKING' 
  | 'NEW_STUDENT' 
  | 'RENEWAL' 
  | 'MEMBERSHIP' 
  | 'TUITION_PACKAGE' 
  | 'LIMITED_TIME' 
  | 'REFERRAL' 
  | 'FESTIVAL' 
  | 'PROMOTIONAL';

export interface CommissionPolicy {
  id: string;
  districtId?: string;
  districtName: string;
  serviceType: ServiceType;
  targetType: TargetScope;
  targetId?: string; // Specific libraryId or teacherId (undefined for district common)
  targetName?: string;
  commissionType: CommissionType;
  commissionValue: number; // e.g. 10 for 10%, or 150 for ₹150 fixed
  startDate: string;
  endDate?: string;
  status: PolicyStatus;
  isCustomOverride: boolean;
  notes?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  districtId?: string;
  districtName: string;
  serviceType: ServiceType;
  targetType: TargetScope;
  targetId?: string; // Specific libraryId or teacherId (undefined for district common)
  targetName?: string;
  title: string;
  code?: string; // Coupon / Promo Code (e.g. GZPSTUDY20)
  description?: string;
  discountType: DiscountType;
  discountValue: number; // e.g. 20 for 20%, or 200 for ₹200
  maxDiscount?: number; // Capped max discount for percentage offers
  minimumAmount: number; // Minimum transaction value required to trigger offer
  minSpend?: number; // Alias for minimumAmount
  offerCategory: OfferCategory;
  startDate: string;
  endDate?: string;
  usageLimit: number; // 0 = unlimited
  usageCount: number;
  perUserLimit: number;
  allowStacking: boolean;
  status: OfferStatus;
  termsConditions?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyAuditLog {
  id: string;
  type: 'COMMISSION' | 'OFFER';
  policyId?: string;
  offerId?: string;
  districtName: string;
  action: 'CREATE' | 'UPDATE' | 'STATUS_CHANGE' | 'DELETE_OVERRIDE' | 'RESET_COMMON';
  previousValue: string;
  newValue: string;
  performedBy: string;
  affectedEntity: string;
  reason?: string;
  timestamp: string;
}

export interface TransactionBreakdown {
  grossAmount: number;
  originalAmount?: number; // Convenience alias
  appliedOffer?: {
    id: string;
    title: string;
    code?: string;
    discountType: DiscountType;
    discountValue: number;
    discountAmount: number;
  };
  discountAmount: number;
  payableAmount: number; // Gross - Discount
  commissionRate: number;
  commissionType: CommissionType;
  commissionAmount: number;
  netSettlementAmount: number; // Payable - Commission
  providerAmount?: number; // Convenience alias
  policySource: 'CUSTOM_OVERRIDE' | 'DISTRICT_COMMON' | 'SUPER_ADMIN_DEFAULT';
  policyDetails: string;
}

export interface PolicyAnalyticsSummary {
  districtName: string;
  totalCommissionEstThisMonth: number;
  libraryCommissionEst: number;
  tuitionCommissionEst: number;
  averageCommissionRate: number;
  customOverridesCount: number;
  commonPoliciesCount: number;
  activeOffersCount: number;
  expiredOffersCount: number;
  totalRedemptions: number;
  totalDiscountDisbursed: number;
  topOfferTitle: string;
}
