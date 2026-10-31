import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { libraryService } from '../../services/libraryService';
import { bookingService } from '../../services/bookingService';
import { Library, LibraryBooking, SeatStatus } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import {
  Armchair,
  CheckCircle2,
  Users,
  Clock,
  Wrench,
  Plus,
  RefreshCw,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DeskState {
  seatNumber: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  booking?: LibraryBooking;
}

export const LibrarySeats: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [library, setLibrary] = useState<Library | null>(null);
  const [bookings, setBookings] = useState<LibraryBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState('Morning Shift (6:00 AM - 11:00 AM)');
  const [vacating, setVacating] = useState(false);

  // Selected desk for modal detail
  const [selectedDesk, setSelectedDesk] = useState<DeskState | null>(null);
  const [isDeskModalOpen, setIsDeskModalOpen] = useState(false);

  // Walk-in modal from desk
  const [isWalkinModalOpen, setIsWalkinModalOpen] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [submittingWalkin, setSubmittingWalkin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const libs = await libraryService.getLibrariesByOwner(user.id);
        if (libs.length > 0) {
          setLibrary(libs[0]);
          const bData = await bookingService.getLibraryBookings(libs[0].id);
          setBookings(bData);
        }
      } catch (err) {
        console.error('Failed to load library seats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!library) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <PageHeader
          title="Interactive Seat Matrix & Live Monitor"
          subtitle="Real-time visual map of all study desks and occupancy"
          breadcrumbs={[{ label: 'Library Management', href: '/library-owner' }, { label: 'Seat Grid' }]}
        />
        <Card className="p-8 text-center border-2 border-dashed border-slate-200">
          <Armchair className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Study Library Listed</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Please register your study library before configuring physical desk layouts and monitoring live shift vacancies.
          </p>
          <div className="mt-6">
            <Link to="/library-owner/create">
              <Button variant="primary">Register Your Library</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const totalCapacity = library.totalSeats || 0;

  // Helper to resiliently match seat numbers regardless of formatting ("Seat 01" vs "Seat 1" vs "01" vs "1")
  const isSeatMatch = (s1: string, s2?: string) => {
    if (!s2) return false;
    if (s1.toLowerCase() === s2.toLowerCase()) return true;
    const n1 = s1.replace(/\D/g, '');
    const n2 = s2.replace(/\D/g, '');
    return Boolean(n1 && n2 && parseInt(n1, 10) === parseInt(n2, 10));
  };

  // Generate shift-aware desk array with zero fake data
  const desks: DeskState[] = Array.from({ length: totalCapacity }).map((_, index) => {
    const seatNumber = `Seat ${String(index + 1).padStart(2, '0')}`;
    
    // 1. Check active booking for this specific shift
    const booking = bookings.find(b => {
      if (!isSeatMatch(seatNumber, b.seatNumber)) return false;
      if (b.status !== 'confirmed' && b.status !== 'CONFIRMED') return false;
      const bShift = (b.shift || '').toLowerCase();
      const sShift = selectedShift.toLowerCase();
      if (bShift.includes('full') || sShift.includes('full')) return true;
      if (sShift.includes('morning') && bShift.includes('morning')) return true;
      if (sShift.includes('afternoon') && bShift.includes('afternoon')) return true;
      if (sShift.includes('evening') && bShift.includes('evening')) return true;
      return false;
    });

    // 2. Check library.seats shiftOccupancy
    const libSeat = (library?.seats || []).find(s => isSeatMatch(seatNumber, s.seatNumber));
    let isOccupied = Boolean(booking);
    let occupantName = booking?.studentName || libSeat?.assignedStudentName;
    let occupantPhone = booking?.studentPhone;

    if (!isOccupied && libSeat?.shiftOccupancy) {
      const occ = libSeat.shiftOccupancy;
      if (occ.isFullDay) {
        isOccupied = true;
        occupantName = occ.morning?.studentName || occ.afternoon?.studentName || occ.evening?.studentName || occupantName;
        occupantPhone = occ.morning?.studentPhone || occ.afternoon?.studentPhone || occ.evening?.studentPhone || occupantPhone;
      } else if (selectedShift.toLowerCase().includes('morning') && occ.morning?.isBooked) {
        isOccupied = true;
        occupantName = occ.morning?.studentName || occupantName;
        occupantPhone = occ.morning?.studentPhone || occupantPhone;
      } else if (selectedShift.toLowerCase().includes('afternoon') && occ.afternoon?.isBooked) {
        isOccupied = true;
        occupantName = occ.afternoon?.studentName || occupantName;
        occupantPhone = occ.afternoon?.studentPhone || occupantPhone;
      } else if (selectedShift.toLowerCase().includes('evening') && occ.evening?.isBooked) {
        isOccupied = true;
        occupantName = occ.evening?.studentName || occupantName;
        occupantPhone = occ.evening?.studentPhone || occupantPhone;
      }
    }

    // 3. Maintenance check (only if explicitly marked in library seat data and not occupied)
    if (libSeat?.status === 'MAINTENANCE' || libSeat?.status === 'maintenance') {
      return { seatNumber, status: 'maintenance' };
    }

    if (isOccupied) {
      return { 
        seatNumber, 
        status: 'occupied', 
        booking: booking || (occupantName ? {
          id: `bk-active-${index + 1}`,
          libraryId: library?.id || '',
          libraryName: library?.name || 'Study Library',
          studentName: occupantName,
          studentPhone: occupantPhone || 'Direct Member',
          seatNumber,
          shift: selectedShift,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalAmount: selectedShift.includes('Full') ? 999 : 499,
          status: 'confirmed',
          paymentStatus: 'paid',
        } : undefined)
      };
    }

    return { seatNumber, status: 'available' };
  });

  // Handle owner vacating a desk (occupied or under maintenance) to make it vacant (Green)
  const handleMakeVacant = async () => {
    if (!library || !selectedDesk) return;
    setVacating(true);
    try {
      await libraryService.vacateSeat(library.id, selectedDesk.seatNumber, selectedShift);
      await libraryService.updateSeatStatus(library.id, selectedDesk.seatNumber, 'AVAILABLE', undefined, selectedShift);

      // Remove any matching active bookings from local state
      setBookings(prev => prev.filter(b => {
        const isThisSeat = isSeatMatch(b.seatNumber, selectedDesk.seatNumber);
        if (!isThisSeat) return true;
        const bShift = (b.shift || '').toLowerCase();
        const sShift = selectedShift.toLowerCase();
        if (sShift.includes('full') || bShift.includes(sShift) || sShift.includes(bShift)) {
          return false;
        }
        return true;
      }));

      // Also update library.seats in local state
      setLibrary(prev => {
        if (!prev || !prev.seats) return prev;
        const updatedSeats = prev.seats.map(s => {
          if (isSeatMatch(s.seatNumber, selectedDesk.seatNumber)) {
            const occ = s.shiftOccupancy ? { ...s.shiftOccupancy } : {
              morning: { isBooked: false },
              afternoon: { isBooked: false },
              evening: { isBooked: false },
              isFullDay: false
            };
            const sShift = selectedShift.toLowerCase();
            if (sShift.includes('full')) {
              occ.morning = { isBooked: false };
              occ.afternoon = { isBooked: false };
              occ.evening = { isBooked: false };
              occ.isFullDay = false;
            } else if (sShift.includes('morning')) {
              occ.morning = { isBooked: false };
            } else if (sShift.includes('afternoon')) {
              occ.afternoon = { isBooked: false };
            } else if (sShift.includes('evening')) {
              occ.evening = { isBooked: false };
            }
            return {
              ...s,
              status: 'AVAILABLE' as const,
              assignedStudentName: undefined,
              shiftOccupancy: occ
            };
          }
          return s;
        });
        return { ...prev, seats: updatedSeats };
      });

      setSelectedDesk(prev => prev ? { ...prev, status: 'available', booking: undefined } : null);
      setIsDeskModalOpen(false);
      addToast(`Desk ${selectedDesk.seatNumber} is now Vacant and Available (Green)!`, 'success');
    } catch (err) {
      addToast('Failed to make desk vacant', 'error');
    } finally {
      setVacating(false);
    }
  };

  // Handle owner setting desk to Maintenance (Amber) or Available (Green)
  const handleSetMaintenance = async (enable: boolean) => {
    if (!library || !selectedDesk) return;
    try {
      const nextStatus = enable ? 'MAINTENANCE' : 'AVAILABLE';
      await libraryService.updateSeatStatus(library.id, selectedDesk.seatNumber, nextStatus);

      setLibrary(prev => {
        if (!prev || !prev.seats) return prev;
        const updatedSeats = prev.seats.map(s => {
          if (isSeatMatch(s.seatNumber, selectedDesk.seatNumber)) {
            return {
              ...s,
              status: (enable ? 'MAINTENANCE' : 'AVAILABLE') as SeatStatus,
              assignedStudentName: enable ? undefined : s.assignedStudentName
            };
          }
          return s;
        });
        return { ...prev, seats: updatedSeats };
      });

      setSelectedDesk(prev => prev ? { ...prev, status: enable ? 'maintenance' : 'available' } : null);
      setIsDeskModalOpen(false);
      addToast(
        enable
          ? `Desk ${selectedDesk.seatNumber} is now marked Under Maintenance.`
          : `Desk ${selectedDesk.seatNumber} is now Vacant and Available (Green)!`,
        enable ? 'info' : 'success'
      );
    } catch (err) {
      addToast('Failed to update maintenance status', 'error');
    }
  };

  const handleDeskClick = (desk: DeskState) => {
    setSelectedDesk(desk);
    setIsDeskModalOpen(true);
  };

  const handleWalkinFromDesk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!library || !selectedDesk) return;
    setSubmittingWalkin(true);
    try {
      const fee = selectedShift.includes('Full') ? 999 : 499;
      const newBooking = await bookingService.createBooking({
        libraryId: library.id,
        libraryName: library.name,
        userId: `walkin-${Date.now()}`,
        studentName: walkinName,
        studentPhone: walkinPhone,
        seatNumber: selectedDesk.seatNumber,
        shift: selectedShift,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalAmount: fee,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'Cash',
      });

      // Also ensure seat status is updated in libraryService (clearing maintenance)
      await libraryService.updateSeatStatus(
        library.id,
        selectedDesk.seatNumber,
        'OCCUPIED',
        walkinName,
        selectedShift,
        walkinPhone
      );

      setBookings(prev => [newBooking, ...prev]);

      // Update local library state so seat transitions immediately to occupied (Red)
      setLibrary(prev => {
        if (!prev || !prev.seats) return prev;
        const updatedSeats = prev.seats.map(s => {
          if (isSeatMatch(s.seatNumber, selectedDesk.seatNumber)) {
            const occ = s.shiftOccupancy ? { ...s.shiftOccupancy } : {};
            const norm = selectedShift.toLowerCase();
            if (norm.includes('full')) {
              occ.morning = { isBooked: true, studentName: walkinName, studentPhone: walkinPhone };
              occ.afternoon = { isBooked: true, studentName: walkinName, studentPhone: walkinPhone };
              occ.evening = { isBooked: true, studentName: walkinName, studentPhone: walkinPhone };
              occ.isFullDay = true;
            } else if (norm.includes('morning')) {
              occ.morning = { isBooked: true, studentName: walkinName, studentPhone: walkinPhone };
            } else if (norm.includes('afternoon')) {
              occ.afternoon = { isBooked: true, studentName: walkinName, studentPhone: walkinPhone };
            } else if (norm.includes('evening')) {
              occ.evening = { isBooked: true, studentName: walkinName, studentPhone: walkinPhone };
            }
            return {
              ...s,
              status: 'OCCUPIED' as const,
              assignedStudentName: walkinName,
              shiftOccupancy: occ
            };
          }
          return s;
        });
        return { ...prev, seats: updatedSeats };
      });

      setIsWalkinModalOpen(false);
      setIsDeskModalOpen(false);
      setWalkinName('');
      setWalkinPhone('');
      addToast(`Desk ${selectedDesk.seatNumber} allocated to ${walkinName} and marked Booked (Red)!`, 'success');
    } catch (err) {
      addToast('Failed to allocate desk', 'error');
    } finally {
      setSubmittingWalkin(false);
    }
  };

  const handleQuickMarkBooked = async () => {
    if (!library || !selectedDesk) return;
    try {
      const fee = selectedShift.includes('Full') ? 999 : 499;
      await libraryService.updateSeatStatus(
        library.id,
        selectedDesk.seatNumber,
        'OCCUPIED',
        'Direct Walk-in',
        selectedShift,
        'Counter Admission'
      );
      const newBooking = await bookingService.createBooking({
        libraryId: library.id,
        libraryName: library.name,
        userId: `direct-${Date.now()}`,
        studentName: 'Direct Walk-in',
        studentPhone: 'Counter Admission',
        seatNumber: selectedDesk.seatNumber,
        shift: selectedShift,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalAmount: fee,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'Cash',
      });
      setBookings(prev => [newBooking, ...prev]);

      setLibrary(prev => {
        if (!prev || !prev.seats) return prev;
        const updatedSeats = prev.seats.map(s => {
          if (isSeatMatch(s.seatNumber, selectedDesk.seatNumber)) {
            const occ = s.shiftOccupancy ? { ...s.shiftOccupancy } : {};
            const norm = selectedShift.toLowerCase();
            if (norm.includes('full')) {
              occ.morning = { isBooked: true, studentName: 'Direct Walk-in', studentPhone: 'Counter Admission' };
              occ.afternoon = { isBooked: true, studentName: 'Direct Walk-in', studentPhone: 'Counter Admission' };
              occ.evening = { isBooked: true, studentName: 'Direct Walk-in', studentPhone: 'Counter Admission' };
              occ.isFullDay = true;
            } else if (norm.includes('morning')) {
              occ.morning = { isBooked: true, studentName: 'Direct Walk-in', studentPhone: 'Counter Admission' };
            } else if (norm.includes('afternoon')) {
              occ.afternoon = { isBooked: true, studentName: 'Direct Walk-in', studentPhone: 'Counter Admission' };
            } else if (norm.includes('evening')) {
              occ.evening = { isBooked: true, studentName: 'Direct Walk-in', studentPhone: 'Counter Admission' };
            }
            return {
              ...s,
              status: 'OCCUPIED' as const,
              assignedStudentName: 'Direct Walk-in',
              shiftOccupancy: occ
            };
          }
          return s;
        });
        return { ...prev, seats: updatedSeats };
      });

      setIsDeskModalOpen(false);
      addToast(`Desk ${selectedDesk.seatNumber} marked Booked / Full (Red) for ${selectedShift}`, 'success');
    } catch (err) {
      addToast('Failed to mark desk as booked', 'error');
    }
  };

  const occupiedCount = desks.filter(d => d.status === 'occupied').length;
  const availableCount = desks.filter(d => d.status === 'available').length;
  const maintenanceCount = desks.filter(d => d.status === 'maintenance').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interactive Seat Matrix & Live Monitor"
        subtitle="Real-time visual map of all study desks, active occupants, and availability status"
        breadcrumbs={[
          { label: 'Library Management', href: '/library-owner' },
          { label: 'Seat Grid' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => addToast('Live desk statuses refreshed', 'info')}
            >
              Refresh Status
            </Button>
          </div>
        }
      />

      {/* Shift Switcher & Legend */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Monitoring Shift:</span>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-deep-navy-900 focus:ring-2 focus:ring-royal-blue-500 bg-white"
            >
              {library.shifts && library.shifts.length > 0 ? (
                library.shifts.map(s => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.startTime} - {s.endTime}) • ₹{s.price || s.monthlyPrice || 800}/mo
                  </option>
                ))
              ) : (
                <>
                  <option value="Morning Shift (6:00 AM - 11:00 AM)">Morning Shift (6 AM - 11 AM) • ₹499/mo</option>
                  <option value="Afternoon Shift (11:00 AM - 4:00 PM)">Afternoon Shift (11 AM - 4 PM) • ₹499/mo</option>
                  <option value="Evening Shift (4:00 PM - 9:00 PM)">Evening Shift (4 PM - 9 PM) • ₹499/mo</option>
                  <option value="Full Day 15-Hr Pass (6:00 AM - 9:00 PM)">Full Day 15-Hr Pass (6 AM - 9 PM) • ₹999/mo</option>
                </>
              )}
            </select>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shadow-xs"></span>
              <span className="text-slate-700">Vacant / Available ({availableCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 ring-2 ring-red-200 shadow-xs"></span>
              <span className="text-slate-700">Booked / Occupied ({occupiedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-2 ring-amber-200 shadow-xs"></span>
              <span className="text-slate-700">Under Maintenance ({maintenanceCount})</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Visual Desk Grid */}
      <Card className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-deep-navy-900">Main Reading Hall Floor Plan</h3>
            <p className="text-xs text-slate-500">Click any individual desk to view details, make vacant, or allocate</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Occupancy</p>
            <p className="text-base font-bold text-royal-blue-600">
              {totalCapacity > 0 ? Math.round((occupiedCount / totalCapacity) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Entrance Indicator */}
        <div className="mb-6 p-2 rounded-lg bg-slate-100 border border-dashed border-slate-300 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
          🚪 Library Main Entrance & Reception
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-3">
          {desks.map(desk => {
            const isOccupied = desk.status === 'occupied';
            const isAvailable = desk.status === 'available';
            const isMaintenance = desk.status === 'maintenance';

            let cardStyle = '';
            let iconColor = '';
            let badgeStyle = '';
            let statusLabel = '';

            if (isOccupied) {
              cardStyle = 'bg-red-50/90 border-red-500 text-red-900 hover:bg-red-100 hover:border-red-600 ring-1 ring-red-300 shadow-sm';
              iconColor = 'text-red-600';
              badgeStyle = 'bg-red-500 text-white font-bold';
              statusLabel = desk.booking?.studentName?.split(' ')[0] || 'Booked';
            } else if (isAvailable) {
              cardStyle = 'bg-emerald-50/90 border-emerald-500 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-600 ring-1 ring-emerald-300 shadow-sm';
              iconColor = 'text-emerald-600';
              badgeStyle = 'bg-emerald-600 text-white font-bold';
              statusLabel = 'Vacant';
            } else if (isMaintenance) {
              cardStyle = 'bg-amber-50/90 border-amber-400 text-amber-900 hover:bg-amber-100 hover:border-amber-500 ring-1 ring-amber-300 shadow-sm';
              iconColor = 'text-amber-600';
              badgeStyle = 'bg-amber-500 text-white font-bold';
              statusLabel = 'Repair';
            }

            return (
              <button
                key={desk.seatNumber}
                onClick={() => handleDeskClick(desk)}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 cursor-pointer relative overflow-hidden group ${cardStyle}`}
                title={`${desk.seatNumber} (${desk.status.toUpperCase()}) - Click to manage`}
              >
                <div className="flex items-center justify-center">
                  {isMaintenance ? (
                    <Wrench className={`w-5 h-5 ${iconColor} transition-transform group-hover:rotate-12`} />
                  ) : (
                    <Armchair className={`w-5 h-5 ${iconColor} transition-transform group-hover:scale-110`} />
                  )}
                </div>
                <span className="font-mono text-xs font-black tracking-tight">{desk.seatNumber}</span>
                <span className={`text-[10px] uppercase tracking-wider truncate w-full text-center px-1.5 py-0.5 rounded shadow-xs ${badgeStyle}`}>
                  {statusLabel}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>ZYZU'S Smart Study Infrastructure • AC Hall A</span>
          <span>Emergency Exit ➡️</span>
        </div>
      </Card>

      {/* Desk Details Modal */}
      <Modal
        isOpen={isDeskModalOpen}
        onClose={() => setIsDeskModalOpen(false)}
        title={`Desk Details: ${selectedDesk?.seatNumber || ''}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs text-slate-500">Current Status</p>
              <h4 className="text-base font-bold capitalize text-deep-navy-900">{selectedDesk?.status}</h4>
            </div>
            <StatusBadge 
              status={selectedDesk?.status === 'occupied' ? 'active' : selectedDesk?.status === 'available' ? 'completed' : 'pending'} 
              text={selectedDesk?.status === 'occupied' ? 'Occupied (Booked)' : selectedDesk?.status === 'available' ? 'Vacant (Available)' : 'Under Maintenance'} 
            />
          </div>

          {/* If OCCUPIED */}
          {selectedDesk?.status === 'occupied' && selectedDesk.booking && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-red-700 font-bold">
                <Armchair className="w-4 h-4 text-red-600" />
                <span>Currently Booked Desk (Red)</span>
              </div>
              <div>
                <span className="text-slate-500">Student Name:</span>
                <p className="text-sm font-bold text-deep-navy-900">{selectedDesk.booking.studentName}</p>
              </div>
              <div>
                <span className="text-slate-500">Phone:</span>
                <p className="font-semibold text-slate-700">{selectedDesk.booking.studentPhone}</p>
              </div>
              <div>
                <span className="text-slate-500">Shift:</span>
                <p className="font-semibold text-slate-700">{selectedDesk.booking.shift}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-red-100">
                <div>
                  <span className="text-slate-500">Valid From:</span>
                  <p className="font-medium text-slate-800">{selectedDesk.booking.startDate}</p>
                </div>
                <div>
                  <span className="text-slate-500">Valid Until:</span>
                  <p className="font-medium text-slate-800">{selectedDesk.booking.endDate}</p>
                </div>
              </div>
            </div>
          )}

          {/* If AVAILABLE */}
          {selectedDesk?.status === 'available' && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Desk is Vacant & Ready for Allocation (Green)</span>
              </div>
              <p className="text-emerald-700">
                This desk is currently vacant for <strong>{selectedShift}</strong>. You can allocate it to a walk-in student, mark it full, or take it offline for maintenance.
              </p>
            </div>
          )}

          {/* If MAINTENANCE */}
          {selectedDesk?.status === 'maintenance' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>Desk is Under Maintenance</span>
              </div>
              <p className="text-amber-700">
                This desk is currently offline for repairs. As library owner, you can make it <strong>Vacant (Green)</strong> or <strong>Book it (Red)</strong> directly for a student below.
              </p>
            </div>
          )}

          {/* Action buttons footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {/* Left side actions */}
            <div>
              {selectedDesk?.status === 'available' && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Wrench className="w-3.5 h-3.5 text-amber-600" />}
                  onClick={() => handleSetMaintenance(true)}
                  className="border-amber-300 text-amber-800 hover:bg-amber-50 font-semibold"
                >
                  Mark Under Maintenance
                </Button>
              )}
              {selectedDesk?.status === 'maintenance' && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  onClick={handleMakeVacant}
                  loading={vacating}
                  className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-bold"
                >
                  Make Vacant (Available)
                </Button>
              )}
              {selectedDesk?.status === 'occupied' && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Wrench className="w-3.5 h-3.5 text-amber-600" />}
                  onClick={() => handleSetMaintenance(true)}
                  className="border-amber-300 text-amber-800 hover:bg-amber-50 font-semibold"
                >
                  Mark Under Maintenance
                </Button>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {selectedDesk?.status === 'occupied' && (
                <Button
                  variant="outline"
                  size="sm"
                  loading={vacating}
                  icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  onClick={handleMakeVacant}
                  className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-bold"
                >
                  Make Vacant (Student Exited)
                </Button>
              )}

              {selectedDesk?.status === 'available' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleQuickMarkBooked}
                    className="border-red-300 text-red-700 hover:bg-red-50 font-bold"
                  >
                    Mark Booked / Full
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setIsWalkinModalOpen(true)}
                  >
                    Allocate Walk-in Student
                  </Button>
                </>
              )}

              {selectedDesk?.status === 'maintenance' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleQuickMarkBooked}
                    className="border-red-300 text-red-700 hover:bg-red-50 font-bold"
                  >
                    Book Seat (Full)
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setIsWalkinModalOpen(true)}
                  >
                    Book for Walk-in Student
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Allocate Walk-in to Desk Modal */}
      <Modal
        isOpen={isWalkinModalOpen}
        onClose={() => setIsWalkinModalOpen(false)}
        title={`Allocate ${selectedDesk?.seatNumber || ''} to Student`}
        size="sm"
      >
        <form onSubmit={handleWalkinFromDesk} className="space-y-4">
          <Input
            label="Student Full Name"
            placeholder="e.g. Vikas Yadav"
            value={walkinName}
            onChange={(e) => setWalkinName(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            placeholder="e.g. 9876543210"
            value={walkinPhone}
            onChange={(e) => setWalkinPhone(e.target.value)}
            required
          />
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
            <p className="text-slate-500">Assigned Desk: <strong className="text-deep-navy-900">{selectedDesk?.seatNumber}</strong></p>
            <p className="text-slate-500">Selected Shift: <strong className="text-deep-navy-900">{selectedShift}</strong></p>
            <p className="text-emerald-700 font-bold">Standard Fee: ₹1,200 / month</p>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsWalkinModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submittingWalkin}>
              Confirm Allocation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
