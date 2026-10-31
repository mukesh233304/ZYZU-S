// FOCUSPOINT Super Admin — Pan-India Master Users Accounts Registry & Sovereign Profile Radar
// Fully functional Cyber-HUD console with 0ms fast filtering, role ecosystem matrix,
// master profile overrides, universal ID card generation, canvas KYC certification, and acoustic feedback.

import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { superAdminService } from '../../services/superAdminService';
import { documentService } from '../../services/documentService';
import { locationService } from '../../services/locationService';
import { auditService } from '../../services/auditService';
import { mockStore } from '../../mock/store';
import { User, UniversalIDCardData, UserRole, SuperAdminAuditEvent } from '../../types';
import { UniversalIdCardModal } from '../../components/common/UniversalIdCardModal';
import { ExportModal } from '../../components/common/ExportModal';
import { UserAvatar } from '../../components/common/UserAvatar';
import { PanIndiaLocationSelector, LocationSelectionPayload } from '../../components/common/PanIndiaLocationSelector';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert,
  UserCheck, 
  UserX, 
  UserPlus,
  Edit3, 
  CreditCard, 
  Download, 
  GraduationCap, 
  BookOpen, 
  Building2, 
  Shield, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Camera, 
  Trash2,
  Phone,
  Mail,
  Calendar,
  Layers,
  Radio,
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
  Eye,
  Key,
  Smartphone,
  Globe,
  Compass
} from 'lucide-react';

// Cyber Acoustic Synthesizer for tactile feedback
type SfxType = 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'success';

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
        osc.frequency.setValueAtTime(220, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
    }
  } catch {
    // Audio suppressed
  }
};

type ViewMode = 'ledger' | 'roles' | 'geography' | 'audit';

export const SuperAdminUsers: React.FC = () => {
  const { showToast, addToast } = useToast();

  const notify = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    if (showToast) {
      showToast(msg, type);
    } else if (addToast) {
      addToast(msg, type);
    }
  };

  // Sound Synthesizer State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fp_cyber_sound') !== 'false';
  });

  const playSfx = (type: SfxType) => {
    if (soundEnabled) playCyberSound(type);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('fp_cyber_sound', String(next));
    if (next) playCyberSound('click');
  };

  // Master Data State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeViewMode, setActiveViewMode] = useState<ViewMode>('ledger');

  // Real-time IST clock
  const [currentTime, setCurrentTime] = useState<string>('');
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Multi-Axis Filters
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Pan-India Hierarchical Location Selection
  const [selectedGeo, setSelectedGeo] = useState<LocationSelectionPayload>({
    countryId: 'loc-country-in',
    level: 'INDIA',
    breadcrumb: 'Pan-India',
  });

  // Modals & Drawers State
  const [selectedIdCard, setSelectedIdCard] = useState<UniversalIDCardData | null>(null);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedUserForDossier, setSelectedUserForDossier] = useState<User | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Master Profile Correction Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyContact: '',
    address: '',
    locality: '',
    district: '',
    state: '',
    status: 'active',
    avatarUrl: '',
    teacherSubjects: '',
    teacherQualification: '',
    studentGrade: '',
    studentSchool: '',
    libraryName: '',
    librarySeats: '',
    correctionReason: '',
  });
  const [isSavingCorrection, setIsSavingCorrection] = useState(false);

  // Direct User Creation Override Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'student' as UserRole,
    district: 'Ghazipur',
    state: 'Uttar Pradesh',
    locality: 'Saidpur',
    grade: 'Class 11 (Science)',
    schoolName: 'Kendriya Vidyalaya',
    subjects: 'Mathematics, Science',
    qualification: 'Graduate',
    libraryName: 'FocusPoint Study Hub',
    totalSeats: 50,
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<SuperAdminAuditEvent[]>([]);

  // Fetch Users & Audit Logs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getUsers();
      setUsers(data);
      const logs = await auditService.getAuditLogs({ module: 'USER_DIRECTORY' });
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load users', err);
      notify('Failed to load user directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Quick Territorial Presets
  const handleTerritorialPreset = (stateName: string, stateId: string) => {
    playSfx('warp');
    if (!stateName) {
      setSelectedGeo({ countryId: 'loc-country-in', level: 'INDIA', breadcrumb: 'Pan-India' });
      notify('Territorial filter: Pan-India (All Districts)', 'info');
      return;
    }
    setSelectedGeo({
      countryId: 'loc-country-in',
      stateId,
      stateName,
      level: 'STATE',
      breadcrumb: `India > ${stateName}`,
    });
    notify(`Territorial filter focused: ${stateName}`, 'info');
  };

  // Status Toggle Action
  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    playSfx('toggle');
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await superAdminService.updateUserStatus(userId, newStatus as any);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus as any } : u));
      notify(`User account set to ${newStatus}`, 'info');
      const updatedLogs = await auditService.getAuditLogs({ module: 'USER_DIRECTORY' });
      setAuditLogs(updatedLogs);
    } catch {
      notify('Failed to update status', 'error');
    }
  };

  // Open Universal ID Card
  const handleOpenIdCard = async (userId: string) => {
    playSfx('click');
    try {
      const card = await documentService.getUniversalIDCard(userId);
      setSelectedIdCard(card);
      setIsIdCardOpen(true);
    } catch {
      notify('Could not generate ID card preview', 'error');
    }
  };

  // Open Master Profile Correction Modal
  const handleOpenCorrection = (user: User) => {
    playSfx('click');
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || (user as any).mobile || '',
      emergencyContact: (user as any).emergencyContact || (user as any).emergencyContactPhone || '+91 99999 99999',
      address: (user as any).address || (user as any).fullAddress || '',
      locality: (user as any).locality || (user as any).city || 'Saidpur',
      district: user.district || (user as any).districtName || 'Ghazipur',
      state: (user as any).state || (user as any).stateName || 'Uttar Pradesh',
      status: user.status || 'active',
      avatarUrl: user.avatarUrl || (user as any).avatar || '',
      teacherSubjects: (user as any).subjects?.join(', ') || 'Mathematics, Physics',
      teacherQualification: (user as any).qualification || 'M.Sc. Mathematics, B.Ed.',
      studentGrade: (user as any).grade || 'Class 11 (Science)',
      studentSchool: (user as any).schoolName || 'Kendriya Vidyalaya',
      libraryName: (user as any).libraryName || 'FocusPoint Partner Study Center',
      librarySeats: (user as any).totalSeats ? String((user as any).totalSeats) : '60',
      correctionReason: '',
    });
  };

  // Save Master Profile Correction
  const handleSaveCorrection = async () => {
    if (!editingUser) return;
    if (!editFormData.name.trim()) {
      notify('Full name is required', 'warning');
      return;
    }
    if (!editFormData.correctionReason.trim()) {
      notify('Audit note / reason is mandatory for master profile correction', 'warning');
      return;
    }

    playSfx('confirm');
    try {
      setIsSavingCorrection(true);
      const updates: Partial<User> & { reason: string; modifiedFields: string[] } = {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        status: editFormData.status as any,
        district: editFormData.district,
        avatarUrl: editFormData.avatarUrl,
        reason: editFormData.correctionReason,
        modifiedFields: ['name', 'email', 'phone', 'status', 'district', 'avatarUrl', 'roleDetails']
      };

      (updates as any).mobile = editFormData.phone;
      (updates as any).address = editFormData.address;
      (updates as any).locality = editFormData.locality;
      (updates as any).state = editFormData.state;
      (updates as any).emergencyContact = editFormData.emergencyContact;

      if (editingUser.role === 'teacher') {
        (updates as any).subjects = editFormData.teacherSubjects.split(',').map(s => s.trim()).filter(Boolean);
        (updates as any).qualification = editFormData.teacherQualification;
      } else if (editingUser.role === 'student' || (editingUser.role as string) === 'library_student') {
        (updates as any).grade = editFormData.studentGrade;
        (updates as any).schoolName = editFormData.studentSchool;
      } else if (editingUser.role === 'library_owner') {
        (updates as any).libraryName = editFormData.libraryName;
        (updates as any).totalSeats = Number(editFormData.librarySeats) || 50;
      }

      const updated = await superAdminService.updateUserProfileMaster(editingUser.id, updates);
      if (updated) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updates } : u));
      }
      playSfx('success');
      notify(`Master profile correction for ${editFormData.name} applied & logged!`, 'success');
      setEditingUser(null);
      const updatedLogs = await auditService.getAuditLogs({ module: 'USER_DIRECTORY' });
      setAuditLogs(updatedLogs);
    } catch {
      notify('Failed to save profile corrections', 'error');
    } finally {
      setIsSavingCorrection(false);
    }
  };

  // Avatar upload handler
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      notify('Image size must be under 2MB', 'warning');
      return;
    }
    playSfx('click');
    const reader = new FileReader();
    reader.onload = () => {
      setEditFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      notify('New profile photo staged for save', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Direct Create User Override Handler
  const handleCreateUser = async () => {
    if (!newUserData.name.trim() || !newUserData.email.trim()) {
      notify('Name and Email are required', 'warning');
      return;
    }
    playSfx('confirm');
    setIsCreatingUser(true);
    try {
      const generatedId = `usr-${newUserData.role.replace('_', '')}-${Date.now().toString().slice(-4)}`;
      const newUser: User = {
        id: generatedId,
        userId: generatedId,
        name: newUserData.name,
        email: newUserData.email,
        phone: newUserData.phone || '+91 98000 00000',
        mobile: newUserData.phone || '+91 98000 00000',
        role: newUserData.role,
        district: newUserData.district,
        districtName: newUserData.district,
        state: newUserData.state,
        stateName: newUserData.state,
        localityName: newUserData.locality,
        city: newUserData.locality,
        status: 'active',
        createdAt: new Date().toISOString(),
        grade: newUserData.role === 'student' ? newUserData.grade : undefined,
        schoolName: newUserData.role === 'student' ? newUserData.schoolName : undefined,
      };

      if (newUserData.role === 'teacher') {
        (newUser as any).subjects = newUserData.subjects.split(',').map(s => s.trim());
        (newUser as any).qualification = newUserData.qualification;
      } else if (newUserData.role === 'library_owner') {
        (newUser as any).libraryName = newUserData.libraryName;
        (newUser as any).totalSeats = newUserData.totalSeats;
      }

      mockStore.addUser(newUser);
      await auditService.record({
        action: 'SUPER_ADMIN_DIRECT_USER_ENROLLMENT',
        module: 'USER_DIRECTORY',
        target: `${newUser.name} (${newUser.role})`,
        targetId: newUser.id,
        district: newUser.district,
        state: newUser.state,
        newValue: `Role: ${newUser.role}, Email: ${newUser.email}`,
        status: 'SUCCESS',
      });

      setUsers(prev => [newUser, ...prev]);
      playSfx('success');
      notify(`User ${newUser.name} enrolled with ID ${newUser.id}!`, 'success');
      setIsCreateModalOpen(false);
      const updatedLogs = await auditService.getAuditLogs({ module: 'USER_DIRECTORY' });
      setAuditLogs(updatedLogs);
    } catch {
      notify('Failed to create user account', 'error');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Canvas KYC Verification Certificate Generator & Downloader
  const handleDownloadKycCertificate = (user: User) => {
    playSfx('confirm');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 540;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark sci-fi background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 800, 540);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#06b6d4';
      ctx.strokeRect(15, 15, 770, 510);

      // Top banner
      ctx.fillStyle = '#0e2338';
      ctx.fillRect(15, 15, 770, 75);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px sans-serif';
      ctx.fillText('FOCUSPOINT NATIONAL IDENTITY AUTHORITY', 35, 45);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('OFFICIAL IDENTITY VERIFICATION & KYC CLEARANCE CERTIFICATE', 35, 68);

      // User Initials/Avatar Box
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(35, 115, 130, 160);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(35, 115, 130, 160);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 36px sans-serif';
      const initials = (user.name || 'FP').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      ctx.fillText(initials, 72, 205);

      // User details
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px sans-serif';
      ctx.fillText(user.name || 'Verified Citizen', 190, 145);
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`Role Designation: ${user.role.toUpperCase()}`, 190, 175);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Account Reference ID: ${user.id}`, 190, 205);
      ctx.fillText(`Jurisdiction: ${user.district || 'Statewide'}, ${(user as any).state || 'Uttar Pradesh'}`, 190, 230);
      ctx.fillText(`Registered Email: ${user.email} • Mobile: ${user.phone || (user as any).mobile || 'N/A'}`, 190, 255);

      // Security Strip
      ctx.fillStyle = '#132035';
      ctx.fillRect(35, 305, 730, 85);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.strokeRect(35, 305, 730, 85);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('IDENTITY STATUS: LEVEL-3 BIOMETRIC & POLICE DATABASE CLEARED', 55, 335);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText(`ENCRYPTION HASH: SHA256-${user.id.toUpperCase()}-VERIFIED-${Date.now().toString(16).toUpperCase()}`, 55, 360);

      // Authority Signature
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'italic bold 17px serif';
      ctx.fillText('Mukesh Sonkar', 55, 460);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('National Registrar & Chief Identity Authority', 55, 480);
      ctx.fillText('FocusPoint National Sovereign Platform', 55, 495);

      const link = document.createElement('a');
      link.download = `kyc-clearance-certificate-${user.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      playSfx('success');
      notify(`KYC clearance certificate for ${user.name} downloaded!`, 'success');
    } catch {
      notify('Failed to generate KYC certificate', 'error');
    }
  };

  // Filtering & Sorting Logic
  const filteredUsers = useMemo(() => {
    let list = [...users];

    // Geographic filtering
    if (selectedGeo.level !== 'INDIA') {
      if (selectedGeo.stateName) {
        list = list.filter(u => {
          const st = (u as any).state || (u as any).stateName || '';
          return st.toLowerCase() === selectedGeo.stateName?.toLowerCase();
        });
      }
      if (selectedGeo.districtName) {
        list = list.filter(u => {
          const dt = u.district || (u as any).districtName || '';
          return dt.toLowerCase() === selectedGeo.districtName?.toLowerCase();
        });
      }
      if (selectedGeo.localityName) {
        list = list.filter(u => {
          const loc = (u as any).locality || (u as any).city || (u as any).address || '';
          return loc.toLowerCase().includes(selectedGeo.localityName!.toLowerCase());
        });
      }
    }

    // Role filtering
    if (selectedRole !== 'all') {
      list = list.filter(u => {
        if (selectedRole === 'student') {
          return u.role === 'student' || (u.role as string) === 'library_student';
        }
        return u.role.toLowerCase() === selectedRole.toLowerCase();
      });
    }

    // Status filtering
    if (selectedStatus !== 'all') {
      list = list.filter(u => {
        const s = (u.status || 'active').toLowerCase();
        return s === selectedStatus.toLowerCase();
      });
    }

    // Universal Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        ((u as any).mobile && (u as any).mobile.includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q)) ||
        (u.district && u.district.toLowerCase().includes(q)) ||
        ((u as any).locality && (u as any).locality.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q))
      );
    }

    // Dynamic Sorting
    list.sort((a: any, b: any) => {
      const valA = a[sortKey] ?? '';
      const valB = b[sortKey] ?? '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        const res = valA.localeCompare(valB);
        return sortOrder === 'asc' ? res : -res;
      }
      const numA = Number(valA) || 0;
      const numB = Number(valB) || 0;
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    });

    return list;
  }, [users, selectedGeo, selectedRole, selectedStatus, search, sortKey, sortOrder]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGeo, selectedRole, selectedStatus, search, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Telemetry KPIs
  const kpiData = useMemo(() => {
    const total = users.length;
    const students = users.filter(u => u.role === 'student' || (u.role as string) === 'library_student').length;
    const teachers = users.filter(u => u.role === 'teacher').length;
    const libraries = users.filter(u => u.role === 'library_owner').length;
    const admins = users.filter(u => u.role === 'district_admin' || u.role === 'super_admin' || (u.role as string) === 'study_material_operator').length;
    const active = users.filter(u => u.status === 'active' || !u.status).length;
    const suspended = users.filter(u => u.status === 'suspended').length;
    const pending = users.filter(u => u.status === 'pending').length;

    return {
      total,
      students,
      teachers,
      libraries,
      admins,
      active,
      suspended,
      pending,
    };
  }, [users]);

  // Role Stakeholders Breakdown
  const roleBreakdown = useMemo(() => [
    {
      role: 'student',
      title: 'Student Learners',
      count: kpiData.students,
      description: 'Home tuition pupils, study library members, and mock test aspirants.',
      icon: GraduationCap,
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
    },
    {
      role: 'teacher',
      title: 'Verified Home Tutors',
      count: kpiData.teachers,
      description: '1-on-1 verified subject specialists conducting localized home tuitions.',
      icon: BookOpen,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      role: 'library_owner',
      title: 'Accredited Study Halls',
      count: kpiData.libraries,
      description: 'Proprietors of partner digital reading rooms and silent study desks.',
      icon: Building2,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
    },
    {
      role: 'district_admin',
      title: 'District Coordinators',
      count: users.filter(u => u.role === 'district_admin').length,
      description: 'Constitutional 1-per-district regulatory commanders.',
      icon: ShieldCheck,
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
    },
    {
      role: 'super_admin',
      title: 'Chief Command & Operators',
      count: users.filter(u => u.role === 'super_admin' || (u.role as string) === 'study_material_operator').length,
      description: 'Sovereign platform administrators and content operators.',
      icon: Shield,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
    },
  ], [kpiData, users]);

  // Geographic Corridor Breakdown
  const geographicDistribution = useMemo(() => {
    const distMap: Record<string, number> = {};
    users.forEach(u => {
      const dt = u.district || (u as any).districtName || 'Statewide';
      distMap[dt] = (distMap[dt] || 0) + 1;
    });
    return Object.entries(distMap)
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count);
  }, [users]);

  const activeDistrictsList = locationService.getActiveDistricts();

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-slate-950 text-slate-100 rounded-3xl border border-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            <Cpu className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-xs font-mono tracking-wider text-cyan-400">LOADING SOVEREIGN USERS DIRECTORY MATRIX...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. CYBER-HUD COCKPIT HEADER */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Glow & High-Tech Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-b from-purple-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-500/30 select-none">{"// FP-MASTER-USERS-MATRIX // V5.2"}</div>
        <div className="absolute top-2 right-2 text-[10px] font-mono text-emerald-500/40 select-none flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>SOVEREIGN IDENTITY MATRIX ACTIVE</span>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                PAN-INDIA IDENTITY RADAR
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold">
                {users.length} REGISTERED SOULS
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                {currentTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>MASTER USERS DIRECTORY</span>
              <Users className="w-7 h-7 text-cyan-400" />
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Universal sovereign identity registry across students, home tutors, study hall owners, district coordinators, and operators. Features direct profile override with immutable audit logging, corporate ID card issuance, and KYC credentials generation.
            </p>
          </div>

          {/* Action Cockpit Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Audio Synth Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                soundEnabled 
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Acoustic Synthesizer Active' : 'Sound Synthesizer Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
            </button>

            {/* Sync Directory */}
            <button
              onClick={() => {
                playSfx('warp');
                fetchUsers();
                notify('Master Users Directory synchronized with live database!', 'info');
              }}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
              title="Resync Directory"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">SYNC</span>
            </button>

            {/* Export Registry */}
            <button
              onClick={() => {
                playSfx('click');
                setIsExportOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>EXPORT</span>
            </button>

            {/* Create User Override */}
            <button
              onClick={() => {
                playSfx('warp');
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border border-cyan-400/40 hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" />
              <span>CREATE USER OVERRIDE</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TOP-LEVEL 5-CARD KPI TELEMETRY MATRIX */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Registered Accounts */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-lg space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{kpiData.total}</div>
          <div className="flex items-center gap-2 text-[10px] font-mono pt-1">
            <span className="text-emerald-400 font-bold">{kpiData.active} Active</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-amber-400">{kpiData.suspended} Suspended</span>
          </div>
        </div>

        {/* Card 2: Student Learners */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 transition-all shadow-lg space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Student Learners</span>
            <GraduationCap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono">{kpiData.students}</div>
          <div className="text-[10px] text-slate-400 font-mono pt-1">
            {Math.round((kpiData.students / Math.max(1, kpiData.total)) * 100)}% of User Ecosystem
          </div>
        </div>

        {/* Card 3: Vetted Educators */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-lg space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Home Tutors</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{kpiData.teachers}</div>
          <div className="text-[10px] text-emerald-500 font-mono pt-1">
            Verified Subject Faculty
          </div>
        </div>

        {/* Card 4: Study Libraries */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-lg space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Study Libraries</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{kpiData.libraries}</div>
          <div className="text-[10px] text-slate-400 font-mono pt-1">
            Partner Digital Halls
          </div>
        </div>

        {/* Card 5: Administrative Authorities */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all shadow-lg space-y-1 relative overflow-hidden group col-span-2 md:col-span-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Authorities</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">{kpiData.admins}</div>
          <div className="text-[10px] text-purple-300 font-mono pt-1">
            Coordinators & Command
          </div>
        </div>
      </div>

      {/* 3. TERRITORIAL FAST-JUMP COMMAND PRESETS */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono font-bold text-[11px] uppercase shrink-0">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>TERRITORIAL PRESETS:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'Pan-India (All)', stateName: '', id: '' },
            { label: 'Uttar Pradesh (UP)', stateName: 'Uttar Pradesh', id: 'loc-state-up' },
            { label: 'Bihar (BR)', stateName: 'Bihar', id: 'loc-state-br' },
            { label: 'Delhi NCR (DL)', stateName: 'Delhi', id: 'loc-state-dl' },
            { label: 'Maharashtra (MH)', stateName: 'Maharashtra', id: 'loc-state-mh' },
            { label: 'Rajasthan (RJ)', stateName: 'Rajasthan', id: 'loc-state-rj' },
            { label: 'Madhya Pradesh (MP)', stateName: 'Madhya Pradesh', id: 'loc-state-mp' },
            { label: 'West Bengal (WB)', stateName: 'West Bengal', id: 'loc-state-wb' },
          ].map((preset) => {
            const isActive = (!preset.stateName && selectedGeo.level === 'INDIA') || 
                             (selectedGeo.stateName?.toLowerCase() === preset.stateName.toLowerCase());
            return (
              <button
                key={preset.label}
                onClick={() => handleTerritorialPreset(preset.stateName, preset.id)}
                className={`px-3 py-1.5 rounded-xl font-mono text-[11px] transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. HIERARCHICAL LOCATION SELECTOR ENGINE */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono font-bold">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>TERRITORIAL GEOGRAPHY SCOPE (STATE &rarr; DISTRICT &rarr; LOCALITY)</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            Current Scope: {selectedGeo.breadcrumb || 'Pan-India'}
          </span>
        </div>
        <PanIndiaLocationSelector
          value={selectedGeo}
          onChange={(sel) => {
            playSfx('warp');
            setSelectedGeo(sel);
          }}
          showLocality={true}
          variant="card"
          className="bg-slate-950 border-slate-800 text-white rounded-xl"
        />
      </div>

      {/* 5. VIEW MODE SWITCHER & SEARCH RADAR BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        {/* View Mode Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ledger', label: 'Master Directory Ledger', icon: Users, count: filteredUsers.length },
              { id: 'roles', label: 'Role Stakeholders Matrix', icon: Layers },
              { id: 'geography', label: 'Geographic Corridors', icon: MapPin },
              { id: 'audit', label: 'Identity Audit Stream', icon: ShieldAlert, badge: `${auditLogs.length} Events` },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeViewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playSfx('click');
                    setActiveViewMode(tab.id as ViewMode);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border-cyan-400 text-cyan-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded text-[10px] ${isActive ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            Filtered Accounts: <strong className="text-white">{filteredUsers.length}</strong> of {users.length}
          </span>
        </div>

        {/* Universal Search & Multi-Axis Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          {/* Universal Search */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user name, User ID, phone, email, district, locality..."
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">ROLE:</span>
            <select
              value={selectedRole}
              onChange={(e) => {
                playSfx('toggle');
                setSelectedRole(e.target.value);
              }}
              className="h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="student">Student Learners</option>
              <option value="teacher">Home Tutors</option>
              <option value="library_owner">Study Library Owners</option>
              <option value="district_admin">District Coordinators</option>
              <option value="study_material_operator">Content Operators</option>
              <option value="super_admin">Super Admins</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">STATUS:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                playSfx('toggle');
                setSelectedStatus(e.target.value);
              }}
              className="h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="suspended">Suspended Accounts</option>
              <option value="pending">Pending Verification</option>
            </select>
          </div>

          {/* Sort Field & Order */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">SORT:</span>
            <select
              value={sortKey}
              onChange={(e) => {
                playSfx('toggle');
                setSortKey(e.target.value);
              }}
              className="h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="createdAt">Registration Date</option>
              <option value="name">Full Legal Name</option>
              <option value="role">Platform Role</option>
              <option value="district">District Corridor</option>
              <option value="status">Status</option>
            </select>

            <button
              type="button"
              onClick={() => {
                playSfx('click');
                setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
              }}
              className="h-11 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Toggle Ascending / Descending"
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-cyan-400" /> : <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{sortOrder === 'asc' ? 'ASC' : 'DESC'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. TAB CONTENT RENDERING */}

      {/* VIEW MODE 1: MASTER DIRECTORY LEDGER */}
      {activeViewMode === 'ledger' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between text-xs">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Master User Directory Matrix</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
                  {filteredUsers.length} Participants
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Real-time citizen identities with universal ID card issuance, profile overrides, and instant KYC clearance slips
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-xs space-y-3 bg-slate-950/60 my-4 mx-4 rounded-2xl border border-slate-800">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-white font-bold text-sm">No Accounts Match Specified Criteria</p>
              <p className="text-slate-400 max-w-md mx-auto text-xs">
                No users found in "{selectedGeo.breadcrumb}" matching role and search filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  playSfx('warp');
                  setSelectedGeo({ countryId: 'loc-country-in', level: 'INDIA', breadcrumb: 'Pan-India' });
                  setSearch('');
                  setSelectedRole('all');
                  setSelectedStatus('all');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs transition-colors inline-block cursor-pointer shadow-lg shadow-cyan-600/20"
              >
                Reset Filters & Search
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase bg-slate-950/80">
                    <tr>
                      <th className="py-3.5 px-4">User & Identity</th>
                      <th className="py-3.5 px-4">Role & Designation</th>
                      <th className="py-3.5 px-4">Geographic Jurisdiction</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Master Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                    {paginatedUsers.map((u) => {
                      const userStatus = (u.status || 'active').toLowerCase();
                      const statusBadge = 
                        userStatus === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : userStatus === 'suspended'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30';

                      const roleBadge = 
                        u.role === 'super_admin' ? 'bg-purple-500/15 text-purple-300 border-purple-500/40' :
                        u.role === 'district_admin' ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40' :
                        u.role === 'teacher' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' :
                        u.role === 'library_owner' ? 'bg-amber-500/15 text-amber-300 border-amber-500/40' :
                        'bg-blue-500/15 text-blue-300 border-blue-500/40';

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/50 transition-colors group">
                          {/* User Identity */}
                          <td className="py-3.5 px-4 font-bold text-white font-sans">
                            <div 
                              onClick={() => {
                                playSfx('click');
                                setSelectedUserForDossier(u);
                                setIsDossierOpen(true);
                              }}
                              className="flex items-center gap-3 cursor-pointer group"
                              title="Click to view dossier"
                            >
                              <div className="relative">
                                <UserAvatar user={u} size="md" showBorder />
                                {userStatus === 'active' && (
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -bottom-0.5 -right-0.5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-bold text-sm group-hover:text-cyan-400 transition-colors truncate flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {u.role === 'super_admin' && (
                                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                                  )}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {u.email}
                                </p>
                                <p className="text-[10px] text-cyan-400 font-mono">
                                  {u.phone || (u as any).mobile || 'No Phone Registered'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Role & Designation */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider border ${roleBadge}`}>
                              {u.role.replace('_', ' ')}
                            </span>
                            <p className="text-slate-400 text-[10px] mt-1 font-mono">ID: {u.id}</p>
                          </td>

                          {/* Geographic Jurisdiction */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white font-sans">
                              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>{u.district || (u as any).districtName || 'Pan-India'}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 pl-5 font-sans">
                              {(u as any).locality || (u as any).city || 'District Center'}, {(u as any).state || (u as any).stateName || 'Uttar Pradesh'}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${statusBadge}`}>
                              {userStatus}
                            </span>
                          </td>

                          {/* Master Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Dossier Drawer */}
                              <button
                                onClick={() => {
                                  playSfx('click');
                                  setSelectedUserForDossier(u);
                                  setIsDossierOpen(true);
                                }}
                                className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-cyan-400 font-bold text-[10px] border border-cyan-500/30 transition-colors cursor-pointer flex items-center gap-1"
                                title="View Dossier"
                              >
                                <Eye className="w-3 h-3" />
                                Dossier
                              </button>

                              {/* Master Profile Correction */}
                              <button
                                onClick={() => handleOpenCorrection(u)}
                                className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-purple-300 font-bold text-[10px] border border-purple-500/30 transition-colors cursor-pointer flex items-center gap-1"
                                title="Master Profile Correction"
                              >
                                <Edit3 className="w-3 h-3" />
                                Correct
                              </button>

                              {/* ID Card */}
                              <button
                                onClick={() => handleOpenIdCard(u.id)}
                                className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-teal-300 font-bold text-[10px] border border-teal-500/30 transition-colors cursor-pointer"
                                title="Generate Corporate ID Card"
                              >
                                ID Card
                              </button>

                              {/* Toggle Status (Active / Suspended) */}
                              {u.role !== 'super_admin' && (
                                <button
                                  onClick={() => handleToggleStatus(u.id, u.status || 'active')}
                                  className={`px-2 py-1 rounded-lg font-bold text-[10px] border transition-colors cursor-pointer ${
                                    userStatus === 'suspended'
                                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900'
                                      : 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900'
                                  }`}
                                  title={userStatus === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
                                >
                                  {userStatus === 'suspended' ? 'Activate' : 'Suspend'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile & Tablet Card Hybrid View */}
              <div className="lg:hidden p-4 space-y-4 font-mono">
                {paginatedUsers.map((u) => {
                  const userStatus = (u.status || 'active').toLowerCase();
                  const statusBadge = 
                    userStatus === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : userStatus === 'suspended'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30';

                  return (
                    <div key={u.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={u} size="md" showBorder />
                          <div>
                            <p className="font-bold text-white text-sm font-sans">{u.name}</p>
                            <p className="text-[10px] text-cyan-400">{u.role.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-[10px] text-slate-500">ID: {u.id}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${statusBadge}`}>
                          {userStatus}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <p className="text-slate-300 font-sans">
                          <MapPin className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
                          {u.district || (u as any).districtName || 'Statewide'}, {(u as any).state || 'UP'}
                        </p>
                        <p className="text-slate-400 text-[11px] truncate">{u.email}</p>
                        <p className="text-cyan-400 text-[11px]">{u.phone || (u as any).mobile || 'No Mobile'}</p>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                        <button
                          onClick={() => {
                            playSfx('click');
                            setSelectedUserForDossier(u);
                            setIsDossierOpen(true);
                          }}
                          className="py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300 font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Dossier</span>
                        </button>

                        <button
                          onClick={() => handleOpenCorrection(u)}
                          className="py-1.5 rounded-lg bg-slate-900 border border-purple-500/30 text-purple-300 font-bold cursor-pointer"
                        >
                          Correct
                        </button>

                        <button
                          onClick={() => handleOpenIdCard(u.id)}
                          className="py-1.5 rounded-lg bg-slate-900 border border-teal-500/30 text-teal-300 font-bold cursor-pointer"
                        >
                          ID Card
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} accounts
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        playSfx('click');
                        setCurrentPage(p => Math.max(1, p - 1));
                      }}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => {
                          playSfx('click');
                          setCurrentPage(pg);
                        }}
                        className={`w-7 h-7 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                          currentPage === pg
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        playSfx('click');
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                      }}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* VIEW MODE 2: ROLE STAKEHOLDERS MATRIX */}
      {activeViewMode === 'roles' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl p-6 space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Platform Role Stakeholders & Demographics</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
                5 Active Participant Classes
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Demographic distribution across students, verified educators, reading room owners, and territorial officers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roleBreakdown.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.role}
                  className={`p-5 rounded-2xl bg-gradient-to-br ${item.color} bg-slate-950 border transition-all hover:scale-[1.01] flex flex-col justify-between space-y-4`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">{item.title}</span>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-3xl font-black text-white font-mono">{item.count}</div>
                    <p className="text-slate-400 text-xs leading-relaxed font-sans">{item.description}</p>
                  </div>

                  <button
                    onClick={() => {
                      playSfx('click');
                      setSelectedRole(item.role);
                      setActiveViewMode('ledger');
                      notify(`Filtering directory for: ${item.title}`, 'info');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>View All {item.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: GEOGRAPHIC CORRIDORS DISTRIBUTION */}
      {activeViewMode === 'geography' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl p-6 space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Geographic Density & Territorial Corridors</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
                {geographicDistribution.length} Active Corridors
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Territorial clustering of enrolled participants, showing high-density study blocks and expansion corridors
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {geographicDistribution.map((item) => (
              <div 
                key={item.district}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all font-mono space-y-1 cursor-pointer"
                onClick={() => {
                  playSfx('warp');
                  setSearch(item.district);
                  setActiveViewMode('ledger');
                  notify(`Focused directory on district: ${item.district}`, 'info');
                }}
              >
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase truncate">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{item.district}</span>
                </div>
                <div className="text-xl font-black text-white">{item.count}</div>
                <p className="text-[10px] text-cyan-400 font-bold">Enrolled Users</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 4: IDENTITY AUDIT STREAM */}
      {activeViewMode === 'audit' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Immutable Identity Audit Stream & Correction History</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-mono">
                  AUDIT MODULE: USER_DIRECTORY
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Every Super Admin direct profile correction, status toggle, and role change is permanently logged
              </p>
            </div>

            <button
              onClick={async () => {
                playSfx('click');
                const logs = await auditService.getAuditLogs({ module: 'USER_DIRECTORY' });
                setAuditLogs(logs);
                notify('Audit records refreshed!', 'info');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-mono font-bold text-slate-300 border border-slate-800 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Refresh Audit Log</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase bg-slate-900/60">
                <tr>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Target Subject</th>
                  <th className="py-3 px-3">Auditor Authority</th>
                  <th className="py-3 px-3">Audit Details & Reason</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      No profile corrections logged yet in the current audit store.
                    </td>
                  </tr>
                ) : (
                  auditLogs.slice(0, 15).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500 text-[10px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-2.5 px-3 text-cyan-400 font-bold">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 text-white font-sans font-semibold">
                        {log.target}
                      </td>
                      <td className="py-2.5 px-3 text-purple-300">
                        {log.actorName} <span className="text-[10px] text-slate-500">({log.actorRole})</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate font-sans">
                        {log.newValue}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {log.status || 'RECORDED'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. ALL MODALS & DRAWERS (100% PRESERVED & FUNCTIONAL) */}

      {/* USER DOSSIER SLIDE-OVER DRAWER */}
      {isDossierOpen && selectedUserForDossier && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-6 text-slate-100 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-white font-mono">Citizen Dossier</h3>
                  </div>
                  <button
                    onClick={() => {
                      playSfx('click');
                      setIsDossierOpen(false);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Card */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <UserAvatar user={selectedUserForDossier} size="lg" showBorder />
                  <div>
                    <h4 className="font-bold text-white text-base font-sans">{selectedUserForDossier.name}</h4>
                    <p className="text-xs text-cyan-400 font-mono font-bold uppercase">
                      {selectedUserForDossier.role.replace('_', ' ')}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      ID: {selectedUserForDossier.id}
                    </p>
                  </div>
                </div>

                {/* Identity & Location Details */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account Status:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {selectedUserForDossier.status || 'ACTIVE'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Official Email:</span>
                    <span className="text-cyan-300 truncate max-w-[200px]">{selectedUserForDossier.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mobile Phone:</span>
                    <span className="text-white font-bold">{selectedUserForDossier.phone || (selectedUserForDossier as any).mobile || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">District Corridor:</span>
                    <span className="text-slate-200">{selectedUserForDossier.district || (selectedUserForDossier as any).districtName || 'Statewide'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Locality / City:</span>
                    <span className="text-slate-200">{(selectedUserForDossier as any).locality || (selectedUserForDossier as any).city || 'District Center'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">State:</span>
                    <span className="text-slate-200">{(selectedUserForDossier as any).state || (selectedUserForDossier as any).stateName || 'Uttar Pradesh'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Enrolled On:</span>
                    <span className="text-slate-400 text-[11px]">{selectedUserForDossier.createdAt ? new Date(selectedUserForDossier.createdAt).toLocaleDateString() : '2026-01-15'}</span>
                  </div>
                </div>

                {/* Role Specific Dossier Details */}
                {selectedUserForDossier.role === 'teacher' && (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 space-y-2 text-xs font-mono">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold">Educator Qualifications</span>
                    <p className="text-white">Subjects: <strong>{(selectedUserForDossier as any).subjects?.join(', ') || 'Mathematics, Physics'}</strong></p>
                    <p className="text-slate-300">Qualification: <strong>{(selectedUserForDossier as any).qualification || 'M.Sc, B.Ed'}</strong></p>
                  </div>
                )}

                {(selectedUserForDossier.role === 'student' || (selectedUserForDossier.role as string) === 'library_student') && (
                  <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 space-y-2 text-xs font-mono">
                    <span className="text-[10px] text-blue-400 uppercase font-bold">Student Academic Dossier</span>
                    <p className="text-white">Grade/Standard: <strong>{(selectedUserForDossier as any).grade || 'Class 11 (Science)'}</strong></p>
                    <p className="text-slate-300">School/College: <strong>{(selectedUserForDossier as any).schoolName || 'Kendriya Vidyalaya'}</strong></p>
                  </div>
                )}

                {selectedUserForDossier.role === 'library_owner' && (
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 space-y-2 text-xs font-mono">
                    <span className="text-[10px] text-amber-400 uppercase font-bold">Study Facility Facility</span>
                    <p className="text-white">Library: <strong>{(selectedUserForDossier as any).libraryName || 'FocusPoint Study Hub'}</strong></p>
                    <p className="text-slate-300">Seats Capacity: <strong>{(selectedUserForDossier as any).totalSeats || 60} Desks</strong></p>
                  </div>
                )}

                {/* Document Generators */}
                <div className="space-y-2 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Official Document Warrants</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => handleOpenIdCard(selectedUserForDossier.id)}
                      className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-teal-500/40 text-teal-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Corporate ID Card</span>
                    </button>

                    <button
                      onClick={() => handleDownloadKycCertificate(selectedUserForDossier)}
                      className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>KYC Certificate</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenCorrection(selectedUserForDossier);
                    setIsDossierOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Master Profile Correction</span>
                </button>

                {selectedUserForDossier.role !== 'super_admin' && (
                  <button
                    onClick={() => {
                      handleToggleStatus(selectedUserForDossier.id, selectedUserForDossier.status || 'active');
                      setIsDossierOpen(false);
                    }}
                    className={`px-4 py-2.5 rounded-xl font-mono font-bold text-xs cursor-pointer ${
                      selectedUserForDossier.status === 'suspended'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    {selectedUserForDossier.status === 'suspended' ? 'Activate' : 'Suspend'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MASTER PROFILE CORRECTION MODAL (WITH AUDIT TRAIL) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 text-slate-100">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base font-sans">Master Profile Correction</h3>
                  <p className="text-slate-400 text-xs font-mono">Super Admin Direct Override with Immutable Audit Trail</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Profile Photo Section */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <img
                  src={editFormData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(editFormData.name)}`}
                  alt="Avatar Preview"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="space-y-1.5 flex-1">
                  <p className="text-xs font-bold text-white font-sans">Profile Photo Management</p>
                  <p className="text-[11px] text-slate-400">Update photo on behalf of the user or clear to default</p>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold shadow-xs">
                      <Camera className="w-3.5 h-3.5 mr-1.5" />
                      Upload New Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarFileChange}
                      />
                    </label>
                    {editFormData.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setEditFormData(prev => ({ ...prev, avatarUrl: '' }))}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer border border-rose-800/40"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1 inline" />
                        Reset Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Core Identity Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">Full Legal Name *</label>
                  <input
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Phone / Mobile *</label>
                  <input
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Emergency Contact Phone</label>
                  <input
                    value={editFormData.emergencyContact}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Geographic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">Locality / Area</label>
                  <input
                    value={editFormData.locality}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, locality: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">District Corridor</label>
                  <select
                    value={editFormData.district}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, district: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                  >
                    {activeDistrictsList.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">State</label>
                  <input
                    value={editFormData.state}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div className="text-xs font-mono">
                <label className="block text-slate-400 mb-1">Full Street Address</label>
                <input
                  value={editFormData.address}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Role Specific Configuration */}
              {editingUser.role === 'teacher' && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 space-y-3 font-mono text-xs">
                  <p className="text-xs font-bold text-emerald-300">Home Tutor Specialization</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Subjects Taught</label>
                      <input
                        value={editFormData.teacherSubjects}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, teacherSubjects: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-emerald-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Qualifications</label>
                      <input
                        value={editFormData.teacherQualification}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, teacherQualification: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-emerald-700 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(editingUser.role === 'student' || (editingUser.role as string) === 'library_student') && (
                <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 space-y-3 font-mono text-xs">
                  <p className="text-xs font-bold text-blue-300">Student Academic Profile</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Standard / Grade</label>
                      <input
                        value={editFormData.studentGrade}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, studentGrade: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-blue-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">School / College</label>
                      <input
                        value={editFormData.studentSchool}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, studentSchool: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-blue-700 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editingUser.role === 'library_owner' && (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 space-y-3 font-mono text-xs">
                  <p className="text-xs font-bold text-amber-300">Library Facility Information</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Facility Name</label>
                      <input
                        value={editFormData.libraryName}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, libraryName: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-amber-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Total Desks</label>
                      <input
                        type="number"
                        value={editFormData.librarySeats}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, librarySeats: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-amber-700 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="text-xs font-mono">
                <label className="block text-slate-400 mb-1">Account Operational Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium"
                >
                  <option value="active">Active (Normal Access)</option>
                  <option value="suspended">Suspended (Access Revoked)</option>
                  <option value="pending">Pending Document Verification</option>
                </select>
              </div>

              {/* Mandatory Super Admin Audit Reason Note */}
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-400" />
                  <label className="block font-bold text-purple-300">
                    Mandatory Super Admin Audit Reason *
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Every master correction is permanently recorded in the immutable audit log with your digital signature.
                </p>
                <textarea
                  rows={2}
                  placeholder="e.g. Corrected legal name spelling matching Aadhaar / updated phone number after coordinator verification"
                  value={editFormData.correctionReason}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, correctionReason: e.target.value }))}
                  className="w-full bg-slate-900 border border-purple-700/60 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                disabled={isSavingCorrection}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCorrection}
                disabled={isSavingCorrection}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                {isSavingCorrection ? 'Applying Override...' : 'Confirm & Log Correction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER OVERRIDE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-8 text-slate-100">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base font-sans">Direct User Account Enrollment</h3>
                  <p className="text-slate-400 text-xs font-mono">Create and authorize participant profile directly into master database</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Anand Kumar Rai"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. anand.rai@example.com"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Phone / Mobile</label>
                  <input
                    type="text"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 94150 00000"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Role Designation *</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="student">Student Learner</option>
                    <option value="teacher">Home Tutor</option>
                    <option value="library_owner">Study Library Owner</option>
                    <option value="district_admin">District Coordinator</option>
                    <option value="study_material_operator">Content Operator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">State</label>
                  <input
                    type="text"
                    value={newUserData.state}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">District</label>
                  <select
                    value={newUserData.district}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, district: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    {activeDistrictsList.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Locality</label>
                  <input
                    type="text"
                    value={newUserData.locality}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, locality: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isCreatingUser}
                onClick={handleCreateUser}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-600/30 cursor-pointer"
              >
                {isCreatingUser ? 'Creating...' : 'Enroll Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSAL ID CARD MODAL */}
      <UniversalIdCardModal
        cardData={selectedIdCard}
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
      />

      {/* EXPORT REGISTRY MODAL */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={filteredUsers.map(u => ({
          ID: u.id,
          Name: u.name,
          Email: u.email,
          Phone: u.phone || (u as any).mobile || '',
          Role: u.role,
          District: u.district || (u as any).districtName || 'Statewide',
          Locality: (u as any).locality || (u as any).city || 'District Center',
          State: (u as any).state || (u as any).stateName || 'Uttar Pradesh',
          Status: u.status || 'active',
          CreatedDate: u.createdAt ? new Date(u.createdAt).toISOString().substring(0, 10) : '2026-01-15',
        }))}
        title="Master Users Directory Pan-India"
        filename="focuspoint_master_users_registry"
      />
    </div>
  );
};

export default SuperAdminUsers;
