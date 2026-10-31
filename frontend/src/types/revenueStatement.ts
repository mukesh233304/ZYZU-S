// FOCUSPOINT — Central Revenue Statement & P&L Intelligence Type Definitions
// Authoritative Pan-India Financial Models, Transaction Classification & Reconciled P&L

import { ExpenseBreakdownItem } from './superAdmin';

export type RevenueSourceCategory = 
  | 'LIBRARY_OWNER_SUBSCRIPTION'
  | 'TEACHER_REGISTRATION'
  | 'TEACHER_SUBSCRIPTION'
  | 'STUDY_MATERIAL'
  | 'MOCK_TEST'
  | 'LIBRARY_STUDENT'
  | 'HOME_TUITION'
  | 'HOMEPAGE_ADVERTISEMENT'
  | 'OFFER_CONSOLE';

export type RevenueTransactionStatus = 
  | 'COMPLETED'
  | 'PROCESSING'
  | 'PENDING'
  | 'FAILED'
  | 'REFUNDED';

export type RevenueSettlementStatus = 
  | 'SETTLED'
  | 'PENDING'
  | 'HELD'
  | 'DISBURSED';

export type BuyerRoleType = 
  | 'STUDENT'
  | 'TEACHER'
  | 'LIBRARY_OWNER'
  | 'ADVERTISER'
  | 'PARENT'
  | 'INSTITUTION'
  | 'DISTRICT_ADMIN';

export type RevenueViewTab = 
  | 'PANORAMA'
  | 'LIBRARY_OWNER_SUB'
  | 'TEACHER_REG_SUB'
  | 'STUDY_MATERIALS'
  | 'MOCK_TESTS'
  | 'LIBRARY_STUDENTS'
  | 'HOME_TUITION'
  | 'ADVERTISEMENTS'
  | 'OFFER_ATTRIBUTION'
  | 'PNL_STATEMENT'
  | 'REPORT_CENTER';

export type FinancialReportType = 
  | 'REVENUE_STATEMENT'
  | 'SOURCE_WISE_REVENUE'
  | 'LIBRARY_OWNER_SUBSCRIPTION'
  | 'TEACHER_REGISTRATION_SUBSCRIPTION'
  | 'STUDY_MATERIAL_SALES'
  | 'MOCK_TEST_SALES'
  | 'LIBRARY_STUDENT_FEE'
  | 'HOME_TUITION_COMMISSION'
  | 'HOMEPAGE_AD_REVENUE'
  | 'OFFER_COUPON_ATTRIBUTION'
  | 'STATE_WISE_REVENUE'
  | 'DISTRICT_WISE_REVENUE'
  | 'REFUNDS_REVERSALS'
  | 'MONTHLY_SUMMARY'
  | 'PROFIT_LOSS_STATEMENT';

export const ALL_FINANCIAL_REPORT_TYPES: FinancialReportType[] = [
  'REVENUE_STATEMENT',
  'SOURCE_WISE_REVENUE',
  'LIBRARY_OWNER_SUBSCRIPTION',
  'TEACHER_REGISTRATION_SUBSCRIPTION',
  'STUDY_MATERIAL_SALES',
  'MOCK_TEST_SALES',
  'LIBRARY_STUDENT_FEE',
  'HOME_TUITION_COMMISSION',
  'HOMEPAGE_AD_REVENUE',
  'OFFER_COUPON_ATTRIBUTION',
  'STATE_WISE_REVENUE',
  'DISTRICT_WISE_REVENUE',
  'REFUNDS_REVERSALS',
  'MONTHLY_SUMMARY',
  'PROFIT_LOSS_STATEMENT'
];

export interface UnifiedRevenueLedgerRecord {
  id: string;
  transactionId: string;
  orderId?: string;
  bookingId?: string;
  subscriptionId?: string;
  campaignId?: string;
  invoiceId?: string;
  date: string; // ISO or YYYY-MM-DD HH:mm:ss
  accountingDate?: string;
  
  // Payer / Buyer Demographics
  studentName: string; // Backward compatibility for existing table
  buyerId?: string;
  buyerName: string;
  buyerRole: BuyerRoleType;
  payerId?: string;
  userRole?: string;
  
  // Revenue Source Classification
  revenueSource: RevenueSourceCategory;
  serviceType: 'HOME_TUITION' | 'SELF_STUDY_LIBRARY' | 'MOCK_TEST' | 'STUDY_MATERIAL' | string;
  revenueSubcategory: string;
  serviceTitle: string;
  productOrServiceId?: string;
  productName: string;
  
  // Financial Amounts
  grossAmount: number; // GMV / Original Transaction Value
  discountAmount: number;
  couponCode?: string;
  taxAmount: number; // GST/Taxes where applicable
  collectedAmount: number; // Actual successful cash collection
  amountCollected?: number; // Ergonomic alias for collectedAmount
  partnerName?: string; // Associated partner/library/advertiser/faculty
  refundAmount: number; // Confirmed refund or reversal
  platformFee: number; // FocusPoint's earned commission / revenue
  partnerPayout: number; // Educator/Library/Partner payable
  recognizedRevenue: number; // Net earned revenue recognized
  
  // Status & Payment Method
  paymentMethod: 'UPI' | 'NET_BANKING' | 'CARD' | 'MANUAL_CASH' | 'IMPS';
  status: RevenueTransactionStatus;
  refundStatus?: 'NONE' | 'REQUESTED' | 'PROCESSED' | 'REJECTED';
  settlementStatus?: RevenueSettlementStatus;
  
  // Geographic Attribution
  stateName: string;
  districtName: string;
  localityName?: string;
  areaName?: string;
  currency: 'INR';
  
  // Source References & Audit
  invoiceUrl?: string;
  sourceReference?: string;
  auditMetadata?: {
    verifiedBy?: string;
    verifiedAt?: string;
    hash?: string;
    escrowStatus?: string;
    notes?: string;
  };

  // Specific Domain Attributes
  libraryDetails?: {
    libraryId: string;
    libraryName: string;
    ownerName: string;
    subscriptionPlan: string;
    billingCycle: string;
    startDate: string;
    expiryDate: string;
    seatNumber?: string;
    shiftType?: 'single_shift' | 'double_shift' | 'full_day';
  };

  teacherDetails?: {
    teacherId: string;
    teacherName: string;
    feeType: 'ONE_TIME_REGISTRATION' | 'RECURRING_SUBSCRIPTION';
    tuitionPlan?: string;
    classSubject?: string;
    billingPeriod?: string;
    commissionRate?: number; // e.g. 10%
    isDirectTeacherPayment?: boolean;
  };

  studyMaterialDetails?: {
    category: string;
    classGrade?: string;
    subject: string;
    examTarget?: string;
    materialType?: 'PDF_CHAPTER' | 'BUNDLE' | 'SUBSCRIPTION';
  };

  mockTestDetails?: {
    examCategory: string;
    testSeriesId?: string;
    testType: string;
    questionCount?: number;
  };

  advertisementDetails?: {
    advertiserName: string;
    campaignId: string;
    placement: string;
    pricingModel: 'FIXED_CAMPAIGN' | 'MONTHLY_RETAINER' | 'PER_CLICK' | 'PER_IMPRESSION';
    contractedAmount: number;
    invoicedAmount: number;
    outstandingReceivables: number;
    impressions?: number;
    clicks?: number;
  };

  offerDetails?: {
    offerId: string;
    offerName: string;
    couponCode: string;
    fundedBy: 'FOCUSPOINT' | 'PARTNER' | 'SHARED';
    associatedService: string;
  };
}

export interface RevenueSourceMetrics {
  category: RevenueSourceCategory;
  displayName: string;
  transactionCount: number;
  grossVolume: number; // GMV
  discounts: number;
  collectedAmount: number;
  refunds: number;
  platformEarnings: number; // Recognized commission / revenue
  partnerPayouts: number;
  outstandingReceivables: number;
  percentageOfRevenue: number;
  color: string;
  isAvailable: boolean; // Flag to indicate if product/model is currently live
  notes?: string;
}

export interface RevenueFilterParams {
  state?: string;
  district?: string;
  locality?: string;
  datePreset?: 'today' | 'this_week' | 'this_month' | 'prev_month' | 'last_3_months' | 'this_year' | 'custom';
  startDate?: string;
  endDate?: string;
  sourceCategory?: RevenueSourceCategory | 'ALL';
  paymentStatus?: RevenueTransactionStatus | 'ALL';
  buyerRole?: BuyerRoleType | 'ALL';
  searchQuery?: string;
}

export interface CentralFinancialKpis {
  totalGrossRevenue: number; // GMV: eligible successful transactions before deductions
  netRevenue: number; // recognized revenue after refunds, reversals, and adjustments
  subscriptionRevenue: number; // library owner subscriptions
  homeTuitionRevenue: number; // total tuition volume
  homeTuitionCommission: number; // FocusPoint's 10% earned tuition commission
  libraryRevenue: number; // student library booking fees
  libraryCommission: number; // FocusPoint's library commission
  studyMaterialRevenue: number; // paid study materials & bundles
  mockTestRevenue: number; // paid mock tests & test series
  advertisementRevenue: number; // paid homepage and platform campaigns
  offerConsoleRevenue: number; // revenue attributable to offer console campaigns without double-counting
  platformCommission: number; // FocusPoint's total earned commission
  refundsAndReversals: number; // confirmed refunds and reversals
  totalExpenses: number; // actual recorded operating expenses
  profitOrLoss: number; // Net Revenue - Operating Expenses
  
  // Additional Transparency Metrics
  cashCollections: number;
  recognizedRevenue: number;
  outstandingReceivables: number;
  pendingPayments: number;
  failedPaymentsCount: number;
  disbursedToPartners: number;
  activeCampaignCount: number;
  totalTransactions: number;
}

export interface CentralRevenueStatement {
  kpis: CentralFinancialKpis;
  sourceBreakdown: RevenueSourceMetrics[];
  expenseBreakdown: ExpenseBreakdownItem[];
  ledgerRecords: UnifiedRevenueLedgerRecord[];
  pnlDerivation: {
    grossOperatingRevenue: number;
    lessRefundsAndReversals: number;
    lessPartnerDiscounts: number;
    netOperatingRevenue: number;
    lessDirectPlatformExpenses: number;
    operatingProfitEbitda: number;
    profitMarginPercent: number;
    accountingPolicySummary: string;
  };
  auditSummary: {
    tamperSealHash: string;
    reconciledAt: string;
    ledgerEntriesAudited: number;
    unreconciledDiscrepancies: number;
    status: 'VERIFIED_BALANCED' | 'PENDING_RECONCILIATION';
  };
}
