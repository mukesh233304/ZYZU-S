import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { libraryService } from '../../services/libraryService';
import { Library, LibraryShift } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Clock, Plus, Edit2, CheckCircle2, Moon, Sun, Sunrise, Building, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LibraryShifts: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [library, setLibrary] = useState<Library | null>(null);
  const [shifts, setShifts] = useState<LibraryShift[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Shift Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentShiftIndex, setCurrentShiftIndex] = useState<number | null>(null);
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [price, setPrice] = useState(800);
  const [savingShift, setSavingShift] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const libs = await libraryService.getLibrariesByOwner(user.id);
        if (libs.length > 0) {
          const activeLib = libs[0];
          setLibrary(activeLib);
          setShifts(activeLib.shifts || []);
        } else {
          setLibrary(null);
          setShifts([]);
        }
      } catch (err) {
        console.error('Failed to load shifts', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleEditClick = (shift: LibraryShift, index: number) => {
    setCurrentShiftIndex(index);
    setShiftName(shift.name);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setPrice(shift.price || shift.monthlyPrice || 499);
    setIsModalOpen(true);
  };

  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!library) return;

    if (!shiftName.trim() || !startTime.trim() || !endTime.trim()) {
      addToast('Please fill all mandatory shift fields', 'error');
      return;
    }

    setSavingShift(true);
    try {
      let updatedShifts: LibraryShift[];
      if (currentShiftIndex !== null) {
        updatedShifts = shifts.map((s, idx) => idx === currentShiftIndex ? {
          ...s,
          name: shiftName.trim(),
          startTime: startTime.trim(),
          endTime: endTime.trim(),
          price: Number(price),
          monthlyPrice: Number(price)
        } : s);
      } else {
        const newShift: LibraryShift = {
          id: `sh-${Date.now()}`,
          name: shiftName.trim(),
          startTime: startTime.trim(),
          endTime: endTime.trim(),
          price: Number(price),
          monthlyPrice: Number(price)
        };
        updatedShifts = [...shifts, newShift];
      }

      await libraryService.updateLibraryListing(library.id, { shifts: updatedShifts });
      setShifts(updatedShifts);
      setLibrary(prev => prev ? { ...prev, shifts: updatedShifts } : null);
      setIsModalOpen(false);
      addToast('Shift timings and pricing updated and saved to study library profile!', 'success');
    } catch (err) {
      addToast('Failed to save shift details', 'error');
    } finally {
      setSavingShift(false);
    }
  };

  const isShiftActiveNow = (startTimeStr: string, endTimeStr: string) => {
    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const parseToMinutes = (timeStr: string) => {
        const match = timeStr.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
        if (!match) return -1;
        let hours = parseInt(match[1], 10);
        const mins = match[2] ? parseInt(match[2], 10) : 0;
        const meridian = match[3].toUpperCase();
        if (meridian === 'PM' && hours !== 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;
        return hours * 60 + mins;
      };

      const startMins = parseToMinutes(startTimeStr);
      const endMins = parseToMinutes(endTimeStr);

      if (startMins === -1 || endMins === -1) return false;
      if (startMins <= endMins) {
        return currentMinutes >= startMins && currentMinutes < endMins;
      } else {
        return currentMinutes >= startMins || currentMinutes < endMins;
      }
    } catch {
      return false;
    }
  };

  const handleDeleteShift = async (index: number) => {
    if (shifts.length <= 1) {
      addToast('You must keep at least one active shift for desk reservations', 'error');
      return;
    }
    const targetShift = shifts[index];
    if (!confirm(`Are you sure you want to remove the shift "${targetShift.name}"?`)) return;
    if (!library) return;

    const updatedShifts = shifts.filter((_, idx) => idx !== index);
    try {
      await libraryService.updateLibraryListing(library.id, { shifts: updatedShifts });
      setShifts(updatedShifts);
      setLibrary(prev => prev ? { ...prev, shifts: updatedShifts } : null);
      addToast(`Shift "${targetShift.name}" removed successfully`, 'success');
    } catch (err) {
      addToast('Failed to delete shift', 'error');
    }
  };

  const getShiftIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('morning')) return <Sunrise className="w-5 h-5 text-amber-500" />;
    if (lower.includes('night')) return <Moon className="w-5 h-5 text-indigo-500" />;
    return <Sun className="w-5 h-5 text-orange-500" />;
  };

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
          title="Shift Timing & Slot Pricing"
          subtitle="Manage operating slots, daily hours, and monthly rates"
          breadcrumbs={[{ label: 'Library Management', href: '/library-owner' }, { label: 'Shifts' }]}
        />
        <Card className="p-8 text-center border-2 border-dashed border-slate-200">
          <Building className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Study Library Listed</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Please register your study library before configuring shift schedules and time slot subscription pricing.
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shift Timing & Slot Pricing"
        subtitle={`Manage operating slots, daily hours, and monthly rates for ${library.name}`}
        breadcrumbs={[
          { label: 'Library Management', href: '/library-owner' },
          { label: 'Shifts' }
        ]}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setCurrentShiftIndex(null);
              setShiftName('');
              setStartTime('06:00 AM');
              setEndTime('12:00 PM');
              setPrice(800);
              setIsModalOpen(true);
            }}
          >
            Add Custom Shift
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shifts.map((shift, idx) => {
          const isLiveNow = isShiftActiveNow(shift.startTime, shift.endTime);
          return (
            <Card key={shift.id || idx} className="p-6 border border-slate-200 hover:border-royal-blue-300 hover:shadow-md transition-all flex flex-col justify-between group bg-white">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-royal-blue-600">
                      {getShiftIcon(shift.name)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-royal-blue-600 transition-colors">
                        {shift.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-royal-blue-500" />
                        {shift.startTime} – {shift.endTime}
                      </p>
                    </div>
                  </div>
                  {isLiveNow ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live Shift Now
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Monthly Pricing:</span>
                    <p className="text-base font-bold text-slate-900">
                      ₹{shift.price || shift.monthlyPrice || 800} <span className="text-xs font-normal text-slate-500">/ month</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Permitted Desks:</span>
                    <p className="text-sm font-semibold text-slate-800">{library.totalSeats || 0} Desks</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteShift(idx)}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Delete
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit2 className="w-3.5 h-3.5" />}
                  onClick={() => handleEditClick(shift, idx)}
                >
                  Edit Timing & Rate
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit Shift Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentShiftIndex !== null ? 'Configure Shift Timing' : 'Add New Shift'}
        size="md"
      >
        <form onSubmit={handleSaveShift} className="space-y-4">
          <Input
            label="Shift Label *"
            placeholder="e.g. Afternoon Special Batch"
            value={shiftName}
            onChange={(e) => setShiftName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time *"
              value={startTime}
              placeholder="e.g. 06:00 AM"
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              label="End Time *"
              value={endTime}
              placeholder="e.g. 12:00 PM"
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <Input
            label="Monthly Subscription Rate (₹) *"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={savingShift}>
              Save Shift Settings
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
