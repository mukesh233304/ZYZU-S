/**
 * FOCUSPOINT Backend AI Offer Recommendation Engine
 * Evaluates user searches, locations, and intents against active offers with strict verification
 */

const ACTIVE_OFFER_CATALOG = [
  // 1. Library Offers
  {
    id: 'off-lib-gzp-saidpur',
    title: "ZYZU'S Saidpur Digital Library Special 30% OFF",
    code: 'FOCUS30',
    serviceType: 'LIBRARY',
    targetScope: 'LIBRARY',
    targetName: "ZYZU'S Digital Library Saidpur",
    districtName: 'Ghazipur',
    localityName: 'Saidpur',
    discountType: 'PERCENTAGE',
    discountValue: 30,
    offerCategory: 'PROMOTIONAL',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'ACTIVE',
    deepLinkBase: '/explore/libraries'
  },
  {
    id: 'off-lib-gzp-general',
    title: 'Ghazipur District Library Membership Pass 20% OFF',
    code: 'GZP20',
    serviceType: 'LIBRARY',
    targetScope: 'DISTRICT',
    targetName: 'All Ghazipur Libraries',
    districtName: 'Ghazipur',
    localityName: '',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    offerCategory: 'PROMOTIONAL',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'ACTIVE',
    deepLinkBase: '/explore/libraries'
  },
  {
    id: 'off-lib-pan-india',
    title: 'National Digital Library Access 10% Welcome Discount',
    code: 'FIRSTLIB10',
    serviceType: 'LIBRARY',
    targetScope: 'DISTRICT',
    targetName: 'All India Libraries',
    districtName: 'Pan-India',
    localityName: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    offerCategory: 'FIRST_BOOKING',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'ACTIVE',
    deepLinkBase: '/explore/libraries'
  },

  // 2. Home Tuition Offers
  {
    id: 'off-tutor-gzp-saidpur',
    title: 'Saidpur Math & Science Home Tutor Package ₹500 Flat OFF',
    code: 'SAIDPUR500',
    serviceType: 'HOME_TUITION',
    targetScope: 'TUITION',
    targetName: 'Saidpur Elite Tutors',
    districtName: 'Ghazipur',
    localityName: 'Saidpur',
    subject: 'Math',
    classLevel: 'Class 8',
    discountType: 'FIXED',
    discountValue: 500,
    offerCategory: 'TUITION_PACKAGE',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'ACTIVE',
    deepLinkBase: '/explore/tutors'
  },
  {
    id: 'off-tutor-pan-india',
    title: "ZYZU'S First Tuition Demo & Session 15% OFF",
    code: 'FIRSTTUTOR15',
    serviceType: 'HOME_TUITION',
    targetScope: 'DISTRICT',
    targetName: 'All India Home Tutors',
    districtName: 'Pan-India',
    localityName: '',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    offerCategory: 'FIRST_BOOKING',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'ACTIVE',
    deepLinkBase: '/explore/tutors'
  },

  // 3. Teacher Onboarding Guidance & Offers
  {
    id: 'off-teacher-onboarding',
    title: 'Zero Onboarding Fee for Verified Teachers This Month',
    code: 'TEACHERFREE',
    serviceType: 'TEACHER_APPLICATION',
    targetScope: 'DISTRICT',
    targetName: 'Teacher Onboarding Program',
    districtName: 'Pan-India',
    localityName: '',
    discountType: 'PERCENTAGE',
    discountValue: 100,
    offerCategory: 'ONBOARDING',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'ACTIVE',
    deepLinkBase: '/register/teacher'
  },

  // 4. Library Listing & Subscription Offers
  {
    id: 'off-library-listing',
    title: 'Library Owner Partner Launch Offer — 50% Off First Quarter',
    code: 'LIBOWNER50',
    serviceType: 'LIBRARY_LISTING',
    targetScope: 'DISTRICT',
    targetName: 'Library Network Partner',
    districtName: 'Pan-India',
    localityName: '',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    offerCategory: 'ONBOARDING',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'ACTIVE',
    deepLinkBase: '/register/library-owner'
  },

  // 5. Mock Tests & Test Series Offers
  {
    id: 'off-mock-test-gov',
    title: 'Government Exam Test Series Booster 25% OFF',
    code: 'GOVEXAM25',
    serviceType: 'MOCK_TEST',
    targetScope: 'DISTRICT',
    targetName: 'Government Exam Series',
    districtName: 'Pan-India',
    localityName: '',
    examCategory: 'UPSSSC',
    discountType: 'PERCENTAGE',
    discountValue: 25,
    offerCategory: 'PROMOTIONAL',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'ACTIVE',
    deepLinkBase: '/mock-tests'
  },

  // 6. Study Materials & PYQs
  {
    id: 'off-study-material-pyq',
    title: 'Previous Year Solved Papers & Formula Booklets 20% OFF',
    code: 'EXAMBOOST20',
    serviceType: 'STUDY_MATERIAL',
    targetScope: 'DISTRICT',
    targetName: 'Digital Study Materials',
    districtName: 'Pan-India',
    localityName: '',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    offerCategory: 'PROMOTIONAL',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'ACTIVE',
    deepLinkBase: '/student/study-material'
  }
];

class OfferRecommendationService {
  /**
   * Evaluates candidate offers and produces ranked recommendations with organic fallback
   */
  getRecommendations(event) {
    const {
      serviceCategory,
      districtName = '',
      localityName = '',
      searchQuery = '',
      classLevel = '',
      subject = '',
      examCategory = '',
      stage = ''
    } = event;

    const today = new Date().toISOString().split('T')[0];
    const candidateOffers = ACTIVE_OFFER_CATALOG.filter(offer => {
      // Must be ACTIVE
      if (offer.status !== 'ACTIVE') return false;

      // Must be within date validity window
      if (offer.startDate && offer.startDate > today) return false;
      if (offer.endDate && offer.endDate < today) return false;

      // Must match service category
      if (offer.serviceType !== serviceCategory) return false;

      // Location match: Pan-India or matching district
      if (districtName && districtName !== 'Pan-India' && districtName !== 'ALL') {
        const isPanIndia = !offer.districtName || offer.districtName.toLowerCase() === 'pan-india';
        const isDistrict = offer.districtName.toLowerCase() === districtName.toLowerCase();
        if (!isPanIndia && !isDistrict) return false;
      }

      return true;
    });

    // Score and rank candidates
    const scoredOffers = candidateOffers.map(offer => {
      let score = 50; // base score

      // Locality match
      if (localityName && offer.localityName && offer.localityName.toLowerCase() === localityName.toLowerCase()) {
        score += 40;
      }

      // District match
      if (districtName && offer.districtName && offer.districtName.toLowerCase() === districtName.toLowerCase()) {
        score += 30;
      }

      // Class / Subject match for tuition
      if (subject && offer.subject && offer.subject.toLowerCase() === subject.toLowerCase()) {
        score += 20;
      }
      if (classLevel && offer.classLevel && offer.classLevel.toLowerCase() === classLevel.toLowerCase()) {
        score += 15;
      }

      // Exam match for mock tests
      if (examCategory && offer.examCategory && offer.examCategory.toLowerCase() === examCategory.toLowerCase()) {
        score += 25;
      }

      return {
        ...offer,
        relevanceScore: score
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);

    // If matches found, map to recommendations
    if (scoredOffers.length > 0) {
      return scoredOffers.map(offer => {
        const deepLink = this.buildSafeDeepLink(offer.deepLinkBase, {
          district: districtName,
          locality: localityName,
          class: classLevel,
          subject,
          exam: examCategory,
          query: searchQuery,
          promo: offer.code
        });

        const discountDisplay = offer.discountType === 'PERCENTAGE' 
          ? `🔥 ${offer.discountValue}% OFF` 
          : `₹${offer.discountValue} OFF`;

        return {
          offerId: offer.id,
          offerTitle: offer.title,
          offerCode: offer.code,
          serviceType: offer.serviceType,
          offerCategory: offer.offerCategory,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          discountDisplay,
          relevanceScore: offer.relevanceScore,
          isOrganic: false,
          deepLink,
          locationScope: {
            districtName: offer.districtName || districtName,
            localityName: offer.localityName || localityName,
            isPanIndia: offer.districtName === 'Pan-India' || !offer.districtName
          }
        };
      });
    }

    // Honest Organic Fallback (NO fabricated discounts, zero discount value)
    const organicDeepLink = this.buildSafeDeepLink(this.getBaseUrlForService(serviceCategory), {
      district: districtName,
      locality: localityName,
      query: searchQuery
    });

    return [{
      offerId: `organic-${serviceCategory.toLowerCase()}`,
      offerTitle: `Verified ${this.formatServiceName(serviceCategory)} in ${localityName || districtName || 'your area'}`,
      offerCode: undefined,
      serviceType: serviceCategory,
      offerCategory: 'ORGANIC_MATCH',
      discountType: 'FIXED',
      discountValue: 0,
      discountDisplay: "Verified ZYZU'S Partner",
      relevanceScore: 40,
      isOrganic: true,
      deepLink: organicDeepLink,
      locationScope: {
        districtName: districtName || 'Pan-India',
        localityName: localityName || '',
        isPanIndia: !districtName || districtName === 'Pan-India'
      }
    }];
  }

  getBaseUrlForService(serviceCategory) {
    switch (serviceCategory) {
      case 'LIBRARY': return '/explore/libraries';
      case 'HOME_TUITION': return '/explore/tutors';
      case 'TEACHER_APPLICATION': return '/register/teacher';
      case 'LIBRARY_LISTING': return '/register/library-owner';
      case 'MOCK_TEST': return '/mock-tests';
      case 'STUDY_MATERIAL': return '/student/study-material';
      default: return '/';
    }
  }

  formatServiceName(serviceCategory) {
    switch (serviceCategory) {
      case 'LIBRARY': return 'Digital Libraries';
      case 'HOME_TUITION': return 'Home Tutors';
      case 'TEACHER_APPLICATION': return 'Teacher Opportunities';
      case 'LIBRARY_LISTING': return 'Library Listing Services';
      case 'MOCK_TEST': return 'Government Exam Mock Tests';
      case 'STUDY_MATERIAL': return 'Verified Study Materials';
      default: return 'Education Services';
    }
  }

  /**
   * Builds clean, safe deep links without exposing PII (e.g. phone, full names)
   */
  buildSafeDeepLink(basePath, params = {}) {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && String(val).trim() !== '' && key !== 'phone' && key !== 'userName' && key !== 'token') {
        searchParams.append(key, String(val).trim());
      }
    }
    const queryString = searchParams.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  }
}

module.exports = new OfferRecommendationService();
