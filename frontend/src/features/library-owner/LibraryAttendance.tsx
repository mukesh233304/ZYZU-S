import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { libraryService } from '../../services/libraryService';
import { bookingService } from '../../services/bookingService';
import { attendanceService } from '../../services/attendanceService';
import { Library, LibraryBooking, LibraryStudent, AttendanceRecord } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { WhatsAppAlertPreviewModal } from '../../components/attendance/WhatsAppAlertPreviewModal';
import {
  Users,
  Clock,
  QrCode,
  CheckCircle,
  LogIn,
  LogOut,
  Armchair,
  Building,
  Download,
  Calendar,
  MessageSquare,
  CheckCheck,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LibraryAttendance: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [library, setLibrary] = useState<Library | null>(null);
  const [students, setStudents] = useState<LibraryStudent[]>([]);
  const [bookings, setBookings] = useState<LibraryBooking[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Date selection state (defaults to today)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<'CURRENTLY_STUDYING' | 'CHECKIN_LOG' | 'CHECKOUT_LOG' | 'ALL'>('CURRENTLY_STUDYING');

  // Manual Check-in Modal
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [deskNumber, setDeskNumber] = useState('A-01');
  const [status, setStatus] = useState('present');
  const [notes, setNotes] = useState('Manual counter check-in');
  const [submittingCheckin, setSubmittingCheckin] = useState(false);

  // WhatsApp Alert Modal
  const [previewRecord, setPreviewRecord] = useState<AttendanceRecord | null>(null);

  const loadAttendanceData = async () => {
    if (!user) return;
    try {
      const libs = await libraryService.getLibrariesByOwner(user.id);
      if (libs.length > 0) {
        const activeLib = libs[0];
        setLibrary(activeLib);

        const [bData, sData, attData] = await Promise.all([
          bookingService.getLibraryBookings(activeLib.id),
          libraryService.getLibraryStudents(activeLib.id),
          libraryService.getAttendanceRecords(activeLib.id)
        ]);

        setBookings(bData);
        setStudents(sData);
        setRecords(attData);

        // Pre-select first available student
        if (sData.length > 0) {
          setSelectedStudentId(sData[0].id);
          setDeskNumber(sData[0].seatNumber);
        } else if (bData.length > 0) {
          setSelectedStudentId(bData[0].id);
          setDeskNumber(bData[0].seatNumber);
        }
      } else {
        setLibrary(null);
      }
    } catch (err) {
      console.error('Failed to load library attendance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();
    // Realtime pub/sub synchronization with student QR scans
    const unsubscribe = attendanceService.subscribe(() => {
      loadAttendanceData();
    });
    return () => unsubscribe();
  }, [user]);

  const handleStudentSelect = (stuId: string) => {
    setSelectedStudentId(stuId);
    const stu = students.find(s => s.id === stuId);
    if (stu) {
      setDeskNumber(stu.seatNumber);
      return;
    }
    const b = bookings.find(x => x.id === stuId);
    if (b) {
      setDeskNumber(b.seatNumber);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!library) return;
    setSubmittingCheckin(true);
    try {
      const matchedStudent = students.find(s => s.id === selectedStudentId);
      const matchedBooking = bookings.find(b => b.id === selectedStudentId);
      const studentName = matchedStudent?.name || matchedBooking?.studentName || 'Student';

      const res = await attendanceService.checkIn({
        studentId: selectedStudentId,
        studentName,
        serviceType: 'LIBRARY',
        libraryId: library.id,
        libraryName: library.name,
        targetId: library.id,
        targetName: library.name,
        referenceId: deskNumber.trim().toUpperCase(),
        bookingId: matchedBooking?.id,
        source: 'LIBRARY_OWNER_PORTAL',
        notes: notes.trim() || `Desk ${deskNumber} Check-in`,
        district: library.districtName,
      });

      setIsCheckinModalOpen(false);
      addToast(`Checked in ${studentName} at Desk ${deskNumber.toUpperCase()}! Parent WhatsApp alert delivered.`, 'success');
      setPreviewRecord(res.record);
      await loadAttendanceData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to log attendance', 'error');
    } finally {
      setSubmittingCheckin(false);
    }
  };

  const handleCheckOutStudent = async (r: AttendanceRecord) => {
    try {
      const res = await attendanceService.checkOut({
        attendanceId: r.id,
        studentId: r.userId || r.studentId || '',
        serviceType: 'LIBRARY',
        notes: 'Checked out by study hall desk administrator',
      });

      addToast(`${r.userName || r.studentName || 'Student'} checked out! Duration: ${res.record.duration}. Parent WhatsApp alert delivered.`, 'success');
      setPreviewRecord(res.record);
      await loadAttendanceData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to checkout student', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!library) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <PageHeader
          title="Student Attendance Register"
          subtitle="Track entry/exit timestamps and active studying hours"
          breadcrumbs={[{ label: 'Library Management', href: '/library-owner' }, { label: 'Attendance' }]}
        />
        <Card className="p-8 text-center border-2 border-dashed border-slate-200">
          <Building className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Study Library Listed</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Please register your study library before managing student shift attendance and daily entry registers.
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

  // Filter records by selected date
  const dateRecords = records.filter(r => r.date === selectedDate);
  const totalEnrolled = students.length + bookings.length;

  // Active occupants (checked in on selected date and not checked out)
  const isCheckedOut = (r: any) => Boolean(r.checkOutTime || r.checkoutTime || r.status === 'CHECKED_OUT' || r.status === 'completed');
  const currentlyStudying = dateRecords.filter(r => !isCheckedOut(r));
  const checkedOutList = dateRecords.filter(r => isCheckedOut(r));

  // Capacity calculations (Real capacity from library data, Section 38)
  const totalCapacity = library.totalSeats || (library.seats && library.seats.length > 0 ? library.seats.length : 50);
  const currentlyOccupied = currentlyStudying.length;
  const availableSeats = Math.max(0, totalCapacity - currentlyOccupied);
  const occupancyPercentage = totalCapacity > 0 ? Math.min(100, Math.round((currentlyOccupied / totalCapacity) * 100)) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Library Attendance Command Center"
        subtitle={`Live study hall occupancy, entry/exit logs, and student presence for ${library.name}`}
        breadcrumbs={[
          { label: 'Library Management', href: '/library-owner' },
          { label: 'Attendance' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/library-owner/reports">
              <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
                Export Register (A4)
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              icon={<LogIn className="w-4 h-4" />}
              onClick={() => setIsCheckinModalOpen(true)}
            >
              Manual Check-in
            </Button>
          </div>
        }
      />

      {/* Date Inspector Bar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-brand-600" />
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Inspecting Attendance For</span>
              <div className="flex items-center gap-2 mt-0.5">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="font-bold text-slate-900 text-sm border border-slate-300 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
                {selectedDate === todayStr && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                selectedDate === todayStr
                  ? 'bg-brand-50 border-brand-300 text-brand-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => {
                const y = new Date();
                y.setDate(y.getDate() - 1);
                setSelectedDate(y.toISOString().split('T')[0]);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Yesterday
            </button>
          </div>
        </div>
      </Card>

      {/* Capacity & Occupancy Integration Bar (Section 38) */}
      <Card className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Live Capacity & Occupancy Telemetry
              </span>
            </div>
            <h3 className="text-lg font-black text-white">
              {totalCapacity} Total Seats • {currentlyOccupied} Currently Inside • {availableSeats} Available
            </h3>
            <p className="text-xs text-slate-400">
              Live seat availability updated via student QR check-in & counter registers
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-2xl font-black text-white font-mono">{occupancyPercentage}%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Occupancy Rate</div>
            </div>
            <div className="w-28 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-emerald-500 to-brand-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enrolled Members"
          value={totalEnrolled}
          subtitle={totalEnrolled > 0 ? "Registered study members" : "0 enrolled"}
          icon={<Users className="w-5 h-5 text-brand-600" />}
        />
        <StatCard
          title="Total Checked In Today"
          value={dateRecords.length}
          subtitle={dateRecords.length > 0 ? `Logged on ${selectedDate}` : "No check-ins"}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Currently Inside Hall"
          value={currentlyStudying.length}
          subtitle={currentlyStudying.length > 0 ? "Active study sessions" : "Hall empty"}
          icon={<Armchair className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Checked Out / Exited"
          value={checkedOutList.length}
          subtitle="Completed visits"
          icon={<LogOut className="w-5 h-5 text-slate-500" />}
        />
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('CURRENTLY_STUDYING')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'CURRENTLY_STUDYING'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Currently Inside ({currentlyStudying.length})
        </button>
        <button
          onClick={() => setActiveTab('CHECKIN_LOG')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'CHECKIN_LOG'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Check-in Register ({dateRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('CHECKOUT_LOG')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'CHECKOUT_LOG'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Check-out Log ({checkedOutList.length})
        </button>
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Recorded Sessions ({records.length})
        </button>
      </div>

      {/* Active View Content */}
      <Card className="p-6">
        {activeTab === 'CURRENTLY_STUDYING' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Active Students in Reading Hall
                </h3>
                <p className="text-xs text-slate-500">Students currently occupying study desks with 1-click exit checkout</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                {currentlyStudying.length} Active Now
              </span>
            </div>

            {currentlyStudying.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                <Armchair className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No students currently in the study hall</p>
                <p className="text-xs text-slate-400 mt-1">Use "Manual Check-in" or students can scan desk QR codes upon entering.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase bg-slate-50">
                    <tr>
                      <th className="py-3 px-4">Desk #</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Check-in Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Parent Notification</th>
                      <th className="py-3 px-4">Session Notes</th>
                      <th className="py-3 px-4 text-right">Exit Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {currentlyStudying.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-black text-brand-600 text-base">
                          {r.referenceId || r.targetName || 'Desk'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {r.userName || r.studentName || 'Student'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                          {r.checkInTime || r.time || 'Entry'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            STUDYING
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setPreviewRecord(r)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp Alert</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {r.notes || 'In-hall study session'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleCheckOutStudent(r)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            <LogOut className="w-3.5 h-3.5 text-slate-600" />
                            Check Out
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeTab === 'CHECKIN_LOG' && `Check-in Register for ${selectedDate}`}
                  {activeTab === 'CHECKOUT_LOG' && `Check-out Log for ${selectedDate}`}
                  {activeTab === 'ALL' && 'Complete Attendance History'}
                </h3>
                <p className="text-xs text-slate-500">Time-stamped entry and exit events</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {activeTab === 'CHECKIN_LOG' ? dateRecords.length : activeTab === 'CHECKOUT_LOG' ? checkedOutList.length : records.length} Records
              </span>
            </div>

            {((activeTab === 'CHECKIN_LOG' ? dateRecords : activeTab === 'CHECKOUT_LOG' ? checkedOutList : records).length === 0) ? (
              <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No attendance entries found for this view</p>
                <p className="text-xs text-slate-400 mt-1">Try switching dates or recording new student check-ins.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase bg-slate-50">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Desk Number</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Check-in</th>
                      <th className="py-3 px-4">Check-out</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Parent WhatsApp</th>
                      <th className="py-3 px-4">Session Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {(activeTab === 'CHECKIN_LOG' ? dateRecords : activeTab === 'CHECKOUT_LOG' ? checkedOutList : records).map(r => {
                      const outTime = (r as any).checkoutTime || r.checkOutTime;
                      return (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{r.userName || r.studentName}</td>
                          <td className="py-3 px-4 font-mono font-bold text-brand-600">{r.referenceId || 'Desk'}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{r.date}</td>
                          <td className="py-3 px-4 font-mono text-slate-700">{r.checkInTime || r.time || '--:--'}</td>
                          <td className="py-3 px-4 font-mono text-slate-700">
                            {outTime ? (
                              <span className="text-slate-800 font-semibold">{outTime}</span>
                            ) : (
                              <span className="text-emerald-600 font-semibold text-[11px]">Still Studying</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">
                            {r.duration ? (typeof r.duration === 'string' ? r.duration : `${r.duration} hrs`) : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={outTime ? 'COMPLETED' : r.status.toUpperCase()} />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => setPreviewRecord(r)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            >
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{r.notes}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Manual Check-in Modal */}
      <Modal
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
        title="Record Student Study Hall Check-in"
        size="md"
      >
        <form onSubmit={handleCheckIn} className="space-y-4">
          {students.length === 0 && bookings.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              No active students enrolled in this library. Please register a walk-in student first.
            </div>
          ) : (
            <>
              <Select
                label="Select Enrolled Student *"
                value={selectedStudentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
                options={[
                  ...students.map(s => ({
                    value: s.id,
                    label: `${s.name} (${s.seatNumber} • ${s.shift || 'General'})`
                  })),
                  ...bookings.map(b => ({
                    value: b.studentId || b.id,
                    label: `${b.studentName} (Desk ${b.seatNumber} • Online Booking)`
                  }))
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Desk Number *"
                  value={deskNumber}
                  onChange={(e) => setDeskNumber(e.target.value)}
                  required
                />

                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: 'present', label: 'Present / In-Hall' },
                    { value: 'late', label: 'Late Entry' },
                    { value: 'leave', label: 'Authorized Leave' },
                  ]}
                />
              </div>

              <Input
                label="Session Remarks"
                placeholder="e.g. Morning Shift slot entry, ID verified"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsCheckinModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submittingCheckin}>
                  Record Entry & Alert Parent
                </Button>
              </div>
            </>
          )}
        </form>
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
