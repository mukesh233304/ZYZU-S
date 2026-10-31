// FOCUSPOINT — Pan-India Commercial & Service Advertisement System Types

export type AdPlacement = 
  | 'MENTORSHIP_SLOT' 
  | 'QUIET_HUBS_SLOT' 
  | 'FIND_TUTOR_HERO' 
  | 'FIND_LIBRARY_HERO' 
  | 'MOCK_TEST_HERO' 
  | 'STUDY_MATERIAL_HERO' 
  | 'SERVICE_CAROUSEL';

export type AdTargetPage = 
  | 'FIND_TUTOR' 
  | 'FIND_LIBRARY' 
  | 'MOCK_TESTS' 
  | 'STUDY_MATERIALS' 
  | 'ALL';

export type AdStatus = 
  | 'DRAFT' 
  | 'SCHEDULED' 
  | 'LIVE' 
  | 'PAUSED' 
  | 'EXPIRED' 
  | 'ARCHIVED';

export type AdMediaType = 
  | 'TEXT_ONLY' 
  | 'IMAGE_ONLY' 
  | 'VIDEO_ONLY' 
  | 'IMAGE_TEXT' 
  | 'VIDEO_TEXT' 
  | 'RICH_AD';

export type AdLayout = 
  | 'split' 
  | 'full-width' 
  | 'image-text' 
  | 'card' 
  | 'banner' 
  | 'partner'
  | 'carousel';

export interface AdvertisementCampaign {
  id: string;
  title?: string; // Optional internal display name
  advertiserName: string; // FocusPoint, Partner Education Co., Publisher, Coaching Institute, etc.
  campaignName?: string;
  placement: AdPlacement;
  targetPages: AdTargetPage[]; // Find Home Tutor, Find Libraries, Mock Tests, Study Materials, or ALL
  targetPage?: AdTargetPage; // Optional single-page convenience accessor
  mediaType: AdMediaType;
  headline: string;
  subheading?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  companyLogoUrl?: string;
  destinationUrl: string;
  ctaText: string;
  supportingText?: string;
  badgeText?: string;
  promotionalOffer?: string; // e.g. "FLAT 40% OFF" or "FREE DEMO"
  layout: AdLayout;
  status: AdStatus;
  startDate: string;
  endDate: string;
  timeZone?: string;
  priority: number; // 1 to 100 (higher = prioritized in rotation)
  targetAudience?: string; // "All Students", "Class 10-12", "NEET/JEE", etc.
  targetStateId?: string; // Optional geo-targeting
  targetDistrictId?: string; // Optional district targeting
  impressions: number;
  clicks: number;
  videoPlays?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface AdvertisementAnalyticsSummary {
  totalCampaigns: number;
  activeCampaigns: number;
  activeLive?: number; // Alias for activeCampaigns
  pausedCampaigns: number;
  expiredCampaigns: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  overallCtr?: number | string; // Formatted or numeric CTR alias
  totalVideoPlays: number;
}
