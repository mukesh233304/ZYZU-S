import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, BookMarked, CheckCircle2, BookOpen, Users, Building2, 
  Search, ArrowRight, ShieldCheck, Sparkles, Star, MapPin, 
  Clock, Check, Filter, Compass, Zap, UserCheck, Shield, ChevronRight, Award,
  Wind, Wifi, Armchair, BatteryCharging, Coffee, Lock, Eye, AlertCircle,
  BarChart3, Target, Trophy, HelpCircle, FileText
} from 'lucide-react';
import { mockStore } from '../../mock/store';
import { RatingStars } from '../../components/common/RatingStars';
import { notificationEventService } from '../../services/notificationEventService';

interface ServiceItem {
  id: string;
  name: string;
  category: 'ALL' | 'STUDENT' | 'PARTNER' | 'EXAMS';
  categoryLabel: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badge: string;
  badgeColor: string;
  description: string;
  highlights: string[];
  actionLabel: string;
  path: string;
  stats: string;
}

const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'digital-libraries',
    name: 'Find Digital Libraries',
    category: 'STUDENT',
    categoryLabel: 'For Students & Aspirants',
    icon: BookMarked,
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-600',
    badge: 'Live Seat Reservation',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Locate peaceful, air-conditioned study libraries with high-speed Wi-Fi, reserved personal desks, power sockets, and flexible shift passes.',
    highlights: [
      'Live real-time desk availability & shift management',
      'Flexible morning, evening, night, and full-day passes',
      'High-speed Wi-Fi, AC study halls, and clean drinking water'
    ],
    actionLabel: 'Explore Libraries',
    path: '/find-library',
    stats: '120+ Partner Study Halls'
  },
  {
    id: 'mock-tests',
    name: 'Government Exam Mock Tests',
    category: 'EXAMS',
    categoryLabel: 'Competitive Exam Prep',
    icon: CheckCircle2,
    iconBg: 'bg-purple-500/10 border-purple-500/20',
    iconColor: 'text-purple-600',
    badge: 'All India Ranking',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Simulate official government recruitment tests with authentic computerized test interfaces, bilingual questions, and instant percentile analytics.',
    highlights: [
      'UPSSSC PET, SSC CGL/CHSL, Railway NTPC, Police, and TET drills',
      'Real exam timing, negative marking, and detailed answer keys',
      'Automated mistake diagnostics to pinpoint weak syllabus topics'
    ],
    actionLabel: 'Attempt Mock Tests',
    path: '/mock-tests',
    stats: '10,000+ Questions Solved'
  },
  {
    id: 'study-materials',
    name: 'Curated Study Materials & PYQs',
    category: 'STUDENT',
    categoryLabel: 'For Students & Aspirants',
    icon: BookOpen,
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-600',
    badge: 'Downloadable PDFs',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Access high-yield revision summaries, previous years solved examination papers (PYQs), formula cheat sheets, and verified chapter notes.',
    highlights: [
      'Downloadable PDFs prepared by top subject-matter experts',
      'Previous 10 years solved papers with step-by-step solutions',
      'Formula sheets, mind maps, and quick exam-day revision notes'
    ],
    actionLabel: 'Browse Study Notes',
    path: '/study-materials',
    stats: '1,500+ Curated Documents'
  },
  {
    id: 'apply-teacher',
    name: 'Apply as a Home Tutor',
    category: 'PARTNER',
    categoryLabel: 'For Educators & Teachers',
    icon: Users,
    iconBg: 'bg-sky-500/10 border-sky-500/20',
    iconColor: 'text-sky-600',
    badge: 'Zero Commission Fees',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Empower students in your locality. Choose your preferred teaching classes, subjects, timings, and receive direct tuition student leads.',
    highlights: [
      'Direct student connections in your district without middlemen',
      'Official verified teacher badge and printable ID card',
      'Complete flexibility in selecting teaching hours and fees'
    ],
    actionLabel: 'Apply as a Teacher',
    path: '/register/teacher',
    stats: 'Direct Student Matching'
  },
  {
    id: 'list-library',
    name: 'List & Digitize Your Library',
    category: 'PARTNER',
    categoryLabel: 'For Library Owners',
    icon: Building2,
    iconBg: 'bg-indigo-500/10 border-indigo-500/20',
    iconColor: 'text-indigo-600',
    badge: 'Smart Shift Booking',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Digitize your self-study hall or reading room. Automate desk allocations, shift subscriptions, QR pass check-ins, and online payments.',
    highlights: [
      'Boost seat occupancy by reaching thousands of nearby students',
      'Automated shift desk management and student attendance tracking',
      'Digital fee payment links with instant receipt generation'
    ],
    actionLabel: 'Register Your Library',
    path: '/register/library',
    stats: 'Automated Operations'
  }
];

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ALL' | 'STUDENT' | 'PARTNER' | 'EXAMS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Home Tutor Finder State
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [teachingMode, setTeachingMode] = useState<'HOME' | 'ONLINE'>('HOME');
  const [locationQuery, setLocationQuery] = useState('Saidpur, Ghazipur');

  // Load sample approved teachers from mockStore for live preview
  const approvedTeachers = mockStore.getTeachers({ status: 'APPROVED' }).slice(0, 3);

  const handleLaunchTutorSearch = () => {
    const params = new URLSearchParams();
    if (selectedSubject) params.set('subject', selectedSubject);
    if (selectedClass) params.set('class', selectedClass);
    if (teachingMode) params.set('mode', teachingMode);
    if (locationQuery) params.set('locality', locationQuery);
    navigate(`/find-tutor?${params.toString()}`);
  };

  // Interactive Digital Libraries Matcher State
  const [selectedShift, setSelectedShift] = useState('Full Day (15-Hr Pass)');
  const [selectedFacility, setSelectedFacility] = useState('Air Conditioned (AC)');
  const [libraryLocationQuery, setLibraryLocationQuery] = useState('Saidpur, Ghazipur');
  const [selectedExamGoal, setSelectedExamGoal] = useState('Civil Services / UPSC / UPPSC');
  const [previewDesk, setPreviewDesk] = useState<number>(4);

  // Load sample approved libraries from mockStore for live preview
  const approvedLibraries = mockStore.getLibraries().filter(l => l.verificationStatus === 'APPROVED').slice(0, 3);

  const handleLaunchLibrarySearch = () => {
    const params = new URLSearchParams();
    if (selectedFacility) params.set('facility', selectedFacility);
    if (selectedShift) params.set('shift', selectedShift);
    if (libraryLocationQuery) params.set('locality', libraryLocationQuery);
    if (selectedExamGoal) params.set('goal', selectedExamGoal);
    navigate(`/find-library?${params.toString()}`);
  };

  const getEstimatedShiftPrice = (shiftName: string) => {
    switch (shiftName) {
      case 'Morning (06:00 AM - 11:00 AM)': return 499;
      case 'Afternoon (11:00 AM - 04:00 PM)': return 499;
      case 'Evening (04:00 PM - 09:00 PM)': return 499;
      case 'Full Day (15-Hr Pass)': return 999;
      case '24x7 Night Owl Pass': return 1299;
      default: return 499;
    }
  };

  // Interactive Government Exam Mock Tests State
  const [selectedExamTarget, setSelectedExamTarget] = useState('UPSSSC');
  const [drillMode, setDrillMode] = useState('Full Mock (100 Qs / 120m)');
  const [drillLang, setDrillLang] = useState('Bilingual (Hindi / English)');
  const [correctCount, setCorrectCount] = useState<number>(78);
  const [incorrectCount, setIncorrectCount] = useState<number>(12);
  const [hasNegativeMarking, setHasNegativeMarking] = useState<boolean>(true);

  const EXAM_TARGETS = [
    { id: 'UPSSSC', name: 'UPSSSC PET & VDO', cutoff: 68.5 },
    { id: 'UP_POLICE', name: 'UP Police Constable & SI', cutoff: 72.0 },
    { id: 'SSC', name: 'SSC CGL / CHSL / MTS', cutoff: 74.5 },
    { id: 'RAILWAY', name: 'Railway RRB NTPC & Group D', cutoff: 69.0 },
    { id: 'TEACHING', name: 'UPTET / CTET / Super TET', cutoff: 60.0 }
  ];

  const currentExamConfig = EXAM_TARGETS.find(e => e.id === selectedExamTarget) || EXAM_TARGETS[0];
  const penaltyPerWrong = hasNegativeMarking ? 0.25 : 0;
  const positiveMarks = correctCount * 1;
  const penaltyMarks = +(incorrectCount * penaltyPerWrong).toFixed(2);
  const netScore = Math.max(0, +(positiveMarks - penaltyMarks).toFixed(2));

  let estimatedPercentile = 50;
  if (netScore >= 80) estimatedPercentile = +(95 + (netScore - 80) * 0.24).toFixed(1);
  else if (netScore >= 70) estimatedPercentile = +(88 + (netScore - 70) * 0.7).toFixed(1);
  else if (netScore >= 60) estimatedPercentile = +(75 + (netScore - 60) * 1.3).toFixed(1);
  else estimatedPercentile = +(Math.max(10, netScore * 1.2)).toFixed(1);
  estimatedPercentile = Math.min(99.9, estimatedPercentile);

  const handleLaunchMockSearch = () => {
    notificationEventService.emitMockTestSearch({
      examCategory: selectedExamTarget,
      query: currentExamConfig.name,
      districtName: 'Pan-India'
    });

    const params = new URLSearchParams();
    params.set('exam', selectedExamTarget);
    params.set('mode', drillMode);
    params.set('lang', drillLang);
    navigate(`/mock-tests?${params.toString()}`);
  };

  const FEATURED_MOCKS = [
    {
      id: 'mock-upsssc-pet-01',
      category: 'UPSSSC',
      title: 'UPSSSC PET 2026 Full Length Official Simulation #01',
      totalQuestions: 100,
      durationMinutes: 120,
      totalMarks: 100,
      negativeMarking: 0.25,
      language: 'Hindi & English',
      difficulty: 'MIXED',
      badge: 'Free Diagnostic',
      attempts: 6420,
      syllabus: ['General Science', 'Indian History', 'Math & Graphs', 'General Hindi', 'Current Affairs']
    },
    {
      id: 'mock-up-police-si-02',
      category: 'UP_POLICE',
      title: 'UP Police Sub-Inspector (SI) All UP Ranking Drill #03',
      totalQuestions: 160,
      durationMinutes: 120,
      totalMarks: 400,
      negativeMarking: 0.0,
      language: 'Hindi & English',
      difficulty: 'HARD',
      badge: 'High Difficulty',
      attempts: 4890,
      syllabus: ['Law & Constitution (Mool Vidhi)', 'General Hindi', 'Numerical Ability', 'Mental Aptitude']
    },
    {
      id: 'mock-ssc-cgl-04',
      category: 'SSC',
      title: 'SSC CGL Tier-1 TCS Pattern Grand Speed Test #04',
      totalQuestions: 100,
      durationMinutes: 60,
      totalMarks: 200,
      negativeMarking: 0.50,
      language: 'Hindi & English',
      difficulty: 'MEDIUM',
      badge: 'TCS Pattern',
      attempts: 8210,
      syllabus: ['General Intelligence', 'General Awareness', 'Quantitative Aptitude', 'English Comprehension']
    }
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredServices = SERVICES_DATA.filter((service) => {
    const matchesTab = activeTab === 'ALL' || service.category === activeTab || (activeTab === 'STUDENT' && service.category === 'EXAMS');
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Top Futuristic Telemetry Status Bar */}
      <div className="bg-slate-950 border-b border-slate-800 text-slate-300 px-4 py-2 text-[11px] font-mono flex items-center justify-between overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-white font-bold">ZYZU'S QUANTUM ECOSYSTEM</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-brand-400 hidden sm:inline">AI DISCOVERY ACTIVE</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-slate-400">
          <span>500+ VERIFIED TEACHERS</span>
          <span>•</span>
          <span>120+ LIBRARIES</span>
          <span>•</span>
          <span className="text-emerald-400">DISTRICT GROUNDED</span>
        </div>
      </div>

      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(234,88,12,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Compass className="w-3.5 h-3.5 text-brand-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Official ZYZU'S Services Hub</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
            Academic Services &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-orange-400 to-amber-300">
              Personalized Discovery
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto mb-6 font-normal leading-relaxed">
            Direct access to verified 1-on-1 home tutors, air-conditioned digital study libraries, government exam mock test series, and curated academic notes.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative mb-4">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search services (e.g., Home Tutors, Library Seats, Mock Tests, Notes)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-lg backdrop-blur-md transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-bold bg-slate-700 px-2 py-1 rounded cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Jump Intent Chips */}
          <div className="max-w-2xl mx-auto mb-4">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-brand-400 font-bold flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Quick Jump:</span>
              </span>
              {[
                { label: 'Find Home Tutors', targetId: 'home-tutors-section', query: 'Tutor' },
                { label: 'AC Digital Libraries', targetId: 'digital-libraries-section', query: 'Library' },
                { label: 'UPSSSC & Police Mocks', targetId: 'mock-tests-section', query: 'Mock' },
                { label: 'Solved PYQs & Notes', query: 'Study' },
                { label: 'Become a Teacher', query: 'Teacher' }
              ].map(chip => (
                <button
                  key={chip.label}
                  onClick={() => {
                    if (chip.targetId) {
                      scrollToSection(chip.targetId);
                    } else if (chip.query) {
                      setSearchQuery(chip.query);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🚀 FLAGSHIP SECTION: FIND HOME TUTORS (PROMINENT & FUTURISTIC SHOWCASE)     */}
      {/* ========================================================================= */}
      <section id="home-tutors-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border-2 border-brand-500/50 shadow-2xl p-6 sm:p-8 md:p-10 text-white overflow-hidden">
          {/* Ambient Cybernetic Aura Backing */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-500 text-white shadow-xs">
                  FLAGSHIP 1-ON-1 SERVICE
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  100% Verified Educators
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  Free 1st Demo Session
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Find Home Tutors Near You
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Personalized 1-on-1 home educators for CBSE, ICSE, UP Board, and competitive foundations in your locality. Pre-screened and approved by District Administration.
              </p>
            </div>

            <Link
              to="/find-tutor"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-600/30 hover:shadow-brand-500/40 transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <span>Explore All 500+ Tutors</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Interactive Futuristic Tutor Finder Cockpit */}
          <div className="relative z-10 mt-6 bg-slate-950/80 rounded-2xl border border-slate-800 p-4 sm:p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-brand-400 font-bold mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Interactive Home Tutor Matcher:</span>
            </div>

            <div className="space-y-4">
              {/* Step 1: Subject Filter */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  1. Select Target Subject:
                </span>
                <div className="flex flex-wrap gap-2">
                  {['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Science', 'All Subjects'].map(subj => (
                    <button
                      key={subj}
                      onClick={() => setSelectedSubject(subj)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedSubject === subj
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 scale-105'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Class Level Filter */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  2. Select Student Class / Level:
                </span>
                <div className="flex flex-wrap gap-2">
                  {['Class 1-5 (Primary)', 'Class 6-8 (Middle)', 'Class 9-10 (High School)', 'Class 11-12 (Senior Sec)', 'Foundation / NEET / JEE'].map(cls => (
                    <button
                      key={cls}
                      onClick={() => setSelectedClass(cls)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedClass === cls
                          ? 'bg-orange-600 text-white shadow-md shadow-orange-500/30 scale-105'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Mode & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">
                    3. Teaching Delivery Mode:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTeachingMode('HOME')}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                        teachingMode === 'HOME'
                          ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      🏠 Home Visit (At Your House)
                    </button>
                    <button
                      onClick={() => setTeachingMode('ONLINE')}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                        teachingMode === 'ONLINE'
                          ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      💻 Online 1-on-1 Live Class
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">
                    4. Locality / District Grounding:
                  </span>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="Enter locality (e.g., Saidpur, Ghazipur)..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Match Button */}
              <div className="pt-2">
                <button
                  onClick={handleLaunchTutorSearch}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-600 via-orange-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>
                    Find {selectedSubject} Tutors for {selectedClass} in {locationQuery || 'Your Area'} →
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Verified Tutors Spotlight Deck */}
          <div className="relative z-10 mt-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-brand-400" />
                Featured Pre-Screened Educators in Ghazipur / Saidpur:
              </span>
              <Link to="/find-tutor" className="text-xs font-bold text-brand-400 hover:underline">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {approvedTeachers.map((t) => (
                <div 
                  key={t.id}
                  className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 hover:border-brand-500/50 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                            alt={t.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700" 
                          />
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" title="Active Verified" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                            {t.name}
                          </h4>
                          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            District Verified
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ★ {t.rating || 4.9}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <BookOpen className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                        <span className="truncate">{(t.subjects || []).join(', ') || 'Maths, Science'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <GraduationCap className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span className="truncate">{(t.classes || []).join(', ') || 'Class 6 - 10'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{t.localityName || t.city || (t.areasServed && t.areasServed[0]) || 'Saidpur'}, {t.district || t.districtName || 'Ghazipur'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Monthly Tuition</span>
                      <strong className="text-sm font-bold text-white">
                        ₹{(t.expectedFeeMonthly || t.monthlyFee || 2500).toLocaleString('en-IN')}/mo
                      </strong>
                    </div>

                    <Link
                      to={`/find-tutor?teacherId=${t.id}`}
                      className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Book Free Demo
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Core Trust Guarantees */}
          <div className="relative z-10 mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <strong className="text-xs font-bold text-white block">Identity Verified</strong>
              <span className="text-[10px] text-slate-400">Police & degree pre-checked</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <strong className="text-xs font-bold text-white block">Free Demo Session</strong>
              <span className="text-[10px] text-slate-400">No commitment upfront</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <MapPin className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <strong className="text-xs font-bold text-white block">Local to Your Area</strong>
              <span className="text-[10px] text-slate-400">Within 5 km radius</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <Award className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <strong className="text-xs font-bold text-white block">Zero Commission</strong>
              <span className="text-[10px] text-slate-400">Direct transparent fee</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🏛️ FLAGSHIP SECTION: FIND AC DIGITAL LIBRARIES (FUTURISTIC SHOWCASE)        */}
      {/* ========================================================================= */}
      <section id="digital-libraries-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border-2 border-emerald-500/50 shadow-2xl p-6 sm:p-8 md:p-10 text-white overflow-hidden">
          {/* Ambient Cybernetic Aura Backing */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-xs">
                  FLAGSHIP SELF-STUDY NETWORK
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-emerald-400" />
                  100% AC & Power Backup
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                  <Armchair className="w-3.5 h-3.5 text-teal-400" />
                  Live Seat Reservation
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Free 1-Day Trial Pass
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Find AC Digital Libraries Near You
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Dedicated, peaceful, air-conditioned study spaces with ergonomic executive chairs, high-speed 5G Wi-Fi, reserved personal charging points, and flexible morning, afternoon, evening, and 24x7 full-day shift passes.
              </p>
            </div>

            <Link
              to="/find-library"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <span>Explore All 120+ Libraries</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Interactive Futuristic Library Matcher Cockpit */}
          <div className="relative z-10 mt-6 bg-slate-950/80 rounded-2xl border border-slate-800 p-4 sm:p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 font-bold">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Interactive Digital Library & Shift Matcher:</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span>ESTIMATED PASS:</span>
                <span className="text-emerald-400 font-bold text-xs">
                  ₹{getEstimatedShiftPrice(selectedShift)}/mo
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Step 1: Shift Selection */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  1. Choose Your Preferred Study Shift:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Morning (06:00 AM - 11:00 AM)', tag: '₹499/mo' },
                    { label: 'Afternoon (11:00 AM - 04:00 PM)', tag: '₹499/mo' },
                    { label: 'Evening (04:00 PM - 09:00 PM)', tag: '₹499/mo' },
                    { label: 'Full Day (15-Hr Pass)', tag: '₹999/mo • POPULAR' },
                    { label: '24x7 Night Owl Pass', tag: '₹1299/mo' }
                  ].map(shift => (
                    <button
                      key={shift.label}
                      onClick={() => setSelectedShift(shift.label)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedShift === shift.label
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 scale-105'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{shift.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        selectedShift === shift.label ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {shift.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Essential Facility / Amenity Priority */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  2. Priority Facility / Amenity:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Air Conditioned (AC)',
                    'High-Speed 5G Wi-Fi',
                    '100% Power Backup',
                    'Personal Storage Locker',
                    'Pin-Drop Silence Zone',
                    'RO Cold & Hot Water'
                  ].map(fac => (
                    <button
                      key={fac}
                      onClick={() => setSelectedFacility(fac)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedFacility === fac
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-500/30 scale-105'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                      }`}
                    >
                      {fac}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Target Examination Category & Locality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">
                    3. Target Exam Preparation Goal:
                  </span>
                  <div className="relative">
                    <select
                      value={selectedExamGoal}
                      onChange={(e) => setSelectedExamGoal(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Civil Services / UPSC / UPPSC">Civil Services / UPSC / UPPSC</option>
                      <option value="NEET / JEE / Medical">NEET / JEE / Medical & Engineering</option>
                      <option value="SSC / Railway / UP Police">SSC CGL / Railway NTPC / UP Police</option>
                      <option value="State Board / High School">State Board / CBSE / ICSE (10-12th)</option>
                      <option value="General Self-Study & Reading">General Self-Study & Quiet Reading</option>
                    </select>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">
                    4. Locality / District Grounding:
                  </span>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={libraryLocationQuery}
                      onChange={(e) => setLibraryLocationQuery(e.target.value)}
                      placeholder="Enter locality (e.g., Saidpur, Ghazipur)..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-500">Presets:</span>
                    {['Saidpur', 'Gora Bazar', 'Lanka, Varanasi', 'Zamania'].map(loc => (
                      <button
                        key={loc}
                        onClick={() => setLibraryLocationQuery(`${loc}, Ghazipur`)}
                        className="text-[10px] text-emerald-400/80 hover:text-emerald-300 hover:underline cursor-pointer"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Match Launch Button */}
              <div className="pt-2">
                <button
                  onClick={handleLaunchLibrarySearch}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30 active:scale-98 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>
                    Find AC Libraries with {selectedShift.split(' ')[0]} in {libraryLocationQuery || 'Your Area'} →
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Miniature Seat Pod Simulator */}
          <div className="relative z-10 mt-8 bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/70">
              <div>
                <span className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                  <Armchair className="w-4 h-4 text-emerald-400" />
                  Interactive Real-Time Desk Pod Simulator:
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click any desk to preview individual amenities, 240V power socket, and live reservation status.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available (5)
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Reserved (3)
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Selected
                </span>
              </div>
            </div>

            {/* 8-Desk Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 mb-4">
              {[
                { id: 1, label: 'Desk 01', status: 'OCCUPIED', shift: 'Morning Shift', occupant: 'Aspirant #104' },
                { id: 2, label: 'Desk 02', status: 'OCCUPIED', shift: 'Full Day', occupant: 'UPSC Aspirant' },
                { id: 3, label: 'Desk 03', status: 'AVAILABLE', shift: 'All Shifts', occupant: 'Ready to Book' },
                { id: 4, label: 'Desk 04', status: 'AVAILABLE', shift: 'All Shifts', occupant: 'Selected Desk' },
                { id: 5, label: 'Desk 05', status: 'AVAILABLE', shift: 'All Shifts', occupant: 'Ready to Book' },
                { id: 6, label: 'Desk 06', status: 'OCCUPIED', shift: 'Evening Shift', occupant: 'NEET Scholar' },
                { id: 7, label: 'Desk 07', status: 'AVAILABLE', shift: 'All Shifts', occupant: 'Ready to Book' },
                { id: 8, label: 'Desk 08', status: 'AVAILABLE', shift: 'All Shifts', occupant: 'Ready to Book' },
              ].map((desk) => {
                const isSelected = previewDesk === desk.id;
                const isAvailable = desk.status === 'AVAILABLE';
                return (
                  <button
                    key={desk.id}
                    onClick={() => setPreviewDesk(desk.id)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                        : isAvailable
                        ? 'bg-slate-900 hover:bg-slate-800/80 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/80 border-slate-800 text-slate-500'
                    }`}
                  >
                    <Armchair className={`w-5 h-5 mx-auto mb-1 ${
                      isSelected ? 'text-amber-400' : isAvailable ? 'text-emerald-400' : 'text-slate-600'
                    }`} />
                    <strong className="text-xs block font-mono">{desk.label}</strong>
                    <span className="text-[9px] block uppercase font-mono mt-0.5">
                      {isSelected ? 'SELECTED' : isAvailable ? 'VACANT' : 'BOOKED'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Desk Specs Drawer */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-slate-300">
                <span className="font-mono text-emerald-400 font-bold">
                  DESK #{String(previewDesk).padStart(2, '0')} CONFIGURATION:
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-300">
                  <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
                  240V Dedicated Socket + USB
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-300">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  100 Mbps Dedicated Lane
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-300">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  AC Climate Controlled
                </span>
              </div>

              <Link
                to={`/find-library?desk=${previewDesk}&locality=${encodeURIComponent(libraryLocationQuery)}`}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 text-center transition-all shadow-xs"
              >
                Claim 1-Day Trial for Desk #{previewDesk} →
              </Link>
            </div>
          </div>

          {/* Live Verified Libraries Spotlight Deck */}
          <div className="relative z-10 mt-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Featured Pre-Inspected Study Libraries in {libraryLocationQuery.split(',')[0] || 'District'}:
              </span>
              <Link to="/find-library" className="text-xs font-bold text-emerald-400 hover:underline">
                View All 120+ →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {approvedLibraries.map((lib) => {
                const total = lib.totalSeats || 50;
                const available = lib.availableSeats ?? 18;
                const occupiedPct = Math.min(100, Math.round(((total - available) / total) * 100));

                return (
                  <div
                    key={lib.id}
                    className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Photo Header */}
                      <div className="relative h-36 rounded-xl overflow-hidden mb-3 border border-slate-800">
                        <img
                          src={lib.images?.[0] || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800'}
                          alt={lib.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/90 text-slate-950 shadow-sm flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-slate-950" />
                          District Approved
                        </span>
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-amber-300 border border-slate-700">
                          ★ {lib.rating || 4.9} ({lib.reviewsCount || 34})
                        </span>
                      </div>

                      {/* Name & Address */}
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1 mb-1">
                        {lib.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-3 line-clamp-1">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>{lib.address || `${lib.city}, ${lib.districtName}`}</span>
                      </p>

                      {/* Facilities Chips */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(lib.facilities || ['Air Conditioned', '5G Wi-Fi', 'Power Backup']).slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                          >
                            {f.replace('(AC)', '').trim()}
                          </span>
                        ))}
                      </div>

                      {/* Live Seat Occupancy Meter */}
                      <div className="mb-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span className="text-slate-400">LIVE OCCUPANCY:</span>
                          <span className={`font-bold ${available > 10 ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {available} of {total} Desks Free
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              occupiedPct > 80 ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${occupiedPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Footer with Price & CTA */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Monthly Starting</span>
                        <strong className="text-sm font-bold text-white">
                          ₹{(lib.monthlyStartingPrice || 499).toLocaleString('en-IN')}/mo
                        </strong>
                      </div>

                      <Link
                        to={`/find-library?libraryId=${lib.id}`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        Reserve Desk
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4 Core Trust Guarantees for Libraries */}
          <div className="relative z-10 mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <strong className="text-xs font-bold text-white block">District Pre-Inspected</strong>
              <span className="text-[10px] text-slate-400">Verified ventilation, fire safety & CCTV</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <Armchair className="w-5 h-5 text-teal-400 mx-auto mb-1" />
              <strong className="text-xs font-bold text-white block">Guaranteed Personal Desk</strong>
              <span className="text-[10px] text-slate-400">Reserved numbered desk with power point</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <Lock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <strong className="text-xs font-bold text-white block">Pin-Drop Silence Zone</strong>
              <span className="text-[10px] text-slate-400">Acoustic partitions & strict compliance</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <strong className="text-xs font-bold text-white block">Free 1-Day Trial Pass</strong>
              <span className="text-[10px] text-slate-400">Zero upfront commitment test study</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🎯 FLAGSHIP SECTION: GOVERNMENT EXAM MOCK TESTS & CBT DRILL STUDIO         */}
      {/* ========================================================================= */}
      <section id="mock-tests-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950/70 to-slate-900 border border-purple-500/30 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Ambient Glowing Orbs */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-10 w-60 h-60 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header with Pillars */}
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>OFFICIAL CBT EXAM SIMULATOR</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Latest 2026 TCS / NTA Patterns
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                All-State Percentile & Rank Predictor
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Bilingual Hindi & English
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Real Computer-Based Mock Tests & Rank Forecaster</span>
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse hidden sm:inline" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1.5 leading-relaxed">
              Simulate exact exam hall pressure with authentic bilingual questions, instant percentile benchmarks against 10,000+ candidates, and automated mistake diagnostics for UPSSSC, UP Police, SSC, Railway, and State Entrance examinations.
            </p>
          </div>

          {/* Main Grid: Interactive Cockpit + Featured Tests Deck */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 pt-6 border-t border-purple-500/20">
            
            {/* Left Column (7 Cols): Examination Cockpit & Score Forecaster */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Exam Target Selector */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold block mb-2.5 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span>Target Competitive Examination</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EXAM_TARGETS.map(exam => {
                    const isSelected = selectedExamTarget === exam.id;
                    return (
                      <button
                        key={exam.id}
                        type="button"
                        onClick={() => setSelectedExamTarget(exam.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-900/40 ring-1 ring-purple-300'
                            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <strong className="text-xs font-bold block truncate">{exam.name}</strong>
                        <div className="flex items-center justify-between text-[10px] mt-1 text-slate-300/80">
                          <span>Cutoff ~{exam.cutoff}</span>
                          <span className={`text-[9px] px-1 rounded ${isSelected ? 'bg-purple-700 text-purple-100' : 'bg-slate-800 text-slate-400'}`}>
                            100 Qs
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drill Format & Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Drill Mode */}
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5">
                    Drill Format
                  </label>
                  <select
                    value={drillMode}
                    onChange={(e) => setDrillMode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-400"
                  >
                    <option value="Full Mock (100 Qs / 120m)">Full Length Mock (100 Qs / 120m)</option>
                    <option value="Speed Sprint Drill (30 Qs / 25m)">Speed Sprint Drill (30 Qs / 25m)</option>
                    <option value="Previous Year Paper (PYQ Solved)">Previous Year Paper (PYQ Solved)</option>
                  </select>
                </div>

                {/* Question Language */}
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5">
                    Question Language
                  </label>
                  <select
                    value={drillLang}
                    onChange={(e) => setDrillLang(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-400"
                  >
                    <option value="Bilingual (Hindi / English)">Bilingual (Hindi & English)</option>
                    <option value="English Only">English Medium Only</option>
                    <option value="Hindi Only">Hindi Medium Only</option>
                  </select>
                </div>
              </div>

              {/* Negative Marking Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-purple-500/20">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="negativeMarkingToggle"
                    checked={hasNegativeMarking}
                    onChange={(e) => setHasNegativeMarking(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-700 bg-slate-800"
                  />
                  <label htmlFor="negativeMarkingToggle" className="text-xs text-slate-200 font-medium cursor-pointer">
                    Apply Official Negative Marking Deduction (1/4th = -0.25 marks per wrong answer)
                  </label>
                </div>
                <span className="text-[10px] font-mono text-purple-400 font-bold">
                  {hasNegativeMarking ? '-0.25 MKS' : 'OFF'}
                </span>
              </div>

              {/* Interactive Score & Percentile Forecaster */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-900 border border-purple-500/40 shadow-inner space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <strong className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Real-Time Score & Cutoff Forecaster
                    </strong>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    Live Formula Sync
                  </span>
                </div>

                {/* Correct Answers Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300">Expected Correct Answers:</span>
                    <strong className="font-mono text-emerald-400 font-bold">{correctCount} of 100 (+{positiveMarks} Mks)</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={correctCount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCorrectCount(val);
                      if (val + incorrectCount > 100) {
                        setIncorrectCount(100 - val);
                      }
                    }}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>

                {/* Incorrect Answers Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300">Expected Incorrect Answers:</span>
                    <strong className="font-mono text-rose-400 font-bold">{incorrectCount} Wrong (-{penaltyMarks} Mks)</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={100 - correctCount}
                    value={incorrectCount}
                    onChange={(e) => setIncorrectCount(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>

                {/* Dynamic Calculated Results Board */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-purple-500/20 text-center">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono block">POSITIVE</span>
                    <strong className="text-sm font-bold text-emerald-400">+{positiveMarks}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono block">PENALTY</span>
                    <strong className="text-sm font-bold text-rose-400">-{penaltyMarks}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/50">
                    <span className="text-[10px] text-purple-300 font-mono block">NET FORECAST</span>
                    <strong className="text-sm font-black text-white">{netScore} / 100</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-500/50">
                    <span className="text-[10px] text-indigo-300 font-mono block">EST. PERCENTILE</span>
                    <strong className="text-sm font-black text-cyan-300">{estimatedPercentile}th %ile</strong>
                  </div>
                </div>

                {/* Cutoff Verdict Indicator */}
                <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                  netScore >= currentExamConfig.cutoff
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                }`}>
                  <div className="flex items-center gap-1.5 truncate">
                    <Trophy className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {netScore >= currentExamConfig.cutoff
                        ? `Above Expected General Cutoff (~${currentExamConfig.cutoff}) for ${currentExamConfig.name}`
                        : `Target Cutoff is ~${currentExamConfig.cutoff}. More focused revisions recommended.`}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 shrink-0">
                    {netScore >= currentExamConfig.cutoff ? 'CLEARED' : 'BORDERLINE'}
                  </span>
                </div>
              </div>

              {/* Launch CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleLaunchMockSearch}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Launch CBT Diagnostic Exam</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-[11px] text-slate-400">
                  Instant free access • Detailed solution keys • No credit card needed
                </span>
              </div>
            </div>

            {/* Right Column (5 Cols): Live Featured Tests Deck */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>Live Official Test Series Deck</span>
                </label>
                <Link
                  to="/mock-tests"
                  className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-0.5"
                >
                  <span>View All 50+ Tests</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Cards List */}
              <div className="space-y-3">
                {FEATURED_MOCKS.map(mock => (
                  <div
                    key={mock.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition-all duration-300 shadow-md group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {mock.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-cyan-400" />
                        <span>{mock.attempts.toLocaleString('en-IN')} Attempts</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors leading-snug">
                      {mock.title}
                    </h4>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{mock.durationMinutes} Mins</span>
                      </span>
                      <span>•</span>
                      <span>{mock.totalQuestions} Questions</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">{mock.language}</span>
                    </div>

                    {/* Syllabus Tags */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {mock.syllabus.slice(0, 3).map((sub, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                          {sub}
                        </span>
                      ))}
                      {mock.syllabus.length > 3 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          +{mock.syllabus.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        Difficulty: <strong className="text-amber-400">{mock.difficulty}</strong>
                      </span>
                      <Link
                        to={`/mock-tests?exam=${mock.category}`}
                        className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        Start Free Mock
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 4 Core Trust Guarantees for Competitive Exams */}
          <div className="relative z-10 mt-8 pt-6 border-t border-purple-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <ShieldCheck className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <strong className="text-xs font-bold text-white block">100% Latest TCS/NTA Pattern</strong>
              <span className="text-[10px] text-slate-400">Authentic exam timer, question palette & marking scheme</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <Trophy className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <strong className="text-xs font-bold text-white block">All-State Percentile Ranking</strong>
              <span className="text-[10px] text-slate-400">Live benchmark against 10,000+ genuine competitive aspirants</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <strong className="text-xs font-bold text-white block">Bilingual Hindi & English</strong>
              <span className="text-[10px] text-slate-400">Seamless 1-click language toggling for every question</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <strong className="text-xs font-bold text-white block">Instant Mistake Diagnostics</strong>
              <span className="text-[10px] text-slate-400">Step-by-step text & video solutions with weak-topic tagging</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 📚 OTHER CORE ZYZU'S SERVICES (LIBRARIES, MOCKS, NOTES, REGISTRATION)   */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Explore More Academic & Institutional Services
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Digital study libraries, competitive exam series, and educator partner opportunities.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Services' },
              { id: 'STUDENT', label: 'Learners' },
              { id: 'EXAMS', label: 'Exam Prep' },
              { id: 'PARTNER', label: 'Partners' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const Icon = service.icon;
            return (
              <div 
                key={service.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${service.iconBg}`}>
                      <Icon className={`w-6 h-6 ${service.iconColor}`} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${service.badgeColor}`}>
                      {service.badge}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {service.categoryLabel}
                  </span>
                  <h4 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors">
                    {service.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="px-6 py-3 bg-slate-50/70 border-y border-slate-100 flex-1">
                  <div className="space-y-2">
                    {service.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer with CTA */}
                <div className="p-6 pt-4 flex items-center justify-between gap-3 bg-white mt-auto">
                  <span className="text-[11px] font-bold text-slate-500">
                    {service.stats}
                  </span>
                  <Link
                    to={service.path}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-all group-hover:translate-x-0.5 shadow-sm cursor-pointer"
                  >
                    <span>{service.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-royal-blue-950 to-slate-900 p-8 border border-slate-800 text-white shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <strong className="text-2xl sm:text-3xl font-black text-white block">100%</strong>
              <span className="text-xs text-slate-300 font-medium">Verified Backgrounds</span>
            </div>
            <div className="space-y-1">
              <strong className="text-2xl sm:text-3xl font-black text-brand-400 block">500+</strong>
              <span className="text-xs text-slate-300 font-medium">Expert Home Tutors</span>
            </div>
            <div className="space-y-1">
              <strong className="text-2xl sm:text-3xl font-black text-emerald-400 block">120+</strong>
              <span className="text-xs text-slate-300 font-medium">AC Digital Libraries</span>
            </div>
            <div className="space-y-1">
              <strong className="text-2xl sm:text-3xl font-black text-purple-400 block">10,000+</strong>
              <span className="text-xs text-slate-300 font-medium">Mock Drills Solved</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
