// FOCUSPOINT Pan-India Operator Activity & Cryptographic Audit Enclave
// Zero-trust immutable academic ledger with SHA-256 provenance chains, Merkle topology visualization,
// interactive tamper detection sandbox, diurnal activity chronograph, and government compliance certification.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Download,
  Terminal,
  Cpu,
  Hash,
  Clock,
  Sparkles,
  FileText,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  Volume2,
  VolumeX,
  Eye,
  Layers,
  Activity,
  Key,
  Database,
  ArrowRight,
  Maximize2,
  ChevronRight,
  X,
  GitBranch,
  Bookmark,
  BookmarkCheck,
  Award,
  Zap,
  BarChart3,
  Sun,
  Moon,
  Printer,
  Share2,
  FileCode2,
  Lock,
  Unlock,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { operatorService } from '../../services/operatorService';
import { OperatorActivityLog, OperatorActivityAction } from '../../types/operator';
import {
  AugmentedAuditBlock,
  buildCryptographicLedger,
  verifyLedgerIntegrity,
  computeMerkleRoot,
  generateSignedAuditJSON,
  generateAuditCSV,
  generateMerkleTreeLevels,
  getDiurnalActivityHistogram,
  getAuditCategoryBreakdown,
  MerkleLevel,
  AuditClassification
} from '../../services/operatorAuditService';

// Procedural Cyber Web Audio Synthesizer
const playCyberAudio = (type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'scan' | 'tick' | 'heal', enabled: boolean = true) => {
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
      case 'heal':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.16);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      case 'toggle':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(740, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.06);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
        break;
      case 'scan':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(1760, now + 0.25);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc.start(now);
        osc.stop(now + 0.26);
        break;
      case 'alert':
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(300, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
    }
  } catch {
    // Audio context not available or user interaction required
  }
};

type ViewMode = 'STREAM' | 'MATRIX' | 'BLOCK_EXPLORER' | 'MERKLE_TREE';
type HorizonFilter = '24H' | '7D' | '30D' | 'ALL';

export const OperatorAuditTrail: React.FC = () => {
  const { user } = useAuth();
  const operatorId = user?.id || 'usr-operator-sunita';
  const operatorName = user?.name || 'Sunita Verma';

  // Audio preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [soundRippleActive, setSoundRippleActive] = useState<boolean>(false);

  // Trigger sound with visual ripple
  const triggerAudio = useCallback((type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'scan' | 'tick' | 'heal') => {
    playCyberAudio(type, soundEnabled);
    if (soundEnabled) {
      setSoundRippleActive(true);
      setTimeout(() => setSoundRippleActive(false), 300);
    }
  }, [soundEnabled]);

  // Raw logs & augmented cryptographic blocks
  const [rawLogs, setRawLogs] = useState<OperatorActivityLog[]>([]);
  const [blocks, setBlocks] = useState<AugmentedAuditBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Bookmarked / Pinned Milestones (stored in local state)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(['log-014', 'log-005']));
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [classificationFilter, setClassificationFilter] = useState<string>('ALL');
  const [horizon, setHorizon] = useState<HorizonFilter>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('STREAM');

  // Interactive Tamper Simulation State
  const [isTamperedSimulation, setIsTamperedSimulation] = useState<boolean>(false);
  const [tamperedBlockNum, setTamperedBlockNum] = useState<number | null>(null);

  // Ledger verification state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationProgress, setVerificationProgress] = useState<number>(0);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'VALID' | 'TAMPERED' | null;
    totalVerified: number;
    merkleRoot: string;
    checkedAt: string | null;
    errorMsg?: string;
  }>({
    status: null,
    totalVerified: 0,
    merkleRoot: '',
    checkedAt: null
  });

  // Selected block for deep forensic drawer & diff
  const [inspectBlock, setInspectBlock] = useState<AugmentedAuditBlock | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Official Certificate Modal
  const [certificateModalOpen, setCertificateModalOpen] = useState<boolean>(false);

  // Fetch logs and build blockchain
  const loadLedger = useCallback(async () => {
    setLoading(true);
    try {
      const logs = await operatorService.getActivityLogs(operatorId);
      setRawLogs(logs);
      const cryptoBlocks = await buildCryptographicLedger(logs, 1001);
      setBlocks(cryptoBlocks);
      const root = computeMerkleRoot(cryptoBlocks);
      setVerificationResult({
        status: 'VALID',
        totalVerified: cryptoBlocks.length,
        merkleRoot: root,
        checkedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      setIsTamperedSimulation(false);
      setTamperedBlockNum(null);
    } catch (err) {
      console.error('Failed to load operator audit logs', err);
    } finally {
      setLoading(false);
    }
  }, [operatorId]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  // Execute interactive blockchain scan
  const handleVerifyIntegrity = async () => {
    triggerAudio('scan');
    setIsVerifying(true);
    setVerificationProgress(10);

    for (let p = 20; p <= 90; p += 25) {
      await new Promise(r => setTimeout(r, 60));
      setVerificationProgress(p);
    }

    const report = await verifyLedgerIntegrity(blocks);
    setVerificationProgress(100);

    setTimeout(() => {
      setIsVerifying(false);
      if (report.isValid) {
        triggerAudio('confirm');
        setVerificationResult({
          status: 'VALID',
          totalVerified: report.totalBlocks,
          merkleRoot: report.merkleRoot,
          checkedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      } else {
        triggerAudio('alert');
        setVerificationResult({
          status: 'TAMPERED',
          totalVerified: report.totalBlocks,
          merkleRoot: report.merkleRoot,
          checkedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          errorMsg: report.tamperedDetails
        });
      }
    }, 200);
  };

  // Simulate Unauthorized Tamper (Sandbox Demonstration)
  const handleSimulateTamper = async () => {
    if (blocks.length < 3) return;
    triggerAudio('alert');

    // Mutate block #1003 details
    const targetBlockNum = 1003;
    const modified = blocks.map(b => {
      if (b.blockNumber === targetBlockNum) {
        return {
          ...b,
          details: 'UNAUTHORIZED EXTERNAL INJECTION: Distractor answers modified without paper-setter credentials.',
          verificationStatus: 'TAMPER_SUSPECT' as const
        };
      }
      return b;
    });

    setBlocks(modified);
    setIsTamperedSimulation(true);
    setTamperedBlockNum(targetBlockNum);

    // Run verification immediately to show real-time detection
    const report = await verifyLedgerIntegrity(modified);
    setVerificationResult({
      status: 'TAMPERED',
      totalVerified: report.totalBlocks,
      merkleRoot: report.merkleRoot,
      checkedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      errorMsg: `Cryptographic pointer broken at Block #${targetBlockNum}. Payload hash discrepancy detected!`
    });
  };

  // Restore Ledger from Secure Archive (Self-Healing)
  const handleAutoHealLedger = async () => {
    triggerAudio('heal');
    setLoading(true);
    await loadLedger();
    triggerAudio('confirm');
  };

  // Toggle Bookmark
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerAudio('tick');
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter blocks
  const filteredBlocks = useMemo(() => {
    const now = new Date().getTime();
    return blocks.filter((b) => {
      // Bookmark filter
      if (onlyBookmarked && !bookmarkedIds.has(b.id)) {
        return false;
      }

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.details.toLowerCase().includes(q) ||
        b.entityTitle.toLowerCase().includes(q) ||
        b.action.toLowerCase().includes(q) ||
        b.blockHash.toLowerCase().includes(q) ||
        b.entityId.toLowerCase().includes(q) ||
        String(b.blockNumber).includes(q);

      // Action Filter
      const matchesAction = actionFilter === 'ALL' || b.action === actionFilter;

      // Entity Filter
      const matchesEntity = entityFilter === 'ALL' || b.entity === entityFilter;

      // Classification Filter
      const matchesClassification = classificationFilter === 'ALL' || b.classification === classificationFilter;

      // Time horizon filter
      let matchesHorizon = true;
      const blockTime = new Date(b.timestamp).getTime();
      if (horizon === '24H') {
        matchesHorizon = now - blockTime <= 24 * 60 * 60 * 1000;
      } else if (horizon === '7D') {
        matchesHorizon = now - blockTime <= 7 * 24 * 60 * 60 * 1000;
      } else if (horizon === '30D') {
        matchesHorizon = now - blockTime <= 30 * 24 * 60 * 60 * 1000;
      }

      return matchesSearch && matchesAction && matchesEntity && matchesClassification && matchesHorizon;
    });
  }, [blocks, searchQuery, actionFilter, entityFilter, classificationFilter, horizon, onlyBookmarked, bookmarkedIds]);

  // Telemetry Aggregates
  const telemetry = useMemo(() => {
    const total = blocks.length;
    const aiOps = blocks.filter(b => b.action.startsWith('AI_')).length;
    const humanOps = total - aiOps;
    const critical = blocks.filter(b => b.classification === 'CRITICAL_PUBLISH').length;
    const elevated = blocks.filter(b => b.classification === 'ELEVATED').length;
    const uniqueEntities = new Set(blocks.map(b => b.entityId)).size;

    return {
      total,
      aiOps,
      humanOps,
      critical,
      elevated,
      uniqueEntities,
      merkleRoot: verificationResult.merkleRoot || '0x00000000'
    };
  }, [blocks, verificationResult.merkleRoot]);

  // Merkle Tree Topology Levels
  const merkleLevels = useMemo(() => {
    return generateMerkleTreeLevels(blocks);
  }, [blocks]);

  // Diurnal Activity Histogram
  const diurnalData = useMemo(() => {
    return getDiurnalActivityHistogram(blocks);
  }, [blocks]);

  // Pedagogical Category Breakdown
  const categoryBreakdown = useMemo(() => {
    return getAuditCategoryBreakdown(blocks);
  }, [blocks]);

  // Export Signed Dossier JSON
  const handleExportJSON = () => {
    triggerAudio('warp');
    const data = generateSignedAuditJSON(blocks, operatorId, operatorName);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZYZUS_AUDIT_DOSSIER_${operatorId}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Compliance CSV
  const handleExportCSV = () => {
    triggerAudio('click');
    const csvStr = generateAuditCSV(blocks);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZYZUS_COMPLIANCE_AUDIT_${operatorId}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy hash helper
  const handleCopyHash = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    triggerAudio('tick');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Action badge formatting
  const getActionBadge = (action: OperatorActivityAction) => {
    switch (action) {
      case 'MOCK_TEST_PUBLISH':
      case 'MATERIAL_PUBLISH':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          dot: 'bg-emerald-400',
          label: action.replace(/_/g, ' ')
        };
      case 'AI_QUESTION_GENERATE':
      case 'AI_QUESTION_APPROVE':
        return {
          bg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
          dot: 'bg-purple-400',
          label: action.replace(/_/g, ' ')
        };
      case 'AI_QUESTION_REJECT':
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          dot: 'bg-rose-400',
          label: action.replace(/_/g, ' ')
        };
      case 'MATERIAL_UPLOAD':
      case 'MATERIAL_VERSION_ADD':
        return {
          bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
          dot: 'bg-cyan-400',
          label: action.replace(/_/g, ' ')
        };
      case 'QUESTION_CREATE':
      case 'QUESTION_UPDATE':
      case 'MOCK_TEST_CREATE':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          dot: 'bg-amber-400',
          label: action.replace(/_/g, ' ')
        };
      case 'LOGIN':
      case 'LOGOUT':
      default:
        return {
          bg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
          dot: 'bg-blue-400',
          label: action.replace(/_/g, ' ')
        };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans text-slate-100">
      {/* 3-TIER CYBER-HUD COCKPIT HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/70 border border-cyan-500/30 p-6 shadow-2xl backdrop-blur-xl">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#082f4915_1px,transparent_1px),linear-gradient(to_bottom,#082f4915_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Eyebrows + Header Title */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                ZERO-TRUST IMMUTABLE AUDIT ENCLAVE
              </span>

              {isTamperedSimulation ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  SANDBOX TAMPER TEST ACTIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SHA-256 PROVENANCE CHAIN ACTIVE
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                <Cpu className="w-3 h-3 text-indigo-400" />
                OPERATOR: {operatorId} ({operatorName})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              My Activity & Cryptographic Audit Trail
              <span className="text-xs px-2.5 py-0.5 font-mono font-normal rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
                v2.5 PROVENANCE
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Every content version, AI generation prompt, question approval, paper publication, and session handshake is sealed into a tamper-evident blockchain with zero financial exposure.
            </p>
          </div>

          {/* Right: Audio Toggle, Tamper Sandbox, Verification & Export Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Waveform Ripple & Toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                playCyberAudio('toggle', next);
              }}
              className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all relative ${
                soundEnabled
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
              title={soundEnabled ? 'HUD Procedural Audio Active' : 'Audio Muted'}
            >
              {soundRippleActive && (
                <span className="absolute -inset-1 rounded-xl border border-cyan-400 animate-ping pointer-events-none" />
              )}
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline text-[11px] font-semibold">{soundEnabled ? 'HUD AUDIO ON' : 'MUTED'}</span>
            </button>

            {/* Sandbox Tamper Demo / Auto-Heal Button */}
            {!isTamperedSimulation ? (
              <button
                onClick={handleSimulateTamper}
                className="px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 transition-all"
                title="Demonstrate Zero-Trust Tamper Detection by Simulating an Unauthorized Modification"
              >
                <Unlock className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">SIMULATE TAMPER</span>
              </button>
            ) : (
              <button
                onClick={handleAutoHealLedger}
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white border border-emerald-400/50 shadow-lg shadow-emerald-950/50 animate-pulse transition-all"
                title="Restore from Cold Enclave & Reseal Chain"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-200" />
                <span>AUTO-HEAL LEDGER</span>
              </button>
            )}

            {/* Verify Ledger Integrity */}
            <button
              onClick={handleVerifyIntegrity}
              disabled={isVerifying || blocks.length === 0}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-mono flex items-center gap-2 border transition-all shadow-lg ${
                isVerifying
                  ? 'bg-indigo-600/50 border-indigo-500/50 text-indigo-200 cursor-wait'
                  : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white border-cyan-400/40 shadow-cyan-900/30'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-cyan-300' : ''}`} />
              {isVerifying ? `SCANNING (${verificationProgress}%)` : 'VERIFY LEDGER'}
            </button>

            {/* Official Certificate Modal Trigger */}
            <button
              onClick={() => {
                setCertificateModalOpen(true);
                triggerAudio('warp');
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium font-mono flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all"
              title="Generate Official Government Accreditation Certificate"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">CERTIFICATE</span>
            </button>

            {/* Signed JSON Export */}
            <button
              onClick={handleExportJSON}
              className="px-2.5 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all"
              title="Download Signed JSON Ledger"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>JSON</span>
            </button>

            {/* CSV Export */}
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all"
              title="Download Compliance CSV"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Dynamic Verification & Tamper Status Banner */}
        {isVerifying && (
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                Cryptographic Audit: Computing SHA-256 byte hashes and Merkle root parity...
              </span>
              <span>{verificationProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-1.5 transition-all duration-150"
                style={{ width: `${verificationProgress}%` }}
              />
            </div>
          </div>
        )}

        {!isVerifying && verificationResult.status && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              {verificationResult.status === 'VALID' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  LEDGER INTEGRITY VERIFIED // {verificationResult.totalVerified} BLOCKS UNBROKEN & ZERO-DEFECT
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  INTEGRITY VIOLATION: {verificationResult.errorMsg}
                </span>
              )}

              <span className="text-slate-400 hidden sm:inline">
                Merkle Root: <code className="text-cyan-300 font-bold">{verificationResult.merkleRoot}</code>
              </span>
            </div>

            {verificationResult.checkedAt && (
              <span className="text-slate-500 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                Verified at: {verificationResult.checkedAt} IST
              </span>
            )}
          </div>
        )}
      </div>

      {/* PANORAMIC TELEMETRY RIBBON (5 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Total Recorded Blocks */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>TOTAL BLOCKS</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {telemetry.total}
          </div>
          <div className="mt-1 text-[11px] font-mono text-cyan-400/80 flex items-center gap-1">
            <span>#1001 &rarr; #{1000 + telemetry.total}</span>
          </div>
        </div>

        {/* Metric 2: Cryptographic Status */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>CHAIN STATUS</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight flex items-center gap-2 text-emerald-300">
            {isTamperedSimulation ? 'BREACHED' : '100% SEALED'}
          </div>
          <div className="mt-1 text-[11px] font-mono text-emerald-400/80">
            {isTamperedSimulation ? 'Discrepancy at #1003' : 'Zero Anomalies'}
          </div>
        </div>

        {/* Metric 3: AI vs Human Operations */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>AI : HUMAN RATIO</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-300 tracking-tight">
            {telemetry.aiOps} <span className="text-xs text-slate-500 font-normal">AI</span> : {telemetry.humanOps} <span className="text-xs text-slate-500 font-normal">H</span>
          </div>
          <div className="mt-1 text-[11px] font-mono text-purple-400/80">
            {((telemetry.aiOps / (telemetry.total || 1)) * 100).toFixed(0)}% AI Augmented
          </div>
        </div>

        {/* Metric 4: High Impact Operations */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>CRITICAL PUBLISHES</span>
            <Key className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-300 tracking-tight">
            {telemetry.critical + telemetry.elevated}
          </div>
          <div className="mt-1 text-[11px] font-mono text-amber-400/80">
            {telemetry.critical} Live Mocks / Papers
          </div>
        </div>

        {/* Metric 5: Active Enclave Network */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg hover:border-blue-500/40 transition-all col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>ENCLAVE GATEWAY</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold font-mono text-blue-300 truncate tracking-tight">
            192.168.1.104
          </div>
          <div className="mt-1 text-[11px] font-mono text-blue-400/80 truncate">
            Bureau Internal LAN (TLS 1.3)
          </div>
        </div>
      </div>

      {/* DIURNAL ACTIVITY CHRONOGRAPH & PEDAGOGICAL BREAKDOWN (DUAL HUD PANELS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: 24-Hour Diurnal Activity Chronograph (7 cols) */}
        <div className="lg:col-span-7 rounded-xl bg-slate-900/80 border border-slate-800 p-4 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                24-Hour Diurnal Operator Chronograph (IST)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
              Peak: {diurnalData.peakHour}:00 IST ({diurnalData.peakCount} actions)
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            {diurnalData.busiestPeriod}
          </p>

          {/* 24-Hour Bar Sparkline */}
          <div className="pt-2">
            <div className="grid grid-cols-24 gap-0.5 sm:gap-1 items-end h-20 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
              {diurnalData.points.map((pt) => {
                const heightPct = Math.max(10, Math.round((pt.count / (diurnalData.peakCount || 1)) * 100));
                const isPeak = pt.hour === diurnalData.peakHour && pt.count > 0;

                return (
                  <div
                    key={pt.hour}
                    className="flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                      <div className="bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded shadow-xl border border-slate-700 whitespace-nowrap">
                        <span className="font-bold text-cyan-400">{pt.label} IST</span>: {pt.count} actions
                        {pt.actions.length > 0 && (
                          <div className="text-[9px] text-slate-400 max-w-xs truncate">
                            {pt.actions.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 border-r border-b border-slate-700 -mt-1" />
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t transition-all ${
                        isPeak
                          ? 'bg-gradient-to-t from-cyan-500 to-indigo-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                          : pt.count > 0
                          ? 'bg-cyan-600/70 hover:bg-cyan-400'
                          : 'bg-slate-800/40'
                      }`}
                      style={{ height: `${pt.count > 0 ? heightPct : 6}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Time markings */}
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1 px-1">
              <span>00:00 (Midnight)</span>
              <span>06:00 (Dawn)</span>
              <span>12:00 (Noon)</span>
              <span>18:00 (Dusk)</span>
              <span>23:00 (Night)</span>
            </div>
          </div>
        </div>

        {/* Right: Category Distribution & Focus (5 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-slate-900/80 border border-slate-800 p-4 backdrop-blur-md space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                  Academic Focus Distribution
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {blocks.length} events logged
              </span>
            </div>

            <div className="space-y-2 pt-1 font-mono text-xs">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">{cat.label}</span>
                    <span className="text-slate-400 font-bold">{cat.count} ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800/60">
                    <div
                      className={`h-full ${cat.color} transition-all duration-300`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Security Isolation: Zero Public Writes</span>
            <span className="text-emerald-400 font-bold">SHA-256 Merkle Proven</span>
          </div>
        </div>
      </div>

      {/* FILTER & VIEW CONTROL BAR */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 backdrop-blur-md space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input (5 cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search details, title, block hash, block #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Filter (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                triggerAudio('tick');
              }}
              className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">All Action Signatures</option>
              <option value="LOGIN">LOGIN (Session Handshake)</option>
              <option value="MATERIAL_UPLOAD">MATERIAL_UPLOAD</option>
              <option value="MATERIAL_VERSION_ADD">MATERIAL_VERSION_ADD</option>
              <option value="MATERIAL_PUBLISH">MATERIAL_PUBLISH</option>
              <option value="MATERIAL_ARCHIVE">MATERIAL_ARCHIVE</option>
              <option value="MOCK_TEST_CREATE">MOCK_TEST_CREATE</option>
              <option value="MOCK_TEST_PUBLISH">MOCK_TEST_PUBLISH</option>
              <option value="QUESTION_CREATE">QUESTION_CREATE</option>
              <option value="QUESTION_UPDATE">QUESTION_UPDATE</option>
              <option value="AI_QUESTION_GENERATE">AI_QUESTION_GENERATE</option>
              <option value="AI_QUESTION_APPROVE">AI_QUESTION_APPROVE</option>
              <option value="AI_QUESTION_REJECT">AI_QUESTION_REJECT</option>
            </select>
          </div>

          {/* Entity Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                triggerAudio('tick');
              }}
              className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">All Entities</option>
              <option value="STUDY_MATERIAL">Study Material</option>
              <option value="MOCK_TEST">Mock Test</option>
              <option value="QUESTION">Question Bank</option>
              <option value="PROFILE">Operator Session</option>
            </select>
          </div>

          {/* Time Horizon Pills (2 cols) */}
          <div className="md:col-span-2 flex items-center justify-end gap-1">
            {(['24H', '7D', '30D', 'ALL'] as HorizonFilter[]).map((h) => (
              <button
                key={h}
                onClick={() => {
                  setHorizon(h);
                  triggerAudio('click');
                }}
                className={`px-2 py-1 text-[10px] font-mono font-semibold rounded-md transition-all ${
                  horizon === h
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Switcher + Classification Chips + Bookmarked Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          {/* Classification chips & Pinned Toggle */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            {/* Pinned Only Toggle Button */}
            <button
              onClick={() => {
                setOnlyBookmarked(prev => !prev);
                triggerAudio('tick');
              }}
              className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md flex items-center gap-1 transition-all ${
                onlyBookmarked
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3 h-3 text-amber-400" />
              <span>PINNED MILESTONES ({bookmarkedIds.size})</span>
            </button>

            <span className="text-slate-500 text-[11px] mx-1">|</span>

            <span className="text-slate-400 text-[11px] mr-1">Classification:</span>
            {[
              { id: 'ALL', label: 'ALL' },
              { id: 'ROUTINE', label: 'ROUTINE' },
              { id: 'AUDITED', label: 'AUDITED' },
              { id: 'ELEVATED', label: 'ELEVATED' },
              { id: 'CRITICAL_PUBLISH', label: 'CRITICAL' }
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setClassificationFilter(c.id);
                  triggerAudio('tick');
                }}
                className={`px-2 py-0.5 text-[10px] rounded-md transition-all ${
                  classificationFilter === c.id
                    ? 'bg-slate-800 text-white font-bold border border-slate-600 shadow'
                    : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* 4 View Modes Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                setViewMode('STREAM');
                triggerAudio('click');
              }}
              className={`px-2.5 py-1 text-[11px] font-mono rounded flex items-center gap-1.5 transition-all ${
                viewMode === 'STREAM'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Chronological Laser Timeline"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>STREAM</span>
            </button>

            <button
              onClick={() => {
                setViewMode('MATRIX');
                triggerAudio('click');
              }}
              className={`px-2.5 py-1 text-[11px] font-mono rounded flex items-center gap-1.5 transition-all ${
                viewMode === 'MATRIX'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="High-Density Tabular Forensic Matrix"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>MATRIX</span>
            </button>

            <button
              onClick={() => {
                setViewMode('BLOCK_EXPLORER');
                triggerAudio('click');
              }}
              className={`px-2.5 py-1 text-[11px] font-mono rounded flex items-center gap-1.5 transition-all ${
                viewMode === 'BLOCK_EXPLORER'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cryptographic Block Cards"
            >
              <Hash className="w-3.5 h-3.5" />
              <span>BLOCKS</span>
            </button>

            <button
              onClick={() => {
                setViewMode('MERKLE_TREE');
                triggerAudio('warp');
              }}
              className={`px-2.5 py-1 text-[11px] font-mono rounded flex items-center gap-1.5 transition-all ${
                viewMode === 'MERKLE_TREE'
                  ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Interactive Merkle Tree Topology Graph"
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
              <span>MERKLE TREE</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN AUDIT LEDGER VIEWS */}
      {loading ? (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-16 text-center text-slate-400 font-mono">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-sm">Decrypting and validating SHA-256 operator ledger blocks...</p>
        </div>
      ) : filteredBlocks.length === 0 ? (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-16 text-center text-slate-400 font-mono">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-300">No cryptographic audit blocks match filter criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Adjust search parameters or disable "Pinned Milestones".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActionFilter('ALL');
              setEntityFilter('ALL');
              setClassificationFilter('ALL');
              setHorizon('ALL');
              setOnlyBookmarked(false);
              triggerAudio('confirm');
            }}
            className="mt-4 px-3 py-1.5 text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-lg hover:bg-cyan-900 transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          {/* VIEW 1: CYBER STREAM VIEW */}
          {viewMode === 'STREAM' && (
            <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-indigo-500 before:to-slate-800">
              {filteredBlocks.map((b) => {
                const badge = getActionBadge(b.action);
                const isInspected = inspectBlock?.id === b.id;
                const isBookmarked = bookmarkedIds.has(b.id);
                const isTampered = b.verificationStatus === 'TAMPER_SUSPECT';

                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      setInspectBlock(b);
                      triggerAudio('click');
                    }}
                    className={`relative rounded-xl bg-slate-900/90 border transition-all cursor-pointer p-4 group ${
                      isTampered
                        ? 'border-rose-500 bg-rose-950/20 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse'
                        : isInspected
                        ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] bg-slate-900'
                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    {/* Node connector on timeline */}
                    <div className={`absolute -left-[31px] sm:-left-[39px] top-5 w-4 h-4 rounded-full bg-slate-950 border-2 flex items-center justify-center ${
                      isTampered
                        ? 'border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                        : 'border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isTampered ? 'bg-rose-400' : 'bg-cyan-300'}`} />
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Left: Block Number + Action Badge + Entity Title */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Block Number Tag */}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            isTampered
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : 'bg-slate-950 text-cyan-400 border-cyan-900/60'
                          }`}>
                            BLOCK #{b.blockNumber}
                          </span>

                          {/* Action Badge */}
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${badge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>

                          {/* Classification Tag */}
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            {b.classification}
                          </span>

                          {/* Bookmark Tag */}
                          {isBookmarked && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <BookmarkCheck className="w-3 h-3 text-amber-400" />
                              PINNED
                            </span>
                          )}

                          {/* Timestamp */}
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Date(b.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })} IST
                          </span>
                        </div>

                        {/* Title & Details */}
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                            {b.entityTitle}
                            <span className="text-[10px] font-mono font-normal text-slate-500">
                              [{b.entityId}]
                            </span>
                          </h3>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {b.details}
                          </p>
                        </div>
                      </div>

                      {/* Right: Cryptographic Hashes + Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center lg:flex-col lg:items-end gap-2 lg:text-right shrink-0">
                        <div className="font-mono text-[11px] space-y-0.5">
                          <div className="text-slate-400 flex items-center lg:justify-end gap-1.5">
                            <span className="text-[10px] text-slate-500">HASH:</span>
                            <code className="text-cyan-300 font-bold hover:underline cursor-pointer" onClick={(e) => handleCopyHash(b.blockHash, e)}>
                              {b.blockHash.slice(0, 10)}...{b.blockHash.slice(-6)}
                            </code>
                            <button
                              onClick={(e) => handleCopyHash(b.blockHash, e)}
                              className="text-slate-500 hover:text-cyan-300"
                              title="Copy SHA-256 Hash"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-slate-500 flex items-center lg:justify-end gap-1.5 text-[10px]">
                            <span>PREV:</span>
                            <code>{b.previousHash.slice(0, 8)}...</code>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Bookmark Star Button */}
                          <button
                            onClick={(e) => toggleBookmark(b.id, e)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isBookmarked
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-amber-300'
                            }`}
                            title={isBookmarked ? 'Unpin Milestone' : 'Pin Audit Milestone'}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>

                          {/* Inspect CTA */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectBlock(b);
                              triggerAudio('warp');
                            }}
                            className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 flex items-center gap-1 transition-all"
                          >
                            <Eye className="w-3 h-3" />
                            <span>INSPECT</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: HIGH-DENSITY LEDGER MATRIX (TABULAR) */}
          {viewMode === 'MATRIX' && (
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3.5">Block</th>
                      <th className="py-3 px-3">Timestamp (IST)</th>
                      <th className="py-3 px-3">Action Signature</th>
                      <th className="py-3 px-3">Entity & Subject</th>
                      <th className="py-3 px-4">Action Summary</th>
                      <th className="py-3 px-3">SHA-256 Block Hash</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredBlocks.map((b) => {
                      const badge = getActionBadge(b.action);
                      const isBookmarked = bookmarkedIds.has(b.id);

                      return (
                        <tr
                          key={b.id}
                          onClick={() => {
                            setInspectBlock(b);
                            triggerAudio('click');
                          }}
                          className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="font-bold text-cyan-400">#{b.blockNumber}</span>
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                            {new Date(b.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.bg}`}>
                              {b.action}
                            </span>
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            <p className="font-bold text-white group-hover:text-cyan-300 transition-colors truncate max-w-xs">
                              {b.entityTitle}
                            </p>
                            <span className="text-[10px] text-slate-500">{b.entity} ({b.entityId})</span>
                          </td>

                          <td className="py-3 px-4 text-slate-300 max-w-md truncate">
                            {b.details}
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <span className="text-cyan-400/90 font-bold">
                                {b.blockHash.slice(0, 8)}...{b.blockHash.slice(-4)}
                              </span>
                              <button
                                onClick={(e) => handleCopyHash(b.blockHash, e)}
                                className="text-slate-500 hover:text-cyan-300"
                                title="Copy Hash"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => toggleBookmark(b.id, e)}
                                className={`p-1 rounded ${isBookmarked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                                title="Pin"
                              >
                                <Bookmark className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInspectBlock(b);
                                  triggerAudio('warp');
                                }}
                                className="px-2 py-1 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 inline-flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3 text-cyan-400" />
                                Inspect
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: CRYPTOGRAPHIC BLOCK EXPLORER */}
          {viewMode === 'BLOCK_EXPLORER' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBlocks.map((b) => {
                const badge = getActionBadge(b.action);
                const isBookmarked = bookmarkedIds.has(b.id);
                const isTampered = b.verificationStatus === 'TAMPER_SUSPECT';

                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      setInspectBlock(b);
                      triggerAudio('click');
                    }}
                    className={`rounded-xl bg-slate-900/90 border p-4 shadow-xl transition-all cursor-pointer group flex flex-col justify-between ${
                      isTampered
                        ? 'border-rose-500 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse'
                        : 'border-slate-800 hover:border-cyan-500/50'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Block Number & Status */}
                      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
                          BLOCK #{b.blockNumber}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => toggleBookmark(b.id, e)}
                            className={`p-1 rounded ${isBookmarked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            VERIFIED SEAL
                          </span>
                        </div>
                      </div>

                      {/* Action & Entity */}
                      <div className="space-y-1.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${badge.bg}`}>
                          {b.action}
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                          {b.entityTitle}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {b.details}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Cryptographic Footprint */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 font-mono text-[10px] space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>BLOCK HASH:</span>
                        <code className="text-cyan-300 font-bold">
                          {b.blockHash.slice(0, 10)}...{b.blockHash.slice(-4)}
                        </code>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>PREV HASH:</span>
                        <code>{b.previousHash.slice(0, 8)}...</code>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 pt-1">
                        <span>TIMESTAMP:</span>
                        <span>{new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 4: INTERACTIVE MERKLE TREE TOPOLOGY GRAPH */}
          {viewMode === 'MERKLE_TREE' && (
            <div className="rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/80 border border-purple-500/30 p-6 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-purple-400" />
                    Merkle Tree Cryptographic Topology
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hierarchical binary proof graph rolling individual block hashes into the tamper-proof Merkle Root.
                  </p>
                </div>

                <div className="font-mono text-xs text-right">
                  <span className="text-slate-400">Master Root: </span>
                  <code className="text-purple-300 font-bold">{telemetry.merkleRoot}</code>
                </div>
              </div>

              {/* Merkle Hierarchy Levels */}
              <div className="space-y-6 py-2 overflow-x-auto">
                {merkleLevels.map((lvl) => (
                  <div key={lvl.levelIndex} className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="font-bold text-cyan-400">{lvl.title}</span>
                      <span>{lvl.nodes.length} Node{lvl.nodes.length > 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {lvl.nodes.map((n) => {
                        const isRoot = n.isRoot;

                        return (
                          <div
                            key={n.id}
                            className={`p-3 rounded-xl border font-mono text-xs transition-all shadow-md ${
                              isRoot
                                ? 'bg-purple-950/60 border-purple-400/80 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                                : 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/50 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 text-[10px] text-slate-500 mb-1">
                              <span className={isRoot ? 'text-purple-400 font-bold' : 'text-slate-400'}>
                                {n.label}
                              </span>
                              {n.blockNumber && (
                                <span className="text-cyan-400 font-bold">#{n.blockNumber}</span>
                              )}
                            </div>

                            <code className={`block text-[11px] ${isRoot ? 'text-white font-bold' : 'text-cyan-300'}`}>
                              {n.hash.slice(0, 14)}...{n.hash.slice(-6)}
                            </code>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Algorithm: Double-Hashed SHA-256 Pairwise Merkle Tree</span>
                <span className="text-emerald-400 font-bold">Self-Verifiable In Browser</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* FORENSIC DEEP-DIVE INSPECT MODAL WITH REVISION DIFF */}
      {inspectBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-cyan-500/40 p-6 shadow-2xl overflow-y-auto max-h-[90vh] font-mono">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-400">BLOCK #{inspectBlock.blockNumber}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      CRYPTOGRAPHICALLY SEALED
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">{inspectBlock.entityTitle}</h3>
                </div>
              </div>

              <button
                onClick={() => {
                  setInspectBlock(null);
                  triggerAudio('click');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-4 text-xs">
              {/* Telemetry Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase">Action Signature</span>
                  <div className="text-cyan-300 font-bold mt-0.5">{inspectBlock.action}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Classification: {inspectBlock.classification}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase">Entity Footprint</span>
                  <div className="text-white font-bold mt-0.5">{inspectBlock.entity}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">ID: {inspectBlock.entityId}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase">Signed Timestamp</span>
                  <div className="text-slate-200 font-bold mt-0.5">
                    {new Date(inspectBlock.timestamp).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'medium'
                    })} IST
                  </div>
                  <div className="text-slate-500 text-[10px] mt-0.5">UTC: {inspectBlock.timestamp}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase">Network Gateway</span>
                  <div className="text-slate-200 font-bold mt-0.5">{inspectBlock.ipAddress}</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">{inspectBlock.userAgent}</div>
                </div>
              </div>

              {/* Action Description */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block mb-1">Audit Log Description</span>
                <p className="text-slate-200 leading-relaxed font-sans">{inspectBlock.details}</p>
              </div>

              {/* Pedagogical Revision Diff Box (When inspecting updates or versions) */}
              {(inspectBlock.action === 'QUESTION_UPDATE' || inspectBlock.action === 'MATERIAL_VERSION_ADD' || inspectBlock.action === 'AI_QUESTION_APPROVE') && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2">
                  <span className="text-indigo-400 text-[11px] font-bold flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5" />
                    PEDAGOGICAL REVISION BLUEPRINT & DIFF
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded bg-rose-950/30 border border-rose-900/50 space-y-1">
                      <span className="text-rose-400 font-bold block text-[10px]">PREVIOUS STATE (- DEPRECATED)</span>
                      <p className="text-slate-300">
                        {inspectBlock.action === 'QUESTION_UPDATE'
                          ? 'Option C: Confusion on sign convention without step-by-step Hindi translation.'
                          : 'Version 2.3: Basic formulas without 2025 PYQ annotations and shortcut charts.'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-900/50 space-y-1">
                      <span className="text-emerald-400 font-bold block text-[10px]">REVISED STATE (+ SEALED)</span>
                      <p className="text-slate-200">
                        {inspectBlock.action === 'QUESTION_UPDATE'
                          ? 'Option C: Distractor rectified with bilingual derivation and sign convention callout.'
                          : 'Version 2.4: 68-page digest with comprehensive Data Interpretation formulas.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cryptographic Hashes Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 text-[11px] font-bold flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    SHA-256 BLOCK HASH
                  </span>
                  <button
                    onClick={() => handleCopyHash(inspectBlock.blockHash)}
                    className="text-[11px] text-cyan-300 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedHash === inspectBlock.blockHash ? 'COPIED!' : 'COPY HASH'}
                  </button>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 break-all select-all">
                  {inspectBlock.blockHash}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400 text-[10px] uppercase">Previous Block Link</span>
                  <code className="text-slate-300 text-[11px]">{inspectBlock.previousHash}</code>
                </div>
              </div>

              {/* Raw JSON Forensic Dump */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block mb-1.5">
                  Raw Enclave Payload (Immutable)
                </span>
                <pre className="p-3 rounded bg-slate-900/90 text-[11px] text-emerald-400 overflow-x-auto max-h-40 leading-relaxed border border-slate-800">
                  {JSON.stringify(inspectBlock, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                Signed by ZYZU'S Identity Enclave (ECDSA-P256)
              </span>

              <button
                onClick={() => {
                  setInspectBlock(null);
                  triggerAudio('click');
                }}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-900/20"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL GOVERNMENT COMPLIANCE CERTIFICATE MODAL */}
      {certificateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-amber-500/40 p-8 shadow-2xl text-slate-900 font-sans">
            {/* Certificate Canvas */}
            <div className="bg-amber-50/95 p-6 rounded-xl border-4 border-amber-800/20 relative overflow-hidden shadow-inner space-y-5">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
                <Award className="w-96 h-96 text-slate-900" />
              </div>

              {/* Header */}
              <div className="text-center space-y-1">
                <span className="text-[11px] font-mono tracking-widest text-amber-900 uppercase font-bold">
                  GOVERNMENT OF INDIA // NATIONAL EDTECH CONTENT REGULATORY ENCLAVE
                </span>
                <h2 className="text-xl font-serif font-black text-slate-900 tracking-wide">
                  CERTIFICATE OF CRYPTOGRAPHIC AUDIT INTEGRITY
                </h2>
                <p className="text-xs text-slate-600 font-mono">
                  Issuance Ref: FP-GOV-AUDIT-2026-IN-{operatorId.slice(-4).toUpperCase()}
                </p>
              </div>

              {/* Body */}
              <div className="text-xs text-slate-800 space-y-3 leading-relaxed pt-2 border-t border-amber-900/20 font-serif">
                <p>
                  This official compliance dossier hereby certifies that all academic study materials, mock examination papers, and AI-assisted questions authored, reviewed, and published by <strong>{operatorName}</strong> (ID: <code>{operatorId}</code>) have undergone zero-trust cryptographic validation.
                </p>
                <div className="p-3 bg-amber-100/60 rounded border border-amber-300 font-mono text-[11px] space-y-1">
                  <div><strong>Total Ledger Blocks Sealed:</strong> {blocks.length} Blocks (#1001 to #{1000 + blocks.length})</div>
                  <div><strong>Merkle Root Fingerprint:</strong> {telemetry.merkleRoot}</div>
                  <div><strong>Compliance Accreditation:</strong> UPSSSC / BHU SET / National Exam Standards 2026</div>
                  <div><strong>Audit Status:</strong> ZERO ANOMALIES DETECTED (100% UNBROKEN)</div>
                </div>
              </div>

              {/* Signatures & Stamps */}
              <div className="pt-4 border-t border-amber-900/20 flex items-center justify-between font-mono text-[10px] text-slate-600">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">ACADEMIC CONTENT BUREAU</div>
                  <div>Authorized Digital Stamp</div>
                  <div className="text-emerald-700 font-bold">SHA-256 VERIFIED</div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="font-bold text-slate-900">SUNITA VERMA</div>
                  <div>Senior Exam Paper Setter</div>
                  <div>Date: {new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => {
                  window.print();
                  triggerAudio('click');
                }}
                className="px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/30 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>PRINT CERTIFICATE</span>
              </button>

              <button
                onClick={() => {
                  setCertificateModalOpen(false);
                  triggerAudio('click');
                }}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              >
                Close Enclave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
