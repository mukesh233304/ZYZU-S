// FOCUSPOINT Finance OS — Initial Mock Seed Data
import {
  DistrictExpenseClaim,
  TeacherPayrollItem,
  LibrarySettlementRecord,
  PaymentQueueItem,
  SettlementBatch,
  MonthlyClosingRecord,
  FinancialAuditLog,
  FinanceSettingsConfig,
  OfficialDocument
} from '../../types/finance';

export const INITIAL_FINANCE_SETTINGS: FinanceSettingsConfig = {
  approvalTiers: {
    standardLimit: 10000,
    mediumLimit: 50000,
    highValueLimit: 100000
  },
  categories: [
    { id: 'cat-1', name: 'Office Expenses', subCategories: ['Stationery', 'Pantry', 'Printing'], isActive: true, monthlyBudgetAlert: 20000 },
    { id: 'cat-2', name: 'Rent', subCategories: ['Office Premises', 'Storage'], isActive: true, monthlyBudgetAlert: 50000 },
    { id: 'cat-3', name: 'Electricity', subCategories: ['Main Power', 'Generator Fuel'], isActive: true, monthlyBudgetAlert: 15000 },
    { id: 'cat-4', name: 'Internet', subCategories: ['Broadband Fiber', 'Dongles'], isActive: true, monthlyBudgetAlert: 8000 },
    { id: 'cat-5', name: 'Marketing', subCategories: ['Flyers', 'Banners', 'Digital Ads'], isActive: true, monthlyBudgetAlert: 40000 },
    { id: 'cat-6', name: 'Transportation', subCategories: ['Fuel', 'Cab Allowance'], isActive: true, monthlyBudgetAlert: 15000 },
    { id: 'cat-7', name: 'Equipment', subCategories: ['Desks', 'Biometric Scanners', 'Printers'], isActive: true, monthlyBudgetAlert: 35000 },
    { id: 'cat-8', name: 'Maintenance', subCategories: ['AC Repair', 'Electrical Works'], isActive: true, monthlyBudgetAlert: 12000 },
    { id: 'cat-9', name: 'Stationery', subCategories: ['Register Books', 'Pens & Notepads'], isActive: true, monthlyBudgetAlert: 6000 },
    { id: 'cat-10', name: 'Software', subCategories: ['Accounting SaaS', 'SMS Bundles'], isActive: true, monthlyBudgetAlert: 10000 },
    { id: 'cat-11', name: 'Salaries', subCategories: ['Support Staff', 'District Helpers'], isActive: true, monthlyBudgetAlert: 45000 },
    { id: 'cat-12', name: 'Travel', subCategories: ['Inspection Tours', 'District Meetings'], isActive: true, monthlyBudgetAlert: 18000 },
    { id: 'cat-13', name: 'Event Expenses', subCategories: ['Teacher Orientation', 'Parent Meetups'], isActive: true, monthlyBudgetAlert: 25000 },
    { id: 'cat-14', name: 'Vendor Payments', subCategories: ['Logistics', 'Signage Production'], isActive: true, monthlyBudgetAlert: 30000 },
    { id: 'cat-15', name: 'Infrastructure', subCategories: ['Networking Cables', 'Power Inverters'], isActive: true, monthlyBudgetAlert: 40000 },
    { id: 'cat-16', name: 'Miscellaneous', subCategories: ['Contingency'], isActive: true, monthlyBudgetAlert: 10000 }
  ],
  autoSettlementSchedule: 'MONTHLY',
  settlementDayOfMonth: 1
};

export const INITIAL_EXPENSE_CLAIMS: DistrictExpenseClaim[] = [
  {
    id: 'DEXP-GZP-2026-001',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    category: 'Marketing',
    subCategory: 'Flyers',
    description: 'Print 15,000 promotional flyers for Saidpur & Lanka home tuition awareness',
    purpose: 'Expand student enrollment ahead of autumn academic term',
    claimedAmount: 25000,
    approvedAmount: 22000,
    payableAmount: 22000,
    alreadyPaidAmount: 0,
    remainingAmount: 22000,
    expenseDate: '2026-09-12',
    vendorName: 'Maurya Digital Print Hub',
    paymentMethod: 'NEFT_RTGS',
    billNumber: 'MDPH-2026-891',
    billDate: '2026-09-11',
    notes: 'Vendor offered a ₹3,000 bulk rebate on 15,000 quantity, approved at ₹22,000.',
    internalRemarks: 'Checked with standard rate card; ₹22,000 approved by Super Admin.',
    supportingDocuments: [
      {
        id: 'doc-exp-1a',
        name: 'Flyer_Tax_Invoice_891.pdf',
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
        fileType: 'application/pdf',
        sizeBytes: 245000,
        uploadedAt: '2026-09-12T10:15:00Z'
      },
      {
        id: 'doc-exp-1b',
        name: 'Sample_Print_Proof.jpg',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=60',
        fileType: 'image/jpeg',
        sizeBytes: 1820000,
        uploadedAt: '2026-09-12T10:18:00Z'
      }
    ],
    bankDetails: {
      accountHolderName: 'Maurya Digital Print Hub',
      bankName: 'State Bank of India',
      accountNumberMasked: 'XXXX XXXX 4587',
      ifscCode: 'SBIN0001244',
      upiId: 'mauryaprint@sbi',
      verified: true
    },
    status: 'PAYMENT_QUEUED',
    submittedByAdminId: 'usr-admin-ghazipur',
    submittedByAdminName: 'Manoj Kumar Rai',
    approvedBySuperAdminId: 'usr-superadmin-01',
    approvedBySuperAdminName: 'Prof. Alok Tripathi (Super Admin)',
    approvedAt: '2026-09-14T15:30:00Z',
    paymentQueueId: 'PQ-EXP-001',
    timeline: [
      { id: 'tl-1', timestamp: '2026-09-12T10:20:00Z', status: 'SUBMITTED', actorName: 'Manoj Kumar Rai', actorRole: 'DISTRICT_ADMIN', note: 'Bill submitted with invoice copy' },
      { id: 'tl-2', timestamp: '2026-09-13T11:00:00Z', status: 'UNDER_REVIEW', actorName: 'Prof. Alok Tripathi', actorRole: 'SUPER_ADMIN', note: 'Verifying rate card with local standards' },
      { id: 'tl-3', timestamp: '2026-09-14T15:30:00Z', status: 'PARTIALLY_APPROVED', actorName: 'Prof. Alok Tripathi', actorRole: 'SUPER_ADMIN', note: 'Approved at ₹22,000 (after ₹3,000 vendor discount adjustment)', amountSnapshot: 22000 },
      { id: 'tl-4', timestamp: '2026-09-15T09:00:00Z', status: 'PAYMENT_QUEUED', actorName: 'Finance Gateway', actorRole: 'SYSTEM', note: 'Disbursement queued in central payout queue' }
    ],
    createdAt: '2026-09-12T10:20:00Z',
    updatedAt: '2026-09-15T09:00:00Z'
  },
  {
    id: 'DEXP-GZP-2026-002',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    category: 'Internet',
    subCategory: 'Broadband Fiber',
    description: 'High-speed Airtel Fiber connection for District Admin Command Office (Lanka)',
    purpose: 'Seamless coordination, high-speed attendance sync, and teacher video approvals',
    claimedAmount: 4800,
    approvedAmount: 4800,
    payableAmount: 4800,
    alreadyPaidAmount: 4800,
    remainingAmount: 0,
    expenseDate: '2026-09-02',
    vendorName: 'Bharti Airtel Ltd',
    paymentMethod: 'UPI',
    billNumber: 'AIRTEL-GZP-9942',
    billDate: '2026-09-01',
    supportingDocuments: [
      {
        id: 'doc-exp-2a',
        name: 'Airtel_Fiber_GST_Bill.pdf',
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
        fileType: 'application/pdf',
        sizeBytes: 120000,
        uploadedAt: '2026-09-02T11:00:00Z'
      }
    ],
    bankDetails: {
      accountHolderName: 'Bharti Airtel Collections',
      bankName: 'HDFC Bank',
      accountNumberMasked: 'XXXX XXXX 9912',
      ifscCode: 'HDFC0000128',
      upiId: 'airtelbill@hdfcbank',
      verified: true
    },
    status: 'PAID',
    submittedByAdminId: 'usr-admin-ghazipur',
    submittedByAdminName: 'Manoj Kumar Rai',
    approvedBySuperAdminId: 'usr-superadmin-01',
    approvedBySuperAdminName: 'Prof. Alok Tripathi (Super Admin)',
    approvedAt: '2026-09-03T10:00:00Z',
    paymentId: 'PAY-EXP-88910',
    transactionId: 'TXN-UPI-984210',
    paidAt: '2026-09-04T12:30:00Z',
    receiptNumber: 'FP-EXP-2026-09-000092',
    timeline: [
      { id: 'tl-10', timestamp: '2026-09-02T11:00:00Z', status: 'SUBMITTED', actorName: 'Manoj Kumar Rai', actorRole: 'DISTRICT_ADMIN' },
      { id: 'tl-11', timestamp: '2026-09-03T10:00:00Z', status: 'APPROVED', actorName: 'Prof. Alok Tripathi', actorRole: 'SUPER_ADMIN', note: 'Standard utility bill approved in full' },
      { id: 'tl-12', timestamp: '2026-09-04T12:30:00Z', status: 'PAID', actorName: 'System Payout Engine', actorRole: 'SYSTEM', note: 'UPI settlement completed. Receipt generated.' }
    ],
    createdAt: '2026-09-02T11:00:00Z',
    updatedAt: '2026-09-04T12:30:00Z'
  },
  {
    id: 'DEXP-GZP-2026-003',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    category: 'Travel',
    subCategory: 'Inspection Tours',
    description: 'Bi-weekly on-site verification tours to rural partner study libraries in Zamania & Bhurkura',
    purpose: 'Inspect fire safety, check biometric turnstiles, and verify library amenities',
    claimedAmount: 6200,
    approvedAmount: 6200,
    payableAmount: 6200,
    alreadyPaidAmount: 0,
    remainingAmount: 6200,
    expenseDate: '2026-09-17',
    vendorName: 'Ghazipur Auto Taxi Union',
    paymentMethod: 'BANK_TRANSFER',
    billNumber: 'TAXI-SLIP-4012',
    billDate: '2026-09-17',
    supportingDocuments: [
      {
        id: 'doc-exp-3a',
        name: 'Log_Book_Distance_Slips.pdf',
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
        fileType: 'application/pdf',
        sizeBytes: 310000,
        uploadedAt: '2026-09-17T18:00:00Z'
      }
    ],
    status: 'UNDER_REVIEW',
    submittedByAdminId: 'usr-admin-ghazipur',
    submittedByAdminName: 'Manoj Kumar Rai',
    timeline: [
      { id: 'tl-20', timestamp: '2026-09-17T18:10:00Z', status: 'SUBMITTED', actorName: 'Manoj Kumar Rai', actorRole: 'DISTRICT_ADMIN' },
      { id: 'tl-21', timestamp: '2026-09-18T09:30:00Z', status: 'UNDER_REVIEW', actorName: 'Prof. Alok Tripathi', actorRole: 'SUPER_ADMIN', note: 'Verifying inspection itinerary with submitted library audit logs' }
    ],
    createdAt: '2026-09-17T18:10:00Z',
    updatedAt: '2026-09-18T09:30:00Z'
  },
  {
    id: 'DEXP-GZP-2026-004',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    category: 'Equipment',
    subCategory: 'Biometric Scanners',
    description: 'Fingerprint + facial recognition attendance scanner for central teacher verification desk',
    purpose: 'Anti-proxy attendance compliance system installation',
    claimedAmount: 18500,
    alreadyPaidAmount: 0,
    remainingAmount: 18500,
    expenseDate: '2026-09-18',
    vendorName: 'SecureTech India Solutions',
    paymentMethod: 'NEFT_RTGS',
    billNumber: 'STIS-2026-1049',
    billDate: '2026-09-18',
    supportingDocuments: [
      {
        id: 'doc-exp-4a',
        name: 'Device_Warranty_Invoice.pdf',
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
        fileType: 'application/pdf',
        sizeBytes: 520000,
        uploadedAt: '2026-09-18T14:00:00Z'
      }
    ],
    status: 'SUBMITTED',
    submittedByAdminId: 'usr-admin-ghazipur',
    submittedByAdminName: 'Manoj Kumar Rai',
    timeline: [
      { id: 'tl-30', timestamp: '2026-09-18T14:15:00Z', status: 'SUBMITTED', actorName: 'Manoj Kumar Rai', actorRole: 'DISTRICT_ADMIN' }
    ],
    createdAt: '2026-09-18T14:15:00Z',
    updatedAt: '2026-09-18T14:15:00Z'
  }
];

export const INITIAL_TEACHER_PAYROLL: TeacherPayrollItem[] = [
  {
    id: 'PAYROLL-TCH-2026-09-01',
    teacherId: 'usr-teacher-rajesh',
    teacherName: 'Dr. Rajesh Sharma',
    teacherPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    billingMonth: 'September 2026',
    assignedStudentsCount: 4,
    completedSessionsCount: 28,
    approvedSessionsCount: 28,
    grossTuitionCollection: 16000,
    teacherEarnings: 13600,
    focusPointCommission: 2400,
    bonus: 1000,
    deductions: 0,
    adjustments: 0,
    previousBalance: 0,
    netPayable: 14600,
    paidAmount: 14600,
    bankDetails: {
      accountHolderName: 'Rajesh Sharma',
      bankName: 'State Bank of India',
      accountNumberMasked: 'XXXX XXXX 3381',
      ifscCode: 'SBIN0000412',
      verificationStatus: 'VERIFIED'
    },
    status: 'PAID',
    paymentId: 'PAY-SAL-2026-09-01',
    transactionRef: 'SBI-NEFT-99120481',
    paidAt: '2026-09-15T14:20:00Z',
    salarySlipNumber: 'FP-SAL-2026-09-000145',
    authorizedBy: 'Prof. Alok Tripathi (Super Admin)',
    createdAt: '2026-09-14T09:00:00Z',
    updatedAt: '2026-09-15T14:20:00Z'
  },
  {
    id: 'PAYROLL-TCH-2026-09-02',
    teacherId: 'usr-teacher-ananya',
    teacherName: 'Ananya Verma',
    teacherPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    billingMonth: 'September 2026',
    assignedStudentsCount: 3,
    completedSessionsCount: 20,
    approvedSessionsCount: 20,
    grossTuitionCollection: 12000,
    teacherEarnings: 10200,
    focusPointCommission: 1800,
    bonus: 500,
    deductions: 200,
    adjustments: 0,
    previousBalance: 0,
    netPayable: 10500,
    paidAmount: 0,
    bankDetails: {
      accountHolderName: 'Ananya Verma',
      bankName: 'Punjab National Bank',
      accountNumberMasked: 'XXXX XXXX 9102',
      ifscCode: 'PUNB0182000',
      verificationStatus: 'VERIFIED'
    },
    status: 'READY_FOR_PAYMENT',
    salarySlipNumber: 'FP-SAL-2026-09-000146',
    createdAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-09-15T10:00:00Z'
  },
  {
    id: 'PAYROLL-TCH-2026-09-03',
    teacherId: 'usr-teacher-vikram',
    teacherName: 'Vikram Singh',
    teacherPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    billingMonth: 'September 2026',
    assignedStudentsCount: 2,
    completedSessionsCount: 16,
    approvedSessionsCount: 16,
    grossTuitionCollection: 9000,
    teacherEarnings: 7650,
    focusPointCommission: 1350,
    bonus: 0,
    deductions: 0,
    adjustments: 0,
    previousBalance: 0,
    netPayable: 7650,
    paidAmount: 0,
    bankDetails: {
      accountHolderName: 'Vikram Singh',
      bankName: 'Bank of Baroda',
      accountNumberMasked: 'XXXX XXXX 7721',
      ifscCode: 'BARB0GHAZIP',
      verificationStatus: 'VERIFIED'
    },
    status: 'PAYMENT_QUEUED',
    createdAt: '2026-09-16T11:00:00Z',
    updatedAt: '2026-09-16T11:00:00Z'
  }
];

export const INITIAL_LIBRARY_SETTLEMENTS: LibrarySettlementRecord[] = [
  {
    id: 'SETT-LIB-2026-09-01',
    libraryId: 'lib-focus-saidpur',
    libraryName: 'Focus Central Study Hub & Digital Library',
    ownerId: 'usr-libowner-saidpur',
    ownerName: 'Virendra Yadav',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    settlementPeriod: 'September 2026',
    lineItems: [
      {
        bookingId: 'BK-LIB-901',
        studentName: 'Aryan Maurya',
        studentPhoneMasked: 'XXXXXX4812',
        seatNumber: 'A-12',
        shiftName: 'Morning Shift (06:00 - 12:00)',
        bookingDate: '2026-09-01',
        grossAmount: 800,
        discount: 50,
        taxCharges: 0,
        commissionRate: 10,
        commissionAmount: 75,
        refundAdjustment: 0,
        netPayable: 675
      },
      {
        bookingId: 'BK-LIB-902',
        studentName: 'Priya Singh',
        studentPhoneMasked: 'XXXXXX8910',
        seatNumber: 'B-04',
        shiftName: 'Full Day Shift (06:00 - 22:00)',
        bookingDate: '2026-09-02',
        grossAmount: 1400,
        discount: 0,
        taxCharges: 0,
        commissionRate: 10,
        commissionAmount: 140,
        refundAdjustment: 0,
        netPayable: 1260
      },
      {
        bookingId: 'BK-LIB-903',
        studentName: 'Aman Kushwaha',
        studentPhoneMasked: 'XXXXXX3321',
        seatNumber: 'C-01',
        shiftName: 'Evening Shift (14:00 - 20:00)',
        bookingDate: '2026-09-04',
        grossAmount: 900,
        discount: 0,
        taxCharges: 0,
        commissionRate: 10,
        commissionAmount: 90,
        refundAdjustment: 0,
        netPayable: 810
      }
    ],
    totalBookingsCount: 3,
    grossBookingAmount: 3100,
    totalDiscounts: 50,
    platformCommission: 305,
    adjustments: 0,
    netPayable: 2745,
    paidAmount: 2745,
    bankDetails: {
      accountHolderName: 'Virendra Yadav (Focus Central)',
      bankName: 'HDFC Bank Saidpur',
      accountNumberMasked: 'XXXX XXXX 6112',
      ifscCode: 'HDFC0004910',
      verificationStatus: 'VERIFIED'
    },
    status: 'PAID',
    paymentId: 'PAY-SET-LIB-01',
    transactionRef: 'HDFC-RTGS-98210492',
    utr: 'UTR9821049281',
    paidAt: '2026-09-12T16:00:00Z',
    receiptNumber: 'FP-LIB-2026-09-000278',
    authorizedBy: 'Prof. Alok Tripathi (Super Admin)',
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-12T16:00:00Z'
  },
  {
    id: 'SETT-LIB-2026-09-02',
    libraryId: 'lib-saraswati-ghazipur',
    libraryName: 'Saraswati Digital Study Space',
    ownerId: 'usr-libowner-saraswati',
    ownerName: 'Dharmendra Kumar',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    settlementPeriod: 'September 2026',
    lineItems: [
      {
        bookingId: 'BK-LIB-915',
        studentName: 'Rohan Gupta',
        seatNumber: 'S-08',
        shiftName: 'Full Day Shift',
        bookingDate: '2026-09-05',
        grossAmount: 1200,
        discount: 0,
        taxCharges: 0,
        commissionRate: 10,
        commissionAmount: 120,
        refundAdjustment: 0,
        netPayable: 1080
      }
    ],
    totalBookingsCount: 1,
    grossBookingAmount: 1200,
    totalDiscounts: 0,
    platformCommission: 120,
    adjustments: 0,
    netPayable: 1080,
    paidAmount: 0,
    bankDetails: {
      accountHolderName: 'Dharmendra Kumar',
      bankName: 'State Bank of India',
      accountNumberMasked: 'XXXX XXXX 1928',
      ifscCode: 'SBIN0001099',
      verificationStatus: 'VERIFIED'
    },
    status: 'READY_FOR_SETTLEMENT',
    createdAt: '2026-09-16T12:00:00Z',
    updatedAt: '2026-09-16T12:00:00Z'
  }
];

export const INITIAL_PAYMENT_QUEUE: PaymentQueueItem[] = [
  {
    id: 'PQ-EXP-001',
    payeeId: 'usr-admin-ghazipur',
    payeeName: 'Manoj Kumar Rai (District Coordinator)',
    payeeType: 'DISTRICT_ADMIN',
    paymentType: 'EXPENDITURE',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    amount: 22000,
    claimedOrGrossAmount: 25000,
    sourceReferenceId: 'DEXP-GZP-2026-001',
    referenceCode: 'MDPH-2026-891',
    description: 'Print 15,000 promotional flyers for Saidpur & Lanka awareness',
    paymentMethod: 'NEFT_RTGS',
    bankAccountMasked: 'XXXX XXXX 4587',
    ifscCode: 'SBIN0001244',
    bankVerified: true,
    status: 'QUEUED',
    idempotencyKey: 'IDEMP-EXP-DEXP-GZP-2026-001-01',
    createdAt: '2026-09-15T09:00:00Z'
  },
  {
    id: 'PQ-SAL-002',
    payeeId: 'usr-teacher-ananya',
    payeeName: 'Ananya Verma (Biology & Chemistry Educator)',
    payeeType: 'TEACHER',
    paymentType: 'SALARY',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    amount: 10500,
    claimedOrGrossAmount: 12000,
    sourceReferenceId: 'PAYROLL-TCH-2026-09-02',
    referenceCode: 'SAL-SEP26-ANANYA',
    description: 'September 2026 Tuition Salary (3 Students, 20 Sessions)',
    paymentMethod: 'BANK_TRANSFER',
    bankAccountMasked: 'XXXX XXXX 9102',
    ifscCode: 'PUNB0182000',
    bankVerified: true,
    status: 'QUEUED',
    idempotencyKey: 'IDEMP-SAL-PAYROLL-TCH-2026-09-02-01',
    createdAt: '2026-09-15T10:05:00Z'
  },
  {
    id: 'PQ-SETT-003',
    payeeId: 'lib-saraswati-ghazipur',
    payeeName: 'Dharmendra Kumar (Saraswati Digital Study Space)',
    payeeType: 'LIBRARY_OWNER',
    paymentType: 'SETTLEMENT',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    amount: 1080,
    claimedOrGrossAmount: 1200,
    sourceReferenceId: 'SETT-LIB-2026-09-02',
    referenceCode: 'SETT-SEP26-SARASWATI',
    description: 'Seat Booking Settlement for September 2026',
    paymentMethod: 'BANK_TRANSFER',
    bankAccountMasked: 'XXXX XXXX 1928',
    ifscCode: 'SBIN0001099',
    bankVerified: true,
    status: 'QUEUED',
    idempotencyKey: 'IDEMP-SETT-SETT-LIB-2026-09-02-01',
    createdAt: '2026-09-16T12:05:00Z'
  }
];

export const INITIAL_SETTLEMENT_BATCHES: SettlementBatch[] = [
  {
    id: 'FP-SET-2026-09-000124',
    batchDate: '2026-09-15T14:20:00Z',
    initiatedBy: 'usr-superadmin-01',
    initiatedByName: 'Prof. Alok Tripathi (Super Admin)',
    totalPayments: 2,
    totalAmount: 17345,
    successfulPayments: 2,
    failedPayments: 0,
    pendingPayments: 0,
    reversedPayments: 0,
    status: 'COMPLETED',
    itemIds: ['PQ-SAL-001', 'PQ-SETT-001'],
    createdAt: '2026-09-15T14:15:00Z'
  }
];

export const INITIAL_MONTHLY_CLOSINGS: MonthlyClosingRecord[] = [
  {
    id: 'FP-CLOSE-2026-08-GHAZIPUR',
    month: 'August',
    year: 2026,
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    totalTuitionCollections: 1450000,
    teacherPayouts: 1232500,
    libraryCollections: 420000,
    librarySettlements: 378000,
    districtExpenditure: 68500,
    focusPointCommission: 259500,
    refunds: 12000,
    adjustments: 0,
    netPlatformRevenue: 179000,
    pendingLiabilities: 0,
    failedPaymentsCount: 0,
    outstandingPayablesCount: 0,
    isClosed: true,
    closedAt: '2026-09-01T23:59:59Z',
    closedBy: 'usr-superadmin-01',
    closedByName: 'Prof. Alok Tripathi (Super Admin)',
    snapshotHash: 'SHA256-CLOSE-8891048201'
  }
];

export const INITIAL_OFFICIAL_DOCUMENTS: OfficialDocument[] = [
  {
    documentId: 'FP-SAL-2026-09-000145',
    documentType: 'SALARY_SLIP',
    title: "ZYZU'S Official Teacher Salary Slip",
    recipientName: 'Dr. Rajesh Sharma',
    recipientId: 'usr-teacher-rajesh',
    recipientRole: 'Verified Senior Educator',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    date: '2026-09-15',
    billingPeriod: 'September 2026',
    amount: 14600,
    status: 'PAID',
    paymentId: 'PAY-SAL-2026-09-01',
    transactionRef: 'SBI-NEFT-99120481',
    paymentMethod: 'NEFT Direct Bank Transfer',
    bankAccountMasked: 'XXXX XXXX 3381 (SBI)',
    authorizedBy: 'Prof. Alok Tripathi (Super Admin)',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-SAL-2026-09-000145',
    breakdown: [
      { label: 'Gross Tuition Collection (4 Students, 28 Sessions)', amount: 16000 },
      { label: 'Educator Gross Earnings Share', amount: 13600 },
      { label: 'Performance & Attendance Bonus', amount: 1000 },
      { label: "ZYZU'S Platform Service Fee", amount: 2400, isDeduction: true },
      { label: 'Net Disbursed Payable Amount', amount: 14600, isHighlight: true }
    ],
    metadata: {
      sessionsCount: 28,
      studentsCount: 4,
      attendancePercentage: '100%'
    },
    issuedAt: '2026-09-15T14:20:00Z'
  },
  {
    documentId: 'FP-EXP-2026-09-000092',
    documentType: 'EXPENSE_RECEIPT',
    title: "ZYZU'S Official District Expense Payment Receipt",
    recipientName: 'Bharti Airtel Ltd (C/O Manoj Kumar Rai)',
    recipientId: 'usr-admin-ghazipur',
    recipientRole: 'District Coordinator',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    date: '2026-09-04',
    billingPeriod: 'September 2026',
    amount: 4800,
    status: 'PAID',
    paymentId: 'PAY-EXP-88910',
    transactionRef: 'TXN-UPI-984210',
    paymentMethod: 'Unified Payments Interface (UPI)',
    bankAccountMasked: 'XXXX XXXX 9912 (HDFC)',
    authorizedBy: 'Prof. Alok Tripathi (Super Admin)',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-EXP-2026-09-000092',
    breakdown: [
      { label: 'Claimed Operational Expenditure', amount: 4800 },
      { label: 'Super Admin Approved Amount', amount: 4800 },
      { label: 'Total Paid & Settled Amount', amount: 4800, isHighlight: true }
    ],
    metadata: {
      category: 'Internet',
      billNumber: 'AIRTEL-GZP-9942',
      purpose: 'High-speed Airtel Fiber connection for District Admin Command Office'
    },
    issuedAt: '2026-09-04T12:30:00Z'
  },
  {
    documentId: 'FP-LIB-2026-09-000278',
    documentType: 'SETTLEMENT_RECEIPT',
    title: "ZYZU'S Official Library Seat Settlement Receipt",
    recipientName: 'Virendra Yadav (Focus Central Study Hub)',
    recipientId: 'lib-focus-saidpur',
    recipientRole: 'Partner Library Operator',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    date: '2026-09-12',
    billingPeriod: 'September 2026',
    amount: 2745,
    status: 'PAID',
    paymentId: 'PAY-SET-LIB-01',
    transactionRef: 'HDFC-RTGS-98210492',
    paymentMethod: 'RTGS Electronic Bank Transfer',
    bankAccountMasked: 'XXXX XXXX 6112 (HDFC)',
    authorizedBy: 'Prof. Alok Tripathi (Super Admin)',
    qrVerificationUrl: 'https://zyzus.com/verify/doc/FP-LIB-2026-09-000278',
    breakdown: [
      { label: 'Gross Online Seat Bookings (3 Confirmed)', amount: 3100 },
      { label: 'Student Promotional Discount Adjustment', amount: 50, isDeduction: true },
      { label: "ZYZU'S Commission Fee (10% Tier)", amount: 305, isDeduction: true },
      { label: 'Final Net Partner Settled Payout', amount: 2745, isHighlight: true }
    ],
    metadata: {
      libraryName: 'Focus Central Study Hub & Digital Library',
      utr: 'UTR9821049281',
      totalBookings: 3
    },
    issuedAt: '2026-09-12T16:00:00Z'
  }
];
