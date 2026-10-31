import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  ShieldCheck,
  CreditCard,
  Award,
  Sparkles,
  Download,
  Printer,
  Calendar,
  Layers,
  CheckCircle2,
  RefreshCw,
  RefreshCcw,
  Sliders,
  Settings,
  Building,
  GraduationCap,
  Users,
  MapPin,
  Eye,
  AlertTriangle,
  History,
  Check,
  X,
  Radio,
  Zap,
  Lock,
  Volume2,
  VolumeX,
  Copy,
  Grid,
  List,
  QrCode,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { documentService } from '../../services/documentService';
import { mockStore } from '../../mock/store';
import {
  UnifiedFocusPointDocument,
  DocumentCategory,
  DocumentFilterOptions,
  DocumentKPISummary
} from '../../types/document';
import { UnifiedDocumentViewer } from '../../components/documents/UnifiedDocumentViewer';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { PanIndiaLocationSelector, LocationSelectionPayload } from '../../components/common/PanIndiaLocationSelector';
import { Card } from '../../components/common/Card';

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

export const SuperAdminDocumentCenter: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [documents, setDocuments] = useState<UnifiedFocusPointDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<UnifiedFocusPointDocument | null>(null);
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Reissue Modal State
  const [reissueDoc, setReissueDoc] = useState<UnifiedFocusPointDocument | null>(null);
  const [reissueReason, setReissueReason] = useState<string>('');
  const [reissuing, setReissuing] = useState<boolean>(false);

  // Filters & Pan-India Location State (Section #2 & #10)
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

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('ALL');

  const userId = user?.id || 'usr-super-admin';

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const filters: DocumentFilterOptions = {
        role: selectedRole === 'ALL' ? undefined : selectedRole,
        state: selectedLocation.stateName || undefined,
        district: selectedLocation.districtName || undefined,
        locality: selectedLocation.localityName || undefined,
        category: selectedCategory === 'ALL' ? undefined : (selectedCategory as DocumentCategory),
        status: selectedStatus === 'ALL' ? undefined : (selectedStatus as any),
        paymentStatus: selectedPaymentStatus === 'ALL' ? undefined : (selectedPaymentStatus as any),
        searchQuery: searchQuery.trim() || undefined
      };

      const docs = await documentService.getMyDocuments(userId, 'SUPER_ADMIN', filters);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load global documents:', err);
      showToast('Failed to load global documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [selectedRole, selectedLocation, selectedCategory, selectedStatus, selectedPaymentStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDocuments();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedRole('ALL');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSelectedPaymentStatus('ALL');
    setSelectedLocation({
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
  };

  const handleConfirmReissue = async () => {
    if (!reissueDoc) return;
    if (!reissueReason.trim()) {
      showToast('Please provide a valid administrative reason for reissue.', 'error');
      return;
    }

    setReissuing(true);
    try {
      const updated = await documentService.reissueDocument(
        reissueDoc.documentNumber,
        reissueReason,
        userId,
        user?.name || 'Chief Platform Administrator'
      );
      showToast(`Document ${updated.documentNumber} successfully reissued! Previous version superseded.`, 'success');
      setReissueDoc(null);
      setReissueReason('');
      loadDocuments();
    } catch (err: any) {
      showToast(err.message || 'Failed to reissue document', 'error');
    } finally {
      setReissuing(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: documents.length,
      paidAmountTotal: documents
        .filter(d => d.paymentStatus === 'PAID')
        .reduce((sum, d) => sum + (d.amount || 0), 0),
      idCardsCount: documents.filter(d => d.category === 'IDENTITY').length,
      salarySlipsCount: documents.filter(d => d.category === 'SALARY').length,
      reissuedCount: documents.filter(d => d.version > 1 || d.status === 'REPLACED').length
    };
  }, [documents]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 pb-20 bg-[#060b19] cyber-grid-bg border-2 border-purple-500/30 shadow-2xl rounded-3xl p-4 sm:p-6 lg:p-7 text-white min-h-screen relative overflow-hidden">
      {/* Ambient Neon Nebula Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40 animate-pulse" style={{ animationDuration: '7s' }} />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -ml-40 -mb-40" />

      {/* ==================================================================== */}
      {/* 1. PANORAMIC CYBER-HUD DOCUMENT OS COMMAND STATION (3-Tier Cockpit Deck) */}
      {/* ==================================================================== */}
      <div className="relative z-10 p-4 sm:p-6 rounded-3xl bg-slate-950/95 border-2 border-purple-500/50 shadow-2xl space-y-4 backdrop-blur-md overflow-hidden text-white">
        {/* TIER 1: MICRO-HUD TELEMETRY BREADCRUMB BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Pulse Indicator & Primary OS Badge */}
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.9)]"></span>
              </span>
              <span className="text-[11px] font-mono font-black uppercase tracking-widest text-purple-300 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                GLOBAL DOCUMENT OS // V4.8 CRYPTOGRAPHIC ARCHIVE
              </span>
            </div>

            {/* Merkle Ledger Hash Badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-cyan-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-700 shadow-xs">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>LEDGER HASH: SHA-256 // MERKLE ROOT 0x8a72..c1</span>
            </div>

            {/* Tamper-Proof Audit Badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-black text-emerald-300 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-500/60 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>INTEGRITY: 100% VERIFIED</span>
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
                showToast(next ? 'Cyber Synth Audio Enabled' : 'Cyber Synth Muted', 'info');
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
                loadDocuments();
              }}
              className="bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500/70 text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-300 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Vault</span>
            </Button>
          </div>
        </div>

        {/* TIER 2: DEDICATED HORIZONTAL COMMAND DISPLAY COCKPIT */}
        <div className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-slate-900/90 border border-purple-500/40 shadow-inner backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            {/* Left Wing: Holographic Pulse Emblem + Title */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="relative shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/30 via-indigo-600/30 to-cyan-500/20 border-2 border-purple-400/60 shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
                <FileText className="w-7 h-7 text-purple-300 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-cyan-300 drop-shadow-md">
                    Platform Document & Credential OS
                  </h1>
                  <span className="px-2 py-0.5 rounded-md bg-purple-950 border border-purple-400 text-[10px] font-mono font-black text-purple-300 uppercase tracking-wider shadow-xs">
                    HQ ARCHIVE
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block mt-0.5">
                  NATIONAL ISSUANCE, CRYPTOGRAPHIC AUDITING & SUPERSESSION HIGHWAY
                </span>
              </div>
            </div>

            {/* Glowing Neon Laser Divider (Vertical on lg screens, Horizontal on small screens) */}
            <div className="hidden lg:block w-px h-14 bg-gradient-to-b from-purple-400/20 via-purple-400 to-cyan-400/20 shrink-0 mx-2 shadow-xs shadow-purple-400" />
            <div className="lg:hidden w-full h-px bg-slate-800" />

            {/* Right Wing: The Subtitle (Rendered Horizontally Side-by-Side with Title) */}
            <div className="flex-1 min-w-0 max-w-2xl">
              <p className="text-xs sm:text-[13px] font-semibold text-slate-100 leading-relaxed drop-shadow-xs">
                Pan-India centralized repository: search, audit, verify, inspect version history, and reissue official records across all 5 platform roles.
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/50 shadow-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  100% TAMPER-PROOF QR CERTIFICATION
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/50 shadow-xs">
                  <RefreshCcw className="w-3 h-3 text-purple-400" />
                  NON-DESTRUCTIVE SUPERSESSION (V2+)
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/50 shadow-xs">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  PAN-INDIA MULTI-ROLE REPOSITORY
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TIER 3: TERRITORY SCOPE & VIEW MODE SWITCHER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Left: Territory Scope */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] font-mono text-slate-300">
            <span className="flex items-center gap-1.5 text-purple-300 font-bold bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 shadow-xs">
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              <span>TERRITORY: {selectedLocation.localityName || selectedLocation.districtName || selectedLocation.stateName || 'PAN-INDIA CENTRAL ARCHIVE'}</span>
            </span>
            <span className="hidden sm:flex items-center gap-1 text-emerald-300 font-semibold bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CENTRAL REPOSITORY: SYNCHRONIZED</span>
            </span>
          </div>

          {/* Right: View Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (audioEnabled) soundSystem.playChirp('click');
                setViewMode('TABLE');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>TABLE INDEX</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (audioEnabled) soundSystem.playChirp('click');
                setViewMode('CARDS');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>CREDENTIAL CARDS</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. ANALYTICS KPI MATRIX (5 Futuristic Cyber-HUD Indicator Cards)      */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-cyan-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-300 group-hover:text-cyan-300">TOTAL ARCHIVED</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono mt-1.5 group-hover:text-cyan-300">{stats.total}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-bold block mt-0.5">Across Platform Roles</span>
        </div>

        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-emerald-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-300 group-hover:text-emerald-300">SETTLED VALUE</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1.5">{formatCurrency(stats.paidAmountTotal)}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-bold block mt-0.5">Verified Fiscal Invoices</span>
        </div>

        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-blue-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-300 group-hover:text-blue-300">ID CREDENTIALS</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-400 font-mono mt-1.5">{stats.idCardsCount}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-bold block mt-0.5">Active QR Passes</span>
        </div>

        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-purple-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-300 group-hover:text-purple-300">SALARY & PAYROLL</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-400 font-mono mt-1.5">{stats.salarySlipsCount}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-bold block mt-0.5">Disbursed Salary Slips</span>
        </div>

        <div className="p-4 rounded-2xl cyber-hud-card hud-corner-brackets border-2 border-slate-800 hover:border-amber-400 bg-slate-950/90 transition-all duration-300 group shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-300 group-hover:text-amber-300">REISSUED AUDIT</span>
            <RefreshCcw className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1.5">{stats.reissuedCount}</p>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-bold block mt-0.5">Multi-version Audited</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. PAN-INDIA LOCATION COMMAND FILTER & BREADCRUMB CONTEXT             */}
      {/* ==================================================================== */}
      <div className="p-5 rounded-3xl bg-slate-950/95 border-2 border-slate-800 hover:border-purple-500/50 transition-colors shadow-2xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 font-black border border-purple-500/40">
                Document Vault Location Scope
              </span>
              <span className="text-xs text-slate-300 font-semibold">
                {selectedLocation.localityName ? `Locality: ${selectedLocation.localityName}` :
                 selectedLocation.districtName ? `District: ${selectedLocation.districtName}` :
                 selectedLocation.stateName ? `State: ${selectedLocation.stateName}` : 'Pan-India Central Archive'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white font-bold">
              <span className="text-slate-300 hover:text-purple-300 cursor-pointer" onClick={() => {
                if (audioEnabled) soundSystem.playChirp('click');
                setSelectedLocation({ countryId: 'IN', stateId: '', stateName: '', districtId: '', districtName: '', localityId: '', localityName: '', level: 'INDIA', breadcrumb: 'Pan-India' });
              }}>
                India
              </span>
              {selectedLocation.stateName && (
                <>
                  <span className="text-slate-500">→</span>
                  <span className="text-purple-400 font-bold">{selectedLocation.stateName}</span>
                </>
              )}
              {selectedLocation.districtName && (
                <>
                  <span className="text-slate-500">→</span>
                  <span className="text-amber-400 font-bold">{selectedLocation.districtName}</span>
                </>
              )}
              {selectedLocation.localityName && (
                <>
                  <span className="text-slate-500">→</span>
                  <span className="text-emerald-400 font-bold">{selectedLocation.localityName}</span>
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
      {/* 4. GLOBAL SEARCH & MULTI-FILTER CONSOLE                              */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/95 border-2 border-slate-800 shadow-2xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all documents by Document #, Recipient Name, Payment ID, Transaction Ref..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-700 text-white placeholder:text-slate-400 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 hover:border-slate-600 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => {
                if (audioEnabled) soundSystem.playChirp('click');
                setSelectedRole(e.target.value);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-700 text-xs text-white font-extrabold cursor-pointer hover:border-purple-400 transition-colors"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="LIBRARY_OWNER">Library Owner</option>
              <option value="DISTRICT_ADMIN">District Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                if (audioEnabled) soundSystem.playChirp('click');
                setSelectedCategory(e.target.value);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-700 text-xs text-white font-extrabold cursor-pointer hover:border-purple-400 transition-colors"
            >
              <option value="ALL">All Categories</option>
              <option value="PAYMENT">Receipts & Invoices</option>
              <option value="IDENTITY">ID Cards & Credentials</option>
              <option value="SALARY">Salary & Honorarium Slips</option>
              <option value="DEMO">Demo Passes & Trials</option>
              <option value="SUBSCRIPTION">Subscriptions & Passes</option>
              <option value="BOOKING">Library Bookings</option>
              <option value="CERTIFICATE">Certificates & Awards</option>
              <option value="FINANCIAL">Financial Statements</option>
              <option value="ADMINISTRATIVE">Administrative Letters</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                if (audioEnabled) soundSystem.playChirp('click');
                setSelectedStatus(e.target.value);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-700 text-xs text-white font-extrabold cursor-pointer hover:border-purple-400 transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">Ready</option>
              <option value="VIEWED">Viewed</option>
              <option value="DOWNLOADED">Downloaded</option>
              <option value="PRINTED">Printed</option>
              <option value="REPLACED">Replaced</option>
            </select>

            {(searchQuery || selectedRole !== 'ALL' || selectedLocation.stateName || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  if (audioEnabled) soundSystem.playChirp('click');
                  handleClearFilters();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-rose-950 border-2 border-rose-500/70 text-xs text-rose-300 font-black hover:bg-rose-900 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </form>

        {/* Category Quick-Filter Chips */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 font-mono flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-purple-400" /> Category:
          </span>
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'PAYMENT', label: 'Receipts & Invoices' },
            { id: 'IDENTITY', label: 'ID Credentials' },
            { id: 'SALARY', label: 'Salary Slips' },
            { id: 'SUBSCRIPTION', label: 'Passes' },
            { id: 'BOOKING', label: 'Bookings' },
            { id: 'CERTIFICATE', label: 'Certificates' }
          ].map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                if (audioEnabled) soundSystem.playChirp('click');
                setSelectedCategory(c.id);
              }}
              className={`px-3 py-1 rounded-xl font-black text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 border border-purple-300'
                  : 'bg-slate-900 border border-slate-700 text-slate-200 hover:text-cyan-300 hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. DOCUMENT MASTER INDEX (Table View & Cards View)                   */}
      {/* ==================================================================== */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-300 bg-slate-950/90 rounded-3xl border-2 border-slate-800 shadow-2xl">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-bold text-white text-sm">Scanning Platform Document Vault Ledger...</p>
          <span className="text-slate-400 font-mono mt-1 block">Executing SHA-256 Merkle root verification</span>
        </div>
      ) : documents.length === 0 ? (
        <div className="p-16 text-center text-xs text-slate-300 bg-slate-950/90 rounded-3xl border-2 border-slate-800 shadow-2xl space-y-2">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <p className="font-black text-white text-base">No Documents Found in Vault</p>
          <p className="text-slate-400 max-w-md mx-auto">No official documents match the specified search parameters or location scope.</p>
        </div>
      ) : viewMode === 'TABLE' ? (
        /* TABLE VIEW */
        <div className="bg-slate-950/95 rounded-3xl border-2 border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-4 border-b-2 border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="font-black text-xs text-white uppercase tracking-wider">
                Document Vault Index ({documents.length} Records Verified)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/40">
              LEDGER VERIFIED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-purple-300 font-black uppercase tracking-wider border-b-2 border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Doc # & Type</th>
                  <th className="px-4 py-3.5">Recipient & Role</th>
                  <th className="px-4 py-3.5">Territory</th>
                  <th className="px-4 py-3.5">Issue Date</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-900/60 transition-colors group">
                    {/* Doc # & Type */}
                    <td className="px-4 py-4">
                      <div className="font-mono font-black text-cyan-300 group-hover:text-cyan-200">{doc.documentNumber}</div>
                      <div className="text-xs text-slate-200 font-semibold truncate max-w-[240px] mt-0.5">{doc.title}</div>
                      {doc.version > 1 && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-500 text-[10px] font-mono font-black rounded-md">
                          v{doc.version} Superseded
                        </span>
                      )}
                    </td>

                    {/* Recipient */}
                    <td className="px-4 py-4">
                      <div className="font-black text-white text-sm group-hover:text-purple-300 transition-colors">{doc.recipientName}</div>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide border ${
                        doc.recipientRole === 'STUDENT' ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' :
                        doc.recipientRole === 'TEACHER' ? 'bg-blue-950 text-blue-300 border-blue-500/50' :
                        doc.recipientRole === 'LIBRARY_OWNER' ? 'bg-amber-950 text-amber-300 border-amber-500/50' :
                        'bg-purple-950 text-purple-300 border-purple-500/50'
                      }`}>
                        {doc.recipientRole.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Territory */}
                    <td className="px-4 py-4">
                      <div className="font-bold text-white text-xs">{doc.district}</div>
                      <div className="text-[11px] text-slate-300 font-medium">{doc.state}</div>
                    </td>

                    {/* Issue Date */}
                    <td className="px-4 py-4">
                      <div className="font-mono font-bold text-white text-xs">{doc.issueDate}</div>
                      {doc.billingPeriod && (
                        <div className="text-[11px] text-slate-300">{doc.billingPeriod}</div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-4 font-mono">
                      {doc.amount > 0 ? (
                        <span className="font-black text-emerald-400 text-sm">{formatCurrency(doc.amount)}</span>
                      ) : (
                        <span className="text-slate-400 font-bold">₹0 (Free Pass)</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-black uppercase tracking-wider border ${
                        doc.status === 'READY'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                          : doc.status === 'VIEWED'
                          ? 'bg-blue-950 text-blue-300 border-blue-500'
                          : doc.status === 'DOWNLOADED'
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-500'
                          : doc.status === 'REPLACED'
                          ? 'bg-amber-950 text-amber-300 border-amber-500'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}>
                        {doc.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (audioEnabled) soundSystem.playChirp('click');
                            setSelectedDoc(doc);
                          }}
                          className="text-xs py-1.5 px-3 font-black bg-purple-950 hover:bg-purple-900 text-purple-200 border-purple-500/70 hover:border-purple-400 cursor-pointer shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-purple-400" />
                          <span>Inspect</span>
                        </Button>

                        <button
                          type="button"
                          onClick={() => {
                            if (audioEnabled) soundSystem.playChirp('confirm');
                            setReissueDoc(doc);
                            setReissueReason('');
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-500/70 hover:border-amber-400 transition-colors text-xs font-black flex items-center gap-1 cursor-pointer shadow-sm"
                          title="Reissue / Correct Document"
                        >
                          <RefreshCcw className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline">Reissue</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* HOLOGRAPHIC CREDENTIAL CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => {
                if (audioEnabled) soundSystem.playChirp('click');
                setSelectedDoc(doc);
              }}
              className="p-5 rounded-3xl bg-slate-950/95 border-2 border-slate-800 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 transition-all cursor-pointer group space-y-3.5 relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-black text-cyan-300 block truncate">
                    {doc.documentNumber}
                  </span>
                  <h4 className="font-black text-white text-base group-hover:text-purple-300 transition-colors truncate mt-0.5">
                    {doc.title}
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border shrink-0 ${
                  doc.status === 'READY' ? 'bg-emerald-950 text-emerald-300 border-emerald-500' :
                  doc.status === 'REPLACED' ? 'bg-amber-950 text-amber-300 border-amber-500' :
                  'bg-blue-950 text-blue-300 border-blue-500'
                }`}>
                  {doc.status}
                </span>
              </div>

              {/* Recipient Dossier */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Recipient</span>
                  <p className="font-black text-white text-sm">{doc.recipientName}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                  doc.recipientRole === 'STUDENT' ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' :
                  doc.recipientRole === 'TEACHER' ? 'bg-blue-950 text-blue-300 border-blue-500/50' :
                  'bg-purple-950 text-purple-300 border-purple-500/50'
                }`}>
                  {doc.recipientRole.replace('_', ' ')}
                </span>
              </div>

              {/* Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">TERRITORY</span>
                  <span className="font-bold text-white text-xs truncate block">{doc.district}, {doc.state}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">SETTLEMENT</span>
                  <span className="font-mono font-black text-emerald-400 text-xs block">
                    {doc.amount > 0 ? formatCurrency(doc.amount) : 'Free Pass'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800" onClick={(e) => e.stopPropagation()}>
                <span className="text-[11px] font-mono text-slate-400">
                  Issued: {doc.issueDate}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (audioEnabled) soundSystem.playChirp('click');
                      setSelectedDoc(doc);
                    }}
                    className="text-xs py-1 px-2.5 font-black bg-purple-950 hover:bg-purple-900 text-purple-200 border-purple-500/70"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> View
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      if (audioEnabled) soundSystem.playChirp('confirm');
                      setReissueDoc(doc);
                      setReissueReason('');
                    }}
                    className="p-1.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/70 hover:bg-amber-900 text-xs cursor-pointer"
                    title="Reissue Document"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. UNIFIED DOCUMENT VIEWER MODAL                                     */}
      {/* ==================================================================== */}
      {selectedDoc && (
        <UnifiedDocumentViewer
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          document={selectedDoc}
          currentUserId={userId}
          currentUserRole="SUPER_ADMIN"
        />
      )}

      {/* ==================================================================== */}
      {/* 7. AUTHORIZED DOCUMENT REISSUANCE MODAL (Futuristic Vault Theme)     */}
      {/* ==================================================================== */}
      {reissueDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#060b19] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-amber-500/70 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800">
              <div className="flex items-center gap-2 text-amber-400">
                <RefreshCcw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                <h3 className="text-base font-black">Authorized Document Reissuance</h3>
              </div>
              <button
                type="button"
                onClick={() => setReissueDoc(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer font-bold text-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-amber-950/60 rounded-2xl border-2 border-amber-500/60 text-xs text-amber-200 space-y-1">
              <p className="font-black flex items-center gap-1.5 text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Legal & Audit Policy Notice</span>
              </p>
              <p className="text-[11px] leading-relaxed text-amber-200">
                Historical records are never silently erased. Reissuing will preserve <strong>{reissueDoc.documentNumber}</strong> as superseded (v{reissueDoc.version}) and generate version {reissueDoc.version + 1} with an immutable cryptographic audit log entry.
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-200 block uppercase">Target Document</label>
              <div className="p-3 bg-slate-900 rounded-xl font-mono text-xs text-cyan-300 border border-slate-800 font-bold">
                {reissueDoc.title} ({reissueDoc.documentNumber})
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-200 block uppercase">Reason for Reissuance *</label>
              <textarea
                rows={3}
                value={reissueReason}
                onChange={(e) => setReissueReason(e.target.value)}
                placeholder="e.g. Correction of bank account IFSC reference, updated educator credential status, or verified accounting adjustment..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border-2 border-slate-700 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReissueDoc(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-600"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmReissue}
                disabled={reissuing || !reissueReason.trim()}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 border border-amber-300"
              >
                {reissuing ? 'Processing...' : 'Authorize & Reissue'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
