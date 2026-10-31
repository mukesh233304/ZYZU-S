import React, { useState, useEffect, useMemo } from 'react';
import { PanIndiaGeoFilterParams } from '../../types';
import { locationService } from '../../services/locationService';
import { 
  Globe, 
  MapPin, 
  Calendar, 
  Search, 
  Filter, 
  RotateCcw, 
  Bookmark, 
  Check, 
  ChevronDown 
} from 'lucide-react';

export interface PanIndiaGeoFilterProps {
  initialValues?: PanIndiaGeoFilterParams;
  onFilterChange: (filters: PanIndiaGeoFilterParams) => void;
  showStatus?: boolean;
  showRole?: boolean;
  showSearch?: boolean;
  className?: string;
}

export const PanIndiaGeoFilter: React.FC<PanIndiaGeoFilterProps> = ({
  initialValues,
  onFilterChange,
  showStatus = true,
  showRole = false,
  showSearch = true,
  className = '',
}) => {
  const [stateName, setStateName] = useState(initialValues?.stateName || 'All States');
  const [districtName, setDistrictName] = useState(initialValues?.districtName || 'All Districts');
  const [localityName, setLocalityName] = useState(initialValues?.localityName || 'All Localities');
  const [datePreset, setDatePreset] = useState<any>(initialValues?.datePreset || 'this_month');
  const [search, setSearch] = useState(initialValues?.search || '');
  const [status, setStatus] = useState(initialValues?.status || 'ALL');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Dynamic States from Central Location Master (All 28 States + 8 UTs)
  const allStates = useMemo(() => locationService.getStates('loc-country-in', true), []);

  const selectedStateObj = useMemo(() => {
    if (stateName === 'All States') return null;
    return allStates.find(s => s.name.toLowerCase() === stateName.toLowerCase()) || null;
  }, [allStates, stateName]);

  // Dynamic Districts scoped strictly to selected State
  const availableDistricts = useMemo(() => {
    if (!selectedStateObj) {
      // If All States selected, optionally list notable districts or only 'All Districts'
      return ['All Districts'];
    }
    const dList = locationService.getDistricts(selectedStateObj.id, true);
    return ['All Districts', ...dList.map(d => d.name)];
  }, [selectedStateObj]);

  const selectedDistrictObj = useMemo(() => {
    if (districtName === 'All Districts' || !selectedStateObj) return null;
    const dList = locationService.getDistricts(selectedStateObj.id, true);
    return dList.find(d => d.name.toLowerCase() === districtName.toLowerCase()) || null;
  }, [selectedStateObj, districtName]);

  // Dynamic Localities scoped strictly to selected District
  const availableLocalities = useMemo(() => {
    if (!selectedDistrictObj) {
      return ['All Localities'];
    }
    const lList = locationService.getLocalities(selectedDistrictObj.id, true);
    return ['All Localities', ...lList.map(l => l.name)];
  }, [selectedDistrictObj]);

  const handleApply = () => {
    onFilterChange({
      stateName: stateName === 'All States' ? undefined : stateName,
      stateId: selectedStateObj?.id,
      districtName: districtName === 'All Districts' ? undefined : districtName,
      districtId: selectedDistrictObj?.id,
      localityName: localityName === 'All Localities' ? undefined : localityName,
      datePreset,
      search: search.trim() || undefined,
      status: status === 'ALL' ? undefined : status,
    });
  };

  const handleReset = () => {
    setStateName('All States');
    setDistrictName('All Districts');
    setLocalityName('All Localities');
    setDatePreset('this_month');
    setSearch('');
    setStatus('ALL');
    onFilterChange({});
  };

  const handleSaveView = () => {
    try {
      localStorage.setItem('fp_saved_geo_filter', JSON.stringify({
        stateName, districtName, localityName, datePreset, status
      }));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch {}
  };

  // Breadcrumb
  const breadcrumb = useMemo(() => {
    if (localityName !== 'All Localities' && districtName !== 'All Districts' && stateName !== 'All States') {
      return `India → ${stateName} → ${districtName} → ${localityName}`;
    }
    if (districtName !== 'All Districts' && stateName !== 'All States') {
      return `India → ${stateName} → ${districtName}`;
    }
    if (stateName !== 'All States') {
      return `India → ${stateName}`;
    }
    return 'Pan-India';
  }, [stateName, districtName, localityName]);

  return (
    <div className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-lg ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <Globe className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Pan-India Geographic & Period Control</span>
          <span className="ml-2 font-extrabold text-white text-[11px] bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
            {breadcrumb}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveView}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? 'View Saved!' : 'Save View'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        {/* State */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            State / UT ({allStates.length})
          </label>
          <select
            value={stateName}
            onChange={(e) => {
              setStateName(e.target.value);
              setDistrictName('All Districts');
              setLocalityName('All Localities');
            }}
            className="w-full h-9 px-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="All States">All States & UTs (Pan-India)</option>
            {allStates.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            District
          </label>
          <select
            value={districtName}
            disabled={stateName === 'All States'}
            onChange={(e) => {
              setDistrictName(e.target.value);
              setLocalityName('All Localities');
            }}
            className="w-full h-9 px-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {availableDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Locality */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Locality / Area
          </label>
          <select
            value={localityName}
            disabled={districtName === 'All Districts'}
            onChange={(e) => setLocalityName(e.target.value)}
            className="w-full h-9 px-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {availableLocalities.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Date Preset */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Period</label>
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="w-full h-9 px-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="prev_month">Previous Month</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="last_6_months">Last 6 Months</option>
            <option value="this_year">This Financial Year</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Keyword Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                placeholder="Search by name, ID..."
                className="w-full h-9 pl-8 pr-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Apply Action */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleApply}
            className="w-full h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
