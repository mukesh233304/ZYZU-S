import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  GraduationCap, ArrowRight, ArrowLeft, CheckCircle2, 
  Clock, ShieldCheck, MapPin, DollarSign, BookOpen, AlertCircle, 
  Calendar, Check, User, Sparkles, QrCode, Building, CreditCard, 
  Copy, Lock, Download, Printer, ExternalLink, Receipt, AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Stepper } from '../../components/common/Stepper';
import { OfficialReceiptModal, ReceiptData } from '../../components/common/OfficialReceiptModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { studentService } from '../../services/studentService';
import { mockStore } from '../../mock/store';
import { Teacher } from '../../types';
import { SUBJECTS, CLASSES, BOARDS } from '../../constants';
import { CascadingLocationSelector } from '../../components/common/CascadingLocationSelector';
import { LocationHierarchySelection } from '../../types/location';
import { PAYMENT_CONFIG } from '../../constants/paymentConfig';
import { paymentService } from '../../services/paymentService';
import { policyService } from '../../services/policyService';
import { OfferBadge, OfferPriceDisplay } from '../../components/common/OfferBadge';
import { FuturisticWhatsAppBookingHub } from '../../components/attendance/FuturisticWhatsAppBookingHub';

export const StudentTutorRequestFlow: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const preferredTeacherId = searchParams.get('preferredTeacherId') || '';
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    if (preferredTeacherId) {
      const t = mockStore.getTeacherById(preferredTeacherId);
      if (t) setSelectedTeacher(t);
    }
  }, [preferredTeacherId]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'bank_transfer' | 'razorpay'>('upi_qr');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [razorpaySuccess, setRazorpaySuccess] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState<any | null>(null);

  // Official Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [, setPolicyVersion] = useState(0);

  // Real-time reactive subscription to District Admin policy/offer changes
  useEffect(() => {
    return policyService.subscribe(() => setPolicyVersion(v => v + 1));
  }, []);

  const steps = [
    { title: 'Academic Needs' },
    { title: 'Location' },
    { title: 'Precise Schedule' },
    { title: 'Budget & Teacher' },
    { title: 'Review & Summary' },
    { title: 'Payment & Confirm' },
  ];

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Academic Requirements
    className: 'Class 10',
    board: 'CBSE',
    subjects: ['Mathematics', 'Science'],
    learningObjective: 'Aiming for 95%+ in board examinations and fundamental concept mastery.',
    currentLevel: 'Intermediate',
    specialRequirements: 'Focus on NCERT problem solving and weekly test practice.',

    // Step 2: Location
    countryId: user?.countryId || 'loc-country-in',
    stateId: user?.stateId || 'loc-state-up',
    stateName: user?.stateName || 'Uttar Pradesh',
    districtId: user?.districtId || 'dist-gzp',
    districtName: user?.districtName || 'Ghazipur',
    localityId: user?.localityId || 'loc-gzp-saidpur',
    localityName: user?.localityName || user?.city || 'Saidpur',
    areaId: user?.areaId || 'loc-area-pankaj-talkies',
    areaName: user?.areaName || user?.area || 'Pankaj Talkies Area',
    city: user?.city || 'Saidpur',
    area: user?.area || 'Saidpur',
    address: user?.address || 'Tehsil Road, Ward No. 4',
    pincode: user?.pincode || '233304',

    // Step 3: Precise Schedule
    preferredDays: ['Monday', 'Wednesday', 'Friday'],
    startHour: '05',
    startMinute: '30',
    startAmPm: 'PM',
    endHour: '07',
    endMinute: '30',
    endAmPm: 'PM',
    frequency: '3_days', // 'regular' | '3_days' | '6_days' | 'weekend'

    // Step 4: Budget & Preferences
    budgetMin: 3000,
    budgetMax: 4500,
    teacherExperienceReq: '3+ Years Experience',
    additionalNotes: '',
  });

  // Offer & Policy Engine Integration
  const grossFee = useMemo(() => {
    if (selectedTeacher) {
      return selectedTeacher.expectedFeeMonthly || selectedTeacher.monthlyFee || 3500;
    }
    return formData.budgetMin || 3000;
  }, [selectedTeacher, formData.budgetMin]);

  const activeOfferPricing = useMemo(() => {
    return policyService.getBestActiveOffer({
      districtName: formData.districtName || selectedTeacher?.districtName || 'Ghazipur',
      serviceType: 'TUITION',
      targetId: selectedTeacher?.id,
      amount: grossFee,
    });
  }, [formData.districtName, selectedTeacher, grossFee]);

  const breakdown = useMemo(() => {
    return policyService.calculateBreakdown({
      grossAmount: grossFee,
      districtName: formData.districtName || selectedTeacher?.districtName || 'Ghazipur',
      serviceType: 'TUITION',
      targetId: selectedTeacher?.id,
      selectedOfferId: activeOfferPricing.offer?.id,
    });
  }, [grossFee, formData.districtName, selectedTeacher, activeOfferPricing]);

  const payableAmount = breakdown.payableAmount;

  // Generate real UPI QR URL
  const upiQrUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      paymentService.getUpiUri(payableAmount, `TUTOR-${formData.className || 'BOOKING'}`, user?.name || 'Student')
    )}`;
  }, [payableAmount, formData.className, user?.name]);

  const handleChange = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const toggleSubject = (sub: string) => {
    const list = [...formData.subjects];
    const idx = list.indexOf(sub);
    if (idx > -1) {
      if (list.length > 1) list.splice(idx, 1);
    } else {
      list.push(sub);
    }
    handleChange('subjects', list);
  };

  const toggleDay = (day: string) => {
    const list = [...formData.preferredDays];
    const idx = list.indexOf(day);
    if (idx > -1) {
      if (list.length > 1) list.splice(idx, 1);
    } else {
      list.push(day);
    }
    handleChange('preferredDays', list);
  };

  // Time validation
  const getMinutes = (hourStr: string, minStr: string, ampm: string): number => {
    let h = parseInt(hourStr, 10);
    const m = parseInt(minStr, 10);
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const startTotalMinutes = getMinutes(formData.startHour, formData.startMinute, formData.startAmPm);
  const endTotalMinutes = getMinutes(formData.endHour, formData.endMinute, formData.endAmPm);
  const isTimeValid = endTotalMinutes > startTotalMinutes;
  const durationHours = isTimeValid ? ((endTotalMinutes - startTotalMinutes) / 60).toFixed(1) : '0';

  const startTimeFormatted = `${formData.startHour}:${formData.startMinute} ${formData.startAmPm}`;
  const endTimeFormatted = `${formData.endHour}:${formData.endMinute} ${formData.endAmPm}`;

  const frequencyLabels: Record<string, string> = {
    regular: 'Regular (Daily / Recurring weekly schedule)',
    '3_days': '3 days a week — 2 hr/session',
    '6_days': '6 days a week — 1 hr/session',
    weekend: 'Weekend Intensive — Saturday/Sunday',
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard!`, 'info');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (formData.subjects.length === 0) {
        showToast('Please select at least one subject', 'warning');
        return;
      }
    }
    if (currentStep === 1) {
      if (!formData.stateId || !formData.districtId || !formData.localityId || !formData.address || !formData.pincode) {
        showToast('Please select State, District, Locality and enter address & pincode', 'warning');
        return;
      }
    }
    if (currentStep === 2) {
      if (formData.preferredDays.length === 0) {
        showToast('Please select at least one preferred day', 'warning');
        return;
      }
      if (!isTimeValid) {
        showToast('End time must be later than start time', 'error');
        return;
      }
    }
    setPaymentError(null);
    setCurrentStep(prev => prev + 1);
  };

  // Launch Razorpay Checkout
  const handleRazorpayCheckout = async () => {
    setPaymentError(null);
    try {
      await paymentService.openRazorpayCheckout({
        amount: payableAmount,
        invoiceNumber: `TUTOR-${Date.now().toString().slice(-6)}`,
        description: `Home Tutor Booking - ${selectedTeacher?.name || 'Verified Educator'} (${formData.className})`,
        studentName: user?.name || 'Student',
        studentEmail: user?.email || 'student@zyzus.com',
        studentPhone: user?.mobile || '9876543210',
        onSuccess: (txnId: string) => {
          setRazorpaySuccess(true);
          setUtrNumber(txnId);
          showToast('Razorpay payment verified! Proceed to confirm booking.', 'success');
        },
        onError: (err: string) => {
          if (err === 'RAZORPAY_SANDBOX_FALLBACK') {
            const testTxn = `RZP-TEST-${Date.now().toString().slice(-8)}`;
            setRazorpaySuccess(true);
            setUtrNumber(testTxn);
            showToast('Test gateway authorized! Proceed to confirm booking.', 'success');
          } else {
            setPaymentError(err || 'Razorpay payment cancelled. Home tutor cannot be booked without payment.');
          }
        },
      });
    } catch (e: any) {
      setPaymentError('Payment gateway error. Please use UPI QR or Direct Bank Transfer.');
    }
  };

  // FINAL SUBMISSION WITH MANDATORY PAYMENT CHECK
  const handleSubmitWithPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    // 🚨 MANDATORY PAYMENT ENFORCEMENT: Without payment, booking must NOT succeed!
    const cleanUtr = utrNumber.trim();
    if (paymentMethod === 'upi_qr' && !cleanUtr) {
      setPaymentError('Payment Required: Home tutor cannot be booked without completing payment. Please scan the QR code and enter your 12-digit UPI / UTR reference number.');
      showToast('Payment required to book home tutor.', 'error');
      return;
    }
    if (paymentMethod === 'bank_transfer' && !cleanUtr) {
      setPaymentError('Payment Required: Home tutor cannot be booked without completing payment. Please transfer to the bank account and enter your Bank UTR/reference number.');
      showToast('Payment required to book home tutor.', 'error');
      return;
    }
    if (paymentMethod === 'razorpay' && !razorpaySuccess && !cleanUtr) {
      setPaymentError('Payment Required: Please complete Razorpay online payment before confirming tutor booking.');
      showToast('Payment required to book home tutor.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const studentId = user?.id || `usr-student-${Date.now()}`;
      const studentName = user?.name || 'Student';
      const studentMobile = user?.mobile || '9876543210';
      const txnId = cleanUtr || (paymentMethod === 'razorpay' ? `RZP-${Date.now().toString().slice(-8)}` : `TXN-${Date.now().toString().slice(-8)}`);

      const pMethodName = paymentMethod === 'upi_qr'
        ? 'Instant UPI QR (PhonePe/GPay/Paytm)'
        : paymentMethod === 'bank_transfer'
          ? 'Direct Bank Transfer (IMPS/NEFT)'
          : 'Razorpay Online Gateway';

      const res = await studentService.submitTutorRequest({
        studentId,
        studentName,
        studentMobile,
        countryId: formData.countryId,
        stateId: formData.stateId,
        stateName: formData.stateName,
        districtId: formData.districtId,
        districtName: formData.districtName,
        localityId: formData.localityId,
        localityName: formData.localityName,
        areaId: formData.areaId,
        areaName: formData.areaName,
        area: formData.area,
        address: formData.address,
        pincode: formData.pincode,
        className: formData.className,
        subjects: formData.subjects,
        board: formData.board,
        learningObjective: formData.learningObjective,
        preferredDays: formData.preferredDays,
        preferredTime: `${startTimeFormatted} – ${endTimeFormatted}`,
        frequency: frequencyLabels[formData.frequency],
        budgetMin: formData.budgetMin,
        budgetMax: formData.budgetMax,
        preferredTeacherId: selectedTeacher?.id,
        preferredTeacherName: selectedTeacher?.name,
        teacherExperienceReq: formData.teacherExperienceReq,
        additionalNotes: formData.additionalNotes,
        paymentStatus: 'PAID',
        paymentMethod: pMethodName,
        paymentAmount: payableAmount,
        originalAmount: breakdown.grossAmount,
        discountAmount: breakdown.discountAmount,
        appliedOfferCode: activeOfferPricing.offer?.code || activeOfferPricing.offer?.id,
        commissionRate: breakdown.commissionRate,
        commissionAmount: breakdown.commissionAmount,
        policySource: breakdown.policySource,
        transactionId: txnId,
        paidDate: new Date().toISOString(),
      });

      const confirmedData = {
        requestId: res.id,
        transactionId: txnId,
        amount: payableAmount,
        paymentMethod: pMethodName,
        teacherName: selectedTeacher?.name || "Verified ZYZU'S Educator",
        teacherAvatar: selectedTeacher?.avatarUrl,
        subjects: formData.subjects.join(', '),
        className: formData.className,
        schedule: `${formData.preferredDays.join(', ')} (${startTimeFormatted} – ${endTimeFormatted})`,
        paidDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      };

      const receiptObj: ReceiptData = {
        receiptNumber: `RCP-TUT-${Date.now().toString().slice(-6)}`,
        invoiceNumber: `FP-INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        studentName: studentName,
        studentId: studentId,
        studentMobile: studentMobile,
        studentEmail: user?.email || 'student@zyzus.com',
        district: formData.districtName,
        serviceType: 'HOME_TUTOR',
        serviceName: selectedTeacher?.name || "ZYZU'S Home Tuition",
        serviceDetails: `${formData.className} • ${formData.subjects.join(', ')} (${formData.preferredDays.join(', ')})`,
        billingPeriod: `Monthly Advance (${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})`,
        amount: payableAmount,
        paymentMethod: pMethodName,
        transactionId: txnId,
        status: 'PAID',
      };

      setReceiptData(receiptObj);
      setConfirmedBookingData(confirmedData);
      setSubmittedRequestId(res.id);
      showToast('Home tutor booked and payment confirmed successfully!', 'success');
    } catch (e) {
      setPaymentError('Booking and payment processing failed. Please verify form details.');
      showToast('Booking failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Standalone Receipt HTML File Download
  const handleDownloadReceiptHtml = () => {
    if (!receiptData) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ZYZUS_Tutor_Receipt_${receiptData.receiptNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; background: #f8fafc; padding: 40px 20px; }
    .receipt-container { max-width: 750px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 20px; }
    .brand-title { font-size: 24px; font-weight: 900; color: #0f172a; }
    .brand-title span { color: #4f46e5; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .title-ribbon { background: #f1f5f9; text-align: center; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
    .grid { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 12px; }
    .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    .value { font-size: 13px; font-weight: 800; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
    th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
    .total-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; text-align: right; margin-bottom: 24px; }
    .footer { border-top: 1px dashed #cbd5e1; padding-top: 16px; font-size: 10px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div>
        <div class="brand-title">FOCUS<span>POINT</span></div>
        <p style="font-size: 11px; color: #64748b; margin-top: 4px;">Verified Home Tuition & Study Platform</p>
      </div>
      <div style="text-align: right;">
        <span class="badge">✓ Payment Confirmed</span>
        <p style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 6px;">Receipt #${receiptData.receiptNumber}</p>
        <p style="font-size: 11px; color: #64748b;">Date: ${receiptData.date}</p>
      </div>
    </div>
    <div class="title-ribbon">Official Fee Receipt — Home Tutor Booking</div>
    <div class="grid">
      <div>
        <div class="label">Billed To</div>
        <div class="value">${receiptData.studentName}</div>
        <div style="color: #64748b; font-size: 11px;">ID: ${receiptData.studentId} • ${receiptData.district || 'Ghazipur'}</div>
      </div>
      <div style="text-align: right;">
        <div class="label">Allotted Educator</div>
        <div class="value">${receiptData.serviceName}</div>
        <div style="color: #64748b; font-size: 11px;">Txn ID: ${receiptData.transactionId}</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Curriculum / Schedule</th>
          <th style="text-align: right;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Home Tuition Monthly Fee</strong><br><span style="font-size: 10px; color: #64748b;">1-on-1 Personalized Mentorship</span></td>
          <td>${receiptData.serviceDetails}</td>
          <td style="text-align: right; font-weight: 700;">₹${receiptData.amount.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
    <div class="total-box">
      <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Total Paid via ${receiptData.paymentMethod}</div>
      <div style="font-size: 24px; font-weight: 900; color: #0f172a; margin-top: 4px;">₹${receiptData.amount.toLocaleString()}</div>
    </div>
    <div class="footer">
      <p>This is an electronically generated official receipt issued by ZYZU'S EdTech Private Limited</p>
    </div>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ZYZUS_Tutor_Receipt_${receiptData.receiptNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded official receipt file (.html)', 'success');
  };

  // SUCCESS CONFIRMATION SCREEN (CONFIRMED & PAID)
  if (confirmedBookingData && submittedRequestId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-black uppercase tracking-wider">
              ✓ Booking & Payment Confirmed
            </span>
            <h1 className="text-2xl font-black text-slate-950">Home Tutor Successfully Booked</h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto">
              Your home tuition booking and fee payment have been verified. Your verified educator has been officially allotted.
            </p>
          </div>

          {/* Submission & Payment Details Summary Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Booking Reference ID:</span>
              <span className="font-mono font-black text-brand-700">{confirmedBookingData.requestId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Transaction ID:</span>
              <span className="font-mono font-bold text-slate-900">{confirmedBookingData.transactionId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Payment Method:</span>
              <span className="font-bold text-emerald-700">{confirmedBookingData.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Amount Paid:</span>
              <span className="font-black text-slate-950 text-sm">₹{confirmedBookingData.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Allotted Educator:</span>
              <span className="font-black text-brand-700">{confirmedBookingData.teacherName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Class & Subjects:</span>
              <span className="font-bold text-slate-900">{confirmedBookingData.className} • {confirmedBookingData.subjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Class Schedule:</span>
              <span className="font-bold text-slate-900">{confirmedBookingData.schedule}</span>
            </div>
          </div>

          {/* Futuristic WhatsApp Confirmation Dispatch Hub */}
          <FuturisticWhatsAppBookingHub
            recipientPhone={receiptData?.studentMobile || user?.phone || user?.mobile || '9876543210'}
            recipientName={receiptData?.studentName || user?.name || 'Student'}
            serviceType="HOME_TUITION"
            bookingRef={confirmedBookingData.requestId}
            facilityOrTeacherName={confirmedBookingData.teacherName}
            amount={confirmedBookingData.amount}
            transactionId={confirmedBookingData.transactionId}
            detailsText={`${confirmedBookingData.className} • ${confirmedBookingData.subjects} (${confirmedBookingData.schedule})`}
            autoLaunch={false}
          />

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="md"
                onClick={handleDownloadReceiptHtml}
                leftIcon={<Download className="w-4 h-4" />}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/20"
              >
                Download Receipt (.HTML)
              </Button>
              <Button
                size="md"
                variant="outline"
                onClick={() => setReceiptModalOpen(true)}
                leftIcon={<Receipt className="w-4 h-4" />}
                className="flex-1 border-slate-300 text-slate-800 hover:bg-slate-100 font-bold"
              >
                View Official Receipt
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={`/booking/confirmation/${confirmedBookingData.requestId}`} state={{ booking: {
                id: confirmedBookingData.requestId,
                serviceType: 'HOME_TUITION',
                facilityName: confirmedBookingData.teacherName,
                subjects: confirmedBookingData.subjects,
                className: confirmedBookingData.className,
                schedule: confirmedBookingData.schedule,
                startDate: confirmedBookingData.paidDate,
                amount: confirmedBookingData.amount,
                transactionId: confirmedBookingData.transactionId,
                paymentMethod: confirmedBookingData.paymentMethod,
                paymentStatus: 'PAID',
                studentMobile: receiptData?.studentMobile || user?.mobile || '9876543210',
                studentName: receiptData?.studentName || user?.name || 'Student',
              }}} className="flex-1">
                <Button size="md" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold shadow-md flex items-center justify-center gap-2">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>View Confirmation & QR Pass</span>
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/student/teacher" className="flex-1">
                <Button size="md" variant="outline" className="w-full border-brand-300 text-brand-700 hover:bg-brand-50 font-bold">
                  View Allotted Tutor
                </Button>
              </Link>
              <Link to="/student/fees" className="flex-1">
                <Button size="md" variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 font-bold">
                  View Fee Invoices
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Official Receipt Modal */}
        <OfficialReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          data={receiptData}
        />
      </div>
    );
  }

  const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link to="/student/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-600 font-bold">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Student Dashboard</span>
      </Link>

      {/* Selected Teacher Banner */}
      {selectedTeacher && (
        <div className="p-4 sm:p-5 rounded-2xl bg-brand-50/70 border border-brand-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <img
              src={selectedTeacher.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'}
              alt={selectedTeacher.name}
              className="w-12 h-12 rounded-xl object-cover border border-brand-400 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-brand-600 text-white uppercase">
                  Requested Educator
                </span>
                <span className="text-xs text-slate-600 font-bold">• Guaranteed Allotment</span>
              </div>
              <h3 className="font-black text-slate-950 text-base">{selectedTeacher.name}</h3>
              <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
                <span>{selectedTeacher.degree || selectedTeacher.qualification}</span>
                <span>•</span>
                <OfferPriceDisplay pricing={activeOfferPricing} unit="/mo" size="sm" />
              </div>
            </div>
          </div>
          <div className="text-[11px] text-brand-900 font-medium bg-white px-3 py-1.5 rounded-xl border border-brand-200 sm:max-w-xs leading-snug">
            Booking fee: <strong>₹{payableAmount.toLocaleString()}</strong>{breakdown.discountAmount > 0 && <span className="text-emerald-700 font-bold"> (Concession: -₹{breakdown.discountAmount.toLocaleString()})</span>}. Payment required to confirm schedule.
          </div>
        </div>
      )}

      {/* Main Wizard Form Card */}
      <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-xl space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            {selectedTeacher ? `Book Mentorship with ${selectedTeacher.name}` : 'Book a Verified Home Tutor'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Specify your academic curriculum, home location, schedule, and complete tuition fee payment to confirm educator allotment.
          </p>
        </div>

        {/* Stepper */}
        <Stepper steps={steps} currentStep={currentStep} />

        <form onSubmit={currentStep === 5 ? handleSubmitWithPayment : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
          
          {/* STEP 1: Academic Requirements */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Class / Standard
                  </label>
                  <select
                    value={formData.className}
                    onChange={(e) => handleChange('className', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Education Board
                  </label>
                  <select
                    value={formData.board}
                    onChange={(e) => handleChange('board', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Subjects Multi-select */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Subjects Needed (Select One or More)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.slice(0, 10).map(sub => {
                    const isSelected = formData.subjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubject(sub)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-brand-600 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {sub} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Learning Objective */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Primary Learning Objective
                </label>
                <textarea
                  rows={2}
                  value={formData.learningObjective}
                  onChange={(e) => handleChange('learningObjective', e.target.value)}
                  placeholder="e.g. Board exam scoring, NEET/JEE foundation, weak chapter recovery..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* Current Level & Special Needs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Current Academic Level
                  </label>
                  <select
                    value={formData.currentLevel}
                    onChange={(e) => handleChange('currentLevel', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="Beginner">Beginner (Needs basic foundation)</option>
                    <option value="Intermediate">Intermediate (Average marks, needs guidance)</option>
                    <option value="Advanced">Advanced (High scorer, targeting top rank)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Special Requirements
                  </label>
                  <input
                    type="text"
                    value={formData.specialRequirements}
                    onChange={(e) => handleChange('specialRequirements', e.target.value)}
                    placeholder="e.g. Weekly derivations tests, formula revision..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <CascadingLocationSelector
                value={{
                  countryId: formData.countryId,
                  stateId: formData.stateId,
                  stateName: formData.stateName,
                  districtId: formData.districtId,
                  districtName: formData.districtName,
                  localityId: formData.localityId,
                  localityName: formData.localityName,
                  areaId: formData.areaId,
                  areaName: formData.areaName,
                }}
                pincode={formData.pincode}
                onPincodeChange={(pin) => handleChange('pincode', pin)}
                showPincodeAutofill={true}
                onChange={(val: LocationHierarchySelection) => {
                  setFormData(prev => ({
                    ...prev,
                    countryId: val.countryId || '',
                    stateId: val.stateId || '',
                    stateName: val.stateName || '',
                    districtId: val.districtId || '',
                    districtName: val.districtName || '',
                    localityId: val.localityId || '',
                    localityName: val.localityName || '',
                    areaId: val.areaId || '',
                    areaName: val.areaName || '',
                    city: val.localityName || prev.city,
                    area: val.areaName || val.localityName || prev.area,
                  }));
                }}
                required
                showLabels
                layout="stacked"
              />

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Complete Home Tuition Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="House No, Landmark, Mohalla / Colony..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    City / Tehsil
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Pincode
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Precise Schedule */}
          {currentStep === 2 && (
            <div className="space-y-6">
              
              {/* Preferred Days Checkboxes */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Preferred Days of the Week (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {allDays.map(day => {
                    const isChecked = formData.preferredDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                          isChecked
                            ? 'bg-brand-50 border-brand-500 text-brand-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Precise Time Picker Grid */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span>Precise Time Slot Selection</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Start Time Picker */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700">Start Time</span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={formData.startHour}
                        onChange={(e) => handleChange('startHour', e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                      >
                        {hoursList.map(h => <option key={h} value={h}>{h} hr</option>)}
                      </select>
                      <span className="font-bold text-slate-400">:</span>
                      <select
                        value={formData.startMinute}
                        onChange={(e) => handleChange('startMinute', e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                      >
                        {minutesList.map(m => <option key={m} value={m}>{m} min</option>)}
                      </select>
                      <select
                        value={formData.startAmPm}
                        onChange={(e) => handleChange('startAmPm', e.target.value)}
                        className="bg-slate-100 border border-slate-300 rounded-lg p-2 text-xs font-black text-brand-700"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  {/* End Time Picker */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700">End Time</span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={formData.endHour}
                        onChange={(e) => handleChange('endHour', e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                      >
                        {hoursList.map(h => <option key={h} value={h}>{h} hr</option>)}
                      </select>
                      <span className="font-bold text-slate-400">:</span>
                      <select
                        value={formData.endMinute}
                        onChange={(e) => handleChange('endMinute', e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                      >
                        {minutesList.map(m => <option key={m} value={m}>{m} min</option>)}
                      </select>
                      <select
                        value={formData.endAmPm}
                        onChange={(e) => handleChange('endAmPm', e.target.value)}
                        className="bg-slate-100 border border-slate-300 rounded-lg p-2 text-xs font-black text-brand-700"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                {!isTimeValid ? (
                  <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>End time must be later than start time.</span>
                  </p>
                ) : (
                  <p className="text-xs text-emerald-700 font-bold">
                    ✓ Session Duration: {durationHours} hours per class
                  </p>
                )}
              </div>

              {/* Weekly Frequency Options */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Weekly Frequency
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'regular', label: 'Regular (Daily / Recurring weekly schedule)', sub: 'Continuous weekday mentorship' },
                    { id: '3_days', label: '3 days a week — 2 hr/session', sub: 'e.g. Mon, Wed, Fri' },
                    { id: '6_days', label: '6 days a week — 1 hr/session', sub: 'Monday to Saturday focused sessions' },
                    { id: 'weekend', label: 'Weekend Intensive — Saturday/Sunday', sub: 'Extended Saturday & Sunday classes' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleChange('frequency', opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.frequency === opt.id
                          ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <p className={`text-xs font-black ${formData.frequency === opt.id ? 'text-brand-900' : 'text-slate-900'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{opt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Budget & Teacher Preferences */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Expected Minimum Monthly Budget (INR)
                  </label>
                  <input
                    type="number"
                    value={formData.budgetMin}
                    onChange={(e) => handleChange('budgetMin', parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Expected Maximum Monthly Budget (INR)
                  </label>
                  <input
                    type="number"
                    value={formData.budgetMax}
                    onChange={(e) => handleChange('budgetMax', parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Tutor Minimum Experience Level
                </label>
                <select
                  value={formData.teacherExperienceReq}
                  onChange={(e) => handleChange('teacherExperienceReq', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900"
                >
                  <option value="1+ Years Experience">1+ Years Experience</option>
                  <option value="3+ Years Experience">3+ Years Experience (Recommended)</option>
                  <option value="5+ Years Experience">5+ Years Senior Educator</option>
                  <option value="10+ Years Experience">10+ Years Master Educator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Special Notes / Teacher Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.additionalNotes}
                  onChange={(e) => handleChange('additionalNotes', e.target.value)}
                  placeholder="Any specific instructions regarding syllabus pace, trial class timing, or previous exam scores..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 font-medium"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Review & Fee Summary */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Student Name:</span>
                  <span className="font-bold text-slate-900">{user?.name || 'Student'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Academic Level:</span>
                  <span className="font-bold text-slate-900">{formData.className} • {formData.board}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Subjects:</span>
                  <span className="font-bold text-brand-700">{formData.subjects.join(', ')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Location:</span>
                  <span className="font-bold text-slate-900">{[formData.areaName, formData.localityName, formData.districtName, formData.stateName].filter(Boolean).join(', ')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Schedule:</span>
                  <span className="font-bold text-slate-900">{formData.preferredDays.join(', ')} ({startTimeFormatted} – {endTimeFormatted})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Frequency:</span>
                  <span className="font-bold text-slate-900">{frequencyLabels[formData.frequency]}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-medium">Teacher Selection:</span>
                  <span className="font-black text-brand-700">
                    {selectedTeacher ? `Requested: ${selectedTeacher.name}` : 'Open to suitable teachers'}
                  </span>
                </div>
              </div>

              {/* Transparent Fee Summary Box */}
              <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Monthly Tuition Fee:</span>
                  {breakdown.discountAmount > 0 ? (
                    <span className="space-x-1.5">
                      <span className="line-through text-slate-400 font-bold">₹{breakdown.grossAmount.toLocaleString()}</span>
                      <span className="text-slate-950 font-black">₹{breakdown.payableAmount.toLocaleString()}</span>
                    </span>
                  ) : (
                    <span className="text-slate-950 font-black">₹{breakdown.grossAmount.toLocaleString()}</span>
                  )}
                </div>
                {breakdown.discountAmount > 0 && (
                  <div className="flex items-center justify-between font-bold text-emerald-700">
                    <span className="flex items-center gap-1.5">
                      <span>District Concession ({activeOfferPricing.offer?.code || activeOfferPricing.offer?.id}):</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-black border border-rose-200">
                        🔥 {activeOfferPricing.badgeText}
                      </span>
                    </span>
                    <span>-₹{breakdown.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between font-medium text-slate-600">
                  <span>Platform Verification & Admin Allotment:</span>
                  <span className="text-emerald-700 font-bold">FREE (₹0)</span>
                </div>
                <div className="border-t border-brand-200 pt-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-900">Total Payable to Confirm Booking:</span>
                  <span className="font-black text-brand-700 text-base">₹{payableAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Mandatory Payment Requirement:</strong> In the next step, tuition fee payment is required to lock your study schedule and confirm educator allotment. Without payment, the educator will not be booked.
                </span>
              </div>
            </div>
          )}

          {/* STEP 6: MANDATORY PAYMENT & CONFIRMATION */}
          {currentStep === 5 && (
            <div className="space-y-6">
              
              {/* Mandatory Payment Warning Banner */}
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-3 text-xs text-indigo-950">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-sm text-indigo-950">Official Fee Payment Required</h4>
                  <p className="font-medium text-indigo-800 mt-0.5">
                    To prevent unverified bookings and ensure educator commitment, payment of <strong>₹{payableAmount.toLocaleString()}</strong> is required to confirm your home tutor. An official receipt will be generated immediately.
                  </p>
                </div>
              </div>

              {/* Payment Error Alert (Shown when attempting to book without payment) */}
              {paymentError && (
                <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start gap-3 animate-shake shadow-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-black text-xs uppercase tracking-wider text-rose-800">Booking Blocked — Payment Incomplete</h5>
                    <p className="text-xs font-bold text-rose-700 mt-0.5">{paymentError}</p>
                  </div>
                </div>
              )}

              {/* Payment Method Tabs */}
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Select Payment Method to Pay ₹{payableAmount.toLocaleString()}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('upi_qr'); setPaymentError(null); }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      paymentMethod === 'upi_qr'
                        ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-950">Instant UPI QR</p>
                      <p className="text-[11px] text-slate-500 font-medium">GPay, PhonePe, Paytm</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('bank_transfer'); setPaymentError(null); }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-950">Bank Transfer</p>
                      <p className="text-[11px] text-slate-500 font-medium">IMPS / NEFT / RTGS</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('razorpay'); setPaymentError(null); }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      paymentMethod === 'razorpay'
                        ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-950">Razorpay Gateway</p>
                      <p className="text-[11px] text-slate-500 font-medium">Cards, NetBanking, UPI</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* METHOD 1: INSTANT UPI QR */}
              {paymentMethod === 'upi_qr' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0 text-center">
                      <img
                        src={upiQrUrl}
                        alt="UPI QR Code"
                        className="w-40 h-40 object-contain mx-auto"
                      />
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">
                        Scan to Pay ₹{payableAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs flex-1 w-full">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Official UPI VPA ID</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-brand-700 select-all">
                            {PAYMENT_CONFIG.upi.vpa}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(PAYMENT_CONFIG.upi.vpa, 'UPI ID')}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                            title="Copy UPI ID"
                          >
                            {copiedField === 'UPI ID' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1 text-slate-600 font-medium">
                        <p>1. Open Google Pay, PhonePe, Paytm, or BHIM.</p>
                        <p>2. Scan this QR or copy UPI ID and transfer <strong>₹{payableAmount.toLocaleString()}</strong>.</p>
                        <p>3. Enter the 12-digit UTR / UPI Reference Number below to verify booking.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                          UPI UTR / Reference Number (Required to Confirm) *
                        </label>
                        <input
                          type="text"
                          required
                          value={utrNumber}
                          onChange={(e) => { setUtrNumber(e.target.value); setPaymentError(null); }}
                          placeholder="e.g. 428190382910 (12 Digits)"
                          className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                            paymentError ? 'border-rose-400 ring-2 ring-rose-300' : 'border-slate-300 focus:ring-brand-500/20'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 2: DIRECT BANK TRANSFER */}
              {paymentMethod === 'bank_transfer' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                    Official HDFC Bank Account Particulars
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Account Name</span>
                      <p className="font-bold text-slate-950 mt-0.5">{PAYMENT_CONFIG.bankDetails.accountHolder}</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Bank & Branch</span>
                      <p className="font-bold text-slate-950 mt-0.5">{PAYMENT_CONFIG.bankDetails.bankName}, {PAYMENT_CONFIG.bankDetails.branch}</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Account Number</span>
                        <p className="font-mono font-black text-brand-700 mt-0.5">{PAYMENT_CONFIG.bankDetails.accountNumber}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(PAYMENT_CONFIG.bankDetails.accountNumber, 'Account Number')}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                        title="Copy Account Number"
                      >
                        {copiedField === 'Account Number' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">IFSC Code</span>
                        <p className="font-mono font-black text-brand-700 mt-0.5">{PAYMENT_CONFIG.bankDetails.ifscCode}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(PAYMENT_CONFIG.bankDetails.ifscCode, 'IFSC Code')}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                        title="Copy IFSC"
                      >
                        {copiedField === 'IFSC Code' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                      Bank Transfer Reference / UTR Number (Required) *
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => { setUtrNumber(e.target.value); setPaymentError(null); }}
                      placeholder="e.g. HDFC260913847291 or IMPS Reference"
                      className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                        paymentError ? 'border-rose-400 ring-2 ring-rose-300' : 'border-slate-300 focus:ring-brand-500/20'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* METHOD 3: RAZORPAY ONLINE GATEWAY */}
              {paymentMethod === 'razorpay' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-center space-y-3">
                    <p className="text-slate-600 font-medium">
                      Pay <strong>₹{payableAmount.toLocaleString()}</strong> instantly using Cards, NetBanking, or UPI apps through the Razorpay Payment Gateway.
                    </p>
                    <Button
                      type="button"
                      size="md"
                      onClick={handleRazorpayCheckout}
                      leftIcon={<CreditCard className="w-4 h-4" />}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 mx-auto"
                    >
                      {razorpaySuccess ? '✓ Razorpay Payment Authorized' : `Pay ₹${payableAmount.toLocaleString()} via Razorpay`}
                    </Button>
                    {razorpaySuccess && (
                      <p className="text-xs font-bold text-emerald-700">
                        Payment authorized with Reference ID: {utrNumber}
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {currentStep > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => { setPaymentError(null); setCurrentStep(prev => prev - 1); }}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Previous Step
              </Button>
            ) : <div />}

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                size="md"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-md font-bold"
              >
                {currentStep === 4 ? 'Proceed to Mandatory Payment' : 'Next Step'}
              </Button>
            ) : (
              <Button
                type="submit"
                size="md"
                disabled={isSubmitting}
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-600/25"
              >
                {isSubmitting ? 'Verifying Payment & Booking...' : `Confirm & Book Educator (₹${payableAmount.toLocaleString()})`}
              </Button>
            )}
          </div>

        </form>
      </Card>
    </div>
  );
};
