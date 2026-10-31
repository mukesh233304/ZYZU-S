import React, { useState, useEffect, useMemo } from 'react';
import { 
  useParams, useSearchParams, useNavigate, useLocation, Link 
} from 'react-router-dom';
import { 
  CheckCircle2, Clock, AlertTriangle, ShieldCheck, 
  Building, BookOpen, ArrowRight, UserCheck, MessageSquare, 
  ExternalLink, Sparkles, RefreshCw, CreditCard, ChevronRight,
  AlertCircle, LogIn, Check, Info, Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { qrPassService } from '../../services/qrPassService';
import { attendanceService } from '../../services/attendanceService';
import { 
  PersonalQrPass, QrValidationResult, StudentActiveAttendanceService, 
  AttendanceRecord 
} from '../../types';
import { Button } from '../../components/common/Button';
import { WhatsAppAlertPreviewModal } from '../../components/attendance/WhatsAppAlertPreviewModal';

// Live Duration Timer component for active checked-in sessions
const LiveDurationTimer: React.FC<{ checkInTime: string }> = ({ checkInTime }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const update = () => {
      const match = checkInTime.trim().match(/(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([AP]M))?/i);
      if (!match) {
        setElapsed('00h 01m 00s');
        return;
      }
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const seconds = match[3] ? parseInt(match[3], 10) : 0;
      const meridian = match[4]?.toUpperCase();
      if (meridian === 'PM' && hours < 12) hours += 12;
      if (meridian === 'AM' && hours === 12) hours = 0;
      
      const checkInDate = new Date();
      checkInDate.setHours(hours, minutes, seconds, 0);

      const diffMs = Math.max(0, Date.now() - checkInDate.getTime());
      const totalSecs = Math.floor(diffMs / 1000);
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;
      setElapsed(`${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [checkInTime]);

  return (
    <span className="font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg text-xs inline-flex items-center gap-1.5 shadow-2xs">
      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
      {elapsed}
    </span>
  );
};

export const QrAttendanceScanPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { token: routeToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();

  // Extract token from route param or query string
  const token = routeToken || searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [validationResult, setValidationResult] = useState<QrValidationResult | null>(null);
  const [pass, setPass] = useState<PersonalQrPass | null>(null);
  const [activeServices, setActiveServices] = useState<StudentActiveAttendanceService[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewRecord, setPreviewRecord] = useState<AttendanceRecord | null>(null);

  // Dynamic greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Today's formatted date string e.g. "28 September 2026"
  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  // 1. Auth Guard Check
  useEffect(() => {
    if (!user && !loading) {
      const returnUrl = location.pathname + location.search;
      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`, { replace: true });
    }
  }, [user, loading, location, navigate]);

  // 2. Authoritative Scan Processing
  const processScan = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setValidating(true);
    try {
      // Validate token authoritatively with current user
      const result = await qrPassService.validateAttendanceScan(token, user.id);
      setValidationResult(result);
      if (result.pass) {
        setPass(result.pass);
      } else {
        const p = await qrPassService.getPersonalQrPass(user.id);
        setPass(p);
      }

      // Refresh active services with today's attendance state
      const svcs = await attendanceService.getActiveServices(user.id);
      setActiveServices(svcs);
    } catch (err: any) {
      setValidationResult({
        valid: false,
        error: err?.message || 'Server error while validating QR pass.',
        errorCode: 'INVALID_QR',
      });
    } finally {
      setLoading(false);
      setValidating(false);
    }
  };

  useEffect(() => {
    processScan();
    // Subscribe to real-time attendance changes
    const unsub = attendanceService.subscribe(() => {
      if (user) {
        attendanceService.getActiveServices(user.id).then(setActiveServices);
      }
    });
    return () => unsub();
  }, [user, token]);

  // Handle Check-In for specific service
  const handleCheckIn = async (service: StudentActiveAttendanceService) => {
    if (!user) return;
    setActionLoading(service.serviceType);
    try {
      const res = await attendanceService.checkIn({
        studentId: user.id,
        studentName: user.name,
        serviceType: service.serviceType,
        targetId: service.serviceType === 'HOME_TUITION' ? service.teacherId : service.libraryId,
        targetName: service.serviceType === 'HOME_TUITION' ? service.teacherName : service.libraryName,
        teacherId: service.teacherId,
        teacherName: service.teacherName,
        libraryId: service.libraryId,
        libraryName: service.libraryName,
        referenceId: service.serviceType === 'HOME_TUITION' ? 'tuition-qr' : (service.seatNumber || 'library-qr'),
        source: 'STUDENT_QR',
        district: user.districtName || pass?.district,
        parentPhone: (user as any).parentPhone || pass?.parentPhone || user.mobile,
        parentName: (user as any).parentName || pass?.parentName,
      });

      addToast(
        `Checked in for ${service.serviceType === 'HOME_TUITION' ? 'Home Tuition' : 'Digital Library'}! Parent WhatsApp alert dispatched.`,
        'success'
      );
      setPreviewRecord(res.record);

      // Refresh services
      const svcs = await attendanceService.getActiveServices(user.id);
      setActiveServices(svcs);
    } catch (err: any) {
      addToast(err?.message || 'Failed to check in. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Check-Out for specific service
  const handleCheckOut = async (service: StudentActiveAttendanceService) => {
    if (!user) return;
    setActionLoading(service.serviceType);
    try {
      const todayAtt = service.todayAttendance;
      const res = await attendanceService.checkOut({
        attendanceId: todayAtt?.id,
        studentId: user.id,
        serviceType: service.serviceType,
      });

      addToast(
        `Checked out from ${service.serviceType === 'HOME_TUITION' ? 'Home Tuition' : 'Digital Library'}! Parent WhatsApp notification sent.`,
        'success'
      );
      setPreviewRecord(res.record);

      // Refresh services
      const svcs = await attendanceService.getActiveServices(user.id);
      setActiveServices(svcs);
    } catch (err: any) {
      addToast(err?.message || 'Failed to check out.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Render: Loading Screen
  if (loading || validating) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Verifying Attendance Pass
          </h2>
          <p className="text-xs text-slate-500">
            Authorizing student identity, active bookings, and current month fee status...
          </p>
        </div>
      </div>
    );
  }

  // Render: Not Authenticated State (Fallback if redirect delayed)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Authentication Required</h2>
            <p className="text-xs text-slate-500 mt-1">
              Please sign in to your student account to record attendance with this pass.
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`)}
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Sign In to FocusPoint
          </Button>
        </div>
      </div>
    );
  }

  // Render: Unpaid Fee Screen (Section 15)
  if (validationResult && !validationResult.attendanceAllowed && validationResult.errorCode === 'UNPAID_FEE') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl p-7 md:p-8 border border-slate-200 shadow-xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Payment Verification Required
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                Attendance Temporarily Unavailable
              </h2>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {validationResult.restrictionReason || 
              'Your service is currently inactive because the required fee for the current billing period has not been completed. Please complete the pending payment to restore attendance access.'}
          </p>

          {/* Pending Invoice Box */}
          {validationResult.pendingInvoice && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500 uppercase">Billing Period</span>
                <span className="font-black text-slate-900">{pass?.activeMonth || 'Current Month'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500 uppercase">Invoice Reference</span>
                <span className="font-mono text-slate-700 font-bold">{validationResult.pendingInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="font-black text-slate-900 text-sm">Amount Due</span>
                <span className="font-black text-amber-600 text-lg">
                  ₹{validationResult.pendingInvoice.amount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/student/fees"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-black bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20 transition-all text-center"
            >
              <CreditCard className="w-4 h-4" />
              Pay Now
            </Link>
            <Link
              to="/student/fees"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-center"
            >
              View Payment Details
            </Link>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={processScan}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Already paid? Check again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render: Invalid / Error States (Section 38)
  if (validationResult && !validationResult.valid) {
    const isCrossStudent = validationResult.errorCode === 'CROSS_STUDENT_PROHIBITED';
    const isNoBooking = validationResult.errorCode === 'NO_ACTIVE_SERVICE';

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {isCrossStudent 
                ? 'Cross-Student Access Prohibited'
                : isNoBooking 
                  ? 'No Active Booking Found' 
                  : 'QR Code Not Recognized'}
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {validationResult.error || 'This attendance pass is invalid or no longer active.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {isNoBooking ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/find-tutor"
                  className="px-4 py-2.5 rounded-xl text-xs font-black bg-brand-600 hover:bg-brand-500 text-white text-center"
                >
                  Book Home Tutor
                </Link>
                <Link
                  to="/find-library"
                  className="px-4 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white text-center"
                >
                  Book Study Library
                </Link>
              </div>
            ) : null}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/student/attendance')}
            >
              Go to Student Attendance
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render: SUCCESSFUL VALIDATION -> FOCUSPOINT ATTENDANCE CENTER (Section 17 & 18)
  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Mobile-First Sticky Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md">
              FP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black tracking-tight text-white uppercase">FocusPoint</h1>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  QR Verified ✓
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Smart Attendance Center</p>
            </div>
          </div>

          <Link
            to="/student/attendance"
            className="text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-brand-600">
              {greeting}, {user.name.split(' ')[0]}
            </span>
            <span className="text-xs font-bold text-slate-400">
              {formattedToday}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            FocusPoint Attendance Center
          </h2>
          <p className="text-xs text-slate-500">
            Mark your attendance for today. Your parent will receive an instant WhatsApp update.
          </p>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
            Your Active Services ({activeServices.length})
          </h3>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Independent Attendance Active
          </span>
        </div>

        {/* Service Cards (Home Tuition & Digital Library) */}
        <div className="space-y-4">
          {activeServices.map(service => {
            const isTuition = service.serviceType === 'HOME_TUITION';
            const att = service.todayAttendance;
            const isCheckedIn = !!att?.checkInTime && !att?.checkOutTime;
            const isCheckedOut = !!att?.checkOutTime;
            const isReady = !isCheckedIn && !isCheckedOut;
            const isLoading = actionLoading === service.serviceType;

            return (
              <div 
                key={service.id}
                className="bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-md hover:shadow-lg transition-all space-y-5"
              >
                {/* Service Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isTuition 
                        ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                        : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                    }`}>
                      {isTuition ? <BookOpen className="w-6 h-6" /> : <Building className="w-6 h-6" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {isTuition ? 'Home Tuition' : 'Digital Library'}
                      </span>
                      <h4 className="text-base font-black text-slate-900 leading-tight mt-0.5">
                        {isTuition ? (service.teacherName || 'Assigned Tutor') : (service.libraryName || 'FocusPoint Library')}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isTuition ? (service.subject || 'All Core Subjects') : `${service.shiftName} • ${service.seatNumber}`}
                      </p>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div>
                    {isCheckedIn && (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Checked In
                      </span>
                    )}
                    {isCheckedOut && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Completed
                      </span>
                    )}
                    {isReady && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Ready
                      </span>
                    )}
                  </div>
                </div>

                {/* State Details Panel */}
                {isCheckedIn && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        Session in Progress
                      </p>
                      <p className="text-xs text-emerald-950 font-bold">
                        Check-In: <span className="font-mono">{att.checkInTime}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase">Duration</p>
                      <LiveDurationTimer checkInTime={att.checkInTime!} />
                    </div>
                  </div>
                )}

                {isCheckedOut && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Check-In</p>
                      <p className="font-mono font-bold text-slate-800 mt-0.5">{att?.checkInTime || att?.checkIn}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Check-Out</p>
                      <p className="font-mono font-bold text-slate-800 mt-0.5">{att?.checkOutTime || att?.checkOut}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                      <p className="font-bold text-emerald-600 mt-0.5">{att?.duration || '1h 00m'}</p>
                    </div>
                  </div>
                )}

                {/* Action CTA Button */}
                <div>
                  {isReady && (
                    <button
                      type="button"
                      onClick={() => handleCheckIn(service)}
                      disabled={isLoading}
                      className="w-full py-4 rounded-2xl text-base font-black text-white bg-brand-600 hover:bg-brand-500 active:scale-[0.99] transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-5 h-5" />
                          <span>CHECK IN</span>
                        </>
                      )}
                    </button>
                  )}

                  {isCheckedIn && (
                    <button
                      type="button"
                      onClick={() => handleCheckOut(service)}
                      disabled={isLoading}
                      className="w-full py-4 rounded-2xl text-base font-black text-white bg-rose-600 hover:bg-rose-500 active:scale-[0.99] transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Clock className="w-5 h-5" />
                          <span>CHECK OUT</span>
                        </>
                      )}
                    </button>
                  )}

                  {isCheckedOut && (
                    <div className="w-full py-3 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold text-center border border-slate-200">
                      Attendance recorded for today • No further check-in required
                    </div>
                  )}
                </div>

                {/* Notification Delivery Feedback Indicator */}
                {att?.notificationStatus && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Parent WhatsApp Alert:</span>
                      <strong className="text-emerald-700 uppercase">{att.notificationStatus}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewRecord(att)}
                      className="text-brand-600 hover:underline font-bold text-[11px]"
                    >
                      View Preview
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Support & Bot Information */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-1">
          <p className="text-xs font-bold text-slate-700">
            FocusPoint Verified Attendance System
          </p>
          <p className="text-[11px] text-slate-500">
            Parent alerts dispatched via System Bot (+91 9196434387) • Non-reversible attendance ledger
          </p>
        </div>
      </div>

      {/* WhatsApp Alert Preview Modal */}
      {previewRecord && (
        <WhatsAppAlertPreviewModal
          isOpen={!!previewRecord}
          onClose={() => setPreviewRecord(null)}
          record={previewRecord}
        />
      )}
    </div>
  );
};
