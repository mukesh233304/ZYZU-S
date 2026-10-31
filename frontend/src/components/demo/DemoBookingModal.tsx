import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  ShieldCheck, 
  BookOpen, 
  GraduationCap,
  ArrowRight,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { demoService } from '../../services/demoService';
import { 
  DemoBooking, 
  DemoEligibility, 
  DemoPriceCalculation, 
  DemoServiceType 
} from '../../types';
import { notificationService } from '../../services/notificationService';
import { DemoIdCardModal } from './DemoIdCardModal';

export interface DemoBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType?: DemoServiceType;
  initialService?: DemoServiceType;
  serviceId?: string;
  serviceName?: string;
  serviceAddress?: string;
  prefillEntity?: { id?: string; name?: string; address?: string };
  state?: string;
  district?: string;
  districtName?: string;
  tutorSubject?: string;
  onBookingComplete?: (booking: DemoBooking) => void;
}

const TIME_SLOTS = [
  '09:00 AM - 10:30 AM (Morning Slot)',
  '11:00 AM - 12:30 PM (Midday Slot)',
  '02:00 PM - 03:30 PM (Afternoon Slot)',
  '05:00 PM - 06:30 PM (Evening Slot)'
];

export const DemoBookingModal: React.FC<DemoBookingModalProps> = ({
  isOpen,
  onClose,
  serviceType,
  initialService,
  serviceId,
  serviceName,
  serviceAddress,
  prefillEntity,
  state = 'Uttar Pradesh',
  district,
  districtName,
  tutorSubject,
  onBookingComplete
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeService, setActiveService] = useState<DemoServiceType>(
    serviceType || initialService || 'LIBRARY'
  );

  useEffect(() => {
    if (serviceType || initialService) {
      setActiveService(serviceType || initialService || 'LIBRARY');
    }
  }, [serviceType, initialService, isOpen]);

  const isLibrary = activeService === 'LIBRARY' || activeService === 'library';
  const normalizedServiceType: 'LIBRARY' | 'HOME_TUITION' = isLibrary ? 'LIBRARY' : 'HOME_TUITION';

  const effectiveServiceId = prefillEntity?.id || serviceId || (isLibrary ? 'lib-focus-saidpur' : 'usr-teacher-rahul');
  const effectiveServiceName = prefillEntity?.name || serviceName || (isLibrary ? 'FocusPoint Digital Study Hub' : 'FocusPoint Verified Home Tutor');
  const effectiveAddress = prefillEntity?.address || serviceAddress || 'FocusPoint Educational Hub, Main Road';
  const effectiveDistrict = districtName || district || 'Ghazipur';

  // Form State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0]);
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');

  // Async Flow State
  const [loading, setLoading] = useState<boolean>(true);
  const [bookingInProgress, setBookingInProgress] = useState<boolean>(false);
  const [eligibility, setEligibility] = useState<DemoEligibility | null>(null);
  const [priceCalc, setPriceCalc] = useState<DemoPriceCalculation | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<DemoBooking | null>(null);
  const [showIdCardModal, setShowIdCardModal] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<boolean>(false);
  const [pendingBooking, setPendingBooking] = useState<DemoBooking | null>(null);

  // Set default date to tomorrow
  useEffect(() => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    setSelectedDate(tmrw.toISOString().substring(0, 10));
  }, [isOpen]);

  // Load Eligibility & Price on open
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const fetchContext = async () => {
      setLoading(true);
      try {
        const studentId = user?.id || 'demo-student-id';
        const [elig, calc] = await Promise.all([
          demoService.checkEligibility(studentId),
          demoService.calculatePrice(normalizedServiceType, state, effectiveDistrict, effectiveServiceId)
        ]);

        if (mounted) {
          setEligibility(elig);
          setPriceCalc(calc);
        }
      } catch (err) {
        console.error('Error fetching demo context:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchContext();

    return () => {
      mounted = false;
    };
  }, [isOpen, user?.id, normalizedServiceType, state, effectiveDistrict, effectiveServiceId]);

  if (!isOpen) return null;

  const isAlreadyBooked = normalizedServiceType === 'LIBRARY' 
    ? !eligibility?.canBookLibrary 
    : !eligibility?.canBookHomeTuition;

  const existingBooking = normalizedServiceType === 'LIBRARY'
    ? eligibility?.libraryBooking
    : eligibility?.tuitionBooking;

  const alreadyUsedMessage = normalizedServiceType === 'LIBRARY'
    ? 'You have already used your FocusPoint Library Demo.'
    : 'You have already used your FocusPoint Home Tuition Demo.';

  const handleBookDemo = async () => {
    if (!user) {
      showToast('Please log in as a Student to book a demo pass', 'error');
      return;
    }

    if (isAlreadyBooked) {
      showToast(alreadyUsedMessage, 'error');
      return;
    }

    setBookingInProgress(true);
    try {
      const res = await demoService.bookDemo({
        student_id: user.id,
        student_name: user.name || user.email?.split('@')[0] || 'FocusPoint Student',
        student_photo: user.avatar,
        student_mobile: user.phone || user.mobile,
        service_type: normalizedServiceType,
        service_id: effectiveServiceId,
        service_name: effectiveServiceName,
        service_address: effectiveAddress,
        venue_details: effectiveAddress,
        tutor_subject: tutorSubject,
        state,
        district: effectiveDistrict,
        demo_date: selectedDate,
        demo_time: selectedSlot,
        notes: studentNotes
      });

      if (!res.success || !res.booking) {
        showToast(res.message || 'Demo booking failed', 'error');
        setBookingInProgress(false);
        return;
      }

      // Check if Free or Paid
      if (res.booking.payment_status === 'FREE' || res.booking.price === 0) {
        showToast(res.message || 'Demo Pass Confirmed Instantly!', 'success');
        setConfirmedBooking(res.booking);
        if (onBookingComplete) onBookingComplete(res.booking);
        setShowIdCardModal(true);

        // Auto WhatsApp notification
        try {
          notificationService.sendWhatsAppBookingConfirmation({
            recipientPhone: user?.phone || user?.mobile || '9876543210',
            recipientName: user?.name || 'Student',
            studentName: user?.name || 'Student',
            serviceType: normalizedServiceType === 'HOME_TUITION' ? 'HOME_TUITION' : 'LIBRARY',
            bookingRef: res.booking.id,
            facilityOrTeacherName: effectiveServiceName || 'FocusPoint Demo',
            amount: 0,
            transactionId: 'COMPLIMENTARY',
            details: {
              schedule: `${selectedDate} (${selectedSlot})`,
              shiftName: selectedSlot,
              startDate: selectedDate,
            },
          });
        } catch (e) {
          console.warn('Demo WhatsApp alert failed:', e);
        }
      } else {
        // Requires Payment Step
        setPendingBooking(res.booking);
        setPaymentStep(true);
        showToast('Demo registered. Please complete payment to confirm your seat.', 'info');
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      showToast('Failed to process demo booking. Please try again.', 'error');
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!pendingBooking) return;
    setBookingInProgress(true);

    try {
      const payRes = await demoService.processPayment(pendingBooking.id, {
        payment_id: `PAY-DEMO-${Date.now()}`,
        method: paymentMethod,
        transaction_id: `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      });

      if (payRes.success && payRes.booking) {
        showToast('Payment successful! Your Demo Pass is now confirmed.', 'success');
        setConfirmedBooking(payRes.booking);
        setPaymentStep(false);
        if (onBookingComplete) onBookingComplete(payRes.booking);
        setShowIdCardModal(true);

        // Auto WhatsApp notification
        try {
          notificationService.sendWhatsAppBookingConfirmation({
            recipientPhone: user?.phone || user?.mobile || '9876543210',
            recipientName: user?.name || 'Student',
            studentName: user?.name || 'Student',
            serviceType: (payRes.booking.service_type || 'LIBRARY').toUpperCase() === 'HOME_TUITION' ? 'HOME_TUITION' : 'LIBRARY',
            bookingRef: payRes.booking.id,
            facilityOrTeacherName: payRes.booking.service_name || 'FocusPoint Demo',
            amount: payRes.booking.price || 99,
            transactionId: payRes.booking.payment_id || `TXN-DEMO-${Date.now()}`,
            details: {
              schedule: `${payRes.booking.demo_date} (${payRes.booking.demo_time})`,
              shiftName: payRes.booking.demo_time,
              startDate: payRes.booking.demo_date,
            },
          });
        } catch (e) {
          console.warn('Demo WhatsApp alert failed:', e);
        }
      } else {
        showToast(payRes.message || 'Payment processing failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Payment simulation encountered an error', 'error');
    } finally {
      setBookingInProgress(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isLibrary ? 'bg-blue-600/20 text-blue-400' : 'bg-amber-600/20 text-amber-400'}`}>
                {isLibrary ? <BookOpen className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {isLibrary ? 'Book FocusPoint Demo Seat' : 'Book FocusPoint Demo Class'}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {isLibrary ? 'FocusPoint Digital Library Bureau' : 'FocusPoint Home Tuition Bureau'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {loading ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm">Evaluating demo eligibility and applicable pricing...</p>
              </div>
            ) : isAlreadyBooked ? (
              /* ALREADY USED RESTRICTION BANNER */
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-rose-950/40 border-2 border-rose-600/40 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="font-bold text-rose-200 text-base">
                        One-Time Demo Limit Reached
                      </h3>
                      <p className="text-sm font-semibold text-rose-300">
                        {alreadyUsedMessage}
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed pt-1">
                        Each registered student is entitled to exactly 1 complimentary/subsidized demo pass for {isLibrary ? 'Digital Library' : 'Home Tuition'}. You can still book full subscription seats or regular home tutor batches anytime!
                      </p>
                    </div>
                  </div>
                </div>

                {existingBooking && (
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Your Existing Pass:
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {existingBooking.booking_status}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="font-bold text-white">{existingBooking.service_name}</p>
                      <p className="text-xs text-cyan-400 font-mono">Pass ID: {existingBooking.demo_booking_id}</p>
                      <p className="text-xs text-slate-400">Date: {existingBooking.demo_date} • {existingBooking.demo_time}</p>
                    </div>

                    <button
                      onClick={() => {
                        setConfirmedBooking(existingBooking);
                        setShowIdCardModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/20"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      View My Demo ID Card Pass
                    </button>
                  </div>
                )}
              </div>
            ) : paymentStep && pendingBooking ? (
              /* PAYMENT SIMULATION STEP */
              <div className="space-y-5 animate-fadeIn">
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Demo Fee Payable</span>
                    <span className="text-2xl font-extrabold text-white">₹{pendingBooking.price}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    ID: <span className="font-mono text-cyan-300">{pendingBooking.demo_booking_id}</span> • {pendingBooking.service_name}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Choose Instant Payment Gateway
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['UPI', 'CARD', 'NETBANKING'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                          paymentMethod === m
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    256-Bit Encrypted Secure Demo Checkout
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Your fee is locked and verified directly by FocusPoint. No hidden recurring charges.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={bookingInProgress}
                  onClick={handleProcessPayment}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {bookingInProgress ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Pay ₹{pendingBooking.price} & Confirm Demo Pass
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* DEMO BOOKING FORM */
              <div className="space-y-5">
                {/* Target Service Card */}
                <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {isLibrary ? 'Selected Library' : 'Selected Home Tutor'}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{serviceName}</h4>
                      {tutorSubject && (
                        <p className="text-xs text-amber-300 font-semibold mt-0.5">Subject: {tutorSubject}</p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Locked Price</span>
                      <span className={`text-lg font-extrabold ${priceCalc?.isFree ? 'text-emerald-400' : 'text-cyan-300'}`}>
                        {priceCalc?.isFree ? 'FREE (₹0)' : `₹${priceCalc?.price}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>{serviceAddress || `${district}, ${state}`}</span>
                  </div>

                  {priceCalc?.ruleName && (
                    <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Rate Applied: <strong className="text-slate-300">{priceCalc.ruleName}</strong></span>
                      <span className="font-mono text-[10px] text-indigo-400 uppercase">{priceCalc.scopeUsed}</span>
                    </div>
                  )}
                </div>

                {/* 1-Time Benefit Notice */}
                <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-600/30 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-cyan-200/90 leading-relaxed">
                    <strong>Exclusive 1-Time Demo:</strong> Experience {isLibrary ? 'FocusPoint digital study cabin' : 'FocusPoint personalized home tuition'} before taking long-term enrollment.
                  </p>
                </div>

                {/* Slot Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      Select Demo Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().substring(0, 10)}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      Select Preferred Time Slot
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${
                            selectedSlot === slot
                              ? 'bg-indigo-600/25 border-indigo-500 text-white shadow'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{slot}</span>
                            {selectedSlot === slot && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Special Requirements / Goals (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={studentNotes}
                      onChange={(e) => setStudentNotes(e.target.value)}
                      placeholder="e.g. Need silent desk with AC socket / Preparing for Class 10 Board exams"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Confirm Action Button */}
                <button
                  type="button"
                  disabled={bookingInProgress || !selectedDate}
                  onClick={handleBookDemo}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 font-bold text-sm text-white shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {bookingInProgress ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : priceCalc?.isFree ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Free Demo Pass (₹0)
                    </>
                  ) : (
                    <>
                      Proceed to Book Demo Pass • ₹{priceCalc?.price}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ID Card Modal Launch */}
      {showIdCardModal && confirmedBooking && (
        <DemoIdCardModal
          isOpen={showIdCardModal}
          onClose={() => {
            setShowIdCardModal(false);
            onClose();
          }}
          booking={confirmedBooking}
        />
      )}
    </>
  );
};
