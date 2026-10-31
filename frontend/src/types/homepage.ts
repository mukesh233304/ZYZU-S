/**
 * FOCUSPOINT — Homepage Premium Experience Types
 * Clean interfaces supporting frontend-first architecture ready for future InsForge backend.
 */

export type OfferServiceType = 
  | 'ALL' 
  | 'HOME_TUITION' 
  | 'SELF_STUDY_LIBRARY'
  | 'STUDY_MATERIAL'
  | 'MOCK_TEST'
  | 'SUBSCRIPTION'
  | 'DIGITAL_STORE'
  | 'mock_tests'
  | 'study_materials'
  | 'digital_library'
  | 'home_tuition'
  | 'complete_package'
  | 'subscription';

export type OfferScope = 'PAN_INDIA' | 'STATE' | 'DISTRICT' | 'LOCALITY' | 'INDIVIDUAL';
export type OfferDiscountType = 'PERCENTAGE' | 'FIXED';
export type OfferStatus = 
  | 'DRAFT'
  | 'SCHEDULED' 
  | 'LIVE' 
  | 'EXPIRING_SOON' 
  | 'EXPIRED' 
  | 'PAUSED' 
  | 'DISABLED'
  | 'ARCHIVED';

export type CouponStatus = OfferStatus;

export interface CouponValidationParams {
  code?: string;
  couponCode?: string;
  service?: OfferServiceType | string;
  productServiceType?: OfferServiceType | string;
  productType?: string;
  productId?: string;
  amount?: number;
  purchaseAmount?: number;
  studentId?: string;
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  localityName?: string;
  libraryId?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  isValid: boolean;
  couponCode: string;
  discountType?: OfferDiscountType;
  discountValue?: number;
  calculatedDiscount: number;
  discountAmount: number;
  payableAmount: number;
  finalPayableAmount: number;
  originalAmount: number;
  offerId?: string;
  offerName?: string;
  status: CouponStatus;
  message: string;
  errorReason?: string;
  termsAndConditions?: string[];
  coupon?: {
    id?: string;
    code: string;
    name?: string;
    status: CouponStatus;
    discountType?: 'PERCENTAGE' | 'FIXED';
    discountValue?: number;
    maxDiscount?: number;
    minSpend?: number;
    service?: string;
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
    timesUsed?: number;
    terms?: string[];
  };
  offer?: {
    id?: string;
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    [key: string]: any;
  };
}

export interface HomepageOffer {
  id: string;
  title: string;
  subtitle?: string;
  discountType: OfferDiscountType;
  discountValue: number;
  couponCode?: string;
  service: OfferServiceType;
  scope: OfferScope;
  stateName?: string;
  districtName?: string;
  localityName?: string;
  targetEntityId?: string;
  targetEntityName?: string;
  startDate: string;
  endDate: string;
  minPurchaseAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  timesUsed?: number;
  ctaText?: string;
  ctaLink?: string;
  description?: string;
  termsAndConditions?: string[];
  bannerGradient?: string;
  backgroundImage?: string;
  status: OfferStatus;
  isFeatured?: boolean;
}

export interface HeroSlide {
  id: string;
  badgeText: string;
  badgeIcon?: string;
  headline: string;
  highlightedText: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  image: string;
  altText: string;
  tagline?: string;
  floatingStats?: {
    label: string;
    value: string;
    subtext?: string;
  };
}

export type ReviewerRole = 'STUDENT_TUITION' | 'STUDENT_LIBRARY' | 'STUDENT_MOCK_TEST' | 'STUDENT_STUDY_MATERIAL' | 'TEACHER' | 'LIBRARY_OWNER' | 'PARENT';

export type ReviewServiceType = 'HOME_TUITION' | 'SELF_STUDY_LIBRARY' | 'STUDY_MATERIAL' | 'MOCK_TEST' | 'OTHER';
export type ReviewModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';

export interface ParentReview {
  id: string;
  parentName: string;
  userRole?: ReviewerRole;
  authorRoleLabel?: string;
  photoUrl?: string;
  photoAttachmentUrl?: string;
  videoAttachmentUrl?: string;
  location: {
    locality?: string;
    district: string;
    state: string;
  };
  childClass: string;
  serviceUsed: ReviewServiceType;
  rating: number;
  title?: string;
  reviewText: string;
  verified: boolean;
  status?: ReviewModerationStatus;
  privacyPreference?: 'FULL_NAME' | 'INITIAL_ONLY';
  date: string;
  tutorName?: string;
  libraryName?: string;
  targetEntityName?: string;
  verifiedBookingId?: string;
}

export interface ReviewEligibility {
  canReview: boolean;
  role?: string;
  userName?: string;
  availableServices?: Array<{
    service: ReviewServiceType;
    label: string;
    targetId?: string;
    targetName?: string;
  }>;
  reason?: string;
}

export type VideoCategory = 'PARENT' | 'LIBRARY_STUDENT' | 'STUDENT_ACADEMIC';
export type VideoModerationStatus = 'UPLOADING' | 'PROCESSING' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

export interface VideoTestimonial {
  id: string;
  category: VideoCategory;
  name: string;
  designation?: string;
  location: {
    locality?: string;
    district: string;
    state: string;
  };
  serviceUsed: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  title: string;
  description: string;
  verified: boolean;
  featured?: boolean;
  aspectRatio?: '16:9' | '9:16';
  status?: VideoModerationStatus;
  ownerId?: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadTimestamp?: string;
  publishedTimestamp?: string;
  storageLocation?: string;
}

export interface CouponCopyResult {
  couponCode: string;
  success: boolean;
  message: string;
}

export interface HomepageConfig {
  showLiveOffers: boolean;
  showHeroCarousel: boolean;
  showParentReviews: boolean;
  showVideoTestimonials: boolean;
  showLocationDiscovery: boolean;
  autoRotateIntervalMs: number;
}
