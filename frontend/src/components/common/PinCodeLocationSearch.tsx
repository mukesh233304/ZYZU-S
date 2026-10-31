import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  ChevronDown,
  Navigation,
  Sparkles
} from 'lucide-react';
import { LocationHierarchySelection, Locality, Area } from '../../types/location';
import { pinCodeService, PinCodeResolution } from '../../services/pinCodeService';
import { locationService } from '../../services/locationService';

export interface PinCodeLocationSearchProps {
  onLocationResolved: (selection: LocationHierarchySelection, resolution: PinCodeResolution) => void;
  onClear?: () => void;
  currentSelection?: LocationHierarchySelection;
  initialPinCode?: string;
  placeholder?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: 'compact' | 'hero';
}

export const PinCodeLocationSearch: React.FC<PinCodeLocationSearchProps> = ({
  onLocationResolved,
  onClear,
  currentSelection,
  initialPinCode = '',
  placeholder = 'Enter 6-digit PIN code',
  title = 'Search by PIN Code',
  subtitle = 'Instantly auto-detect State, District, Area, and Locality',
  className = '',
  variant = 'compact'
}) => {
  const [pinCode, setPinCode] = useState(initialPinCode);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resolution, setResolution] = useState<PinCodeResolution | null>(null);
  const [selectedLocalityId, setSelectedLocalityId] = useState<string | undefined>(undefined);
  const [selectedAreaId, setSelectedAreaId] = useState<string | undefined>(undefined);

  // Sync if initialPinCode changes
  useEffect(() => {
    if (initialPinCode && initialPinCode !== pinCode) {
      setPinCode(initialPinCode);
      handleLookup(initialPinCode);
    }
  }, [initialPinCode]);

  // When active locality changes, update selection
  const handleSelectLocality = (loc: Locality) => {
    setSelectedLocalityId(loc.id);
    const availableAreas = locationService.getAreas(loc.id);
    const defaultArea = availableAreas[0];
    setSelectedAreaId(defaultArea?.id);

    if (resolution) {
      const updatedResolution: PinCodeResolution = {
        ...resolution,
        localityId: loc.id,
        localityName: loc.name,
        areaId: defaultArea?.id,
        areaName: defaultArea?.name,
        availableAreas
      };
      setResolution(updatedResolution);
      onLocationResolved(pinCodeService.toLocationSelection(updatedResolution), updatedResolution);
    }
  };

  const handleSelectArea = (ar: Area) => {
    setSelectedAreaId(ar.id);
    if (resolution) {
      const updatedResolution: PinCodeResolution = {
        ...resolution,
        areaId: ar.id,
        areaName: ar.name
      };
      setResolution(updatedResolution);
      onLocationResolved(pinCodeService.toLocationSelection(updatedResolution), updatedResolution);
    }
  };

  const handleLookup = async (inputPin: string = pinCode) => {
    const cleaned = inputPin.trim().replace(/\D/g, '').slice(0, 6);
    setErrorMsg(null);

    if (!cleaned) {
      setErrorMsg('Please enter a 6-digit PIN code');
      return;
    }

    if (cleaned.length !== 6 || cleaned.startsWith('0')) {
      setErrorMsg('PIN code must be a valid 6-digit Indian Postal code');
      return;
    }

    setIsLoading(true);

    try {
      const res = await pinCodeService.resolvePinCode(cleaned);
      if (res.success) {
        setResolution(res);
        setSelectedLocalityId(res.localityId);
        setSelectedAreaId(res.areaId);
        onLocationResolved(pinCodeService.toLocationSelection(res), res);
      } else {
        setResolution(null);
        setErrorMsg(res.message || 'No location found for this PIN code');
      }
    } catch (e: any) {
      setResolution(null);
      setErrorMsg('Unable to resolve location. Please select manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPinCode('');
    setErrorMsg(null);
    setResolution(null);
    setSelectedLocalityId(undefined);
    setSelectedAreaId(undefined);
    if (onClear) onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookup();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header if hero variant */}
      {variant === 'hero' && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
              <Navigation className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              {title}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {subtitle}
          </p>
        </div>
      )}

      {/* Input Field with Find Button */}
      <div className="relative flex items-center">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <MapPin className="w-4 h-4 text-indigo-600" />
        </div>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={pinCode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
            setPinCode(val);
            if (errorMsg) setErrorMsg(null);
            // Auto lookup when user finishes typing 6 digits
            if (val.length === 6) {
              handleLookup(val);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-24 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 shadow-xs transition-all"
        />

        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {pinCode && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
              title="Clear PIN code"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => handleLookup()}
            disabled={isLoading || pinCode.length !== 6}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-xs transition-all flex items-center gap-1 shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Searching</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Find</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error / Validation Warning State */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Location Resolution Result Card */}
      {resolution && resolution.success && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-300/80 shadow-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-emerald-950">Location Detected</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-200/70 text-emerald-900">
                PIN: {resolution.pincode}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Change PIN
            </button>
          </div>

          {/* Formatted Breadcrumb */}
          <div className="text-xs font-black text-slate-900 leading-snug">
            <span>{resolution.stateName}</span>
            {resolution.districtName && (
              <>
                <span className="text-slate-400 font-normal mx-1.5">•</span>
                <span className="text-indigo-950">{resolution.districtName}</span>
              </>
            )}
            {resolution.localityName && (
              <>
                <span className="text-slate-400 font-normal mx-1.5">•</span>
                <span className="text-emerald-900">{resolution.localityName}</span>
              </>
            )}
            {resolution.areaName && (
              <>
                <span className="text-slate-400 font-normal mx-1.5">•</span>
                <span className="text-slate-700">{resolution.areaName}</span>
              </>
            )}
          </div>

          {/* Multiple Localities Selection (if available) */}
          {resolution.availableLocalities && resolution.availableLocalities.length > 1 && (
            <div className="pt-2 border-t border-emerald-200/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Select Specific Locality in this PIN:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {resolution.availableLocalities.map(loc => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleSelectLocality(loc)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedLocalityId === loc.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-emerald-100/60 border border-emerald-200'
                    }`}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Multiple Areas Selection (if available) */}
          {resolution.availableAreas && resolution.availableAreas.length > 1 && (
            <div className="pt-1.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Select Neighborhood / Area:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {resolution.availableAreas.map(ar => (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => handleSelectArea(ar)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      selectedAreaId === ar.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200'
                    }`}
                  >
                    {ar.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
