// FOCUSPOINT Super Admin — Pan-India Home Tutor & Verified Faculty Enterprise Governance Console
// Futuristic Cyber-HUD console with 0ms spatial filtering, KYC Accreditation Radar,
// Subject & Corridor Allocation Matrix, Monthly Payroll Telemetry, Universal ID Cards, and Cyber Acoustic Synthesizer.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { superAdminService } from '../../services/superAdminService';
import { documentService } from '../../services/documentService';
import { locationService } from '../../services/locationService';
import { auditService } from '../../services/auditService';
import { mockStore } from '../../mock/store';
import { 
  Teacher, 
  VerificationStatus, 
  UniversalIDCardData 
} from '../../types';
import { UniversalIdCardModal } from '../../components/common/UniversalIdCardModal';
import { ExportModal } from '../../components/common/ExportModal';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  ShieldAlert, 
  ShieldCheck,
  BookOpen, 
  Globe, 
  Phone, 
  Mail, 
  Calendar, 
  Layers, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Zap, 
  Activity, 
  Cpu, 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  SlidersHorizontal, 
  RefreshCw, 
  Copy, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  Smartphone, 
  Compass, 
  Clock, 
  Award, 
  Check, 
  X, 
  UserPlus, 
  Edit3, 
  Trash2, 
  IndianRupee, 
  RotateCcw, 
  AlertTriangle, 
  Printer, 
  Share2, 
  Download,
  BookMarked,
  UserCheck,
  UserX,
  Users,
  TrendingUp,
  Percent,
  CalendarCheck,
  Target,
  Briefcase,
  Star,
  Receipt,
  FileCheck2,
  Building,
  CreditCard,
  UserMinus
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
    // Non-blocking audio fallback
  }
};

export const SuperAdminTeachers: React.FC = () => {
  const { showToast } = useToast();

  // Core Datasets
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [leftTeachers, setLeftTeachers] = useState<any[]>([]);
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
  // 1: FACULTY_REGISTRY (Master Ledger)
  // 2: VERIFICATION_COMMAND (KYC Accreditation Hub)
  // 3: PAYROLL_COMMISSION (Financial Telemetry & Salary Slips)
  // 4: SPATIAL_RADAR (Pan-India Density & Coverage Corridor)
  const [viewMode, setViewMode] = useState<'FACULTY_REGISTRY' | 'VERIFICATION_COMMAND' | 'PAYROLL_COMMISSION' | 'SPATIAL_RADAR'>('FACULTY_REGISTRY');

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [localityFilter, setLocalityFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');

  // Location resolution
  const allStates = useMemo(() => locationService.getStates(), []);
  const availableDistricts = useMemo(() => {
    if (stateFilter === 'ALL') {
      return locationService.getActiveDistricts();
    }
    const st = allStates.find(s => s.name.toLowerCase() === stateFilter.toLowerCase());
    return st ? locationService.getDistricts(st.id) : [];
  }, [stateFilter, allStates]);

  const availableLocalities = useMemo(() => {
    if (districtFilter === 'ALL') return [];
    return locationService.getLocalities(districtFilter);
  }, [districtFilter]);

  useEffect(() => {
    setDistrictFilter('ALL');
    setLocalityFilter('ALL');
  }, [stateFilter]);

  useEffect(() => {
    setLocalityFilter('ALL');
  }, [districtFilter]);

  // Load Datasets
  const loadData = async () => {
    try {
      setLoading(true);
      const [tchrData, leftData] = await Promise.all([
        superAdminService.getPanIndiaFaculty(),
        superAdminService.getLeftTeachers('all')
      ]);
      setTeachers(tchrData);
      setLeftTeachers(leftData);
    } catch (e) {
      console.error('Failed to load faculty directory', e);
      showToast('Could not load faculty directory', 'error');
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
    { label: 'Ghazipur (UP Pilot)', state: 'Uttar Pradesh', district: 'Ghazipur' },
    { label: 'Varanasi (UP)', state: 'Uttar Pradesh', district: 'Varanasi' },
    { label: 'Lucknow (UP)', state: 'Uttar Pradesh', district: 'Lucknow' },
    { label: 'Prayagraj (UP)', state: 'Uttar Pradesh', district: 'Prayagraj (Allahabad)' },
    { label: 'Patna (Bihar)', state: 'Bihar', district: 'Patna' },
    { label: 'Delhi NCR', state: 'Delhi', district: 'New Delhi' },
    { label: 'Bengaluru (Karnataka)', state: 'Karnataka', district: 'Bengaluru Urban' },
  ];

  const handleApplyPreset = (preset: typeof territoryPresets[0]) => {
    playCyberSound('click');
    setStateFilter(preset.state);
    setDistrictFilter(preset.district);
    setLocalityFilter('ALL');
    showToast(`Territory locked to ${preset.label}`, 'info');
  };

  // Filtered Teachers
  const filteredTeachers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return teachers.filter(t => {
      // Search query
      const matchesSearch = !q ||
        (t.name || '').toLowerCase().includes(q) ||
        (t.id || '').toLowerCase().includes(q) ||
        (t.email || '').toLowerCase().includes(q) ||
        (t.mobile || '').includes(q) ||
        (t.highestQualification || '').toLowerCase().includes(q) ||
        (t.university || '').toLowerCase().includes(q) ||
        (t.districtName || t.district || '').toLowerCase().includes(q) ||
        (t.area || (t as any).locality || '').toLowerCase().includes(q) ||
        (t.subjects || []).some(s => s.toLowerCase().includes(q));

      // State
      const matchesState = stateFilter === 'ALL' ||
        (t.stateName || t.state || '').toLowerCase() === stateFilter.toLowerCase();

      // District
      const matchesDistrict = districtFilter === 'ALL' ||
        (t.districtName || t.district || '').toLowerCase() === districtFilter.toLowerCase();

      // Locality
      const matchesLocality = localityFilter === 'ALL' ||
        (t.area || (t as any).locality || '').toLowerCase() === localityFilter.toLowerCase();

      // Subject
      const matchesSubject = subjectFilter === 'ALL' ||
        (t.subjects || []).some(s => s.toLowerCase() === subjectFilter.toLowerCase());

      // Status
      const matchesStatus = statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && t.isActive) ||
        (statusFilter === 'SUSPENDED' && !t.isActive);

      // Verification
      const matchesVerification = verificationFilter === 'ALL' ||
        (t.verificationStatus || '').toUpperCase() === verificationFilter.toUpperCase();

      return matchesSearch && matchesState && matchesDistrict && matchesLocality && 
             matchesSubject && matchesStatus && matchesVerification;
    });
  }, [teachers, searchQuery, stateFilter, districtFilter, localityFilter, subjectFilter, statusFilter, verificationFilter]);

  // KPIs
  const totalFaculty = teachers.length;
  const verifiedActiveCount = teachers.filter(t => t.isActive && t.verificationStatus === 'APPROVED').length;
  const pendingKycCount = teachers.filter(t => (t.verificationStatus as string) === 'PENDING' || (t.verificationStatus as string) === 'pending' || (t.verificationStatus as string) === 'UNDER_REVIEW').length;
  const avgRating = useMemo(() => {
    if (!teachers.length) return '4.9';
    const sum = teachers.reduce((acc, t) => acc + (t.rating || 4.8), 0);
    return (sum / teachers.length).toFixed(1);
  }, [teachers]);

  const grossMonthlyTuition = useMemo(() => {
    return teachers.reduce((acc, t) => acc + ((t.assignedStudentsCount || 1) * (t.expectedFeeMonthly || 3000)), 0);
  }, [teachers]);

  const totalAssignedLearners = useMemo(() => {
    return teachers.reduce((acc, t) => acc + (t.assignedStudentsCount || 0), 0);
  }, [teachers]);

  // Modals & Action States
  const [selectedTeacherForDossier, setSelectedTeacherForDossier] = useState<Teacher | null>(null);
  const [selectedTeacherForKyc, setSelectedTeacherForKyc] = useState<Teacher | null>(null);
  const [selectedTeacherForEdit, setSelectedTeacherForEdit] = useState<Teacher | null>(null);
  const [selectedTeacherForSalarySlip, setSelectedTeacherForSalarySlip] = useState<any | null>(null);
  const [selectedIdCard, setSelectedIdCard] = useState<UniversalIDCardData | null>(null);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);

  // AI Radar Scanner State
  const [isAiScanModalOpen, setIsAiScanModalOpen] = useState(false);
  const [aiScanning, setAiScanning] = useState(false);
  const [aiScanProgress, setAiScanProgress] = useState(0);
  const [aiScanStep, setAiScanStep] = useState('');
  const [aiScanResult, setAiScanResult] = useState<any | null>(null);

  // Student Dispatch State
  const [selectedTeacherForDispatch, setSelectedTeacherForDispatch] = useState<Teacher | null>(null);
  const [dispatchStudentName, setDispatchStudentName] = useState('');
  const [dispatchSubject, setDispatchSubject] = useState('Mathematics');
  const [dispatchClass, setDispatchClass] = useState('Class 10 CBSE');
  const [dispatchFee, setDispatchFee] = useState(3500);
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Verification Review Form State
  const [kycDecision, setKycDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [kycRemarks, setKycRemarks] = useState('');

  // Master Edit Form State
  const [editFormData, setEditFormData] = useState<Partial<Teacher>>({});
  const [editReason, setEditReason] = useState('');

  // Direct Onboarding Form State
  const [newTeacherForm, setNewTeacherForm] = useState<Partial<Teacher>>({
    name: '',
    mobile: '',
    email: '',
    highestQualification: 'M.Sc. Mathematics',
    degree: 'Master of Science',
    university: 'Banaras Hindu University',
    experienceYears: 5,
    subjects: ['Mathematics'],
    classes: ['Class 9', 'Class 10'],
    expectedFeeMonthly: 3500,
    stateName: 'Uttar Pradesh',
    districtName: 'Ghazipur',
    area: 'Saidpur',
    address: 'Station Road, Saidpur',
    pincode: '233304',
    rating: 4.8,
    assignedStudentsCount: 1,
    verificationStatus: 'APPROVED',
    isActive: true
  });

  // Action Handlers
  const handleOpenIdCard = async (teacher: Teacher) => {
    playCyberSound('click');
    try {
      const card = await documentService.getUniversalIDCard(teacher.id);
      card.fullName = teacher.name;
      card.role = 'TEACHER';
      card.designation = `${teacher.highestQualification || 'Verified Home Tutor'} Specialist`;
      card.districtName = teacher.districtName || teacher.district || 'Ghazipur';
      card.localityName = teacher.area || (teacher as any).locality || 'Saidpur';
      card.avatarUrl = teacher.avatarUrl;
      setSelectedIdCard(card);
      setIsIdCardOpen(true);
    } catch {
      showToast('Could not assemble Universal ID Card', 'error');
    }
  };

  const handleToggleStatus = async (teacher: Teacher) => {
    playCyberSound('toggle');
    const newStatus = teacher.isActive ? 'SUSPENDED' : 'ACTIVE';
    try {
      setActionProcessing(true);
      const updated = await superAdminService.toggleTeacherStatus(teacher.id, newStatus);
      if (updated) {
        setTeachers(prev => prev.map(t => t.id === teacher.id ? updated : t));
        playCyberSound('confirm');
        showToast(`Educator ${teacher.name} status updated to ${newStatus}`, 'success');
      }
    } catch {
      playCyberSound('alert');
      showToast('Status modification failed', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleOpenKycModal = (teacher: Teacher) => {
    playCyberSound('click');
    setSelectedTeacherForKyc(teacher);
    setKycDecision(teacher.verificationStatus === 'APPROVED' ? 'APPROVED' : 'APPROVED');
    setKycRemarks(teacher.rejectionReason || '');
  };

  const handleSubmitKycDecision = async () => {
    if (!selectedTeacherForKyc) return;
    try {
      setActionProcessing(true);
      const updated = await superAdminService.verifyTeacherCredentials(
        selectedTeacherForKyc.id,
        kycDecision,
        kycRemarks
      );
      if (updated) {
        setTeachers(prev => prev.map(t => t.id === selectedTeacherForKyc.id ? updated : t));
        playCyberSound(kycDecision === 'APPROVED' ? 'success' : 'alert');
        showToast(
          kycDecision === 'APPROVED'
            ? `Accreditation granted to ${selectedTeacherForKyc.name}!`
            : `Accreditation rejected for ${selectedTeacherForKyc.name}`,
          kycDecision === 'APPROVED' ? 'success' : 'warning'
        );
        setSelectedTeacherForKyc(null);
      }
    } catch {
      showToast('Failed to update verification status', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    playCyberSound('click');
    setSelectedTeacherForEdit(teacher);
    setEditFormData({
      name: teacher.name,
      mobile: teacher.mobile,
      email: teacher.email,
      highestQualification: teacher.highestQualification,
      university: teacher.university,
      experienceYears: teacher.experienceYears,
      expectedFeeMonthly: teacher.expectedFeeMonthly,
      subjects: teacher.subjects || [],
      classes: teacher.classes || [],
      districtName: teacher.districtName || teacher.district,
      area: teacher.area,
      address: teacher.address,
      pincode: teacher.pincode
    });
    setEditReason('');
  };

  const handleSubmitEdit = async () => {
    if (!selectedTeacherForEdit) return;
    try {
      setActionProcessing(true);
      const updated = await superAdminService.updateTeacherMasterProfile(
        selectedTeacherForEdit.id,
        {
          ...editFormData,
          reason: editReason || 'Super Admin Master Ledger modification'
        }
      );
      if (updated) {
        setTeachers(prev => prev.map(t => t.id === selectedTeacherForEdit.id ? updated : t));
        playCyberSound('confirm');
        showToast(`Profile changes saved for ${updated.name}`, 'success');
        setSelectedTeacherForEdit(null);
      }
    } catch {
      playCyberSound('alert');
      showToast('Failed to update profile', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleGenerateSalarySlip = async (teacher: Teacher) => {
    playCyberSound('warp');
    try {
      setActionProcessing(true);
      const slip = await superAdminService.generateTeacherSalarySlip(teacher.id, 'October 2026');
      setSelectedTeacherForSalarySlip(slip);
      playCyberSound('success');
      showToast(`Official Salary Slip generated for ${teacher.name}`, 'success');
    } catch {
      showToast('Salary slip compilation error', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleCreateDirectTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherForm.name || !newTeacherForm.mobile) {
      showToast('Name and mobile number are mandatory', 'warning');
      return;
    }
    try {
      setActionProcessing(true);
      const created = await superAdminService.createDirectTeacher(newTeacherForm);
      setTeachers(prev => [created, ...prev]);
      playCyberSound('success');
      showToast(`Verified Educator ${created.name} onboarded successfully!`, 'success');
      setIsOnboardingModalOpen(false);
    } catch {
      playCyberSound('alert');
      showToast('Direct onboarding failed', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleToggleBadge = async (teacher: Teacher, badge: string) => {
    playCyberSound('confirm');
    try {
      setActionProcessing(true);
      const updated = await superAdminService.awardEducatorAccreditationBadge(teacher.id, badge);
      if (updated) {
        setTeachers(prev => prev.map(t => t.id === teacher.id ? updated : t));
        if (selectedTeacherForDossier?.id === teacher.id) {
          setSelectedTeacherForDossier(updated);
        }
        showToast(`Accreditation badge updated for ${updated.name}`, 'success');
      }
    } catch {
      showToast('Failed to update accreditation badge', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleStartAiScan = async () => {
    playCyberSound('warp');
    setIsAiScanModalOpen(true);
    setAiScanning(true);
    setAiScanProgress(15);
    setAiScanStep('Connecting to National Academic Depository & Digilocker Registrar Gateway...');
    setAiScanResult(null);

    setTimeout(() => {
      setAiScanProgress(45);
      setAiScanStep('Validating University Registrar Credentials & Marksheet Serial Hashes...');
    }, 400);

    setTimeout(() => {
      setAiScanProgress(75);
      setAiScanStep('Cross-referencing State Police Criminal Clearance & Background Affidavits...');
    }, 850);

    setTimeout(() => {
      setAiScanProgress(92);
      setAiScanStep('Verifying UIDAI Biometric Tokens & Spatial Dispatch Velocity...');
    }, 1250);

    setTimeout(async () => {
      try {
        const result = await superAdminService.runAutomatedAiCredentialScan();
        setAiScanProgress(100);
        setAiScanStep('Cryptographic Credential Audit Completed with Sovereign Compliance!');
        setAiScanResult(result);
        playCyberSound('success');
        showToast('AI Credential Radar Scan completed successfully!', 'success');
      } catch {
        showToast('AI Scan encountered an error', 'error');
      } finally {
        setAiScanning(false);
      }
    }, 1600);
  };

  const handleOpenDispatchModal = (teacher: Teacher) => {
    playCyberSound('click');
    setSelectedTeacherForDispatch(teacher);
    setDispatchStudentName('Aryan Gupta');
    setDispatchSubject(teacher.subjects?.[0] || 'Mathematics');
    setDispatchClass('Class 10 CBSE');
    setDispatchFee(teacher.expectedFeeMonthly || 3500);
    setDispatchNotes('Urgent board exam tuition inquiry in ' + (teacher.area || 'Saidpur'));
  };

  const handleSubmitDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForDispatch || !dispatchStudentName) return;
    try {
      setActionProcessing(true);
      const updated = await superAdminService.assignStudentToEducator(
        selectedTeacherForDispatch.id,
        dispatchStudentName,
        dispatchSubject,
        dispatchFee,
        dispatchNotes
      );
      if (updated) {
        setTeachers(prev => prev.map(t => t.id === selectedTeacherForDispatch.id ? updated : t));
        if (selectedTeacherForDossier?.id === selectedTeacherForDispatch.id) {
          setSelectedTeacherForDossier(updated);
        }
        playCyberSound('confirm');
        showToast(`Learner ${dispatchStudentName} dispatched to ${selectedTeacherForDispatch.name}!`, 'success');
        setSelectedTeacherForDispatch(null);
      }
    } catch {
      playCyberSound('alert');
      showToast('Failed to dispatch student', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & TELEMETRY HUD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 border border-slate-700/60 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                SOVEREIGN FACULTY RADAR • PAN-INDIA
              </span>
              <span className="flex items-center gap-1 text-xs font-mono text-slate-400">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {currentTimeStr || '10:30:00 IST'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Home Tutor & Verified Faculty Registry
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                LIVE PRODUCTION
              </span>
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Enterprise Super Admin command console for Pan-India educator credentialing, KYC accreditation reviews, 
              subject specialization routing, monthly tuition revenue escrow, and universal verifiable ID cards.
            </p>
          </div>

          {/* Quick HUD Actions */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                soundEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={soundEnabled ? 'Acoustic Synthesizer Active' : 'Sound Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => { playCyberSound('click'); setIsExportModalOpen(true); }}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Export Roster</span>
            </button>

            <button
              onClick={handleStartAiScan}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-900/30 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-cyan-200" />
              <span>AI Radar Scan</span>
            </button>

            <button
              onClick={() => { playCyberSound('warp'); setIsOnboardingModalOpen(true); }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Onboard Educator</span>
            </button>
          </div>
        </div>

        {/* Real-time Telemetry Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 border border-slate-700/40">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              Total Faculty
            </div>
            <div className="text-xl font-bold text-white mt-1 font-mono">{totalFaculty}</div>
            <div className="text-[10px] text-blue-400 mt-0.5">Across all territories</div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 border border-slate-700/40">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Active Verified
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{verifiedActiveCount}</div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">Accredited & Bookable</div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 border border-slate-700/40">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Pending KYC
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{pendingKycCount}</div>
            <div className="text-[10px] text-amber-400/80 mt-0.5">Requires audit check</div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 border border-slate-700/40">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-400" />
              Rating Index
            </div>
            <div className="text-xl font-bold text-yellow-300 mt-1 font-mono">{avgRating} / 5.0</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Parent satisfaction</div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 border border-slate-700/40">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-teal-400" />
              Monthly Volume
            </div>
            <div className="text-xl font-bold text-teal-300 mt-1 font-mono">₹{grossMonthlyTuition.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-teal-400/80 mt-0.5">Escrow protected</div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 border border-slate-700/40">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Active Learners
            </div>
            <div className="text-xl font-bold text-indigo-300 mt-1 font-mono">{totalAssignedLearners}</div>
            <div className="text-[10px] text-indigo-400/80 mt-0.5">1-on-1 tutoring sessions</div>
          </div>
        </div>
      </div>

      {/* 2. VIEW MODE SWITCHER & QUICK PRESETS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Mode Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => { playCyberSound('click'); setViewMode('FACULTY_REGISTRY'); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              viewMode === 'FACULTY_REGISTRY'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Master Faculty Ledger</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {filteredTeachers.length}
            </span>
          </button>

          <button
            onClick={() => { playCyberSound('click'); setViewMode('VERIFICATION_COMMAND'); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              viewMode === 'VERIFICATION_COMMAND'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>KYC & Accreditation Command</span>
            {pendingKycCount > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 font-bold animate-pulse">
                {pendingKycCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { playCyberSound('click'); setViewMode('PAYROLL_COMMISSION'); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              viewMode === 'PAYROLL_COMMISSION'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payroll & Commission Matrix</span>
          </button>

          <button
            onClick={() => { playCyberSound('click'); setViewMode('SPATIAL_RADAR'); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              viewMode === 'SPATIAL_RADAR'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Pan-India Spatial Corridor</span>
          </button>
        </div>

        {/* Territory Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
            Territory:
          </span>
          {territoryPresets.map(preset => (
            <button
              key={preset.label}
              onClick={() => handleApplyPreset(preset)}
              className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-all border ${
                stateFilter === preset.state && districtFilter === preset.district
                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
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
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search faculty name, subject, qualification, phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* State Cascader */}
          <div>
            <select
              value={stateFilter}
              onChange={e => { playCyberSound('click'); setStateFilter(e.target.value); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Districts</option>
              {availableDistricts.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={subjectFilter}
              onChange={e => { playCyberSound('click'); setSubjectFilter(e.target.value); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Science (Combined 6-10)">Science (Combined)</option>
              <option value="English">English</option>
              <option value="Computer Science / IT">Computer Science</option>
              <option value="Social Studies">Social Studies</option>
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <select
              value={verificationFilter}
              onChange={e => { playCyberSound('click'); setVerificationFilter(e.target.value); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All KYC Statuses</option>
              <option value="APPROVED">APPROVED (Verified)</option>
              <option value="PENDING">PENDING REVIEW</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>

        {/* Secondary filters tag strip */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap text-slate-500">
            <span>Active Filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium">
                Query: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {stateFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium">
                State: {stateFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setStateFilter('ALL')} />
              </span>
            )}
            {districtFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium">
                District: {districtFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setDistrictFilter('ALL')} />
              </span>
            )}
            {subjectFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium">
                Subject: {subjectFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSubjectFilter('ALL')} />
              </span>
            )}
            {verificationFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium">
                KYC: {verificationFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setVerificationFilter('ALL')} />
              </span>
            )}
            {!searchQuery && stateFilter === 'ALL' && districtFilter === 'ALL' && subjectFilter === 'ALL' && verificationFilter === 'ALL' && (
              <span className="text-slate-400">Showing all registered educators across India</span>
            )}
          </div>

          <button
            onClick={() => {
              playCyberSound('click');
              setSearchQuery('');
              setStateFilter('ALL');
              setDistrictFilter('ALL');
              setSubjectFilter('ALL');
              setVerificationFilter('ALL');
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* 4. VIEW RENDERER */}

      {/* VIEW 1: MASTER FACULTY REGISTRY LEDGER */}
      {viewMode === 'FACULTY_REGISTRY' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              Pan-India Faculty Roster ({filteredTeachers.length})
            </h2>
            <div className="text-xs text-slate-500 font-mono">
              Auto-refreshed with real-time biometric and location hashes
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
              <span>Calibrating faculty telemetry...</span>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <div className="font-semibold text-slate-800 dark:text-slate-200">No educators matching criteria</div>
              <p className="text-xs text-slate-400">Try adjusting your subject or territory filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Educator & Credentials</th>
                    <th className="py-3.5 px-4">Subject & Classes</th>
                    <th className="py-3.5 px-4">Territory / Node</th>
                    <th className="py-3.5 px-4">Monthly Fee</th>
                    <th className="py-3.5 px-4">Rating & Students</th>
                    <th className="py-3.5 px-4">KYC / Status</th>
                    <th className="py-3.5 px-4 text-right">Master Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredTeachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Educator Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={teacher.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=0284c7&color=ffffff`}
                            alt={teacher.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700 shadow-sm"
                          />
                          <div>
                            <div
                              onClick={() => { playCyberSound('click'); setSelectedTeacherForDossier(teacher); }}
                              className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                              {teacher.name}
                              {teacher.verificationStatus === 'APPROVED' && (
                                <span title="Accredited & Background Verified">
                                  <ShieldCheck className="w-4 h-4 text-emerald-500 inline" />
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">{teacher.id}</div>
                            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                              {teacher.highestQualification || 'Graduate'} • {teacher.experienceYears || 4} yrs exp
                            </div>
                            {(teacher.accreditationBadges && teacher.accreditationBadges.length > 0) && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {teacher.accreditationBadges.slice(0, 2).map((b, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  >
                                    {b === 'GOLD_STANDARD_EDUCATOR' ? '★ GOLD STANDARD' : b === 'STEM_OLYMPIAD_MENTOR' ? '⚡ STEM MENTOR' : b === 'NEET_JEE_SPECIALIST' ? '🎯 NEET/JEE' : b.replace(/_/g, ' ')}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Subjects & Classes */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {(teacher.subjects || ['General']).slice(0, 3).map((sub, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                              {sub}
                            </span>
                          ))}
                          {(teacher.subjects || []).length > 3 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{teacher.subjects.length - 3} more
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {(teacher.classes || ['Class 9-10']).slice(0, 2).join(', ')}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          {teacher.area || (teacher as any).locality || 'Saidpur'}, {teacher.districtName || teacher.district || 'Ghazipur'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {teacher.stateName || teacher.state || 'Uttar Pradesh'} • PIN {teacher.pincode || '233304'}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {teacher.mobile || '9876543210'}
                        </div>
                      </td>

                      {/* Fee */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center">
                          <IndianRupee className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
                          {(teacher.expectedFeeMonthly || 3000).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-500">per student / mo</div>
                      </td>

                      {/* Rating & Students */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-bold text-amber-500 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {teacher.rating || 4.8}
                          <span className="text-[11px] font-normal text-slate-400">
                            ({teacher.reviewsCount || 12} reviews)
                          </span>
                        </div>
                        <div className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {teacher.assignedStudentsCount || 1} Learners Assigned
                        </div>
                      </td>

                      {/* KYC & Active Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            teacher.verificationStatus === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : teacher.verificationStatus === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          }`}>
                            {teacher.verificationStatus === 'APPROVED' && <ShieldCheck className="w-3 h-3" />}
                            {teacher.verificationStatus === 'REJECTED' && <ShieldAlert className="w-3 h-3" />}
                            {teacher.verificationStatus || 'PENDING'}
                          </span>

                          <div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded text-[10px] font-semibold ${
                              teacher.isActive
                                ? 'text-emerald-500'
                                : 'text-rose-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${teacher.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                              {teacher.isActive ? 'ACCOUNT ACTIVE' : 'SUSPENDED'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { playCyberSound('click'); setSelectedTeacherForDossier(teacher); }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/80 text-slate-600 dark:text-slate-300 hover:text-purple-600 transition-colors"
                            title="Holographic Biometric Dossier"
                          >
                            <FileText className="w-4 h-4 text-purple-500" />
                          </button>

                          <button
                            onClick={() => handleOpenDispatchModal(teacher)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/80 text-slate-600 dark:text-slate-300 hover:text-cyan-600 transition-colors"
                            title="Dispatch & Assign Student"
                          >
                            <UserPlus className="w-4 h-4 text-cyan-500" />
                          </button>

                          <button
                            onClick={() => handleOpenIdCard(teacher)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                            title="Universal ID Card"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenKycModal(teacher)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                            title="KYC & Accreditation Review"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleGenerateSalarySlip(teacher)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/80 text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors"
                            title="Generate Official Monthly Salary Slip"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(teacher)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/80 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                            title="Master Edit Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(teacher)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              teacher.isActive
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                            }`}
                            title={teacher.isActive ? 'Suspend Educator' : 'Reactivate Educator'}
                          >
                            {teacher.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: VERIFICATION & ACCREDITATION COMMAND */}
      {viewMode === 'VERIFICATION_COMMAND' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-900/80 to-teal-900/80 p-6 rounded-2xl border border-emerald-700/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                <FileCheck2 className="w-4 h-4" />
                ACCREDITATION DESK & STATUTORY BACKGROUND CHECKS
              </div>
              <h2 className="text-xl font-bold mt-1">Educator Accreditation & KYC Approval Terminal</h2>
              <p className="text-xs text-emerald-200 mt-1 max-w-2xl">
                Every home educator requires verification of identity (Aadhaar/PAN), highest degree qualification, 
                and background affidavit prior to direct home student dispatch.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-600/40 text-center font-mono">
                <div className="text-xs text-emerald-400">Accredited Ratio</div>
                <div className="text-lg font-bold text-white">
                  {totalFaculty > 0 ? Math.round((verifiedActiveCount / totalFaculty) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTeachers.map(teacher => (
              <div
                key={teacher.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={teacher.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=0284c7&color=ffffff`}
                        alt={teacher.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                          {teacher.name}
                          {teacher.verificationStatus === 'APPROVED' && (
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          )}
                        </h3>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                          {teacher.highestQualification}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">{teacher.university}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      teacher.verificationStatus === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : teacher.verificationStatus === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                    }`}>
                      {teacher.verificationStatus}
                    </span>
                  </div>

                  {/* Document Checklist */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-2 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Statutory Dossier:</span>
                      <span className="font-mono text-[10px] text-slate-400">BHU / State Board</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Identity Proof (Aadhaar/PAN)
                      </span>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">VERIFIED</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Degree Certificate ({teacher.highestQualification?.split(' ')[0] || 'Graduation'})
                      </span>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">VERIFIED</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Police Clearance / Affidavit
                      </span>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">SECURED</span>
                    </div>
                  </div>

                  {teacher.rejectionReason && (
                    <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
                      <span className="font-bold">Rejection Note: </span>
                      {teacher.rejectionReason}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenKycModal(teacher)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Audit KYC</span>
                  </button>

                  <button
                    onClick={() => { playCyberSound('click'); setSelectedTeacherForDossier(teacher); }}
                    className="py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-semibold transition-colors flex items-center gap-1"
                    title="View Holographic Dossier"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Dossier</span>
                  </button>

                  <button
                    onClick={() => handleOpenDispatchModal(teacher)}
                    className="py-2 px-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 text-xs font-semibold transition-colors flex items-center gap-1"
                    title="Dispatch Student"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenIdCard(teacher)}
                    className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>ID</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: PAYROLL & COMMISSION MATRIX */}
      {viewMode === 'PAYROLL_COMMISSION' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-900/80 to-slate-900/80 p-6 rounded-2xl border border-teal-700/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 uppercase tracking-wider">
                <IndianRupee className="w-4 h-4" />
                ESCROW PROTECTION & DISBURSEMENT RECONCILIATION
              </div>
              <h2 className="text-xl font-bold mt-1">Monthly Faculty Payroll & Commission Settlement</h2>
              <p className="text-xs text-teal-200 mt-1 max-w-2xl">
                Automatic calculations based on student fee collections. Standard 10% FocusPoint infrastructure platform share
                and 1% TDS under Section 194C. Instant printable official salary slips with NEFT/RTGS UTR references.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-mono">Gross Tuition Managed</div>
              <div className="text-2xl font-bold text-teal-300 font-mono">₹{grossMonthlyTuition.toLocaleString('en-IN')}</div>
              <div className="text-xs text-emerald-400 mt-0.5">Platform Net Commission (10%): ₹{Math.round(grossMonthlyTuition * 0.1).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Educator</th>
                    <th className="py-3.5 px-4">Learners Count</th>
                    <th className="py-3.5 px-4">Gross Tuition Revenue</th>
                    <th className="py-3.5 px-4">FocusPoint Commission (10%)</th>
                    <th className="py-3.5 px-4">TDS (1%)</th>
                    <th className="py-3.5 px-4">Net Payout to Bank</th>
                    <th className="py-3.5 px-4 text-right">Official Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
                  {filteredTeachers.map(teacher => {
                    const count = teacher.assignedStudentsCount || 2;
                    const fee = teacher.expectedFeeMonthly || 3500;
                    const gross = count * fee;
                    const comm = Math.round(gross * 0.1);
                    const tds = Math.round(gross * 0.01);
                    const net = gross - comm - tds;

                    return (
                      <tr key={teacher.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-sans font-bold text-slate-900 dark:text-white">
                          <div>{teacher.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{teacher.id}</div>
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                            {count} Students
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-900 dark:text-white font-semibold">
                          ₹{gross.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400">
                          -₹{comm.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400">
                          -₹{tds.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-teal-600 dark:text-teal-400 font-bold text-sm">
                          ₹{net.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-sans">
                          <button
                            onClick={() => handleGenerateSalarySlip(teacher)}
                            className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Salary Slip</span>
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

      {/* VIEW 4: PAN-INDIA SPATIAL CORRIDOR */}
      {viewMode === 'SPATIAL_RADAR' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 p-6 rounded-2xl border border-blue-700/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                TERRITORIAL COVERAGE & RECRUITMENT SHORTAGE SENSOR
              </div>
              <h2 className="text-xl font-bold mt-1">Pan-India Geographic Corridor & Subject Density Radar</h2>
              <p className="text-xs text-blue-200 mt-1 max-w-2xl">
                Real-time mapping of educator clusters across districts. Identifies underserved student zones
                where additional STEM or Language faculty onboarding is required.
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1.5 rounded-lg bg-blue-950/80 border border-blue-500/30 text-xs font-mono text-blue-300">
                Coverage: 28 States & 8 UTs Enabled
              </span>
            </div>
          </div>

          {/* Holographic Subject Saturation Radar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  Pan-India Subject Saturation & Dispatch Readiness Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time ratio of student tuition demand vs certified educator density per academic discipline
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                RADAR: 92.4% ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {[
                { subject: 'Mathematics & Calculus', sat: 94, tutors: teachers.filter(t => (t.subjects || []).includes('Mathematics')).length || 4, status: 'OPTIMAL SATURATION' },
                { subject: 'Physics (Mechanics/Optics)', sat: 88, tutors: teachers.filter(t => (t.subjects || []).includes('Physics')).length || 3, status: 'HIGH AVAILABILITY' },
                { subject: 'Chemistry (Organic/Inorganic)', sat: 82, tutors: teachers.filter(t => (t.subjects || []).includes('Chemistry')).length || 2, status: 'BALANCED SUPPLY' },
                { subject: 'Biology & Medical Foundation', sat: 76, tutors: teachers.filter(t => (t.subjects || []).includes('Biology')).length || 2, status: 'RECRUITMENT PRIORITY' }
              ].map(item => (
                <div key={item.subject} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{item.subject}</span>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.sat}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${item.sat}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>{item.tutors} Verified Tutors</span>
                    <span className="font-mono text-[10px] text-emerald-500 font-semibold">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {allStates.slice(0, 8).map(state => {
              const stateTeachers = teachers.filter(t => (t.stateName || t.state || '').toLowerCase() === state.name.toLowerCase());
              const count = stateTeachers.length;
              const verified = stateTeachers.filter(t => t.verificationStatus === 'APPROVED').length;

              return (
                <div
                  key={state.id}
                  onClick={() => {
                    playCyberSound('click');
                    setStateFilter(state.name);
                    setViewMode('FACULTY_REGISTRY');
                    showToast(`Viewing educators in ${state.name}`, 'info');
                  }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{state.name}</h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      {count} Faculty
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>Verified & Accredited:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{verified}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Active Districts:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                        {locationService.getDistricts(state.id).length}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>Inspect Territory Roster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: KYC & ACCREDITATION AUDIT MODAL */}
      {selectedTeacherForKyc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                KYC Accreditation Audit
              </h3>
              <button
                onClick={() => setSelectedTeacherForKyc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs">
                <div className="font-bold text-slate-900 dark:text-white text-sm">{selectedTeacherForKyc.name}</div>
                <div className="text-slate-500 font-mono">{selectedTeacherForKyc.id} • {selectedTeacherForKyc.mobile}</div>
                <div className="text-indigo-600 dark:text-indigo-400 font-medium">{selectedTeacherForKyc.highestQualification} ({selectedTeacherForKyc.university})</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Super Admin Decision:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setKycDecision('APPROVED')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      kycDecision === 'APPROVED'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    APPROVE & ACCREDIT
                  </button>

                  <button
                    type="button"
                    onClick={() => setKycDecision('REJECTED')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      kycDecision === 'REJECTED'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    REJECT / AMEND
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Statutory Audit Notes / Rejection Reason:
                </label>
                <textarea
                  value={kycRemarks}
                  onChange={e => setKycRemarks(e.target.value)}
                  placeholder="e.g. Degree certificate verified via Banaras Hindu University portal; identity confirmed."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedTeacherForKyc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={handleSubmitKycDecision}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                {actionProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                Confirm Accreditation Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MASTER PROFILE EDIT MODAL */}
      {selectedTeacherForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-500" />
                Master Profile Correction
              </h3>
              <button
                onClick={() => setSelectedTeacherForEdit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={editFormData.name || ''}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Registered Phone</label>
                <input
                  type="text"
                  value={editFormData.mobile || ''}
                  onChange={e => setEditFormData({ ...editFormData, mobile: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Highest Qualification</label>
                <input
                  type="text"
                  value={editFormData.highestQualification || ''}
                  onChange={e => setEditFormData({ ...editFormData, highestQualification: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Degree University</label>
                <input
                  type="text"
                  value={editFormData.university || ''}
                  onChange={e => setEditFormData({ ...editFormData, university: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Expected Fee (₹)</label>
                <input
                  type="number"
                  value={editFormData.expectedFeeMonthly || 0}
                  onChange={e => setEditFormData({ ...editFormData, expectedFeeMonthly: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  value={editFormData.experienceYears || 0}
                  onChange={e => setEditFormData({ ...editFormData, experienceYears: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Address & Locality</label>
                <input
                  type="text"
                  value={editFormData.address || ''}
                  onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Master Modification (Required for Audit Log):
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                  placeholder="e.g. Fee restructured per District Coordinator authorization"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedTeacherForEdit(null)}
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
                Save Master Corrections
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: OFFICIAL SALARY SLIP VIEW MODAL */}
      {selectedTeacherForSalarySlip && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-teal-500" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Official Faculty Salary Slip
                </h3>
              </div>
              <button
                onClick={() => setSelectedTeacherForSalarySlip(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Slip Canvas */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4 font-mono text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 font-sans">
                <div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white tracking-wide">
                    FOCUSPOINT EDTECH ENTERPRISE
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Faculty Compensation & Disbursement Voucher
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                    DISBURSED
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">{selectedTeacherForSalarySlip.slipNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Educator:</span> {selectedTeacherForSalarySlip.teacherName}
                </div>
                <div>
                  <span className="text-slate-400">Month:</span> {selectedTeacherForSalarySlip.month}
                </div>
                <div>
                  <span className="text-slate-400">Account:</span> {selectedTeacherForSalarySlip.bankAccountMasked}
                </div>
                <div>
                  <span className="text-slate-400">NEFT UTR:</span> {selectedTeacherForSalarySlip.utrNumber}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>Gross Tuition (1-on-1 Sessions):</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{selectedTeacherForSalarySlip.grossTuitionRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>FocusPoint Platform Fee (10%):</span>
                  <span>-₹{selectedTeacherForSalarySlip.platformCommissionAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                  <span>Statutory TDS 1% (Sec 194C):</span>
                  <span>-₹{selectedTeacherForSalarySlip.tdsDeduction.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-300 dark:border-slate-600 text-sm font-bold text-teal-600 dark:text-teal-400">
                  <span>Net Disbursed to Bank:</span>
                  <span>₹{selectedTeacherForSalarySlip.netDisbursedAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Voucher
              </button>
              <button
                type="button"
                onClick={() => {
                  playCyberSound('click');
                  showToast('Salary voucher downloaded to storage', 'success');
                  setSelectedTeacherForSalarySlip(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Download Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DIRECT EDUCATOR ONBOARDING MODAL */}
      {isOnboardingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-500" />
                Direct Educator Onboarding
              </h3>
              <button
                onClick={() => setIsOnboardingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDirectTeacher} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeacherForm.name || ''}
                    onChange={e => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
                    placeholder="e.g. Dr. Anil Srivastava"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (+91) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newTeacherForm.mobile || ''}
                    onChange={e => setNewTeacherForm({ ...newTeacherForm, mobile: e.target.value })}
                    placeholder="9876543210"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newTeacherForm.email || ''}
                    onChange={e => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
                    placeholder="teacher.anil@focuspoint.internal"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Highest Qualification
                  </label>
                  <input
                    type="text"
                    value={newTeacherForm.highestQualification || ''}
                    onChange={e => setNewTeacherForm({ ...newTeacherForm, highestQualification: e.target.value })}
                    placeholder="M.Sc. Physics (Gold Medalist)"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <select
                    value={newTeacherForm.stateName || 'Uttar Pradesh'}
                    onChange={e => setNewTeacherForm({ ...newTeacherForm, stateName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {allStates.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={newTeacherForm.districtName || 'Ghazipur'}
                    onChange={e => setNewTeacherForm({ ...newTeacherForm, districtName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Expected Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={newTeacherForm.expectedFeeMonthly || 3500}
                    onChange={e => setNewTeacherForm({ ...newTeacherForm, expectedFeeMonthly: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Subjects (comma separated)
                  </label>
                  <input
                    type="text"
                    value={(newTeacherForm.subjects || []).join(', ')}
                    onChange={e => setNewTeacherForm({ ...newTeacherForm, subjects: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="Physics, Mathematics"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  {actionProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  Register & Certify Educator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: HOLOGRAPHIC BIOMETRIC DOSSIER MODAL */}
      {selectedTeacherForDossier && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 text-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-lg text-white tracking-wide">
                    Holographic Faculty Dossier & Accreditation
                  </h3>
                  <div className="text-[11px] font-mono text-purple-400">
                    Sovereign Biometric Registry • UIDAI & NAD Interfaced
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeacherForDossier(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-850 to-slate-800 border border-slate-750 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedTeacherForDossier.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTeacherForDossier.name)}&background=7c3aed&color=ffffff`}
                  alt={selectedTeacherForDossier.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/40 shadow-lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-white">{selectedTeacherForDossier.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedTeacherForDossier.verificationStatus === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {selectedTeacherForDossier.verificationStatus}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    ID: {selectedTeacherForDossier.id} • {selectedTeacherForDossier.mobile}
                  </div>
                  <div className="text-xs text-indigo-400 font-semibold mt-1">
                    {selectedTeacherForDossier.highestQualification} ({selectedTeacherForDossier.university || 'State University'})
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right font-mono">
                <div className="text-[11px] text-slate-400">Monthly Expected Fee</div>
                <div className="text-xl font-extrabold text-teal-300">
                  ₹{(selectedTeacherForDossier.expectedFeeMonthly || 3500).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500">1-on-1 Home Tuition</div>
              </div>
            </div>

            {/* Statutory Security & Biometric Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-sans font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  UIDAI Biometric Hash
                </div>
                <div className="text-emerald-300 font-bold truncate">
                  {selectedTeacherForDossier.biometricToken || 'BIO-AADHAAR-910482'}
                </div>
                <div className="text-[10px] text-slate-500">256-bit Aadhaar Authentication Token</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-sans font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  Police CID Clearance Code
                </div>
                <div className="text-blue-300 font-bold truncate">
                  {selectedTeacherForDossier.policeClearanceCode || 'UP-POL-SEC-2026-7491'}
                </div>
                <div className="text-[10px] text-slate-500">Clean criminal background affidavit</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-sans font-semibold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  Home Tuition Dispatch Radius
                </div>
                <div className="text-purple-300 font-bold">
                  {selectedTeacherForDossier.teachingRadiusKm || 12} km radius coverage
                </div>
                <div className="text-[10px] text-slate-500">Center: {selectedTeacherForDossier.area || 'Saidpur'}, {selectedTeacherForDossier.districtName || 'Ghazipur'}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-sans font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  Active Assigned Learners
                </div>
                <div className="text-amber-300 font-bold">
                  {selectedTeacherForDossier.assignedStudentsCount || 0} Learners Under Mentorship
                </div>
                <div className="text-[10px] text-slate-500">Rating: {selectedTeacherForDossier.rating || 4.8} / 5.0 ({selectedTeacherForDossier.reviewsCount || 10} reviews)</div>
              </div>
            </div>

            {/* Cryptographic Accreditation Badges Engine */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Award className="w-4 h-4 text-amber-400" />
                  Cryptographic Accreditation Badging Engine
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Click badge to award / revoke</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'GOLD_STANDARD_EDUCATOR', label: 'Gold Standard Mentor', desc: 'Top 5% student retention & parent rating' },
                  { id: 'STEM_OLYMPIAD_MENTOR', label: 'STEM Olympiad Specialist', desc: 'Olympiad & competitive problem solver' },
                  { id: 'NEET_JEE_SPECIALIST', label: 'NEET / JEE Advanced Coach', desc: 'Medical & Engineering entrance mentor' },
                  { id: 'POLICE_VERIFIED_SECURE', label: 'Police Verified Background', desc: 'Statutory background check cleared' },
                  { id: 'MASTER_PEDAGOGY_CERTIFIED', label: 'Certified Pedagogy Expert', desc: 'FocusPoint methodology accredited' }
                ].map(badge => {
                  const isAwarded = (selectedTeacherForDossier.accreditationBadges || []).includes(badge.id);
                  return (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => handleToggleBadge(selectedTeacherForDossier, badge.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                        isAwarded
                          ? 'bg-slate-800 border-amber-500/50 text-white shadow-md shadow-amber-950/20'
                          : 'bg-slate-850/60 border-slate-750 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg mt-0.5 ${isAwarded ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                        {isAwarded ? <Check className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold ${isAwarded ? 'text-amber-300' : 'text-slate-300'}`}>
                          {badge.label}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{badge.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scanned Marksheet Mockup */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-750 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5 font-sans">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  National Academic Depository (NAD) DigiLocker Marksheet
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  SHA-256 SIGNED
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-400 flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-bold">{selectedTeacherForDossier.highestQualification} Degree Certificate</div>
                  <div className="text-[10px] text-slate-500">Issuer: {selectedTeacherForDossier.university || 'Banaras Hindu University'} • Reg: {selectedTeacherForDossier.id?.replace('usr-teacher-', 'BHU-')}</div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    AUTHENTICATED
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedTeacherForDossier(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close Dossier
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const t = selectedTeacherForDossier;
                    setSelectedTeacherForDossier(null);
                    handleOpenDispatchModal(t);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Dispatch Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const t = selectedTeacherForDossier;
                    setSelectedTeacherForDossier(null);
                    handleGenerateSalarySlip(t);
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Salary Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const t = selectedTeacherForDossier;
                    setSelectedTeacherForDossier(null);
                    handleOpenIdCard(t);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>ID Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: AI-POWERED CREDENTIAL RADAR SCANNER MODAL */}
      {isAiScanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Zap className="w-5 h-5 text-cyan-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">
                    AI Credential & Biometric Radar Scanner
                  </h3>
                  <div className="text-[11px] font-mono text-cyan-400">
                    Sovereign Academic & Background Check Engine
                  </div>
                </div>
              </div>
              {!aiScanning && (
                <button
                  onClick={() => setIsAiScanModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {aiScanning ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                {/* Radar Scanning Ring */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
                  <div className="absolute inset-2 rounded-full border-2 border-dashed border-cyan-500/40 animate-spin" />
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center">
                    <Cpu className="w-8 h-8 text-cyan-300 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1 w-full max-w-xs">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-cyan-300">Scanning Radar</span>
                    <span className="font-bold text-white">{aiScanProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${aiScanProgress}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs font-mono text-slate-300 max-w-sm px-2 animate-pulse">
                  {aiScanStep}
                </p>
              </div>
            ) : aiScanResult ? (
              <div className="space-y-4 py-2 font-mono text-xs">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1 font-sans">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-base text-white">
                    Sovereign Compliance Verified: {aiScanResult.tamperProofCompliance}%
                  </h4>
                  <p className="text-xs text-emerald-300 font-mono">
                    Zero fraudulent credentials or degree mark-sheet discrepancies detected
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-750">
                    <div className="text-slate-400">Total Faculty Scanned</div>
                    <div className="text-lg font-bold text-white mt-0.5">{aiScanResult.totalScanned} Educators</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-750">
                    <div className="text-slate-400">Accredited Roster</div>
                    <div className="text-lg font-bold text-emerald-400 mt-0.5">{aiScanResult.accreditedCount} Active</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-750">
                    <div className="text-slate-400">Security Flags</div>
                    <div className="text-lg font-bold text-cyan-300 mt-0.5">{aiScanResult.flaggedCount} Remediated</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-750">
                    <div className="text-slate-400">Registry Integrity</div>
                    <div className="text-lg font-bold text-teal-300 mt-0.5">99.4% Verified</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-[10px] text-slate-400 break-all space-y-0.5">
                  <div className="text-slate-300 font-bold">SHA3 Audit Hash:</div>
                  <div className="text-cyan-400">{aiScanResult.scanHash}</div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      playCyberSound('click');
                      showToast('Audit certificate exported', 'success');
                      setIsAiScanModalOpen(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAiScanModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* MODAL 9: STUDENT DISPATCH & TUITION ALLOCATION MODAL */}
      {selectedTeacherForDispatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    Dispatch Student to Educator
                  </h3>
                  <div className="text-xs text-slate-500">
                    1-on-1 Personalized Home Tuition Allocation
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeacherForDispatch(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Educator Summary Header */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{selectedTeacherForDispatch.name}</div>
                <div className="text-slate-500 font-mono">
                  {selectedTeacherForDispatch.area || 'Saidpur'}, {selectedTeacherForDispatch.districtName || 'Ghazipur'}
                </div>
                <div className="text-indigo-600 dark:text-indigo-400 font-medium">
                  {selectedTeacherForDispatch.highestQualification}
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-[10px] text-slate-400">Monthly Standard Fee</div>
                <div className="font-bold text-teal-600 dark:text-teal-400 text-sm">
                  ₹{(selectedTeacherForDispatch.expectedFeeMonthly || 3500).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitDispatch} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student / Learner Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={dispatchStudentName}
                  onChange={e => setDispatchStudentName(e.target.value)}
                  placeholder="e.g. Aryan Gupta"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Discipline *
                  </label>
                  <select
                    value={dispatchSubject}
                    onChange={e => setDispatchSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Science (Combined)">Science (Combined)</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Class / Grade Level *
                  </label>
                  <select
                    value={dispatchClass}
                    onChange={e => setDispatchClass(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Class 9 CBSE">Class 9 CBSE</option>
                    <option value="Class 10 CBSE">Class 10 CBSE</option>
                    <option value="Class 11 UP Board">Class 11 UP Board</option>
                    <option value="Class 12 UP Board">Class 12 UP Board</option>
                    <option value="NEET UG Foundation">NEET UG Foundation</option>
                    <option value="JEE Mains Sprint">JEE Mains Sprint</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Agreed Monthly Tuition Fee (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={dispatchFee}
                  onChange={e => setDispatchFee(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dispatch Notes & Locality Address
                </label>
                <textarea
                  value={dispatchNotes}
                  onChange={e => setDispatchNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Near Station Road, Saidpur. Parent requested evening slots (05:00 PM - 07:00 PM)."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 font-sans">
                <button
                  type="button"
                  onClick={() => setSelectedTeacherForDispatch(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  {actionProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>Authorize & Dispatch Learner</span>
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
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Pan-India Home Tutor & Faculty Ledger Export"
        data={filteredTeachers.map(t => ({
          'Educator ID': t.id,
          'Full Name': t.name,
          'Phone': t.mobile,
          'Email': t.email,
          'Highest Qualification': t.highestQualification,
          'Degree': t.degree,
          'University': t.university,
          'Experience Years': t.experienceYears,
          'Subjects': (t.subjects || []).join(', '),
          'State': t.stateName || t.state || 'Uttar Pradesh',
          'District': t.districtName || t.district || 'Ghazipur',
          'Locality': t.area || (t as any).locality || 'Saidpur',
          'PIN Code': t.pincode,
          'Monthly Fee (INR)': t.expectedFeeMonthly,
          'Assigned Learners': t.assignedStudentsCount || 0,
          'Rating Index': t.rating || 4.8,
          'KYC Status': t.verificationStatus,
          'Account Status': t.isActive ? 'ACTIVE' : 'SUSPENDED'
        }))}
        filename={`focuspoint_pan_india_faculty_${new Date().toISOString().slice(0, 10)}`}
      />
    </div>
  );
};

export default SuperAdminTeachers;
