// FOCUSPOINT Super Admin — Pan-India Geographic Location Master & Spatial Command

import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { locationService } from '../../services/locationService';
import { 
  Country, 
  State, 
  DistrictLocation, 
  Locality, 
  Area, 
  StateType,
  LocalityType,
  AreaType,
  LocationHierarchyStats,
  PincodeLookupResult 
} from '../../types/location';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { 
  Globe, 
  Plus, 
  MapPin, 
  Search, 
  Building2, 
  Compass, 
  Navigation, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  FolderTree, 
  ShieldCheck, 
  BookOpen, 
  GraduationCap, 
  Users,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  Sparkles,
  Radio,
  Check,
  X,
  SlidersHorizontal,
  ExternalLink,
  Radar,
  ArrowRight,
  Zap,
  Activity,
  Cpu
} from 'lucide-react';

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
    // AudioContext suppressed or disabled
  }
};

type SortField = 'name_asc' | 'name_desc' | 'code_asc' | 'count_desc' | 'status';

export const SuperAdminLocations: React.FC = () => {
  const { addToast } = useToast();

  // Active Tab: 'states' | 'districts' | 'localities' | 'areas' | 'explorer'
  const [activeTab, setActiveTab] = useState<'states' | 'districts' | 'localities' | 'areas' | 'explorer'>('states');

  // Master Data State
  const [stats, setStats] = useState<LocationHierarchyStats>(locationService.getLocationStats());
  const [states, setStates] = useState<State[]>(locationService.getStates('loc-country-in', false));
  const [districts, setDistricts] = useState<DistrictLocation[]>(locationService.getDistricts(undefined, false));
  const [localities, setLocalities] = useState<Locality[]>(locationService.getLocalities(undefined, false));
  const [areas, setAreas] = useState<Area[]>(locationService.getAreas(undefined, false));

  // Sound Synthesizer State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fp_location_master_sfx_enabled') !== 'false';
  });

  const playSfx = (type: SfxType) => {
    if (soundEnabled) playCyberSound(type);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('fp_location_master_sfx_enabled', String(next));
    if (next) playCyberSound('confirm');
  };

  // Live IST Clock
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

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [filterStateId, setFilterStateId] = useState<string>('loc-state-up'); // default UP for ease
  const [filterDistrictId, setFilterDistrictId] = useState<string>('dist-gzp'); // default Ghazipur
  const [filterLocalityId, setFilterLocalityId] = useState<string>('loc-gzp-saidpur'); // default Saidpur
  const [sortBy, setSortBy] = useState<SortField>('name_asc');

  // PIN Code Spatial Radar State
  const [radarPincode, setRadarPincode] = useState<string>('233221');
  const [radarResolving, setRadarResolving] = useState<boolean>(false);
  const [radarResult, setRadarResult] = useState<PincodeLookupResult | null>(null);

  // Modals
  const [modalType, setModalType] = useState<'add_state' | 'edit_state' | 'add_district' | 'edit_district' | 'add_locality' | 'edit_locality' | 'add_area' | 'edit_area' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState<string>('STATE');
  const [formPincode, setFormPincode] = useState('');
  const [formParentStateId, setFormParentStateId] = useState('');
  const [formParentDistrictId, setFormParentDistrictId] = useState('');
  const [formParentLocalityId, setFormParentLocalityId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Tree Explorer Expansion State
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({ 'loc-state-up': true });
  const [expandedDistricts, setExpandedDistricts] = useState<Record<string, boolean>>({ 'dist-gzp': true });
  const [expandedLocalities, setExpandedLocalities] = useState<Record<string, boolean>>({ 'loc-gzp-saidpur': true });

  // Refresh lists on service subscription update
  const refreshData = () => {
    setStats(locationService.getLocationStats());
    setStates(locationService.getStates('loc-country-in', false));
    setDistricts(locationService.getDistricts(undefined, false));
    setLocalities(locationService.getLocalities(undefined, false));
    setAreas(locationService.getAreas(undefined, false));
  };

  useEffect(() => {
    const unsub = locationService.subscribe(() => {
      refreshData();
    });
    // Trigger initial radar lookup
    handleRunRadar('233221');
    return unsub;
  }, []);

  // PIN Code Radar Lookup
  const handleRunRadar = async (pinToLookup: string) => {
    const clean = (pinToLookup || '').replace(/\D/g, '').slice(0, 6);
    if (clean.length < 3) return;
    setRadarResolving(true);
    try {
      const res = await locationService.lookupPincode(clean);
      setRadarResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setRadarResolving(false);
    }
  };

  // Jump to resolved territory from radar
  const handleJumpToTerritory = (res: PincodeLookupResult) => {
    playSfx('warp');
    if (res.stateId) {
      setFilterStateId(res.stateId);
    }
    if (res.districtId) {
      setFilterDistrictId(res.districtId);
      setActiveTab('localities');
    } else {
      setActiveTab('districts');
    }
    addToast(`Territory focused: ${res.districtName || res.stateName}`, 'info');
  };

  // Quick Preset Jumps
  const handleQuickPreset = (stateName: string, stateId: string) => {
    playSfx('warp');
    if (!stateId) {
      setFilterStateId('ALL');
      setFilterDistrictId('ALL');
      setFilterLocalityId('ALL');
      setActiveTab('states');
      return;
    }
    setFilterStateId(stateId);
    setFilterDistrictId('ALL');
    setFilterLocalityId('ALL');
    setActiveTab('districts');
  };

  // Export Full Geo Directory
  const handleExportDirectory = () => {
    playSfx('confirm');
    const fullDataset = {
      timestamp: new Date().toISOString(),
      country: 'India',
      stats: locationService.getLocationStats(),
      states: states,
      districts: districts,
      localities: localities,
      areas: areas
    };
    const blob = new Blob([JSON.stringify(fullDataset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focuspoint-pan-india-geo-directory-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Pan-India Geographic Directory exported as JSON', 'success');
  };

  // Filtered & Sorted Lists
  const filteredStates = useMemo(() => {
    return states
      .filter(s => {
        const matchesQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          s.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
        if (sortBy === 'code_asc') return a.code.localeCompare(b.code);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        if (sortBy === 'count_desc') {
          const aCount = districts.filter(d => d.stateId === a.id).length;
          const bCount = districts.filter(d => d.stateId === b.id).length;
          return bCount - aCount;
        }
        return 0;
      });
  }, [states, searchQuery, statusFilter, sortBy, districts]);

  const filteredDistricts = useMemo(() => {
    let list = districts;
    if (filterStateId && filterStateId !== 'ALL') {
      list = list.filter(d => d.stateId === filterStateId);
    }
    return list
      .filter(d => {
        const matchesQuery = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (d.code && d.code.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
        if (sortBy === 'code_asc') return (a.code || '').localeCompare(b.code || '');
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        if (sortBy === 'count_desc') {
          const aCount = localities.filter(l => l.districtId === a.id).length;
          const bCount = localities.filter(l => l.districtId === b.id).length;
          return bCount - aCount;
        }
        return 0;
      });
  }, [districts, filterStateId, searchQuery, statusFilter, sortBy, localities]);

  const filteredLocalities = useMemo(() => {
    let list = localities;
    if (filterDistrictId && filterDistrictId !== 'ALL') {
      list = list.filter(l => l.districtId === filterDistrictId);
    } else if (filterStateId && filterStateId !== 'ALL') {
      list = list.filter(l => l.stateId === filterStateId);
    }
    return list
      .filter(l => {
        const matchesQuery = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (l.pincode && l.pincode.includes(searchQuery)) ||
          l.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
        if (sortBy === 'code_asc') return (a.pincode || '').localeCompare(b.pincode || '');
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        if (sortBy === 'count_desc') {
          const aCount = areas.filter(ar => ar.localityId === a.id).length;
          const bCount = areas.filter(ar => ar.localityId === b.id).length;
          return bCount - aCount;
        }
        return 0;
      });
  }, [localities, filterDistrictId, filterStateId, searchQuery, statusFilter, sortBy, areas]);

  const filteredAreas = useMemo(() => {
    let list = areas;
    if (filterLocalityId && filterLocalityId !== 'ALL') {
      list = list.filter(a => a.localityId === filterLocalityId);
    } else if (filterDistrictId && filterDistrictId !== 'ALL') {
      list = list.filter(a => a.districtId === filterDistrictId);
    } else if (filterStateId && filterStateId !== 'ALL') {
      list = list.filter(a => a.stateId === filterStateId);
    }
    return list
      .filter(a => {
        const matchesQuery = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (a.pincode && a.pincode.includes(searchQuery)) ||
          a.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
        if (sortBy === 'code_asc') return (a.pincode || '').localeCompare(b.pincode || '');
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        return 0;
      });
  }, [areas, filterLocalityId, filterDistrictId, filterStateId, searchQuery, statusFilter, sortBy]);

  // ==========================================
  // MODAL OPENERS
  // ==========================================

  const openAddStateModal = () => {
    playSfx('click');
    setFormName('');
    setFormCode('');
    setFormType('STATE');
    setModalType('add_state');
  };

  const openEditStateModal = (state: State) => {
    playSfx('click');
    setSelectedItem(state);
    setFormName(state.name);
    setFormCode(state.code);
    setFormType(state.type);
    setModalType('edit_state');
  };

  const openAddDistrictModal = () => {
    playSfx('click');
    setFormName('');
    setFormCode('');
    setFormParentStateId(filterStateId !== 'ALL' ? filterStateId : 'loc-state-up');
    setModalType('add_district');
  };

  const openEditDistrictModal = (district: DistrictLocation) => {
    playSfx('click');
    setSelectedItem(district);
    setFormName(district.name);
    setFormCode(district.code);
    setFormParentStateId(district.stateId);
    setModalType('edit_district');
  };

  const openAddLocalityModal = () => {
    playSfx('click');
    setFormName('');
    setFormType('LOCALITY');
    setFormPincode('');
    setFormParentStateId(filterStateId !== 'ALL' ? filterStateId : 'loc-state-up');
    setFormParentDistrictId(filterDistrictId !== 'ALL' ? filterDistrictId : 'dist-gzp');
    setModalType('add_locality');
  };

  const openEditLocalityModal = (locality: Locality) => {
    playSfx('click');
    setSelectedItem(locality);
    setFormName(locality.name);
    setFormType(locality.type);
    setFormPincode(locality.pincode || '');
    setFormParentDistrictId(locality.districtId);
    setModalType('edit_locality');
  };

  const openAddAreaModal = () => {
    playSfx('click');
    setFormName('');
    setFormType('NEIGHBORHOOD');
    setFormPincode('');
    setFormParentDistrictId(filterDistrictId !== 'ALL' ? filterDistrictId : 'dist-gzp');
    setFormParentLocalityId(filterLocalityId !== 'ALL' ? filterLocalityId : 'loc-gzp-saidpur');
    setModalType('add_area');
  };

  const openEditAreaModal = (area: Area) => {
    playSfx('click');
    setSelectedItem(area);
    setFormName(area.name);
    setFormType(area.type);
    setFormPincode(area.pincode || '');
    setFormParentLocalityId(area.localityId);
    setModalType('edit_area');
  };

  // ==========================================
  // FORM SUBMISSION HANDLERS
  // ==========================================

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    playSfx('confirm');

    try {
      if (modalType === 'add_state') {
        const created = locationService.addState({
          name: formName,
          code: formCode,
          type: formType as StateType,
          status: 'ACTIVE',
        });
        addToast(`State / UT "${created.name}" created successfully!`, 'success');
      } else if (modalType === 'edit_state' && selectedItem) {
        locationService.updateState(selectedItem.id, {
          name: formName,
          code: formCode,
          type: formType as StateType,
        });
        addToast(`State "${formName}" updated successfully!`, 'success');
      } else if (modalType === 'add_district') {
        const created = locationService.addDistrict({
          stateId: formParentStateId,
          name: formName,
          code: formCode,
          status: 'ACTIVE',
        });
        addToast(`District "${created.name}" added under selected state!`, 'success');
      } else if (modalType === 'edit_district' && selectedItem) {
        locationService.updateDistrict(selectedItem.id, {
          name: formName,
          code: formCode,
        });
        addToast(`District "${formName}" updated successfully!`, 'success');
      } else if (modalType === 'add_locality') {
        const created = locationService.addLocality({
          districtId: formParentDistrictId,
          name: formName,
          type: formType as LocalityType,
          pincode: formPincode || undefined,
          status: 'ACTIVE',
        });
        addToast(`Locality "${created.name}" added successfully!`, 'success');
      } else if (modalType === 'edit_locality' && selectedItem) {
        locationService.updateLocality(selectedItem.id, {
          name: formName,
          type: formType as LocalityType,
          pincode: formPincode || undefined,
        });
        addToast(`Locality "${formName}" updated successfully!`, 'success');
      } else if (modalType === 'add_area') {
        const created = locationService.addArea({
          localityId: formParentLocalityId,
          name: formName,
          type: formType as AreaType,
          pincode: formPincode || undefined,
          status: 'ACTIVE',
        });
        addToast(`Area "${created.name}" created under locality!`, 'success');
      } else if (modalType === 'edit_area' && selectedItem) {
        locationService.updateArea(selectedItem.id, {
          name: formName,
          type: formType as AreaType,
          pincode: formPincode || undefined,
        });
        addToast(`Area "${formName}" updated successfully!`, 'success');
      }

      setModalType(null);
      refreshData();
    } catch (err: any) {
      playSfx('alert');
      addToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle active/inactive
  const handleToggleState = (id: string) => {
    playSfx('toggle');
    const updated = locationService.toggleStateStatus(id);
    addToast(`State "${updated.name}" is now ${updated.status}`, 'info');
    refreshData();
  };

  const handleToggleDistrict = (id: string) => {
    playSfx('toggle');
    const updated = locationService.toggleDistrictStatus(id);
    addToast(`District "${updated.name}" is now ${updated.status}`, 'info');
    refreshData();
  };

  const handleToggleLocality = (id: string) => {
    playSfx('toggle');
    const updated = locationService.toggleLocalityStatus(id);
    addToast(`Locality "${updated.name}" is now ${updated.status}`, 'info');
    refreshData();
  };

  const handleToggleArea = (id: string) => {
    playSfx('toggle');
    const updated = locationService.toggleAreaStatus(id);
    addToast(`Area "${updated.name}" is now ${updated.status}`, 'info');
    refreshData();
  };

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* ============================================================================ */}
      {/* 1. COCKPIT HEADER WITH CYBER-HUD & AUDIO SFX TOGGLE */}
      {/* ============================================================================ */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden text-white">
        {/* Ambient Laser Background Glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-cyan-600/20 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-indigo-600/20 via-emerald-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        {/* Futuristic Corner Brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Globe className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                SOVEREIGN GEOGRAPHIC DIRECTORY v3.8
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                PAN-INDIA POSTAL RADAR: ACTIVE
              </span>
              <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {hudTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>LOCATION MASTER (PAN-INDIA TAXONOMY)</span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Centralized sovereign administrative and postal hierarchy across Country &rarr; State &rarr; District &rarr; Educational Locality &rarr; Micro-Area with 0ms PIN code spatial resolution and platform service anchoring.
            </p>
          </div>

          {/* Cockpit Actions */}
          <div className="flex flex-wrap items-center gap-2.5 lg:self-start">
            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                soundEnabled 
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={soundEnabled ? 'Synthesizer Audio Enabled' : 'Synthesizer Audio Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'SFX ON' : 'SFX MUTED'}</span>
            </button>

            <button
              onClick={handleExportDirectory}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              EXPORT GEOJSON
            </button>

            <button
              onClick={() => {
                playSfx('warp');
                if (window.confirm('Reset all location data to factory Pan-India defaults? Any custom added locations will be restored.')) {
                  locationService.resetToDefaults(true);
                  addToast('Reset to default Pan-India master locations', 'info');
                }
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              RESET DEFAULTS
            </button>

            {activeTab === 'states' && (
              <button
                onClick={openAddStateModal}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
              >
                <Plus className="w-4 h-4" /> ADD STATE / UT
              </button>
            )}

            {activeTab === 'districts' && (
              <button
                onClick={openAddDistrictModal}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all"
              >
                <Plus className="w-4 h-4" /> ADD DISTRICT
              </button>
            )}

            {activeTab === 'localities' && (
              <button
                onClick={openAddLocalityModal}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
              >
                <Plus className="w-4 h-4" /> ADD LOCALITY / TEHSIL
              </button>
            )}

            {activeTab === 'areas' && (
              <button
                onClick={openAddAreaModal}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
              >
                <Plus className="w-4 h-4" /> ADD MICRO-AREA
              </button>
            )}
          </div>
        </div>

        {/* Neural Core Animated Visual Ring */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-cyan-300">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              NATIONAL COVERAGE: 28 STATES &bull; 8 UNION TERRITORIES &bull; 100% ACTIVE
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              SOVEREIGN ENCLAVE GOVERNANCE VERIFIED
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">GEO-RESOLVER LATENCY:</span>
            <span className="text-emerald-400 font-bold">&lt; 1ms LOCAL / 0ms CACHE</span>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 2. TOP-LEVEL KPI TELEMETRY MATRIX (5 CYBER-HUD CARDS) */}
      {/* ============================================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: States & UTs */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xs relative overflow-hidden group hover:border-blue-500/40 transition-all text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
              STATES &amp; UTs
            </span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {stats.totalStates} <span className="text-slate-500 text-xs font-normal">Sovereign Units</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> {stats.activeStates} Active (28 St + 8 UT)
          </div>
        </div>

        {/* Card 2: Districts */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xs relative overflow-hidden group hover:border-indigo-500/40 transition-all text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
              DISTRICT CORRIDORS
            </span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {stats.totalDistricts}
          </div>
          <div className="mt-2 text-[11px] text-indigo-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-indigo-400" /> Administrative Units
          </div>
        </div>

        {/* Card 3: Localities */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xs relative overflow-hidden group hover:border-purple-500/40 transition-all text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
              CITIES &amp; TEHSILS
            </span>
            <Compass className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-300 tracking-tight">
            {stats.totalLocalities}
          </div>
          <div className="mt-2 text-[11px] text-purple-400 font-medium flex items-center gap-1">
            <Navigation className="w-3 h-3 text-purple-400" /> Coaching Hubs &amp; Clusters
          </div>
        </div>

        {/* Card 4: Areas / Villages */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-all text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
              AREAS &amp; VILLAGES
            </span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
            {stats.totalAreas}
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> Micro-Neighborhoods
          </div>
        </div>

        {/* Card 5: Platform Services Anchored */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all text-white col-span-2 md:col-span-3 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
              SERVICES ANCHORED
            </span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1 text-xs space-y-1 font-mono text-slate-300">
            <div className="flex justify-between">
              <span>Libraries:</span> <strong className="text-white">{stats.totalLibraries}</strong>
            </div>
            <div className="flex justify-between">
              <span>Students:</span> <strong className="text-cyan-300">{stats.totalStudents}</strong>
            </div>
            <div className="flex justify-between">
              <span>Educators:</span> <strong className="text-emerald-300">{stats.totalTeachers}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 3. 0ms POSTAL PIN CODE SPATIAL RADAR & INSTANT RESOLVER */}
      {/* ============================================================================ */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-lg text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Radar className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                0ms Postal PIN Code Spatial Radar &amp; Instant Resolver
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  REAL-TIME
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Enter any 6-digit Indian PIN code to resolve exact State, District corridor, post offices, and anchor local student coverage.
              </p>
            </div>
          </div>

          {/* Quick Input Bar */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                maxLength={6}
                value={radarPincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setRadarPincode(val);
                  if (val.length === 6) {
                    playSfx('warp');
                    handleRunRadar(val);
                  }
                }}
                placeholder="e.g. 233221, 221005"
                className="w-full pl-10 pr-3 py-2 bg-slate-900 rounded-xl border border-cyan-500/50 text-sm font-mono font-bold text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-300 transition-colors shadow-inner"
              />
            </div>
            <button
              onClick={() => { playSfx('click'); handleRunRadar(radarPincode); }}
              disabled={radarResolving || radarPincode.length < 3}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Zap className="w-3.5 h-3.5" /> RESOLVE
            </button>
          </div>
        </div>

        {/* Resolved Telemetry Output Box */}
        {radarResult && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 uppercase">PIN CODE:</span>
                <span className="text-cyan-300 font-bold text-sm bg-slate-950 px-2 py-0.5 rounded border border-cyan-500/30">
                  {radarResult.pincode}
                </span>
                <span className="text-slate-600">&rarr;</span>
                <strong className="text-white text-sm">{radarResult.stateName}</strong>
                <span className="text-slate-600">&rarr;</span>
                <strong className="text-indigo-300 text-sm">{radarResult.districtName || 'Corridor Identified'}</strong>
                {radarResult.suggestedLocality?.name && (
                  <>
                    <span className="text-slate-600">&rarr;</span>
                    <strong className="text-purple-300 text-sm">{radarResult.suggestedLocality.name}</strong>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Source: <span className="text-emerald-400 uppercase font-bold">{radarResult.source}</span> &bull; Post Offices Identified: {radarResult.postOffices?.length || 1} Delivery Points
              </p>
            </div>

            <button
              onClick={() => handleJumpToTerritory(radarResult)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all shrink-0"
            >
              <span>JUMP TO TERRITORY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ============================================================================ */}
      {/* 4. PANORAMIC TERRITORIAL FAST-JUMP COMMAND RIBBON */}
      {/* ============================================================================ */}
      <div className="p-5 rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-md text-white space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
          TERRITORIAL FAST-JUMP PRESETS:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'Pan-India (All 36 States/UTs)', id: '', count: 'Nationwide' },
            { label: 'Uttar Pradesh (75 Districts)', id: 'loc-state-up', count: 'Varanasi/Ghazipur' },
            { label: 'Bihar (38 Districts)', id: 'loc-state-br', count: 'Patna Eastern Hub' },
            { label: 'Delhi-NCR (Capital Corridor)', id: 'loc-state-dl', count: 'Central Enclave' },
            { label: 'Maharashtra (Western Hub)', id: 'loc-state-mh', count: 'Pune/Mumbai' },
            { label: 'Rajasthan (Coaching Hub)', id: 'loc-state-rj', count: 'Kota Talent Base' },
            { label: 'Madhya Pradesh (Central Hub)', id: 'loc-state-mp', count: 'Bhopal Corridor' },
            { label: 'West Bengal (Eastern Bureau)', id: 'loc-state-wb', count: 'Kolkata Sector' }
          ].map(preset => {
            const isSelected = (!preset.id && filterStateId === 'ALL') || filterStateId === preset.id;
            return (
              <button
                key={preset.label}
                onClick={() => handleQuickPreset(preset.label, preset.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{preset.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-cyan-400/20 text-cyan-200' : 'bg-slate-800 text-slate-500'
                }`}>
                  {preset.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 5. NAVIGATION TABS (5 HIGH-TECH CYBER VIEWS) */}
      {/* ============================================================================ */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-cyan-500/30 gap-1.5 overflow-x-auto shadow-md">
        <button
          onClick={() => { playSfx('click'); setActiveTab('states'); setSearchQuery(''); }}
          className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'states'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Globe className="w-4 h-4 text-cyan-400" /> States &amp; UTs ({states.length})
        </button>

        <button
          onClick={() => { playSfx('click'); setActiveTab('districts'); setSearchQuery(''); }}
          className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'districts'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-400" /> Districts ({districts.length})
        </button>

        <button
          onClick={() => { playSfx('click'); setActiveTab('localities'); setSearchQuery(''); }}
          className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'localities'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Compass className="w-4 h-4 text-purple-400" /> Localities &amp; Cities ({localities.length})
        </button>

        <button
          onClick={() => { playSfx('click'); setActiveTab('areas'); setSearchQuery(''); }}
          className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'areas'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4 text-emerald-400" /> Areas &amp; Villages ({areas.length})
        </button>

        <button
          onClick={() => { playSfx('click'); setActiveTab('explorer'); setSearchQuery(''); }}
          className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'explorer'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FolderTree className="w-4 h-4 text-cyan-400" /> Hierarchy Tree Explorer
        </button>
      </div>

      {/* ============================================================================ */}
      {/* 6. SEARCH AND CASCADING FILTERS BAR */}
      {/* ============================================================================ */}
      {activeTab !== 'explorer' && (
        <div className="p-5 rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-md text-white">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab} by name, code, PIN...`}
                className="w-full pl-10 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl font-medium text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Cascading Dropdowns & Multi-Axis Sorting */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => { playSfx('click'); setStatusFilter(e.target.value as any); }}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              {/* State Filter (for districts, localities, areas) */}
              {(activeTab === 'districts' || activeTab === 'localities' || activeTab === 'areas') && (
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="text-slate-400">State:</span>
                  <select
                    value={filterStateId}
                    onChange={e => {
                      playSfx('click');
                      setFilterStateId(e.target.value);
                      setFilterDistrictId('ALL');
                      setFilterLocalityId('ALL');
                    }}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="ALL">All States ({states.length})</option>
                    {states.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* District Filter (for localities, areas) */}
              {(activeTab === 'localities' || activeTab === 'areas') && (
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="text-slate-400">District:</span>
                  <select
                    value={filterDistrictId}
                    onChange={e => {
                      playSfx('click');
                      setFilterDistrictId(e.target.value);
                      setFilterLocalityId('ALL');
                    }}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="ALL">All Districts</option>
                    {districts
                      .filter(d => filterStateId === 'ALL' || d.stateId === filterStateId)
                      .map(d => (
                        <option key={d.id} value={d.id}>{d.name} {d.code ? `(${d.code})` : ''}</option>
                      ))}
                  </select>
                </div>
              )}

              {/* Locality Filter (for areas) */}
              {activeTab === 'areas' && (
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="text-slate-400">Locality:</span>
                  <select
                    value={filterLocalityId}
                    onChange={e => { playSfx('click'); setFilterLocalityId(e.target.value); }}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="ALL">All Localities</option>
                    {localities
                      .filter(l => filterDistrictId === 'ALL' || l.districtId === filterDistrictId)
                      .map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                  </select>
                </div>
              )}

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={e => { playSfx('click'); setSortBy(e.target.value as any); }}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="name_asc">Name (A &rarr; Z)</option>
                  <option value="name_desc">Name (Z &rarr; A)</option>
                  <option value="code_asc">Code / PIN</option>
                  <option value="count_desc">Sub-Units Count</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 7. TAB 1: STATES CONTENT */}
      {/* ============================================================================ */}
      {activeTab === 'states' && (
        <div className="rounded-3xl shadow-xl overflow-hidden bg-slate-950 border border-cyan-500/30 text-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[800px]">
              <thead className="bg-slate-900/80 text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-5">State / UT Name</th>
                  <th className="py-4 px-5">Official Code</th>
                  <th className="py-4 px-5">Jurisdiction Type</th>
                  <th className="py-4 px-5">Districts Mapped</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950">
                {filteredStates.map(state => {
                  const stateDistricts = districts.filter(d => d.stateId === state.id);
                  return (
                    <tr key={state.id} className="hover:bg-slate-900/50 transition-colors group">
                      <td className="py-4 px-5 font-bold text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{state.name}</span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-cyan-300">
                        <span className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 text-[11px]">{state.code}</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          state.type === 'UT' 
                            ? 'bg-purple-950 text-purple-300 border-purple-800' 
                            : 'bg-blue-950 text-blue-300 border-blue-800'
                        }`}>
                          {state.type === 'UT' ? 'Union Territory' : 'Full State'}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <button
                          onClick={() => {
                            playSfx('click');
                            setFilterStateId(state.id);
                            setActiveTab('districts');
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline inline-flex items-center gap-1.5 cursor-pointer font-mono"
                        >
                          <span>{stateDistricts.length} Districts</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="py-4 px-5">
                        <button
                          onClick={() => handleToggleState(state.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                            state.status === 'ACTIVE' 
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900' 
                              : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {state.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3" />}
                          {state.status}
                        </button>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => openEditStateModal(state)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-cyan-300 font-bold text-xs inline-flex items-center gap-1 transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
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

      {/* ============================================================================ */}
      {/* 8. TAB 2: DISTRICTS CONTENT */}
      {/* ============================================================================ */}
      {activeTab === 'districts' && (
        <div className="rounded-3xl shadow-xl overflow-hidden bg-slate-950 border border-cyan-500/30 text-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-900/80 text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-5">District Name</th>
                  <th className="py-4 px-5">Code</th>
                  <th className="py-4 px-5">Parent State</th>
                  <th className="py-4 px-5">Localities / Tehsils</th>
                  <th className="py-4 px-5">Assigned District Admin</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950">
                {filteredDistricts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-mono text-sm">
                      No districts found matching selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredDistricts.map(district => {
                    const parentState = locationService.getStateById(district.stateId);
                    const distLocalities = localities.filter(l => l.districtId === district.id);

                    return (
                      <tr key={district.id} className="hover:bg-slate-900/50 transition-colors group">
                        <td className="py-4 px-5 font-bold text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <span className="text-sm">{district.name}</span>
                        </td>
                        <td className="py-4 px-5 font-mono font-bold text-indigo-300">
                          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">{district.code || '—'}</span>
                        </td>
                        <td className="py-4 px-5 text-slate-300 font-medium">
                          {parentState ? parentState.name : district.stateId}
                        </td>
                        <td className="py-4 px-5">
                          <button
                            onClick={() => {
                              playSfx('click');
                              setFilterStateId(district.stateId);
                              setFilterDistrictId(district.id);
                              setActiveTab('localities');
                            }}
                            className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline inline-flex items-center gap-1.5 cursor-pointer font-mono"
                          >
                            <span>{distLocalities.length} Localities</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="py-4 px-5">
                          {district.activeAdminName ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950 border border-indigo-500/40 px-2.5 py-1 rounded-full">
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                              {district.activeAdminName}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic text-[11px] font-mono">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <button
                            onClick={() => handleToggleDistrict(district.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                              district.status === 'ACTIVE' 
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900' 
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
                            }`}
                          >
                            {district.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3" />}
                            {district.status}
                          </button>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => openEditDistrictModal(district)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-indigo-400 hover:text-indigo-300 font-bold text-xs inline-flex items-center gap-1 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 9. TAB 3: LOCALITIES CONTENT */}
      {/* ============================================================================ */}
      {activeTab === 'localities' && (
        <div className="rounded-3xl shadow-xl overflow-hidden bg-slate-950 border border-cyan-500/30 text-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-slate-900/80 text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-5">Locality / Town Name</th>
                  <th className="py-4 px-5">Classification</th>
                  <th className="py-4 px-5">District Corridor &amp; State</th>
                  <th className="py-4 px-5">Postal PIN Code</th>
                  <th className="py-4 px-5">Micro-Areas Mapped</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950">
                {filteredLocalities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-mono text-sm">
                      No localities found matching selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredLocalities.map(locality => {
                    const parentDist = locationService.getDistrictById(locality.districtId);
                    const parentState = locationService.getStateById(locality.stateId);
                    const childAreas = areas.filter(a => a.localityId === locality.id);

                    return (
                      <tr key={locality.id} className="hover:bg-slate-900/50 transition-colors group">
                        <td className="py-4 px-5 font-bold text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                            <Compass className="w-4 h-4" />
                          </div>
                          <span className="text-sm">{locality.name}</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-purple-300 border border-purple-800">
                            {locality.type}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-300 font-medium">
                          {parentDist?.name}, {parentState?.code}
                        </td>
                        <td className="py-4 px-5 font-mono font-bold text-cyan-300">
                          {locality.pincode ? (
                            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">{locality.pincode}</span>
                          ) : '—'}
                        </td>
                        <td className="py-4 px-5">
                          <button
                            onClick={() => {
                              playSfx('click');
                              setFilterStateId(locality.stateId);
                              setFilterDistrictId(locality.districtId);
                              setFilterLocalityId(locality.id);
                              setActiveTab('areas');
                            }}
                            className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline inline-flex items-center gap-1.5 cursor-pointer font-mono"
                          >
                            <span>{childAreas.length} Areas</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="py-4 px-5">
                          <button
                            onClick={() => handleToggleLocality(locality.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                              locality.status === 'ACTIVE' 
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900' 
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
                            }`}
                          >
                            {locality.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3" />}
                            {locality.status}
                          </button>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => openEditLocalityModal(locality)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-400 hover:text-purple-300 font-bold text-xs inline-flex items-center gap-1 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 10. TAB 4: AREAS CONTENT */}
      {/* ============================================================================ */}
      {activeTab === 'areas' && (
        <div className="rounded-3xl shadow-xl overflow-hidden bg-slate-950 border border-cyan-500/30 text-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-900/80 text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-5">Area / Neighborhood</th>
                  <th className="py-4 px-5">Classification</th>
                  <th className="py-4 px-5">Spatial Hierarchy Lineage</th>
                  <th className="py-4 px-5">Postal PIN Code</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950">
                {filteredAreas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-mono text-sm">
                      No micro-areas found matching selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredAreas.map(area => {
                    const parentLoc = locationService.getLocalityById(area.localityId);
                    const parentDist = locationService.getDistrictById(area.districtId);
                    const parentState = locationService.getStateById(area.stateId);

                    return (
                      <tr key={area.id} className="hover:bg-slate-900/50 transition-colors group">
                        <td className="py-4 px-5 font-bold text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span className="text-sm">{area.name}</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-emerald-300 border border-emerald-800">
                            {area.type}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-300 font-medium truncate max-w-xs">
                          {parentLoc?.name} &rarr; {parentDist?.name}, {parentState?.code}
                        </td>
                        <td className="py-4 px-5 font-mono font-bold text-cyan-300">
                          {area.pincode ? (
                            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">{area.pincode}</span>
                          ) : '—'}
                        </td>
                        <td className="py-4 px-5">
                          <button
                            onClick={() => handleToggleArea(area.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                              area.status === 'ACTIVE' 
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900' 
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
                            }`}
                          >
                            {area.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3" />}
                            {area.status}
                          </button>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => openEditAreaModal(area)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 hover:text-emerald-300 font-bold text-xs inline-flex items-center gap-1 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 11. TAB 5: HOLOGRAPHIC GEO-HIERARCHY TREE MATRIX */}
      {/* ============================================================================ */}
      {activeTab === 'explorer' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-xl text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-cyan-400" />
                Holographic Pan-India Hierarchy Tree Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Recursive quantum spatial hierarchy: Country &rarr; State &rarr; District &rarr; Locality &rarr; Micro-Area
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playSfx('warp');
                  const stateMap: Record<string, boolean> = {};
                  states.forEach(s => { stateMap[s.id] = true; });
                  setExpandedStates(stateMap);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-mono font-bold transition-all"
              >
                EXPAND ALL STATES
              </button>
              <button
                onClick={() => {
                  playSfx('toggle');
                  setExpandedStates({});
                  setExpandedDistricts({});
                  setExpandedLocalities({});
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs font-mono font-bold transition-all"
              >
                COLLAPSE ALL
              </button>
            </div>
          </div>

          {/* TREE ROOT: INDIA */}
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3.5 bg-cyan-950/40 border border-cyan-500/40 rounded-2xl font-bold text-white shadow-md">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-sm">Republic of India (National Sovereign Root)</span>
              </div>
              <span className="text-[11px] font-mono bg-cyan-950 text-cyan-300 font-bold px-3 py-1 rounded-full border border-cyan-500/40">
                {states.length} States / UTs Mapped
              </span>
            </div>

            {/* STATES */}
            <div className="pl-4 sm:pl-6 border-l-2 border-cyan-900/60 space-y-2 mt-2">
              {states.map(state => {
                const isStateExpanded = Boolean(expandedStates[state.id]);
                const stateDistricts = districts.filter(d => d.stateId === state.id);

                return (
                  <div key={state.id} className="space-y-1.5">
                    <div 
                      onClick={() => {
                        playSfx('click');
                        setExpandedStates(prev => ({ ...prev, [state.id]: !prev[state.id] }));
                      }}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 cursor-pointer transition-colors border border-slate-800 shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 font-bold text-slate-200">
                        {isStateExpanded ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                        <Building2 className="w-4 h-4 text-indigo-400" />
                        <span>{state.name}</span>
                        <span className="text-[10px] text-cyan-400 font-bold">({state.code})</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-800">
                        {stateDistricts.length} Districts
                      </span>
                    </div>

                    {/* DISTRICTS UNDER STATE */}
                    {isStateExpanded && (
                      <div className="pl-4 sm:pl-6 border-l-2 border-indigo-900/60 space-y-1.5 mt-1">
                        {stateDistricts.length === 0 ? (
                          <div className="p-2 text-slate-500 italic text-[11px]">
                            No districts defined yet. Click "Add District" to initialize.
                          </div>
                        ) : (
                          stateDistricts.map(dist => {
                            const isDistExpanded = Boolean(expandedDistricts[dist.id]);
                            const distLocalities = localities.filter(l => l.districtId === dist.id);

                            return (
                              <div key={dist.id} className="space-y-1">
                                <div
                                  onClick={() => {
                                    playSfx('click');
                                    setExpandedDistricts(prev => ({ ...prev, [dist.id]: !prev[dist.id] }));
                                  }}
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 hover:bg-indigo-950/40 cursor-pointer border border-slate-800 shadow-xs"
                                >
                                  <div className="flex items-center gap-2 text-slate-300 font-bold">
                                    {isDistExpanded ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                                    <Compass className="w-3.5 h-3.5 text-purple-400" />
                                    <span>{dist.name}</span>
                                    {dist.code && <span className="text-[10px] text-slate-500">[{dist.code}]</span>}
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-800">
                                    {distLocalities.length} Localities
                                  </span>
                                </div>

                                {/* LOCALITIES UNDER DISTRICT */}
                                {isDistExpanded && (
                                  <div className="pl-4 sm:pl-6 border-l-2 border-purple-900/60 space-y-1 mt-1">
                                    {distLocalities.length === 0 ? (
                                      <div className="p-2 text-slate-500 italic text-[11px]">
                                        No localities defined.
                                      </div>
                                    ) : (
                                      distLocalities.map(loc => {
                                        const isLocExpanded = Boolean(expandedLocalities[loc.id]);
                                        const locAreas = areas.filter(a => a.localityId === loc.id);

                                        return (
                                          <div key={loc.id} className="space-y-1">
                                            <div
                                              onClick={() => {
                                                playSfx('click');
                                                setExpandedLocalities(prev => ({ ...prev, [loc.id]: !prev[loc.id] }));
                                              }}
                                              className="flex items-center justify-between p-2 rounded-xl bg-purple-950/30 hover:bg-purple-950/50 cursor-pointer border border-purple-900/60 shadow-xs"
                                            >
                                              <div className="flex items-center gap-2 text-slate-300">
                                                {isLocExpanded ? <ChevronDown className="w-3 h-3 text-purple-400" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                                                <Navigation className="w-3 h-3 text-purple-400" />
                                                <span className="font-bold">{loc.name}</span>
                                                <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded font-bold uppercase border border-purple-800">
                                                  {loc.type}
                                                </span>
                                              </div>
                                              <span className="text-[10px] font-mono font-bold text-emerald-400">
                                                {locAreas.length} Areas
                                              </span>
                                            </div>

                                            {/* AREAS UNDER LOCALITY */}
                                            {isLocExpanded && (
                                              <div className="pl-4 sm:pl-6 border-l-2 border-emerald-900/60 space-y-1 mt-1">
                                                {locAreas.length === 0 ? (
                                                  <div className="p-1.5 text-slate-500 italic text-[10px]">
                                                    No micro-areas defined.
                                                  </div>
                                                ) : (
                                                  locAreas.map(ar => (
                                                    <div
                                                      key={ar.id}
                                                      className="flex items-center justify-between p-2 px-3 rounded-lg bg-slate-900/90 border border-emerald-500/30 text-slate-200 font-medium shadow-xs"
                                                    >
                                                      <div className="flex items-center gap-2 font-bold">
                                                        <MapPin className="w-3 h-3 text-emerald-400" />
                                                        <span>{ar.name}</span>
                                                        <span className="text-[9px] text-slate-400 uppercase font-normal">[{ar.type}]</span>
                                                      </div>
                                                      <span className="text-[10px] text-cyan-300 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                                        PIN: {ar.pincode || '—'}
                                                      </span>
                                                    </div>
                                                  ))
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 12. CRUD MODAL FOR LOCATIONS */}
      {/* ============================================================================ */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-950 border border-cyan-500/40 shadow-2xl p-6 sm:p-8 text-white space-y-5">
            <button
              onClick={() => { playSfx('click'); setModalType(null); }}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {modalType === 'add_state' ? 'Add New State / Union Territory' :
                   modalType === 'edit_state' ? `Edit State: ${selectedItem?.name}` :
                   modalType === 'add_district' ? 'Add New District Corridor' :
                   modalType === 'edit_district' ? `Edit District: ${selectedItem?.name}` :
                   modalType === 'add_locality' ? 'Add New Locality / City / Town' :
                   modalType === 'edit_locality' ? `Edit Locality: ${selectedItem?.name}` :
                   modalType === 'add_area' ? 'Add New Area / Village' :
                   `Edit Area: ${selectedItem?.name}`}
                </h3>
                <p className="text-xs text-slate-400">Configure sovereign geographic hierarchy and postal identifiers</p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-mono">
              {/* PARENT SELECTION FOR DISTRICT */}
              {modalType === 'add_district' && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Parent State *</label>
                  <select
                    value={formParentStateId}
                    onChange={e => setFormParentStateId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900 text-slate-200 font-semibold focus:outline-none focus:border-cyan-400"
                  >
                    {states.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* PARENT SELECTION FOR LOCALITY */}
              {modalType === 'add_locality' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Parent State *</label>
                    <select
                      value={formParentStateId}
                      onChange={e => {
                        setFormParentStateId(e.target.value);
                        const stateDists = districts.filter(d => d.stateId === e.target.value);
                        if (stateDists.length > 0) setFormParentDistrictId(stateDists[0].id);
                      }}
                      required
                      className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900 text-slate-200 font-semibold focus:outline-none focus:border-cyan-400"
                    >
                      {states.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Parent District *</label>
                    <select
                      value={formParentDistrictId}
                      onChange={e => setFormParentDistrictId(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900 text-slate-200 font-semibold focus:outline-none focus:border-cyan-400"
                    >
                      {districts
                        .filter(d => d.stateId === formParentStateId)
                        .map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {/* PARENT SELECTION FOR AREA */}
              {modalType === 'add_area' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Parent District *</label>
                    <select
                      value={formParentDistrictId}
                      onChange={e => {
                        setFormParentDistrictId(e.target.value);
                        const distLocs = localities.filter(l => l.districtId === e.target.value);
                        if (distLocs.length > 0) setFormParentLocalityId(distLocs[0].id);
                      }}
                      required
                      className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900 text-slate-200 font-semibold focus:outline-none focus:border-cyan-400"
                    >
                      {districts.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Parent Locality / Town *</label>
                    <select
                      value={formParentLocalityId}
                      onChange={e => setFormParentLocalityId(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900 text-slate-200 font-semibold focus:outline-none focus:border-cyan-400"
                    >
                      {localities
                        .filter(l => l.districtId === formParentDistrictId)
                        .map(l => (
                          <option key={l.id} value={l.id}>{l.name} ({l.type})</option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {/* NAME FIELD */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Entity Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Varanasi, Saidpur, Kothrud"
                  required
                  className="w-full px-3.5 py-2 border border-slate-700 rounded-xl bg-slate-900 text-slate-100 font-sans focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* CODE FIELD (For State & District) */}
              {(modalType === 'add_state' || modalType === 'edit_state' || modalType === 'add_district' || modalType === 'edit_district') && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Official Code *</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={e => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. UP, GZP, VNS, MH"
                    required
                    className="w-full px-3.5 py-2 border border-slate-700 rounded-xl uppercase bg-slate-900 text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}

              {/* TYPE FIELD */}
              {(modalType === 'add_state' || modalType === 'edit_state') && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Jurisdiction Type *</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900 text-slate-200 font-semibold focus:outline-none focus:border-cyan-400"
                  >
                    <option value="STATE">Full State</option>
                    <option value="UT">Union Territory</option>
                  </select>
                </div>
              )}

              {(modalType === 'add_locality' || modalType === 'edit_locality') && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Locality Classification *</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900 text-slate-200 font-semibold focus:outline-none focus:border-cyan-400"
                  >
                    <option value="CITY">Major City</option>
                    <option value="TOWN">Town / Nagar Panchayat</option>
                    <option value="TEHSIL">Tehsil / Sub-Division</option>
                    <option value="LOCALITY">General Locality / Ward</option>
                  </select>
                </div>
              )}

              {(modalType === 'add_area' || modalType === 'edit_area') && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Area Classification *</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900 text-slate-200 font-semibold focus:outline-none focus:border-cyan-400"
                  >
                    <option value="NEIGHBORHOOD">Neighborhood / Colony</option>
                    <option value="AREA">Commercial Area / Market</option>
                    <option value="SECTOR">Sector / Block</option>
                    <option value="VILLAGE">Village / Gram Panchayat</option>
                  </select>
                </div>
              )}

              {/* PINCODE FIELD */}
              {(modalType === 'add_locality' || modalType === 'edit_locality' || modalType === 'add_area' || modalType === 'edit_area') && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Postal PIN Code (6 Digits)</label>
                  <input
                    type="text"
                    value={formPincode}
                    onChange={e => setFormPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 233221"
                    maxLength={6}
                    className="w-full px-3.5 py-2 border border-slate-700 rounded-xl font-bold bg-slate-900 text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { playSfx('click'); setModalType(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> {submitting ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
