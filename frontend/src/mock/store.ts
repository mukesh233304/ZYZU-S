// FOCUSPOINT Stateful In-Memory & LocalStorage Mock Store
// Designed for seamless transition to InsForge PostgreSQL BaaS

import { 
  User, Teacher, Library, TutorRequest, LibraryBooking, 
  AttendanceRecord, Invoice, NotificationItem, SupportTicket, 
  AuditLog, District, LibraryStudent, VerificationStatus, SeatStatus,
  TeacherAssignment, TeacherDocumentItem, TeacherBankAccount,
  TeacherExperienceRecord, TeacherPayout, LibraryBankAccount,
  LibraryExpense, LibrarySettlement, LibraryNotificationSettings,
  DistrictExpense, CommissionConfig, TeacherDisbursementRecord,
  AnnouncementCircular, ManualSeatBookingRecord, LeftTeacherRecord,
  DemoPricingRule, DemoBooking, DemoEligibility, DemoPriceCalculation,
  StudyMaterial, StudyMaterialVersion, StudyMaterialPricingRule,
  StudyMaterialOffer, StudyMaterialDownloadPolicy, StudyMaterialPurchase,
  StudyMaterialDownloadRecord, DownloadAllowance,
  TeacherRegistrationPricingRule, TeacherRegistrationPricingHistory,
  TeacherRegistrationPaymentRecord, TeacherRegistrationPriceCalculation,
  TeacherRegistrationAnalytics, TeacherRegistrationRuleStatus,
  StudentActiveAttendanceService
} from '../types';

import { MOCK_USERS } from './data/users';
import { safeStorage } from '../utils/storageUtils';
import { MOCK_DISTRICTS } from './data/districts';
import { MOCK_TEACHERS } from './data/teachers';
import { MOCK_LIBRARIES } from './data/libraries';
import { MOCK_TUTOR_REQUESTS } from './data/tutorRequests';
import { MOCK_BOOKINGS } from './data/bookings';
import { MOCK_ATTENDANCE } from './data/attendance';
import { MOCK_INVOICES } from './data/fees';
import { MOCK_NOTIFICATIONS } from './data/notifications';
import { MOCK_SUPPORT_TICKETS } from './data/supportTickets';
import { MOCK_AUDIT_LOGS } from './data/auditLogs';
import {
  MOCK_STUDY_MATERIALS,
  MOCK_STUDY_MATERIAL_OFFERS,
  MOCK_STUDY_MATERIAL_DOWNLOAD_POLICIES,
  MOCK_STUDY_MATERIAL_PRICING_RULES,
  MOCK_STUDY_MATERIAL_PURCHASES,
  MOCK_STUDY_MATERIAL_DOWNLOADS
} from './data/studyMaterials';
import {
  INITIAL_TEACHER_REGISTRATION_PRICING_RULES,
  INITIAL_TEACHER_REGISTRATION_HISTORY,
  INITIAL_TEACHER_REGISTRATION_PAYMENTS
} from './data/teacherRegistrationPricingRules';
import {
  LibrarySubscriptionPlan,
  LibrarySubscriptionPricingRule,
  LibrarySubscription,
  LibrarySubscriptionRefundPolicy,
  LibrarySubscriptionPaymentRecord,
  LibrarySubscriptionCancellationRequest,
  LibrarySubscriptionPriceCalculation,
  LibrarySubscriptionAnalytics
} from '../types/librarySubscriptionPricing';
import {
  MOCK_LIBRARY_SUBSCRIPTION_PLANS,
  MOCK_LIBRARY_SUBSCRIPTION_PRICING_RULES,
  MOCK_LIBRARY_SUBSCRIPTIONS,
  MOCK_LIBRARY_SUBSCRIPTION_PAYMENTS
} from './data/librarySubscriptionPlans';
import {
  DistrictExpenseClaim,
  TeacherPayrollItem,
  LibrarySettlementRecord,
  PaymentQueueItem,
  SettlementBatch,
  MonthlyClosingRecord,
  FinancialAuditLog,
  FinanceSettingsConfig,
  OfficialDocument,
  ExpenseClaimStatus,
  ExpenseCategory
} from '../types/finance';
import {
  INITIAL_EXPENSE_CLAIMS,
  INITIAL_TEACHER_PAYROLL,
  INITIAL_LIBRARY_SETTLEMENTS,
  INITIAL_PAYMENT_QUEUE,
  INITIAL_SETTLEMENT_BATCHES,
  INITIAL_MONTHLY_CLOSINGS,
  INITIAL_OFFICIAL_DOCUMENTS,
  INITIAL_FINANCE_SETTINGS
} from './data/financeData';
import {
  UnifiedFocusPointDocument,
  DocumentFilterOptions,
  DocumentKPISummary,
  DocumentVerificationResult
} from '../types/document';
import { INITIAL_FOCUSPOINT_DOCUMENTS } from './data/documentData';
import { academicStoreEngine } from './academicStoreEngine';
import { safeSetLocalStorage } from '../utils/imageUtils';

class MockStore {
  private users: User[] = [];
  private districts: District[] = [];
  private teachers: Teacher[] = [];
  private libraries: Library[] = [];
  private tutorRequests: TutorRequest[] = [];
  private bookings: LibraryBooking[] = [];
  private attendance: AttendanceRecord[] = [];
  private invoices: Invoice[] = [];
  private notifications: NotificationItem[] = [];
  private supportTickets: SupportTicket[] = [];
  private auditLogs: AuditLog[] = [];
  private libraryStudents: LibraryStudent[] = [];
  private teacherAssignments: TeacherAssignment[] = [];
  private teacherPayouts: TeacherPayout[] = [];
  private libraryExpenses: LibraryExpense[] = [];
  private librarySettlements: LibrarySettlement[] = [];
  private libraryNotificationSettings: Record<string, LibraryNotificationSettings> = {};
  private districtExpenses: DistrictExpense[] = [];
  private commissionConfigs: Record<string, CommissionConfig> = {};
  private teacherDisbursements: TeacherDisbursementRecord[] = [];
  private announcements: AnnouncementCircular[] = [];
  private manualBookings: ManualSeatBookingRecord[] = [];
  private leftTeachers: LeftTeacherRecord[] = [];
  private demoPricingRules: DemoPricingRule[] = [];
  private demoBookings: DemoBooking[] = [];
  private studyMaterials: StudyMaterial[] = [];
  private studyMaterialOffers: StudyMaterialOffer[] = [];
  private studyMaterialPolicies: StudyMaterialDownloadPolicy[] = [];
  private studyMaterialPricingRules: StudyMaterialPricingRule[] = [];
  private studyMaterialPurchases: StudyMaterialPurchase[] = [];
  private studyMaterialDownloads: StudyMaterialDownloadRecord[] = [];
  private teacherRegistrationPricingRules: TeacherRegistrationPricingRule[] = [];
  private teacherRegistrationPricingHistory: TeacherRegistrationPricingHistory[] = [];
  private teacherRegistrationPayments: TeacherRegistrationPaymentRecord[] = [];
  private librarySubscriptionPlans: LibrarySubscriptionPlan[] = [];
  private librarySubscriptionPricingRules: LibrarySubscriptionPricingRule[] = [];
  private librarySubscriptions: LibrarySubscription[] = [];
  private librarySubscriptionPayments: LibrarySubscriptionPaymentRecord[] = [];
  private librarySubscriptionCancellations: LibrarySubscriptionCancellationRequest[] = [];
  private districtExpenseClaims: DistrictExpenseClaim[] = [];
  private teacherPayrollItems: TeacherPayrollItem[] = [];
  private librarySettlementRecords: LibrarySettlementRecord[] = [];
  private paymentQueueItems: PaymentQueueItem[] = [];
  private settlementBatches: SettlementBatch[] = [];
  private monthlyClosings: MonthlyClosingRecord[] = [];
  private financialAuditLogs: FinancialAuditLog[] = [];
  private officialDocuments: OfficialDocument[] = [];
  private documents: UnifiedFocusPointDocument[] = [];
  private financeSettings: FinanceSettingsConfig = INITIAL_FINANCE_SETTINGS;
  private attendanceListeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = safeStorage.getItem('fp_mock_store_v1');
      if (stored) {
        const data = JSON.parse(stored);
        this.users = data.users || MOCK_USERS;
        this.districts = data.districts || MOCK_DISTRICTS;
        if (data.teachers) {
          const existingIds = new Set((data.teachers as Teacher[]).map(t => t.id));
          const missing = MOCK_TEACHERS.filter(t => !existingIds.has(t.id));
          this.teachers = [...data.teachers, ...missing];
        } else {
          this.teachers = MOCK_TEACHERS;
        }
        if (data.libraries && Array.isArray(data.libraries)) {
          const storedLibMap = new Map((data.libraries as Library[]).map(l => [l.id, l]));
          this.libraries = MOCK_LIBRARIES.map(mockLib => {
            const stored = storedLibMap.get(mockLib.id);
            return stored ? { ...mockLib, ...stored } : mockLib;
          });
          data.libraries.forEach((storedLib: Library) => {
            if (!this.libraries.some(l => l.id === storedLib.id)) {
              this.libraries.push(storedLib);
            }
          });
        } else {
          this.libraries = [...MOCK_LIBRARIES];
        }
        this.tutorRequests = data.tutorRequests || MOCK_TUTOR_REQUESTS;
        this.bookings = data.bookings || MOCK_BOOKINGS;
        this.attendance = data.attendance || MOCK_ATTENDANCE;
        this.invoices = data.invoices || MOCK_INVOICES;
        this.notifications = data.notifications || MOCK_NOTIFICATIONS;
        this.supportTickets = data.supportTickets || MOCK_SUPPORT_TICKETS;
        this.auditLogs = data.auditLogs || MOCK_AUDIT_LOGS;
        this.libraryStudents = data.libraryStudents || this.initLibraryStudents();
        this.teacherAssignments = data.teacherAssignments || this.initTeacherAssignments();
        this.teacherPayouts = data.teacherPayouts || this.initTeacherPayouts();
        this.libraryExpenses = data.libraryExpenses || this.initLibraryExpenses();
        this.librarySettlements = data.librarySettlements || this.initLibrarySettlements();
        this.libraryNotificationSettings = data.libraryNotificationSettings || {};
        this.districtExpenses = data.districtExpenses || this.initDistrictExpenses();
        this.commissionConfigs = data.commissionConfigs || this.initCommissionConfigs();
        this.teacherDisbursements = data.teacherDisbursements || this.initTeacherDisbursements();
        this.announcements = data.announcements || this.initAnnouncements();
        this.manualBookings = data.manualBookings || this.initManualBookings();
        this.leftTeachers = data.leftTeachers || this.initLeftTeachers();
        this.demoPricingRules = data.demoPricingRules || this.initDemoPricingRules();
        this.demoBookings = data.demoBookings || [];
        this.studyMaterials = data.studyMaterials || MOCK_STUDY_MATERIALS;
        this.studyMaterialOffers = data.studyMaterialOffers || MOCK_STUDY_MATERIAL_OFFERS;
        this.studyMaterialPolicies = data.studyMaterialPolicies || MOCK_STUDY_MATERIAL_DOWNLOAD_POLICIES;
        this.studyMaterialPricingRules = data.studyMaterialPricingRules || MOCK_STUDY_MATERIAL_PRICING_RULES;
        this.studyMaterialPurchases = data.studyMaterialPurchases || MOCK_STUDY_MATERIAL_PURCHASES;
        this.studyMaterialDownloads = data.studyMaterialDownloads || MOCK_STUDY_MATERIAL_DOWNLOADS;
        this.teacherRegistrationPricingRules = data.teacherRegistrationPricingRules || [...INITIAL_TEACHER_REGISTRATION_PRICING_RULES];
        this.teacherRegistrationPricingHistory = data.teacherRegistrationPricingHistory || [...INITIAL_TEACHER_REGISTRATION_HISTORY];
        this.teacherRegistrationPayments = data.teacherRegistrationPayments || [...INITIAL_TEACHER_REGISTRATION_PAYMENTS];
        this.librarySubscriptionPlans = data.librarySubscriptionPlans || [...MOCK_LIBRARY_SUBSCRIPTION_PLANS];
        this.librarySubscriptionPricingRules = data.librarySubscriptionPricingRules || [...MOCK_LIBRARY_SUBSCRIPTION_PRICING_RULES];
        this.librarySubscriptions = data.librarySubscriptions || [...MOCK_LIBRARY_SUBSCRIPTIONS];
        this.librarySubscriptionPayments = data.librarySubscriptionPayments || [...MOCK_LIBRARY_SUBSCRIPTION_PAYMENTS];
        this.librarySubscriptionCancellations = data.librarySubscriptionCancellations || [];
        this.districtExpenseClaims = data.districtExpenseClaims || [...INITIAL_EXPENSE_CLAIMS];
        this.teacherPayrollItems = data.teacherPayrollItems || [...INITIAL_TEACHER_PAYROLL];
        this.librarySettlementRecords = data.librarySettlementRecords || [...INITIAL_LIBRARY_SETTLEMENTS];
        this.paymentQueueItems = data.paymentQueueItems || [...INITIAL_PAYMENT_QUEUE];
        this.settlementBatches = data.settlementBatches || [...INITIAL_SETTLEMENT_BATCHES];
        this.monthlyClosings = data.monthlyClosings || [...INITIAL_MONTHLY_CLOSINGS];
        this.financialAuditLogs = data.financialAuditLogs || [];
        if (data.documents) {
          const existingDocIds = new Set((data.documents as UnifiedFocusPointDocument[]).map(d => d.id));
          const missingDocs = INITIAL_FOCUSPOINT_DOCUMENTS.filter(d => !existingDocIds.has(d.id));
          this.documents = [...data.documents, ...missingDocs].map(d => this.migrateDocumentToZyzus(d));
        } else {
          this.documents = [...INITIAL_FOCUSPOINT_DOCUMENTS];
        }
        if (data.officialDocuments) {
          this.officialDocuments = (data.officialDocuments as OfficialDocument[]).map(d => this.migrateOfficialDocToZyzus(d));
        }
        this.financeSettings = data.financeSettings || INITIAL_FINANCE_SETTINGS;
        if (data.academicData) {
          academicStoreEngine.loadFromData(data.academicData);
        }
        this.hydratePersistentAvatars();
        return;
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial mock data');
    }

    this.resetToDefaults();
  }

  private hydratePersistentAvatars() {
    try {
      const isSuperAdminDeleted = safeStorage.getItem('fp_super_admin_avatar_deleted') === 'true';
      const saCached = isSuperAdminDeleted
        ? ''
        : (safeStorage.getItem('fp_super_admin_avatar') ||
           safeStorage.getItem('fp_superadmin_avatar') ||
           safeStorage.getItem('fp_user_avatar_usr-super-admin') ||
           safeStorage.getItem('fp_user_avatar_usr-superadmin') ||
           '');

      this.users.forEach(u => {
        const isSA =
          u.role === 'SUPER_ADMIN' ||
          (u as any).role === 'super_admin' ||
          u.email === 'superadmin@focuspoint.internal' ||
          u.id === 'usr-super-admin' ||
          u.id === 'usr-superadmin';

        if (isSA) {
          if (isSuperAdminDeleted) {
            u.avatarUrl = '';
            u.avatar = '';
          } else if (saCached) {
            u.avatarUrl = saCached;
            u.avatar = saCached;
          }
          return;
        }

        const cached = safeStorage.getItem(`fp_user_avatar_${u.id}`) ||
          (u.email ? safeStorage.getItem(`fp_user_avatar_${u.email.toLowerCase()}`) : null) ||
          ((u.role === 'LIBRARY_OWNER' || (u as any).role === 'library_owner') ? safeStorage.getItem('fp_owner_avatar') : null) ||
          ((u.role === 'DISTRICT_ADMIN' || (u as any).role === 'district_admin') ? safeStorage.getItem('fp_district_admin_avatar') : null);
        if (cached) {
          u.avatarUrl = cached;
          u.avatar = cached;
        }
      });

      this.libraries.forEach(lib => {
        const owner = this.users.find(u => u.id === lib.ownerId || (u.name && lib.ownerName && u.name.toLowerCase() === lib.ownerName.toLowerCase()));
        const cached = owner ? (owner.avatarUrl || owner.avatar) : safeStorage.getItem('fp_owner_avatar');
        if (cached) {
          lib.ownerAvatar = cached;
        }
      });
    } catch (e) {
      console.warn('Error hydrating avatars:', e);
    }
  }

  public resetToDefaults() {
    this.users = [...MOCK_USERS];
    this.districts = [...MOCK_DISTRICTS];
    this.teachers = [...MOCK_TEACHERS];
    this.libraries = [...MOCK_LIBRARIES];
    this.tutorRequests = [...MOCK_TUTOR_REQUESTS];
    this.bookings = [...MOCK_BOOKINGS];
    this.attendance = [...MOCK_ATTENDANCE];
    this.invoices = [...MOCK_INVOICES];
    this.notifications = [...MOCK_NOTIFICATIONS];
    this.supportTickets = [...MOCK_SUPPORT_TICKETS];
    this.auditLogs = [...MOCK_AUDIT_LOGS];
    this.libraryStudents = this.initLibraryStudents();
    this.teacherAssignments = this.initTeacherAssignments();
    this.teacherPayouts = this.initTeacherPayouts();
    this.libraryExpenses = this.initLibraryExpenses();
    this.librarySettlements = this.initLibrarySettlements();
    this.libraryNotificationSettings = {};
    this.districtExpenses = this.initDistrictExpenses();
    this.commissionConfigs = this.initCommissionConfigs();
    this.teacherDisbursements = this.initTeacherDisbursements();
    this.announcements = this.initAnnouncements();
    this.manualBookings = this.initManualBookings();
    this.leftTeachers = this.initLeftTeachers();
    this.demoPricingRules = this.initDemoPricingRules();
    this.demoBookings = [];
    this.studyMaterials = [...MOCK_STUDY_MATERIALS];
    this.studyMaterialOffers = [...MOCK_STUDY_MATERIAL_OFFERS];
    this.studyMaterialPolicies = [...MOCK_STUDY_MATERIAL_DOWNLOAD_POLICIES];
    this.studyMaterialPricingRules = [...MOCK_STUDY_MATERIAL_PRICING_RULES];
    this.studyMaterialPurchases = [...MOCK_STUDY_MATERIAL_PURCHASES];
    this.studyMaterialDownloads = [...MOCK_STUDY_MATERIAL_DOWNLOADS];
    this.teacherRegistrationPricingRules = [...INITIAL_TEACHER_REGISTRATION_PRICING_RULES];
    this.teacherRegistrationPricingHistory = [...INITIAL_TEACHER_REGISTRATION_HISTORY];
    this.teacherRegistrationPayments = [...INITIAL_TEACHER_REGISTRATION_PAYMENTS];
    this.librarySubscriptionPlans = [...MOCK_LIBRARY_SUBSCRIPTION_PLANS];
    this.librarySubscriptionPricingRules = [...MOCK_LIBRARY_SUBSCRIPTION_PRICING_RULES];
    this.librarySubscriptions = [...MOCK_LIBRARY_SUBSCRIPTIONS];
    this.librarySubscriptionPayments = [...MOCK_LIBRARY_SUBSCRIPTION_PAYMENTS];
    this.librarySubscriptionCancellations = [];
    this.districtExpenseClaims = [...INITIAL_EXPENSE_CLAIMS];
    this.teacherPayrollItems = [...INITIAL_TEACHER_PAYROLL];
    this.librarySettlementRecords = [...INITIAL_LIBRARY_SETTLEMENTS];
    this.paymentQueueItems = [...INITIAL_PAYMENT_QUEUE];
    this.settlementBatches = [...INITIAL_SETTLEMENT_BATCHES];
    this.monthlyClosings = [...INITIAL_MONTHLY_CLOSINGS];
    this.financialAuditLogs = [];
    this.officialDocuments = [...INITIAL_OFFICIAL_DOCUMENTS];
    this.documents = [...INITIAL_FOCUSPOINT_DOCUMENTS];
    this.financeSettings = INITIAL_FINANCE_SETTINGS;
    academicStoreEngine.resetToDefaults();
    this.hydratePersistentAvatars();
    this.saveToStorage();
  }

  private initDemoPricingRules(): DemoPricingRule[] {
    return [
      {
        id: 'rule-pan-tuition',
        service_type: 'HOME_TUITION',
        scope_type: 'PAN_INDIA',
        price: 49,
        is_active: true,
        start_date: '2025-01-01',
        created_by: 'Super Admin',
        created_at: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'rule-pan-library',
        service_type: 'LIBRARY',
        scope_type: 'PAN_INDIA',
        price: 0,
        is_active: true,
        start_date: '2025-01-01',
        created_by: 'Super Admin',
        created_at: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'rule-up-library',
        service_type: 'LIBRARY',
        scope_type: 'STATE',
        state: 'Uttar Pradesh',
        price: 25,
        is_active: true,
        start_date: '2025-01-01',
        created_by: 'Super Admin',
        created_at: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'rule-ghz-tuition',
        service_type: 'HOME_TUITION',
        scope_type: 'DISTRICT',
        state: 'Uttar Pradesh',
        district: 'Ghazipur',
        price: 39,
        is_active: true,
        start_date: '2025-01-01',
        created_by: 'District Admin',
        created_at: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'rule-lib-central',
        service_type: 'LIBRARY',
        scope_type: 'PARTICULAR',
        service_id: 'lib-focus-ghazipur-city',
        service_name: 'Central Study Library Ghazipur',
        price: 10,
        is_active: true,
        start_date: '2025-01-01',
        created_by: 'Super Admin',
        created_at: '2025-01-01T00:00:00.000Z'
      }
    ];
  }

  private initLibraryExpenses(): LibraryExpense[] {
    return [
      {
        id: 'exp-01',
        libraryId: 'lib-focus-saidpur',
        title: 'Electricity & Inverter Backup Bill (August-September)',
        category: 'electricity',
        amount: 6500,
        date: '2026-09-02',
        paymentMethod: 'UPI',
        receiptName: 'UPPCL_Bill_Sep2026.pdf',
        notes: 'Commercial meter bill paid via PhonePe',
        createdAt: '2026-09-02T10:30:00Z',
      },
      {
        id: 'exp-02',
        libraryId: 'lib-focus-saidpur',
        title: 'AirTel 5G High-Speed Optical Fiber (300 Mbps)',
        category: 'wifi',
        amount: 2200,
        date: '2026-09-05',
        paymentMethod: 'Bank Transfer',
        receiptName: 'Airtel_Broadband_Invoice.pdf',
        notes: 'Dual router dedicated lease line',
        createdAt: '2026-09-05T11:15:00Z',
      },
      {
        id: 'exp-03',
        libraryId: 'lib-focus-saidpur',
        title: 'Housekeeping, Sanitization & Desk Cleaning Staff',
        category: 'staff',
        amount: 3500,
        date: '2026-09-07',
        paymentMethod: 'Cash',
        notes: 'Bi-monthly cleaning maintenance salary',
        createdAt: '2026-09-07T14:00:00Z',
      },
      {
        id: 'exp-04',
        libraryId: 'lib-focus-saidpur',
        title: 'RO Purifier Servicing & Filter Replacement',
        category: 'water',
        amount: 1200,
        date: '2026-09-09',
        paymentMethod: 'Cash',
        notes: 'Kent RO membrane & pre-carbon filter service',
        createdAt: '2026-09-09T16:30:00Z',
      },
      {
        id: 'exp-05',
        libraryId: 'lib-focus-saidpur',
        title: 'Voltas 2-Ton Inverter AC Seasonal Maintenance',
        category: 'maintenance',
        amount: 1800,
        date: '2026-09-11',
        paymentMethod: 'UPI',
        notes: 'Gas top-up and condenser cleaning for Hall B',
        createdAt: '2026-09-11T12:00:00Z',
      }
    ];
  }

  private initLibrarySettlements(): LibrarySettlement[] {
    return [
      {
        id: 'SETTLE-2026-08',
        libraryId: 'lib-focus-saidpur',
        month: 'August 2026',
        grossAmount: 38000,
        commissionRate: 0,
        commissionAmount: 0,
        otherDeductions: 0,
        netAmount: 38000,
        settlementDate: '2026-09-05',
        expectedDate: '2026-09-05',
        status: 'settled',
        payoutMethod: 'Direct Bank Transfer (NEFT)',
        bankAccountMasked: 'Account ending •••• 8821',
        utr: 'HDFC9821840192',
        transactionReference: 'FP-PAY-2026-08-982',
        paymentSource: "ZYZU'S Study Hall Direct Payout",
        createdAt: '2026-09-05T10:00:00Z',
      },
      {
        id: 'SETTLE-2026-07',
        libraryId: 'lib-focus-saidpur',
        month: 'July 2026',
        grossAmount: 35000,
        commissionRate: 0,
        commissionAmount: 0,
        otherDeductions: 0,
        netAmount: 35000,
        settlementDate: '2026-08-05',
        expectedDate: '2026-08-05',
        status: 'settled',
        payoutMethod: 'Direct Bank Transfer (NEFT)',
        bankAccountMasked: 'Account ending •••• 8821',
        utr: 'HDFC7819203819',
        transactionReference: 'FP-PAY-2026-07-781',
        paymentSource: "ZYZU'S Study Hall Direct Payout",
        createdAt: '2026-08-05T10:00:00Z',
      },
      {
        id: 'SETTLE-2026-06',
        libraryId: 'lib-focus-saidpur',
        month: 'June 2026',
        grossAmount: 32000,
        commissionRate: 0,
        commissionAmount: 0,
        otherDeductions: 0,
        netAmount: 32000,
        settlementDate: '2026-07-05',
        expectedDate: '2026-07-05',
        status: 'settled',
        payoutMethod: 'Direct Bank Transfer (NEFT)',
        bankAccountMasked: 'Account ending •••• 8821',
        utr: 'HDFC6628190381',
        transactionReference: 'FP-PAY-2026-06-662',
        paymentSource: "ZYZU'S Escrow Settlement",
        createdAt: '2026-07-05T10:00:00Z',
      }
    ];
  }

  private initDistrictExpenses(): DistrictExpense[] {
    return [
      {
        id: 'DEXP-GHZ-001',
        district: 'Ghazipur',
        area: 'Lanka',
        locality: 'Lanka Crossing',
        category: 'Advertising',
        amount: 8500,
        date: '2026-09-05',
        description: "Lanka Crossing & Bus Station hoardings for ZYZU'S Study Desk & Home Tutor launch",
        remarks: 'Quarterly banner setup approved by Super Admin',
        voucherNo: 'VCH-ADV-2026-09-01',
        recordedBy: 'Manoj Rai (District Admin)',
        createdAt: '2026-09-05T10:00:00Z',
      },
      {
        id: 'DEXP-GHZ-002',
        district: 'Ghazipur',
        area: 'Saidpur',
        locality: 'Saidpur Market',
        category: 'Office Expenses',
        amount: 4200,
        date: '2026-09-08',
        description: 'Stationery, inspection forms, identity stamp, and visitor log registers',
        remarks: 'Procured from Local Saidpur Stationers',
        voucherNo: 'VCH-OFF-2026-09-02',
        recordedBy: 'Manoj Rai (District Admin)',
        createdAt: '2026-09-08T11:30:00Z',
      },
      {
        id: 'DEXP-GHZ-003',
        district: 'Ghazipur',
        area: 'Station Road',
        locality: 'Civil Lines',
        category: 'Travel',
        amount: 2800,
        date: '2026-09-10',
        description: 'District regulatory field audit for 4 new library applicants across Mohammadabad & Zamania',
        remarks: 'Fuel allowance & local transport voucher',
        voucherNo: 'VCH-TRV-2026-09-03',
        recordedBy: 'Manoj Rai (District Admin)',
        createdAt: '2026-09-10T16:00:00Z',
      },
      {
        id: 'DEXP-GHZ-004',
        district: 'Ghazipur',
        area: 'Zamania',
        locality: 'Zamania Station Road',
        category: 'Internet',
        amount: 1500,
        date: '2026-09-12',
        description: 'Nodal verification desk fiber broadband recharge (September 2026)',
        remarks: 'Airtel Xstream broadband bill',
        voucherNo: 'VCH-NET-2026-09-04',
        recordedBy: 'Manoj Rai (District Admin)',
        createdAt: '2026-09-12T09:15:00Z',
      },
      {
        id: 'DEXP-GHZ-005',
        district: 'Ghazipur',
        area: 'Mohammadabad',
        locality: 'Tehsil Road',
        category: 'Marketing',
        amount: 5500,
        date: '2026-09-13',
        description: 'Pamphlet distribution and digital social campaign for NEET/JEE batch home tutors',
        remarks: 'Paid to print vendor',
        voucherNo: 'VCH-MKT-2026-09-05',
        recordedBy: 'Manoj Rai (District Admin)',
        createdAt: '2026-09-13T14:45:00Z',
      },
    ];
  }

  private initCommissionConfigs(): Record<string, CommissionConfig> {
    return {
      'Ghazipur': {
        id: 'COMM-GHZ-01',
        district: 'Ghazipur',
        defaultLibraryCommissionRate: 10,
        defaultTuitionCommissionRate: 15,
        libraryOverrides: {
          'lib-focus-saidpur': 10,
          'lib-gyanodaya-lanka': 12,
        },
        teacherOverrides: {
          'usr-tch-1': 12,
        },
        updatedAt: '2026-09-01T00:00:00Z',
        updatedBy: 'Manoj Rai',
      }
    };
  }

  private initTeacherDisbursements(): TeacherDisbursementRecord[] {
    return [
      {
        id: 'DISB-TCH-2026-09-01',
        teacherId: 'usr-tch-1',
        teacherName: 'Anand Verma',
        teacherPhone: '9876543210',
        district: 'Ghazipur',
        area: 'Lanka',
        month: 'September 2026',
        scheduledDate: '2026-09-30',
        grossEarnings: 32000,
        commissionRate: 12,
        commissionDeducted: 3840,
        netPayable: 28160,
        status: 'DUE',
        invoiceNumber: 'INV-TCH-SEP-001',
        notes: 'Scheduled for month-end payout run on 30th Sep',
      },
      {
        id: 'DISB-TCH-2026-09-02',
        teacherId: 'usr-tch-2',
        teacherName: 'Kavita Singh',
        teacherPhone: '9876543212',
        district: 'Ghazipur',
        area: 'Station Road',
        month: 'September 2026',
        scheduledDate: '2026-09-30',
        grossEarnings: 24000,
        commissionRate: 15,
        commissionDeducted: 3600,
        netPayable: 20400,
        status: 'PENDING',
        invoiceNumber: 'INV-TCH-SEP-002',
        notes: 'Pending attendance verification of final weekly session',
      },
      {
        id: 'DISB-TCH-2026-09-03',
        teacherId: 'usr-tch-3',
        teacherName: 'Rajesh Tiwari',
        teacherPhone: '9876543213',
        district: 'Ghazipur',
        area: 'Saidpur',
        month: 'September 2026',
        scheduledDate: '2026-09-30',
        grossEarnings: 45000,
        commissionRate: 15,
        commissionDeducted: 6750,
        netPayable: 38250,
        status: 'PAID',
        paidAt: '2026-09-14T11:00:00Z',
        transactionRef: 'SBI-NEFT-9281048102',
        invoiceNumber: 'INV-TCH-SEP-003',
        notes: 'Mid-term emergency advance settlement disbursed',
      },
      {
        id: 'DISB-TCH-2026-08-01',
        teacherId: 'usr-tch-1',
        teacherName: 'Anand Verma',
        teacherPhone: '9876543210',
        district: 'Ghazipur',
        area: 'Lanka',
        month: 'August 2026',
        scheduledDate: '2026-08-30',
        grossEarnings: 30000,
        commissionRate: 12,
        commissionDeducted: 3600,
        netPayable: 26400,
        status: 'PAID',
        paidAt: '2026-08-30T17:30:00Z',
        transactionRef: 'HDFC-IMPS-882194019',
        invoiceNumber: 'INV-TCH-AUG-001',
      },
    ];
  }

  private initAnnouncements(): AnnouncementCircular[] {
    return [
      {
        id: 'ANN-2026-01',
        title: 'Mandatory Fire Safety & Ventilation Inspection for All Ghazipur Study Centers',
        description: 'All accredited library premises in Ghazipur District must submit updated fire clearance certificates and confirm operational dual-circuit inverter setups by 25th September.',
        type: 'Circular',
        priority: 'HIGH',
        sender: 'Super Admin Directorate',
        senderRole: 'SUPER_ADMIN',
        targetDistrict: 'Ghazipur',
        targetAudience: 'LIBRARIES',
        date: '2026-09-12',
        createdAt: '2026-09-12T10:00:00Z',
        isRead: false,
        replies: [
          {
            id: 'REP-01',
            senderId: 'usr-da-ghz',
            senderName: 'Manoj Rai (Ghazipur Admin)',
            senderRole: 'DISTRICT_ADMIN',
            replyText: 'Inspection notice dispatched to 6 verified library owners. Field verifications in Saidpur and Lanka booked for this weekend.',
            createdAt: '2026-09-13T14:20:00Z',
          }
        ]
      },
      {
        id: 'ANN-2026-02',
        title: '🚨 URGENT: Heavy Monsoon Rain Alert & Electric Safety Protocols in Low-Lying Localities',
        description: 'District Disaster Management Office has issued an orange alert for Ghazipur, Zamania, and Ganga river basin regions. Ensure all basement study halls activate water-pump failover and shift ground-level CPU towers.',
        type: 'Urgent Alert',
        priority: 'URGENT',
        sender: 'State Command Center',
        senderRole: 'SUPER_ADMIN',
        targetDistrict: 'ALL',
        targetAudience: 'ALL',
        date: '2026-09-14',
        createdAt: '2026-09-14T08:30:00Z',
        isRead: false,
        replies: []
      },
      {
        id: 'ANN-2026-03',
        title: 'Teacher Payout Settlement Cycle for September 2026 Announced',
        description: 'The September monthly tuition fee deduction and educator net settlement processing window will open on 28th September and conclude on 30th September. District admins are advised to clear all pending student fees.',
        type: 'Payment Notice',
        priority: 'MEDIUM',
        sender: 'Finance & Compliance Bureau',
        senderRole: 'SUPER_ADMIN',
        targetDistrict: 'ALL',
        targetAudience: 'DISTRICT_ADMINS',
        date: '2026-09-10',
        createdAt: '2026-09-10T11:00:00Z',
        isRead: true,
        replies: []
      }
    ];
  }

  private initManualBookings(): ManualSeatBookingRecord[] {
    return [
      {
        id: 'MAN-BK-001',
        libraryId: 'lib-focus-saidpur',
        libraryName: "ZYZU'S Premier Study Hall",
        area: 'Saidpur',
        seatNumber: 'Seat 14',
        studentName: 'Ramesh Kumar Gupta (Walk-in)',
        studentPhone: '9876501234',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        shiftName: 'Morning Shift (07:00 AM - 01:00 PM)',
        monthlyFee: 800,
        paidAmount: 800,
        dueAmount: 0,
        bookingStatus: 'ACTIVE',
        bookedByRole: 'LIBRARY_OWNER',
        bookedByName: 'Vipin Yadav',
        createdAt: '2026-09-01T08:00:00Z',
      },
      {
        id: 'MAN-BK-002',
        libraryId: 'lib-focus-saidpur',
        libraryName: "ZYZU'S Premier Study Hall",
        area: 'Saidpur',
        seatNumber: 'Seat 28',
        studentName: 'Sunil Jaiswal (Cash Booking)',
        studentPhone: '9876505678',
        startDate: '2026-09-05',
        endDate: '2026-10-04',
        shiftName: 'Evening Shift (01:00 PM - 07:00 PM)',
        monthlyFee: 850,
        paidAmount: 500,
        dueAmount: 350,
        bookingStatus: 'ACTIVE',
        bookedByRole: 'LIBRARY_OWNER',
        bookedByName: 'Vipin Yadav',
        createdAt: '2026-09-05T14:10:00Z',
      }
    ];
  }

  private initLeftTeachers(): LeftTeacherRecord[] {
    return [
      {
        id: 'LEFT-TCH-001',
        teacherId: 'tch-old-01',
        teacherName: 'Deepak Upadhyay',
        phone: '9876543999',
        email: 'deepak.upadhyay@example.com',
        subject: 'Mathematics (Class 11-12)',
        area: 'Saidpur',
        district: 'Ghazipur',
        joiningDate: '2025-08-15',
        leavingDate: '2026-07-31',
        reason: 'Relocated to Prayagraj for Government Lecturer Post appointment',
        previousStudentsCount: 14,
        totalEarnings: 145000,
        settlementStatus: 'SETTLED',
        clearanceNotes: 'All tuition batches handed over to Anand Verma. Final settlement cleared.',
      },
      {
        id: 'LEFT-TCH-002',
        teacherId: 'tch-old-02',
        teacherName: 'Shalini Srivastava',
        phone: '9876543888',
        email: 'shalini.s@example.com',
        subject: 'Biology & NEET Foundation',
        area: 'Lanka',
        district: 'Ghazipur',
        joiningDate: '2025-10-01',
        leavingDate: '2026-08-15',
        reason: 'Personal health leave / career hiatus',
        previousStudentsCount: 8,
        totalEarnings: 82000,
        settlementStatus: 'SETTLED',
        clearanceNotes: 'Full student fee reconciliation signed by District Admin.',
      }
    ];
  }

  private saveToStorage() {
    try {
      safeStorage.setItem('fp_mock_store_v1', JSON.stringify({
        users: this.users,
        districts: this.districts,
        teachers: this.teachers,
        libraries: this.libraries,
        tutorRequests: this.tutorRequests,
        bookings: this.bookings,
        attendance: this.attendance.slice(-50),
        invoices: this.invoices.slice(-50),
        notifications: this.notifications.slice(-30),
        supportTickets: this.supportTickets.slice(-30),
        auditLogs: this.auditLogs.slice(-20),
        libraryStudents: this.libraryStudents,
        teacherAssignments: this.teacherAssignments,
        teacherPayouts: this.teacherPayouts,
        libraryExpenses: this.libraryExpenses,
        librarySettlements: this.librarySettlements,
        libraryNotificationSettings: this.libraryNotificationSettings,
        districtExpenses: this.districtExpenses,
        commissionConfigs: this.commissionConfigs,
        teacherDisbursements: this.teacherDisbursements,
        announcements: this.announcements,
        manualBookings: this.manualBookings,
        leftTeachers: this.leftTeachers,
        demoPricingRules: this.demoPricingRules,
        demoBookings: this.demoBookings,
        studyMaterials: this.studyMaterials,
        studyMaterialOffers: this.studyMaterialOffers,
        studyMaterialPolicies: this.studyMaterialPolicies,
        studyMaterialPricingRules: this.studyMaterialPricingRules,
        studyMaterialPurchases: this.studyMaterialPurchases,
        studyMaterialDownloads: this.studyMaterialDownloads,
        teacherRegistrationPricingRules: this.teacherRegistrationPricingRules,
        teacherRegistrationPricingHistory: this.teacherRegistrationPricingHistory,
        teacherRegistrationPayments: this.teacherRegistrationPayments,
        librarySubscriptionPlans: this.librarySubscriptionPlans,
        librarySubscriptionPricingRules: this.librarySubscriptionPricingRules,
        librarySubscriptions: this.librarySubscriptions,
        librarySubscriptionPayments: this.librarySubscriptionPayments,
        librarySubscriptionCancellations: this.librarySubscriptionCancellations,
        districtExpenseClaims: this.districtExpenseClaims,
        teacherPayrollItems: this.teacherPayrollItems,
        librarySettlementRecords: this.librarySettlementRecords,
        paymentQueueItems: this.paymentQueueItems,
        settlementBatches: this.settlementBatches,
        monthlyClosings: this.monthlyClosings,
        financialAuditLogs: this.financialAuditLogs.slice(-30),
        officialDocuments: this.officialDocuments.slice(-20),
        documents: this.documents.slice(-20),
        financeSettings: this.financeSettings,
        academicData: academicStoreEngine.dumpData(),
      }));
    } catch (e) {
      console.warn('Could not save store to localStorage, continuing with in-memory state', e);
    }
  }

  private initTeacherPayouts(): TeacherPayout[] {
    return [
      {
        id: 'PO-2026-07',
        teacherId: 'usr-teacher-rajesh',
        month: 'July 2026',
        amount: 14000,
        studentsCount: 3,
        date: '2026-08-05',
        paymentMethod: 'Bank Transfer (NEFT)',
        bankAccountMasked: 'Account ending •••• 3821',
        utr: 'UTR8920194820',
        providerReference: 'HDFC-PAY-98214',
        status: 'paid',
      },
      {
        id: 'PO-2026-06',
        teacherId: 'usr-teacher-rajesh',
        month: 'June 2026',
        amount: 12500,
        studentsCount: 2,
        date: '2026-07-05',
        paymentMethod: 'Bank Transfer (NEFT)',
        bankAccountMasked: 'Account ending •••• 3821',
        utr: 'UTR7649204812',
        providerReference: 'HDFC-PAY-76492',
        status: 'paid',
      }
    ];
  }

  private initLibraryStudents(): LibraryStudent[] {
    return [
      {
        id: 'lib-stu-1',
        libraryId: 'lib-focus-saidpur',
        name: 'Aryan Singh',
        mobile: '9876543210',
        referenceId: 'FP-LIB-001',
        seatNumber: 'Seat 03',
        shiftId: 'sh-1',
        shiftName: 'Morning Shift',
        joiningDate: '2026-08-01',
        monthlyFee: 499,
        feeStatus: 'PAID',
        attendanceRate: 94,
        isOnlineUser: true,
        userId: 'usr-student-aryan',
      },
      {
        id: 'lib-stu-2',
        libraryId: 'lib-focus-saidpur',
        name: 'Aman Yadav (Offline Walk-in)',
        mobile: '9844556677',
        guardianName: 'Ramakant Yadav',
        referenceId: 'FP-LIB-OFF-04',
        seatNumber: 'Seat 08',
        shiftId: 'sh-2',
        shiftName: 'Afternoon Shift',
        joiningDate: '2026-08-15',
        monthlyFee: 499,
        feeStatus: 'PAID',
        attendanceRate: 88,
        isOnlineUser: false,
      }
    ];
  }

  private initTeacherAssignments(): TeacherAssignment[] {
    return [
      {
        id: 'asg-gzp-01',
        tutorRequestId: 'req-101',
        studentId: 'usr-student-aryan',
        studentName: 'Aryan Maurya',
        studentPhone: '9876543210',
        teacherId: 'usr-teacher-rajesh',
        teacherName: 'Dr. Rajesh Sharma',
        teacherPhone: '9876543211',
        districtId: 'dist-gzp',
        district: 'Ghazipur',
        subjects: ['Physics', 'Mathematics'],
        className: 'Class 12',
        grade: 'Class 12',
        schedule: 'Mon, Wed, Fri (05:00 PM - 06:30 PM)',
        monthlyFee: 5000,
        startDate: '2026-08-01',
        address: 'Station Road, Lanka, Ghazipur',
        teachingMode: 'Home Tuition',
        status: 'ACTIVE',
      },
      {
        id: 'asg-gzp-02',
        tutorRequestId: 'req-102',
        studentId: 'usr-stu-2',
        studentName: 'Priya Sharma',
        studentPhone: '9876543211',
        teacherId: 'usr-teacher-priya',
        teacherName: 'Priya Verma',
        teacherPhone: '9876543212',
        districtId: 'dist-gzp',
        district: 'Ghazipur',
        subjects: ['Mathematics'],
        className: 'Class 10',
        grade: 'Class 10',
        schedule: 'Tue, Thu, Sat (04:00 PM - 05:30 PM)',
        monthlyFee: 4200,
        startDate: '2026-08-10',
        address: 'Gora Bazar, Ghazipur',
        teachingMode: 'Home Tuition',
        status: 'ACTIVE',
      }
    ];
  }

  // --- Users & Auth ---
  public getUsers() {
    if (!this.users || this.users.length === 0) {
      this.users = [...MOCK_USERS];
    }
    const existingIds = new Set(this.users.map(u => u.id));
    for (const mu of MOCK_USERS) {
      if (!existingIds.has(mu.id)) {
        this.users.push(mu);
      }
    }
    return this.users;
  }
  public getUserByEmail(email: string) { return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()); }
  public getUserById(id: string) {
    let user = this.users.find(u => u.id === id);
    if (!user) {
      user = MOCK_USERS.find(u => u.id === id);
      if (user) {
        this.users.push(user);
      }
    }
    if (!user) return undefined;
    const isSA = user.role === 'SUPER_ADMIN' || (user as any).role === 'super_admin' || user.id === 'usr-super-admin' || user.id === 'usr-superadmin' || user.email === 'superadmin@focuspoint.internal';
    if (isSA) {
      try {
        const isDeleted = safeStorage.getItem('fp_super_admin_avatar_deleted') === 'true';
        if (isDeleted) {
          return { ...user, avatarUrl: '', avatar: '' };
        }
        const saCached = safeStorage.getItem('fp_super_admin_avatar') || safeStorage.getItem('fp_superadmin_avatar');
        if (saCached) {
          return { ...user, avatarUrl: saCached, avatar: saCached };
        }
      } catch {}
    }
    return user;
  }
  public addUser(user: User) {
    this.users.push(user);
    this.saveToStorage();
    return user;
  }
  public updateUser(id: string, updates: Partial<User>) {
    let idx = this.users.findIndex(u => u.id === id);
    if (idx === -1 && updates.email) {
      idx = this.users.findIndex(u => u.email && u.email.toLowerCase() === updates.email!.toLowerCase());
    }
    if (idx === -1 && updates.mobile) {
      idx = this.users.findIndex(u => (u.mobile && u.mobile === updates.mobile) || (u.phone && u.phone === updates.mobile));
    }
    if (idx === -1) {
      try {
        const stored = safeStorage.getItem('fp_current_session_user');
        if (stored) {
          const sessionUser = JSON.parse(stored);
          if (sessionUser.id === id || (updates.email && sessionUser.email === updates.email)) {
            this.users.push({ ...sessionUser, ...updates });
            idx = this.users.length - 1;
          }
        }
      } catch (e) {}
    }

    if (idx !== -1) {
      const merged = { ...this.users[idx], ...updates };
      if (updates.avatarUrl !== undefined) merged.avatar = updates.avatarUrl;
      if (updates.avatar !== undefined) merged.avatarUrl = updates.avatar;
      this.users[idx] = merged;

      const photo = merged.avatarUrl || merged.avatar || '';

      // Persist avatar in dedicated keys for failsafe redundancy without quota overflow
      if (photo && photo.trim().length > 0) {
        try {
          safeSetLocalStorage(`fp_user_avatar_${merged.id}`, photo);
          if (merged.email) safeSetLocalStorage(`fp_user_avatar_${merged.email.toLowerCase()}`, photo);
          if (merged.role === 'SUPER_ADMIN' || (merged as any).role === 'super_admin' || merged.id === 'usr-super-admin' || merged.id === 'usr-superadmin') {
            safeSetLocalStorage('fp_super_admin_avatar', photo);
            safeSetLocalStorage('fp_superadmin_avatar', photo);
            safeSetLocalStorage('fp_user_avatar_usr-super-admin', photo);
            safeSetLocalStorage('fp_user_avatar_usr-superadmin', photo);
            safeStorage.removeItem('fp_super_admin_avatar_deleted');
          }
          if (merged.role === 'LIBRARY_OWNER' || (merged as any).role === 'library_owner') {
            safeSetLocalStorage('fp_owner_avatar', photo);
          }
          if (merged.role === 'DISTRICT_ADMIN' || (merged as any).role === 'district_admin') {
            safeSetLocalStorage('fp_district_admin_avatar', photo);
          }
        } catch (e) {
          console.warn('Failsafe avatar cache write failed:', e);
        }
      } else if (updates.avatarUrl === '' || updates.avatar === '') {
        try {
          safeStorage.removeItem(`fp_user_avatar_${merged.id}`);
          if (merged.email) safeStorage.removeItem(`fp_user_avatar_${merged.email.toLowerCase()}`);
          if (merged.role === 'SUPER_ADMIN' || (merged as any).role === 'super_admin' || merged.id === 'usr-super-admin' || merged.id === 'usr-superadmin') {
            safeStorage.removeItem('fp_super_admin_avatar');
            safeStorage.removeItem('fp_superadmin_avatar');
            safeStorage.removeItem('fp_user_avatar_usr-super-admin');
            safeStorage.removeItem('fp_user_avatar_usr-superadmin');
            safeStorage.setItem('fp_super_admin_avatar_deleted', 'true');
          }
          if (merged.role === 'LIBRARY_OWNER' || (merged as any).role === 'library_owner') {
            safeStorage.removeItem('fp_owner_avatar');
          }
          if (merged.role === 'DISTRICT_ADMIN' || (merged as any).role === 'district_admin') {
            safeStorage.removeItem('fp_district_admin_avatar');
          }
        } catch (e) {}
      }

      // If library owner, update ownerAvatar on their libraries
      if (merged.role === 'LIBRARY_OWNER' || (merged as any).role === 'library_owner') {
        this.libraries.forEach(lib => {
          const matchOwner = lib.ownerId === merged.id || 
            (lib.ownerName && merged.name && lib.ownerName.toLowerCase() === merged.name.toLowerCase()) ||
            (lib.ownerEmail && merged.email && lib.ownerEmail.toLowerCase() === merged.email.toLowerCase()) ||
            (lib.ownerPhone && (lib.ownerPhone === merged.mobile || lib.ownerPhone === merged.phone));
          if (matchOwner) {
            lib.ownerAvatar = photo;
          }
        });
      }

      // If student, sync avatar to bookings and library students
      if (merged.role === 'STUDENT' || (merged as any).role === 'student') {
        const studentPhones = [merged.phone, merged.mobile, (merged as any).whatsappNumber].filter(Boolean);
        this.bookings.forEach(b => {
          const matchId = b.userId === merged.id || b.studentId === merged.id;
          const matchName = b.studentName && merged.name && b.studentName.toLowerCase() === merged.name.toLowerCase();
          const matchPhone = b.studentPhone && studentPhones.includes(b.studentPhone);
          if (matchId || matchName || matchPhone) {
            b.studentAvatar = photo;
          }
        });
        this.libraryStudents.forEach(s => {
          const matchId = s.userId === merged.id || (s as any).studentId === merged.id;
          const matchName = s.name && merged.name && s.name.toLowerCase() === merged.name.toLowerCase();
          const matchPhone = s.phone && studentPhones.includes(s.phone);
          if (matchId || matchName || matchPhone) {
            s.avatarUrl = photo;
            s.avatar = photo;
          }
        });
      }

      this.saveToStorage();
      return this.users[idx];
    }
    return null;
  }

  // --- Districts ---
  public getDistricts() { return this.districts; }
  public getDistrictById(id: string) { return this.districts.find(d => d.id === id); }
  public addDistrict(district: District) {
    this.districts.push(district);
    this.saveToStorage();
    return district;
  }
  public updateDistrict(id: string, updates: Partial<District>) {
    const idx = this.districts.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.districts[idx] = { ...this.districts[idx], ...updates };
      this.saveToStorage();
      return this.districts[idx];
    }
    return null;
  }

  // --- Teachers ---
  public getTeachers(filters?: { districtId?: string; status?: VerificationStatus; subject?: string } | string) {
    let result = [...this.teachers];
    let districtTarget: string | undefined;
    if (typeof filters === 'string') {
      districtTarget = filters.toLowerCase().trim();
    } else if (filters?.districtId) {
      districtTarget = filters.districtId.toLowerCase().trim();
    }
    if (districtTarget) {
      result = result.filter(t => 
        (t.districtId && t.districtId.toLowerCase().trim() === districtTarget) ||
        (t.districtName && t.districtName.toLowerCase().trim() === districtTarget) ||
        (t.district && t.district.toLowerCase().trim() === districtTarget)
      );
    }
    if (typeof filters === 'object' && filters !== null) {
      if (filters.status) result = result.filter(t => t.verificationStatus === filters.status);
      if (filters.subject) result = result.filter(t => t.subjects.includes(filters.subject!));
    }
    return result;
  }
  public getTeacherById(id: string) { return this.teachers.find(t => t.id === id); }
  public addTeacher(teacher: Teacher) {
    this.teachers.push(teacher);
    this.saveToStorage();
    return teacher;
  }
  public updateTeacherStatus(id: string, status: VerificationStatus, rejectionReason?: string) {
    const t = this.teachers.find(x => x.id === id);
    if (t) {
      t.verificationStatus = status;
      if (rejectionReason) t.rejectionReason = rejectionReason;
      this.saveToStorage();
      return t;
    }
    return null;
  }

  public updateTeacherKYC(id: string, status: VerificationStatus, reason?: string, adminName: string = 'District Admin') {
    const t = this.teachers.find(x => x.id === id);
    if (t) {
      t.verificationStatus = status;
      if (reason) t.rejectionReason = reason;
      if (status === 'APPROVED' || status === 'verified') {
        t.rejectionReason = undefined;
      }
      // Create notification
      this.addNotification({
        id: `notif-${Date.now()}-kyc`,
        userId: t.id,
        title: status === 'APPROVED' || status === 'verified' ? 'Credentials Verified!' : 'KYC Verification Update',
        message: status === 'APPROVED' || status === 'verified'
          ? `Congratulations! ${adminName} has verified your credentials and certified your educator profile.`
          : `KYC Review: ${reason || 'Please provide updated documentation to proceed.'}`,
        category: 'APPROVAL',
        isRead: false,
        link: '/teacher/profile',
        createdAt: new Date().toISOString(),
      });
      this.saveToStorage();
      return t;
    }
    return null;
  }

  public saveTeacherProfilePhoto(teacherId: string, photoUrl: string): { teacher: Teacher | null; user: User | null } {
    const t = this.teachers.find(x => x.id === teacherId);
    if (t) {
      t.avatarUrl = photoUrl;
    }
    const u = this.users.find(x => x.id === teacherId);
    if (u) {
      u.avatarUrl = photoUrl;
    }
    try {
      const activeUserStr = safeStorage.getItem('focuspoint_current_user');
      if (activeUserStr) {
        const activeUser = JSON.parse(activeUserStr);
        if (activeUser.id === teacherId) {
          activeUser.avatarUrl = photoUrl;
          safeStorage.setItem('focuspoint_current_user', JSON.stringify(activeUser));
        }
      }
    } catch (e) {
      // ignore
    }
    this.saveToStorage();
    return { teacher: t || null, user: u || null };
  }

  public updateTeacherProfile(teacherId: string, updates: Partial<Teacher>): Teacher | null {
    let t = this.teachers.find(x => x.id === teacherId);
    if (!t) {
      const u = this.users.find(x => x.id === teacherId);
      if (u) {
        t = {
          ...u,
          role: 'TEACHER',
          verificationStatus: 'PENDING',
          subjects: updates.subjects || [],
          experienceYears: 0,
          rating: 0,
          reviewsCount: 0,
          assignedStudentsCount: 0,
          ...updates,
        } as Teacher;
        this.teachers.push(t);
      }
    } else {
      Object.assign(t, updates);
    }

    if (t) {
      const u = this.users.find(x => x.id === teacherId);
      if (u) {
        if (updates.name) u.name = updates.name;
        if (updates.phone) u.phone = updates.phone;
        if (updates.mobile) u.mobile = updates.mobile;
        if (updates.avatarUrl !== undefined) u.avatarUrl = updates.avatarUrl;
        if (updates.bio !== undefined) u.bio = updates.bio;
        if (updates.district) u.district = updates.district;
      }
      this.saveToStorage();
      return t;
    }
    return null;
  }

  public updateTeacherBank(teacherId: string, bankInfo: TeacherBankAccount): Teacher | null {
    const t = this.teachers.find(x => x.id === teacherId);
    if (t) {
      t.bankAccount = bankInfo;
      this.saveToStorage();
      return t;
    }
    return null;
  }

  public updateTeacherDocument(
    teacherId: string, 
    docCategory: 'degreeCertificate' | 'experienceLetter' | 'idProof', 
    docItem: TeacherDocumentItem
  ): Teacher | null {
    const t = this.teachers.find(x => x.id === teacherId);
    if (t) {
      if (!t.documentsUploaded) {
        t.documentsUploaded = {};
      }
      t.documentsUploaded[docCategory] = docItem;
      this.saveToStorage();
      return t;
    }
    return null;
  }

  public addTeacherExperience(teacherId: string, exp: TeacherExperienceRecord): Teacher | null {
    const t = this.teachers.find(x => x.id === teacherId);
    if (t) {
      if (!t.experienceRecords) {
        t.experienceRecords = [];
      }
      t.experienceRecords.unshift(exp);
      this.saveToStorage();
      return t;
    }
    return null;
  }

  public deleteTeacherExperience(teacherId: string, expId: string): Teacher | null {
    const t = this.teachers.find(x => x.id === teacherId);
    if (t && t.experienceRecords) {
      t.experienceRecords = t.experienceRecords.filter(e => e.id !== expId);
      this.saveToStorage();
      return t;
    }
    return null;
  }

  public getTeacherPayouts(teacherId: string): TeacherPayout[] {
    return this.teacherPayouts.filter(p => p.teacherId === teacherId);
  }

  public addTeacherPayout(payout: TeacherPayout): TeacherPayout {
    this.teacherPayouts.unshift(payout);
    this.saveToStorage();
    return payout;
  }

  // --- Libraries ---
  public getLibraries(districtId?: string) {
    let list = this.libraries;
    if (districtId) {
      const target = districtId.toLowerCase().trim();
      list = this.libraries.filter(l => 
        (l.districtId && l.districtId.toLowerCase().trim() === target) ||
        (l.districtName && l.districtName.toLowerCase().trim() === target) ||
        (l.district && l.district.toLowerCase().trim() === target)
      );
    }
    return list.map(l => {
      if (!l.ownerAvatar && l.ownerId) {
        const u = this.users.find(usr => usr.id === l.ownerId || (l.ownerName && usr.name && usr.name.toLowerCase() === l.ownerName.toLowerCase()));
        if (u) l.ownerAvatar = u.avatarUrl || (u as any).avatar;
      }
      return l;
    });
  }
  public getLibraryById(id: string) {
    const lib = this.libraries.find(l => l.id === id);
    if (lib && !lib.ownerAvatar && lib.ownerId) {
      const u = this.users.find(usr => usr.id === lib.ownerId || (lib.ownerName && usr.name && usr.name.toLowerCase() === lib.ownerName.toLowerCase()));
      if (u) lib.ownerAvatar = u.avatarUrl || (u as any).avatar;
    }
    return lib;
  }
  public getLibrariesByOwner(ownerId: string): Library[] {
    return this.libraries.filter(l => l.ownerId === ownerId).map(l => {
      if (!l.ownerAvatar) {
        const u = this.users.find(usr => usr.id === ownerId);
        if (u) l.ownerAvatar = u.avatarUrl || (u as any).avatar;
      }
      return l;
    });
  }

  private libraryChangeListeners: Set<(libId?: string) => void> = new Set();

  public onLibraryChange(cb: (libId?: string) => void): () => void {
    this.libraryChangeListeners.add(cb);
    return () => {
      this.libraryChangeListeners.delete(cb);
    };
  }

  private emitLibraryChange(libId?: string) {
    this.libraryChangeListeners.forEach(cb => {
      try { cb(libId); } catch (e) { console.error(e); }
    });
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('focuspoint:library_status_changed', { detail: { libraryId: libId } }));
      } catch (e) {}
    }
  }

  public addLibrary(lib: Library) {
    this.libraries.push(lib);
    this.saveToStorage();
    this.emitLibraryChange(lib.id);
    return lib;
  }
  public updateLibrary(id: string, updates: Partial<Library>): Library | null {
    const idx = this.libraries.findIndex(l => l.id === id);
    if (idx !== -1) {
      this.libraries[idx] = { ...this.libraries[idx], ...updates };
      this.saveToStorage();
      this.emitLibraryChange(id);
      return this.libraries[idx];
    }
    return null;
  }
  public updateLibraryBank(libraryId: string, bankAccount: LibraryBankAccount): Library | null {
    const lib = this.libraries.find(l => l.id === libraryId);
    if (lib) {
      lib.bankAccount = bankAccount;
      this.saveToStorage();
      return lib;
    }
    return null;
  }
  public updateLibraryKyc(libraryId: string, docCategory: string, docData: TeacherDocumentItem): Library | null {
    const lib = this.libraries.find(l => l.id === libraryId);
    if (lib) {
      if (!lib.premisesKyc) {
        lib.premisesKyc = {};
      }
      lib.premisesKyc[docCategory] = docData;
      this.saveToStorage();
      return lib;
    }
    return null;
  }
  public updateLibraryStatus(id: string, status: VerificationStatus, rejectionReason?: string, auditMeta?: { verifiedBy?: string; verifiedAt?: string; remarks?: string }) {
    const lib = this.libraries.find(l => l.id === id);
    if (lib) {
      lib.verificationStatus = status;
      if (rejectionReason !== undefined) {
        lib.rejectionReason = rejectionReason;
      }
      const upper = String(status || '').toUpperCase();
      if (upper === 'APPROVED' || upper === 'VERIFIED') {
        (lib as any).status = 'active';
        (lib as any).auditStatus = 'VERIFIED';
        (lib as any).verifiedAt = auditMeta?.verifiedAt || new Date().toISOString();
        (lib as any).verifiedBy = auditMeta?.verifiedBy || 'Super Admin';
        (lib as any).auditRemarks = auditMeta?.remarks || rejectionReason || 'Institutional facility accredited and safety certified by Super Admin.';
        lib.verificationStatus = 'APPROVED';
      } else if (upper === 'SUSPENDED') {
        (lib as any).status = 'suspended';
        (lib as any).auditStatus = 'SUSPENDED';
        (lib as any).suspendedAt = new Date().toISOString();
        (lib as any).auditRemarks = rejectionReason || 'Facility suspended pending compliance audit';
        lib.verificationStatus = 'SUSPENDED';
      } else if (upper === 'REJECTED') {
        (lib as any).status = 'rejected';
        (lib as any).auditStatus = 'REJECTED';
        lib.verificationStatus = 'REJECTED';
      }
      this.saveToStorage();
      this.emitLibraryChange(id);
      return lib;
    }
    return null;
  }
  // --- Library Expenses ---
  public getLibraryExpenses(libraryId: string): LibraryExpense[] {
    return this.libraryExpenses.filter(e => e.libraryId === libraryId);
  }

  public addLibraryExpense(expenseData: Omit<LibraryExpense, 'id' | 'createdAt'>): LibraryExpense {
    const newExpense: LibraryExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.libraryExpenses.unshift(newExpense);
    this.saveToStorage();
    return newExpense;
  }

  public deleteLibraryExpense(id: string): boolean {
    const initialLen = this.libraryExpenses.length;
    this.libraryExpenses = this.libraryExpenses.filter(e => e.id !== id);
    if (this.libraryExpenses.length !== initialLen) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // --- Library Settlements ---
  public getLibrarySettlements(libraryId?: string): LibrarySettlement[] {
    if (libraryId) return this.librarySettlements.filter(s => s.libraryId === libraryId);
    return this.librarySettlements;
  }

  // --- Revenue & Analytics ---
  public getLibraryRevenue(libraryId: string) {
    const lib = this.libraries.find(l => l.id === libraryId);
    if (!lib) {
      return {
        totalRevenue: 0,
        onlineCollections: 0,
        counterCollections: 0,
        totalExpenses: 0,
        netProfit: 0,
        netPayout: 0,
        platformFee: 0,
        totalBookingsCount: 0,
        activeStudentsCount: 0,
      };
    }

    const libBookings = this.bookings.filter(b => b.libraryId === libraryId);
    const libStudents = this.libraryStudents.filter(s => s.libraryId === libraryId);
    const libExpenses = this.libraryExpenses.filter(e => e.libraryId === libraryId);

    const onlineBookings = libBookings.filter(b => b.status === 'confirmed' || b.paymentStatus === 'paid');
    const onlineCollections = onlineBookings.reduce((sum, b) => {
      const gross = Number(b.totalAmount || b.amount || 0);
      return sum + (b.creditedAmount !== undefined ? b.creditedAmount : Math.round(gross * 0.95));
    }, 0);
    
    const paidStudents = libStudents.filter(s => s.feeStatus === 'paid' || s.feeStatus === 'PAID');
    const counterCollections = paidStudents.reduce((sum, s) => sum + (Number(s.monthlyFee) || 0), 0);

    const totalRevenue = onlineCollections + counterCollections;
    const platformFee = 0;
    const totalExpenses = libExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const netProfit = Math.max(0, totalRevenue - totalExpenses);
    const netPayout = totalRevenue;

    return {
      totalRevenue,
      onlineCollections,
      counterCollections,
      totalExpenses,
      netProfit,
      netPayout,
      platformFee,
      totalBookingsCount: libBookings.length,
      activeStudentsCount: libStudents.length + onlineBookings.length,
    };
  }

  public getMonthlyRevenueHistory(libraryId: string) {
    const lib = this.libraries.find(l => l.id === libraryId);
    if (!lib) return [];

    const currentRevenue = this.getLibraryRevenue(libraryId);

    // If it's Suresh Yadav's demo library, return 6 complete months
    if (libraryId === 'lib-focus-saidpur') {
      return [
        {
          month: 'April 2026',
          monthShort: 'Apr',
          totalRevenue: 41000,
          onlineCollections: 26000,
          counterCollections: 15000,
          totalExpenses: 13500,
          platformFee: 0,
          netProfit: 27500,
          netPayout: 41000,
          totalBookingsCount: 24,
          occupiedDesks: 27,
          occupancyRate: 68,
        },
        {
          month: 'May 2026',
          monthShort: 'May',
          totalRevenue: 44500,
          onlineCollections: 29000,
          counterCollections: 15500,
          totalExpenses: 14000,
          platformFee: 0,
          netProfit: 30500,
          netPayout: 44500,
          totalBookingsCount: 28,
          occupiedDesks: 29,
          occupancyRate: 72,
        },
        {
          month: 'June 2026',
          monthShort: 'Jun',
          totalRevenue: 48000,
          onlineCollections: 32000,
          counterCollections: 16000,
          totalExpenses: 15500,
          platformFee: 0,
          netProfit: 32500,
          netPayout: 48000,
          totalBookingsCount: 31,
          occupiedDesks: 31,
          occupancyRate: 78,
        },
        {
          month: 'July 2026',
          monthShort: 'Jul',
          totalRevenue: 51500,
          onlineCollections: 35000,
          counterCollections: 16500,
          totalExpenses: 16200,
          platformFee: 0,
          netProfit: 35300,
          netPayout: 51500,
          totalBookingsCount: 34,
          occupiedDesks: 33,
          occupancyRate: 82,
        },
        {
          month: 'August 2026',
          monthShort: 'Aug',
          totalRevenue: 54000,
          onlineCollections: 38000,
          counterCollections: 16000,
          totalExpenses: 14800,
          platformFee: 0,
          netProfit: 39200,
          netPayout: 54000,
          totalBookingsCount: 36,
          occupiedDesks: 35,
          occupancyRate: 88,
        },
        {
          month: 'September 2026',
          monthShort: 'Sep',
          totalRevenue: Math.max(currentRevenue.totalRevenue, 38500),
          onlineCollections: currentRevenue.onlineCollections || 24500,
          counterCollections: currentRevenue.counterCollections || 14000,
          totalExpenses: currentRevenue.totalExpenses || 15200,
          platformFee: 0,
          netProfit: Math.max(0, (Math.max(currentRevenue.totalRevenue, 38500)) - (currentRevenue.totalExpenses || 15200)),
          netPayout: Math.max(currentRevenue.totalRevenue, 38500),
          totalBookingsCount: currentRevenue.totalBookingsCount || 22,
          occupiedDesks: lib.totalSeats - (lib.availableSeats || 18),
          occupancyRate: Math.round(((lib.totalSeats - (lib.availableSeats || 18)) / lib.totalSeats) * 100),
        }
      ];
    }

    // For fresh owners: only current month, previous months 0
    return [
      {
        month: 'September 2026',
        monthShort: 'Sep',
        totalRevenue: currentRevenue.totalRevenue,
        onlineCollections: currentRevenue.onlineCollections,
        counterCollections: currentRevenue.counterCollections,
        totalExpenses: currentRevenue.totalExpenses,
        platformFee: currentRevenue.platformFee,
        netProfit: currentRevenue.netProfit,
        netPayout: currentRevenue.netPayout,
        totalBookingsCount: currentRevenue.totalBookingsCount,
        occupiedDesks: Math.max(0, (lib.totalSeats || 0) - (lib.availableSeats || 0)),
        occupancyRate: lib.totalSeats ? Math.round(((lib.totalSeats - (lib.availableSeats || 0)) / lib.totalSeats) * 100) : 0,
      }
    ];
  }

  public getShiftRevenueBreakdown(libraryId: string) {
    const lib = this.libraries.find(l => l.id === libraryId);
    if (!lib) return [];

    const shifts = lib.shifts || [];
    const bookings = this.bookings.filter(b => b.libraryId === libraryId && (b.status === 'confirmed' || b.paymentStatus === 'paid'));
    const students = this.libraryStudents.filter(s => s.libraryId === libraryId && (s.feeStatus === 'paid' || s.feeStatus === 'PAID'));
    const totalSeats = lib.totalSeats || 40;

    const breakdown = shifts.map(shift => {
      const shiftName = shift.name;
      const shiftPrice = shift.price || shift.monthlyPrice || lib.monthlyFee || 499;

      const shiftBookings = bookings.filter(b => {
        const bShift = (b.shift || '').toLowerCase();
        const sShift = shiftName.toLowerCase();
        return bShift.includes(sShift) || sShift.includes(bShift) || (sShift.includes('full') && bShift.includes('full'));
      });

      const shiftStudents = students.filter(s => {
        const stuShift = (s.shift || s.shiftName || '').toLowerCase();
        const sShift = shiftName.toLowerCase();
        return stuShift.includes(sShift) || sShift.includes(stuShift) || (sShift.includes('full') && stuShift.includes('full'));
      });

      const onlineRevenue = shiftBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
      const offlineRevenue = shiftStudents.reduce((sum, s) => sum + (Number(s.monthlyFee) || 0), 0);
      const totalShiftRevenue = onlineRevenue + offlineRevenue;
      const occupiedDesks = shiftBookings.length + shiftStudents.length;
      const occupancyRate = totalSeats > 0 ? Math.min(100, Math.round((occupiedDesks / totalSeats) * 100)) : 0;
      const revenuePerDesk = occupiedDesks > 0 ? Math.round(totalShiftRevenue / occupiedDesks) : shiftPrice;
      const profitContribution = totalShiftRevenue;

      return {
        id: shift.id || shiftName,
        shiftName,
        startTime: shift.startTime,
        endTime: shift.endTime,
        monthlyPrice: shiftPrice,
        totalSeats,
        occupiedDesks,
        availableDesks: Math.max(0, totalSeats - occupiedDesks),
        occupancyRate,
        onlineRevenue,
        offlineRevenue,
        totalRevenue: totalShiftRevenue,
        revenuePerDesk,
        profitContribution,
        activeMemberships: occupiedDesks,
      };
    });

    if (breakdown.length > 0) {
      let maxRev = -1;
      let minRev = Infinity;
      breakdown.forEach(b => {
        if (b.totalRevenue > maxRev) maxRev = b.totalRevenue;
        if (b.totalRevenue < minRev) minRev = b.totalRevenue;
      });

      return breakdown.map(b => ({
        ...b,
        isHighestPerforming: breakdown.length > 1 && b.totalRevenue === maxRev && maxRev > 0,
        isLowestPerforming: breakdown.length > 1 && b.totalRevenue === minRev && maxRev !== minRev,
      }));
    }

    return breakdown;
  }

  public checkoutStudentAttendance(recordId: string, checkoutTime?: string) {
    const rec = this.attendance.find(a => a.id === recordId);
    if (rec) {
      const cTime = checkoutTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      (rec as any).checkoutTime = cTime;
      rec.checkOutTime = cTime;
      rec.checkOut = cTime;
      rec.status = 'CHECKED_OUT';
      const inTime = rec.checkInTime || rec.checkIn || rec.time || cTime;
      rec.duration = this.calculateAttendanceDuration(inTime, cTime);
      this.saveToStorage();
      this.notifyAttendanceChange();
      return rec;
    }
    return null;
  }
  public updateSeatStatus(
    libraryId: string,
    seatNumber: string,
    status: SeatStatus,
    studentName?: string,
    shiftNameOrId?: string,
    studentPhone?: string
  ) {
    const lib = this.libraries.find(l => l.id === libraryId);
    if (lib && lib.seats) {
      const matchSeat = (sNum: string, target: string) => {
        if (!sNum || !target) return false;
        if (sNum.toLowerCase() === target.toLowerCase()) return true;
        const n1 = sNum.replace(/\D/g, '');
        const n2 = target.replace(/\D/g, '');
        return Boolean(n1 && n2 && parseInt(n1, 10) === parseInt(n2, 10));
      };

      let seat = lib.seats.find(s => matchSeat(s.seatNumber, seatNumber));
      if (!seat) {
        seat = {
          seatNumber,
          status: 'AVAILABLE'
        };
        lib.seats.push(seat);
      }

      if (!seat.shiftOccupancy) {
        seat.shiftOccupancy = {
          morning: { isBooked: false },
          afternoon: { isBooked: false },
          evening: { isBooked: false },
          isFullDay: false,
        };
      }

      const isOccupied = status === 'OCCUPIED' || status === 'occupied';
      const isMaint = status === 'MAINTENANCE' || status === 'maintenance';
      const isAvail = status === 'AVAILABLE' || status === 'available';
      const norm = (shiftNameOrId || '').toLowerCase();

      if (isMaint) {
        seat.status = 'MAINTENANCE';
        seat.assignedStudentName = undefined;
      } else if (isAvail) {
        seat.status = 'AVAILABLE';
        seat.assignedStudentName = undefined;
        if (!shiftNameOrId || norm.includes('full')) {
          seat.shiftOccupancy.morning = { isBooked: false };
          seat.shiftOccupancy.afternoon = { isBooked: false };
          seat.shiftOccupancy.evening = { isBooked: false };
          seat.shiftOccupancy.isFullDay = false;
        } else if (norm.includes('morning') || norm === 'sh-1') {
          seat.shiftOccupancy.morning = { isBooked: false };
          seat.shiftOccupancy.isFullDay = false;
        } else if (norm.includes('afternoon') || norm === 'sh-2') {
          seat.shiftOccupancy.afternoon = { isBooked: false };
          seat.shiftOccupancy.isFullDay = false;
        } else if (norm.includes('evening') || norm === 'sh-3') {
          seat.shiftOccupancy.evening = { isBooked: false };
          seat.shiftOccupancy.isFullDay = false;
        }
      } else if (isOccupied) {
        if (norm.includes('full') || norm === 'sh-4') {
          seat.shiftOccupancy.morning = { isBooked: true, studentName, studentPhone };
          seat.shiftOccupancy.afternoon = { isBooked: true, studentName, studentPhone };
          seat.shiftOccupancy.evening = { isBooked: true, studentName, studentPhone };
          seat.shiftOccupancy.isFullDay = true;
        } else if (norm.includes('morning') || norm === 'sh-1') {
          seat.shiftOccupancy.morning = { isBooked: true, studentName, studentPhone };
        } else if (norm.includes('afternoon') || norm === 'sh-2') {
          seat.shiftOccupancy.afternoon = { isBooked: true, studentName, studentPhone };
        } else if (norm.includes('evening') || norm === 'sh-3') {
          seat.shiftOccupancy.evening = { isBooked: true, studentName, studentPhone };
        } else {
          seat.shiftOccupancy.morning = { isBooked: true, studentName, studentPhone };
          seat.shiftOccupancy.afternoon = { isBooked: true, studentName, studentPhone };
          seat.shiftOccupancy.evening = { isBooked: true, studentName, studentPhone };
          seat.shiftOccupancy.isFullDay = true;
        }
        seat.status = 'OCCUPIED';
        if (studentName) seat.assignedStudentName = studentName;
      }

      lib.availableSeats = lib.seats.filter(s => s.status === 'AVAILABLE').length;
      this.saveToStorage();
      return seat;
    }
    return null;
  }

  public vacateSeat(libraryId: string, seatNumber: string, shiftNameOrId?: string) {
    const lib = this.libraries.find(l => l.id === libraryId);
    if (lib && lib.seats) {
      const matchSeat = (sNum: string, target: string) => {
        if (!sNum || !target) return false;
        if (sNum.toLowerCase() === target.toLowerCase()) return true;
        const n1 = sNum.replace(/\D/g, '');
        const n2 = target.replace(/\D/g, '');
        return Boolean(n1 && n2 && parseInt(n1, 10) === parseInt(n2, 10));
      };

      const seat = lib.seats.find(s => matchSeat(s.seatNumber, seatNumber));
      if (seat) {
        // Clear maintenance if any
        if (seat.status === 'MAINTENANCE' || seat.status === 'maintenance') {
          seat.status = 'AVAILABLE';
        }

        if (!seat.shiftOccupancy) {
          seat.status = 'AVAILABLE';
          seat.assignedStudentName = undefined;
        } else {
          const norm = (shiftNameOrId || '').toLowerCase();
          if (!shiftNameOrId || norm.includes('full') || norm === 'all') {
            seat.shiftOccupancy.morning = { isBooked: false };
            seat.shiftOccupancy.afternoon = { isBooked: false };
            seat.shiftOccupancy.evening = { isBooked: false };
            seat.shiftOccupancy.isFullDay = false;
            seat.status = 'AVAILABLE';
            seat.assignedStudentName = undefined;
          } else if (norm.includes('morning') || norm === 'sh-1') {
            seat.shiftOccupancy.morning = { isBooked: false };
            seat.shiftOccupancy.isFullDay = false;
          } else if (norm.includes('afternoon') || norm === 'sh-2') {
            seat.shiftOccupancy.afternoon = { isBooked: false };
            seat.shiftOccupancy.isFullDay = false;
          } else if (norm.includes('evening') || norm === 'sh-3') {
            seat.shiftOccupancy.evening = { isBooked: false };
            seat.shiftOccupancy.isFullDay = false;
          }

          const anyBooked = Boolean(
            seat.shiftOccupancy.morning?.isBooked ||
            seat.shiftOccupancy.afternoon?.isBooked ||
            seat.shiftOccupancy.evening?.isBooked
          );
          if (!anyBooked) {
            seat.status = 'AVAILABLE';
            seat.assignedStudentName = undefined;
          }
        }

        // Update active booking status for this seat
        const activeBookings = this.bookings.filter(b => b.libraryId === libraryId && matchSeat(b.seatNumber, seatNumber) && (b.status === 'confirmed' || b.status === 'CONFIRMED'));
        activeBookings.forEach(b => {
          if (!shiftNameOrId || (b.shift || '').toLowerCase().includes((shiftNameOrId || '').toLowerCase()) || (shiftNameOrId || '').toLowerCase().includes((b.shift || '').toLowerCase()) || (shiftNameOrId || '').toLowerCase().includes('full')) {
            b.status = 'completed';
          }
        });

        lib.availableSeats = lib.seats.filter(s => s.status === 'AVAILABLE').length;
        this.saveToStorage();
        return seat;
      }
    }
    return null;
  }

  // --- Tutor Requests ---
  public getTutorRequests(districtId?: string, studentId?: string) {
    let result = [...this.tutorRequests];
    if (districtId) {
      const target = districtId.toLowerCase().trim();
      result = result.filter(r => 
        (r.districtId && r.districtId.toLowerCase().trim() === target) ||
        (r.districtName && r.districtName.toLowerCase().trim() === target) ||
        (r.district && r.district.toLowerCase().trim() === target)
      );
    }
    if (studentId) result = result.filter(r => r.studentId === studentId);
    return result;
  }

  // --- Students ---
  public getStudents(districtId?: string): User[] {
    const allUsers = this.getUsers();
    let students = allUsers.filter(u => (u.role || '').toUpperCase() === 'STUDENT');
    if (districtId) {
      const target = districtId.toLowerCase().trim();
      students = students.filter(s => 
        (s.districtId && s.districtId.toLowerCase().trim() === target) ||
        (s.districtName && s.districtName.toLowerCase().trim() === target) ||
        (s.district && s.district.toLowerCase().trim() === target)
      );
    }
    return students;
  }
  public getTutorRequestById(id: string) { return this.tutorRequests.find(r => r.id === id); }
  public addTutorRequest(req: TutorRequest) {
    this.tutorRequests.unshift(req);
    this.saveToStorage();
    return req;
  }
  public allotTeacher(requestId: string, teacherId: string, teacherName: string, notes?: string) {
    const req = this.tutorRequests.find(r => r.id === requestId);
    if (req) {
      req.status = 'TEACHER_ALLOTTED';
      req.allottedTeacherId = teacherId;
      req.allottedTeacherName = teacherName;
      req.allotmentDate = new Date().toISOString();
      req.allotmentNotes = notes;

      // Also create notification for student
      this.addNotification({
        id: `notif-${Date.now()}`,
        userId: req.studentId,
        title: 'Teacher Allotted!',
        message: `District Admin has allotted ${teacherName} for your ${req.className} tuition request.`,
        category: 'APPROVAL',
        isRead: false,
        link: '/student/tutor',
        createdAt: new Date().toISOString(),
      });

      this.saveToStorage();
      return req;
    }
    return null;
  }

  public scheduleDemoClass(requestId: string, allotmentData: any) {
    const req = this.tutorRequests.find(r => r.id === requestId);
    if (req) {
      req.status = 'UNDER_REVIEW';
      req.allottedTeacherId = allotmentData.teacherId;
      req.allottedTeacherName = allotmentData.teacherName;
      req.assignedTeacherId = allotmentData.teacherId;
      req.assignedTeacherName = allotmentData.teacherName;
      req.demoDate = allotmentData.demoDate;
      req.demoTime = allotmentData.demoTime;
      req.demoMode = allotmentData.demoMode || 'HOME_VISIT';
      req.demoNotes = allotmentData.adminNotes;
      req.demoFeedback = 'PENDING';
      req.allotmentDate = new Date().toISOString();

      // Notify Student
      this.addNotification({
        id: `notif-${Date.now()}-stu`,
        userId: req.studentId,
        title: 'Demo Class Scheduled!',
        message: `Your demo class with ${allotmentData.teacherName} is set for ${allotmentData.demoDate} at ${allotmentData.demoTime}.`,
        category: 'APPROVAL',
        isRead: false,
        link: '/student/tutor',
        createdAt: new Date().toISOString(),
      });

      // Notify Teacher
      this.addNotification({
        id: `notif-${Date.now()}-tch`,
        userId: allotmentData.teacherId,
        title: 'New Student Demo Assigned!',
        message: `District Admin assigned a demo class with ${req.studentName} (${req.className}) on ${allotmentData.demoDate} at ${allotmentData.demoTime}.`,
        category: 'ASSIGNMENT',
        isRead: false,
        link: '/teacher/schedule',
        createdAt: new Date().toISOString(),
      });

      this.saveToStorage();
      return req;
    }
    return null;
  }

  public confirmTuitionAfterDemo(requestId: string, details: any) {
    const req = this.tutorRequests.find(r => r.id === requestId);
    if (req) {
      req.status = 'ACTIVE';
      req.demoFeedback = 'SUCCESSFUL';

      const newAssignment: TeacherAssignment = {
        id: `asg-${Date.now().toString().slice(-4)}`,
        tutorRequestId: req.id,
        studentId: req.studentId,
        studentName: req.studentName,
        studentPhone: req.studentMobile || req.studentPhone || '9876543210',
        teacherId: req.allottedTeacherId || req.assignedTeacherId || details.teacherId,
        teacherName: req.allottedTeacherName || req.assignedTeacherName || details.teacherName,
        teacherPhone: details.teacherPhone || '9876543211',
        districtId: req.districtId || 'dist-gzp',
        district: req.districtName || req.district || 'Ghazipur',
        subjects: req.subjects,
        className: req.className || req.grade,
        grade: req.grade || req.className,
        schedule: details.schedule || 'Mon, Wed, Fri (05:00 PM - 06:30 PM)',
        monthlyFee: details.monthlyFee || req.budgetMonthly || 5000,
        startDate: new Date().toISOString().split('T')[0],
        address: req.address,
        teachingMode: details.teachingMode || 'Home Tuition',
        status: 'ACTIVE',
      };

      this.teacherAssignments.unshift(newAssignment);

      // Notify Student
      this.addNotification({
        id: `notif-${Date.now()}-asg`,
        userId: req.studentId,
        title: 'Regular Tuition Confirmed!',
        message: `Congratulations! Your regular classes with ${newAssignment.teacherName} are officially activated.`,
        category: 'APPROVAL',
        isRead: false,
        link: '/student/teacher',
        createdAt: new Date().toISOString(),
      });

      this.saveToStorage();
      return { request: req, assignment: newAssignment };
    }
    return null;
  }

  // --- Teacher Assignments ---
  public getTeacherAssignments(districtIdOrTeacherId?: string) {
    if (!districtIdOrTeacherId) return this.teacherAssignments;
    const target = districtIdOrTeacherId.toLowerCase().trim();
    return this.teacherAssignments.filter(a => 
      a.teacherId === districtIdOrTeacherId ||
      (a.districtId && a.districtId.toLowerCase().trim() === target) || 
      (a.district && a.district.toLowerCase().trim() === target) ||
      ((a as any).districtName && (a as any).districtName.toLowerCase().trim() === target)
    );
  }
  public getTeacherAssignmentsByTeacherId(teacherId: string) {
    return this.teacherAssignments.filter(a => a.teacherId === teacherId);
  }
  public addTeacherAssignment(asg: TeacherAssignment) {
    this.teacherAssignments.unshift(asg);
    this.saveToStorage();
    return asg;
  }
  public updateTeacherAssignment(id: string, updates: Partial<TeacherAssignment>) {
    const asg = this.teacherAssignments.find(a => a.id === id);
    if (asg) {
      Object.assign(asg, updates);
      this.saveToStorage();
      return asg;
    }
    return null;
  }

  // --- Bookings ---
  public getBookings(studentId?: string, libraryId?: string) {
    let result = [...this.bookings];
    if (studentId) result = result.filter(b => b.studentId === studentId);
    if (libraryId) result = result.filter(b => b.libraryId === libraryId);
    return result.map(b => {
      if (!b.studentAvatar) {
        const u = this.users.find(x => 
          x.id === (b.studentId || b.userId) || 
          (x.name && x.name.toLowerCase() === b.studentName.toLowerCase()) || 
          (x.phone && (x.phone === b.studentPhone || x.mobile === b.studentPhone))
        );
        const photo = u?.avatarUrl || (u as any)?.avatar;
        if (photo) {
          return { ...b, studentAvatar: photo };
        }
      }
      return b;
    });
  }
  public addBooking(booking: LibraryBooking) {
    const gross = Number(booking.totalAmount || booking.amount || 800);
    const cut = Math.round(gross * 0.05);
    const credited = gross - cut;
    let studentAvatar = booking.studentAvatar;
    if (!studentAvatar) {
      const u = this.users.find(x => 
        x.id === (booking.studentId || booking.userId) || 
        (x.name && x.name.toLowerCase() === booking.studentName.toLowerCase())
      );
      if (u) {
        studentAvatar = u.avatarUrl || (u as any)?.avatar;
      }
    }
    const enrichedBooking = {
      ...booking,
      totalAmount: gross,
      platformCut: booking.platformCut !== undefined ? booking.platformCut : cut,
      creditedAmount: booking.creditedAmount !== undefined ? booking.creditedAmount : credited,
      studentAvatar: studentAvatar,
      rollNumber: booking.rollNumber || `FP-STU-${Math.floor(1000 + Math.random() * 9000)}`
    };
    this.bookings.unshift(enrichedBooking);
    // Mark seat as occupied for the specific shift
    this.updateSeatStatus(
      enrichedBooking.libraryId,
      enrichedBooking.seatNumber,
      'OCCUPIED',
      enrichedBooking.studentName,
      enrichedBooking.shiftName || enrichedBooking.shift,
      enrichedBooking.studentPhone || enrichedBooking.studentMobile
    );
    this.saveToStorage();
    return enrichedBooking;
  }

  public updateBookingPhoto(bookingId: string, photoUrl: string): boolean {
    const b = this.bookings.find(x => x.id === bookingId);
    if (b) {
      b.studentAvatar = photoUrl;
      const u = this.users.find(x => 
        x.id === (b.studentId || b.userId) || 
        (x.name && x.name.toLowerCase() === b.studentName.toLowerCase())
      );
      if (u) {
        u.avatarUrl = photoUrl;
        (u as any).avatar = photoUrl;
      }
      const s = this.libraryStudents.find(x => x.name.toLowerCase() === b.studentName.toLowerCase());
      if (s) {
        s.avatarUrl = photoUrl;
        s.avatar = photoUrl;
      }
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // --- Library Students ---
  public getLibraryStudents(libraryId?: string) {
    const base = libraryId ? this.libraryStudents.filter(s => s.libraryId === libraryId) : this.libraryStudents;
    return base.map(s => {
      const u = this.users.find(x => 
        x.id === s.userId || 
        (x.name && x.name.toLowerCase() === s.name.toLowerCase()) || 
        (x.phone && (x.phone === s.mobile || x.mobile === s.mobile))
      );
      const photo = s.avatarUrl || s.avatar || u?.avatarUrl || (u as any)?.avatar;
      if (photo) {
        return { ...s, avatarUrl: photo, avatar: photo };
      }
      return s;
    });
  }
  public addLibraryStudent(student: LibraryStudent) {
    let studentAvatar = student.avatarUrl || student.avatar;
    if (!studentAvatar) {
      const u = this.users.find(x => 
        x.id === student.userId || 
        (x.name && x.name.toLowerCase() === student.name.toLowerCase())
      );
      if (u) {
        studentAvatar = u.avatarUrl || (u as any)?.avatar;
      }
    }
    const enriched = { ...student, avatarUrl: studentAvatar, avatar: studentAvatar };
    this.libraryStudents.unshift(enriched);
    this.updateSeatStatus(enriched.libraryId, enriched.seatNumber, 'OCCUPIED', enriched.name);
    this.saveToStorage();
    return enriched;
  }

  public updateStudentPhoto(studentIdOrRef: string, photoUrl: string): boolean {
    const s = this.libraryStudents.find(x => 
      x.id === studentIdOrRef || 
      x.referenceId === studentIdOrRef || 
      x.name.toLowerCase() === studentIdOrRef.toLowerCase()
    );
    if (s) {
      s.avatarUrl = photoUrl;
      s.avatar = photoUrl;
      const b = this.bookings.find(x => x.studentName.toLowerCase() === s.name.toLowerCase() || x.studentPhone === s.mobile);
      if (b) {
        b.studentAvatar = photoUrl;
      }
      const u = this.users.find(x => x.id === s.userId || (x.name && x.name.toLowerCase() === s.name.toLowerCase()));
      if (u) {
        u.avatarUrl = photoUrl;
        (u as any).avatar = photoUrl;
      }
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // --- FocusPoint Attendance Intelligence Architecture ---

  public onAttendanceChange(callback: () => void): () => void {
    this.attendanceListeners.push(callback);
    return () => {
      this.attendanceListeners = this.attendanceListeners.filter(cb => cb !== callback);
    };
  }

  public notifyAttendanceChange() {
    this.attendanceListeners.forEach(cb => {
      try {
        cb();
      } catch (e) {
        console.error('Attendance event listener error:', e);
      }
    });
  }

  public getAttendance(studentId?: string, targetId?: string) {
    let result = [...this.attendance];
    if (studentId) {
      result = result.filter(a => a.studentId === studentId || a.userId === studentId);
    }
    if (targetId) {
      result = result.filter(a => 
        a.targetId === targetId || 
        a.teacherId === targetId || 
        a.libraryId === targetId ||
        (a as any).libraryId === targetId
      );
    }
    return result;
  }

  public getTeacherAttendance(teacherId: string) {
    const teacherAsgIds = this.getTeacherAssignmentsByTeacherId(teacherId).map(a => a.id);
    return this.attendance.filter(a => 
      a.teacherId === teacherId || 
      a.targetId === teacherId ||
      (a.serviceType === 'HOME_TUITION' && a.teacherId === teacherId) ||
      (a.type === 'tutor_session' && teacherAsgIds.includes(a.referenceId || ''))
    );
  }

  public getLibraryAttendance(libraryId: string) {
    return this.attendance.filter(a => 
      a.targetId === libraryId || 
      a.libraryId === libraryId ||
      (a as any).libraryId === libraryId || 
      a.serviceType === 'LIBRARY' ||
      (a.type === 'library_checkin' && (a as any).libraryId === libraryId)
    );
  }

  public calculateAttendanceDuration(startTimeStr: string, endTimeStr: string): string {
    const parseTime = (tStr: string) => {
      if (!tStr) return 0;
      const match = tStr.trim().match(/(\d{1,2}):(\d{2})(?:\s*([AP]M))?/i);
      if (!match) return 0;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const meridian = match[3]?.toUpperCase();
      if (meridian === 'PM' && hours < 12) hours += 12;
      if (meridian === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const startMins = parseTime(startTimeStr);
    const endMins = parseTime(endTimeStr);
    let diff = endMins - startMins;
    if (diff < 0) diff += 24 * 60; // Cross-midnight edge case
    if (diff === 0) diff = 1;

    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hrs === 0) return `${mins}m`;
    return `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
  }

  public getTodayAttendance(studentId: string, serviceType: 'HOME_TUITION' | 'LIBRARY'): AttendanceRecord | null {
    const today = new Date().toISOString().split('T')[0];
    const rec = this.attendance.find(a => 
      (a.studentId === studentId || a.userId === studentId) &&
      a.date === today &&
      (a.serviceType === serviceType || 
       (serviceType === 'HOME_TUITION' 
         ? (a.type === 'TUTOR' || a.type === 'tutor_session' || a.type === 'HOME_TUITION')
         : (a.type === 'LIBRARY' || a.type === 'library_checkin' || a.type === 'LIBRARY')))
    );
    return rec || null;
  }

  public getStudentActiveServices(studentId: string): StudentActiveAttendanceService[] {
    const services: StudentActiveAttendanceService[] = [];
    const today = new Date().toISOString().split('T')[0];
    const studentUser = this.users.find(u => u.id === studentId) as any;

    // 1. Home Tuition Service Resolution
    const asgs = this.teacherAssignments.filter(a => a.studentId === studentId);
    const tutorReqs = this.tutorRequests.filter(r => 
      r.studentId === studentId && 
      (r.status === 'ACTIVE' || r.status === 'TEACHER_ALLOTTED' || !!r.allottedTeacherId)
    );

    let tuitionTeacherId = asgs[0]?.teacherId || tutorReqs[0]?.allottedTeacherId || studentUser?.activeTutorId;
    let tuitionTeacherName = asgs[0]?.teacherName || tutorReqs[0]?.allottedTeacherName || studentUser?.activeTutorName;
    const req = tutorReqs[0];

    if (tuitionTeacherId || req) {
      const teacher = this.teachers.find(t => t.id === tuitionTeacherId) || 
                      this.users.find(u => u.id === tuitionTeacherId) as any;
      if (teacher && !tuitionTeacherName) {
        tuitionTeacherName = teacher.name;
      }
      
      const todayTuitionAtt = this.attendance.find(a => 
        (a.studentId === studentId || a.userId === studentId) &&
        a.date === today &&
        (a.serviceType === 'HOME_TUITION' || a.type === 'TUTOR' || a.type === 'tutor_session' || a.type === 'HOME_TUITION')
      );

      services.push({
        serviceType: 'HOME_TUITION',
        id: req?.id || asgs[0]?.id || `tuition-${studentId}`,
        title: req?.className ? `${req.className} Home Tuition` : 'Home Tuition Program',
        subtitle: tuitionTeacherName ? `Teacher: ${tuitionTeacherName}` : 'Assigned Home Tutor',
        teacherId: tuitionTeacherId || 'usr-teacher-rajesh',
        teacherName: tuitionTeacherName || 'Dr. Rajesh Sharma',
        teacherPhoto: teacher?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        subject: req?.subjects?.join(', ') || 'Physics & Mathematics',
        scheduledTime: req?.preferredTime || '05:00 PM – 06:30 PM',
        status: 'ACTIVE',
        todayAttendance: todayTuitionAtt || null,
      });
    }

    // 2. Digital Library Service Resolution
    const libBooking = this.bookings.find(b => 
      (b.studentId === studentId || b.userId === studentId) && 
      (b.status === 'ACTIVE' || b.status === 'CONFIRMED' || b.paymentStatus === 'PAID')
    );
    const libStudent = this.libraryStudents.find(s => 
      (s.id === studentId || s.userId === studentId)
    );

    const targetLibId = libBooking?.libraryId || libStudent?.libraryId || studentUser?.activeLibraryBookingId;

    if (targetLibId || libBooking || libStudent) {
      const library = this.libraries.find(l => l.id === (targetLibId || libBooking?.libraryId));
      const todayLibAtt = this.attendance.find(a => 
        (a.studentId === studentId || a.userId === studentId) &&
        a.date === today &&
        (a.serviceType === 'LIBRARY' || a.type === 'LIBRARY' || a.type === 'library_checkin')
      );

      services.push({
        serviceType: 'LIBRARY',
        id: libBooking?.id || libStudent?.id || `lib-${studentId}`,
        title: library?.name || libBooking?.libraryName || "ZYZU'S Premier Study Library",
        subtitle: `${libBooking?.shiftName || libBooking?.shift || libStudent?.shift || 'Daily Desk Pass'} • ${libBooking?.seatNumber || libStudent?.seatNumber || 'Desk 03'}`,
        libraryId: targetLibId || library?.id || 'lib-focus-saidpur',
        libraryName: library?.name || libBooking?.libraryName || "ZYZU'S Premier Study Library - Saidpur",
        libraryPhoto: library?.images?.[0] || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=200',
        shiftName: libBooking?.shiftName || libBooking?.shift || libStudent?.shift || 'Morning Shift (07:00 AM – 12:00 PM)',
        seatNumber: libBooking?.seatNumber || libStudent?.seatNumber || 'Seat 03',
        status: 'ACTIVE',
        todayAttendance: todayLibAtt || null,
      });
    }

    return services;
  }

  public recordAttendanceCheckIn(payload: {
    studentId: string;
    studentName?: string;
    serviceType: 'HOME_TUITION' | 'LIBRARY';
    targetId?: string;
    targetName?: string;
    teacherId?: string;
    teacherName?: string;
    libraryId?: string;
    libraryName?: string;
    referenceId?: string;
    bookingId?: string;
    sessionId?: string;
    source?: 'STUDENT_QR' | 'TEACHER_PORTAL' | 'LIBRARY_OWNER_PORTAL' | 'ADMIN' | string;
    notes?: string;
    district?: string;
    parentPhone?: string;
    parentName?: string;
  }): AttendanceRecord {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Prevent duplicate check-ins
    const existing = this.attendance.find(a => 
      (a.studentId === payload.studentId || a.userId === payload.studentId) &&
      a.date === today &&
      (a.serviceType === payload.serviceType || 
       (payload.serviceType === 'HOME_TUITION' 
         ? (a.type === 'TUTOR' || a.type === 'tutor_session' || a.type === 'HOME_TUITION')
         : (a.type === 'LIBRARY' || a.type === 'library_checkin' || a.type === 'LIBRARY')))
    );

    if (existing) {
      if (existing.status === 'CHECKED_IN' || existing.checkInTime) {
        if (existing.status === 'CHECKED_OUT' || existing.checkOutTime) {
          throw new Error('Attendance has already been completed for today.');
        }
        throw new Error('Student is already checked in for this service today.');
      }
      existing.status = 'CHECKED_IN';
      existing.checkInTime = nowTime;
      existing.checkIn = nowTime;
      existing.time = nowTime;
      existing.source = payload.source || 'STUDENT_QR';
      existing.serviceType = payload.serviceType;
      existing.notificationStatus = 'QUEUED';
      if (payload.notes) existing.notes = payload.notes;
      this.saveToStorage();
      this.notifyAttendanceChange();
      return existing;
    }

    const studentUser = this.users.find(u => u.id === payload.studentId) as any;
    const parentPhone = payload.parentPhone || studentUser?.parentPhone || studentUser?.mobile || '9876543210';
    const parentName = payload.parentName || studentUser?.parentName || 'Parent / Guardian';

    const newRec: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      userId: payload.studentId,
      studentId: payload.studentId,
      studentName: payload.studentName || studentUser?.name || 'Student',
      studentAvatar: studentUser?.avatarUrl,
      role: 'student',
      serviceType: payload.serviceType,
      type: payload.serviceType === 'HOME_TUITION' ? 'tutor_session' : 'library_checkin',
      referenceId: payload.referenceId || payload.bookingId || (payload.serviceType === 'HOME_TUITION' ? 'tuition-session' : 'desk-checkin'),
      bookingId: payload.bookingId,
      sessionId: payload.sessionId,
      targetId: payload.targetId || payload.teacherId || payload.libraryId,
      targetName: payload.targetName || payload.teacherName || payload.libraryName,
      teacherId: payload.teacherId,
      teacherName: payload.teacherName,
      libraryId: payload.libraryId,
      libraryName: payload.libraryName,
      date: today,
      time: nowTime,
      checkIn: nowTime,
      checkInTime: nowTime,
      status: 'CHECKED_IN',
      source: payload.source || 'STUDENT_QR',
      notes: payload.notes || `${payload.serviceType === 'HOME_TUITION' ? 'Home Tuition' : 'Digital Library'} Check-in`,
      district: payload.district || studentUser?.districtName || 'Ghazipur',
      parentPhone,
      parentName,
      notificationStatus: 'QUEUED',
    };

    this.attendance.unshift(newRec);
    this.saveToStorage();
    this.notifyAttendanceChange();
    return newRec;
  }

  public recordAttendanceCheckOut(payload: {
    attendanceId?: string;
    studentId: string;
    serviceType: 'HOME_TUITION' | 'LIBRARY';
    checkOutTime?: string;
    notes?: string;
  }): AttendanceRecord {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = payload.checkOutTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let record: AttendanceRecord | undefined;
    if (payload.attendanceId) {
      record = this.attendance.find(a => a.id === payload.attendanceId);
    }
    if (!record) {
      record = this.attendance.find(a => 
        (a.studentId === payload.studentId || a.userId === payload.studentId) &&
        a.date === today &&
        (a.serviceType === payload.serviceType || 
         (payload.serviceType === 'HOME_TUITION' 
           ? (a.type === 'TUTOR' || a.type === 'tutor_session' || a.type === 'HOME_TUITION') 
           : (a.type === 'LIBRARY' || a.type === 'library_checkin' || a.type === 'LIBRARY')))
      );
    }

    if (!record) {
      throw new Error('No active check-in record found to check out from.');
    }

    if (record.status === 'CHECKED_OUT' || record.checkOutTime) {
      throw new Error('Student has already checked out for today.');
    }

    if (!record.checkInTime && !record.checkIn) {
      throw new Error('Cannot check out without an active check-in.');
    }

    record.checkOutTime = nowTime;
    record.checkOut = nowTime;
    record.status = 'CHECKED_OUT';
    
    // Duration calculation
    const inTime = record.checkInTime || record.checkIn || record.time || nowTime;
    const dur = this.calculateAttendanceDuration(inTime, nowTime);
    record.duration = dur;
    if (payload.notes) {
      record.notes = (record.notes ? record.notes + ' • ' : '') + payload.notes;
    }

    this.saveToStorage();
    this.notifyAttendanceChange();
    return record;
  }

  public updateAttendanceRecord(
    recordId: string, 
    updates: Partial<AttendanceRecord>, 
    changeReason?: string, 
    changedBy?: string
  ): AttendanceRecord | null {
    const record = this.attendance.find(a => a.id === recordId);
    if (!record) return null;

    const previousStatus = record.status;
    Object.assign(record, updates);

    // If checkIn and checkOut exist, recalculate duration
    if (record.checkInTime && record.checkOutTime) {
      record.duration = this.calculateAttendanceDuration(record.checkInTime, record.checkOutTime);
    }

    if (changeReason || changedBy) {
      this.logAudit({
        id: `aud-${Date.now()}`,
        action: 'ATTENDANCE_CORRECTED',
        details: `Attendance for ${record.studentName || record.userId} corrected from ${previousStatus} to ${record.status}. Reason: ${changeReason || 'Administrative update'} by ${changedBy || 'Authorized Staff'}`,
        timestamp: new Date().toISOString(),
        adminRole: (changedBy as any) || 'TEACHER',
      });
    }

    this.saveToStorage();
    this.notifyAttendanceChange();
    return record;
  }

  public addLibraryAttendance(rec: AttendanceRecord) {
    this.attendance.unshift(rec);
    this.saveToStorage();
    this.notifyAttendanceChange();
    return rec;
  }

  public logAttendance(rec: AttendanceRecord) {
    this.attendance.unshift(rec);
    this.saveToStorage();
    this.notifyAttendanceChange();
    return rec;
  }

  public recordStudentFeePayment(libraryId: string, studentId: string, paymentData: any) {
    const stu = this.libraryStudents.find(s => (s.id === studentId || s.userId === studentId) && s.libraryId === libraryId);
    if (stu) {
      stu.feeStatus = 'paid';
    }

    const booking = this.bookings.find(b => (b.id === studentId || b.userId === studentId || b.studentId === studentId) && b.libraryId === libraryId);
    if (booking) {
      booking.paymentStatus = 'paid';
    }

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `FP-LIB-INV-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: stu?.userId || studentId,
      userName: paymentData.studentName || stu?.name || booking?.studentName || 'Library Student',
      type: 'LIBRARY_FEE',
      referenceId: paymentData.seatNumber || stu?.seatNumber || booking?.seatNumber || 'DESK-FEE',
      description: paymentData.notes || `Library Desk Fee - ${paymentData.shift || stu?.shift || 'Monthly'}`,
      amount: Number(paymentData.amount) || Number(stu?.monthlyFee) || 800,
      paidAmount: Number(paymentData.amount) || Number(stu?.monthlyFee) || 800,
      balanceAmount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      paidDate: new Date().toISOString().split('T')[0],
      status: 'PAID',
      paymentMethod: paymentData.paymentMode || 'Cash',
      transactionId: paymentData.transactionId || `TXN-LIB-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    (newInvoice as any).libraryId = libraryId;
    this.invoices.unshift(newInvoice);
    this.saveToStorage();
    return { invoice: newInvoice, student: stu, booking };
  }

  // --- Invoices & Fees ---
  public getInvoices(userId?: string) {
    if (userId) return this.invoices.filter(i => i.userId === userId);
    return this.invoices;
  }
  public getInvoiceById(id: string) {
    return this.invoices.find(i => i.id === id);
  }
  public addInvoice(inv: Invoice) {
    this.invoices.unshift(inv);
    this.saveToStorage();
    return inv;
  }
  public updateInvoice(id: string, updates: Partial<Invoice>) {
    const inv = this.invoices.find(i => i.id === id);
    if (inv) {
      Object.assign(inv, updates);
      this.saveToStorage();
      return inv;
    }
    return null;
  }
  public payInvoice(invoiceId: string) {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (inv) {
      inv.status = 'PAID';
      inv.paidAmount = inv.amount;
      inv.balanceAmount = 0;
      inv.paidDate = new Date().toISOString().split('T')[0];
      this.saveToStorage();
      return inv;
    }
    return null;
  }

  // --- Notifications ---
  public getNotifications(userId?: string) {
    if (userId) return this.notifications.filter(n => n.userId === userId || n.userId === 'all');
    return this.notifications;
  }
  public addNotification(n: NotificationItem) {
    this.notifications.unshift(n);
    this.saveToStorage();
    return n;
  }
  public markNotificationAsRead(id: string) {
    const n = this.notifications.find(x => x.id === id);
    if (n) {
      n.isRead = true;
      this.saveToStorage();
    }
  }
  public markAllNotificationsRead(userId: string) {
    this.notifications.forEach(n => {
      if (n.userId === userId || n.userId === 'all') n.isRead = true;
    });
    this.saveToStorage();
  }

  // --- Support Tickets ---
  public getSupportTickets(userId?: string) {
    if (userId) return this.supportTickets.filter(t => t.userId === userId);
    return this.supportTickets;
  }
  public addSupportTicket(ticket: SupportTicket) {
    this.supportTickets.unshift(ticket);
    this.saveToStorage();
    return ticket;
  }
  public addTicketResponse(ticketId: string, response: NonNullable<SupportTicket['responses']>[number]) {
    const t = this.supportTickets.find(x => x.id === ticketId);
    if (t) {
      if (!t.responses) t.responses = [];
      t.responses.push(response);
      t.updatedAt = new Date().toISOString();
      if (t.status === 'WAITING' || t.status === 'RESOLVED') {
        t.status = 'IN_PROGRESS';
      }
      this.saveToStorage();
      return t;
    }
    return null;
  }
  public updateSupportTicket(id: string, updates: Partial<SupportTicket>) {
    const t = this.supportTickets.find(x => x.id === id);
    if (t) {
      Object.assign(t, updates);
      t.updatedAt = new Date().toISOString();
      this.saveToStorage();
      return t;
    }
    return null;
  }
  public rateSupportTicket(id: string, rating: number, feedback?: string) {
    const t = this.supportTickets.find(x => x.id === id);
    if (t) {
      t.rating = rating;
      if (feedback) t.feedback = feedback;
      t.updatedAt = new Date().toISOString();
      this.saveToStorage();
      return t;
    }
    return null;
  }
  public reopenSupportTicket(id: string) {
    const t = this.supportTickets.find(x => x.id === id);
    if (t) {
      t.status = 'OPEN';
      t.updatedAt = new Date().toISOString();
      if (!t.responses) t.responses = [];
      t.responses.push({
        id: `resp-${Date.now()}`,
        senderId: t.userId,
        senderName: t.userName,
        senderRole: t.userRole,
        message: 'Ticket reopened by user.',
        timestamp: new Date().toISOString(),
      });
      this.saveToStorage();
      return t;
    }
    return null;
  }

  // --- Notification Settings ---
  public getLibraryNotificationSettings(libraryId: string): LibraryNotificationSettings {
    if (!this.libraryNotificationSettings[libraryId]) {
      this.libraryNotificationSettings[libraryId] = {
        whatsappOnExpiry3Days: true,
        whatsappOnExpired: true,
        whatsappOnPaymentReceipt: true,
        whatsappOnBookingConfirmation: true,
        inAppAlerts: true,
        dailyAttendanceSummary: true,
        settlementAlerts: true,
      };
      this.saveToStorage();
    }
    return this.libraryNotificationSettings[libraryId];
  }
  public updateLibraryNotificationSettings(libraryId: string, settings: Partial<LibraryNotificationSettings>): LibraryNotificationSettings {
    const current = this.getLibraryNotificationSettings(libraryId);
    this.libraryNotificationSettings[libraryId] = { ...current, ...settings };
    this.saveToStorage();
    return this.libraryNotificationSettings[libraryId];
  }

  // --- Audit Logs ---
  public getAuditLogs(districtId?: string) {
    if (districtId) return this.auditLogs.filter(l => l.districtId === districtId);
    return this.auditLogs;
  }
  public logAudit(entry: AuditLog) {
    this.auditLogs.unshift(entry);
    this.saveToStorage();
    return entry;
  }

  // ==========================================
  // --- DISTRICT ADMIN ADVANCED SUITE ---
  // ==========================================

  // --- District Operational Expenses ---
  public getDistrictExpenses(district?: string, area?: string, category?: string, month?: string): DistrictExpense[] {
    if (!district) return [];
    return this.districtExpenses.filter(e => {
      if (e.district.toLowerCase() !== district.toLowerCase() && district.toLowerCase() !== 'all') return false;
      if (area && area.toLowerCase() !== 'all' && e.area.toLowerCase() !== area.toLowerCase()) return false;
      if (category && category.toLowerCase() !== 'all' && e.category.toLowerCase() !== category.toLowerCase()) return false;
      if (month && month.toLowerCase() !== 'all') {
        const d = new Date(e.date);
        const mStr = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const mShort = d.toLocaleString('en-US', { month: 'short' });
        if (!mStr.toLowerCase().includes(month.toLowerCase()) && !mShort.toLowerCase().includes(month.toLowerCase()) && !e.date.includes(month)) {
          return false;
        }
      }
      return true;
    });
  }

  public addDistrictExpense(expense: Omit<DistrictExpense, 'id' | 'createdAt'>): DistrictExpense {
    const newExp: DistrictExpense = {
      ...expense,
      id: `DEXP-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };
    this.districtExpenses.unshift(newExp);
    this.logAudit({
      id: `aud-${Date.now()}`,
      action: 'ADD_DISTRICT_EXPENSE',
      details: `Recorded ₹${expense.amount} under ${expense.category} for ${expense.area} (${expense.description})`,
      district: expense.district,
      timestamp: new Date().toISOString(),
      adminRole: 'DISTRICT_ADMIN',
    });
    this.saveToStorage();
    return newExp;
  }

  public deleteDistrictExpense(id: string): boolean {
    const idx = this.districtExpenses.findIndex(e => e.id === id);
    if (idx !== -1) {
      const removed = this.districtExpenses[idx];
      this.districtExpenses.splice(idx, 1);
      this.logAudit({
        id: `aud-${Date.now()}`,
        action: 'DELETE_DISTRICT_EXPENSE',
        details: `Deleted expense record ${removed.voucherNo || id} (₹${removed.amount})`,
        district: removed.district,
        timestamp: new Date().toISOString(),
        adminRole: 'DISTRICT_ADMIN',
      });
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // --- Platform Commission Config ---
  public getCommissionConfig(district?: string): CommissionConfig {
    const targetDistrict = district || 'common';
    if (!this.commissionConfigs[targetDistrict]) {
      this.commissionConfigs[targetDistrict] = {
        id: `COMM-${targetDistrict.toUpperCase()}-01`,
        district: targetDistrict,
        defaultLibraryCommissionRate: 10,
        defaultTuitionCommissionRate: 15,
        libraryOverrides: {},
        teacherOverrides: {},
        updatedAt: new Date().toISOString(),
      };
      this.saveToStorage();
    }
    return this.commissionConfigs[targetDistrict];
  }

  public updateCommissionConfig(district: string, updates: Partial<CommissionConfig>): CommissionConfig {
    const current = this.getCommissionConfig(district);
    this.commissionConfigs[district] = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.logAudit({
      id: `aud-${Date.now()}`,
      action: 'UPDATE_COMMISSION_CONFIG',
      details: `Updated platform commission parameters for ${district}`,
      district,
      timestamp: new Date().toISOString(),
      adminRole: 'DISTRICT_ADMIN',
    });
    this.saveToStorage();
    return this.commissionConfigs[district];
  }

  // --- Teacher Disbursements ---
  public getTeacherDisbursements(district?: string, month?: string): TeacherDisbursementRecord[] {
    if (!district) return [];
    return this.teacherDisbursements.filter(d => {
      if (d.district.toLowerCase() !== district.toLowerCase() && district.toLowerCase() !== 'all') return false;
      if (month && month.toLowerCase() !== 'all' && !d.month.toLowerCase().includes(month.toLowerCase())) return false;
      return true;
    });
  }

  public processTeacherDisbursement(disbursementId: string, transactionRef?: string): TeacherDisbursementRecord | null {
    const record = this.teacherDisbursements.find(d => d.id === disbursementId);
    if (record) {
      record.status = 'PAID';
      record.paidAt = new Date().toISOString();
      record.transactionRef = transactionRef || `SBI-NEFT-${Date.now().toString().slice(-8)}`;
      this.logAudit({
        id: `aud-${Date.now()}`,
        action: 'PROCESS_TEACHER_PAYOUT',
        details: `Processed net payout of ₹${record.netPayable} (Gross: ₹${record.grossEarnings}, Commission: ₹${record.commissionDeducted}) to ${record.teacherName}`,
        district: record.district,
        timestamp: new Date().toISOString(),
        adminRole: 'DISTRICT_ADMIN',
      });
      // Send notification to teacher
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: record.teacherId,
        title: 'Monthly Payout Disbursed',
        message: `Your net payout of ₹${record.netPayable} for ${record.month} has been processed via NEFT (Ref: ${record.transactionRef}).`,
        category: 'PAYMENT',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      this.saveToStorage();
      return record;
    }
    return null;
  }

  // --- Announcements & Circulars ---
  public getAnnouncements(district?: string): AnnouncementCircular[] {
    if (!district) {
      return this.announcements.filter(a => a.targetDistrict.toLowerCase() === 'all');
    }
    return this.announcements.filter(a => 
      a.targetDistrict.toLowerCase() === 'all' || 
      a.targetDistrict.toLowerCase() === district.toLowerCase()
    );
  }

  public createAnnouncement(announcement: Omit<AnnouncementCircular, 'id' | 'createdAt' | 'isRead'>): AnnouncementCircular {
    const newAnn: AnnouncementCircular = {
      ...announcement,
      id: `ANN-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      replies: [],
    };
    this.announcements.unshift(newAnn);
    this.logAudit({
      id: `aud-${Date.now()}`,
      action: 'BROADCAST_ANNOUNCEMENT',
      details: `Published ${announcement.type} [${announcement.priority}]: "${announcement.title}"`,
      district: announcement.targetDistrict,
      timestamp: new Date().toISOString(),
      adminRole: 'DISTRICT_ADMIN',
    });
    this.saveToStorage();
    return newAnn;
  }

  public replyToAnnouncement(announcementId: string, reply: any): AnnouncementCircular | null {
    const ann = this.announcements.find(a => a.id === announcementId);
    if (ann) {
      if (!ann.replies) ann.replies = [];
      ann.replies.push({
        id: reply.id || `REP-${Date.now().toString(36)}`,
        senderId: reply.senderId || 'admin_ghz',
        senderName: reply.senderName || reply.authorName || 'Manoj Rai (District Admin)',
        senderRole: reply.senderRole || reply.authorRole || 'DISTRICT_ADMIN',
        replyText: reply.replyText || reply.message || '',
        authorName: reply.authorName || reply.senderName || 'Manoj Rai (District Admin)',
        message: reply.message || reply.replyText || '',
        timestamp: reply.timestamp || new Date().toLocaleString('en-IN'),
        createdAt: new Date().toISOString(),
      });
      ann.isRead = true;
      ann.isAcknowledged = true;
      this.saveToStorage();
      return ann;
    }
    return null;
  }

  // --- Manual Seat Bookings ---
  public getManualBookings(district: string = 'Ghazipur', libraryId?: string): ManualSeatBookingRecord[] {
    return this.manualBookings.filter(b => {
      if (libraryId && b.libraryId !== libraryId) return false;
      return true;
    });
  }

  public createManualBooking(booking: Omit<ManualSeatBookingRecord, 'id' | 'createdAt'>): ManualSeatBookingRecord {
    const newBooking: ManualSeatBookingRecord = {
      ...booking,
      id: `MAN-BK-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    this.manualBookings.unshift(newBooking);
    
    // Also reserve the seat in the library if found
    const lib = this.libraries.find(l => l.id === booking.libraryId);
    if (lib) {
      if (!lib.seats) lib.seats = [];
      const sIndex = lib.seats.findIndex(s => s.seatNumber.toLowerCase().includes(booking.seatNumber.toLowerCase()));
      if (sIndex !== -1) {
        lib.seats[sIndex].status = 'OCCUPIED';
        lib.seats[sIndex].assignedStudentName = booking.studentName;
        (lib.seats[sIndex] as any).isManual = true;
      }
      lib.availableSeats = Math.max(0, (lib.availableSeats || lib.totalSeats) - 1);
    }

    this.logAudit({
      id: `aud-${Date.now()}`,
      action: 'CREATE_MANUAL_SEAT_BOOKING',
      details: `Manually booked ${booking.seatNumber} at ${booking.libraryName} for ${booking.studentName} (${booking.shiftName || booking.shift || 'Default Shift'})`,
      timestamp: new Date().toISOString(),
      adminRole: booking.bookedByRole || 'DISTRICT_ADMIN',
    });
    this.saveToStorage();
    return newBooking;
  }

  // --- Left / Inactive Teachers ---
  public getLeftTeachers(district?: string): LeftTeacherRecord[] {
    if (!district) return [];
    return this.leftTeachers.filter(t => t.district.toLowerCase() === district.toLowerCase() || district.toLowerCase() === 'all');
  }

  public addLeftTeacher(record: Omit<LeftTeacherRecord, 'id'>): LeftTeacherRecord {
    const newRecord: LeftTeacherRecord = {
      ...record,
      id: `LEFT-TCH-${Date.now().toString(36).toUpperCase()}`,
    };
    this.leftTeachers.unshift(newRecord);
    this.saveToStorage();
    return newRecord;
  }

  public updateLeftTeacherSettlement(id: string, status: any, notes?: string): LeftTeacherRecord | null {
    const rec = this.leftTeachers.find(t => t.id === id);
    if (rec) {
      rec.settlementStatus = status === 'CLEARED' ? 'SETTLED' : status;
      rec.clearanceStatus = status;
      if (notes) rec.clearanceNotes = notes;
      this.saveToStorage();
      return rec;
    }
    return null;
  }

  // --- Manual Attendance Entry ---
  public addManualAttendance(record: any): AttendanceRecord {
    const newAtt: AttendanceRecord = {
      id: record.id || `att-man-${Date.now()}`,
      userId: record.studentId || `stu-man-${Date.now()}`,
      studentId: record.studentId,
      studentName: record.studentName,
      entityId: record.entityId || record.entityName,
      entityName: record.entityName,
      type: record.type || (record.sourceType === 'Home Tuition' ? 'TUTOR' : 'LIBRARY'),
      sourceType: record.sourceType || (record.type === 'TUTOR' ? 'Home Tuition' : 'Study Library'),
      date: record.date,
      time: record.time,
      checkInTime: record.checkIn || record.time,
      checkOutTime: record.checkOut,
      status: record.status || 'PRESENT',
      source: record.source || 'MANUAL',
      verifiedBy: record.verifiedBy,
      district: record.district || 'Ghazipur',
      remarks: record.remarks,
    };
    this.attendance.unshift(newAtt);
    this.logAudit({
      id: `aud-${Date.now()}`,
      action: 'ENTER_MANUAL_ATTENDANCE',
      details: `Manual attendance logged for ${record.studentName} at ${record.entityName} (${record.status})`,
      timestamp: new Date().toISOString(),
      adminRole: 'DISTRICT_ADMIN',
    });
    this.saveToStorage();
    return newAtt;
  }

  // --- Process Library Settlement ---
  public processLibrarySettlement(settlementId: string, transactionRef?: string) {
    const settlements = this.getLibrarySettlements();
    const item = settlements.find((s: any) => s.id === settlementId);
    if (item) {
      item.status = 'PAID';
      item.paidAt = new Date().toISOString();
      item.transactionRef = transactionRef || `NEFT-LIB-${Date.now().toString().slice(-6)}`;
      this.saveToStorage();
      return item;
    }
    return null;
  }

  // --- Technical Support Administrative Actions ---
  public performTechnicalSupportAction(
    actionOrObj: any,
    targetUserId?: string,
    targetUserName?: string,
    details?: string,
    adminUser?: any
  ) {
    if (typeof actionOrObj === 'object') {
      const obj = actionOrObj;
      const log = this.logAudit({
        id: obj.id || `aud-tech-${Date.now()}`,
        adminName: obj.performedBy || 'Manoj Rai (DA Ghazipur)',
        adminRole: 'DISTRICT_ADMIN',
        district: 'Ghazipur',
        action: `TECH_SUPPORT_${obj.actionType}`,
        details: `${obj.actionType} executed for ${obj.targetUserName} on ${obj.ticketId}: ${obj.reason}`,
        timestamp: obj.timestamp || new Date().toISOString(),
      });
      this.saveToStorage();
      return { success: true, auditLog: log };
    }

    const action = actionOrObj;
    const targetUser = this.users.find(u => u.id === targetUserId);
    let auditMessage = '';

    if (action === 'RESET_PASSWORD') {
      auditMessage = `Administrative temporary password reset triggered for ${targetUserName} (${targetUser?.email || targetUserId})`;
    } else if (action === 'UNLOCK_ACCOUNT') {
      if (targetUser) targetUser.isActive = true;
      auditMessage = `Account access restored / unlocked for ${targetUserName}`;
    } else if (action === 'CORRECT_FEES') {
      auditMessage = `Fee adjustment and ledger reconciliation applied for ${targetUserName}: ${details}`;
    } else {
      auditMessage = `Technical intervention for ${targetUserName}: ${details}`;
    }

    const log = this.logAudit({
      id: `aud-tech-${Date.now()}`,
      adminId: adminUser?.id || 'admin_ghz',
      adminName: adminUser?.name || 'Manoj Rai',
      adminRole: 'DISTRICT_ADMIN',
      district: adminUser?.districtName || adminUser?.district || 'Ghazipur',
      action: `TECH_SUPPORT_${action}`,
      details: auditMessage,
      entityId: targetUserId,
      entityType: 'USER',
      timestamp: new Date().toISOString(),
    });

    if (targetUserId) {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: targetUserId,
        title: 'Support Desk Action Taken',
        message: auditMessage,
        category: 'ADMIN',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.saveToStorage();
    return { success: true, auditLog: log };
  }

  // ==========================================
  // FOCUSPOINT DEMO BOOKING & PRICING SYSTEM
  // ==========================================

  public getDemoPricingRules(): DemoPricingRule[] {
    return [...this.demoPricingRules];
  }

  public saveDemoPricingRule(ruleData: Partial<DemoPricingRule>): DemoPricingRule {
    const today = new Date().toISOString();
    const serviceType = (ruleData.service_type || 'LIBRARY').toUpperCase() as 'LIBRARY' | 'HOME_TUITION';
    const scopeType = (ruleData.scope_type || 'PAN_INDIA').toUpperCase() as 'PAN_INDIA' | 'STATE' | 'DISTRICT' | 'PARTICULAR';

    if (ruleData.id) {
      const idx = this.demoPricingRules.findIndex(r => r.id === ruleData.id);
      if (idx !== -1) {
        this.demoPricingRules[idx] = {
          ...this.demoPricingRules[idx],
          ...ruleData,
          service_type: serviceType,
          scope_type: scopeType,
          updated_at: today,
        };
        this.saveToStorage();
        return this.demoPricingRules[idx];
      }
    }

    const newRule: DemoPricingRule = {
      id: ruleData.id || `rule-demo-${Date.now()}`,
      service_type: serviceType,
      scope_type: scopeType,
      state: ruleData.state,
      district: ruleData.district,
      service_id: ruleData.service_id,
      service_name: ruleData.service_name,
      price: Number(ruleData.price ?? 0),
      is_active: ruleData.is_active !== undefined ? ruleData.is_active : true,
      start_date: ruleData.start_date || today.substring(0, 10),
      end_date: ruleData.end_date,
      created_by: ruleData.created_by || 'Admin',
      created_at: today,
      updated_at: today,
    };

    this.demoPricingRules.unshift(newRule);
    this.saveToStorage();
    return newRule;
  }

  public deleteDemoPricingRule(id: string): boolean {
    const initialLen = this.demoPricingRules.length;
    this.demoPricingRules = this.demoPricingRules.filter(r => r.id !== id);
    if (this.demoPricingRules.length !== initialLen) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * 4-tier Pricing Hierarchy Engine
   * Priority: Particular Entity -> District -> State -> Pan India -> Complimentary Free (0)
   */
  public resolveDemoPrice(
    serviceType: 'LIBRARY' | 'HOME_TUITION' | 'library' | 'home_tuition',
    state?: string,
    district?: string,
    serviceId?: string
  ): DemoPriceCalculation {
    const normalizedType = (serviceType || 'LIBRARY').toUpperCase() as 'LIBRARY' | 'HOME_TUITION';
    const today = new Date().toISOString().substring(0, 10);

    const isRuleDateValid = (rule: DemoPricingRule) => {
      if (!rule.is_active) return false;
      if (rule.start_date && rule.start_date > today) return false;
      if (rule.end_date && rule.end_date < today) return false;
      return true;
    };

    // 1. Particular Library / Teacher Override
    if (serviceId) {
      const particularRule = this.demoPricingRules.find(r => 
        r.service_type === normalizedType &&
        r.scope_type === 'PARTICULAR' &&
        r.service_id === String(serviceId) &&
        isRuleDateValid(r)
      );

      if (particularRule) {
        return {
          price: particularRule.price,
          scopeUsed: 'PARTICULAR',
          ruleId: particularRule.id,
          ruleName: particularRule.service_name || 'Particular Entity Override',
          isFree: particularRule.price === 0
        };
      }
    }

    // 2. District Override
    if (district) {
      const districtRule = this.demoPricingRules.find(r => 
        r.service_type === normalizedType &&
        r.scope_type === 'DISTRICT' &&
        r.district?.trim().toLowerCase() === district.trim().toLowerCase() &&
        isRuleDateValid(r)
      );

      if (districtRule) {
        return {
          price: districtRule.price,
          scopeUsed: 'DISTRICT',
          ruleId: districtRule.id,
          ruleName: `${districtRule.district} District Override`,
          isFree: districtRule.price === 0
        };
      }
    }

    // 3. State Override
    if (state) {
      const stateRule = this.demoPricingRules.find(r => 
        r.service_type === normalizedType &&
        r.scope_type === 'STATE' &&
        r.state?.trim().toLowerCase() === state.trim().toLowerCase() &&
        isRuleDateValid(r)
      );

      if (stateRule) {
        return {
          price: stateRule.price,
          scopeUsed: 'STATE',
          ruleId: stateRule.id,
          ruleName: `${stateRule.state} State Override`,
          isFree: stateRule.price === 0
        };
      }
    }

    // 4. Pan India Standard Rule
    const panIndiaRule = this.demoPricingRules.find(r => 
      r.service_type === normalizedType &&
      r.scope_type === 'PAN_INDIA' &&
      isRuleDateValid(r)
    );

    if (panIndiaRule) {
      return {
        price: panIndiaRule.price,
        scopeUsed: 'PAN_INDIA',
        ruleId: panIndiaRule.id,
        ruleName: 'Pan India Standard Pricing',
        isFree: panIndiaRule.price === 0
      };
    }

    // 5. Default Fallback -> Complimentary Free (₹0)
    return {
      price: 0,
      scopeUsed: 'DEFAULT_FREE',
      ruleId: null,
      ruleName: 'Complimentary Free Demo',
      isFree: true
    };
  }

  /**
   * One-Time Demo Restriction Check
   * One student -> max 1 Library Demo booking
   * One student -> max 1 Home Tuition Demo booking
   */
  public checkDemoEligibility(studentId: string): DemoEligibility {
    if (!studentId) {
      return {
        canBookLibrary: true,
        canBookHomeTuition: true,
      };
    }

    const activeDemoBookings = this.demoBookings.filter(b => 
      b.student_id === studentId &&
      b.booking_status !== 'CANCELLED' &&
      (b.payment_status === 'PAID' || b.payment_status === 'FREE' || b.payment_status === 'PENDING')
    );

    const libBooking = activeDemoBookings.find(b => b.service_type === 'LIBRARY');
    const tutBooking = activeDemoBookings.find(b => b.service_type === 'HOME_TUITION');

    return {
      canBookLibrary: !libBooking,
      canBookHomeTuition: !tutBooking,
      libraryBooking: libBooking || null,
      tuitionBooking: tutBooking || null,
      libraryMessage: libBooking ? "You have already used your ZYZU'S Library Demo." : undefined,
      tuitionMessage: tutBooking ? "You have already used your ZYZU'S Home Tuition Demo." : undefined
    };
  }

  /**
   * Book Demo Seat / Demo Class
   * Price is permanently locked into the booking record at creation.
   */
  public createDemoBooking(bookingData: Partial<DemoBooking>): { success: boolean; message: string; booking?: DemoBooking } {
    const studentId = bookingData.student_id;
    if (!studentId) {
      return { success: false, message: 'Authentication required: Student profile not identified.' };
    }

    const serviceType = (bookingData.service_type || 'LIBRARY').toUpperCase() as 'LIBRARY' | 'HOME_TUITION';

    // Verify one-time eligibility
    const eligibility = this.checkDemoEligibility(studentId);
    if (serviceType === 'LIBRARY' && !eligibility.canBookLibrary) {
      return {
        success: false,
        message: "You have already used your ZYZU'S Library Demo.",
        booking: eligibility.libraryBooking || undefined
      };
    }

    if (serviceType === 'HOME_TUITION' && !eligibility.canBookHomeTuition) {
      return {
        success: false,
        message: "You have already used your ZYZU'S Home Tuition Demo.",
        booking: eligibility.tuitionBooking || undefined
      };
    }

    // Resolve applicable fee
    const priceCalculation = this.resolveDemoPrice(
      serviceType,
      bookingData.state,
      bookingData.district,
      bookingData.service_id
    );

    const lockedPrice = priceCalculation.price;
    const isComplimentary = lockedPrice === 0;

    // Generate Sequence-Based Unique ID
    const today = new Date();
    const compactDate = today.toISOString().substring(0, 10).replace(/-/g, '');
    const prefix = serviceType === 'LIBRARY' ? 'FP-LIB-DEMO' : 'FP-TUT-DEMO';
    const seq = String(this.demoBookings.length + 1).padStart(4, '0');
    const demoBookingId = `${prefix}-${compactDate}-${seq}`;

    // Look up student details if available
    const studentUser = this.users.find(u => u.id === studentId);

    const newBooking: DemoBooking = {
      id: `demo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      demo_booking_id: demoBookingId,
      student_id: studentId,
      student_name: bookingData.student_name || studentUser?.name || "ZYZU'S Student",
      student_photo: bookingData.student_photo || studentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      student_mobile: bookingData.student_mobile || studentUser?.phone || studentUser?.mobile || '+91 98765 43210',
      service_type: serviceType,
      service_id: bookingData.service_id || 'general-service',
      service_name: bookingData.service_name || (serviceType === 'LIBRARY' ? "ZYZU'S Partner Library" : "ZYZU'S Certified Tutor"),
      service_address: bookingData.service_address || "ZYZU'S City Centre, Ghazipur, UP",
      venue_details: bookingData.venue_details || 'Main Study Hall / Home Visit',
      tutor_subject: bookingData.tutor_subject,
      state: bookingData.state || 'Uttar Pradesh',
      district: bookingData.district || 'Ghazipur',
      demo_date: bookingData.demo_date || today.toISOString().substring(0, 10),
      demo_time: bookingData.demo_time || '10:00 AM - 11:30 AM',
      price: lockedPrice,
      pricing_rule_id: priceCalculation.ruleId,
      pricing_scope_used: priceCalculation.scopeUsed,
      payment_status: isComplimentary ? 'FREE' : 'PENDING',
      booking_status: isComplimentary ? 'CONFIRMED' : 'PENDING',
      notes: bookingData.notes || '',
      created_at: today.toISOString(),
      updated_at: today.toISOString()
    };

    this.demoBookings.unshift(newBooking);

    // Push notification to student
    this.notifications.unshift({
      id: `notif-demo-${Date.now()}`,
      userId: studentId,
      title: `${serviceType === 'LIBRARY' ? 'Library Seat' : 'Home Tuition'} Demo Booked!`,
      message: `Your demo pass ${demoBookingId} is generated for ${newBooking.demo_date}. Status: ${newBooking.booking_status}.`,
      category: 'BOOKING',
      isRead: false,
      createdAt: today.toISOString(),
    });

    this.saveToStorage();

    return {
      success: true,
      message: isComplimentary 
        ? "Demo pass confirmed instantly! Complimentary ZYZU'S seat allotted."
        : 'Demo booking initiated. Complete payment to confirm your pass.',
      booking: newBooking
    };
  }

  /**
   * Process and verify payment for demo booking
   */
  public processDemoPayment(bookingIdOrDemoId: string, paymentDetails?: any): { success: boolean; message: string; booking?: DemoBooking } {
    const booking = this.demoBookings.find(b => b.id === bookingIdOrDemoId || b.demo_booking_id === bookingIdOrDemoId);
    if (!booking) {
      return { success: false, message: 'Demo booking not found' };
    }

    if (booking.payment_status === 'PAID' || booking.payment_status === 'FREE') {
      return { success: true, message: 'Payment already completed for this demo pass', booking };
    }

    booking.payment_status = 'PAID';
    booking.booking_status = 'CONFIRMED';
    booking.payment_id = paymentDetails?.payment_id || `PAY-DEMO-${Date.now()}`;
    booking.payment_method = paymentDetails?.method || 'UPI';
    booking.updated_at = new Date().toISOString();

    // Push notification to student
    this.notifications.unshift({
      id: `notif-pay-${Date.now()}`,
      userId: booking.student_id,
      title: 'Demo Pass Confirmed & Paid!',
      message: `Payment of ₹${booking.price} received for Demo ID ${booking.demo_booking_id}. Your digital ID Card is ready.`,
      category: 'FEE',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    this.saveToStorage();
    return { success: true, message: 'Demo payment successful. Demo Pass confirmed!', booking };
  }

  public getStudentDemoBookings(studentId: string): DemoBooking[] {
    return this.demoBookings.filter(b => b.student_id === studentId);
  }

  public getDemoBookingById(idOrBookingId: string): DemoBooking | undefined {
    return this.demoBookings.find(b => b.id === idOrBookingId || b.demo_booking_id === idOrBookingId);
  }

  public getAllDemoBookings(filters?: {
    serviceType?: string;
    status?: string;
    paymentStatus?: string;
    district?: string;
    search?: string;
  }): DemoBooking[] {
    let result = [...this.demoBookings];

    if (filters?.serviceType && filters.serviceType !== 'ALL') {
      result = result.filter(b => b.service_type === filters.serviceType);
    }
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter(b => b.booking_status === filters.status);
    }
    if (filters?.paymentStatus && filters.paymentStatus !== 'ALL') {
      result = result.filter(b => b.payment_status === filters.paymentStatus);
    }
    if (filters?.district && filters.district !== 'ALL') {
      result = result.filter(b => b.district?.toLowerCase() === filters.district?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(b => 
        b.demo_booking_id.toLowerCase().includes(q) ||
        b.student_name?.toLowerCase().includes(q) ||
        b.service_name.toLowerCase().includes(q)
      );
    }

    return result;
  }

  /**
   * QR Code / Demo ID Verification
   */
  public verifyDemoQr(token: string, verifiedByUserId?: string): { valid: boolean; message: string; booking?: DemoBooking } {
    if (!token) {
      return { valid: false, message: 'Demo Booking ID or QR payload is required.' };
    }

    // If json token
    let searchKey = token.trim();
    if (searchKey.startsWith('{')) {
      try {
        const parsed = JSON.parse(searchKey);
        searchKey = parsed.id || parsed.demo_booking_id || searchKey;
      } catch (e) {
        // ignore json parse error
      }
    }

    const booking = this.demoBookings.find(b => 
      b.demo_booking_id.toLowerCase() === searchKey.toLowerCase() ||
      b.id === searchKey
    );

    if (!booking) {
      return {
        valid: false,
        message: 'Invalid Demo ID: No booking record exists with this identifier.'
      };
    }

    if (booking.booking_status === 'CANCELLED') {
      return {
        valid: false,
        message: 'Cancelled Demo Pass: This booking has been cancelled.',
        booking
      };
    }

    if (booking.payment_status === 'PENDING') {
      return {
        valid: false,
        message: 'Unconfirmed Demo Pass: Payment is pending for this demo booking.',
        booking
      };
    }

    // Mark as verified if scanned
    booking.verified_at = new Date().toISOString();
    booking.verified_by = verifiedByUserId || "ZYZU'S QR Scanner";
    this.saveToStorage();

    return {
      valid: true,
      message: "Verified ZYZU'S Demo Pass",
      booking
    };
  }

  // ==========================================
  // FOCUSPOINT STUDY MATERIAL MODULE METHODS
  // ==========================================

  public getStudyMaterials(filters?: {
    class?: string;
    category?: string;
    subject?: string;
    isPaid?: boolean;
    search?: string;
    status?: string;
  }): StudyMaterial[] {
    let result = [...this.studyMaterials];

    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter(m => m.status === filters.status);
    } else {
      // Default to published unless explicitly filtered
      if (!filters?.status) {
        result = result.filter(m => m.status === 'PUBLISHED');
      }
    }

    if (filters?.class && filters.class !== 'ALL') {
      const target = filters.class.toLowerCase();
      result = result.filter(m => 
        m.targetClass.toLowerCase() === target || 
        m.targetClass.toLowerCase() === 'all' ||
        target.includes(m.targetClass.toLowerCase()) ||
        m.targetClass.toLowerCase().includes(target)
      );
    }

    if (filters?.category && filters.category !== 'ALL') {
      result = result.filter(m => m.category === filters.category);
    }

    if (filters?.subject && filters.subject !== 'ALL') {
      result = result.filter(m => m.subject.toLowerCase() === filters.subject?.toLowerCase());
    }

    if (filters?.isPaid !== undefined) {
      result = result.filter(m => m.isPaid === filters.isPaid);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.targetClass.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }

  public getStudyMaterialById(id: string): StudyMaterial | undefined {
    return this.studyMaterials.find(m => m.id === id);
  }

  public saveStudyMaterial(materialData: Partial<StudyMaterial>): StudyMaterial {
    const existingIndex = this.studyMaterials.findIndex(m => m.id === materialData.id);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = this.studyMaterials[existingIndex];
      const updated: StudyMaterial = {
        ...existing,
        ...materialData,
        updatedAt: now,
      } as StudyMaterial;
      this.studyMaterials[existingIndex] = updated;
      this.saveToStorage();
      return updated;
    } else {
      const newId = materialData.id || `mat-${Date.now()}`;
      const versionNumber = materialData.currentVersion || 'v1.0';
      const initialVersion: StudyMaterialVersion = {
        versionId: `ver-${Date.now()}`,
        versionNumber,
        fileUrl: materialData.fullPdfUrl || '/documents/sample.pdf',
        fileName: materialData.fileName || 'material.pdf',
        fileSize: materialData.fileSize || '3.5 MB',
        pageCount: materialData.pageCount || 20,
        uploadedAt: now,
        uploadedBy: materialData.verifiedBy || 'Super Admin',
        changeLog: 'Initial release'
      };

      const newMaterial: StudyMaterial = {
        id: newId,
        title: materialData.title || 'Untitled Study Material',
        description: materialData.description || '',
        category: materialData.category || 'ACADEMIC',
        targetClass: materialData.targetClass || 'Class 10',
        educationStage: materialData.educationStage || 'SECONDARY',
        subject: materialData.subject || 'Mathematics',
        stream: materialData.stream,
        academicSession: materialData.academicSession || '2026-2027 (Current)',
        language: materialData.language || 'English Medium',
        difficultyLevel: materialData.difficultyLevel || 'MEDIUM',
        tags: materialData.tags || [],
        thumbnailUrl: materialData.thumbnailUrl || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&auto=format&fit=crop&q=80',
        previewPdfUrl: materialData.previewPdfUrl || '/sample-preview.pdf',
        previewPageCount: materialData.previewPageCount || 3,
        fullPdfUrl: materialData.fullPdfUrl || '/documents/sample.pdf',
        fileName: materialData.fileName || 'material.pdf',
        fileSize: materialData.fileSize || '3.5 MB',
        pageCount: materialData.pageCount || 20,
        currentVersion: versionNumber,
        versionHistory: materialData.versionHistory?.length ? materialData.versionHistory : [initialVersion],
        isPaid: materialData.isPaid || false,
        basePrice: materialData.isPaid ? (materialData.basePrice || 99) : 0,
        specialOfferPercentage: materialData.specialOfferPercentage,
        specialOfferLabel: materialData.specialOfferLabel,
        isFeatured: materialData.isFeatured || false,
        isVerified: materialData.isVerified !== undefined ? materialData.isVerified : true,
        verifiedBy: materialData.verifiedBy || "ZYZU'S Academic Cell",
        totalDownloads: materialData.totalDownloads || 0,
        totalPurchases: materialData.totalPurchases || 0,
        rating: materialData.rating || 5.0,
        reviewCount: materialData.reviewCount || 1,
        createdAt: now,
        updatedAt: now,
        status: materialData.status || 'PUBLISHED',
        requiresSubjectTutorUnlock: materialData.requiresSubjectTutorUnlock || false,
        targetExams: materialData.targetExams,
        targetGovernmentExams: materialData.targetGovernmentExams,
        pyqMetadata: materialData.pyqMetadata
      };

      this.studyMaterials.unshift(newMaterial);
      this.saveToStorage();
      return newMaterial;
    }
  }

  public deleteStudyMaterial(id: string): boolean {
    const idx = this.studyMaterials.findIndex(m => m.id === id);
    if (idx >= 0) {
      this.studyMaterials[idx].status = 'ARCHIVED';
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public uploadStudyMaterialVersion(
    materialId: string,
    versionData: {
      fileUrl: string;
      fileName: string;
      fileSize: string;
      pageCount: number;
      versionNumber: string;
      changeLog: string;
      uploadedBy: string;
    }
  ): StudyMaterial | undefined {
    const material = this.studyMaterials.find(m => m.id === materialId);
    if (!material) return undefined;

    const newVersion: StudyMaterialVersion = {
      versionId: `ver-${Date.now()}`,
      versionNumber: versionData.versionNumber,
      fileUrl: versionData.fileUrl,
      fileName: versionData.fileName,
      fileSize: versionData.fileSize,
      pageCount: versionData.pageCount,
      uploadedAt: new Date().toISOString(),
      uploadedBy: versionData.uploadedBy,
      changeLog: versionData.changeLog
    };

    material.currentVersion = versionData.versionNumber;
    material.fullPdfUrl = versionData.fileUrl;
    material.fileName = versionData.fileName;
    material.fileSize = versionData.fileSize;
    material.pageCount = versionData.pageCount;
    material.updatedAt = new Date().toISOString();
    material.versionHistory = [newVersion, ...material.versionHistory];

    this.saveToStorage();
    return material;
  }

  // --- Pricing Rules ---
  public getStudyMaterialPricingRules(): StudyMaterialPricingRule[] {
    return [...this.studyMaterialPricingRules];
  }

  public saveStudyMaterialPricingRule(rule: Partial<StudyMaterialPricingRule>): StudyMaterialPricingRule {
    const now = new Date().toISOString();
    const existingIndex = this.studyMaterialPricingRules.findIndex(r => r.id === rule.id);

    if (existingIndex >= 0) {
      const updated = {
        ...this.studyMaterialPricingRules[existingIndex],
        ...rule,
        updatedAt: now
      } as StudyMaterialPricingRule;
      this.studyMaterialPricingRules[existingIndex] = updated;
      this.saveToStorage();
      return updated;
    } else {
      const newRule: StudyMaterialPricingRule = {
        id: rule.id || `pr-${Date.now()}`,
        materialId: rule.materialId,
        level: rule.level || 'DISTRICT',
        targetEntityId: rule.targetEntityId,
        targetEntityName: rule.targetEntityName || 'District Override',
        price: rule.price || 99,
        currency: 'INR',
        isActive: rule.isActive !== undefined ? rule.isActive : true,
        notes: rule.notes || '',
        updatedAt: now,
        updatedBy: rule.updatedBy || 'District Admin'
      };
      this.studyMaterialPricingRules.unshift(newRule);
      this.saveToStorage();
      return newRule;
    }
  }

  public deleteStudyMaterialPricingRule(id: string): boolean {
    const idx = this.studyMaterialPricingRules.findIndex(r => r.id === id);
    if (idx >= 0) {
      this.studyMaterialPricingRules.splice(idx, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // --- Offers & Coupons ---
  public getStudyMaterialOffers(): StudyMaterialOffer[] {
    return [...this.studyMaterialOffers];
  }

  public saveStudyMaterialOffer(offer: Partial<StudyMaterialOffer>): StudyMaterialOffer {
    const existingIdx = this.studyMaterialOffers.findIndex(o => o.id === offer.id);
    if (existingIdx >= 0) {
      const updated = { ...this.studyMaterialOffers[existingIdx], ...offer } as StudyMaterialOffer;
      this.studyMaterialOffers[existingIdx] = updated;
      this.saveToStorage();
      return updated;
    } else {
      const newOffer: StudyMaterialOffer = {
        id: offer.id || `off-${Date.now()}`,
        title: offer.title || 'Special Discount',
        code: (offer.code || 'COUPON').toUpperCase().trim(),
        description: offer.description || '',
        discountType: offer.discountType || 'PERCENTAGE',
        discountValue: offer.discountValue || 10,
        minOrderValue: offer.minOrderValue || 0,
        applicableClasses: offer.applicableClasses,
        applicableCategories: offer.applicableCategories,
        applicableDistrictIds: offer.applicableDistrictIds,
        validFrom: offer.validFrom || new Date().toISOString(),
        validUntil: offer.validUntil || '2027-12-31T23:59:59.000Z',
        maxUsageCount: offer.maxUsageCount,
        usedCount: 0,
        isActive: offer.isActive !== undefined ? offer.isActive : true,
        stackable: offer.stackable || false
      };
      this.studyMaterialOffers.unshift(newOffer);
      this.saveToStorage();
      return newOffer;
    }
  }

  public deleteStudyMaterialOffer(id: string): boolean {
    const idx = this.studyMaterialOffers.findIndex(o => o.id === id);
    if (idx >= 0) {
      this.studyMaterialOffers.splice(idx, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public validateStudyMaterialCoupon(
    code: string,
    materialId: string,
    studentDistrict?: string,
    studentClass?: string
  ): { valid: boolean; offer?: StudyMaterialOffer; message: string; discountAmount: number } {
    if (!code || !code.trim()) {
      return { valid: false, message: 'Please enter a coupon code.', discountAmount: 0 };
    }

    const cleanCode = code.trim().toUpperCase();
    const offer = this.studyMaterialOffers.find(o => o.code === cleanCode && o.isActive);

    if (!offer) {
      return { valid: false, message: 'Invalid or expired coupon code.', discountAmount: 0 };
    }

    const now = new Date().toISOString();
    if (now < offer.validFrom || now > offer.validUntil) {
      return { valid: false, message: 'This coupon has expired.', discountAmount: 0 };
    }

    if (offer.maxUsageCount && offer.usedCount >= offer.maxUsageCount) {
      return { valid: false, message: 'Coupon usage limit has been reached.', discountAmount: 0 };
    }

    const material = this.studyMaterials.find(m => m.id === materialId);
    if (!material) {
      return { valid: false, message: 'Material not found.', discountAmount: 0 };
    }

    if (offer.minOrderValue && material.basePrice < offer.minOrderValue) {
      return {
        valid: false,
        message: `Minimum order value for this coupon is ₹${offer.minOrderValue}.`,
        discountAmount: 0
      };
    }

    if (offer.applicableClasses?.length && studentClass) {
      const match = offer.applicableClasses.some(c => c.toLowerCase() === studentClass.toLowerCase());
      if (!match) {
        return {
          valid: false,
          message: `Coupon is valid only for classes: ${offer.applicableClasses.join(', ')}.`,
          discountAmount: 0
        };
      }
    }

    if (offer.applicableDistrictIds?.length && studentDistrict) {
      const match = offer.applicableDistrictIds.some(
        d => d.toLowerCase() === studentDistrict.toLowerCase()
      );
      if (!match) {
        return {
          valid: false,
          message: `Coupon is only valid in specific promotional districts.`,
          discountAmount: 0
        };
      }
    }

    let discount = 0;
    if (offer.discountType === 'PERCENTAGE') {
      discount = Math.round((material.basePrice * offer.discountValue) / 100);
    } else {
      discount = offer.discountValue;
    }
    discount = Math.min(discount, material.basePrice);

    return {
      valid: true,
      offer,
      message: `Coupon applied: ${offer.title} (Save ₹${discount})`,
      discountAmount: discount
    };
  }

  // --- Download Policies & Quotas ---
  public getStudyMaterialDownloadPolicies(): StudyMaterialDownloadPolicy[] {
    return [...this.studyMaterialPolicies];
  }

  public saveStudyMaterialDownloadPolicy(
    policy: Partial<StudyMaterialDownloadPolicy>
  ): StudyMaterialDownloadPolicy {
    const now = new Date().toISOString();
    const existingIdx = this.studyMaterialPolicies.findIndex(p => p.id === policy.id);

    if (existingIdx >= 0) {
      const updated = {
        ...this.studyMaterialPolicies[existingIdx],
        ...policy,
        updatedAt: now
      } as StudyMaterialDownloadPolicy;
      this.studyMaterialPolicies[existingIdx] = updated;
      this.saveToStorage();
      return updated;
    } else {
      const newPolicy: StudyMaterialDownloadPolicy = {
        id: policy.id || `pol-${Date.now()}`,
        level: policy.level || 'DISTRICT',
        targetId: policy.targetId,
        targetName: policy.targetName || 'District Policy',
        monthlyLimit: policy.monthlyLimit || 3,
        allowCarryOver: policy.allowCarryOver || false,
        allowBonusDownloadsForPaid: policy.allowBonusDownloadsForPaid !== undefined ? policy.allowBonusDownloadsForPaid : true,
        isActive: policy.isActive !== undefined ? policy.isActive : true,
        updatedAt: now,
        updatedBy: policy.updatedBy || 'District Admin'
      };
      this.studyMaterialPolicies.unshift(newPolicy);
      this.saveToStorage();
      return newPolicy;
    }
  }

  public getStudentDownloadAllowance(
    studentId: string,
    district?: string,
    _currentClass?: string
  ): DownloadAllowance {
    const now = new Date();
    const monthKey = now.toISOString().slice(0, 7); // 'YYYY-MM'
    const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Next reset is 1st of next month
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextResetDate = nextMonth.toISOString().slice(0, 10);

    // Determine allowed quota
    let allowedQuota = 3;
    let policySource: 'PAN_INDIA_DEFAULT' | 'DISTRICT_POLICY' | 'CUSTOM_ADMIN' = 'PAN_INDIA_DEFAULT';

    // Check district policy override
    if (district) {
      const dstPolicy = this.studyMaterialPolicies.find(
        p => p.isActive && p.level === 'DISTRICT' && p.targetId?.toLowerCase() === district.toLowerCase()
      );
      if (dstPolicy) {
        allowedQuota = dstPolicy.monthlyLimit;
        policySource = 'DISTRICT_POLICY';
      }
    }

    // Tally usage in current month
    const userMonthDownloads = this.studyMaterialDownloads.filter(
      d => d.studentId === studentId && d.monthKey === monthKey
    );

    const usedDownloads = userMonthDownloads.filter(d => d.quotaConsumed).length;
    const bonusPaidDownloads = userMonthDownloads.filter(d => d.wasPaidDownload).length;
    const remainingDownloads = Math.max(0, allowedQuota - usedDownloads);

    return {
      studentId,
      monthKey,
      monthLabel,
      allowedMonthlyQuota: allowedQuota,
      usedDownloads,
      remainingDownloads,
      bonusPaidDownloads,
      canDownloadFree: remainingDownloads > 0,
      policySource,
      nextResetDate
    };
  }

  public recordStudyMaterialDownload(
    recordData: Omit<StudyMaterialDownloadRecord, 'id' | 'downloadDate' | 'monthKey'>
  ): StudyMaterialDownloadRecord {
    const now = new Date();
    const downloadDate = now.toISOString();
    const monthKey = downloadDate.slice(0, 7);

    const newRecord: StudyMaterialDownloadRecord = {
      id: `dwn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: recordData.studentId,
      studentName: recordData.studentName,
      materialId: recordData.materialId,
      materialTitle: recordData.materialTitle,
      targetClass: recordData.targetClass,
      subject: recordData.subject,
      fileVersion: recordData.fileVersion,
      downloadDate,
      monthKey,
      wasPaidDownload: recordData.wasPaidDownload,
      quotaConsumed: recordData.quotaConsumed,
      deviceIp: recordData.deviceIp || '127.0.0.1'
    };

    this.studyMaterialDownloads.unshift(newRecord);

    // Also increment material total downloads counter
    const mat = this.studyMaterials.find(m => m.id === recordData.materialId);
    if (mat) {
      mat.totalDownloads = (mat.totalDownloads || 0) + 1;
    }

    this.saveToStorage();
    return newRecord;
  }

  public getStudentDownloadHistory(studentId: string): StudyMaterialDownloadRecord[] {
    return this.studyMaterialDownloads.filter(d => d.studentId === studentId);
  }

  public getAllDownloadRecords(): StudyMaterialDownloadRecord[] {
    return [...this.studyMaterialDownloads];
  }

  // --- Purchases ---
  public recordStudyMaterialPurchase(
    purchaseData: Omit<StudyMaterialPurchase, 'id' | 'purchaseDate'>
  ): StudyMaterialPurchase {
    const purchaseDate = new Date().toISOString();
    const newPurchase: StudyMaterialPurchase = {
      id: `smp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: purchaseData.studentId,
      studentName: purchaseData.studentName,
      materialId: purchaseData.materialId,
      materialTitle: purchaseData.materialTitle,
      targetClass: purchaseData.targetClass,
      subject: purchaseData.subject,
      basePrice: purchaseData.basePrice,
      discountAmount: purchaseData.discountAmount,
      couponCode: purchaseData.couponCode,
      finalAmountPaid: purchaseData.finalAmountPaid,
      paymentStatus: purchaseData.paymentStatus,
      paymentMethod: purchaseData.paymentMethod,
      transactionReference: purchaseData.transactionReference,
      purchaseDate,
      invoiceId: purchaseData.invoiceId || `INV-SMP-${Date.now().toString().slice(-6)}`,
      districtId: purchaseData.districtId,
      districtName: purchaseData.districtName
    };

    this.studyMaterialPurchases.unshift(newPurchase);

    // Increment material purchase count
    const mat = this.studyMaterials.find(m => m.id === purchaseData.materialId);
    if (mat) {
      mat.totalPurchases = (mat.totalPurchases || 0) + 1;
    }

    // Increment coupon usage count if applied
    if (purchaseData.couponCode) {
      const off = this.studyMaterialOffers.find(o => o.code === purchaseData.couponCode);
      if (off) {
        off.usedCount = (off.usedCount || 0) + 1;
      }
    }

    this.saveToStorage();
    return newPurchase;
  }

  public getStudentPurchases(studentId: string): StudyMaterialPurchase[] {
    return this.studyMaterialPurchases.filter(p => p.studentId === studentId && p.paymentStatus === 'PAID');
  }

  public getAllPurchases(): StudyMaterialPurchase[] {
    return [...this.studyMaterialPurchases];
  }

  public hasStudentPurchased(studentId: string, materialId: string): boolean {
    return this.studyMaterialPurchases.some(
      p => p.studentId === studentId && p.materialId === materialId && p.paymentStatus === 'PAID'
    );
  }

  // =========================================================================
  // TEACHER REGISTRATION PRICING & PAYMENT LEDGER ENGINE
  // =========================================================================

  public getTeacherRegistrationPricingRules(district?: string): TeacherRegistrationPricingRule[] {
    if (!district) return [...this.teacherRegistrationPricingRules];
    const dLower = district.trim().toLowerCase();
    return this.teacherRegistrationPricingRules.filter(r => {
      if (r.scope === 'PAN_INDIA') return true;
      if (r.scope === 'STATE') return true;
      if (r.district && r.district.trim().toLowerCase() === dLower) return true;
      return false;
    });
  }

  public getTeacherRegistrationPricingRule(id: string): TeacherRegistrationPricingRule | undefined {
    return this.teacherRegistrationPricingRules.find(r => r.id === id);
  }

  public saveTeacherRegistrationPricingRule(
    ruleData: Partial<TeacherRegistrationPricingRule>,
    actor: { id: string; name: string; role: string; district?: string }
  ): { success: boolean; rule?: TeacherRegistrationPricingRule; error?: string } {
    if (!ruleData.scope) {
      return { success: false, error: 'Pricing scope is required (Pan-India, State, District, or Particular Teacher).' };
    }

    const price = Number(ruleData.price ?? 0);
    if (isNaN(price) || price < 0) {
      return { success: false, error: 'Registration fee cannot be negative or invalid.' };
    }

    // District Admin permission boundary check
    const isDistrictAdmin = actor.role === 'DISTRICT_ADMIN' || actor.role === 'district_admin';
    if (isDistrictAdmin) {
      const authorizedDistrict = actor.district || 'Ghazipur';
      if (ruleData.scope === 'PAN_INDIA' || ruleData.scope === 'STATE') {
        return { 
          success: false, 
          error: `Access Denied: District Admin is restricted to configuring pricing for ${authorizedDistrict} District only.` 
        };
      }
      if (ruleData.district && ruleData.district.trim().toLowerCase() !== authorizedDistrict.trim().toLowerCase()) {
        return { 
          success: false, 
          error: `Access Denied: You cannot modify pricing for ${ruleData.district} (authorized for ${authorizedDistrict} only).` 
        };
      }
      ruleData.district = authorizedDistrict;
    }

    if (ruleData.scope === 'STATE' && !ruleData.state?.trim()) {
      return { success: false, error: 'State name is required for State scope pricing.' };
    }

    if (ruleData.scope === 'DISTRICT' && (!ruleData.district?.trim() || !ruleData.state?.trim())) {
      return { success: false, error: 'Both State and District are required for District scope pricing.' };
    }

    if (ruleData.scope === 'PARTICULAR') {
      const hasIdentifier = Boolean(ruleData.teacherId?.trim() || ruleData.teacherEmail?.trim() || ruleData.teacherMobile?.trim());
      if (!hasIdentifier || !ruleData.teacherName?.trim()) {
        return { success: false, error: 'Teacher name and an identifier (ID, Email, or Mobile) are required for individual override.' };
      }
    }

    if (ruleData.effectiveUntil && ruleData.effectiveFrom && ruleData.effectiveUntil < ruleData.effectiveFrom) {
      return { success: false, error: 'Effective Until date cannot be earlier than Effective From date.' };
    }

    // Conflicting active rule check at same scope
    const existingActive = this.teacherRegistrationPricingRules.find(r => {
      if (r.id === ruleData.id) return false;
      if (r.status !== 'ACTIVE') return false;
      if (r.scope !== ruleData.scope) return false;

      if (r.scope === 'PAN_INDIA') return true;
      if (r.scope === 'STATE' && r.state?.trim().toLowerCase() === ruleData.state?.trim().toLowerCase()) return true;
      if (r.scope === 'DISTRICT' && 
          r.state?.trim().toLowerCase() === ruleData.state?.trim().toLowerCase() && 
          r.district?.trim().toLowerCase() === ruleData.district?.trim().toLowerCase()) return true;
      if (r.scope === 'PARTICULAR') {
        if (ruleData.teacherId && r.teacherId === ruleData.teacherId) return true;
        if (ruleData.teacherEmail && r.teacherEmail?.toLowerCase() === ruleData.teacherEmail.toLowerCase()) return true;
        if (ruleData.teacherMobile && r.teacherMobile === ruleData.teacherMobile) return true;
      }
      return false;
    });

    const now = new Date().toISOString();
    const effectiveFrom = ruleData.effectiveFrom || now.substring(0, 10);
    let savedRule: TeacherRegistrationPricingRule;

    if (ruleData.id) {
      const idx = this.teacherRegistrationPricingRules.findIndex(r => r.id === ruleData.id);
      if (idx === -1) {
        return { success: false, error: 'Pricing rule not found to update.' };
      }

      const prev = this.teacherRegistrationPricingRules[idx];
      savedRule = {
        ...prev,
        ...ruleData,
        price,
        isFree: price === 0,
        effectiveFrom,
        updatedAt: now,
        updatedByName: actor.name,
      } as TeacherRegistrationPricingRule;

      this.teacherRegistrationPricingRules[idx] = savedRule;

      // Log history
      this.teacherRegistrationPricingHistory.unshift({
        id: `tr-hist-${Date.now()}`,
        ruleId: savedRule.id,
        scope: savedRule.scope,
        state: savedRule.state,
        district: savedRule.district,
        teacherName: savedRule.teacherName,
        teacherIdentifier: savedRule.teacherEmail || savedRule.teacherMobile,
        previousFee: prev.price,
        newFee: price,
        effectiveDate: effectiveFrom,
        expiryDate: savedRule.effectiveUntil,
        changedBy: actor.name,
        changedByRole: actor.role,
        reason: ruleData.reason || `Updated ${savedRule.scope} registration fee from ₹${prev.price} to ₹${price}`,
        status: savedRule.status,
        timestamp: now.replace('T', ' ').substring(0, 19)
      });
    } else {
      savedRule = {
        id: `tr-rule-${Date.now().toString().slice(-6)}`,
        service: 'TEACHER_REGISTRATION',
        scope: ruleData.scope,
        state: ruleData.state,
        district: ruleData.district,
        teacherId: ruleData.teacherId,
        teacherEmail: ruleData.teacherEmail,
        teacherMobile: ruleData.teacherMobile,
        teacherName: ruleData.teacherName,
        price,
        isFree: price === 0,
        effectiveFrom,
        effectiveUntil: ruleData.effectiveUntil || undefined,
        status: ruleData.status || 'ACTIVE',
        createdAt: now,
        createdByRole: isDistrictAdmin ? 'DISTRICT_ADMIN' : 'SUPER_ADMIN',
        createdByName: actor.name,
        updatedAt: now,
        reason: ruleData.reason || `Initial ${ruleData.scope} registration policy created.`
      };

      this.teacherRegistrationPricingRules.unshift(savedRule);

      // Log history
      this.teacherRegistrationPricingHistory.unshift({
        id: `tr-hist-${Date.now()}`,
        ruleId: savedRule.id,
        scope: savedRule.scope,
        state: savedRule.state,
        district: savedRule.district,
        teacherName: savedRule.teacherName,
        teacherIdentifier: savedRule.teacherEmail || savedRule.teacherMobile,
        previousFee: existingActive ? existingActive.price : 0,
        newFee: price,
        effectiveDate: effectiveFrom,
        expiryDate: savedRule.effectiveUntil,
        changedBy: actor.name,
        changedByRole: actor.role,
        reason: ruleData.reason || `Created new ${savedRule.scope} registration rule.`,
        status: savedRule.status,
        timestamp: now.replace('T', ' ').substring(0, 19)
      });
    }

    this.saveToStorage();
    return { success: true, rule: savedRule };
  }

  public updateTeacherRegistrationPricingRuleStatus(
    id: string,
    status: TeacherRegistrationRuleStatus,
    actor: { id: string; name: string; role: string },
    reason?: string
  ): boolean {
    const rule = this.teacherRegistrationPricingRules.find(r => r.id === id);
    if (!rule) return false;

    const prevStatus = rule.status;
    rule.status = status;
    rule.updatedAt = new Date().toISOString();
    rule.updatedByName = actor.name;

    this.teacherRegistrationPricingHistory.unshift({
      id: `tr-hist-${Date.now()}`,
      ruleId: rule.id,
      scope: rule.scope,
      state: rule.state,
      district: rule.district,
      teacherName: rule.teacherName,
      previousFee: rule.price,
      newFee: rule.price,
      effectiveDate: rule.effectiveFrom,
      changedBy: actor.name,
      changedByRole: actor.role,
      reason: reason || `Status changed from ${prevStatus} to ${status}`,
      status,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });

    this.saveToStorage();
    return true;
  }

  public deleteTeacherRegistrationPricingRule(
    id: string,
    actor: { id: string; name: string; role: string }
  ): boolean {
    const idx = this.teacherRegistrationPricingRules.findIndex(r => r.id === id);
    if (idx === -1) return false;

    const rule = this.teacherRegistrationPricingRules[idx];
    this.teacherRegistrationPricingRules.splice(idx, 1);

    this.teacherRegistrationPricingHistory.unshift({
      id: `tr-hist-${Date.now()}`,
      ruleId: id,
      scope: rule.scope,
      state: rule.state,
      district: rule.district,
      teacherName: rule.teacherName,
      previousFee: rule.price,
      newFee: 0,
      effectiveDate: new Date().toISOString().substring(0, 10),
      changedBy: actor.name,
      changedByRole: actor.role,
      reason: `Pricing rule ${id} permanently deleted.`,
      status: 'DISABLED',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });

    this.saveToStorage();
    return true;
  }

  public getTeacherRegistrationPricingHistory(ruleId?: string): TeacherRegistrationPricingHistory[] {
    if (ruleId) {
      return this.teacherRegistrationPricingHistory.filter(h => h.ruleId === ruleId);
    }
    return [...this.teacherRegistrationPricingHistory];
  }

  /**
   * Resolves the applicable teacher registration fee based on the 4-tier hierarchy:
   * 1. Particular Teacher (by ID, Email, or Mobile)
   * 2. District
   * 3. State
   * 4. Pan-India
   * 5. Fallback Default (Complimentary Free / ₹0)
   */
  public resolveTeacherRegistrationFee(params: {
    state?: string;
    district?: string;
    teacherId?: string;
    email?: string;
    mobile?: string;
    couponCode?: string;
    registrationDate?: string;
  }): TeacherRegistrationPriceCalculation {
    const today = params.registrationDate || new Date().toISOString().substring(0, 10);

    const isRuleDateValid = (r: TeacherRegistrationPricingRule) => {
      if (r.status !== 'ACTIVE') return false;
      if (r.effectiveFrom && r.effectiveFrom > today) return false;
      if (r.effectiveUntil && r.effectiveUntil < today) return false;
      return true;
    };

    // Calculate Hierarchy Defaults for full Admin & Audit transparency
    const panIndiaRule = this.teacherRegistrationPricingRules.find(r => 
      r.scope === 'PAN_INDIA' && isRuleDateValid(r)
    );

    let stateRule: TeacherRegistrationPricingRule | undefined;
    if (params.state?.trim()) {
      const sLower = params.state.trim().toLowerCase();
      stateRule = this.teacherRegistrationPricingRules.find(r => 
        r.scope === 'STATE' && r.state?.trim().toLowerCase() === sLower && isRuleDateValid(r)
      );
    }

    let districtRule: TeacherRegistrationPricingRule | undefined;
    if (params.district?.trim()) {
      const dLower = params.district.trim().toLowerCase();
      districtRule = this.teacherRegistrationPricingRules.find(r => 
        r.scope === 'DISTRICT' && r.district?.trim().toLowerCase() === dLower && isRuleDateValid(r)
      );
    }

    let particularRule: TeacherRegistrationPricingRule | undefined;
    const tId = params.teacherId?.trim();
    const tEmail = params.email?.trim().toLowerCase();
    const tMobile = params.mobile?.trim();

    if (tId || tEmail || tMobile) {
      particularRule = this.teacherRegistrationPricingRules.find(r => {
        if (r.scope !== 'PARTICULAR' || !isRuleDateValid(r)) return false;
        if (tId && r.teacherId === tId) return true;
        if (tEmail && r.teacherEmail?.trim().toLowerCase() === tEmail) return true;
        if (tMobile && r.teacherMobile?.trim() === tMobile) return true;
        return false;
      });
    }

    const hierarchyBreakdown = {
      particularTeacher: particularRule ? {
        fee: particularRule.price,
        ruleId: particularRule.id,
        teacherName: particularRule.teacherName,
        active: true
      } : null,
      districtDefault: districtRule ? {
        fee: districtRule.price,
        ruleId: districtRule.id,
        district: districtRule.district || params.district || 'District',
        active: true
      } : null,
      stateDefault: stateRule ? {
        fee: stateRule.price,
        ruleId: stateRule.id,
        state: stateRule.state || params.state || 'State',
        active: true
      } : null,
      panIndiaDefault: panIndiaRule ? {
        fee: panIndiaRule.price,
        ruleId: panIndiaRule.id,
        active: true
      } : null,
      fallbackDefault: {
        fee: 0,
        policy: 'Platform Default Complimentary Free'
      }
    };

    // Priority 1: Particular Teacher Override
    if (particularRule) {
      return this.finalizePriceCalculation({
        applicableFee: particularRule.price,
        pricingRuleId: particularRule.id,
        pricingScope: 'PARTICULAR',
        ruleName: `Teacher Override: ${particularRule.teacherName || 'Individual'}`,
        effectivePeriod: { from: particularRule.effectiveFrom, until: particularRule.effectiveUntil },
        status: particularRule.status,
        hierarchyBreakdown,
        couponCode: params.couponCode
      });
    }

    // Priority 2: District Override
    if (districtRule) {
      return this.finalizePriceCalculation({
        applicableFee: districtRule.price,
        pricingRuleId: districtRule.id,
        pricingScope: 'DISTRICT',
        ruleName: `${districtRule.district} District Registration Fee`,
        effectivePeriod: { from: districtRule.effectiveFrom, until: districtRule.effectiveUntil },
        status: districtRule.status,
        hierarchyBreakdown,
        couponCode: params.couponCode
      });
    }

    // Priority 3: State Override
    if (stateRule) {
      return this.finalizePriceCalculation({
        applicableFee: stateRule.price,
        pricingRuleId: stateRule.id,
        pricingScope: 'STATE',
        ruleName: `${stateRule.state} State Registration Fee`,
        effectivePeriod: { from: stateRule.effectiveFrom, until: stateRule.effectiveUntil },
        status: stateRule.status,
        hierarchyBreakdown,
        couponCode: params.couponCode
      });
    }

    // Priority 4: Pan-India Standard Rule
    if (panIndiaRule) {
      return this.finalizePriceCalculation({
        applicableFee: panIndiaRule.price,
        pricingRuleId: panIndiaRule.id,
        pricingScope: 'PAN_INDIA',
        ruleName: 'Pan-India Teacher Registration Fee',
        effectivePeriod: { from: panIndiaRule.effectiveFrom, until: panIndiaRule.effectiveUntil },
        status: panIndiaRule.status,
        hierarchyBreakdown,
        couponCode: params.couponCode
      });
    }

    // Priority 5: Fallback Default (Complimentary Free / ₹0)
    return this.finalizePriceCalculation({
      applicableFee: 0,
      pricingRuleId: null,
      pricingScope: 'DEFAULT_FREE',
      ruleName: 'Complimentary Free Teacher Registration',
      effectivePeriod: { from: today },
      status: 'ACTIVE',
      hierarchyBreakdown,
      couponCode: params.couponCode
    });
  }

  private finalizePriceCalculation(input: {
    applicableFee: number;
    pricingRuleId: string | null;
    pricingScope: TeacherRegistrationPriceCalculation['pricingScope'];
    ruleName: string;
    effectivePeriod: { from: string; until?: string };
    status: string;
    hierarchyBreakdown: any;
    couponCode?: string;
  }): TeacherRegistrationPriceCalculation {
    const baseFee = input.applicableFee;

    // Check offers & coupons
    let offerDiscount = 0;
    let offerName: string | undefined;
    let offerId: string | undefined;

    // Evaluate active offers from studyMaterialOffers or superAdminOffers if baseFee > 0
    if (baseFee > 0) {
      const activeOffer = this.studyMaterialOffers.find(o => 
        o.isActive && 
        (!o.validUntil || o.validUntil >= new Date().toISOString().substring(0, 10)) &&
        (o.applicableClasses?.includes('Teacher Registration') || 
         o.title.toLowerCase().includes('teacher registration') || 
         o.description?.toLowerCase().includes('teacher registration'))
      );

      if (activeOffer) {
        offerName = activeOffer.title;
        offerId = activeOffer.id;
        if (activeOffer.discountType === 'PERCENTAGE') {
          offerDiscount = Math.round((baseFee * activeOffer.discountValue) / 100);
        } else {
          offerDiscount = Math.min(baseFee, activeOffer.discountValue);
        }
      }
    }

    let couponDiscount = 0;
    let couponCode: string | undefined;

    if (input.couponCode && baseFee > 0) {
      const cleanCode = input.couponCode.trim().toUpperCase();
      couponCode = cleanCode;

      if (cleanCode === 'TEACHER100') {
        couponDiscount = 100;
      } else if (cleanCode === 'TEACHER50' || cleanCode === 'FP50') {
        couponDiscount = 50;
      } else if (cleanCode === 'FESTIVE20') {
        couponDiscount = Math.round((baseFee * 20) / 100);
      } else if (cleanCode === 'WELCOMEFREE') {
        couponDiscount = baseFee;
      }
    }

    const netPayable = Math.max(0, baseFee - offerDiscount - couponDiscount);
    const isFree = netPayable === 0;

    return {
      applicableFee: baseFee,
      isFree,
      paymentRequired: netPayable > 0,
      pricingRuleId: input.pricingRuleId,
      pricingScope: input.pricingScope,
      ruleName: input.ruleName,
      effectivePeriod: input.effectivePeriod,
      currency: 'INR',
      status: input.status,
      hierarchyBreakdown: input.hierarchyBreakdown,
      offerDiscount: offerDiscount > 0 ? offerDiscount : undefined,
      offerName,
      offerId,
      couponDiscount: couponDiscount > 0 ? couponDiscount : undefined,
      couponCode,
      finalPayableFee: netPayable
    };
  }

  public recordTeacherRegistrationPayment(
    paymentRecord: TeacherRegistrationPaymentRecord
  ): TeacherRegistrationPaymentRecord {
    this.teacherRegistrationPayments.unshift(paymentRecord);

    // Update teacher entity if present
    const tId = paymentRecord.teacherId;
    const tEmail = paymentRecord.teacherEmail?.toLowerCase();
    const tMobile = paymentRecord.teacherMobile;

    const teacher = this.teachers.find(t => 
      (tId && t.id === tId) ||
      (tEmail && t.email?.toLowerCase() === tEmail) ||
      (tMobile && (t.mobile === tMobile || t.phone === tMobile))
    );

    if (teacher) {
      teacher.registrationFee = paymentRecord.originalFee;
      teacher.registrationPaymentStatus = paymentRecord.paymentStatus;
      teacher.registrationPaymentId = paymentRecord.paymentId;
      teacher.registrationPricingRuleId = paymentRecord.pricingRuleId;
      teacher.registrationPricingScope = paymentRecord.pricingScope;
      teacher.registrationDiscount = (paymentRecord.offerDiscount || 0) + (paymentRecord.couponDiscount || 0);
      teacher.registrationCoupon = paymentRecord.couponDiscount > 0 ? 'COUPON_APPLIED' : undefined;
      teacher.registrationFinalAmount = paymentRecord.finalAmount;
      teacher.registrationPaidAt = paymentRecord.confirmedAt || paymentRecord.createdAt;
    }

    // Add notification
    this.addNotification({
      id: `notif-tr-pay-${Date.now()}`,
      userId: paymentRecord.teacherId || 'all',
      title: paymentRecord.paymentStatus === 'PAID' ? 'Registration Payment Confirmed' : 'Registration Payment Received',
      message: `Your ZYZU'S teacher registration fee of ₹${paymentRecord.finalAmount} was successfully recorded. Reference: ${paymentRecord.paymentId || paymentRecord.id}.`,
      type: 'PAYMENT',
      link: '/teacher/dashboard',
      createdAt: new Date().toISOString(),
      isRead: false
    });

    this.saveToStorage();
    return paymentRecord;
  }

  public getTeacherRegistrationPayments(district?: string): TeacherRegistrationPaymentRecord[] {
    if (!district) return [...this.teacherRegistrationPayments];
    const dLower = district.trim().toLowerCase();
    return this.teacherRegistrationPayments.filter(p => 
      p.district && p.district.trim().toLowerCase() === dLower
    );
  }

  public getTeacherRegistrationAnalytics(district?: string): TeacherRegistrationAnalytics {
    const list = this.getTeacherRegistrationPayments(district);
    
    let paidCount = 0;
    let freeCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let refundedCount = 0;
    let grossRevenue = 0;
    let totalDiscounts = 0;
    let couponCount = 0;
    let couponDiscounts = 0;
    let netRevenue = 0;

    list.forEach(item => {
      grossRevenue += item.originalFee || 0;
      totalDiscounts += (item.offerDiscount || 0) + (item.couponDiscount || 0);
      if (item.couponDiscount > 0) {
        couponCount++;
        couponDiscounts += item.couponDiscount;
      }

      if (item.paymentStatus === 'PAID') {
        paidCount++;
        netRevenue += item.finalAmount || 0;
      } else if (item.paymentStatus === 'FREE') {
        freeCount++;
      } else if (item.paymentStatus === 'PAYMENT_PENDING') {
        pendingCount++;
      } else if (item.paymentStatus === 'PAYMENT_FAILED') {
        failedCount++;
      } else if (item.paymentStatus === 'REFUNDED') {
        refundedCount++;
      }
    });

    return {
      totalRegistrations: list.length,
      paidRegistrations: paidCount,
      freeRegistrations: freeCount,
      pendingPayments: pendingCount,
      failedPayments: failedCount,
      refundedPayments: refundedCount,
      grossRegistrationRevenue: grossRevenue,
      discounts: totalDiscounts,
      couponUsageCount: couponCount,
      couponDiscounts: couponDiscounts,
      netRegistrationRevenue: netRevenue
    };
  }

  // ==========================================
  // LIBRARY LISTING SUBSCRIPTION & PRICING
  // ==========================================

  public getLibrarySubscriptionPlans(): LibrarySubscriptionPlan[] {
    return [...this.librarySubscriptionPlans];
  }

  public saveLibrarySubscriptionPlan(plan: LibrarySubscriptionPlan): LibrarySubscriptionPlan {
    const idx = this.librarySubscriptionPlans.findIndex(p => p.id === plan.id);
    if (idx >= 0) {
      this.librarySubscriptionPlans[idx] = { ...plan };
    } else {
      this.librarySubscriptionPlans.push({ ...plan });
    }
    this.saveToStorage();
    return plan;
  }

  public getLibrarySubscriptionPricingRules(district?: string): LibrarySubscriptionPricingRule[] {
    if (!district) return [...this.librarySubscriptionPricingRules];
    const dLower = district.trim().toLowerCase();
    return this.librarySubscriptionPricingRules.filter(r => 
      r.scope === 'PAN_INDIA' || 
      (r.district && r.district.trim().toLowerCase() === dLower)
    );
  }

  public saveLibrarySubscriptionPricingRule(
    rule: LibrarySubscriptionPricingRule,
    userRole?: string,
    userDistrict?: string
  ): LibrarySubscriptionPricingRule {
    const isDistrictAdmin = userRole === 'district_admin' || userRole === 'DISTRICT_ADMIN';

    if (isDistrictAdmin) {
      if (rule.scope === 'PAN_INDIA' || rule.scope === 'STATE') {
        throw new Error('Access Denied: District Admins cannot configure Pan-India or State subscription pricing.');
      }
      if (rule.district && userDistrict && rule.district.trim().toLowerCase() !== userDistrict.trim().toLowerCase()) {
        throw new Error(`Access Denied: District Admins can only configure pricing for their assigned district (${userDistrict}).`);
      }
    }

    if (rule.price < 0) {
      throw new Error('Subscription fee cannot be negative.');
    }

    const nowIso = new Date().toISOString();
    const updatedRule: LibrarySubscriptionPricingRule = {
      ...rule,
      id: rule.id || `ls-rule-${Date.now()}`,
      currency: rule.currency || 'INR',
      status: rule.status || 'ACTIVE',
      gracePeriodDays: rule.gracePeriodDays ?? 7,
      refundPolicy: rule.refundPolicy || 'FULL_24H',
      priceProtection: rule.priceProtection || 'NONE',
      updatedAt: nowIso,
      updatedBy: rule.updatedBy || (isDistrictAdmin ? `${userDistrict || 'District'} Admin` : 'Super Admin')
    };

    const existingIdx = this.librarySubscriptionPricingRules.findIndex(r => r.id === updatedRule.id);
    if (existingIdx >= 0) {
      this.librarySubscriptionPricingRules[existingIdx] = updatedRule;
    } else {
      this.librarySubscriptionPricingRules.unshift(updatedRule);
    }

    this.saveToStorage();
    return updatedRule;
  }

  public deleteLibrarySubscriptionPricingRule(
    ruleId: string,
    userRole?: string,
    userDistrict?: string
  ): boolean {
    const rule = this.librarySubscriptionPricingRules.find(r => r.id === ruleId);
    if (!rule) return false;

    const isDistrictAdmin = userRole === 'district_admin' || userRole === 'DISTRICT_ADMIN';
    if (isDistrictAdmin) {
      if (rule.scope === 'PAN_INDIA' || rule.scope === 'STATE') {
        throw new Error('Access Denied: District Admins cannot delete Pan-India or State pricing rules.');
      }
      if (rule.district && userDistrict && rule.district.trim().toLowerCase() !== userDistrict.trim().toLowerCase()) {
        throw new Error(`Access Denied: District Admins cannot modify pricing outside their assigned district.`);
      }
    }

    this.librarySubscriptionPricingRules = this.librarySubscriptionPricingRules.filter(r => r.id !== ruleId);
    this.saveToStorage();
    return true;
  }

  public resolveLibrarySubscriptionPrice(params: {
    state?: string;
    district?: string;
    libraryId?: string;
    libraryName?: string;
    planId?: string;
    couponCode?: string;
    date?: string;
  }): LibrarySubscriptionPriceCalculation {
    const today = params.date || new Date().toISOString().substring(0, 10);

    const isRuleDateValid = (r: LibrarySubscriptionPricingRule) => {
      if (r.status !== 'ACTIVE') return false;
      if (r.effectiveFrom && r.effectiveFrom > today) return false;
      if (r.effectiveUntil && r.effectiveUntil < today) return false;
      return true;
    };

    const targetPlanId = params.planId || 'lsp-monthly';
    const selectedPlan = this.librarySubscriptionPlans.find(p => 
      p.id === targetPlanId || 
      p.id === targetPlanId.replace('plan-lib-', 'lsp-') ||
      p.billingCycle === targetPlanId ||
      p.billingCycle === (params as any).billingCycle
    ) || this.librarySubscriptionPlans[0] || MOCK_LIBRARY_SUBSCRIPTION_PLANS[0];

    const calcPlanDurationPrice = (monthlyFee: number, plan: LibrarySubscriptionPlan): number => {
      if (monthlyFee === 0) return 0;
      if (plan.billingCycle === 'MONTHLY') return monthlyFee;
      if (plan.billingCycle === 'QUARTERLY') return Math.round(monthlyFee * 3 * 0.85); // 15% discount
      if (plan.billingCycle === 'HALF_YEARLY') return Math.round(monthlyFee * 6 * 0.80); // 20% discount
      if (plan.billingCycle === 'YEARLY') return Math.round(monthlyFee * 12 * 0.75); // 25% discount
      return monthlyFee * (plan.durationMonths || 1);
    };

    // Calculate Hierarchy Defaults for full Admin & Audit transparency
    const panIndiaRule = this.librarySubscriptionPricingRules.find(r => 
      r.scope === 'PAN_INDIA' && isRuleDateValid(r)
    );

    let stateRule: LibrarySubscriptionPricingRule | undefined;
    if (params.state?.trim()) {
      const sLower = params.state.trim().toLowerCase();
      stateRule = this.librarySubscriptionPricingRules.find(r => 
        r.scope === 'STATE' && r.state?.trim().toLowerCase() === sLower && isRuleDateValid(r)
      );
    }

    let districtRule: LibrarySubscriptionPricingRule | undefined;
    if (params.district?.trim()) {
      const dLower = params.district.trim().toLowerCase();
      districtRule = this.librarySubscriptionPricingRules.find(r => 
        r.scope === 'DISTRICT' && r.district?.trim().toLowerCase() === dLower && isRuleDateValid(r)
      );
    }

    let particularRule: LibrarySubscriptionPricingRule | undefined;
    const lId = params.libraryId?.trim();
    const lName = params.libraryName?.trim().toLowerCase();

    if (lId || lName) {
      particularRule = this.librarySubscriptionPricingRules.find(r => {
        if (r.scope !== 'PARTICULAR' || !isRuleDateValid(r)) return false;
        if (lId && r.libraryId === lId) return true;
        if (lName && r.libraryName) {
          const rName = r.libraryName.trim().toLowerCase();
          if (rName === lName || rName.includes(lName) || lName.includes(rName)) return true;
        }
        return false;
      });
    }

    const hierarchyBreakdown = {
      particularLibrary: particularRule ? {
        fee: calcPlanDurationPrice(particularRule.price, selectedPlan),
        ruleId: particularRule.id,
        libraryName: particularRule.libraryName || 'Particular Library',
        active: true
      } : null,
      districtDefault: districtRule ? {
        fee: calcPlanDurationPrice(districtRule.price, selectedPlan),
        ruleId: districtRule.id,
        district: districtRule.district || params.district || 'District',
        active: true
      } : null,
      stateDefault: stateRule ? {
        fee: calcPlanDurationPrice(stateRule.price, selectedPlan),
        ruleId: stateRule.id,
        state: stateRule.state || params.state || 'State',
        active: true
      } : null,
      panIndiaDefault: panIndiaRule ? {
        fee: calcPlanDurationPrice(panIndiaRule.price, selectedPlan),
        ruleId: panIndiaRule.id,
        active: true
      } : null,
      fallbackDefault: {
        fee: 0,
        policy: 'Platform Default Complimentary Free'
      }
    };

    // Determine winning rule following 4-tier hierarchy
    let activeRule: LibrarySubscriptionPricingRule | null = null;
    let pricingScope: 'PARTICULAR' | 'DISTRICT' | 'STATE' | 'PAN_INDIA' | 'DEFAULT_FREE' = 'DEFAULT_FREE';
    let baseMonthlyPrice = 0;
    let ruleName = 'Complimentary Free Library Listing';

    if (particularRule) {
      activeRule = particularRule;
      pricingScope = 'PARTICULAR';
      baseMonthlyPrice = particularRule.price;
      ruleName = `Library Override: ${particularRule.libraryName || 'Custom Partner'}`;
    } else if (districtRule) {
      activeRule = districtRule;
      pricingScope = 'DISTRICT';
      baseMonthlyPrice = districtRule.price;
      ruleName = `${districtRule.district} District Listing Plan`;
    } else if (stateRule) {
      activeRule = stateRule;
      pricingScope = 'STATE';
      baseMonthlyPrice = stateRule.price;
      ruleName = `${stateRule.state} State Listing Standard`;
    } else if (panIndiaRule) {
      activeRule = panIndiaRule;
      pricingScope = 'PAN_INDIA';
      baseMonthlyPrice = panIndiaRule.price;
      ruleName = 'Pan-India Standard Library Listing';
    }

    const months = selectedPlan.durationMonths || 1;
    const undiscountedDurationPrice = baseMonthlyPrice * months;
    const applicableDurationPrice = calcPlanDurationPrice(baseMonthlyPrice, selectedPlan);
    const durationSavings = Math.max(0, undiscountedDurationPrice - applicableDurationPrice);

    // Evaluate active offers specifically for library listing subscription
    let promoOfferDiscount = 0;
    let offerName: string | undefined;

    if (applicableDurationPrice > 0) {
      const activeOffer = this.studyMaterialOffers.find(o => 
        o.isActive && 
        (!o.validUntil || o.validUntil >= today) &&
        (o.applicableClasses?.includes('Library Subscription') || 
         o.title.toLowerCase().includes('library subscription') || 
         o.description?.toLowerCase().includes('library subscription') ||
         o.title.toLowerCase().includes('library listing'))
      );

      if (activeOffer) {
        offerName = activeOffer.title;
        if (activeOffer.discountType === 'PERCENTAGE') {
          promoOfferDiscount = Math.round((applicableDurationPrice * activeOffer.discountValue) / 100);
        } else {
          promoOfferDiscount = Math.min(applicableDurationPrice, activeOffer.discountValue);
        }
      }
    }

    const totalOfferDiscount = durationSavings + promoOfferDiscount;

    // Evaluate coupons
    let couponDiscount = 0;
    let couponCode: string | undefined;

    if (params.couponCode && applicableDurationPrice > 0) {
      const cleanCode = params.couponCode.trim().toUpperCase();
      couponCode = cleanCode;

      if (cleanCode === 'LIBRARY50' || cleanCode === 'FP50') {
        couponDiscount = 50;
      } else if (cleanCode === 'LIBRARY100' || cleanCode === 'LIB100') {
        couponDiscount = 100;
      } else if (cleanCode === 'FESTIVE20' || cleanCode === 'LIB20') {
        couponDiscount = Math.round((applicableDurationPrice * 20) / 100);
      } else if (cleanCode === 'WELCOMEFREE' || cleanCode === 'LIBFREE') {
        couponDiscount = applicableDurationPrice;
      }
    }

    const finalPayable = Math.max(0, applicableDurationPrice - promoOfferDiscount - couponDiscount);
    const isFree = finalPayable === 0;

    return {
      basePrice: undiscountedDurationPrice,
      applicablePrice: applicableDurationPrice,
      pricingRuleId: activeRule ? activeRule.id : null,
      pricingScope,
      ruleName,
      offerDiscount: totalOfferDiscount,
      offerName: offerName || (durationSavings > 0 ? `${selectedPlan.savingsPercent || 15}% Duration Savings` : undefined),
      couponDiscount,
      couponCode,
      finalPayableAmount: finalPayable,
      paymentRequired: !isFree,
      isFree,
      selectedPlan,
      hierarchyBreakdown
    };
  }

  public createLibrarySubscription(data: Partial<LibrarySubscription>): LibrarySubscription {
    const nowIso = new Date().toISOString();
    const activatedAt = data.activatedAt || nowIso;
    const cancelDeadline = new Date(new Date(activatedAt).getTime() + 24 * 60 * 60 * 1000).toISOString();

    const plan = this.librarySubscriptionPlans.find(p => p.id === data.planId) 
      || this.librarySubscriptionPlans[0] 
      || MOCK_LIBRARY_SUBSCRIPTION_PLANS[0];

    const durationDays = plan.durationDays || 30;
    const expiryDate = data.expiryDate 
      || new Date(new Date(activatedAt).getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    const subscription: LibrarySubscription = {
      id: data.id || `lsub-${Date.now()}`,
      libraryId: data.libraryId || `lib-${Date.now()}`,
      libraryName: data.libraryName || 'Study Library',
      ownerId: data.ownerId || 'usr-owner',
      ownerName: data.ownerName || 'Library Owner',
      ownerEmail: data.ownerEmail || 'owner@focuspoint.internal',
      ownerMobile: data.ownerMobile || '9876543210',
      state: data.state || 'Uttar Pradesh',
      district: data.district || 'Ghazipur',
      planId: plan.id,
      planName: plan.name,
      billingCycle: plan.billingCycle,
      basePrice: data.basePrice ?? plan.basePrice,
      pricingRuleId: data.pricingRuleId,
      pricingScope: data.pricingScope || 'PAN_INDIA',
      offerDiscount: data.offerDiscount || 0,
      offerId: data.offerId,
      offerName: data.offerName,
      couponDiscount: data.couponDiscount || 0,
      couponCode: data.couponCode,
      finalPaidAmount: data.finalPaidAmount ?? 0,
      isFree: data.isFree ?? (data.finalPaidAmount === 0),
      status: data.status || (data.finalPaidAmount === 0 ? 'ACTIVE' : 'PAYMENT_PENDING'),
      paymentId: data.paymentId,
      paymentMethod: data.paymentMethod || 'ONLINE_GATEWAY',
      startDate: activatedAt.substring(0, 10),
      expiryDate,
      renewalDate: expiryDate,
      activatedAt,
      autoRenew: data.autoRenew ?? true,
      cancellationDeadline: cancelDeadline,
      priceProtection: data.priceProtection || 'NONE',
      lockedPrice: data.lockedPrice,
      invoiceNumber: data.invoiceNumber || `INV-LS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const existingIdx = this.librarySubscriptions.findIndex(s => s.id === subscription.id);
    if (existingIdx >= 0) {
      this.librarySubscriptions[existingIdx] = subscription;
    } else {
      this.librarySubscriptions.unshift(subscription);
    }

    // Link and synchronize with the matching Library record
    const libIdx = this.libraries.findIndex(l => l.id === subscription.libraryId);
    if (libIdx >= 0) {
      this.libraries[libIdx] = {
        ...this.libraries[libIdx],
        subscriptionId: subscription.id,
        subscriptionPlanId: subscription.planId,
        subscriptionPlanName: subscription.planName,
        subscriptionBillingCycle: subscription.billingCycle,
        subscriptionStatus: subscription.status,
        subscriptionPaidAmount: subscription.finalPaidAmount,
        subscriptionStartDate: subscription.startDate,
        subscriptionExpiryDate: subscription.expiryDate,
        isSubscriptionFree: subscription.isFree,
        autoRenew: subscription.autoRenew
      };
    }

    this.saveToStorage();
    return subscription;
  }

  public getLibrarySubscriptions(filters?: {
    district?: string;
    state?: string;
    status?: string;
    planId?: string;
    search?: string;
  }): LibrarySubscription[] {
    let list = [...this.librarySubscriptions];

    if (filters?.district) {
      const dLower = filters.district.trim().toLowerCase();
      list = list.filter(s => s.district && s.district.trim().toLowerCase() === dLower);
    }
    if (filters?.state) {
      const sLower = filters.state.trim().toLowerCase();
      list = list.filter(s => s.state && s.state.trim().toLowerCase() === sLower);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(s => s.status === filters.status);
    }
    if (filters?.planId && filters.planId !== 'ALL') {
      list = list.filter(s => s.planId === filters.planId);
    }
    if (filters?.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(s => 
        s.libraryName.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q) ||
        s.ownerEmail.toLowerCase().includes(q) ||
        s.ownerMobile.includes(q) ||
        (s.invoiceNumber && s.invoiceNumber.toLowerCase().includes(q))
      );
    }

    return list;
  }

  public getLibrarySubscriptionById(id: string): LibrarySubscription | undefined {
    return this.librarySubscriptions.find(s => s.id === id);
  }

  public getLibrarySubscriptionByLibraryId(libraryId: string): LibrarySubscription | undefined {
    return this.librarySubscriptions.find(s => s.libraryId === libraryId);
  }

  public requestSubscriptionCancellation(
    subscriptionId: string,
    reason: string,
    reasonCategory: string
  ): {
    success: boolean;
    error?: string;
    cancellationRequest?: LibrarySubscriptionCancellationRequest;
    refundAmount?: number;
  } {
    const subIndex = this.librarySubscriptions.findIndex(s => s.id === subscriptionId);
    if (subIndex < 0) {
      return { success: false, error: 'Subscription not found.' };
    }

    const sub = this.librarySubscriptions[subIndex];
    if (sub.status === 'CANCELLED') {
      return { success: false, error: 'Subscription is already cancelled.' };
    }

    const now = Date.now();
    const deadline = new Date(sub.cancellationDeadline).getTime();
    const isWithin24Hours = now <= deadline;

    if (!isWithin24Hours) {
      return {
        success: false,
        error: 'Cancellation window expired. Cancellations are only permitted within 24 hours of subscription activation.'
      };
    }

    // Resolve active pricing rule for refund policy
    let refundPolicy: LibrarySubscriptionRefundPolicy = 'FULL_24H';
    if (sub.pricingRuleId) {
      const r = this.librarySubscriptionPricingRules.find(rule => rule.id === sub.pricingRuleId);
      if (r?.refundPolicy) {
        refundPolicy = r.refundPolicy;
      }
    }

    let calculatedRefund = 0;
    if (sub.finalPaidAmount > 0) {
      if (refundPolicy === 'FULL_24H') {
        calculatedRefund = sub.finalPaidAmount;
      } else if (refundPolicy === 'FULL_MINUS_GATEWAY_FEE') {
        const gatewayFee = Math.max(25, Math.round(sub.finalPaidAmount * 0.02));
        calculatedRefund = Math.max(0, sub.finalPaidAmount - gatewayFee);
      } else if (refundPolicy === 'PARTIAL_50') {
        calculatedRefund = Math.round(sub.finalPaidAmount * 0.5);
      } else if (refundPolicy === 'NO_REFUND') {
        calculatedRefund = 0;
      }
    }

    const nowIso = new Date().toISOString();
    const cancelReq: LibrarySubscriptionCancellationRequest = {
      id: `lscan-${Date.now()}`,
      subscriptionId: sub.id,
      libraryId: sub.libraryId,
      libraryName: sub.libraryName,
      ownerName: sub.ownerName,
      planName: sub.planName,
      paidAmount: sub.finalPaidAmount,
      activationTimestamp: sub.activatedAt,
      requestTimestamp: nowIso,
      isWithin24Hours: true,
      reason,
      reasonCategory,
      refundPolicy,
      calculatedRefundAmount: calculatedRefund,
      status: 'APPROVED',
      processedAt: nowIso,
      processedBy: 'System Auto-Approval (24h Policy)',
      refundTxnId: calculatedRefund > 0 ? `REF-TXN-${Date.now()}` : undefined
    };

    this.librarySubscriptionCancellations.unshift(cancelReq);

    // Update subscription entity
    this.librarySubscriptions[subIndex] = {
      ...sub,
      status: 'CANCELLED',
      cancelledAt: nowIso,
      cancellationReason: reason,
      cancellationReasonCategory: reasonCategory,
      refundAmount: calculatedRefund,
      refundStatus: calculatedRefund > 0 ? 'PROCESSED' : 'NONE',
      refundReference: cancelReq.refundTxnId,
      updatedAt: nowIso
    };

    // Update library listing status
    const libIdx = this.libraries.findIndex(l => l.id === sub.libraryId);
    if (libIdx >= 0) {
      this.libraries[libIdx] = {
        ...this.libraries[libIdx],
        subscriptionStatus: 'CANCELLED'
      };
    }

    this.saveToStorage();
    return {
      success: true,
      cancellationRequest: cancelReq,
      refundAmount: calculatedRefund
    };
  }

  public renewLibrarySubscription(
    subscriptionId: string,
    newPlanId?: string,
    paymentDetails?: Partial<LibrarySubscriptionPaymentRecord>
  ): LibrarySubscription {
    const subIdx = this.librarySubscriptions.findIndex(s => s.id === subscriptionId);
    if (subIdx < 0) {
      throw new Error('Subscription not found.');
    }

    const currentSub = this.librarySubscriptions[subIdx];
    const targetPlan = this.librarySubscriptionPlans.find(p => p.id === (newPlanId || currentSub.planId)) 
      || this.librarySubscriptionPlans[0];

    // Determine renewal price: Check price protection
    let renewPrice = targetPlan.basePrice;
    if (currentSub.priceProtection === 'LOCKED' && currentSub.lockedPrice) {
      renewPrice = currentSub.lockedPrice;
    } else {
      const calc = this.resolveLibrarySubscriptionPrice({
        state: currentSub.state,
        district: currentSub.district,
        libraryId: currentSub.libraryId,
        libraryName: currentSub.libraryName,
        planId: targetPlan.id
      });
      renewPrice = calc.finalPayableAmount;
    }

    const nowIso = new Date().toISOString();
    const durationDays = targetPlan.durationDays || 30;
    
    // If currently active and unexpired, extend from current expiry date; else extend from today
    const baseDate = (currentSub.expiryDate && currentSub.expiryDate > nowIso.substring(0, 10)) 
      ? new Date(currentSub.expiryDate)
      : new Date();

    const newExpiry = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    const renewedSub: LibrarySubscription = {
      ...currentSub,
      planId: targetPlan.id,
      planName: targetPlan.name,
      billingCycle: targetPlan.billingCycle,
      basePrice: renewPrice,
      finalPaidAmount: renewPrice,
      isFree: renewPrice === 0,
      status: 'ACTIVE',
      expiryDate: newExpiry,
      renewalDate: newExpiry,
      activatedAt: nowIso,
      cancellationDeadline: new Date(new Date(nowIso).getTime() + 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: nowIso
    };

    this.librarySubscriptions[subIdx] = renewedSub;

    // Record renewal payment in ledger
    if (renewPrice > 0 || paymentDetails) {
      this.recordLibrarySubscriptionPayment({
        id: `pay-ls-${Date.now()}`,
        subscriptionId: renewedSub.id,
        libraryId: renewedSub.libraryId,
        libraryName: renewedSub.libraryName,
        ownerName: renewedSub.ownerName,
        ownerEmail: renewedSub.ownerEmail,
        ownerMobile: renewedSub.ownerMobile,
        state: renewedSub.state,
        district: renewedSub.district,
        planId: renewedSub.planId,
        planName: renewedSub.planName,
        billingCycle: renewedSub.billingCycle,
        originalFee: renewPrice,
        offerDiscount: 0,
        couponDiscount: 0,
        finalAmount: renewPrice,
        currency: 'INR',
        paymentId: paymentDetails?.paymentId || `UPI-REN-${Date.now()}`,
        paymentMethod: paymentDetails?.paymentMethod || 'UPI_QR',
        paymentStatus: 'PAID',
        subscriptionStatus: 'ACTIVE',
        invoiceNumber: `INV-REN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: nowIso,
        confirmedAt: nowIso
      });
    }

    this.saveToStorage();
    return renewedSub;
  }

  public toggleSubscriptionAutoRenew(subscriptionId: string, enabled: boolean): boolean {
    const sub = this.librarySubscriptions.find(s => s.id === subscriptionId);
    if (!sub) return false;
    sub.autoRenew = enabled;
    sub.updatedAt = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  public recordLibrarySubscriptionPayment(
    paymentData: LibrarySubscriptionPaymentRecord
  ): LibrarySubscriptionPaymentRecord {
    // Idempotency check: prevent duplicate payments on double-click or network retry
    if (paymentData.idempotencyKey) {
      const existing = this.librarySubscriptionPayments.find(p => p.idempotencyKey === paymentData.idempotencyKey);
      if (existing) return existing;
    }
    if (paymentData.paymentId) {
      const existing = this.librarySubscriptionPayments.find(
        p => p.paymentId === paymentData.paymentId && p.paymentStatus === 'PAID'
      );
      if (existing) return existing;
    }

    const nowIso = new Date().toISOString();
    const record: LibrarySubscriptionPaymentRecord = {
      ...paymentData,
      id: paymentData.id || `pay-ls-${Date.now()}`,
      currency: paymentData.currency || 'INR',
      paymentStatus: paymentData.paymentStatus || 'PAID',
      subscriptionStatus: paymentData.subscriptionStatus || 'ACTIVE',
      invoiceNumber: paymentData.invoiceNumber || `INV-LS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: paymentData.createdAt || nowIso,
      confirmedAt: paymentData.paymentStatus === 'PAID' ? (paymentData.confirmedAt || nowIso) : undefined
    };

    this.librarySubscriptionPayments.unshift(record);

    // If payment confirmed and linked subscription exists, activate it
    if (record.subscriptionId && record.paymentStatus === 'PAID') {
      const subIdx = this.librarySubscriptions.findIndex(s => s.id === record.subscriptionId);
      if (subIdx >= 0) {
        this.librarySubscriptions[subIdx] = {
          ...this.librarySubscriptions[subIdx],
          status: 'ACTIVE',
          paymentId: record.paymentId,
          paymentMethod: record.paymentMethod as any,
          finalPaidAmount: record.finalAmount,
          updatedAt: nowIso
        };
      }
    }

    this.saveToStorage();
    return record;
  }

  public getLibrarySubscriptionPayments(district?: string): LibrarySubscriptionPaymentRecord[] {
    if (!district) return [...this.librarySubscriptionPayments];
    const dLower = district.trim().toLowerCase();
    return this.librarySubscriptionPayments.filter(p => 
      p.district && p.district.trim().toLowerCase() === dLower
    );
  }

  public getLibrarySubscriptionCancellationRequests(): LibrarySubscriptionCancellationRequest[] {
    return [...this.librarySubscriptionCancellations];
  }

  public getLibrarySubscriptionAnalytics(district?: string): LibrarySubscriptionAnalytics {
    const subs = this.getLibrarySubscriptions(district ? { district } : undefined);
    const payments = this.getLibrarySubscriptionPayments(district);
    const today = new Date().toISOString().substring(0, 10);

    let activeCount = 0;
    let freeCount = 0;
    let paidCount = 0;
    let expiringSoonCount = 0;
    let graceCount = 0;
    let cancelledCount = 0;
    let totalGmv = 0;
    let totalNet = 0;
    let totalRefunded = 0;
    const planDist: { [planName: string]: number } = {};

    subs.forEach(s => {
      planDist[s.planName] = (planDist[s.planName] || 0) + 1;

      if (s.status === 'ACTIVE') {
        activeCount++;
      } else if (s.status === 'GRACE_PERIOD') {
        graceCount++;
      } else if (s.status === 'CANCELLED') {
        cancelledCount++;
      }

      if (s.isFree) {
        freeCount++;
      } else {
        paidCount++;
      }

      // Expiring in next 7 days
      if (s.expiryDate && s.status === 'ACTIVE') {
        const diffDays = Math.ceil((new Date(s.expiryDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          expiringSoonCount++;
        }
      }
    });

    payments.forEach(p => {
      totalGmv += p.originalFee || 0;
      if (p.paymentStatus === 'PAID') {
        totalNet += p.finalAmount || 0;
      }
      if (p.refundAmount) {
        totalRefunded += p.refundAmount;
      }
    });

    return {
      totalSubscriptions: subs.length,
      activeSubscriptions: activeCount,
      freeListings: freeCount,
      paidListings: paidCount,
      expiringSoon: expiringSoonCount,
      gracePeriodCount: graceCount,
      cancelledCount: cancelledCount,
      totalGmv,
      totalNetRevenue: Math.max(0, totalNet - totalRefunded),
      totalRefunded,
      planDistribution: planDist
    };
  }

  // ==========================================
  // --- FOCUSPOINT FINANCE OS ENGINE ---
  // ==========================================

  // --- District Operational Expenditure Claims ---
  public getDistrictExpenseClaims(district: string = 'ALL', status: string = 'ALL', category: string = 'ALL'): DistrictExpenseClaim[] {
    return this.districtExpenseClaims.filter(c => {
      if (district && district.toLowerCase() !== 'all' && c.district.toLowerCase() !== district.toLowerCase()) return false;
      if (status && status.toLowerCase() !== 'all' && c.status.toLowerCase() !== status.toLowerCase()) return false;
      if (category && category.toLowerCase() !== 'all' && c.category.toLowerCase() !== category.toLowerCase()) return false;
      return true;
    });
  }

  public getDistrictExpenseClaimById(id: string): DistrictExpenseClaim | undefined {
    return this.districtExpenseClaims.find(c => c.id === id);
  }

  public submitDistrictExpenseClaim(claimData: {
    district: string;
    state?: string;
    category: ExpenseCategory;
    subCategory?: string;
    description: string;
    purpose: string;
    claimedAmount: number;
    expenseDate: string;
    vendorName: string;
    paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'NEFT_RTGS' | 'CASH';
    referenceNumber?: string;
    billNumber: string;
    billDate: string;
    notes?: string;
    supportingDocuments?: { id: string; name: string; url: string; fileType: string; sizeBytes: number; uploadedAt: string }[];
    bankDetails?: {
      accountHolderName: string;
      bankName: string;
      accountNumberMasked: string;
      ifscCode: string;
      upiId?: string;
      verified: boolean;
    };
    submittedByAdminId: string;
    submittedByAdminName: string;
  }): DistrictExpenseClaim {
    const newId = `DEXP-${claimData.district.slice(0, 3).toUpperCase()}-2026-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const claim: DistrictExpenseClaim = {
      id: newId,
      district: claimData.district,
      state: claimData.state || 'Uttar Pradesh',
      category: claimData.category,
      subCategory: claimData.subCategory,
      description: claimData.description,
      purpose: claimData.purpose,
      claimedAmount: Number(claimData.claimedAmount),
      approvedAmount: undefined,
      payableAmount: Number(claimData.claimedAmount),
      alreadyPaidAmount: 0,
      remainingAmount: Number(claimData.claimedAmount),
      expenseDate: claimData.expenseDate,
      vendorName: claimData.vendorName,
      paymentMethod: claimData.paymentMethod,
      referenceNumber: claimData.referenceNumber,
      billNumber: claimData.billNumber,
      billDate: claimData.billDate,
      notes: claimData.notes,
      supportingDocuments: claimData.supportingDocuments || [
        {
          id: `doc-${Date.now()}`,
          name: `${claimData.billNumber || 'Bill_Receipt'}.pdf`,
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
          fileType: 'application/pdf',
          sizeBytes: 185000,
          uploadedAt: now
        }
      ],
      bankDetails: claimData.bankDetails || {
        accountHolderName: claimData.vendorName,
        bankName: 'State Bank of India',
        accountNumberMasked: 'XXXX XXXX 4821',
        ifscCode: 'SBIN0001201',
        verified: true
      },
      status: 'SUBMITTED',
      submittedByAdminId: claimData.submittedByAdminId,
      submittedByAdminName: claimData.submittedByAdminName,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: now,
          status: 'SUBMITTED',
          actorName: claimData.submittedByAdminName,
          actorRole: 'DISTRICT_ADMIN',
          note: `Expenditure claim submitted for ₹${claimData.claimedAmount}`
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    this.districtExpenseClaims.unshift(claim);

    // Super Admin notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'usr-super-admin',
      title: 'New District Expenditure Submitted',
      message: `${claimData.submittedByAdminName} submitted an expenditure claim of ₹${claimData.claimedAmount} under ${claimData.category} for ${claimData.district}.`,
      category: 'PAYMENT',
      isRead: false,
      createdAt: now
    });

    this.logFinancialAudit({
      id: `faud-${Date.now()}`,
      timestamp: now,
      userId: claimData.submittedByAdminId,
      userName: claimData.submittedByAdminName,
      role: 'DISTRICT_ADMIN',
      action: 'SUBMIT_EXPENDITURE_CLAIM',
      entityType: 'DISTRICT_EXPENSE',
      entityId: newId,
      newValue: { claimedAmount: claim.claimedAmount, vendor: claim.vendorName },
      details: `Submitted expenditure claim ₹${claim.claimedAmount} (${claim.category}) for ${claim.district}`,
      district: claim.district
    });

    this.saveToStorage();
    return claim;
  }

  public reviewDistrictExpenseClaim(params: {
    claimId: string;
    status: ExpenseClaimStatus;
    adminId: string;
    adminName: string;
    remarks?: string;
    approvedAmount?: number;
    rejectionReason?: string;
  }): DistrictExpenseClaim {
    const claim = this.districtExpenseClaims.find(c => c.id === params.claimId);
    if (!claim) {
      throw new Error(`Expense claim ${params.claimId} not found`);
    }

    const now = new Date().toISOString();
    const prevStatus = claim.status;
    const prevApproved = claim.approvedAmount;

    claim.status = params.status;
    claim.internalRemarks = params.remarks || claim.internalRemarks;
    claim.updatedAt = now;

    if (params.status === 'APPROVED' || params.status === 'PARTIALLY_APPROVED') {
      const finalApproved = params.approvedAmount !== undefined ? Number(params.approvedAmount) : claim.claimedAmount;
      claim.approvedAmount = finalApproved;
      claim.payableAmount = finalApproved;
      claim.remainingAmount = Math.max(0, finalApproved - claim.alreadyPaidAmount);
      claim.approvedBySuperAdminId = params.adminId;
      claim.approvedBySuperAdminName = params.adminName;
      claim.approvedAt = now;
      claim.status = 'PAYMENT_QUEUED';

      // Automatically enqueue into Central Payment Queue
      const queueItemId = `PQ-EXP-${claim.id.slice(-6)}`;
      const existingQueueIndex = this.paymentQueueItems.findIndex(q => q.sourceReferenceId === claim.id);
      
      const queueItem: PaymentQueueItem = {
        id: queueItemId,
        payeeId: claim.submittedByAdminId,
        payeeName: `${claim.submittedByAdminName} (${claim.vendorName})`,
        payeeType: 'DISTRICT_ADMIN',
        paymentType: 'EXPENDITURE',
        district: claim.district,
        state: claim.state,
        amount: claim.payableAmount,
        claimedOrGrossAmount: claim.claimedAmount,
        sourceReferenceId: claim.id,
        referenceCode: claim.billNumber,
        description: `${claim.category}: ${claim.description}`,
        paymentMethod: claim.paymentMethod === 'CASH' ? 'BANK_TRANSFER' : (claim.paymentMethod as any),
        bankAccountMasked: claim.bankDetails?.accountNumberMasked || 'XXXX XXXX 4587',
        ifscCode: claim.bankDetails?.ifscCode || 'SBIN0001244',
        bankVerified: claim.bankDetails?.verified ?? true,
        status: 'QUEUED',
        idempotencyKey: `IDEMP-EXP-${claim.id}-${claim.payableAmount}`,
        createdAt: now
      };

      if (existingQueueIndex >= 0) {
        this.paymentQueueItems[existingQueueIndex] = queueItem;
      } else {
        this.paymentQueueItems.unshift(queueItem);
      }
      claim.paymentQueueId = queueItemId;

      // Add timeline event
      claim.timeline.push({
        id: `tl-${Date.now()}`,
        timestamp: now,
        status: params.status,
        actorName: params.adminName,
        actorRole: 'SUPER_ADMIN',
        note: params.status === 'PARTIALLY_APPROVED'
          ? `Partially approved ₹${finalApproved} of claimed ₹${claim.claimedAmount}. Reason/Note: ${params.remarks || 'Adjusted according to verified standard rate'}`
          : `Approved ₹${finalApproved}. Enqueued for payment. Remarks: ${params.remarks || 'Verified and approved in full'}`
      });

      // Notification to District Admin
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: claim.submittedByAdminId,
        title: params.status === 'PARTIALLY_APPROVED' ? 'Expenditure Partially Approved' : 'Expenditure Approved',
        message: `Your expenditure claim for ${claim.vendorName} has been approved for ₹${finalApproved}. Payment is queued.`,
        category: 'PAYMENT',
        isRead: false,
        createdAt: now
      });
    } else if (params.status === 'REJECTED') {
      claim.rejectionReason = params.rejectionReason || params.remarks || 'Claim does not satisfy expense guidelines';
      claim.timeline.push({
        id: `tl-${Date.now()}`,
        timestamp: now,
        status: 'REJECTED',
        actorName: params.adminName,
        actorRole: 'SUPER_ADMIN',
        note: `Rejected: ${claim.rejectionReason}`
      });

      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: claim.submittedByAdminId,
        title: 'Expenditure Claim Rejected',
        message: `Your expenditure claim for ${claim.vendorName} (₹${claim.claimedAmount}) was rejected: ${claim.rejectionReason}`,
        category: 'PAYMENT',
        isRead: false,
        createdAt: now
      });
    } else if (params.status === 'DOCUMENT_REQUIRED') {
      claim.correctionRequestedNotes = params.remarks || 'Additional clear invoice/supporting documents requested';
      claim.timeline.push({
        id: `tl-${Date.now()}`,
        timestamp: now,
        status: 'DOCUMENT_REQUIRED',
        actorName: params.adminName,
        actorRole: 'SUPER_ADMIN',
        note: `Clarification needed: ${claim.correctionRequestedNotes}`
      });

      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: claim.submittedByAdminId,
        title: 'Documents Required for Expenditure',
        message: `Additional invoice verification is required for ${claim.billNumber}: ${claim.correctionRequestedNotes}`,
        category: 'PAYMENT',
        isRead: false,
        createdAt: now
      });
    }

    this.logFinancialAudit({
      id: `faud-${Date.now()}`,
      timestamp: now,
      userId: params.adminId,
      userName: params.adminName,
      role: 'SUPER_ADMIN',
      action: `REVIEW_EXPENDITURE_${params.status}`,
      entityType: 'DISTRICT_EXPENSE',
      entityId: claim.id,
      previousValue: { status: prevStatus, approvedAmount: prevApproved },
      newValue: { status: claim.status, approvedAmount: claim.approvedAmount },
      details: `Super Admin transitioned claim ${claim.id} to ${claim.status} (Approved: ₹${claim.approvedAmount || 0})`,
      district: claim.district
    });

    this.saveToStorage();
    return claim;
  }

  // --- Teacher Payroll Engine ---
  public getTeacherPayrollItems(month: string = 'ALL', district: string = 'ALL', status: string = 'ALL', teacherId?: string): TeacherPayrollItem[] {
    return this.teacherPayrollItems.filter(p => {
      if (teacherId && p.teacherId !== teacherId) return false;
      if (district && district.toLowerCase() !== 'all' && p.district.toLowerCase() !== district.toLowerCase()) return false;
      if (month && month.toLowerCase() !== 'all' && !p.billingMonth.toLowerCase().includes(month.toLowerCase())) return false;
      if (status && status.toLowerCase() !== 'all' && p.status.toLowerCase() !== status.toLowerCase()) return false;
      return true;
    });
  }

  public getTeacherPayrollById(id: string): TeacherPayrollItem | undefined {
    return this.teacherPayrollItems.find(p => p.id === id);
  }

  private formatFinancePeriodCode(period: string): string {
    const parts = period.trim().split(/\s+/);
    const year = parts.find(p => /^\d{4}$/.test(p)) || '2026';
    const monthName = parts.find(p => !/^\d{4}$/.test(p))?.toLowerCase() || 'september';
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthIdx = monthNames.findIndex(m => monthName.startsWith(m.slice(0, 3)));
    const mm = monthIdx >= 0 ? String(monthIdx + 1).padStart(2, '0') : '09';
    return `${year}-${mm}`;
  }

  public generateTeacherPayrollRun(billingMonth: string = 'September 2026', district: string = 'ALL'): TeacherPayrollItem[] {
    const targets = this.teachers.filter(t => {
      const tDist = t.district || t.districtName || '';
      if (district && district.toLowerCase() !== 'all' && tDist.toLowerCase() !== district.toLowerCase()) return false;
      return t.verificationStatus === 'APPROVED' || (t as any).isActive !== false;
    });

    const generated: TeacherPayrollItem[] = [];
    const now = new Date().toISOString();

    targets.forEach(t => {
      const existing = this.teacherPayrollItems.find(p => p.teacherId === t.id && p.billingMonth === billingMonth);
      if (existing) {
        generated.push(existing);
        return;
      }

      // Calculate earnings from completed sessions
      const teacherAssignments = (this.teacherAssignments || []).filter(a => a.teacherId === t.id && a.status === 'ACTIVE');
      const studentCount = Math.max(1, teacherAssignments.length || (t as any).assignedStudentsCount || 2);
      const sessionsCount = studentCount * 8;
      const grossTuition = studentCount * 4500;
      const commissionRate = 15;
      const commission = Math.round(grossTuition * (commissionRate / 100));
      const teacherEarnings = grossTuition - commission;
      const bonus = sessionsCount >= 20 ? 1000 : 0;
      const netPayable = teacherEarnings + bonus;

      const payrollItem: TeacherPayrollItem = {
        id: `PAYROLL-${this.formatFinancePeriodCode(billingMonth)}-${t.id.slice(-6)}`,
        teacherId: t.id,
        teacherName: t.name,
        teacherEmail: t.email,
        teacherPhone: t.phone,
        district: t.district || t.districtName || 'Ghazipur',
        state: 'Uttar Pradesh',
        billingMonth,
        assignedStudentsCount: studentCount,
        completedSessionsCount: sessionsCount,
        approvedSessionsCount: sessionsCount,
        grossTuitionCollection: grossTuition,
        teacherEarnings,
        focusPointCommission: commission,
        bonus,
        deductions: 0,
        adjustments: 0,
        netPayable,
        paidAmount: 0,
        bankDetails: {
          accountHolderName: t.bankAccount?.accountHolderName || t.name,
          bankName: t.bankAccount?.bankName || 'State Bank of India',
          accountNumberMasked: t.bankAccount?.accountNumber ? `XXXX XXXX ${t.bankAccount.accountNumber.slice(-4)}` : 'XXXX XXXX 3381',
          ifscCode: t.bankAccount?.ifscCode || 'SBIN0000412',
          verificationStatus: 'VERIFIED'
        },
        status: 'READY_FOR_PAYMENT',
        salarySlipNumber: `FP-SAL-${this.formatFinancePeriodCode(billingMonth)}-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: now,
        updatedAt: now
      };

      this.teacherPayrollItems.unshift(payrollItem);
      generated.push(payrollItem);
    });

    this.saveToStorage();
    return generated;
  }

  public queueTeacherPayroll(id: string): TeacherPayrollItem {
    const item = this.teacherPayrollItems.find(p => p.id === id);
    if (!item) throw new Error(`Teacher payroll item ${id} not found`);

    item.status = 'PAYMENT_QUEUED';
    item.updatedAt = new Date().toISOString();

    const queueId = `PQ-SAL-${item.id.slice(-6)}`;
    const existingIdx = this.paymentQueueItems.findIndex(q => q.sourceReferenceId === item.id);
    const qItem: PaymentQueueItem = {
      id: queueId,
      payeeId: item.teacherId,
      payeeName: `${item.teacherName} (Teacher)`,
      payeeType: 'TEACHER',
      paymentType: 'SALARY',
      district: item.district,
      state: item.state,
      amount: item.netPayable,
      claimedOrGrossAmount: item.grossTuitionCollection,
      sourceReferenceId: item.id,
      referenceCode: item.salarySlipNumber || `SAL-${item.id}`,
      description: `${item.billingMonth} Tuition Salary (${item.assignedStudentsCount} Students, ${item.completedSessionsCount} Sessions)`,
      paymentMethod: 'BANK_TRANSFER',
      bankAccountMasked: item.bankDetails?.accountNumberMasked || 'XXXX XXXX 3381',
      ifscCode: item.bankDetails?.ifscCode || 'SBIN0000412',
      bankVerified: true,
      status: 'QUEUED',
      idempotencyKey: `IDEMP-SAL-${item.id}-${item.netPayable}`,
      createdAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      this.paymentQueueItems[existingIdx] = qItem;
    } else {
      this.paymentQueueItems.unshift(qItem);
    }

    this.saveToStorage();
    return item;
  }

  // --- Library Seat Booking Settlement Engine ---
  public getLibrarySettlementRecords(period: string = 'ALL', district: string = 'ALL', status: string = 'ALL', libraryId?: string): LibrarySettlementRecord[] {
    return this.librarySettlementRecords.filter(s => {
      if (libraryId && s.libraryId !== libraryId) return false;
      if (district && district.toLowerCase() !== 'all' && s.district.toLowerCase() !== district.toLowerCase()) return false;
      if (period && period.toLowerCase() !== 'all' && !s.settlementPeriod.toLowerCase().includes(period.toLowerCase())) return false;
      if (status && status.toLowerCase() !== 'all' && s.status.toLowerCase() !== status.toLowerCase()) return false;
      return true;
    });
  }

  public getLibrarySettlementById(id: string): LibrarySettlementRecord | undefined {
    return this.librarySettlementRecords.find(s => s.id === id);
  }

  public generateLibrarySettlements(settlementPeriod: string = 'September 2026', district: string = 'ALL'): LibrarySettlementRecord[] {
    const targets = this.libraries.filter(l => {
      const lDist = l.district || l.districtName || '';
      if (district && district.toLowerCase() !== 'all' && lDist.toLowerCase() !== district.toLowerCase()) return false;
      return l.verificationStatus === 'APPROVED' || (l as any).isActive !== false;
    });

    const generated: LibrarySettlementRecord[] = [];
    const now = new Date().toISOString();

    targets.forEach(lib => {
      const existing = this.librarySettlementRecords.find(s => s.libraryId === lib.id && s.settlementPeriod === settlementPeriod);
      if (existing) {
        generated.push(existing);
        return;
      }

      // Calculate from confirmed bookings
      const libBookings = this.bookings.filter(b => b.libraryId === lib.id && (b.status === 'confirmed' || b.paymentStatus === 'paid'));
      const lineItems = libBookings.slice(0, 5).map((b, idx) => {
        const gross = Number(b.totalAmount || b.amount || 1000);
        const discount = 0;
        const commRate = 10;
        const commAmount = Math.round(gross * (commRate / 100));
        return {
          bookingId: b.id || `BK-${Date.now()}-${idx}`,
          studentName: b.studentName || 'Focus Student',
          studentPhoneMasked: 'XXXXXX' + String(Math.floor(1000 + Math.random() * 9000)),
          seatNumber: b.seatNumber || `S-0${idx + 1}`,
          shiftName: b.shiftName || 'Full Day Shift',
          bookingDate: b.bookingDate || '2026-09-05',
          grossAmount: gross,
          discount,
          taxCharges: 0,
          commissionRate: commRate,
          commissionAmount: commAmount,
          refundAdjustment: 0,
          netPayable: gross - commAmount - discount
        };
      });

      const totalGross = lineItems.reduce((acc, i) => acc + i.grossAmount, 0) || 2800;
      const totalDiscounts = lineItems.reduce((acc, i) => acc + i.discount, 0);
      const totalCommission = lineItems.reduce((acc, i) => acc + i.commissionAmount, 0) || 280;
      const totalNet = totalGross - totalCommission - totalDiscounts;

      const record: LibrarySettlementRecord = {
        id: `SETT-LIB-${settlementPeriod.replace(/\s+/g, '').slice(0, 7)}-${lib.id.slice(-6)}`,
        libraryId: lib.id,
        libraryName: lib.name,
        ownerId: lib.ownerId || 'usr-owner',
        ownerName: lib.ownerName || 'Library Operator',
        district: lib.district || lib.districtName || 'Ghazipur',
        state: 'Uttar Pradesh',
        settlementPeriod,
        lineItems,
        totalBookingsCount: Math.max(1, lineItems.length),
        grossBookingAmount: totalGross,
        totalDiscounts,
        platformCommission: totalCommission,
        adjustments: 0,
        netPayable: totalNet,
        paidAmount: 0,
        bankDetails: {
          accountHolderName: lib.ownerName || lib.name,
          bankName: 'HDFC Bank',
          accountNumberMasked: 'XXXX XXXX 6112',
          ifscCode: 'HDFC0004910',
          verificationStatus: 'VERIFIED'
        },
        status: 'READY_FOR_SETTLEMENT',
        receiptNumber: `FP-LIB-${this.formatFinancePeriodCode(settlementPeriod)}-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: now,
        updatedAt: now
      };

      this.librarySettlementRecords.unshift(record);
      generated.push(record);
    });

    this.saveToStorage();
    return generated;
  }

  public queueLibrarySettlement(id: string): LibrarySettlementRecord {
    const item = this.librarySettlementRecords.find(s => s.id === id);
    if (!item) throw new Error(`Library settlement item ${id} not found`);

    item.status = 'QUEUED';
    item.updatedAt = new Date().toISOString();

    const queueId = `PQ-SETT-${item.id.slice(-6)}`;
    const existingIdx = this.paymentQueueItems.findIndex(q => q.sourceReferenceId === item.id);
    const qItem: PaymentQueueItem = {
      id: queueId,
      payeeId: item.ownerId,
      payeeName: `${item.ownerName} (${item.libraryName})`,
      payeeType: 'LIBRARY_OWNER',
      paymentType: 'SETTLEMENT',
      district: item.district,
      state: item.state,
      amount: item.netPayable,
      claimedOrGrossAmount: item.grossBookingAmount,
      sourceReferenceId: item.id,
      referenceCode: item.receiptNumber || `SETT-${item.id}`,
      description: `${item.settlementPeriod} Seat Booking Settlement (${item.totalBookingsCount} Bookings)`,
      paymentMethod: 'BANK_TRANSFER',
      bankAccountMasked: item.bankDetails?.accountNumberMasked || 'XXXX XXXX 6112',
      ifscCode: item.bankDetails?.ifscCode || 'HDFC0004910',
      bankVerified: true,
      status: 'QUEUED',
      idempotencyKey: `IDEMP-SETT-${item.id}-${item.netPayable}`,
      createdAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      this.paymentQueueItems[existingIdx] = qItem;
    } else {
      this.paymentQueueItems.unshift(qItem);
    }

    this.saveToStorage();
    return item;
  }

  // --- Super Admin Payment Queue & Settlement Batches ---
  public getPaymentQueue(filters?: { payeeType?: string; state?: string; district?: string; status?: string; paymentType?: string }): PaymentQueueItem[] {
    return this.paymentQueueItems.filter(item => {
      if (filters?.payeeType && filters.payeeType !== 'ALL' && item.payeeType !== filters.payeeType) return false;
      if (filters?.state && filters.state !== 'ALL' && item.state && item.state.toLowerCase() !== filters.state.toLowerCase()) return false;
      if (filters?.district && filters.district !== 'ALL' && item.district.toLowerCase() !== filters.district.toLowerCase()) return false;
      if (filters?.status && filters.status !== 'ALL' && item.status !== filters.status) return false;
      if (filters?.paymentType && filters.paymentType !== 'ALL' && item.paymentType !== filters.paymentType) return false;
      return true;
    });
  }

  public processPaymentQueueItem(
    itemId: string,
    paymentMethod: string = 'NEFT_RTGS',
    simulateFailure: boolean = false,
    transactionRef?: string
  ): { success: boolean; item: PaymentQueueItem; officialDocument?: OfficialDocument; error?: string } {
    const item = this.paymentQueueItems.find(q => q.id === itemId);
    if (!item) {
      return { success: false, item: null as any, error: `Payment queue item ${itemId} not found` };
    }

    // IDEMPOTENCY GUARD: Prevent duplicate payments!
    if (item.status === 'PAID') {
      return {
        success: false,
        item,
        error: `Idempotency Guard: Payment item ${itemId} is ALREADY PAID. Duplicate processing prohibited.`
      };
    }

    const now = new Date().toISOString();

    if (simulateFailure) {
      item.status = 'FAILED';
      item.failureReason = 'Beneficiary bank network unreachable (NPCI Gateway Timeout)';

      // Propagate failure back to source entity
      if (item.paymentType === 'EXPENDITURE') {
        const claim = this.districtExpenseClaims.find(c => c.id === item.sourceReferenceId);
        if (claim) {
          claim.status = 'PAYMENT_FAILED';
          claim.paymentFailureReason = item.failureReason;
          claim.timeline.push({
            id: `tl-${Date.now()}`,
            timestamp: now,
            status: 'PAYMENT_FAILED',
            actorName: 'Payout Gateway',
            actorRole: 'SYSTEM',
            note: item.failureReason
          });
        }
      } else if (item.paymentType === 'SALARY') {
        const payroll = this.teacherPayrollItems.find(p => p.id === item.sourceReferenceId);
        if (payroll) {
          payroll.status = 'FAILED';
          payroll.failureReason = item.failureReason;
        }
      } else if (item.paymentType === 'SETTLEMENT') {
        const settlement = this.librarySettlementRecords.find(s => s.id === item.sourceReferenceId);
        if (settlement) {
          settlement.status = 'FAILED';
          settlement.failureReason = item.failureReason;
        }
      }

      this.logFinancialAudit({
        id: `faud-${Date.now()}`,
        timestamp: now,
        userId: 'system',
        userName: 'Payout Gateway',
        role: 'SYSTEM',
        action: 'PAYMENT_FAILED',
        entityType: 'PAYMENT_QUEUE',
        entityId: item.id,
        details: `Payment failure for ${item.payeeName} (₹${item.amount}): ${item.failureReason}`,
        district: item.district
      });

      this.saveToStorage();
      return { success: false, item, error: item.failureReason };
    }

    // SUCCESSFUL PAYMENT EXECUTION
    const txnId = transactionRef && transactionRef.trim().length > 0
      ? transactionRef.trim()
      : `TXN-${paymentMethod.slice(0, 3)}-${Date.now().toString().slice(-8)}`;
    const payId = `PAY-${item.paymentType.slice(0, 3)}-${Date.now().toString().slice(-6)}`;

    item.status = 'PAID';
    item.transactionId = txnId;
    item.paidAt = now;

    let officialDoc: OfficialDocument | undefined;

    if (item.paymentType === 'EXPENDITURE') {
      const claim = this.districtExpenseClaims.find(c => c.id === item.sourceReferenceId);
      if (claim) {
        claim.alreadyPaidAmount += item.amount;
        claim.remainingAmount = Math.max(0, (claim.approvedAmount || claim.claimedAmount) - claim.alreadyPaidAmount);
        claim.status = 'PAID';
        claim.paidAt = now;
        claim.paymentId = payId;
        claim.transactionId = txnId;
        claim.receiptNumber = claim.receiptNumber || `FP-EXP-2026-09-${String(Math.floor(100000 + Math.random() * 900000))}`;
        item.officialDocumentNumber = claim.receiptNumber;

        claim.timeline.push({
          id: `tl-${Date.now()}`,
          timestamp: now,
          status: 'PAID',
          actorName: 'Payout Gateway',
          actorRole: 'SYSTEM',
          note: `Payment of ₹${item.amount} confirmed by provider. Ref: ${txnId}. Official Receipt: ${claim.receiptNumber}`
        });

        // Generate Official Document
        officialDoc = {
          documentId: claim.receiptNumber,
          documentType: 'EXPENSE_RECEIPT',
          title: "ZYZU'S Official District Expense Payment Receipt",
          recipientName: `${claim.vendorName} (C/O ${claim.submittedByAdminName})`,
          recipientId: claim.submittedByAdminId,
          recipientRole: 'District Coordinator',
          district: claim.district,
          state: claim.state,
          date: now.split('T')[0],
          billingPeriod: 'September 2026',
          amount: item.amount,
          status: 'PAID',
          paymentId: payId,
          transactionRef: txnId,
          paymentMethod,
          bankAccountMasked: claim.bankDetails?.accountNumberMasked,
          authorizedBy: 'Prof. Alok Tripathi (Super Admin)',
          qrVerificationUrl: `https://zyzus.com/verify/doc/${claim.receiptNumber}`,
          breakdown: [
            { label: 'Claimed Amount', amount: claim.claimedAmount },
            { label: 'Approved Amount', amount: claim.approvedAmount || claim.claimedAmount },
            { label: 'Paid in this Transaction', amount: item.amount, isHighlight: true },
            { label: 'Remaining Payable Balance', amount: claim.remainingAmount }
          ],
          metadata: {
            category: claim.category,
            billNumber: claim.billNumber,
            vendorName: claim.vendorName,
            purpose: claim.purpose
          },
          issuedAt: now
        };
        this.officialDocuments.unshift(officialDoc);

        // Notify District Admin
        this.notifications.unshift({
          id: `notif-${Date.now()}`,
          userId: claim.submittedByAdminId,
          title: 'Expenditure Paid Successfully',
          message: `Your approved expenditure of ₹${item.amount} for ${claim.vendorName} has been paid. Official receipt ${claim.receiptNumber} is now available.`,
          category: 'PAYMENT',
          isRead: false,
          createdAt: now
        });
      }
    } else if (item.paymentType === 'SALARY') {
      const payroll = this.teacherPayrollItems.find(p => p.id === item.sourceReferenceId);
      if (payroll) {
        payroll.paidAmount = item.amount;
        payroll.status = 'PAID';
        payroll.paidAt = now;
        payroll.paymentId = payId;
        payroll.transactionRef = txnId;
        payroll.salarySlipNumber = payroll.salarySlipNumber || `FP-SAL-2026-09-${String(Math.floor(100000 + Math.random() * 900000))}`;
        item.officialDocumentNumber = payroll.salarySlipNumber;

        officialDoc = {
          documentId: payroll.salarySlipNumber,
          documentType: 'SALARY_SLIP',
          title: "ZYZU'S Official Teacher Salary Slip",
          recipientName: payroll.teacherName,
          recipientId: payroll.teacherId,
          recipientRole: 'Verified Senior Educator',
          district: payroll.district,
          state: payroll.state,
          date: now.split('T')[0],
          billingPeriod: payroll.billingMonth,
          amount: item.amount,
          status: 'PAID',
          paymentId: payId,
          transactionRef: txnId,
          paymentMethod,
          bankAccountMasked: payroll.bankDetails?.accountNumberMasked,
          authorizedBy: 'Prof. Alok Tripathi (Super Admin)',
          qrVerificationUrl: `https://zyzus.com/verify/doc/${payroll.salarySlipNumber}`,
          breakdown: [
            { label: 'Gross Tuition Collection', amount: payroll.grossTuitionCollection },
            { label: 'Educator Share Earnings', amount: payroll.teacherEarnings },
            { label: 'Performance Bonus', amount: payroll.bonus },
            { label: 'Platform Commission (15%)', amount: payroll.focusPointCommission, isDeduction: true },
            { label: 'Net Disbursed Salary', amount: item.amount, isHighlight: true }
          ],
          metadata: {
            assignedStudents: payroll.assignedStudentsCount,
            completedSessions: payroll.completedSessionsCount,
            billingMonth: payroll.billingMonth
          },
          issuedAt: now
        };
        this.officialDocuments.unshift(officialDoc);

        // Notify Teacher
        this.notifications.unshift({
          id: `notif-${Date.now()}`,
          userId: payroll.teacherId,
          title: 'Salary Disbursed Successfully',
          message: `Your salary of ₹${item.amount} for ${payroll.billingMonth} has been paid via ${paymentMethod}. Salary slip ${payroll.salarySlipNumber} is ready.`,
          category: 'PAYMENT',
          isRead: false,
          createdAt: now
        });
      }
    } else if (item.paymentType === 'SETTLEMENT') {
      const settlement = this.librarySettlementRecords.find(s => s.id === item.sourceReferenceId);
      if (settlement) {
        settlement.paidAmount = item.amount;
        settlement.status = 'PAID';
        settlement.paidAt = now;
        settlement.paymentId = payId;
        settlement.transactionRef = txnId;
        settlement.receiptNumber = settlement.receiptNumber || `FP-LIB-2026-09-${String(Math.floor(100000 + Math.random() * 900000))}`;
        item.officialDocumentNumber = settlement.receiptNumber;

        officialDoc = {
          documentId: settlement.receiptNumber,
          documentType: 'SETTLEMENT_RECEIPT',
          title: "ZYZU'S Official Library Owner Settlement Receipt",
          recipientName: `${settlement.ownerName} (${settlement.libraryName})`,
          recipientId: settlement.ownerId,
          recipientRole: 'Partner Study Library Operator',
          district: settlement.district,
          state: settlement.state,
          date: now.split('T')[0],
          billingPeriod: settlement.settlementPeriod,
          amount: item.amount,
          status: 'PAID',
          paymentId: payId,
          transactionRef: txnId,
          paymentMethod,
          bankAccountMasked: settlement.bankDetails?.accountNumberMasked,
          authorizedBy: 'Prof. Alok Tripathi (Super Admin)',
          qrVerificationUrl: `https://zyzus.com/verify/doc/${settlement.receiptNumber}`,
          breakdown: [
            { label: 'Gross Seat Bookings', amount: settlement.grossBookingAmount },
            { label: 'Student Promotional Discounts', amount: settlement.totalDiscounts, isDeduction: true },
            { label: 'Platform Commission (10%)', amount: settlement.platformCommission, isDeduction: true },
            { label: 'Net Settled Payout', amount: item.amount, isHighlight: true }
          ],
          metadata: {
            libraryName: settlement.libraryName,
            settlementPeriod: settlement.settlementPeriod,
            totalBookings: settlement.totalBookingsCount
          },
          issuedAt: now
        };
        this.officialDocuments.unshift(officialDoc);

        // Notify Library Owner
        this.notifications.unshift({
          id: `notif-${Date.now()}`,
          userId: settlement.ownerId,
          title: 'Library Settlement Processed',
          message: `Your seat booking settlement of ₹${item.amount} for ${settlement.settlementPeriod} has been paid. Official receipt ${settlement.receiptNumber} is now available.`,
          category: 'PAYMENT',
          isRead: false,
          createdAt: now
        });
      }
    }

    this.logFinancialAudit({
      id: `faud-${Date.now()}`,
      timestamp: now,
      userId: 'usr-superadmin-01',
      userName: 'Prof. Alok Tripathi',
      role: 'SUPER_ADMIN',
      action: `PROCESS_${item.paymentType}_PAYMENT`,
      entityType: 'PAYMENT_QUEUE',
      entityId: item.id,
      newValue: { amount: item.amount, transactionId: txnId, status: 'PAID' },
      details: `Disbursed ₹${item.amount} to ${item.payeeName} (${item.paymentType}) via ${paymentMethod}`,
      district: item.district
    });

    this.saveToStorage();
    return { success: true, item, officialDocument: officialDoc };
  }

  /**
   * Super Admin direct payment execution for a teacher payroll record
   */
  public payTeacherPayroll(
    payrollId: string,
    paymentMethod: string = 'NEFT_RTGS',
    transactionRef?: string
  ): { success: boolean; item?: PaymentQueueItem; officialDocument?: OfficialDocument; error?: string } {
    const item = this.teacherPayrollItems.find(p => p.id === payrollId);
    if (!item) return { success: false, error: `Payroll record ${payrollId} not found` };

    if (item.status === 'PAID') {
      return { success: false, error: `Payroll record ${payrollId} is already paid.` };
    }

    let qItem = this.paymentQueueItems.find(q => q.sourceReferenceId === payrollId);
    if (!qItem || item.status === 'READY_FOR_PAYMENT') {
      this.queueTeacherPayroll(payrollId);
      qItem = this.paymentQueueItems.find(q => q.sourceReferenceId === payrollId);
    }

    if (!qItem) {
      return { success: false, error: `Failed to queue payroll ${payrollId} for payment` };
    }

    return this.processPaymentQueueItem(qItem.id, paymentMethod, false, transactionRef);
  }

  /**
   * Super Admin direct payment execution for a library seat booking settlement record
   */
  public payLibrarySettlement(
    settlementId: string,
    paymentMethod: string = 'NEFT_RTGS',
    transactionRef?: string
  ): { success: boolean; item?: PaymentQueueItem; officialDocument?: OfficialDocument; error?: string } {
    const item = this.librarySettlementRecords.find(s => s.id === settlementId);
    if (!item) return { success: false, error: `Settlement record ${settlementId} not found` };

    if (item.status === 'PAID') {
      return { success: false, error: `Settlement record ${settlementId} is already paid.` };
    }

    let qItem = this.paymentQueueItems.find(q => q.sourceReferenceId === settlementId);
    if (!qItem || item.status === 'READY_FOR_SETTLEMENT') {
      this.queueLibrarySettlement(settlementId);
      qItem = this.paymentQueueItems.find(q => q.sourceReferenceId === settlementId);
    }

    if (!qItem) {
      return { success: false, error: `Failed to queue settlement ${settlementId} for payment` };
    }

    return this.processPaymentQueueItem(qItem.id, paymentMethod, false, transactionRef);
  }

  /**
   * Super Admin one-click approve and disburse district expenditure claim
   */
  public approveAndPayDistrictExpenseClaim(params: {
    claimId: string;
    adminId: string;
    adminName: string;
    remarks?: string;
    approvedAmount?: number;
    paymentMethod?: string;
    transactionRef?: string;
  }): { success: boolean; claim?: DistrictExpenseClaim; item?: PaymentQueueItem; officialDocument?: OfficialDocument; error?: string } {
    try {
      const claim = this.reviewDistrictExpenseClaim({
        claimId: params.claimId,
        status: 'APPROVED',
        adminId: params.adminId,
        adminName: params.adminName,
        remarks: params.remarks,
        approvedAmount: params.approvedAmount
      });

      const qItem = this.paymentQueueItems.find(q => q.sourceReferenceId === claim.id);
      if (!qItem) {
        return { success: false, claim, error: `Queue item for claim ${params.claimId} was not created.` };
      }

      const paymentRes = this.processPaymentQueueItem(
        qItem.id,
        params.paymentMethod || 'NEFT_RTGS',
        false,
        params.transactionRef
      );

      return {
        success: paymentRes.success,
        claim,
        item: paymentRes.item,
        officialDocument: paymentRes.officialDocument,
        error: paymentRes.error
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Error executing direct claim payment' };
    }
  }

  public processBulkPaymentBatch(
    itemIds: string[],
    initiatedBy: string = 'usr-superadmin-01',
    initiatedByName: string = 'Prof. Alok Tripathi (Super Admin)'
  ): SettlementBatch {
    const batchId = `FP-SET-2026-09-${String(Math.floor(100000 + Math.random() * 900000))}`;
    const now = new Date().toISOString();

    let successCount = 0;
    let failCount = 0;
    let totalAmt = 0;

    itemIds.forEach(id => {
      const qItem = this.paymentQueueItems.find(q => q.id === id);
      if (!qItem) return;

      qItem.batchId = batchId;
      totalAmt += qItem.amount;

      const res = this.processPaymentQueueItem(id, 'NEFT_RTGS', false);
      if (res.success) {
        successCount++;
      } else {
        failCount++;
      }
    });

    const batch: SettlementBatch = {
      id: batchId,
      batchDate: now,
      initiatedBy,
      initiatedByName,
      totalPayments: itemIds.length,
      totalAmount: totalAmt,
      successfulPayments: successCount,
      failedPayments: failCount,
      pendingPayments: 0,
      reversedPayments: 0,
      status: failCount === 0 ? 'COMPLETED' : (successCount > 0 ? 'PARTIALLY_FAILED' : 'FAILED'),
      itemIds,
      createdAt: now
    };

    this.settlementBatches.unshift(batch);

    this.logFinancialAudit({
      id: `faud-${Date.now()}`,
      timestamp: now,
      userId: initiatedBy,
      userName: initiatedByName,
      role: 'SUPER_ADMIN',
      action: 'PROCESS_SETTLEMENT_BATCH',
      entityType: 'SETTLEMENT_BATCH',
      entityId: batchId,
      newValue: { totalAmount: totalAmt, totalPayments: itemIds.length, successCount },
      details: `Executed bulk settlement batch ${batchId} with ${itemIds.length} payments totaling ₹${totalAmt}`
    });

    this.saveToStorage();
    return batch;
  }

  public getSettlementBatches(): SettlementBatch[] {
    return this.settlementBatches;
  }

  public getSettlementBatchById(batchId: string): { batch: SettlementBatch; items: PaymentQueueItem[] } | null {
    const batch = this.settlementBatches.find(b => b.id === batchId);
    if (!batch) return null;
    const items = this.paymentQueueItems.filter(q => batch.itemIds.includes(q.id));
    return { batch, items };
  }

  public retryFailedPayment(itemId: string): PaymentQueueItem {
    const item = this.paymentQueueItems.find(q => q.id === itemId);
    if (!item) throw new Error(`Queue item ${itemId} not found`);

    item.status = 'QUEUED';
    item.failureReason = undefined;

    // Reset source entity
    if (item.paymentType === 'EXPENDITURE') {
      const claim = this.districtExpenseClaims.find(c => c.id === item.sourceReferenceId);
      if (claim) {
        claim.status = 'PAYMENT_QUEUED';
        claim.paymentFailureReason = undefined;
      }
    } else if (item.paymentType === 'SALARY') {
      const payroll = this.teacherPayrollItems.find(p => p.id === item.sourceReferenceId);
      if (payroll) {
        payroll.status = 'PAYMENT_QUEUED';
        payroll.failureReason = undefined;
      }
    } else if (item.paymentType === 'SETTLEMENT') {
      const settlement = this.librarySettlementRecords.find(s => s.id === item.sourceReferenceId);
      if (settlement) {
        settlement.status = 'QUEUED';
        settlement.failureReason = undefined;
      }
    }

    this.saveToStorage();
    return item;
  }

  // --- Official Documents & Document Vault ---
  public getOfficialDocument(documentId: string): OfficialDocument | null {
    return this.officialDocuments.find(d => d.documentId === documentId) || null;
  }

  public getAllOfficialDocuments(role?: string, entityId?: string, district?: string): OfficialDocument[] {
    return this.officialDocuments.filter(doc => {
      if (district && district !== 'ALL' && doc.district.toLowerCase() !== district.toLowerCase()) return false;
      if (!role || role === 'SUPER_ADMIN') return true;
      if (role === 'DISTRICT_ADMIN') return doc.documentType === 'EXPENSE_RECEIPT' || doc.district.toLowerCase() === (district || '').toLowerCase();
      if (role === 'TEACHER') return doc.documentType === 'SALARY_SLIP' && doc.recipientId === entityId;
      if (role === 'LIBRARY_OWNER') return doc.documentType === 'SETTLEMENT_RECEIPT' && doc.recipientId === entityId;
      return false;
    });
  }

  // --- Monthly Closing System ---
  public getMonthlyClosingRecords(district: string = 'ALL'): MonthlyClosingRecord[] {
    return this.monthlyClosings.filter(c => {
      if (district && district !== 'ALL' && c.district.toLowerCase() !== district.toLowerCase()) return false;
      return true;
    });
  }

  public closeFinancialMonth(
    month: string = 'September',
    year: number = 2026,
    district: string = 'Ghazipur',
    closedBy: string = 'usr-superadmin-01',
    closedByName: string = 'Prof. Alok Tripathi (Super Admin)'
  ): MonthlyClosingRecord {
    const existing = this.monthlyClosings.find(c => c.month === month && c.year === year && c.district.toLowerCase() === district.toLowerCase());
    if (existing && existing.isClosed) {
      throw new Error(`Financial month ${month} ${year} for ${district} is already closed.`);
    }

    // Aggregate real figures
    const districtClaims = this.districtExpenseClaims.filter(c => c.district.toLowerCase() === district.toLowerCase() && c.status === 'PAID');
    const districtExpenseTotal = districtClaims.reduce((acc, c) => acc + c.alreadyPaidAmount, 0);

    const payrolls = this.teacherPayrollItems.filter(p => p.district.toLowerCase() === district.toLowerCase() && p.status === 'PAID');
    const tuitionTotal = payrolls.reduce((acc, p) => acc + p.grossTuitionCollection, 0);
    const teacherPayoutsTotal = payrolls.reduce((acc, p) => acc + p.paidAmount, 0);

    const settlements = this.librarySettlementRecords.filter(s => s.district.toLowerCase() === district.toLowerCase() && s.status === 'PAID');
    const libraryCollectionsTotal = settlements.reduce((acc, s) => acc + s.grossBookingAmount, 0);
    const librarySettlementsTotal = settlements.reduce((acc, s) => acc + s.paidAmount, 0);

    const comm = Math.round(tuitionTotal * 0.15 + libraryCollectionsTotal * 0.10);
    const netRevenue = comm - districtExpenseTotal;

    const closingRecord: MonthlyClosingRecord = {
      id: `FP-CLOSE-${year}-${month.toUpperCase().slice(0, 3)}-${district.toUpperCase().slice(0, 3)}`,
      month,
      year,
      state: 'Uttar Pradesh',
      district,
      totalTuitionCollections: tuitionTotal,
      teacherPayouts: teacherPayoutsTotal,
      libraryCollections: libraryCollectionsTotal,
      librarySettlements: librarySettlementsTotal,
      districtExpenditure: districtExpenseTotal,
      focusPointCommission: comm,
      refunds: 0,
      adjustments: 0,
      netPlatformRevenue: netRevenue,
      pendingLiabilities: this.paymentQueueItems.filter(q => q.status === 'QUEUED' && q.district.toLowerCase() === district.toLowerCase()).reduce((acc, q) => acc + q.amount, 0),
      failedPaymentsCount: this.paymentQueueItems.filter(q => q.status === 'FAILED' && q.district.toLowerCase() === district.toLowerCase()).length,
      outstandingPayablesCount: this.paymentQueueItems.filter(q => q.status === 'QUEUED' && q.district.toLowerCase() === district.toLowerCase()).length,
      isClosed: true,
      closedAt: new Date().toISOString(),
      closedBy,
      closedByName,
      snapshotHash: `SHA256-${Date.now().toString(36).toUpperCase()}`
    };

    this.monthlyClosings.unshift(closingRecord);

    this.logFinancialAudit({
      id: `faud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: closedBy,
      userName: closedByName,
      role: 'SUPER_ADMIN',
      action: 'CLOSE_MONTHLY_PERIOD',
      entityType: 'MONTHLY_CLOSING',
      entityId: closingRecord.id,
      newValue: closingRecord,
      details: `Super Admin officially closed financial period ${month} ${year} for district ${district}. Net Platform Revenue: ₹${netRevenue}.`,
      district
    });

    this.saveToStorage();
    return closingRecord;
  }

  // --- Real-time Financial KPIs & Analytics ---
  public getFinanceOverviewKpis(filter: string | { state?: string; district?: string; locality?: string } = 'ALL') {
    let state = 'ALL';
    let district = 'ALL';
    if (typeof filter === 'string') {
      district = filter;
    } else if (filter) {
      if (filter.state) state = filter.state;
      if (filter.district) district = filter.district;
    }

    const queue = this.getPaymentQueue({ state, district });
    const pendingQueue = queue.filter(q => q.status === 'QUEUED' || q.status === 'PROCESSING');
    const failedQueue = queue.filter(q => q.status === 'FAILED');

    const totalPayable = pendingQueue.reduce((acc, q) => acc + q.amount, 0);
    const teacherPayable = pendingQueue.filter(q => q.payeeType === 'TEACHER').reduce((acc, q) => acc + q.amount, 0);
    const libraryPayable = pendingQueue.filter(q => q.payeeType === 'LIBRARY_OWNER').reduce((acc, q) => acc + q.amount, 0);
    const districtExpensesPayable = pendingQueue.filter(q => q.payeeType === 'DISTRICT_ADMIN').reduce((acc, q) => acc + q.amount, 0);

    const matchesLoc = (itemState?: string, itemDist?: string) => {
      if (state !== 'ALL' && itemState && itemState.toLowerCase() !== state.toLowerCase()) return false;
      if (district !== 'ALL' && itemDist && itemDist.toLowerCase() !== district.toLowerCase()) return false;
      return true;
    };

    const paidClaims = this.districtExpenseClaims.filter(c => c.status === 'PAID' && matchesLoc(c.state, c.district));
    const paidPayrolls = this.teacherPayrollItems.filter(p => p.status === 'PAID' && matchesLoc(p.state, p.district));
    const paidSettlements = this.librarySettlementRecords.filter(s => s.status === 'PAID' && matchesLoc(s.state, s.district));

    const todayStr = new Date().toISOString().split('T')[0];
    const paidToday = queue.filter(q => q.status === 'PAID' && q.paidAt && q.paidAt.startsWith(todayStr)).reduce((acc, q) => acc + q.amount, 0);
    const pendingApprovalsCount = this.districtExpenseClaims.filter(c => (c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' || c.status === 'DOCUMENT_REQUIRED') && matchesLoc(c.state, c.district)).length;

    // Monthly GMV & Revenue calculations
    const filteredPayrolls = this.teacherPayrollItems.filter(p => matchesLoc(p.state, p.district));
    const filteredSettlements = this.librarySettlementRecords.filter(s => matchesLoc(s.state, s.district));

    const grossTuitionVolume = filteredPayrolls.reduce((acc, p) => acc + p.grossTuitionCollection, 0);
    const grossLibraryVolume = filteredSettlements.reduce((acc, s) => acc + s.grossBookingAmount, 0);
    const grossTotalVolume = grossTuitionVolume + grossLibraryVolume;
    const platformCommissionTotal = Math.round(grossTuitionVolume * 0.15 + grossLibraryVolume * 0.10);
    const totalDisbursed = paidClaims.reduce((acc, c) => acc + c.alreadyPaidAmount, 0) +
      paidPayrolls.reduce((acc, p) => acc + p.paidAmount, 0) +
      paidSettlements.reduce((acc, s) => acc + s.paidAmount, 0);

    const expensesTotal = paidClaims.reduce((acc, c) => acc + c.alreadyPaidAmount, 0);
    const refundsTotal = filteredSettlements.reduce((acc, s) => acc + (s.adjustments || 0), 0);
    const receivablesTotal = Math.round(grossTotalVolume * 0.08); // In-flight gateway clearance receivables

    return {
      grossTotalVolume,
      gmv: grossTotalVolume,
      revenue: platformCommissionTotal,
      netRevenue: platformCommissionTotal - expensesTotal,
      commission: platformCommissionTotal,
      platformCommissionTotal,
      teacherPayouts: teacherPayable + paidPayrolls.reduce((acc, p) => acc + p.paidAmount, 0),
      librarySettlements: libraryPayable + paidSettlements.reduce((acc, s) => acc + s.paidAmount, 0),
      districtPayments: districtExpensesPayable + paidClaims.reduce((acc, c) => acc + c.alreadyPaidAmount, 0),
      expenses: expensesTotal,
      refunds: refundsTotal,
      pendingPayments: totalPayable,
      profit: platformCommissionTotal - expensesTotal,
      receivables: receivablesTotal,
      payables: totalPayable,
      totalPayable,
      teacherPayable,
      libraryPayable,
      districtExpenses: districtExpensesPayable,
      failedPaymentsCount: failedQueue.length,
      processingCount: queue.filter(q => q.status === 'PROCESSING').length,
      paidToday,
      pendingApprovalCount: pendingApprovalsCount,
      totalDisbursed,
      netPlatformProfit: platformCommissionTotal - expensesTotal
    };
  }

  // --- Financial Settings & Category Management ---
  public getFinanceSettings(): FinanceSettingsConfig {
    return this.financeSettings;
  }

  public updateFinanceSettings(updates: Partial<FinanceSettingsConfig>): FinanceSettingsConfig {
    this.financeSettings = {
      ...this.financeSettings,
      ...updates
    };
    this.saveToStorage();
    return this.financeSettings;
  }

  public toggleExpenseCategory(categoryId: string, isActive: boolean): FinanceSettingsConfig {
    const cat = this.financeSettings.categories.find(c => c.id === categoryId);
    if (cat) {
      cat.isActive = isActive;
      this.saveToStorage();
    }
    return this.financeSettings;
  }

  public addExpenseCategory(name: ExpenseCategory, subCategories: string[]): FinanceSettingsConfig {
    const newCat = {
      id: `cat-${Date.now()}`,
      name,
      subCategories,
      isActive: true,
      monthlyBudgetAlert: 25000
    };
    this.financeSettings.categories.push(newCat);
    this.saveToStorage();
    return this.financeSettings;
  }

  // --- Financial Audit Trail ---
  public logFinancialAudit(log: FinancialAuditLog) {
    this.financialAuditLogs.unshift(log);
    if (this.financialAuditLogs.length > 200) {
      this.financialAuditLogs.pop();
    }
    this.saveToStorage();
  }

  public getFinancialAuditLogs(district: string = 'ALL', entityType?: string): FinancialAuditLog[] {
    return this.financialAuditLogs.filter(l => {
      if (district && district !== 'ALL' && l.district && l.district.toLowerCase() !== district.toLowerCase()) return false;
      if (entityType && entityType !== 'ALL' && l.entityType !== entityType) return false;
      return true;
    });
  }

  // =========================================================================
  // FOCUSPOINT DOCUMENT & CREDENTIAL CENTER ENGINE
  // =========================================================================

  
  private migrateDocumentToZyzus(doc: any): any {
    if (!doc) return doc;
    const repl = (s?: string) => {
      if (!s || typeof s !== "string") return s;
      return s
        .replace(/FocusPoint/g, "ZYZU'S")
        .replace(/focuspoint\.app/g, "zyzus.com")
        .replace(/focuspoint\.internal/g, "zyzus.com")
        .replace(/focuspoint\.org(\.in)?/g, "zyzus.com")
        .replace(/focuspoint\.in/g, "zyzus.com");
    };

    return {
      ...doc,
      title: repl(doc.title),
      authorizedBy: repl(doc.authorizedBy),
      recipientEmail: repl(doc.recipientEmail),
      qrVerificationUrl: repl(doc.qrVerificationUrl),
      lineItems: Array.isArray(doc.lineItems)
        ? doc.lineItems.map((li: any) => ({
            ...li,
            label: repl(li.label)
          }))
        : doc.lineItems,
      metadata: doc.metadata
        ? {
            ...doc.metadata,
            libraryName: repl(doc.metadata.libraryName),
            purpose: repl(doc.metadata.purpose),
            verificationAuthority: repl(doc.metadata.verificationAuthority)
          }
        : doc.metadata
    };
  }

  private migrateOfficialDocToZyzus(doc: any): any {
    if (!doc) return doc;
    const repl = (s?: string) => {
      if (!s || typeof s !== "string") return s;
      return s
        .replace(/FocusPoint/g, "ZYZU'S")
        .replace(/focuspoint\.app/g, "zyzus.com")
        .replace(/focuspoint\.internal/g, "zyzus.com")
        .replace(/focuspoint\.org(\.in)?/g, "zyzus.com")
        .replace(/focuspoint\.in/g, "zyzus.com");
    };

    return {
      ...doc,
      title: repl(doc.title),
      authorizedBy: repl(doc.authorizedBy),
      recipientName: repl(doc.recipientName),
      qrVerificationUrl: repl(doc.qrVerificationUrl),
      breakdown: Array.isArray(doc.breakdown)
        ? doc.breakdown.map((b: any) => ({
            ...b,
            label: repl(b.label)
          }))
        : doc.breakdown
    };
  }

  public getUserDocuments(userId: string, role: string, filters?: DocumentFilterOptions): UnifiedFocusPointDocument[] {
    const callerUser = this.getUserById(userId);
    const callerDistrict = callerUser?.districtName || callerUser?.city || 'Ghazipur';
    const isSuperAdmin = role === 'SUPER_ADMIN' || (callerUser && (callerUser.role === 'SUPER_ADMIN' || (callerUser as any).role === 'super_admin'));

    return this.documents.filter(doc => {
      // 1. Role-Based Authorization & Strict Isolation
      if (!isSuperAdmin) {
        if (role === 'DISTRICT_ADMIN') {
          const isOwnDoc = doc.recipientId === userId;
          const isDistrictOfficial = doc.district.toLowerCase() === callerDistrict.toLowerCase() &&
            ['FINANCIAL', 'ADMINISTRATIVE', 'CERTIFICATE'].includes(doc.category);
          if (!isOwnDoc && !isDistrictOfficial) return false;
        } else if (role === 'TEACHER') {
          if (doc.recipientId !== userId) return false;
        } else if (role === 'STUDENT' || role === 'LIBRARY_STUDENT') {
          if (doc.recipientId !== userId) return false;
        } else if (role === 'LIBRARY_OWNER') {
          const userLibraries = this.getLibraries().filter(l => l.ownerId === userId);
          const libIds = userLibraries.map(l => l.id);
          const isOwnRecipient = doc.recipientId === userId;
          const isOwnedLibrary = doc.metadata?.libraryId && libIds.includes(doc.metadata.libraryId) && doc.recipientRole === 'LIBRARY_OWNER';
          if (!isOwnRecipient && !isOwnedLibrary) return false;
        } else {
          if (doc.recipientId !== userId) return false;
        }
      }

      // 2. Filter by Category
      if (filters?.category && filters.category !== 'ALL') {
        if (filters.category === 'PAYMENT') {
          const isReceipt = doc.category === 'PAYMENT' || doc.documentType.includes('RECEIPT') || doc.documentType.includes('INVOICE');
          if (!isReceipt) return false;
        } else if (doc.category !== filters.category) {
          return false;
        }
      }

      // 3. Filter by Document Type
      if (filters?.documentType && filters.documentType !== 'ALL' && doc.documentType !== filters.documentType) {
        return false;
      }

      // 4. Filter by Status
      if (filters?.status && filters.status !== 'ALL' && doc.status !== filters.status) {
        return false;
      }

      // 5. Filter by Payment Status
      if (filters?.paymentStatus && filters.paymentStatus !== 'ALL' && doc.paymentStatus !== filters.paymentStatus) {
        return false;
      }

      // 6. Super Admin specific filters
      if (isSuperAdmin) {
        if (filters?.role && filters.role !== 'ALL' && doc.recipientRole !== filters.role) {
          return false;
        }
        if (filters?.state && filters.state !== 'ALL' && doc.state && doc.state.toLowerCase() !== filters.state.toLowerCase()) {
          return false;
        }
        if (filters?.district && filters.district !== 'ALL' && doc.district.toLowerCase() !== filters.district.toLowerCase()) {
          return false;
        }
        if (filters?.locality && filters.locality !== 'ALL' && doc.locality && doc.locality.toLowerCase() !== filters.locality.toLowerCase()) {
          return false;
        }
      }

      // 7. Date Range Filter
      if (filters?.dateRange && filters.dateRange !== 'ALL') {
        const docDate = new Date(doc.issueDate);
        const now = new Date();
        if (filters.dateRange === 'THIS_MONTH') {
          if (docDate.getMonth() !== now.getMonth() || docDate.getFullYear() !== now.getFullYear()) return false;
        } else if (filters.dateRange === 'LAST_MONTH') {
          const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
          const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
          if (docDate.getMonth() !== lastMonth || docDate.getFullYear() !== lastMonthYear) return false;
        } else if (filters.dateRange === 'THIS_YEAR') {
          if (docDate.getFullYear() !== now.getFullYear()) return false;
        } else if (filters.dateRange === 'CUSTOM' && filters.startDate && filters.endDate) {
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);
          if (docDate < start || docDate > end) return false;
        }
      }

      // 8. Search Query Filter
      const rawQuery = filters?.searchQuery || (filters as any)?.search;
      if (rawQuery && rawQuery.trim()) {
        const q = rawQuery.toLowerCase().trim();
        const matchesQuery =
          doc.documentNumber.toLowerCase().includes(q) ||
          doc.title.toLowerCase().includes(q) ||
          doc.recipientName.toLowerCase().includes(q) ||
          (doc.paymentId && doc.paymentId.toLowerCase().includes(q)) ||
          (doc.transactionRef && doc.transactionRef.toLowerCase().includes(q)) ||
          (doc.metadata?.libraryName && doc.metadata.libraryName.toLowerCase().includes(q)) ||
          (doc.metadata?.teacherName && doc.metadata.teacherName.toLowerCase().includes(q)) ||
          (doc.metadata?.demoId && doc.metadata.demoId.toLowerCase().includes(q)) ||
          (doc.billingPeriod && doc.billingPeriod.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.issueDate || b.createdAt).getTime() - new Date(a.issueDate || a.createdAt).getTime());
  }

  public getDocumentById(documentIdOrNumber: string): UnifiedFocusPointDocument | null {
    return this.documents.find(d => d.id === documentIdOrNumber || d.documentNumber === documentIdOrNumber) || null;
  }

  public getDocumentKPISummary(userId: string, role: string): DocumentKPISummary {
    const docs = this.getUserDocuments(userId, role);
    const totalDocs = docs.length;
    const readyDocs = docs.filter(d => d.status === 'READY').length;
    const paidReceipts = docs.filter(d => ['PAYMENT', 'BOOKING', 'SUBSCRIPTION'].includes(d.category) && d.paymentStatus === 'PAID').length;
    const idCards = docs.filter(d => d.category === 'IDENTITY').length;
    const salaries = docs.filter(d => d.category === 'SALARY').length;
    const activeDemos = docs.filter(d => d.category === 'DEMO' && d.status === 'READY').length;

    return {
      totalDocuments: totalDocs,
      newDocumentsCount: readyDocs,
      paymentReceiptsCount: paidReceipts,
      identityCredentialsCount: idCards,
      salaryPayoutsCount: salaries,
      activeDemoPassesCount: activeDemos,
      salaryDocuments: salaries,
      idCardCount: idCards
    };
  }

  public recordDocumentAudit(
    documentNumber: string,
    action: 'VIEWED' | 'DOWNLOADED' | 'PRINTED' | 'SHARED' | 'VERIFIED',
    userId: string,
    role: string,
    details?: string
  ): void {
    const doc = this.documents.find(d => d.documentNumber === documentNumber || d.id === documentNumber);
    if (!doc) return;

    if (action === 'VIEWED' && doc.status === 'READY') {
      doc.status = 'VIEWED';
    } else if (action === 'DOWNLOADED') {
      doc.status = 'DOWNLOADED';
    } else if (action === 'PRINTED') {
      doc.status = 'PRINTED';
    }

    doc.auditTrail.push({
      action,
      timestamp: new Date().toISOString(),
      performedBy: userId,
      performedByRole: role,
      details,
      notes: details
    });

    doc.updatedAt = new Date().toISOString();
    this.saveToStorage();
  }

  public verifyDocument(documentNumber: string): DocumentVerificationResult {
    const doc = this.documents.find(d => d.documentNumber === documentNumber || d.id === documentNumber);
    if (!doc) {
      return {
        isValid: false,
        documentNumber,
        title: 'Unrecognized Document',
        category: 'ADMINISTRATIVE',
        documentType: 'PLATFORM_FINANCIAL_STATEMENT',
        recipientName: 'Unknown',
        recipientRole: 'Unknown',
        district: 'N/A',
        state: 'N/A',
        issueDate: 'N/A',
        status: 'REVOKED',
        authenticityStatus: 'REVOKED',
        paymentStatus: 'NOT_APPLICABLE',
        authorizedBy: 'None',
        verifiedAt: new Date().toISOString(),
        verificationHash: 'INVALID_OR_REVOKED_SIGNATURE',
        cryptographicHash: 'INVALID_OR_REVOKED_SIGNATURE',
        tamperEvidenceDetected: true,
        publicNotes: "This document number could not be authenticated against the ZYZU'S Sovereign Ledger."
      };
    }

    const isExpired = doc.validUntil ? new Date(doc.validUntil) < new Date() : false;

    return {
      isValid: doc.status !== 'REVOKED' && !isExpired,
      documentNumber: doc.documentNumber,
      title: doc.title,
      category: doc.category,
      documentType: doc.documentType,
      recipientName: doc.recipientName,
      recipientRole: doc.recipientRole,
      district: doc.district,
      state: doc.state,
      issueDate: doc.issueDate,
      validUntil: doc.validUntil,
      status: isExpired ? 'EXPIRED' : doc.status,
      authenticityStatus: doc.status === 'REVOKED' ? 'REVOKED' : isExpired ? 'EXPIRED' : 'AUTHENTIC',
      paymentStatus: doc.paymentStatus,
      authorizedBy: doc.authorizedBy,
      verifiedAt: new Date().toISOString(),
      verificationHash: doc.qrVerificationHash,
      cryptographicHash: doc.qrVerificationHash,
      tamperEvidenceDetected: doc.status === 'REVOKED',
      publicNotes: doc.status === 'REVOKED'
        ? 'CAUTION: This credential has been officially REVOKED by the Directorate.'
        : isExpired
        ? 'NOTICE: This credential validity period has EXPIRED.'
        : "AUTHENTIC: Digitally signed and officially registered on the ZYZU'S Ledger."
    };
  }

  public checkStudentIdCardEligibility(userId: string): { 
    eligible: boolean; 
    reason?: string; 
    serviceType?: 'HOME_TUITION' | 'LIBRARY' | 'BOTH';
    activeTuitionDetails?: any;
    activeLibraryDetails?: any;
  } {
    const user = this.getUserById(userId);
    if (!user) {
      return { 
        eligible: false, 
        reason: 'User record not found.' 
      };
    }

    const roleTag = (user.role || '').toUpperCase();
    // Non-student roles (Teachers, Library Owners, District Admins, Super Admins) follow their respective role accreditations
    if (roleTag !== 'STUDENT' && roleTag !== 'LIBRARY_STUDENT') {
      return { eligible: true };
    }

    // 1. Check for Active / Valid Home Tuition booking or assigned tutor
    const studentRequests = this.getTutorRequests(undefined, userId);
    const activeTuition = studentRequests.find(r => 
      ['ACTIVE', 'CONFIRMED', 'TEACHER_ALLOTTED'].includes(r.status)
    );

    // 2. Check for Active / Valid Library booking or subscription
    const studentBookings = this.getBookings(userId);
    const activeLibrary = studentBookings.find(b => 
      ['ACTIVE', 'CONFIRMED'].includes(b.status)
    );

    if (activeTuition && activeLibrary) {
      return { 
        eligible: true, 
        serviceType: 'BOTH',
        activeTuitionDetails: activeTuition,
        activeLibraryDetails: activeLibrary
      };
    } else if (activeTuition) {
      return { 
        eligible: true, 
        serviceType: 'HOME_TUITION',
        activeTuitionDetails: activeTuition
      };
    } else if (activeLibrary) {
      return { 
        eligible: true, 
        serviceType: 'LIBRARY',
        activeLibraryDetails: activeLibrary
      };
    }

    return { 
      eligible: false, 
      reason: 'Your Student ID Card becomes available after you activate a qualifying Home Tuition or Library service.' 
    };
  }

  public generateIdCardDocument(userId: string): UnifiedFocusPointDocument {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    // Strict validation: Educators must have APPROVED verification status
    if (user.role === 'TEACHER' || user.role === 'teacher') {
      const teacher = this.getTeacherById(userId);
      if (teacher && teacher.verificationStatus !== 'APPROVED') {
        throw new Error('Teacher ID Card cannot be generated before official accreditation and approval.');
      }
    }

    // Strict validation: Students can generate ID Card ONLY with active Home Tuition or Library service
    const roleUpper = (user.role || '').toUpperCase();
    if (roleUpper === 'STUDENT' || roleUpper === 'LIBRARY_STUDENT') {
      const eligibility = this.checkStudentIdCardEligibility(userId);
      if (!eligibility.eligible) {
        throw new Error(eligibility.reason || 'Your Student ID Card becomes available after you activate a qualifying Home Tuition or Library service.');
      }
    }

    const existingCard = this.documents.find(
      d => d.recipientId === userId && d.category === 'IDENTITY' && d.isCurrent
    );

    if (existingCard) {
      return existingCard;
    }

    const roleTag = user.role.toUpperCase();
    const uniqueSeq = Math.floor(100000 + Math.random() * 900000);
    const docNumber = `FP-ID-2026-${uniqueSeq}`;

    let docType: any = 'STUDENT_ID_CARD';
    let title = "ZYZU'S Official Student Identity Card";
    if (roleTag.includes('TEACHER')) {
      docType = 'TEACHER_ID_CARD';
      title = "ZYZU'S Official Teacher Identity Card";
    } else if (roleTag.includes('LIB') && roleTag.includes('OWNER')) {
      docType = 'LIBRARY_OWNER_ID_CARD';
      title = "ZYZU'S Official Library Partner Identity Card";
    } else if (roleTag.includes('DISTRICT')) {
      docType = 'DISTRICT_ADMIN_ID_CARD';
      title = "ZYZU'S Official District Administrator Identity Card";
    } else if (roleTag.includes('SUPER')) {
      docType = 'SUPER_ADMIN_ID_CARD';
      title = "ZYZU'S Sovereign Super Administrator Credential";
    }

    const newDoc: UnifiedFocusPointDocument = {
      id: `doc-id-${Date.now()}`,
      documentNumber: docNumber,
      title,
      category: 'IDENTITY',
      documentType: docType,
      recipientId: user.id,
      recipientName: user.name,
      recipientRole: roleTag,
      recipientAvatar: user.avatarUrl,
      recipientEmail: user.email,
      recipientPhone: user.mobile,
      state: user.stateName || 'Uttar Pradesh',
      district: user.districtName || user.city || 'Ghazipur',
      locality: user.area || user.city || 'Saidpur',
      issueDate: new Date().toISOString().substring(0, 10),
      validFrom: new Date().toISOString().substring(0, 10),
      validUntil: '2027-03-31',
      status: 'READY',
      paymentStatus: 'NOT_APPLICABLE',
      amount: 0,
      currency: 'INR',
      authorizedBy: 'Mukesh Sonkar',
      authorizedRole: 'Authorized National Registrar',
      qrVerificationUrl: `https://zyzus.com/verify/doc/${docNumber}`,
      qrVerificationHash: `SHA256-${docNumber}-${Date.now()}`,
      version: 1,
      isCurrent: true,
      metadata: {
        bloodGroup: 'B+ (Verified)',
        emergencyContact: user.mobile || '+91 99999 99999',
        verificationStatus: 'VERIFIED'
      },
      auditTrail: [
        {
          action: 'GENERATED',
          timestamp: new Date().toISOString(),
          performedBy: 'SYSTEM_AUTOGEN',
          performedByRole: 'SYSTEM'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.documents.unshift(newDoc);
    this.saveToStorage();
    return newDoc;
  }

  public checkTeacherCertificateEligibility(teacherId: string): {
    eligible: boolean;
    reason?: string;
    teacher?: Teacher;
    certificateNumber?: string;
    existingDoc?: UnifiedFocusPointDocument;
  } {
    const teacher = this.getTeacherById(teacherId) || this.teachers.find(t => t.id === teacherId);
    if (!teacher) {
      return { eligible: false, reason: 'Teacher profile not found.' };
    }

    const isApproved = teacher.verificationStatus === 'APPROVED' || (teacher.verificationStatus as any) === 'verified';
    const existingDoc = this.documents.find(d => 
      d.recipientId === teacherId && 
      d.documentType === 'TEACHER_VERIFICATION_CERTIFICATE' && 
      d.status !== 'REVOKED'
    );

    if (existingDoc) {
      return { eligible: true, teacher, certificateNumber: existingDoc.documentNumber, existingDoc };
    }

    if (!isApproved) {
      return {
        eligible: false,
        reason: 'Your teacher verification is currently under review by the District Desk. Your official Teacher Verification Certificate will be automatically issued once your identity and educational credentials are fully approved.',
        teacher
      };
    }

    const uniqueSeq = (teacher.id.replace(/\D/g, '') || '004128').padStart(6, '0');
    return {
      eligible: true,
      teacher,
      certificateNumber: `FP-TV-2026-${uniqueSeq}`
    };
  }

  public getOrCreateTeacherCertificate(teacherId: string): UnifiedFocusPointDocument {
    const { eligible, reason, teacher } = this.checkTeacherCertificateEligibility(teacherId);
    if (!eligible || !teacher) {
      throw new Error(reason || 'Teacher is not eligible for a verification certificate.');
    }

    const existingDoc = this.documents.find(d => 
      d.recipientId === teacherId && 
      d.documentType === 'TEACHER_VERIFICATION_CERTIFICATE' && 
      d.status !== 'REVOKED'
    );
    if (existingDoc) return existingDoc;

    const uniqueSeq = (teacher.id.replace(/\D/g, '') || Math.floor(100000 + Math.random() * 900000).toString()).padStart(6, '0');
    const docNumber = `FP-TV-2026-${uniqueSeq}`;

    const newDoc: UnifiedFocusPointDocument = {
      id: `doc-cert-${Date.now()}`,
      documentNumber: docNumber,
      title: "ZYZU'S Teacher Verification Certificate",
      category: 'CERTIFICATE',
      documentType: 'TEACHER_VERIFICATION_CERTIFICATE',
      recipientId: teacher.id,
      recipientName: teacher.name,
      recipientRole: 'TEACHER',
      recipientAvatar: teacher.avatarUrl,
      recipientEmail: teacher.email,
      recipientPhone: teacher.mobile,
      state: teacher.stateName || 'Uttar Pradesh',
      district: teacher.districtName || teacher.district || 'Ghazipur',
      locality: teacher.area || 'Saidpur',
      issueDate: teacher.createdAt ? teacher.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10),
      validFrom: teacher.createdAt ? teacher.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10),
      validUntil: '2027-08-31',
      status: 'READY',
      paymentStatus: 'NOT_APPLICABLE',
      amount: 0,
      currency: 'INR',
      authorizedBy: 'Dr. V. K. Saxena',
      authorizedRole: 'National Registrar & Verification Directorate',
      qrVerificationUrl: `https://zyzus.com/verify/doc/${docNumber}`,
      qrVerificationHash: `SHA256-CERT-TV-${docNumber}-${Date.now()}`,
      version: 1,
      isCurrent: true,
      metadata: {
        teacherId: `FP-TCH-${teacher.id.replace(/\D/g, '').padStart(5, '0') || '00412'}`,
        qualification: teacher.degree || teacher.highestQualification || 'Graduate / Postgraduate Degree',
        qualificationStatus: 'VERIFIED',
        experienceYears: teacher.experienceYears || 0,
        experienceStatus: teacher.experienceYears && teacher.experienceYears > 0 ? 'VERIFIED' : 'DECLARED FRESH',
        identityStatus: 'VERIFIED',
        verificationAuthority: "ZYZU'S Directorate of Educator Accreditation",
        districtOffice: `${teacher.districtName || teacher.district || 'Ghazipur'} District Desk`,
        subjects: teacher.subjects || [],
        verificationStatus: 'APPROVED'
      },
      auditTrail: [
        {
          action: 'GENERATED',
          timestamp: new Date().toISOString(),
          performedBy: 'SYSTEM_AUTOGEN',
          performedByRole: 'SYSTEM'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.documents.unshift(newDoc);
    this.saveToStorage();
    return newDoc;
  }

  public addUnifiedDocument(doc: UnifiedFocusPointDocument): UnifiedFocusPointDocument {
    const existingIdx = this.documents.findIndex(d => d.documentNumber === doc.documentNumber || d.id === doc.id);
    if (existingIdx >= 0) {
      this.documents[existingIdx] = doc;
    } else {
      this.documents.unshift(doc);
    }
    this.saveToStorage();
    return doc;
  }

  public getUnifiedDocuments(): UnifiedFocusPointDocument[] {
    return [...this.documents];
  }

  public reissueDocument(
    documentNumber: string,
    reason: string,
    adminId: string,
    adminName: string
  ): UnifiedFocusPointDocument {
    const existing = this.documents.find(d => d.documentNumber === documentNumber);
    if (!existing) throw new Error(`Document ${documentNumber} not found.`);

    // Archive and supersede previous document
    existing.isCurrent = false;
    existing.status = 'REPLACED';
    existing.auditTrail.push({
      action: 'REISSUED',
      timestamp: new Date().toISOString(),
      performedBy: adminId,
      performedByRole: 'SUPER_ADMIN',
      details: `Superseded by version ${existing.version + 1}. Reason: ${reason}`
    });

    const newVersion = existing.version + 1;
    const newDocNumber = `${existing.documentNumber.replace(/-V\d+$/, '')}-V${newVersion}`;

    const reissuedDoc: UnifiedFocusPointDocument = {
      ...JSON.parse(JSON.stringify(existing)),
      id: `doc-${Date.now()}`,
      documentNumber: newDocNumber,
      version: newVersion,
      isCurrent: true,
      status: 'READY',
      reissueReason: reason,
      previousDocumentNumber: existing.documentNumber,
      metadata: {
        ...(existing.metadata || {}),
        supersededDocumentNumber: existing.documentNumber,
        reissueReason: reason
      },
      issueDate: new Date().toISOString().substring(0, 10),
      authorizedBy: adminName,
      qrVerificationUrl: `https://focuspoint.app/verify/doc/${newDocNumber}`,
      qrVerificationHash: `SHA256-REISSUE-${newDocNumber}-${Date.now()}`,
      auditTrail: [
        {
          action: 'GENERATED',
          timestamp: new Date().toISOString(),
          performedBy: adminId,
          performedByRole: 'SUPER_ADMIN',
          details: `Reissued from ${existing.documentNumber}. Reason: ${reason}`
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.documents.unshift(reissuedDoc);
    this.saveToStorage();
    return reissuedDoc;
  }

  // =======================================================================
  // FOCUSPOINT Academic Intelligence & Mock Test Engine Delegations
  // =======================================================================

  public getStudentPerformance(studentId: string) {
    return academicStoreEngine.getStudentPerformance(studentId);
  }

  public getStudentWeeklyGrowth(studentId: string) {
    return academicStoreEngine.getStudentWeeklyGrowth(studentId);
  }

  public getStudentMonthlyGrowth(studentId: string, monthYear?: string) {
    return academicStoreEngine.getStudentMonthlyGrowth(studentId, monthYear);
  }

  public getStudentAchievements(studentId: string) {
    return academicStoreEngine.getStudentAchievements(studentId);
  }

  public getGraduatedRecommendations(studentId: string) {
    return academicStoreEngine.getGraduatedRecommendations(studentId, this.teachers, this.studyMaterials);
  }

  public getTeacherAllottedStudents(teacherId: string) {
    const activeAssignments = this.teacherAssignments.filter(a => a.teacherId === teacherId && a.status === 'ACTIVE');
    const studentIds = Array.from(new Set(activeAssignments.map(a => a.studentId)));
    return studentIds.map(sId => {
      const u = this.users.find(user => user.id === sId);
      const asg = activeAssignments.find(a => a.studentId === sId);
      return {
        id: sId,
        name: u?.name || asg?.studentName || 'Student',
        email: u?.email || '',
        phone: u?.mobile || asg?.studentPhone || '',
        grade: asg?.grade || asg?.className || 'Class 12',
        subjects: asg?.subjects || ['Mathematics'],
        district: asg?.district || 'Ghazipur'
      };
    });
  }

  public recordTeacherTestResult(data: any, teacherId: string, isSuperAdmin: boolean = false) {
    const allotted = this.getTeacherAllottedStudents(teacherId).map(s => s.id);
    const res = academicStoreEngine.recordTeacherTestResult(data, teacherId, isSuperAdmin, allotted);
    if (res.success) {
      this.logFinancialAudit({
        id: `faud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: teacherId,
        userName: `Teacher ${teacherId}`,
        role: 'TEACHER',
        action: 'RECORD_STUDENT_TEST',
        entityType: 'TEACHER_PAYROLL',
        entityId: res.record?.id || `test-${Date.now()}`,
        details: `Teacher recorded academic test for student ${data.studentId}: ${data.testName || data.topic} (${data.marksObtained}/${data.totalMarks})`,
        district: 'Ghazipur'
      });
      this.saveToStorage();
    }
    return res;
  }

  public getTeacherEnteredStudentTests(teacherId: string, studentId?: string) {
    return academicStoreEngine.getTeacherEnteredStudentTests(teacherId, studentId);
  }

  public deleteTeacherTestResult(testId: string, teacherId: string, isSuperAdmin: boolean = false) {
    const res = academicStoreEngine.deleteTeacherTestResult(testId, teacherId, isSuperAdmin);
    if (res) this.saveToStorage();
    return res;
  }

  public getGovernmentExams(category?: string) {
    return academicStoreEngine.getGovernmentExams(category);
  }

  public getGovernmentExamById(id: string) {
    return academicStoreEngine.getGovernmentExamById(id);
  }

  public saveGovernmentExam(exam: any) {
    const res = academicStoreEngine.saveGovernmentExam(exam);
    this.saveToStorage();
    return res;
  }

  public deleteGovernmentExam(id: string) {
    const res = academicStoreEngine.deleteGovernmentExam(id);
    this.saveToStorage();
    return res;
  }

  public getMockTests(examId?: string) {
    return academicStoreEngine.getMockTests(examId);
  }

  public getMockTestById(id: string) {
    return academicStoreEngine.getMockTestById(id);
  }

  public createMockTest(data: any) {
    const res = academicStoreEngine.createMockTest(data);
    this.saveToStorage();
    return res;
  }

  public updateMockTest(id: string, updates: any) {
    const res = academicStoreEngine.updateMockTest(id, updates);
    this.saveToStorage();
    return res;
  }

  public deleteMockTest(id: string) {
    const res = academicStoreEngine.deleteMockTest(id);
    this.saveToStorage();
    return res;
  }

  public duplicateMockTest(id: string, newTitle?: string) {
    const res = academicStoreEngine.duplicateMockTest(id, newTitle);
    this.saveToStorage();
    return res;
  }

  public bulkUpdateMockTests(ids: string[], updates: any) {
    const res = academicStoreEngine.bulkUpdateMockTests(ids, updates);
    this.saveToStorage();
    return res;
  }

  public getMockTestSeries(examId?: string) {
    return academicStoreEngine.getMockTestSeries(examId);
  }

  public getMockTestSeriesById(id: string) {
    return academicStoreEngine.getMockTestSeriesById(id);
  }

  public saveMockTestSeries(series: any) {
    const res = academicStoreEngine.saveMockTestSeries(series);
    this.saveToStorage();
    return res;
  }

  public deleteMockTestSeries(id: string) {
    const res = academicStoreEngine.deleteMockTestSeries(id);
    this.saveToStorage();
    return res;
  }

  public updateExamCategoriesConfig(examId: string, categories: any[]) {
    const res = academicStoreEngine.updateExamCategoriesConfig(examId, categories);
    this.saveToStorage();
    return res;
  }

  public smartAssembleMockTest(params: any) {
    return academicStoreEngine.smartAssembleMockTest(params);
  }

  public generateCustomMockTest(params: {
    examId: string;
    examName?: string;
    title?: string;
    subject?: string;
    topics?: string[];
    questionCount: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED' | 'MODERATE';
    durationMinutes?: number;
    includePyqs?: boolean;
    negativeMarking?: number;
    isFullMock?: boolean;
    requestedByRole?: string;
  }, requestedByRole?: string) {
    const role = requestedByRole || params.requestedByRole;
    // CRITICAL SECURITY ENFORCEMENT: Students cannot generate mock tests directly
    if (role === 'STUDENT' || role === 'student' || role === 'LIBRARY_STUDENT' || role === 'library_student') {
      throw new Error("403 Forbidden: Students are not authorized to directly generate mock tests. Custom mock drills must be requested through the ZYZU'S Academic Operations team.");
    }

    // 1. Filter questions from question bank matching criteria
    let matching = academicStoreEngine.getQuestionBank({
      examId: params.examId,
      subject: params.subject && params.subject !== 'ALL' ? params.subject : undefined,
      difficulty: params.difficulty !== 'MIXED' ? params.difficulty : undefined
    });

    if (matching.length === 0) {
      matching = academicStoreEngine.getQuestionBank({
        examId: params.examId
      });
    }

    if (matching.length === 0) {
      matching = academicStoreEngine.getQuestionBank({});
    }

    const targetCount = Math.max(5, params.questionCount || 10);
    const selectedQuestions = matching.slice(0, targetCount);
    let questionIds = selectedQuestions.map(q => q.id);

    // If we need more questions to meet the requested count, supplement with generated practice items
    if (questionIds.length < targetCount && matching.length > 0) {
      let counter = 1;
      while (questionIds.length < targetCount) {
        const baseQ = matching[(counter - 1) % matching.length];
        const newQId = `q-practice-${Date.now()}-${counter}`;
        const practiceQ = {
          ...baseQ,
          id: newQId,
          topic: params.topics?.[0] || baseQ.topic,
          questionText: `[Section Practice Set — Q${questionIds.length + 1}] ${baseQ.questionText}`
        };
        academicStoreEngine.saveQuestion(practiceQ);
        questionIds.push(newQId);
        counter++;
      }
    }

    const duration = params.durationMinutes || Math.max(10, Math.round(questionIds.length * 1.2));
    const defaultNegative = params.negativeMarking ?? 0.25;
    const testTitle = params.title || (
      params.subject && params.subject !== 'ALL'
        ? `${params.examName} — ${params.subject} Quick Practice (${questionIds.length} Qs)`
        : `${params.examName} — Custom Mock Test (${questionIds.length} Qs)`
    );

    const newTest = this.createMockTest({
      examId: params.examId,
      examName: params.examName,
      title: testTitle,
      description: `Instant ${params.difficulty} difficulty adaptive mock test covering ${params.subject || 'Full syllabus'}. Negative marking: -${defaultNegative}. Full step-by-step solutions provided upon submission.`,
      subject: params.subject || 'Full Examination Mock',
      isFullMock: params.isFullMock ?? (!params.subject || params.subject === 'ALL'),
      durationMinutes: duration,
      totalQuestions: questionIds.length,
      totalMarks: questionIds.length * 2,
      negativeMarkingPerQuestion: defaultNegative,
      passingMarks: Math.round(questionIds.length * 2 * 0.4),
      difficulty: params.difficulty,
      status: 'PUBLISHED',
      questionIds: questionIds
    });

    return newTest;
  }

  // ==========================================
  // CUSTOM MOCK DRILL REQUEST DELEGATIONS
  // ==========================================

  public getCustomMockRequests(studentId?: string) {
    return academicStoreEngine.getCustomMockRequests(studentId);
  }

  public getCustomMockRequestById(id: string) {
    return academicStoreEngine.getCustomMockRequestById(id);
  }

  public submitCustomMockRequest(data: any) {
    const res = academicStoreEngine.submitCustomMockRequest(data);
    this.saveToStorage();
    return res;
  }

  public updateCustomMockRequestStatus(
    id: string,
    status: any,
    operatorMessage?: string,
    assignedOperatorId?: string,
    assignedOperatorName?: string,
    generatedMockTestId?: string
  ) {
    const res = academicStoreEngine.updateCustomMockRequestStatus(
      id,
      status,
      operatorMessage,
      assignedOperatorId,
      assignedOperatorName,
      generatedMockTestId
    );
    this.saveToStorage();
    return res;
  }

  public generateMockFromRequest(requestId: string, operatorDetails: any) {
    const res = academicStoreEngine.generateMockFromRequest(requestId, operatorDetails);
    this.saveToStorage();
    return res;
  }


  public startMockTestAttempt(studentId: string, studentName: string, mockTestId: string) {
    const res = academicStoreEngine.startMockTestAttempt(studentId, studentName, mockTestId);
    this.saveToStorage();
    return res;
  }

  public saveMockTestAnswer(
    attemptId: string,
    questionId: string,
    selectedOptions: string[],
    numericalValue?: number,
    isMarkedForReview?: boolean,
    timeSpentSeconds?: number
  ) {
    const res = academicStoreEngine.saveMockTestAnswer(attemptId, questionId, selectedOptions, numericalValue, isMarkedForReview, timeSpentSeconds);
    this.saveToStorage();
    return res;
  }

  public submitMockTestAttempt(attemptId: string) {
    const res = academicStoreEngine.submitMockTestAttempt(attemptId);
    this.saveToStorage();
    return res;
  }

  public getMockTestAttempt(attemptId: string) {
    return academicStoreEngine.getMockTestAttempt(attemptId);
  }

  public getStudentMockTestHistory(studentId: string) {
    return academicStoreEngine.getStudentMockTestHistory(studentId);
  }

  public getStudentMistakeBook(studentId: string, filters?: any) {
    return academicStoreEngine.getStudentMistakeBook(studentId, filters);
  }

  public updateMistakeItem(mistakeId: string, updates: any) {
    const res = academicStoreEngine.updateMistakeItem(mistakeId, updates);
    this.saveToStorage();
    return res;
  }

  public retryMistakeQuestion(mistakeId: string, selectedAnswer: string) {
    const res = academicStoreEngine.retryMistakeQuestion(mistakeId, selectedAnswer);
    this.saveToStorage();
    return res;
  }

  public getQuestionBank(filters?: any) {
    return academicStoreEngine.getQuestionBank(filters);
  }

  public saveQuestion(question: any) {
    const res = academicStoreEngine.saveQuestion(question);
    this.saveToStorage();
    return res;
  }

  public approveQuestion(questionId: string, adminName?: string) {
    const res = academicStoreEngine.approveQuestion(questionId, adminName);
    this.saveToStorage();
    return res;
  }

  public publishQuestion(questionId: string, adminName?: string) {
    const res = academicStoreEngine.publishQuestion(questionId, adminName);
    this.saveToStorage();
    return res;
  }

  public rejectQuestion(questionId: string, reason?: string) {
    const res = academicStoreEngine.rejectQuestion(questionId, reason);
    this.saveToStorage();
    return res;
  }

  public generateAIQuestions(params: any) {
    const res = academicStoreEngine.generateAIQuestions(params);
    this.saveToStorage();
    return res;
  }

  public getAcademicThresholds() {
    return academicStoreEngine.getAcademicThresholds();
  }

  public updateAcademicThresholds(updates: any, adminName?: string) {
    const res = academicStoreEngine.updateAcademicThresholds(updates, adminName);
    this.saveToStorage();
    return res;
  }

  public getAIControlConfig() {
    return academicStoreEngine.getAIControlConfig();
  }

  public updateAIControlConfig(updates: any) {
    const res = academicStoreEngine.updateAIControlConfig(updates);
    this.saveToStorage();
    return res;
  }

  public getAcademicKPIOverview(districtId?: string) {
    return academicStoreEngine.getAcademicKPIOverview(districtId);
  }

  public addQuestion(question: any) {
    return this.saveQuestion(question);
  }

  public updateQuestion(question: any) {
    return this.saveQuestion(question);
  }

  public deleteQuestion(questionId: string) {
    const res = academicStoreEngine.deleteQuestion(questionId);
    this.saveToStorage();
    return res;
  }

  public bulkApproveQuestions(questionIds: string[], adminName?: string) {
    const res = academicStoreEngine.bulkApproveQuestions(questionIds, adminName);
    this.saveToStorage();
    return res;
  }

  public bulkRejectQuestions(questionIds: string[]) {
    const res = academicStoreEngine.bulkRejectQuestions(questionIds);
    this.saveToStorage();
    return res;
  }

  public bulkDeleteQuestions(questionIds: string[]) {
    const res = academicStoreEngine.bulkDeleteQuestions(questionIds);
    this.saveToStorage();
    return res;
  }

  public addMockTest(data: any) {
    return this.createMockTest(data);
  }

  public addStudyMaterial(materialData: any) {
    return this.saveStudyMaterial(materialData);
  }

  public updateStudyMaterial(materialData: any) {
    return this.saveStudyMaterial(materialData);
  }

  public getStudyMaterialPurchases() {
    return this.getAllPurchases();
  }

  public synthesizeCbtMockTestFromPyq(pyqMaterial: any): any {
    const meta = pyqMaterial.pyqMetadata;
    if (!meta) return null;

    const mockId = meta.linkedCbtMockTestId || `mock-cbt-${pyqMaterial.id || Date.now()}`;
    const testTitle = `${meta.examName} (${meta.examYear}) - ${meta.shift} [Official PYQ CBT]`;
    
    // Sample synthesized questions for the interactive CBT
    const sectionNames = meta.sections?.map((s: any) => s.name) || ['Section A', 'Section B'];
    const generatedQuestions: any[] = [];
    let qIndex = 1;

    (meta.sections || [{ name: 'General', questionCount: 20, marks: 40, negativeMarks: 0.5 }]).forEach((sec: any) => {
      const sampleCount = Math.min(sec.questionCount, 10); // Generate up to 10 interactive questions per section for demo CBT
      for (let i = 1; i <= sampleCount; i++) {
        const correctOpt = ['A', 'B', 'C', 'D'][(qIndex - 1) % 4];
        generatedQuestions.push({
          id: `pyq-q-${mockId}-${qIndex}`,
          examId: meta.examId,
          examName: meta.examName,
          subject: sec.name,
          topic: `${meta.examYear} Official Shift Questions`,
          difficulty: i % 3 === 0 ? 'HARD' : i % 2 === 0 ? 'MEDIUM' : 'EASY',
          questionType: 'MCQ',
          questionText: `[${meta.examName} ${meta.examYear} ${meta.shift} - Q${qIndex}] An official question extracted via AI Neural OCR from ${meta.paperCode || 'Official Booklet'}. What is the correct standard evaluation for this concept under ${sec.name}?`,
          options: [
            { id: 'opt-a', text: `Official Reference Proposition Alpha (Consistent with ${meta.conductingAuthority} key)`, isCorrect: correctOpt === 'A' },
            { id: 'opt-b', text: `Alternative Option Beta with standard distraction distractor`, isCorrect: correctOpt === 'B' },
            { id: 'opt-c', text: `Theoretical Option Gamma supported by fundamental principles`, isCorrect: correctOpt === 'C' },
            { id: 'opt-d', text: `Option Delta representing boundary condition scenario`, isCorrect: correctOpt === 'D' },
          ],
          correctAnswer: correctOpt,
          explanation: `Official Step-by-Step Solution: As published in ${meta.examName} ${meta.examYear} official answer key for ${meta.paperCode}, option ${correctOpt} is the verified answer. Detailed derivation and concept point verified by ZYZU'S Academic Bureau.`,
          conceptPoint: `Verified Official Exam Key Reference: ${meta.paperCode} Q.${qIndex}`,
          marks: Math.round(sec.marks / (sec.questionCount || 1)) || 2,
          negativeMarks: sec.negativeMarks || 0.5,
          language: meta.language || 'Bilingual (Hindi + English)',
          source: 'PAST_YEAR_PAPER',
          status: 'APPROVED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        qIndex++;
      }
    });

    const mockTestData = {
      title: testTitle,
      examId: meta.examId,
      examName: meta.examName,
      subject: meta.sections?.length > 1 ? 'Full Examination Mock' : (meta.sections?.[0]?.name || 'General Studies'),
      durationMinutes: meta.durationMinutes || 60,
      totalQuestions: meta.totalQuestions || 100,
      totalMarks: meta.totalMarks || 200,
      passingMarks: Math.round((meta.totalMarks || 200) * 0.4),
      instructions: [
        `This is the authentic computer-based test (CBT) replica of the ${meta.examName} held on ${meta.examDate || meta.examYear} (${meta.shift}).`,
        `Marking Scheme: Correct answer earns positive marks as per the official blueprint. Incorrect answers incur -${meta.negativeMarking} negative marking.`,
        `Official Booklet Series: ${meta.paperCode || 'Series A'}. Conducting Body: ${meta.conductingAuthority}.`,
        `Full verified step-by-step solutions will be unlocked immediately upon submitting your attempt.`
      ],
      sections: meta.sections || [],
      questions: generatedQuestions,
      isPublished: true,
      difficulty: 'MEDIUM',
      category: meta.examCategory || 'GOVERNMENT',
      source: 'PAST_YEAR_PAPER',
      negativeMarking: meta.negativeMarking || 0.5,
      isFullMock: true
    };

    const createdTest = this.createMockTest(mockTestData);
    return createdTest;
  }
}


export const mockStore = new MockStore();
