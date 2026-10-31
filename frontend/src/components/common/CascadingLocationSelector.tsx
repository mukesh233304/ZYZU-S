import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  ChevronDown, 
  Search, 
  X, 
  Check, 
  Building2, 
  Compass, 
  Navigation,
  AlertCircle,
  Zap,
  Sparkles,
  Loader2,
  CheckCircle2,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { LocationHierarchySelection, PincodePostOffice, PincodeLookupResult } from '../../types/location';
import { locationService } from '../../services/locationService';

export interface CascadingLocationSelectorProps {
  value?: LocationHierarchySelection;
  onChange: (selection: LocationHierarchySelection) => void;
  pincode?: string;
  onPincodeChange?: (pincode: string) => void;
  showPincodeAutofill?: boolean;
  mode?: 'stacked' | 'compact' | 'filter' | 'inline';
  layout?: 'stacked' | 'compact' | 'filter' | 'inline';
  includeArea?: boolean;
  required?: boolean;
  disabled?: boolean;
  showLabels?: boolean;
  lockState?: string;
  lockDistrict?: string;
  labels?: {
    state?: string;
    district?: string;
    locality?: string;
    area?: string;
  };
  placeholderPrefix?: string;
  className?: string;
  allowAllOption?: boolean;
  showHierarchyBadge?: boolean;
}

interface DropdownItem {
  id: string;
  name: string;
  subtitle?: string;
  badge?: string;
}

const DEMO_PINCODES = [
  { pin: '233221', label: 'Ghazipur' },
  { pin: '226001', label: 'Lucknow' },
  { pin: '221001', label: 'Varanasi' },
  { pin: '110001', label: 'Delhi' },
  { pin: '800001', label: 'Patna' },
  { pin: '400001', label: 'Mumbai' },
  { pin: '560001', label: 'Bengaluru' },
];

export const CascadingLocationSelector: React.FC<CascadingLocationSelectorProps> = ({
  value = {},
  onChange,
  pincode,
  onPincodeChange,
  showPincodeAutofill = true,
  mode = 'stacked',
  layout,
  includeArea = true,
  required = false,
  disabled = false,
  showLabels = true,
  lockState,
  lockDistrict,
  labels = {},
  className = '',
  allowAllOption = false,
  showHierarchyBadge = true,
}) => {
  const effectiveMode = layout || mode;

  // PIN Code Auto-Fill State
  const [inputPincode, setInputPincode] = useState(pincode || '');
  const [isSearchingPin, setIsSearchingPin] = useState(false);
  const [pinLookupResult, setPinLookupResult] = useState<PincodeLookupResult | null>(null);
  const [pinStatus, setPinStatus] = useState<'idle' | 'searching' | 'success' | 'warning' | 'error'>('idle');
  const [pinMessage, setPinMessage] = useState<string>('');
  const [postOfficesList, setPostOfficesList] = useState<PincodePostOffice[]>([]);

  // Keep internal pincode in sync if parent updates prop
  useEffect(() => {
    if (pincode !== undefined && pincode !== inputPincode) {
      setInputPincode(pincode);
      if (pincode.length === 6 && pinStatus === 'idle') {
        handlePincodeLookup(pincode);
      }
    }
  }, [pincode]);
  // Active Dropdown state for searchable popovers
  const [openLevel, setOpenLevel] = useState<'state' | 'district' | 'locality' | 'area' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Location data lists
  const [states, setStates] = useState(locationService.getStates());
  const [districts, setDistricts] = useState(locationService.getDistricts(value.stateId || lockState));
  const [localities, setLocalities] = useState(locationService.getLocalities(value.districtId || lockDistrict));
  const [areas, setAreas] = useState(locationService.getAreas(value.localityId));

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Subscribe to service updates (Super Admin additions/edits)
  useEffect(() => {
    const unsubscribe = locationService.subscribe(() => {
      setStates(locationService.getStates());
      if (value.stateId || lockState) {
        setDistricts(locationService.getDistricts(value.stateId || lockState));
      }
      if (value.districtId || lockDistrict) {
        setLocalities(locationService.getLocalities(value.districtId || lockDistrict));
      }
      if (value.localityId) {
        setAreas(locationService.getAreas(value.localityId));
      }
    });
    return unsubscribe;
  }, [value.stateId, value.districtId, value.localityId, lockState, lockDistrict]);

  // Sync downstream lists when parent values change
  useEffect(() => {
    const activeStateId = lockState || value.stateId;
    if (activeStateId) {
      setDistricts(locationService.getDistricts(activeStateId));
    } else {
      setDistricts([]);
    }
  }, [value.stateId, lockState]);

  useEffect(() => {
    const activeDistId = lockDistrict || value.districtId;
    if (activeDistId) {
      setLocalities(locationService.getLocalities(activeDistId));
    } else {
      setLocalities([]);
    }
  }, [value.districtId, lockDistrict]);

  useEffect(() => {
    if (value.localityId) {
      setAreas(locationService.getAreas(value.localityId));
    } else {
      setAreas([]);
    }
  }, [value.localityId]);

  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenLevel(null);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Names resolution for current values
  const currentState = locationService.getStateById(lockState || value.stateId);
  const currentDistrict = locationService.getDistrictById(lockDistrict || value.districtId);
  const currentLocality = locationService.getLocalityById(value.localityId);
  const currentArea = locationService.getAreaById(value.areaId);

  // ==========================================
  // HANDLERS WITH STRICT DOWNSTREAM RESETS
  // ==========================================

  const handleSelectState = (stateId: string, stateName: string) => {
    if (lockState) return;

    if (stateId === '') {
      onChange({
        ...value,
        stateId: undefined,
        stateName: undefined,
        districtId: undefined,
        districtName: undefined,
        localityId: undefined,
        localityName: undefined,
        areaId: undefined,
        areaName: undefined,
      });
    } else {
      onChange({
        ...value,
        countryId: 'loc-country-in',
        stateId,
        stateName,
        // Reset downstream levels
        districtId: undefined,
        districtName: undefined,
        localityId: undefined,
        localityName: undefined,
        areaId: undefined,
        areaName: undefined,
      });
    }
    setOpenLevel(null);
    setSearchQuery('');
  };

  const handleSelectDistrict = (districtId: string, districtName: string) => {
    if (lockDistrict) return;

    if (districtId === '') {
      onChange({
        ...value,
        districtId: undefined,
        districtName: undefined,
        localityId: undefined,
        localityName: undefined,
        areaId: undefined,
        areaName: undefined,
      });
    } else {
      onChange({
        ...value,
        districtId,
        districtName,
        // Reset downstream levels
        localityId: undefined,
        localityName: undefined,
        areaId: undefined,
        areaName: undefined,
      });
    }
    setOpenLevel(null);
    setSearchQuery('');
  };

  const handleSelectLocality = (localityId: string, localityName: string) => {
    if (localityId === '') {
      onChange({
        ...value,
        localityId: undefined,
        localityName: undefined,
        areaId: undefined,
        areaName: undefined,
      });
    } else {
      onChange({
        ...value,
        localityId,
        localityName,
        // Reset downstream area
        areaId: undefined,
        areaName: undefined,
      });
      // Reverse PIN detection
      const foundPin = locationService.getPincodeForLocation(localityId);
      if (foundPin) {
        setInputPincode(foundPin);
        onPincodeChange?.(foundPin);
        setPinStatus('success');
        setPinMessage(`Auto-synced PIN ${foundPin} for ${localityName}`);
      }
    }
    setOpenLevel(null);
    setSearchQuery('');
  };

  const handleSelectArea = (areaId: string, areaName: string) => {
    if (areaId === '') {
      onChange({
        ...value,
        areaId: undefined,
        areaName: undefined,
      });
    } else {
      onChange({
        ...value,
        areaId,
        areaName,
      });
      // Reverse PIN detection with area
      const foundPin = locationService.getPincodeForLocation(value.localityId, areaId);
      if (foundPin) {
        setInputPincode(foundPin);
        onPincodeChange?.(foundPin);
        setPinStatus('success');
        setPinMessage(`Auto-synced PIN ${foundPin} for ${areaName}`);
      }
    }
    setOpenLevel(null);
    setSearchQuery('');
  };

  // ==========================================
  // SMART POSTAL PIN CODE AUTO-FILL LOGIC
  // ==========================================

  const handlePincodeLookup = async (code: string) => {
    const cleaned = code.replace(/\D/g, '').slice(0, 6);
    setInputPincode(cleaned);
    onPincodeChange?.(cleaned);

    if (cleaned.length === 0) {
      setPinStatus('idle');
      setPinMessage('');
      setPinLookupResult(null);
      setPostOfficesList([]);
      return;
    }

    if (cleaned.length < 6) {
      setPinStatus('idle');
      setPinMessage(`Enter ${6 - cleaned.length} more digit${6 - cleaned.length > 1 ? 's' : ''}`);
      setPinLookupResult(null);
      setPostOfficesList([]);
      return;
    }

    // Exactly 6 digits
    setIsSearchingPin(true);
    setPinStatus('searching');
    setPinMessage('Querying India Post & Regional Master Gazetteer...');

    try {
      const result = await locationService.lookupPincode(cleaned);
      setPinLookupResult(result);
      setIsSearchingPin(false);

      const resolvedStateId = result.state?.id || result.stateId;
      const resolvedStateName = result.state?.name || result.stateName;
      const resolvedDistrictId = result.district?.id || result.districtId;
      const resolvedDistrictName = result.district?.name || result.districtName;

      if (resolvedStateId) {
        setPinStatus('success');
        setPinMessage(result.message || `Auto-filled: ${resolvedDistrictName || ''}, ${resolvedStateName || ''}`);
        setPostOfficesList(result.postOffices || []);

        // Trigger change to populate hierarchy
        onChange({
          countryId: 'loc-country-in',
          stateId: resolvedStateId,
          stateName: resolvedStateName,
          districtId: resolvedDistrictId,
          districtName: resolvedDistrictName,
          localityId: result.suggestedLocality?.id,
          localityName: result.suggestedLocality?.name,
          areaId: result.suggestedArea?.id,
          areaName: result.suggestedArea?.name,
        });
      } else {
        setPinStatus('warning');
        setPinMessage(result.message || 'Postal code recognized but no exact location match. Please select below.');
      }
    } catch {
      setIsSearchingPin(false);
      setPinStatus('error');
      setPinMessage('Could not verify PIN code. You can choose your location manually below.');
    }
  };

  const handleSelectPostOfficeChip = (po: PincodePostOffice) => {
    if (!pinLookupResult) return;

    const resolvedStateId = pinLookupResult.state?.id || pinLookupResult.stateId || value.stateId;
    const resolvedStateName = pinLookupResult.state?.name || pinLookupResult.stateName || value.stateName;
    const resolvedDistrictId = pinLookupResult.district?.id || pinLookupResult.districtId || value.districtId;
    const resolvedDistrictName = pinLookupResult.district?.name || pinLookupResult.districtName || value.districtName;

    // Look for existing locality with matching name in current district
    const existingLocality = localities.find(
      l => l.name.toLowerCase() === po.name.toLowerCase() ||
           l.name.toLowerCase().includes(po.name.toLowerCase()) ||
           po.name.toLowerCase().includes(l.name.toLowerCase())
    );

    const targetLocalityId = existingLocality ? existingLocality.id : (value.localityId || pinLookupResult.suggestedLocality?.id);
    const targetLocalityName = existingLocality ? existingLocality.name : (value.localityName || pinLookupResult.suggestedLocality?.name || po.name);

    // Look for matching area
    const existingArea = areas.find(
      a => a.name.toLowerCase() === po.name.toLowerCase()
    );

    onChange({
      countryId: 'loc-country-in',
      stateId: resolvedStateId,
      stateName: resolvedStateName,
      districtId: resolvedDistrictId,
      districtName: resolvedDistrictName,
      localityId: targetLocalityId,
      localityName: targetLocalityName,
      areaId: existingArea?.id || (targetLocalityName !== po.name ? `po-${po.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined),
      areaName: po.name,
    });
    setPinMessage(`Selected Post Office / Locality: ${po.name}`);
  };

  // Helper for popover item filtering
  const getFilterableItems = (): DropdownItem[] => {
    const q = searchQuery.toLowerCase().trim();

    if (openLevel === 'state') {
      const items: DropdownItem[] = allowAllOption 
        ? [{ id: '', name: 'All States (Pan-India)', subtitle: 'View everything' }] 
        : [];
      const list = states.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
      return [
        ...items,
        ...list.map(s => ({
          id: s.id,
          name: s.name,
          subtitle: `Code: ${s.code}`,
          badge: s.type,
        })),
      ];
    }

    if (openLevel === 'district') {
      const items: DropdownItem[] = allowAllOption 
        ? [{ id: '', name: 'All Districts', subtitle: `In ${currentState?.name || 'Selected State'}` }] 
        : [];
      const list = districts.filter(d => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q));
      return [
        ...items,
        ...list.map(d => ({
          id: d.id,
          name: d.name,
          subtitle: `Code: ${d.code}`,
        })),
      ];
    }

    if (openLevel === 'locality') {
      const items: DropdownItem[] = allowAllOption 
        ? [{ id: '', name: 'All Localities / Cities', subtitle: `In ${currentDistrict?.name || 'Selected District'}` }] 
        : [];
      const list = localities.filter(l => l.name.toLowerCase().includes(q) || (l.pincode && l.pincode.includes(q)));
      return [
        ...items,
        ...list.map(l => ({
          id: l.id,
          name: l.name,
          subtitle: l.pincode ? `PIN: ${l.pincode}` : undefined,
          badge: l.type,
        })),
      ];
    }

    if (openLevel === 'area') {
      const items: DropdownItem[] = allowAllOption 
        ? [{ id: '', name: 'All Areas / Villages', subtitle: `In ${currentLocality?.name || 'Selected Locality'}` }] 
        : [];
      const list = areas.filter(a => a.name.toLowerCase().includes(q) || (a.pincode && a.pincode.includes(q)));
      return [
        ...items,
        ...list.map(a => ({
          id: a.id,
          name: a.name,
          subtitle: a.pincode ? `PIN: ${a.pincode}` : undefined,
          badge: a.type,
        })),
      ];
    }

    return [];
  };

  // State disabled logic
  const isDistrictDisabled = !lockDistrict && !(lockState || value.stateId);
  const isLocalityDisabled = !(lockDistrict || value.districtId);
  const isAreaDisabled = !value.localityId;

  // Selected hierarchy summary
  const formattedSummary = locationService.formatLocation({
    stateId: lockState || value.stateId,
    stateName: currentState?.name || value.stateName,
    districtId: lockDistrict || value.districtId,
    districtName: currentDistrict?.name || value.districtName,
    localityId: value.localityId,
    localityName: currentLocality?.name || value.localityName,
    areaId: value.areaId,
    areaName: currentArea?.name || value.areaName,
  });

  const getPrecisionBadge = () => {
    if (value.areaId || currentArea) return { label: 'Area Specific', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (value.localityId || currentLocality) return { label: 'Locality Level', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (lockDistrict || value.districtId || currentDistrict) return { label: 'District Level', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (lockState || value.stateId || currentState) return { label: 'State Level', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    return { label: 'National (All India)', color: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  const precision = getPrecisionBadge();

  return (
    <div className={`relative ${className} ${disabled ? 'opacity-65 pointer-events-none cursor-not-allowed select-none' : ''}`} ref={dropdownRef}>
      {/* Searchable Combobox Popover Modal/Overlay */}
      {openLevel && (
        <div className="absolute z-50 mt-1 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 animate-in fade-in zoom-in-95 duration-150"
             style={{
               top: '100%',
               left: openLevel === 'state' ? '0%' : 
                     openLevel === 'district' ? '25%' : 
                     openLevel === 'locality' ? '50%' : 'auto',
               right: openLevel === 'area' ? '0%' : 'auto'
             }}>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              Select {openLevel === 'state' ? 'State / UT' : 
                      openLevel === 'district' ? 'District' : 
                      openLevel === 'locality' ? 'Locality / City / Town' : 'Area / Neighborhood'}
            </span>
            <button 
              type="button"
              onClick={() => { setOpenLevel(null); setSearchQuery(''); }}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${openLevel}...`}
              autoFocus
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {getFilterableItems().length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400 flex flex-col items-center">
                <AlertCircle className="w-5 h-5 mb-1 text-gray-300" />
                No locations found matching "{searchQuery}"
              </div>
            ) : (
              getFilterableItems().map(item => {
                const isSelected = 
                  (openLevel === 'state' && (item.id === value.stateId || (!item.id && !value.stateId))) ||
                  (openLevel === 'district' && (item.id === value.districtId || (!item.id && !value.districtId))) ||
                  (openLevel === 'locality' && (item.id === value.localityId || (!item.id && !value.localityId))) ||
                  (openLevel === 'area' && (item.id === value.areaId || (!item.id && !value.areaId)));

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (openLevel === 'state') handleSelectState(item.id, item.name);
                      if (openLevel === 'district') handleSelectDistrict(item.id, item.name);
                      if (openLevel === 'locality') handleSelectLocality(item.id, item.name);
                      if (openLevel === 'area') handleSelectArea(item.id, item.name);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      isSelected 
                        ? 'bg-indigo-50 text-indigo-900 font-semibold' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-medium text-gray-900 truncate">{item.name}</div>
                      {item.subtitle && <div className="text-[10px] text-gray-400">{item.subtitle}</div>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
                          {item.badge}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* RENDER MODES */}

      {/* MODE 1: STACKED (Registration & Profile Edit Forms) */}
      {effectiveMode === 'stacked' && (
        <div className="space-y-4">
          {/* SMART PIN CODE AUTO-FILL HERO PANEL */}
          {showPincodeAutofill && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 sm:p-5 text-white shadow-xl ring-1 ring-white/10">
              {/* Subtle background glow effect */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-3.5">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
                      <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                          Smart Postal PIN Auto-Fill
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                            Fast 0ms
                          </span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Enter any 6-digit Indian PIN code to auto-populate State, District, Tehsil/Town & Locality
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator Badge */}
                  {pinStatus === 'searching' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[11px] font-medium animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Resolving India Post...</span>
                    </div>
                  )}
                  {pinStatus === 'success' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{pinLookupResult?.source === 'india_post_api' ? 'India Post Verified' : 'Master Gazetteer Matched'}</span>
                    </div>
                  )}
                  {pinStatus === 'warning' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Fallback Applied</span>
                    </div>
                  )}
                  {pinStatus === 'idle' && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-slate-300 text-[10px] font-medium">
                      <span>19,000+ PINs Supported</span>
                    </div>
                  )}
                </div>

                {/* PIN Input Bar with Action Button */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-amber-400 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      value={inputPincode}
                      onChange={(e) => handlePincodeLookup(e.target.value)}
                      placeholder="e.g. 233221, 226001, 110001"
                      className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white font-mono text-sm sm:text-base font-bold tracking-widest placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white/15 transition-all"
                    />
                    {inputPincode && (
                      <button
                        type="button"
                        onClick={() => handlePincodeLookup('')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
                        title="Clear PIN"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isSearchingPin || inputPincode.length !== 6}
                    onClick={() => handlePincodeLookup(inputPincode)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:pointer-events-none text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
                  >
                    {isSearchingPin ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Auto-Fill</span>
                  </button>
                </div>

                {/* Status Message */}
                {pinMessage && (
                  <p className={`text-xs ${
                    pinStatus === 'success' ? 'text-emerald-300 font-medium' :
                    pinStatus === 'warning' ? 'text-amber-300' :
                    pinStatus === 'error' ? 'text-rose-300' :
                    'text-slate-300'
                  }`}>
                    {pinMessage}
                  </p>
                )}

                {/* Multiple Post Offices selector (if available) */}
                {postOfficesList.length > 1 && (
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <div className="text-[11px] font-semibold text-amber-300 flex items-center justify-between">
                      <span>Select your specific Post Office / Locality ({postOfficesList.length} available):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                      {postOfficesList.map((po, idx) => {
                        const isSelected = value.localityName?.toLowerCase() === po.name.toLowerCase() || value.areaName?.toLowerCase() === po.name.toLowerCase();
                        return (
                          <button
                            key={`${po.name}-${idx}`}
                            type="button"
                            onClick={() => handleSelectPostOfficeChip(po)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 font-bold ring-2 ring-white/50'
                                : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                            }`}
                          >
                            <MapPin className="w-3 h-3 opacity-70" />
                            <span>{po.name}</span>
                            {po.branchType && (
                              <span className="text-[9px] opacity-75 font-normal">({po.branchType})</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quick Demo Pins */}
                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400 font-medium">Quick Test:</span>
                  {DEMO_PINCODES.map((d) => (
                    <button
                      key={d.pin}
                      type="button"
                      onClick={() => handlePincodeLookup(d.pin)}
                      className={`px-2 py-0.5 rounded-md font-mono text-[11px] transition-all cursor-pointer ${
                        inputPincode === d.pin
                          ? 'bg-amber-400 text-slate-950 font-bold ring-1 ring-white'
                          : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white'
                      }`}
                    >
                      {d.pin} <span className="font-sans text-[10px] text-slate-400">({d.label})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EYE-CATCHING 4-TIER LOCATION PIPELINE PREVIEW */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                Location Hierarchy Chain
              </span>
              <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${precision.color}`}>
                {precision.label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              {/* Step 1: State */}
              <div className={`p-2 rounded-lg border transition-all ${
                value.stateId || currentState
                  ? 'bg-white border-indigo-200 text-slate-900 shadow-xs'
                  : 'bg-slate-100/70 border-dashed border-slate-200 text-slate-400'
              }`}>
                <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center justify-between">
                  <span>1. State</span>
                  {(value.stateId || currentState) && <Check className="w-3 h-3 text-emerald-600" />}
                </div>
                <div className="font-semibold truncate mt-0.5">
                  {currentState ? currentState.name : (value.stateName || 'Not Set')}
                </div>
              </div>

              {/* Step 2: District */}
              <div className={`p-2 rounded-lg border transition-all ${
                value.districtId || currentDistrict
                  ? 'bg-white border-indigo-200 text-slate-900 shadow-xs'
                  : 'bg-slate-100/70 border-dashed border-slate-200 text-slate-400'
              }`}>
                <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center justify-between">
                  <span>2. District</span>
                  {(value.districtId || currentDistrict) && <Check className="w-3 h-3 text-emerald-600" />}
                </div>
                <div className="font-semibold truncate mt-0.5">
                  {currentDistrict ? currentDistrict.name : (value.districtName || 'Not Set')}
                </div>
              </div>

              {/* Step 3: Locality / Town */}
              <div className={`p-2 rounded-lg border transition-all ${
                value.localityId || currentLocality
                  ? 'bg-white border-indigo-200 text-slate-900 shadow-xs'
                  : 'bg-slate-100/70 border-dashed border-slate-200 text-slate-400'
              }`}>
                <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center justify-between">
                  <span>3. Tehsil / Town</span>
                  {(value.localityId || currentLocality) && <Check className="w-3 h-3 text-emerald-600" />}
                </div>
                <div className="font-semibold truncate mt-0.5">
                  {currentLocality ? currentLocality.name : (value.localityName || 'Not Set')}
                </div>
              </div>

              {/* Step 4: Area / Neighborhood */}
              <div className={`p-2 rounded-lg border transition-all ${
                value.areaId || currentArea
                  ? 'bg-white border-indigo-200 text-slate-900 shadow-xs'
                  : 'bg-slate-100/70 border-dashed border-slate-200 text-slate-400'
              }`}>
                <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center justify-between">
                  <span>4. Locality / Area</span>
                  {(value.areaId || currentArea) && <Check className="w-3 h-3 text-emerald-600" />}
                </div>
                <div className="font-semibold truncate mt-0.5">
                  {currentArea ? currentArea.name : (value.areaName || 'Optional')}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. STATE SELECTOR */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {labels.state || '1. State / Union Territory'} {required && <span className="text-red-500">*</span>}
              </label>
              <button
                type="button"
                disabled={Boolean(lockState)}
                onClick={() => { setOpenLevel('state'); setSearchQuery(''); }}
                className={`w-full px-3 py-2.5 text-left text-sm rounded-xl border flex items-center justify-between transition-all ${
                  lockState 
                    ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
                    : value.stateId 
                      ? 'bg-white border-indigo-200 ring-1 ring-indigo-100 text-gray-900' 
                      : 'bg-white border-gray-300 hover:border-indigo-400 text-gray-400'
                }`}
              >
                <span className="truncate flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className={currentState ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                    {currentState ? currentState.name : 'Select State'}
                  </span>
                </span>
                {!lockState && <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
              </button>
            </div>

            {/* 2. DISTRICT SELECTOR */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {labels.district || '2. District'} {required && <span className="text-red-500">*</span>}
              </label>
              <button
                type="button"
                disabled={Boolean(lockDistrict) || isDistrictDisabled}
                onClick={() => { setOpenLevel('district'); setSearchQuery(''); }}
                className={`w-full px-3 py-2.5 text-left text-sm rounded-xl border flex items-center justify-between transition-all ${
                  lockDistrict
                    ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                    : isDistrictDisabled 
                      ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' 
                      : value.districtId 
                        ? 'bg-white border-indigo-200 ring-1 ring-indigo-100 text-gray-900' 
                        : 'bg-white border-gray-300 hover:border-indigo-400 text-gray-400'
                }`}
              >
                <span className="truncate flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className={currentDistrict ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                    {isDistrictDisabled ? 'Select State first' : (currentDistrict ? currentDistrict.name : 'Select District')}
                  </span>
                </span>
                {!lockDistrict && !isDistrictDisabled && <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 3. LOCALITY SELECTOR */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {labels.locality || '3. Locality / City / Town'} {required && <span className="text-red-500">*</span>}
              </label>
              <button
                type="button"
                disabled={isLocalityDisabled}
                onClick={() => { setOpenLevel('locality'); setSearchQuery(''); }}
                className={`w-full px-3 py-2.5 text-left text-sm rounded-xl border flex items-center justify-between transition-all ${
                  isLocalityDisabled 
                    ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' 
                    : value.localityId 
                      ? 'bg-white border-indigo-200 ring-1 ring-indigo-100 text-gray-900' 
                      : 'bg-white border-gray-300 hover:border-indigo-400 text-gray-400'
                }`}
              >
                <span className="truncate flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className={currentLocality ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                    {isLocalityDisabled ? 'Select District first' : (currentLocality ? currentLocality.name : 'Select Locality / Town')}
                  </span>
                </span>
                {!isLocalityDisabled && <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
              </button>
            </div>

            {/* 4. AREA SELECTOR */}
            {includeArea && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {labels.area || '4. Area / Village / Neighborhood'}
                </label>
                <button
                  type="button"
                  disabled={isAreaDisabled}
                  onClick={() => { setOpenLevel('area'); setSearchQuery(''); }}
                  className={`w-full px-3 py-2.5 text-left text-sm rounded-xl border flex items-center justify-between transition-all ${
                    isAreaDisabled 
                      ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' 
                      : value.areaId 
                        ? 'bg-white border-indigo-200 ring-1 ring-indigo-100 text-gray-900' 
                        : 'bg-white border-gray-300 hover:border-indigo-400 text-gray-400'
                  }`}
                >
                  <span className="truncate flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className={currentArea ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                      {isAreaDisabled ? 'Select Locality first' : (currentArea ? currentArea.name : 'Select Area / Colony')}
                    </span>
                  </span>
                  {!isAreaDisabled && <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>
              </div>
            )}
          </div>

          {/* Hierarchy summary breadcrumb preview */}
          {showHierarchyBadge && formattedSummary && (
            <div className="p-3 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-amber-50/50 border border-indigo-100 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 truncate">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate font-semibold">{formattedSummary}</span>
                {inputPincode && inputPincode.length === 6 && (
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-amber-400 text-slate-950 shrink-0">
                    PIN: {inputPincode}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-semibold ${precision.color}`}>
                  {precision.label}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: COMPACT / FILTER (Hero Search & Filter Bars) */}
      {(effectiveMode === 'compact' || effectiveMode === 'filter' || effectiveMode === 'inline') && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* 1. STATE */}
            <button
              type="button"
              disabled={Boolean(lockState)}
              onClick={() => { setOpenLevel('state'); setSearchQuery(''); }}
              className={`w-full px-3 py-2 text-left text-xs rounded-xl border flex items-center justify-between transition-all ${
                lockState 
                  ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
                  : currentState 
                    ? 'bg-indigo-50/50 border-indigo-200 font-medium text-gray-900' 
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-500'
              }`}
            >
              <div className="truncate">
                <div className="text-[10px] text-gray-400 uppercase font-semibold">State / UT</div>
                <div className="truncate text-gray-900 font-medium">{currentState ? currentState.name : 'All India'}</div>
              </div>
              {!lockState && <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />}
            </button>

            {/* 2. DISTRICT */}
            <button
              type="button"
              disabled={Boolean(lockDistrict) || isDistrictDisabled}
              onClick={() => { setOpenLevel('district'); setSearchQuery(''); }}
              className={`w-full px-3 py-2 text-left text-xs rounded-xl border flex items-center justify-between transition-all ${
                lockDistrict
                  ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                  : isDistrictDisabled
                    ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                    : currentDistrict
                      ? 'bg-indigo-50/50 border-indigo-200 font-medium text-gray-900'
                      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-500'
              }`}
            >
              <div className="truncate">
                <div className="text-[10px] text-gray-400 uppercase font-semibold">District</div>
                <div className="truncate text-gray-900 font-medium">
                  {isDistrictDisabled ? 'Select State' : (currentDistrict ? currentDistrict.name : 'All Districts')}
                </div>
              </div>
              {!lockDistrict && !isDistrictDisabled && <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />}
            </button>

            {/* 3. LOCALITY */}
            <button
              type="button"
              disabled={isLocalityDisabled}
              onClick={() => { setOpenLevel('locality'); setSearchQuery(''); }}
              className={`w-full px-3 py-2 text-left text-xs rounded-xl border flex items-center justify-between transition-all ${
                isLocalityDisabled
                  ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                  : currentLocality
                    ? 'bg-indigo-50/50 border-indigo-200 font-medium text-gray-900'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-500'
              }`}
            >
              <div className="truncate">
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Locality / Town</div>
                <div className="truncate text-gray-900 font-medium">
                  {isLocalityDisabled ? 'Select District' : (currentLocality ? currentLocality.name : 'All Localities')}
                </div>
              </div>
              {!isLocalityDisabled && <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />}
            </button>

            {/* 4. AREA */}
            {includeArea && (
              <button
                type="button"
                disabled={isAreaDisabled}
                onClick={() => { setOpenLevel('area'); setSearchQuery(''); }}
                className={`w-full px-3 py-2 text-left text-xs rounded-xl border flex items-center justify-between transition-all ${
                  isAreaDisabled
                    ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                    : currentArea
                      ? 'bg-indigo-50/50 border-indigo-200 font-medium text-gray-900'
                      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-500'
                }`}
              >
                <div className="truncate">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Area / Colony</div>
                  <div className="truncate text-gray-900 font-medium">
                    {isAreaDisabled ? 'Select Locality' : (currentArea ? currentArea.name : 'All Areas')}
                  </div>
                </div>
                {!isAreaDisabled && <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />}
              </button>
            )}
          </div>

          {/* Quick Clear Button in Filter Mode */}
          {effectiveMode === 'filter' && (value.stateId || value.districtId || value.localityId || value.areaId) && (
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="text-[11px] text-gray-500 truncate">
                Active Filter: <strong className="text-gray-800">{formattedSummary}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  onChange({
                    stateId: lockState,
                    stateName: currentState?.name,
                    districtId: lockDistrict,
                    districtName: currentDistrict?.name,
                    localityId: undefined,
                    localityName: undefined,
                    areaId: undefined,
                    areaName: undefined,
                  });
                }}
                className="text-indigo-600 hover:text-indigo-800 text-[11px] font-medium flex items-center gap-1 shrink-0"
              >
                <X className="w-3 h-3" /> Reset Location Filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
