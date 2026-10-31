// FOCUSPOINT — Super Admin Priority Pricing Rule Authority Engine
// Hierarchical Pricing Rule Engine CRUD, Cascading Location Selector & "Why this price applies?" Quantum Inspector

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  DollarSign, 
  Tag, 
  Layers, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Filter, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info, 
  Check, 
  Calendar, 
  Building, 
  GraduationCap, 
  Users, 
  MapPin, 
  Globe, 
  HelpCircle, 
  ChevronRight, 
  Sparkles, 
  FileCheck2, 
  X,
  Volume2,
  VolumeX,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Compass,
  Navigation,
  Percent,
  Activity,
  Layers3,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { locationService } from '../../services/locationService';
import { State, DistrictLocation, Locality } from '../../types/location';
import { pricingResolutionService, StudentPricingContext } from '../../services/pricingResolutionService';
import { AcademicPricingRule, AcademicProduct, PricingScope, ResolvedPriceResult } from '../../types/eligibilityAndPricing';

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
  | 'price_asc' 
  | 'price_desc' 
  | 'discount_desc' 
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

export const SuperAdminPricingRules: React.FC = () => {
  const { addToast } = useToast();

  // Audio SFX state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fp_pricing_sfx_enabled') !== 'false';
  });

  const playSfx = (type: SfxType) => {
    if (soundEnabled) playCyberSound(type);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('fp_pricing_sfx_enabled', String(next));
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

  // Toggle to include national baseline rules in localized views
  const [includeNationalBaseline, setIncludeNationalBaseline] = useState<boolean>(true);

  // Products and Rules Data
  const [products, setProducts] = useState<AcademicProduct[]>([]);
  const [pricingRules, setPricingRules] = useState<AcademicPricingRule[]>([]);
  const [selectedScope, setSelectedScope] = useState<string>('ALL');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortKey>('priority_asc');

  // Modal State for Rule CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AcademicPricingRule | null>(null);
  const [formProductId, setFormProductId] = useState('');
  const [formScope, setFormScope] = useState<PricingScope>('DISTRICT');
  const [formScopeId, setFormScopeId] = useState('');
  const [formScopeName, setFormScopeName] = useState('');
  const [formStateId, setFormStateId] = useState('');
  const [formStateName, setFormStateName] = useState('');
  const [formDistrictId, setFormDistrictId] = useState('');
  const [formDistrictName, setFormDistrictName] = useState('');
  const [formLocalityId, setFormLocalityId] = useState('');
  const [formLocalityName, setFormLocalityName] = useState('');
  const [formPrice, setFormPrice] = useState<number>(299);
  const [formEffectiveFrom, setFormEffectiveFrom] = useState('');
  const [formEffectiveUntil, setFormEffectiveUntil] = useState('');

  // Form cascading district & locality states
  const [formDistricts, setFormDistricts] = useState<DistrictLocation[]>([]);
  const [formLocalities, setFormLocalities] = useState<Locality[]>([]);

  // "Why this price applies?" Inspector Drawer / Modal State
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectedRule, setInspectedRule] = useState<AcademicPricingRule | null>(null);

  // Priority Simulator State
  const [simProductId, setSimProductId] = useState<string>('');
  const [simStudentId, setSimStudentId] = useState<string>('usr-student-aryan');
  const [simTeacherId, setSimTeacherId] = useState<string>('usr-teacher-rajesh');
  const [simLibraryId, setSimLibraryId] = useState<string>('lib-saidpur-central');
  const [simStateId, setSimStateId] = useState<string>('loc-state-up');
  const [simDistrictId, setSimDistrictId] = useState<string>('dist-gzp');
  const [simLocalityId, setSimLocalityId] = useState<string>('loc-saidpur');
  const [simLocalityName, setSimLocalityName] = useState<string>('Saidpur');
  const [simCoupon, setSimCoupon] = useState<string>('FOCUS50');
  const [simResult, setSimResult] = useState<ResolvedPriceResult | null>(null);

  // Simulator Cascading Lists
  const [simDistrictsList, setSimDistrictsList] = useState<DistrictLocation[]>([]);
  const [simLocalitiesList, setSimLocalitiesList] = useState<Locality[]>([]);

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

  // Simulator District & Locality Sync
  useEffect(() => {
    if (simStateId) {
      const dists = locationService.getDistricts(simStateId, true);
      setSimDistrictsList(dists);
      if (dists.length > 0 && !dists.some(d => d.id === simDistrictId)) {
        setSimDistrictId(dists[0].id);
      }
    } else {
      setSimDistrictsList([]);
      setSimDistrictId('');
    }
  }, [simStateId]);

  useEffect(() => {
    if (simDistrictId) {
      const locs = locationService.getLocalities(simDistrictId, true);
      setSimLocalitiesList(locs);
      if (locs.length > 0 && !locs.some(l => l.id === simLocalityId)) {
        setSimLocalityId(locs[0].id);
        setSimLocalityName(locs[0].name);
      }
    } else {
      setSimLocalitiesList([]);
      setSimLocalityId('');
      setSimLocalityName('');
    }
  }, [simDistrictId]);

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

  // Refresh Core Data from Service
  const refreshData = () => {
    const prods = pricingResolutionService.getAllProducts();
    const rules = pricingResolutionService.getAllPricingRules();
    setProducts(prods);
    setPricingRules(rules);
    if (prods.length > 0 && !simProductId) {
      setSimProductId(prods[0].id);
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = pricingResolutionService.subscribe(refreshData);
    return () => unsub();
  }, []);

  // Priority Rank Numerical Helper
  const getScopePriority = (scope: PricingScope) => {
    switch (scope) {
      case 'STUDENT': return { rank: 1, label: 'Priority 1 (Highest)', tierColor: 'emerald' };
      case 'TEACHER': return { rank: 2, label: 'Priority 2 (Mentorship)', tierColor: 'blue' };
      case 'LIBRARY': return { rank: 3, label: 'Priority 3 (Desk Subsidies)', tierColor: 'purple' };
      case 'LOCALITY': return { rank: 4, label: 'Priority 4 (Hyper-Local Hub)', tierColor: 'cyan' };
      case 'DISTRICT': return { rank: 5, label: 'Priority 5 (District Quota)', tierColor: 'amber' };
      case 'STATE': return { rank: 6, label: 'Priority 6 (State Grant)', tierColor: 'rose' };
      default: return { rank: 7, label: 'Priority 7 (National Base)', tierColor: 'slate' };
    }
  };

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
    addToast(`Territory focused on ${resolvedName}`, 'success');
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
    addToast(`District focused on ${resolvedDistName}`, 'success');
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
    addToast(`Locality hub focused on ${resolvedLocName}`, 'success');
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
    addToast('Pricing scope reset to Nationwide Pan-India', 'info');
  };

  // Filtered & Sorted Rules Engine
  const filteredAndSortedRules = useMemo(() => {
    const list = pricingRules.filter(r => {
      // 1. Scope filter
      const matchScope = selectedScope === 'ALL' || r.scope === selectedScope;

      // 2. Product filter
      const matchProduct = selectedProductFilter === 'ALL' || r.productId === selectedProductFilter;

      // 3. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (
        r.productName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        (r.scopeName && r.scopeName.toLowerCase().includes(q)) ||
        (r.scopeId && r.scopeId.toLowerCase().includes(q)) ||
        (r.stateName && r.stateName.toLowerCase().includes(q)) ||
        (r.districtName && r.districtName.toLowerCase().includes(q)) ||
        (r.localityName && r.localityName.toLowerCase().includes(q)) ||
        (r.createdBy && r.createdBy.toLowerCase().includes(q)) ||
        String(r.price).includes(q)
      );

      // 4. Territory Filter
      let matchLocation = true;
      if (selectedLocation.level !== 'INDIA') {
        const isNationalRule = r.scope === 'PAN_INDIA';

        if (selectedLocation.level === 'STATE') {
          const isDirectState = r.stateName?.toLowerCase() === selectedLocation.stateName.toLowerCase() ||
                                r.stateId === selectedLocation.stateId ||
                                (r.scope === 'STATE' && r.scopeId === selectedLocation.stateId);
          const isDistrictUnderState = r.stateName?.toLowerCase() === selectedLocation.stateName.toLowerCase();
          const isEntityUnderState = r.stateName?.toLowerCase() === selectedLocation.stateName.toLowerCase();
          
          matchLocation = isDirectState || isDistrictUnderState || isEntityUnderState || (includeNationalBaseline && isNationalRule);
        } else if (selectedLocation.level === 'DISTRICT') {
          const isDirectDistrict = r.districtName?.toLowerCase() === selectedLocation.districtName.toLowerCase() ||
                                   r.districtId === selectedLocation.districtId ||
                                   (r.scope === 'DISTRICT' && r.scopeId === selectedLocation.districtId);
          const isLocalityUnderDistrict = r.districtName?.toLowerCase() === selectedLocation.districtName.toLowerCase();
          const isParentState = r.scope === 'STATE' && (r.stateName?.toLowerCase() === selectedLocation.stateName.toLowerCase());
          
          matchLocation = isDirectDistrict || isLocalityUnderDistrict || isParentState || (includeNationalBaseline && isNationalRule);
        } else if (selectedLocation.level === 'LOCALITY') {
          const isDirectLocality = r.localityName?.toLowerCase() === selectedLocation.localityName.toLowerCase() ||
                                   r.localityId === selectedLocation.localityId ||
                                   (r.scope === 'LOCALITY' && r.scopeId === selectedLocation.localityId);
          const isParentDistrict = r.districtName?.toLowerCase() === selectedLocation.districtName.toLowerCase();
          const isParentState = r.stateName?.toLowerCase() === selectedLocation.stateName.toLowerCase();
          
          matchLocation = isDirectLocality || isParentDistrict || isParentState || (includeNationalBaseline && isNationalRule);
        }
      }

      return matchScope && matchProduct && matchSearch && matchLocation;
    });

    // Multi-Axis Sorting
    return list.sort((a, b) => {
      const prodA = products.find(p => p.id === a.productId);
      const prodB = products.find(p => p.id === b.productId);
      const baseA = prodA ? prodA.basePrice : a.price;
      const baseB = prodB ? prodB.basePrice : b.price;
      const discA = Math.max(0, baseA - a.price);
      const discB = Math.max(0, baseB - b.price);

      const rankA = getScopePriority(a.scope).rank;
      const rankB = getScopePriority(b.scope).rank;

      switch (sortOption) {
        case 'priority_asc':
          return rankA - rankB;
        case 'priority_desc':
          return rankB - rankA;
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'discount_desc':
          return discB - discA;
        case 'name_asc':
          return a.productName.localeCompare(b.productName);
        case 'effective_desc':
          return (b.effectiveFrom || '').localeCompare(a.effectiveFrom || '');
        case 'geo_tier': {
          // Sort by hyper-local first, then district, state, national, then entities
          const geoWeight = (scope: PricingScope) => {
            if (scope === 'LOCALITY') return 1;
            if (scope === 'DISTRICT') return 2;
            if (scope === 'STATE') return 3;
            if (scope === 'PAN_INDIA') return 4;
            return 5;
          };
          return geoWeight(a.scope) - geoWeight(b.scope);
        }
        default:
          return rankA - rankB;
      }
    });
  }, [pricingRules, selectedScope, selectedProductFilter, searchQuery, selectedLocation, includeNationalBaseline, sortOption, products]);

  // Real-time Simulation Engine
  useEffect(() => {
    if (!simProductId) return;
    const res = pricingResolutionService.resolveProductPrice(simProductId, {
      studentId: simStudentId,
      teacherId: simTeacherId,
      libraryId: simLibraryId,
      districtId: simDistrictId,
      stateId: simStateId,
      localityId: simLocalityId,
      localityName: simLocalityName,
      couponCode: simCoupon || undefined
    });
    setSimResult(res);
  }, [simProductId, simStudentId, simTeacherId, simLibraryId, simDistrictId, simStateId, simLocalityId, simLocalityName, simCoupon, pricingRules]);

  // Open Modal for Add
  const handleOpenAddModal = () => {
    playSfx('warp');
    setEditingRule(null);
    setFormProductId(products[0]?.id || '');
    setFormScope('DISTRICT');
    setFormStateId(selectedLocation.stateId || 'loc-state-up');
    setFormStateName(selectedLocation.stateName || 'Uttar Pradesh');
    setFormDistrictId(selectedLocation.districtId || 'dist-gzp');
    setFormDistrictName(selectedLocation.districtName || 'Ghazipur');
    setFormLocalityId(selectedLocation.localityId || '');
    setFormLocalityName(selectedLocation.localityName || '');
    setFormScopeId(selectedLocation.districtId || 'dist-gzp');
    setFormScopeName(`${selectedLocation.districtName || 'Ghazipur'} District Quota`);
    setFormPrice(299);
    setFormEffectiveFrom(new Date().toISOString().split('T')[0]);
    setFormEffectiveUntil('2026-12-31');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (rule: AcademicPricingRule) => {
    playSfx('click');
    setEditingRule(rule);
    setFormProductId(rule.productId);
    setFormScope(rule.scope);
    setFormScopeId(rule.scopeId || '');
    setFormScopeName(rule.scopeName || '');
    setFormStateId(rule.stateId || '');
    setFormStateName(rule.stateName || '');
    setFormDistrictId(rule.districtId || '');
    setFormDistrictName(rule.districtName || '');
    setFormLocalityId(rule.localityId || '');
    setFormLocalityName(rule.localityName || '');
    setFormPrice(rule.price);
    setFormEffectiveFrom(rule.effectiveFrom || '');
    setFormEffectiveUntil(rule.effectiveUntil || '');
    setIsModalOpen(true);
  };

  const handleInspectRule = (rule: AcademicPricingRule) => {
    playSfx('warp');
    setInspectedRule(rule);
    setIsInspectorOpen(true);
  };

  // Form State Selection Handlers
  const handleFormStateChange = (stId: string) => {
    setFormStateId(stId);
    const stObj = statesList.find(s => s.id === stId);
    const stName = stObj ? stObj.name : '';
    setFormStateName(stName);

    // Reset dependent
    setFormDistrictId('');
    setFormDistrictName('');
    setFormLocalityId('');
    setFormLocalityName('');

    if (formScope === 'STATE') {
      setFormScopeId(stId);
      setFormScopeName(`${stName} State Grant`);
    }
  };

  const handleFormDistrictChange = (distId: string) => {
    setFormDistrictId(distId);
    const distObj = formDistricts.find(d => d.id === distId);
    const distName = distObj ? distObj.name : '';
    setFormDistrictName(distName);

    // Reset locality
    setFormLocalityId('');
    setFormLocalityName('');

    if (formScope === 'DISTRICT') {
      setFormScopeId(distId);
      setFormScopeName(`${distName} District Quota`);
    }
  };

  const handleFormLocalityChange = (locId: string) => {
    setFormLocalityId(locId);
    const locObj = formLocalities.find(l => l.id === locId);
    const locName = locObj ? locObj.name : '';
    setFormLocalityName(locName);

    if (formScope === 'LOCALITY') {
      setFormScopeId(locId);
      setFormScopeName(`${locName} Study Cluster Pass`);
    }
  };

  // Save Rule
  const handleSaveRule = () => {
    playSfx('confirm');
    if (!formProductId || formPrice < 0) {
      addToast('Please provide valid product and non-negative price', 'error');
      return;
    }

    const prod = products.find(p => p.id === formProductId);
    const rule: AcademicPricingRule = {
      id: editingRule ? editingRule.id : `rule-${Date.now()}`,
      productId: formProductId,
      productName: prod ? prod.name : 'Subscription',
      scope: formScope,
      scopeId: formScopeId.trim() || undefined,
      scopeName: formScopeName.trim() || undefined,
      stateId: formStateId || undefined,
      stateName: formStateName || undefined,
      districtId: formDistrictId || undefined,
      districtName: formDistrictName || undefined,
      localityId: formLocalityId || undefined,
      localityName: formLocalityName || undefined,
      price: Number(formPrice),
      effectiveFrom: formEffectiveFrom || new Date().toISOString().split('T')[0],
      effectiveUntil: formEffectiveUntil || undefined,
      status: 'ACTIVE',
      createdBy: editingRule ? editingRule.createdBy : 'Super Admin (Highway)',
      updatedAt: new Date().toISOString()
    };

    pricingResolutionService.savePricingRule(rule);
    setIsModalOpen(false);
    addToast(`Pricing rule ${editingRule ? 'updated' : 'created'} successfully!`, 'success');
  };

  // Delete Rule
  const handleDeleteRule = (id: string) => {
    playSfx('alert');
    if (confirm('Are you sure you want to delete this pricing rule?')) {
      pricingResolutionService.deletePricingRule(id);
      addToast('Pricing rule permanently deleted', 'info');
    }
  };

  // Scope Badge Renderer
  const getScopeBadge = (scope: PricingScope) => {
    switch (scope) {
      case 'STUDENT':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 uppercase font-mono tracking-wider">
            <Users className="w-3 h-3 text-emerald-400" /> Scholar (P1)
          </span>
        );
      case 'TEACHER':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1 uppercase font-mono tracking-wider">
            <GraduationCap className="w-3 h-3 text-blue-400" /> Mentor (P2)
          </span>
        );
      case 'LIBRARY':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1 uppercase font-mono tracking-wider">
            <Building className="w-3 h-3 text-purple-400" /> Library (P3)
          </span>
        );
      case 'LOCALITY':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1 uppercase font-mono tracking-wider">
            <Navigation className="w-3 h-3 text-cyan-400" /> Locality (P4)
          </span>
        );
      case 'DISTRICT':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 uppercase font-mono tracking-wider">
            <MapPin className="w-3 h-3 text-amber-400" /> District (P5)
          </span>
        );
      case 'STATE':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 uppercase font-mono tracking-wider">
            <Building className="w-3 h-3 text-rose-400" /> State (P6)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 uppercase font-mono tracking-wider">
            <Globe className="w-3 h-3 text-slate-400" /> National (P7)
          </span>
        );
    }
  };

  // Metrics Bar Computations
  const maxDiscountRule = useMemo(() => {
    let best = { discount: 0, rule: null as AcademicPricingRule | null };
    pricingRules.forEach(r => {
      const p = products.find(prod => prod.id === r.productId);
      const base = p ? p.basePrice : r.price;
      const diff = Math.max(0, base - r.price);
      if (diff > best.discount) {
        best = { discount: diff, rule: r };
      }
    });
    return best;
  }, [pricingRules, products]);

  const geoScopedCount = useMemo(() => {
    return pricingRules.filter(r => r.scope === 'STATE' || r.scope === 'DISTRICT' || r.scope === 'LOCALITY').length;
  }, [pricingRules]);

  // Export dossier
  const handleExportDossier = () => {
    playSfx('warp');
    const csvHeader = 'Rule ID,Product Name,Scope,Priority,Price,Scope Name,State,District,Locality,Effective From,Status\n';
    const csvRows = filteredAndSortedRules.map(r => {
      const p = getScopePriority(r.scope).rank;
      return `"${r.id}","${r.productName}","${r.scope}","P${p}",${r.price},"${r.scopeName || ''}","${r.stateName || ''}","${r.districtName || ''}","${r.localityName || ''}","${r.effectiveFrom}","${r.status}"`;
    }).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focuspoint-priority-pricing-rules-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Pricing rules dossier exported successfully', 'success');
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* ==================================================================== */}
      {/* 1. TIER 3 COCKPIT HEADER WITH 3D QUANTUM PRICING ENGINE ORB          */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-slate-800 p-6 md:p-8 shadow-2xl hud-corner-brackets">
        {/* Ambient Laser Gradients */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cockpit Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-400 font-bold uppercase tracking-widest text-[11px]">
              SUPER ADMIN COMMERCIAL HIGHWAY // PRIORITY PRICING RULE AUTHORITY
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">7-TIER STRICT CASCADING ENGINE</span>
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
                P1 → P7 DETERMINISTIC RESOLUTION
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                0ms LOCALITY COGNITIVE OVERRIDES
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Tag className="w-7 h-7 text-cyan-400 shrink-0" />
              Priority Pricing Rules Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Enforce hierarchical pricing overrides across Pan-India tiers (Student $\rightarrow$ Teacher $\rightarrow$ Library $\rightarrow$ Locality $\rightarrow$ District $\rightarrow$ State $\rightarrow$ National Baseline). Includes interactive cascading location search, multi-axis sorting, and quantum resolution trace.
            </p>
          </div>

          {/* 3D Quantum Engine Orb */}
          <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-inner shrink-0 self-start lg:self-auto">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" strokeDasharray="6 8" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="1" strokeDasharray="3 6" />
              </svg>
              <svg className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite_reverse]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeDasharray="4 4" />
              </svg>

              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 via-amber-500 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/30 animate-pulse flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-300" />
                </div>
              </div>
            </div>

            <div className="ml-3 font-mono text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">PRICING ENGINE CORE</div>
              <div className="text-sm font-black text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                {pricingRules.length} Active Overrides
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">
                Max Concession: <span className="text-emerald-400 font-bold">₹{maxDiscountRule.discount} OFF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Laser Divider */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent my-6 opacity-40" />

        {/* Cockpit KPI Telemetry Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Total Pricing Rules</div>
            <div className="text-xl font-black text-white font-mono mt-0.5">{pricingRules.length}</div>
            <div className="text-[10px] text-cyan-400 font-mono mt-0.5">Across 7 Precedence Tiers</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Geographic Overrides</div>
            <div className="text-xl font-black text-amber-400 font-mono mt-0.5">{geoScopedCount}</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">State, District & Locality</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Max Concession Benefit</div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">₹{maxDiscountRule.discount}</div>
            <div className="text-[10px] text-emerald-300 font-mono mt-0.5">Up to 40% Merit Concession</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Evaluation Latency</div>
            <div className="text-xl font-black text-cyan-300 font-mono mt-0.5">&lt;0.8ms</div>
            <div className="text-[10px] text-cyan-400 font-mono mt-0.5">Instant O(1) Precedence</div>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-emerald-950/60 border border-cyan-800/50 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddModal}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black font-mono shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Pricing Rule</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. STRICT 7-TIER HIERARCHY PRECEDENCE FLOW BANNER                    */}
      {/* ==================================================================== */}
      <div className="p-4 md:p-5 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-xl hud-corner-brackets space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
          <div className="flex items-center gap-2 text-white font-bold">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="uppercase tracking-wider">Strict Evaluation Order Cascade (Ascending Numeric Precedence):</span>
          </div>
          <span className="text-[11px] text-amber-400 font-medium">
            Higher priority immediately preempts downstream tiers
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>1. Student (P1)</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 shadow-sm">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            <span>2. Teacher (P2)</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-sm">
            <Building className="w-3.5 h-3.5 text-purple-400" />
            <span>3. Library (P3)</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500 flex items-center gap-1.5 shadow-md shadow-cyan-500/20 font-black">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>4. Locality (P4)</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>5. District (P5)</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
            <Building className="w-3.5 h-3.5 text-rose-400" />
            <span>6. State (P6)</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-slate-400 border border-slate-800 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>7. National Base (P7)</span>
          </span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. DEDICATED PANORAMIC PAN-INDIA LOCATION COMMAND CONSOLE           */}
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
                <span>Pan-India Cognitive Pricing Geo-Highway & Territorial Filter</span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">•</span>
                <span className="text-cyan-400 text-[11px] font-bold">36 States & UTs Active</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Drill down from Nationwide $\rightarrow$ State $\rightarrow$ District Corridor $\rightarrow$ Locality Study Cluster to isolate hyper-local and regional price overrides.
              </div>
            </div>
          </div>

          {/* Active Breadcrumb & Reset */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 uppercase text-[10px]">CURRENT SCOPE:</span>
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
            { label: 'Pan-India (All 36)', state: 'ALL', count: 'All Rules' },
            { label: 'Uttar Pradesh (75 Districts)', state: 'Uttar Pradesh', count: 'UP Quota' },
            { label: 'Bihar (38 Districts)', state: 'Bihar', count: 'Bihar Tier' },
            { label: 'Delhi-NCR (Central)', state: 'Delhi', count: 'Capital Merit' },
            { label: 'Rajasthan (Desert Hub)', state: 'Rajasthan', count: 'Coaching Hub' },
            { label: 'Madhya Pradesh (Central)', state: 'Madhya Pradesh', count: 'Central Zone' },
            { label: 'Maharashtra (Western Hub)', state: 'Maharashtra', count: 'Western Hub' }
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
            <span className="text-slate-400">Matched Rules in Scope:</span>
            <span className="text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
              {filteredAndSortedRules.length} Overrides
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
              checked={includeNationalBaseline}
              onChange={(e) => setIncludeNationalBaseline(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span className="text-[11px]">Include National Baselines (P7) in Localized Scope</span>
          </label>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. LIVE PRIORITY PRICING SIMULATOR & CASCDING INSPECTOR BOX          */}
      {/* ==================================================================== */}
      <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Live Cognitive Priority Pricing Simulator & Cascade Inspector
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Input student context parameters to simulate real-time cascade evaluation and inspect why a specific final price resolves.
            </p>
          </div>

          <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800 uppercase self-start sm:self-auto">
            0ms Cascade Resolver
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 text-xs font-mono">
          <div>
            <label className="block text-slate-400 font-bold mb-1">Target Product</label>
            <select
              value={simProductId}
              onChange={(e) => setSimProductId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              {products.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-950 text-white">{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Scholar ID (P1)</label>
            <input
              type="text"
              value={simStudentId}
              onChange={(e) => setSimStudentId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Mentor Ref (P2)</label>
            <input
              type="text"
              value={simTeacherId}
              onChange={(e) => setSimTeacherId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Library ID (P3)</label>
            <input
              type="text"
              value={simLibraryId}
              onChange={(e) => setSimLibraryId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Simulator Locality Selector (P4) */}
          <div>
            <label className="block text-slate-400 font-bold mb-1">Locality (P4)</label>
            <select
              value={simLocalityId}
              onChange={(e) => {
                setSimLocalityId(e.target.value);
                const locObj = simLocalitiesList.find(l => l.id === e.target.value);
                setSimLocalityName(locObj ? locObj.name : '');
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="">No Locality</option>
              {simLocalitiesList.map(l => (
                <option key={l.id} value={l.id} className="bg-slate-950 text-white">{l.name}</option>
              ))}
            </select>
          </div>

          {/* Simulator District Selector (P5) */}
          <div>
            <label className="block text-slate-400 font-bold mb-1">District (P5)</label>
            <select
              value={simDistrictId}
              onChange={(e) => setSimDistrictId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="">No District</option>
              {simDistrictsList.map(d => (
                <option key={d.id} value={d.id} className="bg-slate-950 text-white">{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Promo Coupon</label>
            <input
              type="text"
              value={simCoupon}
              onChange={(e) => setSimCoupon(e.target.value.toUpperCase())}
              placeholder="e.g. FOCUS50"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Live "Why this price applies?" Resolution Explanation Box */}
        {simResult && (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-5 font-mono shadow-inner">
            <div className="space-y-2 text-xs flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 font-bold">Winning Rule Precedence:</span>
                {getScopeBadge(simResult.appliedScope)}
                <span className="text-white font-bold">({simResult.appliedScopeName})</span>
              </div>

              {/* Natural language reason explanation */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs shadow-inner leading-relaxed">
                <strong className="text-cyan-400">Why this price applies:</strong>{' '}
                {simResult.appliedScope === 'STUDENT' ? (
                  <span>National Merit Scholar rule detected for <code>{simStudentId}</code> and evaluated at highest priority (Priority 1), preempting Teacher, Library, Locality, District, and State tiers.</span>
                ) : simResult.appliedScope === 'TEACHER' ? (
                  <span>Teacher mentorship concession resolved at Priority 2, successfully overriding Library, Locality, District, and State default catalog pricing.</span>
                ) : simResult.appliedScope === 'LIBRARY' ? (
                  <span>Library partnered seat discount applied at Priority 3 for registered member desks at <code>{simLibraryId}</code>.</span>
                ) : simResult.appliedScope === 'LOCALITY' ? (
                  <span>Hyper-local study cluster concession applied at Priority 4 for <code>{simLocalityName || simLocalityId}</code>, overriding District and State rates.</span>
                ) : simResult.appliedScope === 'DISTRICT' ? (
                  <span>District quota concession applied at Priority 5 for <code>{simDistrictId}</code> over State and Pan-India baseline rates.</span>
                ) : simResult.appliedScope === 'STATE' ? (
                  <span>State subsidized educational grant applied at Priority 6 for <code>{simStateId}</code> over Pan-India baseline rates.</span>
                ) : (
                  <span>Standard Pan-India commercial catalog pricing applied (Priority 7) as no overriding student, mentor, library, or localized rule matched.</span>
                )}
              </div>

              <div className="text-slate-400 flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                <span>Base Catalog: <span className="line-through text-slate-500">₹{simResult.basePrice}</span></span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">Rule Concession: -₹{simResult.scopeDiscount}</span>
                {simResult.couponDiscount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-cyan-300 font-bold">Coupon ({simCoupon}): -₹{simResult.couponDiscount}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 lg:text-right shrink-0 p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-lg">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Final Resolved Payable</div>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
                  ₹{simResult.payableTotal}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Total Benefit: ₹{simResult.scopeDiscount + simResult.couponDiscount}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 5. SEARCH BAR, SCOPE TABS, & MULTI-AXIS SORTING CONTROLS             */}
      {/* ==================================================================== */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 font-mono text-xs">
        {/* Scope Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {[
            { id: 'ALL', label: `All Rules (${pricingRules.length})` },
            { id: 'STUDENT', label: 'Scholar (P1)' },
            { id: 'TEACHER', label: 'Mentor (P2)' },
            { id: 'LIBRARY', label: 'Library (P3)' },
            { id: 'LOCALITY', label: 'Locality (P4)' },
            { id: 'DISTRICT', label: 'District (P5)' },
            { id: 'STATE', label: 'State (P6)' },
            { id: 'PAN_INDIA', label: 'National (P7)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                playSfx('click');
                setSelectedScope(tab.id);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedScope === tab.id
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search rule, product, state, district..."
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
              <option value="priority_asc" className="bg-slate-950 text-white">Priority (P1 → P7)</option>
              <option value="priority_desc" className="bg-slate-950 text-white">Priority (P7 → P1)</option>
              <option value="price_asc" className="bg-slate-950 text-white">Price (Low → High)</option>
              <option value="price_desc" className="bg-slate-950 text-white">Price (High → Low)</option>
              <option value="discount_desc" className="bg-slate-950 text-white">Highest Discount</option>
              <option value="geo_tier" className="bg-slate-950 text-white">Geo Hierarchy (Locality First)</option>
              <option value="name_asc" className="bg-slate-950 text-white">Product Name (A-Z)</option>
              <option value="effective_desc" className="bg-slate-950 text-white">Effective Date (Newest)</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportDossier}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 6. ACTIVE PRIORITY PRICING RULES DIRECTORY TABLE                     */}
      {/* ==================================================================== */}
      <div className="p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl hud-corner-brackets">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800 text-xs font-mono">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Active Priority Pricing Rules Directory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live directory of evaluated pricing overrides, geographic scope bindings, effective validity, and audit ledger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Showing <span className="text-cyan-400 font-bold">{filteredAndSortedRules.length}</span> of {pricingRules.length} rules
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs min-w-[1050px]">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] font-mono font-bold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Product & Blueprint</th>
                <th className="px-4 py-3.5">Priority Scope</th>
                <th className="px-4 py-3.5">Territory & Target Scope</th>
                <th className="px-4 py-3.5 text-right">Resolved Price</th>
                <th className="px-4 py-3.5 text-right">Discount</th>
                <th className="px-4 py-3.5">Validity Window</th>
                <th className="px-4 py-3.5 text-center">Rank</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5">Audit Authority</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/70 font-mono">
              {filteredAndSortedRules.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="text-slate-400 font-bold text-sm">No pricing rules match current territory or filter criteria</div>
                      <div className="text-slate-500 text-xs max-w-md">
                        Try resetting territory scope to Nationwide or clearing your search term.
                      </div>
                      <button
                        onClick={handleResetNationwide}
                        className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
                      >
                        Reset Nationwide Scope
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedRules.map(rule => {
                  const prod = products.find(p => p.id === rule.productId);
                  const basePrice = prod ? prod.basePrice : rule.price;
                  const discount = Math.max(0, basePrice - rule.price);
                  const discountPct = basePrice > 0 ? Math.round((discount / basePrice) * 100) : 0;
                  const priorityInfo = getScopePriority(rule.scope);

                  return (
                    <tr key={rule.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-bold text-white text-xs">{rule.productName}</div>
                        <div className="text-[10px] text-cyan-400 font-mono mt-0.5 flex items-center gap-1.5">
                          <span>{rule.productId}</span>
                          {prod && (
                            <span className="text-slate-500">• {prod.durationDays}D Pass</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {getScopeBadge(rule.scope)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-slate-200 font-medium text-xs flex items-center gap-1.5">
                          {rule.stateName && (
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                              {rule.stateName}
                            </span>
                          )}
                          {rule.districtName && (
                            <span className="text-amber-400 text-[11px] font-bold">
                              / {rule.districtName}
                            </span>
                          )}
                          {rule.localityName && (
                            <span className="text-emerald-400 text-[11px] font-bold">
                              / {rule.localityName}
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-1 font-sans">
                          {rule.scopeName || 'Universal Catalog Baseline'}
                        </div>
                        {rule.scopeId && (
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            ID: {rule.scopeId}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="font-black text-emerald-400 text-sm font-mono">
                          ₹{rule.price}
                        </div>
                        {basePrice > rule.price && (
                          <div className="text-[10px] text-slate-500 line-through font-mono mt-0.5">
                            ₹{basePrice}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {discount > 0 ? (
                          <div>
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[10px]">
                              -₹{discount} ({discountPct}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-slate-400 text-[11px]">
                        <div>From: <span className="text-slate-300">{rule.effectiveFrom || 'Immediate'}</span></div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Until: {rule.effectiveUntil || 'No Expiry'}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                          Priority {priorityInfo.rank}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
                        </span>
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
                            title="Why this price applies?"
                          >
                            <HelpCircle className="w-3 h-3 text-cyan-400" />
                            <span>Why?</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(rule)}
                            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
                            title="Edit Rule"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 rounded-lg bg-rose-950/60 text-rose-400 hover:bg-rose-900/80 border border-rose-800 transition-all cursor-pointer"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 7. "WHY THIS PRICE APPLIES?" DETAILED QUANTUM RESOLUTION INSPECTOR   */}
      {/* ==================================================================== */}
      {isInspectorOpen && inspectedRule && (
        <Modal
          isOpen={true}
          onClose={() => setIsInspectorOpen(false)}
          title={`Cognitive Resolution Inspector — ${inspectedRule.productName}`}
          size="md"
        >
          <div className="space-y-4 text-xs font-mono text-slate-300 bg-slate-950 p-1 rounded-2xl">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Rule Authority ID:</span>
                <span className="text-cyan-400 font-bold">{inspectedRule.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Priority Precedence Tier:</span>
                <span className="font-bold text-white">Priority {getScopePriority(inspectedRule.scope).rank} ({inspectedRule.scope})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Territory / Entity Binding:</span>
                <span className="font-bold text-amber-300">
                  {inspectedRule.localityName ? `${inspectedRule.localityName}, ` : ''}
                  {inspectedRule.districtName ? `${inspectedRule.districtName}, ` : ''}
                  {inspectedRule.stateName || 'Pan-India Nationwide'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Designated Scope Name:</span>
                <span className="font-bold text-slate-200">{inspectedRule.scopeName || 'Universal Baseline'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Final Concession Price:</span>
                <span className="font-black text-emerald-400 text-sm">₹{inspectedRule.price}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-cyan-300 text-xs flex items-center gap-1.5 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Deterministic Precedence Rationale:
              </h4>
              <p className="leading-relaxed text-slate-300 font-sans text-xs">
                When a checkout session initiates for <strong>{inspectedRule.productName}</strong>, the engine checks candidate entitlement in ascending numeric priority. Because this rule matches <strong>{inspectedRule.scope} (Priority {getScopePriority(inspectedRule.scope).rank})</strong>, it immediately claims evaluation precedent over any downstream rules:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400 text-[11px]">
                <li>Preempts baseline Pan-India price (Priority 7)</li>
                {inspectedRule.scope === 'STUDENT' && <li>Preempts Teacher (P2), Library (P3), Locality (P4), District (P5), and State (P6) overrides</li>}
                {inspectedRule.scope === 'TEACHER' && <li>Preempts Library (P3), Locality (P4), District (P5), and State (P6) overrides</li>}
                {inspectedRule.scope === 'LIBRARY' && <li>Preempts Locality (P4), District (P5), and State (P6) overrides</li>}
                {inspectedRule.scope === 'LOCALITY' && <li>Preempts District (P5), State (P6), and National (P7) overrides</li>}
                {inspectedRule.scope === 'DISTRICT' && <li>Preempts State (P6) and National (P7) overrides</li>}
                {inspectedRule.scope === 'STATE' && <li>Preempts National Base rate (P7)</li>}
              </ul>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsInspectorOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold transition-all cursor-pointer text-xs border border-slate-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* 8. CREATE / EDIT PRICING RULE MODAL WITH CASCADING LOCATION SELECTOR */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRule ? 'Edit Priority Pricing Rule' : 'Create New Priority Pricing Rule'}
        size="md"
      >
        <div className="space-y-4 text-xs font-mono text-slate-200 bg-slate-950 p-1 rounded-2xl">
          <div>
            <label className="block font-bold text-slate-400 mb-1">
              Select Product *
            </label>
            <select
              value={formProductId}
              onChange={(e) => setFormProductId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              {products.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-950 text-white">
                  {p.name} (Catalog Base: ₹{p.basePrice})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1">
              Pricing Priority Scope *
            </label>
            <select
              value={formScope}
              onChange={(e) => {
                const newScope = e.target.value as PricingScope;
                setFormScope(newScope);
                if (newScope === 'STATE' && formStateName) {
                  setFormScopeName(`${formStateName} State Grant`);
                  setFormScopeId(formStateId);
                } else if (newScope === 'DISTRICT' && formDistrictName) {
                  setFormScopeName(`${formDistrictName} District Quota`);
                  setFormScopeId(formDistrictId);
                } else if (newScope === 'LOCALITY' && formLocalityName) {
                  setFormScopeName(`${formLocalityName} Study Cluster Pass`);
                  setFormScopeId(formLocalityId);
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="STUDENT" className="bg-slate-950">STUDENT (Priority 1 — Highest)</option>
              <option value="TEACHER" className="bg-slate-950">TEACHER (Priority 2 — Mentor Referrals)</option>
              <option value="LIBRARY" className="bg-slate-950">LIBRARY (Priority 3 — Partner Desks)</option>
              <option value="LOCALITY" className="bg-slate-950">LOCALITY (Priority 4 — Hyper-Local Cluster)</option>
              <option value="DISTRICT" className="bg-slate-950">DISTRICT (Priority 5 — District Quota)</option>
              <option value="STATE" className="bg-slate-950">STATE (Priority 6 — State Grant)</option>
              <option value="PAN_INDIA" className="bg-slate-950">PAN_INDIA (Priority 7 — National Baseline)</option>
            </select>
          </div>

          {/* Cascading Location Controls for Geo-Scoped Rules */}
          {(formScope === 'STATE' || formScope === 'DISTRICT' || formScope === 'LOCALITY' || formScope === 'LIBRARY') && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="text-[10px] text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Geographic Corridor Assignment:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* State selector */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">State / UT</label>
                  <select
                    value={formStateId}
                    onChange={(e) => handleFormStateChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="">Select State</option>
                    {statesList.map(st => (
                      <option key={st.id} value={st.id} className="bg-slate-950 text-white">{st.name}</option>
                    ))}
                  </select>
                </div>

                {/* District selector */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">District</label>
                  <select
                    disabled={!formStateId || formScope === 'STATE'}
                    value={formDistrictId}
                    onChange={(e) => handleFormDistrictChange(e.target.value)}
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs ${
                      !formStateId || formScope === 'STATE'
                        ? 'bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-700 text-white focus:outline-none focus:border-cyan-500 cursor-pointer'
                    }`}
                  >
                    <option value="">Select District</option>
                    {formDistricts.map(d => (
                      <option key={d.id} value={d.id} className="bg-slate-950 text-white">{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Locality selector */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Locality</label>
                  <select
                    disabled={!formDistrictId || formScope === 'STATE' || formScope === 'DISTRICT'}
                    value={formLocalityId}
                    onChange={(e) => handleFormLocalityChange(e.target.value)}
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs ${
                      !formDistrictId || formScope === 'STATE' || formScope === 'DISTRICT'
                        ? 'bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-700 text-white focus:outline-none focus:border-cyan-500 cursor-pointer'
                    }`}
                  >
                    <option value="">Select Locality</option>
                    {formLocalities.map(l => (
                      <option key={l.id} value={l.id} className="bg-slate-950 text-white">{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Scope Entity ID
              </label>
              <input
                type="text"
                placeholder="e.g. dist-gzp, loc-saidpur or usr-student-aryan"
                value={formScopeId}
                onChange={(e) => setFormScopeId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Display Scope Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ghazipur District Quota"
                value={formScopeName}
                onChange={(e) => setFormScopeName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1">
              Resolved Concession Price (₹) *
            </label>
            <input
              type="number"
              value={formPrice}
              onChange={(e) => setFormPrice(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Effective From
              </label>
              <input
                type="date"
                value={formEffectiveFrom}
                onChange={(e) => setFormEffectiveFrom(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Effective Until
              </label>
              <input
                type="date"
                value={formEffectiveUntil}
                onChange={(e) => setFormEffectiveUntil(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
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
              {editingRule ? 'Save Changes' : 'Create Pricing Rule'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
