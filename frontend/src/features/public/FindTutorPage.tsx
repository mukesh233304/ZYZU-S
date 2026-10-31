import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  GraduationCap, Search, Filter, MapPin, Award, 
  ShieldCheck, ArrowRight, RotateCcw, X, SlidersHorizontal, Sparkles, Navigation 
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Drawer } from '../../components/common/Drawer';
import { RatingStars } from '../../components/common/RatingStars';
import { EmptyState } from '../../components/common/FeedbackStates';
import { SUBJECTS, CLASSES, TEACHING_MODES } from '../../constants';
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
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationEventService } from '../../services/notificationEventService';

export const FindTutorPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, setPolicyVersion] = useState(0);
  const [demoTargetTeacher, setDemoTargetTeacher] = useState<any | null>(null);
  const [interestModalOpen, setInterestModalOpen] = useState(false);

  // Real-time reactive subscription to policy/offer changes
  useEffect(() => {
    return policyService.subscribe(() => setPolicyVersion(v => v + 1));
  }, []);

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

  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || '');
  const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || '');
  const [selectedBoard, setSelectedBoard] = useState(searchParams.get('board') || '');
  const [teachingMode, setTeachingMode] = useState('');
  const [maxFee, setMaxFee] = useState(5000);
  const [minExp, setMinExp] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { user } = useAuth();

  // AI Agent Event Hook: Detect home tutor search activity
  useEffect(() => {
    if (!selectedSubject && !selectedClass && !locationSelection.districtName && !locationSelection.localityName && !locationSelection.pincode) {
      return;
    }

    const timer = setTimeout(() => {
      notificationEventService.emitHomeTutorSearch({
        subject: selectedSubject || undefined,
        classLevel: selectedClass || undefined,
        districtName: locationSelection.districtName,
        localityName: locationSelection.localityName,
        stateName: locationSelection.stateId ? locationService.getStateById(locationSelection.stateId)?.name : undefined,
        teachingMode: teachingMode || undefined,
        userId: user?.id,
        userName: user?.name,
        userPhone: user?.phone
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [selectedSubject, selectedClass, locationSelection.districtName, locationSelection.localityName, locationSelection.pincode, teachingMode, user]);

  const allTeachers = mockStore.getTeachers({ status: 'APPROVED' });

  const filteredTeachers = useMemo(() => {
    return allTeachers.filter((t) => {
      // Hierarchy Location Filtering: State -> District -> Locality -> Area
      if (locationSelection.stateId) {
        const stateDists = locationService.getDistricts(locationSelection.stateId).map(d => d.id);
        if (t.districtId && !stateDists.includes(t.districtId)) return false;
      }

      if (locationSelection.districtId) {
        if (t.districtId !== locationSelection.districtId) return false;
      }

      if (locationSelection.localityId) {
        const loc = locationService.getLocalityById(locationSelection.localityId);
        const locName = (loc?.name || locationSelection.localityName || '').toLowerCase();
        const matchesLoc = 
          t.localityId === locationSelection.localityId ||
          (t.city && t.city.toLowerCase().includes(locName)) ||
          (t.area && t.area.toLowerCase().includes(locName)) ||
          (t.areasServed || []).some(a => a.toLowerCase().includes(locName));
        if (!matchesLoc) return false;
      }

      if (locationSelection.areaId) {
        const ar = locationService.getAreaById(locationSelection.areaId);
        const arName = (ar?.name || locationSelection.areaName || '').toLowerCase();
        const matchesArea = 
          t.areaId === locationSelection.areaId ||
          (t.area && t.area.toLowerCase().includes(arName)) ||
          (t.areasServed || []).some(a => a.toLowerCase().includes(arName));
        if (!matchesArea) return false;
      }

      // Subject filter with "All Subjects" coverage logic
      if (selectedSubject) {
        if (selectedSubject.toLowerCase() === 'all subjects') {
          // Check teacher teaches multiple subjects or broad foundation
          const subCount = (t.subjects || []).length;
          const hasBroad = (t.subjects || []).some(s => 
            s.toLowerCase().includes('combined') || 
            s.toLowerCase().includes('all') ||
            s.toLowerCase().includes('science') ||
            s.toLowerCase().includes('mathematics')
          );
          if (subCount < 2 && !hasBroad) return false;
        } else if (!(t.subjects || []).includes(selectedSubject)) {
          return false;
        }
      }

      // Class filter with Nursery/LKG/UKG early childhood compatibility
      if (selectedClass) {
        const isEarlyChildhood = ['nursery', 'lkg', 'ukg'].includes(selectedClass.toLowerCase());
        const teachesEarly = (t.classes || []).some(c => 
          c.toLowerCase().includes(selectedClass.toLowerCase()) || 
          (isEarlyChildhood && (c.toLowerCase().includes('class 1') || c.toLowerCase().includes('class 2') || c.toLowerCase().includes('foundation')))
        );
        if (!teachesEarly) return false;
      }

      // Board filter
      if (selectedBoard) {
        const tBoards = (t.boards || []).map(b => b.toLowerCase());
        if (tBoards.length > 0 && !tBoards.some(b => b.includes(selectedBoard.toLowerCase()))) {
          return false;
        }
      }

      if (teachingMode && t.teachingMode !== teachingMode && t.teachingMode !== 'BOTH') return false;
      if ((t.expectedFeeMonthly || t.monthlyFee || 0) > maxFee) return false;
      if ((t.experienceYears || 0) < minExp) return false;
      if (minRating > 0 && (t.rating || 0) < minRating) return false;
      return true;
    });
  }, [allTeachers, locationSelection, selectedSubject, selectedClass, selectedBoard, teachingMode, maxFee, minExp, minRating]);

  // Fallback: If 0 results in exact locality, find verified teachers across the district
  const nearbyDistrictTeachers = useMemo(() => {
    if (!locationSelection.localityId || filteredTeachers.length > 0) return [];
    return allTeachers.filter(t => {
      if (locationSelection.districtId && t.districtId !== locationSelection.districtId) return false;
      return true;
    });
  }, [allTeachers, locationSelection, filteredTeachers.length]);

  // Record demand when no teachers match in selected location
  useEffect(() => {
    if (locationSelection.districtName && filteredTeachers.length === 0 && nearbyDistrictTeachers.length === 0) {
      locationDemandService.recordTeacherDemand({
        state: locationSelection.stateName || 'Uttar Pradesh',
        district: locationSelection.districtName,
        locality: locationSelection.localityName || 'District Wide',
        classGrade: selectedClass || 'Class 10',
        subject: selectedSubject || 'All Subjects'
      });
    }
  }, [locationSelection.districtName, locationSelection.localityName, filteredTeachers.length, nearbyDistrictTeachers.length, selectedClass, selectedSubject]);

  const resetFilters = () => {
    setLocationSelection({});
    setSelectedSubject('');
    setSelectedClass('');
    setSelectedBoard('');
    setTeachingMode('');
    setMaxFee(5000);
    setMinExp(0);
    setMinRating(0);
    setSearchParams({});
  };

  const FilterControls = () => (
    <div className="space-y-5 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          Filter Home Tutors
        </h3>
        <button
          type="button"
          onClick={resetFilters}
          className="text-brand-600 hover:text-brand-700 flex items-center gap-1 font-bold cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Smart Compact Location Filter with PIN Code Intelligence */}
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

      {/* Subject */}
      <div>
        <label className="block font-bold text-slate-700 uppercase mb-1.5 text-[11px]">Subject</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs"
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Class */}
      <div>
        <label className="block font-bold text-slate-700 uppercase mb-1.5 text-[11px]">Target Class</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs"
        >
          <option value="">All Classes</option>
          {CLASSES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Board / Curriculum */}
      <div>
        <label className="block font-bold text-slate-700 uppercase mb-1.5 text-[11px]">Board / Curriculum</label>
        <select
          value={selectedBoard}
          onChange={(e) => setSelectedBoard(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs"
        >
          <option value="">All Boards</option>
          <option value="CBSE">CBSE Board</option>
          <option value="ICSE">ICSE / ISC</option>
          <option value="UP">UP State Board</option>
          <option value="State">Other State Boards</option>
          <option value="IB">IB / International</option>
        </select>
      </div>

      {/* Teaching Mode */}
      <div>
        <label className="block font-bold text-slate-700 uppercase mb-1.5 text-[11px]">Teaching Mode</label>
        <select
          value={teachingMode}
          onChange={(e) => setTeachingMode(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs"
        >
          <option value="">Any Mode</option>
          {TEACHING_MODES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Max Monthly Fee */}
      <div className="space-y-2">
        <div className="flex justify-between text-slate-900 font-bold">
          <span className="text-slate-600">Max Fee / Month:</span>
          <span>₹{maxFee.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="1500"
          max="6000"
          step="250"
          value={maxFee}
          onChange={(e) => setMaxFee(Number(e.target.value))}
          className="w-full accent-brand-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-semibold text-slate-500">
          <span>₹1,500</span>
          <span>₹6,000</span>
        </div>
      </div>

      {/* Minimum Experience */}
      <div>
        <label className="block font-bold text-slate-700 uppercase mb-1.5 text-[11px]">Minimum Experience</label>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 2, 5, 8].map((exp) => (
            <button
              key={exp}
              type="button"
              onClick={() => setMinExp(exp)}
              className={`py-1.5 rounded text-center font-bold border transition-colors cursor-pointer ${
                minExp === exp
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {exp === 0 ? 'Any' : `${exp}+ yrs`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header Banner with Dedicated Home Tuition Background */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 bg-white p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div 
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.9] contrast-[1.05]"
          style={{ backgroundImage: "url('/assets/images/white_home_tuition_bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/70" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>District Verified Home Educators</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Find Home Tutors in {locationSelection.districtName || (locationSelection.stateId ? locationService.getStateById(locationSelection.stateId)?.name : 'India')} & Nearby Areas
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-1 max-w-xl leading-relaxed">
            Browse verified teachers across {locationSelection.localityName || locationSelection.areaName || 'your locality'}. View verified degree credentials, syllabus specializations, and request trial classes.
          </p>
        </div>

        {/* Mobile Filter Trigger */}
        <div className="relative z-10 lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(true)}
            leftIcon={<Filter className="w-4 h-4 text-brand-600" />}
            className="border-slate-300 bg-white text-slate-900 shadow-sm"
          >
            Filters ({filteredTeachers.length} Tutors)
          </Button>
        </div>
      </div>

      {/* FOCUSPOINT ADVERTISEMENT CAROUSEL — SERVICE ENGINE (FIND HOME TUTOR) */}
      <FocusPointAdCarousel 
        page="FIND_TUTOR" 
        districtId={locationSelection.districtId} 
        stateId={locationSelection.stateId} 
        className="my-3 sm:my-4"
      />

      {/* Smart Search & Discovery Bar with PIN Code Intelligence */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Find Home Tutors Near You</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-brand-100 text-brand-700">
                  Smart Search
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Search by 6-digit PIN code, class, or subject specialization.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {filteredTeachers.length} Available Tutors
            </span>
            {(locationSelection.stateId || locationSelection.districtId || selectedSubject || selectedClass || selectedBoard) && (
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
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs"
            >
              <option value="">All Classes (Foundation to Senior)</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs"
            >
              <option value="">All Academic Subjects</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Filter / Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 sm:gap-6 items-start">
        {/* Desktop Filter Panel */}
        <aside className="hidden lg:block lg:col-span-1 rounded-2xl bg-white border border-slate-200 p-5 sticky top-24 shadow-sm">
          <FilterControls />
        </aside>

        {/* Mobile Filter Drawer */}
        <Drawer
          isOpen={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          title="Filter Home Tutors"
        >
          <FilterControls />
          <div className="mt-8">
            <Button className="w-full" onClick={() => setMobileFilterOpen(false)}>
              Apply Filters ({filteredTeachers.length} Results)
            </Button>
          </div>
        </Drawer>

        {/* Tutor Results */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <p>Showing <span className="font-black text-slate-950">{filteredTeachers.length}</span> verified tutors</p>
            {(selectedSubject || locationSelection.stateId || locationSelection.districtId || locationSelection.localityId || minExp > 0) && (
              <span className="text-brand-600 font-bold">Active filters applied</span>
            )}
          </div>

          {filteredTeachers.length === 0 ? (
            nearbyDistrictTeachers.length > 0 ? (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-950">
                      No teacher is currently available in your selected locality ({locationSelection.localityName}).
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Showing nearby verified home mentors in <strong>{locationSelection.districtName}</strong> district:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {nearbyDistrictTeachers.map((teacher) => {
                    const tutorFee = teacher.expectedFeeMonthly || teacher.monthlyFee || 3000;
                    const pricing = policyService.getBestActiveOffer({
                      districtName: teacher.districtName || 'Ghazipur',
                      serviceType: 'TUITION',
                      targetId: teacher.id,
                      amount: tutorFee,
                    });

                    return (
                      <Card key={teacher.id} hoverable className="bg-white border border-slate-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4">
                        <div className="space-y-3.5">
                          <div className="flex items-start gap-4">
                            <img
                              src={teacher.avatarUrl}
                              alt={teacher.name}
                              className="w-16 h-16 rounded-xl object-cover border border-brand-500/30 shrink-0 shadow-sm"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <h3 className="font-extrabold text-slate-950 text-base truncate">{teacher.name}</h3>
                                  <span title="Verified by District Admin"><ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /></span>
                                </div>
                              </div>
                              <p className="text-xs font-semibold text-slate-700 truncate">{teacher.highestQualification}</p>
                              <p className="text-[11px] font-medium text-slate-500 truncate">{teacher.university}</p>
                              <div className="mt-1">
                                <RatingStars rating={teacher.rating || 0} reviewsCount={teacher.reviewsCount} size="sm" />
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">{teacher.bio}</p>

                          <div className="space-y-2 pt-1">
                            <div className="flex flex-wrap gap-1">
                              {teacher.subjects.map((sub) => (
                                <span key={sub} className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[11px] font-bold border border-brand-200">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Tuition Fee</span>
                            <OfferPriceDisplay originalPrice={tutorFee} pricing={pricing} unit="/ mo" size="md" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Link to={`/teacher/${teacher.id}`}>
                              <Button size="sm" variant="outline" className="border-slate-300">View</Button>
                            </Link>
                            <Link to={`/student/request-tutor?teacherId=${teacher.id}`}>
                              <Button size="sm">Book Tutor</Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 border border-emerald-500/30 p-8 sm:p-12 text-center text-white space-y-5 shadow-2xl relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center mx-auto shadow-inner">
                  <GraduationCap className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
                    <span>Teacher Network Expansion</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    We are expanding to your area
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                    Your selected location ({locationSelection.localityName ? `${locationSelection.localityName}, ` : ''}{locationSelection.districtName || 'this district'}) currently has no verified teacher for {selectedClass || 'your class'} ({selectedSubject || 'All Subjects'}). Register your interest and our District Team will prioritize teacher onboarding in your locality.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    onClick={() => setInterestModalOpen(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-700 hover:to-emerald-600 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 border-0"
                    leftIcon={<Bell className="w-4 h-4" />}
                  >
                    Notify Me When Teacher is Available
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="w-full sm:w-auto border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    View All Active Districts
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTeachers.map((teacher) => {
                const tutorFee = teacher.expectedFeeMonthly || teacher.monthlyFee || 3000;
                const pricing = policyService.getBestActiveOffer({
                  districtName: teacher.districtName || 'Ghazipur',
                  serviceType: 'TUITION',
                  targetId: teacher.id,
                  amount: tutorFee,
                });

                return (
                  <Card key={teacher.id} hoverable className="bg-white border border-slate-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4">
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-4">
                        <img
                          src={teacher.avatarUrl}
                          alt={teacher.name}
                          className="w-16 h-16 rounded-xl object-cover border border-brand-500/30 shrink-0 shadow-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-extrabold text-slate-950 text-base truncate">{teacher.name}</h3>
                              <span title="Verified by District Admin"><ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /></span>
                            </div>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 truncate">{teacher.highestQualification}</p>
                          <p className="text-[11px] font-medium text-slate-500 truncate">{teacher.university}</p>
                          <div className="mt-1">
                            <RatingStars rating={teacher.rating || 0} reviewsCount={teacher.reviewsCount} size="sm" />
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">{teacher.bio}</p>

                      {/* Subjects and Classes */}
                      <div className="space-y-2 pt-1">
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.map((sub) => (
                            <span key={sub} className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[11px] font-bold border border-brand-200">
                              {sub}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {(teacher.classes || []).slice(0, 3).map((cls) => (
                            <span key={cls} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                              {cls}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Details Info */}
                      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          <span className="truncate">{(teacher.areasServed || []).join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{teacher.experienceYears}+ Yrs Exp</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing and Action */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Expected Fee</span>
                        <OfferPriceDisplay
                          originalPrice={tutorFee}
                          pricing={pricing}
                          unit="/ mo"
                          size="md"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDemoTargetTeacher(teacher)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 font-bold text-xs flex items-center gap-1 shadow-xs transition"
                          title="Book 1-Time Demo Class"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Book Demo
                        </button>
                        <Link to={`/teacher/${teacher.id}`}>
                          <Button size="sm" variant="outline" className="shadow-sm font-bold border-slate-300">
                            Profile
                          </Button>
                        </Link>
                        <Link to={`/student/tutor-requests/new?preferredTeacherId=${teacher.id}&teacherName=${encodeURIComponent(teacher.name)}`}>
                          <Button size="sm" className="shadow-sm font-bold">
                            Book Tuition
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

      {demoTargetTeacher && (
        <DemoBookingModal
          isOpen={Boolean(demoTargetTeacher)}
          onClose={() => setDemoTargetTeacher(null)}
          serviceType="HOME_TUITION"
          serviceId={demoTargetTeacher.id}
          serviceName={demoTargetTeacher.name}
          tutorSubject={demoTargetTeacher.subjects?.[0]}
          state="Uttar Pradesh"
          district={demoTargetTeacher.districtName || demoTargetTeacher.district || 'Ghazipur'}
        />
      )}

      {/* Register Interest Modal */}
      <RegisterInterestModal
        isOpen={interestModalOpen}
        onClose={() => setInterestModalOpen(false)}
        type="TEACHER"
        stateName={locationSelection.stateName || 'Uttar Pradesh'}
        districtName={locationSelection.districtName || 'Ghazipur'}
        localityName={locationSelection.localityName}
        classGrade={selectedClass || 'Class 10'}
        subject={selectedSubject || 'All Subjects'}
      />
    </div>
  );
};
