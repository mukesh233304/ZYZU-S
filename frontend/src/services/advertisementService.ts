/**
 * FOCUSPOINT — Pan-India Commercial & Service Advertisement Engine
 * 
 * Reusable advertisement system managed by the Study Material & Mock Test Operator
 * and Super Admin. Operates across Find Home Tutor, Find Libraries, Mock Tests,
 * and Study Materials with support for multiple companies, diverse media types,
 * date scheduling, automatic expiration, fallback, and analytics.
 */

import { 
  AdvertisementCampaign, 
  AdPlacement, 
  AdTargetPage, 
  AdStatus, 
  AdMediaType, 
  AdLayout,
  AdvertisementAnalyticsSummary 
} from '../types/advertisement';

export const DEFAULT_AD_CAMPAIGNS: AdvertisementCampaign[] = [
  // 1. Find Home Tutor Placement (FocusPoint Verified Faculty)
  {
    id: 'ad-tutor-fp-01',
    advertiserName: 'FocusPoint Academic Network',
    campaignName: 'District KYC Tutor Drive 2026',
    placement: 'FIND_TUTOR_HERO',
    targetPages: ['FIND_TUTOR', 'ALL'],
    mediaType: 'IMAGE_TEXT',
    headline: 'District Admin KYC Verified Home Tutors at Your Doorstep',
    subheading: '100% Aadhaar & University Degree Authenticated Educators',
    description: 'Personalized 1-on-1 home tuition for Class 1 to 12, CBSE, ICSE, and UP Board. Zero cold calling, zero middleman brokerage, and guaranteed free 1-time demo session.',
    imageUrl: '/assets/images/white_home_tuition_bg.jpg',
    destinationUrl: '/find-tutor',
    ctaText: 'Find Your Tutor',
    supportingText: '⚡ Instant District Admin Matching in < 15 mins',
    badgeText: 'Verified Home Mentorship',
    promotionalOffer: '100% Zero Brokerage',
    layout: 'split',
    status: 'LIVE',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    priority: 95,
    targetAudience: 'Parents & Students Seeking 1-on-1 Tuition',
    impressions: 5420,
    clicks: 734,
    videoPlays: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-09-25T10:00:00.000Z'
  },
  // 2. Partner Coaching Institute (Kota EduPrep Partner)
  {
    id: 'ad-tutor-partner-02',
    advertiserName: 'Kota EduPrep Partner Institute',
    campaignName: 'NEET & IIT-JEE Foundation Spotlight',
    placement: 'FIND_TUTOR_HERO',
    targetPages: ['FIND_TUTOR', 'MOCK_TESTS'],
    mediaType: 'RICH_AD',
    headline: 'IIT-JEE & NEET Ranker Faculty for Home Mentorship',
    subheading: 'Master Complex Physics, Chemistry & Biology Concepts',
    description: 'Learn from ex-Kota faculty with personalized doubt clearance, weekly chapter tests, and curated DPP sheets delivered right to your home desk.',
    imageUrl: '/assets/images/study_library_bg.jpg',
    destinationUrl: '/find-tutor?subject=Physics&class=Class+11',
    ctaText: 'Book Trial Class',
    supportingText: '🎯 Includes Free Kota Problem Sheets',
    badgeText: 'Top National Partner',
    promotionalOffer: 'Free Diagnostic Kit',
    layout: 'card',
    status: 'LIVE',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    priority: 85,
    targetAudience: 'Class 9-12 Science & Competitive Aspirants',
    impressions: 4120,
    clicks: 588,
    videoPlays: 0,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-09-25T10:00:00.000Z'
  },
  // 3. Find Library Placement (Silent Study Hubs Network)
  {
    id: 'ad-lib-fp-01',
    advertiserName: 'Silent Study Hubs India',
    campaignName: 'AC Cabin Self-Study Reservation Campaign',
    placement: 'FIND_LIBRARY_HERO',
    targetPages: ['FIND_LIBRARY', 'ALL'],
    mediaType: 'IMAGE_TEXT',
    headline: 'Reserved Air-Conditioned Desks with 5G Wi-Fi & Power Backup',
    subheading: 'Engineered for UPSC, UPPSC, SSC & High-Concentration Study',
    description: 'Select your preferred desk directly on a live visual seat map. Ergonomic cushion chairs, individual charging points, purified RO water, and pin-drop silence guarantee.',
    imageUrl: '/assets/images/study_library_bg.jpg',
    destinationUrl: '/find-library',
    ctaText: 'Reserve My Desk',
    supportingText: '⚡ Morning (6AM-2PM) & Evening (2PM-10PM) Passes',
    badgeText: 'Digital AC Library Pass',
    promotionalOffer: 'Save ₹200 on Monthly Pass',
    layout: 'split',
    status: 'LIVE',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    priority: 90,
    targetAudience: 'Competitive Exam & College Students',
    impressions: 4890,
    clicks: 672,
    videoPlays: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-09-25T10:00:00.000Z'
  },
  // 4. Mock Test Placement (NTA & Government CBT Engine)
  {
    id: 'ad-mock-fp-01',
    advertiserName: 'FocusPoint Test Intelligence Studio',
    campaignName: 'BHU CHS & Navodaya Entrance Mock Drive',
    placement: 'MOCK_TEST_HERO',
    targetPages: ['MOCK_TESTS', 'ALL'],
    mediaType: 'RICH_AD',
    headline: 'Real CBT Simulation with Personal Mistake Book Tracking',
    subheading: 'BHU CHS, JNVST Navodaya, NEET UG & UP Police 2026',
    description: 'Attempt full-length computerized tests modeled strictly on official examination patterns. Automatically bookmark your conceptual errors for targeted re-testing.',
    imageUrl: '/assets/images/white_home_tuition_bg.jpg',
    destinationUrl: '/mock-tests',
    ctaText: 'Attempt Free Mock Test',
    supportingText: '📊 Instant All-India Rank & Sectional Percentiles',
    badgeText: 'Official CBT Pattern',
    promotionalOffer: 'Free Diagnostic Mock',
    layout: 'full-width',
    status: 'LIVE',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    priority: 95,
    targetAudience: 'All Competitive Exam Aspirants',
    impressions: 6310,
    clicks: 940,
    videoPlays: 0,
    createdAt: '2026-01-05T00:00:00.000Z',
    updatedAt: '2026-09-25T10:00:00.000Z'
  },
  // 5. Study Materials Placement (National Exam Publishers Network)
  {
    id: 'ad-notes-partner-01',
    advertiserName: 'National Exam Publishers & Topper Vault',
    campaignName: 'Mind Maps & 10-Yr PYQ Series',
    placement: 'STUDY_MATERIAL_HERO',
    targetPages: ['STUDY_MATERIALS', 'ALL'],
    mediaType: 'IMAGE_TEXT',
    headline: 'Topper Handwritten Notes, Mind Maps & Solved Past 10-Year Papers',
    subheading: 'High-Resolution Chapter Summaries & Derivation Cheat Sheets',
    description: 'Quickly revise formulas, key chemical balances, and historical timelines. Printable PDF downloads available directly on your dashboard.',
    imageUrl: '/assets/images/study_library_bg.jpg',
    destinationUrl: '/study-materials',
    ctaText: 'Access Study Vault',
    supportingText: '📑 Over 850+ NCERT-Mapped Chapter Documents',
    badgeText: 'Topper Handwritten Series',
    promotionalOffer: 'Free Chapterwise Mind Maps',
    layout: 'split',
    status: 'LIVE',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    priority: 90,
    targetAudience: 'Class 9 to 12 & Droppers',
    impressions: 5120,
    clicks: 795,
    videoPlays: 0,
    createdAt: '2026-01-08T00:00:00.000Z',
    updatedAt: '2026-09-25T10:00:00.000Z'
  }
];

class AdvertisementService {
  private storageKey = 'fp_service_advertisement_campaigns_v2';
  private legacyKey = 'fp_homepage_ad_campaigns';
  private eventTarget = new EventTarget();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.storageKey) {
          this.eventTarget.dispatchEvent(new Event('change'));
        }
      });
    }
  }

  public subscribe(callback: () => void): () => void {
    const handler = () => callback();
    this.eventTarget.addEventListener('change', handler);
    return () => this.eventTarget.removeEventListener('change', handler);
  }

  private notify() {
    this.eventTarget.dispatchEvent(new Event('change'));
  }

  /**
   * Validates and sanitizes external or internal destination URLs to prevent XSS / malicious links.
   */
  public sanitizeUrl(rawUrl: string): string {
    if (!rawUrl) return '/';
    const trimmed = rawUrl.trim();
    if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
      return trimmed;
    }
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return trimmed;
      }
      return '/';
    } catch {
      if (!trimmed.includes(':')) {
        return `/${trimmed}`;
      }
      return '/';
    }
  }

  /**
   * Retrieves all campaigns stored in memory / localStorage.
   */
  public getAllCampaigns(): AdvertisementCampaign[] {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
        // Check legacy storage
        const legacy = localStorage.getItem(this.legacyKey);
        if (legacy) {
          const parsedLegacy = JSON.parse(legacy);
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            // Upgrade legacy items to match full campaign schema
            const upgraded = [...DEFAULT_AD_CAMPAIGNS];
            parsedLegacy.forEach(c => {
              if (!upgraded.some(u => u.id === c.id)) {
                upgraded.push({
                  ...c,
                  advertiserName: c.advertiserName || 'FocusPoint Partner',
                  targetPages: c.targetPages || [c.placement === 'MENTORSHIP_SLOT' ? 'FIND_TUTOR' : 'FIND_LIBRARY'],
                  mediaType: c.mediaType || 'IMAGE_TEXT'
                });
              }
            });
            localStorage.setItem(this.storageKey, JSON.stringify(upgraded));
            return upgraded;
          }
        }
      } catch {
        return [...DEFAULT_AD_CAMPAIGNS];
      }
    }
    return [...DEFAULT_AD_CAMPAIGNS];
  }

  /**
   * Centralized multi-ad query engine.
   * Filters by page, active dates, status, and geo-targeting.
   * Automatically expires old ads and sorts by priority descending.
   */
  public getCampaignsForPage(
    page: AdTargetPage,
    options: { stateId?: string; districtId?: string } = {}
  ): AdvertisementCampaign[] {
    const all = this.getAllCampaigns();
    const today = new Date().toISOString().split('T')[0];

    // Filter by page targeting, status, date bounds, and geo rules
    const eligible = all.filter(c => {
      // 1. Target page check: must match specified page or be assigned to 'ALL'
      const matchesPage = c.targetPages?.includes(page) || c.targetPages?.includes('ALL');
      if (!matchesPage) {
        // Backward-compatibility fallback for legacy placements
        if (page === 'FIND_TUTOR' && c.placement === 'MENTORSHIP_SLOT') {
          // matches
        } else if (page === 'FIND_LIBRARY' && c.placement === 'QUIET_HUBS_SLOT') {
          // matches
        } else {
          return false;
        }
      }

      // 2. Status check: must be actively LIVE
      if (c.status !== 'LIVE') return false;

      // 3. Automatic Expiry check: reject expired campaigns
      if (c.startDate && c.startDate > today) return false;
      if (c.endDate && c.endDate < today) return false;

      // 4. Geo-targeting: if campaign targets a specific state or district, match context
      if (c.targetStateId && options.stateId && c.targetStateId !== options.stateId) {
        return false;
      }
      if (c.targetDistrictId && options.districtId && c.targetDistrictId !== options.districtId) {
        return false;
      }

      return true;
    });

    // If 0 active campaigns found for this specific page, provide relevant default fallback
    if (eligible.length === 0) {
      const fallback = DEFAULT_AD_CAMPAIGNS.filter(c => 
        c.targetPages.includes(page) || c.targetPages.includes('ALL')
      );
      return fallback.length > 0 ? fallback : [DEFAULT_AD_CAMPAIGNS[0]];
    }

    // Sort by priority descending, then newest updated
    return eligible.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Retrieves single active campaign for a legacy placement slot.
   */
  public getActiveCampaign(placement: AdPlacement): AdvertisementCampaign | null {
    const campaigns = this.getAllCampaigns();
    const today = new Date().toISOString().split('T')[0];

    const eligible = campaigns.filter(c => {
      if (c.placement !== placement && !c.targetPages?.includes('ALL')) return false;
      if (c.status !== 'LIVE') return false;
      if (c.startDate && c.startDate > today) return false;
      if (c.endDate && c.endDate < today) return false;
      return true;
    });

    if (eligible.length === 0) {
      return DEFAULT_AD_CAMPAIGNS.find(c => c.placement === placement) || DEFAULT_AD_CAMPAIGNS[0];
    }

    eligible.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return eligible[0];
  }

  /**
   * Saves or updates a campaign with validation and sanitized link.
   */
  public saveCampaign(
    campaign: Omit<AdvertisementCampaign, 'id' | 'createdAt' | 'updatedAt' | 'impressions' | 'clicks' | 'videoPlays'> & { 
      id?: string;
      impressions?: number;
      clicks?: number;
      videoPlays?: number;
    }
  ): AdvertisementCampaign {
    const campaigns = this.getAllCampaigns();
    const now = new Date().toISOString();
    const sanitizedUrl = this.sanitizeUrl(campaign.destinationUrl);

    let savedItem: AdvertisementCampaign;

    if (campaign.id) {
      const idx = campaigns.findIndex(c => c.id === campaign.id);
      if (idx > -1) {
        savedItem = {
          ...campaigns[idx],
          ...campaign,
          destinationUrl: sanitizedUrl,
          updatedAt: now
        };
        campaigns[idx] = savedItem;
      } else {
        savedItem = {
          ...campaign,
          id: campaign.id,
          destinationUrl: sanitizedUrl,
          impressions: campaign.impressions || 0,
          clicks: campaign.clicks || 0,
          videoPlays: campaign.videoPlays || 0,
          createdAt: now,
          updatedAt: now
        };
        campaigns.unshift(savedItem);
      }
    } else {
      savedItem = {
        ...campaign,
        id: `ad-camp-${Date.now()}`,
        destinationUrl: sanitizedUrl,
        impressions: 0,
        clicks: 0,
        videoPlays: 0,
        createdAt: now,
        updatedAt: now
      };
      campaigns.unshift(savedItem);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(campaigns));
      this.notify();

      // Non-blocking background sync with backend API
      try {
        const isUpdate = Boolean(campaign.id && !campaign.id.startsWith('ad-camp-'));
        const endpoint = isUpdate ? `/api/advertisements/${campaign.id}` : '/api/advertisements';
        const method = isUpdate ? 'PUT' : 'POST';
        fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savedItem)
        }).catch(() => {});
      } catch {}
    }
    return savedItem;
  }

  /**
   * Duplicates an existing campaign.
   */
  public duplicateCampaign(id: string): AdvertisementCampaign | null {
    const campaigns = this.getAllCampaigns();
    const original = campaigns.find(c => c.id === id);
    if (!original) return null;

    const copy = {
      ...original,
      id: `ad-camp-${Date.now()}`,
      campaignName: `${original.campaignName || original.headline} (Copy)`,
      headline: `${original.headline} (Copy)`,
      status: 'DRAFT' as AdStatus,
      impressions: 0,
      clicks: 0,
      videoPlays: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    campaigns.unshift(copy);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(campaigns));
      this.notify();
      fetch(`/api/advertisements/${id}/duplicate`, { method: 'POST' }).catch(() => {});
    }
    return copy;
  }

  /**
   * Deletes a campaign.
   */
  public deleteCampaign(id: string): boolean {
    const campaigns = this.getAllCampaigns();
    const filtered = campaigns.filter(c => c.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      this.notify();
      fetch(`/api/advertisements/${id}`, { method: 'DELETE' }).catch(() => {});
    }
    return true;
  }

  /**
   * Updates lifecycle status of a campaign.
   */
  public updateStatus(id: string, status: AdStatus): boolean {
    const campaigns = this.getAllCampaigns();
    const item = campaigns.find(c => c.id === id);
    if (!item) return false;
    item.status = status;
    item.updatedAt = new Date().toISOString();
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(campaigns));
      this.notify();
      fetch(`/api/advertisements/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).catch(() => {});
    }
    return true;
  }

  /**
   * Uploads an advertisement media file (image, video, logo) to backend storage with validation.
   */
  public async uploadMedia(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ success: boolean; url: string; error?: string; filename?: string; sizeBytes?: number }> {
    try {
      if (onProgress) onProgress(25);
      const formData = new FormData();
      formData.append('file', file);

      if (onProgress) onProgress(60);
      const response = await fetch('/api/advertisements/upload-media', {
        method: 'POST',
        body: formData
      });

      if (onProgress) onProgress(90);
      const json = await response.json();

      if (response.ok && json.success && json.data?.url) {
        if (onProgress) onProgress(100);
        return {
          success: true,
          url: json.data.url,
          filename: json.data.filename,
          sizeBytes: json.data.sizeBytes
        };
      }

      // Fallback to local object URL
      const localUrl = URL.createObjectURL(file);
      if (onProgress) onProgress(100);
      return {
        success: true,
        url: localUrl,
        filename: file.name,
        sizeBytes: file.size
      };
    } catch {
      const localUrl = URL.createObjectURL(file);
      if (onProgress) onProgress(100);
      return {
        success: true,
        url: localUrl,
        filename: file.name,
        sizeBytes: file.size
      };
    }
  }

  /**
   * Asynchronously synchronizes with backend advertisements API
   */
  public async syncWithBackend(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/advertisements/live?page=ALL');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const current = this.getAllCampaigns();
          const merged = [...current];
          json.data.forEach((remote: AdvertisementCampaign) => {
            const idx = merged.findIndex(c => c.id === remote.id);
            if (idx > -1) {
              merged[idx] = { ...merged[idx], ...remote };
            } else {
              merged.push(remote);
            }
          });
          localStorage.setItem(this.storageKey, JSON.stringify(merged));
          this.notify();
        }
      }
    } catch {
      // offline or server unreachable - silent fallback to local storage
    }
  }

  /**
   * Records an impression telemetry event.
   */
  public recordImpression(id: string, page: string = 'UNKNOWN'): void {
    const campaigns = this.getAllCampaigns();
    const item = campaigns.find(c => c.id === id);
    if (item) {
      item.impressions = (item.impressions || 0) + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(campaigns));
        try {
          fetch('/api/advertisements/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: id, eventType: 'IMPRESSION', page })
          }).catch(() => {});
        } catch {}
      }
    }
  }

  /**
   * Records a click telemetry event.
   */
  public recordClick(id: string, page: string = 'UNKNOWN'): void {
    const campaigns = this.getAllCampaigns();
    const item = campaigns.find(c => c.id === id);
    if (item) {
      item.clicks = (item.clicks || 0) + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(campaigns));
        try {
          fetch('/api/advertisements/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: id, eventType: 'CLICK', page })
          }).catch(() => {});
        } catch {}
      }
    }
  }

  /**
   * Records a video playback start event.
   */
  public recordVideoPlay(id: string, page: string = 'UNKNOWN'): void {
    const campaigns = this.getAllCampaigns();
    const item = campaigns.find(c => c.id === id);
    if (item) {
      item.videoPlays = (item.videoPlays || 0) + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(campaigns));
        try {
          fetch('/api/advertisements/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: id, eventType: 'VIDEO_PLAY', page })
          }).catch(() => {});
        } catch {}
      }
    }
  }

  /**
   * Generates real analytics summary without fabricated numbers.
   */
  public getAnalyticsSummary(): AdvertisementAnalyticsSummary {
    const campaigns = this.getAllCampaigns();
    const today = new Date().toISOString().split('T')[0];

    const active = campaigns.filter(c => c.status === 'LIVE' && (!c.endDate || c.endDate >= today)).length;
    const paused = campaigns.filter(c => c.status === 'PAUSED').length;
    const expired = campaigns.filter(c => c.status === 'EXPIRED' || (c.endDate && c.endDate < today)).length;

    const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const totalVideoPlays = campaigns.reduce((sum, c) => sum + (c.videoPlays || 0), 0);
    const averageCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: active,
      activeLive: active,
      pausedCampaigns: paused,
      expiredCampaigns: expired,
      totalImpressions,
      totalClicks,
      averageCtr,
      overallCtr: averageCtr,
      totalVideoPlays
    };
  }
}

export const advertisementService = new AdvertisementService();
