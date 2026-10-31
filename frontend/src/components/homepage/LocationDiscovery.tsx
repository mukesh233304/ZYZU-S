import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  GraduationCap, 
  BookMarked, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Building2, 
  BookOpen, 
  ShieldCheck, 
  Wifi, 
  Wind, 
  Zap, 
  Lock, 
  CheckCircle2, 
  Globe2, 
  Navigation, 
  Clock, 
  Users,
  Eye,
  SlidersHorizontal,
  Flame,
  Check,
  ChevronRight,
  Shield,
  Layers,
  Tag,
  Copy,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { CascadingLocationSelector } from '../common/CascadingLocationSelector';
import { LocationHierarchySelection } from '../../types/location';
import { locationService } from '../../services/locationService';
import { pinCodeService } from '../../services/pinCodeService';
import { mockStore } from '../../mock/store';
import { offerService } from '../../services/offerService';
import { couponService } from '../../services/couponService';
import { useToast } from '../../context/ToastContext';
import { CLASSES, SUBJECTS, LIBRARY_FACILITIES } from '../../constants';

interface LocationDiscoveryProps {
  locationSelection: LocationHierarchySelection;
  onLocationChange: (loc: LocationHierarchySelection) => void;
}

export const LocationDiscovery: React.FC<LocationDiscoveryProps> = ({
  locationSelection,
  onLocationChange,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'libraries' | 'tutors'>('libraries');
  const [tutorSubject, setTutorSubject] = useState('All Subjects');
  const [tutorClass, setTutorClass] = useState('Class 10');
  const [libraryFacility, setLibraryFacility] = useState('all');
  const [shiftPreference, setShiftPreference] = useState<'ALL' | 'MORNING' | 'EVENING' | 'FULL_DAY'>('ALL');
  const [tutoringMode, setTutoringMode] = useState<'IN_PERSON' | 'HYBRID' | 'ALL'>('ALL');

  // PIN Code Discovery Engine State
  const [pincodeInput, setPincodeInput] = useState('');
  const [isResolvingPin, setIsResolvingPin] = useState(false);
  const [pinResolutionMessage, setPinResolutionMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showManualSelector, setShowManualSelector] = useState(false);
  const [activeOffer, setActiveOffer] = useState<any | null>(null);
  const [copiedOfferCode, setCopiedOfferCode] = useState<string | null>(null);

  const districtName = locationSelection.districtName || 'Ghazipur';
  const stateName = locationSelection.stateName || 'Uttar Pradesh';
  const localityName = locationSelection.localityName;
  const availableLocalities = locationService.getLocalities(locationSelection.districtId || 'dist-gzp');

  // Dynamic States & UTs Representation
  const stateUtCounts = useMemo(() => {
    return locationService.getStateAndUtCounts();
  }, []);

  // Genuine Real Service Counts from mockStore
  const availableTutors = useMemo(() => {
    return mockStore.getTeachers({
      districtId: locationSelection.districtId,
      status: 'APPROVED'
    });
  }, [locationSelection.districtId]);

  const availableLibraries = useMemo(() => {
    return mockStore.getLibraries(locationSelection.districtId)
      .filter(l => l.verificationStatus === 'APPROVED');
  }, [locationSelection.districtId]);

  const availableAreas = useMemo(() => {
    if (!locationSelection.localityId) return [];
    return locationService.getAreas(locationSelection.localityId);
  }, [locationSelection.localityId]);

  // Load Connected LIVE Offer for Current Location
  useEffect(() => {
    if (districtName) {
      offerService.getActiveOffers({ districtName }).then((offers) => {
        const liveWithCoupon = offers.find(o => o.couponCode);
        setActiveOffer(liveWithCoupon || offers[0] || null);
      }).catch(() => setActiveOffer(null));
    }
  }, [districtName]);

  // Centralized PIN Code Resolution Handler
  const handlePincodeLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = (pincodeInput || '').trim().replace(/\D/g, '').slice(0, 6);
    if (!clean || clean.length !== 6 || clean.startsWith('0')) {
      setPinResolutionMessage({
        text: 'Enter a valid 6-digit PIN code.',
        type: 'error'
      });
      return;
    }

    setIsResolvingPin(true);
    setPinResolutionMessage(null);

    try {
      const res = await pinCodeService.resolvePinCode(clean);
      if (res.success && res.districtId) {
        onLocationChange({
          countryId: 'loc-country-in',
          stateId: res.stateId,
          districtId: res.districtId,
          localityId: res.localityId,
          areaId: res.areaId,
          stateName: res.stateName,
          districtName: res.districtName,
          localityName: res.localityName,
          areaName: res.areaName,
        });
        setPinResolutionMessage({
          text: `✓ Location detected: ${res.localityName || res.districtName}, ${res.districtName} (${res.pincode})`,
          type: 'success'
        });
      } else {
        setPinResolutionMessage({
          text: res.message || "We couldn't find this PIN code. Please check the PIN and try again.",
          type: 'error'
        });
      }
    } catch {
      setPinResolutionMessage({
        text: 'Location lookup is temporarily unavailable. Please retry.',
        type: 'error'
      });
    } finally {
      setIsResolvingPin(false);
    }
  };

  const handleLibrarySearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (locationSelection.stateId) params.set('state', locationSelection.stateId);
    if (locationSelection.districtId) params.set('district', locationSelection.districtId);
    if (locationSelection.localityId) params.set('locality', locationSelection.localityId);
    if (locationSelection.areaId) params.set('area', locationSelection.areaId);
    if (locationSelection.areaName) params.set('areaName', locationSelection.areaName);
    params.set('facility', libraryFacility);
    if (shiftPreference !== 'ALL') params.set('shift', shiftPreference);
    navigate(`/find-library?${params.toString()}`);
  };

  const handleTutorSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (locationSelection.stateId) params.set('state', locationSelection.stateId);
    if (locationSelection.districtId) params.set('district', locationSelection.districtId);
    if (locationSelection.localityId) params.set('locality', locationSelection.localityId);
    if (locationSelection.areaId) params.set('area', locationSelection.areaId);
    if (locationSelection.areaName) params.set('areaName', locationSelection.areaName);
    params.set('subject', tutorSubject);
    params.set('class', tutorClass);
    if (tutoringMode !== 'ALL') params.set('mode', tutoringMode);
    navigate(`/find-tutor?${params.toString()}`);
  };

  return (
    <section 
      id="location-discovery"
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-10 lg:my-12" 
      aria-label="Pan-India Location Discovery Engine"
    >
      {/* Background Soft Ambient Light Spheres */}
      <div className="absolute -top-12 left-1/3 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-10 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main MNC EdTech Command Deck Card */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.05)] overflow-hidden backdrop-blur-xl transition-all duration-300 ring-1 ring-slate-900/5">
        
        {/* Dynamic Multi-Color Gradient Beam Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600" />

        {/* Inner Padding & Layout */}
        <div className="p-5 sm:p-7 lg:p-8 space-y-5 sm:space-y-6">
          
          {/* Top Engine Header: Badge, Title & Telemetry Capsule */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-4 border-b border-slate-100">
            <div className="space-y-2.5 max-w-3xl">
              {/* Pan-India Live Status Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand-50 to-blue-50 border border-brand-200/70 text-brand-700 text-xs font-black uppercase tracking-wider shadow-xs">
                <Globe2 className="w-3.5 h-3.5 text-brand-600 animate-spin" style={{ animationDuration: '16s' }} />
                <span>Pan-India Location Discovery Engine</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-700 normal-case hidden sm:inline">
                  {stateUtCounts.statesCount} States &amp; {stateUtCounts.utCount} UTs Active
                </span>
              </div>

              {/* Dynamic Territory Headline */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                Discover Verified AC Libraries &amp; Tutors in{' '}
                <span className="bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {localityName ? `${localityName}, ${districtName}` : districtName}
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Seamlessly filter silent AC cabins with 5G Wi-Fi or match background-verified home tutors across {districtName} with zero brokerage, district-verified credentials, and instant demo bookings.
              </p>
            </div>

            {/* Active Telemetry & Jurisdiction Capsule */}
            <div className="self-start lg:self-auto p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/80 flex items-center gap-3.5 shrink-0 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-brand-500 animate-pulse" />
                  Active Territory
                </span>
                <p className="text-xs sm:text-sm font-black text-slate-950 truncate max-w-[200px] sm:max-w-xs">
                  {localityName ? `${localityName}, ${districtName}` : `${districtName}, ${stateName}`}
                </p>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  100% District Admin KYC Verified
                </span>
              </div>
            </div>
          </div>

          {/* Prominent Futuristic PIN Code Discovery Bar */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white border border-indigo-500/30 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-cyan-400 flex items-center justify-center">
                  <Navigation className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-tight">
                    Find ZYZU'S Services Near You
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Enter your 6-digit area PIN code for instant auto-resolution of State, District, and Localities.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualSelector(prev => !prev)}
                  className="text-xs font-bold text-cyan-300 hover:text-cyan-200 underline cursor-pointer flex items-center gap-1"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>{showManualSelector ? 'Hide Manual Hierarchy' : 'Adjust Location Manually'}</span>
                </button>
              </div>
            </div>

            {/* PIN Search Bar Form */}
            <form onSubmit={handlePincodeLookup} className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPincodeInput(cleaned);
                    if (pinResolutionMessage) setPinResolutionMessage(null);
                  }}
                  placeholder="Enter 6-digit area PIN code (e.g. 233304, 221005, 110001, 560001)"
                  className="w-full bg-slate-900/90 border border-indigo-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={isResolvingPin}
                className="px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shrink-0"
              >
                {isResolvingPin ? (
                  <>
                    <Globe2 className="w-4 h-4 animate-spin" />
                    <span>Resolving PIN...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Explore Territory</span>
                  </>
                )}
              </button>
            </form>

            {/* Feedback / Error Message */}
            {pinResolutionMessage && (
              <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 ${
                pinResolutionMessage.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  {pinResolutionMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{pinResolutionMessage.text}</span>
                </div>
                {pinResolutionMessage.text.includes('temporarily unavailable') && (
                  <button
                    type="button"
                    onClick={() => handlePincodeLookup()}
                    className="px-2 py-0.5 rounded bg-rose-800 text-white text-[11px] font-bold hover:bg-rose-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Location Result & Service Availability Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center font-black text-sm">
                  📍
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-brand-700 tracking-wider">
                      Location Detected
                    </span>
                    {pincodeInput && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-bold">
                        PIN: {pincodeInput}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-950">
                    {localityName ? `${localityName}, ` : ''}{districtName}, {stateName}
                  </h3>
                </div>
              </div>

              {/* Service Discovery Action Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('tutors');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{availableTutors.length} Tutors Available</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('libraries');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-50 border border-cyan-200 text-cyan-800 hover:bg-cyan-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookMarked className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{availableLibraries.length} Libraries Available</span>
                </button>
              </div>
            </div>

            {/* Multiple Areas / Neighborhoods Selector */}
            {availableAreas.length > 1 && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span>Select Your Area / Colony in {localityName || districtName}:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => onLocationChange({ ...locationSelection, areaId: undefined, areaName: undefined })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      !locationSelection.areaId
                        ? 'bg-brand-600 text-white border-brand-600 font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    All Areas
                  </button>
                  {availableAreas.map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => onLocationChange({ ...locationSelection, areaId: area.id, areaName: area.name })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        locationSelection.areaId === area.id
                          ? 'bg-brand-600 text-white border-brand-600 font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {area.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Empty State if neither tutor nor library is available */}
            {availableTutors.length === 0 && availableLibraries.length === 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>No ZYZU'S facility is currently active in {localityName || districtName}.</span>
                </div>
                <p className="text-slate-600">
                  ZYZU'S is rapidly expanding across {stateName}. You can submit a request for home tutors or partner library onboarding in your area.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/contact')}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                  >
                    Request ZYZU'S Service in My Town
                  </button>
                </div>
              </div>
            )}

            {/* Connected LIVE Offer Card for this Location */}
            {activeOffer && activeOffer.couponCode && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold uppercase text-[10px] text-amber-800 tracking-wider">
                        LIVE OFFER IN {districtName.toUpperCase()}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-200 font-mono font-bold text-[10px]">
                        Save ₹{activeOffer.discountValue || 100}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900">
                      {activeOffer.title}: Apply coupon code <span className="font-mono text-amber-700 font-black">{activeOffer.couponCode}</span> at checkout.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (activeOffer.couponCode) {
                      await couponService.copyCoupon(activeOffer.couponCode);
                      setCopiedOfferCode(activeOffer.couponCode);
                      showToast(`✓ Coupon ${activeOffer.couponCode} copied! Ready for checkout.`, 'success');
                      setTimeout(() => setCopiedOfferCode(null), 3000);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  {copiedOfferCode === activeOffer.couponCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      <span>Copied ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-white" />
                      <span>Copy Coupon ({activeOffer.couponCode})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* MNC EdTech Dual-Mode Segmented Service Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/80">
            {/* Mode 1: Study Libraries */}
            <button
              type="button"
              onClick={() => setActiveTab('libraries')}
              className={`p-3.5 sm:p-4 rounded-xl text-left transition-all duration-200 cursor-pointer flex items-center justify-between border ${
                activeTab === 'libraries'
                  ? 'bg-white border-brand-500/80 shadow-md ring-2 ring-brand-500/10 text-slate-950'
                  : 'bg-transparent border-transparent text-slate-600 hover:text-slate-950 hover:bg-white/60'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  activeTab === 'libraries' 
                    ? 'bg-gradient-to-br from-brand-500 to-blue-600 text-white shadow-md shadow-brand-500/25' 
                    : 'bg-slate-200/70 text-slate-500'
                }`}>
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-black tracking-tight text-slate-950">Study Libraries</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                      AC Cabins
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                    Silent cabins, reserved desks, 5G Wi-Fi &amp; 100% power backup.
                  </p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                activeTab === 'libraries' 
                  ? 'border-brand-600 bg-brand-600 text-white' 
                  : 'border-slate-300 text-transparent'
              }`}>
                {activeTab === 'libraries' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>

            {/* Mode 2: Home Tutors */}
            <button
              type="button"
              onClick={() => setActiveTab('tutors')}
              className={`p-3.5 sm:p-4 rounded-xl text-left transition-all duration-200 cursor-pointer flex items-center justify-between border ${
                activeTab === 'tutors'
                  ? 'bg-white border-indigo-500/80 shadow-md ring-2 ring-indigo-500/10 text-slate-950'
                  : 'bg-transparent border-transparent text-slate-600 hover:text-slate-950 hover:bg-white/60'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  activeTab === 'tutors' 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25' 
                    : 'bg-slate-200/70 text-slate-500'
                }`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-black tracking-tight text-slate-950">Verified Home Tutors</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      100% KYC
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                    Pre-Nursery to 12th, NEET/JEE, 1-on-1 home visits &amp; demo class.
                  </p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                activeTab === 'tutors' 
                  ? 'border-indigo-600 bg-indigo-600 text-white' 
                  : 'border-slate-300 text-transparent'
              }`}>
                {activeTab === 'tutors' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          </div>

          {/* Optional Cascading Location Selector Deck (Toggleable Manual Override) */}
          {showManualSelector && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-xs space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  <span>Manual Territory Hierarchy (State → District → Locality → Area)</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                  <Navigation className="w-3 h-3 text-brand-600" />
                  <span>Cascading Master Active</span>
                </div>
              </div>

              {/* Cascading Selector embedded */}
              <CascadingLocationSelector
                value={locationSelection}
                onChange={onLocationChange}
                mode="compact"
                allowAllOption={false}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: STUDY LIBRARIES SEARCH FILTERS & SUBMIT                            */}
          {/* ========================================================================= */}
          {activeTab === 'libraries' && (
            <form onSubmit={handleLibrarySearch} className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Facility Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    <span>Primary Required Facility</span>
                  </label>
                  <select
                    value={libraryFacility}
                    onChange={(e) => setLibraryFacility(e.target.value)}
                    className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xs transition-all cursor-pointer"
                  >
                    <option value="all">★ All Facilities (Show All Verified Libraries)</option>
                    <option value="ac">❄️ Air Conditioned (AC) Quiet Cabin</option>
                    <option value="wifi">⚡ High-Speed 5G Wi-Fi with Dedicated Hotspot</option>
                    <option value="power_backup">🔋 100% Inverter &amp; Generator Power Backup</option>
                    <option value="cctv">🛡️ 24x7 Security &amp; CCTV Surveillance</option>
                    <option value="ro_water">💧 RO Cold &amp; Purified Drinking Water</option>
                    <option value="parking">🚲 Reserved Two-Wheeler / Cycle Parking</option>
                    <option value="quiet_zone">🤫 Soundproof Pin-Drop Silence Zone</option>
                  </select>
                </div>

                {/* Shift Preference Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Preferred Study Shift</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'ALL', label: 'Any Shift' },
                      { id: 'MORNING', label: 'Morning (6AM-2PM)' },
                      { id: 'EVENING', label: 'Evening (2PM-10PM)' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setShiftPreference(s.id as any)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold transition-all text-center truncate cursor-pointer border ${
                          shiftPreference === s.id
                            ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-xs font-black'
                            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fast Locality Chips in Current District */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-brand-600" />
                  <span>Popular Localities in {districtName}:</span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onLocationChange({ ...locationSelection, localityId: undefined, localityName: undefined, areaId: undefined, areaName: undefined })}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      !locationSelection.localityId
                        ? 'bg-brand-600 text-white shadow-sm font-black'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                    }`}
                  >
                    Entire {districtName}
                  </button>
                  {availableLocalities.slice(0, 7).map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => onLocationChange({ ...locationSelection, localityId: loc.id, localityName: loc.name, areaId: undefined, areaName: undefined })}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        locationSelection.localityId === loc.id
                          ? 'bg-brand-600 text-white shadow-sm font-black'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                      }`}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Action Search Button */}
              <button 
                type="submit" 
                className="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-xl shadow-brand-500/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.005] active:scale-98 cursor-pointer group"
              >
                <Search className="w-5 h-5 text-white shrink-0 group-hover:scale-110 transition-transform" />
                <span>
                  {locationSelection.localityName 
                    ? `Explore Verified Libraries in ${locationSelection.localityName}, ${districtName}` 
                    : `Search All Verified Study Libraries in ${districtName}`}
                </span>
                <ArrowRight className="w-5 h-5 text-white shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: VERIFIED HOME TUTORS SEARCH FILTERS & SUBMIT                       */}
          {/* ========================================================================= */}
          {activeTab === 'tutors' && (
            <form onSubmit={handleTutorSearch} className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Class / Standard Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Class / Standard</span>
                  </label>
                  <select
                    value={tutorClass}
                    onChange={(e) => setTutorClass(e.target.value)}
                    className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-all cursor-pointer"
                  >
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                    <span>Subject / Stream</span>
                  </label>
                  <select
                    value={tutorSubject}
                    onChange={(e) => setTutorSubject(e.target.value)}
                    className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-all cursor-pointer"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Teaching Format Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Teaching Format</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ALL', label: 'All Formats' },
                    { id: 'IN_PERSON', label: 'In-Person Home Visit' },
                    { id: 'HYBRID', label: 'Library Desk / 1-on-1' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setTutoringMode(m.id as any)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold transition-all text-center truncate cursor-pointer border ${
                        tutoringMode === m.id
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs font-black'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fast Locality Chips in Current District */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Popular Localities in {districtName}:</span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onLocationChange({ ...locationSelection, localityId: undefined, localityName: undefined, areaId: undefined, areaName: undefined })}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      !locationSelection.localityId
                        ? 'bg-indigo-600 text-white shadow-sm font-black'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                    }`}
                  >
                    Entire {districtName}
                  </button>
                  {availableLocalities.slice(0, 7).map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => onLocationChange({ ...locationSelection, localityId: loc.id, localityName: loc.name, areaId: undefined, areaName: undefined })}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        locationSelection.localityId === loc.id
                          ? 'bg-indigo-600 text-white shadow-sm font-black'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                      }`}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Action Search Button */}
              <button 
                type="submit" 
                className="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-indigo-600 via-purple-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 text-white shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.005] active:scale-98 cursor-pointer group"
              >
                <Search className="w-5 h-5 text-white shrink-0 group-hover:scale-110 transition-transform" />
                <span>
                  {locationSelection.localityName 
                    ? `Match Verified Tutors in ${locationSelection.localityName}, ${districtName}` 
                    : `Search All Verified Tutors in ${districtName}`}
                </span>
                <ArrowRight className="w-5 h-5 text-white shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {/* Bottom Security & Safety Guarantee Capsule */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-700">
                100% Aadhaar &amp; University Degree Authenticated by District Admins
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500 flex-wrap justify-center sm:justify-end">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-brand-600" /> Zero Cold Calling
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Zero Brokerage
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Free 1-Time Demo Trial
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
