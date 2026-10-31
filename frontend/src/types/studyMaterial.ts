// FOCUSPOINT Study Material TypeScript Type Definitions

export type StudyMaterialCategory =
  | 'ACADEMIC'
  | 'COMPETITIVE_EXAM'
  | 'GOVERNMENT_EXAM'
  | 'PRACTICE_SETS'
  | 'CLASS_EXAM_PRACTICE'
  | 'REVISION_MATERIAL'
  | 'QUESTION_BANKS'
  | 'SAMPLE_PAPERS'
  | 'PREVIOUS_YEAR_PAPERS'
  | 'NOTES'
  | 'WORKSHEETS'
  | 'MOCK_TESTS';

export type StudyMaterialStage =
  | 'PRE_PRIMARY'
  | 'PRIMARY'
  | 'MIDDLE'
  | 'SECONDARY'
  | 'SENIOR_SECONDARY'
  | 'GENERAL';

export type DifficultyLevelId = 'EASY' | 'MEDIUM' | 'HARD' | 'EXEMPLAR';

export interface StudyMaterialVersion {
  versionId: string;
  versionNumber: string; // e.g. 'v1.0', 'v1.1'
  fileUrl: string;
  fileName: string;
  fileSize: string;
  pageCount: number;
  uploadedAt: string;
  uploadedBy: string;
  changeLog: string;
  checksum?: string;
}

export interface StudyMaterialPricingRule {
  id: string;
  materialId?: string; // specific material or undefined for global tier
  level: 'PAN_INDIA' | 'STATE' | 'DISTRICT' | 'LIBRARY' | 'TEACHER' | 'STUDENT';
  targetEntityId?: string; // e.g. 'ghazipur', 'varanasi', 'student-id'
  targetEntityName?: string;
  price: number;
  currency: string;
  isActive: boolean;
  notes?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface StudyMaterialOffer {
  id: string;
  title: string;
  code: string; // Coupon code e.g. 'EXAMBOOST50'
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number; // e.g. 20 (%) or 50 (INR)
  minOrderValue?: number;
  applicableClasses?: string[];
  applicableCategories?: string[];
  applicableDistrictIds?: string[];
  validFrom: string;
  validUntil: string;
  maxUsageCount?: number;
  usedCount: number;
  isActive: boolean;
  stackable: boolean;
}

export interface StudyMaterialDownloadPolicy {
  id: string;
  level: 'PAN_INDIA' | 'DISTRICT' | 'CLASS';
  targetId?: string; // district name/code or class
  targetName?: string;
  monthlyLimit: number; // default 3
  allowCarryOver: boolean;
  allowBonusDownloadsForPaid: boolean;
  isActive: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface PreviousYearPaperSection {
  name: string;
  questionCount: number;
  marks: number;
  negativeMarks: number;
}

export interface PreviousYearPaperMetadata {
  examId: string;
  examName: string;
  examCategory: string; // 'SSC' | 'RAILWAY' | 'STATE_EXAMS' | 'POLICE' | 'ENGINEERING' | 'MEDICAL' | 'TEACHING' | 'ADMISSION_EXAMS' | etc.
  conductingAuthority: string; // 'NTA', 'Staff Selection Commission', 'UPPRPB', etc.
  examYear: number; // 2024, 2023, 2022
  tierOrStage: string; // 'Tier-1', 'Tier-2', 'Prelims', 'Mains', 'Paper-1'
  examDate?: string; // '2024-09-12'
  shift: string; // 'Shift-1 (Morning)', 'Shift-2 (Afternoon)', 'Shift-3 (Evening)'
  shiftTiming?: string; // '09:00 AM - 10:00 AM'
  paperCode: string; // 'Set-A', 'Code-4A-2024', etc.
  language: string; // 'Bilingual (Hindi + English)', 'English Only', 'Hindi Only'
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  negativeMarking: number;
  sections: PreviousYearPaperSection[];
  masterPaperPdfUrl: string;
  masterPaperFileName: string;
  masterPaperFileSize?: string;
  officialAnswerKeyUrl?: string;
  hasOfficialAnswerKey: boolean;
  answerKeyGrid?: Record<number, string>; // e.g. { 1: 'A', 2: 'C', 3: 'B' }
  hasStepByStepSolutions: boolean;
  solvedSolutionsPdfUrl?: string;
  videoSolutionUrl?: string;
  isCbtAvailable: boolean; // candidate can take this exact PYQ as live online test
  linkedCbtMockTestId?: string;
  ocrConfidenceScore?: number; // e.g. 98.6
  aiDigitizedDate?: string;
  plagiarismAndCopyrightCertified: boolean;
  watermarked: boolean;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  category: StudyMaterialCategory;
  targetClass: string; // 'Class 7', 'Class 10', 'Nursery', etc.
  educationStage: StudyMaterialStage;
  subject: string; // 'Physics', 'Mathematics', etc.
  stream?: 'Science' | 'Commerce' | 'Arts' | 'General';
  academicSession: string; // '2026-2027 (Current)'
  language: string; // 'Bilingual (English + Hindi)', etc.
  difficultyLevel: DifficultyLevelId;
  tags: string[];
  thumbnailUrl?: string;
  previewPdfUrl?: string;
  previewPageCount?: number;
  fullPdfUrl: string;
  fileName: string;
  fileSize: string;
  pageCount: number;
  currentVersion: string;
  versionHistory: StudyMaterialVersion[];
  isPaid: boolean;
  basePrice: number; // 0 for free
  specialOfferPercentage?: number; // e.g. 20% off
  specialOfferLabel?: string; // e.g. 'Early Bird Discount'
  isFeatured?: boolean;
  isVerified: boolean;
  verifiedBy?: string;
  totalDownloads: number;
  totalPurchases: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  requiresSubjectTutorUnlock?: boolean; // specialized tutor unlock requirement
  targetExams?: string[]; // e.g. ['CHS', 'NAVODAYA', 'IIT_JEE', 'NEET']
  targetGovernmentExams?: string[]; // e.g. ['UP_POLICE', 'SSC_GD']
  pyqMetadata?: PreviousYearPaperMetadata;
}

export interface StudyMaterialAccessEvaluation {
  isAllowed: boolean;
  reason: 'CLASS_MISMATCH' | 'SUBJECT_LOCK' | 'NEEDS_PURCHASE' | 'DOWNLOAD_LIMIT_REACHED' | 'OK';
  message: string;
  classMatch: boolean;
  requiresPurchase: boolean;
  isSubjectLocked: boolean;
  price: number;
  originalPrice: number;
  discountAmount: number;
  appliedOffer?: StudyMaterialOffer;
  hasPurchased: boolean;
  canDownload: boolean;
}

export interface StudyMaterialPurchase {
  id: string;
  studentId: string;
  studentName: string;
  materialId: string;
  materialTitle: string;
  targetClass: string;
  subject: string;
  basePrice: number;
  discountAmount: number;
  couponCode?: string;
  finalAmountPaid: number;
  paymentStatus: 'PAID' | 'FAILED' | 'PENDING';
  paymentMethod: string;
  transactionReference: string;
  purchaseDate: string;
  invoiceId?: string;
  districtId?: string;
  districtName?: string;
}

export interface StudyMaterialDownloadRecord {
  id: string;
  studentId: string;
  studentName: string;
  materialId: string;
  materialTitle: string;
  targetClass: string;
  subject: string;
  fileVersion: string;
  downloadDate: string;
  monthKey: string; // 'YYYY-MM', e.g. '2026-09'
  wasPaidDownload: boolean;
  quotaConsumed: boolean;
  deviceIp?: string;
}

export interface DownloadAllowance {
  studentId: string;
  monthKey: string;
  monthLabel: string;
  allowedMonthlyQuota: number;
  usedDownloads: number;
  remainingDownloads: number;
  bonusPaidDownloads: number;
  canDownloadFree: boolean;
  policySource: 'PAN_INDIA_DEFAULT' | 'DISTRICT_POLICY' | 'CUSTOM_ADMIN';
  nextResetDate: string;
}
