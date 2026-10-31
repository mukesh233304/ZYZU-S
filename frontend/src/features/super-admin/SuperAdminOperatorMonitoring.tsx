// FOCUSPOINT Super Admin — Futuristic Operator AI Monitoring & Neural Cost Governance

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Activity, 
  Sparkles, 
  IndianRupee, 
  ShieldCheck, 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Layers, 
  TrendingUp,
  Cpu, 
  BarChart2, 
  Zap,
  BrainCircuit,
  Sliders,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Download,
  RefreshCw,
  Play,
  Pause,
  Terminal,
  X,
  ChevronRight,
  ChevronDown,
  Lock,
  Unlock,
  Globe,
  MapPin,
  RotateCcw,
  Check,
  Settings,
  Flame,
  ArrowUpRight,
  FileCode
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { operatorService } from '../../services/operatorService';
import { locationService } from '../../services/locationService';
import { 
  SuperAdminOperatorMonitoringMetric, 
  OperatorAiActivityLog, 
  OperatorAiQuotaConfig,
  AiModelTelemetrySummary 
} from '../../types/operator';
import { State, DistrictLocation, Locality } from '../../types/location';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

// Sound Synthesizer for tactile Cyber-HUD interaction
type SfxType = 'click' | 'warp' | 'confirm' | 'toggle' | 'alert';

const playCyberSound = (type: SfxType) => {
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
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'warp':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.16);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      case 'confirm':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(840, now + 0.06);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      case 'toggle':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.setValueAtTime(520, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      case 'alert':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(240, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
    }
  } catch {
    // AudioContext suppressed or disabled
  }
};

type SortField = 'tokens_desc' | 'questions_desc' | 'rate_desc' | 'cost_desc' | 'recent_desc' | 'name_asc';

interface SelectedTerritory {
  countryId: string;
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  localityId: string;
  localityName: string;
  level: 'INDIA' | 'STATE' | 'DISTRICT' | 'LOCALITY';
  breadcrumb: string;
}

export const SuperAdminOperatorMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SuperAdminOperatorMonitoringMetric[]>([]);
  const [activityLogs, setActivityLogs] = useState<OperatorAiActivityLog[]>([]);
  const [modelSummaries, setModelSummaries] = useState<AiModelTelemetrySummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [qualityFilter, setQualityFilter] = useState<string>('ALL');
  const [modelFilter, setModelFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortField>('tokens_desc');

  // Live Terminal Stream State
  const [streamExpanded, setStreamExpanded] = useState<boolean>(true);
  const [streamPaused, setStreamPaused] = useState<boolean>(false);

  // Sound Synthesizer State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fp_operator_ai_sfx_enabled') !== 'false';
  });

  const playSfx = (type: SfxType) => {
    if (soundEnabled) playCyberSound(type);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('fp_operator_ai_sfx_enabled', String(next));
    if (next) playCyberSound('confirm');
  };

  // Live IST Clock
  const [hudTime, setHudTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setHudTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Location Selector State
  const [statesList, setStatesList] = useState<State[]>([]);
  const [districtsList, setDistrictsList] = useState<DistrictLocation[]>([]);
  const [localitiesList, setLocalitiesList] = useState<Locality[]>([]);

  const [selectedLocation, setSelectedLocation] = useState<SelectedTerritory>({
    countryId: 'loc-country-in',
    stateId: '',
    stateName: '',
    districtId: '',
    districtName: '',
    localityId: '',
    localityName: '',
    level: 'INDIA',
    breadcrumb: 'Pan-India Fleet'
  });

  // Modals State
  const [inspectingOperator, setInspectingOperator] = useState<SuperAdminOperatorMonitoringMetric | null>(null);
  const [quotaModalOperator, setQuotaModalOperator] = useState<SuperAdminOperatorMonitoringMetric | null>(null);
  const [quotaForm, setQuotaForm] = useState<OperatorAiQuotaConfig>({
    operatorId: '',
    monthlyTokenLimit: 500000,
    rateLimitPerMinute: 25,
    allowedModels: ['Gemini 1.5 Flash', 'Gemini 1.5 Pro', 'Gemma 4 Edge'],
    autoFreezeOnExhaustion: true,
    temperatureCap: 0.7,
    requireHumanReview: true
  });
  const [inspectingLog, setInspectingLog] = useState<OperatorAiActivityLog | null>(null);

  // AI Copilot Sandbox State
  const [isSandboxOpen, setIsSandboxOpen] = useState<boolean>(false);
  const [sandboxModel, setSandboxModel] = useState<'Gemini 1.5 Flash' | 'Gemini 1.5 Pro' | 'Gemma 4 Edge'>('Gemini 1.5 Flash');
  const [sandboxExam, setSandboxExam] = useState<string>('UPSSSC PET 2026');
  const [sandboxTopic, setSandboxTopic] = useState<string>('Percentages & Profit-Loss');
  const [sandboxDifficulty, setSandboxDifficulty] = useState<string>('Medium');
  const [sandboxGenerating, setSandboxGenerating] = useState<boolean>(false);
  const [sandboxOutput, setSandboxOutput] = useState<{
    question: string;
    options: string[];
    correct: number;
    explanation: string;
    tokens: number;
    latency: number;
    cost: number;
  } | null>(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  // Load Initial Data
  useEffect(() => {
    const states = locationService.getStates('loc-country-in', true);
    setStatesList(states);
    loadMonitoring();
  }, []);

  const loadMonitoring = async () => {
    setLoading(true);
    try {
      const [metricsRes, logsRes, modelsRes] = await Promise.all([
        operatorService.getSuperAdminOperatorMonitoring(),
        operatorService.getOperatorAiActivityLogs(),
        operatorService.getAiModelTelemetrySummaries()
      ]);
      setMetrics(metricsRes);
      setActivityLogs(logsRes);
      setModelSummaries(modelsRes);
    } catch (e) {
      console.error(e);
      showToast('Failed to load operator monitoring metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    playSfx('warp');
    setRefreshing(true);
    try {
      const [metricsRes, logsRes, modelsRes] = await Promise.all([
        operatorService.getSuperAdminOperatorMonitoring(),
        operatorService.getOperatorAiActivityLogs(),
        operatorService.getAiModelTelemetrySummaries()
      ]);
      setMetrics(metricsRes);
      setActivityLogs(logsRes);
      setModelSummaries(modelsRes);
      showToast('Neural telemetry refreshed across all regions', 'info');
    } catch (e) {
      console.error(e);
      showToast('Refresh failed', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // Location Selection Handlers
  const handleSelectState = (stateId: string) => {
    playSfx('click');
    if (!stateId) {
      handleResetTerritory();
      return;
    }
    const stateObj = statesList.find(s => s.id === stateId);
    if (!stateObj) return;

    const districts = locationService.getDistricts(stateId, true);
    setDistrictsList(districts);
    setLocalitiesList([]);

    setSelectedLocation({
      countryId: 'loc-country-in',
      stateId,
      stateName: stateObj.name,
      districtId: '',
      districtName: '',
      localityId: '',
      localityName: '',
      level: 'STATE',
      breadcrumb: `${stateObj.name} Bureau`
    });
  };

  const handleSelectDistrict = (districtId: string) => {
    playSfx('click');
    if (!districtId) {
      if (selectedLocation.stateId) {
        handleSelectState(selectedLocation.stateId);
      }
      return;
    }
    const distObj = districtsList.find(d => d.id === districtId);
    if (!distObj) return;

    const locs = locationService.getLocalities(districtId, true);
    setLocalitiesList(locs);

    setSelectedLocation(prev => ({
      ...prev,
      districtId,
      districtName: distObj.name,
      localityId: '',
      localityName: '',
      level: 'DISTRICT',
      breadcrumb: `${prev.stateName} > ${distObj.name}`
    }));
  };

  const handleSelectLocality = (localityId: string) => {
    playSfx('click');
    if (!localityId) {
      if (selectedLocation.districtId) {
        handleSelectDistrict(selectedLocation.districtId);
      }
      return;
    }
    const locObj = localitiesList.find(l => l.id === localityId);
    if (!locObj) return;

    setSelectedLocation(prev => ({
      ...prev,
      localityId,
      localityName: locObj.name,
      level: 'LOCALITY',
      breadcrumb: `${prev.stateName} > ${prev.districtName} > ${locObj.name}`
    }));
  };

  const handleResetTerritory = () => {
    playSfx('toggle');
    setSelectedLocation({
      countryId: 'loc-country-in',
      stateId: '',
      stateName: '',
      districtId: '',
      districtName: '',
      localityId: '',
      localityName: '',
      level: 'INDIA',
      breadcrumb: 'Pan-India Fleet'
    });
    setDistrictsList([]);
    setLocalitiesList([]);
  };

  const handleQuickPreset = (stateName: string, stateId: string) => {
    playSfx('warp');
    if (!stateName) {
      handleResetTerritory();
      return;
    }
    const stateObj = statesList.find(s => s.name.toLowerCase() === stateName.toLowerCase() || s.id === stateId);
    if (stateObj) {
      handleSelectState(stateObj.id);
    } else {
      setSelectedLocation({
        countryId: 'loc-country-in',
        stateId: stateId || 'custom',
        stateName: stateName,
        districtId: '',
        districtName: '',
        localityId: '',
        localityName: '',
        level: 'STATE',
        breadcrumb: `${stateName} Bureau`
      });
      setDistrictsList([]);
      setLocalitiesList([]);
    }
  };

  // Toggle AI Access Handler
  const handleToggleAiAccess = async (operator: SuperAdminOperatorMonitoringMetric) => {
    playSfx('toggle');
    const newSuspendedState = !operator.isAiAccessSuspended;
    try {
      await operatorService.toggleOperatorAiAccess(operator.operatorId, newSuspendedState);
      setMetrics(prev => prev.map(m => m.operatorId === operator.operatorId ? { ...m, isAiAccessSuspended: newSuspendedState } : m));
      if (newSuspendedState) {
        playSfx('alert');
        showToast(`AI inference suspended for ${operator.operatorName}`, 'info');
      } else {
        playSfx('confirm');
        showToast(`AI inference restored for ${operator.operatorName}`, 'success');
      }
    } catch {
      showToast('Failed to toggle AI access', 'error');
    }
  };

  // Open Quota Modal
  const handleOpenQuotaModal = (operator: SuperAdminOperatorMonitoringMetric) => {
    playSfx('click');
    const cfg = operatorService.getAiQuotaConfig(operator.operatorId);
    setQuotaForm(cfg);
    setQuotaModalOperator(operator);
  };

  // Save Quota Handler
  const handleSaveQuota = async () => {
    if (!quotaModalOperator) return;
    playSfx('confirm');
    try {
      await operatorService.updateOperatorAiQuota(quotaModalOperator.operatorId, quotaForm);
      setMetrics(prev => prev.map(m => {
        if (m.operatorId === quotaModalOperator.operatorId) {
          const usedPct = Math.min(100, Math.round((m.aiTokensUsed / quotaForm.monthlyTokenLimit) * 100));
          return {
            ...m,
            monthlyTokenQuota: quotaForm.monthlyTokenLimit,
            tokenQuotaUsedPercent: usedPct,
            rateLimitPerMinute: quotaForm.rateLimitPerMinute,
            temperatureCap: quotaForm.temperatureCap
          };
        }
        return m;
      }));
      showToast(`AI Quota updated for ${quotaModalOperator.operatorName}`, 'success');
      setQuotaModalOperator(null);
    } catch {
      showToast('Failed to update AI quota', 'error');
    }
  };

  // Export Telemetry
  const handleExportTelemetry = () => {
    playSfx('warp');
    const snapshot = {
      exportTimestamp: new Date().toISOString(),
      territoryScope: selectedLocation.breadcrumb,
      totalOperators: metrics.length,
      aggregateTokens: metrics.reduce((acc, curr) => acc + curr.aiTokensUsed, 0),
      aggregateCostInr: metrics.reduce((acc, curr) => acc + curr.estimatedAiCost, 0),
      operators: metrics,
      recentAiLogs: activityLogs,
      models: modelSummaries
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focuspoint-operator-ai-telemetry-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('AI Governance Telemetry Snapshot exported', 'success');
  };

  // Sandbox AI Generation Simulator
  const handleRunSandbox = () => {
    playSfx('warp');
    setSandboxGenerating(true);
    setSandboxOutput(null);

    setTimeout(() => {
      playSfx('confirm');
      setSandboxGenerating(false);

      if (sandboxExam.includes('PET')) {
        setSandboxOutput({
          question: 'If the price of wheat increases by 25%, by what percentage must a household reduce its consumption so that total expenditure remains unchanged?',
          options: ['20%', '25%', '18.5%', '22.5%'],
          correct: 0,
          explanation: 'Let initial price be ₹100 and consumption 100 kg (Expenditure = ₹10,000). New price = ₹125. New consumption for ₹10,000 = 10,000 / 125 = 80 kg. Reduction = 20%. Formula: [R / (100 + R)] × 100% = [25 / 125] × 100% = 20%.',
          tokens: 840,
          latency: sandboxModel === 'Gemini 1.5 Pro' ? 680 : 310,
          cost: sandboxModel === 'Gemini 1.5 Pro' ? 0.15 : 0.08
        });
      } else if (sandboxExam.includes('JEE')) {
        setSandboxOutput({
          question: 'A uniform disc of mass M and radius R rolls without slipping on a horizontal plane with velocity v. The kinetic energy of the top half portion of the disc is:',
          options: ['(1/2)Mv²', '(3/4)Mv²', '(5/8)Mv²', '(7/16)Mv²'],
          correct: 2,
          explanation: 'By integration over the upper semicircular area using polar coordinates or superimposing translational velocity v with angular rotation ω = v/R, the total KE of the upper half equals (5/8) Mv².',
          tokens: 1540,
          latency: sandboxModel === 'Gemini 1.5 Pro' ? 820 : 420,
          cost: sandboxModel === 'Gemini 1.5 Pro' ? 0.24 : 0.14
        });
      } else {
        setSandboxOutput({
          question: 'Which constitutional amendment added Article 21A (Right to Education as a Fundamental Right) to the Constitution of India?',
          options: ['86th Constitutional Amendment Act, 2002', '44th Constitutional Amendment Act, 1978', '91st Constitutional Amendment Act, 2003', '73rd Constitutional Amendment Act, 1992'],
          correct: 0,
          explanation: 'The 86th Constitutional Amendment Act, 2002 inserted Article 21A, declaring education for children aged 6 to 14 as a Fundamental Right.',
          tokens: 920,
          latency: sandboxModel === 'Gemini 1.5 Pro' ? 640 : 280,
          cost: sandboxModel === 'Gemini 1.5 Pro' ? 0.16 : 0.09
        });
      }
    }, 1100);
  };

  // Filter & Sort Logic
  const filteredMetrics = useMemo(() => {
    return metrics.filter(m => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        m.operatorName.toLowerCase().includes(q) ||
        m.systemId.toLowerCase().includes(q) ||
        (m.state && m.state.toLowerCase().includes(q)) ||
        (m.district && m.district.toLowerCase().includes(q)) ||
        (m.assignedExams && m.assignedExams.some(e => e.toLowerCase().includes(q)));

      // Status
      const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

      // Quality Tier
      let matchesQuality = true;
      if (qualityFilter === 'ELITE_A_PLUS') {
        matchesQuality = (m.hitlQualityScore || 90) >= 95;
      } else if (qualityFilter === 'STANDARD_A') {
        matchesQuality = (m.hitlQualityScore || 90) >= 90 && (m.hitlQualityScore || 90) < 95;
      } else if (qualityFilter === 'NEEDS_REVIEW') {
        matchesQuality = (m.hitlQualityScore || 90) < 90;
      }

      // Model
      const matchesModel = modelFilter === 'ALL' || 
        (m.aiModelPreference && m.aiModelPreference.toLowerCase().includes(modelFilter.toLowerCase()));

      // Location Hierarchy
      let matchesLocation = true;
      if (selectedLocation.level === 'STATE' && selectedLocation.stateName) {
        matchesLocation = m.state?.toLowerCase() === selectedLocation.stateName.toLowerCase();
      } else if (selectedLocation.level === 'DISTRICT' && selectedLocation.districtName) {
        matchesLocation = m.state?.toLowerCase() === selectedLocation.stateName.toLowerCase() &&
          m.district?.toLowerCase() === selectedLocation.districtName.toLowerCase();
      }

      return matchesSearch && matchesStatus && matchesQuality && matchesModel && matchesLocation;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'tokens_desc':
          return b.aiTokensUsed - a.aiTokensUsed;
        case 'questions_desc':
          return b.aiQuestionsGenerated - a.aiQuestionsGenerated;
        case 'rate_desc':
          return (b.hitlQualityScore || 90) - (a.hitlQualityScore || 90);
        case 'cost_desc':
          return b.estimatedAiCost - a.estimatedAiCost;
        case 'recent_desc':
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        case 'name_asc':
          return a.operatorName.localeCompare(b.operatorName);
        default:
          return 0;
      }
    });
  }, [metrics, searchQuery, statusFilter, qualityFilter, modelFilter, selectedLocation, sortBy]);

  // Aggregate KPI Calculations
  const totalTokens = metrics.reduce((acc, curr) => acc + curr.aiTokensUsed, 0);
  const totalCost = metrics.reduce((acc, curr) => acc + curr.estimatedAiCost, 0);
  const totalAIQuestions = metrics.reduce((acc, curr) => acc + curr.aiQuestionsGenerated, 0);
  const totalApproved = metrics.reduce((acc, curr) => acc + curr.questionsApproved, 0);
  const avgRejectionRate = metrics.length > 0 
    ? (metrics.reduce((acc, curr) => acc + curr.rejectionRate, 0) / metrics.length).toFixed(1)
    : '0.0';
  const avgHitlScore = metrics.length > 0
    ? Math.round(metrics.reduce((acc, curr) => acc + (curr.hitlQualityScore || 92), 0) / metrics.length)
    : 94;
  const activeAiOperators = metrics.filter(m => m.status === 'ACTIVE' && !m.isAiAccessSuspended).length;

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[480px] bg-slate-950 text-white rounded-3xl border border-cyan-500/20 shadow-2xl">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping"></div>
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
        <p className="text-cyan-400 font-mono text-sm tracking-wider uppercase animate-pulse">
          Booting Operator AI Neural Governance Core...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* ============================================================================ */}
      {/* 1. COCKPIT HEADER WITH CYBER-HUD & AUDIO SFX TOGGLE */}
      {/* ============================================================================ */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden text-white">
        {/* Ambient Laser Background Glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-cyan-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-brand-600/20 via-emerald-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        {/* Futuristic Corner Brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <BrainCircuit className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                NEURAL CORE GOVERNANCE v3.4
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                ACTIVE MONITORING: 100% OPERATIONAL
              </span>
              <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {hudTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>OPERATOR AI MONITORING &amp; NEURAL COST GOVERNANCE</span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Auditing human-in-the-loop content generation velocity, Gemini 1.5 token expenditure, prompt safety interventions, rejection rates, and pedagogical accuracy across Pan-India exam authoring hubs.
            </p>
          </div>

          {/* Cockpit Actions */}
          <div className="flex flex-wrap items-center gap-2.5 lg:self-start">
            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                soundEnabled 
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={soundEnabled ? 'Synthesizer Audio Enabled' : 'Synthesizer Audio Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'SFX ON' : 'SFX MUTED'}</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-2 transition-all"
              title="Refresh Neural Telemetry"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">REFRESH</span>
            </button>

            <button
              onClick={() => { playSfx('click'); setIsSandboxOpen(true); }}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              AI COPILOT SANDBOX
            </button>

            <button
              onClick={handleExportTelemetry}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              EXPORT JSON
            </button>

            <button
              onClick={() => { playSfx('click'); navigate('/super-admin/operators'); }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Users className="w-4 h-4 text-slate-400" />
              MANAGE OPERATORS
            </button>
          </div>
        </div>

        {/* Neural Core Animated Visual Ring */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-cyan-300">
              <Cpu className="w-4 h-4 text-cyan-400" />
              INFERENCE ENGINE: GEMINI-1.5-FLASH &amp; PRO DUAL-CLUSTER
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              GUARDRAILS: ZERO-HALLUCINATION HITL PROTOCOL
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">HARDWARE LATENCY:</span>
            <span className="text-emerald-400 font-bold">~310ms P50 / 690ms P95</span>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 2. TOP-LEVEL KPI TELEMETRY MATRIX (7 CYBER-HUD CARDS) */}
      {/* ============================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {/* Card 1: Active Operators */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
              ACTIVE OPERATORS
            </span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {activeAiOperators} <span className="text-slate-500 text-sm font-normal">/ {metrics.length}</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> Authorized AI Fleet
          </div>
        </div>

        {/* Card 2: AI Questions Generated */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
              AI GENERATED
            </span>
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {totalAIQuestions.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold font-mono">{totalApproved} accepted</span>
          </div>
        </div>

        {/* Card 3: AI Tokens Ingested */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
              TOKENS INGESTED
            </span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-300 tracking-tight">
            {(totalTokens / 1000).toFixed(0)}k
          </div>
          <div className="mt-2 text-[11px] text-purple-400 font-mono flex items-center gap-1">
            <Zap className="w-3 h-3 text-purple-400" /> {totalTokens.toLocaleString('en-IN')} raw
          </div>
        </div>

        {/* Card 4: Estimated AI Cost */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
              AI EXPENDITURE
            </span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
            ₹{totalCost.toFixed(2)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            ₹0.11/question avg
          </div>
        </div>

        {/* Card 5: HITL Quality Score */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
              HITL SCORE
            </span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300 tracking-tight">
            {avgHitlScore}/100
          </div>
          <div className="mt-2 text-[11px] text-cyan-400 font-medium flex items-center gap-1">
            Grade A+ Pedagogical
          </div>
        </div>

        {/* Card 6: Rejection Rate */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
              REJECTION RATE
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-300 tracking-tight">
            {avgRejectionRate}%
          </div>
          <div className="mt-2 text-[11px] text-amber-400 font-mono flex items-center gap-1">
            Within 5% SLA Limit
          </div>
        </div>

        {/* Card 7: P95 Latency */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
              INFERENCE LATENCY
            </span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-300 tracking-tight">
            380ms
          </div>
          <div className="mt-2 text-[11px] text-blue-400 font-mono flex items-center gap-1">
            P95: 690ms Edge Accel
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 3. PANORAMIC PAN-INDIA LOCATION & TERRITORY COMMAND CONSOLE */}
      {/* ============================================================================ */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-lg text-white space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Pan-India Territorial Command &amp; Regional Operator Scoping
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Filter AI velocity, token burn, and human review accuracy by designated State Bureau or District Coaching Cluster.
            </p>
          </div>

          {/* Active Breadcrumb Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              {selectedLocation.breadcrumb}
            </span>
            {selectedLocation.level !== 'INDIA' && (
              <button
                onClick={handleResetTerritory}
                className="text-xs font-mono px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1"
                title="Reset to Nationwide"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Territorial Quick Preset Chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            TERRITORIAL COMMAND PRESETS:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'Pan-India Fleet (All 8 Operators)', state: '', count: 'Nationwide' },
              { label: 'Uttar Pradesh (Varanasi & Lucknow)', state: 'Uttar Pradesh', count: '2 Operators' },
              { label: 'Delhi-NCR (New Delhi HQ)', state: 'Delhi', count: '1 Operator' },
              { label: 'Maharashtra (Pune Hub)', state: 'Maharashtra', count: '1 Operator' },
              { label: 'West Bengal (Kolkata Hub)', state: 'West Bengal', count: '1 Operator' },
              { label: 'Bihar (Patna Eastern Bureau)', state: 'Bihar', count: '1 Operator' },
              { label: 'Rajasthan (Kota Hub)', state: 'Rajasthan', count: '1 Operator' },
              { label: 'Madhya Pradesh (Bhopal Hub)', state: 'Madhya Pradesh', count: '1 Operator' }
            ].map(preset => {
              const isSelected = (!preset.state && selectedLocation.level === 'INDIA') ||
                (selectedLocation.stateName?.toLowerCase() === preset.state.toLowerCase());
              return (
                <button
                  key={preset.label}
                  onClick={() => handleQuickPreset(preset.state, '')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <span>{preset.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-cyan-400/20 text-cyan-200' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {preset.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Cascading Holographic Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* State / UT Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              State / Union Territory:
            </label>
            <select
              value={selectedLocation.stateId}
              onChange={(e) => handleSelectState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
            >
              <option value="">All States / UTs ({statesList.length})</option>
              {statesList.map(st => (
                <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
              ))}
            </select>
          </div>

          {/* District Corridor Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              District Corridor:
            </label>
            <select
              value={selectedLocation.districtId}
              onChange={(e) => handleSelectDistrict(e.target.value)}
              disabled={!selectedLocation.stateId}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {selectedLocation.stateId ? `All Districts in ${selectedLocation.stateName}` : 'Select State First'}
              </option>
              {districtsList.map(dist => (
                <option key={dist.id} value={dist.id}>{dist.name}</option>
              ))}
            </select>
          </div>

          {/* Locality / Hub Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Study Hub / Locality:
            </label>
            <select
              value={selectedLocation.localityId}
              onChange={(e) => handleSelectLocality(e.target.value)}
              disabled={!selectedLocation.districtId}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {selectedLocation.districtId ? `All Localities in ${selectedLocation.districtName}` : 'Select District First'}
              </option>
              {localitiesList.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 4. MULTI-MODEL NEURAL ENGINE TELEMETRY BAR */}
      {/* ============================================================================ */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-md text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Dual-Cluster Model Workload &amp; Token Consumption Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time traffic distribution across Google Gemini 1.5 and Gemma 4 model families
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/40">
            2,760,000 Total Model Tokens Logged
          </span>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-l-full transition-all" 
            style={{ width: '68%' }}
            title="Gemini 1.5 Flash: 68% Traffic"
          />
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all" 
            style={{ width: '27%' }}
            title="Gemini 1.5 Pro: 27% Traffic"
          />
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-r-full transition-all" 
            style={{ width: '5%' }}
            title="Gemma 4 Edge: 5% Traffic"
          />
        </div>

        {/* Model Telemetry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {modelSummaries.map(m => (
            <div key={m.modelName} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-200">{m.displayName}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${m.color}20`, color: m.color }}>
                    {m.sharePercent}% Load
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>Tokens Processed:</span>
                    <strong className="text-white">{(m.totalTokens / 1000).toFixed(0)}k</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Inference Latency:</span>
                    <strong className="text-emerald-400">{m.avgLatencyMs}ms avg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost Rate:</span>
                    <strong className="text-slate-300">₹{m.costPer1kTokensInr.toFixed(2)}/1k tok</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 5. LIVE AI NEURAL ACTIVITY STREAM (STREAMING AUDIT TERMINAL) */}
      {/* ============================================================================ */}
      <div className="rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-md text-white overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Live AI Generation Stream &amp; Guardrail Interventions
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h3>
              <p className="text-xs text-slate-400">Real-time audit log of prompts, token sizes, model decisions, and human editor overrides</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { playSfx('toggle'); setStreamPaused(!streamPaused); }}
              className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
            >
              {streamPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
              {streamPaused ? 'RESUME STREAM' : 'PAUSE'}
            </button>
            <button
              onClick={() => { playSfx('click'); setStreamExpanded(!streamExpanded); }}
              className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition-all"
            >
              {streamExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              {streamExpanded ? 'COLLAPSE' : 'EXPAND'}
            </button>
          </div>
        </div>

        {streamExpanded && (
          <div className="p-4 overflow-x-auto max-h-72 overflow-y-auto font-mono text-xs divide-y divide-slate-800/80">
            {activityLogs.map((log) => (
              <div 
                key={log.id} 
                onClick={() => { playSfx('click'); setInspectingLog(log); }}
                className="py-2.5 px-3 hover:bg-slate-900/80 rounded-xl transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour12: false })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {log.operatorName}
                    </span>
                    <span className="text-slate-400 text-[11px]">[{log.targetExam}]</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.modelUsed.includes('Pro') ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                    log.modelUsed.includes('Flash') ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                    'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {log.modelUsed}
                  </span>
                  <span className="text-slate-400 truncate max-w-xs hidden lg:inline">
                    {log.subject}: {log.topic}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] shrink-0">
                  <span className="text-purple-300 font-bold">{log.tokens.total} tokens</span>
                  <span className="text-emerald-400">{log.latencyMs}ms</span>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                    log.status === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    log.status === 'MODIFIED_AND_ACCEPTED' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {log.status === 'MODIFIED_AND_ACCEPTED' ? 'MODIFIED' : log.status}
                  </span>
                  <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================================ */}
      {/* 6. OPERATOR AI PRODUCTIVITY & QUALITY LEDGER (TABLE WITH SEARCH & SORT) */}
      {/* ============================================================================ */}
      <div className="rounded-3xl shadow-xl overflow-hidden bg-slate-950 border border-cyan-500/30 text-white">
        {/* Table Filter Controls */}
        <div className="p-6 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Operator AI Productivity &amp; Accountability Ledger
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual authoring velocity, Gemini token burn, HITL quality ratings, and quota governance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search operator, exam, region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 rounded-xl border border-slate-700/80 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <select
                value={statusFilter}
                onChange={(e) => { playSfx('click'); setStatusFilter(e.target.value); }}
                className="px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="ALL">All Statuses ({metrics.length})</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {/* Quality Tier Filter */}
            <div className="flex items-center gap-1.5">
              <select
                value={qualityFilter}
                onChange={(e) => { playSfx('click'); setQualityFilter(e.target.value); }}
                className="px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="ALL">All Quality Tiers</option>
                <option value="ELITE_A_PLUS">Elite A+ (≥95%)</option>
                <option value="STANDARD_A">Standard A (90-95%)</option>
                <option value="NEEDS_REVIEW">Needs Review (&lt;90%)</option>
              </select>
            </div>

            {/* Multi-Axis Sort */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => { playSfx('click'); setSortBy(e.target.value as SortField); }}
                className="px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="tokens_desc">Tokens (High → Low)</option>
                <option value="questions_desc">Questions Generated</option>
                <option value="rate_desc">HITL Quality Score</option>
                <option value="cost_desc">Cost (₹ High → Low)</option>
                <option value="recent_desc">Last Active</option>
                <option value="name_asc">Operator Name (A-Z)</option>
              </select>
            </div>

            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-3 py-2 rounded-xl border border-cyan-500/40">
              {filteredMetrics.length} Matches
            </span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[1050px]">
            <thead className="bg-slate-900/80 text-[11px] uppercase font-mono font-bold tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-4 px-5">Operator Identity &amp; Region</th>
                <th className="py-4 px-5">Curricula &amp; Exams</th>
                <th className="py-4 px-5">AI Velocity &amp; HITL Approval</th>
                <th className="py-4 px-5">HITL Quality &amp; Human Touch</th>
                <th className="py-4 px-5">Tokens &amp; Quota Burn</th>
                <th className="py-4 px-5">Model Preference</th>
                <th className="py-4 px-5 text-center">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950">
              {filteredMetrics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono text-sm">
                    No operators match current filters or regional criteria.
                  </td>
                </tr>
              ) : (
                filteredMetrics.map((op) => (
                  <tr key={op.operatorId} className="hover:bg-slate-900/50 transition-colors group">
                    {/* Operator Identity & Region */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3.5">
                        {op.avatarUrl ? (
                          <img 
                            src={op.avatarUrl} 
                            alt={op.operatorName} 
                            className="w-11 h-11 rounded-xl object-cover ring-2 ring-cyan-500/30 shadow-md" 
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-md">
                            {op.operatorName[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{op.operatorName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                              op.status === 'ACTIVE' 
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' 
                                : 'bg-rose-950 text-rose-300 border border-rose-500/50'
                            }`}>
                              {op.status}
                            </span>
                            {op.isAiAccessSuspended && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-900/60 text-rose-300 border border-rose-700">
                                AI SUSPENDED
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                            <span>{op.systemId}</span>
                            <span>&bull;</span>
                            <span className="text-cyan-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {op.district ? `${op.district}, ${op.state}` : op.state || 'Pan-India'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Curricula & Exams */}
                    <td className="py-4 px-5 text-xs">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {op.assignedExams && op.assignedExams.length > 0 ? (
                          op.assignedExams.slice(0, 3).map(exam => (
                            <span key={exam} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800">
                              {exam}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 font-mono">Pan-India Curricula</span>
                        )}
                        {op.assignedExams && op.assignedExams.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-500">
                            +{op.assignedExams.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* AI Velocity & Acceptance */}
                    <td className="py-4 px-5 text-xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400">Total Generated:</span>
                        <strong className="text-white font-mono">{op.aiQuestionsGenerated}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-emerald-400 font-mono">{op.questionsApproved} approved</span>
                        <span className="text-rose-400 font-mono">{op.rejectionRate}% rej.</span>
                      </div>
                      {/* Visual Progress Bar */}
                      <div className="w-36 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full rounded-full ${op.rejectionRate > 10 ? 'bg-amber-400' : 'bg-emerald-400'}`} 
                          style={{ width: `${Math.min(100, (op.questionsApproved / Math.max(1, op.aiQuestionsGenerated)) * 100)}%` }} 
                        />
                      </div>
                    </td>

                    {/* HITL Quality & Human Touch */}
                    <td className="py-4 px-5 text-xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Quality Score:</span>
                        <span className="font-mono font-bold text-cyan-300">{op.hitlQualityScore || 94}/100</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Human Edit: <strong className="text-purple-300 font-mono">{op.humanEditDistancePercent || 7}%</strong>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {op.guardrailFlagsCount ? (
                          <span className="text-amber-400">{op.guardrailFlagsCount} safety flags</span>
                        ) : (
                          <span className="text-emerald-400">100% Guardrail Clean</span>
                        )}
                      </div>
                    </td>

                    {/* Tokens & Quota Burn */}
                    <td className="py-4 px-5 text-xs space-y-1.5">
                      <div className="font-mono text-purple-300 font-bold flex items-center justify-between">
                        <span>{op.aiTokensUsed.toLocaleString('en-IN')} tok</span>
                        <span className="text-emerald-400">₹{op.estimatedAiCost.toFixed(2)}</span>
                      </div>
                      {/* Quota Progress */}
                      <div className="w-36 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            (op.tokenQuotaUsedPercent || 40) > 80 ? 'bg-rose-500' : 
                            (op.tokenQuotaUsedPercent || 40) > 60 ? 'bg-amber-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${op.tokenQuotaUsedPercent || 40}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                        <span>Quota: {op.tokenQuotaUsedPercent || 40}%</span>
                        <span>Cap: {((op.monthlyTokenQuota || 500000) / 1000).toFixed(0)}k</span>
                      </div>
                    </td>

                    {/* Model Preference */}
                    <td className="py-4 px-5 text-xs">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          op.aiModelPreference?.includes('Pro') ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                          op.aiModelPreference?.includes('Hybrid') ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                          'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {op.aiModelPreference || 'Gemini 1.5 Flash'}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {op.avgInferenceLatencyMs || 320}ms avg latency
                        </div>
                      </div>
                    </td>

                    {/* Governance Actions */}
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => { playSfx('click'); setInspectingOperator(op); }}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-cyan-300 transition-all"
                          title="Inspect Neural Telemetry Audit"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenQuotaModal(op)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-400 hover:text-purple-300 transition-all"
                          title="Adjust AI Quotas &amp; Model Access"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleAiAccess(op)}
                          className={`p-2 rounded-xl border transition-all ${
                            op.isAiAccessSuspended 
                              ? 'bg-rose-950/80 border-rose-600 text-rose-300' 
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400'
                          }`}
                          title={op.isAiAccessSuspended ? 'Restore AI Inference Access' : 'Suspend AI Inference Access'}
                        >
                          {op.isAiAccessSuspended ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 7. MODAL 1: OPERATOR NEURAL DEEP-DIVE INSPECTOR */}
      {/* ============================================================================ */}
      {inspectingOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-950 border border-cyan-500/40 shadow-2xl p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => { playSfx('click'); setInspectingOperator(null); }}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
              {inspectingOperator.avatarUrl ? (
                <img 
                  src={inspectingOperator.avatarUrl} 
                  alt={inspectingOperator.operatorName} 
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-cyan-500/40"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-cyan-600 text-white font-bold flex items-center justify-center text-lg">
                  {inspectingOperator.operatorName[0]}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{inspectingOperator.operatorName}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                    {inspectingOperator.systemId}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>{inspectingOperator.district ? `${inspectingOperator.district}, ${inspectingOperator.state}` : inspectingOperator.state}</span>
                  <span>&bull;</span>
                  <span>Status: <strong className="text-emerald-400">{inspectingOperator.status}</strong></span>
                </p>
              </div>
            </div>

            {/* 4-Card Telemetry Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">APPROVAL RATE</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {((inspectingOperator.questionsApproved / Math.max(1, inspectingOperator.aiQuestionsGenerated)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">TOTAL AI COST</span>
                <span className="text-xl font-bold font-mono text-cyan-400">
                  ₹{inspectingOperator.estimatedAiCost.toFixed(2)}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">HUMAN EDIT DISTANCE</span>
                <span className="text-xl font-bold font-mono text-purple-400">
                  {inspectingOperator.humanEditDistancePercent || 7}%
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">SAFETY FLAGS</span>
                <span className={`text-xl font-bold font-mono ${inspectingOperator.guardrailFlagsCount ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {inspectingOperator.guardrailFlagsCount || 0}
                </span>
              </div>
            </div>

            {/* Daily Generation Velocity (Last 7 Days Bars) */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block">
                7-Day AI Output Velocity (Questions / Day)
              </span>
              <div className="flex items-end justify-between gap-2 h-28 pt-4 px-2">
                {[
                  { day: 'Mon', count: 35 },
                  { day: 'Tue', count: 48 },
                  { day: 'Wed', count: 42 },
                  { day: 'Thu', count: 65 },
                  { day: 'Fri', count: 58 },
                  { day: 'Sat', count: 28 },
                  { day: 'Sun', count: 34 }
                ].map((item, idx) => (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono text-slate-400">{item.count}</span>
                    <div 
                      className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                        idx === 3 ? 'bg-gradient-to-t from-cyan-600 to-cyan-400' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      style={{ height: `${(item.count / 70) * 100}%` }}
                    />
                    <span className="text-[10px] font-mono text-slate-400">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Curricula Badges */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-slate-400 block">
                Assigned Exam Patterns &amp; Blueprints:
              </span>
              <div className="flex flex-wrap gap-2">
                {inspectingOperator.assignedExams?.map(exam => (
                  <span key={exam} className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-900 border border-slate-700 text-cyan-300">
                    {exam}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => { playSfx('click'); setInspectingOperator(null); }}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
              >
                Close Inspector
              </button>
              <button
                onClick={() => {
                  setInspectingOperator(null);
                  handleOpenQuotaModal(inspectingOperator);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-2"
              >
                <Sliders className="w-3.5 h-3.5" /> Adjust AI Quotas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 8. MODAL 2: OPERATOR AI QUOTA & MODEL CONTROLLER */}
      {/* ============================================================================ */}
      {quotaModalOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-950 border border-purple-500/40 shadow-2xl p-6 sm:p-8 text-white space-y-6">
            <button
              onClick={() => { playSfx('click'); setQuotaModalOperator(null); }}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  AI Quota &amp; Governance Policy: {quotaModalOperator.operatorName}
                </h3>
                <p className="text-xs text-slate-400">Configure monthly token caps, rate limits, model permissions, and safety enforcement</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Monthly Token Limit Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-bold">Monthly Token Cap:</span>
                  <span className="text-purple-400 font-bold">{quotaForm.monthlyTokenLimit.toLocaleString('en-IN')} Tokens</span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="2000000"
                  step="50000"
                  value={quotaForm.monthlyTokenLimit}
                  onChange={(e) => setQuotaForm(prev => ({ ...prev, monthlyTokenLimit: Number(e.target.value) }))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>100k</span>
                  <span>500k</span>
                  <span>1.0M</span>
                  <span>2.0M</span>
                </div>
              </div>

              {/* Rate Limit per minute */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-bold">Rate Limit (Requests / Minute):</span>
                  <span className="text-cyan-400 font-bold">{quotaForm.rateLimitPerMinute} req/min</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={quotaForm.rateLimitPerMinute}
                  onChange={(e) => setQuotaForm(prev => ({ ...prev, rateLimitPerMinute: Number(e.target.value) }))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Temperature / Creativity Cap */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-bold">Temperature Cap (Creativity vs Determinism):</span>
                  <span className="text-emerald-400 font-bold">{quotaForm.temperatureCap.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quotaForm.temperatureCap}
                  onChange={(e) => setQuotaForm(prev => ({ ...prev, temperatureCap: Number(e.target.value) }))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0.1 (Strict Deterministic)</span>
                  <span>0.7 (Standard Exam)</span>
                  <span>1.0 (High Creative)</span>
                </div>
              </div>

              {/* Allowed AI Model Access */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-300 block">
                  Authorized Model Endpoints:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'Gemini 1.5 Flash', desc: 'Fast MCQ Generator' },
                    { id: 'Gemini 1.5 Pro', desc: 'Deep Multi-Step STEM' },
                    { id: 'Gemma 4 Edge', desc: 'Distractor Verifier' }
                  ].map(m => {
                    const isAllowed = quotaForm.allowedModels.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          playSfx('toggle');
                          setQuotaForm(prev => ({
                            ...prev,
                            allowedModels: isAllowed 
                              ? prev.allowedModels.filter(x => x !== m.id)
                              : [...prev.allowedModels, m.id]
                          }));
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isAllowed 
                            ? 'bg-purple-950/80 border-purple-500 text-purple-200' 
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{m.id}</span>
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                            isAllowed ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-600'
                          }`}>
                            {isAllowed ? '✓' : ''}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">{m.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Safety Toggles */}
              <div className="pt-2 space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-200 font-bold">Auto-freeze when monthly token quota exhausted</span>
                  <input
                    type="checkbox"
                    checked={quotaForm.autoFreezeOnExhaustion}
                    onChange={(e) => setQuotaForm(prev => ({ ...prev, autoFreezeOnExhaustion: e.target.checked }))}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-200 font-bold">Mandatory Human-In-The-Loop review before publishing</span>
                  <input
                    type="checkbox"
                    checked={quotaForm.requireHumanReview}
                    onChange={(e) => setQuotaForm(prev => ({ ...prev, requireHumanReview: e.target.checked }))}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => { playSfx('click'); setQuotaModalOperator(null); }}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuota}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                <Check className="w-4 h-4" /> Save Quota Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 9. MODAL 3: LIVE AI COPILOT PROMPT SANDBOX */}
      {/* ============================================================================ */}
      {isSandboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-950 border border-cyan-500/40 shadow-2xl p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => { playSfx('click'); setIsSandboxOpen(false); }}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Super Admin AI Copilot Prompt Sandbox
                </h3>
                <p className="text-xs text-slate-400">Simulate and test-fire live neural question generation with exact latency and cost calculations</p>
              </div>
            </div>

            {/* Sandbox Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase font-bold">Neural Engine:</label>
                <select
                  value={sandboxModel}
                  onChange={(e) => setSandboxModel(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (Fast MCQ)</option>
                  <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Deep STEM)</option>
                  <option value="Gemma 4 Edge">Gemma 4 Edge (Local)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase font-bold">Target Exam:</label>
                <select
                  value={sandboxExam}
                  onChange={(e) => setSandboxExam(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="UPSSSC PET 2026">UPSSSC PET 2026</option>
                  <option value="JEE Advanced 2027">JEE Advanced 2027</option>
                  <option value="NEET UG 2027">NEET UG 2027</option>
                  <option value="UPSC CSE 2027">UPSC CSE 2027</option>
                  <option value="CHS BHU Class 9">CHS BHU Class 9 Entrance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase font-bold">Subject / Topic:</label>
                <input
                  type="text"
                  value={sandboxTopic}
                  onChange={(e) => setSandboxTopic(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase font-bold">Difficulty Calibration:</label>
                <select
                  value={sandboxDifficulty}
                  onChange={(e) => setSandboxDifficulty(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="Standard">Standard Foundation</option>
                  <option value="Medium">Medium State Competitive</option>
                  <option value="Hard">Hard National Tier</option>
                  <option value="Olympiad">Olympiad / Extreme</option>
                </select>
              </div>
            </div>

            {/* Run Button */}
            <div className="pt-2">
              <button
                onClick={handleRunSandbox}
                disabled={sandboxGenerating}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
              >
                {sandboxGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-yellow-300" />
                    Synthesizing with {sandboxModel}...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    Trigger Neural Generation Simulation
                  </>
                )}
              </button>
            </div>

            {/* Simulated Output Card */}
            {sandboxOutput && (
              <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> AI Generation Success
                  </span>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>{sandboxOutput.tokens} tokens</span>
                    <span>&bull;</span>
                    <span className="text-cyan-300">{sandboxOutput.latency}ms</span>
                    <span>&bull;</span>
                    <span className="text-emerald-400">₹{sandboxOutput.cost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-bold text-white leading-relaxed">
                    {sandboxOutput.question}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {sandboxOutput.options.map((opt, i) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded-xl border ${
                          i === sandboxOutput.correct 
                            ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-bold' 
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="font-mono text-slate-500 mr-2">({String.fromCharCode(65 + i)})</span>
                        {opt}
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="font-mono text-cyan-400 font-bold block">Pedagogical Explanation:</span>
                    <p className="leading-relaxed">{sandboxOutput.explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 10. MODAL 4: PROMPT & COMPLETION AUDIT INSPECTOR */}
      {/* ============================================================================ */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-950 border border-cyan-500/40 shadow-2xl p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => { playSfx('click'); setInspectingLog(null); }}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Neural Prompt &amp; Completion Audit Trace
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {inspectingLog.operatorName} &bull; {inspectingLog.targetExam} &bull; {new Date(inspectingLog.timestamp).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Model Used: <strong className="text-white">{inspectingLog.modelUsed}</strong></span>
                <span className="text-purple-300">Total Tokens: <strong>{inspectingLog.tokens.total}</strong> (Prompt: {inspectingLog.tokens.prompt}, Comp: {inspectingLog.tokens.completion})</span>
                <span className="text-emerald-400">Latency: <strong>{inspectingLog.latencyMs}ms</strong></span>
              </div>

              <div className="space-y-1.5">
                <span className="text-cyan-400 font-bold uppercase block">Inbound Operator Prompt Snippet:</span>
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {inspectingLog.samplePromptSnippet}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-emerald-400 font-bold uppercase block">Synthesized AI Output:</span>
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {inspectingLog.sampleGeneratedSnippet}
                </div>
              </div>

              {inspectingLog.operatorEditSnippet && (
                <div className="space-y-1.5">
                  <span className="text-purple-400 font-bold uppercase block">Human Operator Verification &amp; Delta Modification:</span>
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/80 text-purple-200 leading-relaxed whitespace-pre-wrap">
                    {inspectingLog.operatorEditSnippet}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
                <span className="text-slate-400">Safety Guardrail Result: <strong className="text-emerald-400">{inspectingLog.guardrailResult}</strong></span>
                <span className="text-slate-400">Final Outcome: <strong className="text-cyan-300">{inspectingLog.status}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => { playSfx('click'); setInspectingLog(null); }}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
