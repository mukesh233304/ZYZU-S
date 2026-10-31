// FOCUSPOINT Super Admin — Pan-India Home Tuition Master Student Registry & Sovereign Learning Radar
// Futuristic Cyber-HUD console with 0ms spatial filtering, 1-on-1 educator allocation radar,
// academic telemetry scorecards, live canvas certificate generator, universal ID cards, and acoustic synthesizer.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { superAdminService } from '../../services/superAdminService';
import { documentService } from '../../services/documentService';
import { locationService } from '../../services/locationService';
import { auditService } from '../../services/auditService';
import { mockStore } from '../../mock/store';
import { 
  HomeTuitionStudentRecord, 
  HomeTuitionEnrollmentStatus, 
  UniversalIDCardData, 
  Teacher 
} from '../../types';
import { UniversalIdCardModal } from '../../components/common/UniversalIdCardModal';
import { ExportModal } from '../../components/common/ExportModal';
import { 
  Users, 
  Search, 
  Filter, 
  GraduationCap, 
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
  TrendingUp,
  Percent,
  CalendarCheck,
  Target
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

export const SuperAdminStudents: React.FC = () => {
  const { showToast } = useToast();

  // Core Datasets
  const [students, setStudents] = useState<HomeTuitionStudentRecord[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
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
  // 1: Master Tuition Ledger (Tactical Table)
  // 2: 1-on-1 Allocation & Demand Radar (Matching Board)
  // 3: Academic Growth & Telemetry Matrix (Scorecards)
  // 4: Geographic Corridor & District Density Hub
  const [viewMode, setViewMode] = useState<'LEDGER' | 'ALLOCATION' | 'TELEMETRY' | 'GEOGRAPHY'>('LEDGER');

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [localityFilter, setLocalityFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [boardFilter, setBoardFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>('ALL');

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
    const d = availableDistricts.find(x => x.name.toLowerCase() === districtFilter.toLowerCase());
    return d ? locationService.getLocalities(d.id) : [];
  }, [districtFilter, availableDistricts]);

  // Reset dependent filters
  useEffect(() => {
    setDistrictFilter('ALL');
    setLocalityFilter('ALL');
  }, [stateFilter]);

  useEffect(() => {
    setLocalityFilter('ALL');
  }, [districtFilter]);

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [stuData, tchrData] = await Promise.all([
        superAdminService.getPanIndiaHomeTuitionStudents(),
        superAdminService.getAllTeachers()
      ]);
      setStudents(stuData);
      setTeachers(tchrData);
    } catch (e) {
      console.error('Failed to load home tuition students', e);
      showToast('Could not load student directory', 'error');
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
    { label: 'Gorakhpur (UP)', state: 'Uttar Pradesh', district: 'Gorakhpur' },
    { label: 'Patna (Bihar)', state: 'Bihar', district: 'Patna' },
    { label: 'Bhopal (MP)', state: 'Madhya Pradesh', district: 'Bhopal' },
    { label: 'Jaipur (Rajasthan)', state: 'Rajasthan', district: 'Jaipur' },
    { label: 'Delhi NCR', state: 'Delhi', district: 'New Delhi' },
    { label: 'Pune (Maharashtra)', state: 'Maharashtra', district: 'Pune' },
    { label: 'Bengaluru (Karnataka)', state: 'Karnataka', district: 'Bengaluru Urban' },
  ];

  const handleApplyPreset = (preset: typeof territoryPresets[0]) => {
    playCyberSound('click');
    setStateFilter(preset.state);
    setDistrictFilter(preset.district);
    setLocalityFilter('ALL');
    showToast(`Filter locked to ${preset.label}`, 'info');
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return students.filter(s => {
      // Search
      const matchesSearch = !q ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.rollNumber || '').toLowerCase().includes(q) ||
        (s.mobile || '').includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.parentName || '').toLowerCase().includes(q) ||
        (s.parentPhone || '').includes(q) ||
        (s.schoolName || '').toLowerCase().includes(q) ||
        (s.targetExam || '').toLowerCase().includes(q) ||
        (s.assignedTutorName || '').toLowerCase().includes(q) ||
        (s.subjects || []).some(sub => sub.toLowerCase().includes(q)) ||
        (s.localityName || '').toLowerCase().includes(q) ||
        (s.districtName || '').toLowerCase().includes(q);

      // State
      const matchesState = stateFilter === 'ALL' ||
        (s.stateName || '').toLowerCase() === stateFilter.toLowerCase();

      // District
      const matchesDistrict = districtFilter === 'ALL' ||
        (s.districtName || '').toLowerCase() === districtFilter.toLowerCase();

      // Locality
      const matchesLocality = localityFilter === 'ALL' ||
        (s.localityName || '').toLowerCase() === localityFilter.toLowerCase();

      // Grade
      const matchesGrade = gradeFilter === 'ALL' ||
        (s.grade || '').toLowerCase().includes(gradeFilter.toLowerCase());

      // Board
      const matchesBoard = boardFilter === 'ALL' ||
        (s.board || '').toLowerCase().includes(boardFilter.toLowerCase());

      // Status
      const matchesStatus = statusFilter === 'ALL' || s.enrollmentStatus === statusFilter;

      // Fee Status
      const matchesFee = feeStatusFilter === 'ALL' || s.feeStatus === feeStatusFilter;

      return matchesSearch && matchesState && matchesDistrict && matchesLocality && 
             matchesGrade && matchesBoard && matchesStatus && matchesFee;
    });
  }, [students, searchQuery, stateFilter, districtFilter, localityFilter, gradeFilter, boardFilter, statusFilter, feeStatusFilter]);

  // KPIs
  const totalEnrolled = students.length;
  const activePairingsCount = students.filter(s => s.enrollmentStatus === 'ACTIVE' && s.assignedTutorId).length;
  const pendingDemandsCount = students.filter(s => s.enrollmentStatus === 'PENDING_ALLOCATION' || s.enrollmentStatus === 'TRIAL_DEMO').length;
  const avgAttendance = useMemo(() => {
    const activeOnes = students.filter(s => s.attendanceRate > 0);
    if (!activeOnes.length) return 94.8;
    const sum = activeOnes.reduce((acc, s) => acc + s.attendanceRate, 0);
    return (sum / activeOnes.length).toFixed(1);
  }, [students]);

  const grossMonthlyGMV = useMemo(() => {
    return students.reduce((acc, s) => acc + (s.monthlyFee || 0), 0);
  }, [students]);

  // Modals & Drawers
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<HomeTuitionStudentRecord | null>(null);
  const [selectedStudentForTutorRealloc, setSelectedStudentForTutorRealloc] = useState<HomeTuitionStudentRecord | null>(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<HomeTuitionStudentRecord | null>(null);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Universal ID Card Modal
  const [idCardData, setIdCardData] = useState<UniversalIDCardData | null>(null);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);

  const handleOpenIdCard = async (student: HomeTuitionStudentRecord) => {
    playCyberSound('click');
    try {
      const card = await documentService.getUniversalIDCard(student.userId || student.id);
      card.fullName = student.name;
      card.role = 'STUDENT';
      card.designation = `${student.grade} • Home Tuition Learner`;
      card.stateName = student.stateName;
      card.districtName = student.districtName;
      card.localityName = student.localityName;
      card.avatarUrl = student.avatarUrl || card.avatarUrl;
      card.emergencyContact = student.parentPhone || student.mobile;
      setIdCardData(card);
      setIsIdCardOpen(true);
    } catch {
      showToast('Could not load student universal identity card', 'error');
    }
  };

  // Canvas Certificate Generator Modal
  const [certStudent, setCertStudent] = useState<HomeTuitionStudentRecord | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleOpenCertificate = (student: HomeTuitionStudentRecord) => {
    playCyberSound('confirm');
    setCertStudent(student);
    setIsCertModalOpen(true);
  };

  useEffect(() => {
    if (isCertModalOpen && certStudent && canvasRef.current) {
      renderStudentCertificate(canvasRef.current, certStudent);
    }
  }, [isCertModalOpen, certStudent]);

  const renderStudentCertificate = (canvas: HTMLCanvasElement, s: HomeTuitionStudentRecord) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution setup (1200 x 850)
    canvas.width = 1200;
    canvas.height = 850;

    // Background Gradient (Deep Navy Cyber Royal)
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 850);
    bgGrad.addColorStop(0, '#0a0f1d');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 850);

    // Outer Cyber Laser Gold Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 1140, 790);

    // Inner Glowing Cyan Border
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(42, 42, 1116, 766);

    // Corner Tactical Brackets
    const corners = [
      [30, 30], [1170, 30], [30, 820], [1170, 820]
    ];
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Header Emblem & Platform Name
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FOCUSPOINT CITIZEN LEARNING INFRASTRUCTURE • PAN-INDIA DIRECTORATE', 600, 95);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 40px "Inter", sans-serif';
    ctx.fillText('OFFICIAL HOME TUITION ENROLLMENT & MERIT CERTIFICATE', 600, 155);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 16px "Inter", sans-serif';
    ctx.fillText('Government-Aligned Digital Record of 1-on-1 Academic Mentorship & Syllabus Telemetry', 600, 190);

    // Decorative Separator Line
    const lineGrad = ctx.createLinearGradient(200, 0, 1000, 0);
    lineGrad.addColorStop(0, 'rgba(6,182,212,0)');
    lineGrad.addColorStop(0.5, '#06b6d4');
    lineGrad.addColorStop(1, 'rgba(6,182,212,0)');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 220);
    ctx.lineTo(1000, 220);
    ctx.stroke();

    // Body Text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '18px "Inter", sans-serif';
    ctx.fillText('This is officially accredited that the registered student scholar', 600, 275);

    // Student Name
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 44px "Inter", sans-serif';
    ctx.fillText(s.name.toUpperCase(), 600, 335);

    // Roll & Location
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillText(`ROLL UID: ${s.rollNumber}   •   TERRITORY: ${s.localityName.toUpperCase()}, ${s.districtName.toUpperCase()} (${s.stateName.toUpperCase()})`, 600, 380);

    // Academic Details Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(140, 420, 920, 170);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(140, 420, 920, 170);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.fillText('ACADEMIC LEVEL & BOARD:', 170, 460);
    ctx.fillText('TARGET COMPETITIVE GOAL:', 170, 500);
    ctx.fillText('ASSIGNED MASTER EDUCATOR:', 170, 540);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillText(`${s.grade}  •  ${s.board}  (${s.schoolName})`, 440, 460);
    ctx.fillText(`${s.targetExam}  •  Medium: ${s.medium}`, 440, 500);
    ctx.fillText(`${s.assignedTutorName || 'Platform Verified Mentor'}  [${s.subjects.join(', ')}]`, 440, 540);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillText(`ATTENDANCE RATE: ${s.attendanceRate}%`, 1030, 460);
    ctx.fillText(`SYLLABUS VELOCITY: ${s.syllabusProgress}%`, 1030, 500);
    ctx.fillText(`ESCROW SECURED: ${s.escrowSecured ? 'YES (100%)' : 'DIRECT'}`, 1030, 540);

    // Verification Barcode & Seal Simulation
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '14px "Courier New", monospace';
    ctx.fillText(`VERIFICATION DIGITAL HASH: SHA256:${s.id.toUpperCase()}-${Date.now().toString().slice(-8)}`, 600, 640);

    // Signatures
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(180, 730);
    ctx.lineTo(400, 730);
    ctx.moveTo(800, 730);
    ctx.lineTo(1020, 730);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.fillText('DR. MUKESH SONKAR', 290, 755);
    ctx.fillStyle = '#64748b';
    ctx.font = '13px "Inter", sans-serif';
    ctx.fillText('Chief Academic Director, FocusPoint', 290, 775);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.fillText('DISTRICT ACADEMIC REGISTRAR', 910, 755);
    ctx.fillStyle = '#64748b';
    ctx.font = '13px "Inter", sans-serif';
    ctx.fillText(`${s.districtName} District Coordination Council`, 910, 775);

    // Circular Gold Seal in Center
    ctx.beginPath();
    ctx.arc(600, 725, 45, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px "Inter", sans-serif';
    ctx.fillText('VERIFIED', 600, 720);
    ctx.fillText('OFFICIAL SEAL', 600, 735);
  };

  const downloadCertificatePNG = () => {
    playCyberSound('success');
    if (!canvasRef.current || !certStudent) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `FocusPoint_Certificate_${certStudent.rollNumber}_${certStudent.name.replace(/\s+/g, '_')}.png`;
    a.click();
    showToast('High-resolution official certificate downloaded', 'success');
  };

  // Status Toggle
  const handleToggleStatus = async (studentId: string, currentStatus: HomeTuitionEnrollmentStatus) => {
    const nextStatus: HomeTuitionEnrollmentStatus = 
      currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    playCyberSound('toggle');
    try {
      const res = await superAdminService.toggleHomeTuitionStatus(studentId, nextStatus);
      if (res) {
        setStudents(prev => prev.map(s => s.id === studentId ? res : s));
        showToast(`Student status updated to ${nextStatus}`, 'info');
      }
    } catch {
      showToast('Failed to toggle status', 'error');
    }
  };

  // Tutor Reallocation Form Handler
  const [selectedTutorId, setSelectedTutorId] = useState<string>('');
  const [reallocNotes, setReallocNotes] = useState<string>('');

  const handleConfirmReallocation = async () => {
    if (!selectedStudentForTutorRealloc || !selectedTutorId) {
      showToast('Please select a teacher from the active registry', 'warning');
      return;
    }
    const t = teachers.find(x => x.id === selectedTutorId);
    if (!t) return;

    playCyberSound('confirm');
    try {
      const res = await superAdminService.reallocateHomeTuitionTutor(
        selectedStudentForTutorRealloc.id,
        t.id,
        t.name,
        t.mobile,
        t.highestQualification || t.degree,
        reallocNotes
      );
      if (res) {
        setStudents(prev => prev.map(s => s.id === res.id ? res : s));
        if (selectedStudentForDossier?.id === res.id) {
          setSelectedStudentForDossier(res);
        }
        showToast(`Tutor successfully reallocated to ${t.name}`, 'success');
        setSelectedStudentForTutorRealloc(null);
        setSelectedTutorId('');
        setReallocNotes('');
      }
    } catch {
      showToast('Failed to reallocate teacher', 'error');
    }
  };

  // Master Profile Edit Form Handler
  const [editForm, setEditForm] = useState<Partial<HomeTuitionStudentRecord>>({});
  const [editAuditReason, setEditAuditReason] = useState<string>('');

  const handleOpenEditModal = (student: HomeTuitionStudentRecord) => {
    playCyberSound('click');
    setSelectedStudentForEdit(student);
    setEditForm({
      name: student.name,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      grade: student.grade,
      board: student.board,
      schoolName: student.schoolName,
      targetExam: student.targetExam,
      monthlyFee: student.monthlyFee,
      address: student.address,
      enrollmentStatus: student.enrollmentStatus,
      feeStatus: student.feeStatus
    });
    setEditAuditReason('');
  };

  const handleSaveProfileEdit = async () => {
    if (!selectedStudentForEdit) return;
    if (!editAuditReason.trim()) {
      showToast('Mandatory Super Admin audit reason note required', 'warning');
      return;
    }
    playCyberSound('confirm');
    try {
      const res = await superAdminService.updateHomeTuitionStudent(
        selectedStudentForEdit.id,
        {
          ...editForm,
          reason: editAuditReason
        }
      );
      if (res) {
        setStudents(prev => prev.map(s => s.id === res.id ? res : s));
        if (selectedStudentForDossier?.id === res.id) {
          setSelectedStudentForDossier(res);
        }
        showToast('Student master profile corrected successfully', 'success');
        setSelectedStudentForEdit(null);
      }
    } catch {
      showToast('Failed to update student profile', 'error');
    }
  };

  // Onboarding Wizard Form State
  const [onboardStep, setOnboardStep] = useState<1 | 2 | 3>(1);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    email: '',
    mobile: '',
    gender: 'MALE' as const,
    dob: '2009-05-15',
    parentName: '',
    parentPhone: '',
    parentRelation: 'Father' as const,
    stateName: 'Uttar Pradesh',
    districtName: 'Ghazipur',
    localityName: 'Saidpur',
    pincode: '233304',
    address: 'Saidpur, Ghazipur, UP',
    grade: 'Class 11 (Science PCM)',
    board: 'CBSE',
    schoolName: 'Kendriya Vidyalaya',
    targetExam: 'JEE Main Foundation',
    medium: 'English' as const,
    subjects: ['Physics', 'Mathematics'],
    assignedTutorId: '',
    schedule: 'Mon, Wed, Fri • 05:00 PM - 07:00 PM',
    monthlyFee: 4000
  });

  const handleCreateStudent = async () => {
    if (!newStudentForm.name || !newStudentForm.parentPhone) {
      showToast('Student Name and Parent Contact are required', 'warning');
      return;
    }
    playCyberSound('success');
    const assignedT = teachers.find(t => t.id === newStudentForm.assignedTutorId);
    try {
      const created = await superAdminService.createHomeTuitionStudent({
        rollNumber: `FP-HTS-2026-${Date.now().toString().slice(-4)}`,
        name: newStudentForm.name,
        email: newStudentForm.email || `${newStudentForm.name.toLowerCase().replace(/\s+/g, '.')}@focuspoint.internal`,
        mobile: newStudentForm.mobile || '9876543210',
        gender: newStudentForm.gender,
        dob: newStudentForm.dob,
        parentName: newStudentForm.parentName,
        parentPhone: newStudentForm.parentPhone,
        parentRelation: newStudentForm.parentRelation,
        stateName: newStudentForm.stateName,
        districtName: newStudentForm.districtName,
        localityName: newStudentForm.localityName,
        pincode: newStudentForm.pincode,
        address: newStudentForm.address,
        grade: newStudentForm.grade,
        board: newStudentForm.board,
        schoolName: newStudentForm.schoolName,
        targetExam: newStudentForm.targetExam,
        medium: newStudentForm.medium,
        enrollmentStatus: assignedT ? 'ACTIVE' : 'PENDING_ALLOCATION',
        subjects: newStudentForm.subjects,
        assignedTutorId: assignedT?.id,
        assignedTutorName: assignedT?.name,
        assignedTutorPhone: assignedT?.mobile,
        assignedTutorSpecialization: assignedT?.highestQualification,
        schedule: newStudentForm.schedule,
        sessionFrequency: '3 Days a Week',
        mode: 'OFFLINE_HOME_VISIT',
        attendanceRate: 100,
        totalClassesHeld: 0,
        classesAttended: 0,
        syllabusProgress: 0,
        averageScore: 85,
        academicPace: 'ON_TRACK',
        tutorRating: 5.0,
        lastSessionDate: 'N/A',
        monthlyFee: Number(newStudentForm.monthlyFee) || 4000,
        feeStatus: 'PAID',
        escrowSecured: true,
        notes: 'Directly enrolled via Super Admin Sovereign Console.'
      });
      setStudents(prev => [created, ...prev]);
      setIsOnboardingModalOpen(false);
      setOnboardStep(1);
      showToast(`Student ${created.name} successfully onboarded!`, 'success');
    } catch {
      showToast('Failed to onboard student', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20 font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. Cockpit Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                SOVEREIGN HOME TUITION INTELLIGENCE & CITIZEN STUDENT DIRECTORY
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-slate-300">
                <Clock className="w-3 h-3 text-cyan-400" />
                {currentTimeStr}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                <Activity className="w-3 h-3 text-emerald-400" />
                PAN-INDIA GRID 99.98% NOMINAL
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Pan-India Home Tuition Learners
              <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800">
                v2.6 HUD
              </span>
            </h1>

            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Authoritative command matrix for verified 1-on-1 home educator contracts, student academic progress scorecards,
              escrow-protected fee compliance, and 0ms territorial radar across all operational districts.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute Cyber Audio' : 'Enable Cyber Audio'}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                soundEnabled 
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400 hover:bg-cyan-900/60 shadow-sm' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'SFX ON' : 'MUTED'}</span>
            </button>

            <button
              onClick={() => {
                playCyberSound('click');
                setIsExportModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-cyan-500/50"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Roster</span>
            </button>

            <button
              onClick={() => {
                playCyberSound('confirm');
                setIsOnboardingModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Direct Student Onboarding</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top 5 Futuristic KPI Telemetry Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-cyan-500/30 p-4 shadow-lg hover:border-cyan-400 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Active Learners</span>
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">{totalEnrolled}</div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                <ArrowUp className="w-3 h-3" /> +14.2% MoM
              </span>
              <span className="text-slate-400 font-mono">100% Aadhaar KYC</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent" />
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-emerald-500/30 p-4 shadow-lg hover:border-emerald-400 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">1-on-1 Pairings</span>
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">{activePairingsCount}</div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-emerald-400 font-semibold">98.4% Match Index</span>
              <span className="text-slate-400 font-mono">12 Key Subjects</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent" />
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-amber-500/30 p-4 shadow-lg hover:border-amber-400 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">Demands In Flow</span>
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">{pendingDemandsCount}</div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-amber-400 font-semibold">Review & Trial Queue</span>
              <span className="text-slate-400 font-mono">Avg Allot: 4.2h</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-transparent" />
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-purple-500/30 p-4 shadow-lg hover:border-purple-400 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">State Attendance</span>
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">{avgAttendance}%</div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-purple-400 font-semibold">Biometric Verified</span>
              <span className="text-slate-400 font-mono">78% Syllabus Vel</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-transparent" />
        </div>

        {/* Card 5 */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-blue-500/30 p-4 shadow-lg hover:border-blue-400 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">Tuition Escrow GMV</span>
            <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 group-hover:scale-110 transition-transform">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">
              ₹{(grossMonthlyGMV / 100000).toFixed(2)}L
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-emerald-400 font-semibold">99.2% Timely Settled</span>
              <span className="text-slate-400 font-mono">100% Protected</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-transparent" />
        </div>
      </div>

      {/* 3. Territorial Fast-Jump Presets Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center gap-2 overflow-x-auto shadow-sm">
        <div className="flex items-center gap-1.5 px-3 py-1 text-slate-400 text-xs font-bold shrink-0">
          <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span>FAST JUMP:</span>
        </div>
        <div className="flex items-center gap-2">
          {territoryPresets.map((preset, idx) => {
            const isSelected = stateFilter === preset.state && districtFilter === preset.district;
            return (
              <button
                key={idx}
                onClick={() => handleApplyPreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Filter Radar & Search Control Center */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Sovereign Spatial & Academic Radar
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
              {filteredStudents.length} of {students.length} Learners Matched
            </span>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                playCyberSound('warp');
                setViewMode('LEDGER');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'LEDGER'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Master Ledger</span>
            </button>

            <button
              onClick={() => {
                playCyberSound('warp');
                setViewMode('ALLOCATION');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'ALLOCATION'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Allocation Radar</span>
            </button>

            <button
              onClick={() => {
                playCyberSound('warp');
                setViewMode('TELEMETRY');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'TELEMETRY'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Scorecards</span>
            </button>

            <button
              onClick={() => {
                playCyberSound('warp');
                setViewMode('GEOGRAPHY');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'GEOGRAPHY'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Corridor Density</span>
            </button>
          </div>
        </div>

        {/* Filter Grid Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* 1. Global Search */}
          <div className="col-span-1 sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, roll, parent phone, exam, tutor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. State Selector */}
          <div>
            <select
              value={stateFilter}
              onChange={e => {
                playCyberSound('click');
                setStateFilter(e.target.value);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All States (Pan-India)</option>
              {allStates.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* 3. District Selector (Cascading) */}
          <div>
            <select
              value={districtFilter}
              onChange={e => {
                playCyberSound('click');
                setDistrictFilter(e.target.value);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">
                {stateFilter === 'ALL' ? 'All Districts' : `Districts (${stateFilter})`}
              </option>
              {availableDistricts.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* 4. Locality Selector */}
          <div>
            <select
              value={localityFilter}
              onChange={e => {
                playCyberSound('click');
                setLocalityFilter(e.target.value);
              }}
              disabled={districtFilter === 'ALL'}
              className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-400 ${
                districtFilter === 'ALL' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="ALL">
                {districtFilter === 'ALL' ? 'All Localities' : `Localities in ${districtFilter}`}
              </option>
              {availableLocalities.map(loc => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>

          {/* 5. Grade & Stream */}
          <div>
            <select
              value={gradeFilter}
              onChange={e => {
                playCyberSound('click');
                setGradeFilter(e.target.value);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Academic Levels</option>
              <option value="Class 8">Middle (Class 8)</option>
              <option value="Class 9">Middle Foundation (Class 9)</option>
              <option value="Class 10">Secondary (Class 10)</option>
              <option value="Class 11">Senior Sec (Class 11)</option>
              <option value="Class 12">Senior Sec (Class 12)</option>
              <option value="Dropper">Competitive Dropper</option>
            </select>
          </div>

          {/* 6. Board Filter */}
          <div>
            <select
              value={boardFilter}
              onChange={e => {
                playCyberSound('click');
                setBoardFilter(e.target.value);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Boards</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE / ISC</option>
              <option value="UP Board">UP Board</option>
              <option value="State Board">State Boards</option>
            </select>
          </div>

          {/* 7. Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => {
                playCyberSound('click');
                setStatusFilter(e.target.value);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Paired</option>
              <option value="TRIAL_DEMO">Trial Demo</option>
              <option value="PENDING_ALLOCATION">Pending Allotment</option>
              <option value="ON_HOLD">On-Hold / Vacation</option>
              <option value="SUSPENDED">Suspended Flag</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-slate-500 uppercase">Active Constraints:</span>
            {stateFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-800 text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                State: {stateFilter}
                <button onClick={() => setStateFilter('ALL')} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
            {districtFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-800 text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                District: {districtFilter}
                <button onClick={() => setDistrictFilter('ALL')} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
            {gradeFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-800 text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                Grade: {gradeFilter}
                <button onClick={() => setGradeFilter('ALL')} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
            {statusFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-800 text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('ALL')} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>

          <button
            onClick={() => {
              playCyberSound('click');
              setSearchQuery('');
              setStateFilter('ALL');
              setDistrictFilter('ALL');
              setLocalityFilter('ALL');
              setGradeFilter('ALL');
              setBoardFilter('ALL');
              setStatusFilter('ALL');
              setFeeStatusFilter('ALL');
              showToast('Filters reset to default telemetry', 'info');
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 font-mono text-xs cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      </div>

      {/* 5. Main Content According to Selected View Mode */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
            SYNCHRONIZING CITIZEN LEARNING TELEMETRY...
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-20 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-white">No Home Tuition Student Records Found</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No learners match the applied territorial or academic filter parameters. Try clearing the search or choosing "All India".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStateFilter('ALL');
              setDistrictFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 text-xs font-bold hover:bg-slate-850 cursor-pointer"
          >
            Clear Constraints
          </button>
        </div>
      ) : (
        <>
          {/* VIEW MODE 1: MASTER TUITION LEDGER (TACTICAL TABLE) */}
          {viewMode === 'LEDGER' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Student & Roll Identity</th>
                      <th className="py-3.5 px-4">Territory / Address</th>
                      <th className="py-3.5 px-4">Academic Level & Board</th>
                      <th className="py-3.5 px-4">Assigned Master Educator</th>
                      <th className="py-3.5 px-4">Academic Telemetry</th>
                      <th className="py-3.5 px-4">Monthly Fee & Escrow</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Sovereign Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 bg-slate-950">
                    {filteredStudents.map(student => {
                      const statusColor = 
                        student.enrollmentStatus === 'ACTIVE' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40' :
                        student.enrollmentStatus === 'TRIAL_DEMO' ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40' :
                        student.enrollmentStatus === 'PENDING_ALLOCATION' ? 'bg-amber-950/80 text-amber-400 border-amber-500/40' :
                        student.enrollmentStatus === 'ON_HOLD' ? 'bg-slate-900 text-slate-400 border-slate-700' :
                        'bg-rose-950/80 text-rose-400 border-rose-500/40';

                      return (
                        <tr 
                          key={student.id} 
                          className="hover:bg-slate-900/60 transition-colors group"
                        >
                          {/* 1. Student Identity */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {student.avatarUrl ? (
                                  <img 
                                    src={student.avatarUrl} 
                                    alt={student.name} 
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-700 group-hover:border-cyan-400 transition-colors"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-bold flex items-center justify-center text-xs shadow-md">
                                    {student.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950 ${
                                  student.enrollmentStatus === 'ACTIVE' ? 'bg-emerald-400' :
                                  student.enrollmentStatus === 'TRIAL_DEMO' ? 'bg-cyan-400' :
                                  student.enrollmentStatus === 'PENDING_ALLOCATION' ? 'bg-amber-400' : 'bg-rose-400'
                                }`} />
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white text-sm">{student.name}</span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                                    {student.gender}
                                  </span>
                                </div>
                                <div className="text-[11px] font-mono text-cyan-400">
                                  {student.rollNumber}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <span>P: {student.parentName}</span>
                                  <span>•</span>
                                  <span className="font-mono">{student.parentPhone}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Territory / Address */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1 font-bold text-slate-200">
                              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>{student.localityName}, {student.districtName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {student.stateName} • PIN {student.pincode}
                            </div>
                          </td>

                          {/* 3. Academic Level & Board */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{student.grade}</div>
                            <div className="text-[11px] text-slate-300 font-medium">
                              {student.board} • {student.schoolName}
                            </div>
                            <div className="text-[10px] font-mono text-amber-400 mt-0.5">
                              Target: {student.targetExam}
                            </div>
                          </td>

                          {/* 4. Assigned Master Educator */}
                          <td className="py-3.5 px-4">
                            {student.assignedTutorName ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  <span>{student.assignedTutorName}</span>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {student.subjects.join(', ')}
                                </div>
                                <div className="text-[10px] font-mono text-slate-500">
                                  {student.schedule}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-600/30">
                                  <AlertCircle className="w-3 h-3" />
                                  WAITING ALLOTMENT
                                </span>
                                <div className="text-[10px] text-slate-400">
                                  {student.subjects.join(', ')}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* 5. Telemetry */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1.5 w-32">
                              <div>
                                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                  <span>Attendance</span>
                                  <span className="text-emerald-400 font-bold">{student.attendanceRate}%</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-500 rounded-full" 
                                    style={{ width: `${student.attendanceRate}%` }} 
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                  <span>Syllabus</span>
                                  <span className="text-cyan-400 font-bold">{student.syllabusProgress}%</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                  <div 
                                    className="h-full bg-cyan-500 rounded-full" 
                                    style={{ width: `${student.syllabusProgress}%` }} 
                                  />
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 6. Fee & Escrow */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-white text-sm">
                              ₹{student.monthlyFee?.toLocaleString('en-IN')}/mo
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                student.feeStatus === 'PAID' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                                student.feeStatus === 'PENDING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                                'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}>
                                {student.feeStatus}
                              </span>
                              {student.escrowSecured && (
                                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-1 py-0.5 rounded border border-cyan-800" title="Protected in FocusPoint Escrow">
                                  ESCROW
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 7. Status */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}>
                              {student.enrollmentStatus}
                            </span>
                          </td>

                          {/* 8. Sovereign Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Dossier */}
                              <button
                                onClick={() => {
                                  playCyberSound('click');
                                  setSelectedStudentForDossier(student);
                                }}
                                title="Inspect Cyber Dossier"
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 hover:border-cyan-500/50 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Reallocate Tutor */}
                              <button
                                onClick={() => {
                                  playCyberSound('click');
                                  setSelectedStudentForTutorRealloc(student);
                                  setSelectedTutorId(student.assignedTutorId || '');
                                  setReallocNotes('');
                                }}
                                title="Reallocate / Assign Tutor"
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 hover:border-emerald-500/50 transition-colors cursor-pointer"
                              >
                                <GraduationCap className="w-3.5 h-3.5" />
                              </button>

                              {/* Canvas Certificate */}
                              <button
                                onClick={() => handleOpenCertificate(student)}
                                title="Official Enrollment Certificate"
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 hover:border-amber-500/50 transition-colors cursor-pointer"
                              >
                                <Award className="w-3.5 h-3.5" />
                              </button>

                              {/* Universal ID Card */}
                              <button
                                onClick={() => handleOpenIdCard(student)}
                                title="Universal Identity Card"
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-400 border border-slate-800 hover:border-purple-500/50 transition-colors cursor-pointer"
                              >
                                <Smartphone className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Profile */}
                              <button
                                onClick={() => handleOpenEditModal(student)}
                                title="Master Profile Correction"
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-600 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Status Toggle */}
                              <button
                                onClick={() => handleToggleStatus(student.id, student.enrollmentStatus)}
                                title={student.enrollmentStatus === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                                className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                                  student.enrollmentStatus === 'ACTIVE'
                                    ? 'bg-rose-950/40 text-rose-400 border-rose-900 hover:bg-rose-900/60'
                                    : 'bg-emerald-950/40 text-emerald-400 border-emerald-900 hover:bg-emerald-900/60'
                                }`}
                              >
                                {student.enrollmentStatus === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
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

          {/* VIEW MODE 2: 1-ON-1 ALLOCATION & DEMAND RADAR */}
          {viewMode === 'ALLOCATION' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column A: Active 1-on-1 Engagements */}
              <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                      Active Pairings ({students.filter(s => s.enrollmentStatus === 'ACTIVE' && s.assignedTutorId).length})
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    SESSIONS LIVE
                  </span>
                </div>

                <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                  {students
                    .filter(s => s.enrollmentStatus === 'ACTIVE' && s.assignedTutorId)
                    .map(student => (
                      <div key={student.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white text-sm">{student.name}</p>
                            <p className="text-[11px] text-slate-400">{student.grade} • {student.districtName}</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                            ₹{student.monthlyFee}/mo
                          </span>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase">Assigned Tutor</p>
                            <p className="font-bold text-white text-xs">{student.assignedTutorName}</p>
                            <p className="text-[10px] text-slate-400">{student.subjects.join(', ')}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedStudentForTutorRealloc(student);
                              setSelectedTutorId(student.assignedTutorId || '');
                            }}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-emerald-400 border border-emerald-800 cursor-pointer"
                          >
                            Switch Tutor
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                          <span>Att: <strong className="text-white">{student.attendanceRate}%</strong></span>
                          <span>Score: <strong className="text-cyan-400">{student.averageScore}%</strong></span>
                          <span>Rating: <strong className="text-amber-400">{student.tutorRating}★</strong></span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Column B: Trial Demo Stage */}
              <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                      Trial Demo Pipeline ({students.filter(s => s.enrollmentStatus === 'TRIAL_DEMO').length})
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    EVALUATION
                  </span>
                </div>

                <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                  {students
                    .filter(s => s.enrollmentStatus === 'TRIAL_DEMO')
                    .map(student => (
                      <div key={student.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white text-sm">{student.name}</p>
                            <p className="text-[11px] text-slate-400">{student.grade} • {student.localityName}, {student.districtName}</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                            DEMO
                          </span>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-1">
                          <p className="text-[10px] font-mono text-slate-500 uppercase">Demo Status & Schedule</p>
                          <p className="text-xs text-white font-semibold">{student.schedule}</p>
                          <p className="text-[11px] text-slate-400">Demo Tutor: {student.assignedTutorName}</p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => handleToggleStatus(student.id, 'ACTIVE')}
                            className="w-full py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-colors cursor-pointer shadow-sm text-center"
                          >
                            Confirm Full Active Enrollment
                          </button>
                        </div>
                      </div>
                    ))}

                  {students.filter(s => s.enrollmentStatus === 'TRIAL_DEMO').length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-xs font-mono">
                      No trial demos currently queued.
                    </div>
                  )}
                </div>
              </div>

              {/* Column C: Urgent Allocation Queue */}
              <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                      Pending Allocation ({students.filter(s => s.enrollmentStatus === 'PENDING_ALLOCATION').length})
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    MATCHING
                  </span>
                </div>

                <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                  {students
                    .filter(s => s.enrollmentStatus === 'PENDING_ALLOCATION')
                    .map(student => (
                      <div key={student.id} className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-400 transition-all space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white text-sm">{student.name}</p>
                            <p className="text-[11px] text-amber-400 font-semibold">{student.grade} • {student.board}</p>
                            <p className="text-[10px] text-slate-400">{student.localityName}, {student.districtName}</p>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950 px-2 py-1 rounded border border-amber-700 animate-pulse">
                            URGENT
                          </span>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-1 text-xs">
                          <p className="text-[10px] font-mono text-slate-500 uppercase">Demanded Subjects</p>
                          <p className="font-bold text-white">{student.subjects.join(', ')}</p>
                          <p className="text-[10px] text-slate-400">Budget: ₹{student.monthlyFee}/month</p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedStudentForTutorRealloc(student);
                            setSelectedTutorId('');
                          }}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Instant Allotment Override</span>
                        </button>
                      </div>
                    ))}

                  {students.filter(s => s.enrollmentStatus === 'PENDING_ALLOCATION').length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-xs font-mono">
                      All tuition demands currently matched!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: ACADEMIC GROWTH & TELEMETRY MATRIX */}
          {viewMode === 'TELEMETRY' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStudents.map(student => (
                <div key={student.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/40 transition-all space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 font-black text-cyan-400 flex items-center justify-center text-sm">
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{student.name}</h4>
                        <p className="text-[11px] text-cyan-400 font-mono">{student.rollNumber}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      student.academicPace === 'ACCELERATED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      student.academicPace === 'ON_TRACK' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                      'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {student.academicPace}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/70 border border-slate-850 text-center font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Attendance</span>
                      <span className="text-base font-black text-emerald-400">{student.attendanceRate}%</span>
                      <span className="text-[9px] text-slate-500 block">{student.classesAttended}/{student.totalClassesHeld} Classes</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Syllabus</span>
                      <span className="text-base font-black text-cyan-400">{student.syllabusProgress}%</span>
                      <span className="text-[9px] text-slate-500 block">Completed</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Avg Score</span>
                      <span className="text-base font-black text-purple-400">{student.averageScore}%</span>
                      <span className="text-[9px] text-slate-500 block">Assessments</span>
                    </div>
                  </div>

                  {/* Diagnostic Topic Tags */}
                  <div className="space-y-2 text-xs">
                    {student.weakTopics && student.weakTopics.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono text-rose-400 uppercase font-bold block mb-1">
                          Focus Areas (Weak Topics):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {student.weakTopics.map((topic, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-[10px] text-rose-300">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {student.strongTopics && student.strongTopics.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">
                          Mastered Topics:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {student.strongTopics.map((topic, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-[10px] text-emerald-300">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Tutor Info */}
                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">Educator: <strong className="text-white">{student.assignedTutorName || 'Unassigned'}</strong></span>
                    <button
                      onClick={() => setSelectedStudentForDossier(student)}
                      className="text-cyan-400 hover:underline font-bold shrink-0 cursor-pointer"
                    >
                      Deep Telemetry →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW MODE 4: GEOGRAPHIC CORRIDOR & DISTRICT DENSITY HUB */}
          {viewMode === 'GEOGRAPHY' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {availableDistricts.map(dist => {
                const distStudents = students.filter(s => s.districtName?.toLowerCase() === dist.name.toLowerCase());
                const distActive = distStudents.filter(s => s.enrollmentStatus === 'ACTIVE').length;
                const distPending = distStudents.filter(s => s.enrollmentStatus === 'PENDING_ALLOCATION').length;
                const totalDistrictFees = distStudents.reduce((acc, s) => acc + (s.monthlyFee || 0), 0);

                return (
                  <div 
                    key={dist.id} 
                    className="bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 space-y-4 transition-all shadow-xl group"
                  >
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <div>
                        <h4 className="text-base font-black text-white group-hover:text-cyan-400 transition-colors">
                          {dist.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          {allStates.find(s => s.id === dist.stateId)?.name || (dist as any).stateName || stateFilter} District
                        </span>
                      </div>
                      <span className="text-xl font-black font-mono text-cyan-400">
                        {distStudents.length}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span>Active Mentorships:</span>
                        <span className="text-emerald-400 font-bold">{distActive}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Pending Demands:</span>
                        <span className="text-amber-400 font-bold">{distPending}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Monthly Tuition GMV:</span>
                        <span className="text-white font-bold">₹{(totalDistrictFees / 1000).toFixed(0)}k</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playCyberSound('click');
                        setDistrictFilter(dist.name);
                        setViewMode('LEDGER');
                      }}
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 text-xs font-bold transition-all border border-slate-800 cursor-pointer text-center"
                    >
                      Filter District Ledger →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 6. SLIDE-OVER STUDENT CYBER DOSSIER DRAWER */}
      {selectedStudentForDossier && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 text-slate-950 font-black flex items-center justify-center text-base shadow-lg">
                  {selectedStudentForDossier.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    {selectedStudentForDossier.name}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                      {selectedStudentForDossier.rollNumber}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedStudentForDossier.grade} • {selectedStudentForDossier.localityName}, {selectedStudentForDossier.districtName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentForDossier(null)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Matrix in Drawer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleOpenCertificate(selectedStudentForDossier)}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 text-center transition-all cursor-pointer group"
              >
                <Award className="w-5 h-5 text-amber-400 mx-auto group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-slate-200 block mt-1.5">Official Certificate</span>
              </button>

              <button
                onClick={() => handleOpenIdCard(selectedStudentForDossier)}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 text-center transition-all cursor-pointer group"
              >
                <Smartphone className="w-5 h-5 text-purple-400 mx-auto group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-slate-200 block mt-1.5">Universal ID Card</span>
              </button>

              <button
                onClick={() => {
                  setSelectedStudentForTutorRealloc(selectedStudentForDossier);
                  setSelectedTutorId(selectedStudentForDossier.assignedTutorId || '');
                }}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-center transition-all cursor-pointer group"
              >
                <GraduationCap className="w-5 h-5 text-emerald-400 mx-auto group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-slate-200 block mt-1.5">Reassign Tutor</span>
              </button>

              <button
                onClick={() => handleOpenEditModal(selectedStudentForDossier)}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-center transition-all cursor-pointer group"
              >
                <Edit3 className="w-5 h-5 text-cyan-400 mx-auto group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-slate-200 block mt-1.5">Edit Profile</span>
              </button>
            </div>

            {/* Section 1: Personal & Family Credentials */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Personal & Family Credentials
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-mono text-[10px] block">PARENT / GUARDIAN:</span>
                  <p className="font-bold text-white mt-0.5">{selectedStudentForDossier.parentName} ({selectedStudentForDossier.parentRelation})</p>
                </div>
                <div>
                  <span className="text-slate-500 font-mono text-[10px] block">PARENT CONTACT:</span>
                  <p className="font-bold text-cyan-400 font-mono mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedStudentForDossier.parentPhone}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-mono text-[10px] block">STUDENT EMAIL:</span>
                  <p className="font-mono text-slate-300 mt-0.5">{selectedStudentForDossier.email}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-mono text-[10px] block">STUDENT MOBILE:</span>
                  <p className="font-mono text-slate-300 mt-0.5">{selectedStudentForDossier.mobile}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-500 font-mono text-[10px] block">RESIDENTIAL ADDRESS:</span>
                  <p className="font-medium text-slate-200 mt-0.5">{selectedStudentForDossier.address}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Assigned Educator & Session Schedule */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                Live 1-on-1 Educator Engagement
              </h4>
              {selectedStudentForDossier.assignedTutorName ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-white text-base">{selectedStudentForDossier.assignedTutorName}</p>
                      <p className="text-xs text-slate-400">{selectedStudentForDossier.assignedTutorSpecialization}</p>
                      <p className="text-[11px] font-mono text-cyan-400 mt-1">Phone: {selectedStudentForDossier.assignedTutorPhone}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                        {selectedStudentForDossier.tutorRating} ★ Rating
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-850 text-xs text-slate-300 space-y-1">
                    <p><strong className="text-slate-400 font-mono text-[10px]">SCHEDULE:</strong> {selectedStudentForDossier.schedule}</p>
                    <p><strong className="text-slate-400 font-mono text-[10px]">SUBJECTS:</strong> {selectedStudentForDossier.subjects.join(', ')}</p>
                    <p><strong className="text-slate-400 font-mono text-[10px]">LAST CLASS:</strong> {new Date(selectedStudentForDossier.lastSessionDate).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
                  No verified tutor currently allocated. Student request is placed in the priority allocation queue.
                </div>
              )}
            </div>

            {/* Section 3: Academic Telemetry & Scorecard */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                Academic Telemetry & Growth Index
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Attendance</span>
                  <span className="text-xl font-black text-emerald-400">{selectedStudentForDossier.attendanceRate}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Syllabus Vel</span>
                  <span className="text-xl font-black text-cyan-400">{selectedStudentForDossier.syllabusProgress}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Mock Test Avg</span>
                  <span className="text-xl font-black text-purple-400">{selectedStudentForDossier.averageScore}%</span>
                </div>
              </div>
            </div>

            {/* Section 4: Tuition Fee & Escrow Security */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4" />
                Tuition Fee & Escrow Compliance
              </h4>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Monthly Tuition Fee</span>
                  <span className="text-base font-black text-white">₹{selectedStudentForDossier.monthlyFee}/month</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] uppercase block">Escrow Protection</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedStudentForDossier.escrowSecured ? 'ACTIVE (SECURED)' : 'DIRECT SETTLEMENT'}
                  </span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                onClick={() => setSelectedStudentForDossier(null)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Sovereign Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. EMERGENCY TUTOR RE-ALLOCATION MODAL */}
      {selectedStudentForTutorRealloc && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">
                  Tutor Allotment & Re-Assignment Override
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentForTutorRealloc(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <p className="font-bold text-white">Student: {selectedStudentForTutorRealloc.name}</p>
              <p className="text-slate-400">Target: {selectedStudentForTutorRealloc.grade} • {selectedStudentForTutorRealloc.board} ({selectedStudentForTutorRealloc.districtName})</p>
              <p className="text-cyan-400 font-mono">Current Tutor: {selectedStudentForTutorRealloc.assignedTutorName || 'None'}</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono font-bold text-slate-300 block">
                SELECT FROM VERIFIED TEACHER REGISTRY:
              </label>
              <select
                value={selectedTutorId}
                onChange={e => setSelectedTutorId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="">-- Choose Verified Educator --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} • {t.highestQualification || t.degree} ({t.districtName || 'Pan-India'}) — Rating: {t.rating}★
                  </option>
                ))}
              </select>

              <label className="text-xs font-mono font-bold text-slate-300 block pt-1">
                SUPER ADMIN ALLOCATION AUDIT NOTES:
              </label>
              <textarea
                placeholder="Reason for tutor re-allocation or assignment notes..."
                value={reallocNotes}
                onChange={e => setReallocNotes(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedStudentForTutorRealloc(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReallocation}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Confirm Sovereign Allotment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MASTER PROFILE CORRECTION MODAL */}
      {selectedStudentForEdit && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-950 border border-cyan-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white">
                  Master Profile Sovereign Correction
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentForEdit(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-mono text-[10px] block mb-1">STUDENT FULL NAME:</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[10px] block mb-1">PARENT FULL NAME:</label>
                <input
                  type="text"
                  value={editForm.parentName || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, parentName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[10px] block mb-1">PARENT MOBILE NUMBER:</label>
                <input
                  type="text"
                  value={editForm.parentPhone || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, parentPhone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[10px] block mb-1">ACADEMIC GRADE:</label>
                <input
                  type="text"
                  value={editForm.grade || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, grade: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[10px] block mb-1">AFFILIATED BOARD:</label>
                <input
                  type="text"
                  value={editForm.board || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, board: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[10px] block mb-1">TARGET EXAM:</label>
                <input
                  type="text"
                  value={editForm.targetExam || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, targetExam: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[10px] block mb-1">MONTHLY TUITION FEE (₹):</label>
                <input
                  type="number"
                  value={editForm.monthlyFee || 0}
                  onChange={e => setEditForm(prev => ({ ...prev, monthlyFee: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[10px] block mb-1">ENROLLMENT STATUS:</label>
                <select
                  value={editForm.enrollmentStatus}
                  onChange={e => setEditForm(prev => ({ ...prev, enrollmentStatus: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="TRIAL_DEMO">TRIAL_DEMO</option>
                  <option value="PENDING_ALLOCATION">PENDING_ALLOCATION</option>
                  <option value="ON_HOLD">ON_HOLD</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-slate-400 font-mono text-[10px] block mb-1">COMPLETE RESIDENTIAL ADDRESS:</label>
                <input
                  type="text"
                  value={editForm.address || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium"
                />
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-800">
                <label className="text-amber-400 font-mono text-[10px] block mb-1 font-bold">
                  MANDATORY AUDIT NOTE / CORRECTION REASON:
                </label>
                <textarea
                  placeholder="Explain why this profile override is being performed..."
                  value={editAuditReason}
                  onChange={e => setEditAuditReason(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-amber-600/40 text-xs text-white placeholder-slate-500 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedStudentForEdit(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfileEdit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                Commit Override Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. DIRECT ONBOARDING WIZARD MODAL */}
      {isOnboardingModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-950 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Wizard Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-cyan-400" />
                  Direct Home Tuition Student Onboarding
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Step {onboardStep} of 3: {
                    onboardStep === 1 ? 'Personal & Location Identity' :
                    onboardStep === 2 ? 'Academic Goal & Curriculum' :
                    'Tuition Terms & Initial Educator Pairing'
                  }
                </p>
              </div>
              <button
                onClick={() => setIsOnboardingModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Pills */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
              <div className={`p-2 rounded-xl border ${onboardStep === 1 ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                1. Identity
              </div>
              <div className={`p-2 rounded-xl border ${onboardStep === 2 ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                2. Academics
              </div>
              <div className={`p-2 rounded-xl border ${onboardStep === 3 ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                3. Allotment
              </div>
            </div>

            {/* Step 1 Content */}
            {onboardStep === 1 && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-mono text-[10px] block mb-1">STUDENT NAME *</label>
                  <input
                    type="text"
                    placeholder="Full legal name"
                    value={newStudentForm.name}
                    onChange={e => setNewStudentForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono text-[10px] block mb-1">GENDER</label>
                  <select
                    value={newStudentForm.gender}
                    onChange={e => setNewStudentForm(prev => ({ ...prev, gender: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-mono text-[10px] block mb-1">PARENT / GUARDIAN NAME *</label>
                  <input
                    type="text"
                    placeholder="Father/Mother name"
                    value={newStudentForm.parentName}
                    onChange={e => setNewStudentForm(prev => ({ ...prev, parentName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono text-[10px] block mb-1">PARENT PHONE NUMBER *</label>
                  <input
                    type="text"
                    placeholder="10-digit mobile"
                    value={newStudentForm.parentPhone}
                    onChange={e => setNewStudentForm(prev => ({ ...prev, parentPhone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono text-[10px] block mb-1">STATE</label>
                  <select
                    value={newStudentForm.stateName}
                    onChange={e => setNewStudentForm(prev => ({ ...prev, stateName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  >
                    {allStates.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-mono text-[10px] block mb-1">DISTRICT</label>
                  <input
                    type="text"
                    value={newStudentForm.districtName}
                    onChange={e => setNewStudentForm(prev => ({ ...prev, districtName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-slate-400 font-mono text-[10px] block mb-1">RESIDENTIAL ADDRESS & PINCODE</label>
                  <input
                    type="text"
                    value={newStudentForm.address}
                    onChange={e => setNewStudentForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium"
                  />
                </div>
              </div>
            )}

            {/* Step 2 Content */}
            {onboardStep === 2 && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-mono text-[10px] block mb-1">ACADEMIC GRADE / LEVEL</label>
                  <select
                    value={newStudentForm.grade}
                    onChange={e => setNewStudentForm(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  >
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11 (Science PCM)">Class 11 (Science PCM)</option>
                    <option value="Class 11 (Science PCB)">Class 11 (Science PCB)</option>
                    <option value="Class 12 (Science PCM)">Class 12 (Science PCM)</option>
                    <option value="Class 12 (Commerce)">Class 12 (Commerce)</option>
                    <option value="Class 12 (Humanities)">Class 12 (Humanities)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-mono text-[10px] block mb-1">BOARD AFFILIATION</label>
                  <select
                    value={newStudentForm.board}
                    onChange={e => setNewStudentForm(prev => ({ ...prev, board: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE / ISC">ICSE / ISC</option>
                    <option value="UP Board">UP Board</option>
                    <option value="State Board">State Board</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-mono text-[10px] block mb-1">CURRENT SCHOOL NAME</label>
                  <input
                    type="text"
                    value={newStudentForm.schoolName}
                    onChange={e => setNewStudentForm(prev => ({ ...prev, schoolName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono text-[10px] block mb-1">TARGET COMPETITIVE EXAM</label>
                  <input
                    type="text"
                    value={newStudentForm.targetExam}
                    onChange={e => setNewStudentForm(prev => ({ ...prev, targetExam: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium"
                  />
                </div>
              </div>
            )}

            {/* Step 3 Content */}
            {onboardStep === 3 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-mono text-[10px] block mb-1">
                    ALLOT INITIAL EDUCATOR (OPTIONAL - LEAVE BLANK FOR QUEUE):
                  </label>
                  <select
                    value={newStudentForm.assignedTutorId}
                    onChange={e => setNewStudentForm(prev => ({ ...prev, assignedTutorId: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  >
                    <option value="">-- Place in Unallocated Queue --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.highestQualification}) - Rating: {t.rating}★
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 font-mono text-[10px] block mb-1">MONTHLY TUITION FEE (₹)</label>
                    <input
                      type="number"
                      value={newStudentForm.monthlyFee}
                      onChange={e => setNewStudentForm(prev => ({ ...prev, monthlyFee: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-mono text-[10px] block mb-1">SCHEDULE PREFERENCE</label>
                    <input
                      type="text"
                      value={newStudentForm.schedule}
                      onChange={e => setNewStudentForm(prev => ({ ...prev, schedule: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-850">
              {onboardStep > 1 ? (
                <button
                  onClick={() => setOnboardStep((onboardStep - 1) as any)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold hover:bg-slate-850 cursor-pointer"
                >
                  ← Previous Step
                </button>
              ) : <div />}

              {onboardStep < 3 ? (
                <button
                  onClick={() => setOnboardStep((onboardStep + 1) as any)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  onClick={handleCreateStudent}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  Complete Direct Onboarding
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 10. LIVE CANVAS CERTIFICATE MODAL */}
      {isCertModalOpen && certStudent && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-950 border border-amber-500/50 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  FocusPoint Sovereign Digital Home Tuition Certificate
                </h3>
              </div>
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Canvas Container */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 p-2 flex justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-xl shadow-2xl"
                style={{ width: '100%', maxHeight: '550px', objectFit: 'contain' }}
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-slate-400">
                Official Document ID: CERT-{certStudent.rollNumber} • SHA-256 Verified
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={downloadCertificatePNG}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download High-Res PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. UNIVERSAL ID CARD MODAL */}
      <UniversalIdCardModal
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
        cardData={idCardData}
      />

      {/* 12. EXPORT MODAL */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={filteredStudents}
        filename={`FocusPoint_Home_Tuition_Students_${Date.now()}`}
        title="Export Pan-India Home Tuition Learners"
      />
    </div>
  );
};

export default SuperAdminStudents;
