// FOCUSPOINT Super Admin — Pan-India Self-Study Library Students & Seat Allocations Registry
// Futuristic Cyber-HUD console with 0ms spatial filtering, 2D Holographic Seat Radar,
// Multi-Channel Fee Reconciliation, Real-Time Shift Reallocation, Universal ID Cards, and Acoustic Synthesizer.

import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { superAdminService } from '../../services/superAdminService';
import { documentService } from '../../services/documentService';
import { locationService } from '../../services/locationService';
import { auditService } from '../../services/auditService';
import { mockStore } from '../../mock/store';
import { 
  LibraryStudentRecord,
  UniversalIDCardData 
} from '../../types';
import { UniversalIdCardModal } from '../../components/common/UniversalIdCardModal';
import { ExportModal } from '../../components/common/ExportModal';
import { 
  Building2, 
  Search, 
  Download, 
  Smartphone, 
  Store, 
  CreditCard, 
  Clock, 
  MapPin, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Users, 
  Calendar,
  Layers,
  X,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Volume2,
  VolumeX,
  Zap,
  RefreshCw,
  UserPlus,
  Edit3,
  Printer,
  Receipt,
  RotateCcw,
  Compass,
  Briefcase,
  Armchair,
  Check,
  ArrowRight,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Percent,
  Activity,
  Sparkles,
  QrCode,
  Award,
  Phone,
  Mail,
  UserX,
  UserCheck
} from 'lucide-react';

// Cyber Acoustic Synthesizer for tactile audio feedback
type SfxType = 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'success';

const playCyberSound = (type: SfxType) => {
  try {
    const isMuted = localStorage.getItem('fp_cyber_sound') === 'muted';
    if (isMuted) return;

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
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.16);
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
        osc.frequency.setValueAtTime(720, now);
        osc.frequency.setValueAtTime(540, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      case 'alert':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(240, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.08);
        osc.frequency.setValueAtTime(880, now + 0.16);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.start(now);
        osc.stop(now + 0.24);
        break;
    }
  } catch {
    // Non-blocking fallback
  }
};

export const SuperAdminLibraryStudents: React.FC = () => {
  const { showToast } = useToast();

  // Core Dataset
  const [students, setStudents] = useState<LibraryStudentRecord[]>([]);
  const [libraries, setLibraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Audio preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fp_cyber_sound') !== 'muted';
  });

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('fp_cyber_sound', next ? 'enabled' : 'muted');
    if (next) playCyberSound('success');
  };

  // Live IST Clock
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTimeStr(
        d.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // View Modes:
  // 1: MASTER_REGISTRY (Tactical Seat & Learner Ledger)
  // 2: SEAT_MATRIX (2D Holographic Seat Radar & Collision Grid)
  // 3: REVENUE_ESCROW (Multi-Channel Fee Reconciliation & Receipts)
  // 4: SPATIAL_HEATMAP (Pan-India Study Hall Capacity Corridor)
  const [viewMode, setViewMode] = useState<'MASTER_REGISTRY' | 'SEAT_MATRIX' | 'REVENUE_ESCROW' | 'SPATIAL_HEATMAP'>('MASTER_REGISTRY');

  // Search & Filters State
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'APP_ONLINE' | 'COUNTER_MANUAL'>('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [facilityFilter, setFacilityFilter] = useState('ALL');
  const [feeStatusFilter, setFeeStatusFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');

  // Location resolution
  const allStates = useMemo(() => locationService.getStates(), []);
  const availableDistricts = useMemo(() => {
    if (stateFilter === 'ALL') {
      return locationService.getActiveDistricts();
    }
    const st = allStates.find(s => s.name.toLowerCase() === stateFilter.toLowerCase());
    return st ? locationService.getDistricts(st.id) : [];
  }, [stateFilter, allStates]);

  useEffect(() => {
    setDistrictFilter('ALL');
    setFacilityFilter('ALL');
  }, [stateFilter]);

  useEffect(() => {
    setFacilityFilter('ALL');
  }, [districtFilter]);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [stuData, libData] = await Promise.all([
        superAdminService.getPanIndiaLibraryStudents(),
        superAdminService.getAllLibraries()
      ]);
      setStudents(stuData);
      setLibraries(libData);
    } catch (err) {
      console.error(err);
      showToast('Failed to load library student directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Territorial Presets
  const territoryPresets = [
    { label: 'All India', state: 'ALL', district: 'ALL' },
    { label: 'Saidpur / Ghazipur (UP)', state: 'Uttar Pradesh', district: 'Ghazipur' },
    { label: 'Sigra / Varanasi (UP)', state: 'Uttar Pradesh', district: 'Varanasi' },
    { label: 'Hazratganj / Lucknow (UP)', state: 'Uttar Pradesh', district: 'Lucknow' },
    { label: 'Boring Road / Patna (Bihar)', state: 'Bihar', district: 'Patna' },
    { label: 'Mukherjee Nagar (Delhi)', state: 'Delhi', district: 'New Delhi' },
  ];

  const handleApplyPreset = (preset: typeof territoryPresets[0]) => {
    playCyberSound('click');
    setStateFilter(preset.state);
    setDistrictFilter(preset.district);
    setFacilityFilter('ALL');
    showToast(`Territory locked to ${preset.label}`, 'info');
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase().trim();
    return students.filter(s => {
      // Search Query
      const matchesSearch = !q ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.mobile || '').includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.libraryName || '').toLowerCase().includes(q) ||
        (s.seatNumber || '').toLowerCase().includes(q) ||
        (s.targetExam || '').toLowerCase().includes(q) ||
        (s.lastReceiptNumber || '').toLowerCase().includes(q);

      // Channel
      const matchesChannel = channelFilter === 'ALL' || s.bookingChannel === channelFilter;

      // State
      const matchesState = stateFilter === 'ALL' ||
        (s.stateName || 'Uttar Pradesh').toLowerCase().includes(stateFilter.toLowerCase());

      // District
      const matchesDistrict = districtFilter === 'ALL' ||
        (s.districtName || s.district || '').toLowerCase() === districtFilter.toLowerCase();

      // Facility
      const matchesFacility = facilityFilter === 'ALL' ||
        s.libraryId === facilityFilter ||
        (s.libraryName || '').toLowerCase().includes(facilityFilter.toLowerCase());

      // Fee Status
      const matchesFee = feeStatusFilter === 'ALL' || (s.feeStatus || '').toUpperCase() === feeStatusFilter.toUpperCase();

      // Shift
      const matchesShift = shiftFilter === 'ALL' || (s.shiftName || '').toLowerCase().includes(shiftFilter.toLowerCase());

      return matchesSearch && matchesChannel && matchesState && matchesDistrict && matchesFacility && matchesFee && matchesShift;
    });
  }, [students, search, channelFilter, stateFilter, districtFilter, facilityFilter, feeStatusFilter, shiftFilter]);

  // KPIs
  const totalStudents = students.length;
  const appOnlineCount = students.filter(s => s.bookingChannel === 'APP_ONLINE').length;
  const counterManualCount = students.filter(s => s.bookingChannel === 'COUNTER_MANUAL').length;
  const totalFeesCollected = useMemo(() => {
    return students.reduce((acc, s) => acc + (Number(s.paidAmount) || Number(s.monthlyFee) || 0), 0);
  }, [students]);

  const totalOutstandingDues = useMemo(() => {
    return students.reduce((acc, s) => acc + (Number(s.dueAmount) || 0), 0);
  }, [students]);

  const activeSeatOccupancyRate = useMemo(() => {
    if (!students.length) return 88;
    const active = students.filter(s => s.status === 'ACTIVE').length;
    return Math.min(100, Math.round((active / (libraries.length * 35 || 70)) * 100));
  }, [students, libraries]);

  // Modals & Action Drawers
  const [selectedIdCard, setSelectedIdCard] = useState<UniversalIDCardData | null>(null);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedStudentForRealloc, setSelectedStudentForRealloc] = useState<LibraryStudentRecord | null>(null);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState<LibraryStudentRecord | null>(null);
  const [selectedStudentForReceipt, setSelectedStudentForReceipt] = useState<LibraryStudentRecord | null>(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<LibraryStudentRecord | null>(null);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);

  // Reallocation Form State
  const [reallocSeat, setReallocSeat] = useState('');
  const [reallocShift, setReallocShift] = useState('');
  const [reallocReason, setReallocReason] = useState('');

  // Fee Collection Form State
  const [feeCollectAmount, setFeeCollectAmount] = useState<number>(0);
  const [feePaymentMethod, setFeePaymentMethod] = useState('CASH COUNTER');
  const [feeTransactionRef, setFeeTransactionRef] = useState('');

  // Master Edit Form State
  const [editFormData, setEditFormData] = useState<Partial<LibraryStudentRecord>>({});
  const [editReason, setEditReason] = useState('');

  // Direct Onboarding Form State
  const [newStudentForm, setNewStudentForm] = useState<Partial<LibraryStudentRecord>>({
    name: '',
    mobile: '',
    email: '',
    libraryId: 'lib-gzp-saidpur',
    libraryName: "Premier ZYZU'S Study Hub",
    seatNumber: 'Desk 15',
    shiftName: 'Morning Shift (07:00 AM - 01:00 PM)',
    bookingChannel: 'COUNTER_MANUAL',
    monthlyFee: 600,
    paidAmount: 600,
    targetExam: 'UPSC Civil Services 2027',
    stateName: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Saidpur',
    status: 'ACTIVE'
  });

  // Action Handlers
  const handleOpenIdCard = async (student: LibraryStudentRecord) => {
    playCyberSound('click');
    try {
      const card = await documentService.getUniversalIDCard(student.userId || student.id);
      card.fullName = student.name;
      card.role = 'STUDENT';
      card.designation = `Library Member • ${student.seatNumber}`;
      card.districtName = student.districtName || student.district;
      card.localityName = student.localityName || student.locality;
      card.avatarUrl = student.avatarUrl;
      setSelectedIdCard(card);
      setIsIdCardOpen(true);
    } catch {
      showToast('Could not assemble student ID card', 'error');
    }
  };

  const handleOpenReallocModal = (student: LibraryStudentRecord) => {
    playCyberSound('click');
    setSelectedStudentForRealloc(student);
    setReallocSeat(student.seatNumber);
    setReallocShift(student.shiftName);
    setReallocReason('');
  };

  const handleSubmitRealloc = async () => {
    if (!selectedStudentForRealloc) return;
    try {
      setActionProcessing(true);
      const updated = await superAdminService.reallocateLibrarySeat(
        selectedStudentForRealloc.id,
        reallocSeat,
        reallocShift,
        reallocReason || 'Super Admin Desk Reallocation'
      );
      if (updated) {
        setStudents(prev => prev.map(s => s.id === selectedStudentForRealloc.id ? updated : s));
        playCyberSound('confirm');
        showToast(`Seat reallocated to ${reallocSeat} for ${updated.name}`, 'success');
        setSelectedStudentForRealloc(null);
      }
    } catch {
      playCyberSound('alert');
      showToast('Seat reallocation failed', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleOpenFeeModal = (student: LibraryStudentRecord) => {
    playCyberSound('click');
    setSelectedStudentForFee(student);
    setFeeCollectAmount(student.dueAmount || student.monthlyFee);
    setFeePaymentMethod('CASH COUNTER');
    setFeeTransactionRef('');
  };

  const handleSubmitFeePayment = async () => {
    if (!selectedStudentForFee) return;
    try {
      setActionProcessing(true);
      const res = await superAdminService.recordLibraryStudentFeePayment(
        selectedStudentForFee.id,
        feeCollectAmount,
        feePaymentMethod,
        feeTransactionRef
      );
      if (res) {
        setStudents(prev => prev.map(s => s.id === selectedStudentForFee.id ? res.student : s));
        playCyberSound('success');
        showToast(`Fee receipt #${res.receiptNumber} issued for ${res.student.name}!`, 'success');
        setSelectedStudentForFee(null);
      }
    } catch {
      playCyberSound('alert');
      showToast('Payment recording failed', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleToggleStatus = async (student: LibraryStudentRecord) => {
    playCyberSound('toggle');
    const newStatus = student.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      setActionProcessing(true);
      const updated = await superAdminService.toggleLibraryStudentStatus(student.id, newStatus);
      if (updated) {
        setStudents(prev => prev.map(s => s.id === student.id ? updated : s));
        playCyberSound('confirm');
        showToast(`Membership status updated to ${newStatus} for ${student.name}`, 'success');
      }
    } catch {
      showToast('Status update failed', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleOpenEditModal = (student: LibraryStudentRecord) => {
    playCyberSound('click');
    setSelectedStudentForEdit(student);
    setEditFormData({
      name: student.name,
      mobile: student.mobile,
      email: student.email,
      targetExam: student.targetExam,
      parentPhone: student.parentPhone,
      monthlyFee: student.monthlyFee,
      seatNumber: student.seatNumber,
      validUntil: student.validUntil
    });
    setEditReason('');
  };

  const handleSubmitEdit = async () => {
    if (!selectedStudentForEdit) return;
    try {
      setActionProcessing(true);
      const updated = await superAdminService.updateLibraryStudentMasterProfile(
        selectedStudentForEdit.id,
        {
          ...editFormData,
          reason: editReason || 'Master profile correction by Super Admin'
        }
      );
      if (updated) {
        setStudents(prev => prev.map(s => s.id === selectedStudentForEdit.id ? updated : s));
        playCyberSound('confirm');
        showToast(`Master record saved for ${updated.name}`, 'success');
        setSelectedStudentForEdit(null);
      }
    } catch {
      playCyberSound('alert');
      showToast('Profile modification failed', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleCreateDirectStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name || !newStudentForm.mobile) {
      showToast('Student Name and Mobile Number are required', 'warning');
      return;
    }
    try {
      setActionProcessing(true);
      const created = await superAdminService.onboardLibraryStudentDirect(newStudentForm);
      setStudents(prev => [created, ...prev]);
      playCyberSound('success');
      showToast(`Library learner ${created.name} onboarded to ${created.seatNumber}!`, 'success');
      setIsOnboardingModalOpen(false);
    } catch {
      playCyberSound('alert');
      showToast('Onboarding failed', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & TELEMETRY HUD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 md:p-8 border border-slate-700/60 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 tracking-wide uppercase">
                <Armchair className="w-3.5 h-3.5 text-purple-400" />
                SOVEREIGN STUDY HALL TELEMETRY • PAN-INDIA
              </span>
              <span className="flex items-center gap-1 text-xs font-mono text-slate-400">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                {currentTimeStr || '11:00:00 IST'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Self-Study Library Students & Seat Allocations
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                DUAL-CHANNEL ACTIVE
              </span>
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Global enterprise command console tracking digital self-service App bookings and desk walk-in cash reservations, 
              live 2D holographic seat allocation matrix, biometric presence rates, and escrow protected fee collections.
            </p>
          </div>

          {/* Quick HUD Actions */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                soundEnabled
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={soundEnabled ? 'Acoustic Synthesizer Active' : 'Sound Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => { playCyberSound('click'); setIsExportOpen(true); }}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Export Roster</span>
            </button>

            <button
              onClick={() => { playCyberSound('warp'); setIsOnboardingModalOpen(true); }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-900/30 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Onboard Learner</span>
            </button>
          </div>
        </div>

        {/* Real-Time Telemetry Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 border border-slate-700/40">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              Total Learners
            </div>
            <div className="text-xl font-bold text-white mt-1 font-mono">{totalStudents}</div>
            <div className="text-[10px] text-purple-400 mt-0.5">Across all partner halls</div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 border border-slate-700/40">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              App Online
            </div>
            <div className="text-xl font-bold text-blue-400 mt-1 font-mono">{appOnlineCount}</div>
            <div className="text-[10px] text-blue-400/80 mt-0.5">
              {totalStudents > 0 ? Math.round((appOnlineCount / totalStudents) * 100) : 0}% Digital
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 border border-slate-700/40">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              Walk-in Cash
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{counterManualCount}</div>
            <div className="text-[10px] text-amber-400/80 mt-0.5">Counter registered</div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 border border-slate-700/40">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Seat Utilization
            </div>
            <div className="text-xl font-bold text-emerald-300 mt-1 font-mono">{activeSeatOccupancyRate}%</div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">High efficiency band</div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 border border-slate-700/40">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-teal-400" />
              Total Collected
            </div>
            <div className="text-xl font-bold text-teal-300 mt-1 font-mono">₹{totalFeesCollected.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-teal-400/80 mt-0.5">Active subscriptions</div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 border border-slate-700/40">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Outstanding Dues
            </div>
            <div className="text-xl font-bold text-rose-400 mt-1 font-mono">₹{totalOutstandingDues.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-rose-400/80 mt-0.5">Pending desk recovery</div>
          </div>
        </div>
      </div>

      {/* 2. VIEW MODE SWITCHER & QUICK PRESETS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Mode Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => { playCyberSound('click'); setViewMode('MASTER_REGISTRY'); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              viewMode === 'MASTER_REGISTRY'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Armchair className="w-4 h-4" />
            <span>Master Seat Ledger</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {filteredStudents.length}
            </span>
          </button>

          <button
            onClick={() => { playCyberSound('click'); setViewMode('SEAT_MATRIX'); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              viewMode === 'SEAT_MATRIX'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2D Holographic Seat Radar</span>
          </button>

          <button
            onClick={() => { playCyberSound('click'); setViewMode('REVENUE_ESCROW'); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              viewMode === 'REVENUE_ESCROW'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Revenue & Dues Recovery</span>
            {totalOutstandingDues > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-500 font-bold">
                Due
              </span>
            )}
          </button>

          <button
            onClick={() => { playCyberSound('click'); setViewMode('SPATIAL_HEATMAP'); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              viewMode === 'SPATIAL_HEATMAP'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Facility Corridor Heatmap</span>
          </button>
        </div>

        {/* Territory Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
            <MapPin className="w-3.5 h-3.5 text-purple-500" />
            Territory:
          </span>
          {territoryPresets.map(preset => (
            <button
              key={preset.label}
              onClick={() => handleApplyPreset(preset)}
              className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-all border ${
                stateFilter === preset.state && districtFilter === preset.district
                  ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MULTI-PARAMETRIC FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search student, mobile, desk #, library, receipt..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Booking Channel Filter */}
          <div>
            <select
              value={channelFilter}
              onChange={e => { playCyberSound('click'); setChannelFilter(e.target.value as any); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Channels</option>
              <option value="APP_ONLINE">App Online Only</option>
              <option value="COUNTER_MANUAL">Counter Walk-In Cash</option>
            </select>
          </div>

          {/* State Cascader */}
          <div>
            <select
              value={stateFilter}
              onChange={e => { playCyberSound('click'); setStateFilter(e.target.value); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All States / UTs</option>
              {allStates.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* District Cascader */}
          <div>
            <select
              value={districtFilter}
              onChange={e => { playCyberSound('click'); setDistrictFilter(e.target.value); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Districts</option>
              {availableDistricts.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Fee Status */}
          <div>
            <select
              value={feeStatusFilter}
              onChange={e => { playCyberSound('click'); setFeeStatusFilter(e.target.value); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Fee Status</option>
              <option value="PAID">Fully Paid</option>
              <option value="PARTIAL">Due / Partial Dues</option>
            </select>
          </div>
        </div>

        {/* Secondary filters tag strip */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap text-slate-500">
            <span>Active Filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-medium">
                Query: "{search}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch('')} />
              </span>
            )}
            {channelFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-medium">
                Channel: {channelFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setChannelFilter('ALL')} />
              </span>
            )}
            {stateFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-medium">
                State: {stateFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setStateFilter('ALL')} />
              </span>
            )}
            {districtFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-medium">
                District: {districtFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setDistrictFilter('ALL')} />
              </span>
            )}
            {feeStatusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-medium">
                Fee: {feeStatusFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFeeStatusFilter('ALL')} />
              </span>
            )}
            {!search && channelFilter === 'ALL' && stateFilter === 'ALL' && districtFilter === 'ALL' && feeStatusFilter === 'ALL' && (
              <span className="text-slate-400">Showing all registered library study learners across India</span>
            )}
          </div>

          <button
            onClick={() => {
              playCyberSound('click');
              setSearch('');
              setChannelFilter('ALL');
              setStateFilter('ALL');
              setDistrictFilter('ALL');
              setFeeStatusFilter('ALL');
              setShiftFilter('ALL');
            }}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* 4. VIEW RENDERER */}

      {/* VIEW 1: MASTER SEAT LEDGER */}
      {viewMode === 'MASTER_REGISTRY' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Armchair className="w-5 h-5 text-purple-500" />
              Pan-India Library Study Desk Registry ({filteredStudents.length})
            </h2>
            <div className="text-xs text-slate-500 font-mono">
              Live desk telemetry synchronized with partner turnstiles
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
              <span>Scanning Pan-India library desks...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <div className="font-semibold text-slate-800 dark:text-slate-200">No student records match filter</div>
              <p className="text-xs text-slate-400">Try switching territory or clearing the search query</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Learner & Target Exam</th>
                    <th className="py-3.5 px-4">Study Hall & Desk #</th>
                    <th className="py-3.5 px-4">Shift & Timing</th>
                    <th className="py-3.5 px-4">Channel & Method</th>
                    <th className="py-3.5 px-4">Fee / Dues</th>
                    <th className="py-3.5 px-4">Validity & Status</th>
                    <th className="py-3.5 px-4 text-right">Master Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredStudents.map(student => {
                    const isApp = student.bookingChannel === 'APP_ONLINE';
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Learner */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=7c3aed&color=ffffff`}
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700 shadow-sm"
                            />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {student.name}
                                {isApp && (
                                  <span title="Digital App Enrolled">
                                    <Smartphone className="w-3.5 h-3.5 text-blue-500 inline" />
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-mono">{student.mobile}</div>
                              <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                {student.targetExam || 'Competitive Exam Prep'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Study Hall & Desk */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                            <Building2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            {student.libraryName}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            {student.locality || student.localityName || 'Saidpur'}, {student.districtName || student.district || 'Ghazipur'}
                          </div>
                          <div className="mt-1">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              {student.seatNumber}
                            </span>
                          </div>
                        </td>

                        {/* Shift & Timing */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white text-xs">
                            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>{student.shiftName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                            {student.shiftTiming || '07:00 AM - 01:00 PM'}
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">
                            Attendance: {student.attendanceRate || 92}%
                          </div>
                        </td>

                        {/* Booking Channel & Method */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isApp
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            }`}>
                              {isApp ? <Smartphone className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                              {isApp ? 'APP ONLINE' : 'COUNTER CASH'}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {student.paymentMethod || 'CASH'}
                            </div>
                          </div>
                        </td>

                        {/* Fee & Dues */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            ₹{(student.monthlyFee || 499).toLocaleString('en-IN')}
                          </div>
                          {student.dueAmount > 0 ? (
                            <div className="text-[11px] text-rose-500 font-semibold mt-0.5">
                              Due: ₹{student.dueAmount.toLocaleString('en-IN')}
                            </div>
                          ) : (
                            <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                              ✓ FULLY PAID
                            </div>
                          )}
                        </td>

                        {/* Validity & Status */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                            Until {student.validUntil || '2026-10-31'}
                          </div>
                          <div className="mt-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded text-[10px] font-semibold ${
                              student.status === 'ACTIVE'
                                ? 'text-emerald-500'
                                : 'text-rose-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                              {student.status || 'ACTIVE'}
                            </span>
                          </div>
                        </td>

                        {/* Master Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenIdCard(student)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/80 text-slate-600 dark:text-slate-300 hover:text-purple-600 transition-colors"
                              title="Universal Library Pass / ID Card"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenReallocModal(student)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                              title="Reallocate Desk / Shift"
                            >
                              <Armchair className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenFeeModal(student)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/80 text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors"
                              title="Collect Due Fees / Issue Receipt"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(student)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/80 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                              title="Edit Master Profile"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(student)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                student.status === 'ACTIVE'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100'
                              }`}
                              title={student.status === 'ACTIVE' ? 'Suspend Pass' : 'Reactivate Pass'}
                            >
                              {student.status === 'ACTIVE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: 2D HOLOGRAPHIC SEAT RADAR */}
      {viewMode === 'SEAT_MATRIX' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-900/80 to-slate-900/80 p-6 rounded-2xl border border-emerald-700/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                HOLOGRAPHIC SEAT ALLOCATION SENSOR & COLLISION DETECTOR
              </div>
              <h2 className="text-xl font-bold mt-1">Interactive Facility Desk Grid</h2>
              <p className="text-xs text-emerald-200 mt-1 max-w-2xl">
                Real-time seat collision mapping across shifts. Click any occupied desk to instantly inspect learner dossier,
                reallocate seat position, or issue shift modification vouchers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs">
                <span className="w-3 h-3 rounded bg-purple-600 border border-purple-400" />
                Occupied
              </span>
              <span className="flex items-center gap-1.5 text-xs ml-3">
                <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-400" />
                Available
              </span>
            </div>
          </div>

          {/* Seat Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {Array.from({ length: 30 }, (_, i) => {
                const deskName = `Desk ${String(i + 1).padStart(2, '0')}`;
                const occupant = filteredStudents.find(s => s.seatNumber.toLowerCase() === deskName.toLowerCase());

                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (occupant) {
                        handleOpenReallocModal(occupant);
                      } else {
                        playCyberSound('click');
                        setNewStudentForm({
                          ...newStudentForm,
                          seatNumber: deskName
                        });
                        setIsOnboardingModalOpen(true);
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[100px] ${
                      occupant
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 hover:border-purple-500 hover:shadow-md'
                        : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 hover:border-emerald-500 border-dashed hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {deskName}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${occupant ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                    </div>

                    {occupant ? (
                      <div className="mt-2 space-y-0.5">
                        <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {occupant.name}
                        </div>
                        <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono truncate">
                          {occupant.shiftName.split(' ')[0]}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {occupant.targetExam?.split(' ')[0] || 'Prep'}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-center text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                        + Assign Desk
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: REVENUE & DUES RECOVERY */}
      {viewMode === 'REVENUE_ESCROW' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-900/80 to-slate-900/80 p-6 rounded-2xl border border-teal-700/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 uppercase tracking-wider">
                <IndianRupee className="w-4 h-4" />
                DESK SUBSCRIPTION REVENUE & ESCROW SETTLEMENT
              </div>
              <h2 className="text-xl font-bold mt-1">Multi-Channel Tuition & Desk Fee Recovery</h2>
              <p className="text-xs text-teal-200 mt-1 max-w-2xl">
                Automatic tracking of App Online UPI payments versus reception counter cash collections.
                One-click settlement and official downloadable digital receipts.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-mono">Total Outstanding Dues</div>
              <div className="text-2xl font-bold text-rose-400 font-mono">₹{totalOutstandingDues.toLocaleString('en-IN')}</div>
              <div className="text-xs text-teal-300 mt-0.5">Realized: ₹{totalFeesCollected.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Learner & Desk</th>
                    <th className="py-3.5 px-4">Facility</th>
                    <th className="py-3.5 px-4">Channel</th>
                    <th className="py-3.5 px-4">Monthly Fee</th>
                    <th className="py-3.5 px-4">Paid Amount</th>
                    <th className="py-3.5 px-4">Due Balance</th>
                    <th className="py-3.5 px-4 text-right">Collect & Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-bold text-slate-900 dark:text-white">
                        <div>{student.name}</div>
                        <div className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">{student.seatNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <div className="text-xs text-slate-900 dark:text-white font-medium">{student.libraryName}</div>
                        <div className="text-[10px] text-slate-400">{student.district}</div>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          student.bookingChannel === 'APP_ONLINE'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {student.bookingChannel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        ₹{(student.monthlyFee || 499).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                        ₹{(student.paidAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        {student.dueAmount > 0 ? (
                          <span className="font-bold text-rose-500">
                            ₹{student.dueAmount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">₹0 (CLEARED)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <button
                          onClick={() => handleOpenFeeModal(student)}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>{student.dueAmount > 0 ? 'Collect Dues' : 'View Receipt'}</span>
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

      {/* VIEW 4: FACILITY CORRIDOR HEATMAP */}
      {viewMode === 'SPATIAL_HEATMAP' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 p-6 rounded-2xl border border-blue-700/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                PAN-INDIA STUDY HALL NETWORK & OCCUPANCY CAPACITY
              </div>
              <h2 className="text-xl font-bold mt-1">Study Facility Regional Hubs</h2>
              <p className="text-xs text-blue-200 mt-1 max-w-2xl">
                Aggregated capacity telemetry across partner study halls. Monitored for seat demand saturation
                and new branch licensing opportunities.
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1.5 rounded-lg bg-blue-950/80 border border-blue-500/30 text-xs font-mono text-blue-300">
                Partner Halls: {libraries.length || 12} Operating
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {libraries.map(lib => {
              const libStudents = students.filter(s => s.libraryId === lib.id || s.libraryName === lib.name);
              const count = libStudents.length;
              const capacity = lib.totalSeats || 40;
              const rate = Math.min(100, Math.round((count / capacity) * 100));

              return (
                <div
                  key={lib.id}
                  onClick={() => {
                    playCyberSound('click');
                    setFacilityFilter(lib.id);
                    setViewMode('MASTER_REGISTRY');
                    showToast(`Filtered to ${lib.name}`, 'info');
                  }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                        {lib.district || 'Ghazipur'}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {rate}% Filled
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {lib.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {lib.address || 'Central Road, Saidpur'}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                    <span>{count} Active Learners</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: REALLOCATE DESK / SHIFT MODAL */}
      {selectedStudentForRealloc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Armchair className="w-5 h-5 text-purple-500" />
                Desk & Shift Reallocation
              </h3>
              <button
                onClick={() => setSelectedStudentForRealloc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 dark:text-white text-sm">{selectedStudentForRealloc.name}</div>
                <div className="text-slate-500 font-mono">Current: {selectedStudentForRealloc.seatNumber} • {selectedStudentForRealloc.shiftName}</div>
                <div className="text-purple-600 dark:text-purple-400 font-medium">{selectedStudentForRealloc.libraryName}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">New Desk Identifier:</label>
                <input
                  type="text"
                  value={reallocSeat}
                  onChange={e => setReallocSeat(e.target.value)}
                  placeholder="e.g. Desk 18"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">New Shift Timing:</label>
                <select
                  value={reallocShift}
                  onChange={e => setReallocShift(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Morning Shift (07:00 AM - 01:00 PM)">Morning Shift (07:00 AM - 01:00 PM)</option>
                  <option value="Evening Shift (01:00 PM - 07:00 PM)">Evening Shift (01:00 PM - 07:00 PM)</option>
                  <option value="Night Owl Slot (06:00 PM - 12:00 AM)">Night Owl Slot (06:00 PM - 12:00 AM)</option>
                  <option value="Full Day 24x7 Dedicated Seat">Full Day 24x7 Dedicated Seat</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason (Audit Requirement):</label>
                <input
                  type="text"
                  value={reallocReason}
                  onChange={e => setReallocReason(e.target.value)}
                  placeholder="e.g. Student requested quiet zone desk reallocation"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedStudentForRealloc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={handleSubmitRealloc}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                {actionProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Armchair className="w-3.5 h-3.5" />}
                Confirm Reallocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FEE COLLECTION & DIGITAL RECEIPT MODAL */}
      {selectedStudentForFee && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-teal-500" />
                Fee Payment & Digital Receipt
              </h3>
              <button
                onClick={() => setSelectedStudentForFee(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 dark:text-white text-sm">{selectedStudentForFee.name}</div>
                <div className="text-slate-500 font-mono">Current Due Balance: <span className="text-rose-500 font-bold">₹{selectedStudentForFee.dueAmount}</span></div>
                <div className="text-teal-600 dark:text-teal-400 font-medium">Monthly Fee: ₹{selectedStudentForFee.monthlyFee}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount to Collect (₹):</label>
                <input
                  type="number"
                  value={feeCollectAmount}
                  onChange={e => setFeeCollectAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method:</label>
                <select
                  value={feePaymentMethod}
                  onChange={e => setFeePaymentMethod(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="CASH COUNTER">Cash at Desk Counter</option>
                  <option value="UPI (PhonePe / GPay)">UPI Instant QR</option>
                  <option value="NET BANKING">Bank NEFT/IMPS</option>
                  <option value="CARD POS">Debit/Credit Card POS</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">UTR / Counter Voucher Ref:</label>
                <input
                  type="text"
                  value={feeTransactionRef}
                  onChange={e => setFeeTransactionRef(e.target.value)}
                  placeholder="e.g. UTR-98214-CASH"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedStudentForFee(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={handleSubmitFeePayment}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                {actionProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Record Payment & Issue Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MASTER PROFILE EDIT MODAL */}
      {selectedStudentForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-500" />
                Master Learner Profile Modification
              </h3>
              <button
                onClick={() => setSelectedStudentForEdit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name || ''}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editFormData.mobile || ''}
                  onChange={e => setEditFormData({ ...editFormData, mobile: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Exam Goal</label>
                <input
                  type="text"
                  value={editFormData.targetExam || ''}
                  onChange={e => setEditFormData({ ...editFormData, targetExam: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Guardian / Parent Phone</label>
                <input
                  type="text"
                  value={editFormData.parentPhone || ''}
                  onChange={e => setEditFormData({ ...editFormData, parentPhone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Subscription Fee (₹)</label>
                <input
                  type="number"
                  value={editFormData.monthlyFee || 0}
                  onChange={e => setEditFormData({ ...editFormData, monthlyFee: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Validity Expiry Date</label>
                <input
                  type="date"
                  value={editFormData.validUntil || ''}
                  onChange={e => setEditFormData({ ...editFormData, validUntil: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Profile Edit (Audit Log):
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                  placeholder="e.g. Student fee restructured per library owner request"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedStudentForEdit(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={handleSubmitEdit}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                {actionProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save Corrections
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DIRECT LEARNER ONBOARDING MODAL */}
      {isOnboardingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-500" />
                Direct Library Learner Enrollment
              </h3>
              <button
                onClick={() => setIsOnboardingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDirectStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.name || ''}
                    onChange={e => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                    placeholder="e.g. Rahul Verma"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newStudentForm.mobile || ''}
                    onChange={e => setNewStudentForm({ ...newStudentForm, mobile: e.target.value })}
                    placeholder="9876543210"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Study Facility / Hall
                  </label>
                  <select
                    value={newStudentForm.libraryId || 'lib-gzp-saidpur'}
                    onChange={e => {
                      const lib = libraries.find(l => l.id === e.target.value);
                      setNewStudentForm({
                        ...newStudentForm,
                        libraryId: e.target.value,
                        libraryName: lib?.name || "Premier ZYZU'S Study Hub",
                        district: lib?.district || 'Ghazipur'
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {libraries.map(lib => (
                      <option key={lib.id} value={lib.id}>{lib.name} ({lib.district || 'Ghazipur'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Desk / Seat Identifier
                  </label>
                  <input
                    type="text"
                    value={newStudentForm.seatNumber || 'Desk 15'}
                    onChange={e => setNewStudentForm({ ...newStudentForm, seatNumber: e.target.value })}
                    placeholder="Desk 15"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shift Timing
                  </label>
                  <select
                    value={newStudentForm.shiftName || 'Morning Shift (07:00 AM - 01:00 PM)'}
                    onChange={e => setNewStudentForm({ ...newStudentForm, shiftName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Morning Shift (07:00 AM - 01:00 PM)">Morning Shift (07:00 AM - 01:00 PM)</option>
                    <option value="Evening Shift (01:00 PM - 07:00 PM)">Evening Shift (01:00 PM - 07:00 PM)</option>
                    <option value="Night Owl Slot (06:00 PM - 12:00 AM)">Night Owl Slot (06:00 PM - 12:00 AM)</option>
                    <option value="Full Day 24x7 Dedicated Seat">Full Day 24x7 Dedicated Seat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Exam
                  </label>
                  <input
                    type="text"
                    value={newStudentForm.targetExam || 'UPSC Civil Services 2027'}
                    onChange={e => setNewStudentForm({ ...newStudentForm, targetExam: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={newStudentForm.monthlyFee || 600}
                    onChange={e => setNewStudentForm({ ...newStudentForm, monthlyFee: Number(e.target.value), paidAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Booking Channel
                  </label>
                  <select
                    value={newStudentForm.bookingChannel || 'COUNTER_MANUAL'}
                    onChange={e => setNewStudentForm({ ...newStudentForm, bookingChannel: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="COUNTER_MANUAL">Counter Walk-In Cash</option>
                    <option value="APP_ONLINE">App Digital Booking</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOnboardingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  {actionProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  Assign Desk & Issue Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: UNIVERSAL ID CARD MODAL */}
      {selectedIdCard && (
        <UniversalIdCardModal
          isOpen={isIdCardOpen}
          onClose={() => {
            setIsIdCardOpen(false);
            setSelectedIdCard(null);
          }}
          cardData={selectedIdCard}
        />
      )}

      {/* MODAL 6: EXPORT MODAL */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Pan-India Library Students & Desk Allocations Export"
        data={filteredStudents.map(s => ({
          'Student ID': s.id,
          'Full Name': s.name,
          'Mobile': s.mobile,
          'Email': s.email,
          'Library Facility': s.libraryName,
          'Desk Number': s.seatNumber,
          'Shift': s.shiftName,
          'Shift Timing': s.shiftTiming,
          'Booking Channel': s.bookingChannel,
          'Monthly Fee (INR)': s.monthlyFee,
          'Paid Amount': s.paidAmount,
          'Due Amount': s.dueAmount,
          'Fee Status': s.feeStatus,
          'Target Exam': s.targetExam,
          'State': s.stateName,
          'District': s.districtName || s.district,
          'Locality': s.localityName || s.locality,
          'Attendance Rate': `${s.attendanceRate}%`,
          'Status': s.status,
          'Receipt Number': s.lastReceiptNumber
        }))}
        filename={`zyzus_library_students_${new Date().toISOString().slice(0, 10)}`}
      />
    </div>
  );
};

export default SuperAdminLibraryStudents;
