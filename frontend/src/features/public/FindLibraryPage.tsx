import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  BookMarked, MapPin, Search, Filter, ShieldCheck, 
  ArrowRight, Wind, Wifi, Zap, SlidersHorizontal, RotateCcw, 
  Armchair, Clock, Check, X, Sparkles, AlertCircle, Bell, Navigation
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { RatingStars } from '../../components/common/RatingStars';
import { Drawer } from '../../components/common/Drawer';
import { EmptyState } from '../../components/common/FeedbackStates';
import { DISTRICTS } from '../../constants';
import { mockStore } from '../../mock/store';
import { LocationHierarchySelection } from '../../types/location';
import { locationService } from '../../services/locationService';
import { policyService } from '../../services/policyService';
import { OfferBadge, OfferPriceDisplay } from '../../components/common/OfferBadge';
import { DemoBookingModal } from '../../components/demo/DemoBookingModal';
import { RegisterInterestModal } from '../../components/common/RegisterInterestModal';
import { locationDemandService } from '../../services/locationDemandService';
import { FocusPointAdCarousel } from '../../components/common/FocusPointAdCarousel';
import { PinCodeLocationSearch } from '../../components/common/PinCodeLocationSearch';
import { libraryDiscoveryService } from '../../services/libraryDiscoveryService';
import { Library } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { notificationEventService } from '../../services/notificationEventService';

const POPULAR_FACILITIES = [
  { id: 'all', label: 'All Facility', match: 'all' },
  { id: 'ac', label: 'Air Conditioned (AC)', match: 'ac' },
  { id: 'wifi', label: 'High-Speed Wi-Fi', match: 'wi-fi' },
  { id: 'power', label: '100% Power Backup', match: 'power' },
  { id: 'cctv', label: '24x7 CCTV', match: 'cctv' },
  { id: 'water', label: 'RO Drinking Water', match: 'water' },
  { id: 'charging', label: 'Desk Charging Point', match: 'charging' },
  { id: 'locker', label: 'Lockers Available', match: 'locker' },
];

export const FindLibraryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, setPolicyVersion] = useState(0);

  // Real-time subscription to policy/offer changes
  useEffect(() => {
    return policyService.subscribe(() => setPolicyVersion(v => v + 1));
  }, []);

  // Real-time reactive library state from libraryDiscoveryService
  const [allLibraries, setAllLibraries] = useState<Library[]>(() => {
    return libraryDiscoveryService.getDiscoverableLibraries();
  });

  useEffect(() => {
    const unsubscribe = libraryDiscoveryService.subscribe((updatedList: Library[]) => {
      setAllLibraries(updatedList);
    });
    return unsubscribe;
  }, []);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [demoTargetLibrary, setDemoTargetLibrary] = useState<any | null>(null);
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  
  // Hierarchical Location Selection
  const [locationSelection, setLocationSelection] = useState<LocationHierarchySelection>(() => {
    const sId = searchParams.get('state') || undefined;
    const dId = searchParams.get('district') || undefined;
    const lId = searchParams.get('locality') || undefined;
    const aId = searchParams.get('area') || undefined;

    let resolvedStateId = sId;
    let resolvedDistrict = dId ? locationService.getDistrictById(dId) || locationService.findDistrictByName(dId) : undefined;
    if (resolvedDistrict) {
      resolvedStateId = resolvedDistrict.stateId;
    }

    let resolvedLocality = lId ? locationService.getLocalityById(lId) || locationService.findLocalityByName(lId, resolvedDistrict?.id) : undefined;
    let resolvedArea = aId ? locationService.getAreaById(aId) || locationService.findAreaByName(aId, resolvedLocality?.id) : undefined;

    return {
      countryId: 'loc-country-in',
      stateId: resolvedStateId,
      districtId: resolvedDistrict?.id || dId,
      districtName: resolvedDistrict?.name,
      localityId: resolvedLocality?.id || lId,
      localityName: resolvedLocality?.name,
      areaId: resolvedArea?.id || aId,
      areaName: resolvedArea?.name,
    };
  });

  const [selectedShift, setSelectedShift] = useState(searchParams.get('shift') || '');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(() => {
    const fac = searchParams.get('facility');
    return fac ? [fac] : [];
  });
  const [maxPrice, setMaxPrice] = useState<number>(() => {
    const p = searchParams.get('maxPrice');
    return p ? Number(p) : 1500;
  });
  const [minAvailableSeats, setMinAvailableSeats] = useState<number>(() => {
    const s = searchParams.get('seats');
    return s ? Number(s) : 0;
  });
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { user } = useAuth();

  // AI Agent Event Hook: Detect library search activity
  useEffect(() => {
    if (!searchQuery.trim() && !locationSelection.districtName && !locationSelection.localityName && !locationSelection.pincode) {
      return;
    }

    const timer = setTimeout(() => {
      notificationEventService.emitLibrarySearch({
        query: searchQuery.trim() || undefined,
        districtName: locationSelection.districtName,
        localityName: locationSelection.localityName,
        stateName: locationSelection.stateId ? locationService.getStateById(locationSelection.stateId)?.name : undefined,
        pincode: locationSelection.pincode,
        facilities: selectedFacilities,
        userId: user?.id,
        userName: user?.name,
        userPhone: user?.phone
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery, locationSelection.districtName, locationSelection.localityName, locationSelection.pincode, selectedFacilities, user]);

  const toggleFacility = (facilityMatch: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facilityMatch) 
        ? prev.filter(f => f !== facilityMatch)
        : [...prev, facilityMatch]
    );
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() || locationSelection.pincode || locationSelection.stateId || locationSelection.districtId || locationSelection.localityId || locationSelection.areaId || selectedShift || selectedFacilities.length > 0 || maxPrice < 1500 || minAvailableSeats > 0
  );

  const resetFilters = () => {
    setSearchQuery('');
    setLocationSelection({});
    setSelectedShift('');
    setSelectedFacilities([]);
    setMaxPrice(1500);
    setMinAvailableSeats(0);
    setSortBy('recommended');
    setSearchParams({});
  };

  const filteredLibraries = useMemo(() => {
    const result = allLibraries.filter((lib) => {
      // Search query filter (name, area, city, district, address, description, pincode)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = lib.name?.toLowerCase().includes(q);
        const matchesArea = lib.area?.toLowerCase().includes(q);
        const matchesDistrict = lib.districtName?.toLowerCase().includes(q);
        const matchesAddress = lib.address?.toLowerCase().includes(q);
        const matchesCity = lib.city?.toLowerCase().includes(q);
        const matchesDesc = lib.description?.toLowerCase().includes(q);
        const matchesPin = lib.pincode ? lib.pincode.includes(q) : false;
        if (!matchesName && !matchesArea && !matchesDistrict && !matchesAddress && !matchesCity && !matchesDesc && !matchesPin) {
          return false;
        }
      }

      // PIN Code Intelligence Filter (Priority when PIN is entered)
      if (locationSelection.pincode) {
        const cleanPin = locationSelection.pincode.trim();
        const matchesPin = libraryDiscoveryService.matchesPinCode(lib, cleanPin);
        if (!matchesPin) {
          // If not exact pin, check if in the resolved district/locality
          const matchesLoc = locationSelection.localityId && lib.localityId === locationSelection.localityId;
          const matchesDist = locationSelection.districtId && lib.districtId === locationSelection.districtId;
          if (!matchesLoc && !matchesDist) return false;
        }
      } else {
        // Hierarchy Location filtering: State -> District -> Locality -> Area
        if (locationSelection.stateId) {
          const stateDists = locationService.getDistricts(locationSelection.stateId).map(d => d.id);
          if (lib.districtId && !stateDists.includes(lib.districtId)) return false;
        }

        if (locationSelection.districtId) {
          if (lib.districtId !== locationSelection.districtId) return false;
        }

        if (locationSelection.localityId) {
          const loc = locationService.getLocalityById(locationSelection.localityId);
          const locName = (loc?.name || locationSelection.localityName || '').toLowerCase();
          const matchesLoc = 
            lib.localityId === locationSelection.localityId ||
            (lib.city && lib.city.toLowerCase().includes(locName)) ||
            (lib.area && lib.area.toLowerCase().includes(locName)) ||
            (lib.address && lib.address.toLowerCase().includes(locName));
          if (!matchesLoc) return false;
        }

        if (locationSelection.areaId) {
          const ar = locationService.getAreaById(locationSelection.areaId);
          const arName = (ar?.name || locationSelection.areaName || '').toLowerCase();
          const matchesArea = 
            lib.areaId === locationSelection.areaId ||
            (lib.area && lib.area.toLowerCase().includes(arName)) ||
            (lib.address && lib.address.toLowerCase().includes(arName));
          if (!matchesArea) return false;
        }
      }

      // Shifts filter
      if (selectedShift) {
        const hasShift = lib.shifts?.some((s: any) => {
          const sName = s.name.toLowerCase();
          if (selectedShift === 'morning') return sName.includes('morning');
          if (selectedShift === 'afternoon') return sName.includes('afternoon');
          if (selectedShift === 'evening') return sName.includes('evening');
          if (selectedShift === 'full_day') return sName.includes('full') || sName.includes('15-hr') || sName.includes('24');
          return true;
        });
        if (!hasShift) return false;
      }

      // Facilities filter (all selected must match, 'all' skips restriction)
      const validSelectedFacilities = selectedFacilities.filter(f => f && f.toLowerCase() !== 'all');
      if (validSelectedFacilities.length > 0) {
        const hasAll = validSelectedFacilities.every(reqFac => 
          lib.facilities.some((f: any) => f.toLowerCase().includes(reqFac.toLowerCase()))
        );
        if (!hasAll) return false;
      }

      // Price filter
      const price = lib.monthlyStartingPrice || lib.monthlyFee || 0;
      if (price > maxPrice) return false;

      // Available seats filter
      if ((lib.availableSeats ?? 0) < minAvailableSeats) return false;

      return true;
    });

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => (a.monthlyStartingPrice || 0) - (b.monthlyStartingPrice || 0));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (b.monthlyStartingPrice || 0) - (a.monthlyStartingPrice || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'seats') {
      result.sort((a, b) => (b.availableSeats || 0) - (a.availableSeats || 0));
    }

    return result;
  }, [allLibraries, searchQuery, locationSelection, selectedShift, selectedFacilities, maxPrice, minAvailableSeats, sortBy]);

  // Fallback: If 0 results in exact locality, find libraries across the district
  const nearbyDistrictLibraries = useMemo(() => {
    if (!locationSelection.localityId || filteredLibraries.length > 0) return [];
    return allLibraries.filter(lib => {
      if (locationSelection.districtId && lib.districtId !== locationSelection.districtId) return false;
      return true;
    });
  }, [allLibraries, locationSelection, filteredLibraries.length]);

  // Record demand when no libraries match in selected location
  useEffect(() => {
    if (locationSelection.districtName && filteredLibraries.length === 0 && nearbyDistrictLibraries.length === 0) {
      locationDemandService.recordLibraryDemand({
        state: locationSelection.stateName || 'Uttar Pradesh',
        district: locationSelection.districtName,
        locality: locationSelection.localityName || 'District Wide',
        facility: selectedFacilities[0] || 'all'
      });
    }
  }, [locationSelection.districtName, locationSelection.localityName, filteredLibraries.length, nearbyDistrictLibraries.length, selectedFacilities]);

  const FilterControls = () => (
    <div className="space-y-5 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          Filter Study Libraries
        </h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-brand-600 hover:text-brand-700 flex items-center gap-1 font-bold cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Keyword Search */}
      <div>
        <label className="block font-bold text-slate-700 uppercase mb-1.5 text-[11px]">Search Library</label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Name, landmark, area..."
            className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-8 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Smart Location Discovery Filter with PIN Code Intelligence */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-700 uppercase text-[11px] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span>Target Location</span>
          </label>
          {(locationSelection.stateId || locationSelection.districtId || locationSelection.localityId) && (
            <button
              type="button"
              onClick={() => setLocationSelection({})}
              className="text-brand-600 hover:text-brand-700 text-[10px] font-bold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* 6-Digit Indian PIN Code Intelligence Search */}
        <PinCodeLocationSearch
          onLocationResolved={(selection) => setLocationSelection(selection)}
          onClear={() => setLocationSelection({})}
          currentSelection={locationSelection}
          placeholder="Enter 6-digit PIN code"
        />

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-2 text-[10px] font-bold text-slate-400 uppercase">Or select manually</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* State / UT Selector */}
        <select
          value={locationSelection.stateId || ''}
          onChange={(e) => {
            const sId = e.target.value;
            const state = sId ? locationService.getStateById(sId) : undefined;
            setLocationSelection({
              countryId: 'loc-country-in',
              stateId: sId || undefined,
              stateName: state?.name,
              districtId: undefined,
              districtName: undefined,
              localityId: undefined,
              localityName: undefined,
              areaId: undefined,
              areaName: undefined,
            });
          }}
          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs"
        >
          <option value="">All India (State / UT)</option>
          {locationService.getStates().map((st) => (
            <option key={st.id} value={st.id}>
              {st.name} {st.type === 'UT' ? '(UT)' : ''}
            </option>
          ))}
        </select>

        {/* District Selector */}
        <select
          value={locationSelection.districtId || ''}
          onChange={(e) => {
            const dId = e.target.value;
            const dist = dId ? locationService.getDistrictById(dId) : undefined;
            setLocationSelection(prev => ({
              ...prev,
              districtId: dId || undefined,
              districtName: dist?.name,
              localityId: undefined,
              localityName: undefined,
              areaId: undefined,
              areaName: undefined,
            }));
          }}
          disabled={!locationSelection.stateId}
          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">
            {locationSelection.stateId ? 'All Districts' : 'Select State First'}
          </option>
          {(locationSelection.stateId
            ? locationService.getDistricts(locationSelection.stateId)
            : []
          ).map((dist) => (
            <option key={dist.id} value={dist.id}>
              {dist.name}
            </option>
          ))}
        </select>

        {/* Locality Selector */}
        {locationSelection.districtId && (
          <select
            value={locationSelection.localityId || ''}
            onChange={(e) => {
              const lId = e.target.value;
              const loc = lId ? locationService.getLocalityById(lId) : undefined;
              setLocationSelection(prev => ({
                ...prev,
                localityId: lId || undefined,
                localityName: loc?.name,
                areaId: undefined,
                areaName: undefined,
              }));
            }}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs"
          >
            <option value="">All Localities / Areas</option>
            {locationService.getLocalities(locationSelection.districtId).map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        )}

        {/* Geolocation Smart Trigger */}
        <button
          type="button"
          onClick={() => {
            if ('geolocation' in navigator) {
              navigator.geolocation.getCurrentPosition(
                () => {
                  const upDist = locationService.getDistrictById('dist-gzp') || locationService.getDistricts('loc-state-up')[0];
                  if (upDist) {
                    setLocationSelection({
                      countryId: 'loc-country-in',
                      stateId: upDist.stateId,
                      stateName: 'Uttar Pradesh',
                      districtId: upDist.id,
                      districtName: upDist.name,
                    });
                  }
                },
                () => {},
                { timeout: 5000 }
              );
            }
          }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors"
        >
          <Navigation className="w-3 h-3 text-brand-600" />
          <span>Use My Location</span>
        </button>
      </div>

      {/* Study Shift Filter */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block font-bold text-slate-700 uppercase text-[11px]">Study Shift</label>
          {selectedShift && (
            <button onClick={() => setSelectedShift('')} className="text-brand-600 font-semibold text-[10px] cursor-pointer">
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: '', label: 'Any Shift' },
            { id: 'morning', label: 'Morning (6-12)' },
            { id: 'afternoon', label: 'Afternoon (12-5)' },
            { id: 'evening', label: 'Evening (5-10)' },
            { id: 'full_day', label: 'Full Day / 24x7' },
          ].map((sh) => (
            <button
              key={sh.id}
              type="button"
              onClick={() => setSelectedShift(sh.id)}
              className={`px-2.5 py-1.5 rounded-lg text-left text-[11px] font-bold border transition-colors cursor-pointer ${
                selectedShift === sh.id
                  ? 'bg-brand-50 text-brand-700 border-brand-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sh.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Facilities */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block font-bold text-slate-700 uppercase text-[11px]">Amenities & Facilities</label>
          {selectedFacilities.length > 0 && (
            <button onClick={() => setSelectedFacilities([])} className="text-brand-600 font-semibold text-[10px] cursor-pointer">
              Clear ({selectedFacilities.length})
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_FACILITIES.map((fac) => {
            const isSelected = selectedFacilities.includes(fac.match);
            return (
              <button
                key={fac.id}
                type="button"
                onClick={() => toggleFacility(fac.match)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
                {fac.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Monthly Price */}
      <div className="space-y-2">
        <div className="flex justify-between text-slate-900 font-bold">
          <span className="text-slate-600">Max Monthly Price:</span>
          <span className="text-brand-600">₹{maxPrice.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="399"
          max="1500"
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-brand-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-semibold text-slate-500">
          <span>₹399</span>
          <span>₹1,500</span>
        </div>
      </div>

      {/* Available Seats Filter */}
      <div>
        <label className="block font-bold text-slate-700 uppercase mb-1.5 text-[11px]">Instant Seat Availability</label>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 5, 10, 15].map((seats) => (
            <button
              key={seats}
              type="button"
              onClick={() => setMinAvailableSeats(seats)}
              className={`py-1.5 rounded-lg text-center font-bold border transition-colors cursor-pointer text-[11px] ${
                minAvailableSeats === seats
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {seats === 0 ? 'Any' : `${seats}+`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 bg-white p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div 
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.85] contrast-[1.05]"
          style={{ backgroundImage: "url('/assets/images/study_library_bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/75" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Verified Self-Study Infrastructure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Explore Self-Study Libraries in {locationSelection.districtName || locationSelection.stateName || 'All India'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-1 max-w-xl leading-relaxed">
            Reserve air-conditioned study cubicles with 5G fiber Wi-Fi, 100% inverter power backup, and quiet study ambience.
          </p>
        </div>

        <div className="relative z-10 lg:hidden flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(true)}
            leftIcon={<Filter className="w-4 h-4 text-brand-600" />}
            className="border-slate-300 text-slate-800 font-bold bg-white/80 backdrop-blur-sm"
          >
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse ml-1" />
            )}
          </Button>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* FOCUSPOINT ADVERTISEMENT CAROUSEL — SERVICE ENGINE (FIND LIBRARIES) */}
      <FocusPointAdCarousel 
        page="FIND_LIBRARY" 
        districtId={locationSelection.districtId} 
        stateId={locationSelection.stateId} 
        className="my-3 sm:my-4"
      />

      {/* Smart Search & Discovery Bar with PIN Code Intelligence */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Find a ZYZU'S Library Near You</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                  Smart Discovery
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Locate verified self-study desks by entering your 6-digit PIN code or selecting shift timings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {filteredLibraries.length} Partner Libraries
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Inputs Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <PinCodeLocationSearch
              onLocationResolved={(selection) => setLocationSelection(selection)}
              onClear={() => setLocationSelection({})}
              currentSelection={locationSelection}
              placeholder="Enter 6-digit PIN code"
            />
          </div>

          <div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search library name or area..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs"
            >
              <option value="">All Shifts (Morning, Noon, Evening, 24/7)</option>
              <option value="MORNING">Morning Shift (6 AM - 2 PM)</option>
              <option value="AFTERNOON">Afternoon Shift (2 PM - 10 PM)</option>
              <option value="NIGHT">Night Shift (10 PM - 6 AM)</option>
              <option value="FULL_DAY">Full Day 24x7 Unlimited Access</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filter Drawer */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <FilterControls />
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <Drawer
          isOpen={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          title="Filter Study Libraries"
        >
          <FilterControls />
          <div className="mt-8">
            <Button className="w-full font-bold" onClick={() => setMobileFilterOpen(false)}>
              Apply Filters ({filteredLibraries.length} Results)
            </Button>
          </div>
        </Drawer>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
              <span className="font-bold text-slate-600 mr-1">Active Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-semibold">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="cursor-pointer hover:text-brand-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {locationSelection.pincode && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-300 font-bold">
                  PIN: {locationSelection.pincode}
                  <button onClick={() => setLocationSelection(prev => ({ ...prev, pincode: undefined }))} className="cursor-pointer hover:text-cyan-950"><X className="w-3 h-3" /></button>
                </span>
              )}
              {locationSelection.stateId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-semibold">
                  State: {locationSelection.stateName || locationSelection.stateId}
                  <button onClick={() => setLocationSelection({ countryId: 'loc-country-in' })} className="cursor-pointer hover:text-brand-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {locationSelection.districtId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-semibold">
                  District: {locationSelection.districtName || locationSelection.districtId}
                  <button onClick={() => setLocationSelection(prev => ({ ...prev, districtId: undefined, districtName: undefined, localityId: undefined, localityName: undefined, areaId: undefined, areaName: undefined, pincode: undefined }))} className="cursor-pointer hover:text-brand-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {locationSelection.localityId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-semibold">
                  Locality: {locationSelection.localityName || locationSelection.localityId}
                  <button onClick={() => setLocationSelection(prev => ({ ...prev, localityId: undefined, localityName: undefined, areaId: undefined, areaName: undefined }))} className="cursor-pointer hover:text-brand-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {locationSelection.areaId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-semibold">
                  Area: {locationSelection.areaName || locationSelection.areaId}
                  <button onClick={() => setLocationSelection(prev => ({ ...prev, areaId: undefined, areaName: undefined }))} className="cursor-pointer hover:text-brand-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedShift && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-semibold capitalize">
                  Shift: {selectedShift.replace('_', ' ')}
                  <button onClick={() => setSelectedShift('')} className="cursor-pointer hover:text-brand-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedFacilities.map(f => (
                <span key={f} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-semibold uppercase">
                  {f}
                  <button onClick={() => toggleFacility(f)} className="cursor-pointer hover:text-brand-900"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {maxPrice < 1500 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-semibold">
                  ≤ ₹{maxPrice}
                  <button onClick={() => setMaxPrice(1500)} className="cursor-pointer hover:text-brand-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {minAvailableSeats > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-semibold">
                  {minAvailableSeats}+ Seats Free
                  <button onClick={() => setMinAvailableSeats(0)} className="cursor-pointer hover:text-brand-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Section #43: PIN Code Detected Smart Banner */}
          {locationSelection.pincode && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/30 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                  <Navigation className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] tracking-wide uppercase">
                      PIN detected
                    </span>
                    <span className="text-xs font-bold text-cyan-200">{locationSelection.pincode}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                    Libraries near {locationSelection.pincode}
                  </h3>
                  <p className="text-xs text-slate-300">
                    State: <strong className="text-white">{locationSelection.stateName || 'Uttar Pradesh'}</strong>
                    {' '}• District: <strong className="text-white">{locationSelection.districtName || 'Ghazipur'}</strong>
                    {locationSelection.localityName && (
                      <> • Locality: <strong className="text-white">{locationSelection.localityName}</strong></>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLocationSelection(prev => ({ ...prev, pincode: undefined }))}
                  className="text-xs font-bold text-cyan-300 hover:text-white underline cursor-pointer"
                >
                  Clear PIN
                </button>
              </div>
            </div>
          )}

          {/* Results Header with Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 font-medium">
            <p>
              Showing <span className="font-black text-slate-950">{filteredLibraries.length}</span> verified study {filteredLibraries.length === 1 ? 'space' : 'spaces'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-xs cursor-pointer"
              >
                <option value="recommended">Featured / High Rating</option>
                <option value="rating">Rating: High to Low</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="seats">Available Seats: Most Free</option>
              </select>
            </div>
          </div>

          {/* Library Cards Grid, Nearby Fallback, or Section #44 Empty State */}
          {filteredLibraries.length === 0 ? (
            <div className="space-y-6">
              {/* Section #44: NO LIBRARY FOUND AT THIS LOCATION */}
              <div className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
                  <MapPin className="w-7 h-7 text-amber-600" />
                </div>
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-black uppercase tracking-wider">
                    <span>NO LIBRARY FOUND AT THIS LOCATION</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    We couldn't find an active ZYZU'S library at this location yet.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    {locationSelection.pincode
                      ? `No accredited ZYZU'S study space has been onboarded for PIN code ${locationSelection.pincode} yet.`
                      : `No accredited study library matches your selected filters in ${locationSelection.localityName || locationSelection.districtName || 'this area'}.`}
                    {' '}You can explore nearby district libraries or request a new library in this area.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Clear PIN and locality to show nearby district libraries
                      setLocationSelection(prev => ({
                        countryId: prev.countryId,
                        stateId: prev.stateId,
                        stateName: prev.stateName,
                        districtId: prev.districtId,
                        districtName: prev.districtName,
                      }));
                    }}
                    className="w-full sm:w-auto border-slate-300 text-slate-800 font-bold hover:bg-slate-50"
                  >
                    View Nearby Libraries
                  </Button>
                  <Button
                    onClick={() => setInterestModalOpen(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-brand-600 hover:from-amber-700 hover:to-brand-700 text-white font-black px-6 py-2.5 rounded-xl shadow-md border-0"
                    leftIcon={<Bell className="w-4 h-4" />}
                  >
                    Request a Library in This Area
                  </Button>
                </div>
              </div>

              {/* If there are nearby libraries in the district, display them underneath */}
              {nearbyDistrictLibraries.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <MapPin className="w-4 h-4 text-brand-600" />
                    <span>Showing nearby verified ZYZU'S study spaces in <strong>{locationSelection.districtName || 'this district'}</strong>:</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    {nearbyDistrictLibraries.map((lib) => {
                      const originalPrice = (lib.id === 'lib-focus-saidpur' || lib.name.toLowerCase().includes('focuspoint') || lib.name.toLowerCase().includes('zyzu'))
                        ? 1000
                        : (lib.monthlyStartingPrice || lib.monthlyFee || 499);
                      const pricing = policyService.getBestActiveOffer({
                        districtName: lib.districtName || 'Ghazipur',
                        serviceType: 'LIBRARY',
                        targetId: lib.id,
                        amount: originalPrice,
                      });

                      return (
                        <Card key={lib.id} hoverable className="p-0 overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md flex flex-col justify-between">
                          <div>
                            <div className="h-48 relative overflow-hidden">
                              <img
                                src={(lib.images && lib.images[0]) || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=1200'}
                                alt={lib.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase shadow-md">
                                {lib.availableSeats} of {lib.totalSeats} Seats Free
                              </div>
                              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                <div className="px-2.5 py-1 rounded-full bg-white/95 border border-slate-200 shadow-sm">
                                  <RatingStars rating={lib.rating || 0} reviewsCount={lib.reviewsCount} size="sm" />
                                </div>
                              </div>
                            </div>

                            <div className="p-5 space-y-3">
                              <div>
                                <div className="flex items-center gap-1.5 text-xs text-brand-600 font-bold mb-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>{lib.area}, {lib.districtName}, Uttar Pradesh</span>
                                </div>
                                <h3 className="font-extrabold text-slate-950 text-base leading-snug">{lib.name}</h3>
                                <p className="text-xs text-slate-600 mt-1 line-clamp-2 font-medium">{lib.description}</p>
                              </div>

                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {lib.facilities.slice(0, 4).map((fac: string) => (
                                  <span key={fac} className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200">
                                    {fac}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="p-5 pt-0 border-t border-slate-100 mt-3 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase block">Starting Fee</span>
                              <OfferPriceDisplay originalPrice={originalPrice} pricing={pricing} unit="/ mo" size="md" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Link to={`/library/${lib.id}`}>
                                <Button size="sm" variant="outline" className="border-slate-300">View</Button>
                              </Link>
                              <Link to={`/libraries/${lib.id}/book`}>
                                <Button size="sm">Book Desk</Button>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {filteredLibraries.map((lib) => {
                const originalPrice = (lib.id === 'lib-focus-saidpur' || lib.name.toLowerCase().includes('focuspoint') || lib.name.toLowerCase().includes('zyzu'))
                  ? 1000
                  : (lib.monthlyStartingPrice || lib.monthlyFee || 499);
                const pricing = policyService.getBestActiveOffer({
                  districtName: lib.districtName || 'Ghazipur',
                  serviceType: 'LIBRARY',
                  targetId: lib.id,
                  amount: originalPrice,
                });

                return (
                  <Card key={lib.id} hoverable className="p-0 overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md flex flex-col justify-between">
                    <div>
                      <div className="h-48 relative overflow-hidden">
                        <img
                          src={(lib.images && lib.images[0]) || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=1200'}
                          alt={lib.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase shadow-md">
                          {lib.availableSeats} of {lib.totalSeats} Seats Free
                        </div>
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <div className="px-2.5 py-1 rounded-full bg-white/95 border border-slate-200 shadow-sm">
                            <RatingStars rating={lib.rating || 0} reviewsCount={lib.reviewsCount} size="sm" />
                          </div>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-brand-600 font-bold mb-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{lib.area}, {lib.districtName}, Uttar Pradesh</span>
                          </div>
                          <h3 className="font-extrabold text-slate-950 text-base leading-snug">{lib.name}</h3>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2 font-medium">{lib.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {lib.facilities.slice(0, 4).map((fac: string) => (
                            <span key={fac} className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200">
                              {fac}
                            </span>
                          ))}
                          {lib.facilities.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-50 text-[10px] font-bold text-slate-500 border border-slate-200">
                              +{lib.facilities.length - 4} more
                            </span>
                          )}
                        </div>

                        <div className="pt-2 text-xs text-slate-600 font-medium">
                          <span className="font-bold text-slate-800">Timings:</span> {lib.timings}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 flex-wrap gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Starting from</span>
                        <OfferPriceDisplay
                          originalPrice={originalPrice}
                          pricing={pricing}
                          unit="/ mo"
                          size="md"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDemoTargetLibrary(lib)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1 shadow-xs transition"
                          title="Book 1-Time Demo Seat"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Book Demo
                        </button>
                        <Link to={`/library/${lib.id}`}>
                          <Button size="sm" variant="outline" className="shadow-sm font-bold border-slate-300">
                            View
                          </Button>
                        </Link>
                        <Link to={`/libraries/${lib.id}/book`}>
                          <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} className="shadow-sm font-bold">
                            Book Desk
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {demoTargetLibrary && (
        <DemoBookingModal
          isOpen={Boolean(demoTargetLibrary)}
          onClose={() => setDemoTargetLibrary(null)}
          serviceType="LIBRARY"
          serviceId={demoTargetLibrary.id}
          serviceName={demoTargetLibrary.name}
          serviceAddress={demoTargetLibrary.address}
          state={demoTargetLibrary.state || 'Uttar Pradesh'}
          district={demoTargetLibrary.districtName || demoTargetLibrary.district || 'Ghazipur'}
        />
      )}

      {/* Register Interest Modal */}
      <RegisterInterestModal
        isOpen={interestModalOpen}
        onClose={() => setInterestModalOpen(false)}
        type="LIBRARY"
        stateName={locationSelection.stateName || 'Uttar Pradesh'}
        districtName={locationSelection.districtName || 'Ghazipur'}
        localityName={locationSelection.localityName}
        facility={selectedFacilities[0] || 'All Facility'}
      />
    </div>
  );
};
