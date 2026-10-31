// FOCUSPOINT Super Admin — Pan-India Study Material Commercial BI & Financial Intelligence Deck
// Panoramic Cyber-HUD Standard: Procedural Web Audio, Holographic 3D Commercial Radar, Dual Interactive Donut Charts, 12 KPI Metric Decks, Cascading Pan-India Location Selector, 4 Defense Gates, Multi-Stream Commercial Matrix & Product Dossier Modals

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  IndianRupee, 
  ShoppingBag, 
  FileText, 
  MapPin, 
  Download, 
  Calendar, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  RotateCcw,
  CheckCircle,
  Eye,
  Layers,
  Award,
  BookOpen,
  Filter,
  BarChart3,
  Search,
  Tag,
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
  Zap,
  Cpu,
  RefreshCw,
  SlidersHorizontal,
  Compass,
  Flame,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PageHeader } from '../../components/common/PageHeader';
import { ExportModal } from '../../components/common/ExportModal';
import { PanIndiaLocationSelector, LocationSelectionPayload } from '../../components/common/PanIndiaLocationSelector';
import { InteractivePieDonutChart, DonutSegment } from '../../components/common/charts/InteractivePieDonutChart';
import { operatorService } from '../../services/operatorService';
import { mockStore } from '../../mock/store';
import { SuperAdminStudyMaterialBI as ISuperAdminStudyMaterialBI } from '../../types/operator';
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

// Rich fallback items for catalog table
const ENRICHED_COMMERCIAL_CATALOG = [
  {
    id: 'mat-c10-sci-optics-01',
    title: 'Class 10 Science: Light Reflection & Refraction Master Formula Sheet & NCERT Exemplar',
    subject: 'Science / Physics',
    targetClass: 'Class 10 (CBSE/UP Board)',
    examTarget: 'Secondary Board 2026',
    price: 99,
    baseUnits: 142,
    rating: 4.9,
    pageCount: 38,
    fileSize: '4.8 MB',
    author: 'Sunita Verma (OPR-IN-2026-001)',
    tier: 'DIAMOND_HIGH_DEMAND',
    topDistrict: 'Varanasi',
    downloads: 1240,
    entitlementRate: 98.2
  },
  {
    id: 'mat-uppolice-moolvidhi-02',
    title: 'UP Police SI 2026: Cracking Mool Vidhi & Constitutional Law Complete Handbook',
    subject: 'General Studies & Law',
    targetClass: 'Graduate Entrance',
    examTarget: 'UP Police SI (UPPRPB)',
    price: 149,
    baseUnits: 286,
    rating: 5.0,
    pageCount: 114,
    fileSize: '12.4 MB',
    author: 'Rajesh Kumar Sharma (OPR-IN-2026-002)',
    tier: 'PLATINUM_VELOCITY',
    topDistrict: 'Ghazipur',
    downloads: 2150,
    entitlementRate: 99.4
  },
  {
    id: 'mat-jee-adv-calc-03',
    title: 'JEE Advanced Mathematics: Definite Integrals, Differential Equations & Taylor Expansions',
    subject: 'Mathematics',
    targetClass: 'Class 12 / Droppers',
    examTarget: 'NTA JEE Advanced 2026',
    price: 299,
    baseUnits: 98,
    rating: 4.8,
    pageCount: 86,
    fileSize: '8.6 MB',
    author: 'Dr. Vikramaditya Sen (OPR-IN-2026-004)',
    tier: 'DIAMOND_HIGH_DEMAND',
    topDistrict: 'Patna',
    downloads: 870,
    entitlementRate: 96.5
  },
  {
    id: 'mat-chs-bhu-gsci-04',
    title: 'CHS BHU Class 9 Entrance 2026: General Science & Static General Knowledge Rapid Booster',
    subject: 'General Science',
    targetClass: 'Class 8 / 9 Entrance',
    examTarget: 'CHS BHU SET Entrance',
    price: 49,
    baseUnits: 184,
    rating: 4.7,
    pageCount: 46,
    fileSize: '3.9 MB',
    author: 'Sunita Verma (OPR-IN-2026-001)',
    tier: 'GOLD_STEADY',
    topDistrict: 'Varanasi',
    downloads: 1640,
    entitlementRate: 97.8
  },
  {
    id: 'mat-ssc-cgl-quant-05',
    title: 'SSC CGL Tier-1 2026: 500 High-Yield Quantitative Aptitude Solved Shortcuts & PYQ Bank',
    subject: 'Quantitative Aptitude',
    targetClass: 'Graduate Candidates',
    examTarget: 'Staff Selection Commission (SSC)',
    price: 199,
    baseUnits: 215,
    rating: 4.9,
    pageCount: 92,
    fileSize: '9.2 MB',
    author: 'Sunita Verma (OPR-IN-2026-001)',
    tier: 'PLATINUM_VELOCITY',
    topDistrict: 'Gorakhpur',
    downloads: 1890,
    entitlementRate: 99.1
  },
  {
    id: 'mat-neet-botany-06',
    title: 'NEET UG 2026: Botany & Plant Physiology High-Yield Assertion-Reason Visual Digest',
    subject: 'Biology / Botany',
    targetClass: 'Class 11 & 12',
    examTarget: 'NTA NEET UG 2026',
    price: 179,
    baseUnits: 160,
    rating: 4.9,
    pageCount: 68,
    fileSize: '6.4 MB',
    author: 'Sunita Verma (OPR-IN-2026-001)',
    tier: 'DIAMOND_HIGH_DEMAND',
    topDistrict: 'Ballia',
    downloads: 1380,
    entitlementRate: 98.7
  }
];

export const SuperAdminStudyMaterialBI: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Active Tab View in Commercial Cockpit
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CATALOG' | 'REGIONAL' | 'SECURITY_GATES'>('OVERVIEW');

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
  const [data, setData] = useState<ISuperAdminStudyMaterialBI | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | '7d' | '30d' | 'quarter' | 'year'>('30d');

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
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'revenue' | 'units' | 'price' | 'title'>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [inspectModule, setInspectModule] = useState<any | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Load BI metrics
  const loadData = async () => {
    setLoading(true);
    playSfx('scan');
    try {
      const res = await operatorService.getSuperAdminStudyMaterialBI();
      setData(res);
    } catch (e) {
      console.error(e);
      showToast('Failed to load Study Material BI metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedLocation, selectedTimeRange]);

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
      return 0.04;
    }

    // District Level
    if (districtLower) {
      if (districtLower.includes('varanasi')) return 0.24;
      if (districtLower.includes('ghazipur')) return 0.18;
      if (districtLower.includes('lucknow')) return 0.16;
      if (districtLower.includes('prayagraj') || districtLower.includes('allahabad')) return 0.14;
      if (districtLower.includes('patna')) return 0.15;
      if (districtLower.includes('delhi')) return 0.20;
      if (districtLower.includes('pune')) return 0.18;
      if (districtLower.includes('jaipur')) return 0.12;
      if (districtLower.includes('bhopal') || districtLower.includes('indore')) return 0.11;
      if (districtLower.includes('kolkata')) return 0.13;
      return 0.09;
    }

    // State Level
    if (stateLower.includes('uttar')) return 0.62;
    if (stateLower.includes('bihar')) return 0.24;
    if (stateLower.includes('delhi')) return 0.32;
    if (stateLower.includes('maharashtra')) return 0.35;
    if (stateLower.includes('rajasthan')) return 0.22;
    if (stateLower.includes('madhya')) return 0.20;
    if (stateLower.includes('west bengal') || stateLower.includes('bengal')) return 0.19;
    if (stateLower.includes('karnataka')) return 0.18;
    if (stateLower.includes('gujarat')) return 0.17;
    if (stateLower.includes('haryana')) return 0.16;
    if (stateLower.includes('tamil')) return 0.15;
    if (stateLower.includes('punjab')) return 0.14;
    if (stateLower.includes('telangana')) return 0.15;
    if (stateLower.includes('odisha') || stateLower.includes('orissa')) return 0.13;
    if (stateLower.includes('jharkhand')) return 0.14;
    if (stateLower.includes('uttarakhand')) return 0.13;
    if (stateLower.includes('chhattisgarh')) return 0.12;
    if (stateLower.includes('assam')) return 0.11;
    return 0.15;
  }, [selectedLocation]);

  const periodMultiplier = useMemo(() => {
    switch (selectedTimeRange) {
      case 'today': return 0.035;
      case '7d': return 0.25;
      case '30d': return 1.0;
      case 'quarter': return 2.8;
      case 'year': return 10.5;
      default: return 1.0;
    }
  }, [selectedTimeRange]);

  const effectiveMultiplier = locationMultiplier * periodMultiplier;

  // 12 Corner-bracketed KPI metrics
  const displayMetrics = useMemo(() => {
    if (!data) return null;
    const grossSales = Math.round(data.totalGrossSales * effectiveMultiplier);
    const refunds = Math.round(data.totalRefunds * effectiveMultiplier);
    const netRev = Math.max(0, grossSales - refunds);
    const unitsSold = Math.max(1, Math.round(data.totalUnitsSold * effectiveMultiplier));
    const discounts = Math.round(data.totalDiscounts * effectiveMultiplier);
    const downloads = Math.round(unitsSold * 3.4);
    const activeEntitlements = Math.round(unitsSold * 0.94);
    const downloadQuotaAdherence = 98.6;
    const conversionRate = 4.8;
    const momGrowth = 19.4;
    const averageOrderValue = Math.round(grossSales / unitsSold) || 150;
    const copyrightIntegrity = '100% SHA-256';

    return {
      grossSales,
      refunds,
      netRev,
      unitsSold,
      discounts,
      downloads,
      activeEntitlements,
      downloadQuotaAdherence: `${downloadQuotaAdherence}%`,
      conversionRate: `${conversionRate}%`,
      momGrowth: `+${momGrowth}%`,
      averageOrderValue: `₹${averageOrderValue}`,
      copyrightIntegrity,
      popularClass: 'Class 10 & 12 Board + Competitive SI',
      popularSubject: 'Mathematics & General Science',
      popularMaterial: 'UP Police SI Mool Vidhi & Constitution PDF'
    };
  }, [data, effectiveMultiplier]);

  // Dual Interactive Cyber Donut Charts
  const examShareChartData: DonutSegment[] = useMemo(() => {
    return [
      { label: 'SSC CGL & Central Exams', value: 36, color: '#06b6d4' },
      { label: 'UP Police & State Law', value: 28, color: '#10b981' },
      { label: 'NEET & JEE Foundation', value: 20, color: '#a855f7' },
      { label: 'Secondary School Exemplars', value: 16, color: '#f59e0b' }
    ];
  }, []);

  const formatShareChartData: DonutSegment[] = useMemo(() => {
    return [
      { label: 'Handwritten Master Notes', value: 42, color: '#8b5cf6' },
      { label: 'Formula Digests & Ray Diagrams', value: 26, color: '#3b82f6' },
      { label: 'PYQ 10-Yr Solved Question Banks', value: 20, color: '#ec4899' },
      { label: 'Rapid Booster Practice Papers', value: 12, color: '#10b981' }
    ];
  }, []);

  // Filtered & Sorted Commercial Catalog
  const filteredCatalog = useMemo(() => {
    return ENRICHED_COMMERCIAL_CATALOG.filter(item => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          item.title.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.targetClass.toLowerCase().includes(q) ||
          item.examTarget.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (subjectFilter !== 'ALL' && !item.subject.toLowerCase().includes(subjectFilter.toLowerCase())) return false;
      if (tierFilter !== 'ALL' && item.tier !== tierFilter) return false;
      return true;
    }).sort((a, b) => {
      let comp = 0;
      const aUnits = Math.max(1, Math.round(a.baseUnits * effectiveMultiplier));
      const bUnits = Math.max(1, Math.round(b.baseUnits * effectiveMultiplier));
      const aRev = aUnits * a.price;
      const bRev = bUnits * b.price;

      if (sortField === 'revenue') comp = aRev - bRev;
      else if (sortField === 'units') comp = aUnits - bUnits;
      else if (sortField === 'price') comp = a.price - b.price;
      else comp = a.title.localeCompare(b.title);

      return sortDirection === 'asc' ? comp : -comp;
    });
  }, [searchQuery, subjectFilter, tierFilter, sortField, sortDirection, effectiveMultiplier]);

  // Tab switch handler
  const handleTabChange = (tab: 'OVERVIEW' | 'CATALOG' | 'REGIONAL' | 'SECURITY_GATES') => {
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
        <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-cyan-500/20"></div>
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
          Aggregating Pan-India Commercial Realization Telemetry...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* ==================================================================== */}
      {/* 1. TIER 3 COCKPIT HEADER WITH 3D COMMERCIAL MATRIX RADAR ORB          */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-slate-800 p-6 md:p-8 shadow-2xl hud-corner-brackets">
        {/* Ambient Laser Gradients */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cockpit Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold uppercase tracking-widest text-[11px]">
              SUPER ADMIN GOVERNANCE HIGHWAY // STUDY MATERIAL COMMERCIAL BI
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">PAN-INDIA FINANCIAL REALIZATION</span>
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
              title="Refresh Commercial Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cockpit Mid Section: Title + Holographic Radar Orb */}
        <div className="pt-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% REVENUE RECONCILED
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                DYNAMIC REGIONAL PRICING ACTIVE
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                FORENSIC STEGANOGRAPHY SEALED
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Study Material Commercial BI & Financial Intelligence HUD
              <TrendingUp className="w-7 h-7 text-emerald-400 shrink-0 hidden sm:inline animate-pulse" />
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Enterprise pan-India learning content commercial realization, digital entitlement unlocks, download quota enforcement, dynamic regional purchasing parity, and pedagogical cash inflow velocity across rural & urban districts.
            </p>
          </div>

          {/* Holographic 3D Commercial Matrix & Revenue Orb */}
          <div className="relative shrink-0 flex items-center justify-center p-3 bg-slate-900/90 rounded-2xl border-2 border-slate-800 shadow-inner">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Spinning outer rings */}
              <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" strokeDasharray="6 8" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="1" strokeDasharray="3 6" />
              </svg>
              <svg className="absolute inset-0 w-full h-full animate-[spin_6s_linear_infinite_reverse]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1" strokeDasharray="4 4" />
              </svg>

              {/* Pulsing Quantum Core */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 via-cyan-500 to-purple-500 p-0.5 shadow-lg shadow-emerald-500/30 animate-pulse flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-emerald-300" />
                </div>
              </div>
            </div>

            <div className="ml-3 font-mono text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">REVENUE HIGHWAY</div>
              <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                ₹{displayMetrics.grossSales.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">
                Units: <span className="text-cyan-300 font-bold">{displayMetrics.unitsSold.toLocaleString('en-IN')} Sold</span>
              </div>
            </div>
          </div>
        </div>

        {/* Neon Laser Divider */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent my-6 opacity-40" />

        {/* Cockpit Tier 3: Location Scope Bar & Period Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* Location Badge + Selector */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400 uppercase text-[10px]">SCOPE:</span>
              <span className="text-white font-bold">{selectedLocation.breadcrumb}</span>
              {selectedLocation.level !== 'INDIA' && (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
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
              theme="emerald"
            />
          </div>

          {/* Time Range Selector & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              {(['today', '7d', '30d', 'quarter', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    playSfx('click');
                    setSelectedTimeRange(period);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedTimeRange === period
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {period === 'today' ? 'Today' : period === '7d' ? '7D' : period === '30d' ? '30D' : period === 'quarter' ? 'Quarter' : '1 Year'}
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
              <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Export BI Manifest
            </Button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. 12 CORNER-BRACKETED CYBER-HUD KPI METRIC DECKS                      */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">GROSS SALES</span>
            <IndianRupee className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono tracking-tight">
            ₹{displayMetrics.grossSales.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-emerald-400 font-bold">Inflow</span> Volume
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-cyan-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">NET REVENUE</span>
            <TrendingUp className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight">
            ₹{displayMetrics.netRev.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-cyan-400 font-bold">Post-Refunds</span> Realized
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-purple-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">UNITS SOLD</span>
            <ShoppingBag className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">
            {displayMetrics.unitsSold.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-purple-400 font-bold">Packs</span> Delivered
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-blue-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">ENTITLEMENTS</span>
            <ShieldCheck className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-blue-300 font-mono tracking-tight">
            {displayMetrics.activeEntitlements.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-blue-400 font-bold">Active</span> Digital Licenses
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-amber-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">TOTAL DOWNLOADS</span>
            <Download className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">
            {displayMetrics.downloads.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-amber-400 font-bold">PDF Hits</span> Verified
          </div>
        </div>

        {/* Metric 6 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-rose-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">REFUNDS & DISPUTES</span>
            <RotateCcw className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-rose-300 font-mono tracking-tight">
            ₹{displayMetrics.refunds.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-rose-400 font-bold">1.5%</span> Return Rate
          </div>
        </div>

        {/* Metric 7 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">CONVERSION RATE</span>
            <Percent className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono tracking-tight">
            {displayMetrics.conversionRate}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-emerald-400 font-bold">Catalog</span> to Order
          </div>
        </div>

        {/* Metric 8 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-cyan-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">MOM GROWTH</span>
            <ArrowUpRight className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight">
            {displayMetrics.momGrowth}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-cyan-400 font-bold">Consistently</span> Expanding
          </div>
        </div>

        {/* Metric 9 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-purple-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">AVERAGE ORDER VALUE</span>
            <Award className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">
            {displayMetrics.averageOrderValue}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-purple-400 font-bold">Optimal</span> Pricing Sweetspot
          </div>
        </div>

        {/* Metric 10 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-amber-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">DISCOUNTS GRANTED</span>
            <Tag className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">
            ₹{displayMetrics.discounts.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-amber-400 font-bold">Coupons</span> & Subsidies
          </div>
        </div>

        {/* Metric 11 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-blue-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">QUOTA FAIR-USE</span>
            <Clock className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-blue-300 font-mono tracking-tight">
            {displayMetrics.downloadQuotaAdherence}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-blue-400 font-bold">3/Mo Limit</span> Compliant
          </div>
        </div>

        {/* Metric 12 */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">COPYRIGHT HASH</span>
            <FileCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono tracking-tight">
            {displayMetrics.copyrightIntegrity}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-mono">
            <span className="text-emerald-400 font-bold">Anti-Piracy</span> Steganography
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. DUAL INTERACTIVE CYBER DONUT CHARTS                                */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-xl">
          <InteractivePieDonutChart
            title="Examination Blueprint Commercial Realization Share"
            subtitle="Percentage contribution to gross sales across major exam divisions"
            data={examShareChartData}
            centerLabel="Total Cashflow"
            centerValue={`₹${displayMetrics.grossSales.toLocaleString('en-IN')}`}
          />
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-cyan-500/50 hud-corner-brackets transition-all shadow-xl">
          <InteractivePieDonutChart
            title="Pedagogical Format & Digital Product Mix"
            subtitle="Volume share of handwritten notes, formulas, PYQs, and booster papers"
            data={formatShareChartData}
            centerLabel="Packs Delivered"
            centerValue={`${displayMetrics.unitsSold.toLocaleString('en-IN')} Units`}
          />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. ACTIVE COMMERCIAL QUALITY & ENTITLEMENT RADAR (4 GATES)            */}
      {/* ==================================================================== */}
      <div className="p-5 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hud-corner-brackets shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-white tracking-wide uppercase">
              Commercial Digital Licensing & Anti-Piracy Guardrails (4 Gates)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
            100% ESCROW & ENTITLEMENT ENFORCEMENT ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> Forensic Steganography
              </span>
              <span className="text-emerald-400 font-bold">GATE 1</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Injects encrypted student mobile number, order ID, and timestamp into all rendered PDF margins to prevent unauthorized redistribution.
            </p>
            <div className="text-[10px] text-emerald-400 font-bold pt-1">
              STATUS: ZERO TAMPER LEAKS
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Fair-Use Quota Firewall
              </span>
              <span className="text-cyan-400 font-bold">GATE 2</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Controls high-bandwidth scraping via 3 downloads/month policy, with automatic rollover for paid verified student accounts.
            </p>
            <div className="text-[10px] text-cyan-400 font-bold pt-1">
              STATUS: 98.6% ADHERENCE
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-amber-400" /> Dynamic PPP Price Tiering
              </span>
              <span className="text-amber-400 font-bold">GATE 3</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Dynamically scales base pricing between urban tier-1 centers and rural library nodes to maximize educational affordability.
            </p>
            <div className="text-[10px] text-amber-400 font-bold pt-1">
              STATUS: 5 REGIONAL TIERS
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-purple-400" /> Instant Escrow Resolution
              </span>
              <span className="text-purple-400 font-bold">GATE 4</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Automated 24-hour refund clearance for duplicate purchases or format incompatibility, protecting trust with student families.
            </p>
            <div className="text-[10px] text-purple-400 font-bold pt-1">
              STATUS: &lt;1.5% DISPUTE RATE
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
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Commercial Trends & Monthly Velocity</span>
          </button>

          <button
            onClick={() => handleTabChange('CATALOG')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'CATALOG' 
                ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Top Commercial Modules Catalog ({filteredCatalog.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('REGIONAL')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'REGIONAL' 
                ? 'bg-purple-600 text-white font-black shadow-lg shadow-purple-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Regional State & District Inflow Matrix</span>
          </button>

          <button
            onClick={() => handleTabChange('SECURITY_GATES')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'SECURITY_GATES' 
                ? 'bg-slate-800 text-emerald-300 font-black border border-emerald-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Entitlements & Anti-Piracy Audit</span>
          </button>
        </div>

        {/* ================================================================== */}
        {/* TAB 1: OVERVIEW & RUN-RATE VELOCITY                                */}
        {/* ================================================================== */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Revenue Trend */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 lg:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Monthly Revenue & Units Run-Rate Velocity
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Commercial trend across time window for {selectedLocation.breadcrumb}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    LIVE REVENUE INFLOW
                  </span>
                </div>

                <div className="space-y-3.5 pt-1">
                  {data.monthlyRevenueTrend.map((item, idx) => {
                    const scaledRevenue = Math.round(item.revenue * effectiveMultiplier);
                    const scaledSales = Math.max(1, Math.round(item.sales * effectiveMultiplier));
                    const maxRev = Math.max(...data.monthlyRevenueTrend.map(m => m.revenue * effectiveMultiplier));
                    const pct = Math.round((scaledRevenue / maxRev) * 100);

                    return (
                      <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="font-bold text-white">{item.month}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">{scaledSales} units</span>
                            <span className="font-bold text-emerald-400">₹{scaledRevenue.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
                  <span>Average revenue per study module: <strong className="text-white">₹150</strong></span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> 98.4% Entitlement Retention Rate
                  </span>
                </div>
              </div>

              {/* Product Category Insights */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Top Category Traction
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    EDTECH BI
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block uppercase">TOP TIER CLASS</span>
                    <span className="text-white font-bold text-sm block font-sans">{displayMetrics.popularClass}</span>
                    <span className="text-emerald-400 text-[10px] font-bold">52% Category Share</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block uppercase">TOP PERFORMING SUBJECT</span>
                    <span className="text-cyan-300 font-bold text-sm block font-sans">{displayMetrics.popularSubject}</span>
                    <span className="text-cyan-400 text-[10px] font-bold">High rural town demand</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block uppercase">HIGHEST GROSSING PACK</span>
                    <span className="text-purple-300 font-bold text-xs block font-sans">{displayMetrics.popularMaterial}</span>
                    <span className="text-purple-400 text-[10px] font-bold">₹149 Base Tier • 286+ Orders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: TOP COMMERCIAL STUDY MODULES CATALOG TABLE                  */}
        {/* ================================================================== */}
        {activeTab === 'CATALOG' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs font-mono">
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Omni search title, subject, target exam, module ID, author..."
                  style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-hidden transition-all font-mono shadow-inner"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  style={{ color: '#ffffff' }}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-hidden focus:border-emerald-500 font-mono"
                >
                  <option value="ALL">Subject: All Disciplines</option>
                  <option value="Science">Subject: Science / Physics</option>
                  <option value="Mathematics">Subject: Mathematics</option>
                  <option value="Law">Subject: General Studies & Law</option>
                  <option value="Quantitative">Subject: Quantitative Aptitude</option>
                  <option value="Botany">Subject: Biology / Botany</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  style={{ color: '#ffffff' }}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-hidden focus:border-emerald-500 font-mono"
                >
                  <option value="ALL">Traction: All Tiers</option>
                  <option value="DIAMOND_HIGH_DEMAND">Diamond Demand</option>
                  <option value="PLATINUM_VELOCITY">Platinum Velocity</option>
                  <option value="GOLD_STEADY">Gold Steady</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as any)}
                  style={{ color: '#ffffff' }}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-2 outline-hidden focus:border-emerald-500 font-mono"
                >
                  <option value="revenue">Sort: Revenue</option>
                  <option value="units">Sort: Units Sold</option>
                  <option value="price">Sort: Price</option>
                  <option value="title">Sort: Title</option>
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

            {/* Catalog Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">MODULE TITLE & IDENTITY</th>
                    <th className="py-3.5 px-3">SUBJECT & TARGET</th>
                    <th className="py-3.5 px-3 text-center">BASE PRICE</th>
                    <th className="py-3.5 px-3 text-center">UNITS SOLD</th>
                    <th className="py-3.5 px-4 text-right">GROSS INFLOW</th>
                    <th className="py-3.5 px-3 text-center">TRACTION TIER</th>
                    <th className="py-3.5 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCatalog.map((item, idx) => {
                    const scaledUnits = Math.max(1, Math.round(item.baseUnits * effectiveMultiplier));
                    const scaledRevenue = scaledUnits * item.price;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-sans text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs font-mono">
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer" onClick={() => setInspectModule(item)}>
                                {item.title}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                                <span>ID: {item.id}</span>
                                <span>•</span>
                                <span className="text-cyan-400">{item.pageCount} Pages</span>
                                <span>•</span>
                                <span className="text-amber-400">★ {item.rating}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="text-white font-semibold">{item.subject}</div>
                          <div className="text-[10px] text-slate-400">{item.targetClass}</div>
                        </td>

                        <td className="py-3.5 px-3 text-center font-bold text-emerald-400 font-mono">
                          ₹{item.price}
                        </td>

                        <td className="py-3.5 px-3 text-center font-bold text-white font-mono">
                          {scaledUnits} orders
                        </td>

                        <td className="py-3.5 px-4 text-right font-black font-mono text-emerald-400">
                          ₹{scaledRevenue.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            item.tier === 'PLATINUM_VELOCITY'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.tier === 'DIAMOND_HIGH_DEMAND'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {item.tier.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              playSfx('warp');
                              setInspectModule(item);
                            }}
                            className="text-[11px] bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                            Dossier
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
        {/* TAB 3: REGIONAL STATE & DISTRICT INFLOW MATRIX                     */}
        {/* ================================================================== */}
        {/* ================================================================== */}
        {/* TAB 3: REGIONAL STATE & DISTRICT INFLOW MATRIX                     */}
        {/* ================================================================== */}
        {activeTab === 'REGIONAL' && (
          <div className="space-y-6">
            {/* Focused Territory Intelligence Enclave when State/District/Locality is selected */}
            {selectedLocation.level !== 'INDIA' && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border-2 border-emerald-500/60 shadow-xl shadow-emerald-950/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                        {selectedLocation.level} TELEMETRY LOCK
                      </span>
                      <span className="text-xs text-emerald-400 font-mono font-bold">FOCUSED COMMERCIAL ENCLAVE</span>
                    </div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-400 animate-pulse" />
                      {selectedLocation.breadcrumb}
                    </h3>
                    <p className="text-xs text-slate-300 font-mono">
                      Real-time granular commercial stream isolated for {selectedLocation.stateName || 'India'}
                      {selectedLocation.districtName ? ` → ${selectedLocation.districtName} Hub` : ''}
                      {selectedLocation.localityName ? ` → ${selectedLocation.localityName}` : ''}.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 text-center font-mono">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">TERRITORY CONTRIBUTION</div>
                      <div className="text-lg font-black text-emerald-300">
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
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-400 text-xs text-slate-200 hover:text-white font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                      Reset to Pan-India
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* State Inflow Distribution */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    State-Level Revenue Density
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    PAN-INDIA
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {data.salesByState.map((st, sIdx) => {
                    const isSelected = selectedLocation.stateName && st.state.toLowerCase() === selectedLocation.stateName.toLowerCase();
                    const scaled = Math.round(st.revenue * effectiveMultiplier);
                    const totalSt = data.salesByState.reduce((acc, curr) => acc + curr.revenue * effectiveMultiplier, 0);
                    const pct = totalSt > 0 ? Math.round((scaled / totalSt) * 100) : 25;

                    return (
                      <div 
                        key={sIdx} 
                        className={`p-3.5 rounded-xl transition-all space-y-2 ${
                          isSelected
                            ? 'bg-emerald-950/60 border-2 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                            : 'bg-slate-950/80 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white flex items-center gap-2">
                            {st.state}
                            {isSelected && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-slate-950">
                                ACTIVE FOCUS
                              </span>
                            )}
                          </span>
                          <span className="text-emerald-400 font-bold">₹{scaled.toLocaleString('en-IN')} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full ${isSelected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-cyan-500'}`} 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* District Inflow Distribution */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    Top Performing District Hubs
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    DISTRICT LEDGER
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {data.salesByDistrict.map((dst, dIdx) => {
                    const isDistrictSelected = selectedLocation.districtName && dst.district.toLowerCase() === selectedLocation.districtName.toLowerCase();
                    const scaled = Math.round(dst.revenue * effectiveMultiplier);
                    const totalDst = data.salesByDistrict.reduce((acc, curr) => acc + curr.revenue * effectiveMultiplier, 0);
                    const pct = totalDst > 0 ? Math.round((scaled / totalDst) * 100) : 20;

                    return (
                      <div 
                        key={dIdx} 
                        className={`p-3.5 rounded-xl transition-all space-y-2 ${
                          isDistrictSelected
                            ? 'bg-emerald-950/60 border-2 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                            : 'bg-slate-950/80 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white flex items-center gap-2">
                            {dst.district} Hub
                            {isDistrictSelected && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-slate-950">
                                ACTIVE HUB
                              </span>
                            )}
                          </span>
                          <span className="text-cyan-300 font-bold">₹{scaled.toLocaleString('en-IN')} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full ${isDistrictSelected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-emerald-500'}`} 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 4: ENTITLEMENTS & ANTI-PIRACY SECURITY AUDIT                   */}
        {/* ================================================================== */}
        {activeTab === 'SECURITY_GATES' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Forensic Anti-Piracy Watermark & Download Quota Compliance Audit
                </h3>
                <span className="text-emerald-400 text-[10px] font-bold">SHA-256 DIGITAL FINGERPRINT</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-slate-400 text-[10px] block">TOTAL FORENSIC MARGIN MARKS</span>
                  <span className="text-2xl font-black text-white font-mono">{displayMetrics.downloads}</span>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    100% of generated PDFs contained tamper-proof student mobile watermark hash.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-slate-400 text-[10px] block">PIRACY LEAKS DETECTED</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">ZERO (0)</span>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Automated web crawler has detected 0 unauthorized uploads across Telegram or public forums.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-slate-400 text-[10px] block">DOWNLOAD FAIR-USE ADHERENCE</span>
                  <span className="text-2xl font-black text-cyan-300 font-mono">{displayMetrics.downloadQuotaAdherence}</span>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Students strictly adhere to the 3-downloads monthly limit with zero abusive scraping attempts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 6. MODULE COMMERCIAL DOSSIER MODAL                                   */}
      {/* ==================================================================== */}
      {inspectModule && (
        <Modal
          isOpen={true}
          onClose={() => setInspectModule(null)}
          title={`Commercial Asset Dossier: ${inspectModule.title}`}
          size="lg"
        >
          <div className="space-y-4 text-xs font-mono text-slate-200">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-sans">
              <h4 className="text-base font-bold text-white">{inspectModule.title}</h4>
              <p className="text-slate-300 text-xs">
                Authored by <strong className="text-cyan-400">{inspectModule.author}</strong> • Subject: <strong className="text-emerald-400">{inspectModule.subject}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px]">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">BASE PRICE</span>
                <span className="text-emerald-400 font-bold text-sm">₹{inspectModule.price}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">UNITS DELIVERED</span>
                <span className="text-white font-bold text-sm">{Math.max(1, Math.round(inspectModule.baseUnits * effectiveMultiplier))} Orders</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">TOTAL INFLOW</span>
                <span className="text-cyan-400 font-bold text-sm">₹{(Math.max(1, Math.round(inspectModule.baseUnits * effectiveMultiplier)) * inspectModule.price).toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">STUDENT RATING</span>
                <span className="text-amber-400 font-bold text-sm">★ {inspectModule.rating} / 5.0</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-purple-400 text-[10px] font-bold uppercase tracking-wider block">
                DIGITAL FORENSIC SPECIFICATIONS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
                <div>Pages: <strong className="text-white">{inspectModule.pageCount} Pages</strong></div>
                <div>Size: <strong className="text-white">{inspectModule.fileSize}</strong></div>
                <div>Top Hub: <strong className="text-emerald-400">{inspectModule.topDistrict}</strong></div>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 font-mono">
                SHA-256 Fingerprint: <span className="text-cyan-300">7f8a9b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button size="sm" variant="secondary" onClick={() => setInspectModule(null)}>
                Close Dossier
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
        title={`Pan-India Study Material Commercial BI Manifest (${selectedLocation.breadcrumb})`}
        data={{
          scope: selectedLocation.breadcrumb,
          timeWindow: selectedTimeRange,
          metrics: displayMetrics,
          monthlyTrend: data.monthlyRevenueTrend.map(item => ({
            ...item,
            scaledRevenue: Math.round(item.revenue * effectiveMultiplier),
            scaledUnits: Math.max(1, Math.round(item.sales * effectiveMultiplier))
          })),
          topSellingCatalog: filteredCatalog.map(c => ({
            ...c,
            units: Math.max(1, Math.round(c.baseUnits * effectiveMultiplier)),
            grossRevenue: Math.max(1, Math.round(c.baseUnits * effectiveMultiplier)) * c.price
          })),
          stateDistribution: data.salesByState,
          districtDistribution: data.salesByDistrict
        }}
        filename={`zyzus_study_material_bi_${selectedLocation.breadcrumb.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedTimeRange}`}
      />
    </div>
  );
};
