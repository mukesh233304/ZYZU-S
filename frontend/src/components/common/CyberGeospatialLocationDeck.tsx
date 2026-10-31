// FOCUSPOINT — Universal Cyber-HUD Geospatial Command Deck
// Super Admin Sovereign Location Radar with Holographic Telemetry & Cascading Multi-Deck Control
// Resolves All 36 States & UTs, 720+ Districts, Postal PIN Satellite Radar, Fast Presets & Matrix Leaderboard

import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Crosshair, 
  Navigation, 
  Radio, 
  Radar, 
  RotateCcw, 
  Search, 
  Sparkles, 
  Compass, 
  Layers, 
  SlidersHorizontal, 
  ChevronRight, 
  X,
  IndianRupee,
  Building2,
  TrendingUp,
  Percent,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { locationService } from '../../services/locationService';
import { PanIndiaLocationSelector, LocationSelectionPayload } from './PanIndiaLocationSelector';
import { Modal } from './Modal';
import { State, DistrictLocation, Locality } from '../../types/location';

export interface DistrictMetricEntry {
  districtName: string;
  stateName: string;
  totalTxns: number;
  totalGross: number;
  totalPlatformFee?: number;
  totalPartnerPayout?: number;
}

export interface CyberGeospatialLocationDeckProps {
  selectedLocation: LocationSelectionPayload;
  onChange: (location: LocationSelectionPayload) => void;
  audioEnabled?: boolean;
  onAudioPlay?: (type: 'click' | 'confirm' | 'warp' | 'alert') => void;
  stats?: {
    totalRecords?: number;
    totalAmount?: number;
    currencySymbol?: string;
    label?: string;
  };
  districtMetrics?: DistrictMetricEntry[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const CyberGeospatialLocationDeck: React.FC<CyberGeospatialLocationDeckProps> = ({
  selectedLocation,
  onChange,
  audioEnabled = true,
  onAudioPlay,
  stats,
  districtMetrics = [],
  title = 'GEOSPATIAL LOCATION RADAR & JURISDICTION CONTROL DECK',
  subtitle = 'TERRITORIAL DISBURSEMENT & FINANCIAL INTELLIGENCE MATRIX',
  compact = false
}) => {
  // Modal states
  const [isGeoDeckOpen, setIsGeoDeckOpen] = useState(false);
  const [isDistrictMatrixOpen, setIsDistrictMatrixOpen] = useState(false);
  const [matrixSearch, setMatrixSearch] = useState('');

  // Postal PIN Radar state
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResolving, setPincodeResolving] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState('');

  const playSound = (type: 'click' | 'confirm' | 'warp' | 'alert') => {
    if (audioEnabled && onAudioPlay) {
      onAudioPlay(type);
    }
  };

  // Master States from centralized Location Master (All 28 States & 8 UTs permanently loaded)
  const masterStates: State[] = useMemo(() => {
    try {
      return locationService.getStates('loc-country-in', true);
    } catch {
      return [];
    }
  }, []);

  const selectedState = selectedLocation.stateName || 'ALL';
  const selectedDistrict = selectedLocation.districtName || 'ALL';
  const selectedLocality = selectedLocation.localityName || 'ALL';

  // Master Districts (cascades based on selected State)
  const masterDistricts: DistrictLocation[] = useMemo(() => {
    try {
      if (selectedState === 'ALL' || !selectedState) {
        return locationService.getDistricts(undefined, true);
      }
      const st = masterStates.find(
        s => s.name.toLowerCase() === selectedState.toLowerCase() || s.id === selectedLocation.stateId
      );
      if (!st) return [];
      return locationService.getDistricts(st.id, true);
    } catch {
      return [];
    }
  }, [masterStates, selectedState, selectedLocation.stateId]);

  // Master Localities (cascades based on selected District)
  const masterLocalities: Locality[] = useMemo(() => {
    try {
      if (selectedDistrict === 'ALL' || !selectedDistrict) {
        return [];
      }
      const dt = masterDistricts.find(
        d => d.name.toLowerCase() === selectedDistrict.toLowerCase() || d.id === selectedLocation.districtId
      );
      if (!dt) return [];
      return locationService.getLocalities(dt.id, true);
    } catch {
      return [];
    }
  }, [masterDistricts, selectedDistrict, selectedLocation.districtId]);

  // Dynamic GPS Coordinates derivation
  const activeGeoCoordinates = useMemo(() => {
    const dist = (selectedDistrict || '').toLowerCase();
    const st = (selectedState || '').toLowerCase();

    if (dist.includes('ghazipur')) return { lat: '25.5878° N', lon: '83.5783° E', code: 'GZP-HQ', elevation: '68m' };
    if (dist.includes('varanasi')) return { lat: '25.3176° N', lon: '82.9739° E', code: 'VNS-AXIS', elevation: '81m' };
    if (dist.includes('lucknow')) return { lat: '26.8467° N', lon: '80.9462° E', code: 'LKO-GRID', elevation: '123m' };
    if (dist.includes('patna')) return { lat: '25.5941° N', lon: '85.1376° E', code: 'PAT-BIHAR', elevation: '53m' };
    if (dist.includes('noida') || dist.includes('gautam')) return { lat: '28.5355° N', lon: '77.3910° E', code: 'NCR-NOIDA', elevation: '200m' };
    if (dist.includes('saidpur')) return { lat: '25.5458° N', lon: '83.2215° E', code: 'SPD-SEC', elevation: '72m' };
    if (dist.includes('mumbai')) return { lat: '19.0760° N', lon: '72.8777° E', code: 'BOM-METRO', elevation: '14m' };
    if (dist.includes('bengaluru') || dist.includes('bangalore')) return { lat: '12.9716° N', lon: '77.5946° E', code: 'BLR-TECH', elevation: '920m' };
    if (dist.includes('kolkata')) return { lat: '22.5726° N', lon: '88.3639° E', code: 'CCU-EAST', elevation: '9m' };
    if (dist.includes('jaipur')) return { lat: '26.9124° N', lon: '75.7873° E', code: 'JPR-WEST', elevation: '431m' };
    if (st.includes('uttar pradesh')) return { lat: '26.8467° N', lon: '80.9462° E', code: 'UP-PROVINCE', elevation: '100m' };
    if (st.includes('bihar')) return { lat: '25.0961° N', lon: '85.3131° E', code: 'BR-PROVINCE', elevation: '60m' };
    if (st.includes('delhi')) return { lat: '28.7041° N', lon: '77.1025° E', code: 'DL-CAPITAL', elevation: '216m' };
    if (st.includes('maharashtra')) return { lat: '19.7515° N', lon: '75.7139° E', code: 'MH-WEST', elevation: '500m' };
    if (st.includes('karnataka')) return { lat: '15.3173° N', lon: '75.7139° E', code: 'KA-SOUTH', elevation: '650m' };
    return { lat: '20.5937° N', lon: '78.9629° E', code: 'IN-SOVEREIGN', elevation: 'MSL' };
  }, [selectedDistrict, selectedState]);

  // Handler: State Change
  const handleStateChange = (stateName: string) => {
    playSound('click');
    if (stateName === 'ALL' || !stateName) {
      onChange({
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
    } else {
      const st = masterStates.find(s => s.name.toLowerCase() === stateName.toLowerCase());
      onChange({
        countryId: 'loc-country-in',
        stateId: st?.id || '',
        stateName: st?.name || stateName,
        districtId: '',
        districtName: '',
        localityId: '',
        localityName: '',
        level: 'STATE',
        breadcrumb: `India → ${st?.name || stateName}`
      });
    }
  };

  // Handler: District Change
  const handleDistrictChange = (districtName: string) => {
    playSound('click');
    if (districtName === 'ALL' || !districtName) {
      onChange({
        ...selectedLocation,
        districtId: '',
        districtName: '',
        localityId: '',
        localityName: '',
        level: selectedLocation.stateName ? 'STATE' : 'INDIA',
        breadcrumb: selectedLocation.stateName ? `India → ${selectedLocation.stateName}` : 'Pan-India'
      });
    } else {
      const dt = masterDistricts.find(d => d.name.toLowerCase() === districtName.toLowerCase());
      let parentState = selectedState;
      let parentStateId = selectedLocation.stateId;

      if (dt && (selectedState === 'ALL' || !selectedState)) {
        const inferredState = masterStates.find(s => s.id === dt.stateId);
        if (inferredState) {
          parentState = inferredState.name;
          parentStateId = inferredState.id;
        }
      }

      onChange({
        countryId: 'loc-country-in',
        stateId: parentStateId,
        stateName: parentState === 'ALL' ? '' : parentState,
        districtId: dt?.id || '',
        districtName: dt?.name || districtName,
        localityId: '',
        localityName: '',
        level: 'DISTRICT',
        breadcrumb: parentState !== 'ALL' && parentState ? `India → ${parentState} → ${dt?.name || districtName}` : `India → ${dt?.name || districtName}`
      });
    }
  };

  // Handler: Locality Change
  const handleLocalityChange = (localityName: string) => {
    playSound('click');
    if (localityName === 'ALL' || !localityName) {
      onChange({
        ...selectedLocation,
        localityId: '',
        localityName: '',
        level: 'DISTRICT',
        breadcrumb: `India → ${selectedLocation.stateName} → ${selectedLocation.districtName}`
      });
    } else {
      const loc = masterLocalities.find(l => l.name.toLowerCase() === localityName.toLowerCase());
      onChange({
        ...selectedLocation,
        localityId: loc?.id || '',
        localityName: loc?.name || localityName,
        level: 'LOCALITY',
        breadcrumb: `India → ${selectedLocation.stateName} → ${selectedLocation.districtName} → ${loc?.name || localityName}`
      });
    }
  };

  // Handler: Postal PIN Submit
  const handlePincodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pincodeInput.trim().replace(/\D/g, '');
    if (clean.length !== 6) {
      setPincodeMessage('Enter 6-digit PIN');
      return;
    }
    setPincodeResolving(true);
    setPincodeMessage('');
    try {
      const res = await locationService.lookupPincode(clean);
      if (res.success && (res.state || res.stateName)) {
        playSound('confirm');
        const stName = res.state?.name || res.stateName || '';
        const dtName = res.district?.name || res.districtName || '';
        const locName = res.suggestedLocality?.name || '';
        
        onChange({
          countryId: 'loc-country-in',
          stateId: res.state?.id || res.stateId || '',
          stateName: stName,
          districtId: res.district?.id || res.districtId || '',
          districtName: dtName,
          localityId: res.suggestedLocality?.id || '',
          localityName: locName,
          level: locName ? 'LOCALITY' : (dtName ? 'DISTRICT' : 'STATE'),
          breadcrumb: `India → ${stName}${dtName ? ` → ${dtName}` : ''}${locName ? ` → ${locName}` : ''}`
        });
        setPincodeMessage(`🛰️ Locked: ${dtName || stName}, ${stName}`);
      } else {
        setPincodeMessage('Postal PIN not found');
      }
    } catch (err) {
      console.error('Pincode lookup error', err);
      setPincodeMessage('Lookup error');
    } finally {
      setPincodeResolving(false);
    }
  };

  // Handler: Clear Filters
  const handleClear = () => {
    playSound('confirm');
    setPincodeInput('');
    setPincodeMessage('');
    onChange({
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
  };

  // Presets
  const applyPreset = (preset: 'PAN_INDIA' | 'UP' | 'BIHAR' | 'GHAZIPUR' | 'SAIDPUR' | 'VARANASI' | 'PATNA' | 'DELHI') => {
    playSound('warp');
    switch (preset) {
      case 'PAN_INDIA':
        handleStateChange('ALL');
        break;
      case 'UP':
        handleStateChange('Uttar Pradesh');
        break;
      case 'BIHAR':
        handleStateChange('Bihar');
        break;
      case 'GHAZIPUR':
        handleDistrictChange('Ghazipur');
        break;
      case 'SAIDPUR':
        handleDistrictChange('Saidpur');
        break;
      case 'VARANASI':
        handleDistrictChange('Varanasi');
        break;
      case 'PATNA':
        handleDistrictChange('Patna');
        break;
      case 'DELHI':
        handleStateChange('Delhi');
        break;
    }
  };

  // Filtered matrix list
  const filteredMatrix = useMemo(() => {
    if (!matrixSearch.trim()) return districtMetrics;
    const q = matrixSearch.toLowerCase();
    return districtMetrics.filter(d => 
      d.districtName.toLowerCase().includes(q) ||
      d.stateName.toLowerCase().includes(q)
    );
  }, [districtMetrics, matrixSearch]);

  const hasActiveFilter = Boolean(selectedLocation.stateName || selectedLocation.districtName || selectedLocation.localityName);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950/95 border-2 border-slate-800 p-4 sm:p-6 shadow-2xl hud-corner-brackets">
      {/* Background Neon Radar Ambience */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ==================================================================== */}
      {/* 1. RADAR HEADER & REAL-TIME SATELLITE TELEMETRY BADGE               */}
      {/* ==================================================================== */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
            <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Radar className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              {title}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono text-[11px]">{subtitle}</span>
            <span className="text-slate-600">•</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              SATELLITE LOCK: ACTIVE
            </span>
          </div>

          {/* Interactive Holographic Breadcrumb Trail */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs font-mono pt-1">
            <span className="text-slate-400 text-[11px]">ACTIVE TERRITORY:</span>
            <button
              onClick={() => handleStateChange('ALL')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                !selectedLocation.stateName && !selectedLocation.districtName
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
              }`}
            >
              INDIA
            </button>

            {selectedLocation.stateName && (
              <>
                <ChevronRight className="w-3 h-3 text-cyan-500/60" />
                <button
                  onClick={() => handleDistrictChange('ALL')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    selectedLocation.stateName && !selectedLocation.districtName
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-900 text-cyan-300 hover:bg-slate-800'
                  }`}
                >
                  {selectedLocation.stateName.toUpperCase()}
                </button>
              </>
            )}

            {selectedLocation.districtName && (
              <>
                <ChevronRight className="w-3 h-3 text-amber-500/60" />
                <button
                  onClick={() => handleLocalityChange('ALL')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    selectedLocation.districtName && !selectedLocation.localityName
                      ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-900 text-amber-300 hover:bg-slate-800'
                  }`}
                >
                  {selectedLocation.districtName.toUpperCase()}
                </button>
              </>
            )}

            {selectedLocation.localityName && (
              <>
                <ChevronRight className="w-3 h-3 text-emerald-500/60" />
                <span className="px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-black shadow-sm">
                  {selectedLocation.localityName.toUpperCase()}
                </span>
              </>
            )}

            {hasActiveFilter && (
              <button
                onClick={handleClear}
                className="ml-2 px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Reset to Pan-India"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                RESET TO ALL-INDIA
              </button>
            )}
          </div>
        </div>

        {/* Dynamic GPS Coordinates & Telemetry HUD */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center gap-3 shadow-inner">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Crosshair className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div className="text-[11px] font-mono leading-tight">
              <div className="text-slate-400 flex items-center gap-1">
                <span className="text-cyan-400 font-bold">{activeGeoCoordinates.code}</span>
                <span>• MSL: {activeGeoCoordinates.elevation}</span>
              </div>
              <div className="text-slate-200 font-bold tracking-wider">
                {activeGeoCoordinates.lat}, {activeGeoCoordinates.lon}
              </div>
            </div>
          </div>

          {stats && (
            <div className="hidden sm:flex px-3.5 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/30 items-center gap-3 shadow-inner">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-[11px] font-mono leading-tight">
                <div className="text-slate-400 uppercase font-semibold">
                  {stats.label || 'Filtered Scope Volume'}
                </div>
                <div className="text-emerald-400 font-bold tracking-wider">
                  {stats.currencySymbol || '₹'}{(stats.totalAmount || 0).toLocaleString('en-IN')}
                  {stats.totalRecords !== undefined && (
                    <span className="text-slate-400 font-normal ml-1">({stats.totalRecords} txns)</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. CASCADING JURISDICTION SELECTOR CONTROLS                           */}
      {/* ==================================================================== */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
        {/* 1. Master State / UT Selector (36 Total) */}
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>State / UT Jurisdiction</span>
            <span className="text-cyan-400 font-normal">{masterStates.length} Regions</span>
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-cyan-400 pointer-events-none" />
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 hover:border-cyan-500/60 focus:border-cyan-400 rounded-xl text-xs font-mono text-slate-100 transition-all cursor-pointer outline-hidden shadow-inner"
            >
              <option value="ALL">All-India Sovereign Scope (28 States & 8 UTs)</option>
              {masterStates.map(s => (
                <option key={s.id} value={s.name}>
                  [{s.code || s.name.slice(0, 2).toUpperCase()}] {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Cascading District Selector */}
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>District Jurisdiction</span>
            <span className="text-amber-400 font-normal">
              {masterDistricts.length} {selectedState === 'ALL' ? 'Pan-India Districts' : 'Districts'}
            </span>
          </label>
          <div className="relative">
            <Building2 className="w-3.5 h-3.5 absolute left-3 top-3 text-amber-400 pointer-events-none" />
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 hover:border-amber-500/60 focus:border-amber-400 rounded-xl text-xs font-mono text-slate-100 transition-all cursor-pointer outline-hidden shadow-inner"
            >
              <option value="ALL">
                {selectedState === 'ALL' ? 'All Districts Consolidated' : `All ${selectedState} Districts (${masterDistricts.length})`}
              </option>
              {masterDistricts.map(d => (
                <option key={d.id} value={d.name}>
                  {d.name} {(d as any).zone ? `(${(d as any).zone})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Cascading Locality / Ward Selector */}
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Locality / Sector Cluster</span>
            <span className="text-emerald-400 font-normal">{masterLocalities.length} Clusters</span>
          </label>
          <div className="relative">
            <Navigation className="w-3.5 h-3.5 absolute left-3 top-3 text-emerald-400 pointer-events-none" />
            <select
              value={selectedLocality}
              onChange={(e) => handleLocalityChange(e.target.value)}
              disabled={selectedDistrict === 'ALL'}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 hover:border-emerald-500/60 focus:border-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-mono text-slate-100 transition-all cursor-pointer outline-hidden shadow-inner"
            >
              <option value="ALL">
                {selectedDistrict === 'ALL' ? 'Select a district first' : `All Localities in ${selectedDistrict}`}
              </option>
              {masterLocalities.map(l => (
                <option key={l.id} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Postal PIN Satellite Radar Search */}
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Postal PIN Satellite Radar</span>
            <span className="text-purple-400 font-normal">Instant 0ms Lock</span>
          </label>
          <form onSubmit={handlePincodeSubmit} className="relative flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-purple-400 pointer-events-none" />
              <input
                type="text"
                placeholder="6-Digit PIN (e.g. 233001)"
                value={pincodeInput}
                onChange={(e) => {
                  setPincodeInput(e.target.value);
                  if (pincodeMessage) setPincodeMessage('');
                }}
                maxLength={6}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 hover:border-purple-500/60 focus:border-purple-400 rounded-xl text-xs font-mono text-slate-100 placeholder:text-slate-500 transition-all outline-hidden shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={pincodeResolving || pincodeInput.trim().length !== 6}
              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-mono font-bold transition-all cursor-pointer shrink-0 shadow-sm"
            >
              {pincodeResolving ? 'LOCKING...' : 'LOCK'}
            </button>
          </form>
          {pincodeMessage && (
            <p className="text-[10px] font-mono text-purple-300 mt-1 truncate">
              {pincodeMessage}
            </p>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. 8 FAST PRESET PILLS + PANORAMIC MODAL TRIGGERS                    */}
      {/* ==================================================================== */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-800/80 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-slate-500 text-[10px] uppercase font-bold mr-1 shrink-0">
            FAST PRESETS:
          </span>

          <button
            onClick={() => applyPreset('PAN_INDIA')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              !selectedLocation.stateName && !selectedLocation.districtName
                ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            Pan-India
          </button>

          <button
            onClick={() => applyPreset('UP')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              selectedLocation.stateName === 'Uttar Pradesh' && !selectedLocation.districtName
                ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            UP Corridor (75)
          </button>

          <button
            onClick={() => applyPreset('GHAZIPUR')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              selectedLocation.districtName === 'Ghazipur'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            Ghazipur HQ
          </button>

          <button
            onClick={() => applyPreset('SAIDPUR')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              selectedLocation.districtName === 'Saidpur'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            Saidpur Hub
          </button>

          <button
            onClick={() => applyPreset('VARANASI')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              selectedLocation.districtName === 'Varanasi'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            Varanasi Axis
          </button>

          <button
            onClick={() => applyPreset('BIHAR')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              selectedLocation.stateName === 'Bihar' && !selectedLocation.districtName
                ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            Bihar Hub (38)
          </button>

          <button
            onClick={() => applyPreset('PATNA')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              selectedLocation.districtName === 'Patna'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            Patna Sector
          </button>

          <button
            onClick={() => applyPreset('DELHI')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              selectedLocation.stateName === 'Delhi'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            Delhi-NCR
          </button>
        </div>

        {/* Modal Launch Triggers */}
        <div className="flex items-center gap-2">
          {districtMetrics.length > 0 && (
            <button
              onClick={() => {
                playSound('click');
                setIsDistrictMatrixOpen(true);
              }}
              className="px-3 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>District Financial Matrix ({districtMetrics.length})</span>
            </button>
          )}

          <button
            onClick={() => {
              playSound('warp');
              setIsGeoDeckOpen(true);
            }}
            className="px-3 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Panoramic Geo-Deck</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. HOLOGRAPHIC PANORAMIC GEO-DECK MODAL                              */}
      {/* ==================================================================== */}
      {isGeoDeckOpen && (
        <Modal
          isOpen={isGeoDeckOpen}
          onClose={() => setIsGeoDeckOpen(false)}
          title="Pan-India Sovereign Territorial Selector Deck"
          size="xl"
        >
          <div className="p-2 sm:p-4 bg-slate-950 text-slate-100 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radar className="w-5 h-5 text-cyan-400 animate-spin" />
                <span className="font-mono font-bold text-sm text-cyan-300 uppercase">
                  Sovereign Territorial Navigation Engine
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Current: {selectedLocation.breadcrumb}
              </span>
            </div>

            <PanIndiaLocationSelector
              value={selectedLocation}
              onChange={(newLoc) => {
                playSound('confirm');
                onChange(newLoc);
                setIsGeoDeckOpen(false);
              }}
              showLocality={true}
              variant="card"
            />
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* 5. DISTRICT FINANCIAL MATRIX LEADERBOARD MODAL                       */}
      {/* ==================================================================== */}
      {isDistrictMatrixOpen && (
        <Modal
          isOpen={isDistrictMatrixOpen}
          onClose={() => setIsDistrictMatrixOpen(false)}
          title="Pan-India District Financial Performance Leaderboard"
          size="xl"
        >
          <div className="p-2 sm:p-4 bg-slate-950 text-slate-100 rounded-2xl space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-emerald-300 text-sm uppercase">
                  District Jurisdiction Financial Matrix ({districtMetrics.length} Active Jurisdictions)
                </span>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter district or state..."
                  value={matrixSearch}
                  onChange={e => setMatrixSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 outline-hidden"
                />
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-slate-800">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2.5">Rank</th>
                    <th className="px-3 py-2.5">District Jurisdiction</th>
                    <th className="px-3 py-2.5">State Realm</th>
                    <th className="px-3 py-2.5 text-right">Transactions</th>
                    <th className="px-3 py-2.5 text-right">Gross GMV</th>
                    <th className="px-3 py-2.5 text-right">Platform Fee</th>
                    <th className="px-3 py-2.5 text-right">Partner Disbursements</th>
                    <th className="px-3 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredMatrix.map((item, idx) => {
                    const isSelected = selectedDistrict.toLowerCase() === item.districtName.toLowerCase();
                    return (
                      <tr 
                        key={idx}
                        className={`transition-colors hover:bg-slate-900/80 ${
                          isSelected ? 'bg-cyan-950/60 font-bold' : ''
                        }`}
                      >
                        <td className="px-3 py-2 text-slate-500 font-bold">#{idx + 1}</td>
                        <td className="px-3 py-2 font-bold text-white flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-cyan-400" />
                          <span>{item.districtName}</span>
                          {isSelected && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-400 text-slate-950 font-black">ACTIVE</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-400">{item.stateName}</td>
                        <td className="px-3 py-2 text-right text-slate-300">{item.totalTxns}</td>
                        <td className="px-3 py-2 text-right font-bold text-amber-400">
                          ₹{item.totalGross.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-2 text-right text-emerald-400 font-bold">
                          ₹{(item.totalPlatformFee || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-2 text-right text-cyan-300">
                          ₹{(item.totalPartnerPayout || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => {
                              playSound('warp');
                              handleDistrictChange(item.districtName);
                              setIsDistrictMatrixOpen(false);
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-500 text-slate-950'
                                : 'bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300'
                            }`}
                          >
                            {isSelected ? 'LOCKED' : 'LOCK DISTRICT'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMatrix.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        No districts match filter "{matrixSearch}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <span>Showing {filteredMatrix.length} jurisdictions</span>
              <button
                onClick={() => setIsDistrictMatrixOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
