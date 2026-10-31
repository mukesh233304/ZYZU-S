import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Armchair, Clock, Calendar, Plus, QrCode, 
  GraduationCap, BookOpen, CheckCircle2, ShieldCheck, 
  Download, ArrowRight, UserCheck, MapPin, Receipt, 
  AlertCircle, Sparkles, RefreshCw
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/FeedbackStates';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { demoService } from '../../services/demoService';
import { TutorRequest, TeacherAssignment, LibraryBooking, DemoBooking, DemoEligibility } from '../../types';
import { OfficialReceiptModal, ReceiptData } from '../../components/common/OfficialReceiptModal';
import { DemoIdCardModal } from '../../components/demo/DemoIdCardModal';
import { DemoBookingModal } from '../../components/demo/DemoBookingModal';

type BookingTab = 'LIBRARY_BOOKINGS' | 'TUTOR_REQUESTS' | 'TUTOR_ASSIGNMENTS' | 'DEMO_BOOKINGS' | 'PAST_BOOKINGS';

export const StudentBookings: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id || 'usr-student-fresh';

  const [activeTab, setActiveTab] = useState<BookingTab>('LIBRARY_BOOKINGS');
  const [loading, setLoading] = useState(true);
  const [tutorRequests, setTutorRequests] = useState<TutorRequest[]>([]);
  const [tutorAssignments, setTutorAssignments] = useState<TeacherAssignment[]>([]);
  const [libraryBookings, setLibraryBookings] = useState<LibraryBooking[]>([]);
  const [pastBookings, setPastBookings] = useState<LibraryBooking[]>([]);

  // Demo State
  const [demoBookings, setDemoBookings] = useState<DemoBooking[]>([]);
  const [demoEligibility, setDemoEligibility] = useState<DemoEligibility | null>(null);
  const [selectedDemoForCard, setSelectedDemoForCard] = useState<DemoBooking | null>(null);
  const [demoModalConfig, setDemoModalConfig] = useState<{
    isOpen: boolean;
    serviceType: 'LIBRARY' | 'HOME_TUITION';
    serviceName?: string;
  }>({
    isOpen: false,
    serviceType: 'LIBRARY'
  });

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, studentDemos, elig] = await Promise.all([
        studentService.getStudentBookingsData(studentId),
        demoService.getStudentDemoBookings(studentId),
        demoService.checkEligibility(studentId)
      ]);
      setTutorRequests(data.tutorRequests);
      setTutorAssignments(data.tutorAssignments);
      setLibraryBookings(data.activeLibraryBookings);
      setPastBookings(data.pastBookings);
      setDemoBookings(studentDemos);
      setDemoEligibility(elig);
    } catch (e) {
      console.error('Failed to load student bookings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const handleOpenReceipt = (booking: LibraryBooking) => {
    setReceiptData({
      receiptNumber: `REC-${booking.id.toUpperCase()}`,
      date: booking.bookingDate || booking.startDate || new Date().toISOString().split('T')[0],
      studentName: booking.studentName || user?.name || 'Aryan Kumar',
      studentId: booking.studentId || user?.id || 'STU-10029',
      studentMobile: booking.studentMobile || user?.mobile || '9876543210',
      studentEmail: user?.email || 'student@zyzus.com',
      district: booking.district || user?.districtName || 'Ghazipur',
      serviceType: 'STUDY_LIBRARY',
      serviceName: booking.libraryName,
      serviceDetails: `Desk ${booking.seatNumber} • Shift: ${booking.shiftName || 'Standard'}`,
      billingPeriod: `${booking.startDate} to ${booking.endDate}`,
      amount: booking.totalAmount || booking.amount || 499,
      paymentMethod: booking.paymentMethod || 'Online (UPI/QR)',
      transactionId: `TXN-${booking.id}-${Date.now().toString().slice(-6)}`,
      status: 'PAID',
    });
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings & Allotments"
        description="Review and track your home tutor requests, allotted teachers, and self-study library desk passes."
        breadcrumbs={[
          { label: 'Student Portal', path: '/student/dashboard' },
          { label: 'My Bookings' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Link to="/student/tutor-request">
              <Button size="sm" variant="outline" leftIcon={<GraduationCap className="w-4 h-4" />}>
                Request Tutor
              </Button>
            </Link>
            <Link to="/find-library">
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Book Study Desk
              </Button>
            </Link>
          </div>
        }
      />

      {/* Biometric Attendance Sync Status Banner */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white border border-brand-800/60 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Biometric Attendance Sync Enabled
                </span>
                <span className="text-xs text-slate-300 font-mono hidden sm:inline">
                  Pass Ref: #{studentId}
                </span>
              </div>
              <h3 className="font-extrabold text-base text-white mt-1">
                Hardware Turnstile Ready for Instant QR & RFID Check-in
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Your registered student profile is active across affiliated libraries. Scan your digital QR pass or tap your RFID student card at the cloud turnstile to log attendance in real-time.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2.5 self-start md:self-center">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-right">
              <p className="text-[10px] uppercase font-bold text-slate-300">Turnstile Controller</p>
              <p className="font-mono font-bold text-xs text-emerald-300">Cloud Online • Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-2 sm:gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('LIBRARY_BOOKINGS')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'LIBRARY_BOOKINGS'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Armchair className="w-4 h-4" />
          <span>Library Passes</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'LIBRARY_BOOKINGS' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {libraryBookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TUTOR_REQUESTS')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'TUTOR_REQUESTS'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Tutor Requests</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'TUTOR_REQUESTS' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {tutorRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TUTOR_ASSIGNMENTS')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'TUTOR_ASSIGNMENTS'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Tutor Assignments</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'TUTOR_ASSIGNMENTS' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {tutorAssignments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DEMO_BOOKINGS')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'DEMO_BOOKINGS'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>My Demo Passes</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'DEMO_BOOKINGS' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {demoBookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PAST_BOOKINGS')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'PAST_BOOKINGS'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Past History</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'PAST_BOOKINGS' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {pastBookings.length}
          </span>
        </button>
      </div>

      {/* Content Panels */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin text-brand-600" />
            <span className="text-sm font-semibold">Loading booking passes and records...</span>
          </div>
        </div>
      ) : (
        <div>
          {/* TAB 1: LIBRARY BOOKINGS */}
          {activeTab === 'LIBRARY_BOOKINGS' && (
            <div>
              {libraryBookings.length === 0 ? (
                <EmptyState
                  title="No Active Study Library Passes"
                  description="Reserve an air-conditioned personal study desk with high-speed WiFi and power sockets at an affiliated self-study library."
                  actionText="Find & Reserve a Study Seat"
                  onAction={() => window.location.href = '/find-library'}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {libraryBookings.map((booking) => (
                    <Card key={booking.id} className="p-6 bg-white border border-slate-200/90 shadow-sm rounded-2xl hover:border-brand-300 transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-black text-brand-600 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                            PASS REF: {booking.id}
                          </span>
                          <h3 className="font-extrabold text-base text-slate-950 mt-1.5">{booking.libraryName}</h3>
                          <p className="text-xs text-slate-500">{booking.district || 'Ghazipur'}</p>
                        </div>
                        <StatusBadge status={booking.status} size="sm" />
                      </div>

                      <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Allocated Cubicle</span>
                          <p className="font-black text-brand-700 text-sm mt-0.5 flex items-center gap-1.5">
                            <Armchair className="w-4 h-4 text-brand-600" />
                            <span>{booking.seatNumber}</span>
                          </p>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Study Shift</span>
                          <p className="font-bold text-slate-900 mt-0.5">{booking.shiftName || 'Regular Shift'}</p>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Validity Duration</span>
                          <p className="font-semibold text-slate-800 mt-0.5">{booking.startDate} to {booking.endDate}</p>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Monthly Fee Paid</span>
                          <p className="font-black text-emerald-700 mt-0.5">₹{booking.totalAmount || booking.amount || 499}</p>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Biometric Pass Active</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Download className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenReceipt(booking)}
                            className="text-slate-700 border-slate-300 hover:bg-slate-50"
                          >
                            Download Receipt
                          </Button>
                          <Link to={`/library/${booking.libraryId}`}>
                            <Button size="sm" variant="ghost" className="text-brand-600 hover:text-brand-700">
                              Library Info &rarr;
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TUTOR REQUESTS */}
          {activeTab === 'TUTOR_REQUESTS' && (
            <div>
              {tutorRequests.length === 0 ? (
                <EmptyState
                  title="No Home Tutor Requests Submitted"
                  description="Submit a request for an experienced, verified home educator tailored to your class, syllabus, subjects, and preferred schedule."
                  actionText="Request a Home Tutor"
                  onAction={() => window.location.href = '/student/tutor-request'}
                />
              ) : (
                <div className="space-y-4">
                  {tutorRequests.map((req) => (
                    <Card key={req.id} className="p-6 bg-white border border-slate-200/90 shadow-sm rounded-2xl hover:border-brand-300 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-brand-700 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                              REF: {req.id}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              Submitted on {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-base text-slate-950 mt-1">
                            {req.className || 'General Tuition'} — {req.subjects.join(', ')}
                          </h3>
                        </div>

                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                            req.status === 'ACTIVE' || req.status === 'TEACHER_ALLOTTED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : req.status === 'UNDER_REVIEW' || req.status === 'SUBMITTED'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {req.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-500 font-bold block uppercase text-[10px]">Area / Locality</span>
                          <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{req.area}, {req.district || 'Ghazipur'}</span>
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-500 font-bold block uppercase text-[10px]">Weekly Frequency</span>
                          <p className="font-bold text-slate-900 mt-0.5">
                            {req.frequency || 'Regular (3-4 days/week)'}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-500 font-bold block uppercase text-[10px]">Preferred Time Slot</span>
                          <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{req.preferredTime || '04:00 PM - 05:00 PM'}</span>
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-500 font-bold block uppercase text-[10px]">Expected Budget</span>
                          <p className="font-black text-brand-700 mt-0.5">
                            ₹{req.budgetMin || 3500} / month
                          </p>
                        </div>
                      </div>

                      {req.preferredTeacherName && (
                        <div className="mt-3.5 p-3 rounded-xl bg-brand-50/70 border border-brand-200/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
                            <p className="text-slate-700">
                              Direct Teacher Preference: <strong className="text-brand-950">{req.preferredTeacherName}</strong>
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-brand-700 uppercase bg-white px-2 py-0.5 rounded border border-brand-200">
                            Priority Routing
                          </span>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <ShieldCheck className="w-4 h-4 text-brand-600" />
                          <span>District Admin Verification Pending</span>
                        </div>
                        <p className="text-slate-500 font-medium">
                          Our team matches teachers within 24–48 hours.
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TUTOR ASSIGNMENTS */}
          {activeTab === 'TUTOR_ASSIGNMENTS' && (
            <div>
              {tutorAssignments.length === 0 ? (
                <EmptyState
                  title="No Active Home Tutor Assigned"
                  description="Once District Admin reviews and completes KYC matching for your request, your allotted tutor's schedule, qualification, and contact details will appear here."
                  actionText="Request a Tutor Now"
                  onAction={() => window.location.href = '/student/tutor-request'}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tutorAssignments.map((asg) => (
                    <Card key={asg.id} className="p-6 bg-white border border-slate-200/90 shadow-sm rounded-2xl hover:border-brand-300 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-black text-base shrink-0">
                            {asg.teacherName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ACTIVE ALLOTMENT
                            </span>
                            <h3 className="font-extrabold text-base text-slate-950 mt-1">{asg.teacherName}</h3>
                            <p className="text-xs text-slate-500">
                              {asg.subjects.join(', ')} • {asg.className || 'Academic Mentorship'}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={asg.status} size="sm" />
                      </div>

                      <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Class Schedule</span>
                          <p className="font-bold text-slate-900 mt-0.5">{asg.schedule || 'Mon, Wed, Fri (05:00 PM)'}</p>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Monthly Tuition Fee</span>
                          <p className="font-black text-slate-950 mt-0.5">₹{asg.monthlyFee.toLocaleString()}</p>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Start Date</span>
                          <p className="font-semibold text-slate-800 mt-0.5">{asg.startDate || 'Current Term'}</p>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Teacher Phone</span>
                          <p className="font-bold text-brand-700 mt-0.5">{asg.teacherPhone || 'Authorized in Portal'}</p>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <Link to="/student/attendance" className="text-brand-600 font-bold hover:underline flex items-center gap-1">
                          <span>View Class Attendance</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link to="/student/fees">
                          <Button size="sm" variant="outline" className="text-slate-700 border-slate-300 hover:bg-slate-50">
                            Fee Invoices
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: DEMO BOOKINGS */}
          {activeTab === 'DEMO_BOOKINGS' && (
            <div className="space-y-6">
              {/* One-time Eligibility Status Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Library Demo Status Card */}
                <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      Digital Library Demo
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      demoEligibility?.canBookLibrary
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {demoEligibility?.canBookLibrary ? 'Available (1-Time)' : 'Used Pass'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-slate-950">Library Demo Seat</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {demoEligibility?.canBookLibrary
                        ? 'Complimentary/subsidized study cabin trial at any partner library.'
                        : "You have already used your ZYZU'S Library Demo."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {demoEligibility?.canBookLibrary ? (
                      <Button
                        size="sm"
                        onClick={() => setDemoModalConfig({ isOpen: true, serviceType: 'LIBRARY' })}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
                      >
                        Book Library Demo Seat
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (demoEligibility?.libraryBooking) setSelectedDemoForCard(demoEligibility.libraryBooking);
                        }}
                        className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 font-bold text-xs"
                      >
                        View Library Demo ID Card
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Home Tuition Demo Status Card */}
                <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                      Home Tuition Demo
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      demoEligibility?.canBookHomeTuition
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {demoEligibility?.canBookHomeTuition ? 'Available (1-Time)' : 'Used Pass'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-slate-950">Home Tuition Demo Class</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {demoEligibility?.canBookHomeTuition
                        ? '1-on-1 trial class with a verified educator in your neighborhood.'
                        : "You have already used your ZYZU'S Home Tuition Demo."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {demoEligibility?.canBookHomeTuition ? (
                      <Button
                        size="sm"
                        onClick={() => setDemoModalConfig({ isOpen: true, serviceType: 'HOME_TUITION' })}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
                      >
                        Book Tuition Demo Class
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (demoEligibility?.tuitionBooking) setSelectedDemoForCard(demoEligibility.tuitionBooking);
                        }}
                        className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 font-bold text-xs"
                      >
                        View Tuition Demo ID Card
                      </Button>
                    )}
                  </div>
                </Card>
              </div>

              {/* Demo Bookings History */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  Your Issued Demo Passes ({demoBookings.length})
                </h3>

                {demoBookings.length === 0 ? (
                  <EmptyState
                    title="No Demo Bookings Yet"
                    description="Book your 1-time complimentary demo seat for Library or demo class for Home Tuition above."
                  />
                ) : (
                  <div className="space-y-3">
                    {demoBookings.map((dbk) => (
                      <Card key={dbk.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                              {dbk.demo_booking_id}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {dbk.booking_status}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {dbk.service_type === 'LIBRARY' ? 'Digital Library' : 'Home Tuition'}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-slate-950">{dbk.service_name}</h4>
                          <p className="text-xs text-slate-600 flex items-center gap-3">
                            <span>📅 {dbk.demo_date}</span>
                            <span>⏰ {dbk.demo_time}</span>
                            <span>📍 {dbk.service_address || `${dbk.district || 'Ghazipur'}`}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase font-bold block">Fee Paid</span>
                            <span className="font-extrabold text-slate-900 text-sm">
                              {dbk.price === 0 ? 'FREE (₹0)' : `₹${dbk.price}`}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            leftIcon={<QrCode className="w-3.5 h-3.5" />}
                            onClick={() => setSelectedDemoForCard(dbk)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm"
                          >
                            View Pass ID Card
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PAST BOOKINGS */}
          {activeTab === 'PAST_BOOKINGS' && (
            <div>
              {pastBookings.length === 0 ? (
                <EmptyState
                  title="No Past Booking Records"
                  description="Completed study cubicle subscriptions and completed tuition contracts will be securely archived here."
                />
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((b) => (
                    <Card key={b.id} className="p-5 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            REF: {b.id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            {b.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">{b.libraryName}</h4>
                        <p className="text-xs text-slate-500">
                          Cubicle {b.seatNumber} • {b.startDate} to {b.endDate}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Amount</span>
                          <span className="font-bold text-slate-900 text-sm">₹{b.totalAmount || b.amount || 499}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Download className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenReceipt(b)}
                          className="text-slate-700 border-slate-300 hover:bg-slate-50"
                        >
                          Receipt
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Official Corporate Receipt Modal */}
      <OfficialReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        data={receiptData}
      />

      {/* Demo ID Card Modal */}
      {selectedDemoForCard && (
        <DemoIdCardModal
          isOpen={Boolean(selectedDemoForCard)}
          onClose={() => setSelectedDemoForCard(null)}
          booking={selectedDemoForCard}
        />
      )}

      {/* Demo Booking Modal */}
      {demoModalConfig.isOpen && (
        <DemoBookingModal
          isOpen={demoModalConfig.isOpen}
          onClose={() => setDemoModalConfig(prev => ({ ...prev, isOpen: false }))}
          serviceType={demoModalConfig.serviceType}
          onBookingComplete={() => loadData()}
        />
      )}
    </div>
  );
};
