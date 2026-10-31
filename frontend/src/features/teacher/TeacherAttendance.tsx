import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { attendanceService } from '../../services/attendanceService';
import { teacherService } from '../../services/teacherService';
import { AttendanceRecord, TeacherAssignment } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { WhatsAppAlertPreviewModal } from '../../components/attendance/WhatsAppAlertPreviewModal';
import {
  PlusCircle,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  Filter,
  UserCheck,
  AlertCircle,
  MessageSquare,
  Users,
  CheckCheck,
  Edit3,
  ShieldCheck,
  XCircle,
  Sparkles
} from 'lucide-react';

export const TeacherAttendance: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Check-In/Session Log Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('04:30 PM');
  const [duration, setDuration] = useState('1.5');
  const [status, setStatus] = useState<'present' | 'absent' | 'late' | 'leave'>('present');
  const [topic, setTopic] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit / Correction Modal
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [correctionReason, setCorrectionReason] = useState('');
  const [editStatus, setEditStatus] = useState<any>('present');
  const [editNotes, setEditNotes] = useState('');
  const [submittingCorrection, setSubmittingCorrection] = useState(false);

  // WhatsApp Alert Preview Modal
  const [previewRecord, setPreviewRecord] = useState<AttendanceRecord | null>(null);

  // Filters
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [attData, aData] = await Promise.all([
        attendanceService.getTeacherAttendance(user.id),
        teacherService.getAssignments(user.id)
      ]);

      setRecords(attData);
      setAssignments(aData);
      if (aData.length > 0 && !studentId) {
        setStudentId(aData[0].studentId);
      }
    } catch (err) {
      console.error('Failed to load attendance records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Realtime subscription: updates automatically when student checks in via QR!
    const unsubscribe = attendanceService.subscribe(() => {
      fetchData();
    });
    return () => unsubscribe();
  }, [user]);

  const handleOpenLogModal = () => {
    if (assignments.length === 0) {
      addToast('You do not have any active student assignments yet to log attendance for.', 'info');
      return;
    }
    if (!studentId && assignments.length > 0) {
      setStudentId(assignments[0].studentId);
    }
    setIsModalOpen(true);
  };

  // Teacher Manual Check-In
  const handleTeacherManualCheckIn = async (assignment: TeacherAssignment) => {
    if (!user) return;
    try {
      const res = await attendanceService.checkIn({
        studentId: assignment.studentId,
        studentName: assignment.studentName,
        serviceType: 'HOME_TUITION',
        teacherId: user.id,
        teacherName: user.name,
        targetId: user.id,
        targetName: user.name,
        referenceId: assignment.id,
        source: 'TEACHER_PORTAL',
        notes: `Teacher Manual Check-In by ${user.name}`,
        district: user.districtName,
      });

      addToast(`Checked in ${assignment.studentName} for today! Parent WhatsApp alert delivered.`, 'success');
      setPreviewRecord(res.record);
      await fetchData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to check in student', 'error');
    }
  };

  // Teacher Manual Check-Out
  const handleTeacherManualCheckOut = async (assignment: TeacherAssignment, todayRec: AttendanceRecord) => {
    if (!user) return;
    try {
      const res = await attendanceService.checkOut({
        attendanceId: todayRec.id,
        studentId: assignment.studentId,
        serviceType: 'HOME_TUITION',
        notes: `Checked out by Teacher ${user.name}`,
      });

      addToast(`Checked out ${assignment.studentName}! Duration: ${res.record.duration}. Parent WhatsApp alert delivered.`, 'success');
      setPreviewRecord(res.record);
      await fetchData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to check out student', 'error');
    }
  };

  // Teacher Quick Status Change (Absent, Late, Leave)
  const handleQuickStatus = async (assignment: TeacherAssignment, newStatus: 'absent' | 'late' | 'leave') => {
    if (!user) return;
    try {
      const existing = records.find(r => 
        (r.studentId === assignment.studentId || r.userId === assignment.studentId) &&
        r.date === todayStr &&
        (r.serviceType === 'HOME_TUITION' || r.type === 'tutor_session')
      );

      if (existing) {
        await attendanceService.updateAttendance(existing.id, {
          status: newStatus.toUpperCase() as any,
          notes: `Marked as ${newStatus.toUpperCase()} by Teacher ${user.name}`
        }, `Teacher marked student as ${newStatus}`, user.name);
      } else {
        await attendanceService.logAttendance({
          userId: assignment.studentId,
          userName: assignment.studentName,
          role: 'student',
          type: 'tutor_session',
          serviceType: 'HOME_TUITION',
          referenceId: assignment.id,
          date: todayStr,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: newStatus.toUpperCase() as any,
          teacherId: user.id,
          teacherName: user.name,
          source: 'TEACHER_PORTAL',
          notes: `Marked as ${newStatus.toUpperCase()} by Teacher ${user.name}`,
        });
      }

      addToast(`Marked ${assignment.studentName} as ${newStatus.toUpperCase()}`, 'info');
      await fetchData();
    } catch (err: any) {
      addToast('Failed to update status', 'error');
    }
  };

  // Save Session Modal
  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      addToast('Please select an assigned student', 'error');
      return;
    }
    setSaving(true);
    try {
      const assignment = assignments.find(a => a.studentId === studentId);
      const newRec = await attendanceService.logAttendance({
        userId: studentId,
        studentName: assignment?.studentName || 'Student',
        userName: assignment?.studentName || 'Student',
        role: 'student',
        type: 'tutor_session',
        serviceType: 'HOME_TUITION',
        referenceId: assignment?.id || 'tutor-direct',
        date,
        time,
        status: status.toUpperCase() as any,
        duration: Number(duration),
        teacherId: user?.id,
        teacherName: user?.name,
        source: 'TEACHER_PORTAL',
        notes: topic ? `Topic: ${topic} (${duration} hrs)` : `Regular Session (${duration} hrs)`,
        remarks: topic,
        notificationStatus: 'Delivered',
      });

      setRecords(prev => [newRec, ...prev]);
      setIsModalOpen(false);
      setTopic('');
      addToast(`Attendance logged for ${assignment?.studentName || 'Student'} (${status.toUpperCase()})!`, 'success');
    } catch (err) {
      addToast('Failed to log attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save Correction
  const handleSaveCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (!correctionReason.trim()) {
      addToast('Please provide an official reason for correcting historical attendance.', 'error');
      return;
    }

    setSubmittingCorrection(true);
    try {
      await attendanceService.updateAttendance(
        editingRecord.id,
        {
          status: editStatus.toUpperCase(),
          notes: editNotes ? `${editingRecord.notes || ''} [Edited: ${editNotes}]` : editingRecord.notes,
        },
        correctionReason.trim(),
        user?.name || 'Authorized Teacher'
      );

      addToast('Attendance record corrected and audited successfully!', 'success');
      setEditingRecord(null);
      setCorrectionReason('');
      await fetchData();
    } catch (err: any) {
      addToast('Failed to update attendance record', 'error');
    } finally {
      setSubmittingCorrection(false);
    }
  };

  const filteredRecords = records.filter(r => {
    if (selectedStudentFilter !== 'all' && (r.userId !== selectedStudentFilter && r.studentId !== selectedStudentFilter)) return false;
    if (statusFilter !== 'all') {
      const s = (r.status || '').toUpperCase();
      if (statusFilter.toUpperCase() !== s) return false;
    }
    return true;
  });

  // Calculate Metrics
  const todayRecords = records.filter(r => r.date === todayStr);
  const checkedInCount = todayRecords.filter(r => (r.status || '').toUpperCase() === 'CHECKED_IN').length;
  const completedCount = todayRecords.filter(r => (r.status || '').toUpperCase() === 'CHECKED_OUT' || (r.status || '').toUpperCase() === 'PRESENT').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Teacher Attendance Command Center"
        subtitle="Manage student presence, record daily class check-in/out, and dispatch automated parent WhatsApp alerts"
        breadcrumbs={[
          { label: 'Teacher Portal', href: '/teacher' },
          { label: 'Attendance' }
        ]}
        actions={
          <Button
            variant="primary"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={handleOpenLogModal}
          >
            Log Class Session
          </Button>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Students"
          value={assignments.length}
          subtitle="Active tuition allotments"
          icon={<Users className="w-6 h-6 text-brand-600" />}
        />
        <StatCard
          title="Currently Checked In"
          value={checkedInCount}
          subtitle="Live tuition sessions today"
          icon={<UserCheck className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          title="Today's Completed"
          value={completedCount}
          subtitle="Sessions verified today"
          icon={<CheckCircle2 className="w-6 h-6 text-indigo-600" />}
        />
        <StatCard
          title="Total Logged Classes"
          value={records.length}
          subtitle="All historical sessions"
          icon={<Calendar className="w-6 h-6 text-purple-600" />}
        />
      </div>

      {/* TODAY'S ASSIGNED STUDENTS COMMAND BOARD */}
      <Card className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Today's Sessions & Student Presence</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Synchronized with Student QR check-ins • One-click manual attendance recording
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
            {todayStr}
          </span>
        </div>

        {assignments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No active students assigned yet. Contact your District Coordinator to allot home tuition students.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map(asg => {
              const todayAtt = records.find(r => 
                (r.studentId === asg.studentId || r.userId === asg.studentId) &&
                r.date === todayStr &&
                (r.serviceType === 'HOME_TUITION' || r.type === 'tutor_session')
              );

              const s = (todayAtt?.status || '').toUpperCase();
              const isCheckedIn = s === 'CHECKED_IN' || (!!todayAtt?.checkInTime && !todayAtt?.checkOutTime);
              const isCheckedOut = s === 'CHECKED_OUT' || !!todayAtt?.checkOutTime;

              return (
                <div 
                  key={asg.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCheckedIn 
                      ? 'border-emerald-400 bg-emerald-50/30' 
                      : isCheckedOut 
                      ? 'border-indigo-200 bg-indigo-50/20' 
                      : 'border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{asg.studentName}</span>
                        {isCheckedIn && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        )}
                      </h4>
                      <p className="text-xs text-slate-500">{asg.subjects?.join(', ') || 'Home Tuition'} • {asg.className || 'Senior Secondary'}</p>
                    </div>

                    <StatusBadge 
                      status={isCheckedIn ? 'CHECKED_IN' : isCheckedOut ? 'CHECKED_OUT' : todayAtt?.status || 'NOT_STARTED'} 
                      size="sm" 
                    />
                  </div>

                  {/* Presence Timestamp Info */}
                  <div className="text-xs bg-white border border-slate-200/80 rounded-xl p-2.5 space-y-1 mb-3">
                    <div className="flex justify-between text-slate-600">
                      <span>Scheduled Slot:</span>
                      <span className="font-semibold text-slate-800">{asg.schedule || '05:00 PM – 06:30 PM'}</span>
                    </div>
                    {todayAtt?.checkInTime && (
                      <div className="flex justify-between text-slate-600">
                        <span>Check-In:</span>
                        <span className="font-mono font-bold text-emerald-700">{todayAtt.checkInTime}</span>
                      </div>
                    )}
                    {todayAtt?.checkOutTime && (
                      <div className="flex justify-between text-slate-600">
                        <span>Check-Out:</span>
                        <span className="font-mono font-bold text-indigo-700">{todayAtt.checkOutTime} (Duration: {todayAtt.duration})</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!isCheckedIn && !isCheckedOut && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleTeacherManualCheckIn(asg)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 text-xs py-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Record Check-In</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickStatus(asg, 'late')}
                          className="text-xs py-1.5"
                        >
                          Late
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickStatus(asg, 'absent')}
                          className="text-xs py-1.5 text-rose-700 hover:bg-rose-50 border-rose-200"
                        >
                          Absent
                        </Button>
                      </>
                    )}

                    {isCheckedIn && todayAtt && (
                      <Button
                        size="sm"
                        onClick={() => handleTeacherManualCheckOut(asg, todayAtt)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1 text-xs py-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Record Check-Out</span>
                      </Button>
                    )}

                    {todayAtt && (
                      <button
                        type="button"
                        onClick={() => setPreviewRecord(todayAtt)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors ml-auto"
                        title="View WhatsApp alert sent to parent"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Filter & Metric Summary Bar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Student:</span>
              <select
                value={selectedStudentFilter}
                onChange={(e) => setSelectedStudentFilter(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="all">All Students ({assignments.length})</option>
                {assignments.map(a => (
                  <option key={a.studentId} value={a.studentId}>
                    {a.studentName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="CHECKED_OUT">Checked Out</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="LEAVE">Authorized Leave</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 self-end md:self-center">
            <span>
              Total Logged: <strong className="text-slate-900 font-bold">{records.length}</strong>
            </span>
            <span>•</span>
            <span>
              Showing: <strong className="text-brand-700 font-bold">{filteredRecords.length}</strong>
            </span>
          </div>
        </div>
      </Card>

      {/* Main Records Table */}
      <Card className="p-0 overflow-hidden border border-slate-200 bg-white shadow-xs">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-brand-500" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">No attendance records found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              {assignments.length === 0
                ? 'You do not have any active student assignments allotted yet. Once students are allotted, you can record daily attendance here.'
                : 'No session logs match your selected filter criteria. Click below to record your first completed class.'}
            </p>
            {assignments.length > 0 && (
              <Button
                variant="primary"
                icon={<PlusCircle className="w-4 h-4" />}
                onClick={handleOpenLogModal}
              >
                Log First Class Session
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3.5 px-4">Date & Time</th>
                  <th scope="col" className="py-3.5 px-4">Student Name</th>
                  <th scope="col" className="py-3.5 px-4">Duration</th>
                  <th scope="col" className="py-3.5 px-4">Topic / Syllabus</th>
                  <th scope="col" className="py-3.5 px-4">Attendance</th>
                  <th scope="col" className="py-3.5 px-4">Parent Notification</th>
                  <th scope="col" className="py-3.5 px-4 text-right">Audit & Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-extrabold text-slate-950">{rec.date}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {rec.checkInTime || rec.time || '-'}
                        {rec.checkOutTime ? ` → ${rec.checkOutTime}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {rec.studentName || rec.userName || 'Student'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        {rec.duration ? (typeof rec.duration === 'string' ? rec.duration : `${rec.duration} hrs`) : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs text-xs text-slate-600 truncate">
                      {rec.remarks || rec.notes || 'Curriculum delivery'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={rec.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPreviewRecord(rec)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp Alert</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingRecord(rec);
                          setEditStatus(rec.status);
                          setEditNotes(rec.notes || '');
                          setCorrectionReason('');
                        }}
                        className="gap-1 text-xs"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Correct</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Manual Class Log Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Verified Class Session"
        size="md"
      >
        <form onSubmit={handleSaveAttendance} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Student *
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 bg-white"
            >
              {assignments.map(a => (
                <option key={a.studentId} value={a.studentId}>
                  {a.studentName} ({a.className || 'General'} - {a.subjects?.join(', ') || 'All Subjects'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Session Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              label="Session Time"
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 05:00 PM"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Duration (Hours)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white"
              >
                <option value="1">1.0 Hour</option>
                <option value="1.5">1.5 Hours</option>
                <option value="2">2.0 Hours</option>
                <option value="2.5">2.5 Hours</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Attendance Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late (Delayed)</option>
                <option value="leave">Authorized Leave</option>
              </select>
            </div>
          </div>

          <Input
            label="Curriculum Topic / Notes"
            placeholder="e.g. Newton Laws of Motion & Numerical Practice"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Logging...' : 'Save & Notify Parent'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Controlled Correction Modal with Mandatory Audit */}
      <Modal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        title="Audit-Controlled Attendance Correction"
        size="md"
      >
        {editingRecord && (
          <form onSubmit={handleSaveCorrection} className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
              <span className="font-bold block">Strict Sovereign Governance Rule:</span>
              <p>All manual corrections require an official justification reason and are permanently archived in the system audit trail.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Student & Date
              </label>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                {editingRecord.studentName} • {editingRecord.date}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Attendance Status *
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white"
              >
                <option value="PRESENT">Present</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="CHECKED_OUT">Checked Out</option>
                <option value="LATE">Late</option>
                <option value="LEAVE">Authorized Leave</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>

            <Input
              label="Correction Justification Reason *"
              placeholder="e.g. Student network error during QR scan; verified in-person attendance"
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              required
            />

            <Input
              label="Additional Curriculum Remarks"
              placeholder="Optional remarks"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setEditingRecord(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submittingCorrection}>
                {submittingCorrection ? 'Auditing...' : 'Commit Correction'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* WhatsApp Modal */}
      <WhatsAppAlertPreviewModal
        isOpen={!!previewRecord}
        onClose={() => setPreviewRecord(null)}
        record={previewRecord}
      />
    </div>
  );
};
