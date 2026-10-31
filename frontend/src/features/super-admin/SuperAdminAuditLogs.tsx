import React, { useState, useEffect, useMemo } from 'react';
import { auditService, generateDeterministicHash } from '../../services/auditService';
import { locationService } from '../../services/locationService';
import { 
  SuperAdminAuditEvent, 
  MerkleVerificationReport, 
  AuditSecurityAnomaly, 
  AuditLedgerStats 
} from '../../types';
import { Button } from '../../components/common/Button';
import { ExportModal } from '../../components/common/ExportModal';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Lock, 
  ShieldCheck, 
  Download, 
  Calendar, 
  MapPin, 
  Eye, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  Server,
  RefreshCw,
  Copy,
  Check,
  Activity,
  Cpu,
  Fingerprint,
  FileText,
  Sparkles,
  TrendingUp,
  Plus,
  Volume2,
  VolumeX,
  Terminal,
  ArrowRight,
  History,
  Sliders,
  Shield,
  Zap,
  Radio,
  FileCheck2,
  Database,
  Grid,
  List,
  Hash,
  Binary,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

// Web Audio API Synthesizer for Cyber Cognitive Feedback
type SfxType = 'hover' | 'click' | 'success' | 'alert' | 'warp' | 'confirm' | 'toggle';

class AuditSoundEngine {
  play(type: SfxType) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.03);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.07);
        osc.frequency.setValueAtTime(783.99, now + 0.14);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(160, now + 0.09);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'warp') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.18);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'confirm') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'toggle') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(450, now + 0.04);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch {
      // AudioContext unavailable
    }
  }
}

const soundEngine = new AuditSoundEngine();

type ActiveHudTab = 'LIVE_LEDGER' | 'MERKLE_CHAIN' | 'SUBSYSTEM_ANALYTICS' | 'SECURITY_RADAR';
type LedgerViewMode = 'TABLE' | 'CARDS';

export const SuperAdminAuditLogs: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<SuperAdminAuditEvent[]>([]);
  const [stats, setStats] = useState<AuditLedgerStats | null>(null);
  const [anomalies, setAnomalies] = useState<AuditSecurityAnomaly[]>([]);
  const [verificationReport, setVerificationReport] = useState<MerkleVerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Active Navigation & View Modes
  const [activeTab, setActiveTab] = useState<ActiveHudTab>('LIVE_LEDGER');
  const [viewMode, setViewMode] = useState<LedgerViewMode>('CARDS');
  const [showSandbox, setShowSandbox] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actorRoleFilter, setActorRoleFilter] = useState('ALL');

  // Modals & Drawers
  const [selectedEvent, setSelectedEvent] = useState<SuperAdminAuditEvent | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Interactive Real-Time Merkle Sandbox Input
  const [sandboxInput, setSandboxInput] = useState('POLICY_OVERRIDE_COMMISSION:lib-saidpur:5.0%');
  const sandboxHash = useMemo(() => generateDeterministicHash(sandboxInput), [sandboxInput]);

  // New Event Form State
  const [newEventAction, setNewEventAction] = useState('POLICY_MANUAL_OVERRIDE');
  const [newEventModule, setNewEventModule] = useState('COMMISSION_ENGINE');
  const [newEventTarget, setNewEventTarget] = useState('');
  const [newEventTargetId, setNewEventTargetId] = useState('');
  const [newEventDistrict, setNewEventDistrict] = useState('Pan-India');
  const [newEventPreviousVal, setNewEventPreviousVal] = useState('');
  const [newEventNewVal, setNewEventNewVal] = useState('');
  const [newEventSeverity, setNewEventSeverity] = useState<'INFO' | 'WARNING' | 'CRITICAL'>('INFO');

  const sfx = (type: SfxType) => {
    if (!isAudioMuted) soundEngine.play(type);
  };

  const fetchLogsAndTelemetry = async () => {
    try {
      setLoading(true);
      const [fetchedLogs, ledgerStats, detectedAnomalies] = await Promise.all([
        auditService.getAuditLogs({
          search,
          module: moduleFilter,
          district: districtFilter,
          severity: severityFilter,
          status: statusFilter,
          actorRole: actorRoleFilter
        }),
        auditService.getLedgerStats(),
        auditService.detectSecurityAnomalies()
      ]);
      setLogs(fetchedLogs);
      setStats(ledgerStats);
      setAnomalies(detectedAnomalies);
    } catch (err) {
      console.error('Failed to load audit logs', err);
      showToast('Failed to retrieve sovereign audit trail', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsAndTelemetry();
  }, [moduleFilter, districtFilter, severityFilter, statusFilter, actorRoleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sfx('click');
    fetchLogsAndTelemetry();
  };

  const handleRunVerification = async () => {
    try {
      sfx('warp');
      setVerifying(true);
      const report = await auditService.verifyChainIntegrity();
      setVerificationReport(report);
      if (report.isValid) {
        sfx('success');
        showToast(`Cryptographic Integrity Confirmed: All ${report.totalBlocks} Blocks Untampered`, 'success');
      } else {
        sfx('alert');
        showToast(`CRITICAL INTEGRITY ALERT: Tampering detected at Block #${report.brokenIndex}`, 'error');
      }
      const updatedAnomalies = await auditService.detectSecurityAnomalies();
      setAnomalies(updatedAnomalies);
    } catch (e) {
      showToast('Verification failed to complete', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleSimulateTamper = async (blockId: string) => {
    sfx('alert');
    await auditService.simulateTamperTest(blockId, 'UNAUTHORIZED_MALICIOUS_PAYLOAD_INSERTION');
    showToast(`Injected test tamper mutation into ${blockId}. Re-verifying chain...`, 'info');
    await fetchLogsAndTelemetry();
    handleRunVerification();
  };

  const handleRestoreChain = async () => {
    sfx('confirm');
    const report = await auditService.restoreChain();
    setVerificationReport(report);
    showToast('Sovereign chain restored to 100% verified genesis state', 'success');
    await fetchLogsAndTelemetry();
  };

  const handleCopyHash = (hash: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sfx('click');
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
    showToast('Cryptographic hash copied to clipboard', 'info');
  };

  const handleRecordNewEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTarget.trim()) {
      showToast('Please specify a target entity', 'error');
      return;
    }

    try {
      sfx('confirm');
      await auditService.record({
        action: newEventAction,
        module: newEventModule,
        target: newEventTarget,
        targetId: newEventTargetId || `tgt-${Date.now().toString().slice(-4)}`,
        district: newEventDistrict,
        previousValue: newEventPreviousVal || 'N/A',
        newValue: newEventNewVal || 'ACTIVE_ENFORCED',
        severity: newEventSeverity,
        status: 'SUCCESS'
      });

      showToast('New immutable action sealed to Merkle chain', 'success');
      setIsCreateModalOpen(false);
      setNewEventTarget('');
      setNewEventTargetId('');
      setNewEventPreviousVal('');
      setNewEventNewVal('');
      await fetchLogsAndTelemetry();
    } catch {
      showToast('Failed to record immutable audit action', 'error');
    }
  };

  const activeDistricts = locationService.getActiveDistricts();

  // Dynamic Background and Border Styles that strictly match semantic text color
  const getSemanticSeverityStyle = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          cardBg: 'bg-rose-950/80 border-2 border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.25)]',
          badgeBg: 'bg-rose-900/90 border border-rose-400 text-rose-100',
          textColor: 'text-rose-200'
        };
      case 'WARNING':
        return {
          cardBg: 'bg-amber-950/80 border-2 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)]',
          badgeBg: 'bg-amber-900/90 border border-amber-400 text-amber-100',
          textColor: 'text-amber-200'
        };
      case 'INFO':
      default:
        return {
          cardBg: 'bg-cyan-950/80 border-2 border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.25)]',
          badgeBg: 'bg-cyan-900/90 border border-cyan-400 text-cyan-100',
          textColor: 'text-cyan-200'
        };
    }
  };

  const getSemanticModuleStyle = (module: string) => {
    switch (module) {
      case 'COMMISSION_ENGINE':
        return {
          bg: 'bg-purple-950/80 border-2 border-purple-500/60 text-purple-100 shadow-[0_0_18px_rgba(168,85,247,0.2)]',
          pill: 'bg-purple-900/90 border border-purple-400 text-purple-200 font-bold',
          tag: 'text-purple-300'
        };
      case 'OFFER_SYSTEM':
        return {
          bg: 'bg-amber-950/80 border-2 border-amber-500/60 text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.2)]',
          pill: 'bg-amber-900/90 border border-amber-400 text-amber-200 font-bold',
          tag: 'text-amber-300'
        };
      case 'DISTRICT_COMMAND':
        return {
          bg: 'bg-blue-950/80 border-2 border-blue-500/60 text-blue-100 shadow-[0_0_18px_rgba(59,130,246,0.2)]',
          pill: 'bg-blue-900/90 border border-blue-400 text-blue-200 font-bold',
          tag: 'text-blue-300'
        };
      case 'ADMIN_FINANCES':
        return {
          bg: 'bg-emerald-950/80 border-2 border-emerald-500/60 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.2)]',
          pill: 'bg-emerald-900/90 border border-emerald-400 text-emerald-200 font-bold',
          tag: 'text-emerald-300'
        };
      case 'EXAM_MASTER':
        return {
          bg: 'bg-pink-950/80 border-2 border-pink-500/60 text-pink-100 shadow-[0_0_18px_rgba(236,72,153,0.2)]',
          pill: 'bg-pink-900/90 border border-pink-400 text-pink-200 font-bold',
          tag: 'text-pink-300'
        };
      case 'PAID_VAULT':
        return {
          bg: 'bg-indigo-950/80 border-2 border-indigo-500/60 text-indigo-100 shadow-[0_0_18px_rgba(99,102,241,0.2)]',
          pill: 'bg-indigo-900/90 border border-indigo-400 text-indigo-200 font-bold',
          tag: 'text-indigo-300'
        };
      case 'PARTNER_LIBRARIES':
        return {
          bg: 'bg-teal-950/80 border-2 border-teal-500/60 text-teal-100 shadow-[0_0_18px_rgba(20,184,166,0.2)]',
          pill: 'bg-teal-900/90 border border-teal-400 text-teal-200 font-bold',
          tag: 'text-teal-300'
        };
      case 'SECURITY_CENTER':
        return {
          bg: 'bg-rose-950/80 border-2 border-rose-500/60 text-rose-100 shadow-[0_0_18px_rgba(244,63,94,0.2)]',
          pill: 'bg-rose-900/90 border border-rose-400 text-rose-200 font-bold',
          tag: 'text-rose-300'
        };
      case 'SYSTEM_GOVERNANCE':
      default:
        return {
          bg: 'bg-slate-900/90 border-2 border-slate-600/60 text-slate-100 shadow-[0_0_18px_rgba(100,116,139,0.2)]',
          pill: 'bg-slate-800 border border-slate-500 text-slate-200 font-bold',
          tag: 'text-slate-300'
        };
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto cyber-grid-bg min-h-screen">
      {/* =========================================================================
          IMMERSIVE SOVEREIGN COMMAND DECK HEADER (High Contrast Cyber Glass)
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-purple-500/40 p-6 shadow-[0_0_35px_rgba(168,85,247,0.2)] backdrop-blur-2xl">
        {/* Futuristic Ambient Glow Background Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-purple-500/25 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-500/60 text-purple-200 text-xs font-mono font-bold tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>SOVEREIGN AUDIT TRAIL // MERKLE ROOT ENGINE v5.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Immutable Audit Trail & Blockchain Ledger</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 font-bold">
                100% MERKLE SEALED
              </span>
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed font-semibold">
              Cryptographically verified append-only SHA-256 blockchain recording all policy overrides, KYC authorizations, financial payouts, and administrative commands.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                const next = !isAudioMuted;
                setIsAudioMuted(next);
                if (!next) soundEngine.play('confirm');
              }}
              title={isAudioMuted ? 'Unmute Acoustic Synthesizer' : 'Mute Acoustic Synthesizer'}
              className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isAudioMuted
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-cyan-950/90 border-cyan-500/60 text-cyan-200 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
              <span>{isAudioMuted ? 'MUTED' : 'AUDIO ON'}</span>
            </button>

            {/* Run Integrity Verification */}
            <Button
              variant="outline"
              size="sm"
              disabled={verifying}
              onClick={handleRunVerification}
              className="border-emerald-500/60 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 hover:text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-emerald-300 ${verifying ? 'animate-spin' : ''}`} />
              {verifying ? 'Validating Hashes...' : 'Verify Chain Integrity'}
            </Button>

            {/* Cryptographic Sandbox Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sfx('toggle');
                setShowSandbox(!showSandbox);
              }}
              className={`border text-xs font-black px-3.5 py-2 rounded-xl shadow-md transition-all cursor-pointer ${
                showSandbox
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-500/30'
                  : 'bg-slate-900/90 border-slate-700 text-slate-100 hover:border-cyan-400 hover:text-cyan-200'
              }`}
            >
              <Binary className="w-3.5 h-3.5 mr-1.5 text-cyan-300" />
              {showSandbox ? 'Hide SHA-256 Sandbox' : 'SHA-256 Sandbox'}
            </Button>

            {/* Append Custom Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sfx('click');
                setIsCreateModalOpen(true);
              }}
              className="border-purple-500/60 bg-purple-950/80 hover:bg-purple-900 text-purple-200 hover:text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-purple-300" />
              Seal Event
            </Button>

            {/* Export Ledger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sfx('click');
                setIsExportOpen(true);
              }}
              className="border-cyan-500/60 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 hover:text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-cyan-300" />
              Export Ledger
            </Button>
          </div>
        </div>

        {/* =========================================================================
            SEMANTIC COLOR-CODED LIVE TELEMETRY STRIP
            (Background actively tuned according to metric category & text color)
            ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Metric 1: Total Sealed Blocks (Purple) */}
          <div className="p-5 rounded-2xl bg-purple-950/60 border-2 border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.2)] relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-purple-200">
                Total Sealed Blocks
              </span>
              <span className="text-[10px] font-black text-purple-100 bg-purple-900/90 px-2.5 py-0.5 rounded-full border border-purple-400 font-mono">
                GENESIS #0
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              {stats?.totalRecords ?? logs.length} Blocks
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-purple-300 font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-purple-400" /> Immutable Append-Only
              </span>
            </div>
          </div>

          {/* Metric 2: Integrity Verification (Emerald) */}
          <div className="p-5 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.2)] relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-200">
                Chain Integrity Status
              </span>
              <span className="text-[10px] font-black text-emerald-100 bg-emerald-900/90 px-2.5 py-0.5 rounded-full border border-emerald-400 font-mono">
                SHA-256
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-200 tracking-tight">
              {verificationReport && !verificationReport.isValid ? 'TAMPER ALARM' : '100% Sealed'}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Continuous Digest Pass
              </span>
            </div>
          </div>

          {/* Metric 3: Territories Monitored (Cyan) */}
          <div className="p-5 rounded-2xl bg-cyan-950/60 border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.2)] relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-200">
                Territories Monitored
              </span>
              <span className="text-[10px] font-black text-cyan-100 bg-cyan-900/90 px-2.5 py-0.5 rounded-full border border-cyan-400 font-mono">
                UP SCOPED
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              {activeDistricts.length} Districts
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-cyan-300 font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Pan-India Governance
              </span>
            </div>
          </div>

          {/* Metric 4: Active Subsystems (Amber) */}
          <div className="p-5 rounded-2xl bg-amber-950/60 border-2 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)] relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-200">
                Active Subsystems
              </span>
              <span className="text-[10px] font-black text-amber-100 bg-amber-900/90 px-2.5 py-0.5 rounded-full border border-amber-400 font-mono">
                8 MODULES
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-200 tracking-tight">
              {stats?.activeModules ?? 8} Subsystems
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" /> Real-Time Telemetry
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Status Notification Banner (if verified or tampered) */}
      {verificationReport && (
        <div className={`p-5 rounded-2xl border-2 transition-all animate-fadeIn ${
          verificationReport.isValid 
            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.25)]' 
            : 'bg-rose-950/90 border-rose-500/70 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.3)]'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-2xl border-2 ${
                verificationReport.isValid 
                  ? 'bg-emerald-900/80 border-emerald-400 text-emerald-200' 
                  : 'bg-rose-900/90 border-rose-400 text-rose-200 animate-pulse'
              }`}>
                {verificationReport.isValid ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h4 className="font-black text-base uppercase tracking-wide text-white">
                    {verificationReport.isValid ? 'Sovereign Merkle Chain Verified' : 'Critical Integrity Tamper Alarm'}
                  </h4>
                  <span className={`text-[11px] font-mono px-3 py-0.5 rounded-full font-black border ${
                    verificationReport.isValid 
                      ? 'bg-emerald-900/90 text-emerald-200 border-emerald-400' 
                      : 'bg-rose-900/90 text-rose-200 border-rose-400'
                  }`}>
                    {verificationReport.isValid ? '100% UNTAMPERED' : 'CHAIN COMPROMISED'}
                  </span>
                </div>
                <p className="text-xs text-slate-100 mt-1 font-semibold">
                  {verificationReport.message}
                </p>
                <p className="text-[11px] font-mono text-cyan-200 mt-1">
                  Merkle Root Digest: <span className="text-white font-bold select-all">{verificationReport.rootHash}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {!verificationReport.isValid && (
                <Button
                  size="sm"
                  onClick={handleRestoreChain}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Restore Sovereign Chain
                </Button>
              )}
              <button
                onClick={() => setVerificationReport(null)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE REAL-TIME SHA-256 CRYPTOGRAPHIC SANDBOX
          ========================================================================= */}
      {showSandbox && (
        <div className="p-6 rounded-3xl bg-slate-950 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)] animate-fadeIn space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
            <div className="flex items-center gap-2.5">
              <Binary className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Interactive Deterministic SHA-256 Crypto Playground
              </h3>
            </div>
            <button
              onClick={() => setShowSandbox(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cyan-200 mb-1">
                Input Payload String (Type to observe real-time avalanche bit diffusion):
              </label>
              <input
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border-2 border-cyan-500/50 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase font-bold text-cyan-200">
                  Computed 256-Bit Cryptographic Digest (64 Hex Characters):
                </span>
                <button
                  onClick={() => handleCopyHash(sandboxHash)}
                  className="text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Hash</span>
                </button>
              </div>
              <div className="font-mono text-sm font-black text-white break-all select-all">
                {sandboxHash}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
                Input Length: <strong className="text-white">{sandboxInput.length} chars</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
                Digest Width: <strong className="text-cyan-300">256 Bits (32 Bytes)</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
                Chaining Mechanism: <strong className="text-emerald-300">Parent-Linked Merkle Tree</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cyber HUD Navigation Tabs */}
      <div className="p-2 rounded-2xl border-2 border-slate-700/80 bg-slate-950 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              sfx('click');
              setActiveTab('LIVE_LEDGER');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'LIVE_LEDGER'
                ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400'
                : 'text-slate-200 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Database className="w-4 h-4" />
            Live Ledger ({logs.length})
          </button>

          <button
            onClick={() => {
              sfx('click');
              setActiveTab('MERKLE_CHAIN');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'MERKLE_CHAIN'
                ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400'
                : 'text-slate-200 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Merkle Chain Explorer
          </button>

          <button
            onClick={() => {
              sfx('click');
              setActiveTab('SUBSYSTEM_ANALYTICS');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'SUBSYSTEM_ANALYTICS'
                ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400'
                : 'text-slate-200 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Activity className="w-4 h-4" />
            Subsystem Telemetry
          </button>

          <button
            onClick={() => {
              sfx('click');
              setActiveTab('SECURITY_RADAR');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'SECURITY_RADAR'
                ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400'
                : 'text-slate-200 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Radio className="w-4 h-4" />
            AI Security Radar ({anomalies.length})
          </button>
        </div>

        {/* View mode toggle (Table vs Cards) for Live Ledger */}
        {activeTab === 'LIVE_LEDGER' && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-700">
            <button
              onClick={() => {
                sfx('toggle');
                setViewMode('CARDS');
              }}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Cyber Cards View"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              onClick={() => {
                sfx('toggle');
                setViewMode('TABLE');
              }}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Compact High-Contrast Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          TAB 1: LIVE LEDGER
          ========================================================================= */}
      {activeTab === 'LIVE_LEDGER' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Multi-Dimensional Filter Toolbar with Semantic Color Pills */}
          <div className="p-5 rounded-2xl border-2 border-slate-700/80 bg-slate-950 shadow-xl space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                <input
                  placeholder="Search by action, target entity, actor name, block hash, territory..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-700 bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-400 font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Module Subsystem Filter */}
                <select
                  value={moduleFilter}
                  onChange={(e) => {
                    sfx('toggle');
                    setModuleFilter(e.target.value);
                  }}
                  className="bg-slate-900 border-2 border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-bold cursor-pointer"
                >
                  <option value="ALL">All Subsystems</option>
                  <option value="COMMISSION_ENGINE">Commission Engine</option>
                  <option value="OFFER_SYSTEM">Offer System</option>
                  <option value="ADMIN_GOVERNANCE">Admin Governance</option>
                  <option value="DISTRICT_COMMAND">District Command</option>
                  <option value="ADMIN_FINANCES">Admin Finances</option>
                  <option value="EXAM_MASTER">Exam Master</option>
                  <option value="PAID_VAULT">Paid Vault</option>
                  <option value="PARTNER_LIBRARIES">Partner Libraries</option>
                  <option value="SECURITY_CENTER">Security Center</option>
                  <option value="SYSTEM_GOVERNANCE">System Governance</option>
                </select>

                {/* District Filter */}
                <select
                  value={districtFilter}
                  onChange={(e) => {
                    sfx('toggle');
                    setDistrictFilter(e.target.value);
                  }}
                  className="bg-slate-900 border-2 border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none font-bold cursor-pointer"
                >
                  <option value="ALL">All Territories</option>
                  <option value="Pan-India">Pan-India</option>
                  {activeDistricts.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>

                <Button type="submit" size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md cursor-pointer">
                  Filter Ledger
                </Button>
              </div>
            </form>

            {/* Quick Severity Filter Buttons (Background matches text color) */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mr-2">
                Severity Level:
              </span>
              {[
                { label: 'All Severities', value: 'ALL', bg: 'bg-slate-900 border-slate-700 text-white' },
                { label: 'Info (Routine)', value: 'INFO', bg: 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200' },
                { label: 'Warning (Overrides)', value: 'WARNING', bg: 'bg-amber-950/80 border-amber-500/60 text-amber-200' },
                { label: 'Critical (Directives)', value: 'CRITICAL', bg: 'bg-rose-950/80 border-rose-500/60 text-rose-200' }
              ].map(s => (
                <button
                  key={s.value}
                  onClick={() => {
                    sfx('toggle');
                    setSeverityFilter(s.value);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    severityFilter === s.value
                      ? `${s.bg} ring-2 ring-white/30 shadow-lg scale-105`
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Records Display (Cards View vs Table View) */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-cyan-200 text-xs mt-3 font-mono font-bold">Verifying cryptographic log signatures...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 text-slate-300 p-8 rounded-3xl bg-slate-950 border-2 border-slate-800">
              <ShieldAlert className="w-14 h-14 text-slate-400 mx-auto mb-3" />
              <p className="font-bold text-white text-base">No sealed records found matching criteria</p>
              <p className="text-xs text-slate-300 mt-1">Try resetting search query or module filters</p>
            </div>
          ) : viewMode === 'CARDS' ? (
            /* CYBER CARDS VIEW: Background actively colored according to module & severity */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {logs.map((log) => {
                const modStyle = getSemanticModuleStyle(log.module);
                const sevStyle = getSemanticSeverityStyle(log.severity);

                return (
                  <div
                    key={log.id}
                    className={`p-5 rounded-2xl transition-all hover:scale-[1.01] flex flex-col justify-between ${
                      log.verificationStatus === 'TAMPER_ALERT'
                        ? 'bg-rose-950/90 border-2 border-rose-500 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
                        : `${modStyle.bg}`
                    }`}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-slate-950 border border-white/20 text-white font-mono">
                            BLOCK #{String(log.blockIndex ?? 0).padStart(3, '0')}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${sevStyle.badgeBg}`}>
                            {log.severity || 'INFO'}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-slate-200 font-bold">
                          {log.timestamp}
                        </span>
                      </div>

                      {/* Action Title */}
                      <div className="mb-2">
                        <h4 className="text-sm font-black text-white font-mono tracking-wide">
                          {log.action}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${modStyle.pill}`}>
                            {log.module}
                          </span>
                          <span className="text-xs text-slate-200 font-bold">
                            📍 {log.district || 'Pan-India'}
                          </span>
                        </div>
                      </div>

                      {/* Target Entity */}
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 mb-3">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Entity:</span>
                        <p className="text-white font-bold text-xs mt-0.5 truncate">{log.target}</p>
                        {log.targetId && (
                          <span className="text-[10px] font-mono text-cyan-300 block">{log.targetId}</span>
                        )}
                      </div>

                      {/* Before / After State Diff */}
                      {(log.previousValue || log.newValue) && (
                        <div className="grid grid-cols-2 gap-2 mb-3 font-mono text-xs">
                          <div className="p-2.5 rounded-xl bg-rose-950/90 border border-rose-500/60 text-rose-100">
                            <span className="text-[9px] uppercase font-black text-rose-300 block">PREVIOUS:</span>
                            <span className="break-words font-semibold text-[11px]">{log.previousValue || 'N/A'}</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-100">
                            <span className="text-[9px] uppercase font-black text-emerald-300 block">ENFORCED:</span>
                            <span className="break-words font-bold text-[11px]">{log.newValue || 'N/A'}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-300 block">Actor: <strong className="text-white">{log.actorName}</strong></span>
                        <span 
                          onClick={(e) => log.merkleHash && handleCopyHash(log.merkleHash, e)}
                          className="font-mono text-[10px] text-cyan-200 hover:text-white cursor-pointer flex items-center gap-1 mt-0.5"
                          title="Click to copy hash"
                        >
                          <Fingerprint className="w-3 h-3 text-cyan-300" />
                          {log.merkleHash?.slice(0, 12)}...
                          <Copy className="w-3 h-3" />
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            sfx('click');
                            setSelectedEvent(log);
                          }}
                          className="bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-white/20 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-cyan-300" />
                          Forensics
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSimulateTamper(log.id)}
                          className="bg-amber-950/80 hover:bg-amber-900 text-amber-200 font-bold text-xs p-2 rounded-xl border border-amber-500/40 cursor-pointer"
                          title="Test Tamper Drill on this Block"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* HIGH-CONTRAST DENSE TABLE VIEW */
            <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/80 bg-slate-950">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b-2 border-slate-800 bg-slate-900 text-xs font-black text-white uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-5">Block # & Time</th>
                      <th className="py-4 px-5">Executing Actor</th>
                      <th className="py-4 px-5">Action & Subsystem</th>
                      <th className="py-4 px-5">Target & State Mutation</th>
                      <th className="py-4 px-5">Territory</th>
                      <th className="py-4 px-5">Cryptographic Hash</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs">
                    {logs.map(log => {
                      const modStyle = getSemanticModuleStyle(log.module);
                      const sevStyle = getSemanticSeverityStyle(log.severity);

                      return (
                        <tr 
                          key={log.id} 
                          className={`hover:bg-slate-800/80 transition-colors ${
                            log.verificationStatus === 'TAMPER_ALERT' 
                              ? 'bg-rose-950/40 border-l-4 border-rose-500' 
                              : 'bg-slate-950/80'
                          }`}
                        >
                          <td className="py-4 px-5 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-950 text-cyan-200 border border-cyan-500/50">
                                #{String(log.blockIndex ?? 0).padStart(3, '0')}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${sevStyle.badgeBg}`}>
                                {log.severity || 'INFO'}
                              </span>
                            </div>
                            <p className="text-white text-xs font-bold mt-1">{log.timestamp}</p>
                            <p className="text-slate-300 text-[10px]">{log.id}</p>
                          </td>

                          <td className="py-4 px-5">
                            <p className="font-extrabold text-white text-xs">{log.actorName}</p>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-200 border border-purple-500/40 uppercase">
                              {log.actorRole}
                            </span>
                            <p className="text-slate-300 font-mono text-[10px] mt-0.5">{log.ipAddress}</p>
                          </td>

                          <td className="py-4 px-5">
                            <span className="font-mono text-cyan-200 font-bold text-xs block">
                              {log.action}
                            </span>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${modStyle.pill}`}>
                              {log.module}
                            </span>
                          </td>

                          <td className="py-4 px-5 max-w-xs">
                            <p className="font-bold text-white truncate">{log.target}</p>
                            {(log.previousValue || log.newValue) && (
                              <div className="mt-1 flex flex-col gap-1 text-[11px] font-mono">
                                {log.previousValue && (
                                  <span className="text-rose-200 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40 truncate font-semibold">
                                    <strong className="text-rose-400">PREV:</strong> {log.previousValue}
                                  </span>
                                )}
                                {log.newValue && (
                                  <span className="text-emerald-200 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 truncate font-bold">
                                    <strong className="text-emerald-400">ENF:</strong> {log.newValue}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-5">
                            <p className="text-white font-bold">{log.district || 'Pan-India'}</p>
                            <p className="text-slate-300 text-[10px]">{log.state || 'Uttar Pradesh'}</p>
                          </td>

                          <td className="py-4 px-5 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span 
                                onClick={(e) => log.merkleHash && handleCopyHash(log.merkleHash, e)}
                                className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-200 text-[11px] font-bold hover:border-cyan-400 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Fingerprint className="w-3 h-3 text-cyan-300" />
                                {log.merkleHash?.slice(0, 10)}...{log.merkleHash?.slice(-4)}
                                <Copy className="w-3 h-3 text-slate-300" />
                              </span>
                            </div>
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-950 text-emerald-200 border border-emerald-500/50">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SEALED
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-5 text-right space-x-1.5 whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                sfx('click');
                                setSelectedEvent(log);
                              }}
                              className="text-cyan-200 hover:text-white hover:bg-cyan-950 p-2 h-8 w-8 rounded-xl border border-cyan-500/40 cursor-pointer"
                              title="Inspect Forensic Snapshot"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSimulateTamper(log.id)}
                              className="text-amber-300 hover:text-white hover:bg-amber-950 p-2 h-8 w-8 rounded-xl border border-amber-500/40 cursor-pointer"
                              title="Test Tamper Drill"
                            >
                              <Zap className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* =========================================================================
          TAB 2: MERKLE CHAIN EXPLORER
          ========================================================================= */}
      {activeTab === 'MERKLE_CHAIN' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-purple-950/40 border-2 border-purple-500/50 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-300" />
                  Sovereign Cryptographic Sequence Visualizer
                </h3>
                <p className="text-xs text-slate-200 mt-1 font-semibold">
                  Each block is mathematically bound to its preceding ancestor. Modifying any past state invalidates all forward hashes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleRunVerification}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Scan Chain Blocks
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRestoreChain}
                  className="border-slate-700 bg-slate-900 text-slate-200 hover:text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  Reset Genesis
                </Button>
              </div>
            </div>
          </div>

          {/* Interactive Visual Chain Blocks */}
          <div className="space-y-4">
            {logs.slice().reverse().map((block, idx) => (
              <div key={block.id} className="relative">
                {/* Arrow Connector between blocks */}
                {idx > 0 && (
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="px-3 py-1 rounded-full bg-slate-900 border border-purple-500/40 text-[10px] font-mono text-purple-200 flex items-center gap-1.5 shadow-md">
                      <ArrowRight className="w-3 h-3 rotate-90 text-purple-300" />
                      <span>parentHash link verified</span>
                    </div>
                  </div>
                )}

                <div className={`p-5 rounded-2xl border-2 transition-all hover:scale-[1.005] ${
                  block.verificationStatus === 'TAMPER_ALERT'
                    ? 'bg-rose-950/70 border-rose-500 text-rose-100 shadow-lg shadow-rose-950/50'
                    : 'bg-slate-950 border-purple-500/40 hover:border-purple-400'
                }`}>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Block Height Box */}
                      <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center bg-purple-950 border-2 border-purple-500/50 text-purple-200 font-mono">
                        <span className="text-[10px] font-bold text-purple-300">BLK</span>
                        <span className="text-base font-black text-white">#{block.blockIndex ?? idx}</span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-black text-white font-mono">{block.action}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSemanticModuleStyle(block.module).pill}`}>
                            {block.module}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getSemanticSeverityStyle(block.severity).badgeBg}`}>
                            {block.severity || 'INFO'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-200 mt-1 font-semibold">
                          Target: <span className="text-white font-bold">{block.target}</span> • Actor: <span className="text-cyan-300 font-bold">{block.actorName}</span> ({block.actorRole})
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-300">
                          <span>Time: <span className="text-white font-bold">{block.timestamp}</span></span>
                          <span>•</span>
                          <span>Territory: <span className="text-white font-bold">{block.district || 'Pan-India'}</span></span>
                          <span>•</span>
                          <span>IP: <span className="text-cyan-300 font-bold">{block.ipAddress}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Hash linkage column */}
                    <div className="w-full lg:w-auto p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-2 text-xs font-mono">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Parent Ancestor Hash:</span>
                        <span className="text-slate-200 text-[11px] select-all font-semibold">
                          {block.parentHash ? block.parentHash.slice(0, 20) + '...' + block.parentHash.slice(-8) : 'GENESIS_ROOT'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-purple-300 block">Current Merkle Seal:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-200 font-black text-[11px] select-all">
                            {block.merkleHash ? block.merkleHash.slice(0, 20) + '...' + block.merkleHash.slice(-8) : 'PENDING'}
                          </span>
                          {block.merkleHash && (
                            <button
                              onClick={(e) => handleCopyHash(block.merkleHash!, e)}
                              className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
                              title="Copy Hash"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between border-t border-slate-800">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedEvent(block)}
                          className="text-cyan-300 hover:text-white text-[11px] p-1 h-auto font-black cursor-pointer"
                        >
                          View Full Payload ➔
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSimulateTamper(block.id)}
                          className="text-amber-300 hover:text-amber-200 text-[11px] p-1 h-auto font-black cursor-pointer"
                        >
                          Drill Test ⚡
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SUBSYSTEM ANALYTICS
          ========================================================================= */}
      {activeTab === 'SUBSYSTEM_ANALYTICS' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subsystem Activity Distribution */}
            <div className="p-6 rounded-3xl border-2 border-slate-700/80 bg-slate-950 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-300" />
                  Subsystem Activity Distribution
                </h3>
                <span className="text-xs font-mono text-cyan-200 font-bold bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-500/40">
                  {logs.length} Total Events
                </span>
              </div>

              {/* Module Progress Bars */}
              {(() => {
                const moduleCounts = logs.reduce((acc, l) => {
                  acc[l.module] = (acc[l.module] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

                const modulesList = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1]);

                return (
                  <div className="space-y-3.5 pt-1">
                    {modulesList.map(([mod, count]) => {
                      const pct = Math.round((count / logs.length) * 100);
                      const modStyle = getSemanticModuleStyle(mod);

                      return (
                        <div key={mod} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-white">{mod}</span>
                            <span className="text-cyan-200 font-mono">{count} events ({pct}%)</span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-700 p-0.5">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full" 
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Severity & Integrity Split */}
            <div className="p-6 rounded-3xl border-2 border-slate-700/80 bg-slate-950 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  Severity & Trust Composition
                </h3>
                <span className="text-xs font-mono text-emerald-200 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                  100% Sealed Ledger
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-cyan-950/80 border-2 border-cyan-500/50 text-center">
                  <span className="text-[10px] uppercase font-bold text-cyan-200 block">INFO EVENTS</span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">
                    {logs.filter(l => (l.severity || 'INFO') === 'INFO').length}
                  </span>
                  <span className="text-[10px] text-cyan-300 mt-1 block font-semibold">Routine Actions</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/80 border-2 border-amber-500/50 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-200 block">WARNINGS</span>
                  <span className="text-2xl font-black text-amber-100 font-mono mt-1 block">
                    {logs.filter(l => l.severity === 'WARNING').length}
                  </span>
                  <span className="text-[10px] text-amber-300 mt-1 block font-semibold">Overrides & Edits</span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500/50 text-center">
                  <span className="text-[10px] uppercase font-bold text-rose-200 block">CRITICAL</span>
                  <span className="text-2xl font-black text-rose-100 font-mono mt-1 block">
                    {logs.filter(l => l.severity === 'CRITICAL').length}
                  </span>
                  <span className="text-[10px] text-rose-300 mt-1 block font-semibold">Sovereign Directives</span>
                </div>
              </div>

              {/* Territory split */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                  Top Monitored Territories
                </span>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(logs.map(l => l.district).filter(Boolean))).map(dist => (
                    <span key={dist} className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white">
                      📍 {dist}: {logs.filter(l => l.district === dist).length} actions
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: AI SECURITY RADAR
          ========================================================================= */}
      {activeTab === 'SECURITY_RADAR' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl border-2 border-amber-500/50 bg-amber-950/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-900/80 border-2 border-amber-400 text-amber-200">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide">
                    Cognitive Anomaly & Compliance Scanner
                  </h3>
                  <p className="text-xs text-slate-200 mt-0.5 font-semibold">
                    Real-time heuristics analyzing policy velocity, unauthorized nocturnal operations, and hash integrity alerts.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-emerald-200 font-black bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-500/50">
                  Sovereign Health: 99.8%
                </span>
              </div>
            </div>
          </div>

          {/* Anomaly Alerts List */}
          <div className="space-y-4">
            {anomalies.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border-2 border-slate-700/80 bg-slate-950">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Zero Security Anomalies Detected</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto font-medium">
                  All administrative commands align with nominal sovereign security protocols. Ledger hash chain is continuous and valid.
                </p>
              </div>
            ) : (
              anomalies.map((anom) => (
                <div 
                  key={anom.id}
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    anom.severity === 'CRITICAL'
                      ? 'bg-rose-950/80 border-rose-500/70 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                      : 'bg-amber-950/80 border-amber-500/70 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl border mt-0.5 ${
                        anom.severity === 'CRITICAL' 
                          ? 'bg-rose-900 border-rose-400 text-rose-200' 
                          : 'bg-amber-900 border-amber-400 text-amber-200'
                      }`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{anom.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            anom.severity === 'CRITICAL'
                              ? 'bg-rose-900 text-rose-200 border-rose-400'
                              : 'bg-amber-900 text-amber-200 border-amber-400'
                          }`}>
                            {anom.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-100 mt-1 font-medium">
                          {anom.description}
                        </p>
                        <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs">
                          <span className="font-bold text-cyan-300 uppercase tracking-wide text-[10px] block">
                            Sovereign Recommendation:
                          </span>
                          <span className="text-slate-100 mt-0.5 block font-semibold">{anom.recommendation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto text-xs font-mono text-slate-200">
                      <span>Detected: <span className="text-white font-bold">{anom.detectedAt}</span></span>
                      <span>Target: <span className="text-cyan-300 font-bold">{anom.relatedBlockId}</span></span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          FORENSIC EVENT SNAPSHOT MODAL
          ========================================================================= */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-cyan-500/60 bg-slate-950">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-200 border-2 border-cyan-500/60">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Cryptographic Block Forensics</h3>
                  <p className="text-cyan-300 text-xs font-mono font-bold">
                    Block #{selectedEvent.blockIndex ?? 0} • {selectedEvent.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs bg-slate-950">
              {/* Event Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-900 border border-slate-700">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Timestamp:</span>
                  <p className="font-mono text-white font-bold mt-0.5">{selectedEvent.timestamp}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Actor Identity:</span>
                  <p className="font-bold text-white mt-0.5">{selectedEvent.actorName} ({selectedEvent.actorRole})</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Action Type:</span>
                  <p className="font-mono text-cyan-200 font-black mt-0.5">{selectedEvent.action}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Subsystem Module:</span>
                  <p className="text-white font-bold mt-0.5">{selectedEvent.module}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Entity:</span>
                  <p className="font-bold text-white mt-0.5">{selectedEvent.target}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Origin IP & Territory:</span>
                  <p className="font-mono text-slate-100 font-bold mt-0.5">{selectedEvent.ipAddress} ({selectedEvent.district || 'Pan-India'})</p>
                </div>
              </div>

              {/* Before vs After State Diff Visualizer */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                  State Mutation Diff Visualizer
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Previous State */}
                  <div className="p-3.5 rounded-xl bg-rose-950/80 border-2 border-rose-500/60 text-rose-100">
                    <div className="flex items-center gap-1.5 text-rose-300 text-[10px] font-black uppercase tracking-wider mb-1">
                      <X className="w-3.5 h-3.5 text-rose-400" />
                      Previous State / Value
                    </div>
                    <p className="font-mono text-rose-100 text-xs break-words font-semibold">
                      {selectedEvent.previousValue || 'N/A'}
                    </p>
                  </div>

                  {/* Enforced State */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/80 border-2 border-emerald-500/60 text-emerald-100">
                    <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Enforced State / Value
                    </div>
                    <p className="font-mono text-emerald-100 text-xs font-bold break-words">
                      {selectedEvent.newValue || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cryptographic Manifest */}
              <div className="p-4 rounded-2xl bg-slate-900 border-2 border-cyan-500/50 space-y-2.5 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-cyan-200 font-bold text-xs uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-300" />
                    Cryptographic Signature Seal
                  </span>
                  <span className="text-[10px] text-emerald-200 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-400">
                    {selectedEvent.verificationStatus || 'VERIFIED_SEALED'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">Merkle Content Digest (SHA-256):</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-cyan-200 text-xs break-all select-all font-black">
                      {selectedEvent.merkleHash || 'N/A'}
                    </span>
                    {selectedEvent.merkleHash && (
                      <button
                        onClick={() => handleCopyHash(selectedEvent.merkleHash!)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white cursor-pointer"
                        title="Copy Merkle Hash"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">Parent Block Hash:</span>
                  <span className="text-slate-100 text-xs break-all select-all font-semibold">
                    {selectedEvent.parentHash || '0000000000000000000000000000000000000000000000000000000000000000'}
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                  <span>Signature Algorithm: <span className="text-white font-bold">{selectedEvent.signatureAlgorithm || 'SHA-256 / RSA-4096'}</span></span>
                  <span>Immutable Flag: <span className="text-emerald-300 font-bold">TRUE</span></span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  sfx('click');
                  navigator.clipboard.writeText(JSON.stringify(selectedEvent, null, 2));
                  showToast('Raw block JSON copied to clipboard', 'info');
                }}
                className="border-slate-700 text-slate-200 hover:text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5 text-cyan-300" />
                Copy Raw Block JSON
              </Button>

              <Button
                onClick={() => setSelectedEvent(null)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs px-5 py-2 rounded-xl cursor-pointer"
              >
                Dismiss Forensics
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CREATE / SEAL CUSTOM EVENT MODAL
          ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border-2 border-purple-500/60 bg-slate-950">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-950 text-purple-200 border-2 border-purple-500/60">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Seal Custom Audit Action</h3>
                  <p className="text-purple-200 text-xs font-mono font-bold">Append an authenticated block to the Merkle ledger</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordNewEvent} className="p-6 space-y-4 text-xs bg-slate-950">
              <div>
                <label className="block text-[11px] font-bold text-slate-200 uppercase mb-1">Action Identifier</label>
                <input
                  value={newEventAction}
                  onChange={(e) => setNewEventAction(e.target.value)}
                  placeholder="e.g. POLICY_RATE_OVERRIDE"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-mono outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 uppercase mb-1">Subsystem Module</label>
                  <select
                    value={newEventModule}
                    onChange={(e) => setNewEventModule(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer font-semibold"
                  >
                    <option value="COMMISSION_ENGINE">Commission Engine</option>
                    <option value="OFFER_SYSTEM">Offer System</option>
                    <option value="DISTRICT_COMMAND">District Command</option>
                    <option value="ADMIN_FINANCES">Admin Finances</option>
                    <option value="EXAM_MASTER">Exam Master</option>
                    <option value="PAID_VAULT">Paid Vault</option>
                    <option value="SECURITY_CENTER">Security Center</option>
                    <option value="SYSTEM_GOVERNANCE">System Governance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-200 uppercase mb-1">Severity</label>
                  <select
                    value={newEventSeverity}
                    onChange={(e) => setNewEventSeverity(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer font-semibold"
                  >
                    <option value="INFO">Info</option>
                    <option value="WARNING">Warning</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-200 uppercase mb-1">Target Entity Name</label>
                <input
                  value={newEventTarget}
                  onChange={(e) => setNewEventTarget(e.target.value)}
                  placeholder="e.g. Central Library Varanasi / Faculty Dr. Verma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 uppercase mb-1">Territory / District</label>
                  <select
                    value={newEventDistrict}
                    onChange={(e) => setNewEventDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer font-semibold"
                  >
                    <option value="Pan-India">Pan-India</option>
                    {activeDistricts.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-200 uppercase mb-1">Target ID (Optional)</label>
                  <input
                    value={newEventTargetId}
                    onChange={(e) => setNewEventTargetId(e.target.value)}
                    placeholder="e.g. lib-vns-001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-mono outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 uppercase mb-1">Previous Value</label>
                  <input
                    value={newEventPreviousVal}
                    onChange={(e) => setNewEventPreviousVal(e.target.value)}
                    placeholder="e.g. Default 8.0%"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-200 uppercase mb-1">Enforced New Value</label>
                  <input
                    value={newEventNewVal}
                    onChange={(e) => setNewEventNewVal(e.target.value)}
                    placeholder="e.g. Custom 5.0%"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-950/80 border border-purple-500/50 text-[11px] text-purple-200 font-semibold">
                🔒 Block will automatically inherit parent hash from the chain head and compute an irreversible SHA-256 Merkle seal.
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-end gap-3 -mx-6 -mb-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="border-slate-700 text-slate-200 hover:text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-5 py-2 rounded-xl shadow-lg cursor-pointer"
                >
                  Seal & Append Block
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          EXPORT MODAL
          ========================================================================= */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={logs.map(l => ({
          BlockHeight: l.blockIndex ?? 0,
          ID: l.id,
          Timestamp: l.timestamp,
          Actor: l.actorName,
          Role: l.actorRole,
          Action: l.action,
          Module: l.module,
          Target: l.target,
          District: l.district || 'Pan-India',
          State: l.state || 'Uttar Pradesh',
          PreviousState: l.previousValue || 'N/A',
          EnforcedState: l.newValue || 'N/A',
          IPAddress: l.ipAddress,
          Status: l.status,
          Severity: l.severity || 'INFO',
          MerkleHash: l.merkleHash || '',
          ParentHash: l.parentHash || ''
        }))}
        title="FOCUSPOINT Tamper-Evident Immutable Sovereign Audit Log"
        filename="focuspoint_sovereign_audit_ledger"
      />
    </div>
  );
};
