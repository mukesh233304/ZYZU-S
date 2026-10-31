/**
 * FOCUSPOINT — Homepage Isolated Mock / Development Data
 * 
 * IMPORTANT:
 * This data is used SOLELY during frontend development and visual prototyping.
 * It is clearly separated from future production databases.
 * No false marketing claims or fabricated user numbers are presented as permanent facts.
 */

import { HeroSlide, ParentReview, VideoTestimonial, HomepageConfig } from '../../types/homepage';

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  showLiveOffers: true,
  showHeroCarousel: true,
  showParentReviews: true,
  showVideoTestimonials: true,
  showLocationDiscovery: true,
  autoRotateIntervalMs: 4500,
};

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-slide-1',
    badgeText: 'Sovereign Educational Gateway',
    headline: "India's Trusted Gateway to",
    highlightedText: 'Verified 1-on-1 Home Mentors.',
    description: 'Connecting families across Ghazipur, Saidpur, and Varanasi with background-verified, degree-authenticated home teachers matched by local District Admins.',
    primaryCtaText: 'Find a Home Tutor',
    primaryCtaLink: '/find-tutor',
    secondaryCtaText: 'Explore Study Libraries',
    secondaryCtaLink: '/find-library',
    image: '/assets/images/white_home_tuition_bg.jpg',
    altText: 'Focused Indian student receiving 1-on-1 guidance from a verified home tutor',
    tagline: 'CBSE • ICSE • UP Board • Foundation',
    floatingStats: {
      label: 'Admin Supervised',
      value: '100% KYC',
      subtext: 'Aadhaar & Degree Verified'
    }
  },
  {
    id: 'hero-slide-2',
    badgeText: 'High-Focus Study Environments',
    headline: 'Reserve Your Dedicated Desk at',
    highlightedText: 'Modern AC Self-Study Libraries.',
    description: 'Pin-drop silence, high-speed 5G Wi-Fi, individual power sockets, and ergonomic seating engineered for UPSC, UPPSC, SSC, and Board exam aspirants.',
    primaryCtaText: 'Explore Study Libraries',
    primaryCtaLink: '/find-library',
    secondaryCtaText: 'View Available Shifts',
    secondaryCtaLink: '/find-library',
    image: '/assets/images/study_library_bg.jpg',
    altText: 'Clean modern study cabins with individual charging points and digital seat booking',
    tagline: 'Morning • Afternoon • Evening • Full-Day Shifts',
    floatingStats: {
      label: 'Active Facilities',
      value: '5G Wi-Fi & AC',
      subtext: 'Reserved Desk Guarantee'
    }
  },
  {
    id: 'hero-slide-3',
    badgeText: 'Transparent Platform Standards',
    headline: 'Zero Brokerage & Complete Safety with',
    highlightedText: 'Supervised District Coordination.',
    description: 'No spam calls or unverified classified numbers. District Administrators audit every tutor requirement and inspect every affiliated study space.',
    primaryCtaText: "How ZYZU'S Works",
    primaryCtaLink: '/how-it-works',
    secondaryCtaText: 'Student Registration',
    secondaryCtaLink: '/register/student',
    image: '/assets/images/focuspoint_hero_bg.jpg',
    altText: 'Students engaged in structured academic learning in a professional environment',
    tagline: 'District-Governed Pan-India Education Ecosystem',
    floatingStats: {
      label: 'Platform Architecture',
      value: 'Zero Brokerage',
      subtext: 'Direct Fee Receipts'
    }
  },
  {
    id: 'hero-slide-4',
    badgeText: 'Empowering Local Educators',
    headline: 'Join Uttar Pradesh’s Premier Network of',
    highlightedText: 'Certified Independent Tutors.',
    description: 'Teach students in your local area with structured monthly billing, transparent fee disbursements, and formal administrative accreditation.',
    primaryCtaText: 'Apply as a Teacher',
    primaryCtaLink: '/register/teacher',
    secondaryCtaText: 'List Your Library',
    secondaryCtaLink: '/register/library-owner',
    image: '/assets/images/home_tutor_bg.jpg',
    altText: 'Passionate teacher explaining complex concepts on a chalkboard with student',
    tagline: 'Professional Accreditation & Payout Security',
    floatingStats: {
      label: 'Educator Benefits',
      value: 'Direct Payouts',
      subtext: 'Zero Intermediary Cut'
    }
  }
];

export const MOCK_PARENT_REVIEWS: ParentReview[] = [
  {
    id: 'rev-001',
    parentName: 'Sunita Sharma',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    location: {
      locality: 'Saidpur Market',
      district: 'Ghazipur',
      state: 'Uttar Pradesh'
    },
    childClass: 'Class 10 (CBSE Board)',
    serviceUsed: 'HOME_TUITION',
    rating: 5,
    reviewText: "Finding a reliable Physics tutor in Saidpur was always stressful. ZYZU'S District Admin verified the teacher’s credentials and matched Dr. Rajesh, who made my daughter confident in science concepts before her board exams.",
    verified: true,
    date: '2026-09-02',
    tutorName: 'Dr. Rajesh Kumar'
  },
  {
    id: 'rev-002',
    parentName: 'Rameshwar Yadav',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    location: {
      locality: 'Lanka',
      district: 'Varanasi',
      state: 'Uttar Pradesh'
    },
    childClass: 'Class 12 (UP Board)',
    serviceUsed: 'HOME_TUITION',
    rating: 5,
    reviewText: 'No random unsolicited calls from agencies. The platform was completely transparent, fees were standard, and the attendance tracking gives us complete peace of mind each week.',
    verified: true,
    date: '2026-08-20',
    tutorName: 'Rahul Verma'
  },
  {
    id: 'rev-003',
    parentName: 'Pooja Srivastava',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    location: {
      locality: 'Ghazipur City',
      district: 'Ghazipur',
      state: 'Uttar Pradesh'
    },
    childClass: 'NEET Aspirant',
    serviceUsed: 'SELF_STUDY_LIBRARY',
    rating: 5,
    reviewText: "My son needed a quiet study space away from home distractions. Through ZYZU'S, we booked an air-conditioned cabin with reserved desk number 12. The security and attendance logs are genuinely impressive.",
    verified: true,
    date: '2026-09-10',
    libraryName: "ZYZU'S Central Digital Library"
  },
  {
    id: 'rev-004',
    parentName: 'Manoj Kumar Gupta',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    location: {
      locality: 'Mohammadabad',
      district: 'Ghazipur',
      state: 'Uttar Pradesh'
    },
    childClass: 'Class 9 (ICSE)',
    serviceUsed: 'HOME_TUITION',
    rating: 5,
    reviewText: 'The KYC vetting process made all the difference for our family. Knowing the teacher’s police verification and university degrees were checked by the District Coordinator made us completely comfortable.',
    verified: true,
    date: '2026-08-14'
  }
];

export const MOCK_VIDEO_TESTIMONIALS: VideoTestimonial[] = [
  {
    id: 'vid-parent-001',
    category: 'PARENT',
    name: 'Anjali & Vivek Tiwari',
    designation: 'Parents of Aryan (Class 10)',
    location: {
      locality: 'Saidpur',
      district: 'Ghazipur',
      state: 'Uttar Pradesh'
    },
    serviceUsed: 'Home Tuition Mentorship',
    thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '2:15',
    title: "How ZYZU'S helped us find the right Math & Science mentor",
    description: 'Hear how the personalized matching process helped Aryan transition from struggling in algebraic foundations to scoring 92% in his school term exams.',
    verified: true,
    featured: true,
    aspectRatio: '16:9'
  },
  {
    id: 'vid-parent-002',
    category: 'PARENT',
    name: 'Dr. Devendra Pandey',
    designation: 'Parent of Riya (Class 12)',
    location: {
      locality: 'Assi Ghat Area',
      district: 'Varanasi',
      state: 'Uttar Pradesh'
    },
    serviceUsed: 'Senior Secondary Coaching',
    thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: '1:48',
    title: 'Safe, verified in-home tutoring without agent commissions',
    description: "Dr. Pandey explains the security and transparency of the ZYZU'S District Coordinator matching system.",
    verified: true,
    aspectRatio: '16:9'
  },
  {
    id: 'vid-student-001',
    category: 'LIBRARY_STUDENT',
    name: 'Alok Singh',
    designation: 'UPSC Civil Services Aspirant',
    location: {
      locality: 'Central Study Hub',
      district: 'Ghazipur',
      state: 'Uttar Pradesh'
    },
    serviceUsed: "ZYZU'S Self-Study Library",
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    duration: '2:40',
    title: '10 Hours of Daily Uninterrupted Focus for UPSC Prelims',
    description: 'Alok shares his experience using the visual seat map to reserve Desk #24 in the full-day shift with guaranteed power backup and fiber internet.',
    verified: true,
    featured: true,
    aspectRatio: '16:9'
  },
  {
    id: 'vid-student-002',
    category: 'LIBRARY_STUDENT',
    name: 'Neha Verma',
    designation: 'UPPSC & Judicial Services Candidate',
    location: {
      locality: 'Saidpur Road',
      district: 'Ghazipur',
      state: 'Uttar Pradesh'
    },
    serviceUsed: 'Evening Shift Seat Booking',
    thumbnail: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    duration: '1:55',
    title: 'Finding a secure, air-conditioned library walking distance from home',
    description: 'Neha explains how real-time vacancy checking saved her from visiting multiple crowded libraries looking for an empty desk.',
    verified: true,
    aspectRatio: '16:9'
  }
];
