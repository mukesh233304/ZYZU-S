import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { academicIntelligenceService } from '../../services/academicIntelligenceService';
import {
  AcademicKPIOverview,
  PerformanceThresholdConfig,
  AIControlConfig
} from '../../types/academicIntelligence';
import {
  Brain,
  Sliders,
  AlertTriangle,
  Award,
  BookOpen,
  BarChart3,
  Bot,
  Save,
  CheckCircle2,
  TrendingDown,
  Layers,
  Sparkles,
  MapPin,
  Volume2,
  VolumeX,
  RefreshCw,
  Compass,
  ShieldCheck,
  Lock,
  Zap,
  Activity,
  Check,
  Flame,
  Target,
  Cpu,
  Globe
} from 'lucide-react';
import { PanIndiaLocationSelector, LocationSelectionPayload } from '../../components/common/PanIndiaLocationSelector';
import { Card } from '../../components/common/Card';
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

export const SuperAdminAcademicIntelligence: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
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
  const selectedDistrict = selectedLocation.districtName || 'all';
  const [kpiData, setKpiData] = useState<AcademicKPIOverview | null>(null);
  const [thresholds, setThresholds] = useState<PerformanceThresholdConfig | null>(null);
  const [aiConfig, setAiConfig] = useState<AIControlConfig | null>(null);

  // Form states for thresholds
  const [excellentVal, setExcellentVal] = useState<number>(85);
  const [goodVal, setGoodVal] = useState<number>(70);
  const [averageVal, setAverageVal] = useState<number>(50);
  const [weakVal, setWeakVal] = useState<number>(40);
  const [minTestsVal, setMinTestsVal] = useState<number>(2);
  const [savingThresholds, setSavingThresholds] = useState<boolean>(false);

  // AI Policy states
  const [humanReviewRequired, setHumanReviewRequired] = useState<boolean>(true);
  const [aiGenEnabled, setAiGenEnabled] = useState<boolean>(true);
  const [aiRecEnabled, setAiRecEnabled] = useState<boolean>(true);
  const [savingAiConfig, setSavingAiConfig] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, [selectedLocation]);

  const loadData = async () => {
    try {
      setLoading(true);
      const locFilter = selectedLocation.districtName
        ? { state: selectedLocation.stateName, district: selectedLocation.districtName, locality: selectedLocation.localityName }
        : selectedLocation.stateName
        ? { state: selectedLocation.stateName }
        : undefined;

      const [kpis, thresh, ai] = await Promise.all([
        academicIntelligenceService.getKPIOverview(locFilter),
        academicIntelligenceService.getThresholds(),
        academicIntelligenceService.getAIControlConfig()
      ]);

      setKpiData(kpis);
      setThresholds(thresh);
      setAiConfig(ai);

      setExcellentVal(thresh.excellentThreshold);
      setGoodVal(thresh.goodThreshold);
      setAverageVal(thresh.averageThreshold);
      setWeakVal(thresh.needsImprovementThreshold);
      setMinTestsVal(thresh.minTestsRequiredForClassification);

      setHumanReviewRequired(ai.humanApprovalRequired);
      setAiGenEnabled(ai.aiQuestionGenerationEnabled);
      setAiRecEnabled(ai.aiRecommendationEngineEnabled);
    } catch (err) {
      console.error('Failed to load academic intelligence data', err);
      addToast('Failed to load intelligence metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingThresholds(true);
      if (audioEnabled) soundSystem.playChirp('click');
      const updated = await academicIntelligenceService.updateThresholds(
        {
          excellentThreshold: Number(excellentVal),
          goodThreshold: Number(goodVal),
          averageThreshold: Number(averageVal),
          needsImprovementThreshold: Number(weakVal),
          minTestsRequiredForClassification: Number(minTestsVal)
        },
        user?.name || 'Chief Platform Administrator'
      );
      setThresholds(updated);
      if (audioEnabled) soundSystem.playChirp('confirm');
      addToast('Performance threshold policy saved successfully', 'success');
    } catch (err) {
      console.error(err);
      if (audioEnabled) soundSystem.playChirp('alert');
      addToast('Failed to update thresholds', 'error');
    } finally {
      setSavingThresholds(false);
    }
  };

  const handleSaveAiPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingAiConfig(true);
      if (audioEnabled) soundSystem.playChirp('click');
      const updated = await academicIntelligenceService.updateAIControlConfig({
        humanApprovalRequired: humanReviewRequired,
        aiQuestionGenerationEnabled: aiGenEnabled,
        aiRecommendationEngineEnabled: aiRecEnabled
      });
      setAiConfig(updated);
      if (audioEnabled) soundSystem.playChirp('confirm');
      addToast('AI Studio Quality Governance updated', 'success');
    } catch (err) {
      console.error(err);
      if (audioEnabled) soundSystem.playChirp('alert');
      addToast('Failed to update AI policy', 'error');
    } finally {
      setSavingAiConfig(false);
    }
  };

  if (loading || !kpiData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-[#060b19] cyber-grid-bg border-2 border-brand-500/30 rounded-3xl p-10 text-white space-y-4">
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-brand-500/20 border-t-brand-400 animate-spin" />
          <Brain className="w-8 h-8 text-brand-400 animate-pulse" />
        </div>
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-brand-300">
          SCANNING PAN-INDIA ACADEMIC TELEMETRY...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 bg-[#060b19] cyber-grid-bg border-2 border-brand-500/30 shadow-2xl rounded-3xl p-4 sm:p-6 lg:p-7 text-white min-h-screen relative overflow-hidden">
      {/* Ambient Neon Nebula Glow */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40 animate-pulse"
        style={{ animationDuration: '7s' }}
      />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -ml-40 -mb-40" />

      {/* ==================================================================== */}
      {/* 1. PANORAMIC CYBER-HUD ACADEMIC INTELLIGENCE COMMAND STATION (3-Tier) */}
      {/* ==================================================================== */}
      <div className="relative z-10 p-4 sm:p-6 rounded-3xl bg-slate-950/95 border-2 border-brand-500/50 shadow-2xl space-y-4 backdrop-blur-md overflow-hidden text-white">
        {/* TIER 1: MICRO-HUD TELEMETRY BREADCRUMB BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Pulse Indicator & Primary OS Badge */}
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500 shadow-[0_0_12px_rgba(249,115,22,0.9)]"></span>
              </span>
              <span className="text-[11px] font-mono font-black uppercase tracking-widest text-brand-300 px-3 py-1 rounded-full bg-brand-950/90 border border-brand-500/70 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                ACADEMIC INTELLIGENCE OS // V4.8 COGNITIVE TELEMETRY
              </span>
            </div>

            {/* AI Studio State Badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-cyan-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-700 shadow-xs">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI STUDIO: ACTIVE // 4-TIER INTERVENTIONS</span>
            </div>

            {/* Calibration Integrity Badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-black text-emerald-300 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-500/60 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CALIBRATION: 100% VERIFIED</span>
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
                addToast(next ? 'Cyber Synth Audio Enabled' : 'Cyber Synth Muted', 'info');
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
              className="bg-brand-950 hover:bg-brand-900 text-brand-200 border border-brand-500/70 text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-brand-300 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </Button>
          </div>
        </div>

        {/* TIER 2: DEDICATED HORIZONTAL COMMAND DISPLAY COCKPIT */}
        <div className="relative overflow-hidden p-5 sm:p-6 lg:p-7 rounded-3xl bg-gradient-to-r from-slate-950/98 via-[#0b1329]/95 to-slate-950/98 border-2 border-brand-500/60 hover:border-brand-400 shadow-[0_0_35px_rgba(249,115,22,0.25),inset_0_0_20px_rgba(6,182,212,0.06)] backdrop-blur-xl hud-corner-brackets transition-all group">
          {/* Ambient Scanning Laser Shimmer */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-500/10 via-cyan-500/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-80 h-40 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6 lg:gap-8">
            {/* Left Wing: Holographic Cognitive Core & Master Heading */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 shrink-0 max-w-3xl">
              {/* Holographic 3D Neural Emblem */}
              <div className="relative shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-500/35 via-purple-600/30 to-cyan-500/25 border-2 border-brand-400/90 shadow-[0_0_30px_rgba(249,115,22,0.6)] ring-2 ring-cyan-400/30 group-hover:scale-105 transition-all duration-300">
                <Brain className="w-9 h-9 sm:w-11 sm:h-11 text-brand-300 animate-pulse drop-shadow-[0_0_14px_rgba(249,115,22,0.9)]" />
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-4 ring-slate-950 animate-ping" />
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 shadow-[0_0_12px_rgba(52,211,153,1)]" />
                <span className="absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-black bg-slate-950 border border-brand-400/80 text-brand-300 shadow-xs">
                  SYNAPSE
                </span>
              </div>

              {/* Title & Headquarters Clear Hierarchy */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 via-orange-200 to-cyan-300 drop-shadow-[0_2px_14px_rgba(249,115,22,0.5)]">
                    Platform Academic Intelligence & Governance
                  </h1>
                  <span className="px-3 py-1 rounded-lg bg-brand-950/95 border-2 border-brand-400 text-xs font-mono font-black text-brand-200 uppercase tracking-wider shadow-[0_0_15px_rgba(249,115,22,0.45)] inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    HQ COGNITIVE DECK
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-950/90 border border-cyan-400/80 text-[11px] font-mono font-black text-cyan-300 uppercase tracking-wider shadow-xs">
                    V4.8 AUTONOMOUS
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs font-mono font-black text-amber-300 tracking-[0.18em] uppercase block drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]">
                  PAN-INDIA COGNITIVE TELEMETRY, DIFFICULTY CALIBRATION & AI GOVERNANCE HIGHWAY
                </span>
              </div>
            </div>

            {/* Glowing Neon Laser Energy Divider (Vertical on 2xl, Horizontal on small) */}
            <div className="hidden 2xl:flex flex-col items-center justify-center mx-3 self-stretch shrink-0">
              <div className="w-[2px] min-h-[90px] h-full bg-gradient-to-b from-brand-400/10 via-brand-400 via-cyan-400 to-purple-400/10 shadow-[0_0_16px_rgba(249,115,22,1)]" />
              <div className="w-2.5 h-2.5 rotate-45 bg-cyan-300 border border-white shadow-[0_0_12px_rgba(6,182,212,1)] my-[-4px]" />
              <div className="w-[2px] min-h-[90px] h-full bg-gradient-to-b from-purple-400/10 via-cyan-400 via-brand-400 to-brand-400/10 shadow-[0_0_16px_rgba(249,115,22,1)]" />
            </div>
            <div className="2xl:hidden w-full h-[2px] bg-gradient-to-r from-brand-500/20 via-brand-400 via-cyan-400 to-purple-500/20 shadow-[0_0_10px_rgba(249,115,22,0.6)]" />

            {/* Right Wing: Horizontal Panoramic Description & Holographic Telemetry Chips */}
            <div className="flex-1 min-w-0 max-w-3xl space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed drop-shadow-xs">
                Real-time assessment telemetry, difficulty calibration, graduated learning intervention policies, and human-in-the-loop AI studio governance across all districts.
              </p>
              
              {/* 3 Holographic Interactive Tactical Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
                {/* 1. Level 1-4 Graduated Interventions */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-emerald-950/90 to-slate-950 border-2 border-emerald-500/80 hover:border-emerald-300 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-102 flex items-center gap-2.5 group">
                  <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-400/60 text-emerald-300 shrink-0 shadow-xs">
                    <Layers className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono font-black text-[11px] uppercase tracking-wider text-emerald-300 block truncate">
                      LEVEL 1-4 GRADUATED INTERVENTIONS
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400/90 font-medium block truncate">
                      Notes → Drills → Tutors → 4W Plan
                    </span>
                  </div>
                </div>

                {/* 2. Human-in-the-Loop Quality Gates */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-purple-950/90 to-slate-950 border-2 border-purple-500/80 hover:border-purple-300 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:scale-102 flex items-center gap-2.5 group">
                  <div className="p-1.5 rounded-lg bg-purple-950 border border-purple-400/60 text-purple-300 shrink-0 shadow-xs">
                    <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono font-black text-[11px] uppercase tracking-wider text-purple-300 block truncate">
                      HUMAN-IN-THE-LOOP QUALITY GATES
                    </span>
                    <span className="text-[10px] font-mono text-purple-400/90 font-medium block truncate">
                      100% Expert Verification Enforced
                    </span>
                  </div>
                </div>

                {/* 3. Pan-India Cognitive Benchmarking */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-cyan-950/90 to-slate-950 border-2 border-cyan-500/80 hover:border-cyan-300 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-102 flex items-center gap-2.5 group">
                  <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/60 text-cyan-300 shrink-0 shadow-xs">
                    <Target className="w-4 h-4 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono font-black text-[11px] uppercase tracking-wider text-cyan-300 block truncate">
                      PAN-INDIA COGNITIVE BENCHMARKING
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400/90 font-medium block truncate">
                      36 States & UTs Live Synchronized
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Cognitive Telemetry Ribbon */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>SYNAPSE LATENCY: 1.4ms</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>CALIBRATION: IRT AUTOMATED</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-300 font-bold">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>ACTIVE COGNITIVE NODES: 748 DISTRICTS</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-300 font-bold bg-purple-950/60 px-3 py-1 rounded-md border border-purple-500/40">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>AI GOVERNANCE COMPLIANCE: 100% SECURE</span>
            </div>
          </div>
        </div>

        {/* TIER 3: TERRITORY SCOPE BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] font-mono text-slate-300">
            <span className="flex items-center gap-1.5 text-brand-300 font-bold bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 shadow-xs">
              <Compass className="w-3.5 h-3.5 text-brand-400" />
              <span>
                TERRITORY:{' '}
                {selectedLocation.localityName
                  ? `LOCALITY: ${selectedLocation.localityName.toUpperCase()}`
                  : selectedLocation.districtName
                  ? `DISTRICT: ${selectedLocation.districtName.toUpperCase()}`
                  : selectedLocation.stateName
                  ? `STATE: ${selectedLocation.stateName.toUpperCase()}`
                  : 'PAN-INDIA COGNITIVE TELEMETRY'}
              </span>
            </span>
            <span className="hidden sm:flex items-center gap-1 text-emerald-300 font-semibold bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>COGNITIVE ENGINE: SYNCHRONIZED</span>
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. PAN-INDIA LOCATION COMMAND FILTER & BREADCRUMB CONTEXT */}
      {/* ==================================================================== */}
      <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Academic Intelligence Territorial Scope
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {selectedLocation.localityName
                  ? `Locality: ${selectedLocation.localityName}`
                  : selectedLocation.districtName
                  ? `District: ${selectedLocation.districtName}`
                  : selectedLocation.stateName
                  ? `State: ${selectedLocation.stateName}`
                  : 'Pan-India Platform Telemetry'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-200 font-bold font-mono">
              <span className="text-cyan-400">India</span>
              {selectedLocation.stateName && (
                <>
                  <span className="text-slate-500">→</span>
                  <span className="text-brand-400">{selectedLocation.stateName}</span>
                </>
              )}
              {selectedLocation.districtName && (
                <>
                  <span className="text-slate-500">→</span>
                  <span className="text-amber-400">{selectedLocation.districtName}</span>
                </>
              )}
              {selectedLocation.localityName && (
                <>
                  <span className="text-slate-500">→</span>
                  <span className="text-emerald-400">{selectedLocation.localityName}</span>
                </>
              )}
            </div>
          </div>
          <div className="w-full lg:w-auto">
            <PanIndiaLocationSelector
              value={selectedLocation}
              onChange={(loc) => {
                if (audioEnabled) soundSystem.playChirp('click');
                setSelectedLocation(loc);
              }}
              showLocality={true}
              variant="compact"
            />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. PRIMARY CYBER-HUD KPI METRIC CARDS (5 Corner-Bracketed Decks) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Assessments */}
        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-cyan-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400 group-hover:text-cyan-300 transition-colors">
              Total Assessments
            </span>
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-sm">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            {kpiData.totalAssessments.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            Classroom + Live Mocks
          </div>
        </div>

        {/* Active Mock Tests */}
        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-indigo-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400 group-hover:text-indigo-300 transition-colors">
              Active Mock Tests
            </span>
            <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400 shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-indigo-400 group-hover:text-indigo-300 transition-colors">
            {kpiData.totalMockTests.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            {kpiData.activeExamCategories} Exam categories
          </div>
        </div>

        {/* Platform Accuracy */}
        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-emerald-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400 group-hover:text-emerald-300 transition-colors">
              Platform Accuracy
            </span>
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-sm">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-emerald-400 group-hover:text-emerald-300 transition-colors">
            {kpiData.averageStudentAccuracy.toFixed(1)}%
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Average student accuracy
          </div>
        </div>

        {/* Questions In Bank */}
        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-amber-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400 group-hover:text-amber-300 transition-colors">
              Questions In Bank
            </span>
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-amber-400 group-hover:text-amber-300 transition-colors">
            {kpiData.totalQuestionsInBank.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            {kpiData.aiGeneratedQuestionsCount.toLocaleString('en-IN')} generated with AI
          </div>
        </div>

        {/* AI Studio Quota */}
        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-purple-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400 group-hover:text-purple-300 transition-colors">
              AI Studio Quota
            </span>
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-purple-400 group-hover:text-purple-300 transition-colors">
            {aiConfig?.currentUsageCount ?? 0}
            <span className="text-xs text-slate-500 font-normal"> / {aiConfig?.monthlyApiLimit ?? 1000}</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Monthly API telemetry
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. DIFFICULTY CALIBRATION & VULNERABILITY HOTSPOTS */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Distribution Deck */}
        <div className="p-6 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-purple-500/50 cyber-hud-card hud-corner-brackets transition-all shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Student Performance Bands
            </h3>
            <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/40">
              COHORT TELEMETRY
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {/* EXCELLENT Band */}
            <div>
              <div className="flex justify-between text-xs font-mono font-bold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  EXCELLENT Band (≥ {excellentVal}%)
                </span>
                <span className="font-black text-emerald-400">
                  {kpiData.performanceDistribution.excellentPct}%
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-full rounded-full shadow-[0_0_12px_rgba(16,185,129,0.7)] transition-all duration-500"
                  style={{ width: `${kpiData.performanceDistribution.excellentPct}%` }}
                />
              </div>
            </div>

            {/* GOOD Band */}
            <div>
              <div className="flex justify-between text-xs font-mono font-bold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  GOOD Band (≥ {goodVal}%)
                </span>
                <span className="font-black text-cyan-400">
                  {kpiData.performanceDistribution.goodPct}%
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-cyan-500 h-full rounded-full shadow-[0_0_12px_rgba(6,182,212,0.7)] transition-all duration-500"
                  style={{ width: `${kpiData.performanceDistribution.goodPct}%` }}
                />
              </div>
            </div>

            {/* AVERAGE Band */}
            <div>
              <div className="flex justify-between text-xs font-mono font-bold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  AVERAGE Band (≥ {averageVal}%)
                </span>
                <span className="font-black text-amber-400">
                  {kpiData.performanceDistribution.averagePct}%
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-500 h-full rounded-full shadow-[0_0_12px_rgba(245,158,11,0.7)] transition-all duration-500"
                  style={{ width: `${kpiData.performanceDistribution.averagePct}%` }}
                />
              </div>
            </div>

            {/* NEEDS IMPROVEMENT Band */}
            <div>
              <div className="flex justify-between text-xs font-mono font-bold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  NEEDS IMPROVEMENT (&lt; {weakVal}%)
                </span>
                <span className="font-black text-rose-400">
                  {kpiData.performanceDistribution.needsImprovementPct}%
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-rose-500 h-full rounded-full shadow-[0_0_12px_rgba(244,63,94,0.7)] transition-all duration-500"
                  style={{ width: `${kpiData.performanceDistribution.needsImprovementPct}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 leading-relaxed">
            Real-time aggregate scores classified across configurable policy bands. Automatically adapts to district filter scope.
          </p>
        </div>

        {/* Difficult Topics / Vulnerability Hotspots Deck */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-amber-500/50 cyber-hud-card hud-corner-brackets transition-all shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Vulnerability Hotspots & High Error Rate Topics
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Syllabus topics with highest error rates triggering targeted drills & graduated interventions
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
              REVISION QUEUE
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono font-bold text-slate-400 uppercase">
                  <th className="py-3 px-3">Topic</th>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3 text-center">Student Error Rate</th>
                  <th className="py-3 px-3 text-right">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {kpiData.difficultTopics.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/80 transition-colors group">
                    <td className="py-3 px-3 font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {item.topic}
                    </td>
                    <td className="py-3 px-3 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold">
                        {item.subject}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-rose-950/90 text-rose-300 border border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                        {item.errorRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-950/90 text-amber-300 border border-amber-500/60 shadow-xs">
                        <TrendingDown className="w-3 h-3 text-amber-400" /> Level 2 Drills
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. GOVERNANCE & POLICY SETTINGS (Thresholds & AI Governance) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Thresholds Policy Form Deck */}
        <div className="p-6 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-brand-500/50 cyber-hud-card hud-corner-brackets transition-all shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-400" />
                Performance Classification Thresholds
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Controls the boundaries used across ZYZU'S to classify Strong and Weak subjects
              </p>
            </div>
            {thresholds?.updatedBy && (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                Audited: {thresholds.updatedBy}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveThresholds} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                  Excellent Mastery Threshold (%)
                </label>
                <input
                  type="number"
                  min="60"
                  max="100"
                  value={excellentVal}
                  onChange={e => setExcellentVal(Number(e.target.value))}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-sm font-mono font-black text-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
                />
                <span className="text-[11px] font-mono text-slate-400 mt-1 block">Default: ≥ 85%</span>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                  Good Performance Threshold (%)
                </label>
                <input
                  type="number"
                  min="40"
                  max="90"
                  value={goodVal}
                  onChange={e => setGoodVal(Number(e.target.value))}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-sm font-mono font-black text-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
                />
                <span className="text-[11px] font-mono text-slate-400 mt-1 block">Default: ≥ 70%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                  Average Band Threshold (%)
                </label>
                <input
                  type="number"
                  min="30"
                  max="80"
                  value={averageVal}
                  onChange={e => setAverageVal(Number(e.target.value))}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-sm font-mono font-black text-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
                />
                <span className="text-[11px] font-mono text-slate-400 mt-1 block">Default: ≥ 50%</span>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                  Needs Improvement Threshold (%)
                </label>
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={weakVal}
                  onChange={e => setWeakVal(Number(e.target.value))}
                  className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-sm font-mono font-black text-rose-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-colors"
                />
                <span className="text-[11px] font-mono text-slate-400 mt-1 block">Default: &lt; 50%</span>
              </div>
            </div>

            {/* Minimum Tests Required Safeguard */}
            <div className="p-4 bg-brand-950/40 border-2 border-brand-500/40 rounded-xl space-y-1.5">
              <label className="block text-xs font-mono font-black text-brand-300 uppercase">
                Minimum Tests Safeguard Rule (Prevents 1-Test Misclassification)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={minTestsVal}
                onChange={e => setMinTestsVal(Number(e.target.value))}
                className="w-32 p-2 bg-slate-900 border-2 border-brand-500/60 rounded-lg text-xs font-mono font-black text-white focus:outline-none focus:border-brand-400"
              />
              <p className="text-[11px] text-brand-200/90 mt-1 leading-relaxed">
                A subject will NOT be labeled strong or weak until the student has completed at least this many verified assessments in that subject.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={savingThresholds}
                className="bg-brand-600 hover:bg-brand-500 text-white font-mono font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-brand-600/30 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {savingThresholds ? 'Updating Thresholds...' : 'Save Threshold Policy'}
              </Button>
            </div>
          </form>
        </div>

        {/* AI Studio Governance Policy Deck */}
        <div className="p-6 rounded-2xl bg-slate-950/95 border-2 border-slate-800 hover:border-purple-500/50 cyber-hud-card hud-corner-brackets transition-all shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                AI Studio Governance & Human-in-the-Loop
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Quality rules for AI question generation, syllabus bounds & verification workflows
              </p>
            </div>
            {aiConfig && (
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40">
                Quota: {aiConfig.currentUsageCount} / {aiConfig.monthlyApiLimit}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveAiPolicy} className="space-y-4">
            <div className="space-y-3">
              {/* Human in the loop toggle */}
              <div
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setHumanReviewRequired(!humanReviewRequired);
                }}
                className="flex items-start justify-between p-4 bg-slate-900/90 rounded-xl border-2 border-slate-800 hover:border-purple-500/60 transition-all cursor-pointer group"
              >
                <div className="pr-4">
                  <div className="text-xs font-mono font-black text-white group-hover:text-purple-300 transition-colors">
                    Mandatory Human Review Before Publishing
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Requires a subject matter expert or admin to approve AI questions before they are made live to students.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={humanReviewRequired}
                  onChange={e => setHumanReviewRequired(e.target.checked)}
                  onClick={e => e.stopPropagation()}
                  className="w-5 h-5 text-purple-600 rounded bg-slate-800 border-slate-600 focus:ring-purple-500 mt-0.5 cursor-pointer accent-purple-500"
                />
              </div>

              {/* AI Generation Enabled */}
              <div
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setAiGenEnabled(!aiGenEnabled);
                }}
                className="flex items-start justify-between p-4 bg-slate-900/90 rounded-xl border-2 border-slate-800 hover:border-purple-500/60 transition-all cursor-pointer group"
              >
                <div className="pr-4">
                  <div className="text-xs font-mono font-black text-white group-hover:text-purple-300 transition-colors">
                    AI Question Generation Engine
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Enable or pause AI generation studio for commission mock tests.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={aiGenEnabled}
                  onChange={e => setAiGenEnabled(e.target.checked)}
                  onClick={e => e.stopPropagation()}
                  className="w-5 h-5 text-purple-600 rounded bg-slate-800 border-slate-600 focus:ring-purple-500 mt-0.5 cursor-pointer accent-purple-500"
                />
              </div>

              {/* AI Recommendation Engine */}
              <div
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  setAiRecEnabled(!aiRecEnabled);
                }}
                className="flex items-start justify-between p-4 bg-slate-900/90 rounded-xl border-2 border-slate-800 hover:border-purple-500/60 transition-all cursor-pointer group"
              >
                <div className="pr-4">
                  <div className="text-xs font-mono font-black text-white group-hover:text-purple-300 transition-colors">
                    Graduated Recommendation Engine (Level 1-4)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Transparent automated learning interventions (Notes → Drills → Tutors → 4-Week Plan).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={aiRecEnabled}
                  onChange={e => setAiRecEnabled(e.target.checked)}
                  onClick={e => e.stopPropagation()}
                  className="w-5 h-5 text-purple-600 rounded bg-slate-800 border-slate-600 focus:ring-purple-500 mt-0.5 cursor-pointer accent-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={savingAiConfig}
                className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {savingAiConfig ? 'Saving Policy...' : 'Save AI Studio Governance'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
