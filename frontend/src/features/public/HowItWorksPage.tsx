import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, BookMarked, ShieldCheck, CheckCircle2, ArrowRight,
  Cpu, Zap, Globe, Activity, Lock, Database, Network, Layers, 
  Compass, Radio, FileCheck, Fingerprint, QrCode, Server, Sparkles, 
  ChevronRight, Terminal, Clock, School, Search, ShieldAlert, 
  BarChart3, Binary, Scale, Check, RefreshCw, Sliders, Calendar, 
  CreditCard, AlertTriangle, UserCheck, Eye, HelpCircle, User,
  Building2, MessageSquare, Award
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand';
import { Button } from '../../components/common/Button';

type StakeholderRole = 'students' | 'teachers' | 'libraryOwners' | 'districtAdmins';
type SandboxScenario = 'tutorFlow' | 'libraryFlow' | 'cbtFlow' | 'verifyFlow';

export const HowItWorksPage: React.FC = () => {
  const [activeRole, setActiveRole] = useState<StakeholderRole>('students');
  const [activeScenario, setActiveScenario] = useState<SandboxScenario>('tutorFlow');
  const [sandboxStep, setSandboxStep] = useState<number>(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#070e1b] text-slate-100 font-sans selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Ambient Cyber Grid & Glowing Radial Accents */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[32rem] h-[32rem] bg-brand-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-60 left-1/4 w-[28rem] h-[28rem] bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-24">

        {/* ========================================================================= */}
        {/* 1. FUTURISTIC HEADER & TELEMETRY SPECS                                    */}
        {/* ========================================================================= */}
        <section className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8 pt-4">
          {/* Cyber Status Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-semibold backdrop-blur-md shadow-lg shadow-cyan-500/10">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-cyan-400 tracking-wider font-mono font-bold uppercase text-[11px]">
              OPERATIONAL PROTOCOL v4.2 // ZERO-SPAM ARCHITECTURE
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-medium text-[11px]">
              District Sovereign Standard
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              How ZYZU'S Sovereign <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-brand-400">
                Network Operates.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
              From Private Requirement Ingestion to Cryptographic Pass Verification — explore the exact district-governed workflows that protect students, empower educators, and automate smart study sanctuaries.
            </p>
          </div>

          {/* Protocol Spec Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-2 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400" /> Zero-Spam Phone Shield
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brand-400" /> 4-Shift Facility Matrix
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-2">
              <Fingerprint className="w-3.5 h-3.5 text-purple-400" /> SHA-256 Merkle Ledger
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-emerald-400" /> Capped 10% Clearinghouse
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. STAKEHOLDER WORKFLOW SELECTOR                                          */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-brand-400">
                <Activity className="w-3.5 h-3.5" /> Operational Blueprints
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Select Your System Role
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Interactive 4-Stage Verifiable Workflow
            </span>
          </div>

          {/* Role Navigation Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'students', label: 'Students & Parents', icon: User, tag: 'Zero-Spam Allotment', color: 'border-cyan-500/50 text-cyan-400' },
              { id: 'teachers', label: 'Verified Educators', icon: GraduationCap, tag: '100% KYC & 90% Payout', color: 'border-brand-500/50 text-brand-400' },
              { id: 'libraryOwners', label: 'Study Libraries', icon: BookMarked, tag: '4-Shift Visual Desk Map', color: 'border-amber-500/50 text-amber-400' },
              { id: 'districtAdmins', label: 'District Admins', icon: ShieldCheck, tag: 'Sovereign Governance Desk', color: 'border-purple-500/50 text-purple-400' },
            ].map((role) => {
              const Icon = role.icon;
              const isActive = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id as StakeholderRole)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                    isActive
                      ? 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 ${role.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isActive && (
                      <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {role.label}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {role.tag}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Role Pipeline Display */}
          <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-xl relative overflow-hidden">
            {/* STUDENTS & PARENTS PIPELINE */}
            {activeRole === 'students' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                  <div className="space-y-1">
                    <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold">
                      ROLE: STUDENT_PARENT_PROTOCOL
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">Private Tutoring &amp; Study Sanctuary Journey</h3>
                  </div>
                  <Link to="/find-tutor">
                    <Button size="sm" className="font-bold bg-gradient-to-r from-brand-600 to-amber-500 text-white border-0">
                      Request Tutor Now <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Step 1 */}
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-cyan-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      01
                    </div>
                    <h4 className="font-bold text-sm text-white">Private Requirement Ingestion</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Select your class (CBSE, UP Board, CUET, NEET), subject requirements, and locality. Your phone number is encrypted behind a zero-spam token and is never made public.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      TELEMETRY: PHONE_MASKED [SHIELD]
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-brand-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      02
                    </div>
                    <h4 className="font-bold text-sm text-white">District Admin Supervised Allotment</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      The designated District Admin assesses your academic requirements, checks proximity, and matches an accredited teacher with verified university credentials.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      VERIFIER: BHU/AKTU FACULTY REGISTRY
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-amber-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      03
                    </div>
                    <h4 className="font-bold text-sm text-white">Cryptographic 1-Time Demo Pass</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Receive an official SHA-256 verifiable Demo Pass (`FP-DEMO-...`) on WhatsApp. Attend a free 1-on-1 trial session before making any financial commitment.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      DISPATCH: WHATSAPP QR PASS
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-emerald-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      04
                    </div>
                    <h4 className="font-bold text-sm text-white">Escrow-Backed Tuition &amp; Mistake Book</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Pay transparent monthly fees with official receipts (`FP-RCP-...`). Daily QR attendance is logged, and weekly test errors automatically synchronize to your Mistake Book.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      SETTLEMENT: 100% AUDITABLE RECEIPT
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VERIFIED EDUCATORS PIPELINE */}
            {activeRole === 'teachers' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                  <div className="space-y-1">
                    <span className="px-2.5 py-1 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-mono font-bold">
                      ROLE: ACCREDITED_EDUCATOR_PROTOCOL
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">Faculty Onboarding &amp; Guaranteed 90% Compensation</h3>
                  </div>
                  <Link to="/register/teacher">
                    <Button size="sm" className="font-bold bg-gradient-to-r from-brand-600 to-amber-500 text-white border-0">
                      Apply to Teach <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-brand-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      01
                    </div>
                    <h4 className="font-bold text-sm text-white">Academic Credentials &amp; KYC</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Submit university degrees (BHU, AKTU, State Universities), masked Aadhaar identity proof, and teaching portfolio across your preferred grades.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      AUDIT: DOCUMENTARY TRANSCRIPT
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-cyan-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      02
                    </div>
                    <h4 className="font-bold text-sm text-white">District Admin Vetting &amp; Accreditation</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      The District Admin conducts documentary verification. Upon approval, you are issued an official verifiable Faculty ID Card (`FP-TCH-...`).
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      CREDENTIAL: QR VERIFIED FACULTY PASS
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-emerald-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      03
                    </div>
                    <h4 className="font-bold text-sm text-white">Direct Student Allotments (No Bidding)</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Never waste money on "lead packages". The District Admin allots pre-screened students directly to your calendar within a 5-kilometer radius.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      LEAD_FEES: ₹0 // NO UNFAIR AUCTIONS
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-purple-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      04
                    </div>
                    <h4 className="font-bold text-sm text-white">90% Net Compensation &amp; Salary Slips</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Platform fee is capped at a transparent 10%. You retain 90% with automated monthly salary vouchers (`FP-SAL-...`) deposited directly into your bank account.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      CLEARING: 90% DIRECT DISBURSAL
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STUDY LIBRARY PARTNERS PIPELINE */}
            {activeRole === 'libraryOwners' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                  <div className="space-y-1">
                    <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
                      ROLE: STUDY_SANCTUARY_PARTNER_PROTOCOL
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">4-Shift Facility Digitization &amp; Seat Map Engine</h3>
                  </div>
                  <Link to="/register/library-owner">
                    <Button size="sm" className="font-bold bg-gradient-to-r from-amber-600 to-brand-500 text-white border-0">
                      List Your Sanctuary <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-amber-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      01
                    </div>
                    <h4 className="font-bold text-sm text-white">Premises &amp; Facility Accreditation</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      List your physical premises, specifying air conditioning, silent cubicles, 5G Wi-Fi, 24x7 power backup, and total desk capacity.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      AMENITIES: 100% STANDARDIZED
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-cyan-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      02
                    </div>
                    <h4 className="font-bold text-sm text-white">4-Shift Desk Map Matrix</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Configure your interactive desk grid across 4 distinct shifts: Morning (6-10 AM), Afternoon (10-2 PM), Evening (2-6 PM), and Night/Full-Day.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      GRID: DYNAMIC VACANCY CALCULATOR
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-emerald-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      03
                    </div>
                    <h4 className="font-bold text-sm text-white">Dual Ingestion (Online + Walk-Ins)</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Accept online app bookings or use the "Add Offline Student" feature to register walk-ins without forcing them to create web accounts.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      DUAL_INGESTION: WEB + DESK WALK-IN
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-purple-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      04
                    </div>
                    <h4 className="font-bold text-sm text-white">Biometric QR &amp; Automated Billing</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Students check in with biometric QR passes. Subscription billing, automated WhatsApp renewal reminders, and receipts (`FP-SUB-...`) are dispatched automatically.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      ATTENDANCE: TAMPER-PROOF QR SCAN
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DISTRICT ADMINS & OPERATORS PIPELINE */}
            {activeRole === 'districtAdmins' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                  <div className="space-y-1">
                    <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono font-bold">
                      ROLE: DISTRICT_ADMIN_COMMAND_PROTOCOL
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">Territorial Governance, KYC Ledger &amp; Content Operations</h3>
                  </div>
                  <Link to="/contact">
                    <Button size="sm" variant="outline" className="border-purple-500/40 text-purple-300 hover:bg-purple-950/40">
                      Contact Command Desk <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-purple-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      01
                    </div>
                    <h4 className="font-bold text-sm text-white">Sovereign Territorial Desk</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      One active District Admin per district governs all inbound tutor requests, educator background checks, and library facility licenses.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      DESK: ONE DISTRICT, ONE MASTER DESK
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-cyan-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      02
                    </div>
                    <h4 className="font-bold text-sm text-white">NTA CBT &amp; PYQ Digitizer Studio</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Content Operators curate official question banks, digitize 10-year previous year papers (PYQ), and validate syllabus blueprints.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      STUDIO: BLUEPRINT COMPLIANCE 100%
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-emerald-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      03
                    </div>
                    <h4 className="font-bold text-sm text-white">Cryptographic Merkle Audit Trail</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      All fee collections, teacher payouts, and attendance check-ins are cryptographically sealed in an immutable ledger to ensure zero embezzlement.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      LEDGER: TAMPER-EVIDENT MERKLE HASH
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3 group hover:border-brand-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono text-xs font-bold flex items-center justify-center">
                      04
                    </div>
                    <h4 className="font-bold text-sm text-white">Public Verification Node Operations</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Authorities, parents, and schools can query `/verify/doc` to independently confirm whether any ID card, receipt, or demo pass is authentic.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      PUBLIC_NODE: 24x7 ONLINE AUDIT
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. INTERACTIVE OPERATIONAL SANDBOX (LIVE SIMULATION)                      */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/30 p-6 sm:p-10 shadow-2xl shadow-cyan-500/5 space-y-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                <Terminal className="w-3.5 h-3.5" /> Interactive Operational Sandbox
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Simulate End-to-End Execution
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Step through each operational phase to witness how data, cryptographic tokens, and human verification interact.
              </p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((step) => (
                <button
                  key={step}
                  onClick={() => setSandboxStep(step)}
                  className={`w-9 h-9 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-all ${
                    sandboxStep === step
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 scale-105'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  S{step}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Selector */}
          <div className="flex flex-wrap gap-2 pb-2">
            {[
              { id: 'tutorFlow', label: '1. Home Tuition Request Flow' },
              { id: 'libraryFlow', label: '2. 4-Shift Library Desk Reservation' },
              { id: 'cbtFlow', label: '3. CBT Exam & Mistake Workbook' },
              { id: 'verifyFlow', label: '4. Cryptographic QR Verification' },
            ].map((scen) => (
              <button
                key={scen.id}
                onClick={() => {
                  setActiveScenario(scen.id as SandboxScenario);
                  setSandboxStep(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  activeScenario === scen.id
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {scen.label}
              </button>
            ))}
          </div>

          {/* Sandbox Visual Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Step Explanation Card */}
            <div className="lg:col-span-6 space-y-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="text-cyan-400 uppercase font-bold">STAGE 0{sandboxStep} OF 04</span>
                <span>EXECUTION_STATE: LIVE</span>
              </div>

              {activeScenario === 'tutorFlow' && (
                <>
                  {sandboxStep === 1 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Student Submits Academic Requirements</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Aryan Verma (Class 10 CBSE, Saidpur) specifies needs: Mathematics &amp; Science, 5 days/week, budget ₹3,500/mo. The system immediately hashes contact numbers to prevent data leakage.
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300">
                        {'>'} Payload: {"{ class: 10, board: 'CBSE', locality: 'Saidpur', phone: '0x94f... [SHIELDED]' }"}
                      </div>
                    </div>
                  )}
                  {sandboxStep === 2 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">District Admin Review &amp; Faculty Matching</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Ghazipur District Admin inspects the request queue. Evaluates faculty credentials in Saidpur. Finds Dr. Vivek S. (M.Sc Physics BHU, verified police check, 9 years CBSE teaching experience).
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300">
                        {'>'} Match Confirmed: Teacher ID FP-TCH-00104 • Status: 100% Academic Fit
                      </div>
                    </div>
                  )}
                  {sandboxStep === 3 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Cryptographic Demo Pass Dispatched</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        A unique 1-Time Demo Pass is minted with SHA-256 hash. Routed via WhatsApp to both student and educator. Scheduled for Tuesday 05:00 PM at student's residence.
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300">
                        {'>'} Pass Issued: FP-DEMO-2026-000042 • Token: 0x9e7a...f42c8b1
                      </div>
                    </div>
                  )}
                  {sandboxStep === 4 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Trial Success &amp; Escrow Activation</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Student confirms satisfaction after the trial class. Parent pays monthly tuition. Platform locks 90% in escrow for teacher disbursal while releasing official receipt `FP-RCP-2026-9659`.
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-purple-300">
                        {'>'} Escrow Initialized • Fee: ₹3,500 • Receipt Minted &amp; Stored on Ledger
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeScenario === 'libraryFlow' && (
                <>
                  {sandboxStep === 1 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Library Facility Matrix Query</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Student queries Saidpur Premier Digital Library. Live grid queries 60 desks across 4 shifts (Morning 6-10 AM, Afternoon 10-2 PM, Evening 2-6 PM, Night/Full-Day).
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300">
                        {'>'} Query Facility: Saidpur #01 • Morning Vacancy: 18 / 60 Desks Available
                      </div>
                    </div>
                  )}
                  {sandboxStep === 2 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Visual Desk Selection &amp; Shift Lock</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Student selects Desk #24 in the silent acoustic zone for the Morning Shift (06:00 - 10:00 AM). Shift lock reserved for 10 minutes during checkout.
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300">
                        {'>'} Desk Locked: D-24 • Shift: Morning • Seat State: RESERVED_PENDING_PAY
                      </div>
                    </div>
                  )}
                  {sandboxStep === 3 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Subscription Pass &amp; Student ID Minted</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Monthly subscription (₹600/month) processed. System mints an official Student Library ID Card with embedded QR biometric pass.
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300">
                        {'>'} Card Minted: FP-LIB-ID-2026-000088 • Shift: 06:00 - 10:00 AM Daily
                      </div>
                    </div>
                  )}
                  {sandboxStep === 4 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Daily Biometric Check-In &amp; Shift Renewal</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Student taps QR at premise kiosk. Attendance marked, desk power enabled. Automated WhatsApp notification sent 3 days before monthly renewal.
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-purple-300">
                        {'>'} Biometric QR Validated • Access Granted • Renewal Alert Scheduled
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeScenario === 'cbtFlow' && (
                <>
                  {sandboxStep === 1 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">NTA CBT Test Initiation</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Aspirant launches UP Police Constable Full Mock Drill #04. Interface loads exact NTA-grade palette, bilingual question toggle, and countdown timer.
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300">
                        {'>'} Exam Engine: NTA_REPLICA • Total Questions: 150 • Timer: 120:00
                      </div>
                    </div>
                  )}
                  {sandboxStep === 2 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Real-Time Attempt &amp; Telemetry Logging</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Aspirant attempts 142 questions. Time spent per question and answer revisions are logged in local state with instant cloud sync.
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300">
                        {'>'} Telemetry: 142 Answered, 8 Marked for Review, 0 Disconnections
                      </div>
                    </div>
                  )}
                  {sandboxStep === 3 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Instant Percentile &amp; Error Pattern Analysis</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Score calculated instantly with negative marking penalty: 248/300 marks. System flags 14 incorrect responses across Hindi Grammar and Numerical Ability.
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300">
                        {'>'} Result: Score 248.0 • Rank 42 / 1,820 • Accuracy: 88.6%
                      </div>
                    </div>
                  )}
                  {sandboxStep === 4 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Automated Mistake Book Synthesis</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        The 14 incorrect questions are automatically cataloged into student's personal Mistake Book with detailed pedagogical explanations and a 1-click retry drill.
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-purple-300">
                        {'>'} Mistake Book Updated: +14 Entries • Remedial Practice Drill Queued
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeScenario === 'verifyFlow' && (
                <>
                  {sandboxStep === 1 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Scan Document QR Code</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Parent or institution opens camera and scans the cryptographic QR code printed on a Fee Receipt (`FP-RCP-...`) or Student Demo Pass (`FP-DEMO-...`).
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300">
                        {'>'} Scan Inbound: https://zyzus.com/verify/doc?id=FP-RCP-2026-9659
                      </div>
                    </div>
                  )}
                  {sandboxStep === 2 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Zero-Login Public Verification Node Query</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        The public verification node queries the immutable registry. No account or password required to confirm document veracity.
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300">
                        {'>'} Ledger Lookup: SHA-256 Hash matches root block • Query Latency: 42ms
                      </div>
                    </div>
                  )}
                  {sandboxStep === 3 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Cryptographic Certificate Validation</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        The node authenticates the corporate CIN (`U80904UP2026PTC184920`), Ghazipur District Seal, and timestamp.
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300">
                        {'>'} Seal Verified: ZYZU'S EdTech Technologies Pvt Ltd • Status: AUTHENTIC
                      </div>
                    </div>
                  )}
                  {sandboxStep === 4 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Official Ledger Display Rendered</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        A full official verified digital receipt is rendered with student name, teacher ID, fee amount, and settlement status, proving absolute authenticity.
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-purple-300">
                        {'>'} Render: Official Document Verified • Tamper Risk: 0.00%
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSandboxStep(Math.max(1, sandboxStep - 1))}
                  disabled={sandboxStep === 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono disabled:opacity-40 hover:text-white"
                >
                  ← Previous Stage
                </button>
                <span className="text-xs font-mono text-slate-500">Stage {sandboxStep} / 4</span>
                <button
                  onClick={() => setSandboxStep(Math.min(4, sandboxStep + 1))}
                  disabled={sandboxStep === 4}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-mono disabled:opacity-40 hover:bg-cyan-500"
                >
                  Next Stage →
                </button>
              </div>
            </div>

            {/* Live Terminal Telemetry Output */}
            <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 font-mono text-xs space-y-4 min-h-[320px] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2.5 text-[11px]">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Terminal className="w-3.5 h-3.5" /> SYSTEM_BUS_STREAM // PROTOCOL_LOG
                  </span>
                  <span className="text-emerald-400">STATE: SYNCHRONIZED</span>
                </div>

                <div className="space-y-2 text-slate-400 text-[11px]">
                  <p className="text-slate-500">// Real-time architectural event pipeline trace</p>
                  <p className="text-cyan-300">&gt; [CORE_INIT] ZYZU'S National Directorate Protocol v4.2</p>
                  <p className="text-blue-400">&gt; [ACTIVE_NODE] Saidpur Ghazipur HQ Desk #01</p>
                  <p className="text-amber-400">&gt; [EVENT_TRIGGER] Scenario: {activeScenario.toUpperCase()} (Stage 0{sandboxStep})</p>
                  <p className="text-emerald-400">&gt; [CRYPTO_AUDIT] SHA-256 Merkle root validated: PASS</p>
                  <p className="text-slate-300">&gt; [WHATSAPP_DISPATCH] In-sync: notifications@zyzus.com</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <span>TELEMETRY SUMMARY</span>
                  <span className="text-[10px] text-slate-400 font-normal">LATENCY: 18ms</span>
                </div>
                <div className="text-slate-300">Privacy Status: <span className="text-emerald-400">100% Protected (No Leakage)</span></div>
                <div className="text-slate-300">Audit Status: <span className="text-purple-400">Cryptographically Sealed</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. TRADITIONAL CLASSIFIEDS VS. ZYZU'S SOVEREIGN MATRIX                    */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" /> Institutional Contrast
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Why Traditional Classifieds Fail
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              See how ZYZU'S district-supervised network eliminates the harassment and risks of unregulated tutor directories.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-4 sm:p-5">Feature &amp; Safety Vector</th>
                  <th className="p-4 sm:p-5 text-rose-400">Unregulated Classifieds / Open Directories</th>
                  <th className="p-4 sm:p-5 text-cyan-400 font-bold">ZYZU'S Sovereign Network</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400 shrink-0" /> Phone Number Privacy
                  </td>
                  <td className="p-4 sm:p-5 text-rose-300/90">
                    Numbers sold or publicly listed; bombarded by 40+ telemarketers and commission agents.
                  </td>
                  <td className="p-4 sm:p-5 text-emerald-300 font-medium bg-emerald-950/20">
                    100% Zero-Spam Shield. Contact permanently masked behind District Admin desks.
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" /> Teacher Qualification KYC
                  </td>
                  <td className="p-4 sm:p-5 text-rose-300/90">
                    Self-proclaimed claims without documentary audit; high risk of fake degrees.
                  </td>
                  <td className="p-4 sm:p-5 text-emerald-300 font-medium bg-emerald-950/20">
                    Physical degree audit against university registers (BHU, AKTU) + masked Aadhaar KYC.
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-white flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-amber-400 shrink-0" /> Library Desk Allocation
                  </td>
                  <td className="p-4 sm:p-5 text-rose-300/90">
                    Chaotic walk-ins, double-booked desks during exam rush, zero shift structure.
                  </td>
                  <td className="p-4 sm:p-5 text-emerald-300 font-medium bg-emerald-950/20">
                    Visual 4-shift desk map (Morning, Afternoon, Evening, Full Day) with live vacancy grid.
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-purple-400 shrink-0" /> Pricing &amp; Commission Model
                  </td>
                  <td className="p-4 sm:p-5 text-rose-300/90">
                    Predatory commission (40% to 50%) siphoned from teachers; hidden registration charges.
                  </td>
                  <td className="p-4 sm:p-5 text-emerald-300 font-medium bg-emerald-950/20">
                    Strictly capped 10% platform fee. Verified educators keep 90% with automated salary vouchers.
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" /> Document Authenticity
                  </td>
                  <td className="p-4 sm:p-5 text-rose-300/90">
                    Paper receipts without legal auditability; easy to fabricate or dispute.
                  </td>
                  <td className="p-4 sm:p-5 text-emerald-300 font-medium bg-emerald-950/20">
                    SHA-256 cryptographic QR code on all passes, receipts, and ID cards verified at `/verify/doc`.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. INTERACTIVE WORKFLOW FAQ ACCORDION                                      */}
        {/* ========================================================================= */}
        <section className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> Operational Clarifications
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Clear answers to the most common operational questions across all four platform roles.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How does the District Admin shield my phone number from unwanted spam calls?",
                a: "When you submit a tutor request on ZYZU'S, your phone number is stored in an encrypted token accessible only by the authorized District Admin desk. It is never displayed on a public website or sold to coaching centers. Only the single verified teacher allotted to your request receives authorized contact details once you confirm the trial session."
              },
              {
                q: "What occurs during the 1-on-1 demo trial session?",
                a: "The allotted educator visits your residence (or connects for online foundation) for a dedicated 1-on-1 assessment session. The educator reviews current syllabus progress, identifies conceptual gaps, and proposes a tailored weekly schedule. Parents evaluate pedagogical style before committing to monthly subscriptions."
              },
              {
                q: "Can library owners manage walk-in offline students who don't have smartphones?",
                a: "Yes. The Library Partner portal features an 'Add Offline Student' modal. Owners can assign a desk number, shift timings, and collect fees manually. The system automatically blocks that desk on the live digital seat map to prevent online double-booking."
              },
              {
                q: "How does the public document verification portal at /verify/doc work?",
                a: "Every official document (Student Demo Pass, Student ID Card, Fee Receipt, and Teacher Salary Slip) contains a unique SHA-256 cryptographic hash embedded in a QR code. Anyone scanning this QR code is directed to `/verify/doc` where the system verifies the corporate CIN, seal, student/teacher details, and timestamp directly against the sovereign ledger."
              },
              {
                q: "How does the 10% clearinghouse commission benefit teachers?",
                a: "Traditional agencies often deduct 40% to 50% from monthly home tuition fees. ZYZU'S operates on a flat, transparent 10% platform fee. Verified teachers retain 90% of their earnings with automated monthly payout vouchers (`FP-SAL-...`) and access to recurring student allotments without buying leads."
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="font-bold text-sm sm:text-base text-white">
                      {faq.q}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 text-cyan-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 bg-slate-950/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. PRE-FOOTER CONVERSION MATRIX                                           */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border border-cyan-500/40 p-8 sm:p-12 text-center relative overflow-hidden space-y-6 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Ready to Join the Sovereign Academic Grid?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Experience transparent, verified education administered at your district grassroots.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/find-tutor">
              <Button size="lg" className="font-bold shadow-lg shadow-brand-500/25 bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 text-white border-0">
                Request a Verified Tutor
              </Button>
            </Link>
            <Link to="/find-library">
              <Button size="lg" variant="outline" className="font-bold border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40 hover:text-white">
                Reserve a Study Sanctuary
              </Button>
            </Link>
            <Link to="/register/teacher">
              <Button size="lg" variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/60">
                Apply as Verified Faculty
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};
