import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, BookMarked, MapPin, ShieldCheck, 
  ArrowRight, Users, CheckCircle2, Star, Sparkles, 
  Clock, Award, ChevronDown, BookOpen, Zap 
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { RatingStars } from '../../components/common/RatingStars';
import { LIBRARY_FACILITIES } from '../../constants';
import { mockStore } from '../../mock/store';
import { LocationHierarchySelection } from '../../types/location';
import { policyService } from '../../services/policyService';
import { OfferPriceDisplay } from '../../components/common/OfferBadge';

// Premium Modular Homepage Components
import { LiveOfferBanner } from '../../components/homepage/LiveOfferBanner';
import { HeroCarousel } from '../../components/homepage/HeroCarousel';
import { LocationDiscovery } from '../../components/homepage/LocationDiscovery';
import { ExamTestIntelligenceSection } from '../../components/homepage/ExamTestIntelligenceSection';
import { AcademicNotesShowcaseSection } from '../../components/homepage/AcademicNotesShowcaseSection';
import { ParentReviewSection } from '../../components/homepage/ParentReviewSection';
import { VideoTestimonialsSection } from '../../components/homepage/VideoTestimonialsSection';
import { HomepageAdBanner } from '../../components/homepage/HomepageAdBanner';
import { HelpCenterFaqSection } from '../../components/homepage/HelpCenterFaqSection';
import { PreFooterConversionSection } from '../../components/homepage/PreFooterConversionSection';
import { DemoBookingModal } from '../../components/demo';
import { DemoServiceType } from '../../types/demo';

export const HomePage: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [, setPolicyVersion] = useState(0);

  // Demo Booking Modal state
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoModalService, setDemoModalService] = useState<DemoServiceType>('LIBRARY');
  const [demoPrefillEntity, setDemoPrefillEntity] = useState<{ id?: string; name?: string } | undefined>(undefined);


  // Real-time reactive subscription to Super Admin & District Admin policy changes
  useEffect(() => {
    return policyService.subscribe(() => setPolicyVersion(v => v + 1));
  }, []);

  // Centralized Pan-India Hierarchical Location Selection
  const [locationSelection, setLocationSelection] = useState<LocationHierarchySelection>({
    countryId: 'loc-country-in',
    stateId: 'loc-state-up',
    districtId: 'dist-gzp',
    localityId: 'loc-gzp-saidpur',
    stateName: 'Uttar Pradesh',
    districtName: 'Ghazipur',
    localityName: 'Saidpur',
  });

  const districtName = locationSelection.districtName || 'Ghazipur';

  // Featured Teachers from Store
  const allApprovedTeachers = mockStore.getTeachers({ status: 'APPROVED' });
  const featuredTeachers = [...allApprovedTeachers]
    .sort((a, b) => (a.id === 'usr-teacher-rahul' ? -1 : b.id === 'usr-teacher-rahul' ? 1 : 0))
    .slice(0, 3);

  // Featured Libraries from Store
  const allApprovedLibs = mockStore.getLibraries().filter(l => l.verificationStatus === 'APPROVED');
  const featuredLibraries = [...allApprovedLibs]
    .sort((a, b) => (a.id === 'lib-focus-saidpur' ? -1 : b.id === 'lib-focus-saidpur' ? 1 : 0))
    .slice(0, 2);

  const faqs = [
    {
      q: 'Does a student directly hire the home tutor without verification?',
      a: "No. To protect students and uphold educational standards, students submit their subject and location requirements. The ZYZU'S District Admin verifies credentials and matches the most qualified verified teacher in that specific locality."
    },
    {
      q: 'How do library shifts and seat reservations work?',
      a: 'Each study library offers configurable shifts (Morning, Afternoon, Evening, or Full Day). When booking, students choose their preferred shift and can select a specific desk number from our live visual seat map.'
    },
    {
      q: 'Can a library owner add walk-in students who do not have an online account?',
      a: 'Yes. The Library Owner portal includes an "Add Manual Student" feature that allows offline students to be assigned seats, shifts, and fee tracking without needing an online account.'
    },
    {
      q: 'How does District Admin verification work for teachers?',
      a: 'Every tutor undergoes multi-step KYC verification: Identity verification with masked Aadhaar, university degree verification (BHU, AKTU, State University), teaching experience assessment, and physical location verification.'
    }
  ];

  return (
    <div className="bg-slate-50/50 text-slate-900 min-h-screen pb-12 sm:pb-16 selection:bg-brand-500 selection:text-white relative font-sans">
      {/* ========================================================================= */}
      {/* 1. LIVE CAMPAIGN & PROMOTIONAL OFFERS BANNER (Rotational + Copy Coupons) */}
      {/* ========================================================================= */}
      <LiveOfferBanner districtName={districtName} />

      {/* ========================================================================= */}
      {/* 2. FULL-WIDTH HERO IMAGE CAROUSEL (MNC EdTech Standard & 100% Contrast) */}
      {/* ========================================================================= */}
      <HeroCarousel onLocationResolved={setLocationSelection} />

      {/* ========================================================================= */}
      {/* 3. PLATFORM METRICS & SOCIAL PROOF RIBBON                                 */}
      {/* ========================================================================= */}
      <section className="relative -mt-6 sm:-mt-8 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 p-4 sm:p-5 lg:p-6 shadow-[0_12px_36px_-10px_rgba(0,0,0,0.06)] grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="p-2 sm:p-3 text-center sm:text-left flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-200/80 text-brand-600 flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">120+</div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">Verified Home Tutors</div>
            </div>
          </div>

          <div className="p-2 sm:p-3 text-center sm:text-left flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">40+</div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">AC Digital Libraries</div>
            </div>
          </div>

          <div className="p-2 sm:p-3 text-center sm:text-left flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">2,500+</div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">Active Students</div>
            </div>
          </div>

          <div className="p-2 sm:p-3 text-center sm:text-left flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200/80 text-sky-600 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">100%</div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">Admin KYC Approved</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. LOCATION-BASED DISCOVERY HUB ("Find a Study Library Near You")          */}
      {/* ========================================================================= */}
      <LocationDiscovery
        locationSelection={locationSelection}
        onLocationChange={setLocationSelection}
      />

      {/* ========================================================================= */}
      {/* 5. FEATURED VERIFIED TEACHERS SECTION                                    */}
      {/* ========================================================================= */}
      <section 
        id="verified-teachers" 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>District Admin KYC Verified</span>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              Featured Verified Home Tutors
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm font-normal max-w-2xl leading-relaxed">
              Experienced teachers verified by District Admins for background credentials, degree authenticity, and local locality availability.
            </p>
          </div>
          <Link to="/find-tutor">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} className="border-slate-300 text-slate-800 hover:text-slate-950 hover:bg-slate-100 bg-white shadow-xs font-bold rounded-xl px-4 py-2">
              View All Tutors
            </Button>
          </Link>
        </div>

        {/* Operator Managed Advertisement: Mentorship & Tuition Campaign Slot */}
        <HomepageAdBanner placement="MENTORSHIP_SLOT" />

        {/* Teacher Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {featuredTeachers.map((teacher) => {
            const tutorFee = teacher.expectedFeeMonthly || teacher.monthlyFee || 3000;
            const pricing = policyService.getBestActiveOffer({
              districtName: teacher.districtName || 'Ghazipur',
              serviceType: 'TUITION',
              targetId: teacher.id,
              amount: tutorFee,
            });

            return (
              <Card key={teacher.id} hoverable className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 hover:border-brand-500/40">
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3.5">
                    <div className="relative">
                      <img
                        src={teacher.avatarUrl}
                        alt={teacher.name}
                        className="w-14 h-14 rounded-xl object-cover border border-brand-500/20 shrink-0 shadow-xs"
                      />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">
                        ✓
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <h4 className="font-extrabold text-slate-950 text-base truncate">{teacher.name}</h4>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                            {teacher.districtName}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold truncate mt-0.5">{teacher.degree}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <RatingStars rating={teacher.rating || 0} reviewsCount={teacher.reviewsCount} size="sm" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {teacher.subjects.map(s => (
                      <span key={s} className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-slate-600 font-medium space-y-1.5 pt-1.5 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="truncate">Areas: {(teacher.areasServed || []).join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{teacher.experienceYears}+ Years Teaching Experience</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Expected Fee</span>
                    <OfferPriceDisplay
                      originalPrice={tutorFee}
                      pricing={pricing}
                      unit="/ mo"
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <Link to={`/teacher/${teacher.id}`}>
                      <Button size="sm" variant="outline" className="font-bold border-slate-300 rounded-lg px-2.5 py-1 text-xs">Profile</Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        setDemoModalService('HOME_TUITION');
                        setDemoPrefillEntity({ id: teacher.id, name: teacher.name });
                        setDemoModalOpen(true);
                      }}
                      className="font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-2.5 py-1 text-xs"
                    >
                      Demo
                    </Button>
                    <Link to={`/student/tutor-requests/new?preferredTeacherId=${teacher.id}&teacherName=${encodeURIComponent(teacher.name)}`}>
                      <Button size="sm" className="font-bold shadow-xs rounded-lg px-3 py-1 text-xs">Book</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FEATURED SELF-STUDY LIBRARIES SECTION                                 */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider shadow-xs">
              <BookMarked className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Quiet High-Focus Spaces</span>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              Self-Study Digital Libraries
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm font-normal max-w-2xl leading-relaxed">
              Clean, quiet, and fully air-conditioned spaces with dedicated charging desks and verified shift-based seat reservations.
            </p>
          </div>
          <Link to="/find-library">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} className="border-slate-300 text-slate-800 hover:text-slate-950 hover:bg-slate-100 bg-white shadow-xs font-bold rounded-xl px-4 py-2">
              Explore All Libraries
            </Button>
          </Link>
        </div>

        {/* Operator Managed Advertisement: Quiet Hubs & Library Campaign Slot */}
        <HomepageAdBanner placement="QUIET_HUBS_SLOT" />

        {/* Library Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {featuredLibraries.map((lib) => {
            const originalPrice = (lib.id === 'lib-focus-saidpur' || lib.name.toLowerCase().includes('focuspoint')) 
              ? 1000 
              : (lib.monthlyStartingPrice || lib.monthlyFee || 499);
            const pricing = policyService.getBestActiveOffer({
              districtName: lib.districtName || 'Ghazipur',
              serviceType: 'LIBRARY',
              targetId: lib.id,
              amount: originalPrice,
            });

            return (
              <Card key={lib.id} hoverable className="p-0 overflow-hidden bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row hover:border-brand-500/40">
                <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden shrink-0">
                  <img
                    src={(lib.images && lib.images[0]) || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=1200'}
                    alt={lib.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-white font-black text-[10px] uppercase shadow-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {lib.availableSeats} Seats Open
                  </div>
                </div>

                <div className="p-5 sm:p-6 sm:w-3/5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{lib.area}, {lib.districtName}</span>
                      </span>
                      <RatingStars rating={lib.rating || 0} reviewsCount={lib.reviewsCount} size="sm" />
                    </div>
                    <h4 className="font-extrabold text-slate-950 text-base leading-snug">{lib.name}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">{lib.description}</p>
                    
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {lib.facilities.slice(0, 3).map(f => (
                        <span key={f} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2.5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Monthly Pass</span>
                      <OfferPriceDisplay
                        originalPrice={originalPrice}
                        pricing={pricing}
                        unit="/ mo"
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link to={`/library/${lib.id}`}>
                        <Button size="sm" variant="outline" className="font-bold border-slate-300 rounded-lg px-2.5 py-1 text-xs">View</Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => {
                          setDemoModalService('LIBRARY');
                          setDemoPrefillEntity({ id: lib.id, name: lib.name });
                          setDemoModalOpen(true);
                        }}
                        className="font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 rounded-lg px-2.5 py-1 text-xs"
                      >
                        Demo
                      </Button>
                      <Link to={`/libraries/${lib.id}/book`}>
                        <Button size="sm" className="font-bold shadow-xs rounded-lg px-3 py-1 text-xs">Book</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. EXAM TEST INTELLIGENCE (NTA CBT, MISTAKE BOOK & TEST SERIES)           */}
      {/* ========================================================================= */}
      <ExamTestIntelligenceSection />

      {/* ========================================================================= */}
      {/* 8. ACADEMIC & COMPETITIVE NOTES REPOSITORY (MIND MAPS & 10-YR PYQ VAULT)   */}
      {/* ========================================================================= */}
      <AcademicNotesShowcaseSection />

      {/* ========================================================================= */}
      {/* 9. VERIFIED REVIEWS & FEEDBACK ("What Our Community Says")                */}
      {/* ========================================================================= */}
      <ParentReviewSection />

      {/* ========================================================================= */}
      {/* 10. VIDEO TESTIMONIALS SECTION ("Real Stories. Real Progress.")           */}
      {/* ========================================================================= */}
      <VideoTestimonialsSection />

      {/* ========================================================================= */}
      {/* 11. MNC EDTECH VALUE PILLARS ("Why Parents & Students Choose FocusPoint") */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold uppercase tracking-wider shadow-xs">
            Enterprise Academic Standard
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
            Why Parents &amp; Students Choose ZYZU'S
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-xl mx-auto">
            Built to provide absolute security, transparent matching, academic excellence, and modern educational infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Pillar 1: KYC Verified */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-slate-950">100% KYC Verified Educators</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Every educator's identity, university degree (BHU, AKTU, State Universities), and police verification are thoroughly authenticated by District Admins.
            </p>
          </div>

          {/* Pillar 2: Safe Admin Matching */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-3.5">
            <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200/80 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-slate-950">Safe District Admin Matching</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              No direct public phone number leaking or spam calls. Students submit requirements and our local admin matches the best nearby mentor.
            </p>
          </div>

          {/* Pillar 3: Visual Seat Booking */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80 shadow-xs">
              <BookMarked className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-slate-950">Visual Seat Booking &amp; AC Hubs</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Reserve your exact study cabin or desk with interactive visual maps, flexible morning/evening shifts, 5G Wi-Fi, and power backup.
            </p>
          </div>

          {/* Pillar 4: Curated Study Materials */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-slate-950">Curated Study Materials</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Class-wise chapter notes, subject-wise resources, exam preparation mind maps, and practice resources for academic and competitive exam success.
            </p>
          </div>

          {/* Pillar 5: Government Exam Mock Tests */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/80 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-slate-950">Government Mock Tests &amp; Test Series</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Official test series, chapter-wise &amp; full CBT tests, previous-year papers, performance analytics, and Personal Mistake Book tracking.
            </p>
          </div>

          {/* Pillar 6: Zero Brokerage */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200/80 shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-slate-950">Zero Brokerage &amp; Transparency</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Transparent, standard monthly pricing with digital receipts, automated attendance tracking, and zero middleman commissions.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. STANDARDIZED LIBRARY FACILITIES & DIGITAL INTEGRATION                 */}
      {/* ========================================================================= */}
      <section id="library-facilities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 lg:p-10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)] space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
              Accredited Infrastructure
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Standardized Study Library Facilities
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Every ZYZU'S affiliated library is inspected by District Admins to meet strict infrastructure and academic standards.
            </p>
          </div>

          {/* Standard Facilities Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {LIBRARY_FACILITIES.map((f) => (
              <div key={f.id} className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 text-center space-y-1.5 shadow-2xs hover:border-brand-400 hover:bg-brand-50/30 hover:-translate-y-0.5 transition-all">
                <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center mx-auto border border-brand-200/80 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                </div>
                <p className="text-xs font-bold text-slate-800 leading-snug">{f.label}</p>
              </div>
            ))}
          </div>

          {/* Extended Digital Learning Amenities */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 text-center sm:text-left">
              Integrated Digital Learning Facilities (Per Subscription Plan)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/50 border border-emerald-200/70 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-black text-slate-900 mb-0.5">Digital Study Materials Access</h5>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">Students can access eligible digital study resources directly on their devices.</p>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-purple-50/50 border border-purple-200/70 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-black text-slate-900 mb-0.5">Mock Tests Practice Center</h5>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">Practice examinations and test series directly through the platform.</p>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-sky-50/50 border border-sky-200/70 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-sky-600" />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-black text-slate-900 mb-0.5">Previous Year Question Papers</h5>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">Access relevant previous-year examination resources where available.</p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic text-center">
              * Note: Digital access to Mock Tests and Study Materials depends on the student's applicable subscription tier or bundled library pass.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 13. HOW IT WORKS (3 Simple Steps)                                        */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold uppercase tracking-wider shadow-xs">
            Simple 3-Step Process
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">How ZYZU'S Works</h3>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-xl mx-auto">
            Unlike uncontrolled open classifieds, ZYZU'S operates with strict District Admin matching to ensure teacher quality and student safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <Card className="space-y-4 border-slate-200/80 bg-white p-5 sm:p-6 rounded-2xl shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] relative hover:border-brand-500/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 font-black text-xl flex items-center justify-center border border-brand-200/80 shadow-xs">
              1
            </div>
            <h4 className="text-lg font-bold text-slate-950">Student Submits Request</h4>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Student chooses class, subjects, budget, and location. No random cold calls or unverified teacher numbers exposed.
            </p>
          </Card>

          <Card className="space-y-4 border-slate-200/80 bg-white p-5 sm:p-6 rounded-2xl shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] relative hover:border-purple-500/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 font-black text-xl flex items-center justify-center border border-purple-200/80 shadow-xs">
              2
            </div>
            <h4 className="text-lg font-bold text-slate-950">District Admin Review &amp; Allotment</h4>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              The designated District Admin assesses the requirement, checks credentials, and matches a verified, nearby tutor.
            </p>
          </Card>

          <Card className="space-y-4 border-slate-200/80 bg-white p-5 sm:p-6 rounded-2xl shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] relative hover:border-emerald-500/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 font-black text-xl flex items-center justify-center border border-emerald-200/80 shadow-xs">
              3
            </div>
            <h4 className="text-lg font-bold text-slate-950">Structured Learning &amp; Tracking</h4>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Student receives allotment confirmation. Regular attendance, syllabus completion, and fee receipts are tracked in the portal.
            </p>
          </Card>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 14. FOCUSPOINT HELP CENTER & SMART FAQ (Section 38, 39, 40)               */}
      {/* ========================================================================= */}
      <HelpCenterFaqSection />

      {/* ========================================================================= */}
      {/* 15. PRE-FOOTER CONVERSION EXPERIENCE (Section 42)                         */}
      {/* ========================================================================= */}
      <PreFooterConversionSection />

      {/* Official 1-Time Demo Booking Modal */}
      <DemoBookingModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        initialService={demoModalService}
        prefillEntity={demoPrefillEntity}
        districtName={districtName}
      />
    </div>
  );
};
