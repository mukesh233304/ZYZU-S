// FOCUSPOINT AI AGENT — SMART NOTIFICATION, WHATSAPP OFFER & PERSONALIZED RECOMMENDATION ENGINE TYPES

import { Offer, ServiceType } from './policy';

export type AiNotificationServiceCategory = 
  | 'LIBRARY' 
  | 'HOME_TUITION' 
  | 'TEACHER_APPLICATION' 
  | 'LIBRARY_LISTING' 
  | 'MOCK_TEST' 
  | 'STUDY_MATERIAL' 
  | 'GENERAL';

export type NotificationChannel = 'IN_APP' | 'WHATSAPP' | 'BOTH';

export type NotificationDeliveryStatus = 
  | 'QUEUED'
  | 'PROCESSING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'
  | 'RETRYING'
  | 'SUPPRESSED'
  | 'SKIPPED'
  | 'CANCELLED';

export type NotificationTriggerEvent = 
  | 'LIBRARY_SEARCHED'
  | 'HOME_TUTOR_SEARCHED'
  | 'TEACHER_APPLICATION_STARTED'
  | 'TEACHER_APPLICATION_SUBMITTED'
  | 'LIBRARY_LISTING_STARTED'
  | 'LIBRARY_LISTING_SUBMITTED'
  | 'MOCK_TEST_SEARCHED'
  | 'STUDY_MATERIAL_SEARCHED'
  | 'OFFER_ELIGIBLE'
  | 'BOOKING_COMPLETED'
  | 'SUBSCRIPTION_PURCHASED'
  | 'APPLICATION_STATUS_CHANGED';

export interface SearchEventLocationPayload {
  countryId?: string;
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  localityId?: string;
  localityName?: string;
  areaId?: string;
  areaName?: string;
  pincode?: string;
}

export interface UserSearchActivityEvent {
  eventId: string;
  eventType: NotificationTriggerEvent;
  userId: string;
  userName?: string;
  userPhone?: string;
  userRole?: string;
  serviceType: AiNotificationServiceCategory;
  location: SearchEventLocationPayload;
  query?: string;
  filters?: {
    classLevel?: string;
    subject?: string;
    board?: string;
    examId?: string;
    examCategory?: string;
    shift?: string;
    teachingMode?: string;
    facilities?: string[];
    format?: string;
    maxPrice?: number;
    stage?: 'STARTED' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
    [key: string]: any;
  };
  timestamp: string;
  sessionId?: string;
}

export interface OfferRecommendationItem {
  recommendationId: string;
  eventId: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  serviceType: AiNotificationServiceCategory;
  serviceCategory?: AiNotificationServiceCategory; // Alias for serviceType
  title?: string; // Alias for headline
  description?: string; // Alias for summary
  originalPrice?: number;
  locationScope?: {
    districtName?: string;
    localityName?: string;
    isPanIndia?: boolean;
    stateName?: string;
  };
  isOrganicRecommendation?: boolean;
  badgeText?: string;
  offerId: string;
  offerTitle: string;
  offerCode?: string;
  couponCode?: string; // Alias for offerCode
  offerCategory: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  discountDisplay: string;
  targetScope: string;
  targetName?: string;
  districtName: string;
  localityName?: string;
  headline: string;
  summary: string;
  reasoning: string;
  relevanceScore: number; // 0 - 100
  actionLabel: string;
  deepLink: string;
  channel: NotificationChannel;
  deliveryStatus: NotificationDeliveryStatus;
  generatedAt: string;
  expiresAt?: string;
  isSuppressed?: boolean;
  suppressionReason?: string;
  whatsappMessage?: string;
  inAppNotificationId?: string;
  whatsappDispatchId?: string;
  isClicked?: boolean;
  isConverted?: boolean;
  convertedAmount?: number;
  convertedAt?: string;
}

export interface UserNotificationPreference {
  userId: string;
  whatsappPromotionalConsent: boolean;
  inAppPromotionalConsent: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string;   // e.g. "08:00"
  maxPromotionsPerDay: number;
  maxPromotionsPerWeek: number;
  cooldownHours: number;
  optedOutCategories?: AiNotificationServiceCategory[];
  optedOutAt?: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  templateId: string;
  name: string;
  serviceType: AiNotificationServiceCategory;
  channel: NotificationChannel;
  titleTemplate: string;
  bodyTemplate: string;
  actionLabel: string;
  deepLinkPattern: string;
  category: 'PROMOTIONAL' | 'TRANSACTIONAL';
  isApproved: boolean;
  version: string;
  updatedAt: string;
}

export interface AiNotificationAgentConfig {
  globalAiEnabled: boolean;
  isGloballyEnabled?: boolean;
  isInAppChannelEnabled?: boolean;
  isWhatsappChannelEnabled?: boolean;
  cooldownMinutesBetweenOffers?: number;
  maxPromotionalPerDay?: number;
  maxPromotionalPerWeek?: number;
  enabledServices?: Record<string, boolean>;
  channelsEnabled: {
    inApp: boolean;
    whatsapp: boolean;
  };
  servicesEnabled: {
    LIBRARY: boolean;
    HOME_TUITION: boolean;
    TEACHER_APPLICATION: boolean;
    LIBRARY_LISTING: boolean;
    MOCK_TEST: boolean;
    STUDY_MATERIAL: boolean;
    GENERAL: boolean;
  };
  cooldownMinutes: number; // minimum time between recommendations for same user/service
  dailyMaxPerUser: number;
  weeklyMaxPerUser: number;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
  };
  minRelevanceScore: number; // minimum score (e.g. 50) to trigger notification
  requireExplicitConsentForWhatsApp: boolean;
  deduplicationWindowMinutes: number;
  testModeEnabled: boolean;
  templates: NotificationTemplate[];
}

export interface AiNotificationMetricsSummary {
  totalEventsProcessed: number;
  totalEventsCaptured?: number; // Alias for totalEventsProcessed
  recommendationsGenerated: number;
  totalRecommendationsGenerated?: number; // Alias for recommendationsGenerated
  inAppDelivered: number;
  inAppRead: number;
  inAppClicked: number;
  whatsappDispatched: number;
  whatsappDelivered: number;
  whatsappRead: number;
  whatsappClicked: number;
  whatsappSuppressed?: number; // Alias for suppressedConsent + suppressedFrequency
  offerClicks?: number; // Alias for inAppClicked + whatsappClicked
  suppressedConsent: number;
  suppressedFrequency: number;
  suppressedQuietHours: number;
  attributedConversions: number;
  conversionGmv: number;
  attributedRevenueINR?: number; // Alias for conversionGmv
  optOutRatePercentage: number;
  averageRelevanceScore: number;
  topDistricts: { districtName: string; eventsCount: number; recommendationsCount: number; conversions: number }[];
  serviceBreakdown: { serviceType: AiNotificationServiceCategory; eventCount: number; matchCount: number; ctr: number }[];
}

export interface AiAutomationAuditRecord {
  id: string;
  timestamp: string;
  action: string;
  adminName: string;
  adminRole: string;
  category: 'CONFIG_CHANGE' | 'MANUAL_DISPATCH' | 'RETRY_QUEUE' | 'RULE_UPDATE' | 'OPT_OUT' | 'DELIVERY_DISPATCH' | 'POLICY_EVALUATION';
  details: string;
  payloadSnapshot?: any;
  eventId?: string;
  serviceCategory?: AiNotificationServiceCategory;
  outcome?: string;
}
