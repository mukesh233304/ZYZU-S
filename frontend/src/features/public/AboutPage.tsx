import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, ShieldCheck, MapPin, Users, Award, BookMarked,
  Cpu, Zap, Globe, Activity, Lock, Database, Network, CheckCircle2, 
  Layers, Compass, Radio, FileCheck, Fingerprint, QrCode, Server, 
  Sparkles, ArrowRight, ChevronRight, Terminal, Clock, School, 
  Search, ShieldAlert, BarChart3, Binary, Scale, Check, RefreshCw
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand';
import { Button } from '../../components/common/Button';

type EngineTab = 'tutors' | 'libraries' | 'cbt' | 'merkle' | 'clearinghouse' | 'whatsapp';
type TimelineEpoch = 'genesis' | 'governance' | 'sovereign' | 'quantum';

export const AboutPage: React.FC = () => {
  // Active Interactive Tabs
  const [activeEngine, setActiveEngine] = useState<EngineTab>('tutors');
  const [activeEpoch, setActiveEpoch] = useState<TimelineEpoch>('sovereign');

  // Interactive Live Simulator State
  const [simGrade, setSimGrade] = useState('Class 10 CBSE Board');
  const [simDistrict, setSimDistrict] = useState('Saidpur, Ghazipur (HQ)');
  const [simSubject, setSimSubject] = useState('Mathematics & Science');
  const [simStep, setSimStep] = useState<number>(0);
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<{
    passId: string;
    matchedTeacher: string;
    adminDesk: string;
    cryptographicHash: string;
    status: string;
  } | null>(null);

  const runSimulator = () => {
    setSimRunning(true);
    setSimStep(1);
    setSimResult(null);

    setTimeout(() => {
      setSimStep(2);
      setTimeout(() => {
        setSimStep(3);
        setTimeout(() => {
          setSimStep(4);
          setSimRunning(false);
          setSimResult({
            passId: 'FP-DEMO-2026-' + Math.floor(100000 + Math.random() * 900000),
            matchedTeacher: 'Dr. Vivek S. (M.Sc, BHU - 9 Yrs Exp)',
            adminDesk: 'Ghazipur District Desk • Saidpur Node #01',
            cryptographicHash: '0x9e7a...f42c8b1',
            status: 'VERIFIED_AND_LOCKED'
          });
        }, 800);
      }, 700);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#070e1b] text-slate-100 font-sans selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Cyber Grid & Radial Glow Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[30rem] h-[30rem] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-24">

        {/* ========================================================================= */}
        {/* 1. FUTURISTIC HERO & REAL-TIME TELEMETRY HUD                             */}
        {/* ========================================================================= */}
        <section className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8 pt-4">
          {/* Cyber Status Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-semibold backdrop-blur-md shadow-lg shadow-cyan-500/10">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-cyan-400 tracking-wider font-mono font-bold uppercase text-[11px]">
              SOVEREIGN ACADEMIC NETWORK v3.8
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-medium text-[11px]">
              National Directorate • Saidpur HQ
            </span>
          </div>

          {/* Brand Symbol & Title */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-blue-600 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500" />
              <img
                src={BRAND_CONFIG.assets.logo192}
                alt={BRAND_CONFIG.fullTitle}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-2xl border border-blue-400/40 object-cover bg-slate-950 p-1"
              />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Decentralized, District-Supervised <br className="hidden sm:inline" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-brand-400">
                  Education for Bharat.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
                Born out of the grassroots in Saidpur, Ghazipur as <span className="text-amber-400 font-semibold">FocusPoint</span> and evolved into <span className="text-white font-bold">{BRAND_CONFIG.name}</span> — an advanced, cryptographically verifiable educational ecosystem uniting 1-on-1 verified mentors, silent study sanctuaries, CBT exam intelligence, and sovereign learning vaults.
              </p>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link to="/find-tutor">
              <Button size="lg" className="font-bold shadow-lg shadow-brand-500/25 bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 text-white border-0 hover:scale-[1.02] transition-transform">
                Launch Tutor Engine <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/find-library">
              <Button size="lg" variant="outline" className="font-bold border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40 hover:text-white backdrop-blur-md">
                Explore Study Sanctuaries
              </Button>
            </Link>
            <Link to="/verify/doc">
              <Button size="lg" variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/60 font-mono text-xs">
                <QrCode className="w-4 h-4 mr-2 text-cyan-400" /> Verify Credential Pass
              </Button>
            </Link>
          </div>

          {/* Futuristic Telemetry HUD Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition-all text-left">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">Territory Reach</span>
                <Globe className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">75 / 75</div>
              <div className="text-[11px] text-slate-400">UP Districts &amp; Pan-India Mapped</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent" />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-brand-500/40 transition-all text-left">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-400 font-bold">Matching Latency</span>
                <Clock className="w-4 h-4 text-brand-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">&lt; 120 mins</div>
              <div className="text-[11px] text-slate-400">Supervised Admin Dispatch</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-transparent" />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition-all text-left">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Faculty Trust</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">100% KYC</div>
              <div className="text-[11px] text-slate-400">BHU / AKTU Verified Degrees</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent" />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-purple-500/40 transition-all text-left">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">Cryptographic Ledger</span>
                <Fingerprint className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">SHA-256</div>
              <div className="text-[11px] text-slate-400">Instant QR Pass Auditability</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-transparent" />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. THE CHRONO-DECK: FOCUSPOINT GENESIS → ZYZU'S SOVEREIGN LEAP            */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-slate-900/40 border border-slate-800 p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-brand-400">
                <Activity className="w-3.5 h-3.5" /> The Evolutionary Matrix
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                From FocusPoint to ZYZU'S
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                How a grassroots intervention in Ghazipur grew into an enterprise-grade sovereign academic utility network for students across India.
              </p>
            </div>

            {/* Epoch Selector Buttons */}
            <div className="flex flex-wrap gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              {(['genesis', 'governance', 'sovereign', 'quantum'] as TimelineEpoch[]).map((epoch) => (
                <button
                  key={epoch}
                  onClick={() => setActiveEpoch(epoch)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold transition-all ${
                    activeEpoch === epoch
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {epoch === 'genesis' && '2025 • Genesis'}
                  {epoch === 'governance' && 'Early 2026 • Desk'}
                  {epoch === 'sovereign' && "Late 2026 • ZYZU'S"}
                  {epoch === 'quantum' && '2027+ • Quantum'}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Epoch Display Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800/90 relative">
            {activeEpoch === 'genesis' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
                    PHASE 01: THE GRASSROOTS SPARK (FOCUSPOINT PILOT)
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Saidpur, Ghazipur, UP</span>
                </div>
                <h3 className="text-xl font-bold text-white">Solving the Twin Crisis: Unverified Tutors &amp; Chaotic Study Spaces</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  In tier-2 and tier-3 towns, parents faced immense anxiety: random classified boards leaked phone numbers to aggressive telemarketers, while home study was perpetually disrupted by noise and erratic power. FocusPoint launched its pilot in Saidpur to manually vet local tutors and inaugurate air-conditioned self-study sanctuaries with high-speed internet.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono text-slate-300">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> First 100+ Home Tutors Vetted
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 4-Shift Library Model Proven
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Zero Phone Number Leaks
                  </div>
                </div>
              </div>
            )}

            {activeEpoch === 'governance' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono font-bold">
                    PHASE 02: DISTRICT ADMINISTRATION PROTOCOL
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Eastern UP Regional Rollout</span>
                </div>
                <h3 className="text-xl font-bold text-white">One District, One Single Supervised Administrator</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  To guarantee absolute safety, we pioneered the decentralized District Admin model. Instead of algorithmic chaos, every locality has a designated District Admin who directly verifies teacher credentials against university rolls (BHU, AKTU, MGKVP) and matches students privately based on distance, syllabus, and specific academic weaknesses.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono text-slate-300">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> 100% Aadhaar-Masked KYC
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Human-Supervised Allotment
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> 10% Flat Clearinghouse Fee
                  </div>
                </div>
              </div>
            )}

            {activeEpoch === 'sovereign' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-mono font-bold">
                    PHASE 03: THE SOVEREIGN LEAP TO ZYZU'S (CURRENT)
                  </span>
                  <span className="text-xs text-brand-400 font-mono animate-pulse">● ACTIVE ENTERPRISE SYSTEM</span>
                </div>
                <h3 className="text-xl font-bold text-white">ZYZU'S Unified Sovereign Platform &amp; CBT Intelligence</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  FocusPoint officially ascended to ZYZU'S — Tutors &amp; Libraries. We introduced NTA-standard Computer Based Test (CBT) engines, an automated error-pattern workbook synthesizer, visual 4-shift library desk pickers, cryptographic QR passes, and WhatsApp AI dispatchers, serving learners from Saidpur to across all of India.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono text-slate-300">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" /> SHA-256 Verifiable QR Passes
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" /> CBT Test Series &amp; Error Vault
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" /> 8 Complete Specialized Portals
                  </div>
                </div>
              </div>
            )}

            {activeEpoch === 'quantum' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono font-bold">
                    PHASE 04: THE AUTONOMOUS KNOWLEDGE GRID
                  </span>
                  <span className="text-xs text-purple-400 font-mono">Vision 2027 &amp; Beyond</span>
                </div>
                <h3 className="text-xl font-bold text-white">Pan-India Decentralized Mesh &amp; IoT-Monitored Study Cubicles</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Our forthcoming horizon expands to federated micro-learning nodes, IoT sensor-monitored acoustic zones in libraries, AI-powered predictive psychometric evaluations, and decentralized immutable educational credential verification across all 28 States and 8 Union Territories.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono text-slate-300">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" /> IoT Acoustic Zone Monitoring
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" /> AI Autonomous Misconception Radar
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" /> Pan-India Sovereign Node Federation
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. THE 6 SOVEREIGN ENGINES (INTERACTIVE ARCHITECTURE MATRIX)               */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" /> The Technological Backbone
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Six Sovereign Engines Powering ZYZU'S
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Explore the underlying modules engineered to deliver absolute safety, zero spam, and institutional transparency.
            </p>
          </div>

          {/* Engine Selector Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {[
              { id: 'tutors', label: 'Tutor Matching', icon: ShieldCheck, color: 'text-brand-400' },
              { id: 'libraries', label: 'Study Sanctuaries', icon: BookMarked, color: 'text-cyan-400' },
              { id: 'cbt', label: 'CBT Test Engine', icon: Zap, color: 'text-amber-400' },
              { id: 'merkle', label: 'Merkle Ledger', icon: Fingerprint, color: 'text-purple-400' },
              { id: 'clearinghouse', label: '10% Clearinghouse', icon: Scale, color: 'text-emerald-400' },
              { id: 'whatsapp', label: 'WhatsApp Hub', icon: Radio, color: 'text-rose-400' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeEngine === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveEngine(tab.id as EngineTab)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col items-center sm:items-start gap-2.5 ${
                    isActive
                      ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${tab.color}`} />
                  <span className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Engine Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden">
            {activeEngine === 'tutors' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-mono font-bold">
                    ENGINE 01 • ZERO-KNOWLEDGE TUTOR MATCHING
                  </div>
                  <h3 className="text-2xl font-black text-white">Direct District Admin Supervised Allotment</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Unlike open classified portals that publish students' phone numbers to hundreds of coaching agents, ZYZU'S operates on a strict zero-leakage model. When a student requests mentorship for CBSE, ICSE, UP Board, or competitive exams, the designated local District Admin verifies academic credentials and assigns exactly one verified, nearby teacher.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300 font-medium">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Physical university degree verification (BHU, AKTU, State Universities)</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Identity verification with masked Aadhaar &amp; police background checks</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Mandatory 1-on-1 verified demo class before subscription commitment</li>
                  </ul>
                </div>
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2">
                    <span>ALLOTMENT_PIPELINE.LOG</span>
                    <span className="text-emerald-400">STATUS: ENCRYPTED</span>
                  </div>
                  <p className="text-slate-400">&gt; Inbound: Class 10th CBSE (Saidpur Town)</p>
                  <p className="text-slate-400">&gt; Identity Sanitized: User Phone Number Hidden [SHIELD_ACTIVE]</p>
                  <p className="text-slate-400">&gt; Admin Review: District Admin Desk verifies qualification</p>
                  <p className="text-brand-400 font-bold">&gt; Match Dispatched: Verified Teacher ID FP-TCH-00104</p>
                  <p className="text-emerald-400">&gt; Demo Pass: FP-DEMO-2026-000042 Generated with SHA-256 Hash</p>
                </div>
              </div>
            )}

            {activeEngine === 'libraries' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold">
                    ENGINE 02 • SHIFT-AWARE DIGITAL SANCTUARIES
                  </div>
                  <h3 className="text-2xl font-black text-white">Interactive Seat Maps &amp; 4-Shift Facility Management</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Every ZYZU'S Partner Library is equipped with a digital seat allocation grid. Students pick their exact desk number and preferred shift (Morning 6-10 AM, Afternoon 10 AM-2 PM, Evening 2-6 PM, or Full Day), eliminating uncertainty or overcrowding during peak examination seasons.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300 font-medium">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Visual real-time desk availability map</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Standardized 5G Wi-Fi, air-conditioning &amp; ergonomic seating</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Biometric / QR-code attendance recording and walk-in manual entry</li>
                  </ul>
                </div>
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2">
                    <span>FACILITY_GRID: SAIDPUR_PREMIER_01</span>
                    <span className="text-cyan-400">VACANCY: 18 / 60</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                    <span className="p-2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">D-01 [FREE]</span>
                    <span className="p-2 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30">D-02 [OCC]</span>
                    <span className="p-2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">D-03 [FREE]</span>
                    <span className="p-2 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30">D-04 [OCC]</span>
                    <span className="p-2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">D-05 [FREE]</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">&gt; Shift Selected: Morning (06:00 - 10:00 AM) • Power Backup: 100%</p>
                </div>
              </div>
            )}

            {activeEngine === 'cbt' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
                    ENGINE 03 • NTA-GRADE CBT &amp; MISTAKE RADAR
                  </div>
                  <h3 className="text-2xl font-black text-white">Autonomous Error-Pattern Classification</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Our CBT engine replicates the real examination UI used by UPSC, SSC, NTA (NEET, JEE, CUET), and State Police recruitment boards. Beyond scores, our system analyzes time spent per question and automatically saves errors to the student's personal <span className="text-amber-400 font-bold">Mistake Book</span> with step-by-step remedial solutions.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300 font-medium">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Full CBT simulation with question palette &amp; countdown timer</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Automated mistake classification (Conceptual vs Calculation)</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> One-click customized drill generation targeting recurring errors</li>
                  </ul>
                </div>
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2">
                    <span>CBT_ANALYTICS: UP_POLICE_CONSTABLE</span>
                    <span className="text-amber-400">ACCURACY: 86.4%</span>
                  </div>
                  <p className="text-slate-400">&gt; Total Attempted: 150 / 150 Questions</p>
                  <p className="text-emerald-400">&gt; Correct: 130 | Incorrect: 20 | Negative Penalty: -10 Marks</p>
                  <p className="text-amber-400">&gt; Mistake Book Alert: 6 recurring errors in Hindi Grammar &amp; Reasoning</p>
                  <p className="text-slate-300">&gt; Remedial Action: Custom 20-Question Drill synthesized and queued.</p>
                </div>
              </div>
            )}

            {activeEngine === 'merkle' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono font-bold">
                    ENGINE 04 • CRYPTOGRAPHIC MERKLE LEDGER
                  </div>
                  <h3 className="text-2xl font-black text-white">Tamper-Proof Verification for Every Academic Document</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Every Fee Receipt, Demo Pass, Student ID Card, and Teacher Monthly Salary Voucher is assigned a unique cryptographic verification hash. Anyone with a smartphone can scan the QR code to verify validity on the official portal (`/verify/doc`), preventing fee embezzlement, fake ID cards, and unverified tutors.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300 font-medium">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Official document format with verified government registered CIN</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Public verification node available 24x7 without login barriers</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Complete audit trail of fee settlements, attendance, and refunds</li>
                  </ul>
                </div>
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2">
                    <span>LEDGER_VERIFIER: FP-RCP-2026-9659</span>
                    <span className="text-purple-400">STATUS: GENUINE</span>
                  </div>
                  <p className="text-slate-400">&gt; Entity: FocusPoint Official Home Tuition Fee Receipt</p>
                  <p className="text-slate-400">&gt; Student: Aryan Verma • District: Ghazipur</p>
                  <p className="text-slate-400">&gt; Timestamp: 2026-10-31T08:14:02Z</p>
                  <p className="text-purple-300">&gt; SHA-256: d41d8cd98f00b204e9800998ecf8427e</p>
                </div>
              </div>
            )}

            {activeEngine === 'clearinghouse' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                    ENGINE 05 • 10% PLATFORM CLEARINGHOUSE
                  </div>
                  <h3 className="text-2xl font-black text-white">Transparent Escrow &amp; 90% Educator Retention</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Predatory agencies often siphon 40% to 50% of home tuition fees. ZYZU'S caps its platform fee at exactly 10%, ensuring verified educators retain 90% of their compensation while providing students with automated payment receipts, attendance-linked payouts, and clear refund dispute resolution.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300 font-medium">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 90% Direct teacher payout with automated monthly salary slips</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Escrow protection during trial sessions and initial allotments</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Zero hidden charges or surprise registration renewals</li>
                  </ul>
                </div>
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2">
                    <span>CLEARINGHOUSE_SETTLEMENT.BAL</span>
                    <span className="text-emerald-400">FEE: FLAT 10%</span>
                  </div>
                  <p className="text-slate-400">&gt; Gross Tuition Fee: ₹4,000 / Month</p>
                  <p className="text-emerald-400">&gt; Teacher Net Disbursal: ₹3,600 (90%) [FP-SAL-2026-000145]</p>
                  <p className="text-brand-400">&gt; Platform Infrastructure Clearing Fee: ₹400 (10%)</p>
                  <p className="text-slate-400">&gt; Student Receipt Dispatched via WhatsApp [IMMEDIATE]</p>
                </div>
              </div>
            )}

            {activeEngine === 'whatsapp' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-mono font-bold">
                    ENGINE 06 • HYPER-LOCALIZED WHATSAPP DISPATCHER
                  </div>
                  <h3 className="text-2xl font-black text-white">Event-Driven Notifications &amp; Offer Matching</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Parents shouldn't have to keep checking web dashboards. Whenever a demo class is scheduled, an attendance check-in occurs, or a library shift seat becomes vacant nearby, ZYZU'S AI notification dispatcher routes formatted alerts straight to the parent's verified WhatsApp number.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300 font-medium">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-rose-400" /> Instant WhatsApp delivery of QR demo passes &amp; teacher profiles</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-rose-400" /> Real-time library shift check-in and checkout alerts</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-rose-400" /> Hyper-local promotional discounts and exam date reminders</li>
                  </ul>
                </div>
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2">
                    <span>WHATSAPP_DISPATCH: +91 91964 34387</span>
                    <span className="text-emerald-400">DELIVERED</span>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-[11px] space-y-1 font-sans">
                    <p className="font-bold">🌟 ZYZU'S Verified Demo Allotment</p>
                    <p>Dear Parent, your demo pass for Class 10 Math is ready!</p>
                    <p className="text-slate-300">Educator: Dr. Vivek S. • Saidpur Center</p>
                    <p className="text-cyan-300 underline font-mono text-[10px]">https://zyzus.com/demo/FP-DEMO-2026-000042</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. INTERACTIVE SOVEREIGN ALLOCATION SIMULATOR                             */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/30 p-6 sm:p-10 shadow-2xl shadow-cyan-500/5 relative overflow-hidden space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                <Terminal className="w-3.5 h-3.5" /> Live Autonomous Console
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Test the Sovereign Allocation Engine
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Experience in real-time how our zero-spam matching protocol and cryptographic verification work.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold flex items-center gap-2 self-start md:self-auto">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /> SIMULATOR ACTIVE
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Control Inputs */}
            <div className="lg:col-span-5 space-y-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase font-semibold">1. Academic Standard</label>
                <select
                  value={simGrade}
                  onChange={(e) => setSimGrade(e.target.value)}
                  disabled={simRunning}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Class 10 CBSE Board">Class 10 CBSE Board (Board Prep)</option>
                  <option value="Class 12 UP Board Science">Class 12 UP Board (Physics/Maths)</option>
                  <option value="CUET UG General + Domain">CUET UG Entrance Preparation</option>
                  <option value="UP Police &amp; SSC Exams">UP Police &amp; SSC Government Exams</option>
                  <option value="NEET / JEE Foundation">NEET / JEE Foundation</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase font-semibold">2. District Node / Locality</label>
                <select
                  value={simDistrict}
                  onChange={(e) => setSimDistrict(e.target.value)}
                  disabled={simRunning}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Saidpur, Ghazipur (HQ)">Saidpur, Ghazipur (HQ Node #01)</option>
                  <option value="Ghazipur City - Lanka / Ghat">Ghazipur City - Lanka Area</option>
                  <option value="Varanasi - Lanka / Sigra">Varanasi - Lanka / Sigra Hub</option>
                  <option value="Zamania - Railway Station">Zamania - Sub-District Hub</option>
                  <option value="Lucknow - Gomti Nagar Node">Lucknow - Gomti Nagar Hub</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase font-semibold">3. Target Domain</label>
                <input
                  type="text"
                  value={simSubject}
                  onChange={(e) => setSimSubject(e.target.value)}
                  disabled={simRunning}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g. Science, Mathematics, English"
                />
              </div>

              <Button
                onClick={runSimulator}
                disabled={simRunning}
                className="w-full font-bold shadow-lg shadow-cyan-500/20 bg-gradient-to-r from-cyan-600 via-blue-600 to-brand-500 text-white border-0 py-2.5 mt-2"
              >
                {simRunning ? (
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Running Verification Pipeline...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Execute Supervised Match
                  </span>
                )}
              </Button>
            </div>

            {/* Live Telemetry Terminal */}
            <div className="lg:col-span-7 bg-slate-950 p-5 rounded-2xl border border-slate-800/90 font-mono text-xs space-y-4 min-h-[280px] flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2 text-[11px]">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Terminal className="w-3.5 h-3.5" /> TELEMETRY_STREAM // DISTRICT_NODE_01
                  </span>
                  <span>{simRunning ? 'STATUS: PROCESSING' : simResult ? 'STATUS: COMPLETED' : 'STATUS: IDLE'}</span>
                </div>

                <div className="space-y-1.5 text-slate-400">
                  <p className="text-slate-500">// Select requirements and execute match to view real-time pipeline telemetry.</p>
                  {simStep >= 1 && (
                    <p className="text-cyan-300 animate-in fade-in duration-200">
                      [01/04] Inbound requirement received: {simGrade} @ {simDistrict}
                    </p>
                  )}
                  {simStep >= 2 && (
                    <p className="text-blue-400 animate-in fade-in duration-200">
                      [02/04] Shield applied: Student contact masked with zero-leakage token.
                    </p>
                  )}
                  {simStep >= 3 && (
                    <p className="text-amber-400 animate-in fade-in duration-200">
                      [03/04] District Admin desk verifying BHU/AKTU faculty pedigree...
                    </p>
                  )}
                  {simStep >= 4 && (
                    <p className="text-emerald-400 font-bold animate-in fade-in duration-200">
                      [04/04] ALLOTMENT LOCKED! 1-on-1 Demo Pass generated with SHA-256 hash.
                    </p>
                  )}
                </div>
              </div>

              {simResult && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-slate-200 space-y-2 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> DEMO PASS CREATED
                    </span>
                    <span className="font-mono">{simResult.passId}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div><span className="text-slate-500">Assigned Mentor:</span> {simResult.matchedTeacher}</div>
                    <div><span className="text-slate-500">Oversight:</span> {simResult.adminDesk}</div>
                    <div><span className="text-slate-500">Cryptographic Hash:</span> {simResult.cryptographicHash}</div>
                    <div><span className="text-slate-500">Verification:</span> Online at /verify/doc</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. INSTITUTIONAL MANIFESTO & CORE VALUES                                  */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" /> The Ethical Directive
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Built on Institutional Integrity
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Our governing principles ensure parents, educators, and library partners are treated with absolute equity and dignity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all space-y-3.5">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Zero-Spam / Zero Data Broking</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                We never monetize or sell student data. Contact numbers are permanently shielded behind District Admin desks, safeguarding families from telemarketing harassment.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-all space-y-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Pedagogical Authenticity</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Degrees are verified against official university databases (BHU, AKTU, State Universities). We value proven subject command and moral character above marketing hype.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3.5">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Tier 2/3 Grassroots Parity</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Students in towns like Saidpur, Ghazipur, and Zamania deserve the same world-class digital learning sanctuaries and CBT test engines found in Tier-1 metropolitan centers.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. CORPORATE DIRECTORATE & LEGAL GOVERNANCE                               */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-slate-900/40 border border-slate-800 p-6 sm:p-10 backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-widest">Corporate Governance</span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {BRAND_CONFIG.legalName}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {BRAND_CONFIG.companySub}
              </p>
            </div>
            <div className="px-3 py-1 rounded bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300 self-start sm:self-auto">
              REG. EDTECH UTILITY
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-slate-500 text-[10px] uppercase">Corporate Identity (CIN)</div>
              <div className="font-bold text-white text-xs">{BRAND_CONFIG.cin}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-slate-500 text-[10px] uppercase">Tax Identification (GSTIN)</div>
              <div className="font-bold text-white text-xs">{BRAND_CONFIG.gstin}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-slate-500 text-[10px] uppercase">National HQ &amp; Node</div>
              <div className="font-bold text-white text-xs">Saidpur, Ghazipur 233304 (UP)</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-slate-500 text-[10px] uppercase">Official Hotline</div>
              <div className="font-bold text-cyan-400 text-xs">{BRAND_CONFIG.supportPhone}</div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. PRE-FOOTER CONVERSION EXPERIENCE                                       */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border border-cyan-500/40 p-8 sm:p-12 text-center relative overflow-hidden space-y-6 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Ready to Experience the Sovereign Standard?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Whether you are a student preparing for board or government exams, an accredited educator looking for safe mentorship, or a library owner seeking modern shift automation — ZYZU'S welcomes you.
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
            <Link to="/contact">
              <Button size="lg" variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/60">
                Contact District Office
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};
