// FOCUSPOINT Finance OS — Data Contracts & TypeScript Interfaces

export type ExpenseClaimStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'DOCUMENT_REQUIRED'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'REJECTED'
  | 'PAYMENT_QUEUED'
  | 'PAYMENT_PROCESSING'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'REVERSED'
  | 'CLOSED';

export type FinanceExpenseCategory =
  | 'Office Expenses'
  | 'Rent'
  | 'Electricity'
  | 'Internet'
  | 'Marketing'
  | 'Transportation'
  | 'Equipment'
  | 'Maintenance'
  | 'Stationery'
  | 'Software'
  | 'Salaries'
  | 'Travel'
  | 'Event Expenses'
  | 'Vendor Payments'
  | 'Infrastructure'
  | 'Miscellaneous';

export type DistrictExpenseCategory = FinanceExpenseCategory;
export type ExpenseCategory = FinanceExpenseCategory;

export interface ExpenseAttachment {
  id: string;
  name: string;
  url: string;
  fileType: 'application/pdf' | 'image/jpeg' | 'image/jpg' | 'image/png' | string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface ExpenseTimelineEvent {
  id: string;
  timestamp: string;
  status: ExpenseClaimStatus;
  actorName: string;
  actorRole: string;
  note?: string;
  amountSnapshot?: number;
}

export interface DistrictExpenseClaim {
  id: string;
  district: string;
  state: string;
  category: FinanceExpenseCategory | string;
  subCategory?: string;
  description: string;
  purpose: string;
  
  // Dual-Amount Verification Model
  claimedAmount: number;
  approvedAmount?: number;
  payableAmount?: number;
  alreadyPaidAmount: number;
  remainingAmount: number;

  expenseDate: string;
  vendorName: string;
  paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'NEFT_RTGS' | 'CASH';
  referenceNumber?: string;
  billNumber: string;
  billDate: string;
  notes?: string;
  internalRemarks?: string;
  rejectionReason?: string;
  correctionRequestedNotes?: string;

  supportingDocuments: ExpenseAttachment[];
  bankDetails?: {
    accountHolderName: string;
    bankName: string;
    accountNumberMasked: string;
    ifscCode: string;
    upiId?: string;
    verified: boolean;
  };

  status: ExpenseClaimStatus;
  submittedByAdminId: string;
  submittedByAdminName: string;
  approvedBySuperAdminId?: string;
  approvedBySuperAdminName?: string;
  approvedAt?: string;

  // Payment Execution Metadata
  paymentQueueId?: string;
  paymentId?: string;
  transactionId?: string;
  paidAt?: string;
  receiptNumber?: string; // e.g. FP-EXP-2026-09-000092
  paymentFailureReason?: string;

  timeline: ExpenseTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export type TeacherPayrollStatus =
  | 'PAYROLL_GENERATED'
  | 'READY_FOR_PAYMENT'
  | 'PAYMENT_QUEUED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'RETRY_REQUIRED'
  | 'REVERSED';

export interface TeacherPayrollItem {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  teacherPhone?: string;
  teacherPhoto?: string;
  district: string;
  state: string;
  billingMonth: string; // e.g. '2026-09' or 'September 2026'

  // Transparent Calculation Activity Inputs
  assignedStudentsCount: number;
  completedSessionsCount: number;
  approvedSessionsCount: number;
  grossTuitionCollection: number;
  teacherEarnings: number;
  focusPointCommission: number;
  bonus: number;
  deductions: number;
  adjustments: number;
  previousBalance?: number;
  netPayable: number;
  paidAmount: number;

  bankDetails?: {
    accountHolderName: string;
    bankName: string;
    accountNumberMasked: string;
    ifscCode: string;
    verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  };

  status: TeacherPayrollStatus;
  paymentId?: string;
  transactionRef?: string;
  paidAt?: string;
  salarySlipNumber?: string; // e.g. FP-SAL-2026-09-000145
  failureReason?: string;
  authorizedBy?: string;
  queryRaised?: {
    raisedAt: string;
    queryText: string;
    status: 'OPEN' | 'RESOLVED';
    resolution?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type LibrarySettlementStatus =
  | 'CALCULATED'
  | 'READY_FOR_SETTLEMENT'
  | 'QUEUED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'RETRY_REQUIRED'
  | 'REVERSED';

export interface LibrarySettlementLineItem {
  bookingId: string;
  studentName: string;
  studentPhoneMasked?: string;
  seatNumber: string;
  shiftName: string;
  bookingDate: string;
  grossAmount: number;
  discount: number;
  taxCharges: number;
  commissionRate: number;
  commissionAmount: number;
  refundAdjustment: number;
  netPayable: number;
}

export interface LibrarySettlementRecord {
  id: string;
  libraryId: string;
  libraryName: string;
  ownerId: string;
  ownerName: string;
  district: string;
  state: string;
  settlementPeriod: string; // e.g. 'September 2026'

  lineItems: LibrarySettlementLineItem[];
  totalBookingsCount: number;
  grossBookingAmount: number;
  totalDiscounts: number;
  platformCommission: number;
  adjustments: number;
  netPayable: number;
  paidAmount: number;

  bankDetails?: {
    accountHolderName: string;
    bankName: string;
    accountNumberMasked: string;
    ifscCode: string;
    verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  };

  status: LibrarySettlementStatus;
  paymentId?: string;
  transactionRef?: string;
  utr?: string;
  paidAt?: string;
  receiptNumber?: string; // e.g. FP-LIB-2026-09-000278
  failureReason?: string;
  authorizedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type PayeeType = 'DISTRICT_ADMIN' | 'TEACHER' | 'LIBRARY_OWNER';
export type PaymentItemType = 'EXPENDITURE' | 'SALARY' | 'SETTLEMENT';

export interface PaymentQueueItem {
  id: string;
  payeeId: string;
  payeeName: string;
  payeeType: PayeeType;
  paymentType: PaymentItemType;
  district: string;
  state: string;
  amount: number;
  claimedOrGrossAmount: number;
  sourceReferenceId: string; // expenseClaimId | payrollItemId | librarySettlementId
  referenceCode: string; // billNo or invoiceNo or bookingRef
  description: string;
  paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'NEFT_RTGS' | 'IMPS';
  bankAccountMasked: string;
  ifscCode: string;
  bankVerified: boolean;
  status: 'QUEUED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'RETRY_READY';
  failureReason?: string;
  batchId?: string;
  scheduledDate?: string;
  transactionId?: string;
  paidAt?: string;
  officialDocumentNumber?: string;
  idempotencyKey: string;
  createdAt: string;
}

export interface SettlementBatch {
  id: string; // e.g. FP-SET-2026-09-000124
  batchDate: string;
  initiatedBy: string;
  initiatedByName: string;
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  reversedPayments: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIALLY_FAILED' | 'FAILED';
  itemIds: string[];
  createdAt: string;
}

export interface MonthlyClosingRecord {
  id: string; // e.g. FP-CLOSE-2026-09-GHAZIPUR
  month: string;
  year: number;
  state: string;
  district: string;
  totalTuitionCollections: number;
  teacherPayouts: number;
  libraryCollections: number;
  librarySettlements: number;
  districtExpenditure: number;
  focusPointCommission: number;
  refunds: number;
  adjustments: number;
  netPlatformRevenue: number;
  pendingLiabilities: number;
  failedPaymentsCount: number;
  outstandingPayablesCount: number;
  isClosed: boolean;
  closedAt?: string;
  closedBy?: string;
  closedByName?: string;
  snapshotHash?: string;
}

export interface FinancialAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  entityType: 'DISTRICT_EXPENSE' | 'TEACHER_PAYROLL' | 'LIBRARY_SETTLEMENT' | 'PAYMENT_QUEUE' | 'SETTLEMENT_BATCH' | 'MONTHLY_CLOSING' | 'COMMISSION_POLICY';
  entityId: string;
  previousValue?: any;
  newValue?: any;
  details: string;
  ipAddress?: string;
  district?: string;
}

export interface FinanceSettingsConfig {
  approvalTiers: {
    standardLimit: number; // e.g. up to 10,000 auto-verified or standard
    mediumLimit: number;   // e.g. 10,001 - 50,000 additional verification
    highValueLimit: number; // e.g. > 50,000 dual super-admin review
  };
  categories: {
    id: string;
    name: FinanceExpenseCategory | string;
    subCategories: string[];
    isActive: boolean;
    monthlyBudgetAlert?: number;
  }[];
  autoSettlementSchedule: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'MANUAL';
  settlementDayOfMonth: number; // e.g. 1st or 5th
}

export interface OfficialDocument {
  documentId: string; // FP-SAL-..., FP-EXP-..., FP-LIB-...
  documentType: 'SALARY_SLIP' | 'EXPENSE_RECEIPT' | 'SETTLEMENT_RECEIPT';
  title: string;
  recipientName: string;
  recipientId: string;
  recipientRole: string;
  district: string;
  state: string;
  date: string;
  billingPeriod?: string;
  amount: number;
  status: 'PAID';
  paymentId: string;
  transactionRef: string;
  paymentMethod: string;
  bankAccountMasked?: string;
  authorizedBy: string;
  qrVerificationUrl: string;
  breakdown: {
    label: string;
    amount: number;
    isDeduction?: boolean;
    isHighlight?: boolean;
  }[];
  metadata: Record<string, any>;
  issuedAt: string;
}
