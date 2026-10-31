// FOCUSPOINT — Super Admin Exam Eligibility Rule Architecture & Curricula Gate Highway
// Dynamic Curricula Matrix, Cascading Location Filters, Real-time Class/Board/Stream/Age Simulator & Quantum Gate Trace

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Target, 
  Layers, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Sliders, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  ArrowRight, 
  ArrowUpDown,
  Info,
  Calendar,
  Building,
  MapPin,
  Clock,
  Check,
  ChevronRight,
  UserCheck,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  Compass,
  Navigation,
  Activity,
  X,
  FileSpreadsheet,
  HelpCircle,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { locationService } from '../../services/locationService';
import { State, DistrictLocation, Locality } from '../../types/location';
import { examEligibilityService, EvaluatedExamItem } from '../../services/examEligibilityService';
import { ExamEligibilityRule, AcademicStream } from '../../types/eligibilityAndPricing';

// Sound Synthesizer for tactile Cyber-HUD interaction
type SfxType = 'click' | 'warp' | 'confirm' | 'toggle' | 'alert';

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
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.16);
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
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.setValueAtTime(520, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      case 'alert':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(240, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
    }
  } catch {
    // Ignore audio context errors if muted by browser policy
  }
};

type SortKey = 
  | 'priority_asc' 
  | 'priority_desc' 
  | 'class_asc' 
  | 'class_desc' 
  | 'name_asc' 
  | 'effective_desc'
  | 'geo_tier';

interface SelectedTerritory {
  countryId: string;
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  localityId: string;
  localityName: string;
  level: 'INDIA' | 'STATE' | 'DISTRICT' | 'LOCALITY';
  breadcrumb: string;
}

export const SuperAdminEligibilityRules: React.FC = () => {
  const { addToast } = useToast();

  // Audio SFX state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fp_eligibility_sfx_enabled') !== 'false';
  });

  const playSfx = (type: SfxType) => {
    if (soundEnabled) playCyberSound(type);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('fp_eligibility_sfx_enabled', String(next));
    if (next) playCyberSound('confirm');
  };

  // Live HUD Clock (IST)
  const [hudTime, setHudTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setHudTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Location Master Directory State
  const [statesList, setStatesList] = useState<State[]>([]);
  const [districtsList, setDistrictsList] = useState<DistrictLocation[]>([]);
  const [localitiesList, setLocalitiesList] = useState<Locality[]>([]);

  // Selected Location Hierarchy
  const [selectedLocation, setSelectedLocation] = useState<SelectedTerritory>({
    countryId: 'loc-country-in',
    stateId: '',
    stateName: '',
    districtId: '',
    districtName: '',
    localityId: '',
    localityName: '',
    level: 'INDIA',
    breadcrumb: 'Pan-India'
  });

  // Toggle to include national curricula in localized views
  const [includeNationalCurricula, setIncludeNationalCurricula] = useState<boolean>(true);

  // Rules and Filter States
  const [rules, setRules] = useState<ExamEligibilityRule[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'EXPIRED'>('ALL');
  const [sortOption, setSortOption] = useState<SortKey>('priority_asc');

  // Interactive Student Eligibility Test Tool State
  const [simClass, setSimClass] = useState<string>('Class 11');
  const [simStream, setSimStream] = useState<AcademicStream>('PCM');
  const [simBoard, setSimBoard] = useState<string>('CBSE');
  const [simState, setSimState] = useState<string>('Uttar Pradesh');
  const [simAge, setSimAge] = useState<number>(16);
  const [simFilterMode, setSimFilterMode] = useState<'ALL' | 'ELIGIBLE' | 'LOCKED'>('ALL');
  const [evaluatedExams, setEvaluatedExams] = useState<EvaluatedExamItem[]>([]);

  // Modal State for Rule CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ExamEligibilityRule | null>(null);
  const [formExamId, setFormExamId] = useState('');
  const [formExamName, setFormExamName] = useState('');
  const [formCategory, setFormCategory] = useState<any>('COMPETITIVE_ENGINEERING');
  const [formMinClass, setFormMinClass] = useState<number>(11);
  const [formMaxClass, setFormMaxClass] = useState<number>(12);
  const [formBoard, setFormBoard] = useState<string>('ALL');
  const [formStreams, setFormStreams] = useState<AcademicStream[]>(['PCM']);
  const [formAcademicYear, setFormAcademicYear] = useState<string>('2026-2027');
  const [formMinAge, setFormMinAge] = useState<number | undefined>(undefined);
  const [formMaxAge, setFormMaxAge] = useState<number | undefined>(undefined);
  const [formStateId, setFormStateId] = useState<string>('');
  const [formStateName, setFormStateName] = useState<string>('');
  const [formDistrictId, setFormDistrictId] = useState<string>('');
  const [formDistrictName, setFormDistrictName] = useState<string>('');
  const [formLocalityId, setFormLocalityId] = useState<string>('');
  const [formLocalityName, setFormLocalityName] = useState<string>('');
  const [formPriority, setFormPriority] = useState<number>(1);
  const [formRuleStatus, setFormRuleStatus] = useState<'ACTIVE' | 'DRAFT' | 'EXPIRED'>('ACTIVE');
  const [formIneligibleReason, setFormIneligibleReason] = useState('');

  // Form Cascading Locations
  const [formDistricts, setFormDistricts] = useState<DistrictLocation[]>([]);
  const [formLocalities, setFormLocalities] = useState<Locality[]>([]);

  // Quantum Gate Inspector Modal State
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectedRule, setInspectedRule] = useState<ExamEligibilityRule | null>(null);

  // Initialize Location Data
  useEffect(() => {
    const states = locationService.getStates('loc-country-in', true);
    setStatesList(states);
  }, []);

  // Update Districts when Selected State changes
  useEffect(() => {
    if (selectedLocation.stateId) {
      const dists = locationService.getDistricts(selectedLocation.stateId, true);
      setDistrictsList(dists);
    } else {
      setDistrictsList([]);
      setLocalitiesList([]);
    }
  }, [selectedLocation.stateId]);

  // Update Localities when Selected District changes
  useEffect(() => {
    if (selectedLocation.districtId) {
      const locs = locationService.getLocalities(selectedLocation.districtId, true);
      setLocalitiesList(locs);
    } else {
      setLocalitiesList([]);
    }
  }, [selectedLocation.districtId]);

  // Form Cascading Watcher
  useEffect(() => {
    if (formStateId) {
      const dists = locationService.getDistricts(formStateId, true);
      setFormDistricts(dists);
    } else {
      setFormDistricts([]);
      setFormLocalities([]);
    }
  }, [formStateId]);

  useEffect(() => {
    if (formDistrictId) {
      const locs = locationService.getLocalities(formDistrictId, true);
      setFormLocalities(locs);
    } else {
      setFormLocalities([]);
    }
  }, [formDistrictId]);

  const refreshRules = () => {
    setRules(examEligibilityService.getAllRules());
  };

  useEffect(() => {
    refreshRules();
    const unsub = examEligibilityService.subscribe(refreshRules);
    return () => unsub();
  }, []);

  // Update simulator whenever testing inputs or rules change
  useEffect(() => {
    const evaluated = examEligibilityService.getEvaluatedExamsForStudent(
      'usr-student-test',
      simClass,
      simStream,
      simState
    );
    setEvaluatedExams(evaluated);
  }, [simClass, simStream, simBoard, simState, simAge, rules]);

  // Location Handlers for Main Command Deck
  const handleSelectStateByName = (stateName: string) => {
    playSfx('click');
    if (!stateName || stateName === 'ALL' || stateName === 'Pan-India') {
      setSelectedLocation({
        countryId: 'loc-country-in',
        stateId: '',
        stateName: '',
        districtId: '',
        districtName: '',
        localityId: '',
        localityName: '',
        level: 'INDIA',
        breadcrumb: 'Pan-India'
      });
      setSimState('ALL');
      addToast('Territory reset to Nationwide Pan-India', 'info');
      return;
    }

    const stObj = statesList.find(s => s.name.toLowerCase() === stateName.toLowerCase() || s.id === stateName);
    const resolvedId = stObj ? stObj.id : `loc-state-${stateName.toLowerCase().slice(0, 2)}`;
    const resolvedName = stObj ? stObj.name : stateName;

    setSelectedLocation({
      countryId: 'loc-country-in',
      stateId: resolvedId,
      stateName: resolvedName,
      districtId: '',
      districtName: '',
      localityId: '',
      localityName: '',
      level: 'STATE',
      breadcrumb: `India → ${resolvedName}`
    });
    setSimState(resolvedName);
    addToast(`Curricula focused on ${resolvedName}`, 'success');
  };

  const handleSelectDistrictByName = (districtName: string) => {
    playSfx('click');
    if (!districtName || districtName === 'ALL') {
      setSelectedLocation(prev => ({
        ...prev,
        districtId: '',
        districtName: '',
        localityId: '',
        localityName: '',
        level: prev.stateName ? 'STATE' : 'INDIA',
        breadcrumb: prev.stateName ? `India → ${prev.stateName}` : 'Pan-India'
      }));
      return;
    }

    const distObj = districtsList.find(d => d.name.toLowerCase() === districtName.toLowerCase() || d.id === districtName);
    const resolvedDistId = distObj ? distObj.id : `dist-${districtName.toLowerCase().slice(0, 3)}`;
    const resolvedDistName = distObj ? distObj.name : districtName;

    setSelectedLocation(prev => ({
      ...prev,
      districtId: resolvedDistId,
      districtName: resolvedDistName,
      localityId: '',
      localityName: '',
      level: 'DISTRICT',
      breadcrumb: `India → ${prev.stateName || 'State'} → ${resolvedDistName}`
    }));
    addToast(`District corridor focused on ${resolvedDistName}`, 'success');
  };

  const handleSelectLocalityByName = (localityName: string) => {
    playSfx('click');
    if (!localityName || localityName === 'ALL') {
      setSelectedLocation(prev => ({
        ...prev,
        localityId: '',
        localityName: '',
        level: 'DISTRICT',
        breadcrumb: `India → ${prev.stateName} → ${prev.districtName}`
      }));
      return;
    }

    const locObj = localitiesList.find(l => l.name.toLowerCase() === localityName.toLowerCase() || l.id === localityName);
    const resolvedLocId = locObj ? locObj.id : `loc-${localityName.toLowerCase().slice(0, 3)}`;
    const resolvedLocName = locObj ? locObj.name : localityName;

    setSelectedLocation(prev => ({
      ...prev,
      localityId: resolvedLocId,
      localityName: resolvedLocName,
      level: 'LOCALITY',
      breadcrumb: `India → ${prev.stateName} → ${prev.districtName} → ${resolvedLocName}`
    }));
    addToast(`Locality cluster focused on ${resolvedLocName}`, 'success');
  };

  const handleResetNationwide = () => {
    playSfx('warp');
    setSelectedLocation({
      countryId: 'loc-country-in',
      stateId: '',
      stateName: '',
      districtId: '',
      districtName: '',
      localityId: '',
      localityName: '',
      level: 'INDIA',
      breadcrumb: 'Pan-India'
    });
    setSimState('ALL');
    addToast('Curricula scope reset to Nationwide Pan-India', 'info');
  };

  // Filtered & Sorted Rules Engine
  const filteredAndSortedRules = useMemo(() => {
    const list = rules.filter(r => {
      // Category filter
      const matchCategory = categoryFilter === 'ALL' || r.category === categoryFilter;

      // Status filter
      const effectiveRuleStatus = r.ruleStatus || (r.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT');
      const matchStatus = statusFilter === 'ALL' || effectiveRuleStatus === statusFilter;

      // Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (
        r.examName.toLowerCase().includes(q) ||
        r.examId.toLowerCase().includes(q) ||
        (r.board && r.board.toLowerCase().includes(q)) ||
        (r.applicableState && r.applicableState.toLowerCase().includes(q)) ||
        (r.stateName && r.stateName.toLowerCase().includes(q)) ||
        (r.districtName && r.districtName.toLowerCase().includes(q)) ||
        (r.localityName && r.localityName.toLowerCase().includes(q)) ||
        (r.ineligibleReason && r.ineligibleReason.toLowerCase().includes(q)) ||
        (r.ruleNotes && r.ruleNotes.toLowerCase().includes(q)) ||
        (r.eligibleSubjects && r.eligibleSubjects.some(s => s.toLowerCase().includes(q)))
      );

      // Location Filter
      let matchLocation = true;
      if (selectedLocation.level !== 'INDIA') {
        const isNationalCurriculum = !r.applicableState || r.applicableState === 'PAN_INDIA';

        if (selectedLocation.level === 'STATE') {
          const isDirectState = r.applicableState?.toLowerCase() === selectedLocation.stateName.toLowerCase() ||
                                r.stateName?.toLowerCase() === selectedLocation.stateName.toLowerCase() ||
                                r.stateId === selectedLocation.stateId;
          const isDistrictUnderState = r.stateName?.toLowerCase() === selectedLocation.stateName.toLowerCase();
          matchLocation = isDirectState || isDistrictUnderState || (includeNationalCurricula && isNationalCurriculum);
        } else if (selectedLocation.level === 'DISTRICT') {
          const isDirectDistrict = r.districtName?.toLowerCase() === selectedLocation.districtName.toLowerCase() ||
                                   r.districtId === selectedLocation.districtId;
          const isLocalityUnderDistrict = r.districtName?.toLowerCase() === selectedLocation.districtName.toLowerCase();
          const isParentState = r.applicableState?.toLowerCase() === selectedLocation.stateName.toLowerCase() ||
                                r.stateName?.toLowerCase() === selectedLocation.stateName.toLowerCase();
          matchLocation = isDirectDistrict || isLocalityUnderDistrict || isParentState || (includeNationalCurricula && isNationalCurriculum);
        } else if (selectedLocation.level === 'LOCALITY') {
          const isDirectLocality = r.localityName?.toLowerCase() === selectedLocation.localityName.toLowerCase() ||
                                   r.localityId === selectedLocation.localityId;
          const isParentDistrict = r.districtName?.toLowerCase() === selectedLocation.districtName.toLowerCase();
          const isParentState = r.applicableState?.toLowerCase() === selectedLocation.stateName.toLowerCase();
          matchLocation = isDirectLocality || isParentDistrict || isParentState || (includeNationalCurricula && isNationalCurriculum);
        }
      }

      return matchCategory && matchStatus && matchSearch && matchLocation;
    });

    // Multi-Axis Sorting
    return list.sort((a, b) => {
      switch (sortOption) {
        case 'priority_asc':
          return (a.priority || 1) - (b.priority || 1);
        case 'priority_desc':
          return (b.priority || 1) - (a.priority || 1);
        case 'class_asc':
          return a.minClass - b.minClass;
        case 'class_desc':
          return b.minClass - a.minClass;
        case 'name_asc':
          return a.examName.localeCompare(b.examName);
        case 'effective_desc':
          return (b.effectiveFrom || '').localeCompare(a.effectiveFrom || '');
        case 'geo_tier': {
          const geoWeight = (r: ExamEligibilityRule) => {
            if (r.localityName) return 1;
            if (r.districtName) return 2;
            if (r.stateName || r.applicableState) return 3;
            return 4;
          };
          return geoWeight(a) - geoWeight(b);
        }
        default:
          return (a.priority || 1) - (b.priority || 1);
      }
    });
  }, [rules, categoryFilter, statusFilter, searchQuery, selectedLocation, includeNationalCurricula, sortOption]);

  // Section 20 Rule Counts
  const activeRuleCount = rules.filter(r => (r.ruleStatus || (r.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT')) === 'ACTIVE').length;
  const draftRuleCount = rules.filter(r => (r.ruleStatus || (r.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT')) === 'DRAFT').length;
  const expiredRuleCount = rules.filter(r => r.ruleStatus === 'EXPIRED').length;
  const geoRuleCount = rules.filter(r => r.applicableState || r.stateId || r.districtId || r.localityId).length;

  const handleOpenAddModal = () => {
    playSfx('warp');
    setEditingRule(null);
    setFormExamId(`exam-${Date.now()}`);
    setFormExamName('NDA Entrance Examination');
    setFormCategory('ENTRANCE_ADMISSION');
    setFormMinClass(11);
    setFormMaxClass(12);
    setFormBoard('ALL');
    setFormStreams(['PCM']);
    setFormAcademicYear('2026-2027');
    setFormMinAge(16);
    setFormMaxAge(19);
    setFormStateId(selectedLocation.stateId || '');
    setFormStateName(selectedLocation.stateName || '');
    setFormDistrictId(selectedLocation.districtId || '');
    setFormDistrictName(selectedLocation.districtName || '');
    setFormLocalityId(selectedLocation.localityId || '');
    setFormLocalityName(selectedLocation.localityName || '');
    setFormPriority(1);
    setFormRuleStatus('ACTIVE');
    setFormIneligibleReason('Requires Class 11-12 PCM with age between 16 and 19.5 years.');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule: ExamEligibilityRule) => {
    playSfx('click');
    setEditingRule(rule);
    setFormExamId(rule.examId);
    setFormExamName(rule.examName);
    setFormCategory(rule.category);
    setFormMinClass(rule.minClass);
    setFormMaxClass(rule.maxClass);
    setFormBoard(rule.board || 'ALL');
    setFormStreams(rule.allowedStreams ? [...rule.allowedStreams] : (rule.targetStream ? [rule.targetStream] : ['PCM']));
    setFormAcademicYear(rule.academicYear || '2026-2027');
    setFormMinAge(rule.minAge);
    setFormMaxAge(rule.maxAge);
    setFormStateId(rule.stateId || '');
    setFormStateName(rule.stateName || rule.applicableState || '');
    setFormDistrictId(rule.districtId || '');
    setFormDistrictName(rule.districtName || '');
    setFormLocalityId(rule.localityId || '');
    setFormLocalityName(rule.localityName || '');
    setFormPriority(rule.priority || 1);
    setFormRuleStatus(rule.ruleStatus || (rule.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT'));
    setFormIneligibleReason(rule.ineligibleReason || rule.ruleNotes || '');
    setIsModalOpen(true);
  };

  const handleInspectRule = (rule: ExamEligibilityRule) => {
    playSfx('warp');
    setInspectedRule(rule);
    setIsInspectorOpen(true);
  };

  // Form State Selection Handlers
  const handleFormStateChange = (stId: string) => {
    setFormStateId(stId);
    const stObj = statesList.find(s => s.id === stId);
    setFormStateName(stObj ? stObj.name : '');
    setFormDistrictId('');
    setFormDistrictName('');
    setFormLocalityId('');
    setFormLocalityName('');
  };

  const handleFormDistrictChange = (distId: string) => {
    setFormDistrictId(distId);
    const distObj = formDistricts.find(d => d.id === distId);
    setFormDistrictName(distObj ? distObj.name : '');
    setFormLocalityId('');
    setFormLocalityName('');
  };

  const handleFormLocalityChange = (locId: string) => {
    setFormLocalityId(locId);
    const locObj = formLocalities.find(l => l.id === locId);
    setFormLocalityName(locObj ? locObj.name : '');
  };

  const handleSaveRule = () => {
    playSfx('confirm');
    if (!formExamName.trim() || formMinClass > formMaxClass) {
      addToast('Please verify exam name and valid class bounds', 'error');
      return;
    }

    const rule: ExamEligibilityRule = {
      id: editingRule ? editingRule.id : `rule-elig-${Date.now()}`,
      examId: formExamId,
      examName: formExamName,
      category: formCategory,
      minClass: Number(formMinClass),
      maxClass: Number(formMaxClass),
      currentClass: Number(formMinClass),
      board: formBoard,
      academicYear: formAcademicYear,
      minAge: formMinAge ? Number(formMinAge) : undefined,
      maxAge: formMaxAge ? Number(formMaxAge) : undefined,
      applicableState: formStateName ? formStateName : undefined,
      stateId: formStateId || undefined,
      stateName: formStateName || undefined,
      districtId: formDistrictId || undefined,
      districtName: formDistrictName || undefined,
      localityId: formLocalityId || undefined,
      localityName: formLocalityName || undefined,
      allowedStreams: [...formStreams],
      priority: Number(formPriority),
      ruleStatus: formRuleStatus,
      createdBy: editingRule?.createdBy || 'Super Admin (Highway)',
      ineligibleReason: formIneligibleReason,
      effectiveFrom: editingRule ? editingRule.effectiveFrom : new Date().toISOString().split('T')[0],
      status: formRuleStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      isActive: formRuleStatus === 'ACTIVE',
      updatedAt: new Date().toISOString()
    };

    examEligibilityService.saveRule(rule);
    setIsModalOpen(false);
    addToast(`Eligibility rule for ${formExamName} saved successfully!`, 'success');
  };

  const handleDeleteRule = (id: string) => {
    playSfx('alert');
    if (confirm('Are you sure you want to delete this eligibility rule?')) {
      examEligibilityService.deleteRule(id);
      addToast('Eligibility rule permanently deleted', 'info');
    }
  };

  const toggleStreamCheckbox = (st: AcademicStream) => {
    playSfx('toggle');
    if (formStreams.includes(st)) {
      if (formStreams.length > 1) {
        setFormStreams(formStreams.filter(s => s !== st));
      }
    } else {
      setFormStreams([...formStreams, st]);
    }
  };

  // Export Matrix
  const handleExportMatrix = () => {
    playSfx('warp');
    const csvHeader = 'Rule ID,Exam Name,Category,Min Class,Max Class,Permitted Streams,Board,State,District,Locality,Age Bounds,Priority,Status\n';
    const csvRows = filteredAndSortedRules.map(r => {
      const streams = (r.allowedStreams || [r.targetStream || 'ANY']).join(';');
      const age = r.minAge && r.maxAge ? `${r.minAge}-${r.maxAge}` : 'Universal';
      return `"${r.id}","${r.examName}","${r.category}",${r.minClass},${r.maxClass},"${streams}","${r.board || 'ALL'}","${r.stateName || r.applicableState || 'Pan-India'}","${r.districtName || ''}","${r.localityName || ''}","${age}",${r.priority || 1},"${r.ruleStatus || 'ACTIVE'}"`;
    }).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focuspoint-eligibility-rules-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Eligibility rules matrix exported successfully', 'success');
  };

  // Simulated exams filter
  const displayedSimulatedExams = useMemo(() => {
    return evaluatedExams.filter(item => {
      if (simFilterMode === 'ELIGIBLE') return item.evaluation.isEligible;
      if (simFilterMode === 'LOCKED') return !item.evaluation.isEligible;
      return true;
    });
  }, [evaluatedExams, simFilterMode]);

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* ==================================================================== */}
      {/* 1. TIER 3 COCKPIT HEADER WITH 3D QUANTUM ELIGIBILITY GATE ORB        */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-slate-800 p-6 md:p-8 shadow-2xl hud-corner-brackets">
        {/* Ambient Laser Gradients */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cockpit Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-400 font-bold uppercase tracking-widest text-[11px]">
              SUPER ADMIN GOVERNANCE HIGHWAY // EXAM ELIGIBILITY ARCHITECTURE
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">MULTI-AXIS CURRICULA ACCESS ENGINE</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-mono text-[11px] bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              SYS-TIME: <span className="text-cyan-300 font-bold">{hudTime}</span>
            </span>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Mute Cyber Audio' : 'Enable Cyber Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Cockpit Mid Section: Title & Quantum Orb */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                DYNAMIC CLASS & STREAM GATING
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                0ms DETERMINISTIC ACCESS CONTROLS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-cyan-400 shrink-0" />
              Exam Eligibility Rule Architecture
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Define academic entrance and competitive access gates across class levels, educational board affiliations, streams (PCM/PCB/Arts/Commerce), age thresholds, and regional state/district corridors.
            </p>
          </div>

          {/* 3D Quantum Engine Orb */}
          <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-inner shrink-0 self-start lg:self-auto">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full animate-[spin_14s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" strokeDasharray="6 8" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="1" strokeDasharray="3 6" />
              </svg>
              <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite_reverse]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1" strokeDasharray="4 4" />
              </svg>

              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 via-emerald-500 to-purple-500 p-0.5 shadow-lg shadow-cyan-500/30 animate-pulse flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
                  <Target className="w-5 h-5 text-cyan-300" />
                </div>
              </div>
            </div>

            <div className="ml-3 font-mono text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">ELIGIBILITY CORE</div>
              <div className="text-sm font-black text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                {activeRuleCount} Active Gates
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">
                Regional Quotas: <span className="text-emerald-400 font-bold">{geoRuleCount} Curricula</span>
              </div>
            </div>
          </div>
        </div>

        {/* Laser Divider */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent my-6 opacity-40" />

        {/* Cockpit KPI Telemetry Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 font-mono">
            <div className="text-[10px] text-slate-400 uppercase">Total Configured Gates</div>
            <div className="text-xl font-black text-white mt-0.5">{rules.length}</div>
            <div className="text-[10px] text-cyan-400 mt-0.5">Across All Curricula</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 font-mono">
            <div className="text-[10px] text-slate-400 uppercase">Enforced Live Gates</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{activeRuleCount}</div>
            <div className="text-[10px] text-emerald-300 mt-0.5">Active Student Gating</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 font-mono">
            <div className="text-[10px] text-slate-400 uppercase">Territorial Specific</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">{geoRuleCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">State & District Quotas</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 font-mono">
            <div className="text-[10px] text-slate-400 uppercase">Evaluation Latency</div>
            <div className="text-xl font-black text-cyan-300 mt-0.5">&lt;0.4ms</div>
            <div className="text-[10px] text-cyan-400 mt-0.5">Deterministic 0ms Cache</div>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-emerald-950/60 border border-cyan-800/50 flex flex-col justify-center">
            <button
              onClick={handleOpenAddModal}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black font-mono shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Eligibility Gate</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. DEDICATED PANORAMIC PAN-INDIA LOCATION COMMAND CONSOLE           */}
      {/* ==================================================================== */}
      <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets space-y-4">
        {/* Top Header of Location Console */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Compass className="w-4 h-4 animate-[spin_20s_linear_infinite]" />
            </div>
            <div>
              <div className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                <span>Pan-India Curricula Geo-Highway & Territorial Filter</span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">•</span>
                <span className="text-cyan-400 text-[11px] font-bold">36 States & UTs Active</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Filter eligibility gates by Nationwide, State Domicile, District Corridor, or Locality Cluster (e.g. Navodaya 75% rural seats, state polytechnic quotas).
              </div>
            </div>
          </div>

          {/* Active Breadcrumb & Reset */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 uppercase text-[10px]">CURRENT TERRITORY:</span>
              <span className="text-white font-bold">{selectedLocation.breadcrumb}</span>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                selectedLocation.level === 'INDIA' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                selectedLocation.level === 'STATE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                selectedLocation.level === 'DISTRICT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {selectedLocation.level}
              </span>
            </div>

            {selectedLocation.level !== 'INDIA' && (
              <button
                type="button"
                onClick={handleResetNationwide}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer font-mono"
                title="Reset to Nationwide Pan-India"
              >
                <RotateCcw className="w-3 h-3 text-cyan-400" />
                <span>Reset Nationwide</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Territorial Preset Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
          <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0 mr-1 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-cyan-400" /> Quick Territory:
          </span>

          {[
            { label: 'Pan-India (All 36)', state: 'ALL', count: 'All Gates' },
            { label: 'Uttar Pradesh (75 Districts)', state: 'Uttar Pradesh', count: 'UP Board / JNV' },
            { label: 'Bihar (38 Districts)', state: 'Bihar', count: 'BSEB Quota' },
            { label: 'Delhi-NCR (Central)', state: 'Delhi', count: 'Capital CET' },
            { label: 'Rajasthan (Desert Hub)', state: 'Rajasthan', count: 'Kota Quota' },
            { label: 'Madhya Pradesh (Central)', state: 'Madhya Pradesh', count: 'Super 100' },
            { label: 'Maharashtra (Western Hub)', state: 'Maharashtra', count: 'MHT-CET' }
          ].map((preset) => {
            const isActive = preset.state === 'ALL' 
              ? selectedLocation.level === 'INDIA' 
              : selectedLocation.stateName?.toLowerCase() === preset.state.toLowerCase();

            return (
              <button
                key={preset.label}
                onClick={() => handleSelectStateByName(preset.state)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500 shadow-md shadow-cyan-500/20 font-black'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{preset.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isActive ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-500'}`}>
                  {preset.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3 Cascading Location Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1 text-xs font-mono">
          {/* Level 1: State / UT Selector */}
          <div className="relative">
            <label className="text-[10px] font-bold text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1 text-cyan-400">
                <Compass className="w-3.5 h-3.5" /> 1. STATE / UNION TERRITORY
              </span>
              <span className="text-slate-500">({statesList.length} States/UTs)</span>
            </label>
            <select
              value={selectedLocation.stateName || 'ALL'}
              onChange={(e) => handleSelectStateByName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border-2 border-slate-700 hover:border-cyan-500 text-white font-bold text-xs focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer shadow-inner"
            >
              <option value="ALL">🌐 All States & UTs (Pan-India)</option>
              {statesList.map(st => (
                <option key={st.id} value={st.name} className="bg-slate-950 text-white">
                  {st.name} ({st.type})
                </option>
              ))}
            </select>
          </div>

          {/* Level 2: District Selector */}
          <div className="relative">
            <label className="text-[10px] font-bold text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1 text-amber-400">
                <MapPin className="w-3.5 h-3.5" /> 2. DISTRICT CORRIDOR
              </span>
              {selectedLocation.stateName && (
                <span className="text-amber-400 font-bold">
                  ({districtsList.length} in {selectedLocation.stateName})
                </span>
              )}
            </label>
            <select
              disabled={!selectedLocation.stateName}
              value={selectedLocation.districtName || 'ALL'}
              onChange={(e) => handleSelectDistrictByName(e.target.value)}
              className={`w-full h-11 px-3.5 rounded-xl border-2 text-xs font-bold transition-colors shadow-inner ${
                !selectedLocation.stateName
                  ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-700 hover:border-amber-500 text-white focus:outline-none focus:border-amber-400 cursor-pointer'
              }`}
            >
              <option value="ALL">
                {!selectedLocation.stateName ? 'Select State First' : `All Districts in ${selectedLocation.stateName}`}
              </option>
              {districtsList.map(d => (
                <option key={d.id} value={d.name} className="bg-slate-950 text-white">
                  {d.name} {d.code ? `(${d.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Level 3: Locality Selector */}
          <div className="relative">
            <label className="text-[10px] font-bold text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1 text-emerald-400">
                <Building className="w-3.5 h-3.5" /> 3. LOCALITY / STUDY CLUSTER
              </span>
              {selectedLocation.districtName && (
                <span className="text-emerald-400 font-bold">
                  ({localitiesList.length} in {selectedLocation.districtName})
                </span>
              )}
            </label>
            <select
              disabled={!selectedLocation.districtName}
              value={selectedLocation.localityName || 'ALL'}
              onChange={(e) => handleSelectLocalityByName(e.target.value)}
              className={`w-full h-11 px-3.5 rounded-xl border-2 text-xs font-bold transition-colors shadow-inner ${
                !selectedLocation.districtName
                  ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-700 hover:border-emerald-500 text-white focus:outline-none focus:border-emerald-400 cursor-pointer'
              }`}
            >
              <option value="ALL">
                {!selectedLocation.districtName ? 'Select District First' : `All Localities in ${selectedLocation.districtName}`}
              </option>
              {localitiesList.map(l => (
                <option key={l.id} value={l.name} className="bg-slate-950 text-white">
                  {l.name} {l.pincode ? `[PIN ${l.pincode}]` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Territory Status Footer & Baseline Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs font-mono border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Matched Eligibility Rules:</span>
            <span className="text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
              {filteredAndSortedRules.length} Gates
            </span>
            {selectedLocation.level !== 'INDIA' && (
              <span className="text-slate-500 text-[11px]">
                (Filtered to {selectedLocation.breadcrumb})
              </span>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={includeNationalCurricula}
              onChange={(e) => setIncludeNationalCurricula(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span className="text-[11px]">Include National Pan-India Curricula in Localized Scope</span>
          </label>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. COGNITIVE CANDIDATE ELIGIBILITY SIMULATOR & UNLOCK/LOCK MATRIX    */}
      {/* ==================================================================== */}
      <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Cognitive Candidate Eligibility Simulator & Unlock/Lock Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate candidate academic profile attributes in real time to preview unlock/lock decisions, prerequisite compliance, and rule rationales.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800 uppercase self-start sm:self-auto">
              Real-Time Simulator Active
            </span>
          </div>
        </div>

        {/* Simulator Attribute Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs font-mono">
          <div>
            <label className="block text-slate-400 font-bold mb-1">Registered Class</label>
            <select
              value={simClass}
              onChange={(e) => {
                playSfx('click');
                setSimClass(e.target.value);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              {['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Class 12+ (Graduate)'].map(c => (
                <option key={c} value={c} className="bg-slate-950 text-white">{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Board Affiliation</label>
            <select
              value={simBoard}
              onChange={(e) => {
                playSfx('click');
                setSimBoard(e.target.value);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="CBSE" className="bg-slate-950">CBSE (Central)</option>
              <option value="ICSE" className="bg-slate-950">ICSE / ISC</option>
              <option value="UP_BOARD" className="bg-slate-950">UP State Board</option>
              <option value="BIHAR_BOARD" className="bg-slate-950">Bihar Board (BSEB)</option>
              <option value="OTHER" className="bg-slate-950">Other Recognized Board</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Academic Stream</label>
            <select
              value={simStream}
              onChange={(e) => {
                playSfx('click');
                setSimStream(e.target.value as AcademicStream);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="PCM" className="bg-slate-950">PCM (Science Math)</option>
              <option value="PCB" className="bg-slate-950">PCB (Science Biology)</option>
              <option value="COMMERCE" className="bg-slate-950">Commerce</option>
              <option value="ARTS" className="bg-slate-950">Arts / Humanities</option>
              <option value="GENERAL" className="bg-slate-950">General Studies</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Domicile Territory</label>
            <select
              value={simState}
              onChange={(e) => {
                playSfx('click');
                setSimState(e.target.value);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="ALL" className="bg-slate-950">Pan-India (Universal)</option>
              {statesList.map(st => (
                <option key={st.id} value={st.name} className="bg-slate-950 text-white">{st.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Candidate Age (Yrs)</label>
            <input
              type="number"
              min={9}
              max={40}
              value={simAge}
              onChange={(e) => setSimAge(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Simulator Filter Controls */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">SIMULATOR VIEW:</span>
            {(['ALL', 'ELIGIBLE', 'LOCKED'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => {
                  playSfx('click');
                  setSimFilterMode(mode);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  simFilterMode === mode
                    ? 'bg-cyan-600 text-white shadow-sm font-black'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {mode === 'ALL' ? `All (${evaluatedExams.length})` : mode === 'ELIGIBLE' ? 'Unlocked Only' : 'Locked Only'}
              </button>
            ))}
          </div>

          <div className="text-slate-400">
            Unlocked: <span className="text-emerald-400 font-bold">{evaluatedExams.filter(e => e.evaluation.isEligible).length}</span> / {evaluatedExams.length} Available Curricula
          </div>
        </div>

        {/* Dynamic Evaluation Output Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-xs font-mono pt-1">
          {displayedSimulatedExams.map(ex => (
            <div
              key={ex.exam.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                ex.evaluation.isEligible
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/60 border-slate-800 opacity-85'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="font-bold text-white text-xs truncate" title={ex.exam.name}>
                    {ex.exam.name}
                  </span>
                  {ex.evaluation.isEligible ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      <Unlock className="w-2.5 h-2.5 text-emerald-400" /> UNLOCKED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40">
                      <Lock className="w-2.5 h-2.5 text-rose-400" /> LOCKED
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-sans">
                  {ex.evaluation.reason}
                </div>
              </div>

              {ex.evaluation.matchingRule && (
                <div className="text-[10px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span>Gate: Class {ex.evaluation.matchingRule.minClass}-{ex.evaluation.matchingRule.maxClass}</span>
                    <span className="text-cyan-400">P{ex.evaluation.matchingRule.priority || 1}</span>
                  </div>
                  <div className="text-slate-500 truncate">
                    Streams: {ex.evaluation.matchingRule.allowedStreams?.join(', ') || ex.evaluation.matchingRule.targetStream || 'ANY'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. SEARCH, STATUS TABS, CATEGORY & MULTI-AXIS SORT CONTROLS          */}
      {/* ==================================================================== */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 font-mono text-xs">
        {/* Status Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: `All Rules (${rules.length})` },
            { id: 'ACTIVE', label: `Active (${activeRuleCount})` },
            { id: 'DRAFT', label: `Draft (${draftRuleCount})` },
            { id: 'EXPIRED', label: `Expired (${expiredRuleCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                playSfx('click');
                setStatusFilter(tab.id as any);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search, Category & Sorting */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search exam, board, state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              playSfx('click');
              setCategoryFilter(e.target.value);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL" className="bg-slate-950">All Categories</option>
            <option value="ADMISSION_EXAMS" className="bg-slate-950">School Entrance (CHS, Navodaya)</option>
            <option value="ENGINEERING" className="bg-slate-950">Engineering (JEE Main / Adv)</option>
            <option value="MEDICAL" className="bg-slate-950">Medical (NEET UG)</option>
            <option value="FOUNDATION" className="bg-slate-950">Foundation & Olympiad</option>
            <option value="GOVERNMENT" className="bg-slate-950">Government Service</option>
            <option value="STATE_EXAMS" className="bg-slate-950">State Specific Exams</option>
          </select>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">SORT:</span>
            <select
              value={sortOption}
              onChange={(e) => {
                playSfx('click');
                setSortOption(e.target.value as SortKey);
              }}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="priority_asc" className="bg-slate-950 text-white">Priority (P1 → P5)</option>
              <option value="priority_desc" className="bg-slate-950 text-white">Priority (P5 → P1)</option>
              <option value="class_asc" className="bg-slate-950 text-white">Class (Low → High)</option>
              <option value="class_desc" className="bg-slate-950 text-white">Class (High → Low)</option>
              <option value="geo_tier" className="bg-slate-950 text-white">Geo Specificity (Local First)</option>
              <option value="name_asc" className="bg-slate-950 text-white">Exam Name (A-Z)</option>
              <option value="effective_desc" className="bg-slate-950 text-white">Effective Date (Newest)</option>
            </select>
          </div>

          {/* Export Matrix Button */}
          <button
            onClick={handleExportMatrix}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. CONFIGRED ELIGIBILITY RULES DIRECTORY TABLE                       */}
      {/* ==================================================================== */}
      <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800 text-xs font-mono">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Configured Eligibility Rules & Curricula Gates Directory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Definitive registry of access rules governing candidate stream gates, board affiliations, age parameters, and geographic quotas.
            </p>
          </div>

          <div className="text-slate-400">
            Showing <span className="text-cyan-400 font-bold">{filteredAndSortedRules.length}</span> of {rules.length} gates
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs min-w-[1050px]">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] font-mono font-bold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Target Exam & Category</th>
                <th className="px-4 py-3.5">Class & Permitted Streams</th>
                <th className="px-4 py-3.5">Board & Territorial Scope</th>
                <th className="px-4 py-3.5">Academic Year & Age</th>
                <th className="px-4 py-3.5 text-center">Priority</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5">Effective Date</th>
                <th className="px-4 py-3.5">Audit Authority</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/70 font-mono">
              {filteredAndSortedRules.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="text-slate-400 font-bold text-sm">No eligibility rules match current territory or filter criteria</div>
                      <div className="text-slate-500 text-xs max-w-md font-sans">
                        Try resetting territory scope to Nationwide or clearing your search term.
                      </div>
                      <button
                        onClick={handleResetNationwide}
                        className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer font-mono"
                      >
                        Reset Nationwide Scope
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedRules.map(rule => (
                  <tr key={rule.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold text-white text-xs">{rule.examName}</div>
                      <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{rule.examId}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase">
                        {(rule.category || 'EXAM').replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-bold text-white text-xs">
                        Class {rule.minClass} to {rule.maxClass}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(rule.allowedStreams || (rule.targetStream ? [rule.targetStream] : ['ANY'])).map((st: string) => (
                          <span key={st} className="px-2 py-0.5 rounded-md bg-slate-900 text-[9px] font-bold text-slate-300 border border-slate-800">
                            {st}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold text-white">{rule.board || 'All Boards'}</div>
                      <div className="text-[11px] text-amber-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{rule.localityName ? `${rule.localityName}, ` : ''}</span>
                        <span>{rule.districtName ? `${rule.districtName}, ` : ''}</span>
                        <span>{rule.stateName || rule.applicableState || 'Pan-India'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-300 text-[11px]">
                      <div>{rule.academicYear || '2026-2027'}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {rule.minAge && rule.maxAge ? `${rule.minAge}-${rule.maxAge} Yrs` : 'Universal Age'}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                        P{rule.priority || 1}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      {(rule.ruleStatus === 'ACTIVE' || (!rule.ruleStatus && rule.status === 'ACTIVE')) ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
                        </span>
                      ) : rule.ruleStatus === 'DRAFT' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3 text-amber-400" /> Draft
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800">
                          Expired
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-slate-400 text-[11px]">
                      {rule.effectiveFrom || '2026-01-01'}
                    </td>

                    <td className="px-4 py-4 text-slate-400 text-[11px]">
                      <div className="text-slate-300">{rule.createdBy || 'Super Admin'}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {rule.updatedAt ? new Date(rule.updatedAt).toLocaleDateString('en-IN') : 'Master'}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleInspectRule(rule)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                          title="Inspect Gating"
                        >
                          <Eye className="w-3 h-3 text-cyan-400" />
                          <span>Inspect</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(rule)}
                          className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
                          title="Edit Gate"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1.5 rounded-lg bg-rose-950/60 text-rose-400 hover:bg-rose-900/80 border border-rose-800 transition-all cursor-pointer"
                          title="Delete Gate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 6. QUANTUM GATE RESOLUTION INSPECTOR MODAL                          */}
      {/* ==================================================================== */}
      {isInspectorOpen && inspectedRule && (
        <Modal
          isOpen={true}
          onClose={() => setIsInspectorOpen(false)}
          title={`Eligibility Gate Inspector — ${inspectedRule.examName}`}
          size="md"
        >
          <div className="space-y-4 text-xs font-mono text-slate-300 bg-slate-950 p-1 rounded-2xl">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Rule Gate ID:</span>
                <span className="text-cyan-400 font-bold">{inspectedRule.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Target Examination:</span>
                <span className="font-bold text-white">{inspectedRule.examName} ({inspectedRule.examId})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Class Window:</span>
                <span className="font-bold text-emerald-400">Class {inspectedRule.minClass} to {inspectedRule.maxClass}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Permitted Streams:</span>
                <span className="font-bold text-slate-200">
                  {(inspectedRule.allowedStreams || [inspectedRule.targetStream || 'ANY']).join(', ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Territory Jurisdiction:</span>
                <span className="font-bold text-amber-300">
                  {inspectedRule.localityName ? `${inspectedRule.localityName}, ` : ''}
                  {inspectedRule.districtName ? `${inspectedRule.districtName}, ` : ''}
                  {inspectedRule.stateName || inspectedRule.applicableState || 'Pan-India'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Age Range Bounds:</span>
                <span className="font-bold text-slate-200">
                  {inspectedRule.minAge && inspectedRule.maxAge ? `${inspectedRule.minAge} - ${inspectedRule.maxAge} Years` : 'No Bound'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-cyan-300 text-xs flex items-center gap-1.5 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Access Gate Verification Pipeline:
              </h4>
              <ul className="space-y-1.5 text-slate-300 font-sans text-xs">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1. Class Verification:</strong> Candidate must be actively enrolled in class between {inspectedRule.minClass} and {inspectedRule.maxClass}.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>2. Stream Verification:</strong> Candidate registered stream must match: {(inspectedRule.allowedStreams || [inspectedRule.targetStream || 'ANY']).join(', ')}.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>3. Domicile Verification:</strong> Applied to candidate state affiliation ({inspectedRule.stateName || inspectedRule.applicableState || 'All India'}).</span>
                </li>
              </ul>

              {inspectedRule.ineligibleReason && (
                <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-amber-300 font-sans">
                  <strong>Student Restriction Notice:</strong> "{inspectedRule.ineligibleReason}"
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsInspectorOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold transition-all cursor-pointer text-xs border border-slate-700 font-mono"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* 7. CREATE / EDIT ELIGIBILITY GATE MODAL WITH CASCADING LOCATION     */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRule ? 'Edit Exam Eligibility Gate' : 'Create New Eligibility Gate'}
        size="lg"
      >
        <div className="space-y-4 text-xs font-mono text-slate-200 bg-slate-950 p-1 rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Exam Identifier *
              </label>
              <input
                type="text"
                value={formExamId}
                onChange={(e) => setFormExamId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Exam Display Name *
              </label>
              <input
                type="text"
                value={formExamName}
                onChange={(e) => setFormExamName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Exam Category *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
              >
                <option value="ADMISSION_EXAMS" className="bg-slate-950">School Entrance (CHS, Navodaya)</option>
                <option value="ENGINEERING" className="bg-slate-950">Engineering (JEE Main / Adv)</option>
                <option value="MEDICAL" className="bg-slate-950">Medical (NEET UG)</option>
                <option value="FOUNDATION" className="bg-slate-950">Foundation & Olympiad</option>
                <option value="GOVERNMENT" className="bg-slate-950">Government Service</option>
                <option value="STATE_EXAMS" className="bg-slate-950">State Specific Exams</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Board Affiliation
              </label>
              <select
                value={formBoard}
                onChange={(e) => setFormBoard(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
              >
                <option value="ALL" className="bg-slate-950">All Boards (Universal)</option>
                <option value="CBSE" className="bg-slate-950">CBSE</option>
                <option value="ICSE" className="bg-slate-950">ICSE</option>
                <option value="UP_BOARD" className="bg-slate-950">UP State Board</option>
                <option value="BIHAR_BOARD" className="bg-slate-950">Bihar Board (BSEB)</option>
                <option value="OTHER" className="bg-slate-950">Other State Board</option>
              </select>
            </div>
          </div>

          {/* Cascading Geographic Corridor Assignment */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="text-[10px] text-cyan-400 uppercase font-bold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Geographic Territory Gating (Optional / Specific Quotas):
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* State */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">State / UT Domicile</label>
                <select
                  value={formStateId}
                  onChange={(e) => handleFormStateChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="">Pan-India (All States)</option>
                  {statesList.map(st => (
                    <option key={st.id} value={st.id} className="bg-slate-950 text-white">{st.name}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">District Quota</label>
                <select
                  disabled={!formStateId}
                  value={formDistrictId}
                  onChange={(e) => handleFormDistrictChange(e.target.value)}
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs ${
                    !formStateId
                      ? 'bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-950 border-slate-700 text-white focus:outline-none focus:border-cyan-500 cursor-pointer'
                  }`}
                >
                  <option value="">All Districts in State</option>
                  {formDistricts.map(d => (
                    <option key={d.id} value={d.id} className="bg-slate-950 text-white">{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Locality */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Locality / Cluster</label>
                <select
                  disabled={!formDistrictId}
                  value={formLocalityId}
                  onChange={(e) => handleFormLocalityChange(e.target.value)}
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs ${
                    !formDistrictId
                      ? 'bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-950 border-slate-700 text-white focus:outline-none focus:border-cyan-500 cursor-pointer'
                  }`}
                >
                  <option value="">All Localities in District</option>
                  {formLocalities.map(l => (
                    <option key={l.id} value={l.id} className="bg-slate-950 text-white">{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Min Class (1-12) *
              </label>
              <input
                type="number"
                min={1}
                max={16}
                value={formMinClass}
                onChange={(e) => setFormMinClass(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Max Class (1-16) *
              </label>
              <input
                type="number"
                min={1}
                max={16}
                value={formMaxClass}
                onChange={(e) => setFormMaxClass(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Min Age (Yrs)
              </label>
              <input
                type="number"
                placeholder="Optional"
                value={formMinAge || ''}
                onChange={(e) => setFormMinAge(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Max Age (Yrs)
              </label>
              <input
                type="number"
                placeholder="Optional"
                value={formMaxAge || ''}
                onChange={(e) => setFormMaxAge(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={formAcademicYear}
                onChange={(e) => setFormAcademicYear(e.target.value)}
                placeholder="e.g. 2026-2027"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Rule Priority
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
              >
                <option value={1} className="bg-slate-950">Priority 1 (Highest Precedence)</option>
                <option value={2} className="bg-slate-950">Priority 2</option>
                <option value={3} className="bg-slate-950">Priority 3</option>
                <option value={4} className="bg-slate-950">Priority 4</option>
                <option value={5} className="bg-slate-950">Priority 5 (Lowest)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Rule Status
              </label>
              <select
                value={formRuleStatus}
                onChange={(e) => setFormRuleStatus(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
              >
                <option value="ACTIVE" className="bg-slate-950">Active (Live Enforced)</option>
                <option value="DRAFT" className="bg-slate-950">Draft (Sandbox)</option>
                <option value="EXPIRED" className="bg-slate-950">Expired (Archived)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1.5">
              Permitted Academic Streams (Select at least 1)
            </label>
            <div className="flex flex-wrap gap-2">
              {(['PCM', 'PCB', 'COMMERCE', 'ARTS', 'GENERAL'] as AcademicStream[]).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => toggleStreamCheckbox(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    formStreams.includes(st)
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1">
              Lock / Ineligibility Explanation (Shown to restricted students)
            </label>
            <textarea
              rows={2}
              value={formIneligibleReason}
              onChange={(e) => setFormIneligibleReason(e.target.value)}
              placeholder="e.g. This exam requires Science (PCM) stream in Class 11 or 12."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold transition-all cursor-pointer text-xs border border-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveRule}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all cursor-pointer text-xs shadow-md shadow-cyan-600/30"
            >
              {editingRule ? 'Save Gate Changes' : 'Create Eligibility Gate'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
