import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, BookMarked, Sparkles, BookOpen, 
  ArrowRight, ShieldCheck, CheckCircle2, UserCheck,
  Globe2, Zap, Lock, Cpu, Building2, Users, Target,
  Check, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ServiceRegistrationGateModal } from '../common/ServiceRegistrationGateModal';

export const PreFooterConversionSection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gateOpen, setGateOpen] = useState(false);
  const [gateTitle, setGateTitle] = useState('');
  const [gateDesc, setGateDesc] = useState('');
  const [intendedDest, setIntendedDest] = useState('');

  const handleCtaClick = (destination: string, title: string, description: string) => {
    if (user) {
      navigate(destination);
    } else {
      setGateTitle(title);
      setGateDesc(description);
      setIntendedDest(destination);
      setGateOpen(true);
    }
  };

  return (
    <section 
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14"
      aria-label="Pan-India Unified Ecosystem"
    >
      {/* Outer Futuristic Glowing Nebula Container */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-2xl ring-1 ring-white/10">
        
        {/* Luminous Top Cyber Beam */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-brand-500 to-indigo-500" />

        {/* Ambient Decorative Lighting Spheres */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

        {/* Inner Content Grid */}
        <div className="relative z-10 space-y-6 sm:space-y-8">
          
          {/* Header Deck: Badges, Title & Value Prop */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg shadow-cyan-950/40">
              <Globe2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '18s' }} />
              <span>Pan-India Unified Ecosystem</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-400 normal-case hidden sm:inline">28 States &amp; 8 UTs Connected</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Your Unified Gateway to{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                Academic Excellence
              </span>
            </h2>

            <p className="text-xs sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
              {user ? (
                <>Welcome back, <span className="text-white font-black underline decoration-cyan-400 underline-offset-4">{user.name}</span>. Continue your structured preparation across verified home tuition, self-study libraries, CBT mock tests, and topper notes.</>
              ) : (
                <>One unified platform connecting students, verified tutors, self-study libraries, and examination intelligence under real-time District Administration supervision.</>
              )}
            </p>
          </div>

          {/* 4 Futuristic Holographic Ecosystem Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* NODE 1: Verified Home Tutors */}
            <div 
              onClick={() => handleCtaClick('/find-tutor', 'Verified Home Tutors', 'Discover qualified, KYC-verified teachers matched by your District Admin for CBSE, ICSE, and competitive foundations.')}
              className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/70 hover:bg-slate-850 border border-slate-700/80 hover:border-cyan-400/60 transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:shadow-xl hover:shadow-cyan-950/40 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center shadow-md">
                    <GraduationCap className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                    100% KYC Verified
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                    Verified Home Tutors
                  </h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Class 1 to 12 &amp; NEET/JEE. Admin degree verified, zero cold calls, and free 1-time demo session.
                  </p>
                </div>

                {/* Feature Chips */}
                <div className="pt-2 flex flex-wrap gap-1 text-[10px] font-semibold text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">120+ Tutors</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Zero Brokerage</span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-black text-cyan-400">
                <span>Explore Home Tutors</span>
                <div className="w-7 h-7 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* NODE 2: AC Digital Libraries */}
            <div 
              onClick={() => handleCtaClick('/find-library', 'Self-Study Libraries', 'Reserve a quiet, air-conditioned study desk with 5G Wi-Fi, power backup, and shift-based reservations.')}
              className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/70 hover:bg-slate-850 border border-slate-700/80 hover:border-amber-400/60 transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:shadow-xl hover:shadow-amber-950/40 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shadow-md">
                    <BookMarked className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    Live Seat Map
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                    AC Study Libraries
                  </h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Silent cabins, reserved desks, 5G Wi-Fi, 100% power backup, and flexible morning/evening shifts.
                  </p>
                </div>

                {/* Feature Chips */}
                <div className="pt-2 flex flex-wrap gap-1 text-[10px] font-semibold text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">40+ Hubs</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">RFID Pass</span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-black text-amber-400">
                <span>Reserve Study Desk</span>
                <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* NODE 3: CBT Mock Test Center */}
            <div 
              onClick={() => handleCtaClick(user ? '/student/mock-tests' : '/mock-tests', 'Government Exam Mock Tests', 'Attempt CBT test series with All-India rank percentiles and personal mistake book tracking.')}
              className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/70 hover:bg-slate-850 border border-slate-700/80 hover:border-purple-400/60 transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:shadow-xl hover:shadow-purple-950/40 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 text-purple-300 border border-purple-400/30 flex items-center justify-center shadow-md">
                    <Target className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40">
                    NTA CBT Engine
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-black text-white group-hover:text-purple-300 transition-colors">
                    CBT Mock Test Series
                  </h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    BHU CHS, Navodaya, NEET, JEE &amp; UP Police with live timer, AIR percentiles &amp; personal mistake book.
                  </p>
                </div>

                {/* Feature Chips */}
                <div className="pt-2 flex flex-wrap gap-1 text-[10px] font-semibold text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">1,500+ PYQs</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Mistake Book</span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-black text-purple-400">
                <span>Start Mock Test</span>
                <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* NODE 4: Study Materials & PYQ Notes */}
            <div 
              onClick={() => handleCtaClick(user ? '/student/study-material' : '/study-materials', 'Study Materials & PYQ', 'Access authenticated revision notes, formula sheets, and past 10-year solved examination papers.')}
              className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/70 hover:bg-slate-850 border border-slate-700/80 hover:border-emerald-400/60 transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:shadow-xl hover:shadow-emerald-950/40 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shadow-md">
                    <BookOpen className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    Topper Handwritten
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                    Notes &amp; PYQ Vault
                  </h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    NCERT chapter mind maps, formula sheets, and 10-year solved question papers available offline.
                  </p>
                </div>

                {/* Feature Chips */}
                <div className="pt-2 flex flex-wrap gap-1 text-[10px] font-semibold text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">850+ PDFs</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Mind Maps</span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-black text-emerald-400">
                <span>Access Notes Vault</span>
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>

          </div>

          {/* Futuristic Live Ecosystem Telemetry Strip */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-slate-300">Live Network Telemetry:</span>
              </div>
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <strong className="text-white">2,500+</strong> Enrolled Students
              </span>
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <strong className="text-white">100%</strong> District Admin Verified
              </span>
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <strong className="text-white">&lt; 15 Min</strong> Help Desk SLA
              </span>
            </div>

            {/* Quick Partner Registration Links */}
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <Link 
                to="/register/teacher" 
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>Join as Teacher</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
              <span className="text-slate-700">•</span>
              <Link 
                to="/register/library-owner" 
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <span>List Your Library</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Gated Registration & Onboarding Modal */}
      <ServiceRegistrationGateModal
        isOpen={gateOpen}
        onClose={() => setGateOpen(false)}
        serviceTitle={gateTitle}
        serviceDescription={gateDesc}
        intendedDestination={intendedDest}
      />
    </section>
  );
};
