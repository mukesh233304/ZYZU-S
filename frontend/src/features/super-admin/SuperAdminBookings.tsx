// FOCUSPOINT Super Admin — Pan-India Unified Bookings & Allotments Master Console
// Panoramic Cyber-HUD Standard: Procedural Web Audio, Holographic Telemetry Decks,
// Cascading Pan-India Location Selector, Dual-Stream Service Matrices (Home Tuition & Library Desks),
// Educator Reassignment Radar, Desk Reallocation, Cryptographic Audit Trail & Official Allotment Orders.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { superAdminService } from '../../services/superAdminService';
import { locationService } from '../../services/locationService';
import { auditService } from '../../services/auditService';
import { 
  UnifiedBookingRecord, 
  UnifiedBookingStatus, 
  UnifiedBookingServiceType,
  BookingsCockpitKPIs 
} from '../../types/superAdmin';
import { Teacher } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PanIndiaLocationSelector, LocationSelectionPayload } from '../../components/common/PanIndiaLocationSelector';
import { ExportModal } from '../../components/common/ExportModal';
import { 
  GraduationCap, 
  Armchair, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  UserCheck, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  Download, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  SlidersHorizontal, 
  Layers, 
  Building2, 
  Phone, 
  Mail, 
  Copy, 
  ExternalLink, 
  Zap, 
  Activity, 
  Cpu, 
  QrCode, 
  ArrowRight, 
  TrendingUp, 
  X, 
  Check, 
  RotateCcw, 
  FileText, 
  Printer, 
  Sparkles,
  Users,
  Compass,
  BadgeAlert,
  ChevronRight,
  Maximize2
} from 'lucide-react';

type SfxType = 'click' | 'warp' | 'confirm' | 'toggle' | 'alert';

export const SuperAdminBookings: React.FC = () => {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState<UnifiedBookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceStream, setServiceStream] = useState<'ALL' | 'HOME_TUITION' | 'LIBRARY'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Geographic Filter State
  const [geoFilter, setGeoFilter] = useState<LocationSelectionPayload>({
    countryId: 'IN',
    level: 'INDIA',
    breadcrumb: 'Pan-India Master Territory'
  });

  // Modal States
  const [selectedBooking, setSelectedBooking] = useState<UnifiedBookingRecord | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  
  // Reassignment Modal (Home Tuition)
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignTeacherId, setReassignTeacherId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [reassigning, setReassigning] = useState(false);

  // Reallocation Modal (Library Desk)
  const [isReallocateDeskModalOpen, setIsReallocateDeskModalOpen] = useState(false);
  const [reallocateSeatNumber, setReallocateSeatNumber] = useState('');
  const [reallocateShift, setReallocateShift] = useState('');
  const [reallocateReason, setReallocateReason] = useState('');
  const [reallocating, setReallocating] = useState(false);

  // Status Governance Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<UnifiedBookingStatus>('ACTIVE');
  const [statusReason, setStatusReason] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Allotment Order / Digital Pass Modal
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Export Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Procedural Web Audio Synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSfx = (type: SfxType) => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx?.resume();
      }
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'click') {
        osc.frequency.setValueAtTime(820, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'confirm') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'warp') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(1180, now + 0.18);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(260, now + 0.08);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else {
        osc.frequency.setValueAtTime(580, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch {}
  };

  // Fetch Pan-India Bookings & Allotments
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await superAdminService.getPanIndiaUnifiedBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load Pan-India bookings', err);
      addToast('Error synchronizing Pan-India bookings telemetry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Spatial Filter Handler
  const handleLocationChange = (payload: LocationSelectionPayload) => {
    playSfx('warp');
    setGeoFilter(payload);
  };

  // Filter Pipeline
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // 1. Service stream
      if (serviceStream !== 'ALL' && b.serviceType !== serviceStream) {
        return false;
      }

      // 2. Status filter
      if (statusFilter !== 'ALL' && b.status !== statusFilter) {
        return false;
      }

      // 3. Payment filter
      if (paymentFilter !== 'ALL' && b.paymentStatus !== paymentFilter) {
        return false;
      }

      // 4. Geographic Hierarchy Filter
      if (geoFilter.level !== 'INDIA') {
        if (geoFilter.stateName) {
          const sMatch = b.state?.toLowerCase().includes(geoFilter.stateName.toLowerCase());
          if (!sMatch) return false;
        }
        if (geoFilter.districtName) {
          const dMatch = b.district?.toLowerCase().includes(geoFilter.districtName.toLowerCase());
          if (!dMatch) return false;
        }
        if (geoFilter.localityName) {
          const lMatch = b.locality?.toLowerCase().includes(geoFilter.localityName.toLowerCase());
          if (!lMatch) return false;
        }
      }

      // 5. Text Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = b.refNumber.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
        const matchesStudent = b.studentName.toLowerCase().includes(q) || b.studentMobile.includes(q);
        const matchesTeacher = b.teacherName?.toLowerCase().includes(q);
        const matchesLibrary = b.libraryName?.toLowerCase().includes(q) || b.seatNumber?.toLowerCase().includes(q);
        const matchesSubject = b.subject?.toLowerCase().includes(q);
        const matchesDistrict = b.district.toLowerCase().includes(q);

        if (!matchesRef && !matchesStudent && !matchesTeacher && !matchesLibrary && !matchesSubject && !matchesDistrict) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, serviceStream, statusFilter, paymentFilter, geoFilter, searchQuery]);

  // Compute 8-KPI Sovereign Metric Decks
  const kpis: BookingsCockpitKPIs = useMemo(() => {
    return superAdminService.calculateBookingsKPIs(filteredBookings);
  }, [filteredBookings]);

  // Handlers for Operational Actions
  const handleOpenDossier = (record: UnifiedBookingRecord) => {
    playSfx('click');
    setSelectedBooking(record);
    setIsDossierModalOpen(true);
  };

  const handleOpenReassign = (record: UnifiedBookingRecord) => {
    playSfx('click');
    setSelectedBooking(record);
    setReassignTeacherId('');
    setReassignReason('');
    setIsReassignModalOpen(true);
  };

  const handleExecuteReassignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !reassignTeacherId) {
      addToast('Please select a verified educator to assign.', 'error');
      return;
    }
    if (!reassignReason.trim()) {
      addToast('Mandatory administrative reason is required for teacher reassignment.', 'error');
      return;
    }

    setReassigning(true);
    try {
      const allTeachers: Teacher[] = await superAdminService.getAllTeachers();
      const newTeacher = allTeachers.find((t: Teacher) => t.id === reassignTeacherId);
      const newTeacherName = newTeacher?.name || 'Verified Educator';

      const updated = await superAdminService.reassignHomeTutor(
        selectedBooking.id,
        reassignTeacherId,
        newTeacherName,
        reassignReason
      );

      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
      playSfx('confirm');
      addToast(`Student ${selectedBooking.studentName} successfully reassigned to ${newTeacherName}.`, 'success');
      setIsReassignModalOpen(false);
      setSelectedBooking(updated);
    } catch (err: any) {
      playSfx('alert');
      addToast(err.message || 'Failed to reassign educator.', 'error');
    } finally {
      setReassigning(false);
    }
  };

  const handleOpenReallocateDesk = (record: UnifiedBookingRecord) => {
    playSfx('click');
    setSelectedBooking(record);
    setReallocateSeatNumber(record.seatNumber || 'Desk-B-01');
    setReallocateShift(record.shift || 'Morning Shift (06:00 AM - 02:00 PM)');
    setReallocateReason('');
    setIsReallocateDeskModalOpen(true);
  };

  const handleExecuteDeskReallocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !reallocateSeatNumber.trim()) {
      addToast('Please specify desk workstation identifier.', 'error');
      return;
    }
    if (!reallocateReason.trim()) {
      addToast('Mandatory administrative reason is required.', 'error');
      return;
    }

    setReallocating(true);
    try {
      const updated = await superAdminService.reallocateLibraryDesk(
        selectedBooking.id,
        reallocateSeatNumber,
        reallocateShift,
        reallocateReason
      );

      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
      playSfx('confirm');
      addToast(`Workstation ${reallocateSeatNumber} allocated to ${selectedBooking.studentName}.`, 'success');
      setIsReallocateDeskModalOpen(false);
      setSelectedBooking(updated);
    } catch (err: any) {
      playSfx('alert');
      addToast(err.message || 'Failed to reallocate workstation.', 'error');
    } finally {
      setReallocating(false);
    }
  };

  const handleOpenStatusGovernance = (record: UnifiedBookingRecord) => {
    playSfx('click');
    setSelectedBooking(record);
    setTargetStatus(record.status);
    setStatusReason('');
    setIsStatusModalOpen(true);
  };

  const handleExecuteStatusGovernance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    if (!statusReason.trim()) {
      addToast('Mandatory administrative reason is required for status transition.', 'error');
      return;
    }

    setStatusUpdating(true);
    try {
      const updated = await superAdminService.updateBookingStatus(
        selectedBooking.id,
        targetStatus,
        statusReason
      );

      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
      playSfx('confirm');
      addToast(`Booking ${updated.refNumber} status transitioned to ${targetStatus}.`, 'success');
      setIsStatusModalOpen(false);
      setSelectedBooking(updated);
    } catch (err: any) {
      playSfx('alert');
      addToast(err.message || 'Failed to update booking status.', 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleOpenOrderDocument = (record: UnifiedBookingRecord) => {
    playSfx('click');
    setSelectedBooking(record);
    setIsOrderModalOpen(true);
  };

  // Mock available educators for reassignment dropdown
  const districtTeachers = useMemo(() => {
    return [
      { id: 'tch-01', name: 'Dr. Alok Verma', subjects: 'Mathematics & Physics', exp: '10 Yrs' },
      { id: 'tch-02', name: 'Dr. Pradeep Mishra', subjects: 'Chemistry & Biology', exp: '8 Yrs' },
      { id: 'tch-03', name: 'Er. Sandeep Shukla', subjects: 'Physics & Engineering Mechanics', exp: '6 Yrs' },
      { id: 'tch-04', name: 'Prof. Ananya Sen', subjects: 'English Literature & Social Science', exp: '12 Yrs' },
      { id: 'tch-05', name: 'Vikramaditya Roy', subjects: 'Advanced Mathematics (IIT-JEE)', exp: '9 Yrs' },
    ];
  }, []);

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Panoramic Cyber-HUD Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="text-emerald-400">STATEWIDE BOOKINGS & ALLOTMENTS</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono tracking-normal">
                SOVEREIGN LEDGER
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>High-precision Pan-India allocation radar for Home Tuition 1-on-1 faculty & Self-Study Library workstations</span>
            <span className="inline-block w-1 h-1 rounded-full bg-slate-600"></span>
            <span className="font-mono text-slate-500">Node: PAN-INDIA-PROD-01</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (!audioEnabled) playSfx('click');
            }}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              audioEnabled 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Acoustic Synthesizer Feedback"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{audioEnabled ? 'Audio ON' : 'Audio Muted'}</span>
          </button>

          {/* Refresh Telemetry */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              playSfx('warp');
              fetchBookings();
              addToast('Bookings ledger telemetry synchronized.', 'info');
            }}
            className="border-slate-800 hover:bg-slate-850 text-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            Sync Ledger
          </Button>

          {/* Export Ledger Button */}
          <Button
            size="sm"
            onClick={() => {
              playSfx('click');
              setIsExportModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export Ledger
          </Button>
        </div>
      </div>

      {/* 2. Cascading Pan-India Location Selector Bar */}
      <Card className="p-3 bg-slate-900/95 border-slate-800/90 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400" />
              Territory Drill-Down:
            </span>
            <span className="font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/40 truncate max-w-[280px] sm:max-w-md">
              {geoFilter.breadcrumb || 'Pan-India All Territories'}
            </span>
          </div>

          {/* Integrated Pan-India Location Selector Component */}
          <div className="w-full md:w-auto min-w-[260px]">
            <PanIndiaLocationSelector
              value={{
                stateId: geoFilter.stateId,
                stateName: geoFilter.stateName,
                districtId: geoFilter.districtId,
                districtName: geoFilter.districtName,
                localityId: geoFilter.localityId,
                localityName: geoFilter.localityName
              }}
              onChange={handleLocationChange}
              showLocality={true}
              variant="bar"
              theme="emerald"
            />
          </div>
        </div>
      </Card>

      {/* 3. Interactive 8-KPI Sovereign Metric Decks */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* KPI 1 */}
        <div className="bg-slate-900/80 border border-slate-800/90 p-3 rounded-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Allotments</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">{kpis.totalAllotments}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
            <span className="text-emerald-400">100%</span> Logged
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/80 border border-slate-800/90 p-3 rounded-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Home Tutors</span>
            <GraduationCap className="w-3.5 h-3.5 text-royal-blue-400" />
          </div>
          <div className="text-xl font-black text-royal-blue-400 font-mono">{kpis.activeTuitions}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            1-on-1 Faculty Active
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/80 border border-slate-800/90 p-3 rounded-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Library Desks</span>
            <Armchair className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">{kpis.activeLibraryDesks}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Shifts & Seats Live
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/80 border border-slate-800/90 p-3 rounded-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Gross GMV</span>
            <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-300 font-mono">
            ₹{(kpis.totalGrossValue / 100000).toFixed(2)}L
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Statewide Value
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-slate-900/80 border border-slate-800/90 p-3 rounded-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Deployment</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-cyan-400 font-mono">{kpis.tutorDeploymentRate}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Educator Match SLA
          </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-slate-900/80 border border-slate-800/90 p-3 rounded-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">QR Passes</span>
            <QrCode className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-black text-purple-400 font-mono">{kpis.qrPassesActive}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Active Digital Passes
          </div>
        </div>

        {/* KPI 7 */}
        <div className="bg-slate-900/80 border border-slate-800/90 p-3 rounded-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Review</span>
            <Clock className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-xl font-black text-orange-400 font-mono">{kpis.pendingReassignments}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Pending Dispatch
          </div>
        </div>

        {/* KPI 8 */}
        <div className="bg-slate-900/80 border border-slate-800/90 p-3 rounded-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Ticket</span>
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          </div>
          <div className="text-xl font-black text-pink-300 font-mono">₹{kpis.averageMonthlyTicket}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Monthly / Student
          </div>
        </div>
      </div>

      {/* 4. Multi-Stream Service Mode Tabs & Advanced Filter Toolbar */}
      <Card className="p-4 bg-slate-900/90 border-slate-800">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Service Stream Mode Tabs */}
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => {
                playSfx('click');
                setServiceStream('ALL');
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                serviceStream === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All Services ({bookings.length})
            </button>
            <button
              onClick={() => {
                playSfx('click');
                setServiceStream('HOME_TUITION');
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                serviceStream === 'HOME_TUITION'
                  ? 'bg-royal-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-royal-blue-300'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Home Tuition ({bookings.filter(b => b.serviceType === 'HOME_TUITION').length})
            </button>
            <button
              onClick={() => {
                playSfx('click');
                setServiceStream('LIBRARY');
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                serviceStream === 'LIBRARY'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <Armchair className="w-3.5 h-3.5" />
              Library Desks ({bookings.filter(b => b.serviceType === 'LIBRARY').length})
            </button>
          </div>

          {/* Search Bar & Micro Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search student, ref ID, educator, desk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4 text-slate-400" />}
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                playSfx('toggle');
                setStatusFilter(e.target.value);
              }}
              className="rounded-lg border border-slate-800 bg-slate-950 text-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">ACTIVE (Live)</option>
              <option value="PENDING">PENDING (Review)</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="PAUSED">PAUSED</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => {
                playSfx('toggle');
                setPaymentFilter(e.target.value);
              }}
              className="rounded-lg border border-slate-800 bg-slate-950 text-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">Payment: All</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>

            {/* View Mode Toggle */}
            <div className="hidden sm:inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs ${
                  viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
                title="Table View"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded text-xs ${
                  viewMode === 'cards' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
                title="Card Grid View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 5. Main Feed Deck: Table or Hex-Cards */}
      <Card className="p-0 bg-slate-900/90 border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Statewide Transaction & Allocation Stream</span>
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {filteredBookings.length} Active Records
            </span>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Verified SLA: 100% Guaranteed Dispatch
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-mono mt-3">Synthesizing statewide booking ledger...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500 mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">No Allotments Found</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No active student allocations or desk reservations matched the specified territorial and status criteria.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setPaymentFilter('ALL');
                setServiceStream('ALL');
                setGeoFilter({ countryId: 'IN', level: 'INDIA', breadcrumb: 'Pan-India Master Territory' });
              }}
              className="mt-4 border-slate-700 text-slate-300"
            >
              Reset All Filters
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/80">
                <tr>
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Student Dossier</th>
                  <th className="py-3 px-4">Service Type</th>
                  <th className="py-3 px-4">Allocated Provider / Desk</th>
                  <th className="py-3 px-4">Location Node</th>
                  <th className="py-3 px-4">Financials</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-850/70 transition-colors group">
                    {/* Ref Number & QR Badge */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">{b.refNumber}</span>
                        {b.qrPassActive && (
                          <span title="Cryptographic QR Pass Active">
                            <QrCode className="w-3.5 h-3.5 text-purple-400" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {b.createdDate.split('T')[0]}
                      </div>
                    </td>

                    {/* Student Dossier */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={b.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                          alt={b.studentName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {b.studentName}
                          </div>
                          <div className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                            <span>{b.studentMobile}</span>
                            <span>•</span>
                            <span className="text-slate-500">{b.grade}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Service Type */}
                    <td className="py-3.5 px-4">
                      {b.serviceType === 'HOME_TUITION' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-royal-blue-400 bg-royal-blue-950/60 border border-royal-blue-800/60 px-2 py-0.5 rounded text-[11px]">
                          <GraduationCap className="w-3 h-3" />
                          <span>Home Tuition</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px]">
                          <Armchair className="w-3 h-3" />
                          <span>Library Desk</span>
                        </span>
                      )}
                      <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[140px]">
                        {b.serviceType === 'HOME_TUITION' ? b.subject : b.shift}
                      </div>
                    </td>

                    {/* Allocated Provider / Workstation */}
                    <td className="py-3.5 px-4">
                      {b.serviceType === 'HOME_TUITION' ? (
                        <div>
                          <div className="font-semibold text-slate-200 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-royal-blue-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{b.teacherName || 'Assigned Educator'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {b.teacherExperience || 'Verified Faculty'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-slate-200 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{b.libraryName}</span>
                          </div>
                          <div className="text-[10px] font-mono text-emerald-400 mt-0.5 font-bold">
                            Workstation: {b.seatNumber}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Location Node */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="font-medium flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{b.district}, {b.state}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[120px]">
                        {b.locality || b.pincode}
                      </div>
                    </td>

                    {/* Financials */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-400 font-mono text-[12px]">
                        ₹{b.monthlyAmount}
                        <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded font-mono ${
                          b.paymentStatus === 'PAID'
                            ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800/40'
                            : 'text-amber-300 bg-amber-950/60 border border-amber-800/40'
                        }`}>
                          {b.paymentStatus}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Cut: ₹{b.platformCutAmount}
                        </span>
                      </div>
                    </td>

                    {/* Operational Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.status} />
                    </td>

                    {/* Quick Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Dossier Detail */}
                        <button
                          onClick={() => handleOpenDossier(b)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="View Complete Allotment Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Reassign / Reallocate */}
                        {b.serviceType === 'HOME_TUITION' ? (
                          <button
                            onClick={() => handleOpenReassign(b)}
                            className="p-1.5 rounded hover:bg-royal-blue-950/50 text-slate-400 hover:text-royal-blue-400 transition-colors"
                            title="Reassign Verified Educator"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenReallocateDesk(b)}
                            className="p-1.5 rounded hover:bg-emerald-950/50 text-slate-400 hover:text-emerald-400 transition-colors"
                            title="Reallocate Workstation / Shift"
                          >
                            <Armchair className="w-4 h-4" />
                          </button>
                        )}

                        {/* Governance & Status Transition */}
                        <button
                          onClick={() => handleOpenStatusGovernance(b)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                          title="Operational Status Transition"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>

                        {/* Digital Allotment Order Certificate */}
                        <button
                          onClick={() => handleOpenOrderDocument(b)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                          title="Generate Allotment Order Letter"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Card Grid View */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-emerald-400 font-bold text-xs">
                      {b.refNumber}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={b.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                      alt={b.studentName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{b.studentName}</h4>
                      <p className="text-xs text-slate-400 font-mono">{b.studentMobile}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 border-t border-b border-slate-800/80 py-2.5 my-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Service:</span>
                      <span className="font-semibold text-white">
                        {b.serviceType === 'HOME_TUITION' ? 'Home Tuition 1-on-1' : 'Library Desk Pass'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">
                        {b.serviceType === 'HOME_TUITION' ? 'Educator:' : 'Workstation:'}
                      </span>
                      <span className="font-semibold text-emerald-400 truncate max-w-[160px]">
                        {b.serviceType === 'HOME_TUITION' ? b.teacherName : `${b.libraryName} (${b.seatNumber})`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Location:</span>
                      <span className="text-slate-300">{b.district}, {b.state}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Monthly Value:</span>
                      <span className="font-mono font-bold text-emerald-400">₹{b.monthlyAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-mono text-slate-500">
                    Tenure: {b.startDate} → {b.endDate}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDossier(b)}
                      className="text-xs h-7 px-2 border-slate-800 hover:bg-slate-850"
                    >
                      Dossier
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => b.serviceType === 'HOME_TUITION' ? handleOpenReassign(b) : handleOpenReallocateDesk(b)}
                      className="text-xs h-7 px-2 bg-emerald-700 hover:bg-emerald-600 text-white"
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* MODAL 1: Full Booking & Allotment Dossier Modal */}
      {selectedBooking && (
        <Modal
          isOpen={isDossierModalOpen}
          onClose={() => setIsDossierModalOpen(false)}
          title={`Booking Dossier — ${selectedBooking.refNumber}`}
          size="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Header Identity Deck */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedBooking.studentAvatar}
                  alt={selectedBooking.studentName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/40"
                />
                <div>
                  <h4 className="text-base font-bold text-white">{selectedBooking.studentName}</h4>
                  <p className="text-slate-400 font-mono text-xs">{selectedBooking.studentMobile} • {selectedBooking.studentEmail}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{selectedBooking.grade}</p>
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={selectedBooking.status} />
                <div className="text-[11px] text-slate-500 font-mono mt-1">Ref: {selectedBooking.refNumber}</div>
              </div>
            </div>

            {/* Service & Operational Specifications */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Service Category
                </span>
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  {selectedBooking.serviceType === 'HOME_TUITION' ? (
                    <>
                      <GraduationCap className="w-4 h-4 text-royal-blue-400" />
                      <span>Verified Home Tuition 1-on-1</span>
                    </>
                  ) : (
                    <>
                      <Armchair className="w-4 h-4 text-emerald-400" />
                      <span>Self-Study Library Workstation</span>
                    </>
                  )}
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  {selectedBooking.serviceType === 'HOME_TUITION'
                    ? `Curriculum: ${selectedBooking.subject}`
                    : `Shift: ${selectedBooking.shift}`}
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  {selectedBooking.serviceType === 'HOME_TUITION' ? 'Allocated Educator' : 'Library & Seat'}
                </span>
                <div className="font-bold text-emerald-400 text-sm">
                  {selectedBooking.serviceType === 'HOME_TUITION'
                    ? selectedBooking.teacherName
                    : `${selectedBooking.libraryName} (${selectedBooking.seatNumber})`}
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  {selectedBooking.serviceType === 'HOME_TUITION'
                    ? selectedBooking.teacherExperience
                    : `Workstation ${selectedBooking.seatNumber} • AC Optic Fiber`}
                </p>
              </div>
            </div>

            {/* Territorial Location */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Territory & Geographic Node
              </span>
              <div className="font-semibold text-white">
                {selectedBooking.locality}, {selectedBooking.district}, {selectedBooking.state} - {selectedBooking.pincode}
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Guardian Contact: {selectedBooking.guardianName} ({selectedBooking.guardianPhone})
              </div>
            </div>

            {/* Financial Ledger & Commission Breakdown */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Financial Ledger & Commission Split
              </span>
              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                <div className="bg-slate-900 p-2 rounded">
                  <div className="text-[10px] text-slate-500">Gross Monthly</div>
                  <div className="font-bold text-white text-sm">₹{selectedBooking.monthlyAmount}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <div className="text-[10px] text-slate-500">Amount Paid</div>
                  <div className="font-bold text-emerald-400 text-sm">₹{selectedBooking.paidAmount}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <div className="text-[10px] text-slate-500">Dues Pending</div>
                  <div className="font-bold text-amber-400 text-sm">₹{selectedBooking.dueAmount}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <div className="text-[10px] text-slate-500">Platform Cut</div>
                  <div className="font-bold text-cyan-400 text-sm">₹{selectedBooking.platformCutAmount} ({selectedBooking.platformCutPercent}%)</div>
                </div>
              </div>
            </div>

            {/* Operational Notes */}
            {selectedBooking.notes && (
              <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
                <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Administrative Notes:</span>
                <p className="text-slate-300 italic">{selectedBooking.notes}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDossierModalOpen(false)}
                className="border-slate-700 text-slate-300"
              >
                Close Dossier
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsDossierModalOpen(false);
                  setIsOrderModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                View Allotment Order
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: Educator Reassignment Modal (Home Tuition) */}
      {selectedBooking && (
        <Modal
          isOpen={isReassignModalOpen}
          onClose={() => setIsReassignModalOpen(false)}
          title={`Reassign Verified Educator — ${selectedBooking.studentName}`}
          size="md"
        >
          <form onSubmit={handleExecuteReassignment} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Current Educator:</span>
              <span className="font-bold text-white text-sm">{selectedBooking.teacherName || 'Unassigned'}</span>
              <span className="text-slate-400 block mt-0.5">{selectedBooking.subject} • {selectedBooking.district}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Verified Educator in {selectedBooking.district}:
              </label>
              <select
                value={reassignTeacherId}
                onChange={(e) => setReassignTeacherId(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 text-white p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                required
              >
                <option value="">Choose an accredited educator...</option>
                {districtTeachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.subjects} ({t.exp})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mandatory Administrative Reason / Justification:
              </label>
              <textarea
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="Specify regulatory reason (e.g., Student requested subject specialization, Educator maternity leave, Shift clash)..."
                rows={3}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 text-white p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReassignModalOpen(false)}
                className="border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={reassigning}
                className="bg-royal-blue-600 hover:bg-royal-blue-500 text-white"
              >
                {reassigning ? 'Reassigning...' : 'Confirm Reassignment'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Library Desk Reallocation Modal */}
      {selectedBooking && (
        <Modal
          isOpen={isReallocateDeskModalOpen}
          onClose={() => setIsReallocateDeskModalOpen(false)}
          title={`Reallocate Desk Workstation — ${selectedBooking.studentName}`}
          size="md"
        >
          <form onSubmit={handleExecuteDeskReallocation} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Library:</span>
              <span className="font-bold text-white text-sm">{selectedBooking.libraryName}</span>
              <span className="text-emerald-400 font-mono block mt-0.5">
                Current: {selectedBooking.seatNumber} ({selectedBooking.shift})
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Desk Workstation Identifier:
              </label>
              <Input
                value={reallocateSeatNumber}
                onChange={(e) => setReallocateSeatNumber(e.target.value)}
                placeholder="e.g. Desk-A-04, Seat-VIP-02"
                className="bg-slate-950 border-slate-800 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Shift Timing:
              </label>
              <select
                value={reallocateShift}
                onChange={(e) => setReallocateShift(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 text-white p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Morning Shift (06:00 AM - 02:00 PM)">Morning Shift (06:00 AM - 02:00 PM)</option>
                <option value="Evening Shift (02:00 PM - 10:00 PM)">Evening Shift (02:00 PM - 10:00 PM)</option>
                <option value="Full Day (06:00 AM - 10:00 PM)">Full Day (06:00 AM - 10:00 PM)</option>
                <option value="Night Owl Shift (10:00 PM - 06:00 AM)">Night Owl Shift (10:00 PM - 06:00 AM)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mandatory Administrative Reason:
              </label>
              <textarea
                value={reallocateReason}
                onChange={(e) => setReallocateReason(e.target.value)}
                placeholder="Reason for seat reallocation (e.g. Learner requested corner quiet desk, AC ventilation preference, shift upgrade)..."
                rows={3}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 text-white p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReallocateDeskModalOpen(false)}
                className="border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={reallocating}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {reallocating ? 'Reallocating...' : 'Confirm Reallocation'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: Operational Status Governance Modal */}
      {selectedBooking && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Booking Governance — ${selectedBooking.refNumber}`}
          size="md"
        >
          <form onSubmit={handleExecuteStatusGovernance} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Student:</span>
                <span className="font-bold text-white">{selectedBooking.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Status:</span>
                <StatusBadge status={selectedBooking.status} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Transition to New Status:
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as UnifiedBookingStatus)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 text-white p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ACTIVE">ACTIVE (Authorized & Operational)</option>
                <option value="PAUSED">PAUSED (Temporary Exam Leave)</option>
                <option value="COMPLETED">COMPLETED (Term Fulfilled)</option>
                <option value="SUSPENDED">SUSPENDED (Disciplinary / Non-Payment)</option>
                <option value="CANCELLED">CANCELLED (Contract Terminated)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mandatory Regulatory Reason:
              </label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Explain the administrative justification for this status change..."
                rows={3}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 text-white p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsStatusModalOpen(false)}
                className="border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={statusUpdating}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {statusUpdating ? 'Updating...' : 'Apply Transition'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 5: Official Cryptographic Allotment Order Certificate */}
      {selectedBooking && (
        <Modal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          title="Official FocusPoint Allotment Order"
          size="xl"
        >
          <div className="space-y-4 text-xs">
            {/* Printable Order Letter Surface */}
            <div className="p-6 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 font-sans print:m-0 print:p-0">
              {/* Header Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-4">
                <div>
                  <div className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span>FOCUSPOINT</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold tracking-normal">
                      ACCREDITED
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">Pan-India Academic & Learning Infrastructure</div>
                  <div className="text-[10px] text-slate-500 font-mono">Central Directorate, Sigra, Varanasi, UP - 221002</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-slate-800">ORDER NO: {selectedBooking.refNumber}</div>
                  <div className="text-[11px] text-slate-500">Date: {new Date().toLocaleDateString('en-IN')}</div>
                  <div className="text-[10px] font-mono text-emerald-700 font-semibold uppercase">VERIFIED SECURE</div>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-4">
                <span className="font-bold text-xs uppercase tracking-wide text-slate-800 block">
                  SUB: OFFICIAL ALLOTMENT & AUTHORIZATION ORDER
                </span>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  This certifies that <strong>{selectedBooking.studentName}</strong> (Mobile: {selectedBooking.studentMobile}) 
                  has been officially allotted the following sovereign FocusPoint educational resource:
                </p>
              </div>

              {/* Table of Particulars */}
              <table className="w-full text-left text-xs border border-slate-300 mb-4">
                <tbody>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-700 w-1/3">Service Category</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {selectedBooking.serviceType === 'HOME_TUITION' ? 'Home Tuition 1-on-1 Faculty' : 'Self-Study Library Desk Pass'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 px-3 font-bold text-slate-700">Allocated Provider</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {selectedBooking.serviceType === 'HOME_TUITION' ? selectedBooking.teacherName : selectedBooking.libraryName}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-700">Workstation / Subject</td>
                    <td className="py-2 px-3 font-semibold text-slate-900 font-mono">
                      {selectedBooking.serviceType === 'HOME_TUITION' ? selectedBooking.subject : `Desk ${selectedBooking.seatNumber} (${selectedBooking.shift})`}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 px-3 font-bold text-slate-700">Territorial Node</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {selectedBooking.locality}, {selectedBooking.district}, {selectedBooking.state}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-700">Tenure Validity</td>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-900">
                      {selectedBooking.startDate} to {selectedBooking.endDate}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-700">Authorized Status</td>
                    <td className="py-2 px-3 font-bold text-emerald-700 font-mono uppercase">
                      {selectedBooking.status} (Verified Compliant)
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* QR Verification Seal & Signature */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-100 rounded border border-slate-300">
                    <QrCode className="w-10 h-10 text-slate-900" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono leading-tight">
                    <div>SCAN TO VERIFY</div>
                    <div>PASS ID: {selectedBooking.qrPassId || selectedBooking.refNumber}</div>
                    <div className="text-emerald-700 font-semibold">DIGITALLY SIGNED</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-slate-900">Mukesh Sonkar</div>
                  <div className="text-[10px] text-slate-600 font-semibold">Chief Platform Director</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Super Admin Directorate</div>
                </div>
              </div>
            </div>

            {/* Print / Download Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOrderModalOpen(false)}
                className="border-slate-800 text-slate-300"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  window.print();
                  playSfx('confirm');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print Allotment Order
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 6: Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Pan-India Bookings Ledger"
        data={filteredBookings}
        filename={`FocusPoint_Bookings_${geoFilter.districtName || 'Pan_India'}_${new Date().toISOString().split('T')[0]}`}
      />
    </div>
  );
};
export default SuperAdminBookings;
