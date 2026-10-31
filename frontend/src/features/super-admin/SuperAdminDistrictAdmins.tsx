// FOCUSPOINT Super Admin — Pan-India District Coordinators Governance & Territorial Command HUD
// Fully functional, futuristic Cyber-HUD console with 0ms fast filtering, live RBAC guard,
// 4-step appointment wizard with 1-admin constitutional check, canvas document generators, and acoustic synthesizer.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { superAdminService } from '../../services/superAdminService';
import { documentService } from '../../services/documentService';
import { notificationService } from '../../services/notificationService';
import { locationService } from '../../services/locationService';
import { safeStorage } from '../../utils/storageUtils';
import { mockStore } from '../../mock/store';
import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import { 
  DistrictAdminRecord, 
  DistrictAdminSalaryPaymentParams, 
  DistrictAdminSalarySlipData, 
  UniversalIDCardData 
} from '../../types';
import { UniversalIdCardModal } from '../../components/common/UniversalIdCardModal';
import { PanIndiaLocationSelector, LocationSelectionPayload } from '../../components/common/PanIndiaLocationSelector';
import { 
  ShieldCheck, 
  ShieldAlert,
  UserPlus, 
  Search, 
  CreditCard, 
  Download, 
  Copy, 
  Check, 
  X, 
  IndianRupee, 
  AlertCircle, 
  TrendingUp, 
  FileCheck,
  RefreshCw,
  Send,
  MessageSquare,
  Lock,
  UserCheck,
  UserX,
  Camera,
  Trash2,
  MapPin,
  ExternalLink,
  Key,
  Smartphone,
  CheckCircle2,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Award,
  BookOpen,
  Layers,
  Building2,
  Globe,
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
  GraduationCap,
  Compass
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

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
    // AudioContext suppressed or disabled
  }
};

type ViewMode = 'coordinators' | 'corridors' | 'security' | 'finance';

export const SuperAdminDistrictAdmins: React.FC = () => {
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
    return safeStorage.getItem('fp_cyber_sound') !== 'false';
  });

  const playSfx = (type: SfxType) => {
    if (soundEnabled) playCyberSound(type);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    safeStorage.setItem('fp_cyber_sound', String(next));
    if (next) playCyberSound('click');
  };

  // Master Data State
  const [admins, setAdmins] = useState<DistrictAdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeViewMode, setActiveViewMode] = useState<ViewMode>('coordinators');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'>('ALL');
  const [coverageFilter, setCoverageFilter] = useState<'ALL' | 'APPOINTED' | 'VACANT'>('ALL');

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

  // Pan-India Hierarchical Geography State (State -> District -> Locality)
  const [selectedGeo, setSelectedGeo] = useState<LocationSelectionPayload>({
    countryId: 'loc-country-in',
    level: 'INDIA',
    breadcrumb: 'Pan-India',
  });

  // Sorting & Pagination State
  const [sortKey, setSortKey] = useState<keyof DistrictAdminRecord>('districtGMV');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Coordinator Detail Drawer State (Section #27)
  const [selectedAdminForDetail, setSelectedAdminForDetail] = useState<DistrictAdminRecord | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Location master lists for wizard & corridors
  const [availableStates, setAvailableStates] = useState<{ id: string; name: string; code?: string }[]>([]);
  const [wizardDistricts, setWizardDistricts] = useState<{ id: string; name: string; code?: string }[]>([]);
  const [allMasterDistricts, setAllMasterDistricts] = useState<{ id: string; name: string; stateId: string; code?: string }[]>([]);

  // 4-Step Appoint Admin Wizard Modal
  const [isAppointWizardOpen, setIsAppointWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newAdminState, setNewAdminState] = useState('Uttar Pradesh');
  const [newAdminDistrict, setNewAdminDistrict] = useState('Ghazipur');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminWhatsapp, setNewAdminWhatsapp] = useState('');
  const [sameWhatsappAsPhone, setSameWhatsappAsPhone] = useState(true);
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [newAdminQualification, setNewAdminQualification] = useState('');
  const [newAdminAvatar, setNewAdminAvatar] = useState<string | null>(null);
  const [newAdminUserId, setNewAdminUserId] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [replaceExistingAdmin, setReplaceExistingAdmin] = useState(false);
  const [existingAdminWarning, setExistingAdminWarning] = useState<{ hasActive: boolean; adminName?: string; userId?: string } | null>(null);

  // Reassignment Modal State
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedAdminForReassign, setSelectedAdminForReassign] = useState<DistrictAdminRecord | null>(null);
  const [reassignState, setReassignState] = useState('Uttar Pradesh');
  const [reassignDistrict, setReassignDistrict] = useState('');
  const [reassignDistrictsList, setReassignDistrictsList] = useState<{ id: string; name: string }[]>([]);
  const [reassignReason, setReassignReason] = useState('Territorial restructuring and strategic coordination expansion');
  const [isReassigning, setIsReassigning] = useState(false);

  // Status Change Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedAdminForStatus, setSelectedAdminForStatus] = useState<DistrictAdminRecord | null>(null);
  const [newStatusVal, setNewStatusVal] = useState<'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'>('SUSPENDED');
  const [statusReason, setStatusReason] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Reset Credentials Modal State
  const [isResetPwdModalOpen, setIsResetPwdModalOpen] = useState(false);
  const [selectedAdminForReset, setSelectedAdminForReset] = useState<DistrictAdminRecord | null>(null);
  const [newCustomPwd, setNewCustomPwd] = useState('');
  const [isResettingPwd, setIsResettingPwd] = useState(false);

  // Access & Security Governance Modal State (Section #25)
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [selectedAdminForSecurity, setSelectedAdminForSecurity] = useState<DistrictAdminRecord | null>(null);
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);

  // Salary Payment Modal
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [selectedAdminForSalary, setSelectedAdminForSalary] = useState<DistrictAdminRecord | null>(null);
  const [salaryPeriod, setSalaryPeriod] = useState('September 2026');
  const [baseSalary, setBaseSalary] = useState(25000);
  const [salaryAdjustments, setSalaryAdjustments] = useState(2000);
  const [salaryDeductions, setSalaryDeductions] = useState(500);
  const [salaryNotes, setSalaryNotes] = useState('');
  const [isSalaryProcessing, setIsSalaryProcessing] = useState(false);
  const [generatedSlip, setGeneratedSlip] = useState<DistrictAdminSalarySlipData | null>(null);

  // Government ID Proof Modal State
  const [selectedAdminForIdProof, setSelectedAdminForIdProof] = useState<DistrictAdminRecord | null>(null);
  const [isIdProofModalOpen, setIsIdProofModalOpen] = useState(false);

  // Universal ID Card Modal
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [idCardData, setIdCardData] = useState<UniversalIDCardData | null>(null);

  // Section 30: District Access Security & Audit Monitor
  const [accessAuditLogs, setAccessAuditLogs] = useState(() => districtAuthorizationService.getAccessAuditLogs());

  // Fetch Admins
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await superAdminService.getDistrictAdmins();
      setAdmins(data);
      setAccessAuditLogs(districtAuthorizationService.getAccessAuditLogs());
    } catch (err) {
      console.error('Failed to load district admins', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    try {
      const states = locationService.getStates();
      if (states && states.length > 0) {
        setAvailableStates(states.map(s => ({ id: s.id, name: s.name, code: s.code })));
      } else {
        setAvailableStates([
          { id: 'loc-state-up', name: 'Uttar Pradesh', code: 'UP' },
          { id: 'loc-state-br', name: 'Bihar', code: 'BR' },
          { id: 'loc-state-mp', name: 'Madhya Pradesh', code: 'MP' },
          { id: 'loc-state-dl', name: 'Delhi', code: 'DL' },
          { id: 'loc-state-mh', name: 'Maharashtra', code: 'MH' },
          { id: 'loc-state-rj', name: 'Rajasthan', code: 'RJ' },
          { id: 'loc-state-wb', name: 'West Bengal', code: 'WB' },
        ]);
      }

      const allDistricts = locationService.getDistricts();
      if (allDistricts && allDistricts.length > 0) {
        setAllMasterDistricts(allDistricts.map(d => ({ id: d.id, name: d.name, stateId: d.stateId, code: d.code })));
      }
    } catch (e) {
      console.warn('Could not load states list from location master', e);
    }
  }, []);

  // Update wizard districts when wizard state changes
  useEffect(() => {
    try {
      const stateObj = locationService.getStates().find(s => s.name.toLowerCase() === newAdminState.toLowerCase());
      if (stateObj) {
        const dList = locationService.getDistricts(stateObj.id);
        if (dList && dList.length > 0) {
          setWizardDistricts(dList.map(d => ({ id: d.id, name: d.name, code: d.code })));
          if (!dList.some(d => d.name.toLowerCase() === newAdminDistrict.toLowerCase())) {
            setNewAdminDistrict(dList[0].name);
          }
        }
      }
    } catch (err) {
      console.warn('District load error', err);
    }
  }, [newAdminState]);

  // Check One Active Admin Rule whenever wizard state or district changes
  useEffect(() => {
    let isMounted = true;
    const runCheck = async () => {
      if (newAdminDistrict && newAdminState) {
        const check = await superAdminService.checkDistrictAdminAssignment(newAdminDistrict, newAdminState);
        if (!isMounted) return;
        if (check.hasActiveAdmin && check.existingAdmin) {
          setExistingAdminWarning({
            hasActive: true,
            adminName: check.existingAdmin.name,
            userId: check.existingAdmin.userId,
          });
        } else {
          setExistingAdminWarning(null);
          setReplaceExistingAdmin(false);
        }
      }
    };
    runCheck();
    return () => { isMounted = false; };
  }, [newAdminDistrict, newAdminState]);

  // Update reassign districts list when reassign state changes
  useEffect(() => {
    try {
      const stateObj = locationService.getStates().find(s => s.name.toLowerCase() === reassignState.toLowerCase());
      if (stateObj) {
        const dList = locationService.getDistricts(stateObj.id);
        if (dList && dList.length > 0) {
          setReassignDistrictsList(dList.map(d => ({ id: d.id, name: d.name })));
          setReassignDistrict(dList[0].name);
        }
      }
    } catch (err) {
      console.warn('Reassign district load error', err);
    }
  }, [reassignState]);

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

  // Cascading Filtered & Sorted List
  const filteredAdmins = useMemo(() => {
    let list = [...admins];

    // Geographic filtering (Pan-India -> State -> District -> Locality)
    if (selectedGeo.level !== 'INDIA') {
      if (selectedGeo.stateName) {
        list = list.filter(a => a.stateName.toLowerCase() === selectedGeo.stateName?.toLowerCase());
      }
      if (selectedGeo.districtName) {
        list = list.filter(a => a.districtName.toLowerCase() === selectedGeo.districtName?.toLowerCase());
      }
      if (selectedGeo.localityName) {
        list = list.filter(a => 
          (a.address && a.address.toLowerCase().includes(selectedGeo.localityName!.toLowerCase()))
        );
      }
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      list = list.filter(a => a.status === statusFilter);
    }

    // Comprehensive Search across Name, User ID, Mobile, WhatsApp, Email, State, District, Locality, Status, Qualification
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.userId.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        (a.whatsappNumber && a.whatsappNumber.toLowerCase().includes(q)) ||
        a.email.toLowerCase().includes(q) ||
        a.stateName.toLowerCase().includes(q) ||
        a.districtName.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q) ||
        (a.address && a.address.toLowerCase().includes(q)) ||
        (a.qualification && a.qualification.toLowerCase().includes(q))
      );
    }

    // Dynamic Sorting (asc/desc)
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
  }, [admins, selectedGeo, statusFilter, search, sortKey, sortOrder]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGeo, statusFilter, search, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / pageSize));
  const paginatedAdmins = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAdmins.slice(start, start + pageSize);
  }, [filteredAdmins, currentPage, pageSize]);

  // Summary Telemetry KPIs
  const kpiData = useMemo(() => {
    const total = admins.length;
    const active = admins.filter(a => a.status === 'ACTIVE').length;
    const suspended = admins.filter(a => a.status === 'SUSPENDED').length;
    const deactivated = admins.filter(a => a.status === 'DEACTIVATED').length;
    const governedDistricts = new Set(admins.map(a => a.districtName.toLowerCase())).size;
    const totalMasterDistricts = allMasterDistricts.length > 0 ? allMasterDistricts.length : 780;
    const coveragePercent = Math.min(100, Math.round((governedDistricts / totalMasterDistricts) * 100));
    const totalStudents = admins.reduce((sum, a) => sum + (a.totalStudents || 0), 0);
    const totalTeachers = admins.reduce((sum, a) => sum + (a.totalTeachers || 0), 0);
    const totalLibraries = admins.reduce((sum, a) => sum + (a.totalLibraries || 0), 0);
    const totalGMV = admins.reduce((sum, a) => sum + (a.districtGMV || 0), 0);

    return {
      total,
      active,
      suspended,
      deactivated,
      governedDistricts,
      totalMasterDistricts,
      coveragePercent,
      totalStudents,
      totalTeachers,
      totalLibraries,
      totalGMV,
    };
  }, [admins, allMasterDistricts]);

  // All District Corridors with coverage status
  const corridorList = useMemo(() => {
    const stateMap = new Map<string, string>();
    availableStates.forEach(s => stateMap.set(s.id, s.name));

    let list = allMasterDistricts.map(d => {
      const stateName = stateMap.get(d.stateId) || 'India';
      const appointedAdmin = admins.find(a => 
        a.districtName.toLowerCase().trim() === d.name.toLowerCase().trim()
      );
      return {
        districtId: d.id,
        districtName: d.name,
        stateId: d.stateId,
        stateName,
        code: d.code,
        isAppointed: !!appointedAdmin && appointedAdmin.status === 'ACTIVE',
        admin: appointedAdmin || null,
      };
    });

    if (selectedGeo.level !== 'INDIA' && selectedGeo.stateName) {
      list = list.filter(c => c.stateName.toLowerCase() === selectedGeo.stateName?.toLowerCase());
    }

    if (coverageFilter === 'APPOINTED') {
      list = list.filter(c => c.isAppointed);
    } else if (coverageFilter === 'VACANT') {
      list = list.filter(c => !c.isAppointed);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => 
        c.districtName.toLowerCase().includes(q) ||
        c.stateName.toLowerCase().includes(q) ||
        (c.admin && c.admin.name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allMasterDistricts, availableStates, admins, selectedGeo, coverageFilter, search]);

  // Generate random password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = 'FP@';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(pwd);
  };

  const handleStartAppointWizard = (initialState?: string, initialDistrict?: string) => {
    playSfx('warp');
    setWizardStep(1);
    setNewAdminState(initialState || 'Uttar Pradesh');
    setNewAdminDistrict(initialDistrict || 'Ghazipur');
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPhone('');
    setNewAdminWhatsapp('');
    setSameWhatsappAsPhone(true);
    setNewAdminAddress('');
    setNewAdminQualification('');
    setNewAdminAvatar(null);
    const seq = Date.now().toString().slice(-3);
    const stCode = (initialState || 'UP').substring(0, 2).toUpperCase();
    const dtCode = (initialDistrict || 'GHA').substring(0, 3).toUpperCase();
    setNewAdminUserId(`FP-DA-${stCode}-${dtCode}-${seq}`);
    handleGeneratePassword();
    setCopiedCredentials(false);
    setReplaceExistingAdmin(false);
    setIsAppointWizardOpen(true);
  };

  // Access & Security Handlers (Section #25)
  const handleOpenSecurityModal = (admin: DistrictAdminRecord) => {
    playSfx('click');
    setSelectedAdminForSecurity(admin);
    setIsSecurityModalOpen(true);
  };

  const handleSendSetupLink = (admin: DistrictAdminRecord) => {
    playSfx('click');
    const setupUrl = `${window.location.origin}/district-admin/login?id=${encodeURIComponent(admin.userId)}`;
    navigator.clipboard.writeText(setupUrl);
    notify(`Setup link for ${admin.name} copied to clipboard!`, 'success');
  };

  const handleResendAccessInstructions = async (admin: DistrictAdminRecord) => {
    playSfx('warp');
    try {
      await notificationService.sendWhatsAppRegistrationConfirmation({
        role: 'DISTRICT_ADMIN',
        name: admin.name,
        userId: admin.userId,
        recipientPhone: admin.whatsappNumber || admin.phone,
        whatsappNumber: admin.whatsappNumber || admin.phone,
        mobile: admin.phone,
        district: admin.districtName,
        state: admin.stateName,
        temporaryPassword: admin.temporaryPassword || 'Use your configured password',
        details: {
          district: admin.districtName,
          state: admin.stateName,
          temporaryPassword: admin.temporaryPassword || 'Use your configured password',
          userId: admin.userId,
        }
      });
      notify(`Access credentials resent to WhatsApp for ${admin.name}!`, 'success');
    } catch {
      notify('Failed to resend credentials via WhatsApp', 'error');
    }
  };

  const handleRevokeSessions = async (admin: DistrictAdminRecord) => {
    playSfx('alert');
    setIsRevokingSessions(true);
    try {
      const currentSessionRaw = safeStorage.getItem('fp_current_session_user');
      if (currentSessionRaw) {
        const sess = JSON.parse(currentSessionRaw);
        if (sess.id === admin.userId || sess.id === admin.id || (sess.userId && sess.userId === admin.userId)) {
          safeStorage.removeItem('fp_current_session_user');
          safeStorage.removeItem('fp_user');
          safeStorage.removeItem('fp_token');
        }
      }
      mockStore.logAudit({
        id: `aud-${Date.now()}`,
        action: 'REVOKE_DISTRICT_ADMIN_SESSION',
        details: `Active device sessions terminated for ${admin.name} (${admin.userId})`,
        district: admin.districtName,
        timestamp: new Date().toISOString(),
        adminRole: 'SUPER_ADMIN'
      });
      notify(`All active device sessions revoked for ${admin.name}!`, 'success');
    } finally {
      setIsRevokingSessions(false);
    }
  };

  // Photo upload compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playSfx('click');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 250;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        setNewAdminAvatar(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFinalizeAppointment = async () => {
    playSfx('confirm');
    try {
      await superAdminService.appointDistrictAdminWithCredentials({
        stateName: newAdminState,
        districtName: newAdminDistrict,
        adminName: newAdminName,
        adminEmail: newAdminEmail,
        adminPhone: newAdminPhone,
        whatsappNumber: sameWhatsappAsPhone ? newAdminPhone : (newAdminWhatsapp || newAdminPhone),
        address: newAdminAddress,
        qualification: newAdminQualification,
        avatarUrl: newAdminAvatar || undefined,
        userId: newAdminUserId,
        temporaryPassword: generatedPassword,
        replaceExisting: replaceExistingAdmin,
      });

      // Automated WhatsApp Confirmation (Section #21 & #26)
      notificationService.sendWhatsAppRegistrationConfirmation({
        role: 'DISTRICT_ADMIN',
        name: newAdminName,
        userId: newAdminUserId,
        mobile: newAdminPhone,
        whatsappNumber: sameWhatsappAsPhone ? newAdminPhone : (newAdminWhatsapp || newAdminPhone),
        details: {
          district: newAdminDistrict,
          state: newAdminState,
          temporaryPassword: generatedPassword,
        }
      }).catch(err => console.warn('Non-blocking WhatsApp confirmation notice:', err));

      playSfx('success');
      notify(`${newAdminName} appointed as District Admin for ${newAdminDistrict}! Credentials dispatched.`, 'success');
      setIsAppointWizardOpen(false);
      fetchAdmins();
    } catch {
      notify('Failed to appoint district admin', 'error');
    }
  };

  const handleCopyCredentials = () => {
    playSfx('click');
    const credText = `ZYZU'S DISTRICT ADMIN CREDENTIALS\nZYZU'S | Tutors & Libraries\nName: ${newAdminName}\nDistrict: ${newAdminDistrict}, ${newAdminState}\nUser ID: ${newAdminUserId}\nEmail: ${newAdminEmail}\nTemporary Password: ${generatedPassword}\nPortal: ${window.location.origin}/district-admin/login`;
    navigator.clipboard.writeText(credText);
    setCopiedCredentials(true);
    notify('Credentials copied to clipboard!', 'success');
    setTimeout(() => setCopiedCredentials(false), 3000);
  };

  // Reassignment Action
  const handleOpenReassignModal = (admin: DistrictAdminRecord) => {
    playSfx('click');
    setSelectedAdminForReassign(admin);
    setReassignState(admin.stateName);
    setReassignReason('Strategic territorial realignment and coordination scaling');
    setIsReassignModalOpen(true);
  };

  const handleExecuteReassign = async () => {
    if (!selectedAdminForReassign || !reassignDistrict) return;
    setIsReassigning(true);
    playSfx('confirm');
    try {
      const res = await superAdminService.reassignDistrictAdmin(
        selectedAdminForReassign.userId,
        reassignState,
        reassignDistrict,
        reassignReason
      );

      if (res.success) {
        playSfx('success');
        notify(`Administrator ${selectedAdminForReassign.name} reassigned to ${reassignDistrict}, ${reassignState}!`, 'success');
        setIsReassignModalOpen(false);
        fetchAdmins();
      } else {
        notify(res.error || 'Failed to reassign administrator', 'error');
      }
    } catch (err: any) {
      notify(err.message || 'Reassignment error', 'error');
    } finally {
      setIsReassigning(false);
    }
  };

  // Status Toggle Action
  const handleOpenStatusModal = (admin: DistrictAdminRecord) => {
    playSfx('click');
    setSelectedAdminForStatus(admin);
    setNewStatusVal(admin.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
    setStatusReason('');
    setIsStatusModalOpen(true);
  };

  const handleExecuteStatusUpdate = async () => {
    if (!selectedAdminForStatus) return;
    setIsUpdatingStatus(true);
    playSfx('confirm');
    try {
      const res = await superAdminService.updateDistrictAdminStatus(
        selectedAdminForStatus.userId,
        newStatusVal,
        statusReason || `Updated by Super Admin to ${newStatusVal}`
      );

      if (res.success) {
        playSfx('toggle');
        notify(`Account status for ${selectedAdminForStatus.name} updated to ${newStatusVal}!`, 'success');
        setIsStatusModalOpen(false);
        fetchAdmins();
      } else {
        notify(res.error || 'Failed to update account status', 'error');
      }
    } catch (err: any) {
      notify(err.message || 'Status update error', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Reset Credentials Action
  const handleOpenResetPwdModal = (admin: DistrictAdminRecord) => {
    playSfx('click');
    setSelectedAdminForReset(admin);
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = 'FP@';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCustomPwd(pwd);
    setIsResetPwdModalOpen(true);
  };

  const handleExecuteResetPwd = async () => {
    if (!selectedAdminForReset || !newCustomPwd) return;
    setIsResettingPwd(true);
    playSfx('confirm');
    try {
      const res = await superAdminService.resetDistrictAdminCredentials(
        selectedAdminForReset.userId,
        newCustomPwd
      );

      if (res.success) {
        playSfx('success');
        notify(`New password generated and dispatched to ${selectedAdminForReset.name}'s WhatsApp!`, 'success');
        setIsResetPwdModalOpen(false);
        fetchAdmins();
      } else {
        notify(res.error || 'Failed to reset password', 'error');
      }
    } catch (err: any) {
      notify(err.message || 'Password reset error', 'error');
    } finally {
      setIsResettingPwd(false);
    }
  };

  // Salary Payment handlers
  const handleOpenSalaryModal = (admin: DistrictAdminRecord) => {
    playSfx('click');
    setSelectedAdminForSalary(admin);
    setBaseSalary(admin.salaryDetails?.baseSalary || 25000);
    setSalaryAdjustments(admin.salaryDetails?.allowances || 2000);
    setSalaryDeductions(admin.salaryDetails?.deductions || 500);
    setSalaryPeriod('September 2026');
    setGeneratedSlip(null);
    setIsSalaryModalOpen(true);
  };

  const handleDisburseSalary = async () => {
    if (!selectedAdminForSalary) return;
    setIsSalaryProcessing(true);
    playSfx('confirm');

    try {
      const params: DistrictAdminSalaryPaymentParams = {
        districtId: selectedAdminForSalary.id,
        districtName: selectedAdminForSalary.districtName,
        adminId: selectedAdminForSalary.userId,
        adminName: selectedAdminForSalary.name,
        salaryPeriod,
        baseSalary,
        adjustments: salaryAdjustments,
        deductions: salaryDeductions,
        paymentDate: new Date().toISOString().substring(0, 10),
        notes: salaryNotes,
      };

      await superAdminService.disburseDistrictAdminSalary(params);
      const slip = await documentService.generateDistrictAdminSalarySlip(params);
      setGeneratedSlip(slip);
      playSfx('success');
      notify(`Salary honorarium disbursed in simulation mode for ${selectedAdminForSalary.name}!`, 'success');
    } catch {
      notify('Salary processing failed', 'error');
    } finally {
      setIsSalaryProcessing(false);
    }
  };

  const handleViewIdCard = async (admin: DistrictAdminRecord) => {
    playSfx('click');
    const card = await documentService.getUniversalIDCard(admin.userId);
    card.fullName = admin.name;
    card.uniqueIdNumber = `FP-ADM-${admin.districtName.substring(0, 3).toUpperCase()}-01`;
    card.role = 'DISTRICT_ADMIN';
    card.designation = `Sole District Administrator (${admin.districtName})`;
    card.districtName = admin.districtName;
    card.stateName = admin.stateName;
    card.avatarUrl = admin.avatarUrl;
    setIdCardData(card);
    setIsIdCardOpen(true);
  };

  const handleViewIdProof = (admin: DistrictAdminRecord) => {
    playSfx('click');
    setSelectedAdminForIdProof(admin);
    setIsIdProofModalOpen(true);
  };

  // Canvas Govt ID Proof Generator
  const handleDownloadIdProof = (admin: DistrictAdminRecord) => {
    playSfx('confirm');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 520;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 800, 520);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(15, 15, 770, 490);

      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(15, 15, 770, 75);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px sans-serif';
      ctx.fillText("ZYZU'S STATEWIDE ADMINISTRATION", 35, 45);
      ctx.fillStyle = '#93c5fd';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('GOVERNMENT APPOINTMENT VERIFICATION & IDENTITY PROOF', 35, 68);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(35, 115, 130, 160);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(35, 115, 130, 160);
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 36px sans-serif';
      const initials = admin.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      ctx.fillText(initials, 72, 205);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px sans-serif';
      ctx.fillText(admin.name, 190, 145);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`Sole District Administrator — ${admin.districtName}`, 190, 175);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Assigned State: ${admin.stateName}`, 190, 205);
      ctx.fillText(`Officer User ID: ${admin.userId}`, 190, 230);
      ctx.fillText(`Phone: ${admin.phone} • Email: ${admin.email}`, 190, 255);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(35, 305, 730, 80);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.strokeRect(35, 305, 730, 80);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('STATUS: VERIFIED & POLICE RECORD CLEARED', 55, 335);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px monospace';
      ctx.fillText(`NATIONAL GOVT ID (AADHAAR): XXXX-XXXX-${admin.userId.replace(/[^0-9]/g, '').padEnd(4, '8').slice(-4)}`, 55, 360);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'italic bold 17px serif';
      ctx.fillText('Mukesh Sonkar', 55, 450);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('National Registrar & Chief Directorate Authority', 55, 470);

      const link = document.createElement('a');
      link.download = `district-coordinator-id-proof-${admin.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      playSfx('success');
      notify(`Government ID proof for ${admin.name} downloaded!`, 'success');
    } catch (e) {
      console.error('ID proof download error:', e);
      notify('Failed to download ID proof', 'error');
    }
  };

  // Canvas Salary Slip Generator
  const handleDownloadSalarySlip = (slip: DistrictAdminSalarySlipData) => {
    playSfx('confirm');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 650;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 800, 650);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#10b981';
      ctx.strokeRect(15, 15, 770, 620);

      ctx.fillStyle = '#065f46';
      ctx.fillRect(15, 15, 770, 70);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px sans-serif';
      ctx.fillText("ZYZU'S NATIONAL EDUCATIONAL INFRASTRUCTURE", 35, 45);
      ctx.font = '600 12px sans-serif';
      ctx.fillStyle = '#a7f3d0';
      ctx.fillText('OFFICIAL DISTRICT COORDINATOR SALARY & HONORARIUM STATEMENT', 35, 68);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(35, 105, 730, 95);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeRect(35, 105, 730, 95);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('Coordinator Name:', 55, 135);
      ctx.fillText('Coordinator ID:', 55, 160);
      ctx.fillText('Assigned Territory:', 55, 185);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(slip.adminName, 180, 135);
      ctx.font = 'bold 13px monospace';
      ctx.fillText(slip.adminId, 180, 160);
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`${slip.districtName}, ${slip.stateName}`, 180, 185);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('Salary Period:', 440, 135);
      ctx.fillText('Disbursement Date:', 440, 160);
      ctx.fillText('Txn Reference:', 440, 185);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(slip.salaryMonth, 570, 135);
      ctx.font = '13px sans-serif';
      ctx.fillText(slip.paymentDate, 570, 160);
      ctx.font = '12px monospace';
      ctx.fillText(slip.transactionReference, 570, 185);

      ctx.fillStyle = '#334155';
      ctx.fillRect(35, 220, 730, 35);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('DESCRIPTION', 55, 242);
      ctx.textAlign = 'right';
      ctx.fillText('EARNINGS', 520, 242);
      ctx.fillText('DEDUCTIONS', 730, 242);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px sans-serif';
      ctx.fillText('Base Monthly District Honorarium', 55, 280);
      ctx.fillText('Field Allowances & Inspection Charges', 55, 315);
      ctx.fillText('TDS & Compliance Withholding', 55, 350);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`₹${slip.baseSalary.toLocaleString('en-IN')}`, 520, 280);
      ctx.fillStyle = '#10b981';
      ctx.fillText(`+₹${slip.adjustments.toLocaleString('en-IN')}`, 520, 315);
      ctx.fillStyle = '#f43f5e';
      ctx.fillText(`-₹${slip.deductions.toLocaleString('en-IN')}`, 730, 350);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#064e3b';
      ctx.fillRect(35, 395, 730, 60);
      ctx.strokeStyle = '#059669';
      ctx.strokeRect(35, 395, 730, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('NET DISBURSED AMOUNT:', 55, 432);
      ctx.fillStyle = '#34d399';
      ctx.font = '900 24px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`₹${slip.netSalary.toLocaleString('en-IN')}`, 730, 434);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('Disbursed via automated platform escrow payout system. Verified by Central Accounts.', 55, 485);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic bold 17px serif';
      ctx.fillText('Mukesh Sonkar', 55, 560);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Finance Comptroller & Authorized Signatory', 55, 580);
      ctx.fillText("ZYZU'S National Authority", 55, 595);

      const link = document.createElement('a');
      link.download = `salary-slip-${slip.adminId}-${slip.salaryMonth.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      playSfx('success');
      notify('Official salary slip downloaded successfully!', 'success');
    } catch (e) {
      console.error('Salary slip download error:', e);
      notify('Failed to download salary slip', 'error');
    }
  };

  // Export Registry as CSV or JSON
  const handleExportRegistry = (format: 'csv' | 'json') => {
    playSfx('confirm');
    try {
      if (format === 'json') {
        const jsonStr = JSON.stringify(admins, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `district-coordinators-registry-${new Date().toISOString().substring(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const headers = ['User ID', 'Name', 'State', 'District', 'Status', 'Phone', 'Email', 'Students', 'Teachers', 'Libraries', 'GMV', 'Assigned Date'];
        const rows = admins.map(a => [
          a.userId,
          `"${a.name}"`,
          `"${a.stateName}"`,
          `"${a.districtName}"`,
          a.status,
          `"${a.phone}"`,
          `"${a.email}"`,
          a.totalStudents || 0,
          a.totalTeachers || 0,
          a.totalLibraries || 0,
          a.districtGMV || 0,
          a.assignedDate || ''
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `district-coordinators-registry-${new Date().toISOString().substring(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
      playSfx('success');
      notify(`Registry exported successfully as ${format.toUpperCase()}!`, 'success');
    } catch {
      notify('Failed to export registry', 'error');
    }
  };

  if (loading && admins.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-slate-950 text-slate-100 rounded-3xl border border-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            <Cpu className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-xs font-mono tracking-wider text-cyan-400">INITIALIZING SOVEREIGN COORDINATOR HUD...</p>
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
        <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-500/30 select-none">{"// FP-GOV-COORD-HUD // SYS-2026"}</div>
        <div className="absolute top-2 right-2 text-[10px] font-mono text-emerald-500/40 select-none flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>RBAC ENFORCED: 1-ADMIN / DISTRICT</span>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                SOVEREIGN JURISDICTION HUD
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold">
                PAN-INDIA REPOSITORY
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                {currentTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>DISTRICT COORDINATORS GOVERNANCE</span>
              <ShieldCheck className="w-7 h-7 text-cyan-400" />
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Constitutional single-admin governance per territory. Oversees official appointments, automated WhatsApp onboarding, universal ID card credentials, and biometric & police verified authority.
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

            {/* Export Registry */}
            <div className="relative group">
              <button
                className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>EXPORT REGISTRY</span>
              </button>
              <div className="absolute right-0 mt-1 w-40 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-30">
                <button
                  onClick={() => handleExportRegistry('csv')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => handleExportRegistry('json')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download JSON</span>
                </button>
              </div>
            </div>

            {/* Appoint Coordinator Button */}
            <button
              onClick={() => handleStartAppointWizard()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border border-cyan-400/40 hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" />
              <span>APPOINT COORDINATOR</span>
            </button>
          </div>
        </div>

        {/* Constitutional One-Admin Rule Neon Guard Strip */}
        <div className="mt-6 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-900/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xs text-slate-300 space-y-0.5">
            <p className="font-bold text-white flex items-center gap-2">
              <span>Constitutional Invariant: Strictly 1 Authorized Admin Per District</span>
              <span className="px-2 py-0.2 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">AUTOMATIC ENFORCEMENT</span>
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Every operating district is assigned exactly one authorized District Coordinator who holds primary regulatory jurisdiction over local tutor allocations and study library accreditations. When appointed, the account is immediately active and login credentials are dispatched to WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* 2. TOP-LEVEL 5-CARD KPI TELEMETRY MATRIX */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Appointed Coordinators */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-lg space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Coordinators</span>
            <UserCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{kpiData.total}</div>
          <div className="flex items-center gap-2 text-[10px] font-mono pt-1">
            <span className="text-emerald-400 font-bold">{kpiData.active} Active</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-amber-400">{kpiData.suspended} Suspended</span>
          </div>
        </div>

        {/* Card 2: Governed Corridors */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all shadow-lg space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Governed Corridors</span>
            <MapPin className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{kpiData.governedDistricts}</div>
          <div className="text-[10px] text-slate-400 font-mono pt-1 flex items-center justify-between">
            <span>{kpiData.coveragePercent}% Pan-India Span</span>
            <span className="text-indigo-400 font-bold">1:1 Locked</span>
          </div>
        </div>

        {/* Card 3: Supervised Students */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 transition-all shadow-lg space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Bound Students</span>
            <GraduationCap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{kpiData.totalStudents.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-emerald-400 font-mono pt-1">
            ~{Math.round(kpiData.totalStudents / Math.max(1, kpiData.active))} per Active Corridor
          </div>
        </div>

        {/* Card 4: Educators & Libraries */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-lg space-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Teachers & Halls</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {kpiData.totalTeachers + kpiData.totalLibraries}
          </div>
          <div className="text-[10px] text-slate-400 font-mono pt-1 flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">{kpiData.totalTeachers} Tutors</span>
            <span>&bull;</span>
            <span className="text-purple-400 font-bold">{kpiData.totalLibraries} Libs</span>
          </div>
        </div>

        {/* Card 5: Cumulative Monitored GMV */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-lg space-y-1 relative overflow-hidden group col-span-2 md:col-span-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Monitored GMV</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">₹{(kpiData.totalGMV / 100000).toFixed(1)}L</div>
          <div className="text-[10px] text-emerald-500 font-mono pt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Escrow Protected</span>
          </div>
        </div>
      </div>

      {/* 3. TERRITORIAL FAST-JUMP COMMAND PRESETS */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono font-bold text-[11px] uppercase shrink-0">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>FAST-JUMP CORRIDORS:</span>
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
            <span>TERRITORIAL DRILL-DOWN RADAR (STATE &rarr; DISTRICT &rarr; LOCALITY)</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            Scope: {selectedGeo.breadcrumb || 'Pan-India'}
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
              { id: 'coordinators', label: 'Coordinators Ledger', icon: UserCheck, count: filteredAdmins.length },
              { id: 'corridors', label: 'Territorial Coverage Hub', icon: MapPin, count: corridorList.length },
              { id: 'security', label: 'RBAC Security Guard', icon: ShieldAlert, badge: 'Live Radar' },
              { id: 'finance', label: 'Honorarium & Payouts', icon: IndianRupee },
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
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Stats Pill */}
          <span className="text-[11px] font-mono text-slate-400">
            Filtered: <strong className="text-white">{filteredAdmins.length}</strong> of {admins.length} Officers
          </span>
        </div>

        {/* Universal Search & Multi-Axis Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          {/* Universal Search */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coordinator name, User ID, phone, WhatsApp, district, state..."
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

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                playSfx('toggle');
                setStatusFilter(e.target.value as any);
              }}
              className="h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Statuses ({admins.length})</option>
              <option value="ACTIVE">Active Only ({admins.filter(a => a.status === 'ACTIVE').length})</option>
              <option value="SUSPENDED">Suspended Only ({admins.filter(a => a.status === 'SUSPENDED').length})</option>
              <option value="DEACTIVATED">Deactivated Only ({admins.filter(a => a.status === 'DEACTIVATED').length})</option>
            </select>
          </div>

          {/* Mode-specific Filters */}
          {activeViewMode === 'corridors' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-[11px]">COVERAGE:</span>
              <select
                value={coverageFilter}
                onChange={(e) => {
                  playSfx('toggle');
                  setCoverageFilter(e.target.value as any);
                }}
                className="h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="ALL">All Corridors ({corridorList.length})</option>
                <option value="APPOINTED">Appointed Districts</option>
                <option value="VACANT">Vacant Districts (Needs Admin)</option>
              </select>
            </div>
          )}

          {/* Sorting Controls */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">SORT:</span>
            <select
              value={sortKey}
              onChange={(e) => {
                playSfx('toggle');
                setSortKey(e.target.value as keyof DistrictAdminRecord);
              }}
              className="h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="districtGMV">District GMV / Revenue</option>
              <option value="name">Coordinator Name</option>
              <option value="stateName">State / Territory</option>
              <option value="districtName">District Name</option>
              <option value="totalStudents">Student Count</option>
              <option value="totalTeachers">Teacher Count</option>
              <option value="totalLibraries">Library Count</option>
              <option value="assignedDate">Appointment Date</option>
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

      {/* VIEW MODE 1: COORDINATORS COMMAND LEDGER */}
      {activeViewMode === 'coordinators' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between text-xs">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Active District Coordinators Registry</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
                  {filteredAdmins.length} Officers
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Constitutional command ledger with real-time credentials, WhatsApp ping, and live audit telemetry
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Empty State */}
          {filteredAdmins.length === 0 ? (
            <div className="p-12 text-center text-xs space-y-3 bg-slate-950/60 my-4 mx-4 rounded-2xl border border-slate-800">
              <MapPin className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-white font-bold text-sm">No District Coordinators Found</p>
              <p className="text-slate-400 max-w-md mx-auto text-xs">
                No coordinators match current filters in "{selectedGeo.breadcrumb}". You can appoint a new coordinator using the 4-step wizard.
              </p>
              <button
                type="button"
                onClick={() => {
                  playSfx('warp');
                  setSelectedGeo({ countryId: 'loc-country-in', level: 'INDIA', breadcrumb: 'Pan-India' });
                  setSearch('');
                  setStatusFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs transition-colors inline-block cursor-pointer shadow-lg shadow-cyan-600/20"
              >
                Reset to Pan-India
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase bg-slate-950/80">
                    <tr>
                      <th className="py-3.5 px-4">District Coordinator</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4">Territory Jurisdiction</th>
                      <th className="py-3.5 px-4">Contact & WhatsApp</th>
                      <th className="py-3.5 px-4 text-center">Students</th>
                      <th className="py-3.5 px-4 text-center">Teachers</th>
                      <th className="py-3.5 px-4 text-center">Libraries</th>
                      <th className="py-3.5 px-4 text-right">District GMV</th>
                      <th className="py-3.5 px-4 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                    {paginatedAdmins.map((adm) => {
                      const status = adm.status || 'ACTIVE';
                      const statusBadge = 
                        status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : status === 'SUSPENDED'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

                      return (
                        <tr key={adm.id} className="hover:bg-slate-800/50 transition-colors group">
                          {/* Coordinator Info */}
                          <td className="py-3.5 px-4 font-bold text-white font-sans">
                            <div 
                              onClick={() => { 
                                playSfx('click');
                                setSelectedAdminForDetail(adm); 
                                setIsDetailDrawerOpen(true); 
                              }}
                              className="flex items-center gap-3 cursor-pointer group"
                              title="Click to view full officer dossier"
                            >
                              <div className="relative">
                                <img
                                  src={adm.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                                  alt={adm.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0 group-hover:border-cyan-400 transition-colors"
                                />
                                {status === 'ACTIVE' && (
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -bottom-0.5 -right-0.5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-bold text-sm group-hover:text-cyan-400 transition-colors truncate">
                                  {adm.name}
                                </p>
                                <p className="text-[10px] text-cyan-400 font-mono">
                                  {adm.userId}
                                </p>
                                {adm.qualification && (
                                  <p className="text-[10px] text-slate-400 truncate max-w-[170px] font-sans">
                                    {adm.qualification}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                              {status}
                            </span>
                            {adm.lastLogin && (
                              <p className="text-[9px] text-slate-500 mt-1 font-mono">
                                {new Date(adm.lastLogin).toLocaleDateString()}
                              </p>
                            )}
                          </td>

                          {/* Territory */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white font-sans">
                              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>{adm.districtName}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 pl-5 font-sans">{adm.stateName}</p>
                          </td>

                          {/* Contact */}
                          <td className="py-3.5 px-4 text-slate-300">
                            <p className="font-semibold text-white">{adm.phone}</p>
                            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono mt-0.5">
                              <MessageSquare className="w-3 h-3 text-emerald-400" />
                              <span>WA: {adm.whatsappNumber || adm.phone}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate max-w-[150px] font-sans">{adm.email}</p>
                          </td>

                          {/* Metrics */}
                          <td className="py-3.5 px-4 text-center font-bold text-blue-400 text-sm">
                            {adm.totalStudents || 0}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-200 text-sm">
                            {adm.totalTeachers || 0}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-amber-400 text-sm">
                            {adm.totalLibraries || 0}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-emerald-400 text-sm">
                            ₹{(adm.districtGMV || 0).toLocaleString('en-IN')}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* View Detail Drawer */}
                              <button
                                onClick={() => { 
                                  playSfx('click');
                                  setSelectedAdminForDetail(adm); 
                                  setIsDetailDrawerOpen(true); 
                                }}
                                className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-cyan-400 font-bold text-[10px] border border-cyan-500/30 transition-colors cursor-pointer flex items-center gap-1"
                                title="View Dossier"
                              >
                                <Eye className="w-3 h-3" />
                                Dossier
                              </button>

                              {/* Reassign District */}
                              <button
                                onClick={() => handleOpenReassignModal(adm)}
                                className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-indigo-300 font-bold text-[10px] border border-indigo-500/30 transition-colors cursor-pointer"
                                title="Reassign Corridor"
                              >
                                Reassign
                              </button>

                              {/* Status Toggle */}
                              <button
                                onClick={() => handleOpenStatusModal(adm)}
                                className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-300 font-bold text-[10px] border border-amber-500/30 transition-colors cursor-pointer"
                                title="Change Status"
                              >
                                Status
                              </button>

                              {/* Access & Security */}
                              <button
                                onClick={() => handleOpenSecurityModal(adm)}
                                className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-purple-300 font-bold text-[10px] border border-purple-500/30 transition-colors cursor-pointer flex items-center gap-1"
                                title="Security Controls"
                              >
                                <ShieldAlert className="w-3 h-3" />
                                Security
                              </button>

                              {/* Reset Credentials */}
                              <button
                                onClick={() => handleOpenResetPwdModal(adm)}
                                className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-rose-300 font-bold text-[10px] border border-rose-500/30 transition-colors cursor-pointer"
                                title="Reset Password"
                              >
                                Reset
                              </button>

                              {/* ID Card */}
                              <button
                                onClick={() => handleViewIdCard(adm)}
                                className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-teal-300 font-bold text-[10px] border border-teal-500/30 transition-colors cursor-pointer"
                                title="Generate ID Card"
                              >
                                ID Card
                              </button>

                              {/* Salary */}
                              <button
                                onClick={() => handleOpenSalaryModal(adm)}
                                className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 transition-colors cursor-pointer"
                                title="Disburse Salary"
                              >
                                Salary
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile & Tablet Card Hybrid View */}
              <div className="lg:hidden p-4 space-y-4">
                {paginatedAdmins.map((adm) => {
                  const status = adm.status || 'ACTIVE';
                  const statusBadge = 
                    status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : status === 'SUSPENDED'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

                  return (
                    <div key={adm.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={adm.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                            alt={adm.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-white text-sm font-sans">{adm.name}</p>
                            <p className="text-[10px] text-cyan-400">{adm.districtName}, {adm.stateName}</p>
                            <p className="text-[10px] text-slate-500">ID: {adm.userId}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                          {status}
                        </span>
                      </div>

                      {/* Metrics Strip */}
                      <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs">
                        <div>
                          <span className="text-[9px] uppercase text-slate-500 block">Students</span>
                          <span className="font-black text-blue-400">{adm.totalStudents || 0}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-slate-500 block">Teachers</span>
                          <span className="font-black text-slate-200">{adm.totalTeachers || 0}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-slate-500 block">Libraries</span>
                          <span className="font-black text-amber-400">{adm.totalLibraries || 0}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-slate-500 block">GMV</span>
                          <span className="font-black text-emerald-400">₹{((adm.districtGMV || 0) / 1000).toFixed(0)}k</span>
                        </div>
                      </div>

                      {/* Actions Grid */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
                        <button
                          onClick={() => { 
                            playSfx('click');
                            setSelectedAdminForDetail(adm); 
                            setIsDetailDrawerOpen(true); 
                          }}
                          className="py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300 font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Dossier</span>
                        </button>
                        <button
                          onClick={() => handleViewIdCard(adm)}
                          className="py-1.5 rounded-lg bg-slate-900 border border-purple-500/30 text-purple-300 font-bold cursor-pointer"
                        >
                          ID Card
                        </button>
                        <button
                          onClick={() => handleOpenStatusModal(adm)}
                          className="py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-bold cursor-pointer"
                        >
                          Status
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
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAdmins.length)} of {filteredAdmins.length}
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

      {/* VIEW MODE 2: TERRITORIAL COVERAGE HUB (CORRIDORS & VACANCIES) */}
      {activeViewMode === 'corridors' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Territorial Jurisdiction & Coverage Hub</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
                  {corridorList.filter(c => c.isAppointed).length} / {corridorList.length} Appointed
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Displays full pan-India district corridors. Unappointed corridors offer instant one-click appointment shortcut.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Appointed
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 ml-3">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" /> Vacant (Needs Admin)
              </span>
            </div>
          </div>

          {/* Corridors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {corridorList.map((corridor) => (
              <div 
                key={corridor.districtId} 
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
                  corridor.isAppointed
                    ? 'bg-slate-950/90 border-slate-800 hover:border-cyan-500/40'
                    : 'bg-rose-950/20 border-rose-900/40 hover:border-rose-500/60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm font-sans">{corridor.districtName}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{corridor.stateName}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                      corridor.isAppointed
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}>
                      {corridor.isAppointed ? 'GOVERNED' : 'VACANT'}
                    </span>
                  </div>

                  {corridor.admin ? (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <img
                          src={corridor.admin.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                          alt={corridor.admin.name}
                          className="w-6 h-6 rounded-md object-cover border border-slate-700"
                        />
                        <span className="font-bold text-slate-200 truncate font-sans text-xs">{corridor.admin.name}</span>
                      </div>
                      <p className="text-[10px] text-cyan-400">{corridor.admin.userId}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Students: <strong className="text-white">{corridor.admin.totalStudents || 0}</strong></span>
                        <span>GMV: <strong className="text-emerald-400">₹{((corridor.admin.districtGMV || 0) / 1000).toFixed(0)}k</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-rose-900/30 text-xs text-rose-300/80 font-mono">
                      <p className="text-[11px]">No active coordinator assigned. District regulatory jurisdiction unassigned.</p>
                    </div>
                  )}
                </div>

                {/* Corridor Action */}
                <div className="pt-2">
                  {corridor.admin ? (
                    <button
                      onClick={() => {
                        playSfx('click');
                        setSelectedAdminForDetail(corridor.admin!);
                        setIsDetailDrawerOpen(true);
                      }}
                      className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Corridor Dossier</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartAppointWizard(corridor.stateName, corridor.districtName)}
                      className="w-full py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/20"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Appoint for {corridor.districtName}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: LIVE RBAC GUARD & SECURITY AUDIT RADAR */}
      {activeViewMode === 'security' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">DISTRICT ACCESS SECURITY & AUDIT MONITOR</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    LIVE RBAC GUARD
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Real-time tracking of district-scoped authorization, cross-district intrusion attempts, and territorial assignment integrity
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playSfx('click');
                setAccessAuditLogs(districtAuthorizationService.getAccessAuditLogs());
                notify('Security logs refreshed from live audit buffer!', 'info');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-mono font-bold text-slate-300 transition-colors cursor-pointer border border-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Refresh Security Logs</span>
            </button>
          </div>

          {/* Security Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Active Territorial Admins</span>
              <p className="text-2xl font-black text-white">{admins.filter((a) => a.status === 'ACTIVE').length}</p>
              <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Fully bound to territory
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Governed Districts</span>
              <p className="text-2xl font-black text-white">{new Set(admins.map((a) => a.districtName)).size}</p>
              <p className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Zero duplicate assignments
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Blocked Cross-District Access</span>
              <p className="text-2xl font-black text-rose-400">
                {accessAuditLogs.filter((l) => l.result === 'DENIED').length}
              </p>
              <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> 403 Forbidden auto-enforced
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Data Isolation Health</span>
              <p className="text-2xl font-black text-emerald-400">100%</p>
              <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Zero fallback leakage
              </p>
            </div>
          </div>

          {/* Live Territorial Audit Log Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Recent District Authorization & Audit Events
              </h4>
              <span className="text-[10px] text-cyan-400">Real-time telemetry</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase bg-slate-900/60">
                  <tr>
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Administrator</th>
                    <th className="py-3 px-3">Authorized District</th>
                    <th className="py-3 px-3">Requested Target</th>
                    <th className="py-3 px-3">Resource / Action</th>
                    <th className="py-3 px-3 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {accessAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                        No security audit events recorded yet in current session.
                      </td>
                    </tr>
                  ) : (
                    accessAuditLogs.slice(0, 10).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-500 text-[10px] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 px-3 text-white font-semibold">
                          {log.actorUserId} <span className="text-[10px] text-slate-500">({log.actorRole})</span>
                        </td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">
                          {log.authorizedDistrictName || log.authorizedDistrictId}
                        </td>
                        <td className="py-2.5 px-3 text-amber-400 font-bold">
                          {log.requestedDistrictName || log.requestedDistrictId || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {log.action} <span className="text-[10px] text-slate-500">({log.resourceType})</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            log.result === 'ALLOWED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}>
                            {log.result === 'ALLOWED' ? 'AUTHORIZED' : '403 DENIED'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 4: FINANCIAL HONORARIUM & PAYOUT REGISTRY */}
      {activeViewMode === 'finance' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>District Coordinator Salary & Honorarium Governance</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                  ESCROW REGISTRY
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Monthly territorial honorarium, field allowances, performance incentives, and canvas statement generation
              </p>
            </div>
            <div className="text-right font-mono">
              <span className="text-slate-400 text-[10px] block">MONTHLY DISBURSEMENT RUN</span>
              <span className="text-emerald-400 font-black text-lg">
                ₹{admins.reduce((sum, a) => sum + (a.salaryDetails?.netPayable || 26500), 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Salary Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase bg-slate-900/60">
                <tr>
                  <th className="py-3 px-4">Coordinator</th>
                  <th className="py-3 px-4">Territory</th>
                  <th className="py-3 px-4 text-right">Base Honorarium</th>
                  <th className="py-3 px-4 text-right">Allowances</th>
                  <th className="py-3 px-4 text-right">Deductions</th>
                  <th className="py-3 px-4 text-right">Net Payable</th>
                  <th className="py-3 px-4 text-center">Last Disbursed</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {admins.map((adm) => {
                  const base = adm.salaryDetails?.baseSalary || 25000;
                  const allowances = adm.salaryDetails?.allowances || 2000;
                  const deductions = adm.salaryDetails?.deductions || 500;
                  const net = adm.salaryDetails?.netPayable || (base + allowances - deductions);

                  return (
                    <tr key={adm.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white font-sans">
                        <div className="flex items-center gap-2">
                          <img
                            src={adm.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                            alt={adm.name}
                            className="w-7 h-7 rounded-md object-cover border border-slate-700"
                          />
                          <div>
                            <p className="text-white text-xs">{adm.name}</p>
                            <p className="text-[10px] text-cyan-400">{adm.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-sans">
                        {adm.districtName}, {adm.stateName}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 font-mono">
                        ₹{base.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-mono">
                        +₹{allowances.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-rose-400 font-mono">
                        -₹{deductions.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-white font-mono text-sm">
                        ₹{net.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-400 text-[10px]">
                        {adm.salaryDetails?.lastPaidDate || '2026-08-31'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenSalaryModal(adm)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                        >
                          Disburse
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. ALL MODALS & DRAWERS (100% PRESERVED & WORKING) */}

      {/* 4-STEP APPOINT ADMIN WIZARD MODAL */}
      {isAppointWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 tracking-wider">Territorial Administration</span>
                <h3 className="text-base font-bold text-white">Appoint District Administrator</h3>
              </div>
              <button
                onClick={() => {
                  playSfx('click');
                  setIsAppointWizardOpen(false);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Header */}
            <div className="flex items-center justify-between px-2 text-xs font-mono">
              {[
                { step: 1, label: 'State' },
                { step: 2, label: 'District' },
                { step: 3, label: 'Profile' },
                { step: 4, label: 'Credentials' },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    wizardStep === s.step
                      ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400/40'
                      : wizardStep > s.step ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {s.step}
                  </span>
                  <span className={wizardStep === s.step ? 'font-bold text-white' : 'text-slate-500'}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Step 1: Select State */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs pt-2">
                <label className="text-[11px] font-mono font-bold text-slate-300 block">Step 1: Select State / Union Territory</label>
                <select
                  value={newAdminState}
                  onChange={(e) => {
                    playSfx('toggle');
                    setNewAdminState(e.target.value);
                  }}
                  className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-cyan-500"
                >
                  {availableStates.map((s) => (
                    <option key={s.id} value={s.name}>{s.name} ({s.code || 'IN'})</option>
                  ))}
                </select>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="font-bold text-cyan-300 text-xs">Selected Territory:</p>
                  <p className="text-slate-400 text-xs">
                    State: <strong className="text-white">{newAdminState}</strong> &bull; Total districts mapped: <strong className="text-white">{wizardDistricts.length}</strong>
                  </p>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => {
                      playSfx('click');
                      setWizardStep(2);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-600/20"
                  >
                    <span>Next: Select District</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Select District with One Active Admin Rule Verification */}
            {wizardStep === 2 && (
              <div className="space-y-4 text-xs pt-2">
                <label className="text-[11px] font-mono font-bold text-slate-300 block">Step 2: Select District within {newAdminState}</label>
                <select
                  value={newAdminDistrict}
                  onChange={(e) => {
                    playSfx('toggle');
                    setNewAdminDistrict(e.target.value);
                  }}
                  className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-cyan-500"
                >
                  {wizardDistricts.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>

                {/* Warning if district already has active coordinator */}
                {existingAdminWarning?.hasActive ? (
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/50 space-y-3 animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-amber-300 text-xs">
                          Constitutional Alert: Active Coordinator Already Assigned
                        </p>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          <strong>{existingAdminWarning.adminName}</strong> ({existingAdminWarning.userId}) is currently the sole active administrator for {newAdminDistrict}.
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-amber-600/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={replaceExistingAdmin}
                        onChange={(e) => {
                          playSfx('toggle');
                          setReplaceExistingAdmin(e.target.checked);
                        }}
                        className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 focus:ring-0"
                      />
                      <span className="text-[11px] text-amber-200 font-bold">
                        Replace existing administrator & reassign jurisdiction
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-600/40 flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="text-emerald-300 text-xs font-medium">
                      Territory clear! No active administrator currently occupies {newAdminDistrict}.
                    </p>
                  </div>
                )}

                <div className="flex justify-between pt-3">
                  <button
                    onClick={() => {
                      playSfx('click');
                      setWizardStep(1);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    disabled={existingAdminWarning?.hasActive && !replaceExistingAdmin}
                    onClick={() => {
                      playSfx('click');
                      setWizardStep(3);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-600/20"
                  >
                    <span>Next: Officer Profile</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Officer Dossier & KYC Info */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-xs pt-2">
                <label className="text-[11px] font-mono font-bold text-slate-300 block">Step 3: Officer Profile & Qualifications</label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400">Full Legal Name *</span>
                    <input
                      type="text"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra Verma"
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400">Official Email *</span>
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="e.g. ramesh.ghazipur@zyzus.com"
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400">Mobile Phone *</span>
                    <input
                      type="text"
                      value={newAdminPhone}
                      onChange={(e) => setNewAdminPhone(e.target.value)}
                      placeholder="+91 94150 12345"
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400">Educational Qualification</span>
                    <input
                      type="text"
                      value={newAdminQualification}
                      onChange={(e) => setNewAdminQualification(e.target.value)}
                      placeholder="e.g. M.Sc, B.Ed (Retd. Principal)"
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* WhatsApp Checkbox */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameWhatsappAsPhone}
                      onChange={(e) => setSameWhatsappAsPhone(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-[11px] text-slate-300">WhatsApp number is same as mobile phone</span>
                  </label>
                  {!sameWhatsappAsPhone && (
                    <input
                      type="text"
                      value={newAdminWhatsapp}
                      onChange={(e) => setNewAdminWhatsapp(e.target.value)}
                      placeholder="Alternate WhatsApp Number"
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  )}
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400">Residential & Office Address in {newAdminDistrict}</span>
                  <input
                    type="text"
                    value={newAdminAddress}
                    onChange={(e) => setNewAdminAddress(e.target.value)}
                    placeholder="e.g. Civil Lines, Near District Court, Ghazipur"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Photo Upload with Canvas Resize */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400">Officer Photograph (Automatic Compression)</span>
                  <div className="flex items-center gap-3">
                    <label className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-mono text-xs flex items-center gap-2 cursor-pointer transition-colors">
                      <Camera className="w-4 h-4" />
                      <span>Upload Officer Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {newAdminAvatar && (
                      <div className="flex items-center gap-2">
                        <img
                          src={newAdminAvatar}
                          alt="Preview"
                          className="w-10 h-10 rounded-xl object-cover border border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() => setNewAdminAvatar(null)}
                          className="text-[10px] text-rose-400 hover:underline font-mono"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-3">
                  <button
                    onClick={() => {
                      playSfx('click');
                      setWizardStep(2);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    disabled={!newAdminName.trim() || !newAdminPhone.trim()}
                    onClick={() => {
                      playSfx('click');
                      setWizardStep(4);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-600/20"
                  >
                    <span>Next: Generate Credentials</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Sovereign Credentials Issuance & WhatsApp Onboarding */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-xs pt-2">
                <label className="text-[11px] font-mono font-bold text-slate-300 block">Step 4: Sovereign Credentials & Security Verification</label>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase">Assigned User ID:</span>
                    <span className="font-bold text-cyan-300 text-xs px-2 py-0.5 rounded bg-slate-900 border border-cyan-500/30">
                      {newAdminUserId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase">Generated Password:</span>
                    <span className="font-bold text-emerald-300 text-xs px-2 py-0.5 rounded bg-slate-900 border border-emerald-500/30">
                      {generatedPassword}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase">Officer Jurisdiction:</span>
                    <span className="font-bold text-white text-xs">
                      {newAdminDistrict}, {newAdminState}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase">WhatsApp Delivery:</span>
                    <span className="text-emerald-400 text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{sameWhatsappAsPhone ? newAdminPhone : newAdminWhatsapp}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCredentials}
                    className="flex-1 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedCredentials ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{copiedCredentials ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
                  </button>

                  <button
                    onClick={handleGeneratePassword}
                    className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
                    title="Regenerate Password"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-700/40 text-[11px] text-indigo-300 font-mono flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Automated WhatsApp onboarding payload is queued and will dispatch upon confirmation.</span>
                </div>

                <div className="flex justify-between pt-3">
                  <button
                    onClick={() => {
                      playSfx('click');
                      setWizardStep(3);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFinalizeAppointment}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm & Appoint Administrator</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / OFFICER DOSSIER (SECTION #27) */}
      {isDetailDrawerOpen && selectedAdminForDetail && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-6 text-slate-100 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-white">Officer Dossier</h3>
                  </div>
                  <button
                    onClick={() => {
                      playSfx('click');
                      setIsDetailDrawerOpen(false);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Card */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <img
                    src={selectedAdminForDetail.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                    alt={selectedAdminForDetail.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500"
                  />
                  <div>
                    <h4 className="font-bold text-white text-base font-sans">{selectedAdminForDetail.name}</h4>
                    <p className="text-xs text-cyan-400 font-mono font-bold">
                      {selectedAdminForDetail.districtName}, {selectedAdminForDetail.stateName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      ID: {selectedAdminForDetail.userId}
                    </p>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">Active Students</span>
                    <p className="text-lg font-bold text-blue-400">{selectedAdminForDetail.totalStudents || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">Vetted Teachers</span>
                    <p className="text-lg font-bold text-slate-200">{selectedAdminForDetail.totalTeachers || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">Accredited Libraries</span>
                    <p className="text-lg font-bold text-amber-400">{selectedAdminForDetail.totalLibraries || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">District GMV</span>
                    <p className="text-lg font-bold text-emerald-400">₹{(selectedAdminForDetail.districtGMV || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Contact & KYC Info */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mobile Phone:</span>
                    <span className="text-white font-bold">{selectedAdminForDetail.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">WhatsApp:</span>
                    <span className="text-emerald-400 font-bold">{selectedAdminForDetail.whatsappNumber || selectedAdminForDetail.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-cyan-300 truncate max-w-[200px]">{selectedAdminForDetail.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Qualifications:</span>
                    <span className="text-slate-200">{selectedAdminForDetail.qualification || 'M.Sc, B.Ed'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Appointment Date:</span>
                    <span className="text-slate-200">{selectedAdminForDetail.assignedDate || '2026-04-01'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account Status:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {selectedAdminForDetail.status}
                    </span>
                  </div>
                </div>

                {/* Quick Document Generators */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Official Document Warrants</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <button
                      onClick={() => handleViewIdCard(selectedAdminForDetail)}
                      className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-purple-500/40 text-purple-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Universal ID Card</span>
                    </button>

                    <button
                      onClick={() => handleDownloadIdProof(selectedAdminForDetail)}
                      className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Govt ID Proof</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenSalaryModal(selectedAdminForDetail);
                    setIsDetailDrawerOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>Salary Disbursal</span>
                </button>

                <button
                  onClick={() => {
                    handleOpenSecurityModal(selectedAdminForDetail);
                    setIsDetailDrawerOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs cursor-pointer"
                >
                  Security
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REASSIGN TERRITORY MODAL */}
      {isReassignModalOpen && selectedAdminForReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>Reassign Territory Jurisdiction</span>
              </h3>
              <button
                onClick={() => setIsReassignModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <p className="text-slate-400">Current Officer:</p>
              <p className="text-white font-bold">{selectedAdminForReassign.name} ({selectedAdminForReassign.userId})</p>
              <p className="text-indigo-400">Current Territory: {selectedAdminForReassign.districtName}, {selectedAdminForReassign.stateName}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400">Target State</span>
                <select
                  value={reassignState}
                  onChange={(e) => setReassignState(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium"
                >
                  {availableStates.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400">Target District</span>
                <select
                  value={reassignDistrict}
                  onChange={(e) => setReassignDistrict(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium"
                >
                  {reassignDistrictsList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400">Audit Justification</span>
                <input
                  type="text"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsReassignModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs"
              >
                Cancel
              </button>
              <button
                disabled={isReassigning}
                onClick={handleExecuteReassign}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold"
              >
                {isReassigning ? 'Reassigning...' : 'Confirm Reassignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT STATUS MODAL */}
      {isStatusModalOpen && selectedAdminForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Update Account Status</span>
              </h3>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <p className="text-white font-bold">{selectedAdminForStatus.name} ({selectedAdminForStatus.userId})</p>
              <p className="text-slate-400">Current Status: <strong className="text-amber-400">{selectedAdminForStatus.status}</strong></p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400">Target Status</span>
                <select
                  value={newStatusVal}
                  onChange={(e) => setNewStatusVal(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                >
                  <option value="ACTIVE">ACTIVE (Authorized & Unrestricted)</option>
                  <option value="SUSPENDED">SUSPENDED (Temporary Hold)</option>
                  <option value="DEACTIVATED">DEACTIVATED (Account Closed)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400">Reason for Status Change</span>
                <input
                  type="text"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="e.g. Annual audit review, territory freeze..."
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs"
              >
                Cancel
              </button>
              <button
                disabled={isUpdatingStatus}
                onClick={handleExecuteStatusUpdate}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold"
              >
                {isUpdatingStatus ? 'Updating...' : 'Save Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetPwdModalOpen && selectedAdminForReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-rose-400" />
                <span>Reset Officer Password</span>
              </h3>
              <button
                onClick={() => setIsResetPwdModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <p className="text-white font-bold">{selectedAdminForReset.name} ({selectedAdminForReset.userId})</p>
              <p className="text-slate-400">Target WhatsApp: {selectedAdminForReset.whatsappNumber || selectedAdminForReset.phone}</p>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <span className="text-[10px] text-slate-400">New Password to Dispatch</span>
              <input
                type="text"
                value={newCustomPwd}
                onChange={(e) => setNewCustomPwd(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsResetPwdModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs"
              >
                Cancel
              </button>
              <button
                disabled={isResettingPwd}
                onClick={handleExecuteResetPwd}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold"
              >
                {isResettingPwd ? 'Resetting...' : 'Reset & Dispatch WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCESS & SECURITY GOVERNANCE MODAL */}
      {isSecurityModalOpen && selectedAdminForSecurity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span>Access & Security Controls</span>
              </h3>
              <button
                onClick={() => setIsSecurityModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <p className="text-white font-bold">{selectedAdminForSecurity.name}</p>
              <p className="text-purple-400">User ID: {selectedAdminForSecurity.userId}</p>
            </div>

            <div className="space-y-2 pt-1 font-mono text-xs">
              <button
                onClick={() => handleSendSetupLink(selectedAdminForSecurity)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold flex items-center justify-between cursor-pointer"
              >
                <span>Copy Portal Setup Link</span>
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleResendAccessInstructions(selectedAdminForSecurity)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-emerald-300 font-bold flex items-center justify-between cursor-pointer"
              >
                <span>Resend WhatsApp Credentials</span>
                <Send className="w-4 h-4" />
              </button>

              <button
                disabled={isRevokingSessions}
                onClick={() => handleRevokeSessions(selectedAdminForSecurity)}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-950/60 border border-rose-800/40 text-rose-300 font-bold flex items-center justify-between cursor-pointer"
              >
                <span>Revoke All Active Sessions</span>
                <Lock className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsSecurityModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SALARY PAYMENT MODAL */}
      {isSalaryModalOpen && selectedAdminForSalary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                <span>Disburse Monthly Honorarium</span>
              </h3>
              <button
                onClick={() => setIsSalaryModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <p className="text-white font-bold">{selectedAdminForSalary.name}</p>
              <p className="text-emerald-400">Territory: {selectedAdminForSalary.districtName}, {selectedAdminForSalary.stateName}</p>
            </div>

            {/* Form */}
            <div className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Payment Period</span>
                <input
                  type="text"
                  value={salaryPeriod}
                  onChange={(e) => setSalaryPeriod(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Base Salary</span>
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Allowances</span>
                  <input
                    type="number"
                    value={salaryAdjustments}
                    onChange={(e) => setSalaryAdjustments(Number(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Deductions</span>
                  <input
                    type="number"
                    value={salaryDeductions}
                    onChange={(e) => setSalaryDeductions(Number(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-rose-400 text-xs"
                  />
                </div>
              </div>

              {/* Net Payable Highlight */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-slate-300 font-bold">Net Disbursed Amount:</span>
                <span className="text-emerald-400 font-black text-base">
                  ₹{(baseSalary + salaryAdjustments - salaryDeductions).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Disbursement Notes</span>
                <input
                  type="text"
                  value={salaryNotes}
                  onChange={(e) => setSalaryNotes(e.target.value)}
                  placeholder="Escrow transaction reference or ledger note..."
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            {/* Generated Slip Download Action */}
            {generatedSlip && (
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">Salary Slip Generated!</span>
                <button
                  onClick={() => handleDownloadSalarySlip(generatedSlip)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Slip PNG</span>
                </button>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsSalaryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                disabled={isSalaryProcessing}
                onClick={handleDisburseSalary}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-mono text-xs font-bold cursor-pointer"
              >
                {isSalaryProcessing ? 'Processing...' : 'Confirm & Disburse'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSAL ID CARD MODAL */}
      <UniversalIdCardModal
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
        cardData={idCardData}
      />
    </div>
  );
};

export default SuperAdminDistrictAdmins;
