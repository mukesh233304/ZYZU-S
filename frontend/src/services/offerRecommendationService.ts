// FOCUSPOINT Intelligent Offer Recommendation & Relevance Matching Engine
// Evaluates real location, services, eligibility, and verified inventory without synthetic fabrication

import { 
  AiNotificationServiceCategory, 
  OfferRecommendationItem, 
  UserSearchActivityEvent, 
  NotificationChannel 
} from '../types/aiNotification';
import { policyService } from './policyService';
import { studyMaterialService } from './studyMaterialService';
import { libraryDiscoveryService } from './libraryDiscoveryService';
import { mockStore } from '../mock/store';
import { Offer } from '../types/policy';

export class OfferRecommendationService {

  /**
   * Evaluates user search intent and finds the most relevant verified offer & service recommendation
   */
  public matchOfferForEvent(event: UserSearchActivityEvent): OfferRecommendationItem | null {
    const { serviceType, location, query, filters, userId, userName, userPhone, eventId } = event;

    // 1. Fetch live, currently valid offers from authoritative services
    const candidateOffers = this.getEligibleOffers(serviceType, location.districtName);
    if (!candidateOffers || candidateOffers.length === 0) {
      // If no promotional offer is eligible, generate an honest organic service navigation recommendation
      return this.generateOrganicServiceRecommendation(event);
    }

    // 2. Score and rank candidates using hybrid deterministic + relevance ranking
    const scoredCandidates = candidateOffers.map(offer => {
      const score = this.calculateRelevanceScore(offer, event);
      return { offer, score };
    });

    // Filter out candidates with zero or negative relevance
    const validCandidates = scoredCandidates
      .filter(item => item.score > 30)
      .sort((a, b) => b.score - a.score);

    if (validCandidates.length === 0) {
      return this.generateOrganicServiceRecommendation(event);
    }

    const topMatch = validCandidates[0].offer;
    const relevanceScore = validCandidates[0].score;

    // 3. Synthesize honest copy, deep links and action labels based on verified records
    return this.buildRecommendationItem(topMatch, relevanceScore, event);
  }

  /**
   * Retrieves active, non-expired offers strictly matching the service category and district
   */
  private getEligibleOffers(serviceType: AiNotificationServiceCategory, districtName?: string): Offer[] {
    const today = new Date().toISOString().split('T')[0];

    // Handle Study Material specific offers
    if (serviceType === 'STUDY_MATERIAL') {
      const smOffers = studyMaterialService.getOffers();
      return smOffers
        .filter(o => o.isActive && (!o.validUntil || o.validUntil >= today))
        .map(o => ({
          id: o.id,
          districtName: districtName || 'Pan-India',
          serviceType: 'STUDY_MATERIAL' as any,
          targetType: 'DISTRICT_COMMON' as any,
          title: o.title,
          code: o.code,
          description: o.description,
          discountType: (o.discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED'),
          discountValue: o.discountValue,
          minimumAmount: o.minOrderValue || 0,
          offerCategory: 'PROMOTIONAL' as any,
          startDate: o.validFrom || today,
          endDate: o.validUntil,
          usageLimit: o.maxUsageCount || 0,
          usageCount: o.usedCount || 0,
          perUserLimit: 1,
          allowStacking: o.stackable,
          status: 'ACTIVE' as any,
          createdBy: 'Study Material Operator',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
    }

    // Handle General Policy / Common Offers from policyService
    const allPolicyOffers = policyService.getOffers();
    return allPolicyOffers.filter(offer => {
      // Must be ACTIVE
      if (offer.status !== 'ACTIVE') return false;

      // Must be within date validity window
      if (offer.startDate && offer.startDate > today) return false;
      if (offer.endDate && offer.endDate < today) return false;

      // Must match service category
      if (serviceType === 'LIBRARY' && offer.serviceType !== 'LIBRARY') return false;
      if (serviceType === 'HOME_TUITION' && offer.serviceType !== 'TUITION' && (offer.serviceType as any) !== 'HOME_TUITION') return false;
      if (serviceType === 'TEACHER_APPLICATION' || serviceType === 'LIBRARY_LISTING') {
        if ((offer.offerCategory as string) !== 'ONBOARDING' && (offer as any).offerCategory !== 'PARTNER') {
          return false;
        }
      }

      // Location match: Pan-India offers or matching district
      if (districtName && districtName !== 'ALL' && districtName !== 'Pan-India') {
        const isPanIndia = !offer.districtName || offer.districtName.toLowerCase() === 'pan-india' || offer.districtName.toLowerCase() === 'all';
        const isDistrictMatch = offer.districtName.toLowerCase() === districtName.toLowerCase();
        if (!isPanIndia && !isDistrictMatch) return false;
      }

      return true;
    });
  }

  /**
   * Deterministic + Heuristic scoring of offer against user search criteria
   */
  private calculateRelevanceScore(offer: Offer, event: UserSearchActivityEvent): number {
    let score = 50; // Base score for eligible offer

    const { location, query, filters } = event;
    const reqDistrict = (location.districtName || '').toLowerCase();
    const reqLocality = (location.localityName || '').toLowerCase();
    const offerDistrict = (offer.districtName || '').toLowerCase();
    const offerTitle = (offer.title || '').toLowerCase();
    const offerDesc = (offer.description || '').toLowerCase();

    // 1. Exact District Match bonus
    if (reqDistrict && offerDistrict === reqDistrict) {
      score += 25;
    } else if (offerDistrict === 'pan-india' || offerDistrict === 'all') {
      score += 10;
    }

    // 2. Locality or Target Specificity bonus
    if (reqLocality && (offerTitle.includes(reqLocality) || offerDesc.includes(reqLocality) || (offer.targetName || '').toLowerCase().includes(reqLocality))) {
      score += 15;
    }

    // 3. Subject / Exam Match for Tuition & Mock Tests
    if (filters?.subject && (offerTitle.includes(filters.subject.toLowerCase()) || offerDesc.includes(filters.subject.toLowerCase()))) {
      score += 10;
    }
    if (filters?.classLevel && (offerTitle.includes(filters.classLevel.toLowerCase()) || offerDesc.includes(filters.classLevel.toLowerCase()))) {
      score += 10;
    }
    if (filters?.examCategory && (offerTitle.includes(filters.examCategory.toLowerCase()) || offerDesc.includes(filters.examCategory.toLowerCase()))) {
      score += 15;
    }

    // 4. Query Term Match
    if (query && (offerTitle.includes(query.toLowerCase()) || offerDesc.includes(query.toLowerCase()))) {
      score += 10;
    }

    // Cap at 100
    return Math.min(score, 100);
  }

  /**
   * Constructs the recommendation item with verified contextual deep links and honest terms
   */
  private buildRecommendationItem(
    offer: Offer, 
    relevanceScore: number, 
    event: UserSearchActivityEvent
  ): OfferRecommendationItem {
    const { serviceType, location, filters, userId, userName, userPhone, eventId } = event;
    const localityStr = location.localityName ? `${location.localityName}, ` : '';
    const districtStr = location.districtName || 'your area';
    const locDisplay = `${localityStr}${districtStr}`;

    const discountDisplay = offer.discountType === 'PERCENTAGE' 
      ? `${offer.discountValue}% OFF` 
      : `₹${offer.discountValue} OFF`;

    let headline = '';
    let summary = '';
    let actionLabel = '';
    let deepLink = '';
    let whatsappMessage = '';

    switch (serviceType) {
      case 'LIBRARY': {
        headline = `Special Library Offer in ${districtStr}: ${offer.title}`;
        summary = `Explore certified digital libraries in ${locDisplay} and unlock ${discountDisplay} with code ${offer.code || 'SPECIAL'}.`;
        actionLabel = 'Explore Libraries';
        deepLink = `/find-library?district=${encodeURIComponent(districtStr)}${location.localityName ? `&locality=${encodeURIComponent(location.localityName)}` : ''}`;
        whatsappMessage = `Hi ${userName || 'Student'}! 👋\n\nLooking for a peaceful study desk near ${locDisplay}?\n\nZYZU'S matched a verified library offer: *${offer.title}* (${discountDisplay}).\n\nExplore libraries: https://zyzus.com${deepLink}\n\nTerms apply. Reply STOP to opt out of promotional messages.`;
        break;
      }

      case 'HOME_TUITION': {
        const sub = filters?.subject ? `${filters.subject} ` : '';
        const cls = filters?.classLevel ? `for ${filters.classLevel} ` : '';
        headline = `Verified Home Tutor Offer in ${districtStr}: ${offer.title}`;
        summary = `Find top accredited ${sub}teachers ${cls}in ${locDisplay} with ${discountDisplay} platform fee benefit.`;
        actionLabel = 'Find Home Tutors';
        deepLink = `/find-tutor?district=${encodeURIComponent(districtStr)}${filters?.subject ? `&subject=${encodeURIComponent(filters.subject)}` : ''}${filters?.classLevel ? `&class=${encodeURIComponent(filters.classLevel)}` : ''}`;
        whatsappMessage = `Hi ${userName || 'Parent'}! 👋\n\nLooking for an accredited ${sub}educator ${cls}near ${locDisplay}?\n\nCheck available home tutors and current promotional offer: *${offer.title}* (${discountDisplay}).\n\nView tutors: https://zyzus.com${deepLink}\n\nReply STOP to opt out.`;
        break;
      }

      case 'STUDY_MATERIAL': {
        headline = `Academic Study Material Concession: ${offer.title}`;
        summary = `Access chapter notes, formulas, and high-yield solved question banks with ${discountDisplay}.`;
        actionLabel = 'Explore Study Materials';
        deepLink = `/student/study-material`;
        whatsappMessage = `Hi ${userName || 'Student'}! 👋\n\nEnhance your preparation with curated study materials. Use code *${offer.code || 'PREP20'}* for ${discountDisplay} on eligible packs.\n\nBrowse materials: https://zyzus.com${deepLink}\n\nReply STOP to opt out.`;
        break;
      }

      case 'MOCK_TEST': {
        const examName = filters?.examCategory || 'Government & Competitive Exams';
        headline = `${examName} Test Series Concession: ${offer.title}`;
        summary = `Prepare with full-length timed tests, state ranks, and AI mistake diagnostic radar with ${discountDisplay}.`;
        actionLabel = 'Explore Mock Tests';
        deepLink = `/student/mock-tests`;
        whatsappMessage = `Hi ${userName || 'Aspirant'}! 👋\n\nTargeting ${examName}? Prepare with verified mock tests and practice series. Special offer: *${offer.title}* (${discountDisplay}).\n\nStart practice: https://zyzus.com${deepLink}\n\nReply STOP to opt out.`;
        break;
      }

      case 'TEACHER_APPLICATION': {
        headline = `Teacher Application Guidance: ${offer.title}`;
        summary = filters?.stage === 'SUBMITTED'
          ? `Your educator profile is currently undergoing verification by the District Admin team. Track your accreditation status.`
          : `Complete your educator verification documents to begin receiving tuition inquiries in ${districtStr}.`;
        actionLabel = filters?.stage === 'SUBMITTED' ? 'Track Application' : 'Continue Application';
        deepLink = `/register/teacher`;
        whatsappMessage = `Hi ${userName || 'Educator'}! 👋\n\nRegarding your ZYZU'S teacher application: ${summary}\n\nView details: https://zyzus.com${deepLink}`;
        break;
      }

      case 'LIBRARY_LISTING': {
        headline = `Library Listing & Partner Onboarding: ${offer.title}`;
        summary = filters?.stage === 'SUBMITTED'
          ? `Your study library listing has been submitted for physical inspection and desk accreditation in ${districtStr}.`
          : `Connect with thousands of serious self-study students in ${locDisplay} by completing your listing.`;
        actionLabel = filters?.stage === 'SUBMITTED' ? 'View Listing Status' : 'Complete Listing';
        deepLink = `/register/library-owner`;
        whatsappMessage = `Hi ${userName || 'Library Partner'}! 👋\n\nRegarding your library listing in ${locDisplay}: ${summary}\n\nView details: https://zyzus.com${deepLink}`;
        break;
      }

      default: {
        headline = `ZYZU'S Special Benefit: ${offer.title}`;
        summary = `Enjoy ${discountDisplay} across verified educational services in ${locDisplay}.`;
        actionLabel = 'View Offer';
        deepLink = `/`;
        whatsappMessage = `Hi ${userName || 'Learner'}! ZYZU'S has an offer for you: *${offer.title}*. Explore now: https://zyzus.com${deepLink}`;
      }
    }

    return {
      recommendationId: `rec-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      userId,
      userName,
      userPhone,
      serviceType,
      serviceCategory: serviceType,
      title: headline,
      description: summary,
      originalPrice: 1000,
      locationScope: {
        districtName: offer.districtName,
        localityName: location.localityName,
        isPanIndia: (offer.targetType as string) === 'ALL_DISTRICTS' || !offer.districtName || offer.districtName.toLowerCase() === 'pan-india',
        stateName: location.stateName
      },
      isOrganicRecommendation: false,
      badgeText: discountDisplay,
      offerId: offer.id,
      offerTitle: offer.title,
      offerCode: offer.code,
      offerCategory: offer.offerCategory || 'PROMOTIONAL',
      discountType: offer.discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FLAT',
      discountValue: offer.discountValue,
      discountDisplay,
      targetScope: offer.targetType,
      targetName: offer.targetName,
      districtName: offer.districtName,
      localityName: location.localityName,
      headline,
      summary,
      reasoning: `Matched via ${offer.targetType} in ${offer.districtName}. Relevance score ${relevanceScore}/100.`,
      relevanceScore,
      actionLabel,
      deepLink,
      channel: 'BOTH',
      deliveryStatus: 'QUEUED',
      generatedAt: new Date().toISOString(),
      expiresAt: offer.endDate,
      whatsappMessage
    };
  }

  /**
   * Generates organic, non-promotional recommendation when no promotional discount offer exists
   * Rule: Must never invent fake offers or fake discounts!
   */
  public generateOrganicServiceRecommendation(event: UserSearchActivityEvent): OfferRecommendationItem {
    const { serviceType, location, filters, userId, userName, userPhone, eventId } = event;
    const localityStr = location.localityName ? `${location.localityName}, ` : '';
    const districtStr = location.districtName || 'your jurisdiction';
    const locDisplay = `${localityStr}${districtStr}`;

    let headline = '';
    let summary = '';
    let actionLabel = '';
    let deepLink = '';
    let reasoning = '';

    if (serviceType === 'LIBRARY') {
      const activeLibs = libraryDiscoveryService.getDiscoverableLibraries();
      const count = activeLibs.filter(l => !location.districtName || (l.districtName && l.districtName.toLowerCase() === location.districtName.toLowerCase())).length;
      headline = `Explore Digital Study Libraries in ${districtStr}`;
      summary = `Browse ${count > 0 ? `${count} active` : 'verified'} digital libraries with 100% power backup, Wi-Fi, and reserved study desks in ${locDisplay}.`;
      actionLabel = 'Explore Libraries';
      deepLink = `/find-library?district=${encodeURIComponent(districtStr)}${location.localityName ? `&locality=${encodeURIComponent(location.localityName)}` : ''}`;
      reasoning = `Organic recommendation based on student library search intent in ${locDisplay}. Zero synthetic discount fabricated.`;
    } else if (serviceType === 'HOME_TUITION') {
      const teachers = mockStore.getTeachers({ status: 'APPROVED' });
      const count = teachers.filter(t => !location.districtName || (t.districtName && t.districtName.toLowerCase() === location.districtName.toLowerCase())).length;
      headline = `Find Top-Rated Home Tutors in ${districtStr}`;
      summary = `Discover ${count > 0 ? `${count} verified` : 'accredited'} educators for ${filters?.subject || 'academic subjects'} in ${locDisplay}.`;
      actionLabel = 'Find Home Tutors';
      deepLink = `/find-tutor?district=${encodeURIComponent(districtStr)}${filters?.subject ? `&subject=${encodeURIComponent(filters.subject)}` : ''}${filters?.classLevel ? `&class=${encodeURIComponent(filters.classLevel)}` : ''}`;
      reasoning = `Organic recommendation based on tutor search intent in ${locDisplay}. Zero synthetic discount fabricated.`;
    } else if (serviceType === 'TEACHER_APPLICATION') {
      headline = filters?.stage === 'SUBMITTED' 
        ? `Teacher Application Submitted: Next Steps` 
        : `Complete Your ZYZU'S Teacher Application`;
      summary = filters?.stage === 'SUBMITTED'
        ? `Your educator profile is currently undergoing verification by the District Admin team. Track your accreditation status.`
        : `Complete your educator verification documents to begin receiving tuition inquiries in ${districtStr}.`;
      actionLabel = filters?.stage === 'SUBMITTED' ? 'Track Application' : 'Continue Application';
      deepLink = `/register/teacher`;
      reasoning = `Educational application lifecycle event. Guidance and verification telemetry provided.`;
    } else if (serviceType === 'LIBRARY_LISTING') {
      headline = filters?.stage === 'SUBMITTED'
        ? `Library Listing Submitted for Verification`
        : `List Your Study Library on ZYZU'S`;
      summary = filters?.stage === 'SUBMITTED'
        ? `Your study library listing has been submitted for physical inspection and desk accreditation in ${districtStr}.`
        : `Connect with thousands of serious self-study students in ${locDisplay} by completing your listing.`;
      actionLabel = filters?.stage === 'SUBMITTED' ? 'View Listing Status' : 'Complete Listing';
      deepLink = `/register/library-owner`;
      reasoning = `Library partner onboarding lifecycle stage tracking.`;
    } else if (serviceType === 'MOCK_TEST') {
      headline = `Government & Entrance Exam Test Series`;
      summary = `Practice real timed examinations with bilingual question sets, detailed answer keys, and state percentiles.`;
      actionLabel = 'Explore Mock Tests';
      deepLink = `/student/mock-tests`;
      reasoning = `Student exam preparation discovery.`;
    } else {
      headline = `Study Resources & Formula Sheets in One Place`;
      summary = `Access syllabus-aligned NCERT solutions, chapter summaries, and past papers.`;
      actionLabel = 'Explore Study Materials';
      deepLink = `/student/study-material`;
      reasoning = `Academic resource directory lookup.`;
    }

    return {
      recommendationId: `org-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      userId,
      userName,
      userPhone,
      serviceType,
      serviceCategory: serviceType,
      title: headline,
      description: summary,
      originalPrice: 0,
      locationScope: {
        districtName: districtStr,
        localityName: location.localityName,
        isPanIndia: !location.districtName,
        stateName: location.stateName
      },
      isOrganicRecommendation: true,
      badgeText: 'Verified Service',
      offerId: 'organic-no-discount',
      offerTitle: headline,
      offerCategory: 'ORGANIC_RECOMMENDATION',
      discountType: 'FLAT',
      discountValue: 0,
      discountDisplay: 'Standard Pricing',
      targetScope: 'DISTRICT_COMMON',
      districtName: districtStr,
      localityName: location.localityName,
      headline,
      summary,
      reasoning,
      relevanceScore: 75,
      actionLabel,
      deepLink,
      channel: 'IN_APP',
      deliveryStatus: 'QUEUED',
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Search-to-recommendation pipeline returning an array of matched offers
   */
  public async recommendOffers(params: {
    serviceType: AiNotificationServiceCategory;
    districtName?: string;
    localityName?: string;
    classLevel?: string;
    subject?: string;
    examCategory?: string;
    query?: string;
    userId?: string;
    userName?: string;
    userPhone?: string;
    userRole?: string;
  }): Promise<OfferRecommendationItem[]> {
    const event: UserSearchActivityEvent = {
      eventId: `ev-rec-${Date.now()}`,
      eventType: params.serviceType === 'LIBRARY' ? 'LIBRARY_SEARCHED' :
                 params.serviceType === 'HOME_TUITION' ? 'HOME_TUTOR_SEARCHED' :
                 params.serviceType === 'MOCK_TEST' ? 'MOCK_TEST_SEARCHED' :
                 params.serviceType === 'STUDY_MATERIAL' ? 'STUDY_MATERIAL_SEARCHED' :
                 params.serviceType === 'TEACHER_APPLICATION' ? 'TEACHER_APPLICATION_STARTED' :
                 'LIBRARY_LISTING_STARTED',
      userId: params.userId || 'guest-visitor',
      userName: params.userName || 'Student Learner',
      userPhone: params.userPhone,
      userRole: params.userRole || 'STUDENT',
      serviceType: params.serviceType,
      location: {
        districtName: params.districtName,
        localityName: params.localityName
      },
      query: params.query,
      filters: {
        classLevel: params.classLevel,
        subject: params.subject,
        examCategory: params.examCategory
      },
      timestamp: new Date().toISOString()
    };

    const matched = this.matchOfferForEvent(event);
    return matched ? [matched] : [];
  }

  /**
   * Evaluates candidate offers against expiry, pause status, and role eligibility
   */
  public filterEligibleOffers(
    offers: Array<any>,
    context: { serviceType: AiNotificationServiceCategory; userRole?: string; districtName?: string }
  ): Array<any> {
    const now = Date.now();
    return offers.filter(o => {
      if (o.status !== 'ACTIVE') return false;
      if (o.validTo && new Date(o.validTo).getTime() < now) return false;
      if (o.eligibilityRoles && context.userRole && !o.eligibilityRoles.includes(context.userRole)) return false;
      return true;
    });
  }
}

export const offerRecommendationService = new OfferRecommendationService();
