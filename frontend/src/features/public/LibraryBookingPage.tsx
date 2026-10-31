import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookMarked, Calendar, Clock, Armchair, ShieldCheck, 
  CheckCircle2, ArrowLeft, ArrowRight, CreditCard, QrCode, 
  MapPin, AlertCircle, RefreshCw, Printer, Check, Smartphone, 
  Building, Lock, Tag, Sparkles, Percent
} from 'lucide-react';
import { policyService } from '../../services/policyService';
import { Offer } from '../../types/policy';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Stepper } from '../../components/common/Stepper';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { OfficialReceiptModal, ReceiptData } from '../../components/common/OfficialReceiptModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { libraryService } from '../../services/libraryService';
import { bookingService } from '../../services/bookingService';
import { mockStore } from '../../mock/store';
import { Library, LibraryShift } from '../../types';
import { ShiftDeskGrid } from '../../components/library/ShiftDeskGrid';
import { OfferBadge, OfferPriceDisplay } from '../../components/common/OfferBadge';
import { CheckoutCouponSection } from '../../components/checkout/CheckoutCouponSection';
import { CouponValidationResult } from '../../types/homepage';
import { convertReceiptDataToDocument } from '../../components/documents/UnifiedFeeReceipt';
import { documentService } from '../../services/documentService';
import { FuturisticWhatsAppBookingHub } from '../../components/attendance/FuturisticWhatsAppBookingHub';

export const LibraryBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [library, setLibrary] = useState<Library | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState<LibraryShift | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [studentName, setStudentName] = useState(user?.name || '');
  const [studentMobile, setStudentMobile] = useState(user?.mobile || '');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'upi_id' | 'card' | 'netbanking'>('upi_qr');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8910');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('•••');
  const [cardName, setCardName] = useState(user?.name || 'Aryan Singh');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [confirmedBookingData, setConfirmedBookingData] = useState<any | null>(null);

  // Offers & Policy Discounts State
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [customCoupon, setCustomCoupon] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Official Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [, setPolicyVersion] = useState(0);

  // Real-time reactive subscription to District Admin policy/offer changes
  useEffect(() => {
    return policyService.subscribe(() => setPolicyVersion(v => v + 1));
  }, []);

  useEffect(() => {
    const fetchLibrary = async () => {
      setLoading(true);
      if (id) {
        const data = await libraryService.getLibraryById(id);
        if (data) {
          setLibrary(data);
          if (data.shifts.length > 0) {
            setSelectedShift(data.shifts[0]);
          }
        }
      }
      setLoading(false);
    };
    fetchLibrary();
  }, [id]);

  useEffect(() => {
    if (user) {
      setStudentName(user.name);
      setStudentMobile(user.mobile || user.phone || '');
    }
  }, [user]);

  const steps = [
    { title: 'Date & Shift' },
    { title: 'Select Desk' },
    { title: 'Review Details' },
    { title: 'Payment & Confirm' },
  ];

  // Load eligible offers whenever library or shift updates
  useEffect(() => {
    if (library && selectedShift) {
      const gross = selectedShift.monthlyPrice || 0;
      const offers = policyService.getEligibleOffers({
        districtName: library.districtName || 'Ghazipur',
        serviceType: 'LIBRARY',
        targetId: library.id,
        amount: gross,
      });
      setAvailableOffers(offers);

      // Auto-apply best active offer if user hasn't explicitly selected or cleared one
      if (!selectedOffer && gross > 0) {
        const best = policyService.getBestActiveOffer({
          districtName: library.districtName || 'Ghazipur',
          serviceType: 'LIBRARY',
          targetId: library.id,
          amount: gross,
        });
        if (best.hasOffer && best.offer) {
          setSelectedOffer(best.offer);
          setCustomCoupon(best.offer.code || best.offer.id);
          setCouponMessage({ text: `Special Offer "${best.offer.title}" auto-applied! (${best.badgeText})`, type: 'success' });
        }
      }
    }
  }, [library, selectedShift]);

  const handleApplyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setSelectedOffer(null);
      setCouponMessage(null);
      return;
    }
    const allOffers = policyService.getOffers({ districtName: library?.districtName || 'Ghazipur', serviceType: 'LIBRARY' });
    const matched = allOffers.find(o => (o.code || o.id).toUpperCase() === cleanCode && o.status === 'ACTIVE');
    if (!matched) {
      setCouponMessage({ text: 'Invalid or inactive coupon code', type: 'error' });
      setSelectedOffer(null);
      return;
    }
    const minRequired = matched.minSpend || matched.minimumAmount || 0;
    if (minRequired > 0 && (selectedShift?.monthlyPrice || 0) < minRequired) {
      setCouponMessage({ text: `Minimum booking spend of ₹${minRequired} required for this coupon`, type: 'error' });
      setSelectedOffer(null);
      return;
    }
    setSelectedOffer(matched);
    setCouponMessage({ text: `Offer "${matched.title}" applied successfully!`, type: 'success' });
  };

  // Dynamic Financial Calculations from Policy Engine
  const grossPrice = selectedShift?.monthlyPrice || 0;
  const breakdown = policyService.calculateBreakdown({
    grossAmount: grossPrice,
    districtName: library?.districtName || 'Ghazipur',
    serviceType: 'LIBRARY',
    targetId: library?.id,
    offer: selectedOffer || undefined,
  });

  const handleSeatSelect = (seatNum: string) => {
    setSelectedSeat(seatNum);
  };

  const handleReviewToPayment = () => {
    if (!studentName || !studentMobile) {
      showToast('Please provide student name and mobile number', 'warning');
      return;
    }
    setCurrentStep(3); // Navigate to dedicated Payment & Confirmation step
  };

  // Real-time Payment Simulation (Test Mode)
  const handleExecutePayment = async (simulateSuccess = true) => {
    if (!library || !selectedShift || !selectedSeat) return;

    setPaymentStatus('PROCESSING');
    setPaymentError(null);

    await new Promise(r => setTimeout(r, 1400)); // Gateway processing simulation

    if (!simulateSuccess) {
      setPaymentStatus('FAILED');
      setPaymentError('Payment authorization failed: Bank server declined transaction. Please retry or choose a different payment method.');
      showToast('Payment failed. Booking not confirmed.', 'error');
      return;
    }

    try {
      const studentId = user?.id || `usr-student-${Date.now()}`;
      const txnId = `TXN-UPI-${Date.now().toString().slice(-8)}`;
      const bookingRef = `FP-LIB-${Date.now().toString().slice(-6)}`;
      const endDate = new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 30)).toISOString().split('T')[0];

      const booking = await bookingService.createBooking({
        studentId,
        studentName,
        studentMobile,
        libraryId: library.id,
        libraryName: library.name,
        districtId: library.districtId,
        shiftId: selectedShift.id,
        shiftName: selectedShift.name,
        seatNumber: selectedSeat,
        startDate: selectedDate,
        endDate: endDate,
        amount: breakdown.payableAmount,
        totalAmount: breakdown.payableAmount,
        originalAmount: breakdown.grossAmount,
        discountAmount: breakdown.discountAmount,
        appliedOfferCode: selectedOffer?.code || selectedOffer?.id,
        commissionRate: breakdown.commissionRate,
        commissionAmount: breakdown.commissionAmount,
        policySource: breakdown.policySource,
        providerAmount: breakdown.netSettlementAmount,
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod === 'upi_qr' ? 'UPI (Scanner)' : paymentMethod === 'upi_id' ? 'UPI ID' : paymentMethod === 'card' ? 'Credit/Debit Card' : 'Net Banking',
      });

      // Record invoice in store
      mockStore.addInvoice({
        id: `inv-lib-${Date.now().toString().slice(-6)}`,
        invoiceNumber: `INV-2026-${Date.now().toString().slice(-4)}`,
        userId: studentId,
        userName: studentName,
        type: 'LIBRARY_FEE',
        referenceId: booking.id,
        description: `Study Desk Pass (${selectedSeat}) - ${selectedShift.name}${selectedOffer ? ` [Offer: ${selectedOffer.code || selectedOffer.id}]` : ''}`,
        amount: breakdown.payableAmount,
        paidAmount: breakdown.payableAmount,
        balanceAmount: 0,
        dueDate: selectedDate,
        paidDate: new Date().toISOString().split('T')[0],
        status: 'PAID',
      });

      const confirmedPayload = {
        bookingId: booking.id,
        referenceId: bookingRef,
        libraryName: library.name,
        address: `${library.address || library.area}, ${library.districtName}`,
        seatNumber: selectedSeat,
        shiftName: selectedShift.name,
        shiftTimings: `${selectedShift.startTime} – ${selectedShift.endTime}`,
        startDate: selectedDate,
        endDate: endDate,
        amount: breakdown.payableAmount,
        originalAmount: breakdown.grossAmount,
        discountAmount: breakdown.discountAmount,
        appliedOfferCode: selectedOffer?.code || selectedOffer?.id,
        commissionAmount: breakdown.commissionAmount,
        providerAmount: breakdown.netSettlementAmount,
        transactionId: txnId,
        paymentMethodLabel: paymentMethod === 'upi_qr' ? 'UPI QR Scanner' : paymentMethod === 'card' ? 'Visa / MasterCard' : 'UPI Instant Pay',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      };

      setConfirmedBookingData(confirmedPayload);
      setPaymentStatus('SUCCESS');

      // Prepare unified receipt data with itemized coupon & discount line items
      const finalReceipt: ReceiptData = {
        receiptNumber: `FP-REC-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        studentName,
        studentId,
        studentMobile,
        studentEmail: user?.email,
        district: library.districtName,
        serviceType: 'STUDY_LIBRARY',
        serviceName: library.name,
        serviceDetails: `Desk: ${selectedSeat} • ${selectedShift.name} (${selectedShift.startTime} - ${selectedShift.endTime})${selectedOffer ? ` [Offer: ${selectedOffer.code || selectedOffer.id} -₹${breakdown.discountAmount}]` : ''}`,
        billingPeriod: `${selectedDate} to ${endDate}`,
        amount: breakdown.payableAmount,
        baseAmount: breakdown.grossAmount,
        originalAmount: breakdown.grossAmount,
        offerDiscount: breakdown.discountAmount > 0 ? breakdown.discountAmount : undefined,
        couponCode: selectedOffer?.code || selectedOffer?.id,
        couponDiscount: breakdown.discountAmount > 0 ? breakdown.discountAmount : undefined,
        paymentMethod: confirmedPayload.paymentMethodLabel,
        transactionId: txnId,
        status: 'PAID',
      };

      setReceiptData(finalReceipt);

      // Auto-archive into Document Center so My Documents has this exact receipt
      try {
        const unifiedDoc = convertReceiptDataToDocument(finalReceipt);
        documentService.addDocument(unifiedDoc);
      } catch (err) {
        console.warn('Could not auto-archive receipt document', err);
      }

      showToast('Payment confirmed! Your study pass is active.', 'success');
    } catch (e) {
      setPaymentStatus('FAILED');
      setPaymentError('Internal error finalizing booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (!library) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <ErrorState title="Library Not Found" onRetry={() => navigate('/find-library')} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <Link to={`/library/${library.id}`} className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-600 font-bold">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {library.name}</span>
      </Link>

      {/* Booking Wizard Card */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Reserve Your Study Seat
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            {library.name} • {library.area}, {library.districtName}
          </p>
        </div>

        {/* Stepper */}
        <Stepper steps={steps} currentStep={currentStep} />

        {/* ========================================================================= */}
        {/* STEP 0: Date & Shift Selection                                           */}
        {/* ========================================================================= */}
        {currentStep === 0 && (
          <div className="space-y-6 pt-2">
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-800 mb-2">
                1. Select Start Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-800 mb-2">
                2. Choose Study Shift
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {library.shifts.map((shift) => {
                  const isSelected = selectedShift?.id === shift.id;
                  const shiftPrice = shift.monthlyPrice || (shift.name.includes('Full') ? 999 : 499);
                  const shiftPricing = policyService.getBestActiveOffer({
                    districtName: library.districtName || 'Ghazipur',
                    serviceType: 'LIBRARY',
                    targetId: library.id,
                    amount: shiftPrice,
                  });

                  return (
                    <button
                      key={shift.id}
                      type="button"
                      onClick={() => setSelectedShift(shift)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-950">{shift.name}</h4>
                        </div>
                        <div className="text-right">
                          <OfferPriceDisplay pricing={shiftPricing} unit="/mo" size="sm" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{shift.startTime} – {shift.endTime}</span>
                      </p>
                      <span className="text-[10px] text-slate-500 font-bold block mt-1">
                        {shift.name.includes('Full') ? '⚡ 15 Hours Access' : '⏱️ 5 Hours Daily Shift'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                size="md"
                onClick={() => setCurrentStep(1)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                disabled={!selectedDate || !selectedShift}
                className="font-bold shadow-md shadow-brand-500/20"
              >
                Continue to Seat Selection
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: Visual Shift-Aware Seat Picker with Hover Popover                */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 pt-2">
            <ShiftDeskGrid
              seats={library.seats || []}
              shifts={library.shifts}
              selectedSeatNumber={selectedSeat}
              activeShiftId={selectedShift?.id}
              onShiftChange={(shift) => {
                setSelectedShift(shift);
                setSelectedSeat('');
              }}
              onSeatSelect={(seatNum, shift) => {
                setSelectedSeat(seatNum);
                setSelectedShift(shift);
              }}
              selectable={true}
              showShiftTabs={true}
            />

            {selectedSeat ? (
              <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-900 flex items-center justify-between font-bold shadow-xs">
                <span>Selected Desk: <strong>{selectedSeat}</strong></span>
                <span>Shift: <strong>{selectedShift?.name} (₹{selectedShift?.monthlyPrice || (selectedShift?.name.includes('Full') ? 999 : 499)})</strong></span>
              </div>
            ) : (
              <p className="text-xs text-amber-700 font-bold italic">Please click any available green desk for {selectedShift?.name} to proceed.</p>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(0)} className="border-slate-300 bg-white">
                Back
              </Button>
              <Button
                size="md"
                onClick={() => setCurrentStep(2)}
                disabled={!selectedSeat}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="font-bold shadow-md shadow-brand-500/20"
              >
                Review Booking Details
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Review Booking & Student Details                                 */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 pt-2">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <h4 className="font-black text-sm text-slate-950 border-b border-slate-200 pb-2">Booking Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 font-medium">
                <div><span className="text-slate-500">Library:</span> <strong className="text-slate-950">{library.name}</strong></div>
                <div><span className="text-slate-500">Locality:</span> {library.area}, {library.districtName}</div>
                <div><span className="text-slate-500">Reserved Desk:</span> <strong className="text-brand-700 font-black">{selectedSeat}</strong></div>
                <div><span className="text-slate-500">Shift Timings:</span> {selectedShift?.name} ({selectedShift?.startTime} – {selectedShift?.endTime})</div>
                <div><span className="text-slate-500">Duration:</span> 30 Days from {selectedDate}</div>
                <div>
                  <span className="text-slate-500">Original Pass Fee:</span>{' '}
                  {breakdown.discountAmount > 0 ? (
                    <span className="space-x-1.5">
                      <span className="line-through text-slate-400 font-bold">₹{breakdown.grossAmount}</span>
                      <strong className="text-slate-950 font-black">₹{breakdown.payableAmount}</strong>
                    </span>
                  ) : (
                    <strong className="text-slate-950 font-black">₹{breakdown.grossAmount}</strong>
                  )}
                </div>
                {breakdown.discountAmount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Offer Applied:</span>{' '}
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-black tracking-wide border border-rose-200">
                      🔥 {selectedOffer?.discountType === 'PERCENTAGE' ? `${selectedOffer.discountValue}% OFF` : `₹${selectedOffer?.discountValue} OFF`} ({selectedOffer?.code || selectedOffer?.id})
                    </span>
                    <strong className="text-emerald-700 font-bold">-₹{breakdown.discountAmount}</strong>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Net Payable Amount:</span>{' '}
                  <strong className="text-emerald-700 text-base font-black">₹{breakdown.payableAmount}</strong>
                </div>
              </div>
            </div>

            {/* Live Coupon & District Offers Section */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4">
              <CheckoutCouponSection
                theme="light"
                originalAmount={grossPrice}
                productServiceType="digital_library"
                stateId={library.stateId || 'loc-state-up'}
                districtId={library.districtId}
                libraryId={library.id}
                studentId={user?.id || 'usr-student-aryan'}
                onCouponApplied={(res: CouponValidationResult) => {
                  const now = new Date().toISOString();
                  const couponOffer: Offer = {
                    id: res.coupon?.id || res.couponCode,
                    districtName: library.districtName || 'Ghazipur',
                    districtId: library.districtId,
                    code: res.couponCode,
                    title: res.offer?.title || `Coupon ${res.couponCode}`,
                    description: res.offer?.description || '',
                    discountType: res.discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED',
                    discountValue: res.discountValue || 0,
                    maxDiscount: res.coupon?.maxDiscount,
                    minimumAmount: res.coupon?.minSpend || 0,
                    minSpend: res.coupon?.minSpend || 0,
                    status: 'ACTIVE',
                    serviceType: 'LIBRARY',
                    targetType: 'LIBRARY',
                    offerCategory: 'PROMOTIONAL',
                    startDate: res.offer?.startDate || '2026-01-01',
                    endDate: res.offer?.endDate || '2028-12-31',
                    usageLimit: res.coupon?.usageLimit || 0,
                    usageCount: res.coupon?.timesUsed || 0,
                    perUserLimit: 1,
                    allowStacking: false,
                    termsConditions: res.termsAndConditions?.join('; ') || 'Valid coupon code',
                    createdBy: 'SYSTEM_COUPON_ENGINE',
                    createdAt: now,
                    updatedAt: now,
                  };
                  setSelectedOffer(couponOffer);
                  setCustomCoupon(res.couponCode);
                  setCouponMessage({ text: `✓ Live Coupon ${res.couponCode} applied: Save ₹${res.discountAmount}!`, type: 'success' });
                }}
                onCouponRemoved={() => {
                  setSelectedOffer(null);
                  setCustomCoupon('');
                  setCouponMessage(null);
                }}
              />

              {/* Available clickable chips */}
              {availableOffers.length > 0 && (
                <div className="pt-2 border-t border-amber-200/60 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-amber-800">Or Select from Active District Offers:</span>
                  <div className="flex flex-wrap gap-2">
                    {availableOffers.map((off) => {
                      const isSelected = selectedOffer?.id === off.id;
                      return (
                        <button
                          key={off.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedOffer(null);
                              setCouponMessage(null);
                              setCustomCoupon('');
                            } else {
                              setSelectedOffer(off);
                              setCustomCoupon(off.code || off.id);
                              setCouponMessage({ text: `Applied: ${off.title} (${off.code || off.id})`, type: 'success' });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                              : 'bg-white text-slate-800 border-amber-200 hover:border-amber-400'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span className="font-mono">{off.code || off.id}</span>
                          <span className="text-[10px] opacity-80">
                            ({off.discountType === 'PERCENTAGE' ? `${off.discountValue}% OFF` : `₹${off.discountValue} OFF`})
                          </span>
                          {isSelected && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Student Contact Info */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase text-slate-800">Student Identity Verification</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter student name"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 shadow-xs focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={studentMobile}
                    onChange={(e) => setStudentMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 shadow-xs focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)} className="border-slate-300 bg-white">
                Back to Desks
              </Button>
              <Button
                size="md"
                onClick={handleReviewToPayment}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="font-black shadow-md shadow-brand-500/25"
              >
                Continue to Payment (₹{breakdown.payableAmount})
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: PAYMENT & CONFIRMATION (Dedicated Payment Gateway UI)            */}
        {/* ========================================================================= */}
        {currentStep === 3 && paymentStatus !== 'SUCCESS' && (
          <div className="space-y-6 pt-2">
            
            {/* Payment Summary Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-50 to-amber-50/40 border border-brand-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-700">Total Payable Amount</span>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-slate-950">₹{breakdown.payableAmount}</p>
                    {breakdown.discountAmount > 0 && (
                      <span className="text-sm font-bold text-slate-400 line-through">
                        ₹{breakdown.grossAmount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    30 Days Desk Pass • {library.name}{selectedOffer ? ` (Offer: ${selectedOffer.code || selectedOffer.id} -₹${breakdown.discountAmount})` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-Bit SSL Encrypted</span>
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Development / Sandbox Test Mode</p>
                </div>
              </div>

              {/* Financial Transparency breakdown */}
              <div className="pt-2 border-t border-brand-100 flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-medium gap-2">
                <span>
                  District Retains: <strong className="text-slate-800">₹{breakdown.commissionAmount}</strong> ({breakdown.commissionRate}% commission • <span className="font-mono">{breakdown.policySource === 'CUSTOM_OVERRIDE' ? 'Custom Override' : 'District Common'}</span>)
                </span>
                <span>
                  Library Owner Payout: <strong className="text-emerald-700 font-bold">₹{breakdown.netSettlementAmount}</strong>
                </span>
              </div>
            </div>

            {/* Error Message if Failed */}
            {paymentStatus === 'FAILED' && paymentError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-800 space-y-2">
                <div className="flex items-center gap-2 font-black">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Payment Failed</span>
                </div>
                <p>{paymentError}</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => handleExecutePayment(true)}>
                    Retry Payment
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setPaymentStatus('IDLE')}>
                    Change Payment Method
                  </Button>
                </div>
              </div>
            )}

            {/* Processing State */}
            {paymentStatus === 'PROCESSING' && (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-950">Processing Your Payment...</h3>
                  <p className="text-xs text-slate-600">Simulating bank authorization and desk reservation. Do not refresh.</p>
                </div>
              </div>
            )}

            {paymentStatus !== 'PROCESSING' && (
              <div className="space-y-5">
                {/* Payment Method Selector Tabs */}
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-800 mb-2">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi_qr')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'upi_qr'
                          ? 'bg-brand-50 border-brand-600 text-brand-900 ring-1 ring-brand-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <QrCode className="w-5 h-5 mx-auto mb-1 text-brand-600" />
                      <span className="text-xs font-extrabold block">UPI QR Scanner</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi_id')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'upi_id'
                          ? 'bg-brand-50 border-brand-600 text-brand-900 ring-1 ring-brand-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 mx-auto mb-1 text-brand-600" />
                      <span className="text-xs font-extrabold block">UPI Apps / ID</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'bg-brand-50 border-brand-600 text-brand-900 ring-1 ring-brand-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1 text-brand-600" />
                      <span className="text-xs font-extrabold block">Credit / Debit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'netbanking'
                          ? 'bg-brand-50 border-brand-600 text-brand-900 ring-1 ring-brand-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Building className="w-5 h-5 mx-auto mb-1 text-brand-600" />
                      <span className="text-xs font-extrabold block">Net Banking</span>
                    </button>
                  </div>
                </div>

                {/* UPI QR SCANNER INTERFACE */}
                {paymentMethod === 'upi_qr' && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
                    <div className="w-44 h-44 bg-white p-3 rounded-2xl border border-slate-200 shadow-md mx-auto flex flex-col items-center justify-center space-y-2">
                      <QrCode className="w-32 h-32 text-slate-900" />
                      <span className="text-[10px] font-black text-brand-700 uppercase">ZYZU'S Pay</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-slate-900">Scan using any UPI App</p>
                      <p className="text-[11px] text-slate-500">Google Pay • PhonePe • Paytm • BHIM • Cred</p>
                    </div>
                  </div>
                )}

                {/* UPI ID INPUT */}
                {paymentMethod === 'upi_id' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <label className="block text-xs font-bold text-slate-800 uppercase">Enter Virtual Payment Address (VPA)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. aryan@okhdfcbank"
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                      />
                      <Button size="sm" onClick={() => setUpiId('student@okhdfcbank')}>
                        Auto Fill
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 font-medium">
                      <span>Supported: @upi, @okaxis, @okhdfcbank, @paytm, @ybl</span>
                    </div>
                  </div>
                )}

                {/* CREDIT/DEBIT CARD INPUT */}
                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* NET BANKING */}
                {paymentMethod === 'netbanking' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <label className="block font-bold text-slate-700">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-900"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                    </select>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <Button
                    size="lg"
                    onClick={() => handleExecutePayment(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-600/25"
                  >
                    Authorize & Pay ₹{breakdown.payableAmount}
                  </Button>
                  
                  {/* Option to test failure per prompt requirement */}
                  <button
                    type="button"
                    onClick={() => handleExecutePayment(false)}
                    className="w-full text-[11px] text-slate-500 hover:text-rose-600 underline font-medium cursor-pointer"
                  >
                    Simulate Failed Bank Transaction (Test Failure Handling)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: SUCCESS CONFIRMATION & OFFICIAL RECEIPT                            */}
        {/* ========================================================================= */}
        {currentStep === 3 && paymentStatus === 'SUCCESS' && confirmedBookingData && (
          <div className="py-4 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-300 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase tracking-wider">
                Booking & Payment Confirmed
              </span>
              <h2 className="text-2xl font-black text-slate-950 mt-2">Your Desk Pass is Active!</h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-sm mx-auto">
                Payment received via {confirmedBookingData.paymentMethodLabel}. Biometric turnstile access has been enabled.
              </p>
            </div>

            {/* Official Pass & Reference Card */}
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 text-xs shadow-md">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-extrabold text-brand-700">ZYZU'S STUDY PASS</span>
                <span className="font-mono text-slate-500 font-bold">Ref: {confirmedBookingData.referenceId}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium">
                <div><span className="text-slate-500">Student:</span> {studentName}</div>
                <div><span className="text-slate-500">Library:</span> {confirmedBookingData.libraryName}</div>
                <div><span className="text-slate-500">Desk:</span> <strong className="text-brand-700 font-black">{confirmedBookingData.seatNumber}</strong></div>
                <div><span className="text-slate-500">Shift:</span> {confirmedBookingData.shiftName}</div>
                <div><span className="text-slate-500">Amount Paid:</span> <strong className="text-slate-950">₹{confirmedBookingData.amount}</strong></div>
                <div><span className="text-slate-500">Txn ID:</span> <span className="font-mono">{confirmedBookingData.transactionId}</span></div>
              </div>
            </div>

            {/* Futuristic WhatsApp Confirmation Dispatch Hub */}
            <div className="max-w-md mx-auto text-left">
              <FuturisticWhatsAppBookingHub
                recipientPhone={studentMobile || '9876543210'}
                recipientName={studentName}
                serviceType="LIBRARY"
                bookingRef={confirmedBookingData.referenceId || confirmedBookingData.bookingId}
                facilityOrTeacherName={confirmedBookingData.libraryName}
                amount={confirmedBookingData.amount}
                transactionId={confirmedBookingData.transactionId}
                detailsText={`Desk ${confirmedBookingData.seatNumber} • ${confirmedBookingData.shiftName} (${confirmedBookingData.shiftTimings})`}
                autoLaunch={false}
              />
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Link to={`/booking/confirmation/${confirmedBookingData.bookingId || confirmedBookingData.referenceId}`} state={{ booking: {
                id: confirmedBookingData.bookingId || confirmedBookingData.referenceId,
                serviceType: 'LIBRARY',
                facilityName: confirmedBookingData.libraryName,
                seatNumber: confirmedBookingData.seatNumber,
                shiftName: confirmedBookingData.shiftName,
                shiftTimings: confirmedBookingData.shiftTimings,
                startDate: confirmedBookingData.startDate,
                endDate: confirmedBookingData.endDate,
                amount: confirmedBookingData.amount,
                transactionId: confirmedBookingData.transactionId,
                paymentMethod: confirmedBookingData.paymentMethodLabel,
                paymentStatus: 'PAID',
                studentMobile: studentMobile || '9876543210',
                studentName: studentName || 'Student',
              }}}>
                <Button size="md" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold shadow-md flex items-center justify-center gap-2">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>View Confirmation & QR Pass</span>
                </Button>
              </Link>
              <Button
                size="md"
                onClick={() => setReceiptModalOpen(true)}
                leftIcon={<Printer className="w-4 h-4" />}
                className="bg-brand-600 text-white font-bold shadow-md shadow-brand-500/25"
              >
                Download Official Receipt
              </Button>
              <Link to="/student/bookings">
                <Button variant="outline" size="md" className="border-slate-300 text-slate-800 hover:bg-slate-100 font-bold">
                  View in My Bookings
                </Button>
              </Link>
              <Link to="/student/dashboard">
                <Button variant="outline" size="md" className="border-slate-300 text-slate-800 hover:bg-slate-100 font-bold">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Official Receipt Modal */}
      <OfficialReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        data={receiptData}
      />
    </div>
  );
};
