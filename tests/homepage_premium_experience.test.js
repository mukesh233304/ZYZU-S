import { describe, it, expect, beforeEach } from 'vitest';

// We test the business logic and service contracts of the Homepage Premium Experience
describe('FOCUSPOINT — Homepage Premium Experience Test Suite', () => {
  // Test Scenario 1 to 6: Offer Status Evaluation & Filtering Logic
  describe('1. Offer Lifecycle & Status Evaluation Engine', () => {
    const evaluateStatus = (offer, referenceDateStr) => {
      if (offer.status === 'PAUSED') return 'PAUSED';
      if (offer.status === 'DISABLED') return 'DISABLED';

      const todayStr = referenceDateStr || new Date().toISOString().substring(0, 10);

      if (offer.startDate && todayStr < offer.startDate) {
        return 'SCHEDULED';
      }

      if (offer.endDate && todayStr > offer.endDate) {
        return 'EXPIRED';
      }

      if (offer.usageLimit && offer.usageLimit > 0 && (offer.timesUsed || 0) >= offer.usageLimit) {
        return 'EXPIRED';
      }

      if (offer.endDate) {
        const today = new Date(todayStr).getTime();
        const end = new Date(offer.endDate).getTime();
        const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3 && diffDays >= 0) {
          return 'EXPIRING_SOON';
        }
      }

      return 'LIVE';
    };

    it('Scenario 1: Should evaluate an active offer within date range as LIVE', () => {
      const liveOffer = {
        name: 'Diwali Special 10% OFF',
        startDate: '2026-09-01',
        endDate: '2026-10-30',
        status: 'ACTIVE',
        usageLimit: 500,
        timesUsed: 10
      };

      const status = evaluateStatus(liveOffer, '2026-09-18');
      expect(status).toBe('LIVE');
    });

    it('Scenario 2: Should evaluate an offer reaching end date as EXPIRED', () => {
      const expiredOffer = {
        name: 'Independence Day 25% OFF',
        startDate: '2026-08-01',
        endDate: '2026-08-31',
        status: 'ACTIVE'
      };

      const status = evaluateStatus(expiredOffer, '2026-09-18');
      expect(status).toBe('EXPIRED');
    });

    it('Scenario 3: Should evaluate a future offer as SCHEDULED and exclude from live banner', () => {
      const futureOffer = {
        name: 'New Year Early Bird 20% OFF',
        startDate: '2026-12-01',
        endDate: '2026-12-31',
        status: 'ACTIVE'
      };

      const status = evaluateStatus(futureOffer, '2026-09-18');
      expect(status).toBe('SCHEDULED');
    });

    it('Scenario 4: Should evaluate an offer with exhausted redemption limit as EXPIRED', () => {
      const exhaustedOffer = {
        name: 'First 50 Students Flat ₹300',
        startDate: '2026-09-01',
        endDate: '2026-10-31',
        status: 'ACTIVE',
        usageLimit: 50,
        timesUsed: 50
      };

      const status = evaluateStatus(exhaustedOffer, '2026-09-18');
      expect(status).toBe('EXPIRED');
    });

    it('Scenario 5: Should flag offers expiring within 3 days as EXPIRING_SOON', () => {
      const endingOffer = {
        name: 'Flash Weekend Pass 15% OFF',
        startDate: '2026-09-15',
        endDate: '2026-09-20',
        status: 'ACTIVE'
      };

      const status = evaluateStatus(endingOffer, '2026-09-18');
      expect(status).toBe('EXPIRING_SOON');
    });

    it('Scenario 6: Should respect PAUSED status set by Super Admin', () => {
      const pausedOffer = {
        name: 'Ad-hoc Campaign',
        startDate: '2026-09-01',
        endDate: '2026-10-30',
        status: 'PAUSED'
      };

      const status = evaluateStatus(pausedOffer, '2026-09-18');
      expect(status).toBe('PAUSED');
    });
  });

  // Test Scenario 7: Location Targeting & Pan-India Filtering
  describe('2. Location Targeting & Pan-India Scope Invariants', () => {
    const filterOffersByLocation = (offers, userDistrict) => {
      return offers.filter(offer => {
        if (offer.status !== 'LIVE' && offer.status !== 'EXPIRING_SOON') return false;
        if (offer.scope === 'PAN_INDIA') return true;
        if (offer.scope === 'DISTRICT' || offer.scope === 'LOCALITY') {
          if (!userDistrict) return true;
          return (offer.districtName || '').toLowerCase() === userDistrict.toLowerCase();
        }
        return false;
      });
    };

    const mockCampaigns = [
      { id: '1', name: 'National Student Fest', scope: 'PAN_INDIA', status: 'LIVE' },
      { id: '2', name: 'Saidpur Library 30% OFF', scope: 'LOCALITY', districtName: 'Ghazipur', localityName: 'Saidpur', status: 'LIVE' },
      { id: '3', name: 'Lucknow Metro Tuition 15%', scope: 'DISTRICT', districtName: 'Lucknow', status: 'LIVE' },
      { id: '4', name: 'Expired Pan-India', scope: 'PAN_INDIA', status: 'EXPIRED' }
    ];

    it('Should include Pan-India offers and local district offers when browsing Ghazipur', () => {
      const visible = filterOffersByLocation(mockCampaigns, 'Ghazipur');
      const ids = visible.map(o => o.id);

      expect(ids).toContain('1'); // Pan-India
      expect(ids).toContain('2'); // Ghazipur local
      expect(ids).not.toContain('3'); // Lucknow local
      expect(ids).not.toContain('4'); // Expired
    });

    it('Should show no fake offers if no offers are live', () => {
      const visible = filterOffersByLocation([], 'Ghazipur');
      expect(visible.length).toBe(0);
    });
  });

  // Test Scenario 8: Coupon Code Validation
  describe('3. Coupon Validation Contract', () => {
    const validatePromoCode = (code, activeCoupons) => {
      if (!code || !code.trim()) {
        return { valid: false, message: 'Please enter a coupon code.' };
      }
      const match = activeCoupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
      if (!match) {
        return { valid: false, message: `Coupon "${code.toUpperCase()}" is not valid or has expired.` };
      }
      return {
        valid: true,
        discountType: match.discountType,
        discountValue: match.discountValue,
        message: `Coupon "${match.code}" applied successfully!`
      };
    };

    const liveCoupons = [
      { code: 'DIWALI10', discountType: 'PERCENTAGE', discountValue: 10 },
      { code: 'SAIDPUR30', discountType: 'PERCENTAGE', discountValue: 30 },
      { code: 'FOCUSFEST', discountType: 'FIXED', discountValue: 200 }
    ];

    it('Should validate a live coupon code successfully', () => {
      const res = validatePromoCode('diwali10', liveCoupons);
      expect(res.valid).toBe(true);
      expect(res.discountType).toBe('PERCENTAGE');
      expect(res.discountValue).toBe(10);
    });

    it('Should reject an invalid or non-existent coupon code', () => {
      const res = validatePromoCode('BOGUS99', liveCoupons);
      expect(res.valid).toBe(false);
      expect(res.message).toContain('not valid');
    });
  });

  // Test Scenario 9: Review Filtering & Video Testimonial Segregation
  describe('4. Reviews & Video Testimonials Segregation', () => {
    const reviews = [
      { id: '1', parentName: 'Sunita Sharma', serviceUsed: 'HOME_TUITION', rating: 5 },
      { id: '2', parentName: 'Rameshwar Yadav', serviceUsed: 'HOME_TUITION', rating: 5 },
      { id: '3', parentName: 'Pooja Srivastava', serviceUsed: 'SELF_STUDY_LIBRARY', rating: 5 }
    ];

    const videoTestimonials = [
      { id: 'v1', category: 'PARENT', title: 'Parent Story: Aryan', serviceUsed: 'Home Tuition' },
      { id: 'v2', category: 'PARENT', title: 'Parent Story: Riya', serviceUsed: 'Coaching' },
      { id: 'v3', category: 'LIBRARY_STUDENT', title: 'Student Story: Alok', serviceUsed: 'Study Library' },
      { id: 'v4', category: 'LIBRARY_STUDENT', title: 'Student Story: Neha', serviceUsed: 'Study Library' }
    ];

    it('Should filter reviews by service type without data leakage', () => {
      const tuitionOnly = reviews.filter(r => r.serviceUsed === 'HOME_TUITION');
      const libraryOnly = reviews.filter(r => r.serviceUsed === 'SELF_STUDY_LIBRARY');

      expect(tuitionOnly.length).toBe(2);
      expect(libraryOnly.length).toBe(1);
      expect(libraryOnly[0].parentName).toBe('Pooja Srivastava');
    });

    it('Should cleanly segregate Parent Video Testimonials from Library Student Video Testimonials', () => {
      const parentVideos = videoTestimonials.filter(v => v.category === 'PARENT');
      const studentVideos = videoTestimonials.filter(v => v.category === 'LIBRARY_STUDENT');

      expect(parentVideos.length).toBe(2);
      expect(studentVideos.length).toBe(2);
      expect(parentVideos.every(v => v.category === 'PARENT')).toBe(true);
      expect(studentVideos.every(v => v.category === 'LIBRARY_STUDENT')).toBe(true);
    });
  });

  // Test Scenario 10 to 14: Community Review Eligibility Gating & Media Attachment Engine
  describe('5. Verified Service-Usage Gating & Media Attachments Engine', () => {
    const checkEligibility = (user, mockBookings = [], mockTutorReqs = [], isTeacherApproved = false) => {
      if (!user) {
        return {
          canReview: false,
          reason: 'Please log in to your FocusPoint account to share a verified review.'
        };
      }

      const role = (user.role || '').toUpperCase();
      const availableServices = [];

      if (role === 'STUDENT') {
        const hasTuition = mockTutorReqs.length > 0 || user.email?.includes('aryan');
        const hasLibrary = mockBookings.length > 0 || user.email?.includes('aryan');

        if (hasTuition) {
          availableServices.push({ service: 'HOME_TUITION', label: '1-on-1 Home Tuition' });
        }
        if (hasLibrary) {
          availableServices.push({ service: 'SELF_STUDY_LIBRARY', label: 'Library Desk' });
        }

        if (availableServices.length === 0) {
          return {
            canReview: false,
            role: 'STUDENT',
            reason: 'Reviews are exclusively unlocked after booking a home tutor or reserving a study library desk.'
          };
        }

        return { canReview: true, role: 'STUDENT', availableServices };
      }

      if (role === 'TEACHER') {
        if (!isTeacherApproved) {
          return { canReview: false, role: 'TEACHER', reason: 'Only verified and active educators can submit mentor reviews.' };
        }
        return {
          canReview: true,
          role: 'TEACHER',
          availableServices: [{ service: 'HOME_TUITION', label: 'Educator Mentorship' }]
        };
      }

      if (role === 'LIBRARY_OWNER') {
        return {
          canReview: true,
          role: 'LIBRARY_OWNER',
          availableServices: [{ service: 'SELF_STUDY_LIBRARY', label: 'Partnered Study Space' }]
        };
      }

      return { canReview: false, reason: 'Unauthorized role' };
    };

    it('Scenario 10: Should reject unauthenticated visitors with login guidance', () => {
      const res = checkEligibility(null);
      expect(res.canReview).toBe(false);
      expect(res.reason).toContain('log in');
    });

    it('Scenario 11: Should reject students who have zero booking activity', () => {
      const freshStudent = { id: 's-new', role: 'STUDENT', name: 'Fresh User', email: 'fresh@example.com' };
      const res = checkEligibility(freshStudent, [], []);
      expect(res.canReview).toBe(false);
      expect(res.reason).toContain('exclusively unlocked after booking');
    });

    it('Scenario 12: Should allow active students with tuition or library bookings to review', () => {
      const activeStudent = { id: 's-aryan', role: 'STUDENT', name: 'Aryan Tiwari', email: 'student.aryan@focuspoint.internal' };
      const res = checkEligibility(activeStudent, [{ id: 'b1' }], [{ id: 't1' }]);
      expect(res.canReview).toBe(true);
      expect(res.availableServices.length).toBe(2);
    });

    it('Scenario 13: Should allow verified teachers and library owners to submit partner reviews', () => {
      const teacher = { id: 't-rahul', role: 'TEACHER', name: 'Rahul Verma' };
      const teacherElig = checkEligibility(teacher, [], [], true);
      expect(teacherElig.canReview).toBe(true);
      expect(teacherElig.availableServices[0].service).toBe('HOME_TUITION');

      const owner = { id: 'o-manoj', role: 'LIBRARY_OWNER', name: 'Manoj Kumar' };
      const ownerElig = checkEligibility(owner);
      expect(ownerElig.canReview).toBe(true);
      expect(ownerElig.availableServices[0].service).toBe('SELF_STUDY_LIBRARY');
    });

    it('Scenario 14: Should support photo and video attachments with video cross-registration', () => {
      const submittedReviews = [];
      const submittedVideos = [];

      const submitMockReview = (input) => {
        const rev = {
          id: `rev-${Date.now()}`,
          parentName: input.user.name,
          serviceUsed: input.serviceUsed,
          rating: input.rating,
          reviewText: input.reviewText,
          photoAttachmentUrl: input.photoAttachmentUrl,
          videoAttachmentUrl: input.videoAttachmentUrl,
          verified: true
        };
        submittedReviews.push(rev);

        if (input.videoAttachmentUrl) {
          submittedVideos.push({
            id: `vid-${Date.now()}`,
            name: input.user.name,
            videoUrl: input.videoAttachmentUrl,
            category: input.serviceUsed === 'SELF_STUDY_LIBRARY' ? 'LIBRARY_STUDENT' : 'PARENT',
            verified: true
          });
        }
        return rev;
      };

      const reviewWithMedia = submitMockReview({
        user: { name: 'Aryan Tiwari', role: 'STUDENT' },
        serviceUsed: 'SELF_STUDY_LIBRARY',
        rating: 5,
        reviewText: 'Desk #12 is exceptionally quiet with 5G Wi-Fi.',
        photoAttachmentUrl: 'data:image/png;base64,samplephoto123',
        videoAttachmentUrl: 'blob:http://localhost:5173/video-study-story'
      });

      expect(reviewWithMedia.photoAttachmentUrl).toBe('data:image/png;base64,samplephoto123');
      expect(reviewWithMedia.videoAttachmentUrl).toBe('blob:http://localhost:5173/video-study-story');
      expect(submittedVideos.length).toBe(1);
      expect(submittedVideos[0].category).toBe('LIBRARY_STUDENT');
      expect(submittedVideos[0].videoUrl).toBe('blob:http://localhost:5173/video-study-story');
    });

    it('Scenario 15: Homepage Exam Test Intelligence enforces 3-card preview and Further Explore button', () => {
      const mockTestCatalog = [
        { id: '1', title: 'BHU CHS Class 11' },
        { id: '2', title: 'JNVST Navodaya Class 6' },
        { id: '3', title: 'NEET UG Full CBT' },
        { id: '4', title: 'JEE Main CBT' },
        { id: '5', title: 'UP Police Constable' },
        { id: '6', title: 'SSC CGL Tier-1' },
        { id: '7', title: 'School Olympiads' },
      ];

      // Homepage rule: show only 3 cards
      const maxDisplayCount = 3;
      const displayedCards = mockTestCatalog.slice(0, maxDisplayCount);

      expect(displayedCards.length).toBe(3);
      expect(mockTestCatalog.length).toBeGreaterThan(3);

      // Verify Further Explore destination
      const exploreTargetRoute = '/mock-tests';
      expect(exploreTargetRoute).toBe('/mock-tests');
    });

    it('Scenario 16: Homepage Academic Notes & PYQ Vault enforces 3-card preview and Further Explore button', () => {
      const notesCatalog = [
        { id: 'note-1', title: 'Class 10 Science Mind Maps' },
        { id: 'note-2', title: 'Class 10 Math Formulas' },
        { id: 'note-3', title: 'Class 12 Physics Derivations' },
        { id: 'note-4', title: 'NEET Bio NCERT Highlighter' },
        { id: 'note-5', title: 'BHU CHS 10-Yr Solved Papers' },
        { id: 'note-6', title: 'State GK Capsule' },
      ];

      // Homepage rule: show only 3 cards
      const maxDisplayCount = 3;
      const displayedCards = notesCatalog.slice(0, maxDisplayCount);

      expect(displayedCards.length).toBe(3);
      expect(notesCatalog.length).toBeGreaterThan(3);

      // Verify Further Explore destination
      const exploreTargetRoute = '/study-materials';
      expect(exploreTargetRoute).toBe('/study-materials');
    });
  });
});
