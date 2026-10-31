import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, ArrowRight, ArrowLeft, Upload, 
  CheckCircle2, Clock, ShieldCheck, FileText,
  IndianRupee, Tag, QrCode, CreditCard, AlertTriangle,
  Sparkles, Check, RefreshCw
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Stepper } from '../../components/common/Stepper';
import { BrandLogo } from '../../components/common/BrandLogo';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { DISTRICTS, SUBJECTS, CLASSES, BOARDS, TEACHING_MODES } from '../../constants';
import { CascadingLocationSelector } from '../../components/common/CascadingLocationSelector';
import { locationService } from '../../services/locationService';
import { teacherRegistrationPricingService } from '../../services/teacherRegistrationPricingService';
import { paymentService } from '../../services/paymentService';
import { 
  TeacherRegistrationPriceCalculation, 
  TeacherRegistrationPaymentRecord 
} from '../../types/teacherRegistrationPricing';
import { notificationEventService } from '../../services/notificationEventService';

export const RegisterTeacherPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { registerTeacher } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    { title: 'Personal' },
    { title: 'Degrees' },
    { title: 'Teaching' },
    { title: 'Locality & Fees' },
    { title: 'Availability' },
    { title: 'Verification' },
    { title: 'Review & Payment' },
  ];

  // Teacher registration form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    gender: 'Male',
    dob: '',
    highestQualification: 'Master of Science (M.Sc.)',
    degree: 'M.Sc. in Physics',
    university: 'Banaras Hindu University',
    passingYear: '2020',
    experienceYears: '5',
    subjects: ['Physics', 'Mathematics'],
    classes: ['Class 10', 'Class 11 (Science)', 'Class 12 (Science)'],
    specializations: ['Mechanics, Calculus'],
    boards: ['CBSE', 'UP Board (English Medium)'],
    teachingMode: 'BOTH',
    countryId: 'loc-country-in',
    stateId: 'loc-state-up',
    stateName: 'Uttar Pradesh',
    districtId: 'dist-gzp',
    districtName: 'Ghazipur',
    localityId: 'loc-gzp-saidpur',
    localityName: 'Saidpur',
    areaId: 'loc-area-saidpur-station',
    areaName: 'Saidpur Railway Station Road',
    areasServed: ['Saidpur', 'Bhurkura'],
    address: 'Station Road, Saidpur',
    expectedFeeMonthly: '3500',
    availabilityDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    availabilitySlots: ['05:00 PM - 07:00 PM'],
    bio: 'Dedicated physics and mathematics educator committed to conceptual clarity.',
    idProofFileName: 'Aadhaar_Card_SelfAttested.pdf',
    degreeFileName: 'MSc_Degree_Certificate.pdf',
  });

  // Dynamic Pricing & Payment State
  const [priceCalculation, setPriceCalculation] = useState<TeacherRegistrationPriceCalculation | null>(null);
  const [isResolvingFee, setIsResolvingFee] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Payment Execution State
  const [paymentMethod, setPaymentMethod] = useState<'UPI_QR' | 'CARD_NETBANKING'>('UPI_QR');
  const [paymentStatus, setPaymentStatus] = useState<'UNPAID' | 'PROCESSING' | 'PAID' | 'FAILED'>('UNPAID');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [confirmedPayment, setConfirmedPayment] = useState<TeacherRegistrationPaymentRecord | null>(null);

  // AI Agent Event Hook: Detect teacher application started
  useEffect(() => {
    notificationEventService.emitTeacherApplicationEvent('STARTED', {
      districtName: formData.districtName,
      localityName: formData.localityName,
      userId: formData.email || 'teacher-applicant',
      userName: formData.name || 'Teacher Candidate',
      userPhone: formData.mobile,
      subjects: formData.subjects
    });
  }, []);

  // Live Price Calculation Engine
  const resolveFee = async (couponToUse?: string) => {
    setIsResolvingFee(true);
    try {
      const res = await teacherRegistrationPricingService.calculateRegistrationFee({
        state: formData.stateName,
        district: formData.districtName,
        email: formData.email,
        mobile: formData.mobile,
        couponCode: couponToUse !== undefined ? couponToUse : (appliedCoupon || undefined),
      });
      setPriceCalculation(res);
      // Reset payment status if price/location changes
      if (res.isFree) {
        setPaymentStatus('PAID'); // Free doesn't require monetary transaction
      } else if (paymentStatus === 'FAILED') {
        // keep failed state until retry
      }
    } catch (e) {
      console.error('Failed to calculate fee', e);
    } finally {
      setIsResolvingFee(false);
    }
  };

  // Re-resolve pricing whenever location or identity changes (Requirement 39)
  useEffect(() => {
    resolveFee();
  }, [formData.stateName, formData.districtName, formData.email, formData.mobile]);

  const handleChange = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const toggleArrayItem = (field: 'subjects' | 'classes' | 'areasServed' | 'availabilityDays', item: string) => {
    const list = [...formData[field]];
    const idx = list.indexOf(item);
    if (idx > -1) list.splice(idx, 1);
    else list.push(item);
    handleChange(field, list);
  };

  // Apply Coupon Handler
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponMessage(null);

    const validation = await teacherRegistrationPricingService.validateCoupon(couponInput);
    if (validation.valid) {
      setAppliedCoupon(couponInput.trim().toUpperCase());
      setCouponMessage(validation.message);
      showToast(validation.message, 'success');
      await resolveFee(couponInput.trim().toUpperCase());
    } else {
      setCouponMessage(validation.message);
      showToast(validation.message, 'error');
    }
    setIsApplyingCoupon(false);
  };

  const handleRemoveCoupon = async () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponMessage(null);
    await resolveFee('');
  };

  // Initiate Payment & Submit
  const handlePayAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceCalculation) return;

    // 1. FREE Registration Flow (Requirement 4: ₹0 -> Submit directly without payment page)
    if (!priceCalculation.paymentRequired || priceCalculation.isFree) {
      setIsSubmitting(true);
      try {
        const freeRecord: TeacherRegistrationPaymentRecord = {
          id: `tr-free-${Date.now()}`,
          registrationId: `REG-FREE-${Date.now().toString().slice(-6)}`,
          teacherName: formData.name,
          teacherEmail: formData.email,
          teacherMobile: formData.mobile,
          state: formData.stateName,
          district: formData.districtName,
          originalFee: priceCalculation.applicableFee,
          offerDiscount: priceCalculation.offerDiscount || 0,
          couponDiscount: priceCalculation.couponDiscount || 0,
          finalAmount: 0,
          currency: 'INR',
          pricingRuleId: priceCalculation.pricingRuleId || undefined,
          pricingScope: priceCalculation.pricingScope,
          paymentStatus: 'FREE',
          registrationStatus: 'PENDING_APPROVAL',
          createdAt: new Date().toISOString(),
          confirmedAt: new Date().toISOString()
        };

        await teacherRegistrationPricingService.recordRegistrationPayment(freeRecord);
        await registerTeacher({
          ...formData,
          registrationFee: 0,
          registrationPaymentStatus: 'FREE',
          registrationPaymentId: freeRecord.id,
          registrationPricingRuleId: priceCalculation.pricingRuleId,
          registrationPricingScope: priceCalculation.pricingScope,
          registrationFinalAmount: 0,
          registrationPaidAt: freeRecord.createdAt,
        });

        setConfirmedPayment(freeRecord);
        setSubmitted(true);
        notificationEventService.emitTeacherApplicationEvent('SUBMITTED', {
          districtName: formData.districtName,
          localityName: formData.localityName,
          userId: formData.email,
          userName: formData.name,
          userPhone: formData.mobile,
          subjects: formData.subjects
        });
        showToast('Registration submitted for district verification!', 'success');
      } catch (err) {
        showToast('Registration failed. Please verify your details.', 'error');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 2. PAID Registration Flow (Requirement 5, 23, 24, 25)
    setIsSubmitting(true);
    setPaymentStatus('PROCESSING');
    setPaymentError(null);

    const payableAmount = priceCalculation.finalPayableFee;
    const registrationTxnRef = `REG-${Date.now().toString().slice(-6)}`;

    // Simulate verified gateway transaction
    const processTransaction = async () => {
      // Small latency for realistic secure gateway processing
      await new Promise(r => setTimeout(r, 1200));

      // Gateway outcome simulation (supports test failure simulation if name contains "FAIL")
      const shouldFail = formData.name.toUpperCase().includes('FAIL_TEST');
      if (shouldFail) {
        setPaymentStatus('FAILED');
        setPaymentError('Payment failed: Card or UPI transaction declined by bank.');
        setIsSubmitting(false);
        showToast('Registration payment failed. You can retry payment.', 'error');
        return;
      }

      // Successful Payment Confirmation
      const paymentTxnId = paymentMethod === 'UPI_QR'
        ? `UPI-TXN-${Date.now().toString().slice(-8)}`
        : `RZP-TXN-${Date.now().toString().slice(-8)}`;

      const paymentRecord: TeacherRegistrationPaymentRecord = {
        id: `tr-pay-${Date.now()}`,
        registrationId: registrationTxnRef,
        teacherName: formData.name,
        teacherEmail: formData.email,
        teacherMobile: formData.mobile,
        state: formData.stateName,
        district: formData.districtName,
        originalFee: priceCalculation.applicableFee,
        offerDiscount: priceCalculation.offerDiscount || 0,
        couponDiscount: priceCalculation.couponDiscount || 0,
        finalAmount: payableAmount,
        currency: 'INR',
        pricingRuleId: priceCalculation.pricingRuleId || undefined,
        pricingScope: priceCalculation.pricingScope,
        paymentId: paymentTxnId,
        paymentMethod,
        paymentStatus: 'PAID',
        registrationStatus: 'PENDING_APPROVAL',
        createdAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString()
      };

      try {
        await teacherRegistrationPricingService.recordRegistrationPayment(paymentRecord);
        await registerTeacher({
          ...formData,
          registrationFee: priceCalculation.applicableFee,
          registrationPaymentStatus: 'PAID',
          registrationPaymentId: paymentTxnId,
          registrationPricingRuleId: priceCalculation.pricingRuleId,
          registrationPricingScope: priceCalculation.pricingScope,
          registrationDiscount: (priceCalculation.offerDiscount || 0) + (priceCalculation.couponDiscount || 0),
          registrationCoupon: appliedCoupon || undefined,
          registrationFinalAmount: payableAmount,
          registrationPaidAt: paymentRecord.confirmedAt,
        });

        setPaymentStatus('PAID');
        setConfirmedPayment(paymentRecord);
        setSubmitted(true);
        notificationEventService.emitTeacherApplicationEvent('SUBMITTED', {
          districtName: formData.districtName,
          localityName: formData.localityName,
          userId: formData.email,
          userName: formData.name,
          userPhone: formData.mobile,
          subjects: formData.subjects
        });
        showToast('Payment confirmed! Registration submitted for approval.', 'success');
      } catch (e) {
        setPaymentStatus('FAILED');
        setPaymentError('Server could not finalize registration record. Please retry.');
      } finally {
        setIsSubmitting(false);
      }
    };

    processTransaction();
  };

  // Payment Retry Handler (Requirement 25: Keeps form data completely intact!)
  const handleRetryPayment = () => {
    setPaymentStatus('UNPAID');
    setPaymentError(null);
  };

  // =========================================================================
  // SUBMISSION CONFIRMATION VIEW
  // =========================================================================
  if (submitted) {
    const isPaid = confirmedPayment?.paymentStatus === 'PAID';

    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            REGISTRATION: UNDER REVIEW
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Application Received</h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Your teacher profile and credentials have been received by the{' '}
            <strong className="text-slate-900">{formData.districtName} District Operations Office</strong>.
            The District Admin will verify your documents and activate your verified tutor profile.
          </p>
        </div>

        {/* Payment Receipt / Summary Card */}
        <Card className="p-5 text-left text-xs space-y-3 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-950 text-sm">Registration & Payment Receipt</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
              isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isPaid ? 'PAYMENT: PAID' : 'REGISTRATION: FREE'}
            </span>
          </div>

          <div className="space-y-1.5 text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Applicant:</span>
              <span className="font-semibold text-slate-900">{formData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Registration Ref:</span>
              <span className="font-mono text-slate-900">{confirmedPayment?.registrationId || 'REG-FOCUS-2026'}</span>
            </div>
            {isPaid && confirmedPayment?.paymentId && (
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono text-slate-900">{confirmedPayment.paymentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Operational District:</span>
              <span className="font-semibold text-slate-900">{formData.districtName}, {formData.stateName}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100 font-bold">
              <span className="text-slate-900">Total Fee Paid:</span>
              <span className="text-brand-700">
                {isPaid ? `₹${confirmedPayment?.finalAmount}` : 'FREE (₹0)'}
              </span>
            </div>
          </div>
        </Card>

        <div className="flex justify-center gap-4">
          <Link to="/teacher/dashboard">
            <Button size="md" leftIcon={<GraduationCap className="w-4 h-4" />}>
              Open Teacher Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="md">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN REGISTRATION FORM WIZARD
  // =========================================================================
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <BrandLogo variant="primary" size="md" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Teacher Onboarding Application</h1>
        <p className="text-xs text-slate-600">
          Apply to become a verified 1-on-1 home tutor with ZYZU'S in {formData.districtName || 'your district'}.
        </p>
      </div>

      <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-xl space-y-6">
        <Stepper steps={steps} currentStep={currentStep} />

        <form onSubmit={handlePayAndSubmit} className="space-y-6">
          {/* STEP 0: Personal Info */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-950 border-b border-slate-200 pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name (As per Aadhaar) *"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma"
                />
                <Input
                  label="Mobile Number *"
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address *"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="name@example.com"
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Academic Degrees */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-950 border-b border-slate-200 pb-2">Academic Qualifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Highest Educational Degree *"
                  required
                  value={formData.highestQualification}
                  onChange={(e) => handleChange('highestQualification', e.target.value)}
                  placeholder="e.g. Ph.D., M.Sc., B.Tech, M.A."
                />
                <Input
                  label="Degree Name & Discipline *"
                  required
                  value={formData.degree}
                  onChange={(e) => handleChange('degree', e.target.value)}
                  placeholder="e.g. M.Sc. in Physics"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="College / University Name *"
                  required
                  value={formData.university}
                  onChange={(e) => handleChange('university', e.target.value)}
                  placeholder="e.g. Banaras Hindu University"
                />
                <Input
                  label="Year of Graduation *"
                  type="number"
                  required
                  value={formData.passingYear}
                  onChange={(e) => handleChange('passingYear', e.target.value)}
                  placeholder="2018"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Teaching Specifications */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-950 border-b border-slate-200 pb-2">Teaching Preferences</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Select Subjects You Teach</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUBJECTS.slice(0, 9).map(s => {
                    const sel = formData.subjects.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleArrayItem('subjects', s)}
                        className={`p-2 rounded-lg text-xs font-semibold text-left border transition-all cursor-pointer ${
                          sel ? 'bg-brand-50 text-brand-700 border-brand-500 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Target Classes</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CLASSES.slice(5, 13).map(c => {
                    const sel = formData.classes.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleArrayItem('classes', c)}
                        className={`p-2 rounded-lg text-xs font-semibold text-left border transition-all cursor-pointer ${
                          sel ? 'bg-brand-50 text-brand-700 border-brand-500 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Teaching Experience (Years) *"
                  type="number"
                  required
                  value={formData.experienceYears}
                  onChange={(e) => handleChange('experienceYears', e.target.value)}
                  placeholder="5"
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Teaching Mode</label>
                  <select
                    value={formData.teachingMode}
                    onChange={(e) => handleChange('teachingMode', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
                  >
                    {TEACHING_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Locality & Live Fee Resolution */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-950 border-b border-slate-200 pb-2">Locations Served & Expected Fee</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Your Primary Residential Base & Operational Hub *
                </label>
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
                  onChange={(sel) => {
                    setFormData(prev => ({
                      ...prev,
                      countryId: sel.countryId || 'loc-country-in',
                      stateId: sel.stateId || '',
                      stateName: sel.stateName || '',
                      districtId: sel.districtId || '',
                      districtName: sel.districtName || '',
                      localityId: sel.localityId || '',
                      localityName: sel.localityName || '',
                      areaId: sel.areaId || '',
                      areaName: sel.areaName || '',
                      areasServed: sel.localityName ? [sel.localityName] : [],
                    }));
                  }}
                  mode="stacked"
                  required={true}
                />
              </div>

              {/* LIVE REGISTRATION FEE DISPLAY (Requirement 8 & 9) */}
              <div className="mt-3 p-4 rounded-xl border border-brand-200 bg-brand-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800">
                      Applicable Registration Pricing
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-200/60 text-brand-900">
                      Live Resolved
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Registration fee applicable to your selected location/profile
                  </p>
                </div>

                <div className="text-right sm:text-right w-full sm:w-auto">
                  {isResolvingFee ? (
                    <span className="text-xs text-slate-400 animate-pulse">Resolving fee tier...</span>
                  ) : priceCalculation ? (
                    priceCalculation.isFree ? (
                      <div className="inline-block px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-200 shadow-xs">
                        Teacher Registration: FREE
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-end gap-1.5">
                        <span className="text-xs text-slate-600 font-medium">Teacher Registration Fee:</span>
                        <span className="text-lg font-black text-brand-700">
                          ₹{priceCalculation.finalPayableFee}
                        </span>
                        {priceCalculation.offerDiscount || priceCalculation.couponDiscount ? (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{priceCalculation.applicableFee}
                          </span>
                        ) : null}
                      </div>
                    )
                  ) : (
                    <span className="text-xs text-slate-400">Loading...</span>
                  )}
                </div>
              </div>

              {formData.districtId && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Localities & Towns in {formData.districtName || 'District'} You Can Visit *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                    {locationService.getLocalities(formData.districtId).map(loc => {
                      const sel = formData.areasServed.includes(loc.name);
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => toggleArrayItem('areasServed', loc.name)}
                          className={`p-2 rounded-lg text-xs font-semibold text-left border transition-all cursor-pointer ${
                            sel ? 'bg-brand-50 text-brand-700 border-brand-500 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {loc.name} ({loc.type})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Expected Monthly Tuition Fee (₹ / Student) *"
                  type="number"
                  required
                  value={formData.expectedFeeMonthly}
                  onChange={(e) => handleChange('expectedFeeMonthly', e.target.value)}
                  placeholder="3000"
                />
                <Input
                  label="Your Residence Address in District"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Colony, Landmark, Saidpur"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Availability */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-950 border-b border-slate-200 pb-2">Availability Schedule</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Available Days for Home Visits</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => {
                    const sel = formData.availabilityDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleArrayItem('availabilityDays', d)}
                        className={`p-2 rounded-lg text-xs font-semibold text-center border transition-all cursor-pointer ${
                          sel ? 'bg-brand-50 text-brand-700 border-brand-500 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Educator Bio / Description</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell students and district admin about your teaching methodology and achievements..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Verification Documents */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-950 border-b border-slate-200 pb-2">Document Verification Upload</h3>
              <p className="text-xs text-slate-600">Required by District Administration for student safety and certificate validation.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
                  <Upload className="w-8 h-8 text-brand-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-950">Government ID Proof (Aadhaar)</p>
                  <p className="text-[10px] text-slate-500">PDF, JPG up to 5MB</p>
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    {formData.idProofFileName}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
                  <Upload className="w-8 h-8 text-purple-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-950">Highest Degree Certificate</p>
                  <p className="text-[10px] text-slate-500">Degree or Final Marksheet</p>
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    {formData.degreeFileName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Payment Gate (Requirements 5, 21, 23, 25, 31) */}
          {currentStep === 6 && (
            <div className="space-y-5 text-xs">
              <h3 className="font-bold text-sm text-slate-950 border-b border-slate-200 pb-2">
                Application Review & Registration Finalization
              </h3>

              {/* Form Review Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-700">
                <p><strong className="text-slate-950">Full Name:</strong> {formData.name}</p>
                <p><strong className="text-slate-950">Mobile:</strong> {formData.mobile} • <strong className="text-slate-950">Email:</strong> {formData.email}</p>
                <p><strong className="text-slate-950">Qualification:</strong> {formData.degree} ({formData.university})</p>
                <p><strong className="text-slate-950">Subjects:</strong> {formData.subjects.join(', ')}</p>
                <p><strong className="text-slate-950">Location:</strong> {formData.districtName}, {formData.stateName}</p>
                <p><strong className="text-slate-950">Expected Tuition Fee:</strong> ₹{formData.expectedFeeMonthly} / month</p>
              </div>

              {/* PAYMENT ERROR BANNER WITH RETRY (Requirement 25) */}
              {paymentStatus === 'FAILED' && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                  <div className="flex items-start gap-2 text-rose-900 font-bold">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold">Registration Payment Failed</h4>
                      <p className="text-xs font-normal text-rose-700 mt-0.5">
                        {paymentError || 'Your payment could not be processed. All your filled registration data is safe.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline" 
                      onClick={handleRetryPayment}
                      className="text-rose-700 border-rose-300 hover:bg-rose-100"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Retry Payment
                    </Button>
                  </div>
                </div>
              )}

              {/* SCENARIO A: FREE REGISTRATION (Requirement 4 & 21) */}
              {priceCalculation && (priceCalculation.isFree || !priceCalculation.paymentRequired) ? (
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-blue-950">Teacher Registration</span>
                      <p className="text-slate-600 text-[11px]">
                        Applicable registration pricing: Complimentary / Waived
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">
                      FREE REGISTRATION
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] pt-1">
                    No payment is required for your location. Click below to submit your application directly to the {formData.districtName} District Administration.
                  </p>
                </div>
              ) : (
                /* SCENARIO B: PAID REGISTRATION (Requirement 5, 28, 29, 30, 31) */
                <div className="space-y-4">
                  {/* Fee Breakdown Card */}
                  <Card className="p-5 bg-white border-slate-200 shadow-sm space-y-3">
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center justify-between">
                      <span>Registration Fee Breakdown</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Location: {formData.districtName}
                      </span>
                    </h4>

                    <div className="space-y-2 pt-1 border-t border-slate-100 text-slate-700">
                      <div className="flex justify-between">
                        <span>Teacher Registration Fee:</span>
                        <span className="font-semibold text-slate-900">₹{priceCalculation?.applicableFee}</span>
                      </div>

                      {priceCalculation?.offerDiscount ? (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>Offer Concession ({priceCalculation.offerName || 'Special Campaign'}):</span>
                          <span>-₹{priceCalculation.offerDiscount}</span>
                        </div>
                      ) : null}

                      {priceCalculation?.couponDiscount ? (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>Coupon Discount ({appliedCoupon}):</span>
                          <span>-₹{priceCalculation.couponDiscount}</span>
                        </div>
                      ) : null}

                      <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-sm text-slate-950">
                        <span>Total Payable Amount:</span>
                        <span className="text-brand-700 text-base">₹{priceCalculation?.finalPayableFee}</span>
                      </div>
                    </div>

                    {/* Coupon Input Box */}
                    <div className="pt-2 border-t border-slate-100">
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Tag className="w-3.5 h-3.5" />
                            Coupon {appliedCoupon} applied!
                          </span>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter promo coupon (e.g. TEACHER100)"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleApplyCoupon}
                            isLoading={isApplyingCoupon}
                          >
                            Apply
                          </Button>
                        </div>
                      )}
                      {couponMessage && (
                        <p className={`text-[10px] mt-1 ${appliedCoupon ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {couponMessage}
                        </p>
                      )}
                    </div>
                  </Card>

                  {/* Payment Method Selector */}
                  <Card className="p-5 bg-white border-slate-200 shadow-sm space-y-3">
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Select Payment Method
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('UPI_QR')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          paymentMethod === 'UPI_QR'
                            ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs">Instant UPI QR Code</p>
                          <p className="text-[10px] text-slate-500">PhonePe, GPay, Paytm, BHIM</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CARD_NETBANKING')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          paymentMethod === 'CARD_NETBANKING'
                            ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs">Card / NetBanking</p>
                          <p className="text-[10px] text-slate-500">Razorpay Secure Checkout</p>
                        </div>
                      </button>
                    </div>

                    {paymentMethod === 'UPI_QR' && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-600">
                        <span className="text-[11px]">Direct ZYZU'S UPI VPA:</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">zyzus@icici</span>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              <div className="p-3 rounded-lg bg-brand-50 border border-brand-200 text-[11px] text-brand-900 font-medium">
                By submitting, your details will be verified by the {formData.districtName} District Administration office before your profile is published.
              </div>
            </div>
          )}

          {/* Navigation & Submit Buttons */}
          <div className="flex justify-between pt-4 border-t border-slate-200">
            {currentStep > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setCurrentStep(prev => prev - 1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous Step
              </Button>
            ) : <div />}

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                size="md"
                onClick={() => setCurrentStep(prev => prev + 1)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                size="md"
                isLoading={isSubmitting}
                rightIcon={<ShieldCheck className="w-4 h-4" />}
              >
                {priceCalculation && (priceCalculation.isFree || !priceCalculation.paymentRequired)
                  ? 'Complete Registration'
                  : `Pay ₹${priceCalculation?.finalPayableFee || 300} & Complete Registration`}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
