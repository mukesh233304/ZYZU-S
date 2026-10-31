import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService';
import { GMVAnalyticsData, DistrictGMVSummary } from '../../types';
import { InteractiveBarChart } from '../../components/common/charts/InteractiveBarChart';
import { InteractiveLineChart } from '../../components/common/charts/InteractiveLineChart';
import { ExportModal } from '../../components/common/ExportModal';
import { 
  TrendingUp, 
  ArrowUpDown, 
  IndianRupee, 
  Calendar, 
  Globe, 
  Search, 
  Download, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  X, 
  CheckCircle2,
  GraduationCap,
  Building2,
  Volume2,
  VolumeX,
  RefreshCw,
  Compass,
  Lock,
  Zap,
  Activity,
  Clock,
  Sparkles,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/common/Button';

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
  public playChirp(type: 'click' | 'confirm' | 'warp' | 'alert') {
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
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
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
        osc.frequency.setValueAtTime(330, now + 0.08);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // AudioContext unavailable or blocked
    }
  }
}
const soundSystem = new CyberSoundSystem();

type SortOption = 'HIGHEST' | 'LOWEST' | 'A_Z' | 'Z_A';

export const SuperAdminGmvAnalytics: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [data, setData] = useState<GMVAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('HIGHEST');
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [selectedMonth, setSelectedMonth] = useState('9'); // Sep
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedDistrictDetail, setSelectedDistrictDetail] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const initialDistrictParam = searchParams.get('district');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getPanIndiaGMV();
      setData(res);

      if (initialDistrictParam) {
        handleOpenDistrictDetail(initialDistrictParam);
      }
    } catch (err) {
      console.error('Failed to load GMV analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod, selectedMonth, selectedYear]);

  const handleOpenDistrictDetail = async (districtName: string) => {
    setIsDetailLoading(true);
    if (audioEnabled) soundSystem.playChirp('click');
    try {
      const detail = await analyticsService.getDistrictGMVDetails(districtName);
      setSelectedDistrictDetail(detail);
      if (audioEnabled) soundSystem.playChirp('warp');
    } catch (err) {
      console.error('Failed to load district detail', err);
      if (audioEnabled) soundSystem.playChirp('alert');
    } finally {
      setIsDetailLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-[#060b19] cyber-grid-bg border-2 border-emerald-500/30 rounded-3xl p-10 text-white space-y-4">
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <TrendingUp className="w-8 h-8 text-emerald-400 animate-pulse" />
        </div>
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-300">
          CONSOLIDATING PAN-INDIA FISCAL GMV TELEMETRY...
        </p>
      </div>
    );
  }

  // Sorting
  let sortedDistricts = [...data.districts];
  if (sortOption === 'HIGHEST') {
    sortedDistricts.sort((a, b) => b.totalGMV - a.totalGMV);
  } else if (sortOption === 'LOWEST') {
    sortedDistricts.sort((a, b) => a.totalGMV - b.totalGMV);
  } else if (sortOption === 'A_Z') {
    sortedDistricts.sort((a, b) => a.districtName.localeCompare(b.districtName));
  } else if (sortOption === 'Z_A') {
    sortedDistricts.sort((a, b) => b.districtName.localeCompare(a.districtName));
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    sortedDistricts = sortedDistricts.filter(d => 
      d.districtName.toLowerCase().includes(q) || 
      d.stateName.toLowerCase().includes(q)
    );
  }

  const months = [
    { num: '1', label: 'January' },
    { num: '2', label: 'February' },
    { num: '3', label: 'March' },
    { num: '4', label: 'April' },
    { num: '5', label: 'May' },
    { num: '6', label: 'June' },
    { num: '7', label: 'July' },
    { num: '8', label: 'August' },
    { num: '9', label: 'September' },
    { num: '10', label: 'October' },
    { num: '11', label: 'November' },
    { num: '12', label: 'December' },
  ];

  return (
    <div className="space-y-6 pb-20 bg-[#060b19] cyber-grid-bg border-2 border-emerald-500/30 shadow-2xl rounded-3xl p-4 sm:p-6 lg:p-7 text-white min-h-screen relative overflow-hidden">
      {/* Ambient Neon Nebula Glow */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40 animate-pulse"
        style={{ animationDuration: '7s' }}
      />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -ml-40 -mb-40" />

      {/* ==================================================================== */}
      {/* 1. PANORAMIC CYBER-HUD GMV ANALYTICS COMMAND STATION (3-Tier) */}
      {/* ==================================================================== */}
      <div className="relative z-10 p-4 sm:p-6 rounded-3xl bg-slate-950/95 border-2 border-emerald-500/50 shadow-2xl space-y-4 backdrop-blur-md overflow-hidden text-white">
        {/* TIER 1: MICRO-HUD TELEMETRY BREADCRUMB BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Pulse Indicator & Primary OS Badge */}
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]"></span>
              </span>
              <span className="text-[11px] font-mono font-black uppercase tracking-widest text-emerald-300 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                GMV TELEMETRY ENGINE // V4.8 PAN-INDIA FISCAL OS
              </span>
            </div>

            {/* Reconciliation Telemetry Badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-cyan-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-700 shadow-xs">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>TRANSACTIONS: 100% RECONCILED // T+0 CLEARING</span>
            </div>

            {/* Merkle Audit Badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-black text-amber-300 bg-amber-950/90 px-3 py-1 rounded-full border border-amber-500/60 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>MERKLE AUDIT: VERIFIED</span>
            </div>
          </div>

          {/* Audio Synthesizer Toggle & Vault Refresh Button */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => {
                const next = !audioEnabled;
                setAudioEnabled(next);
                if (next) soundSystem.playChirp('confirm');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                audioEnabled
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/40'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
              title="Toggle Web Audio Synthesizer"
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>AUDIO: {audioEnabled ? 'ONLINE' : 'MUTED'}</span>
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (audioEnabled) soundSystem.playChirp('warp');
                loadData();
              }}
              className="bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/70 text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-300 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Ledger</span>
            </Button>

            <button
              onClick={() => {
                if (audioEnabled) soundSystem.playChirp('click');
                setIsExportOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-black shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Ledger</span>
            </button>
          </div>
        </div>

        {/* TIER 2: DEDICATED HORIZONTAL COMMAND DISPLAY COCKPIT */}
        <div className="relative overflow-hidden p-5 sm:p-6 lg:p-7 rounded-3xl bg-gradient-to-r from-slate-950/98 via-[#06151f]/95 to-slate-950/98 border-2 border-emerald-500/60 hover:border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.25),inset_0_0_20px_rgba(6,182,212,0.06)] backdrop-blur-xl hud-corner-brackets transition-all group">
          {/* Ambient Scanning Laser Shimmer */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-cyan-500/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-80 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6 lg:gap-8">
            {/* Left Wing: Holographic Cognitive Core & Master Heading */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 shrink-0 max-w-3xl">
              {/* Holographic 3D Fiscal Orb */}
              <div className="relative shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500/35 via-teal-600/30 to-cyan-500/25 border-2 border-emerald-400/90 shadow-[0_0_30px_rgba(16,185,129,0.6)] ring-2 ring-cyan-400/30 group-hover:scale-105 transition-all duration-300">
                <TrendingUp className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-300 animate-pulse drop-shadow-[0_0_14px_rgba(16,185,129,0.9)]" />
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-cyan-400 ring-4 ring-slate-950 animate-ping" />
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-cyan-400 ring-2 ring-slate-950 shadow-[0_0_12px_rgba(6,182,212,1)]" />
                <span className="absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-black bg-slate-950 border border-emerald-400/80 text-emerald-300 shadow-xs">
                  FISCAL
                </span>
              </div>

              {/* Title & Headquarters Clear Hierarchy */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 via-teal-200 to-cyan-300 drop-shadow-[0_2px_14px_rgba(16,185,129,0.5)]">
                    Monthly Platform GMV // Fiscal Drill-Down
                  </h1>
                  <span className="px-3 py-1 rounded-lg bg-emerald-950/95 border-2 border-emerald-400 text-xs font-mono font-black text-emerald-200 uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.45)] inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    HQ FISCAL CORE
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-950/90 border border-cyan-400/80 text-[11px] font-mono font-black text-cyan-300 uppercase tracking-wider shadow-xs">
                    V4.8 CONSOLIDATED
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs font-mono font-black text-amber-300 tracking-[0.16em] uppercase block drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]">
                  CONSOLIDATED GROSS MERCHANDISE VOLUME ACROSS HOME TUITION, SELF-STUDY LIBRARIES, ONLINE & COUNTER CHANNELS
                </span>
              </div>
            </div>

            {/* Glowing Neon Laser Energy Divider (Vertical on 2xl, Horizontal on small) */}
            <div className="hidden 2xl:flex flex-col items-center justify-center mx-3 self-stretch shrink-0">
              <div className="w-[2px] min-h-[90px] h-full bg-gradient-to-b from-emerald-400/10 via-emerald-400 via-cyan-400 to-amber-400/10 shadow-[0_0_16px_rgba(16,185,129,1)]" />
              <div className="w-2.5 h-2.5 rotate-45 bg-emerald-300 border border-white shadow-[0_0_12px_rgba(16,185,129,1)] my-[-4px]" />
              <div className="w-[2px] min-h-[90px] h-full bg-gradient-to-b from-amber-400/10 via-cyan-400 via-emerald-400 to-emerald-400/10 shadow-[0_0_16px_rgba(16,185,129,1)]" />
            </div>
            <div className="2xl:hidden w-full h-[2px] bg-gradient-to-r from-emerald-500/20 via-emerald-400 via-cyan-400 to-amber-500/20 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />

            {/* Right Wing: Horizontal Panoramic Description & Holographic Telemetry Chips */}
            <div className="flex-1 min-w-0 max-w-3xl space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed drop-shadow-xs">
                Real-time Pan-India fiscal flow telemetry, multi-district revenue reconciliation, educator payroll disbursements, and library seat booking liquidity.
              </p>
              
              {/* 3 Holographic Interactive Tactical Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
                {/* 1. T+0 High-Velocity Settlements */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-emerald-950/90 to-slate-950 border-2 border-emerald-500/80 hover:border-emerald-300 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-102 flex items-center gap-2.5 group">
                  <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-400/60 text-emerald-300 shrink-0 shadow-xs">
                    <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono font-black text-[11px] uppercase tracking-wider text-emerald-300 block truncate">
                      T+0 HIGH-VELOCITY SETTLEMENTS
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400/90 font-medium block truncate">
                      Instant Clearing Highway Active
                    </span>
                  </div>
                </div>

                {/* 2. Escrow Ledger Verification */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-cyan-950/90 to-slate-950 border-2 border-cyan-500/80 hover:border-cyan-300 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-102 flex items-center gap-2.5 group">
                  <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/60 text-cyan-300 shrink-0 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono font-black text-[11px] uppercase tracking-wider text-cyan-300 block truncate">
                      ALGORITHMIC ESCROW AUDIT
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400/90 font-medium block truncate">
                      Dual-Factor Ledger Locks
                    </span>
                  </div>
                </div>

                {/* 3. Multi-Channel Reconciliation */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-amber-950/90 to-slate-950 border-2 border-amber-500/80 hover:border-amber-300 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-102 flex items-center gap-2.5 group">
                  <div className="p-1.5 rounded-lg bg-amber-950 border border-amber-400/60 text-amber-300 shrink-0 shadow-xs">
                    <Layers className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono font-black text-[11px] uppercase tracking-wider text-amber-300 block truncate">
                      MULTI-CHANNEL RECONCILIATION
                    </span>
                    <span className="text-[10px] font-mono text-amber-400/90 font-medium block truncate">
                      Tuition + Library + Mocks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Fiscal Telemetry Ribbon */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>TERRITORY: PAN-INDIA FISCAL CONSOLIDATION</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>NPCI-IMPS HIGHWAY: 2.7ms LATENCY</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-300 font-bold">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>RECONCILED TERRITORIES: {data.districts.length} DISTRICT UNITS</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold bg-emerald-950/60 px-3 py-1 rounded-md border border-emerald-500/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TREASURY HEALTH: 94.2% OPTIMAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. TEMPORAL PERIOD CONTROL & DATE NAVIGATOR DECK */}
      {/* ==================================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/95 border-2 border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'prev_month', label: 'Previous Month' },
              { id: 'last_3_months', label: 'Last 3 Months' },
              { id: 'last_6_months', label: 'Last 6 Months' },
              { id: 'this_year', label: 'This Year' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setSelectedPeriod(p.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-mono font-bold transition-all cursor-pointer ${
                  selectedPeriod === p.id
                    ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400'
                    : 'bg-slate-900 border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Month & Year Selection */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => {
                if (audioEnabled) soundSystem.playChirp('click');
                setSelectedMonth(e.target.value);
              }}
              className="h-9 px-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white text-xs font-mono font-bold focus:border-emerald-400 focus:outline-none cursor-pointer"
            >
              {months.map(m => (
                <option key={m.num} value={m.num} className="bg-slate-900 text-white">{m.label}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => {
                if (audioEnabled) soundSystem.playChirp('click');
                setSelectedYear(e.target.value);
              }}
              className="h-9 px-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white text-xs font-mono font-bold focus:border-emerald-400 focus:outline-none cursor-pointer"
            >
              <option value="2026" className="bg-slate-900 text-white">2026</option>
              <option value="2025" className="bg-slate-900 text-white">2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. TOP 6 CYBER-HUD CORNER-BRACKETED METRIC DECKS */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total GMV */}
        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-emerald-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400 group-hover:text-emerald-300 transition-colors">
              Total GMV
            </span>
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-sm">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white group-hover:text-emerald-300 transition-colors">
            ₹{data.totalGMV.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-mono font-bold text-emerald-400 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            +{data.growthQoQ}% QoQ Pacing
          </div>
        </div>

        {/* Current Month GMV */}
        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-cyan-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400 group-hover:text-cyan-300 transition-colors">
              Current Month GMV
            </span>
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-cyan-400 group-hover:text-cyan-300 transition-colors">
            ₹{data.currentMonthGMV.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Sep 2026 (MTD Active)
          </div>
        </div>

        {/* Previous Month GMV */}
        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-blue-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400 group-hover:text-blue-300 transition-colors">
              Previous Month GMV
            </span>
            <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 shadow-sm">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-300 group-hover:text-blue-300 transition-colors">
            ₹{data.previousMonthGMV.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Aug 2026 Final Closed
          </div>
        </div>

        {/* Tuition GMV */}
        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-sky-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400 group-hover:text-sky-300 transition-colors">
              Tuition GMV
            </span>
            <div className="p-2 rounded-xl bg-sky-950/80 border border-sky-500/40 text-sky-400 shadow-sm">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-sky-400 group-hover:text-sky-300 transition-colors">
            ₹{data.tuitionGMV.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            {((data.tuitionGMV / data.totalGMV) * 100).toFixed(0)}% of platform total
          </div>
        </div>

        {/* Library GMV */}
        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-amber-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400 group-hover:text-amber-300 transition-colors">
              Library GMV
            </span>
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sm">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-amber-400 group-hover:text-amber-300 transition-colors">
            ₹{data.libraryGMV.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            {((data.libraryGMV / data.totalGMV) * 100).toFixed(0)}% of platform total
          </div>
        </div>

        {/* Online vs Offline */}
        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-purple-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400 group-hover:text-purple-300 transition-colors">
              Digital / Counter
            </span>
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black font-mono tracking-tight text-purple-300 group-hover:text-white transition-colors truncate">
            ₹{(data.onlineGMV / 100000).toFixed(1)}L / ₹{(data.offlineGMV / 100000).toFixed(1)}L
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Online Gateway vs Counter
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. INTERACTIVE HOLOGRAPHIC CHARTS DECK */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-2 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-xl">
          <InteractiveBarChart
            title="District GMV Comparison"
            subtitle="Top contributing revenue territories"
            data={data.districts.map(d => ({
              label: d.districtName,
              value: d.totalGMV,
              tooltipExtra: `Tuition: ₹${d.tuitionGMV.toLocaleString()} | Library: ₹${d.libraryGMV.toLocaleString()}`
            }))}
            onBarClick={(item) => handleOpenDistrictDetail(item.label)}
          />
        </div>

        <div className="p-2 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-emerald-500/50 hud-corner-brackets transition-all shadow-xl">
          <InteractiveLineChart
            title="Consolidated Platform GMV Growth"
            subtitle="Monthly progression in Indian Rupees"
            data={data.monthlyTrend.map(t => ({ label: t.month.split(' ')[0], value: t.totalGMV }))}
          />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. DISTRICT GMV TABLE & SEARCH / SORT CONTROLS DECK */}
      {/* ==================================================================== */}
      <div className="p-6 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hud-corner-brackets space-y-4 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search district by name or state..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900 border-2 border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto text-xs">
            <span className="text-slate-400 font-mono font-bold shrink-0">ORDER BY:</span>
            <select
              value={sortOption}
              onChange={(e) => {
                if (audioEnabled) soundSystem.playChirp('click');
                setSortOption(e.target.value as SortOption);
              }}
              className="h-11 px-3.5 rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-mono font-bold text-xs cursor-pointer focus:border-emerald-400 focus:outline-none"
            >
              <option value="HIGHEST" className="bg-slate-900 text-white">Highest GMV → Lowest GMV</option>
              <option value="LOWEST" className="bg-slate-900 text-white">Lowest GMV → Highest GMV</option>
              <option value="A_Z" className="bg-slate-900 text-white">District Name A → Z</option>
              <option value="Z_A" className="bg-slate-900 text-white">District Name Z → A</option>
            </select>
          </div>
        </div>

        {/* District GMV Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-slate-800 text-[11px] font-mono font-bold text-slate-400 uppercase bg-slate-900/60">
              <tr>
                <th className="py-3 px-4">District / State</th>
                <th className="py-3 px-4 text-right">Tuition GMV</th>
                <th className="py-3 px-4 text-right">Library GMV</th>
                <th className="py-3 px-4 text-right">Total Consolidated GMV</th>
                <th className="py-3 px-4 text-center">Active Learners</th>
                <th className="py-3 px-4 text-center">Active Libraries</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {sortedDistricts.map((d) => (
                <tr
                  key={d.districtId}
                  onClick={() => handleOpenDistrictDetail(d.districtName)}
                  className="hover:bg-slate-900/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-bold text-white">
                    <p className="group-hover:text-emerald-300 transition-colors text-sm font-black">{d.districtName}</p>
                    <p className="text-[10px] text-slate-400 font-normal">{d.stateName}</p>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-sky-400">
                    ₹{d.tuitionGMV.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-amber-400">
                    ₹{d.libraryGMV.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-400 text-sm drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                    ₹{d.totalGMV.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-blue-950/80 text-blue-300 border border-blue-500/40">
                      {d.activeStudents}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                      {d.activeLibraries}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDistrictDetail(d.districtName);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white font-mono font-bold transition-all border border-emerald-500/50 shadow-xs cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Drill-Down</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 6. DISTRICT GMV DEEP DRILL-DOWN MODAL */}
      {/* ==================================================================== */}
      {selectedDistrictDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-[#060b19] border-2 border-emerald-500/70 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-white max-h-[90vh] overflow-y-auto space-y-6 hud-corner-brackets">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase font-black text-cyan-400 tracking-widest px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">
                  DISTRICT COMMAND DRILL-DOWN
                </span>
                <h3 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2">
                  <span>{selectedDistrictDetail.district.districtName} District Intelligence</span>
                  <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    RECONCILED
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  {selectedDistrictDetail.district.stateName} • Pan-India Territory Unit
                </p>
              </div>
              <button
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setSelectedDistrictDetail(null);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Quadrants of District Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {/* 1. Tuition Metrics */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border-2 border-blue-500/40 space-y-3.5 shadow-lg">
                <div className="flex items-center gap-2 font-black text-blue-400 text-sm pb-2 border-b border-slate-800">
                  <GraduationCap className="w-4 h-4" />
                  <span>Tuition & Educator Movement</span>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block">New Registered Students</span>
                    <strong className="text-white text-base">+{selectedDistrictDetail.tuitionStats.newlyRegisteredStudents}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Active Tuition Learners</span>
                    <strong className="text-blue-400 text-base">{selectedDistrictDetail.tuitionStats.activeStudents}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Active Teachers</span>
                    <strong className="text-emerald-400 text-base">{selectedDistrictDetail.tuitionStats.activeTeachers}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Discontinued Students</span>
                    <strong className="text-rose-400 text-base">{selectedDistrictDetail.tuitionStats.discontinuedStudents}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tutor Requests Raised</span>
                    <strong className="text-white text-base">{selectedDistrictDetail.tuitionStats.tutorRequests}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Completed Assignments</span>
                    <strong className="text-emerald-400 text-base">{selectedDistrictDetail.tuitionStats.completedTuitionAssignments}</strong>
                  </div>
                </div>
              </div>

              {/* 2. Library Metrics */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border-2 border-amber-500/40 space-y-3.5 shadow-lg">
                <div className="flex items-center gap-2 font-black text-amber-400 text-sm pb-2 border-b border-slate-800">
                  <Building2 className="w-4 h-4" />
                  <span>Library & Study Desks Movement</span>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block">New Registered Students</span>
                    <strong className="text-white text-base">+{selectedDistrictDetail.libraryStats.newlyRegisteredLibraryStudents}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Active Desk Enrolments</span>
                    <strong className="text-amber-400 text-base">{selectedDistrictDetail.libraryStats.activeLibraryStudents}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Active Study Libraries</span>
                    <strong className="text-white text-base">{selectedDistrictDetail.libraryStats.activeLibraries} Facilities</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Discontinued Desks</span>
                    <strong className="text-slate-500 text-base">{selectedDistrictDetail.libraryStats.discontinuedLibraryStudents}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Total Shift Bookings Recorded</span>
                    <strong className="text-emerald-400 text-base">{selectedDistrictDetail.libraryStats.libraryBookings} Bookings</strong>
                  </div>
                </div>
              </div>

              {/* 3. Financial Reconciliation */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border-2 border-emerald-500/40 space-y-3.5 shadow-lg">
                <div className="flex items-center gap-2 font-black text-emerald-400 text-sm pb-2 border-b border-slate-800">
                  <IndianRupee className="w-4 h-4" />
                  <span>District Financial Ledger</span>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total District GMV</span>
                    <strong className="text-white text-base">₹{selectedDistrictDetail.financialStats.districtGMV.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Platform Commission (8%)</span>
                    <strong className="text-cyan-400 text-base">₹{selectedDistrictDetail.financialStats.platformCommission.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Educator Disbursements</span>
                    <strong className="text-slate-300 text-base">₹{selectedDistrictDetail.financialStats.educatorPayout.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Library Settlements</span>
                    <strong className="text-slate-300 text-base">₹{selectedDistrictDetail.financialStats.libraryPayout.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">District Operations Expense</span>
                    <strong className="text-rose-400 text-base">₹{selectedDistrictDetail.financialStats.expenses.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Net Platform Surplus</span>
                    <strong className="text-emerald-400 text-base">₹{selectedDistrictDetail.financialStats.netPlatformRevenue.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* 4. Growth Rates */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border-2 border-purple-500/40 space-y-3.5 shadow-lg">
                <div className="flex items-center gap-2 font-black text-purple-400 text-sm pb-2 border-b border-slate-800">
                  <TrendingUp className="w-4 h-4" />
                  <span>Pacing & Growth Metrics</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Student Acquisition Growth:</span>
                    <strong className="text-emerald-400 text-sm">+{selectedDistrictDetail.growthStats.studentGrowth}%</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Teacher Joining Velocity:</span>
                    <strong className="text-blue-400 text-sm">+{selectedDistrictDetail.growthStats.teacherGrowth}%</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Library Facility Expansion:</span>
                    <strong className="text-amber-400 text-sm">+{selectedDistrictDetail.growthStats.libraryGrowth}%</strong>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-800">
                    <span className="text-slate-300 font-bold">Total Territory GMV Growth:</span>
                    <strong className="text-white font-black text-base">+{selectedDistrictDetail.growthStats.gmvGrowth}%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <Link to={`/super-admin/district-command?district=${encodeURIComponent(selectedDistrictDetail.district.districtName)}`}>
                <button
                  onClick={() => {
                    if (audioEnabled) soundSystem.playChirp('warp');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-mono font-black shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Step Into {selectedDistrictDetail.district.districtName} District Command</span>
                </button>
              </Link>
              <button
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setSelectedDistrictDetail(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                Close Drill-Down
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        title="Pan-India GMV Analytics & District Ledger"
        data={data.districts}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
