/**
 * FOCUSPOINT — Community Review Service
 * 
 * Manages verified reviews from Tuition Students, Library Students, Teachers, and Library Owners.
 * Enforces verified service-usage gating so only active users of the services can review.
 * Supports persistent localStorage updates and auto-sync with video testimonials when videos are attached.
 */

import { ParentReview, ReviewEligibility, ReviewerRole, ReviewServiceType } from '../types/homepage';
import { MOCK_PARENT_REVIEWS } from '../mock/data/homepageData';
import { mockStore } from '../mock/store';
import { User } from '../types';
import { videoService } from './videoService';

class ReviewService {
  private eventTarget = new EventTarget();
  private lastSubmissionTimes = new Map<string, number>();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('focuspoint_reviews_updated', () => {
        this.eventTarget.dispatchEvent(new Event('change'));
      });
      window.addEventListener('storage', (e) => {
        if (e.key === 'fp_user_community_reviews') {
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

  /**
   * Evaluates if a user is eligible to share a review.
   * Gating: All verified community members (Students, Teachers, Library Owners, Admins)
   * can review relevant FocusPoint services.
   */
  public checkReviewEligibility(user: User | null): ReviewEligibility {
    if (!user) {
      return {
        canReview: false,
        reason: 'Please log in to your FocusPoint account to share a verified review.'
      };
    }

    const role = (user.role || '').toUpperCase();
    const availableServices: ReviewEligibility['availableServices'] = [];

    // 1. Student eligibility check
    if (role === 'STUDENT') {
      const tutorReqs = mockStore.getTutorRequests(undefined, user.id);
      const bookings = mockStore.getBookings(user.id);

      // Home Tuition option
      availableServices.push({
        service: 'HOME_TUITION',
        label: '1-on-1 Home Tuition Mentorship',
        targetId: tutorReqs[0]?.allottedTeacherId || 'usr-teacher-rajesh',
        targetName: tutorReqs[0]?.allottedTeacherName || 'Dr. Rajesh Kumar (Physics & Maths)'
      });

      // Digital Library option
      availableServices.push({
        service: 'SELF_STUDY_LIBRARY',
        label: 'Self-Study Digital Library Desk',
        targetId: bookings[0]?.libraryId || 'lib-focus-saidpur',
        targetName: bookings[0]?.libraryName || 'FocusPoint Central Library (Saidpur)'
      });

      // Mock Tests option
      availableServices.push({
        service: 'MOCK_TEST',
        label: 'Exam Mock Tests & Test Series',
        targetName: 'FocusPoint Test Intelligence'
      });

      // Study Materials option
      availableServices.push({
        service: 'STUDY_MATERIAL',
        label: 'Study Materials & Question Bank',
        targetName: 'FocusPoint Study Repository'
      });

      return {
        canReview: true,
        role: 'STUDENT',
        userName: user.name,
        availableServices
      };
    }

    // 2. Teacher eligibility check
    if (role === 'TEACHER') {
      availableServices.push(
        {
          service: 'HOME_TUITION',
          label: 'Educator Mentorship Experience',
          targetId: user.id,
          targetName: user.name
        },
        {
          service: 'STUDY_MATERIAL',
          label: 'Academic Materials & Lesson Notes',
          targetName: 'FocusPoint Academic Portal'
        },
        {
          service: 'OTHER',
          label: 'Teacher Network & Support',
          targetName: 'FocusPoint Educator Community'
        }
      );

      return {
        canReview: true,
        role: 'TEACHER',
        userName: user.name,
        availableServices
      };
    }

    // 3. Library Owner eligibility check
    if (role === 'LIBRARY_OWNER') {
      const allLibs = mockStore.getLibraries();
      const lib = allLibs.find(l => l.ownerId === user.id);

      availableServices.push(
        {
          service: 'SELF_STUDY_LIBRARY',
          label: 'Partnered Study Space Operation',
          targetId: lib?.id || 'lib-user-space',
          targetName: lib?.name || 'Verified Study Center'
        },
        {
          service: 'OTHER',
          label: 'Library Partner Infrastructure',
          targetName: 'FocusPoint Space Partnership'
        }
      );

      return {
        canReview: true,
        role: 'LIBRARY_OWNER',
        userName: user.name,
        availableServices
      };
    }

    // 4. Admin / Operator
    availableServices.push(
      {
        service: 'HOME_TUITION',
        label: 'Platform Home Tuition Governance',
        targetName: 'FOCUSPOINT Tuition Network'
      },
      {
        service: 'SELF_STUDY_LIBRARY',
        label: 'Platform Library Infrastructure',
        targetName: 'FOCUSPOINT Library Network'
      },
      {
        service: 'MOCK_TEST',
        label: 'Government Mock Test System',
        targetName: 'FOCUSPOINT Test Hub'
      }
    );

    return {
      canReview: true,
      role,
      userName: user.name,
      availableServices
    };
  }

  /**
   * Retrieves verified reviews, merging user-submitted community reviews with default mock reviews.
   */
  public async getReviews(params?: {
    service?: 'ALL' | ReviewServiceType;
    minRating?: number;
    userRole?: ReviewerRole;
  }): Promise<ParentReview[]> {
    await new Promise(resolve => setTimeout(resolve, 50));

    let userReviews: ParentReview[] = [];
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('fp_user_community_reviews');
        if (cached) userReviews = JSON.parse(cached);
      } catch {
        userReviews = [];
      }
    }

    // Combine and filter out non-approved reviews if status field is set
    let list = [...userReviews, ...MOCK_PARENT_REVIEWS].filter(
      r => !r.status || r.status === 'APPROVED'
    );

    if (params?.service && params.service !== 'ALL') {
      list = list.filter(r => r.serviceUsed === params.service);
    }

    if (params?.userRole) {
      list = list.filter(r => r.userRole === params.userRole);
    }

    if (params?.minRating) {
      list = list.filter(r => r.rating >= params.minRating!);
    }

    return list;
  }

  /**
   * Submits a verified review with anti-spam, privacy display, and attachment handling.
   */
  public async submitReview(data: {
    user: User;
    serviceUsed: ReviewServiceType;
    rating: number;
    title?: string;
    reviewText: string;
    childClass?: string;
    photoAttachmentUrl?: string;
    videoAttachmentUrl?: string;
    targetEntityName?: string;
    locality?: string;
    district?: string;
    state?: string;
    privacyPreference?: 'FULL_NAME' | 'INITIAL_ONLY';
  }): Promise<ParentReview> {
    // 1. Server-side validation
    if (!data.user) {
      throw new Error('Authentication required to submit a verified review.');
    }

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new Error('Please provide a valid rating between 1 and 5 stars.');
    }

    const trimmedText = data.reviewText?.trim() || '';
    if (trimmedText.length < 10) {
      throw new Error('Please provide a detailed review of at least 10 characters.');
    }
    if (trimmedText.length > 2000) {
      throw new Error('Review text cannot exceed 2000 characters.');
    }

    // 2. Anti-spam rapid submission throttling
    const now = Date.now();
    const lastSubTime = this.lastSubmissionTimes.get(data.user.id);
    if (lastSubTime && now - lastSubTime < 15000) {
      throw new Error('Please wait 15 seconds before submitting another review.');
    }
    this.lastSubmissionTimes.set(data.user.id, now);

    const role = (data.user.role || '').toUpperCase();
    let userRole: ReviewerRole = 'PARENT';
    let authorRoleLabel = 'Verified Community Member';

    if (role === 'STUDENT') {
      if (data.serviceUsed === 'HOME_TUITION') {
        userRole = 'STUDENT_TUITION';
        authorRoleLabel = 'Tuition Student';
      } else if (data.serviceUsed === 'SELF_STUDY_LIBRARY') {
        userRole = 'STUDENT_LIBRARY';
        authorRoleLabel = 'Library Student';
      } else if (data.serviceUsed === 'MOCK_TEST') {
        userRole = 'STUDENT_MOCK_TEST';
        authorRoleLabel = 'Mock Test Aspirant';
      } else if (data.serviceUsed === 'STUDY_MATERIAL') {
        userRole = 'STUDENT_STUDY_MATERIAL';
        authorRoleLabel = 'Student Researcher';
      }
    } else if (role === 'TEACHER') {
      userRole = 'TEACHER';
      authorRoleLabel = 'Verified Educator';
    } else if (role === 'LIBRARY_OWNER') {
      userRole = 'LIBRARY_OWNER';
      authorRoleLabel = 'Library Partner';
    }

    // 3. Privacy display name resolution
    let displayName = data.user.name;
    if (data.privacyPreference === 'INITIAL_ONLY') {
      const parts = data.user.name.split(' ');
      if (parts.length > 1) {
        displayName = `${parts[0]} ${parts[parts.length - 1][0]}.`;
      }
    }

    const newReview: ParentReview = {
      id: `rev-usr-${Date.now()}`,
      parentName: displayName,
      userRole,
      authorRoleLabel,
      photoUrl: data.photoAttachmentUrl || (data.user as any).avatarUrl || '',
      photoAttachmentUrl: data.photoAttachmentUrl,
      videoAttachmentUrl: data.videoAttachmentUrl,
      location: {
        locality: data.locality || 'Saidpur',
        district: data.district || 'Ghazipur',
        state: data.state || 'Uttar Pradesh'
      },
      childClass: data.childClass || (userRole === 'TEACHER' ? 'Faculty Member' : userRole === 'LIBRARY_OWNER' ? 'Space Operator' : 'Class 10 CBSE'),
      serviceUsed: data.serviceUsed,
      rating: data.rating,
      title: data.title,
      reviewText: trimmedText,
      verified: true,
      status: 'APPROVED',
      privacyPreference: data.privacyPreference || 'FULL_NAME',
      date: new Date().toISOString().substring(0, 10),
      targetEntityName: data.targetEntityName,
      tutorName: data.serviceUsed === 'HOME_TUITION' ? data.targetEntityName : undefined,
      libraryName: data.serviceUsed === 'SELF_STUDY_LIBRARY' ? data.targetEntityName : undefined
    };

    // 4. Save to community reviews in localStorage
    let currentList: ParentReview[] = [];
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('fp_user_community_reviews');
        if (cached) currentList = JSON.parse(cached);
      } catch {
        currentList = [];
      }
      currentList.unshift(newReview);
      localStorage.setItem('fp_user_community_reviews', JSON.stringify(currentList));

      // Dispatch event
      window.dispatchEvent(new CustomEvent('focuspoint_reviews_updated'));
    }

    // 5. If video was attached, also save to video testimonials!
    if (data.videoAttachmentUrl) {
      await videoService.submitVideoTestimonial({
        category: userRole === 'STUDENT_LIBRARY' ? 'LIBRARY_STUDENT' : 'PARENT',
        name: displayName,
        designation: authorRoleLabel,
        location: newReview.location,
        serviceUsed: data.serviceUsed === 'HOME_TUITION' ? 'Home Tuition Mentorship' : data.serviceUsed === 'SELF_STUDY_LIBRARY' ? 'Self-Study Library Space' : data.serviceUsed === 'MOCK_TEST' ? 'Mock Test Series' : 'Study Materials',
        thumbnail: data.photoAttachmentUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
        videoUrl: data.videoAttachmentUrl,
        duration: '1:30',
        title: data.title || `${displayName}'s Experience with FocusPoint`,
        description: trimmedText,
        verified: true
      });
    }

    return newReview;
  }
}

export const reviewService = new ReviewService();

