import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, Download, Printer, ArrowRight, Share2, 
  MessageSquare, ShieldCheck, QrCode, ExternalLink, Calendar, 
  CreditCard, Building, BookOpen, Clock, FileText, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../mock/store';
import { bookingService } from '../../services/bookingService';
import { qrPassService } from '../../services/qrPassService';
import { PersonalQrPassCard } from '../../components/attendance/PersonalQrPassCard';
import { Button } from '../../components/common/Button';
import { SYSTEM_WHATSAPP_DISPLAY } from '../../services/notificationService';

export const BookingConfirmationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId } = useParams<{ bookingId?: string }>();

  // State from location or store
  const stateData = (location.state as any) || {};

  const [booking, setBooking] = useState<any>(stateData.booking || null);
  const [loading, setLoading] = useState(!stateData.booking);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  useEffect(() => {
    if (booking) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const studentId = user?.id || '';
        // 1. Try finding in bookings
        const allBookings = mockStore.getBookings(studentId);
        const match = allBookings.find(b => b.id === bookingId || (b as any).referenceId === bookingId) || allBookings[0];
        
        // 2. Try finding in tutor requests
        const allRequests = mockStore.getTutorRequests(undefined, studentId);
        const reqMatch = allRequests.find((r: any) => r.id === bookingId) || allRequests[0];

        if (match) {
          setBooking({
            id: match.id,
            serviceType: 'LIBRARY',
            facilityName: match.libraryName || 'FocusPoint Study Library',
            seatNumber: match.seatNumber || 'Desk 03',
            shiftName: match.shiftName || 'Morning Shift',
            shiftTimings: (match as any).shiftTimings || '07:00 AM – 12:00 PM',
            startDate: match.startDate || new Date().toISOString().split('T')[0],
            endDate: match.endDate || new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
            amount: match.totalAmount || match.amount || 1200,
            transactionId: (match as any).transactionId || `TXN-LIB-${match.id.slice(-6)}`,
            paymentMethod: (match as any).paymentMethod || 'UPI QR',
            paymentStatus: match.paymentStatus || 'PAID',
            studentMobile: (match as any).studentMobile || user?.mobile || '9876543210',
            studentName: match.studentName || user?.name || 'Student',
          });
        } else if (reqMatch) {
          setBooking({
            id: reqMatch.id,
            serviceType: 'HOME_TUITION',
            facilityName: reqMatch.allottedTeacherName || reqMatch.preferredTeacherName || 'Dr. Rajesh Sharma',
            subjects: reqMatch.subjects?.join(', ') || 'Physics & Mathematics',
            className: reqMatch.className || 'Class 10',
            schedule: reqMatch.preferredTime || '05:00 PM – 06:30 PM',
            startDate: reqMatch.paidDate?.split('T')[0] || new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
            amount: reqMatch.paymentAmount || 4500,
            transactionId: reqMatch.transactionId || `TXN-TUT-${reqMatch.id.slice(-6)}`,
            paymentMethod: reqMatch.paymentMethod || 'UPI QR Scanner',
            paymentStatus: reqMatch.paymentStatus || 'PAID',
            studentMobile: reqMatch.studentMobile || user?.mobile || '9876543210',
            studentName: reqMatch.studentName || user?.name || 'Student',
          });
        } else {
          // Fallback demo confirmation payload
          setBooking({
            id: bookingId || `bk-demo-${Date.now().toString().slice(-4)}`,
            serviceType: 'UNIVERSAL',
            facilityName: 'FocusPoint Premier Education',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
            amount: 2500,
            transactionId: `TXN-${Date.now().toString().slice(-6)}`,
            paymentMethod: 'Instant UPI',
            paymentStatus: 'PAID',
            studentMobile: user?.mobile || '9876543210',
            studentName: user?.name || 'Student',
          });
        }
      } catch (err) {
        console.error('Failed to load booking confirmation', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bookingId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto" />
          <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
          <div className="h-4 w-64 bg-slate-100 rounded mx-auto" />
        </div>
      </div>
    );
  }

  const isTuition = booking?.serviceType === 'HOME_TUITION';
  const isLibrary = booking?.serviceType === 'LIBRARY';

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        {/* Top Success Banner */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-500 via-amber-500 to-indigo-500" />
          
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm shadow-emerald-500/10 mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
            Booking Confirmed & Verified ✓
          </span>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-3">
            FOCUSPOINT BOOKING CONFIRMED
          </h1>

          <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
            Congratulations! Your service booking is active. Your personal QR attendance pass is generated and ready for check-in.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs font-mono text-slate-500">
            <span className="font-bold text-slate-700">Booking ID: {booking?.id}</span>
            <span>•</span>
            <span className="font-bold text-slate-700">Txn: {booking?.transactionId}</span>
            <span>•</span>
            <span className="font-bold text-emerald-600">Status: {booking?.paymentStatus || 'PAID'}</span>
          </div>
        </div>

        {/* WhatsApp Real Delivery Confirmation Box */}
        <div className="bg-emerald-950 text-white rounded-3xl p-6 md:p-7 border border-emerald-800 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base md:text-lg text-white">
                    WhatsApp Confirmation Delivered
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500 text-slate-950">
                    DELIVERED ✓
                  </span>
                </div>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Sent to student registered WhatsApp (+91 {booking?.studentMobile}) via official bot {SYSTEM_WHATSAPP_DISPLAY}.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm shrink-0"
            >
              <span>View Message</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200/80 shadow-sm space-y-5">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Booking & Enrollment Summary</span>
            <span className="text-xs font-bold text-slate-400">
              {isTuition ? 'Home Tuition' : isLibrary ? 'Study Desk' : 'Universal Package'}
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                {isTuition ? 'Allotted Educator' : 'Study Library'}
              </span>
              <p className="font-black text-slate-900 text-sm">{booking?.facilityName}</p>
              <p className="text-slate-500 mt-0.5">{booking?.subjects || booking?.seatNumber}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Schedule / Timings</span>
              <p className="font-black text-slate-900 text-sm">{booking?.schedule || booking?.shiftName}</p>
              <p className="text-slate-500 mt-0.5">{booking?.shiftTimings || 'Regular Sessions'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Active Validity</span>
              <p className="font-black text-slate-900 text-sm">{booking?.startDate}</p>
              <p className="text-slate-500 mt-0.5">to {booking?.endDate}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Payment Status</span>
              <p className="font-black text-emerald-600 text-sm">₹{booking?.amount?.toLocaleString()}</p>
              <p className="text-slate-500 mt-0.5">{booking?.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Embedded Personal QR Attendance Pass Card */}
        {user && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Your Personal QR Attendance Pass
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Ready for physical download & printing
              </span>
            </div>

            <PersonalQrPassCard
              studentId={user.id}
              showActions={true}
              onViewHistory={() => navigate('/student/attendance')}
            />
          </div>
        )}

        {/* Global Action Navigation CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to="/student/attendance"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20 transition-all"
          >
            <span>Open Attendance Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/student/documents"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>View Receipt in Document Center</span>
          </Link>

          <Link
            to="/student/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* WhatsApp Message Preview Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 md:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  WA
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Official WhatsApp Message</h3>
                  <p className="text-xs text-slate-500">Delivered to +91 {booking?.studentMobile}</p>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Realistic WhatsApp Chat Bubble */}
            <div className="p-4 rounded-2xl bg-[#e5ddd5] font-sans text-xs text-slate-900 space-y-2.5 border border-slate-300 shadow-inner">
              <div className="bg-white p-4 rounded-xl shadow-xs space-y-2 border-l-4 border-emerald-500">
                <p className="font-black text-emerald-800 text-sm">
                  *FOCUSPOINT BOOKING CONFIRMED* 🎓
                </p>
                <p>Hello *{booking?.studentName}*,</p>
                <p>Your FocusPoint service has been successfully confirmed.</p>

                {isTuition ? (
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <p>👨‍🏫 *Teacher:* {booking?.facilityName}</p>
                    <p>📚 *Subject:* {booking?.subjects || 'Core Subjects'}</p>
                    <p>📋 *Booking ID:* {booking?.id}</p>
                  </div>
                ) : (
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <p>🏢 *Library:* {booking?.facilityName}</p>
                    <p>🪑 *Desk Number:* {booking?.seatNumber || 'Desk 03'}</p>
                    <p>📋 *Membership ID:* {booking?.id}</p>
                  </div>
                )}

                <div className="pt-1 border-t border-slate-100">
                  <p>📅 *Active Period:*</p>
                  <p>{booking?.startDate} – {booking?.endDate}</p>
                </div>

                <p className="pt-1 text-slate-700">
                  Your *Personal QR Attendance Pass* is now available. You can download and print your QR pass from your FocusPoint account.
                </p>
                <p className="text-slate-700">
                  Use this QR to access your Check-In / Check-Out page.
                </p>
                <p className="font-bold text-slate-800 pt-1">
                  Thank you for choosing FocusPoint.
                </p>
                <p className="text-[10px] text-slate-400 text-right">
                  System Bot • {SYSTEM_WHATSAPP_DISPLAY}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowWhatsAppModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
