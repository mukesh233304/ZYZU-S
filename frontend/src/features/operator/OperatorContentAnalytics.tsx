// FOCUSPOINT Futuristic Pan-India Operator Content Analytics & Academic Reach Studio
// Cyber-HUD Mission Control for Non-Financial Academic Intelligence, Real-Time Student Telemetry,
// 24-Hour Hourly Scrubber, Geographic State Heatmap, Predictive What-If Forecaster, and Stumble Radar.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  BookOpen, 
  Landmark, 
  HelpCircle, 
  Download, 
  Eye, 
  CheckCircle2, 
  Sparkles, 
  Award,
  Activity,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  Calendar,
  Share2,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  ChevronDown,
  Layers,
  MapPin,
  Star,
  Zap,
  Sliders,
  BarChart3,
  ThumbsUp,
  ExternalLink,
  Copy,
  Check,
  X,
  AlertCircle,
  FileText,
  Users,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Compass,
  ArrowUpRight,
  Target,
  Percent,
  BrainCircuit,
  MessageSquare,
  Flame,
  Globe2
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  operatorAnalyticsService, 
  ComprehensiveOperatorAnalytics, 
  AnalyticsTimeHorizon, 
  AnalyticsVertical,
  LiveStudentActivityEvent,
  GeographicReachHub,
  StateReachAggregate,
  StumbleTopicAnalysis,
  PredictiveReachParams,
  PredictiveReachResult,
  SubjectImpactMetric,
  StudentReviewItem,
  AssetDeepDiveTelemetry,
  HourlyConsumptionData
} from '../../services/operatorAnalyticsService';

// Procedural Cyber Web Audio Synthesizer
const playCyberAudio = (type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'scan' | 'tick', enabled: boolean = true) => {
  if (!enabled) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'click':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(940, now);
        osc.frequency.exponentialRampToValueAtTime(1450, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'tick':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
        break;
      case 'warp':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(1280, now + 0.15);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      case 'confirm':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(560, now);
        osc.frequency.setValueAtTime(880, now + 0.05);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      case 'toggle':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(740, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      case 'alert':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(360, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case 'scan':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
    }
  } catch {
    // Audio context may be restricted before gesture
  }
};

export const OperatorContentAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const operatorId = user?.id || 'usr-operator-sunita';

  // HUD Audio Control & Zen Mode
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Filters & State
  const [timeHorizon, setTimeHorizon] = useState<AnalyticsTimeHorizon>('30D');
  const [vertical, setVertical] = useState<AnalyticsVertical>('ALL');
  const [selectedStateCode, setSelectedStateCode] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'FAST_MOVERS' | 'RURAL_REACH' | 'REMEDIAL_STUMBLES'>('ALL');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MATERIALS' | 'MOCKS' | 'GEOGRAPHY' | 'STUMBLE_RADAR' | 'REVIEWS'>('OVERVIEW');

  // Core Data State
  const [analyticsData, setAnalyticsData] = useState<ComprehensiveOperatorAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // 24-Hour Interactive Time-Travel Scrubber
  const [scrubberHour, setScrubberHour] = useState<number>(20); // Default 20:00 (Peak Test Hour)
  const [isPlayingHourLoop, setIsPlayingHourLoop] = useState<boolean>(false);
  const hourLoopTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Predictive What-If Forecaster State
  const [isForecastModalOpen, setIsForecastModalOpen] = useState<boolean>(false);
  const [forecastParams, setForecastParams] = useState<PredictiveReachParams>({
    newMaterialsCount: 3,
    newMockTestsCount: 2,
    hindiCoveragePct: 85
  });

  // Export Dossier Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'JSON' | 'CSV'>('JSON');
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);

  // Deep Dive Telemetry Modal
  const [inspectModalAsset, setInspectModalAsset] = useState<AssetDeepDiveTelemetry | null>(null);

  // Live burst pulse counter
  const [liveBurstCount, setLiveBurstCount] = useState<number>(0);

  // Fetch Analytics
  const loadAnalytics = async (isSilent: boolean = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await operatorAnalyticsService.getComprehensiveAnalytics(operatorId, timeHorizon, vertical);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to load comprehensive operator analytics', err);
      addToast('Unable to synchronize academic reach telemetry', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [operatorId, timeHorizon, vertical]);

  // Handle Hour Loop Time-Travel animation
  useEffect(() => {
    if (isPlayingHourLoop) {
      hourLoopTimerRef.current = setInterval(() => {
        setScrubberHour((prev) => {
          const next = (prev + 1) % 24;
          if (next % 4 === 0) playCyberAudio('tick', audioEnabled);
          return next;
        });
      }, 700);
    } else {
      if (hourLoopTimerRef.current) clearInterval(hourLoopTimerRef.current);
    }

    return () => {
      if (hourLoopTimerRef.current) clearInterval(hourLoopTimerRef.current);
    };
  }, [isPlayingHourLoop, audioEnabled]);

  // Current Scrubber Telemetry
  const activeHourTelemetry: HourlyConsumptionData = useMemo(() => {
    if (!analyticsData) {
      return {
        hourLabel: `${String(scrubberHour).padStart(2, '0')}:00`,
        hourNumber: scrubberHour,
        views: 120,
        downloads: 45,
        mockAttempts: 32,
        isPeakStudyWindow: scrubberHour >= 18 && scrubberHour <= 22,
        studyBehaviorTag: 'Prime CBT Mock Drill Hour',
        activeConcurrentLearners: 940
      };
    }
    return operatorAnalyticsService.getHourlyTelemetryAtHour(scrubberHour, analyticsData);
  }, [analyticsData, scrubberHour]);

  // Predictive Forecast Result
  const forecastResult: PredictiveReachResult | null = useMemo(() => {
    if (!analyticsData) return null;
    return operatorAnalyticsService.calculatePredictiveReach(forecastParams, analyticsData);
  }, [analyticsData, forecastParams]);

  // Simulate Live Student Pulse
  const handleSimulateBurst = () => {
    playCyberAudio('warp', audioEnabled);
    const event = operatorAnalyticsService.simulateLiveStudentEvent(
      vertical === 'ALL' ? 'SSC CGL' : vertical.replace('_', ' ')
    );
    setLiveBurstCount(prev => prev + 1);
    addToast(`Live student action detected: ${event.studentNameMasked} from ${event.location} (${event.actionType})`, 'info');
    loadAnalytics(true);
  };

  // Export handling
  const handleOpenExport = () => {
    playCyberAudio('click', audioEnabled);
    setIsExportModalOpen(true);
  };

  const exportPayloadString = useMemo(() => {
    if (!analyticsData) return '';
    return operatorAnalyticsService.exportDossier(analyticsData, exportFormat);
  }, [analyticsData, exportFormat]);

  const handleCopyExport = () => {
    playCyberAudio('confirm', audioEnabled);
    navigator.clipboard.writeText(exportPayloadString);
    setCopiedPayload(true);
    addToast(`Analytics Dossier copied in ${exportFormat} format!`, 'success');
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleDownloadExport = () => {
    playCyberAudio('confirm', audioEnabled);
    const blob = new Blob([exportPayloadString], { 
      type: exportFormat === 'JSON' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zyzus_operator_reach_dossier_${Date.now()}.${exportFormat.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Downloaded ${exportFormat} Analytics Dossier`, 'success');
  };

  // Inspect item
  const handleInspectAsset = (id: string, title: string, type: 'STUDY_MATERIAL' | 'MOCK_TEST') => {
    playCyberAudio('scan', audioEnabled);
    const deepDive = operatorAnalyticsService.getAssetDeepDive(id, title, type);
    setInspectModalAsset(deepDive);
  };

  // 1-Click Bridge to AI Assistant for Stumble Topic Remedial
  const handleBridgeToAIAssistant = (topic: StumbleTopicAnalysis) => {
    playCyberAudio('confirm', audioEnabled);
    addToast(`Synthesizing Remedial Drill for ${topic.chapter}... Redirecting to AI Copilot`, 'info');
    navigate('/operator/ai-assistant');
  };

  // Filtered Geographic Hubs based on selected state
  const filteredHubs = useMemo(() => {
    if (!analyticsData) return [];
    if (selectedStateCode === 'ALL') return analyticsData.geographicHubs;
    const targetState = analyticsData.stateAggregates.find(s => s.code === selectedStateCode)?.state;
    if (!targetState) return analyticsData.geographicHubs;
    return analyticsData.geographicHubs.filter(h => h.state === targetState);
  }, [analyticsData, selectedStateCode]);

  // Filtered Materials with Quick Filter Presets
  const filteredMaterials = useMemo(() => {
    if (!analyticsData) return [];
    let list = analyticsData.topMaterialsList;

    if (quickFilter === 'FAST_MOVERS') {
      list = list.filter(m => (m.downloads / (m.views || 1)) >= 0.35);
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(m => 
      m.title.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.examCategory.toLowerCase().includes(q)
    );
  }, [analyticsData, searchQuery, quickFilter]);

  // Filtered Mocks
  const filteredMocks = useMemo(() => {
    if (!analyticsData) return [];
    let list = analyticsData.topMockTestsList;

    if (quickFilter === 'REMEDIAL_STUMBLES') {
      list = list.filter(m => m.avgScore < 70);
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(m => 
      m.title.toLowerCase().includes(q) ||
      m.examName.toLowerCase().includes(q)
    );
  }, [analyticsData, searchQuery, quickFilter]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    if (!analyticsData) return [];
    if (!searchQuery.trim()) return analyticsData.studentReviews;
    const q = searchQuery.toLowerCase();
    return analyticsData.studentReviews.filter(r => 
      r.studentName.toLowerCase().includes(q) ||
      r.assetTitle.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q) ||
      r.districtState.toLowerCase().includes(q)
    );
  }, [analyticsData, searchQuery]);

  // Peak hourly view value for relative bar heights
  const maxHourlyViews = useMemo(() => {
    if (!analyticsData || !analyticsData.hourlyCurve.length) return 100;
    return Math.max(...analyticsData.hourlyCurve.map(h => h.views), 10);
  }, [analyticsData]);

  return (
    <div className={`bg-slate-950 text-slate-100 min-h-screen space-y-6 font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200 transition-all ${
      isZenMode ? 'p-2 md:p-4 max-w-full' : 'p-4 md:p-6 lg:p-8 max-w-7xl mx-auto'
    }`}>
      
      {/* 1. THREE-TIER CYBER COCKPIT HEADER */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-slate-900/85 p-5 md:p-6 backdrop-blur-xl shadow-[0_0_35px_rgba(6,182,212,0.12)]">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-85" />

        {/* Tier 1: Eyebrows & Real-Time Status Beacons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
            </span>
            <span className="font-mono text-cyan-400 tracking-wider uppercase font-bold text-[11px] sm:text-xs">
              ZYZU'S Operator Network • Content Reach & Impact Radar
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="font-mono text-slate-400 hidden sm:inline">Non-Financial Academic Intelligence Enclave</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">NOC TELEMETRY</span> ACTIVE
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px]">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              PAN-INDIA SYNCED
            </div>

            {/* Zen Full-Screen Toggle */}
            <button
              onClick={() => {
                setIsZenMode(!isZenMode);
                playCyberAudio('toggle', audioEnabled);
              }}
              title="Toggle Panoramic Cockpit View"
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-all text-xs"
            >
              {isZenMode ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                const nextState = !audioEnabled;
                setAudioEnabled(nextState);
                playCyberAudio('toggle', nextState);
              }}
              title="Toggle Procedural Cyber Audio Synthesizer"
              className={`p-1.5 rounded-lg border transition-all text-xs flex items-center gap-1 font-mono ${
                audioEnabled 
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{audioEnabled ? 'HUD AUDIO ON' : 'AUDIO MUTED'}</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Title & Primary Action Controls */}
        <div className="pt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-cyan-500/25">
                <TrendingUp className="w-6 h-6" />
              </span>
              <span>Content Analytics & Student Reach Radar</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-3xl">
              Real-time student consumption telemetry across 28 states & 720+ examination districts, 24-hour diurnal study cadence, offline notes download velocity, and predictive reach simulation.
            </p>
          </div>

          {/* Quick HUD Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSimulateBurst}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/30 transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 animate-bounce" />
              Simulate Live Student Pulse
            </button>

            <button
              onClick={() => {
                playCyberAudio('warp', audioEnabled);
                setIsForecastModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 border border-purple-400/30 transition-all active:scale-95"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              What-If AI Forecaster
            </button>

            <button
              onClick={handleOpenExport}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              Export Dossier
            </button>

            <button
              onClick={() => {
                playCyberAudio('click', audioEnabled);
                loadAnalytics(true);
              }}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Tier 3: Horizontal Filters & Navigation Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Time Horizon Pills */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            {(['24H', '7D', '30D', '90D', 'ALL'] as AnalyticsTimeHorizon[]).map(t => (
              <button
                key={t}
                onClick={() => {
                  setTimeHorizon(t);
                  playCyberAudio('click', audioEnabled);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-all ${
                  timeHorizon === t
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {t === '24H' ? '⚡ LIVE 24H' : t === 'ALL' ? 'ALL TIME' : t}
              </button>
            ))}
          </div>

          {/* Exam Vertical Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3 text-cyan-400" />
              Vertical:
            </span>
            <select
              value={vertical}
              onChange={(e) => {
                setVertical(e.target.value as AnalyticsVertical);
                playCyberAudio('toggle', audioEnabled);
              }}
              className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
            >
              <option value="ALL">All Exam Verticals</option>
              <option value="SSC_CGL_CHSL">SSC (CGL, CHSL, MTS, CPO)</option>
              <option value="RAILWAYS_RRB">Railways (NTPC, Group D, ALP)</option>
              <option value="UP_STATE_EXAMS">UP State (Police, PET, VDO, Lekhpal)</option>
              <option value="TEACHING_CTET">Teaching (CTET, UPTET, Super TET)</option>
              <option value="DEFENCE_NDA_CDS">Defence (NDA, CDS, AFCAT)</option>
              <option value="CHS_ENTRANCE">School Entrance (CHS BHU, JNVST)</option>
            </select>
          </div>

          {/* Preset Quick Filters */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => {
                setQuickFilter(quickFilter === 'FAST_MOVERS' ? 'ALL' : 'FAST_MOVERS');
                playCyberAudio('click', audioEnabled);
              }}
              className={`px-2 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                quickFilter === 'FAST_MOVERS'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Fast Movers</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('STUMBLE_RADAR');
                playCyberAudio('click', audioEnabled);
              }}
              className={`px-2 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                activeTab === 'STUMBLE_RADAR'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-3 h-3 text-rose-400" />
              <span>Stumble Radar</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[180px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets, hubs..."
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 2. PANORAMIC 6-METRIC HIGH-PRECISION TELEMETRY RIBBON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* KPI 1: Student Views */}
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-slate-900/60 p-4 backdrop-blur-md hover:border-cyan-500/40 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase tracking-wider text-cyan-400 font-semibold">Total Views</span>
            <Eye className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white tracking-tight">
              {loading ? '...' : analyticsData?.kpis.totalViews.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              +{analyticsData?.kpis.viewsGrowthPct}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <span>Verified Student Reads</span>
          </p>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-[78%] animate-pulse" />
          </div>
        </div>

        {/* KPI 2: PDF Downloads */}
        <div className="relative overflow-hidden rounded-xl border border-indigo-500/20 bg-slate-900/60 p-4 backdrop-blur-md hover:border-indigo-500/40 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase tracking-wider text-indigo-400 font-semibold">Offline Saves</span>
            <Download className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white tracking-tight">
              {loading ? '...' : analyticsData?.kpis.totalDownloads.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              +{analyticsData?.kpis.downloadsGrowthPct}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <span>PDF Notes Saved</span>
          </p>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[64%]" />
          </div>
        </div>

        {/* KPI 3: CBT Mock Attempts */}
        <div className="relative overflow-hidden rounded-xl border border-purple-500/20 bg-slate-900/60 p-4 backdrop-blur-md hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase tracking-wider text-purple-400 font-semibold">Mock Submissions</span>
            <Activity className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white tracking-tight">
              {loading ? '...' : analyticsData?.kpis.mockAttempts.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              +{analyticsData?.kpis.attemptsGrowthPct}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <span>Completed Test Runs</span>
          </p>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-[82%]" />
          </div>
        </div>

        {/* KPI 4: Average Dwell Time */}
        <div className="relative overflow-hidden rounded-xl border border-teal-500/20 bg-slate-900/60 p-4 backdrop-blur-md hover:border-teal-500/40 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase tracking-wider text-teal-400 font-semibold">Avg Dwell Time</span>
            <Clock className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white tracking-tight">
              {loading ? '...' : analyticsData?.kpis.avgDwellTimeFormatted}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <span>Deep Retention Cadence</span>
          </p>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 w-[72%]" />
          </div>
        </div>

        {/* KPI 5: Pedagogical Quality Score */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-slate-900/60 p-4 backdrop-blur-md hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase tracking-wider text-emerald-400 font-semibold">Quality Index</span>
            <Award className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white tracking-tight">
              {loading ? '...' : `${analyticsData?.kpis.pedagogicalQualityScore}/100`}
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 rounded">
              TOP TIER
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <span>Zero Ambiguity Distractors</span>
          </p>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 w-[97%]" />
          </div>
        </div>

        {/* KPI 6: Active Pan-India Hubs */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-slate-900/60 p-4 backdrop-blur-md hover:border-amber-500/40 transition-all group">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase tracking-wider text-amber-400 font-semibold">Pan-India Reach</span>
            <MapPin className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white tracking-tight">
              {loading ? '...' : `${analyticsData?.kpis.activePanIndiaReachCount} States`}
            </span>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-1.5 rounded">
              720+ Dists
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <span>{analyticsData?.kpis.totalVerifiedLearners.toLocaleString()} Active Examinees</span>
          </p>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 w-[88%]" />
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION TAB BAR */}
      <div className="flex border-b border-slate-800 text-sm overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => { setActiveTab('OVERVIEW'); playCyberAudio('click', audioEnabled); }}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'OVERVIEW'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Overview & 24H Diurnal Cadence</span>
        </button>

        <button
          onClick={() => { setActiveTab('MATERIALS'); playCyberAudio('click', audioEnabled); }}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'MATERIALS'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Study Material Vault Reach</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {filteredMaterials.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('MOCKS'); playCyberAudio('click', audioEnabled); }}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'MOCKS'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Mock Test & CBT Engagement</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {filteredMocks.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('GEOGRAPHY'); playCyberAudio('click', audioEnabled); }}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'GEOGRAPHY'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Pan-India State Heatmap</span>
        </button>

        <button
          onClick={() => { setActiveTab('STUMBLE_RADAR'); playCyberAudio('click', audioEnabled); }}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'STUMBLE_RADAR'
              ? 'border-rose-400 text-rose-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target className="w-4 h-4 text-rose-400" />
          <span>Cognitive Stumble Radar</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-mono">
            5 TOPICS
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('REVIEWS'); playCyberAudio('click', audioEnabled); }}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'REVIEWS'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400" />
          <span>Student Feedback</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
            4.9 ★
          </span>
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      {loading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-mono text-slate-400">Querying Pan-India Operator Telemetry Stream...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW & 24H CADENCE */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              
              {/* Interactive 24H Time-Travel Scrubber HUD */}
              <div className="rounded-2xl border border-cyan-500/25 bg-slate-900/80 p-5 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      24-Hour Diurnal Study Scrubber & Live Telemetry Time-Travel
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Drag the time slider or hit auto-play to inspect active student examinee volume and study behavior across India at any exact hour.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsPlayingHourLoop(!isPlayingHourLoop);
                        playCyberAudio('click', audioEnabled);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
                        isPlayingHourLoop 
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                          : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30'
                      }`}
                    >
                      {isPlayingHourLoop ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlayingHourLoop ? 'PAUSE CYCLE' : 'AUTO-PLAY CYCLE'}</span>
                    </button>
                    <span className="text-sm font-mono font-black text-cyan-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                      {String(scrubberHour).padStart(2, '0')}:00 IST
                    </span>
                  </div>
                </div>

                {/* Scrubber Controls */}
                <div className="pt-4 space-y-4">
                  {/* Slider bar */}
                  <div className="relative">
                    <input
                      type="range"
                      min={0}
                      max={23}
                      value={scrubberHour}
                      onChange={(e) => {
                        setScrubberHour(Number(e.target.value));
                        playCyberAudio('tick', audioEnabled);
                      }}
                      className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none focus:outline-none"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                      <span>00:00 (Night)</span>
                      <span>06:00 (Morning Rush)</span>
                      <span>12:00 (Noon)</span>
                      <span>18:00 (Shift 1 Mocks)</span>
                      <span>21:00 (Super Peak)</span>
                      <span>23:00 (Review)</span>
                    </div>
                  </div>

                  {/* Scrubber Telemetry Card Readout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/90 font-mono text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Active Examinees at {activeHourTelemetry.hourLabel}</span>
                      <p className="text-lg font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
                        <Users className="w-4 h-4 text-emerald-400" />
                        {activeHourTelemetry.activeConcurrentLearners?.toLocaleString()} Online
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Hourly Views & Downloads</span>
                      <p className="text-lg font-black text-white mt-0.5">
                        <span className="text-cyan-400">{activeHourTelemetry.views.toLocaleString()}</span> views • <span className="text-indigo-400">{activeHourTelemetry.downloads.toLocaleString()}</span> DLs
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Mock Test Submissions</span>
                      <p className="text-lg font-black text-purple-300 mt-0.5">
                        {activeHourTelemetry.mockAttempts.toLocaleString()} Submissions/hr
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Dominant Study Mode</span>
                      <p className="text-xs font-bold text-amber-300 mt-1 truncate">
                        {activeHourTelemetry.studyBehaviorTag}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Histogram Visual Bar Rail */}
                <div className="mt-5 pt-3 border-t border-slate-800">
                  <div className="flex items-end justify-between gap-1 h-32 px-1">
                    {analyticsData?.hourlyCurve.map((h) => {
                      const heightPct = Math.max(10, Math.round((h.views / maxHourlyViews) * 100));
                      const isSelected = h.hourNumber === scrubberHour;
                      return (
                        <div 
                          key={h.hourNumber}
                          onClick={() => {
                            setScrubberHour(h.hourNumber);
                            playCyberAudio('click', audioEnabled);
                          }}
                          className="flex-1 flex flex-col items-center group relative cursor-pointer"
                        >
                          {/* Indicator top marker */}
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 mb-1 animate-bounce shadow-md shadow-cyan-400/50" />
                          )}

                          {/* Bar */}
                          <div 
                            className={`w-full rounded-t-sm transition-all ${
                              isSelected 
                                ? 'bg-gradient-to-t from-cyan-500 via-indigo-500 to-white shadow-[0_0_15px_rgba(6,182,212,0.6)]' 
                                : h.isPeakStudyWindow
                                  ? 'bg-gradient-to-t from-emerald-600 to-teal-400 opacity-90'
                                  : 'bg-slate-800 hover:bg-slate-700'
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Conversion Funnel + Peer Benchmarking Gauge */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Academic Conversion & Engagement Funnel (7 cols) */}
                <div className="lg:col-span-7 rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      Academic Engagement & Conversion Funnel
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pan-India student progression from initial search impression to full CBT test submission.
                    </p>
                  </div>

                  <div className="space-y-3.5 my-4">
                    {/* Stage 1 */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-400">1. Discovery Impressions</span>
                        <span className="font-bold text-white">{analyticsData?.funnel.impressions.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 w-full" />
                      </div>
                    </div>

                    {/* Stage 2 */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-400">2. Content Deep Views</span>
                        <span className="font-bold text-cyan-300">
                          {analyticsData?.funnel.clicksToView.toLocaleString()} ({analyticsData?.funnel.viewConversionPct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${analyticsData?.funnel.viewConversionPct}%` }} />
                      </div>
                    </div>

                    {/* Stage 3 */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-400">3. Offline PDF Downloads</span>
                        <span className="font-bold text-indigo-300">
                          {analyticsData?.funnel.downloadsCount.toLocaleString()} ({analyticsData?.funnel.downloadConversionPct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${analyticsData?.funnel.downloadConversionPct}%` }} />
                      </div>
                    </div>

                    {/* Stage 4 */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-400">4. CBT Drill Completions</span>
                        <span className="font-bold text-emerald-300">
                          {analyticsData?.funnel.fullCompletionCount.toLocaleString()} ({analyticsData?.funnel.testCompletionPct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${analyticsData?.funnel.testCompletionPct}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 font-mono">
                    <p className="flex items-center justify-between">
                      <span>Repeat Study Index:</span>
                      <strong className="text-emerald-400">{analyticsData?.kpis.repeatStudyRatePct}%</strong>
                    </p>
                    <p className="flex items-center justify-between mt-1">
                      <span>Full Mock Completion:</span>
                      <strong className="text-cyan-400">{analyticsData?.funnel.testCompletionPct}%</strong>
                    </p>
                  </div>
                </div>

                {/* Comparative Benchmarking & Percentile Gauge (5 cols) */}
                <div className="lg:col-span-5 rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      Pan-India Operator Peer Benchmark
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      National ranking based on student retention and syllabus calibration.
                    </p>
                  </div>

                  {/* Circular Radial Gauge */}
                  <div className="my-4 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                      <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin duration-3000" />
                      <div className="text-center font-mono">
                        <span className="text-2xl font-black text-white">Top 1.2%</span>
                        <p className="text-[10px] text-cyan-400 uppercase font-semibold">National Rank</p>
                      </div>
                    </div>
                    <p className="text-xs text-center text-slate-300 mt-3 font-medium">
                      Exceeds national average retention by <strong className="text-emerald-400 font-mono">+38.4%</strong>
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400">Zero Ambiguity Distractors:</span>
                      <strong className="text-emerald-400">99.8% Calibrated</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400">TCS iON Standard Match:</span>
                      <strong className="text-cyan-400">100% Verified</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Live Student Activity Feed Stream */}
              <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Live Student Activity Stream Across India
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    REAL-TIME STREAM ({analyticsData?.liveActivityFeed.length} EVENTS)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analyticsData?.liveActivityFeed.slice(0, 6).map((evt) => (
                    <div 
                      key={evt.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                        {evt.avatarSeed}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-white truncate">
                            {evt.studentNameMasked}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {evt.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-cyan-400 flex items-center gap-1 font-mono">
                          <MapPin className="w-3 h-3 text-cyan-500" />
                          {evt.location}
                        </p>
                        <p className="text-xs text-slate-300 truncate mt-0.5 font-medium">
                          {evt.assetTitle}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-mono">
                          <span className={`px-1.5 py-0.2 rounded ${
                            evt.actionType === 'ATTEMPT_COMPLETE' ? 'bg-purple-500/20 text-purple-300' :
                            evt.actionType === 'DOWNLOAD' ? 'bg-indigo-500/20 text-indigo-300' :
                            evt.actionType === 'RATING_SUBMITTED' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            {evt.actionType.replace('_', ' ')}
                          </span>
                          {evt.metricValue && (
                            <span className="text-slate-400 font-semibold">{evt.metricValue}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDY MATERIAL VAULT REACH */}
          {activeTab === 'MATERIALS' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    Study Material Vault Consumption & Dwell Index
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any study material to inspect cohort telemetry, question stumble topics, and pedagogical feedback.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Showing {filteredMaterials.length} Authored Modules
                </span>
              </div>

              {/* Materials Table */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase bg-slate-950/60">
                        <th className="py-3 px-4 font-semibold">Material Title</th>
                        <th className="py-3 px-4 font-semibold">Subject & Vertical</th>
                        <th className="py-3 px-4 font-semibold text-right">Views</th>
                        <th className="py-3 px-4 font-semibold text-right">Downloads</th>
                        <th className="py-3 px-4 font-semibold text-right">Conversion</th>
                        <th className="py-3 px-4 font-semibold text-right">Rating</th>
                        <th className="py-3 px-4 font-semibold text-center">Status</th>
                        <th className="py-3 px-4 font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {filteredMaterials.map((m) => {
                        const convPct = m.views > 0 ? ((m.downloads / m.views) * 100).toFixed(1) : '0';
                        return (
                          <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-white max-w-[280px]">
                              <div className="truncate font-semibold">{m.title}</div>
                              <div className="text-[10px] font-mono text-slate-500 mt-0.5">ID: {m.id}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="text-slate-300">{m.subject}</div>
                              <div className="text-[10px] font-mono text-cyan-400">{m.examCategory}</div>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-300">
                              {m.views.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-indigo-300">
                              {m.downloads.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-semibold">
                              {convPct}%
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-amber-400 font-bold">
                              {m.rating} ★
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {m.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => handleInspectAsset(m.id, m.title, 'STUDY_MATERIAL')}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all inline-flex items-center gap-1 active:scale-95"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MOCK TEST & CBT ENGAGEMENT */}
          {activeTab === 'MOCKS' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-cyan-400" />
                    Government Exam Mock Test CBT Attempt Analytics
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live attempt scores, TCS iON normalization curves, and student completion metrics.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Showing {filteredMocks.length} Active Mock Tests
                </span>
              </div>

              {/* Mock Tests Table */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase bg-slate-950/60">
                        <th className="py-3 px-4 font-semibold">Mock Paper Title</th>
                        <th className="py-3 px-4 font-semibold">Exam Standard</th>
                        <th className="py-3 px-4 font-semibold text-right">Total Attempts</th>
                        <th className="py-3 px-4 font-semibold text-right">Avg Score</th>
                        <th className="py-3 px-4 font-semibold text-right">Pass Rate</th>
                        <th className="py-3 px-4 font-semibold text-center">Status</th>
                        <th className="py-3 px-4 font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {filteredMocks.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-white max-w-[280px]">
                            <div className="truncate font-semibold">{t.title}</div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">ID: {t.id}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-cyan-400 font-semibold">{t.examName}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-300">
                            {t.attempts.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">
                            {t.avgScore}%
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-cyan-300 font-semibold">
                            {t.passRatePct}%
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleInspectAsset(t.id, t.title, 'MOCK_TEST')}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-all inline-flex items-center gap-1 active:scale-95"
                            >
                              <Activity className="w-3 h-3" />
                              <span>Inspect CBT</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAN-INDIA GEOGRAPHIC HEATMAP & STATES */}
          {activeTab === 'GEOGRAPHY' && (
            <div className="space-y-6">
              {/* State Filter Chips */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-amber-400" />
                    Pan-India State Reach Radar (State-by-State Focus)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any state to isolate examination districts, examinee cohorts, and local exam preferences.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                  <button
                    onClick={() => {
                      setSelectedStateCode('ALL');
                      playCyberAudio('click', audioEnabled);
                    }}
                    className={`px-2.5 py-1 rounded-lg border transition-all ${
                      selectedStateCode === 'ALL'
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ALL INDIA (28 STATES)
                  </button>

                  {analyticsData?.stateAggregates.map(s => (
                    <button
                      key={s.code}
                      onClick={() => {
                        setSelectedStateCode(s.code);
                        playCyberAudio('click', audioEnabled);
                      }}
                      className={`px-2.5 py-1 rounded-lg border transition-all ${
                        selectedStateCode === s.code
                          ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.code} ({s.state})
                    </button>
                  ))}
                </div>
              </div>

              {/* State Density Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(selectedStateCode === 'ALL' 
                  ? analyticsData?.stateAggregates 
                  : analyticsData?.stateAggregates.filter(s => s.code === selectedStateCode)
                )?.map((s) => (
                  <div
                    key={s.code}
                    className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-4 backdrop-blur-md hover:border-cyan-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-orange-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                          {s.code}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{s.state}</h4>
                          <span className="text-[10px] font-mono text-cyan-400">{s.hubsCount} Key Exam Hubs</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        Rank #{s.densityRank}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-500 text-[10px]">Active Examinees</span>
                        <p className="font-bold text-white">{s.activeLearners.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px]">Material Views</span>
                        <p className="font-bold text-cyan-300">{s.viewsCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px]">Mock Attempts</span>
                        <p className="font-bold text-purple-300">{s.mockAttempts.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px]">Rural Penetration</span>
                        <p className="font-bold text-emerald-400">{s.ruralReachPct}%</p>
                      </div>
                    </div>

                    <div className="mt-2.5 text-[11px] text-slate-400 truncate">
                      Preferred: <strong className="text-slate-200">{s.topExamPreference}</strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Geographic Hubs Cards */}
              <div className="pt-2">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-3">
                  Key District Examination Hubs ({filteredHubs.length} Active Hubs)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredHubs.map((hub) => (
                    <div 
                      key={hub.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 hover:border-cyan-500/40 transition-all hover:shadow-lg hover:shadow-cyan-500/5 backdrop-blur-md"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">{hub.district}</h4>
                          <p className="text-xs font-mono text-cyan-400">{hub.state}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          hub.tier === 'TIER_1' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                          hub.tier === 'TIER_2' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {hub.tier.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        <div>
                          <span className="text-slate-500 text-[10px]">Active Learners</span>
                          <p className="font-bold text-white">{hub.activeLearners.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px]">Views Count</span>
                          <p className="font-bold text-cyan-300">{hub.viewsCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px]">Downloads</span>
                          <p className="font-bold text-indigo-300">{hub.downloadsCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px]">Mock Attempts</span>
                          <p className="font-bold text-purple-300">{hub.mockAttempts.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px] truncate">
                          Top: <strong className="text-slate-200">{hub.topSubject}</strong>
                        </span>
                        <span className="font-mono text-emerald-400 font-bold text-[11px]">
                          +{hub.growthRatePct}% MoM
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COGNITIVE STUMBLE RADAR */}
          {activeTab === 'STUMBLE_RADAR' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-rose-500/30 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-rose-400" />
                    Student Cognitive Stumble Radar & Remedial Authoring Bridge
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Identifies high-error question chapters across student test attempts. Click "Synthesize in AI Studio" to generate corrective drill sets in 1 click.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  5 DETECTED WEAKNESS RADARS
                </span>
              </div>

              {/* Stumble Topic Cards */}
              <div className="space-y-4">
                {analyticsData?.stumbleTopics.map((stumble, idx) => (
                  <div
                    key={stumble.id}
                    className="rounded-2xl border border-rose-500/20 bg-slate-900/70 p-5 backdrop-blur-md hover:border-rose-500/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          #{idx + 1} LOW ACCURACY ({stumble.accuracyPct}%)
                        </span>
                        <span className="text-xs font-mono text-cyan-400 font-semibold">
                          {stumble.subject}
                        </span>
                        <span className="text-slate-600">|</span>
                        <span className="text-xs text-slate-400 font-mono">
                          Target: {stumble.examTarget}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">
                        {stumble.chapter}
                      </h4>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                        <span>Affected Examinees: <strong className="text-white">{stumble.affectedStudentsCount.toLocaleString()}</strong></span>
                        <span>Avg Pace: <strong className="text-amber-300">{stumble.avgTimeSeconds}s / question</strong></span>
                        <span>Distractor Confusion: <strong className="text-rose-400">{stumble.distractorConfusionRatio}% picked wrong option</strong></span>
                      </div>

                      <p className="text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 italic">
                        💡 <strong>Pedagogical Insight:</strong> {stumble.recommendedAction}
                      </p>
                    </div>

                    {/* 1-Click Bridge Action */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleBridgeToAIAssistant(stumble)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-lg shadow-rose-500/20 border border-rose-400/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Synthesize in AI Studio</span>
                      </button>
                      <button
                        onClick={() => {
                          playCyberAudio('click', audioEnabled);
                          navigator.clipboard.writeText(stumble.suggestedPrompt);
                          addToast('Remedial prompt copied to clipboard!', 'success');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white border border-slate-800 bg-slate-950 flex items-center justify-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Prompt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: STUDENT FEEDBACK & PEDAGOGICAL RATINGS */}
          {activeTab === 'REVIEWS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    Student Pedagogical Feedback & Solution Clarity Ratings
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Authentic feedback from verified student examinees across test centers and self-study libraries.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verified Examinees
                  </span>
                </div>
              </div>

              {/* Reviews Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReviews.map((rev) => (
                  <div 
                    key={rev.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-md hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{rev.studentName}</h4>
                          {rev.verifiedStudent && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              VERIFIED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {rev.districtState} • Target: <span className="text-cyan-300">{rev.targetExam}</span>
                        </p>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center text-amber-400 text-xs">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed italic">
                      "{rev.comment}"
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-[10px] text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                        {rev.accuracyTag.replace('_', ' ')}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <ThumbsUp className="w-3 h-3 text-slate-500" />
                        {rev.helpfulCount} students found this helpful
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 5. MODAL: WHAT-IF PREDICTIVE REACH FORECASTER */}
      {isForecastModalOpen && forecastResult && (
        <Modal
          isOpen={isForecastModalOpen}
          onClose={() => setIsForecastModalOpen(false)}
          title="What-If AI Reach & Growth Forecaster"
          size="lg"
        >
          <div className="space-y-4 text-xs font-sans text-slate-200">
            <p className="text-slate-400 text-xs">
              Simulate incremental pan-India student reach by adjusting your authored content roadmap and bilingual translation quotas.
            </p>

            {/* Interactive Sliders */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
              {/* Slider 1: New Materials */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>New Study Materials to Publish:</span>
                  <strong className="text-cyan-400">{forecastParams.newMaterialsCount} Modules</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={forecastParams.newMaterialsCount}
                  onChange={(e) => setForecastParams({ ...forecastParams, newMaterialsCount: Number(e.target.value) })}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Slider 2: New Full Mock Tests */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>New Full Mock Drills to Author:</span>
                  <strong className="text-purple-400">{forecastParams.newMockTestsCount} Mocks</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={forecastParams.newMockTestsCount}
                  onChange={(e) => setForecastParams({ ...forecastParams, newMockTestsCount: Number(e.target.value) })}
                  className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Slider 3: Hindi Devanagari Coverage */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Bilingual Hindi Devanagari Coverage:</span>
                  <strong className="text-emerald-400">{forecastParams.hindiCoveragePct}%</strong>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={forecastParams.hindiCoveragePct}
                  onChange={(e) => setForecastParams({ ...forecastParams, hindiCoveragePct: Number(e.target.value) })}
                  className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            </div>

            {/* Forecast Projection Readout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-cyan-500/30 font-mono">
              <div>
                <span className="text-slate-500 text-[10px]">Projected Views</span>
                <p className="text-base font-black text-cyan-400">
                  {forecastResult.forecastedViews.toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-400 font-bold">
                  +{Math.round(((forecastResult.forecastedViews - (analyticsData?.kpis.totalViews || 1)) / (analyticsData?.kpis.totalViews || 1)) * 100)}% Lift
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px]">Projected Saves</span>
                <p className="text-base font-black text-indigo-400">
                  {forecastResult.forecastedDownloads.toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-400 font-bold">
                  +{Math.round(((forecastResult.forecastedDownloads - (analyticsData?.kpis.totalDownloads || 1)) / (analyticsData?.kpis.totalDownloads || 1)) * 100)}% Lift
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px]">Projected Mocks</span>
                <p className="text-base font-black text-purple-400">
                  {forecastResult.forecastedMockAttempts.toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-400 font-bold">
                  +{Math.round(((forecastResult.forecastedMockAttempts - (analyticsData?.kpis.mockAttempts || 1)) / (analyticsData?.kpis.mockAttempts || 1)) * 100)}% Lift
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px]">Rural Outreach</span>
                <p className="text-base font-black text-emerald-400">
                  {forecastResult.ruralExpansionRatePct}%
                </p>
                <span className="text-[10px] text-cyan-400 font-bold">East UP & Bihar</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                onClick={() => setIsForecastModalOpen(false)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              >
                Apply Projection Insights
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. MODAL: ASSET DEEP-DIVE TELEMETRY */}
      {inspectModalAsset && (
        <Modal
          isOpen={!!inspectModalAsset}
          onClose={() => setInspectModalAsset(null)}
          title={`Asset Telemetry: ${inspectModalAsset.title}`}
          size="xl"
        >
          <div className="space-y-4 text-xs font-sans text-slate-200">
            {/* Top Stat Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 text-[10px]">Total Impressions</span>
                <p className="text-base font-bold text-white">{inspectModalAsset.totalImpressions.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Deep Views</span>
                <p className="text-base font-bold text-cyan-400">{inspectModalAsset.totalViews.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Avg Dwell Time</span>
                <p className="text-base font-bold text-teal-400">{Math.round(inspectModalAsset.avgDwellTimeSeconds / 60)} mins</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Completion Integrity</span>
                <p className="text-base font-bold text-emerald-400">{inspectModalAsset.completionRatePct}%</p>
              </div>
            </div>

            {/* Difficulty Pacing Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Student Accuracy by Question Difficulty Pacing
              </h4>
              <div className="space-y-2 pt-1 font-mono text-[11px]">
                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>Easy Tier (Foundational Formulae):</span>
                    <strong className="text-emerald-400">{inspectModalAsset.difficultyPacing.easyQuestionsCorrectPct}% Correct</strong>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${inspectModalAsset.difficultyPacing.easyQuestionsCorrectPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>Moderate Tier (Speed Calculations & Mixed Logic):</span>
                    <strong className="text-cyan-400">{inspectModalAsset.difficultyPacing.moderateQuestionsCorrectPct}% Correct</strong>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${inspectModalAsset.difficultyPacing.moderateQuestionsCorrectPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>Hard / Distractor Tier (Tricky Negations & Conditions):</span>
                    <strong className="text-amber-400">{inspectModalAsset.difficultyPacing.hardQuestionsCorrectPct}% Correct</strong>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${inspectModalAsset.difficultyPacing.hardQuestionsCorrectPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Stumble Topics */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Detected Student Stumble Topics (High Error Frequency)
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                {inspectModalAsset.topStumbleQuestionTopics.map((topic, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-amber-400 font-bold font-mono">#{i + 1}</span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pedagogical Suggestions */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Cognitive Studio Recommendations
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-300 font-mono">
                {inspectModalAsset.pedagogicalRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-cyan-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => setInspectModalAsset(null)}
              >
                Close Telemetry Inspection
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. MODAL: EXPORT ANALYTICS DOSSIER */}
      {isExportModalOpen && (
        <Modal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          title="Export Operator Academic Reach Dossier"
          size="lg"
        >
          <div className="space-y-4 text-xs font-sans text-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-xs">
                Export verifiable non-financial academic telemetry with anti-tamper SHA-256 integrity hash.
              </p>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => { setExportFormat('JSON'); playCyberAudio('click', audioEnabled); }}
                  className={`px-3 py-1 rounded-lg font-mono font-bold text-xs ${
                    exportFormat === 'JSON' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => { setExportFormat('CSV'); playCyberAudio('click', audioEnabled); }}
                  className={`px-3 py-1 rounded-lg font-mono font-bold text-xs ${
                    exportFormat === 'CSV' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  CSV
                </button>
              </div>
            </div>

            {/* Anti-tamper Hash Pill */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-[11px]">
              <span className="text-slate-400">Integrity Hash:</span>
              <span className="text-cyan-400 font-bold">{analyticsData?.antiTamperHash}</span>
            </div>

            {/* Payload Preview */}
            <div className="relative">
              <pre className="max-h-60 overflow-y-auto p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 leading-tight select-all">
                {exportPayloadString}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setIsExportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleCopyExport}
                className="inline-flex items-center gap-1.5"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayload ? 'Copied' : 'Copy Payload'}</span>
              </Button>
              <Button
                variant="primary"
                onClick={handleDownloadExport}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {exportFormat} File</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
