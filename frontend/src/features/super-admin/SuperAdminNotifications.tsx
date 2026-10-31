import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { locationService } from '../../services/locationService';
import { directiveService } from '../../services/directiveService';
import { 
  SuperAdminDirectiveRecord, 
  DirectiveStatsSummary, 
  AudienceReachEstimate,
  DirectiveCategory,
  DirectivePriority,
  BroadcastAudience,
  BroadcastChannel,
  BroadcastStatus
} from '../../types';
import { Button } from '../../components/common/Button';
import { ExportModal } from '../../components/common/ExportModal';
import { 
  Bell, 
  Send, 
  Megaphone, 
  CheckCircle2, 
  ShieldAlert, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Bot,
  ArrowUpRight, 
  Globe, 
  MapPin, 
  Users, 
  X, 
  Clock, 
  Sparkles,
  AlertCircle,
  Volume2,
  VolumeX,
  Radio,
  Zap,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Copy,
  Check,
  Grid,
  List,
  Layers,
  AlertTriangle,
  FileText,
  CheckCheck,
  Activity,
  ChevronRight,
  Printer,
  Sliders,
  Shield,
  Plus
} from 'lucide-react';

// Web Audio API Synthesizer for Cyber Cognitive Directives Feedback
type SfxType = 'hover' | 'click' | 'success' | 'alert' | 'warp' | 'confirm' | 'toggle';

class DirectivesSoundEngine {
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
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(1080, now + 0.03);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
        gain.gain.setValueAtTime(0.035, now);
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
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.setValueAtTime(180, now + 0.09);
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
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.setValueAtTime(460, now + 0.04);
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

const soundEngine = new DirectivesSoundEngine();

type DirectivesTab = 'ACTIVE_DIRECTIVES' | 'DISPATCH_STUDIO' | 'AUDIENCE_MATRIX' | 'DELIVERY_ANALYTICS';
type ViewMode = 'CARDS' | 'TABLE';
type ChannelSimulatorTab = 'IN_APP' | 'WHATSAPP' | 'SMS' | 'EMAIL';

export const SuperAdminNotifications: React.FC = () => {
  const { showToast } = useToast();

  // Primary State
  const [directives, setDirectives] = useState<SuperAdminDirectiveRecord[]>([]);
  const [stats, setStats] = useState<DirectiveStatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Tab & View Modes
  const [activeTab, setActiveTab] = useState<DirectivesTab>('ACTIVE_DIRECTIVES');
  const [viewMode, setViewMode] = useState<ViewMode>('CARDS');
  const [simulatorChannel, setSimulatorChannel] = useState<ChannelSimulatorTab>('IN_APP');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [audienceFilter, setAudienceFilter] = useState<string>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal & Inspection Drawers
  const [selectedDirective, setSelectedDirective] = useState<SuperAdminDirectiveRecord | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Broadcast Composer State
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newCategory, setNewCategory] = useState<DirectiveCategory>('POLICY_CIRCULAR');
  const [newPriority, setNewPriority] = useState<DirectivePriority>('IMPORTANT');
  const [newAudience, setNewAudience] = useState<BroadcastAudience>('ALL_USERS');
  const [newDistrict, setNewDistrict] = useState('Pan-India');
  const [newChannels, setNewChannels] = useState<BroadcastChannel[]>(['IN_APP', 'WHATSAPP']);
  const [newRequiresAck, setNewRequiresAck] = useState(true);
  const [newExpiresAt, setNewExpiresAt] = useState('2026-11-30');
  const [dispatching, setDispatching] = useState(false);

  const activeDistricts = locationService.getActiveDistricts();

  const sfx = (type: SfxType) => {
    if (!isAudioMuted) soundEngine.play(type);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [list, statsData] = await Promise.all([
        directiveService.getDirectives({
          search,
          category: categoryFilter,
          priority: priorityFilter,
          audience: audienceFilter,
          district: districtFilter,
          status: statusFilter
        }),
        directiveService.getDirectiveStats()
      ]);
      setDirectives(list);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load directives', err);
      showToast('Failed to load directives data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter, priorityFilter, audienceFilter, districtFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sfx('click');
    loadData();
  };

  // Real-time audience reach estimate for composer
  const reachEstimate: AudienceReachEstimate = useMemo(() => {
    return directiveService.estimateAudienceReach(newAudience, newDistrict);
  }, [newAudience, newDistrict]);

  const toggleChannel = (ch: BroadcastChannel) => {
    sfx('toggle');
    setNewChannels(prev => 
      prev.includes(ch) 
        ? (prev.length > 1 ? prev.filter(c => c !== ch) : prev) 
        : [...prev, ch]
    );
  };

  const handleDispatchDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) {
      showToast('Title and directive message are required', 'warning');
      return;
    }

    try {
      sfx('warp');
      setDispatching(true);
      await directiveService.createDirective({
        title: newTitle,
        message: newMessage,
        category: newCategory,
        priority: newPriority,
        targetAudience: newAudience,
        district: newDistrict,
        channels: newChannels,
        requiresAck: newRequiresAck,
        expiresAt: newExpiresAt
      });

      sfx('success');
      showToast('Directive successfully dispatched across selected channels', 'success');
      setNewTitle('');
      setNewMessage('');
      setActiveTab('ACTIVE_DIRECTIVES');
      await loadData();
    } catch {
      showToast('Failed to dispatch broadcast directive', 'error');
    } finally {
      setDispatching(false);
    }
  };

  const handleResend = async (id: string) => {
    sfx('confirm');
    const updated = await directiveService.resendBroadcast(id);
    if (updated) {
      showToast(`Directive ${id} re-broadcasted to unread recipients`, 'success');
      await loadData();
    }
  };

  const handleUpdateStatus = async (id: string, status: BroadcastStatus) => {
    sfx('click');
    await directiveService.updateStatus(id, status);
    showToast(`Directive ${id} status updated to ${status}`, 'info');
    await loadData();
  };

  const handleCopyId = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sfx('click');
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Directive ID copied to clipboard', 'info');
  };

  // Semantic styles where background explicitly matches the text color and category
  const getSemanticPriorityStyle = (priority: DirectivePriority) => {
    switch (priority) {
      case 'EMERGENCY_SOS':
        return {
          bg: 'bg-rose-950/80 border-2 border-rose-500/70 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.3)]',
          badge: 'bg-rose-900 border border-rose-400 text-rose-100 font-black',
          textColor: 'text-rose-200'
        };
      case 'CRITICAL_URGENT':
        return {
          bg: 'bg-amber-950/80 border-2 border-amber-500/70 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.3)]',
          badge: 'bg-amber-900 border border-amber-400 text-amber-100 font-black',
          textColor: 'text-amber-200'
        };
      case 'IMPORTANT':
        return {
          bg: 'bg-purple-950/80 border-2 border-purple-500/70 text-purple-100 shadow-[0_0_25px_rgba(168,85,247,0.3)]',
          badge: 'bg-purple-900 border border-purple-400 text-purple-100 font-black',
          textColor: 'text-purple-200'
        };
      case 'ROUTINE':
      default:
        return {
          bg: 'bg-cyan-950/80 border-2 border-cyan-500/70 text-cyan-100 shadow-[0_0_25px_rgba(6,182,212,0.3)]',
          badge: 'bg-cyan-900 border border-cyan-400 text-cyan-100 font-black',
          textColor: 'text-cyan-200'
        };
    }
  };

  const getSemanticCategoryStyle = (category: DirectiveCategory) => {
    switch (category) {
      case 'EMERGENCY_ALERT':
        return 'bg-rose-950/80 border border-rose-500/60 text-rose-200';
      case 'POLICY_CIRCULAR':
        return 'bg-purple-950/80 border border-purple-500/60 text-purple-200';
      case 'PROMOTIONAL_CAMPAIGN':
        return 'bg-cyan-950/80 border border-cyan-500/60 text-cyan-200';
      case 'REGULATORY_TAX':
        return 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-200';
      case 'SYSTEM_MAINTENANCE':
        return 'bg-blue-950/80 border border-blue-500/60 text-blue-200';
      default:
        return 'bg-slate-900 border border-slate-700 text-slate-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto cyber-grid-bg min-h-screen">
      {/* =========================================================================
          IMMERSIVE SOVEREIGN COMMAND DECK HEADER (High-Contrast Cyber Glass)
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-purple-500/40 p-6 shadow-[0_0_35px_rgba(168,85,247,0.2)] backdrop-blur-2xl">
        {/* Futuristic Ambient Glow Background Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-purple-500/25 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-500/60 text-purple-200 text-xs font-mono font-bold tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>SOVEREIGN BROADCAST DECK // DLT & MULTI-CHANNEL HUB v5.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Directives & Multi-Channel Broadcast Center</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 font-bold">
                STREAM ACTIVE
              </span>
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed font-semibold">
              Issue official sovereign circulars, emergency disaster protocols, and promotional broadcasts directly to In-App push, WhatsApp Business, SMS, and Email.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Audio Synthesizer Toggle */}
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

            {/* AI Notification Center Switch */}
            <Link
              to="/super-admin/ai-notifications"
              className="px-3.5 py-2 rounded-xl border border-brand-500/60 bg-brand-950/80 hover:bg-brand-900 text-brand-200 hover:text-white text-xs font-mono font-black flex items-center gap-1.5 shadow-lg shadow-brand-500/20 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-brand-400 animate-pulse" />
              <span>AI Offer & Notification Center</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            {/* Quick Dispatch Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sfx('warp');
                setActiveTab('DISPATCH_STUDIO');
              }}
              className="border-purple-500/60 bg-purple-950/80 hover:bg-purple-900 text-purple-200 hover:text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5 mr-1.5 text-purple-300" />
              Dispatch Broadcast
            </Button>

            {/* Emergency SOS Quick Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sfx('alert');
                setNewCategory('EMERGENCY_ALERT');
                setNewPriority('EMERGENCY_SOS');
                setNewTitle('URGENT: DISASTER & WEATHER SAFETY DIRECTIVE');
                setNewMessage('All educational centers and study halls are advised to activate emergency failover measures immediately.');
                setActiveTab('DISPATCH_STUDIO');
              }}
              className="border-rose-500/60 bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-rose-400 animate-pulse" />
              Emergency SOS
            </Button>

            {/* Export Registry */}
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
              Export Dossier
            </Button>
          </div>
        </div>

        {/* =========================================================================
            SEMANTIC COLOR-CODED LIVE TELEMETRY STRIP
            (Background colors actively match category text colors)
            ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Metric 1: Total Directives Dispatched (Purple) */}
          <div className="p-5 rounded-2xl bg-purple-950/60 border-2 border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.2)] relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-purple-200">
                Total Directives
              </span>
              <span className="text-[10px] font-black text-purple-100 bg-purple-900/90 px-2.5 py-0.5 rounded-full border border-purple-400 font-mono">
                REGISTRY
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              {stats?.totalDirectives ?? directives.length} Circulars
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-purple-300 font-bold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-purple-400" /> Official Policy Log
              </span>
            </div>
          </div>

          {/* Metric 2: Active Directives (Emerald) */}
          <div className="p-5 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.2)] relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-200">
                Active Enforcements
              </span>
              <span className="text-[10px] font-black text-emerald-100 bg-emerald-900/90 px-2.5 py-0.5 rounded-full border border-emerald-400 font-mono">
                CURRENT
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-200 tracking-tight">
              {stats?.activeAlerts ?? 4} In Effect
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> High Acknowledgment
              </span>
            </div>
          </div>

          {/* Metric 3: Total Audience Reach (Cyan) */}
          <div className="p-5 rounded-2xl bg-cyan-950/60 border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.2)] relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-200">
                Audience Reach
              </span>
              <span className="text-[10px] font-black text-cyan-100 bg-cyan-900/90 px-2.5 py-0.5 rounded-full border border-cyan-400 font-mono">
                MULTI-CHANNEL
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              {stats?.totalReach ? stats.totalReach.toLocaleString('en-IN') : '5,340'} Delivered
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-cyan-300 font-bold flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Pan-India Recipients
              </span>
            </div>
          </div>

          {/* Metric 4: Emergency SOS Active (Rose / Amber) */}
          <div className="p-5 rounded-2xl bg-rose-950/60 border-2 border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.2)] relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-rose-200">
                Emergency SOS Alerts
              </span>
              <span className="text-[10px] font-black text-rose-100 bg-rose-900/90 px-2.5 py-0.5 rounded-full border border-rose-400 font-mono animate-pulse">
                PRIORITY 1
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-rose-200 tracking-tight">
              {stats?.emergencySosCount ?? 1} Active Alert
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-rose-300 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Multi-District Warning
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cyber HUD Navigation Tabs */}
      <div className="p-2 rounded-2xl border-2 border-slate-700/80 bg-slate-950 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              sfx('click');
              setActiveTab('ACTIVE_DIRECTIVES');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'ACTIVE_DIRECTIVES'
                ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400'
                : 'text-slate-200 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Bell className="w-4 h-4" />
            Directives Registry ({directives.length})
          </button>

          <button
            onClick={() => {
              sfx('click');
              setActiveTab('DISPATCH_STUDIO');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'DISPATCH_STUDIO'
                ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400'
                : 'text-slate-200 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Multi-Channel Dispatch Studio
          </button>

          <button
            onClick={() => {
              sfx('click');
              setActiveTab('AUDIENCE_MATRIX');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'AUDIENCE_MATRIX'
                ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400'
                : 'text-slate-200 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            Audience Matrix
          </button>

          <button
            onClick={() => {
              sfx('click');
              setActiveTab('DELIVERY_ANALYTICS');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'DELIVERY_ANALYTICS'
                ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400'
                : 'text-slate-200 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Activity className="w-4 h-4" />
            Delivery Telemetry
          </button>
        </div>

        {/* View mode toggle (Cards vs Table) */}
        {activeTab === 'ACTIVE_DIRECTIVES' && (
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
              title="Compact Dense Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          TAB 1: ACTIVE DIRECTIVES & REGISTRY
          ========================================================================= */}
      {activeTab === 'ACTIVE_DIRECTIVES' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filters Bar */}
          <div className="p-5 rounded-2xl border-2 border-slate-700/80 bg-slate-950 shadow-xl space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                <input
                  placeholder="Search directive title, message body, target audience, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-700 bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-400 font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    sfx('toggle');
                    setCategoryFilter(e.target.value);
                  }}
                  className="bg-slate-900 border-2 border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none font-bold cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="POLICY_CIRCULAR">Policy Circular</option>
                  <option value="EMERGENCY_ALERT">Emergency Alert</option>
                  <option value="PROMOTIONAL_CAMPAIGN">Promotional Campaign</option>
                  <option value="REGULATORY_TAX">Regulatory Tax</option>
                  <option value="SYSTEM_MAINTENANCE">System Maintenance</option>
                </select>

                <select
                  value={audienceFilter}
                  onChange={(e) => {
                    sfx('toggle');
                    setAudienceFilter(e.target.value);
                  }}
                  className="bg-slate-900 border-2 border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none font-bold cursor-pointer"
                >
                  <option value="ALL">All Audiences</option>
                  <option value="ALL_USERS">All Platform Users</option>
                  <option value="STUDENTS">Students</option>
                  <option value="TEACHERS">Educators</option>
                  <option value="LIBRARIES">Study Halls</option>
                  <option value="DISTRICT_ADMINS">District Admins</option>
                </select>

                <select
                  value={districtFilter}
                  onChange={(e) => {
                    sfx('toggle');
                    setDistrictFilter(e.target.value);
                  }}
                  className="bg-slate-900 border-2 border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none font-bold cursor-pointer"
                >
                  <option value="ALL">All Territories</option>
                  <option value="Pan-India">Pan-India</option>
                  {activeDistricts.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>

                <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md cursor-pointer">
                  Filter Registry
                </Button>
              </div>
            </form>

            {/* Quick Priority Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mr-2">
                Priority Filter:
              </span>
              {[
                { label: 'All Priorities', value: 'ALL', bg: 'bg-slate-900 border-slate-700 text-white' },
                { label: 'Emergency SOS', value: 'EMERGENCY_SOS', bg: 'bg-rose-950/80 border-rose-500/70 text-rose-200' },
                { label: 'Critical Urgent', value: 'CRITICAL_URGENT', bg: 'bg-amber-950/80 border-amber-500/70 text-amber-200' },
                { label: 'Important', value: 'IMPORTANT', bg: 'bg-purple-950/80 border-purple-500/70 text-purple-200' },
                { label: 'Routine', value: 'ROUTINE', bg: 'bg-cyan-950/80 border-cyan-500/70 text-cyan-200' }
              ].map(p => (
                <button
                  key={p.value}
                  onClick={() => {
                    sfx('toggle');
                    setPriorityFilter(p.value);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    priorityFilter === p.value
                      ? `${p.bg} ring-2 ring-white/30 shadow-lg scale-105`
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Directives Display */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-purple-200 text-xs mt-3 font-mono font-bold">Synchronizing active directives...</p>
            </div>
          ) : directives.length === 0 ? (
            <div className="text-center py-20 text-slate-300 p-8 rounded-3xl bg-slate-950 border-2 border-slate-800">
              <Megaphone className="w-14 h-14 text-slate-400 mx-auto mb-3" />
              <p className="font-bold text-white text-base">No directives found matching filter criteria</p>
              <p className="text-xs text-slate-300 mt-1">Try resetting search filters or compose a new circular</p>
            </div>
          ) : viewMode === 'CARDS' ? (
            /* CYBER CARDS VIEW: Background explicitly adapts to priority and category */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {directives.map(dir => {
                const priStyle = getSemanticPriorityStyle(dir.priority);
                const catClass = getSemanticCategoryStyle(dir.category);

                return (
                  <div
                    key={dir.id}
                    className={`p-5 rounded-2xl transition-all hover:scale-[1.01] flex flex-col justify-between ${priStyle.bg}`}
                  >
                    <div>
                      {/* Top Header of Directive Card */}
                      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span 
                            onClick={() => handleCopyId(dir.id)}
                            className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-slate-950 border border-white/20 text-white font-mono cursor-pointer flex items-center gap-1"
                            title="Click to copy ID"
                          >
                            {dir.id}
                            <Copy className="w-3 h-3 text-slate-400 hover:text-white" />
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${priStyle.badge}`}>
                            {dir.priority.replace('_', ' ')}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-slate-200 font-bold">
                          {dir.date}
                        </span>
                      </div>

                      {/* Directive Title & Category */}
                      <div className="mb-2">
                        <h4 className="text-sm font-black text-white tracking-wide">
                          {dir.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${catClass}`}>
                            {dir.category.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-200 font-bold">
                            📍 {dir.district || 'Pan-India'}
                          </span>
                        </div>
                      </div>

                      {/* Directive Message Body */}
                      <p className="text-slate-100 text-xs leading-relaxed p-3 rounded-xl bg-slate-950/80 border border-white/10 my-3 font-medium">
                        {dir.message}
                      </p>

                      {/* Multi-Channel Icons & Target Audience */}
                      <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-t border-white/10 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-300 block">Target Audience:</span>
                          <span className="text-white font-black text-xs">{dir.targetAudienceLabel}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {dir.channels.map(ch => (
                            <span 
                              key={ch}
                              className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-950/90 border border-white/20 text-white"
                            >
                              {ch === 'IN_APP' ? '📱 PUSH' : ch === 'WHATSAPP' ? '💬 WA' : ch === 'SMS' ? '✉️ SMS' : '📧 EMAIL'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metadata & Quick Actions */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-slate-200">
                          Recipients: <strong className="text-white font-mono">{dir.deliveredCount}</strong>
                        </span>
                        <span className="text-[11px] font-bold text-emerald-300">
                          Open: <strong className="font-mono">{dir.openRate}%</strong>
                        </span>
                        {dir.requiresAck && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                            ACK: {dir.acknowledgmentRate ?? 0}%
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            sfx('click');
                            setSelectedDirective(dir);
                          }}
                          className="bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-white/20 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-cyan-300" />
                          Dossier
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResend(dir.id)}
                          className="bg-purple-950/80 hover:bg-purple-900 text-purple-200 font-bold text-xs p-2 rounded-xl border border-purple-500/40 cursor-pointer"
                          title="Re-broadcast to Unread Recipients"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
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
                      <th className="py-4 px-5">ID & Time</th>
                      <th className="py-4 px-5">Priority & Category</th>
                      <th className="py-4 px-5">Title & Directive Content</th>
                      <th className="py-4 px-5">Target Audience</th>
                      <th className="py-4 px-5">Channels</th>
                      <th className="py-4 px-5">Reach & Open</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs">
                    {directives.map(dir => {
                      const priStyle = getSemanticPriorityStyle(dir.priority);
                      const catClass = getSemanticCategoryStyle(dir.category);

                      return (
                        <tr key={dir.id} className="hover:bg-slate-900/80 transition-colors">
                          <td className="py-4 px-5 font-mono">
                            <span 
                              onClick={() => handleCopyId(dir.id)}
                              className="px-2 py-0.5 rounded text-[11px] font-black bg-slate-900 border border-slate-700 text-cyan-200 cursor-pointer"
                            >
                              {dir.id}
                            </span>
                            <p className="text-white text-xs font-bold mt-1">{dir.date}</p>
                          </td>

                          <td className="py-4 px-5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${priStyle.badge}`}>
                              {dir.priority.replace('_', ' ')}
                            </span>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${catClass}`}>
                              {dir.category.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="py-4 px-5 max-w-sm">
                            <p className="font-black text-white text-xs">{dir.title}</p>
                            <p className="text-slate-200 text-xs mt-0.5 line-clamp-2">{dir.message}</p>
                          </td>

                          <td className="py-4 px-5">
                            <p className="font-bold text-white">{dir.targetAudienceLabel}</p>
                            <p className="text-cyan-300 text-[10px] font-semibold">📍 {dir.district || 'Pan-India'}</p>
                          </td>

                          <td className="py-4 px-5">
                            <div className="flex flex-wrap gap-1">
                              {dir.channels.map(ch => (
                                <span key={ch} className="px-1.5 py-0.5 rounded text-[10px] font-black bg-slate-900 text-white border border-slate-700">
                                  {ch}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-4 px-5 font-mono">
                            <p className="text-white font-bold">{dir.deliveredCount} recipients</p>
                            <p className="text-emerald-300 font-bold">{dir.openRate}% open rate</p>
                          </td>

                          <td className="py-4 px-5 text-right space-x-1.5 whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                sfx('click');
                                setSelectedDirective(dir);
                              }}
                              className="text-cyan-200 hover:text-white hover:bg-cyan-950 p-2 h-8 w-8 rounded-xl border border-cyan-500/40 cursor-pointer"
                              title="View Directive Dossier"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleResend(dir.id)}
                              className="text-purple-300 hover:text-white hover:bg-purple-950 p-2 h-8 w-8 rounded-xl border border-purple-500/40 cursor-pointer"
                              title="Resend to Unread"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
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
          TAB 2: MULTI-CHANNEL DISPATCH STUDIO & LIVE PHONE SIMULATOR
          ========================================================================= */}
      {activeTab === 'DISPATCH_STUDIO' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Left Form: Broadcast Composer */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-950 border-2 border-purple-500/50 shadow-2xl space-y-5">
            <div className="border-b border-purple-500/30 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-5 h-5 text-purple-400" />
                <h3 className="font-black text-white text-base uppercase tracking-wider">
                  Sovereign Broadcast Dispatch Composer
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-500/40">
                MULTI-CHANNEL SIMULATOR READY
              </span>
            </div>

            <form onSubmit={handleDispatchDirective} className="space-y-4 text-xs">
              {/* Category & Priority Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-1">Directive Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DirectiveCategory)}
                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-purple-400 cursor-pointer"
                  >
                    <option value="POLICY_CIRCULAR">Policy Circular</option>
                    <option value="EMERGENCY_ALERT">Emergency Alert</option>
                    <option value="PROMOTIONAL_CAMPAIGN">Promotional Campaign</option>
                    <option value="REGULATORY_TAX">Regulatory Tax</option>
                    <option value="SYSTEM_MAINTENANCE">System Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-1">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as DirectivePriority)}
                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-purple-400 cursor-pointer"
                  >
                    <option value="ROUTINE">Routine</option>
                    <option value="IMPORTANT">Important</option>
                    <option value="CRITICAL_URGENT">Critical Urgent</option>
                    <option value="EMERGENCY_SOS">Emergency SOS</option>
                  </select>
                </div>
              </div>

              {/* Audience & Territory Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-1">Target Audience</label>
                  <select
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value as BroadcastAudience)}
                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-purple-400 cursor-pointer"
                  >
                    <option value="ALL_USERS">All Platform Users</option>
                    <option value="STUDENTS">Enrolled Students Only</option>
                    <option value="TEACHERS">Home Tutors Only</option>
                    <option value="LIBRARIES">Study Library Owners</option>
                    <option value="DISTRICT_ADMINS">District Coordinators</option>
                    <option value="OPERATORS">Digitizer & Mock Operators</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-200 mb-1">Target Territory</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-purple-400 cursor-pointer"
                  >
                    <option value="Pan-India">Pan-India (All Districts)</option>
                    {activeDistricts.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delivery Channels Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-200 mb-2">Delivery Channels</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'IN_APP', label: 'In-App Push', icon: Bell },
                    { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
                    { id: 'SMS', label: 'Telecom SMS', icon: Smartphone },
                    { id: 'EMAIL', label: 'Email Circular', icon: Mail },
                  ].map(ch => {
                    const isSelected = newChannels.includes(ch.id as BroadcastChannel);
                    const Icon = ch.icon;
                    return (
                      <button
                        type="button"
                        key={ch.id}
                        onClick={() => toggleChannel(ch.id as BroadcastChannel)}
                        className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-950/80 border-purple-500 text-white shadow-lg shadow-purple-950/50'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-purple-300' : 'text-slate-400'}`} />
                        <span className="font-black text-xs block">{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Body */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-200 mb-1">Directive Title *</label>
                <input
                  placeholder="e.g. Mandatory Biometric Inspection Mandate"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-700 bg-slate-900 text-white text-xs font-bold focus:border-purple-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-200 mb-1">Directive Message Body *</label>
                <textarea
                  rows={4}
                  placeholder="Type official notification circular text..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-700 bg-slate-900 text-white text-xs font-medium focus:border-purple-400 outline-none leading-relaxed"
                  required
                />
              </div>

              {/* Acknowledgment & Expiry */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRequiresAck}
                    onChange={(e) => setNewRequiresAck(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                  />
                  <span className="font-bold text-slate-200 text-xs">Mandatory Recipient Acknowledgment</span>
                </label>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">Expiry / Valid Until Date</label>
                  <input
                    type="date"
                    value={newExpiresAt}
                    onChange={(e) => setNewExpiresAt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-300 font-bold">
                  Estimated Reach: <strong className="text-cyan-300 font-mono text-sm">{reachEstimate.totalRecipients}</strong> verified devices
                </div>

                <Button
                  type="submit"
                  disabled={dispatching}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-lg cursor-pointer"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  {dispatching ? 'Dispatching Across Gateway...' : 'Authorize & Dispatch Broadcast'}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Preview: Live Multi-Channel Phone Simulator */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-950 border-2 border-cyan-500/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-300" />
                <h3 className="font-black text-white text-sm uppercase tracking-wider">
                  Live Multi-Channel Device Simulator
                </h3>
              </div>
            </div>

            {/* Simulator Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-700">
              {(['IN_APP', 'WHATSAPP', 'SMS', 'EMAIL'] as ChannelSimulatorTab[]).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    sfx('toggle');
                    setSimulatorChannel(tab);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    simulatorChannel === tab
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {tab === 'IN_APP' ? '📱 PUSH' : tab === 'WHATSAPP' ? '💬 WA' : tab === 'SMS' ? '✉️ SMS' : '📧 EMAIL'}
                </button>
              ))}
            </div>

            {/* Smartphone Graphic Screen Mockup */}
            <div className="p-4 rounded-3xl bg-slate-900 border-4 border-slate-700 shadow-inner min-h-[380px] flex flex-col justify-between">
              {/* Smartphone Status Bar */}
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-2 mb-3">
                <span>09:41 AM</span>
                <span className="font-bold text-white">FOCUSPOINT SECURE // 5G</span>
                <span>100% 🔋</span>
              </div>

              {/* Dynamic Screen Content based on Simulator Tab */}
              <div className="flex-1">
                {simulatorChannel === 'IN_APP' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border-2 border-purple-500 shadow-lg space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-600 text-white">
                          <Bell className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-black text-purple-200">FocusPoint Sovereign Push</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Just Now</span>
                    </div>
                    <h5 className="font-black text-white text-xs">{newTitle || 'Official Directive Title'}</h5>
                    <p className="text-slate-200 text-xs leading-relaxed">{newMessage || 'Directive body message preview will appear here...'}</p>
                    {newRequiresAck && (
                      <div className="pt-2">
                        <button className="w-full py-1.5 rounded-lg bg-purple-600 text-white font-black text-xs">
                          Acknowledge & Sign Receipt
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {simulatorChannel === 'WHATSAPP' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500/70 shadow-lg space-y-2 animate-fadeIn text-xs">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-emerald-500/30">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                        FP
                      </div>
                      <span className="font-black text-white text-[11px]">FocusPoint System Bot ✔️</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-slate-100">
                      <p className="font-black text-emerald-300 text-xs">📢 {newTitle || 'Official Circular Title'}</p>
                      <p className="mt-1 text-slate-200 text-xs leading-relaxed">{newMessage || 'WhatsApp notification text rendered with official template header...'}</p>
                      <span className="text-[9px] text-slate-400 block text-right mt-1 font-mono">09:41 AM ✓✓</span>
                    </div>
                  </div>
                )}

                {simulatorChannel === 'SMS' && (
                  <div className="p-4 rounded-2xl bg-blue-950/80 border-2 border-blue-500/70 shadow-lg space-y-2 animate-fadeIn text-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono text-blue-300">
                      <span>Sender: <strong>VK-FOCUSP</strong></span>
                      <span>DLT Approved</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/40 text-slate-100 font-mono text-[11px] leading-relaxed">
                      [FOCUSPOINT] {newTitle ? newTitle.toUpperCase() : 'ALERT'}: {newMessage || 'Text message body transmitted via telecom carrier gateway...'}
                    </div>
                  </div>
                )}

                {simulatorChannel === 'EMAIL' && (
                  <div className="p-4 rounded-2xl bg-indigo-950/80 border-2 border-indigo-500/70 shadow-lg space-y-2 animate-fadeIn text-xs">
                    <div className="text-[10px] font-mono text-indigo-300 border-b border-indigo-500/30 pb-1.5">
                      From: <strong>circulars@focuspoint.org.in</strong> (DKIM Verified)
                    </div>
                    <h5 className="font-black text-white text-xs">{newTitle || 'Official Executive Circular'}</h5>
                    <p className="text-slate-200 text-xs leading-relaxed p-2.5 rounded-lg bg-slate-950 border border-indigo-500/40">
                      {newMessage || 'Formal email circular containing complete legal and policy breakdown...'}
                    </p>
                  </div>
                )}
              </div>

              {/* Live Audience Breakdown Card */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Targeted Demographic:</span>
                  <span className="text-white font-bold">{newAudience}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Territory Boundary:</span>
                  <span className="text-cyan-300 font-bold">{newDistrict}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Channel Deliverability:</span>
                  <span className="text-emerald-300 font-bold">99.4% Gateway SLA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: AUDIENCE MATRIX & DEMOGRAPHICS
          ========================================================================= */}
      {activeTab === 'AUDIENCE_MATRIX' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-emerald-950/40 border-2 border-emerald-500/50 shadow-xl">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-300" />
              Pan-India Broadcast Reach & Demographic Matrix
            </h3>
            <p className="text-xs text-slate-200 mt-1 font-semibold">
              Real-time directory distribution across Eastern UP districts and platform participant roles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { role: 'Enrolled Students', count: '3,600+ Users', pct: '67.4%', bg: 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200' },
              { role: 'Home Tuition Educators', count: '280+ Faculty', pct: '18.2%', bg: 'bg-purple-950/80 border-purple-500/50 text-purple-200' },
              { role: 'Self-Study Libraries', count: '64+ Halls', pct: '8.5%', bg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' },
              { role: 'District Coordinators', count: '6 Districts', pct: '100% Active', bg: 'bg-amber-950/80 border-amber-500/50 text-amber-200' }
            ].map(m => (
              <div key={m.role} className={`p-5 rounded-2xl border-2 ${m.bg}`}>
                <span className="text-xs font-bold uppercase block">{m.role}</span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">{m.count}</span>
                <span className="text-[10px] font-bold block mt-1">{m.pct} Gateway Coverage</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: DELIVERY ANALYTICS & TELEMETRY
          ========================================================================= */}
      {activeTab === 'DELIVERY_ANALYTICS' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-amber-950/40 border-2 border-amber-500/50 shadow-xl">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-300" />
              Multi-Channel Transmission Telemetry
            </h3>
            <p className="text-xs text-slate-200 mt-1 font-semibold">
              Latency radar, DLT registration validity, and open rates across WebSocket, WhatsApp, SMS, and Email.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-slate-950 border-2 border-slate-700 space-y-3">
              <h4 className="font-black text-white text-sm uppercase">Channel Delivery Success Rate</h4>
              {[
                { ch: 'In-App WebSocket Push', rate: 99.8, color: 'bg-purple-500' },
                { ch: 'WhatsApp Business API', rate: 94.2, color: 'bg-emerald-500' },
                { ch: 'Telecom SMS Gateway', rate: 98.4, color: 'bg-blue-500' },
                { ch: 'Official DKIM Email', rate: 84.6, color: 'bg-indigo-500' }
              ].map(c => (
                <div key={c.ch} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-200">{c.ch}</span>
                    <span className="text-cyan-300 font-mono">{c.rate}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-700">
                    <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.rate}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border-2 border-slate-700 space-y-3">
              <h4 className="font-black text-white text-sm uppercase">Gateway Integration Status</h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex justify-between items-center">
                  <span className="text-emerald-200 font-bold">Native In-App Socket Stream</span>
                  <span className="font-mono text-emerald-300 font-black">ONLINE (0ms latency)</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 flex justify-between items-center">
                  <span className="text-amber-200 font-bold">WhatsApp Business Gateway</span>
                  <span className="font-mono text-amber-300 font-black">SIMULATED (Hook Ready)</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 flex justify-between items-center">
                  <span className="text-blue-200 font-bold">Telecom SMS Gateway (DLT)</span>
                  <span className="font-mono text-blue-300 font-black">SIMULATED (Template Bound)</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 flex justify-between items-center">
                  <span className="text-purple-200 font-bold">SMTP / DKIM Email Gateway</span>
                  <span className="font-mono text-purple-300 font-black">CONFIGURED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DIRECTIVE DOSSIER INSPECTION MODAL
          ========================================================================= */}
      {selectedDirective && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-purple-500/60 bg-slate-950">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-950 text-purple-200 border-2 border-purple-500/60">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Directive Dossier & Channel Audit</h3>
                  <p className="text-purple-300 text-xs font-mono font-bold">
                    {selectedDirective.id} • Dispatched by {selectedDirective.authorName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDirective(null)}
                className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs bg-slate-950">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Title:</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getSemanticPriorityStyle(selectedDirective.priority).badge}`}>
                    {selectedDirective.priority}
                  </span>
                </div>
                <h4 className="text-sm font-black text-white">{selectedDirective.title}</h4>
                <p className="text-slate-200 leading-relaxed font-medium mt-1">{selectedDirective.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-700">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Audience:</span>
                  <p className="font-bold text-white mt-0.5">{selectedDirective.targetAudienceLabel}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Territory Jurisdiction:</span>
                  <p className="font-bold text-cyan-300 mt-0.5">{selectedDirective.district || 'Pan-India'} ({selectedDirective.state || 'UP'})</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Delivered Count:</span>
                  <p className="font-mono text-white font-bold mt-0.5">{selectedDirective.deliveredCount} devices</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Open Rate:</span>
                  <p className="font-mono text-emerald-300 font-bold mt-0.5">{selectedDirective.openRate}%</p>
                </div>
              </div>

              {/* Multi-channel badges */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Dispatched Channels:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedDirective.channels.map(ch => (
                    <span key={ch} className="px-3 py-1 rounded-lg bg-slate-950 border border-purple-500/40 text-purple-200 font-black text-xs">
                      {ch}
                    </span>
                  ))}
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
                  navigator.clipboard.writeText(JSON.stringify(selectedDirective, null, 2));
                  showToast('Directive JSON copied to clipboard', 'info');
                }}
                className="border-slate-700 text-slate-200 hover:text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5 text-cyan-300" />
                Copy Directive JSON
              </Button>

              <Button
                onClick={() => setSelectedDirective(null)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-5 py-2 rounded-xl cursor-pointer"
              >
                Dismiss Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EXPORT MODAL
          ========================================================================= */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={directives.map(d => ({
          ID: d.id,
          Title: d.title,
          Category: d.category,
          Priority: d.priority,
          Audience: d.targetAudienceLabel,
          District: d.district || 'Pan-India',
          Channels: d.channels.join('; '),
          Date: d.date,
          DeliveredCount: d.deliveredCount,
          OpenRate: `${d.openRate}%`,
          RequiresAck: d.requiresAck ? 'YES' : 'NO',
          Status: d.status,
          Author: d.authorName
        }))}
        title="FOCUSPOINT Sovereign Directives & Multi-Channel Broadcast Log"
        filename="focuspoint_directives_broadcast_registry"
      />
    </div>
  );
};
