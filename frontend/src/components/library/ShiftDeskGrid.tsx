import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Armchair, Clock, CheckCircle2, AlertCircle, 
  Sunrise, Sun, Moon, Zap, Info, ShieldCheck, X 
} from 'lucide-react';
import { LibrarySeat, LibraryShift } from '../../types';

export interface ShiftDeskGridProps {
  seats: LibrarySeat[];
  shifts?: LibraryShift[];
  selectedSeatNumber?: string;
  onSeatSelect?: (seatNumber: string, shift: LibraryShift) => void;
  activeShiftId?: string;
  onShiftChange?: (shift: LibraryShift) => void;
  selectable?: boolean;
  showShiftTabs?: boolean;
  className?: string;
}

const DEFAULT_SHIFTS: LibraryShift[] = [
  { id: 'sh-1', name: 'Morning Shift', startTime: '06:00 AM', endTime: '11:00 AM', monthlyPrice: 499, price: 499, isActive: true },
  { id: 'sh-2', name: 'Afternoon Shift', startTime: '11:00 AM', endTime: '04:00 PM', monthlyPrice: 499, price: 499, isActive: true },
  { id: 'sh-3', name: 'Evening Shift', startTime: '04:00 PM', endTime: '09:00 PM', monthlyPrice: 499, price: 499, isActive: true },
  { id: 'sh-4', name: 'Full Day 15-Hr Pass', startTime: '06:00 AM', endTime: '09:00 PM', monthlyPrice: 999, price: 999, isActive: true },
];

export const ShiftDeskGrid: React.FC<ShiftDeskGridProps> = ({
  seats,
  shifts = DEFAULT_SHIFTS,
  selectedSeatNumber,
  onSeatSelect,
  activeShiftId,
  onShiftChange,
  selectable = false,
  showShiftTabs = true,
  className = '',
}) => {
  // Use passed shifts or default standardized 3 shifts + full day
  const effectiveShifts = useMemo(() => {
    return shifts && shifts.length > 0 ? shifts : DEFAULT_SHIFTS;
  }, [shifts]);

  const [internalShift, setInternalShift] = useState<LibraryShift>(effectiveShifts[0]);
  const currentShift = useMemo(() => {
    if (activeShiftId) {
      const match = effectiveShifts.find(s => s.id === activeShiftId || s.name.toLowerCase().includes(activeShiftId.toLowerCase()));
      if (match) return match;
    }
    return internalShift;
  }, [activeShiftId, effectiveShifts, internalShift]);

  // Hovered Seat for popover tooltip with smooth non-flicker debouncing
  const [hoveredSeat, setHoveredSeat] = useState<LibrarySeat | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number; placeBelow: boolean } | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleSeatMouseEnter = (seat: LibrarySeat, el: HTMLElement) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    const rect = el.getBoundingClientRect();
    const popoverWidth = 288; // w-72 = 18rem = 288px
    const estimatedHeight = 250;

    // Check if there is enough space above the seat (at least estimatedHeight + 16px)
    const placeBelow = rect.top < (estimatedHeight + 20);

    // Center horizontally relative to seat, clamped inside viewport margins
    const seatCenterX = rect.left + rect.width / 2;
    const clampedX = Math.min(
      Math.max(12, seatCenterX - popoverWidth / 2),
      window.innerWidth - popoverWidth - 12
    );

    // Precise vertical coordinate ensuring zero overlap with the seat or mouse:
    // If placing below: top is rect.bottom + 10px
    // If placing above: bottom is rect.top - 10px
    const y = placeBelow ? (rect.bottom + 10) : (rect.top - 10);

    setPopoverPos({ x: clampedX, y, placeBelow });
    setHoveredSeat(seat);
  };

  const handleSeatMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Small 120ms buffer prevents flickering when cursor crosses between gap-2 seat cells
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSeat(null);
      setPopoverPos(null);
    }, 120);
  };

  const handleShiftSelect = (s: LibraryShift) => {
    setInternalShift(s);
    if (onShiftChange) {
      onShiftChange(s);
    }
  };

  const getShiftIcon = (shiftName: string) => {
    const norm = shiftName.toLowerCase();
    if (norm.includes('morning')) return <Sunrise className="w-4 h-4 text-amber-500" />;
    if (norm.includes('afternoon')) return <Sun className="w-4 h-4 text-amber-600" />;
    if (norm.includes('evening')) return <Moon className="w-4 h-4 text-indigo-500" />;
    return <Zap className="w-4 h-4 text-emerald-600" />;
  };

  // Helper to determine status of a seat for the selected shift
  const getSeatStatusForShift = (seat: LibrarySeat, shift: LibraryShift): 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' => {
    const rawStatus = (seat.status || '').toUpperCase();
    if (rawStatus === 'MAINTENANCE') return 'MAINTENANCE';

    const occ = seat.shiftOccupancy;
    if (!occ) {
      return rawStatus === 'OCCUPIED' || rawStatus === 'RESERVED' ? 'OCCUPIED' : 'AVAILABLE';
    }

    if (occ.isFullDay) {
      return 'OCCUPIED';
    }

    const norm = shift.name.toLowerCase();
    if (norm.includes('morning')) {
      return occ.morning?.isBooked ? 'OCCUPIED' : 'AVAILABLE';
    }
    if (norm.includes('afternoon')) {
      return occ.afternoon?.isBooked ? 'OCCUPIED' : 'AVAILABLE';
    }
    if (norm.includes('evening')) {
      return occ.evening?.isBooked ? 'OCCUPIED' : 'AVAILABLE';
    }
    if (norm.includes('full')) {
      // If ANY shift is booked, full day cannot be allocated
      const isAnyBooked = Boolean(occ.morning?.isBooked || occ.afternoon?.isBooked || occ.evening?.isBooked);
      return isAnyBooked ? 'OCCUPIED' : 'AVAILABLE';
    }

    return rawStatus === 'OCCUPIED' || rawStatus === 'RESERVED' ? 'OCCUPIED' : 'AVAILABLE';
  };

  // Build hover popover details
  const getSeatDetails = (seat: LibrarySeat) => {
    const occ = seat.shiftOccupancy;
    const isMorningBooked = Boolean(occ?.morning?.isBooked || occ?.isFullDay);
    const isAfternoonBooked = Boolean(occ?.afternoon?.isBooked || occ?.isFullDay);
    const isEveningBooked = Boolean(occ?.evening?.isBooked || occ?.isFullDay);
    const isFullDay = Boolean(occ?.isFullDay);

    let bannerMessage = '';
    let bannerType: 'info' | 'warning' | 'success' = 'info';

    if (seat.status === 'MAINTENANCE') {
      bannerMessage = 'Desk is under scheduled maintenance.';
      bannerType = 'warning';
    } else if (isFullDay) {
      bannerMessage = 'This seat is booked for Full Day (15 hrs).';
      bannerType = 'warning';
    } else if (isMorningBooked && !isAfternoonBooked && !isEveningBooked) {
      bannerMessage = 'This seat is booked for the Morning Shift. (Vacant for Afternoon & Evening Shifts)';
      bannerType = 'warning';
    } else if (!isMorningBooked && isAfternoonBooked && !isEveningBooked) {
      bannerMessage = 'This seat is booked for the Afternoon Shift. (Vacant for Morning & Evening Shifts)';
      bannerType = 'warning';
    } else if (!isMorningBooked && !isAfternoonBooked && isEveningBooked) {
      bannerMessage = 'This seat is booked for the Evening Shift. (Vacant for Morning & Afternoon Shifts)';
      bannerType = 'warning';
    } else if (isMorningBooked && isAfternoonBooked && !isEveningBooked) {
      bannerMessage = 'Booked for Morning & Afternoon Shifts. (Vacant for Evening Shift)';
      bannerType = 'warning';
    } else if (isMorningBooked && !isAfternoonBooked && isEveningBooked) {
      bannerMessage = 'Booked for Morning & Evening Shifts. (Vacant for Afternoon Shift)';
      bannerType = 'warning';
    } else if (!isMorningBooked && isAfternoonBooked && isEveningBooked) {
      bannerMessage = 'Booked for Afternoon & Evening Shifts. (Vacant for Morning Shift)';
      bannerType = 'warning';
    } else if (isMorningBooked && isAfternoonBooked && isEveningBooked) {
      bannerMessage = 'Booked across all 3 individual shifts.';
      bannerType = 'warning';
    } else {
      bannerMessage = 'Vacant for all shifts (Morning ₹499, Afternoon ₹499, Evening ₹499, or Full Day ₹999).';
      bannerType = 'success';
    }

    const currentShiftStatus = getSeatStatusForShift(seat, currentShift);

    return {
      seatNumber: seat.seatNumber,
      currentShiftStatus,
      isMorningBooked,
      isAfternoonBooked,
      isEveningBooked,
      isFullDay,
      morningStudent: occ?.morning?.studentName,
      afternoonStudent: occ?.afternoon?.studentName,
      eveningStudent: occ?.evening?.studentName,
      bannerMessage,
      bannerType,
    };
  };

  // Counts for current shift
  const { availableCount, occupiedCount, maintenanceCount } = useMemo(() => {
    let avail = 0;
    let occ = 0;
    let maint = 0;

    seats.forEach(s => {
      const st = getSeatStatusForShift(s, currentShift);
      if (st === 'MAINTENANCE') maint++;
      else if (st === 'OCCUPIED') occ++;
      else avail++;
    });

    return { availableCount: avail, occupiedCount: occ, maintenanceCount: maint };
  }, [seats, currentShift]);

  return (
    <div className={`space-y-5 relative ${className}`}>
      {/* 1. Shift Selector Bar */}
      {showShiftTabs && (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Live Desk Availability by Shift
              </span>
              <p className="text-xs text-slate-700 font-bold">
                Select a shift to view or book real-time vacant desks:
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-extrabold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{availableCount} Desks Available in {currentShift.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {effectiveShifts.map((shift) => {
              const isSelected = currentShift.id === shift.id || currentShift.name === shift.name;
              const isFullDay = shift.name.toLowerCase().includes('full');
              const shiftFee = shift.monthlyPrice || shift.price || (isFullDay ? 999 : 499);

              return (
                <button
                  key={shift.id || shift.name}
                  type="button"
                  onClick={() => handleShiftSelect(shift)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-brand-50/80 border-brand-600 ring-2 ring-brand-500/25 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      {getShiftIcon(shift.name)}
                      <span className="font-extrabold text-xs text-slate-900 leading-tight">
                        {shift.name.replace(' Shift', '')}
                      </span>
                    </div>
                    <span className="text-xs font-black text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded-md border border-brand-200">
                      ₹{shiftFee}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{shift.startTime} – {shift.endTime}</span>
                  </p>
                  <span className="text-[10px] text-slate-600 font-bold block mt-0.5">
                    {isFullDay ? '⚡ 15 Hours Access' : '⏱️ 5 Hours / Shift'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Visual Desk Grid Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
        {/* Header Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <Armchair className="w-4 h-4 text-brand-600" />
            <span className="font-extrabold text-slate-900">
              Floor Plan: <span className="text-brand-700">{currentShift.name}</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              (₹{currentShift.monthlyPrice || (currentShift.name.includes('Full') ? 999 : 499)}/mo)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" /> Available ({availableCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500" /> Occupied ({occupiedCount})
            </span>
            {selectable && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-brand-600 ring-2 ring-brand-300" /> Selected
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-300 border border-slate-400" /> Maintenance ({maintenanceCount})
            </span>
          </div>
        </div>

        {/* Entrance Marker */}
        <div className="py-1.5 px-3 rounded-lg bg-white border border-dashed border-slate-300 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          🚪 Main Reading Hall Entrance & Reception
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-96 overflow-y-auto p-1">
          {seats.map((seat) => {
            const shiftStatus = getSeatStatusForShift(seat, currentShift);
            const isAvailable = shiftStatus === 'AVAILABLE';
            const isMaintenance = shiftStatus === 'MAINTENANCE';
            const isSelected = selectedSeatNumber === seat.seatNumber;

            let buttonStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-sm';
            if (isSelected) {
              buttonStyle = 'bg-brand-600 border-brand-700 text-white font-black shadow-lg shadow-brand-500/30 ring-2 ring-brand-400';
            } else if (isMaintenance) {
              buttonStyle = 'bg-slate-200 border-slate-300 text-slate-500 cursor-not-allowed opacity-60';
            } else if (!isAvailable) {
              buttonStyle = 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100/80 hover:border-rose-300 hover:shadow-sm cursor-pointer';
            }

            return (
              <div
                key={seat.id || seat.seatNumber}
                className="relative"
                onMouseEnter={(e) => handleSeatMouseEnter(seat, e.currentTarget)}
                onMouseLeave={handleSeatMouseLeave}
              >
                <button
                  type="button"
                  disabled={selectable ? !isAvailable : false}
                  onClick={() => {
                    if (selectable && isAvailable && onSeatSelect) {
                      onSeatSelect(seat.seatNumber, currentShift);
                    }
                  }}
                  className={`w-full p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 shadow-xs cursor-pointer select-none ${buttonStyle}`}
                >
                  <Armchair className={`w-4 h-4 ${isSelected ? 'text-white' : isAvailable ? 'text-emerald-600' : isMaintenance ? 'text-slate-400' : 'text-rose-600'}`} />
                  <span className="font-mono text-[11px] font-bold block leading-none">
                    {seat.seatNumber.replace('Seat ', '')}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-tight block truncate w-full ${isSelected ? 'text-brand-100' : isAvailable ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {isSelected ? '✓ Picked' : isAvailable ? 'Vacant' : isMaintenance ? 'Repair' : 'Booked'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Hover or tap any desk to view shift booking breakdown</span>
          </span>
          <span className="text-emerald-700 font-bold">
            {currentShift.name}: ₹{currentShift.monthlyPrice || (currentShift.name.includes('Full') ? 999 : 499)}/mo
          </span>
        </div>
      </div>

      {/* 3. Floating Interactive Hover Popover */}
      {hoveredSeat && popoverPos && (
        <div 
          className="fixed z-50 pointer-events-none select-none transition-[left,top,bottom] duration-75 ease-out"
          style={{
            left: popoverPos.x,
            top: popoverPos.placeBelow ? popoverPos.y : undefined,
            bottom: !popoverPos.placeBelow ? (window.innerHeight - popoverPos.y) : undefined,
          }}
        >
          {(() => {
            const details = getSeatDetails(hoveredSeat);
            return (
              <div className="w-72 bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 space-y-3 pointer-events-none select-none text-xs">
                {/* Popover Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                      <Armchair className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white">{hoveredSeat.seatNumber}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">FocusPoint Study Infrastructure</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    details.currentShiftStatus === 'AVAILABLE' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {details.currentShiftStatus === 'AVAILABLE' ? 'Vacant Now' : 'Occupied'}
                  </span>
                </div>

                {/* 3-Shift Breakdown Matrix */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Daily Shift Schedule Status:
                  </span>
                  
                  {/* Shift 1: Morning */}
                  <div className={`p-2 rounded-lg border flex items-center justify-between ${
                    details.isMorningBooked ? 'bg-rose-950/40 border-rose-800/60 text-rose-300' : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <Sunrise className="w-3.5 h-3.5" />
                      <span className="font-bold text-[11px]">Morning (6 AM – 11 AM)</span>
                    </div>
                    <span className="font-mono text-[10px] font-extrabold">
                      {details.isMorningBooked ? (details.morningStudent ? `Booked (${details.morningStudent.split(' ')[0]})` : 'Booked') : 'Vacant (₹499)'}
                    </span>
                  </div>

                  {/* Shift 2: Afternoon */}
                  <div className={`p-2 rounded-lg border flex items-center justify-between ${
                    details.isAfternoonBooked ? 'bg-rose-950/40 border-rose-800/60 text-rose-300' : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5" />
                      <span className="font-bold text-[11px]">Afternoon (11 AM – 4 PM)</span>
                    </div>
                    <span className="font-mono text-[10px] font-extrabold">
                      {details.isAfternoonBooked ? (details.afternoonStudent ? `Booked (${details.afternoonStudent.split(' ')[0]})` : 'Booked') : 'Vacant (₹499)'}
                    </span>
                  </div>

                  {/* Shift 3: Evening */}
                  <div className={`p-2 rounded-lg border flex items-center justify-between ${
                    details.isEveningBooked ? 'bg-rose-950/40 border-rose-800/60 text-rose-300' : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5" />
                      <span className="font-bold text-[11px]">Evening (4 PM – 9 PM)</span>
                    </div>
                    <span className="font-mono text-[10px] font-extrabold">
                      {details.isEveningBooked ? (details.eveningStudent ? `Booked (${details.eveningStudent.split(' ')[0]})` : 'Booked') : 'Vacant (₹499)'}
                    </span>
                  </div>
                </div>

                {/* Explanatory Banner Note */}
                <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed font-bold border ${
                  details.bannerType === 'warning'
                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                }`}>
                  <p>{details.bannerMessage}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
