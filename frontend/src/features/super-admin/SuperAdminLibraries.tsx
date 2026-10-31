// FOCUSPOINT Super Admin — Partner Study Libraries Grid & Autonomous Node Command
// Futuristic Cyber-HUD console with Real-time IoT Environmental Telemetry, 
// AI Life-Safety Radar Scanner, Interactive Digital Twin Floorplan, 1-Click Seat Dispatch,
// Holographic Accreditation Badges, Monthly Escrow Settlement Slips, and Cyber Acoustic Synthesizer.

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { superAdminService } from '../../services/superAdminService';
import { documentService } from '../../services/documentService';
import { locationService } from '../../services/locationService';
import { libraryDiscoveryService } from '../../services/libraryDiscoveryService';
import { mockStore } from '../../mock/store';
import { Library, LibraryCertificateData } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { LibraryCertificateModal } from '../../components/common/LibraryCertificateModal';
import { ExportModal } from '../../components/common/ExportModal';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Search,
  MapPin,
  Armchair,
  Eye,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Wifi,
  Zap,
  Camera,
  Award,
  Download,
  Users,
  IndianRupee,
  ExternalLink,
  X,
  Globe,
  Sparkles,
  Check,
  Copy,
  MessageCircle,
  RefreshCw,
  Cpu,
  Radio,
  SlidersHorizontal,
  Flame,
  Fingerprint,
  Layers,
  ChevronRight,
  AlertTriangle,
  Volume2,
  VolumeX,
  Plus,
  Receipt,
  QrCode,
  Printer,
  Calendar,
  Smartphone,
  ShieldAlert,
  Activity,
  Compass,
  FileText
} from 'lucide-react';

// Cyber Acoustic Synthesizer for tactile feedback
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
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'warp':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(960, now + 0.16);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      case 'confirm':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(840, now + 0.06);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      case 'toggle':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.setValueAtTime(510, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      case 'alert':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(240, now + 0.08);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.06);
        osc.frequency.setValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
    }
  } catch (e) {
    // Audio context may be restricted by autoplay policy
  }
};

/**
 * Universal evaluation helpers across legacy, mock, and active schemas.
 */
export const checkIsLibraryVerified = (l: Partial<Library> | null | undefined): boolean => {
  if (!l) return false;
  const v = String(l.verificationStatus || '').trim().toUpperCase();
  const s = String((l as any).status || '').trim().toUpperCase();
  const a = String((l as any).auditStatus || '').trim().toUpperCase();
  return v === 'APPROVED' || v === 'VERIFIED' || s === 'ACTIVE' || a === 'VERIFIED';
};

export const checkIsLibrarySuspended = (l: Partial<Library> | null | undefined): boolean => {
  if (!l) return false;
  const v = String(l.verificationStatus || '').trim().toUpperCase();
  const s = String((l as any).status || '').trim().toUpperCase();
  const a = String((l as any).auditStatus || '').trim().toUpperCase();
  return v === 'SUSPENDED' || s === 'SUSPENDED' || a === 'SUSPENDED';
};

export const checkIsLibraryPending = (l: Partial<Library> | null | undefined): boolean => {
  if (!l) return false;
  return !checkIsLibraryVerified(l) && !checkIsLibrarySuspended(l);
};

export const SuperAdminLibraries: React.FC = () => {
  const { showToast } = useToast();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  // Audio mute state
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('fp_cyber_sound') === 'muted';
  });

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem('fp_cyber_sound', next ? 'muted' : 'active');
    if (!next) playCyberSound('confirm');
  };

  // Filters
  const [search, setSearch] = useState('');
  const allStates = useMemo(() => locationService.getStates(), []);
  const [stateFilter, setStateFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'suspended' | 'high_capacity'>('all');

  const availableDistricts = useMemo(() => {
    if (stateFilter === 'all') {
      return locationService.getActiveDistricts();
    }
    const st = allStates.find(s => s.name.toLowerCase() === stateFilter.toLowerCase());
    return st ? locationService.getDistricts(st.id) : [];
  }, [stateFilter, allStates]);

  useEffect(() => {
    setDistrictFilter('all');
  }, [stateFilter]);

  // Inspection Modal & Checklist State
  const [selectedLib, setSelectedLib] = useState<Library | null>(null);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [quickVerifyingId, setQuickVerifyingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 6-Point Interactive Safety Compliance State
  const [auditChecklist, setAuditChecklist] = useState({
    cctv: true,
    powerBackup: true,
    fireSafety: true,
    ergonomicSeating: true,
    opticalFiber: true,
    biometricAccess: true
  });
  const [auditRemarks, setAuditRemarks] = useState('');

  // Modals
  const [selectedCertificate, setSelectedCertificate] = useState<LibraryCertificateData | null>(null);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // 1-Click Seat Dispatch State
  const [dispatchLib, setDispatchLib] = useState<Library | null>(null);
  const [dispatchStudentName, setDispatchStudentName] = useState('');
  const [dispatchStudentPhone, setDispatchStudentPhone] = useState('');
  const [dispatchShift, setDispatchShift] = useState('Morning Shift (06:00 AM - 12:00 PM)');
  const [dispatchExamFocus, setDispatchExamFocus] = useState('UPSC Civil Services');
  const [dispatchSeatNumber, setDispatchSeatNumber] = useState('');
  const [dispatchFee, setDispatchFee] = useState(499);
  const [isDispatching, setIsDispatching] = useState(false);

  // AI Facility Safety Radar Scan Modal State
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [radarScanning, setRadarScanning] = useState(false);
  const [radarResult, setRadarResult] = useState<{
    totalNodesAudited: number;
    passedGateCount: number;
    safetyComplianceIndex: number;
    sha3AuditSeal: string;
    timestamp: string;
    diagnostics: {
      fireSafetyNOC: string;
      powerGridFailover: string;
      opticalFiberBroadband: string;
      soundAcousticsIndex: string;
      biometricTurnstiles: string;
    };
  } | null>(null);
  const [radarStep, setRadarStep] = useState(0);

  // Escrow & Financial Settlement Slip State
  const [settlementLib, setSettlementLib] = useState<Library | null>(null);
  const [settlementData, setSettlementData] = useState<{
    voucherId: string;
    libraryId: string;
    libraryName: string;
    ownerName: string;
    period: string;
    grossBookings: number;
    platformCommission: number;
    tdsDeducted: number;
    netPayout: number;
    utrNumber: string;
    escrowStatus: 'SETTLED' | 'ESCROW_PENDING';
    generatedAt: string;
  } | null>(null);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);

  // Direct Super Admin Onboard Node Modal State
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    name: '',
    ownerName: '',
    ownerPhone: '',
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    area: 'Collectorate Complex',
    address: 'Near Head Post Office, Civil Lines',
    pincode: '233001',
    totalSeats: 60,
    monthlyFee: 499,
    hourlyRate: 30
  });
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Selected Seat in Digital Twin Floorplan
  const [selectedSeatIndex, setSelectedSeatIndex] = useState<number | null>(null);

  const fetchLibraries = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await superAdminService.getAllLibraries();
      setLibraries(data);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load libraries', err);
      showToast('Failed to load library network telemetry', 'error');
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLibraries();

    // Listen to real-time store changes and cross-tab storage events
    const handleRemoteChange = () => {
      fetchLibraries(true);
    };

    const unsubscribeMock = mockStore.onLibraryChange(() => {
      fetchLibraries(true);
    });

    const unsubscribeDiscovery = libraryDiscoveryService.subscribe(() => {
      fetchLibraries(true);
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('focuspoint:library_status_changed', handleRemoteChange);
      window.addEventListener('storage', (e) => {
        if (e.key === 'fp_mock_store_v1' || e.key === 'fp_libraries') {
          fetchLibraries(true);
        }
      });
    }

    return () => {
      unsubscribeMock();
      unsubscribeDiscovery();
      if (typeof window !== 'undefined') {
        window.removeEventListener('focuspoint:library_status_changed', handleRemoteChange);
      }
    };
  }, []);

  const handleManualRefresh = () => {
    playCyberSound('click');
    setRefreshing(true);
    fetchLibraries(false);
  };

  const handleOpenCertificate = async (libId: string) => {
    playCyberSound('warp');
    try {
      const cert = await documentService.getLibraryCertificate(libId);
      if (cert) {
        setSelectedCertificate(cert);
        setIsCertOpen(true);
      } else {
        showToast('Certificate record not found for this facility', 'error');
      }
    } catch (err) {
      showToast('Failed to generate verification certificate', 'error');
    }
  };

  const handleOpenInspection = (lib: Library) => {
    playCyberSound('warp');
    setSelectedLib(lib);
    setSelectedSeatIndex(null);
    setAuditChecklist({
      cctv: true,
      powerBackup: true,
      fireSafety: true,
      ergonomicSeating: true,
      opticalFiber: true,
      biometricAccess: true
    });
    setAuditRemarks(
      (lib as any).auditRemarks || 
      'Facility physical inspection verified. All life-safety, optical fiber, and ergonomic seating benchmarks cleared.'
    );
  };

  // Robust Status Override: Saves to service, store, and safeStorage so it survives page reloads
  const handleOverrideStatus = async (newStatus: 'APPROVED' | 'SUSPENDED') => {
    if (!selectedLib) return;
    setActionProcessing(true);
    playCyberSound(newStatus === 'APPROVED' ? 'confirm' : 'alert');
    try {
      const remarks = auditRemarks.trim() || 
        (newStatus === 'APPROVED' 
          ? "ZYZU'S Institutional Safety & Physical Security Accreditation cleared." 
          : 'Facility suspended pending compliance audit.');

      await superAdminService.updateLibraryStatus(
        selectedLib.id,
        newStatus,
        remarks,
        {
          verifiedBy: 'Super Admin HQ (Institutional Security Registry)',
          verifiedAt: new Date().toISOString(),
          remarks
        }
      );

      // Reactively reflect in local list
      setLibraries(prev =>
        prev.map(l =>
          l.id === selectedLib.id
            ? {
                ...l,
                verificationStatus: newStatus,
                status: newStatus === 'APPROVED' ? 'active' : 'suspended',
                auditStatus: newStatus === 'APPROVED' ? 'VERIFIED' : 'SUSPENDED',
                verifiedAt: newStatus === 'APPROVED' ? new Date().toISOString() : (l as any).verifiedAt,
                verifiedBy: newStatus === 'APPROVED' ? 'Super Admin HQ' : (l as any).verifiedBy,
                auditRemarks: remarks
              }
            : l
        )
      );

      setSelectedLib(prev =>
        prev
          ? {
              ...prev,
              verificationStatus: newStatus,
              status: newStatus === 'APPROVED' ? 'active' : 'suspended',
              auditStatus: newStatus === 'APPROVED' ? 'VERIFIED' : 'SUSPENDED',
              auditRemarks: remarks
            }
          : null
      );

      showToast(
        newStatus === 'APPROVED'
          ? `Facility "${selectedLib.name}" Accredited & Official Certificate Issued!`
          : `Facility "${selectedLib.name}" has been Suspended.`,
        newStatus === 'APPROVED' ? 'success' : 'warning'
      );
      setSelectedLib(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to update library verification status', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  // Direct One-Click Quick Verification from Table Row
  const handleQuickVerify = async (lib: Library, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playCyberSound('confirm');
    setQuickVerifyingId(lib.id);
    try {
      const remarks = 'Instant Super Admin Accreditation & Safety Clearance cleared.';
      await superAdminService.updateLibraryStatus(
        lib.id,
        'APPROVED',
        remarks,
        {
          verifiedBy: 'Super Admin HQ (Institutional Security Registry)',
          verifiedAt: new Date().toISOString(),
          remarks
        }
      );

      setLibraries(prev =>
        prev.map(l =>
          l.id === lib.id
            ? {
                ...l,
                verificationStatus: 'APPROVED',
                status: 'active',
                auditStatus: 'VERIFIED',
                verifiedAt: new Date().toISOString(),
                verifiedBy: 'Super Admin HQ',
                auditRemarks: remarks
              }
            : l
        )
      );

      showToast(`⚡ Instant Clearance: "${lib.name}" Accredited & Certified!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to quick-verify facility', 'error');
    } finally {
      setQuickVerifyingId(null);
    }
  };

  // Toggle Holographic Accreditation Badges
  const handleToggleBadge = async (badgeName: string) => {
    if (!selectedLib) return;
    playCyberSound('toggle');
    try {
      const updated = await superAdminService.awardLibraryAccreditationBadge(selectedLib.id, badgeName);
      if (updated) {
        setSelectedLib(prev => prev ? { ...prev, accreditationBadges: updated.accreditationBadges } : null);
        setLibraries(prev => prev.map(l => l.id === selectedLib.id ? { ...l, accreditationBadges: updated.accreditationBadges } : l));
        showToast(`Accreditation badge "${badgeName.replace(/_/g, ' ')}" updated!`, 'success');
      }
    } catch (err) {
      showToast('Failed to update accreditation badge', 'error');
    }
  };

  // 1-Click Seat Dispatch
  const handleOpenDispatch = (lib: Library, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playCyberSound('warp');
    setDispatchLib(lib);
    setDispatchStudentName('');
    setDispatchStudentPhone('');
    setDispatchSeatNumber(`A-${Math.floor(Math.random() * 20) + 1}`);
    setDispatchFee(lib.monthlyFee || lib.monthlyStartingPrice || 499);
  };

  const handleExecuteDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchLib || !dispatchStudentName.trim() || !dispatchStudentPhone.trim()) {
      showToast('Please enter scholar name and phone number', 'warning');
      return;
    }
    setIsDispatching(true);
    playCyberSound('confirm');
    try {
      const res = await superAdminService.dispatchSeatAllocation(dispatchLib.id, {
        studentName: dispatchStudentName.trim(),
        studentPhone: dispatchStudentPhone.trim(),
        shiftName: dispatchShift,
        seatNumber: dispatchSeatNumber,
        monthlyFee: Number(dispatchFee),
        examFocus: dispatchExamFocus
      });

      setLibraries(prev => prev.map(l => l.id === dispatchLib.id ? { ...l, availableSeats: res.library.availableSeats } : l));
      showToast(`🎓 Seat ${res.seatAllocated} allocated to ${dispatchStudentName} at ${dispatchLib.name}!`, 'success');
      setDispatchLib(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to dispatch student seat allocation', 'error');
    } finally {
      setIsDispatching(false);
    }
  };

  // AI Radar Scan Execution
  const handleRunRadarScan = async () => {
    playCyberSound('warp');
    setIsRadarOpen(true);
    setRadarScanning(true);
    setRadarResult(null);
    setRadarStep(0);

    const stepTimer1 = setTimeout(() => { playCyberSound('click'); setRadarStep(1); }, 400);
    const stepTimer2 = setTimeout(() => { playCyberSound('click'); setRadarStep(2); }, 900);
    const stepTimer3 = setTimeout(() => { playCyberSound('click'); setRadarStep(3); }, 1400);
    const stepTimer4 = setTimeout(() => { playCyberSound('click'); setRadarStep(4); }, 1900);

    try {
      const scan = await superAdminService.runAutomatedFacilitySafetyScan();
      setTimeout(() => {
        setRadarResult(scan);
        setRadarScanning(false);
        setRadarStep(5);
        playCyberSound('success');
      }, 2300);
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);
      setRadarScanning(false);
      showToast('Radar audit failed', 'error');
    }
  };

  // Monthly Escrow Settlement Voucher
  const handleOpenSettlement = async (lib: Library, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playCyberSound('warp');
    setSettlementLib(lib);
    try {
      const voucher = await superAdminService.generateLibrarySettlementVoucher(lib.id);
      setSettlementData(voucher);
      setIsSettlementOpen(true);
    } catch (err) {
      showToast('Failed to generate settlement slip', 'error');
    }
  };

  // Onboard New Node
  const handleExecuteOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.name.trim() || !onboardForm.ownerName.trim()) {
      showToast('Please specify facility name and partner name', 'warning');
      return;
    }
    setIsOnboarding(true);
    playCyberSound('confirm');
    try {
      const newLib = await superAdminService.onboardPartnerLibrary({
        name: onboardForm.name.trim(),
        ownerName: onboardForm.ownerName.trim(),
        ownerPhone: onboardForm.ownerPhone.trim() || '9876543210',
        district: onboardForm.district,
        districtName: onboardForm.district,
        state: onboardForm.state,
        stateName: onboardForm.state,
        area: onboardForm.area,
        address: onboardForm.address,
        pincode: onboardForm.pincode,
        totalSeats: Number(onboardForm.totalSeats) || 50,
        monthlyFee: Number(onboardForm.monthlyFee) || 499,
        monthlyStartingPrice: Number(onboardForm.monthlyFee) || 499,
        hourlyRate: Number(onboardForm.hourlyRate) || 30
      });

      setLibraries(prev => [newLib, ...prev]);
      showToast(`⚡ Node "${newLib.name}" successfully registered and accredited!`, 'success');
      setIsOnboardOpen(false);
      setOnboardForm({
        name: '',
        ownerName: '',
        ownerPhone: '',
        district: 'Ghazipur',
        state: 'Uttar Pradesh',
        area: 'Collectorate Complex',
        address: 'Near Head Post Office, Civil Lines',
        pincode: '233001',
        totalSeats: 60,
        monthlyFee: 499,
        hourlyRate: 30
      });
    } catch (err) {
      console.error(err);
      showToast('Failed to onboard partner study library', 'error');
    } finally {
      setIsOnboarding(false);
    }
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playCyberSound('click');
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(`Copied Node ID "${id}" to clipboard`, 'info');
  };

  const handleWhatsAppContact = (lib: Library, e: React.MouseEvent) => {
    e.stopPropagation();
    playCyberSound('click');
    const phone = (lib as any).ownerPhone || (lib as any).phone || '9876543210';
    const cleanPhone = phone.replace(/\D/g, '');
    const isVerified = checkIsLibraryVerified(lib);
    const text = encodeURIComponent(
      `Hello ${lib.ownerName || `Partner`},\nThis is ZYZU'S Institutional Registry Super Admin HQ regarding "${lib.name}" (Node: ${lib.id}).\nAccreditation: ${isVerified ? `VERIFIED PARTNER` : 'PENDING SAFETY AUDIT'}.\nTotal Desks: ${lib.totalSeats || 50} | Vacant: ${lib.availableSeats ?? 18}.\nVisit ZYZU'S Portal to view floorplans and settlement vouchers.`
    );
    window.open(`https://wa.me/91${cleanPhone}?text=${text}`, '_blank');
  };

  // Metric Computations
  const totalLibraries = libraries.length;
  const verifiedCount = libraries.filter(checkIsLibraryVerified).length;
  const pendingCount = libraries.filter(checkIsLibraryPending).length;
  const suspendedCount = libraries.filter(checkIsLibrarySuspended).length;
  const totalDesks = libraries.reduce((sum, l) => sum + (l.totalSeats || 50), 0);
  const availableDesks = libraries.reduce((sum, l) => sum + (l.availableSeats ?? 18), 0);
  const occupiedDesks = Math.max(0, totalDesks - availableDesks);
  const occupancyPercent = totalDesks > 0 ? Math.round((occupiedDesks / totalDesks) * 100) : 0;

  // Filtered Facilities Matrix
  const filtered = libraries.filter(l => {
    const isVerified = checkIsLibraryVerified(l);
    const isPending = checkIsLibraryPending(l);
    const isSuspended = checkIsLibrarySuspended(l);
    const isHighCap = (l.totalSeats || 50) >= 70;

    if (statusFilter === 'verified' && !isVerified) return false;
    if (statusFilter === 'pending' && !isPending) return false;
    if (statusFilter === 'suspended' && !isSuspended) return false;
    if (statusFilter === 'high_capacity' && !isHighCap) return false;

    const q = search.toLowerCase().trim();
    const matchesSearch = !q ||
      l.name.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q) ||
      (l.ownerName || '').toLowerCase().includes(q) ||
      (l.area || '').toLowerCase().includes(q) ||
      (l.pincode || '').toLowerCase().includes(q) ||
      (l.address || '').toLowerCase().includes(q);

    const st = ((l as any).state || (l as any).stateName || 'Uttar Pradesh').toLowerCase();
    const matchesState = stateFilter === 'all' || st.includes(stateFilter.toLowerCase());

    const dist = (l.district || l.districtName || '').toLowerCase();
    const matchesDistrict = districtFilter === 'all' || dist === districtFilter.toLowerCase();

    return matchesSearch && matchesState && matchesDistrict;
  });

  // Available Accreditation Badges Catalog
  const BADGES_CATALOG = [
    { id: 'ISO_27001_PHYSICAL_SECURITY', label: 'ISO-27001 Physical Safety', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    { id: 'SILENT_SANCTUARY_ACCREDITED', label: 'Pin-Drop Silent Sanctuary', color: 'bg-blue-50 text-blue-700 border-blue-300' },
    { id: '24_7_ALL_NIGHTER_HUB', label: '24/7 All-Nighter Pass Hub', color: 'bg-purple-50 text-purple-700 border-purple-300' },
    { id: 'WOMEN_SAFETY_CERTIFIED', label: 'Women Safety & Verified CCTV', color: 'bg-rose-50 text-rose-700 border-rose-300' },
    { id: 'OPTICAL_FIBER_VERIFIED', label: 'High-Speed Fiber Broadband', color: 'bg-amber-50 text-amber-700 border-amber-300' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Futuristic Telemetry HUD Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 p-4 shadow-lg text-white">
        <div className="absolute top-0 right-0 w-96 h-full bg-radial from-brand-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-brand-500/20 border border-brand-500/40 text-brand-400 shadow-sm">
              <Cpu className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-brand-500/30">
                  GRID CORE v4.8 // STATEWIDE AUTONOMOUS FACILITY GRID
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Heartbeat: <span className="text-slate-200 font-semibold">{lastSyncTime}</span>
                </span>
              </div>
              <h2 className="text-sm font-bold text-white tracking-wide mt-0.5 flex items-center gap-2">
                <span>ZYZU'S Partner Study Libraries Command</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  99.8% IOT RELIABILITY
                </span>
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/60 text-[11px] font-mono text-slate-300">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>AES-256 GCM // RFID TURNSTILES ACTIVE</span>
            </div>

            <button
              onClick={handleRunRadarScan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-xs font-bold text-white shadow-md transition-all cursor-pointer active:scale-95"
              title="Launch automated AI Life-Safety and Telemetry Radar scan"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>AI Radar Scan</span>
            </button>

            <button
              onClick={() => {
                playCyberSound('click');
                setIsOnboardOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm transition-all cursor-pointer active:scale-95"
              title="Onboard a new partner study library node"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Onboard Node</span>
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all cursor-pointer active:scale-95"
              title="Force resynchronize with Central Registry storage"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Sync Grid</span>
            </button>

            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title={isMuted ? 'Unmute cyber acoustic synthesizer' : 'Mute cyber audio feedback'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-brand-400" />}
            </button>
          </div>
        </div>

        {/* Pan-India Live IoT Sensor Telemetry Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Decibel Acoustics:</span>
            <strong className="text-emerald-300 font-bold">26.8 dB (Silent Sanctuary)</strong>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-slate-400">Optical Fiber:</span>
            <strong className="text-blue-300 font-bold">11 ms Ping (Gigabit Lines)</strong>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-slate-400">Power Failover:</span>
            <strong className="text-amber-300 font-bold">99.9% Dual DG Ready</strong>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-slate-400">Biometric Gates:</span>
            <strong className="text-purple-300 font-bold">100% Online (Zero Wait)</strong>
          </div>
        </div>
      </div>

      {/* Main PageHeader */}
      <PageHeader
        title="Partner Study Libraries Grid"
        subtitle="Autonomous governance of state-wide partner study sanctuaries, physical desk compute allocations, biometric turnstiles, and tamper-proof ZYZU'S Verification Certificates."
        breadcrumbs={[
          { label: 'Super Admin', href: '/super-admin' },
          { label: 'Partner Study Libraries' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Link to="/super-admin/library-students">
              <Button
                variant="outline"
                size="sm"
                className="border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs shadow-xs"
              >
                <Users className="w-4 h-4 mr-1.5 text-brand-600" />
                Enrolled Scholars & Desks
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                playCyberSound('click');
                setIsExportOpen(true);
              }}
              className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs"
            >
              <Download className="w-4 h-4 mr-2 text-brand-600" />
              Export Grid Matrix
            </Button>
          </div>
        }
      />

      {/* Regional Corridor Saturation Matrix Preview */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-brand-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Spatial Corridor Saturation & Regional Readiness
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-bold">
            EASTERN UP & NCR CLUSTERS
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { district: 'Ghazipur', total: 320, load: 86, color: 'text-brand-600' },
            { district: 'Varanasi', total: 450, load: 92, color: 'text-purple-600' },
            { district: 'Mau', total: 180, load: 80, color: 'text-blue-600' },
            { district: 'Ballia', total: 210, load: 74, color: 'text-amber-600' },
            { district: 'Gorakhpur', total: 390, load: 78, color: 'text-emerald-600' },
            { district: 'Lucknow', total: 540, load: 89, color: 'text-rose-600' }
          ].map(c => (
            <div key={c.district} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{c.district}</span>
                <span className="font-mono text-[10px] font-bold text-slate-600">{c.load}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-brand-500 h-1.5 rounded-full"
                  style={{ width: `${c.load}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{c.total} Total Desks</p>
            </div>
          ))}
        </div>
      </div>

      {/* Futuristic Telemetry HUD KPI Pods */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pod 1: Total Facilities */}
        <div className="relative group overflow-hidden rounded-2xl p-4 bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              NETWORK NODES
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Partner Study Facilities</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalLibraries}</p>
            <span className="text-xs text-slate-500 font-medium">active units</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Pan-India Coverage</span>
            <span className="text-slate-900 font-bold">{allStates.length} States</span>
          </div>
        </div>

        {/* Pod 2: Physical Desks & Load */}
        <div className="relative group overflow-hidden rounded-2xl p-4 bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <Armchair className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              {occupancyPercent}% LOADED
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Desk Capacity</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalDesks}</p>
            <span className="text-xs text-purple-700 font-bold">{occupiedDesks} Occupied</span>
          </div>
          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-500 to-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, occupancyPercent)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Vacant: <strong className="text-emerald-600 font-bold">{availableDesks}</strong></span>
            <span>Total: {totalDesks}</span>
          </div>
        </div>

        {/* Pod 3: Accredited Grid */}
        <div className="relative group overflow-hidden rounded-2xl p-4 bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> ISO VERIFIED
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Accredited & Certified</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-extrabold text-emerald-700 tracking-tight">{verifiedCount}</p>
            <span className="text-xs text-slate-500 font-medium">of {totalLibraries} facilities</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Certificates Issued</span>
            <span className="text-emerald-700 font-bold">{verifiedCount} Active</span>
          </div>
        </div>

        {/* Pod 4: Audit Pipeline */}
        <div className={`relative group overflow-hidden rounded-2xl p-4 bg-white shadow-xs transition-all ${
          pendingCount > 0 
            ? 'border-2 border-amber-300 bg-amber-50/10' 
            : 'border border-slate-200/90'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Clock className="w-5 h-5" />
            </div>
            {pendingCount > 0 ? (
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1 animate-pulse">
                ACTION REQUIRED
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                AUDIT ALL CLEAR
              </span>
            )}
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Safety Audit</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className={`text-3xl font-extrabold tracking-tight ${pendingCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {pendingCount}
            </p>
            <span className="text-xs text-slate-500 font-medium">awaiting clearance</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Suspended Nodes</span>
            <span className="text-rose-600 font-bold">{suspendedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter HUD Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200">
        <button
          onClick={() => {
            playCyberSound('click');
            setStatusFilter('all');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-brand-600" />
          <span>All Facilities</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 text-slate-700">
            {totalLibraries}
          </span>
        </button>

        <button
          onClick={() => {
            playCyberSound('click');
            setStatusFilter('verified');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'verified'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs'
              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified & Accredited</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
            {verifiedCount}
          </span>
        </button>

        <button
          onClick={() => {
            playCyberSound('click');
            setStatusFilter('pending');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-50 text-amber-700 border border-amber-300 shadow-xs'
              : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50/50'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Pending Safety Audit</span>
          {pendingCount > 0 ? (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500 text-white font-bold animate-pulse">
              {pendingCount}
            </span>
          ) : (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 text-slate-600">
              0
            </span>
          )}
        </button>

        <button
          onClick={() => {
            playCyberSound('click');
            setStatusFilter('suspended');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'suspended'
              ? 'bg-rose-50 text-rose-700 border border-rose-300 shadow-xs'
              : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50/50'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Suspended Nodes</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 text-slate-600">
            {suspendedCount}
          </span>
        </button>

        <button
          onClick={() => {
            playCyberSound('click');
            setStatusFilter('high_capacity');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'high_capacity'
              ? 'bg-purple-50 text-purple-700 border border-purple-300 shadow-xs'
              : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>High Capacity (&ge;70 Desks)</span>
        </button>
      </div>

      {/* Holographic Search & Cascading Location Toolbar */}
      <Card className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by facility name, node ID, owner name, locality, PIN code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:bg-white focus:border-brand-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* State Filter */}
            <div>
              <select
                value={stateFilter}
                onChange={(e) => {
                  playCyberSound('click');
                  setStateFilter(e.target.value);
                }}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none shadow-xs cursor-pointer"
              >
                <option value="all">Pan-India (All States)</option>
                {allStates.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Cascading District Filter */}
            <div>
              <select
                value={districtFilter}
                onChange={(e) => {
                  playCyberSound('click');
                  setDistrictFilter(e.target.value);
                }}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none shadow-xs cursor-pointer"
              >
                <option value="all">
                  {stateFilter === 'all' ? 'All Districts' : `All in ${stateFilter}`}
                </option>
                {availableDistricts.map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button if any active */}
            {(search || stateFilter !== 'all' || districtFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  playCyberSound('click');
                  setSearch('');
                  setStateFilter('all');
                  setDistrictFilter('all');
                  setStatusFilter('all');
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Study Facilities Matrix Table */}
      <Card className="p-0 overflow-hidden bg-white border border-slate-200/90 rounded-2xl shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
              <Cpu className="w-5 h-5 text-brand-600 absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-slate-800 font-bold text-xs mt-4">Synchronizing Global Study Grid...</p>
            <p className="text-slate-500 text-[11px] font-mono mt-1">Reading cryptographic node records from safeStorage</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Building2 className="w-8 h-8" />
            </div>
            <p className="font-bold text-slate-900 text-base">No Facilities Match Filter Parameters</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No registered study hall nodes correspond to the selected district, verification status, or search query.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setStateFilter('all');
                setDistrictFilter('all');
              }}
              className="mt-4 border-slate-300 text-xs text-brand-600 font-semibold"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-4">Study Facility & Node ID</th>
                  <th className="py-4 px-4">Spatial Locality</th>
                  <th className="py-4 px-4">Desk Compute Load</th>
                  <th className="py-4 px-4">Environmental IoT</th>
                  <th className="py-4 px-4">Accreditation Status</th>
                  <th className="py-4 px-4">Listing Tier</th>
                  <th className="py-4 px-4 text-right">Command Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs">
                {filtered.map(l => {
                  const isVerified = checkIsLibraryVerified(l);
                  const isPending = checkIsLibraryPending(l);
                  const total = l.totalSeats || 50;
                  const available = l.availableSeats ?? 18;
                  const occupied = Math.max(0, total - available);
                  const loadPercent = Math.round((occupied / total) * 100);

                  return (
                    <tr
                      key={l.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Facility & Node ID */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            onClick={() => handleOpenInspection(l)}
                            className={`p-2.5 rounded-xl border shrink-0 transition-transform group-hover:scale-105 cursor-pointer ${
                              isVerified 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                : isPending
                                ? 'bg-amber-50 text-amber-600 border-amber-200'
                                : 'bg-rose-50 text-rose-600 border-rose-200'
                            }`}
                          >
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenInspection(l)}
                                className="font-bold text-slate-900 text-sm hover:text-brand-600 text-left transition-colors cursor-pointer"
                              >
                                {l.name}
                              </button>
                              {isVerified && (
                                <span title="ZYZU'S Officially Accredited & Certified Partner">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                </span>
                              )}
                            </div>

                            {/* Accreditation Badge Pills */}
                            {Array.isArray(l.accreditationBadges) && l.accreditationBadges.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {l.accreditationBadges.slice(0, 2).map((b: string) => (
                                  <span
                                    key={b}
                                    className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200"
                                  >
                                    {b.replace(/_/g, ' ')}
                                  </span>
                                ))}
                                {l.accreditationBadges.length > 2 && (
                                  <span className="text-[9px] font-mono text-slate-500 font-bold">
                                    +{l.accreditationBadges.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={(e) => handleCopyId(l.id, e)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-700 hover:text-brand-600 transition-colors cursor-pointer"
                                title="Click to copy node identifier"
                              >
                                {copiedId === l.id ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                                    <span>COPIED</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-2.5 h-2.5" />
                                    <span>{l.id}</span>
                                  </>
                                )}
                              </button>

                              <span className="text-slate-400">•</span>

                              <p className="text-slate-500 text-[11px] flex items-center gap-1 font-medium">
                                Owner: <span className="text-slate-800 font-bold">{l.ownerName || 'Study Partner'}</span>
                              </p>

                              {/* Direct WhatsApp Contact Button */}
                              <button
                                onClick={(e) => handleWhatsAppContact(l, e)}
                                className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 transition-colors cursor-pointer"
                                title="Contact Owner on WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Spatial Locality */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          <span>{l.district || l.districtName || 'Ghazipur'}</span>
                          {l.pincode && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-slate-600 border border-slate-200">
                              {l.pincode}
                            </span>
                          )}
                        </p>
                        <p className="text-slate-500 text-[11px] truncate max-w-[200px] mt-0.5 font-medium">
                          {l.address || 'Main Road, Center'}
                        </p>
                      </td>

                      {/* Desk Compute Load */}
                      <td className="py-4 px-4 min-w-[150px]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            <Armchair className="w-3.5 h-3.5 text-purple-600" />
                            {total} Desks
                          </span>
                          <span className="font-mono text-[10px] text-purple-700 font-bold">
                            {loadPercent}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              loadPercent > 80 
                                ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                                : 'bg-gradient-to-r from-emerald-500 to-brand-500'
                            }`}
                            style={{ width: `${Math.min(100, loadPercent)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">
                          Vacant: <strong className="text-emerald-700 font-bold">{available}</strong> • Occupied: <strong className="text-slate-800">{occupied}</strong>
                        </p>
                      </td>

                      {/* Environmental IoT Sensors */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
                              <Wifi className="w-3 h-3" />
                              {l.iotSensors?.wifiPingMs || 9}ms
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
                              {l.iotSensors?.decibels || 26}dB
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500" />
                            UPS: {l.iotSensors?.powerBackupHealth || 99}% failover
                          </p>
                        </div>
                      </td>

                      {/* Accreditation Status */}
                      <td className="py-4 px-4">
                        {isVerified ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              PARTNER ACCREDITED
                            </span>
                            <p className="text-[10px] text-slate-500 font-medium font-mono">
                              Seal: {l.sha3AuditSeal?.slice(0, 10) || '0x9F4B2A'}...
                            </p>
                          </div>
                        ) : isPending ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" />
                              PENDING AUDIT
                            </span>
                            <div>
                              <button
                                onClick={(e) => handleQuickVerify(l, e)}
                                disabled={quickVerifyingId === l.id}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-600 hover:text-brand-700 underline cursor-pointer"
                              >
                                {quickVerifyingId === l.id ? 'Accrediting...' : '⚡ Quick Accredit'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            SUSPENDED
                          </span>
                        )}
                      </td>

                      {/* Listing Tier */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                            {l.subscription?.planName || 'STANDARD'}
                          </span>
                          <p className="text-[11px] text-slate-900 font-bold">
                            ₹{l.monthlyStartingPrice || l.monthlyFee || 499}/mo
                          </p>
                        </div>
                      </td>

                      {/* Command Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Accredit if pending */}
                          {!isVerified && (
                            <button
                              onClick={(e) => handleQuickVerify(l, e)}
                              disabled={quickVerifyingId === l.id}
                              className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                              title="Instant Super Admin Verification Clearance"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{quickVerifyingId === l.id ? '...' : 'Accredit'}</span>
                            </button>
                          )}

                          {/* 1-Click Seat Dispatch */}
                          <button
                            onClick={(e) => handleOpenDispatch(l, e)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 transition-all cursor-pointer shadow-xs"
                            title="Directly dispatch and reserve a student seat in this facility"
                          >
                            <Users className="w-3.5 h-3.5 text-brand-600" />
                            <span className="hidden xl:inline">Dispatch</span>
                          </button>

                          {/* Settlement Slip */}
                          <button
                            onClick={(e) => handleOpenSettlement(l, e)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-all cursor-pointer shadow-xs"
                            title="View official platform commission & revenue settlement voucher"
                          >
                            <Receipt className="w-3.5 h-3.5 text-purple-600" />
                            <span className="hidden xl:inline">Payout</span>
                          </button>

                          {/* Official Certificate */}
                          <button
                            onClick={() => handleOpenCertificate(l.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-all cursor-pointer shadow-xs"
                            title="Generate and download Official ZYZU'S Verification & Partnership Certificate"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            <span className="hidden md:inline">Cert</span>
                          </button>

                          {/* Audit Dossier & Floorplan */}
                          <button
                            onClick={() => handleOpenInspection(l)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all cursor-pointer"
                            title="Inspect Facility Safety Audit, Badges & Digital Twin Floorplan"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>Dossier</span>
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
      </Card>

      {/* MODAL 1: Facility Safety Dossier & Digital Twin Floorplan */}
      {selectedLib && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50 relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">Facility Safety Dossier & Digital Twin</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                      NODE // {selectedLib.id}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5 font-medium">
                    {selectedLib.name} • {selectedLib.district || selectedLib.districtName} ({selectedLib.pincode || '233001'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLib(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
              {/* Telemetry Snapshot Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold font-mono">Total Desk Compute</p>
                  <p className="font-bold text-slate-900 text-base mt-0.5">{selectedLib.totalSeats || 50} Desks</p>
                  <p className="text-emerald-700 text-[11px] font-bold">{selectedLib.availableSeats ?? 18} Vacant Now</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold font-mono">Monthly Rate</p>
                  <p className="font-bold text-slate-900 text-base mt-0.5">₹{selectedLib.monthlyStartingPrice || selectedLib.monthlyFee || 499}</p>
                  <p className="text-slate-500 text-[11px] font-medium">₹{selectedLib.hourlyRate || 30}/hr flex</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold font-mono">Current Status</p>
                  <p className={`font-bold text-base mt-0.5 ${
                    checkIsLibraryVerified(selectedLib) ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {checkIsLibraryVerified(selectedLib) ? 'VERIFIED' : 'PENDING AUDIT'}
                  </p>
                  <p className="text-slate-500 text-[11px] font-medium font-mono">Seal: {selectedLib.sha3AuditSeal?.slice(0, 10)}...</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold font-mono">Live Acoustic Floor</p>
                  <p className="font-bold text-slate-900 text-base mt-0.5">{selectedLib.iotSensors?.decibels || 26} dB</p>
                  <p className="text-blue-700 text-[11px] font-bold">{selectedLib.iotSensors?.wifiPingMs || 9} ms optical</p>
                </div>
              </div>

              {/* Digital Twin Floorplan Node Matrix */}
              <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-brand-400" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
                      Digital Twin Floorplan Node Matrix (Cubicle Pods)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Vacant
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> Occupied
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-brand-500 inline-block" /> Selected
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800">
                  {Array.from({ length: Math.min(30, selectedLib.totalSeats || 50) }).map((_, idx) => {
                    const isVacant = idx < (selectedLib.availableSeats ?? 18);
                    const isSelected = selectedSeatIndex === idx;
                    const seatCode = `A-${idx + 1}`;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          playCyberSound('click');
                          setSelectedSeatIndex(idx);
                        }}
                        className={`p-2 rounded text-center transition-all cursor-pointer font-mono text-[10px] font-bold ${
                          isSelected
                            ? 'bg-brand-500 text-white ring-2 ring-white scale-105'
                            : isVacant
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-500/40 hover:bg-rose-900'
                        }`}
                        title={`Seat ${seatCode}: ${isVacant ? 'Vacant (Click to reserve)' : 'Occupied by Enrolled Scholar'}`}
                      >
                        {seatCode}
                      </button>
                    );
                  })}
                </div>

                {selectedSeatIndex !== null && (
                  <div className="mt-3 p-2.5 rounded bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">Selected Pod: A-{selectedSeatIndex + 1}</p>
                      <p className="text-slate-400 text-[11px]">
                        Status: {selectedSeatIndex < (selectedLib.availableSeats ?? 18) ? 'Ready for Immediate Scholar Dispatch' : 'Occupied by Active Scholar'}
                      </p>
                    </div>
                    {selectedSeatIndex < (selectedLib.availableSeats ?? 18) && (
                      <button
                        onClick={() => {
                          const lib = selectedLib;
                          setSelectedLib(null);
                          handleOpenDispatch(lib);
                        }}
                        className="px-3 py-1 rounded bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs cursor-pointer"
                      >
                        Dispatch Seat A-{selectedSeatIndex + 1}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Holographic Accreditation Badges Engine */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600" />
                    Holographic Accreditation Badges (Click to Award / Revoke)
                  </p>
                  <span className="text-[10px] font-mono text-slate-500">Live Cryptographic Audit Trail</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {BADGES_CATALOG.map(badge => {
                    const isAwarded = Array.isArray(selectedLib.accreditationBadges) && selectedLib.accreditationBadges.includes(badge.id);
                    return (
                      <button
                        key={badge.id}
                        onClick={() => handleToggleBadge(badge.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isAwarded
                            ? badge.color + ' shadow-xs ring-1 ring-brand-500/30'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isAwarded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{badge.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6-Point Interactive Physical Safety Checkpoints */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    ZYZU'S 6-Point Safety Compliance Matrix
                  </p>
                  <span className="text-[10px] font-mono text-slate-500">Interactive Checklist</span>
                </div>

                {/* Checkpoint 1 */}
                <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3 text-slate-800">
                    <Camera className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">24/7 CCTV Cloud Surveillance & 30-Day NVR Storage</p>
                      <p className="text-slate-500 text-[10px]">Zero blindspots covering entrance, study cubicles & lockers.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={auditChecklist.cctv}
                    onChange={(e) => setAuditChecklist({ ...auditChecklist, cctv: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded bg-white border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </label>

                {/* Checkpoint 2 */}
                <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3 text-slate-800">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Automatic Inverter / DG Silent Generator Failover</p>
                      <p className="text-slate-500 text-[10px]">100% uninterrupted power supply with instant auto-switching.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={auditChecklist.powerBackup}
                    onChange={(e) => setAuditChecklist({ ...auditChecklist, powerBackup: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded bg-white border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </label>

                {/* Checkpoint 3 */}
                <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3 text-slate-800">
                    <Flame className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Fire Extinguisher, Smoke Alarms & Emergency Exit Route</p>
                      <p className="text-slate-500 text-[10px]">Clear glowing emergency exit signage and certified ABC extinguishers.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={auditChecklist.fireSafety}
                    onChange={(e) => setAuditChecklist({ ...auditChecklist, fireSafety: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded bg-white border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </label>

                {/* Checkpoint 4 */}
                <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3 text-slate-800">
                    <Armchair className="w-4 h-4 text-brand-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Ergonomic High-Back Cushion Seating & Eye-Care Desk Lamps</p>
                      <p className="text-slate-500 text-[10px]">Comfortable 8+ hour posture-support executive seating.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={auditChecklist.ergonomicSeating}
                    onChange={(e) => setAuditChecklist({ ...auditChecklist, ergonomicSeating: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded bg-white border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </label>

                {/* Checkpoint 5 */}
                <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3 text-slate-800">
                    <Wifi className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Dual-Band Optical Fiber Broadband (100+ Mbps Pin-Drop Silence)</p>
                      <p className="text-slate-500 text-[10px]">Redundant commercial ISP lines with low-latency academic access.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={auditChecklist.opticalFiber}
                    onChange={(e) => setAuditChecklist({ ...auditChecklist, opticalFiber: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded bg-white border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </label>

                {/* Checkpoint 6 */}
                <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3 text-slate-800">
                    <Fingerprint className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Biometric / RFID Digital Attendance Gate Access</p>
                      <p className="text-slate-500 text-[10px]">Automated real-time parent WhatsApp check-in / check-out alerts.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={auditChecklist.biometricAccess}
                    onChange={(e) => setAuditChecklist({ ...auditChecklist, biometricAccess: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded bg-white border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* Auditor Sign-off Remarks */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Official Institutional Audit Remarks & Sign-off
                </label>
                <textarea
                  value={auditRemarks}
                  onChange={(e) => setAuditRemarks(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                  placeholder="Enter auditor findings, certificate grant reasons, or physical compliance notes..."
                />
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  const id = selectedLib.id;
                  setSelectedLib(null);
                  handleOpenCertificate(id);
                }}
                className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 text-xs font-bold cursor-pointer"
              >
                <Award className="w-4 h-4 mr-1.5 text-amber-600" />
                Preview Official Certificate
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOverrideStatus('SUSPENDED')}
                  disabled={actionProcessing}
                  className="border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Suspend Facility
                </Button>

                <Button
                  onClick={() => handleOverrideStatus('APPROVED')}
                  disabled={actionProcessing}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  {actionProcessing ? 'Accrediting...' : 'Accredit & Partner'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: 1-Click Desk Dispatch & Student Seat Reservation */}
      {dispatchLib && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
                  <Armchair className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Direct Scholar Seat Dispatch</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {dispatchLib.name} ({dispatchLib.availableSeats ?? 18} Vacant Desks)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDispatchLib(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteDispatch} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Scholar Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Anjali Sharma"
                  value={dispatchStudentName}
                  onChange={(e) => setDispatchStudentName(e.target.value)}
                  className="bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Student Phone / WhatsApp *</label>
                  <Input
                    required
                    placeholder="9876543210"
                    value={dispatchStudentPhone}
                    onChange={(e) => setDispatchStudentPhone(e.target.value)}
                    className="bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Seat Pod *</label>
                  <Input
                    required
                    placeholder="e.g. A-14"
                    value={dispatchSeatNumber}
                    onChange={(e) => setDispatchSeatNumber(e.target.value)}
                    className="bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Examination Track</label>
                <select
                  value={dispatchExamFocus}
                  onChange={(e) => setDispatchExamFocus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="UPSC Civil Services">UPSC Civil Services (IAS / IPS)</option>
                  <option value="NEET UG Medical">NEET UG Medical Entrance</option>
                  <option value="IIT-JEE Engineering">IIT-JEE Advanced / Mains</option>
                  <option value="UPPSC State Exam">UPPSC State Public Services</option>
                  <option value="Banking & SSC-CGL">Banking PO & SSC-CGL</option>
                  <option value="Self-Study General">General Academic Self-Study</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Preferred Study Shift</label>
                <select
                  value={dispatchShift}
                  onChange={(e) => setDispatchShift(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="Morning Shift (06:00 AM - 12:00 PM)">Morning Shift (06:00 AM - 12:00 PM)</option>
                  <option value="Afternoon Shift (12:00 PM - 06:00 PM)">Afternoon Shift (12:00 PM - 06:00 PM)</option>
                  <option value="Night Owl Shift (06:00 PM - 12:00 AM)">Night Owl Shift (06:00 PM - 12:00 AM)</option>
                  <option value="24/7 All-Day Access Pass">24/7 All-Day Access Pass</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Agreed Monthly Fee (₹)</label>
                <Input
                  type="number"
                  value={dispatchFee}
                  onChange={(e) => setDispatchFee(Number(e.target.value))}
                  className="bg-slate-50 font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Instant Biometric Gate & WhatsApp Notification
                </p>
                <p className="mt-0.5 text-slate-600">
                  Student will receive digital RFID gate credentials and seat voucher immediately upon dispatch.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDispatchLib(null)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isDispatching}
                  className="bg-brand-600 hover:bg-brand-500 text-white font-bold cursor-pointer"
                >
                  {isDispatching ? 'Allocating Seat...' : 'Confirm Seat Allocation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: AI Facility Safety Radar Scanner */}
      {isRadarOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-slate-950 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-white">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-400 animate-pulse" />
                <h3 className="font-bold text-sm font-mono tracking-wide">
                  AI Facility Life-Safety & Telemetry Radar
                </h3>
              </div>
              <button
                onClick={() => setIsRadarOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Radar Animation */}
              <div className="relative flex items-center justify-center py-6">
                <div className="relative w-44 h-44 rounded-full border-2 border-brand-500/30 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border border-brand-500/20 flex items-center justify-center" />
                  <div className="w-20 h-20 rounded-full border border-brand-500/10" />
                  {radarScanning && (
                    <div className="absolute inset-0 rounded-full border-t-2 border-brand-400 animate-spin" />
                  )}
                  <Cpu className="w-8 h-8 text-brand-400 animate-pulse" />
                </div>
              </div>

              {/* Steps Progress */}
              <div className="space-y-2 text-xs font-mono">
                {[
                  'Auditing Fire Safety NOC, Smoke Sensors & ABC Extinguishers...',
                  'Testing Dual Silent Inverter / DG Cutover (<5ms latency)...',
                  'Probing Dual-Band Optical Fiber Bandwidth & Latency (11ms)...',
                  'Sampling Decibel Noise Floor (26.8 dB Pin-Drop Sanctuary)...',
                  'Validating Biometric Turnstile RFID Gate Sync with WhatsApp...'
                ].map((text, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 transition-opacity ${
                      radarStep > idx
                        ? 'text-emerald-400'
                        : radarStep === idx
                        ? 'text-brand-400 font-bold animate-pulse'
                        : 'text-slate-600'
                    }`}
                  >
                    {radarStep > idx ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Radio className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Radar Result Certificate */}
              {radarResult && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      FACILITY LIFE-SAFETY AUDIT PASSED
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                      INDEX: {radarResult.safetyComplianceIndex}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono">
                    Seal Hash: <strong className="text-white">{radarResult.sha3AuditSeal}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    All {radarResult.totalNodesAudited} active facilities certified under Institutional Life-Safety & Pin-Drop Sanctuary protocol.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRadarOpen(false)}
                className="border-slate-700 text-slate-200 cursor-pointer"
              >
                Close Audit Telemetry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Monthly Revenue Escrow Settlement Voucher */}
      {isSettlementOpen && settlementData && settlementLib && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Monthly Revenue Settlement Voucher</h3>
                  <p className="text-slate-500 text-xs mt-0.5 font-mono">
                    Voucher ID: {settlementData.voucherId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettlementOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{settlementData.libraryName}</p>
                  <p className="text-slate-500 text-[11px]">Partner: {settlementData.ownerName}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ESCROW SETTLED
                  </span>
                  <p className="text-slate-400 text-[10px] font-mono mt-0.5">{settlementData.period}</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Gross Monthly Desk Bookings:</span>
                  <strong className="text-slate-900 font-mono">₹{settlementData.grossBookings.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>ZYZU'S Platform Escrow Fee (10%):</span>
                  <span className="font-mono text-purple-700 font-bold">-₹{settlementData.platformCommission.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Statutory TDS u/s 194C (1%):</span>
                  <span className="font-mono text-rose-600 font-bold">-₹{settlementData.tdsDeducted.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold border-t border-slate-200">
                  <span className="text-slate-900">Net Partner Payout Disbursed:</span>
                  <strong className="text-emerald-700 font-mono text-base">₹{settlementData.netPayout.toLocaleString()}</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] font-mono">
                <div>
                  <p className="text-slate-500 text-[10px]">Bank UTR Reference:</p>
                  <p className="font-bold text-slate-900">{settlementData.utrNumber}</p>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <QrCode className="w-8 h-8 text-slate-800" />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-mono">Verified by Super Admin Treasury</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    playCyberSound('click');
                    window.print();
                  }}
                  className="cursor-pointer text-xs"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" /> Print Slip
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsSettlementOpen(false)}
                  className="bg-brand-600 text-white font-bold cursor-pointer text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Direct Super Admin Study Node Onboarding Modal */}
      {isOnboardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Onboard Partner Study Node</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Direct Super Admin Registration & Immediate Accreditation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOnboardOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteOnboard} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Study Facility Name *</label>
                <Input
                  required
                  placeholder="e.g. Takshashila Modern Study Library"
                  value={onboardForm.name}
                  onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                  className="bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Owner / Director Name *</label>
                  <Input
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={onboardForm.ownerName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, ownerName: e.target.value })}
                    className="bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Owner Phone *</label>
                  <Input
                    required
                    placeholder="9876543210"
                    value={onboardForm.ownerPhone}
                    onChange={(e) => setOnboardForm({ ...onboardForm, ownerPhone: e.target.value })}
                    className="bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">District</label>
                  <Input
                    value={onboardForm.district}
                    onChange={(e) => setOnboardForm({ ...onboardForm, district: e.target.value })}
                    className="bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">PIN Code</label>
                  <Input
                    value={onboardForm.pincode}
                    onChange={(e) => setOnboardForm({ ...onboardForm, pincode: e.target.value })}
                    className="bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Physical Address</label>
                <Input
                  value={onboardForm.address}
                  onChange={(e) => setOnboardForm({ ...onboardForm, address: e.target.value })}
                  className="bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Total Desks</label>
                  <Input
                    type="number"
                    value={onboardForm.totalSeats}
                    onChange={(e) => setOnboardForm({ ...onboardForm, totalSeats: Number(e.target.value) })}
                    className="bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Monthly Plan (₹)</label>
                  <Input
                    type="number"
                    value={onboardForm.monthlyFee}
                    onChange={(e) => setOnboardForm({ ...onboardForm, monthlyFee: Number(e.target.value) })}
                    className="bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Hourly Flex (₹)</label>
                  <Input
                    type="number"
                    value={onboardForm.hourlyRate}
                    onChange={(e) => setOnboardForm({ ...onboardForm, hourlyRate: Number(e.target.value) })}
                    className="bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOnboardOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isOnboarding}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  {isOnboarding ? 'Onboarding...' : 'Onboard & Accredit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Verified & Partnered Certificate Modal */}
      <LibraryCertificateModal
        certificate={selectedCertificate}
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={filtered.map(l => ({
          ID: l.id,
          Name: l.name,
          Owner: l.ownerName,
          District: l.district || l.districtName,
          Address: l.address,
          Pincode: l.pincode,
          TotalSeats: l.totalSeats,
          AvailableSeats: l.availableSeats,
          MonthlyFee: l.monthlyFee || l.monthlyStartingPrice,
          VerificationStatus: checkIsLibraryVerified(l) ? 'APPROVED' : checkIsLibrarySuspended(l) ? 'SUSPENDED' : 'PENDING'
        }))}
        title="ZYZU'S Partner Study Libraries Grid"
        filename="zyzus_partner_libraries_grid"
      />
    </div>
  );
};
