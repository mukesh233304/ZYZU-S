// FOCUSPOINT ADVANCED DOCUMENT, RECEIPT, ID CARD & CREDENTIAL SYSTEM TYPES

export type DocumentCategory =
  | 'PAYMENT'
  | 'IDENTITY'
  | 'SALARY'
  | 'DEMO'
  | 'SUBSCRIPTION'
  | 'BOOKING'
  | 'CERTIFICATE'
  | 'FINANCIAL'
  | 'ADMINISTRATIVE';

export type DocumentStatus =
  | 'GENERATING'
  | 'READY'
  | 'VIEWED'
  | 'DOWNLOADED'
  | 'PRINTED'
  | 'REVOKED'
  | 'EXPIRED'
  | 'REPLACED'
  | 'ARCHIVED';

export type DocumentPaymentStatus =
  | 'PAID'
  | 'FREE'
  | 'PENDING'
  | 'NOT_APPLICABLE';

export type DocumentType =
  // Student Documents
  | 'TUITION_FEE_RECEIPT'
  | 'LIBRARY_SEAT_RECEIPT'
  | 'HOME_TUITION_DEMO_PASS'
  | 'LIBRARY_DEMO_PASS'
  | 'DEMO_FEE_RECEIPT'
  | 'DEMO_FREE_CONFIRMATION'
  | 'STUDENT_ID_CARD'
  | 'QR_ATTENDANCE_PASS'
  | 'STUDENT_QR_ATTENDANCE_PASS'
  | 'TUITION_BOOKING_CONFIRMATION'
  | 'LIBRARY_BOOKING_CONFIRMATION'
  | 'PAYMENT_INVOICE'
  | 'STUDENT_CERTIFICATE'

  // Teacher Documents
  | 'TEACHER_REGISTRATION_INVOICE'
  | 'TEACHER_REGISTRATION_RECEIPT'
  | 'TEACHER_REGISTRATION_FREE_CONFIRMATION'
  | 'TEACHER_ID_CARD'
  | 'TEACHER_VERIFICATION_CERTIFICATE'
  | 'TEACHER_SALARY_SLIP'
  | 'TEACHER_EARNINGS_STATEMENT'
  | 'TEACHER_DEMO_PASS'

  // Library Owner Documents
  | 'LIBRARY_REGISTRATION_INVOICE'
  | 'LIBRARY_REGISTRATION_RECEIPT'
  | 'LIBRARY_REGISTRATION_CONFIRMATION'
  | 'LIBRARY_SUBSCRIPTION_INVOICE'
  | 'LIBRARY_SUBSCRIPTION_RECEIPT'
  | 'LIBRARY_OWNER_ID_CARD'
  | 'LIBRARY_PARTNER_CERTIFICATE'
  | 'LIBRARY_PARTNERSHIP_CERTIFICATE'
  | 'LIBRARY_VERIFIED_PARTNERED_CERTIFICATE'
  | 'LIBRARY_SETTLEMENT_RECEIPT'
  | 'LIBRARY_MONTHLY_SETTLEMENT_STATEMENT'

  // District Admin Documents
  | 'DISTRICT_ADMIN_ID_CARD'
  | 'DISTRICT_APPOINTMENT_LETTER'
  | 'DISTRICT_ADMIN_SALARY_SLIP'
  | 'DISTRICT_ADMIN_SALARY_RECEIPT'
  | 'DISTRICT_EXPENSE_RECEIPT'
  | 'DISTRICT_FINANCIAL_STATEMENT'

  // Super Admin Documents
  | 'SUPER_ADMIN_ID_CARD'
  | 'PLATFORM_FINANCIAL_STATEMENT'
  | 'PLATFORM_AUDIT_REPORT';

export interface DocumentLineItem {
  label: string;
  amount: number;
  isDeduction?: boolean;
  isHighlight?: boolean;
}

export interface DocumentAuditEntry {
  action: 'GENERATED' | 'VIEWED' | 'DOWNLOADED' | 'PRINTED' | 'SHARED' | 'REISSUED' | 'REVOKED' | 'VERIFIED' | 'EXPIRED';
  timestamp: string;
  performedBy: string;
  performedByRole: string;
  details?: string;
  notes?: string;
  ipAddress?: string;
}

export interface UnifiedFocusPointDocument {
  id: string;
  documentNumber: string; // e.g. FP-DOC-2026-000001, FP-SAL-2026-000145, FP-ID-2026-000211, FP-RCP-2026-000782
  title: string;
  category: DocumentCategory;
  documentType: DocumentType;
  
  // Recipient details
  recipientId: string;
  recipientName: string;
  recipientRole: string; // STUDENT, TEACHER, LIBRARY_OWNER, DISTRICT_ADMIN, SUPER_ADMIN
  recipientAvatar?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  
  // Location & Territory
  state: string;
  district: string;
  locality?: string;
  
  // Validity & Dates
  issueDate: string; // YYYY-MM-DD
  validFrom?: string;
  validUntil?: string;
  billingPeriod?: string; // e.g. 'September 2026'
  
  // Statuses
  status: DocumentStatus;
  paymentStatus: DocumentPaymentStatus;
  isFree?: boolean;
  
  // Financial Information (Real resolved values only, never forged)
  amount: number; // Final paid / settled amount (0 if free or identity document)
  finalAmount?: number; // Final payable amount after all concessions
  originalAmount?: number; // Pre-discount base price
  offerDiscount?: number; // General campaign offer discount
  offerName?: string;
  couponCode?: string; // Applied coupon promo code
  couponDiscount?: number; // Discount from validated promo coupon
  otherDiscount?: number; // Scholarship / quota concession
  currency: string;
  paymentMethod?: string;
  paymentId?: string;
  transactionRef?: string;
  transactionId?: string;
  bankAccountMasked?: string;
  
  // Authority & Cryptographic Verification
  authorizedBy: string;
  authorizedRole: string;
  qrVerificationUrl: string;
  qrVerificationHash: string;
  
  // Versioning & Lifecycle
  version: number;
  isCurrent: boolean;
  reissueReason?: string;
  previousDocumentNumber?: string;
  
  // Line items breakdown (for financial & statements)
  lineItems?: DocumentLineItem[];
  breakdown?: any;
  
  // Role-specific and contextual metadata
  metadata: {
    // Coupon & Pricing metadata
    couponCode?: string;
    couponDiscount?: number;
    offerDiscount?: number;
    originalAmount?: number;
    finalAmount?: number;

    // ID Card specific
    qualification?: string;
    teachingSubjects?: string[];
    experienceYears?: number;
    bloodGroup?: string;
    emergencyContact?: string;
    libraryName?: string;
    libraryId?: string;
    shiftName?: string;
    seatNumber?: string;
    verificationStatus?: string;
    
    // Demo specific
    demoId?: string;
    demoType?: 'HOME_TUITION' | 'LIBRARY';
    teacherName?: string;
    teacherId?: string;
    slotTime?: string;
    subject?: string;
    locationAddress?: string;
    
    // Subscription specific
    planName?: string;
    billingCycle?: string;
    autoRenew?: boolean;
    
    // Payroll & Salary specific
    completedSessions?: number;
    assignedStudentsCount?: number;
    attendanceRate?: string;
    
    // Expense specific
    expenseCategory?: string;
    billNumber?: string;
    purpose?: string;

    // Custom properties
    [key: string]: any;
  };
  
  auditTrail: DocumentAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFilterOptions {
  category?: DocumentCategory | 'ALL';
  documentType?: DocumentType | 'ALL';
  status?: DocumentStatus | 'ALL';
  paymentStatus?: DocumentPaymentStatus | 'ALL';
  searchQuery?: string;
  search?: string;
  dateRange?: 'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'CUSTOM';
  startDate?: string;
  endDate?: string;
  state?: string;
  district?: string;
  locality?: string;
  role?: string;
}

export interface DocumentKPISummary {
  totalDocuments: number;
  newDocumentsCount: number;
  paymentReceiptsCount: number;
  identityCredentialsCount: number;
  salaryPayoutsCount: number;
  activeDemoPassesCount: number;
  salaryDocuments?: number;
  idCardCount?: number;
}

export interface DocumentVerificationResult {
  isValid: boolean;
  documentNumber: string;
  title: string;
  category: DocumentCategory;
  documentType: DocumentType;
  recipientName: string;
  recipientRole: string;
  district: string;
  state: string;
  issueDate: string;
  validUntil?: string;
  status: DocumentStatus;
  authenticityStatus?: string;
  paymentStatus: DocumentPaymentStatus;
  authorizedBy: string;
  verifiedAt: string;
  verificationHash: string;
  cryptographicHash?: string;
  tamperEvidenceDetected?: boolean;
  publicNotes?: string;
}
