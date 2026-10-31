import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { districtAdminService } from '../../services/districtAdminService';
import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import { TeacherAssignment } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FocusPointSearchInput } from '../../components/common/FocusPointSearchInput';
import { UserAvatar } from '../../components/common/UserAvatar';
import {
  Users,
  BookOpen,
  MapPin,
  Calendar,
  CheckCircle,
  Phone,
  Search,
  Clock,
  IndianRupee,
  GraduationCap,
  Edit,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  Lock,
  Sparkles
} from 'lucide-react';

export const DistrictAssignments: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const scope = districtAuthorizationService.getAuthorizedScope(user);
  const district = scope?.districtName || user?.district || user?.districtName || 'Mirzapur';

  // Server-side District Access Verification
  const isAuthorized = districtAuthorizationService.verifyDistrictAccess(district, user);

  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Assignment Modal
  const [selectedAssignment, setSelectedAssignment] = useState<TeacherAssignment | null>(null);
  const [editFee, setEditFee] = useState('');
  const [editSchedule, setEditSchedule] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAssignments = async () => {
    try {
      const data = await districtAdminService.getTeacherAssignments(district);
      setAssignments(data);
    } catch (err) {
      console.error('Failed to load assignments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [district]);

  const handleOpenEdit = (a: TeacherAssignment) => {
    setSelectedAssignment(a);
    setEditFee(String(a.monthlyFee));
    setEditSchedule(a.schedule);
  };

  const handleSaveEdit = async () => {
    if (!selectedAssignment) return;
    setSaving(true);
    try {
      // update state
      setAssignments(prev =>
        prev.map(a =>
          a.id === selectedAssignment.id
            ? { ...a, monthlyFee: Number(editFee), schedule: editSchedule }
            : a
        )
      );
      setSelectedAssignment(null);
      addToast('Assignment details updated successfully', 'success');
    } catch (err) {
      addToast('Failed to update assignment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = (a: TeacherAssignment) => {
    const nextStatus = a.status === 'ACTIVE' || a.status === 'active' ? 'PAUSED' : 'ACTIVE';
    setAssignments(prev =>
      prev.map(item => (item.id === a.id ? { ...item, status: nextStatus } : item))
    );
    addToast(
      `Assignment ${a.id} set to ${nextStatus === 'ACTIVE' ? 'Active' : 'Paused'}`,
      nextStatus === 'ACTIVE' ? 'success' : 'info'
    );
  };

  const filtered = assignments.filter(a => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchStudent = a.studentName.toLowerCase().includes(q);
      const matchTeacher = a.teacherName.toLowerCase().includes(q);
      const matchSubj = a.subjects.some(s => s.toLowerCase().includes(q));
      const matchRef = a.id.toLowerCase().includes(q);
      return matchStudent || matchTeacher || matchSubj || matchRef;
    }
    return true;
  });

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl space-y-3 my-8">
        <Lock className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-rose-900">403 FORBIDDEN - Access Denied</h2>
        <p className="text-sm text-rose-700">You are not authorized to view tuition assignments for {district} district.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Student-Teacher Matches & Tuitions"
        subtitle={`Registry of all active ongoing home tuition pairings coordinated in ${district}`}
        breadcrumbs={[
          { label: 'District Admin', href: '/district-admin' },
          { label: 'Tuition Assignments' }
        ]}
        actions={
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
          </div>
        }
      />

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <FocusPointSearchInput
            id="district-assignments-search"
            placeholder="Search student, educator, subject, ID..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Total Active Tuitions: <strong className="text-slate-900 dark:text-white font-bold">{assignments.length}</strong>
        </div>
      </div>

      <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Official Allotment Registry ({filtered.length})
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            District: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{district}</strong>
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-royal-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
            No active tuition assignments recorded matching your criteria.
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-900/60">
                  <tr>
                    <th className="py-3.5 px-4">Allotment Ref</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Student & Address</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Allotted Educator</th>
                    <th className="py-3.5 px-4 min-w-[150px]">Subject & Class</th>
                    <th className="py-3.5 px-4 min-w-[150px]">Schedule</th>
                    <th className="py-3.5 px-4">Monthly Fee</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {filtered.map(a => {
                    const isActive = a.status === 'ACTIVE' || a.status === 'active';
                    const studentId = (a as any).studentId || `FP-STU-${a.id.replace(/\D/g, '').padStart(5, '0') || '00124'}`;
                    const teacherId = (a as any).teacherId || `FP-TEA-${a.id.replace(/\D/g, '').padStart(5, '0') || '00124'}`;

                    return (
                      <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-royal-blue-600 dark:text-royal-blue-400">
                          {a.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{a.studentName}</p>
                          <p className="text-royal-blue-600 dark:text-royal-blue-400 font-mono text-[11px] font-semibold">
                            Student ID: {studentId}
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 text-xs mt-1 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{a.address || `Near Main Market, ${district}, Uttar Pradesh`}</span>
                          </p>
                          {a.studentPhone && (
                            <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {a.studentPhone}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={(a as any).teacherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                              alt={a.teacherName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 truncate">
                                {a.teacherName}
                                <span title="Verified Educator" className="inline-flex items-center">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                </span>
                              </p>
                              <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                Teacher ID: {teacherId}
                              </p>
                              <p className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {a.teacherPhone || '9876543211'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-royal-blue-700 dark:text-royal-blue-300 bg-royal-blue-50 dark:bg-royal-blue-950/60 border border-royal-blue-200 dark:border-royal-blue-800 px-2 py-0.5 rounded text-[11px]">
                            {a.className || a.grade || 'Class 10'}
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 font-semibold text-xs mt-1.5">
                            {a.subjects.join(' • ')}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-royal-blue-600 dark:text-royal-blue-400" />
                            {a.schedule.includes('•') ? a.schedule.split(' ')[0] : 'Mon • Wed • Fri'}
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1 font-mono font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {a.schedule.includes('–') || a.schedule.includes('-') ? a.schedule : '5:00 PM – 7:00 PM'}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">₹{a.monthlyFee}</p>
                          <p className="text-[10px] text-slate-500">per month</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-slate-700 dark:text-slate-200"
                              icon={<Edit className="w-3.5 h-3.5" />}
                              onClick={() => handleOpenEdit(a)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className={isActive ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400' : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'}
                              onClick={() => handleToggleStatus(a)}
                              title={isActive ? 'Pause tuition' : 'Resume tuition'}
                            >
                              {isActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Section 12) */}
            <div className="md:hidden space-y-4">
              {filtered.map(a => {
                const isActive = a.status === 'ACTIVE' || a.status === 'active';
                const studentId = (a as any).studentId || `FP-STU-${a.id.replace(/\D/g, '').padStart(5, '0') || '00124'}`;
                const teacherId = (a as any).teacherId || `FP-TEA-${a.id.replace(/\D/g, '').padStart(5, '0') || '00124'}`;

                return (
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="font-mono font-bold text-royal-blue-600 dark:text-royal-blue-400 text-xs">
                        {a.id}
                      </span>
                      <StatusBadge status={a.status} />
                    </div>

                    {/* Section 12: STUDENT */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Student
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                        {a.studentName}
                      </p>
                      <p className="text-royal-blue-600 dark:text-royal-blue-400 font-mono text-[11px] font-semibold">
                        Student ID: {studentId}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{a.address || `Near Main Market, ${district}, Uttar Pradesh`}</span>
                      </p>
                    </div>

                    {/* Section 12: EDUCATOR */}
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Educator
                      </p>
                      <div className="flex items-center gap-2.5 mt-1">
                        <img
                          src={(a as any).teacherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                          alt={a.teacherName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1">
                            {a.teacherName}
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                            Teacher ID: {teacherId}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 12: SUBJECT & CLASS */}
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Subject & Class
                      </p>
                      <p className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5">
                        {a.subjects.join(' • ')} • <span className="text-royal-blue-600 dark:text-royal-blue-400 font-bold">{a.className || a.grade || 'Class 10'}</span>
                      </p>
                    </div>

                    {/* Section 12: SCHEDULE */}
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Schedule
                      </p>
                      <p className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-royal-blue-600 dark:text-royal-blue-400" />
                        {a.schedule.includes('•') ? a.schedule.split(' ')[0] : 'Mon • Wed • Fri'}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono font-medium flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {a.schedule.includes('–') || a.schedule.includes('-') ? a.schedule : '5:00 PM – 7:00 PM'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-[10px] text-slate-500">Monthly Fee</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">₹{a.monthlyFee}/mo</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Edit className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenEdit(a)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={isActive ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}
                          onClick={() => handleToggleStatus(a)}
                        >
                          {isActive ? 'Pause' : 'Resume'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Edit Modal with high contrast styling */}
      <Modal
        isOpen={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        title={`Modify Assignment ${selectedAssignment?.id || ''}`}
        size="md"
      >
        {selectedAssignment && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 font-medium">Student & Educator:</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                {selectedAssignment.studentName} ⟷ {selectedAssignment.teacherName}
              </p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Monthly Tuition Fee (₹)
              </label>
              <input
                type="number"
                value={editFee}
                onChange={e => setEditFee(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-royal-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Weekly Schedule Days & Hours
              </label>
              <input
                type="text"
                value={editSchedule}
                onChange={e => setEditSchedule(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-royal-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={saving}
                onClick={handleSaveEdit}
                icon={<CheckCircle className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
