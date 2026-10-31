// FOCUSPOINT Exam Eligibility, Subscription & Pricing Type Definitions

export type AcademicStream = 'PCM' | 'PCB' | 'COMMERCE' | 'ARTS' | 'GENERAL' | 'ANY';

export type ExamAccessState = 
  | 'AVAILABLE' 
  | 'ELIGIBLE_SUBSCRIPTION_REQUIRED' 
  | 'NOT_ELIGIBLE' 
  | 'EXPIRED' 
  | 'COMING_SOON';

export interface ExamEligibilityRule {
  id: string;
  examId: string;
  examName: string;
  category: string;
  minClass: number; // e.g. 5
  maxClass: number; // e.g. 5
  currentClass: number; // e.g. 5
  targetClass?: number; // e.g. 6 (for Class 5 entrance to Class 6)
  targetStream?: AcademicStream; // e.g. PCM / PCB / ANY
  allowedStreams?: AcademicStream[];
  eligibleSubjects?: string[];
  applicableState?: string; // or undefined for Pan-India
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  localityId?: string;
  localityName?: string;
  board?: string; // e.g. 'CBSE', 'ICSE', 'UP_BOARD', 'BIHAR_BOARD', 'ALL'
  academicYear?: string; // e.g. '2026-2027'
  minAge?: number;
  maxAge?: number;
  priority?: number; // 1 to 5
  createdBy?: string;
  ruleStatus?: 'ACTIVE' | 'DRAFT' | 'EXPIRED';
  ineligibleReason?: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  status: 'ACTIVE' | 'INACTIVE';
  ruleNotes?: string;
  isActive?: boolean;
  updatedAt?: string;
}

export type AcademicProductType = 
  | 'MOCK_TEST_SUBSCRIPTION' 
  | 'STUDY_MATERIAL_SUBSCRIPTION' 
  | 'GROWING_INTELLIGENCE' 
  | 'GROWING_INTELLIGENCE_SUBSCRIPTION'
  | 'MISTAKE_BOOK' 
  | 'COMPLETE_PACKAGE' 
  | 'COMPLETE_EXAM_PACKAGE'
  | 'EXAM_PACKAGE';

export type EntitlementFeature = 
  | 'MOCK_TESTS' 
  | 'ALL_MOCK_TESTS'
  | 'SUBJECT_MOCK_TESTS'
  | 'STUDY_MATERIAL' 
  | 'GROWING_INTELLIGENCE' 
  | 'MISTAKE_BOOK' 
  | 'PERFORMANCE_ANALYTICS' 
  | 'GOVT_EXAMS' 
  | 'ADMISSION_EXAMS';

export interface AcademicProduct {
  id: string;
  code: string;
  name: string;
  type: AcademicProductType;
  examId?: string; // specific exam or 'ALL'
  examName?: string;
  targetClass?: string; // e.g. 'Class 5', 'Class 8', 'Class 10', 'Class 11', 'Class 12', 'ALL'
  targetAudience?: string;
  targetStream?: AcademicStream;
  featuresIncluded: EntitlementFeature[];
  durationDays: number; // e.g. 30, 90, 180, 365
  basePrice: number;
  description: string;
  badge?: string; // e.g. 'Bestseller', 'Recommended for JEE', 'Class 6 Entrance'
  highlights: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PricingScope = 
  | 'STUDENT' 
  | 'TEACHER' 
  | 'LIBRARY' 
  | 'LOCALITY'
  | 'DISTRICT' 
  | 'STATE' 
  | 'PAN_INDIA';

export interface AcademicPricingRule {
  id: string;
  productId: string;
  productName: string;
  examId?: string;
  scope: PricingScope;
  scopeId?: string; // studentId, teacherId, libraryId, localityId, districtId, stateId
  scopeName?: string; // human readable name
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  localityId?: string;
  localityName?: string;
  price: number;
  discountPercentage?: number;
  effectiveFrom: string;
  effectiveUntil?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdBy: string;
  updatedAt: string;
}

export interface ResolvedPriceResult {
  productId: string;
  productName: string;
  basePrice: number;
  finalPrice: number;
  appliedScope: PricingScope;
  appliedScopeName: string;
  pricingRuleId: string;
  scopeDiscount: number;
  couponDiscount: number;
  couponCode?: string;
  taxAmount: number;
  payableTotal: number;
  breakdown: string[];
}

export type SubscriptionSource = 
  | 'DIRECT_PURCHASE' 
  | 'LIBRARY_BOOKING' 
  | 'HOME_TUITION' 
  | 'TEACHER_ALLOTMENT'
  | 'ADMIN_GRANT' 
  | 'OFFLINE_REGISTRATION';

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface StudentSubscription {
  id: string;
  studentId: string;
  studentName: string;
  productId: string;
  productName: string;
  productType: AcademicProductType;
  examId?: string;
  examName?: string;
  source: SubscriptionSource;
  libraryId?: string;
  libraryName?: string;
  teacherId?: string;
  teacherName?: string;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  features: EntitlementFeature[];
  pricingRuleId?: string;
  pricingScope?: PricingScope;
  originalPrice: number;
  discount: number;
  finalPaidAmount: number;
  paymentId?: string;
  invoiceNumber: string;
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  localityId?: string;
  localityName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAcademicProfile {
  studentId: string;
  studentName: string;
  dateOfBirth?: string;
  currentClass: string; // e.g. 'Class 5', 'Class 8', 'Class 10', 'Class 11', 'Class 12'
  classNumber: number; // 5, 8, 10, 11, 12
  board: 'CBSE' | 'ICSE' | 'UP_BOARD' | 'BIHAR_BOARD' | 'OTHER';
  stream?: AcademicStream; // For Class 10+
  targetExam?: string;
  academicInterests: string[];
  schoolName?: string;
  districtId: string;
  districtName: string;
  stateId: string;
  stateName: string;
  studentType: 'DIGITAL_ONLY' | 'LIBRARY_APP' | 'LIBRARY_MANUAL' | 'HOME_TUITION';
  activeLibraryId?: string;
  activeLibraryName?: string;
  activeTeacherId?: string;
  activeTeacherName?: string;
}

export interface EntitlementEvaluationResult {
  hasAccess: boolean;
  accessState: ExamAccessState;
  reason: string;
  matchingSubscription?: StudentSubscription;
  daysRemaining?: number;
  isExpiringSoon?: boolean;
}

export interface ExpiryNotification {
  id: string;
  studentId: string;
  subscriptionId: string;
  productName: string;
  type: '7_DAYS' | '3_DAYS' | '1_DAY' | 'EXPIRED';
  message: string;
  daysRemaining: number;
  timestamp: string;
  isRead: boolean;
}
