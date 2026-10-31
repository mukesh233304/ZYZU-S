// FOCUSPOINT Super Admin — Pan-India Mock Test Commercial BI & CBT Passes Command Deck
// Panoramic Cyber-HUD Standard: Procedural Web Audio, Holographic 3D CBT Radar, Dual Interactive Donut Charts, 12 KPI Metric Decks, Cascading Pan-India Location Selector, 4 Defense Gates, Multi-Stream Commercial Matrix & Test Blueprint Modals

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  IndianRupee, 
  Users, 
  CheckCircle2, 
  MapPin, 
  Download, 
  ShieldCheck, 
  Clock, 
  Flame, 
  TrendingUp,
  RotateCcw,
  Zap,
  Award,
  Layers,
  ArrowUpRight,
  Filter,
  CheckCircle,
  FileCheck2,
  Calendar,
  Sparkles,
  Search,
  Globe,
  Building2,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Volume2,
  VolumeX,
  Copy,
  ExternalLink,
  ShieldAlert,
  CheckSquare,
  Square,
  Maximize2,
  Activity,
  FileCheck,
  RefreshCw,
  SlidersHorizontal,
  Compass,
  Target,
  Landmark,
  FileText,
  Eye,
  Tag
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PageHeader } from '../../components/common/PageHeader';
import { ExportModal } from '../../components/common/ExportModal';
import { PanIndiaLocationSelector, LocationSelectionPayload } from '../../components/common/PanIndiaLocationSelector';
import { InteractivePieDonutChart, DonutSegment } from '../../components/common/charts/InteractivePieDonutChart';
import { operatorService } from '../../services/operatorService';
import { SuperAdminMockTestBI as ISuperAdminMockTestBI } from '../../types/operator';
import { useToast } from '../../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';

// ============================================================================
// NATIVE WEB AUDIO CYBER SYNTHESIZER (Zero External Audio Assets)
// ============================================================================
class CyberSoundSystem {
  private ctx: AudioContext | null = null;
  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }
  public playChirp(type: 'click' | 'confirm' | 'warp' | 'alert' | 'scan') {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(840, now);
        osc.frequency.exponentialRampToValueAtTime(1260, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'confirm') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'warp') {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(310, now + 0.08);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'scan') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.linearRampToValueAtTime(1180, now + 0.08);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {
      // AudioContext unavailable
    }
  }
}
const soundSystem = new CyberSoundSystem();

// Rich fallback items for mock test papers catalog
const ENRICHED_MOCK_TESTS_CATALOG = [
  {
    id: 'mock-uppolice-si-full-04',
    title: 'UP Police SI 2026: Pan-India All-Districts Live Grand CBT Mock 04',
    examName: 'UP Police SI (UPPRPB)',
    blueprintType: 'Full Length CBT Simulation',
    totalQuestions: 160,
    totalMarks: 400,
    durationMinutes: 120,
    negativeMarking: '0 (Qualifying Sectional Cutoff 35%)',
    baseAttempts: 3420,
    averageScore: 71.2,
    completionRate: 91.4,
    passTierRequired: 'Pro All-Access Pass',
    topDistrict: 'Ghazipur',
    status: 'LIVE_ACTIVE'
  },
  {
    id: 'mock-jee-main-cbt-08',
    title: 'JEE Main 2026: All-India Full Syllabus Benchmark CBT Simulation 08',
    examName: 'NTA JEE Main 2026',
    blueprintType: 'Engineering Diagnostic CBT',
    totalQuestions: 75,
    totalMarks: 300,
    durationMinutes: 180,
    negativeMarking: '-1 / Incorrect Response',
    baseAttempts: 2890,
    averageScore: 64.8,
    completionRate: 88.6,
    passTierRequired: 'Pro All-Access Pass',
    topDistrict: 'Patna',
    status: 'LIVE_ACTIVE'
  },
  {
    id: 'mock-ssc-cgl-tier1-12',
    title: 'SSC CGL Tier-1 2026: Complete 100-Q General Intelligence & Quant Speed Drill',
    examName: 'Staff Selection Commission (SSC)',
    blueprintType: 'Speed Drill & Speed Benchmark',
    totalQuestions: 100,
    totalMarks: 200,
    durationMinutes: 60,
    negativeMarking: '-0.5 / Incorrect Response',
    baseAttempts: 4180,
    averageScore: 74.5,
    completionRate: 94.2,
    passTierRequired: 'Basic 30-Day Pass',
    topDistrict: 'Varanasi',
    status: 'LIVE_ACTIVE'
  },
  {
    id: 'mock-neet-ug-grand-05',
    title: 'NEET UG 2026: All-India Pre-Medical Full Syllabus Diagnostic Benchmark 05',
    examName: 'NTA NEET UG 2026',
    blueprintType: 'Medical Grand CBT Mock',
    totalQuestions: 180,
    totalMarks: 720,
    durationMinutes: 200,
    negativeMarking: '-1 / Incorrect Response',
    baseAttempts: 2150,
    averageScore: 62.4,
    completionRate: 86.8,
    passTierRequired: 'Pro All-Access Pass',
    topDistrict: 'Ballia',
    status: 'LIVE_ACTIVE'
  },
  {
    id: 'mock-chs-bhu-c9-02',
    title: 'CHS BHU Class 9 Entrance: Complete SET Pattern Diagnostic Test 02',
    examName: 'Central Hindu School (BHU)',
    blueprintType: 'School Entrance SET Pattern',
    totalQuestions: 100,
    totalMarks: 100,
    durationMinutes: 120,
    negativeMarking: '0 (No Negative Marking)',
    baseAttempts: 1720,
    averageScore: 78.6,
    completionRate: 93.5,
    passTierRequired: 'Free / Basic Pass',
    topDistrict: 'Varanasi',
    status: 'LIVE_ACTIVE'
  },
  {
    id: 'mock-upsssc-pet-drill-03',
    title: 'UPSSSC PET 2026: Elementary Arithmetic, Tables & Graphs Mastery Test',
    examName: 'UPSSSC PET State Exams',
    blueprintType: 'Sectional Topic Mastery',
    totalQuestions: 50,
    totalMarks: 50,
    durationMinutes: 60,
    negativeMarking: '-0.25 / Incorrect Response',
    baseAttempts: 2940,
    averageScore: 69.8,
    completionRate: 89.2,
    passTierRequired: 'Basic 30-Day Pass',
    topDistrict: 'Gorakhpur',
    status: 'LIVE_ACTIVE'
  }
];

// Commercial Pass Tiers Configuration
const COMMERCIAL_PASS_TIERS = [
  {
    id: 'pass-basic-30d',
    name: 'Basic 30-Day Exam Pass',
    price: 99,
    validity: '30 Days',
    features: ['Single Exam Blueprint Access', '15 CBT Mock Tests', 'Instant Solution Key & Derivations', 'Mobile CBT App Access'],
    activeUsersPct: 38,
    badgeColor: 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10'
  },
  {
    id: 'pass-pro-allaccess',
    name: 'Pro All-Access Multi-Exam Pass',
    price: 299,
    validity: '90 Days (Quarterly)',
    features: ['Unlimited Government & Engineering Exams', '120+ CBT Full Length Tests', 'All-India Rank Percentile Telemetry', 'Weak-Area Cognitive Diagnostic AI'],
    activeUsersPct: 44,
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
  },
  {
    id: 'pass-institutional-library',
    name: 'Institutional Library Center Pass',
    price: 999,
    validity: '180 Days (Half-Yearly)',
    features: ['Multi-Seat Library Center Access', 'Offline CBT Synced Terminals', 'Batch District Leaderboards', 'Proctor Anti-Cheating Surveillance'],
    activeUsersPct: 12,
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10'
  },
  {
    id: 'pass-lifetime-vip',
    name: 'Lifetime Pan-India VIP Pass',
    price: 1499,
    validity: '3 Years Complete Access',
    features: ['All Future Exam Batteries Included', 'Unlimited CBT Tests & Study Notes', 'Priority 1-on-1 Subject Tutor Clearance', 'VIP Dedicated Content Highway'],
    activeUsersPct: 6,
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10'
  }
];

export const SuperAdminMockTestBI: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Active Tab View in Commercial Cockpit
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PASS_TIERS' | 'PAPERS_CATALOG' | 'TERRITORY_RADAR' | 'PROCTORING_GATES'>('OVERVIEW');

  // Audio mute state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fp_superadmin_audio_enabled') !== 'false';
  });

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem('fp_superadmin_audio_enabled', String(nextState));
    if (nextState) soundSystem.playChirp('confirm');
  };

  const playSfx = (type: 'click' | 'confirm' | 'warp' | 'alert' | 'scan') => {
    if (soundEnabled) soundSystem.playChirp(type);
  };

  // Real-time HUD Clock
  const [hudTime, setHudTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setHudTime(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Raw data from OperatorService
  const [data, setData] = useState<ISuperAdminMockTestBI | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'all'>('month');

  // Centralized Pan-India Location State
  const [selectedLocation, setSelectedLocation] = useState<LocationSelectionPayload>({
    countryId: 'IN',
    stateId: '',
    stateName: '',
    districtId: '',
    districtName: '',
    localityId: '',
    localityName: '',
    level: 'INDIA',
    breadcrumb: 'Pan-India'
  });

  // Catalog Table Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [examFilter, setExamFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'attempts' | 'score' | 'completion' | 'title'>('attempts');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [inspectPaper, setInspectPaper] = useState<any | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Load BI metrics
  const loadData = async () => {
    setLoading(true);
    playSfx('scan');
    try {
      const res = await operatorService.getSuperAdminMockTestBI();
      setData(res);
    } catch (e) {
      console.error(e);
      showToast('Failed to load Mock Test BI metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedLocation, filterPeriod]);

  // Dynamic multipliers based on location and time period
  const locationMultiplier = useMemo(() => {
    if (selectedLocation.level === 'INDIA' || !selectedLocation.stateName) {
      return 1.0;
    }

    const stateLower = (selectedLocation.stateName || '').toLowerCase();
    const districtLower = (selectedLocation.districtName || '').toLowerCase();
    const localityLower = (selectedLocation.localityName || '').toLowerCase();

    // Locality Level
    if (localityLower) {
      return 0.05;
    }

    // District Level
    if (districtLower) {
      if (districtLower.includes('varanasi')) return 0.26;
      if (districtLower.includes('ghazipur')) return 0.20;
      if (districtLower.includes('lucknow')) return 0.17;
      if (districtLower.includes('prayagraj') || districtLower.includes('allahabad')) return 0.15;
      if (districtLower.includes('patna')) return 0.16;
      if (districtLower.includes('delhi')) return 0.22;
      if (districtLower.includes('pune')) return 0.19;
      if (districtLower.includes('jaipur')) return 0.13;
      if (districtLower.includes('bhopal') || districtLower.includes('indore')) return 0.12;
      if (districtLower.includes('kolkata')) return 0.14;
      return 0.10;
    }

    // State Level
    if (stateLower.includes('uttar')) return 0.65;
    if (stateLower.includes('bihar')) return 0.25;
    if (stateLower.includes('delhi')) return 0.34;
    if (stateLower.includes('maharashtra')) return 0.36;
    if (stateLower.includes('rajasthan')) return 0.23;
    if (stateLower.includes('madhya')) return 0.21;
    if (stateLower.includes('west bengal') || stateLower.includes('bengal')) return 0.20;
    if (stateLower.includes('karnataka')) return 0.19;
    if (stateLower.includes('gujarat')) return 0.18;
    if (stateLower.includes('haryana')) return 0.17;
    if (stateLower.includes('tamil')) return 0.16;
    if (stateLower.includes('punjab')) return 0.15;
    if (stateLower.includes('telangana')) return 0.16;
    if (stateLower.includes('odisha') || stateLower.includes('orissa')) return 0.14;
    if (stateLower.includes('jharkhand')) return 0.15;
    if (stateLower.includes('uttarakhand')) return 0.14;
    if (stateLower.includes('chhattisgarh')) return 0.13;
    if (stateLower.includes('assam')) return 0.12;
    return 0.16;
  }, [selectedLocation]);

  const periodMultiplier = useMemo(() => {
    switch (filterPeriod) {
      case 'today': return 0.04;
      case 'week': return 0.26;
      case 'month': return 1.0;
      case 'quarter': return 2.9;
      case 'all': return 8.2;
      default: return 1.0;
    }
  }, [filterPeriod]);

  const effectiveMultiplier = locationMultiplier * periodMultiplier;

  // 12 Corner-bracketed KPI metrics
  const displayMetrics = useMemo(() => {
    if (!data) return null;
    const activePasses = Math.max(1, Math.round(data.activeSubscriptions * effectiveMultiplier));
    const totalSubscriptions = Math.max(1, Math.round(data.totalSubscriptions * effectiveMultiplier));
    const testAttempts = Math.max(1, Math.round(data.totalAttemptsPlatformWide * effectiveMultiplier));
    const completedTests = Math.round(testAttempts * 0.88);
    const grossRevenue = Math.round(data.grossSubscriptionRevenue * effectiveMultiplier);
    const refunds = Math.round(data.totalRefunds * effectiveMultiplier);
    const netRevenue = Math.max(0, grossRevenue - refunds);
    const averageScore = 69.4;
    const completionRate = 88.2;
    const subscriptionGrowth = 24.6;
    const testSeriesCount = 32;
    const renewalRate = 74.2;
    const proctoringHealth = '99.9%';

    return {
      activePasses,
      totalSubscriptions,
      testAttempts,
      completedTests,
      grossRevenue,
      refunds,
      netRevenue,
      averageScore: `${averageScore}%`,
      completionRate: `${completionRate}%`,
      subscriptionGrowth: `+${subscriptionGrowth}%`,
      testSeriesCount,
      renewalRate: `${renewalRate}%`,
      proctoringHealth,
      popularExam: 'SSC CGL Pro Pass',
      popularTest: 'UP Police SI Grand CBT Mock 04'
    };
  }, [data, effectiveMultiplier]);

  // Dual Interactive Cyber Donut Charts
  const examPassShareData: DonutSegment[] = useMemo(() => {
    return [
      { label: 'SSC CGL & Central Pro Pass', value: 38, color: '#06b6d4' },
      { label: 'UP Police SI & State Law', value: 26, color: '#10b981' },
      { label: 'JEE & Engineering CBT Pass', value: 20, color: '#a855f7' },
      { label: 'NEET UG Pre-Medical Pass', value: 16, color: '#f59e0b' }
    ];
  }, []);

  const formatShareData: DonutSegment[] = useMemo(() => {
    return [
      { label: 'Full Length All-India Mocks', value: 58, color: '#8b5cf6' },
      { label: 'Sectional Subject Tests', value: 24, color: '#3b82f6' },
      { label: 'Speed Drills & Daily Quizzes', value: 12, color: '#ec4899' },
      { label: 'PYQ Authentic Papers', value: 6, color: '#10b981' }
    ];
  }, []);

  // Filtered & Sorted Mock Tests Catalog
  const filteredCatalog = useMemo(() => {
    return ENRICHED_MOCK_TESTS_CATALOG.filter(item => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          item.title.toLowerCase().includes(q) ||
          item.examName.toLowerCase().includes(q) ||
          item.blueprintType.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (examFilter !== 'ALL' && !item.examName.toLowerCase().includes(examFilter.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      let comp = 0;
      const aAttempts = Math.max(1, Math.round(a.baseAttempts * effectiveMultiplier));
      const bAttempts = Math.max(1, Math.round(b.baseAttempts * effectiveMultiplier));

      if (sortField === 'attempts') comp = aAttempts - bAttempts;
      else if (sortField === 'score') comp = a.averageScore - b.averageScore;
      else if (sortField === 'completion') comp = a.completionRate - b.completionRate;
      else comp = a.title.localeCompare(b.title);

      return sortDirection === 'asc' ? comp : -comp;
    });
  }, [searchQuery, examFilter, sortField, sortDirection, effectiveMultiplier]);

  // Tab switch handler
  const handleTabChange = (tab: 'OVERVIEW' | 'PASS_TIERS' | 'PAPERS_CATALOG' | 'TERRITORY_RADAR' | 'PROCTORING_GATES') => {
    playSfx('warp');
    setActiveTab(tab);
  };

  const copyToClipboard = (text: string, label: string) => {
    playSfx('click');
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  };

  if (loading || !data || !displayMetrics) {
    return (
      <div className="p-16 flex flex-col items-center justify-center min-h-[500px] text-slate-300 font-mono">
        <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-purple-500/20"></div>
        <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
          Aggregating Pan-India Mock Test & Pass Telemetry...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* ==================================================================== */}
      {/* 1. TIER 3 COCKPIT HEADER WITH 3D CBT RADAR & EXAM BATTERY ORB          */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-slate-800 p-6 md:p-8 shadow-2xl hud-corner-brackets">
        {/* Ambient Laser Gradients */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cockpit Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
            </span>
            <span className="text-purple-400 font-bold uppercase tracking-widest text-[11px]">
              SUPER ADMIN GOVERNANCE HIGHWAY // MOCK TEST & PASSES BI
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">PAN-INDIA CBT EXAM BENCHMARKING</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-mono text-[11px] bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              SYS-TIME: <span className="text-cyan-300 font-bold">{hudTime}</span>
            </span>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
              title={soundEnabled ? 'Web Audio Synthesizer ON (Click to mute)' : 'Web Audio Synthesizer MUTED'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
              title="Refresh CBT Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cockpit Mid Section: Title + Holographic 3D CBT Radar Orb */}
        <div className="pt-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PAN-INDIA CBT PASSES MONETIZED
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PERCENTILE NORMALIZATION ACTIVE
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ANTI-CHEAT PROCTORING VERIFIED
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Mock Test Commercial BI & Pan-India Exam Passes HUD
              <Landmark className="w-7 h-7 text-purple-400 shrink-0 hidden sm:inline animate-pulse" />
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Enterprise pan-India CBT mock test subscriptions, All-India rank benchmarking, pass tier monetization (Silver/Gold/Diamond Passes), attempt velocity, completion fidelity, and regional candidate percentiles across 32+ government and admission exam categories.
            </p>
          </div>

          {/* Holographic 3D CBT Radar & Exam Battery Orb */}
          <div className="relative shrink-0 flex items-center justify-center p-3 bg-slate-900/90 rounded-2xl border-2 border-slate-800 shadow-inner">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Spinning outer rings */}
              <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" strokeDasharray="6 8" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="1" strokeDasharray="3 6" />
              </svg>
              <svg className="absolute inset-0 w-full h-full animate-[spin_6s_linear_infinite_reverse]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="1" strokeDasharray="4 4" />
              </svg>

              {/* Pulsing Quantum Core */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 via-cyan-500 to-emerald-500 p-0.5 shadow-lg shadow-purple-500/30 animate-pulse flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
                  <Award className="w-5 h-5 text-purple-300" />
                </div>
              </div>
            </div>

            <div className="ml-3 font-mono text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">CBT HIGHWAY</div>
              <div className="text-sm font-black text-purple-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping inline-block" />
                {displayMetrics.activePasses.toLocaleString('en-IN')} Passes
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">
                Inflow: <span className="text-emerald-400 font-bold">₹{displayMetrics.grossRevenue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Neon Laser Divider */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent my-6 opacity-40" />

        {/* Cockpit Tier 3: Location Scope Bar & Period Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* Location Badge + Selector */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400 uppercase text-[10px]">SCOPE:</span>
              <span className="text-white font-bold">{selectedLocation.breadcrumb}</span>
              {selectedLocation.level !== 'INDIA' && (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {selectedLocation.level}
                </span>
              )}
            </div>

            <PanIndiaLocationSelector
              value={selectedLocation}
              onChange={(loc) => {
                playSfx('click');
                setSelectedLocation(loc);
              }}
              variant="compact"
              theme="purple"
            />
          </div>

          {/* Time Range Selector & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              {(['today', 'week', 'month', 'quarter', 'all'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    playSfx('click');
                    setFilterPeriod(period);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterPeriod === period
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {period === 'today' ? 'Today' : period === 'week' ? '7D' : period === 'month' ? '30D' : period === 'quarter' ? 'Quarter' : 'All Time'}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                playSfx('warp');
                setIsExportModalOpen(true);
              }}
              className="text-xs bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
              Export CBT Manifest
            </Button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. 12 CORNER-BRACKETED CYBER-HUD KPI METRIC DECKS                      */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-purple-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">ACTIVE PASSES</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">
            {displayMetrics.activePasses.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-purple-400 font-bold">Valid</span> Candidates
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-cyan-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">TOTAL SUBSCRIPTIONS</span>
            <Users className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight">
            {displayMetrics.totalSubscriptions.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-cyan-400 font-bold">Cumulative</span> Cohort
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">GROSS REVENUE</span>
            <IndianRupee className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono tracking-tight">
            ₹{displayMetrics.grossRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-emerald-400 font-bold">Net:</span> ₹{displayMetrics.netRevenue.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-amber-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">TEST ATTEMPTS</span>
            <TrendingUp className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">
            {displayMetrics.testAttempts.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-amber-400 font-bold">CBT Sessions</span> Begun
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">COMPLETED TESTS</span>
            <CheckCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono tracking-tight">
            {displayMetrics.completedTests.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-emerald-400 font-bold">{displayMetrics.completionRate}</span> Done
          </div>
        </div>

        {/* Metric 6 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-purple-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">ACTIVE TEST SERIES</span>
            <Award className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">
            {displayMetrics.testSeriesCount}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-purple-400 font-bold">Govt Curricula</span> Batteries
          </div>
        </div>

        {/* Metric 7 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-cyan-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">AVERAGE SCORE</span>
            <Target className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight">
            {displayMetrics.averageScore}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-cyan-400 font-bold">Pedagogically</span> Balanced
          </div>
        </div>

        {/* Metric 8 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">COMPLETION FIDELITY</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono tracking-tight">
            {displayMetrics.completionRate}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-emerald-400 font-bold">Full Paper</span> Submissions
          </div>
        </div>

        {/* Metric 9 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-purple-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">PASS RENEWAL RATE</span>
            <ArrowUpRight className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">
            {displayMetrics.renewalRate}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-purple-400 font-bold">Recurring</span> Subscriptions
          </div>
        </div>

        {/* Metric 10 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-amber-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">QUARTERLY GROWTH</span>
            <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">
            {displayMetrics.subscriptionGrowth}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-amber-400 font-bold">Quarterly</span> Expansion
          </div>
        </div>

        {/* Metric 11 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-rose-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">REFUNDS & DISPUTES</span>
            <RotateCcw className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-rose-300 font-mono tracking-tight">
            ₹{displayMetrics.refunds.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-rose-400 font-bold">&lt;1.9%</span> Escrow Reversals
          </div>
        </div>

        {/* Metric 12 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">PROCTOR INTEGRITY</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono tracking-tight">
            {displayMetrics.proctoringHealth}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-emerald-400 font-bold">Zero Cheat</span> Leaks
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. DUAL INTERACTIVE CYBER DONUT CHARTS                                */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-purple-500/50 hud-corner-brackets transition-all shadow-xl">
          <InteractivePieDonutChart
            title="Examination Blueprint Commercial Pass Realization Share"
            subtitle="Percentage contribution to active subscriptions across exam divisions"
            data={examPassShareData}
            centerLabel="Gross Passes"
            centerValue={`${displayMetrics.activePasses.toLocaleString('en-IN')}`}
          />
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-cyan-500/50 hud-corner-brackets transition-all shadow-xl">
          <InteractivePieDonutChart
            title="CBT Test Battery & Format Engagement Composition"
            subtitle="Volume share of full mocks, sectional tests, speed drills, and PYQs"
            data={formatShareData}
            centerLabel="Attempts Begun"
            centerValue={`${displayMetrics.testAttempts.toLocaleString('en-IN')}`}
          />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. ACTIVE CBT QUALITY & PROCTORING RADAR (4 GATES)                    */}
      {/* ==================================================================== */}
      <div className="p-5 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hud-corner-brackets shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-black text-white tracking-wide uppercase">
              CBT Candidate Proctoring & Normalization Guardrails (4 Gates)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
            ALL 4 CBT INTEGRITY GATES ENGAGED & SECURE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" /> Tab-Switch Lockout Gate
              </span>
              <span className="text-purple-400 font-bold">GATE 1</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Monitors focus loss; issues 2 automated warnings before freezing test session and logging incident to District Admin console.
            </p>
            <div className="text-[10px] text-emerald-400 font-bold pt-1">
              STATUS: 99.9% COMPLIANCE
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" /> Percentile Normalization Engine
              </span>
              <span className="text-cyan-400 font-bold">GATE 2</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Calculates statistical mean and standard deviation across multi-shift attempts to deliver unbiased All-India percentiles.
            </p>
            <div className="text-[10px] text-cyan-400 font-bold pt-1">
              STATUS: REAL-TIME CALIBRATION
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> Distractor Discrimination Index
              </span>
              <span className="text-emerald-400 font-bold">GATE 3</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Validates question item difficulty curve between top 10% and bottom 10% scorers, filtering defective test questions automatically.
            </p>
            <div className="text-[10px] text-emerald-400 font-bold pt-1">
              STATUS: ZERO ANOMALOUS Qs
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Escrow Refund Guarantee
              </span>
              <span className="text-amber-400 font-bold">GATE 4</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Automatic credit replenishment or instant refund if a candidate experiences verified network outage mid-session.
            </p>
            <div className="text-[10px] text-amber-400 font-bold pt-1">
              STATUS: ZERO UNRESOLVED DISPUTES
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. MULTI-TAB COMMERCIAL COCKPIT NAVIGATION                             */}
      {/* ==================================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hud-corner-brackets shadow-xl space-y-5">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => handleTabChange('OVERVIEW')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'OVERVIEW' 
                ? 'bg-purple-600 text-white font-black shadow-lg shadow-purple-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Commercial Pass Realization</span>
          </button>

          <button
            onClick={() => handleTabChange('PASS_TIERS')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'PASS_TIERS' 
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Monetized Pass Tiers & Packages</span>
          </button>

          <button
            onClick={() => handleTabChange('PAPERS_CATALOG')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'PAPERS_CATALOG' 
                ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Most Attempted Mock Test Papers ({filteredCatalog.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('TERRITORY_RADAR')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'TERRITORY_RADAR' 
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Territory Engagement Density</span>
          </button>

          <button
            onClick={() => handleTabChange('PROCTORING_GATES')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'PROCTORING_GATES' 
                ? 'bg-slate-800 text-purple-300 font-black border border-purple-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Anti-Cheat Proctoring Audit</span>
          </button>
        </div>

        {/* ================================================================== */}
        {/* TAB 1: OVERVIEW & RUN-RATE VELOCITY                                */}
        {/* ================================================================== */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Exam Subscriptions Breakdown */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 lg:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      Exam Blueprint Pass Volume & Inflow
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Active candidate pass distribution across examinations for {selectedLocation.breadcrumb}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    LIVE PASS COHORTS
                  </span>
                </div>

                <div className="space-y-3.5 pt-1">
                  {data.subscriptionsByExam.map((exam, idx) => {
                    const totalRev = data.subscriptionsByExam.reduce((acc, curr) => acc + curr.revenue, 0);
                    const sharePct = Math.round((exam.revenue / totalRev) * 100);
                    const scaledExamRev = Math.round(exam.revenue * effectiveMultiplier);
                    const scaledCount = Math.max(1, Math.round(exam.count * effectiveMultiplier));

                    return (
                      <div key={idx} className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="font-bold text-white">{exam.exam}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">{scaledCount} active passes</span>
                            <span className="font-bold text-emerald-400">₹{scaledExamRev.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-cyan-400 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${sharePct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
                  <span>Candidate Pass Conversion Rate: <strong className="text-white">6.2%</strong></span>
                  <span className="text-purple-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> High retention across state and central exam aspirants
                  </span>
                </div>
              </div>

              {/* Engagement Highlights */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    CBT Engagement Pulse
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    EDTECH BI
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block uppercase">MOST POPULAR EXAM PASS</span>
                    <span className="text-white font-bold text-sm block font-sans">{displayMetrics.popularExam}</span>
                    <span className="text-cyan-400 text-[10px] font-bold">44% Market Share</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block uppercase">TOP ATTEMPTED TEST PAPER</span>
                    <span className="text-purple-300 font-bold text-xs block font-sans">{displayMetrics.popularTest}</span>
                    <span className="text-purple-400 text-[10px] font-bold">3,420+ Sessions Logged</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block uppercase">COMPLETION FIDELITY</span>
                    <span className="text-emerald-400 font-bold text-sm block font-sans">{displayMetrics.completionRate}</span>
                    <span className="text-emerald-400 text-[10px] font-bold">Full Test Duration Sustained</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: MONETIZED PASS TIERS & PACKAGES                             */}
        {/* ================================================================== */}
        {activeTab === 'PASS_TIERS' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {COMMERCIAL_PASS_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border-2 border-slate-800 hover:border-purple-500/60 transition-all hud-corner-brackets shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${tier.badgeColor}`}>
                        {tier.validity}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px] font-bold">
                        {tier.activeUsersPct}% Adoption
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white font-sans">{tier.name}</h4>

                    <div className="flex items-baseline gap-1 text-2xl font-black font-mono text-emerald-400">
                      ₹{tier.price}
                      <span className="text-xs text-slate-400 font-normal">/ student</span>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-300 pt-2 font-sans border-t border-slate-800">
                      {tier.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-800 font-mono text-xs flex items-center justify-between text-slate-400">
                    <span>Pass ID: {tier.id}</span>
                    <span className="text-purple-400 font-bold">ACTIVE TIER</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: MOST ATTEMPTED MOCK TEST PAPERS CATALOG                     */}
        {/* ================================================================== */}
        {activeTab === 'PAPERS_CATALOG' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs font-mono">
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Omni search test paper, exam name, format, test ID..."
                  style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-hidden transition-all font-mono shadow-inner"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  value={examFilter}
                  onChange={(e) => setExamFilter(e.target.value)}
                  style={{ color: '#ffffff' }}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-hidden focus:border-purple-500 font-mono"
                >
                  <option value="ALL">Exam: All Blueprints</option>
                  <option value="Police">Exam: UP Police SI</option>
                  <option value="JEE">Exam: NTA JEE Main</option>
                  <option value="SSC">Exam: SSC CGL</option>
                  <option value="NEET">Exam: NTA NEET UG</option>
                  <option value="CHS">Exam: CHS BHU SET</option>
                  <option value="UPSSSC">Exam: UPSSSC PET</option>
                </select>
              </div>

              <div className="md:col-span-3 flex items-center gap-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as any)}
                  style={{ color: '#ffffff' }}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-2 outline-hidden focus:border-purple-500 font-mono"
                >
                  <option value="attempts">Sort: Total Attempts</option>
                  <option value="score">Sort: Average Score</option>
                  <option value="completion">Sort: Completion Rate</option>
                  <option value="title">Sort: Test Title</option>
                </select>

                <button
                  onClick={() => {
                    playSfx('click');
                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                  }}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                  title="Toggle Direction"
                >
                  {sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 text-cyan-400" /> : <ArrowDown className="w-4 h-4 text-cyan-400" />}
                </button>
              </div>
            </div>

            {/* Papers Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">TEST PAPER & IDENTITY</th>
                    <th className="py-3.5 px-3">EXAM BLUEPRINT</th>
                    <th className="py-3.5 px-3 text-center">SPECS (Qs / Mins)</th>
                    <th className="py-3.5 px-3 text-center">ATTEMPTS</th>
                    <th className="py-3.5 px-3 text-center">AVG SCORE</th>
                    <th className="py-3.5 px-4 text-right">COMPLETION</th>
                    <th className="py-3.5 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCatalog.map((test, idx) => {
                    const scaledAttempts = Math.round(test.baseAttempts * effectiveMultiplier);

                    return (
                      <tr key={test.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-sans text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs font-mono">
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer" onClick={() => setInspectPaper(test)}>
                                {test.title}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                                <span>ID: {test.id}</span>
                                <span>•</span>
                                <span className="text-cyan-400">{test.blueprintType}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            {test.examName}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono">
                          <span className="text-white font-bold">{test.totalQuestions} Qs</span>
                          <span className="text-slate-400 text-[10px] block">{test.durationMinutes} Mins • {test.totalMarks} M</span>
                        </td>

                        <td className="py-3.5 px-3 text-center font-bold text-white font-mono">
                          {scaledAttempts.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-center font-bold text-cyan-300 font-mono">
                          {test.averageScore}%
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {test.completionRate}% Done
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              playSfx('warp');
                              setInspectPaper(test);
                            }}
                            className="text-[11px] bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-purple-400" />
                            Blueprint
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 4: TERRITORY ENGAGEMENT DENSITY                                */}
        {/* ================================================================== */}
        {activeTab === 'TERRITORY_RADAR' && (
          <div className="space-y-6">
            {/* Target Territory CBT Radar Matrix when State/District/Locality is selected */}
            {selectedLocation.level !== 'INDIA' && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-950 border-2 border-purple-500/60 shadow-xl shadow-purple-950/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white">
                        {selectedLocation.level} RADAR LOCK
                      </span>
                      <span className="text-xs text-purple-400 font-mono font-bold">CBT CANDIDATE TELEMETRY STREAM</span>
                    </div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-400 animate-pulse" />
                      {selectedLocation.breadcrumb}
                    </h3>
                    <p className="text-xs text-slate-300 font-mono">
                      Live CBT proctoring stream & pass holder cohort telemetry locked on {selectedLocation.stateName || 'India'}
                      {selectedLocation.districtName ? ` → ${selectedLocation.districtName} Node` : ''}
                      {selectedLocation.localityName ? ` → ${selectedLocation.localityName}` : ''}.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/40 text-center font-mono">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">TERRITORY VOLUME SHARE</div>
                      <div className="text-lg font-black text-purple-300">
                        {Math.round(locationMultiplier * 100)}% of Pan-India
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        playSfx('warp');
                        setSelectedLocation({
                          countryId: 'IN',
                          level: 'INDIA',
                          breadcrumb: 'Pan-India'
                        });
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-purple-400 text-xs text-slate-200 hover:text-white font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                      Reset to Pan-India
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Regional Attempts by State */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Territory Candidate Test Volume
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    PAN-INDIA
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {data.regionalDemand.map((reg, idx) => {
                    const isSelected = selectedLocation.stateName && reg.state.toLowerCase() === selectedLocation.stateName.toLowerCase();
                    const maxAttempts = Math.max(...data.regionalDemand.map(r => r.testAttempts));
                    const pct = Math.round((reg.testAttempts / maxAttempts) * 100);
                    const scaledAttempts = Math.round(reg.testAttempts * effectiveMultiplier);
                    const scaledUsers = Math.max(1, Math.round(reg.activeUsers * effectiveMultiplier));

                    return (
                      <div 
                        key={idx} 
                        className={`p-3.5 rounded-xl transition-all space-y-2 ${
                          isSelected
                            ? 'bg-purple-950/60 border-2 border-purple-500 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/50'
                            : 'bg-slate-950/80 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white flex items-center gap-2">
                            {reg.state}
                            {isSelected && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-600 text-white">
                                ACTIVE TARGET
                              </span>
                            )}
                          </span>
                          <span className="text-purple-400 font-bold">{scaledAttempts.toLocaleString('en-IN')} attempts ({scaledUsers} candidates)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full ${isSelected ? 'bg-purple-400 shadow-sm shadow-purple-400/50' : 'bg-purple-600'}`} 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Test Format Engagement Distribution
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    CBT COHORTS
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {[
                    { category: 'Full Length All-India Mocks', share: 58, count: 5200 },
                    { category: 'Subject & Topic Sectional Tests', share: 24, count: 2150 },
                    { category: 'Speed Drills & Daily Quizzes', share: 12, count: 1080 },
                    { category: 'Previous Year Question Papers', share: 6, count: 510 }
                  ].map((cat, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{cat.category}</span>
                        <span className="text-emerald-400 font-bold">{cat.share}% Engagement</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${cat.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 5: ANTI-CHEAT PROCTORING AUDIT                                 */}
        {/* ================================================================== */}
        {activeTab === 'PROCTORING_GATES' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Anti-Cheating Proctoring & Session Integrity Real-Time Log
                </h3>
                <span className="text-emerald-400 text-[10px] font-bold">99.9% DEFENSE RATING</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-slate-400 text-[10px] block">TAB-SWITCH INCIDENTS</span>
                  <span className="text-2xl font-black text-white font-mono">14 Alerts</span>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Auto-warned and flagged; 0 persistent cheating leaks allowed into All-India leaderboard.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-slate-400 text-[10px] block">MULTI-DEVICE COLLISION</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">ZERO (0)</span>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Single active token session strictly enforced across student mobile and desktop terminals.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-slate-400 text-[10px] block">PERCENTILE FAIRNESS SCORE</span>
                  <span className="text-2xl font-black text-cyan-300 font-mono">100% Valid</span>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Standard deviation normalization verifies genuine educational performance curves.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 6. MOCK TEST PAPER BLUEPRINT MODAL                                   */}
      {/* ==================================================================== */}
      {inspectPaper && (
        <Modal
          isOpen={true}
          onClose={() => setInspectPaper(null)}
          title={`Examination Blueprint Dossier: ${inspectPaper.title}`}
          size="lg"
        >
          <div className="space-y-4 text-xs font-mono text-slate-200">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-sans">
              <h4 className="text-base font-bold text-white">{inspectPaper.title}</h4>
              <p className="text-slate-300 text-xs">
                Target Exam: <strong className="text-cyan-400">{inspectPaper.examName}</strong> • Blueprint: <strong className="text-purple-400">{inspectPaper.blueprintType}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px]">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">TOTAL QUESTIONS</span>
                <span className="text-cyan-400 font-bold text-sm">{inspectPaper.totalQuestions} Qs</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">MAXIMUM MARKS</span>
                <span className="text-emerald-400 font-bold text-sm">{inspectPaper.totalMarks} Marks</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">DURATION</span>
                <span className="text-amber-400 font-bold text-sm">{inspectPaper.durationMinutes} Mins</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">NEGATIVE MARKING</span>
                <span className="text-rose-400 font-bold text-sm">{inspectPaper.negativeMarking}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-purple-400 text-[10px] font-bold uppercase tracking-wider block">
                CANDIDATE TELEMETRY & ENGAGEMENT STATS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
                <div>Attempts: <strong className="text-white">{(Math.round(inspectPaper.baseAttempts * effectiveMultiplier)).toLocaleString('en-IN')}</strong></div>
                <div>Avg Score: <strong className="text-cyan-300">{inspectPaper.averageScore}%</strong></div>
                <div>Completion: <strong className="text-emerald-400">{inspectPaper.completionRate}%</strong></div>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 font-mono">
                Top District Hub: <span className="text-white font-bold">{inspectPaper.topDistrict}</span> • Pass Tier: <span className="text-purple-300 font-bold">{inspectPaper.passTierRequired}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button size="sm" variant="secondary" onClick={() => setInspectPaper(null)}>
                Close Blueprint
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* 7. UNIVERSAL EXPORT MODAL                                            */}
      {/* ==================================================================== */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={`Pan-India Mock Test & Passes Commercial BI Manifest (${selectedLocation.breadcrumb})`}
        data={{
          scope: selectedLocation.breadcrumb,
          timeWindow: filterPeriod,
          metrics: displayMetrics,
          subscriptionsByExam: data.subscriptionsByExam.map(e => ({
            ...e,
            scaledRevenue: Math.round(e.revenue * effectiveMultiplier),
            scaledPasses: Math.max(1, Math.round(e.count * effectiveMultiplier))
          })),
          topAttemptedTests: filteredCatalog.map(t => ({
            ...t,
            scaledAttempts: Math.round(t.baseAttempts * effectiveMultiplier)
          })),
          regionalDemand: data.regionalDemand.map(r => ({
            ...r,
            scaledAttempts: Math.round(r.testAttempts * effectiveMultiplier),
            scaledUsers: Math.max(1, Math.round(r.activeUsers * effectiveMultiplier))
          }))
        }}
        filename={`zyzus_mock_test_bi_${selectedLocation.breadcrumb.replace(/[^a-zA-Z0-9]/g, '_')}_${filterPeriod}`}
      />
    </div>
  );
};
