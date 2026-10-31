import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { teacherService } from '../../services/teacherService';
import { TeacherAssignment } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Clock,
  MapPin,
  Calendar,
  Check,
  Plus,
  Phone,
  MessageCircle,
  X,
  User,
  Trash2,
  CalendarDays
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TeacherSchedule: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [loading, setLoading] = useState(true);

  // Available slots settings per day
  const [availableSlots, setAvailableSlots] = useState<{ [day: string]: string[] }>(() => {
    try {
      const saved = localStorage.getItem(`fp_teacher_slots_${user?.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      Monday: ['04:00 PM - 05:30 PM', '06:00 PM - 07:30 PM'],
      Tuesday: ['04:00 PM - 05:30 PM'],
      Wednesday: ['04:00 PM - 05:30 PM', '06:00 PM - 07:30 PM'],
      Thursday: ['04:00 PM - 05:30 PM'],
      Friday: ['04:00 PM - 05:30 PM', '06:00 PM - 07:30 PM'],
      Saturday: ['10:00 AM - 12:00 PM', '04:00 PM - 06:00 PM'],
      Sunday: ['10:00 AM - 12:00 PM'],
    };
  });

  // Modal for adding a new slot
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [startTime, setStartTime] = useState('04:00 PM');
  const [endTime, setEndTime] = useState('05:30 PM');

  // Modal for contacting student/parent
  const [contactModalData, setContactModalData] = useState<TeacherAssignment | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const data = await teacherService.getAssignments(user.id);
        setAssignments(data);
      } catch (err) {
        console.error('Failed to load schedule', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSaveSlots = () => {
    if (user) {
      localStorage.setItem(`fp_teacher_slots_${user.id}`, JSON.stringify(availableSlots));
    }
    addToast('Teaching availability schedule saved and synced with District Admin!', 'success');
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot = `${startTime} - ${endTime}`;
    setAvailableSlots(prev => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), newSlot]
    }));
    setShowAddSlotModal(false);
    addToast(`Added availability slot for ${selectedDay}!`, 'success');
  };

  const handleRemoveSlot = (indexToRemove: number) => {
    setAvailableSlots(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter((_, i) => i !== indexToRemove)
    }));
    addToast('Slot removed from schedule', 'info');
  };

  // Filter assignments that fall on the selected day
  // Checks if schedule string includes abbreviation (e.g. Mon, Tue, etc.)
  const dayAbbr = selectedDay.slice(0, 3);
  const dayAssignments = assignments.filter(a => {
    if (!a.schedule) return false;
    return a.schedule.toLowerCase().includes(dayAbbr.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Weekly Teaching Schedule"
        subtitle="Manage your daily student sessions, home visits, and open availability slots for district matching"
        breadcrumbs={[
          { label: 'Teacher Portal', href: '/teacher' },
          { label: 'Schedule' }
        ]}
        actions={
          <Button variant="primary" icon={<Check className="w-4 h-4" />} onClick={handleSaveSlots}>
            Save Availability
          </Button>
        }
      />

      {/* Day Selector Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              selectedDay === day
                ? 'bg-royal-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Day's Scheduled Classes */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Scheduled Sessions on {selectedDay}
                </h3>
                <p className="text-xs text-slate-500">
                  Confirmed home visits and tutorial allotments for this day
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-royal-blue-50 text-royal-blue-700 border border-royal-blue-100">
                {dayAssignments.length} {dayAssignments.length === 1 ? 'Session' : 'Sessions'}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : dayAssignments.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <CalendarDays className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">No classes scheduled on {selectedDay}</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  {assignments.length === 0
                    ? 'You do not have any assigned students yet. Your open availability slots are listed on the right for District Admin allotment.'
                    : `None of your currently allotted students have classes on ${selectedDay}. Your open availability slots remain open.`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-xl border-l-4 border-l-royal-blue-600 bg-royal-blue-50/20 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-royal-blue-50/40"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-royal-blue-100 text-royal-blue-800">
                          {a.schedule || 'Scheduled Session'}
                        </span>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Confirmed Session
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {a.grade}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{a.studentName}</h4>
                      <p className="text-xs text-slate-600">
                        Subjects: <strong className="text-slate-800">{a.subjects.join(', ')}</strong> • Mode: {a.teachingMode || 'Home Tuition'}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{a.address || `${a.district || 'Ghazipur'} (Home Visit)`}</span>
                      </p>
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Phone className="w-3.5 h-3.5" />}
                        onClick={() => setContactModalData(a)}
                        className="text-xs text-royal-blue-600 border-royal-blue-200 hover:bg-royal-blue-50"
                      >
                        Call Student/Parent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Availability Settings */}
        <div className="space-y-6">
          <Card className="p-6 border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">Available Slots ({selectedDay})</h3>
              <span className="text-xs text-slate-500 font-medium">
                {availableSlots[selectedDay]?.length || 0} Slots
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              District Admin uses these open windows to match parent requests for your subjects.
            </p>

            <div className="space-y-2">
              {availableSlots[selectedDay]?.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No availability configured for {selectedDay}. Click below to add a slot.
                </div>
              ) : (
                availableSlots[selectedDay]?.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-royal-blue-600" />
                      <span className="font-semibold text-slate-800">{slot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(index)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove Slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAddSlotModal(true)}
                className="w-full text-xs"
              >
                Add Availability Slot
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-royal-blue-900 to-deep-navy-950 text-white border-0 shadow-md">
            <h4 className="text-sm font-bold mb-2 flex items-center gap-2 text-white">
              <Calendar className="w-4 h-4 text-royal-blue-300" /> District Allotment Protocol
            </h4>
            <p className="text-xs text-royal-blue-200 leading-relaxed">
              District Admin verifies tutor availability before confirming student matches. Keep your availability accurate to maintain a high allocation score and avoid schedule clashes.
            </p>
          </Card>
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddSlotModal && (
        <Modal
          isOpen={showAddSlotModal}
          onClose={() => setShowAddSlotModal(false)}
          title={`Add Availability Slot for ${selectedDay}`}
          size="sm"
        >
          <form onSubmit={handleAddSlot} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Start Time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g. 04:00 PM"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-royal-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                End Time
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="e.g. 05:30 PM"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-royal-blue-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddSlotModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Add Slot
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Contact Student / Parent Modal */}
      {contactModalData && (
        <Modal
          isOpen={!!contactModalData}
          onClose={() => setContactModalData(null)}
          title="Contact Student & Guardian"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-royal-blue-100 text-royal-blue-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{contactModalData.studentName}</h4>
                  <p className="text-xs text-slate-500">
                    {contactModalData.grade} • {contactModalData.subjects.join(', ')}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs space-y-1 text-slate-600">
                <p>
                  <strong className="text-slate-800">Direct Phone:</strong> +91 {contactModalData.studentPhone || '9876543210'}
                </p>
                <p>
                  <strong className="text-slate-800">Visit Address:</strong> {contactModalData.address}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={`tel:${contactModalData.studentPhone?.replace(/\D/g, '') || '9876543210'}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-royal-blue-600 text-white hover:bg-royal-blue-700 transition-colors shadow-xs"
              >
                <Phone className="w-4 h-4" />
                Direct Phone Call
              </a>
              <a
                href={`https://wa.me/91${contactModalData.studentPhone?.replace(/\D/g, '') || '9876543210'}?text=${encodeURIComponent(
                  `Hello ${contactModalData.studentName}, this is your ZYZU'S tutor regarding our scheduled class.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                Open WhatsApp
              </a>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setContactModalData(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close Window
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
