// FOCUSPOINT Pan-India Super Admin Centralized Type Definitions
// Frontend-First Enterprise Console Models

export type GeographicLevel = 'INDIA' | 'STATE' | 'DISTRICT' | 'LOCALITY' | 'AREA';

export interface PanIndiaGeoFilterParams {
  level?: GeographicLevel;
  countryId?: string;
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  localityId?: string;
  localityName?: string;
  areaId?: string;
  areaName?: string;
  datePreset?: 'today' | 'this_week' | 'this_month' | 'prev_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'custom';
  startDate?: string;
  endDate?: string;
  status?: string;
  role?: string;
  search?: string;
}

export interface SuperAdminSessionItem {
  id: string;
  device: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  browser?: string;
  location?: string;
}

export interface SuperAdminLoginLog {
  id: string;
  timestamp: string;
  ip: string;
  device: string;
  status: 'SUCCESS' | 'BLOCKED';
  location?: string;
}

// 1. Super Admin Profile Models
export interface SuperAdminProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  role: 'SUPER_ADMIN' | 'super_admin';
  avatarUrl?: string;
  bio?: string;
  department?: string;
  employeeId?: string;
  joinedDate?: string;
  lastLogin?: string;
  sovereignTitle?: string;
  sovereignClearanceLevel?: string;
  merkleDigitalSignature?: string;
  masterRecoveryKey?: string;
  threeFactorEnabled?: boolean;
  securitySettings?: {
    twoFactorEnabled: boolean;
    threeFactorEnabled?: boolean;
    emailAlertsOnLogin: boolean;
    sessionTimeoutMinutes: number;
    ipWhitelistingEnabled: boolean;
    masterRecoveryKey?: string;
    lastPasswordChangeDate?: string;
  };
  notificationPreferences?: {
    highValueTransactions: boolean;
    districtAdminAppointments: boolean;
    escalatedSupportTickets: boolean;
    systemAlerts: boolean;
    dailyExecutiveDigest: boolean;
    securityAlertsWhatsApp?: boolean;
    financeAlertsWhatsApp?: boolean;
  };
}

// 2. GMV Analytics Models
export interface DistrictGMVSummary {
  districtId: string;
  districtName: string;
  stateName: string;
  tuitionGMV: number;
  libraryGMV: number;
  totalGMV: number;
  onlineGMV: number;
  offlineGMV: number;
  activeStudents: number;
  activeTeachers: number;
  activeLibraries: number;
  growthPercentage: number;
  lastUpdated: string;
}

export interface GMVAnalyticsData {
  totalGMV: number;
  currentMonthGMV: number;
  previousMonthGMV: number;
  growthQoQ: number;
  tuitionGMV: number;
  libraryGMV: number;
  onlineGMV: number;
  offlineGMV: number;
  districts: DistrictGMVSummary[];
  monthlyTrend: {
    month: string;
    tuitionGMV: number;
    libraryGMV: number;
    totalGMV: number;
  }[];
}

// 3. Revenue & Payment Ledger Models
export type ExpenseCategory = 
  | 'Advertising'
  | 'Travel'
  | 'Operations'
  | 'Research & Development'
  | 'Technology'
  | 'Support'
  | 'Administration'
  | 'Other';

export interface ExpenseBreakdownItem {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  description: string;
}

export interface PanIndiaPaymentStatement {
  grossVolume: number;
  platformTakeRatePercent: number;
  platformCommission: number;
  disbursedToEducators: number;
  disbursedToLibraries: number;
  districtAdminPayments: number;
  refunds: number;
  totalExpenses: number;
  netPlatformRevenue: number;
  expenseBreakdown: ExpenseBreakdownItem[];
}

export interface PaymentLedgerRecord {
  id: string;
  transactionId: string;
  date: string;
  studentName: string;
  userRole?: string;
  serviceType: 'HOME_TUITION' | 'SELF_STUDY_LIBRARY' | 'MOCK_TEST' | 'STUDY_MATERIAL';
  serviceTitle: string;
  productName?: string;
  stateName: string;
  districtName: string;
  localityName?: string;
  areaName?: string;
  grossAmount: number;
  discountAmount?: number;
  couponCode?: string;
  platformFee: number;
  partnerPayout: number;
  paymentMethod: 'UPI' | 'NET_BANKING' | 'CARD' | 'MANUAL_CASH';
  status: 'COMPLETED' | 'PROCESSING' | 'REFUNDED' | 'FAILED';
  refundStatus?: 'NONE' | 'REQUESTED' | 'PROCESSED' | 'REJECTED';
  settlementStatus?: 'SETTLED' | 'PENDING' | 'HELD';
  invoiceUrl?: string;
}

// 4. District Admin Governance Models
export interface DistrictAdminRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  stateName: string;
  districtName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'PENDING_SETUP';
  assignedDate: string;
  avatarUrl?: string;
  whatsappNumber?: string;
  qualification?: string;
  address?: string;
  temporaryPassword?: string;
  assignedBy?: string;
  effectiveFrom?: string;
  reassignmentHistory?: Array<{ previousDistrict: string; previousState: string; reassignedAt: string; reason?: string }>;
  credentialsDispatched?: boolean;
  whatsappConfirmationSent?: boolean;
  totalTeachers: number;
  totalStudents: number;
  totalLibraries: number;
  districtGMV: number;
  growthPercentage: number;
  lastLogin?: string;
  salaryDetails?: {
    baseSalary: number;
    allowances: number;
    deductions: number;
    netPayable: number;
    lastPaidDate?: string;
    paymentStatus: 'PAID' | 'PENDING' | 'SIMULATION';
  };
}

export interface DistrictAdminSalaryPaymentParams {
  districtId: string;
  districtName: string;
  adminId: string;
  adminName: string;
  salaryPeriod: string;
  baseSalary: number;
  adjustments: number;
  deductions: number;
  paymentDate: string;
  notes?: string;
}

export interface DistrictAdminSalarySlipData {
  slipId: string;
  adminName: string;
  adminId: string;
  districtName: string;
  stateName: string;
  salaryMonth: string;
  baseSalary: number;
  adjustments: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  transactionReference: string;
  status: 'SIMULATION' | 'COMPLETED' | 'INTEGRATION_PENDING';
}

// 5. Universal ID Card & Certificate Models
export type UniversalIDRole = 'STUDENT' | 'TEACHER' | 'LIBRARY_OWNER' | 'DISTRICT_ADMIN' | 'SUPER_ADMIN';

export interface UniversalIDCardData {
  id: string;
  uniqueIdNumber: string;
  fullName: string;
  role: UniversalIDRole;
  designation?: string;
  stateName: string;
  districtName: string;
  localityName?: string;
  joiningDate: string;
  validUntil: string;
  avatarUrl?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  authorizedSignatureBy: string;
}

export interface LibraryCertificateData {
  certificateId: string;
  certificateNumber?: string;
  libraryName: string;
  libraryId: string;
  ownerName: string;
  ownerId: string;
  fullAddress: string;
  locality: string;
  localityName?: string;
  districtName: string;
  stateName: string;
  totalDesks?: number;
  joiningDate: string;
  issueDate: string;
  validUntil: string;
  isVerified: boolean;
  isPartnered: boolean;
  sealsApproved: boolean;
  verificationHash?: string;
}

// 6. Allotment Velocity & Infrastructure Scale
export interface AllotmentVelocityMetrics {
  totalRequests: number;
  assignedRequests: number;
  pendingRequests: number;
  avgAllocationTimeHours: number;
  fastestAllocationMinutes: number;
  longestPendingHours: number;
  districtComparison: {
    district: string;
    avgHours: number;
    fillRate: number;
  }[];
}

export interface InfrastructureScaleMetrics {
  operatingDistricts: number;
  activeLibraries: number;
  totalLibrarySeats: number;
  activeEducators: number;
  activeTuitionStudents: number;
  activeLibraryStudents: number;
  districtAdmins: number;
}

// 7. Commission & Offer Wizard Models
export type CommissionScope = 'PAN_INDIA' | 'STATE' | 'DISTRICT' | 'LOCALITY' | 'INDIVIDUAL';
export type CommissionService = 'HOME_TUITION' | 'SELF_STUDY_LIBRARY';

export interface CustomCommissionOverride {
  id: string;
  service: CommissionService;
  scope: CommissionScope;
  stateName?: string;
  districtName?: string;
  localityName?: string;
  targetEntityId?: string;
  targetEntityName?: string;
  defaultCommissionRate: number;
  customCommissionRate: number;
  differenceRate: number;
  effectiveDate: string;
  expiryDate?: string;
  reason: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PAUSED';
  createdAt: string;
}

export interface SuperAdminOfferDefinition {
  id: string;
  name: string;
  couponCode: string;
  service: CommissionService;
  scope: CommissionScope;
  stateName?: string;
  districtName?: string;
  localityName?: string;
  targetEntityId?: string;
  targetEntityName?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  timesUsed: number;
  termsAndConditions: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
}

// 8. Audit Event & Logging
export interface SuperAdminAuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  actorId: string;
  action: string;
  module: string;
  target: string;
  targetId?: string;
  district?: string;
  state?: string;
  previousValue?: string;
  newValue?: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  isImmutable: boolean;
  // Cryptographic Chaining & Merkle Proofs
  merkleHash?: string;
  parentHash?: string;
  blockIndex?: number;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  signatureAlgorithm?: string;
  verificationStatus?: 'VERIFIED_SEALED' | 'TAMPER_ALERT';
  metadata?: Record<string, any>;
}

export interface MerkleVerificationReport {
  isValid: boolean;
  totalBlocks: number;
  verifiedAt: string;
  rootHash: string;
  brokenIndex: number | null;
  anomaliesDetected: number;
  message: string;
  tamperedBlockId?: string;
}

export interface AuditSecurityAnomaly {
  id: string;
  type: 'POLICY_SPIKE' | 'UNAUTHORIZED_WINDOW' | 'RAPID_FIRE' | 'CROSS_DISTRICT' | 'FAILED_BURST';
  severity: 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  detectedAt: string;
  actorName: string;
  relatedBlockId: string;
  recommendation: string;
}

export interface AuditLedgerStats {
  totalRecords: number;
  verifiedBlocks: number;
  activeModules: number;
  monitoredDistricts: number;
  latestMerkleRoot: string;
  integrityPercentage: number;
  lastSealedTimestamp: string;
}

// 9. State & District Report Models
export type ReportExportFormat = 'PDF' | 'EXCEL' | 'CSV' | 'JSON';

export interface StateReportSummary {
  stateName: string;
  dateRange: string;
  reportType: string;
  totalDistricts: number;
  totalStudents: number;
  totalTeachers: number;
  totalLibraries: number;
  grossGMV: number;
  platformRevenue: number;
  payoutsDisbursed: number;
  activeOffersCount: number;
  newRegistrations: number;
  discontinuations: number;
  overallAttendanceRate: number;
}

export interface DistrictReportSummary {
  districtName: string;
  stateName: string;
  dateRange: string;
  adminName: string;
  adminStatus: string;
  totalStudents: number;
  totalTeachers: number;
  totalLibraries: number;
  totalBookings: number;
  tuitionGMV: number;
  libraryGMV: number;
  totalGMV: number;
  platformCommission: number;
  educatorPayouts: number;
  libraryPayouts: number;
  districtExpenses: number;
  netRevenue: number;
  studentGrowth: number;
  teacherGrowth: number;
  libraryGrowth: number;
}

export interface PanIndiaMacroSummary {
  reportingPeriod: string;
  totalStates: number;
  totalDistricts: number;
  totalStudents: number;
  totalTeachers: number;
  totalLibraries: number;
  totalBookings: number;
  grossGMV: number;
  platformNetRevenue: number;
  payoutsDisbursed: number;
  activeOffersBurn: number;
  blendedTakeRate: number;
  attendanceIntegrity: number;
  overallGrowthMoM: number;
  verticalSplit: {
    homeTuitionGMV: number;
    studyLibraryGMV: number;
    mockExamGMV: number;
    studyVaultGMV: number;
  };
}

export interface TerritoryComparisonRow {
  id: string;
  districtName: string;
  stateName: string;
  coordinatorName: string;
  coordinatorStatus: 'ACTIVE' | 'VACANT' | 'SUSPENDED';
  totalStudents: number;
  totalTeachers: number;
  totalLibraries: number;
  activeBookings: number;
  grossGMV: number;
  platformNetRevenue: number;
  attendanceRate: number;
  fulfillmentVelocityHours: number;
  healthScore: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface VerticalIntelligenceDetail {
  verticalKey: 'HOME_TUITION' | 'STUDY_LIBRARY' | 'MOCK_EXAMS' | 'STUDY_VAULT';
  title: string;
  description: string;
  totalVolume: number;
  unitLabel: string;
  grossGMV: number;
  platformNetRevenue: number;
  partnerPayouts: number;
  retentionRate: number;
  growthPercentage: number;
  keyMetrics: Array<{ label: string; value: string | number; change?: string }>;
  topPerformers: Array<{ name: string; territory: string; score: string }>;
}

export interface AiCognitiveInsight {
  id: string;
  category: 'OPPORTUNITY' | 'BOTTLENECK' | 'ANOMALY' | 'FORECAST';
  title: string;
  description: string;
  territory: string;
  severity: 'CRITICAL' | 'WARNING' | 'POSITIVE' | 'INFO';
  metricImpact: string;
  recommendedAction: string;
  confidenceScore: number;
  timestamp: string;
}

export interface RegulatoryTaxAuditSummary {
  reportingPeriod: string;
  territory: string;
  grossTaxableGMV: number;
  gstTotalRatePercent: number;
  cgstAmount: number;
  sgstAmount: number;
  inputTaxCreditEligible: number;
  netGstPayable: number;
  tdsDeductedOnPayouts: number;
  educatorKycComplianceRate: number;
  policeClearanceRate: number;
  libraryFireSafetyScore: number;
  cctvBiometricIntegrity: number;
}

export interface CustomReportQueryDefinition {
  id?: string;
  title: string;
  dateRange: string;
  territoryLevel: 'PAN_INDIA' | 'STATE' | 'DISTRICT';
  selectedState?: string;
  selectedDistrict?: string;
  selectedVerticals: Array<'ALL' | 'HOME_TUITION' | 'STUDY_LIBRARY' | 'MOCK_EXAMS' | 'STUDY_VAULT'>;
  metrics: Array<'GMV' | 'NET_REVENUE' | 'STUDENTS' | 'TEACHERS' | 'LIBRARIES' | 'ATTENDANCE' | 'GROWTH'>;
  groupBy: 'TERRITORY' | 'VERTICAL' | 'MONTH' | 'NONE';
}

export interface ScheduledReportDispatch {
  id: string;
  title: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  format: ReportExportFormat;
  targetLevel: 'PAN_INDIA' | 'STATE' | 'DISTRICT';
  territoryName: string;
  recipients: string[];
  active: boolean;
  lastRunTimestamp?: string;
  nextRunTimestamp: string;
}

// 10. Directives & Multi-Channel Broadcast Models
export type DirectiveCategory = 
  | 'POLICY_CIRCULAR' 
  | 'EMERGENCY_ALERT' 
  | 'PROMOTIONAL_CAMPAIGN' 
  | 'SYSTEM_MAINTENANCE' 
  | 'REGULATORY_TAX';

export type DirectivePriority = 
  | 'ROUTINE' 
  | 'IMPORTANT' 
  | 'CRITICAL_URGENT' 
  | 'EMERGENCY_SOS';

export type BroadcastChannel = 
  | 'IN_APP' 
  | 'WHATSAPP' 
  | 'SMS' 
  | 'EMAIL';

export type BroadcastAudience = 
  | 'ALL_USERS' 
  | 'STUDENTS' 
  | 'TEACHERS' 
  | 'LIBRARIES' 
  | 'DISTRICT_ADMINS' 
  | 'OPERATORS';

export type BroadcastStatus = 
  | 'DELIVERED' 
  | 'ACTIVE' 
  | 'QUEUED' 
  | 'SIMULATED' 
  | 'ARCHIVED' 
  | 'REVOKED';

export interface SuperAdminDirectiveRecord {
  id: string;
  title: string;
  message: string;
  category: DirectiveCategory;
  priority: DirectivePriority;
  targetAudience: BroadcastAudience;
  targetAudienceLabel: string;
  district?: string;
  state?: string;
  channels: BroadcastChannel[];
  date: string;
  deliveredCount: number;
  openRate: number;
  acknowledgmentRate?: number;
  requiresAck: boolean;
  status: BroadcastStatus;
  expiresAt?: string;
  authorName: string;
  authorRole: string;
  metadata?: Record<string, any>;
}

export interface DirectiveStatsSummary {
  totalDirectives: number;
  activeAlerts: number;
  totalReach: number;
  emergencySosCount: number;
  averageOpenRate: number;
  channelsActive: number;
}

export interface AudienceReachEstimate {
  totalRecipients: number;
  studentsCount: number;
  teachersCount: number;
  libraryCount: number;
  adminCount: number;
  operatorCount: number;
  channelCoverage: Record<BroadcastChannel, number>;
}

// ============================================================================
// 10. Central Platform Architecture & Sovereign Settings Models
// ============================================================================

export type CentralSettingsCategory = 
  | 'FINANCIAL_ECONOMICS'
  | 'SECURITY_SOVEREIGNTY'
  | 'COMMUNICATIONS_GATEWAYS'
  | 'AI_INTELLIGENCE_CORE'
  | 'INFRASTRUCTURE_DATABASE'
  | 'EMERGENCY_CIRCUIT_BREAKERS';

export type DisasterRecoveryLevel = 
  | 'LEVEL_0_NORMAL' 
  | 'LEVEL_1_WARNING' 
  | 'LEVEL_2_ELEVATED' 
  | 'LEVEL_3_LOCKDOWN';

export type AiModelEngine = 
  | 'GEMINI_2_FLASH' 
  | 'GEMINI_1_5_PRO' 
  | 'CLAUDE_3_5_SONNET' 
  | 'DEEPSEEK_R1';

export type SmtpEncryptionType = 'TLS' | 'SSL' | 'STARTTLS';

export type SettingsPresetProfile = 
  | 'DEFAULT_STANDARD' 
  | 'HIGH_SECURITY_STRICT' 
  | 'EXAM_RUSH_OPTIMIZED' 
  | 'DISASTER_CRISIS_LOCKDOWN';

export interface CentralPlatformSettings {
  version: string;
  lastUpdated: string;
  updatedBy: string;

  // 1. Financial & Tax Economics
  tuitionCommissionPercent: number;
  libraryCommissionPercent: number;
  districtAdminRoyaltySharePercent: number;
  gstRatePercent: number;
  tdsWithholdingPercent: number;
  payoutCycle: string;
  minimumPayoutThresholdINR: number;
  latePaymentPenaltyPerDayPercent: number;

  // 2. Security & Sovereignty
  singleAdminPerDistrictEnforced: boolean;
  twoFactorAuthEnforced: boolean;
  corporateIpWhitelisting: boolean;
  whitelistedIps: string[];
  sessionTimeoutMinutes: number;
  maxLoginAttemptsBeforeLockout: number;
  lockoutDurationMinutes: number;
  requireBiometricForTurnstiles: boolean;
  quantumResistantHashRounds: number;

  // 3. Communications & Message Gateways
  whatsappCloudApiEnabled: boolean;
  whatsappApiVersion: string;
  whatsappWebhookUrl: string;
  dltTransactionalSmsEnabled: boolean;
  dltEntityId: string;
  dltHeaderPrefix: string;
  smtpHost: string;
  smtpPort: number;
  smtpEncryption: SmtpEncryptionType;
  senderEmail: string;
  dailySmsQuotaLimit: number;

  // 4. AI & Intelligence Core
  aiForecastingModel: AiModelEngine;
  predictiveAnomalyDetectionEnabled: boolean;
  smartPricingEngineEnabled: boolean;
  autoAttendanceFraudDetection: boolean;
  aiConfidenceThresholdPercent: number;
  autoEscalateCriticalTickets: boolean;
  executiveReportFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  // 5. InsForge PostgreSQL & Infrastructure
  insforgeRemoteServiceUrl: string;
  databasePoolMaxConnections: number;
  connectionTimeoutMs: number;
  offlineSyncIntervalSeconds: number;
  autoVacuumEnabled: boolean;
  readReplicaRegion: string;
  dataRetentionMonths: number;

  // 6. Emergency Operations & Circuit Breakers
  platformMaintenanceBannerMode: boolean;
  maintenanceBannerMessage: string;
  emergencyReadOnlyCircuitBreaker: boolean;
  emergencyPayoutFreeze: boolean;
  disasterRecoveryProtocolLevel: DisasterRecoveryLevel;
  emergencyHelplineDirectNumber: string;
}

export interface SettingsDiffItem {
  key: keyof CentralPlatformSettings;
  label: string;
  category: CentralSettingsCategory;
  previousValue: any;
  newValue: any;
}

export interface SettingsTelemetrySummary {
  securityRatingScore: number;
  activeGatewaysCount: number;
  baseCommissionMargin: number;
  killswitchEngaged: boolean;
  databaseLatencyMs: number;
  lastSynchronizedAt: string;
  pendingChangesCount: number;
}
// 7. Pan-India Unified Bookings & Allotments Command Models
export type UnifiedBookingServiceType = 'HOME_TUITION' | 'LIBRARY';
export type UnifiedBookingStatus = 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'PAUSED' | 'SUSPENDED' | 'CANCELLED';
export type UnifiedPaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL' | 'REFUNDED';

export interface UnifiedBookingRecord {
  id: string;
  refNumber: string;
  serviceType: UnifiedBookingServiceType;
  studentId: string;
  studentName: string;
  studentMobile: string;
  studentEmail?: string;
  studentAvatar?: string;
  grade?: string;
  guardianName?: string;
  guardianPhone?: string;
  district: string;
  state: string;
  locality?: string;
  pincode?: string;
  // Home Tuition fields
  subject?: string;
  subjects?: string[];
  teacherId?: string;
  teacherName?: string;
  teacherAvatar?: string;
  teacherPhone?: string;
  teacherExperience?: string;
  teachingMode?: string;
  sessionRate?: number;
  // Library fields
  libraryId?: string;
  libraryName?: string;
  libraryAddress?: string;
  seatNumber?: string;
  shift?: string;
  shiftTiming?: string;
  qrPassId?: string;
  qrPassActive?: boolean;
  // Financial & Contract
  monthlyAmount: number;
  paidAmount: number;
  dueAmount: number;
  platformCutPercent: number;
  platformCutAmount: number;
  startDate: string;
  endDate: string;
  status: UnifiedBookingStatus;
  paymentStatus: UnifiedPaymentStatus;
  paymentMethod?: string;
  reassignmentCount?: number;
  lastReassignedAt?: string;
  lastReassignedReason?: string;
  createdDate: string;
  updatedDate: string;
  notes?: string;
}

export interface BookingsCockpitKPIs {
  totalAllotments: number;
  activeTuitions: number;
  activeLibraryDesks: number;
  totalGrossValue: number;
  tutorDeploymentRate: number;
  qrPassesActive: number;
  pendingReassignments: number;
  averageMonthlyTicket: number;
}
