// FOCUSPOINT Super Admin — Pan-India Location Selector Engine
// Centralized authoritative cascading location controller: State/UT -> District -> Locality -> Area
// Supports Panoramic Card Deck and High-Contrast Holographic Compact Toolbar Bar with Instant Presets

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Globe, 
  MapPin, 
  Building2, 
  ChevronDown, 
  Search, 
  X, 
  Check, 
  RotateCcw, 
  Sparkles,
  Compass,
  Layers,
  ArrowRight
} from 'lucide-react';
import { locationService } from '../../services/locationService';
import { State, DistrictLocation, Locality, Area } from '../../types/location';

export interface LocationSelectionPayload {
  countryId: string;
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  localityId?: string;
  localityName?: string;
  areaId?: string;
  areaName?: string;
  level: 'INDIA' | 'STATE' | 'DISTRICT' | 'LOCALITY' | 'AREA';
  breadcrumb: string;
}

export interface PanIndiaLocationSelectorProps {
  value?: {
    stateId?: string;
    stateName?: string;
    districtId?: string;
    districtName?: string;
    localityId?: string;
    localityName?: string;
    areaId?: string;
    areaName?: string;
  };
  onChange: (selection: LocationSelectionPayload) => void;
  showLocality?: boolean;
  showArea?: boolean;
  showBreadcrumb?: boolean;
  variant?: 'card' | 'bar' | 'compact' | 'inline';
  className?: string;
  disabled?: boolean;
  theme?: 'emerald' | 'purple' | 'cyan' | 'blue' | 'amber' | 'default';
}

// Top Educational Territories for Instant One-Click Jump
const FAST_TERRITORY_PRESETS = [
  { id: 'loc-state-up', name: 'Uttar Pradesh', code: 'UP' },
  { id: 'loc-state-br', name: 'Bihar', code: 'BR' },
  { id: 'loc-state-dl', name: 'Delhi', code: 'DL' },
  { id: 'loc-state-mh', name: 'Maharashtra', code: 'MH' },
  { id: 'loc-state-rj', name: 'Rajasthan', code: 'RJ' },
  { id: 'loc-state-mp', name: 'Madhya Pradesh', code: 'MP' },
  { id: 'loc-state-wb', name: 'West Bengal', code: 'WB' },
];

export const PanIndiaLocationSelector: React.FC<PanIndiaLocationSelectorProps> = ({
  value,
  onChange,
  showLocality = true,
  showArea = false,
  showBreadcrumb = true,
  variant = 'card',
  className = '',
  disabled = false,
  theme = 'default'
}) => {
  // Master lists loaded from central locationService
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<DistrictLocation[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  // Loading states
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);

  // Search queries inside dropdowns
  const [stateSearch, setStateSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [localitySearch, setLocalitySearch] = useState('');

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<'state' | 'district' | 'locality' | null>(null);

  // Ref for click outside
  const containerRef = useRef<HTMLDivElement>(null);

  // Load States from Central Location Master
  const loadStates = () => {
    try {
      const all = locationService.getStates('loc-country-in', true);
      setStates(all);
    } catch (err) {
      console.error('Failed to load states from location master', err);
    }
  };

  useEffect(() => {
    loadStates();
    const unsubscribe = locationService.subscribe(loadStates);
    return unsubscribe;
  }, []);

  // Update Districts when state changes
  useEffect(() => {
    const stateIdentifier = value?.stateId || value?.stateName;
    if (!stateIdentifier) {
      setDistricts([]);
      setLocalities([]);
      setAreas([]);
      return;
    }

    setLoadingDistricts(true);
    try {
      let targetStateId = value?.stateId;
      if (!targetStateId && value?.stateName) {
        const found = states.find(s => s.name.toLowerCase() === value.stateName?.toLowerCase());
        targetStateId = found?.id;
      }

      if (targetStateId) {
        const distList = locationService.getDistricts(targetStateId, true);
        setDistricts(distList);
      } else {
        setDistricts([]);
      }
    } catch (e) {
      console.warn('Error loading districts for state', e);
    } finally {
      setLoadingDistricts(false);
    }
  }, [value?.stateId, value?.stateName, states]);

  // Update Localities when district changes
  useEffect(() => {
    const distIdentifier = value?.districtId || value?.districtName;
    if (!distIdentifier) {
      setLocalities([]);
      setAreas([]);
      return;
    }

    setLoadingLocalities(true);
    try {
      let targetDistId = value?.districtId;
      if (!targetDistId && value?.districtName) {
        const found = districts.find(d => d.name.toLowerCase() === value.districtName?.toLowerCase());
        targetDistId = found?.id;
      }

      if (targetDistId) {
        const locList = locationService.getLocalities(targetDistId, true);
        setLocalities(locList);
      } else {
        setLocalities([]);
      }
    } catch (e) {
      console.warn('Error loading localities for district', e);
    } finally {
      setLoadingLocalities(false);
    }
  }, [value?.districtId, value?.districtName, districts]);

  // Click outside listener to dismiss popovers
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Computed Breadcrumb
  const breadcrumb = useMemo(() => {
    if (value?.localityName && value?.districtName && value?.stateName) {
      return `India → ${value.stateName} → ${value.districtName} → ${value.localityName}`;
    }
    if (value?.districtName && value?.stateName) {
      return `India → ${value.stateName} → ${value.districtName}`;
    }
    if (value?.stateName) {
      return `India → ${value.stateName}`;
    }
    return 'Pan-India';
  }, [value?.stateName, value?.districtName, value?.localityName]);

  const currentLevel = useMemo<'INDIA' | 'STATE' | 'DISTRICT' | 'LOCALITY' | 'AREA'>(() => {
    if (value?.areaName) return 'AREA';
    if (value?.localityName) return 'LOCALITY';
    if (value?.districtName) return 'DISTRICT';
    if (value?.stateName) return 'STATE';
    return 'INDIA';
  }, [value?.stateName, value?.districtName, value?.localityName, value?.areaName]);

  // Theme Styling Configuration
  const themeStyles = useMemo(() => {
    switch (theme) {
      case 'emerald':
        return {
          accent: 'emerald',
          borderActive: 'border-emerald-500/70',
          ringActive: 'ring-2 ring-emerald-500/30',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          btnActiveBg: 'bg-emerald-950/80 border-emerald-500/60 text-white',
          itemHover: 'hover:bg-emerald-950/50 hover:text-emerald-200',
          itemSelected: 'bg-emerald-600 text-white font-bold',
          iconColor: 'text-emerald-400',
          caretColor: '#10b981',
          popoverBg: 'bg-[#03150d]/95 border-emerald-500/60 shadow-emerald-950/50',
          inputBg: 'bg-[#02100a] border-emerald-500/50 focus:border-emerald-400',
        };
      case 'purple':
        return {
          accent: 'purple',
          borderActive: 'border-purple-500/70',
          ringActive: 'ring-2 ring-purple-500/30',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          btnActiveBg: 'bg-purple-950/80 border-purple-500/60 text-white',
          itemHover: 'hover:bg-purple-950/50 hover:text-purple-200',
          itemSelected: 'bg-purple-600 text-white font-bold',
          iconColor: 'text-purple-400',
          caretColor: '#a855f7',
          popoverBg: 'bg-[#120422]/95 border-purple-500/60 shadow-purple-950/50',
          inputBg: 'bg-[#1a0830] border-purple-500/50 focus:border-purple-400',
        };
      case 'cyan':
        return {
          accent: 'cyan',
          borderActive: 'border-cyan-500/70',
          ringActive: 'ring-2 ring-cyan-500/30',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          btnActiveBg: 'bg-cyan-950/80 border-cyan-500/60 text-white',
          itemHover: 'hover:bg-cyan-950/50 hover:text-cyan-200',
          itemSelected: 'bg-cyan-600 text-white font-bold',
          iconColor: 'text-cyan-400',
          caretColor: '#06b6d4',
          popoverBg: 'bg-[#041525]/95 border-cyan-500/60 shadow-cyan-950/50',
          inputBg: 'bg-[#030e1c] border-cyan-500/50 focus:border-cyan-400',
        };
      default:
        return {
          accent: 'blue',
          borderActive: 'border-blue-500/70',
          ringActive: 'ring-2 ring-blue-500/30',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          btnActiveBg: 'bg-blue-950/80 border-blue-500/60 text-white',
          itemHover: 'hover:bg-slate-800 hover:text-white',
          itemSelected: 'bg-blue-600 text-white font-bold',
          iconColor: 'text-blue-400',
          caretColor: '#3b82f6',
          popoverBg: 'bg-slate-950/95 border-slate-700 shadow-2xl',
          inputBg: 'bg-slate-900 border-slate-700 focus:border-blue-500',
        };
    }
  }, [theme]);

  // CASCADING SELECTION HANDLERS
  const handleSelectState = (st: State | null) => {
    setOpenDropdown(null);
    setStateSearch('');
    if (!st) {
      // Clear all -> Pan-India
      onChange({
        countryId: 'loc-country-in',
        level: 'INDIA',
        breadcrumb: 'Pan-India',
      });
      return;
    }

    // New state selected: clear district, locality, area
    onChange({
      countryId: 'loc-country-in',
      stateId: st.id,
      stateName: st.name,
      districtId: undefined,
      districtName: undefined,
      localityId: undefined,
      localityName: undefined,
      areaId: undefined,
      areaName: undefined,
      level: 'STATE',
      breadcrumb: `India → ${st.name}`,
    });
  };

  const handleSelectDistrict = (dist: DistrictLocation | null) => {
    setOpenDropdown(null);
    setDistrictSearch('');
    if (!dist) {
      // Clear district: revert to state level
      onChange({
        countryId: 'loc-country-in',
        stateId: value?.stateId,
        stateName: value?.stateName,
        districtId: undefined,
        districtName: undefined,
        localityId: undefined,
        localityName: undefined,
        areaId: undefined,
        areaName: undefined,
        level: value?.stateName ? 'STATE' : 'INDIA',
        breadcrumb: value?.stateName ? `India → ${value.stateName}` : 'Pan-India',
      });
      return;
    }

    // New district selected: clear locality and area
    onChange({
      countryId: 'loc-country-in',
      stateId: value?.stateId,
      stateName: value?.stateName,
      districtId: dist.id,
      districtName: dist.name,
      localityId: undefined,
      localityName: undefined,
      areaId: undefined,
      areaName: undefined,
      level: 'DISTRICT',
      breadcrumb: `India → ${value?.stateName || dist.stateId} → ${dist.name}`,
    });
  };

  const handleSelectLocality = (loc: Locality | null) => {
    setOpenDropdown(null);
    setLocalitySearch('');
    if (!loc) {
      onChange({
        countryId: 'loc-country-in',
        stateId: value?.stateId,
        stateName: value?.stateName,
        districtId: value?.districtId,
        districtName: value?.districtName,
        localityId: undefined,
        localityName: undefined,
        areaId: undefined,
        areaName: undefined,
        level: 'DISTRICT',
        breadcrumb: `India → ${value?.stateName} → ${value?.districtName}`,
      });
      return;
    }

    onChange({
      countryId: 'loc-country-in',
      stateId: value?.stateId,
      stateName: value?.stateName,
      districtId: value?.districtId,
      districtName: value?.districtName,
      localityId: loc.id,
      localityName: loc.name,
      areaId: undefined,
      areaName: undefined,
      level: 'LOCALITY',
      breadcrumb: `India → ${value?.stateName} → ${value?.districtName} → ${loc.name}`,
    });
  };

  const handleResetToPanIndia = () => {
    setOpenDropdown(null);
    onChange({
      countryId: 'loc-country-in',
      level: 'INDIA',
      breadcrumb: 'Pan-India',
    });
  };

  // Filtered dropdown options based on search query
  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return states;
    const q = stateSearch.toLowerCase();
    return states.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
  }, [states, stateSearch]);

  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return districts;
    const q = districtSearch.toLowerCase();
    return districts.filter(d => d.name.toLowerCase().includes(q) || (d.code && d.code.toLowerCase().includes(q)));
  }, [districts, districtSearch]);

  const filteredLocalities = useMemo(() => {
    if (!localitySearch.trim()) return localities;
    const q = localitySearch.toLowerCase();
    return localities.filter(l => l.name.toLowerCase().includes(q) || (l.pincode && l.pincode.includes(q)));
  }, [localities, localitySearch]);

  // Current selections resolution
  const selectedStateObj = states.find(s => 
    (value?.stateId && s.id === value.stateId) || 
    (value?.stateName && s.name.toLowerCase() === value.stateName.toLowerCase())
  );
  
  const selectedDistrictObj = districts.find(d => 
    (value?.districtId && d.id === value.districtId) || 
    (value?.districtName && d.name.toLowerCase() === value.districtName.toLowerCase())
  );

  const selectedLocalityObj = localities.find(l => 
    (value?.localityId && l.id === value.localityId) || 
    (value?.localityName && l.name.toLowerCase() === value.localityName.toLowerCase())
  );

  const isCompact = variant === 'compact' || variant === 'bar' || variant === 'inline';

  // ==========================================================================
  // RENDER POPULAR POPOVERS (SHARED BY BOTH COMPACT AND CARD VARIANTS)
  // ==========================================================================
  const renderStatePopover = () => (
    <div className={`absolute left-0 mt-2 z-[100] w-[340px] sm:w-[420px] rounded-2xl border-2 shadow-2xl backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${themeStyles.popoverBg}`}>
      {/* Header and Search input with pure white text */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-300">
          <span className="flex items-center gap-1.5">
            <Compass className={`w-3.5 h-3.5 ${themeStyles.iconColor}`} />
            Select State or Union Territory
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {filteredStates.length} / {states.length}
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={stateSearch}
            onChange={(e) => setStateSearch(e.target.value)}
            placeholder="Search 28 States & 8 UTs (e.g. UP, Bihar, Delhi)..."
            autoFocus
            className={`w-full h-9 pl-9 pr-3 rounded-xl text-xs font-semibold outline-none transition-all ${themeStyles.inputBg}`}
            style={{
              color: '#ffffff',
              caretColor: themeStyles.caretColor,
              WebkitTextFillColor: '#ffffff'
            }}
          />
        </div>

        {/* Fast Territory Jump Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold scrollbar-none">
          <button
            type="button"
            onClick={() => handleSelectState(null)}
            className={`px-2 py-0.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
              !selectedStateObj
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            All India
          </button>
          {FAST_TERRITORY_PRESETS.map((preset) => {
            const isMatch = selectedStateObj?.name.toLowerCase() === preset.name.toLowerCase();
            const stateMatch = states.find(s => s.name.toLowerCase() === preset.name.toLowerCase());
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => stateMatch && handleSelectState(stateMatch)}
                className={`px-2 py-0.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                  isMatch
                    ? `${themeStyles.itemSelected} border-white`
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* State List with High Contrast */}
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/40 p-1.5 space-y-0.5">
        {/* Pan-India Option */}
        <button
          type="button"
          onClick={() => handleSelectState(null)}
          className={`w-full px-3 py-2 text-left rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
            !selectedStateObj ? 'bg-blue-600/30 text-blue-200 font-black border border-blue-500/40' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">Pan-India (All 28 States & 8 UTs)</span>
          </span>
          {!selectedStateObj && <Check className="w-4 h-4 text-blue-400" />}
        </button>

        {filteredStates.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            No matching State or UT found.
          </div>
        ) : (
          filteredStates.map((st) => {
            const isSelected = selectedStateObj?.id === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSelectState(st)}
                className={`w-full px-3 py-2 text-left rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? themeStyles.itemSelected
                    : `text-slate-200 ${themeStyles.itemHover}`
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-white truncate">{st.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({st.code})</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {st.type}
                  </span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  const renderDistrictPopover = () => (
    <div className={`absolute left-0 mt-2 z-[100] w-[320px] sm:w-[380px] rounded-2xl border-2 shadow-2xl backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${themeStyles.popoverBg}`}>
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-300">
          <span className="flex items-center gap-1.5">
            <Building2 className={`w-3.5 h-3.5 ${themeStyles.iconColor}`} />
            Districts in {selectedStateObj?.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {filteredDistricts.length} / {districts.length}
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={districtSearch}
            onChange={(e) => setDistrictSearch(e.target.value)}
            placeholder={`Search districts in ${selectedStateObj?.name}...`}
            autoFocus
            className={`w-full h-9 pl-9 pr-3 rounded-xl text-xs font-semibold outline-none transition-all ${themeStyles.inputBg}`}
            style={{
              color: '#ffffff',
              caretColor: themeStyles.caretColor,
              WebkitTextFillColor: '#ffffff'
            }}
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/40 p-1.5 space-y-0.5">
        <button
          type="button"
          onClick={() => handleSelectDistrict(null)}
          className={`w-full px-3 py-2 text-left rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
            !selectedDistrictObj ? `${themeStyles.badgeBg} font-black` : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <span className="font-bold">All Districts in {selectedStateObj?.name} (Pan-State)</span>
          {!selectedDistrictObj && <Check className="w-4 h-4 text-emerald-400" />}
        </button>

        {filteredDistricts.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            No districts configured for this state.
          </div>
        ) : (
          filteredDistricts.map((d) => {
            const isSelected = selectedDistrictObj?.id === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => handleSelectDistrict(d)}
                className={`w-full px-3 py-2 text-left rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? themeStyles.itemSelected
                    : `text-slate-200 ${themeStyles.itemHover}`
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-white truncate">{d.name}</span>
                  {d.code && <span className="text-[10px] text-slate-400 font-mono">({d.code})</span>}
                </div>
                {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  const renderLocalityPopover = () => (
    <div className={`absolute left-0 mt-2 z-[100] w-[320px] sm:w-[360px] rounded-2xl border-2 shadow-2xl backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${themeStyles.popoverBg}`}>
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-300">
          <span className="flex items-center gap-1.5">
            <Building2 className={`w-3.5 h-3.5 ${themeStyles.iconColor}`} />
            Localities in {selectedDistrictObj?.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {filteredLocalities.length} / {localities.length}
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={localitySearch}
            onChange={(e) => setLocalitySearch(e.target.value)}
            placeholder={`Search town, locality, PIN code in ${selectedDistrictObj?.name}...`}
            autoFocus
            className={`w-full h-9 pl-9 pr-3 rounded-xl text-xs font-semibold outline-none transition-all ${themeStyles.inputBg}`}
            style={{
              color: '#ffffff',
              caretColor: themeStyles.caretColor,
              WebkitTextFillColor: '#ffffff'
            }}
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/40 p-1.5 space-y-0.5">
        <button
          type="button"
          onClick={() => handleSelectLocality(null)}
          className={`w-full px-3 py-2 text-left rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
            !selectedLocalityObj ? `${themeStyles.badgeBg} font-black` : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <span className="font-bold">All Localities in {selectedDistrictObj?.name}</span>
          {!selectedLocalityObj && <Check className="w-4 h-4 text-emerald-400" />}
        </button>

        {filteredLocalities.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            All general localities apply for this district.
          </div>
        ) : (
          filteredLocalities.map((loc) => {
            const isSelected = selectedLocalityObj?.id === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleSelectLocality(loc)}
                className={`w-full px-3 py-2 text-left rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? themeStyles.itemSelected
                    : `text-slate-200 ${themeStyles.itemHover}`
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-white truncate">{loc.name}</span>
                  {loc.pincode && (
                    <span className="text-[10px] text-slate-400 font-mono">PIN: {loc.pincode}</span>
                  )}
                </div>
                {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  // ==========================================================================
  // VARIANT 1: SLEEK CYBER-HOLOGRAPHIC COMPACT BAR (FOR TOOLBAR INTEGRATION)
  // ==========================================================================
  if (isCompact) {
    return (
      <div 
        ref={containerRef}
        className={`relative flex items-center flex-wrap gap-2 text-xs font-mono ${className}`}
      >
        {/* State / UT Selector Button */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpenDropdown(openDropdown === 'state' ? null : 'state')}
            className={`h-9 px-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-md ${
              openDropdown === 'state'
                ? `bg-slate-950 ${themeStyles.borderActive} ${themeStyles.ringActive} text-white`
                : selectedStateObj
                ? themeStyles.btnActiveBg
                : 'bg-slate-900/90 border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white'
            }`}
          >
            <Compass className={`w-3.5 h-3.5 ${selectedStateObj ? themeStyles.iconColor : 'text-slate-400'}`} />
            <span className="truncate max-w-[170px]">
              {selectedStateObj ? `${selectedStateObj.name} (${selectedStateObj.code})` : 'All States (Pan-India)'}
            </span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openDropdown === 'state' ? 'rotate-180 text-white' : ''}`} />
          </button>

          {/* Popover */}
          {openDropdown === 'state' && renderStatePopover()}
        </div>

        {/* District Selector Button (Enabled once state is selected) */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled || !selectedStateObj}
            onClick={() => setOpenDropdown(openDropdown === 'district' ? null : 'district')}
            className={`h-9 px-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
              !selectedStateObj
                ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                : openDropdown === 'district'
                ? `bg-slate-950 ${themeStyles.borderActive} ${themeStyles.ringActive} text-white cursor-pointer`
                : selectedDistrictObj
                ? themeStyles.btnActiveBg
                : 'bg-slate-900/90 border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white cursor-pointer'
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${selectedDistrictObj ? themeStyles.iconColor : 'text-slate-400'}`} />
            <span className="truncate max-w-[150px]">
              {!selectedStateObj
                ? 'Districts (Select State)'
                : loadingDistricts
                ? 'Loading districts...'
                : selectedDistrictObj
                ? selectedDistrictObj.name
                : `All Districts (${districts.length})`}
            </span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openDropdown === 'district' ? 'rotate-180 text-white' : ''}`} />
          </button>

          {/* Popover */}
          {openDropdown === 'district' && selectedStateObj && renderDistrictPopover()}
        </div>

        {/* Locality Selector Button (If showLocality enabled) */}
        {showLocality && selectedDistrictObj && (
          <div className="relative">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setOpenDropdown(openDropdown === 'locality' ? null : 'locality')}
              className={`h-9 px-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                openDropdown === 'locality'
                  ? `bg-slate-950 ${themeStyles.borderActive} ${themeStyles.ringActive} text-white`
                  : selectedLocalityObj
                  ? themeStyles.btnActiveBg
                  : 'bg-slate-900/90 border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${selectedLocalityObj ? themeStyles.iconColor : 'text-slate-400'}`} />
              <span className="truncate max-w-[140px]">
                {selectedLocalityObj ? selectedLocalityObj.name : 'All Localities'}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openDropdown === 'locality' ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* Popover */}
            {openDropdown === 'locality' && renderLocalityPopover()}
          </div>
        )}

        {/* 1-Click Reset to Pan-India if filter is active */}
        {selectedStateObj && (
          <button
            type="button"
            onClick={handleResetToPanIndia}
            disabled={disabled}
            className="h-9 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Clear regional filter and reset to Pan-India"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>
    );
  }

  // ==========================================================================
  // VARIANT 2: FULL PANORAMIC CYBER CARD DECK (FOR DEDICATED SECTIONS)
  // ==========================================================================
  return (
    <div 
      ref={containerRef}
      className={`relative rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 shadow-2xl backdrop-blur-xl ${className}`}
    >
      {/* Top Header Strip with Live Breadcrumb Context */}
      {showBreadcrumb && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${themeStyles.badgeBg}`}>
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Territory Scope:</span>
              <span className="font-extrabold text-white truncate text-xs bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 shadow-inner">
                {breadcrumb}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 border ${themeStyles.badgeBg}`}>
                {currentLevel === 'INDIA' ? 'PAN-INDIA' : currentLevel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {currentLevel !== 'INDIA' && (
              <button
                type="button"
                onClick={handleResetToPanIndia}
                disabled={disabled}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Reset to Pan-India</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selectors Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
        {/* Level 1: State / UT Selector */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Compass className={`w-3.5 h-3.5 ${themeStyles.iconColor}`} />
              <span>State / Union Territory</span>
              <span className="text-[10px] font-normal text-slate-500">({states.length} Active)</span>
            </span>
            {selectedStateObj && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleSelectState(null); }}
                className="text-slate-400 hover:text-rose-400 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                title="Clear state"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </label>

          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpenDropdown(openDropdown === 'state' ? null : 'state')}
            className={`w-full h-11 px-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              openDropdown === 'state'
                ? `bg-slate-950 ${themeStyles.borderActive} ${themeStyles.ringActive} text-white`
                : selectedStateObj
                ? themeStyles.btnActiveBg
                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <span className="truncate font-bold">
              {selectedStateObj ? `${selectedStateObj.name} (${selectedStateObj.code})` : 'All States & UTs (Pan-India)'}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openDropdown === 'state' ? 'rotate-180 text-white' : ''}`} />
          </button>

          {/* Popover */}
          {openDropdown === 'state' && renderStatePopover()}
        </div>

        {/* Level 2: District Selector */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className={`w-3.5 h-3.5 ${themeStyles.iconColor}`} />
              <span>District / Administrative Zone</span>
              {selectedStateObj && (
                <span className="text-[10px] font-normal text-slate-500">
                  ({loadingDistricts ? 'Loading...' : `${districts.length} in ${selectedStateObj.name}`})
                </span>
              )}
            </span>
            {selectedDistrictObj && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleSelectDistrict(null); }}
                className="text-slate-400 hover:text-rose-400 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                title="Clear district"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </label>

          <button
            type="button"
            disabled={disabled || !selectedStateObj}
            onClick={() => setOpenDropdown(openDropdown === 'district' ? null : 'district')}
            className={`w-full h-11 px-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              !selectedStateObj
                ? 'bg-slate-950/40 border-slate-800/60 text-slate-600 cursor-not-allowed'
                : openDropdown === 'district'
                ? `bg-slate-950 ${themeStyles.borderActive} ${themeStyles.ringActive} text-white cursor-pointer`
                : selectedDistrictObj
                ? themeStyles.btnActiveBg
                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 cursor-pointer'
            }`}
          >
            <span className="truncate font-bold">
              {!selectedStateObj
                ? 'Select State/UT First'
                : loadingDistricts
                ? 'Loading districts...'
                : selectedDistrictObj
                ? selectedDistrictObj.name
                : `All Districts in ${selectedStateObj.name}`}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openDropdown === 'district' ? 'rotate-180 text-white' : ''}`} />
          </button>

          {/* Popover */}
          {openDropdown === 'district' && selectedStateObj && renderDistrictPopover()}
        </div>

        {/* Level 3: Locality Selector */}
        {showLocality && (
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className={`w-3.5 h-3.5 ${themeStyles.iconColor}`} />
                <span>Locality / Town</span>
                {selectedDistrictObj && (
                  <span className="text-[10px] font-normal text-slate-500">
                    ({loadingLocalities ? 'Loading...' : `${localities.length} in ${selectedDistrictObj.name}`})
                  </span>
                )}
              </span>
              {selectedLocalityObj && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleSelectLocality(null); }}
                  className="text-slate-400 hover:text-rose-400 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                  title="Clear locality"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </label>

            <button
              type="button"
              disabled={disabled || !selectedDistrictObj}
              onClick={() => setOpenDropdown(openDropdown === 'locality' ? null : 'locality')}
              className={`w-full h-11 px-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                !selectedDistrictObj
                  ? 'bg-slate-950/40 border-slate-800/60 text-slate-600 cursor-not-allowed'
                  : openDropdown === 'locality'
                  ? `bg-slate-950 ${themeStyles.borderActive} ${themeStyles.ringActive} text-white cursor-pointer`
                  : selectedLocalityObj
                  ? themeStyles.btnActiveBg
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 cursor-pointer'
              }`}
            >
              <span className="truncate font-bold">
                {!selectedDistrictObj
                  ? 'Select District First'
                  : loadingLocalities
                  ? 'Loading localities...'
                  : selectedLocalityObj
                  ? selectedLocalityObj.name
                  : `All Localities in ${selectedDistrictObj.name}`}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openDropdown === 'locality' ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* Popover */}
            {openDropdown === 'locality' && selectedDistrictObj && renderLocalityPopover()}
          </div>
        )}
      </div>
    </div>
  );
};
