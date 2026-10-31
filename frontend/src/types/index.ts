// FOCUSPOINT Global TypeScript Type Definitions

export * from './location';
export * from './superAdmin';
export * from './demo';
export * from './studyMaterial';
export * from './teacherRegistrationPricing';
export * from './librarySubscriptionPricing';
export * from './academicIntelligence';
export * from './operator';
export * from './revenueStatement';
import { LibrarySubscription } from './librarySubscriptionPricing';

export type UserRole = 
  | 'STUDENT'
  | 'TEACHER'
  | 'LIBRARY_STUDENT'
  | 'LIBRARY_OWNER'
  | 'DISTRICT_ADMIN'
  | 'SUPER_ADMIN'
  | 'STUDY_MATERIAL_OPERATOR'
  | 'OPERATOR'
  | 'student'
  | 'teacher'
  | 'library_student'
  | 'library_owner'
  | 'district_admin'
  | 'super_admin'
  | 'study_material_operator'
  | 'operator';

export type VerificationStatus = 
  | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  | 'pending' | 'approved' | 'verified' | 'rejected' | 'suspended' | 'active';

export type BookingStatus = 
  | 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
  | 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'expired';

export type PaymentStatus = 
  | 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE' | 'FAILED' | 'REFUNDED'
  | 'paid' | 'pending' | 'partial' | 'overdue' | 'failed' | 'refunded';

export type AttendanceStatus = 
  | 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'
  | 'NOT_STARTED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'INCOMPLETE' | 'CANCELLED'
  | 'present' | 'absent' | 'late' | 'leave'
  | 'not_started' | 'checked_in' | 'checked_out' | 'incomplete' | 'cancelled';

export type TutorRequestStatus = 
  | 'SUBMITTED' | 'UNDER_REVIEW' | 'TEACHER_ALLOTTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  | 'submitted' | 'reviewing' | 'teacher_assigned' | 'demo_scheduled' | 'active' | 'completed' | 'cancelled';

export type SeatStatus = 
  | 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'
  | 'available' | 'occupied' | 'maintenance' | 'reserved';

export interface District {
  id: string;
  name: string;
  state?: string;
  code?: string;
  isActive?: boolean;
  activeAdminId?: string;
  activeAdminName?: string;
  adminName?: string;
  totalStudents?: number;
  totalTeachers?: number;
  totalLibraries?: number;
  totalBookings?: number;
}

export interface User {
  id: string;
  userId?: string;
  name: string;
  email: string;
  mobile?: string;
  phone?: string;
  role: UserRole;
  countryId?: string;
  stateId?: string;
  stateName?: string;
  state?: string;
  districtId?: string;
  districtName?: string;
  district?: string;
  localityId?: string;
  localityName?: string;
  city?: string;
  areaId?: string;
  areaName?: string;
  area?: string;
  address?: string;
  pincode?: string;
  avatarUrl?: string;
  avatar?: string;
  createdAt?: string;
  isActive?: boolean;
  status?: 'active' | 'suspended' | 'pending' | 'deactivated' | 'inactive';
  accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'INACTIVE' | 'INVITED' | 'PENDING_SETUP' | 'LOCKED' | 'ARCHIVED' | 'active' | 'suspended' | 'pending' | 'deactivated' | 'inactive';
  authorizedDistrict?: string;
  authorizedState?: string;
  lastLogin?: string;
  lastLogout?: string;
  parentName?: string;
  parentPhone?: string;
  grade?: string;
  schoolName?: string;
  targetExam?: string;
  bio?: string;
  whatsappNumber?: string;
  alternatePhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  businessEntityType?: string;
  designation?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  experienceYears?: number;
  gender?: string;
  dateOfBirth?: string;
  operatorId?: string;
  permissions?: string[];
}

export interface Student extends User {
  role: any;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  grade?: string;
  currentClass?: string;
  schoolName?: string;
  board?: string;
  activeTutorId?: string;
  activeTutorName?: string;
  activeLibraryBookingId?: string;
  parentName?: string;
  parentPhone?: string;
  targetExam?: string;
}

export interface TeacherDocumentItem {
  id?: string;
  name: string;
  type?: string;
  fileSize?: string;
  uploadedAt: string;
  status: 'NOT_UPLOADED' | 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REPLACEMENT_REQUIRED' | 'pending' | 'verified' | 'rejected' | 'not_uploaded';
  rejectionReason?: string;
  fileUrl?: string;
}

export interface TeacherBankAccount {
  accountHolder?: string;
  accountHolderName?: string;
  bankName: string;
  accountNumber: string;
  ifsc?: string;
  ifscCode?: string;
  upiId?: string;
  isConnected?: boolean;
  isVerified?: boolean;
  connectedAt?: string;
}

export interface TeacherExperienceRecord {
  id: string;
  organization: string;
  position?: string;
  role?: string;
  subject?: string;
  startDate: string;
  endDate?: string;
  currentlyWorking?: boolean;
  isCurrent?: boolean;
  responsibilities?: string;
  description?: string;
  verifiedStatus?: 'verified' | 'pending';
}

export interface TeacherPayout {
  id: string;
  teacherId: string;
  month: string;
  amount: number;
  studentsCount: number;
  date: string;
  paymentMethod: string;
  bankAccountMasked?: string;
  utr?: string;
  providerReference?: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'reversed';
  failureReason?: string;
}

export interface Teacher extends User {
  role: any;
  avatarUrl?: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  highestQualification?: string;
  qualification?: string;
  degree?: string;
  university?: string;
  passingYear?: number;
  experienceYears?: number;
  subjects: string[];
  classes?: string[];
  specializations?: string[];
  boards?: string[];
  teachingMode?: 'OFFLINE_HOME' | 'ONLINE' | 'BOTH' | string;
  teachingModes?: string[];
  expectedFeeMonthly?: number;
  monthlyFee?: number;
  hourlyRate?: number;
  feeRange?: string;
  availabilityDays?: string[];
  availabilitySlots?: string[];
  areasServed?: string[];
  preferredAreas?: string[];
  bio?: string;
  rating?: number;
  reviewsCount?: number;
  totalReviews?: number;
  assignedStudentsCount?: number;
  bankAccount?: TeacherBankAccount;
  experienceRecords?: TeacherExperienceRecord[];
  documentsUploaded?: {
    idProof?: string | TeacherDocumentItem;
    degreeCertificate?: string | TeacherDocumentItem;
    experienceLetter?: string | TeacherDocumentItem;
    degree?: string | TeacherDocumentItem;
    experience?: string | TeacherDocumentItem;
    [key: string]: string | TeacherDocumentItem | undefined;
  };
  registrationFee?: number;
  registrationPaymentStatus?: 'PAID' | 'PAYMENT_PENDING' | 'PAYMENT_FAILED' | 'FREE' | 'REFUNDED';
  registrationPaymentId?: string;
  registrationPricingRuleId?: string;
  registrationPricingScope?: string;
  registrationDiscount?: number;
  registrationCoupon?: string;
  registrationFinalAmount?: number;
  registrationPaidAt?: string;
  accreditationBadges?: string[];
  policeClearanceCode?: string;
  biometricToken?: string;
  teachingRadiusKm?: number;
}

export interface LibraryOwner extends User {
  role: any;
  verificationStatus: VerificationStatus;
  businessName?: string;
  libraryId?: string;
}

export interface LibraryStudent {
  id: string;
  libraryId: string;
  name: string;
  mobile: string;
  phone?: string;
  guardianName?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  referenceId: string;
  seatNumber: string;
  shiftId?: string;
  shiftName?: string;
  shift?: string;
  joiningDate: string;
  expiryDate?: string;
  expiryStatus?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | string;
  monthlyFee: number;
  feeStatus?: PaymentStatus;
  attendanceRate?: number;
  isOnlineUser?: boolean;
  userId?: string;
  avatarUrl?: string;
  avatar?: string;
  whatsappNotified?: boolean;
}

export interface LibraryStudentRecord {
  id: string;
  userId?: string;
  name: string;
  mobile: string;
  email: string;
  avatarUrl?: string;
  libraryId: string;
  libraryName: string;
  stateName?: string;
  district: string;
  districtName?: string;
  locality: string;
  localityName?: string;
  seatNumber: string;
  shiftName: string;
  shiftTiming?: string;
  bookingChannel: 'APP_ONLINE' | 'COUNTER_MANUAL';
  monthlyFee: number;
  paidAmount: number;
  dueAmount: number;
  feeStatus: 'PAID' | 'PARTIAL' | 'OVERDUE';
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED';
  joiningDate: string;
  validUntil: string;
  attendanceRate: number;
  bookedBy: string;
  targetExam?: string;
  parentPhone?: string;
  paymentMethod?: string;
  lastPaymentDate?: string;
  lastReceiptNumber?: string;
}

export interface LibraryExpense {
  id: string;
  libraryId: string;
  title: string;
  category: 'electricity' | 'rent' | 'wifi' | 'staff' | 'maintenance' | 'water' | 'miscellaneous' | string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | string;
  receiptUrl?: string;
  receiptName?: string;
  notes?: string;
  description?: string;
  createdAt: string;
}

export interface LibrarySettlement {
  id: string;
  libraryId: string;
  month: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  otherDeductions: number;
  netAmount: number;
  settlementDate?: string;
  expectedDate: string;
  status: 'pending' | 'processing' | 'settled' | 'failed' | 'reversed' | 'PAID' | string;
  payoutMethod: string;
  bankAccountMasked: string;
  utr?: string;
  transactionReference?: string;
  transactionRef?: string;
  paidAt?: string;
  paymentSource: string;
  createdAt: string;
}

export interface LibraryNotificationSettings {
  whatsappOnExpiry3Days: boolean;
  whatsappOnExpired: boolean;
  whatsappOnPaymentReceipt: boolean;
  whatsappOnBookingConfirmation: boolean;
  inAppAlerts: boolean;
  dailyAttendanceSummary: boolean;
  settlementAlerts: boolean;
}

export interface LibraryShift {
  id?: string;
  libraryId?: string;
  name: string;
  startTime: string;
  endTime: string;
  monthlyPrice?: number;
  price?: number;
  isActive?: boolean;
}

export interface ShiftSlotOccupancy {
  isBooked: boolean;
  studentName?: string;
  studentPhone?: string;
  bookingId?: string;
  startDate?: string;
  endDate?: string;
}

export interface LibrarySeatShiftOccupancy {
  morning?: ShiftSlotOccupancy;
  afternoon?: ShiftSlotOccupancy;
  evening?: ShiftSlotOccupancy;
  isFullDay?: boolean;
}

export interface LibrarySeat {
  id?: string;
  libraryId?: string;
  seatNumber: string;
  status: SeatStatus;
  assignedStudentId?: string;
  assignedStudentName?: string;
  assignedShiftId?: string;
  shiftOccupancy?: LibrarySeatShiftOccupancy;
}

export interface LibraryBankAccount {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  isConnected: boolean;
  isVerified: boolean;
  connectedAt?: string;
}

export interface Library {
  id: string;
  ownerId: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerAvatar?: string;
  name: string;
  description: string;
  countryId?: string;
  stateId?: string;
  stateName?: string;
  state?: string;
  districtId?: string;
  districtName?: string;
  district?: string;
  localityId?: string;
  localityName?: string;
  city?: string;
  areaId?: string;
  areaName?: string;
  area: string;
  address: string;
  pincode?: string;
  status?: string;
  createdAt?: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  totalSeats: number;
  availableSeats?: number;
  monthlyStartingPrice?: number;
  monthlyFee?: number;
  hourlyRate?: number;
  facilities: string[];
  timings?: string;
  images?: string[];
  rating?: number;
  reviewsCount?: number;
  rules?: string[] | string;
  shifts: LibraryShift[];
  seats?: LibrarySeat[];
  bankAccount?: LibraryBankAccount;
  premisesKyc?: {
    electricityBill?: TeacherDocumentItem;
    tradeLicense?: TeacherDocumentItem;
    fireSafetyNoc?: TeacherDocumentItem;
    [key: string]: TeacherDocumentItem | undefined;
  };
  subscriptionId?: string;
  subscription?: LibrarySubscription;
  subscriptionPlanId?: string;
  subscriptionPlanName?: string;
  subscriptionBillingCycle?: 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY' | 'CUSTOM';
  subscriptionStatus?: string;
  subscriptionStartDate?: string;
  subscriptionExpiryDate?: string;
  subscriptionPaidAmount?: number;
  isSubscriptionFree?: boolean;
  autoRenew?: boolean;
  accreditationBadges?: string[];
  iotSensors?: {
    decibels: number;
    temperatureC: number;
    wifiPingMs: number;
    powerBackupHealth: number;
    biometricTurnstileOnline: boolean;
  };
  aiSafetyScore?: number;
  sha3AuditSeal?: string;
  managerContact?: {
    name: string;
    phone: string;
    emergencyHotline: string;
  };
  floorplanConfig?: {
    rows: number;
    columns: number;
    silentPods: number;
    acZones: number;
  };
  payoutData?: {
    grossMonthlyRevenue: number;
    platformCommission: number;
    tdsDeducted: number;
    netPayout: number;
    lastSettlementDate: string;
  };
}

export interface TutorRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentMobile?: string;
  studentPhone?: string;
  countryId?: string;
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  district?: string;
  localityId?: string;
  localityName?: string;
  areaId?: string;
  areaName?: string;
  area: string;
  address: string;
  pincode?: string;
  className?: string;
  grade?: string;
  subjects: string[];
  board?: string;
  learningObjective?: string;
  preferredDays?: string[];
  preferredTime?: string;
  frequency?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetMonthly?: number;
  preferredTeacherId?: string;
  preferredTeacherName?: string;
  teacherExperienceReq?: string;
  additionalNotes?: string;
  status: TutorRequestStatus;
  allottedTeacherId?: string;
  allottedTeacherName?: string;
  assignedTeacherId?: string;
  assignedTeacherName?: string;
  allotmentDate?: string;
  allotmentNotes?: string;
  submittedAt?: string;
  demoDate?: string;
  demoTime?: string;
  demoMode?: 'HOME_VISIT' | 'ONLINE' | 'STUDENT_HOME' | string;
  demoNotes?: string;
  demoFeedback?: 'PENDING' | 'SUCCESSFUL' | 'STUDENT_REJECTED' | 'TEACHER_UNAVAILABLE';
  paymentStatus?: 'PAID' | 'PENDING' | 'FAILED';
  paymentMethod?: string;
  paymentAmount?: number;
  originalAmount?: number;
  discountAmount?: number;
  appliedOfferCode?: string;
  commissionRate?: number;
  commissionAmount?: number;
  policySource?: 'CUSTOM_OVERRIDE' | 'DISTRICT_COMMON' | 'DEFAULT' | string;
  transactionId?: string;
  paidDate?: string;
}

export interface TutorMatchScore {
  teacher: Teacher;
  totalScore: number;
  tier: 'BEST_MATCH' | 'STRONG_MATCH' | 'FAIR_MATCH' | 'LOW_MATCH';
  breakdown: {
    subjectScore: number; // max 30
    gradeScore: number; // max 25
    localityScore: number; // max 20
    modeScore: number; // max 15
    budgetScore: number; // max 10
  };
  matchedSubjects: string[];
  isSameLocality: boolean;
  activeLoad: number;
}

export interface TeacherKYCChecklist {
  aadhaarVerified: boolean;
  degreeVerified: boolean;
  experienceVerified: boolean;
  backgroundCheckPassed: boolean;
  inspectorRemarks?: string;
  certifiedBy?: string;
  certifiedAt?: string;
}

export type HomeTuitionEnrollmentStatus = 
  | 'ACTIVE' 
  | 'TRIAL_DEMO' 
  | 'PENDING_ALLOCATION' 
  | 'ON_HOLD' 
  | 'SUSPENDED';

export interface HomeTuitionStudentRecord {
  id: string;
  userId?: string;
  rollNumber: string;
  name: string;
  email: string;
  mobile: string;
  avatarUrl?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string;
  parentName: string;
  parentPhone: string;
  parentRelation: 'Father' | 'Mother' | 'Guardian';
  countryId?: string;
  stateId?: string;
  stateName: string;
  districtId?: string;
  districtName: string;
  localityId?: string;
  localityName: string;
  areaName?: string;
  pincode: string;
  address: string;
  grade: string;
  board: string;
  stream?: string;
  schoolName: string;
  targetExam: string;
  medium: 'English' | 'Hindi' | 'Bilingual';
  enrollmentStatus: HomeTuitionEnrollmentStatus;
  subjects: string[];
  assignedTutorId?: string;
  assignedTutorName?: string;
  assignedTutorPhone?: string;
  assignedTutorSpecialization?: string;
  schedule: string;
  sessionFrequency: string;
  mode: 'OFFLINE_HOME_VISIT' | 'ONLINE_HYBRID' | 'ONLINE_1ON1';
  attendanceRate: number;
  totalClassesHeld: number;
  classesAttended: number;
  syllabusProgress: number;
  averageScore: number;
  academicPace: 'ACCELERATED' | 'ON_TRACK' | 'NEEDS_SUPPORT';
  weakTopics?: string[];
  strongTopics?: string[];
  tutorRating: number;
  lastSessionDate: string;
  monthlyFee: number;
  feeStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  lastPaymentDate?: string;
  nextDueDate?: string;
  transactionId?: string;
  escrowSecured: boolean;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface LibraryInspectionChecklist {
  fireSafetyValid: boolean;
  cctvFunctional: boolean;
  powerBackupVerified: boolean;
  cleanSanitation: boolean;
  wifiSpeedAdequate: boolean;
  ergonomicSeating: boolean;
  inspectorRemarks?: string;
  inspectedBy?: string;
  inspectedAt?: string;
}

export interface TeacherAssignment {
  id: string;
  tutorRequestId?: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  teacherId: string;
  teacherName: string;
  teacherPhone?: string;
  districtId?: string;
  district?: string;
  area?: string;
  locality?: string;
  subjects: string[];
  className?: string;
  grade?: string;
  schedule: string;
  monthlyFee: number;
  startDate?: string;
  address?: string;
  teachingMode?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'active' | 'paused' | 'completed';
}

export interface LibraryBooking {
  id: string;
  studentId?: string;
  userId?: string;
  studentName: string;
  studentMobile?: string;
  studentPhone?: string;
  libraryId: string;
  libraryName: string;
  districtId?: string;
  district?: string;
  shiftId?: string;
  shiftName?: string;
  shift?: string;
  seatNumber: string;
  startDate: string;
  endDate: string;
  amount?: number;
  totalAmount?: number;
  creditedAmount?: number;
  platformCut?: number;
  studentAvatar?: string;
  rollNumber?: string;
  guardianName?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'UPI' | 'Card' | 'NetBanking' | 'Cash' | 'Online' | string;
  status: BookingStatus;
  bookingDate?: string;
}

export interface AttendanceRecord {
  id: string;
  userId?: string;
  userName?: string;
  role?: string;
  type: 'TUTOR' | 'LIBRARY' | 'HOME_TUITION' | 'tutor_session' | 'library_checkin' | string;
  serviceType?: 'HOME_TUITION' | 'LIBRARY';
  referenceId?: string;
  targetId?: string;
  targetName?: string;
  entityId?: string;
  entityName?: string;
  sourceType?: string;
  source?: 'STUDENT_QR' | 'TEACHER_PORTAL' | 'LIBRARY_OWNER_PORTAL' | 'ADMIN' | 'SYSTEM' | 'MANUAL' | string;
  studentId?: string;
  studentName?: string;
  studentAvatar?: string;
  teacherId?: string;
  teacherName?: string;
  teacherAvatar?: string;
  libraryId?: string;
  libraryName?: string;
  bookingId?: string;
  sessionId?: string;
  duration?: string | number;
  date: string;
  time?: string;
  checkIn?: string;
  checkOut?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  notes?: string;
  remarks?: string;
  verifiedBy?: string;
  district?: string;
  parentPhone?: string;
  parentName?: string;
  parentNotifiedAt?: string;
  notificationStatus?: 'Queued' | 'Sending' | 'Sent' | 'Delivered' | 'Failed' | 'Not Connected' | 'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  notificationLog?: Array<{
    id: string;
    timestamp: string;
    channel: 'WHATSAPP' | 'SMS' | 'IN_APP';
    status: 'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
    message: string;
    recipient: string;
  }>;
}

export interface StudentActiveAttendanceService {
  serviceType: 'HOME_TUITION' | 'LIBRARY';
  id: string; // bookingId or requestId
  title: string;
  subtitle: string;
  teacherId?: string;
  teacherName?: string;
  teacherPhoto?: string;
  subject?: string;
  libraryId?: string;
  libraryName?: string;
  libraryPhoto?: string;
  shiftName?: string;
  seatNumber?: string;
  scheduledTime?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  todayAttendance?: AttendanceRecord | null;
  bookingId?: string;
  paymentStatus?: 'PAID' | 'PENDING' | 'OVERDUE' | 'FAILED';
  feeStatus?: 'PAID' | 'UNPAID' | 'RESTRICTED';
  activeMonth?: string;
  validFrom?: string;
  validUntil?: string;
  attendanceAllowed?: boolean;
  restrictionReason?: string;
  pendingInvoiceId?: string;
  pendingAmount?: number;
}

export interface PersonalQrPass {
  id: string;
  qrId: string;
  token: string;
  studentId: string;
  studentName: string;
  studentPhoto?: string;
  studentMobile: string;
  parentPhone?: string;
  parentName?: string;
  district: string;
  serviceType: 'HOME_TUITION' | 'LIBRARY' | 'UNIVERSAL';
  activeServices: StudentActiveAttendanceService[];
  issuedAt: string;
  validFrom: string;
  validUntil: string;
  activeMonth: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  version: number;
  scanUrl: string;
  attendanceAllowed: boolean;
  restrictionReason?: string;
  pendingInvoice?: {
    id: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    description: string;
  };
}

export interface AttendanceQrPayload {
  version: string;
  serviceType: 'HOME_TUITION' | 'LIBRARY' | 'UNIVERSAL';
  facilityId: string;
  facilityName: string;
  qrId: string;
  expiresAt?: string;
}

export interface QrValidationResult {
  valid: boolean;
  serviceType?: 'HOME_TUITION' | 'LIBRARY' | 'UNIVERSAL';
  facilityId?: string;
  facilityName?: string;
  qrId?: string;
  pass?: PersonalQrPass;
  matchingServices?: StudentActiveAttendanceService[];
  attendanceAllowed?: boolean;
  restrictionReason?: string;
  pendingInvoice?: {
    id: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    description: string;
  };
  error?: string;
  errorCode?: 
    | 'INVALID_QR' 
    | 'SERVICE_MISMATCH' 
    | 'EXPIRED_BOOKING' 
    | 'NO_ACTIVE_SERVICE'
    | 'UNAUTHENTICATED'
    | 'CROSS_STUDENT_PROHIBITED'
    | 'UNPAID_FEE'
    | 'SERVICE_SUSPENDED';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  userName: string;
  type: 'TUTOR_FEE' | 'LIBRARY_FEE' | string;
  referenceId: string;
  description: string;
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  category?: 'BOOKING' | 'APPROVAL' | 'PAYMENT' | 'ATTENDANCE' | 'SYSTEM' | 'ADMIN' | string;
  type?: 'booking' | 'tutor' | 'payment' | 'system' | string;
  isRead: boolean;
  link?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  district?: string;
  category: 'Billing' | 'Technical' | 'Tutor Assignment' | 'Library Booking' | 'Account' | 'Other' | 'tutor' | 'library' | 'payment' | 'account' | 'seat' | 'student' | 'verification' | 'settlement' | 'other' | string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED' | 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed' | 'assigned';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'low' | 'medium' | 'high' | 'urgent';
  createdAt?: string;
  updatedAt?: string;
  assignedAgentName?: string;
  attachments?: string[];
  rating?: number;
  feedback?: string;
  slaStatus?: 'within_sla' | 'at_risk' | 'breached';
  responses?: {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    message: string;
    timestamp: string;
    attachments?: string[];
  }[];
}

export interface AuditLog {
  id: string;
  adminId?: string;
  adminName?: string;
  adminRole?: 'DISTRICT_ADMIN' | 'SUPER_ADMIN' | string;
  actorName?: string;
  actorRole?: string;
  district?: string;
  action: string;
  details?: string;
  entityType?: 'TEACHER' | 'LIBRARY' | 'STUDENT' | 'TUTOR_REQUEST' | 'DISTRICT' | 'DISTRICT_ADMIN' | string;
  entityId?: string;
  districtId?: string;
  districtName?: string;
  previousState?: string;
  newState?: string;
  timestamp: string;
  ipAddress?: string;
}

export interface PaymentTransaction {
  id: string;
  invoiceId?: string;
  userId: string;
  userName: string;
  userRole?: UserRole;
  districtId?: string;
  amount: number;
  paymentMethod?: string;
  method?: string;
  transactionReference?: string;
  transactionRef?: string;
  type?: 'TUTOR_FEE' | 'LIBRARY_FEE' | string;
  description?: string;
  status: string;
  timestamp?: string;
  date?: string;
}

export interface DistrictExpense {
  id: string;
  district: string;
  area: string;
  locality?: string;
  category: 'Advertising' | 'Marketing' | 'Travel' | 'Salary' | 'Office Expenses' | 'Electricity' | 'Internet' | 'Equipment' | 'Maintenance' | 'Other Operational Expenses';
  amount: number;
  date: string;
  description: string;
  remarks?: string;
  voucherNo?: string;
  receiptUrl?: string;
  recordedBy?: string;
  createdAt: string;
}

export interface CommissionConfig {
  id: string;
  district: string;
  defaultLibraryCommissionRate: number; // e.g. 10 (%)
  defaultTuitionCommissionRate: number; // e.g. 15 (%)
  libraryOverrides?: Record<string, number>; // libraryId -> rate
  teacherOverrides?: Record<string, number>; // teacherId -> rate
  updatedAt: string;
  updatedBy?: string;
}

export interface TeacherDisbursementRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherPhone?: string;
  district: string;
  area: string;
  month: string;
  scheduledDate: string; // e.g. 30th of month
  grossEarnings: number;
  commissionRate: number;
  commissionDeducted: number;
  netPayable: number;
  status: 'PENDING' | 'DUE' | 'PROCESSING' | 'PAID' | 'FAILED' | 'COMMISSION_DEDUCTED';
  paidAt?: string;
  transactionRef?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface AnnouncementCircular {
  id: string;
  title: string;
  description?: string;
  content?: string;
  type: 'General Announcement' | 'Circular' | 'Urgent Alert' | 'Important Notice' | 'Payment Notice' | 'System Update';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  sender?: string;
  senderRole?: string;
  authorName?: string;
  targetDistrict: string; // e.g. 'Ghazipur' or 'ALL'
  targetAudience?: 'ALL' | 'DISTRICT_ADMINS' | 'TEACHERS' | 'LIBRARIES' | 'STUDENTS';
  date?: string;
  createdAt: string;
  isRead?: boolean;
  isUrgent?: boolean;
  isAcknowledged?: boolean;
  replies?: {
    id?: string;
    senderId?: string;
    senderName?: string;
    senderRole?: string;
    authorName?: string;
    authorRole?: string;
    replyText?: string;
    message?: string;
    timestamp?: string;
    createdAt?: string;
  }[];
}

export interface ManualSeatBookingRecord {
  id: string;
  libraryId: string;
  libraryName: string;
  area?: string;
  seatNumber: string;
  studentId?: string;
  studentName: string;
  studentPhone?: string;
  startDate?: string;
  endDate?: string;
  shiftName?: string;
  shiftHours?: string;
  shift?: any;
  monthlyFee?: number;
  paidAmount?: number;
  dueAmount?: number;
  bookingStatus?: 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  bookedByRole?: 'LIBRARY_OWNER' | 'DISTRICT_ADMIN';
  bookedByName?: string;
  bookingDate?: string;
  feeAmount?: number;
  paymentMethod?: 'UPI' | 'CASH' | string;
  paymentStatus?: 'PAID' | string;
  bookedByAdminId?: string;
  district?: string;
  createdAt: string;
}

export interface LeftTeacherRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  phone?: string;
  email?: string;
  subject?: string;
  area?: string;
  district: string;
  joiningDate?: string;
  leavingDate?: string;
  exitDate?: string;
  reason?: string;
  exitReason?: string;
  previousStudentsCount?: number;
  totalEarnings?: number;
  pendingDues?: number;
  settlementStatus?: 'SETTLED' | 'PENDING_CLEARANCE' | 'DISPUTED';
  clearanceStatus?: 'CLEARED' | 'PENDING' | 'SETTLED' | 'PENDING_CLEARANCE' | 'DISPUTED';
  recordedByAdminId?: string;
  remarks?: string;
  clearanceNotes?: string;
}

export * from './teacherRegistrationPricing';
export * from './librarySubscriptionPricing';
export type {
  ExpenseClaimStatus,
  FinanceExpenseCategory,
  DistrictExpenseCategory,
  ExpenseAttachment,
  ExpenseTimelineEvent,
  DistrictExpenseClaim,
  TeacherPayrollStatus,
  TeacherPayrollItem,
  LibrarySettlementStatus,
  LibrarySettlementLineItem,
  LibrarySettlementRecord,
  PayeeType,
  PaymentItemType,
  PaymentQueueItem,
  SettlementBatch,
  MonthlyClosingRecord,
  FinancialAuditLog,
  FinanceSettingsConfig,
  OfficialDocument
} from './finance';
export * from './document';


