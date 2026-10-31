import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookMarked, ArrowRight, ArrowLeft, ShieldCheck, Clock, 
  Sparkles, CheckCircle2, IndianRupee, QrCode, CreditCard, 
  AlertTriangle, RefreshCw, Check, Tag, Building2, HelpCircle
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Stepper } from '../../components/common/Stepper';
import { BrandLogo } from '../../components/common/BrandLogo';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { CascadingLocationSelector } from '../../components/common/CascadingLocationSelector';
import { libraryService } from '../../services/libraryService';
import { librarySubscriptionService } from '../../services/librarySubscriptionService';
import { 
  LibrarySubscriptionBillingCycle, 
  LibrarySubscriptionPlan, 
  LibrarySubscriptionPriceCalculation,
  LibrarySubscriptionPaymentRecord,
  LibrarySubscription
} from '../../types/librarySubscriptionPricing';
import { notificationEventService } from '../../services/notificationEventService';

export const RegisterLibraryOwnerPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { registerLibraryOwner } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedSubscription, setSubmittedSubscription] = useState<LibrarySubscription | null>(null);
  const [submittedLibraryId, setSubmittedLibraryId] = useState<string>('');

  // AI Agent Event Hook: Detect library listing started
  useEffect(() => {
    notificationEventService.emitLibraryListingEvent('STARTED', {
      districtName: formData.districtName,
      localityName: formData.localityName,
      pincode: formData.pincode,
      userId: formData.email || 'library-applicant',
      userName: formData.name || 'Library Owner',
      userPhone: formData.mobile,
      totalSeats: Number(formData.totalSeats)
    });
  }, []);

  const steps = [
    { title: 'Owner & Facility' },
    { title: 'Location & Desks' },
    { title: 'Subscription & Payment' },
  ];

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    countryId: 'loc-country-in',
    stateId: 'loc-state-up',
    stateName: 'Uttar Pradesh',
    districtId: 'dist-gzp',
    districtName: 'Ghazipur',
    localityId: 'loc-gzp-saidpur',
    localityName: 'Saidpur',
    areaId: 'loc-area-pankaj-talkies',
    areaName: 'Pankaj Talkies Area',
    city: 'Saidpur',
    area: 'Pankaj Talkies Area',
    address: 'Near Tehsil, Main Market Road',
    pincode: '233221',
    totalSeats: 60,
    hasAirConditioning: true,
    hasHighSpeedWifi: true,
  });

  // Subscription Plans & Billing Cycle
  const [availablePlans, setAvailablePlans] = useState<LibrarySubscriptionPlan[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<LibrarySubscriptionBillingCycle>('MONTHLY');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-lib-monthly');

  // Dynamic Price Calculation State
  const [priceCalculation, setPriceCalculation] = useState<LibrarySubscriptionPriceCalculation | null>(null);
  const [isResolvingPrice, setIsResolvingPrice] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Payment Execution State
  const [paymentMethod, setPaymentMethod] = useState<'UPI_QR' | 'CARD_NETBANKING'>('UPI_QR');
  const [paymentStatus, setPaymentStatus] = useState<'UNPAID' | 'PROCESSING' | 'PAID' | 'FAILED'>('UNPAID');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [confirmedPayment, setConfirmedPayment] = useState<LibrarySubscriptionPaymentRecord | null>(null);

  // Load plans on mount
  useEffect(() => {
    librarySubscriptionService.getAvailablePlans().then(plans => {
      setAvailablePlans(plans.filter(p => p.status === 'ACTIVE'));
    });
  }, []);

  // Sync selectedPlanId with selectedCycle
  useEffect(() => {
    const matched = availablePlans.find(p => p.billingCycle === selectedCycle);
    if (matched) {
      setSelectedPlanId(matched.id);
    }
  }, [selectedCycle, availablePlans]);

  // Recalculate dynamic fee whenever location, plan cycle, library name or coupon changes
  const resolvePrice = async (couponToApply?: string) => {
    setIsResolvingPrice(true);
    try {
      const calc = await librarySubscriptionService.calculateSubscriptionPrice({
        planId: selectedPlanId,
        state: formData.stateName,
        district: formData.districtName,
        libraryName: formData.businessName,
        couponCode: couponToApply !== undefined ? couponToApply : (appliedCoupon || undefined),
      });
      setPriceCalculation(calc);

      if (calc.isFree) {
        setPaymentStatus('PAID');
      } else if (paymentStatus === 'PAID' && !confirmedPayment) {
        setPaymentStatus('UNPAID');
      }
    } catch (err) {
      console.error('Failed to resolve subscription price:', err);
    } finally {
      setIsResolvingPrice(false);
    }
  };

  useEffect(() => {
    resolvePrice();
  }, [formData.stateName, formData.districtName, formData.businessName, selectedCycle, selectedPlanId]);

  const handleChange = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  // Coupon handling
  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    const validCoupons = ['LIBRARY50', 'WELCOMEFREE', 'STUDY100'];

    if (!validCoupons.includes(code)) {
      setCouponError('Invalid coupon code. Try LIBRARY50 or WELCOMEFREE');
      return;
    }

    setAppliedCoupon(code);
    resolvePrice(code);
    showToast(`Coupon "${code}" applied successfully!`, 'success');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
    resolvePrice('');
    showToast('Coupon removed', 'info');
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!formData.name.trim()) {
      showToast('Owner full name is required', 'error');
      return false;
    }
    if (!formData.businessName.trim()) {
      showToast('Library business trade name is required', 'error');
      return false;
    }
    if (!formData.mobile.trim() || formData.mobile.length < 10) {
      showToast('Valid 10-digit mobile number is required', 'error');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      showToast('Valid official email address is required', 'error');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!formData.stateName) {
      showToast('State selection is required', 'error');
      return false;
    }
    if (!formData.districtName) {
      showToast('District selection is required', 'error');
      return false;
    }
    if (!formData.address.trim()) {
      showToast('Premises street address is required', 'error');
      return false;
    }
    return true;
  };

  // Payment Execution (Simulated with live retry & failure protection)
  const handleExecutePayment = async () => {
    if (!priceCalculation) return;
    setPaymentError(null);
    setPaymentStatus('PROCESSING');

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1200));

    if (simulateFailure) {
      setPaymentStatus('FAILED');
      setPaymentError('Payment failed: Bank simulator rejected transaction (TEST_MODE_SIMULATE_FAILURE). Please retry.');
      showToast('Payment transaction failed. Your entered details have been preserved.', 'error');
      return;
    }

    try {
      const payment = await librarySubscriptionService.recordPayment({
        subscriptionId: `sub-init-${Date.now()}`,
        libraryId: `lib-${Date.now()}`,
        libraryName: formData.businessName,
        ownerName: formData.name,
        ownerEmail: formData.email,
        ownerMobile: formData.mobile,
        state: formData.stateName,
        district: formData.districtName,
        planId: selectedPlanId,
        planName: availablePlans.find(p => p.id === selectedPlanId)?.name || `${selectedCycle} Subscription`,
        billingCycle: selectedCycle,
        originalFee: priceCalculation.basePrice,
        offerDiscount: priceCalculation.offerDiscount,
        couponDiscount: priceCalculation.couponDiscount,
        couponCode: appliedCoupon || undefined,
        finalAmount: priceCalculation.finalPayableAmount,
        currency: 'INR',
        paymentId: `PAY-${Date.now()}`,
        paymentMethod: paymentMethod === 'UPI_QR' ? 'UPI_QR' : 'ONLINE_GATEWAY',
        paymentStatus: 'PAID',
        subscriptionStatus: 'ACTIVE',
        invoiceNumber: `INV-LS-${Date.now()}`,
        createdAt: new Date().toISOString()
      });

      setConfirmedPayment(payment);
      setPaymentStatus('PAID');
      showToast('Subscription payment confirmed! Issuing official registration.', 'success');
    } catch (err: any) {
      setPaymentStatus('FAILED');
      setPaymentError(err.message || 'Payment recording failed. Please retry.');
    }
  };

  // Final Registration Submission
  const handleFinalSubmit = async () => {
    if (!priceCalculation) return;

    // Must be paid if final price > 0
    if (!priceCalculation.isFree && paymentStatus !== 'PAID') {
      showToast('Please complete subscription payment to proceed with registration.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create User in Auth
      await registerLibraryOwner(formData);

      // 2. Create Library Listing entity
      const newLib = await libraryService.createLibraryListing({
        name: formData.businessName,
        ownerName: formData.name,
        ownerPhone: formData.mobile,
        countryId: formData.countryId,
        stateId: formData.stateId,
        stateName: formData.stateName,
        districtId: formData.districtId,
        districtName: formData.districtName,
        district: formData.districtName,
        localityId: formData.localityId,
        localityName: formData.localityName,
        city: formData.city,
        areaId: formData.areaId,
        areaName: formData.areaName,
        area: formData.area,
        address: formData.address,
        pincode: formData.pincode,
        totalSeats: Number(formData.totalSeats) || 60,
        facilities: [
          ...(formData.hasAirConditioning ? ['Air Conditioned (AC)'] : []),
          ...(formData.hasHighSpeedWifi ? ['High-Speed 5G Wi-Fi'] : []),
          'RO Mineral Water',
          'Power Backup Generator',
          'Silent Zone Acoustic Desks'
        ],
      });

      setSubmittedLibraryId(newLib.id);

      // 3. Create Subscription Record
      const createdSub = await librarySubscriptionService.createSubscription({
        libraryId: newLib.id,
        libraryName: newLib.name,
        ownerId: newLib.ownerId || `usr-${Date.now()}`,
        ownerName: formData.name,
        ownerEmail: formData.email,
        ownerMobile: formData.mobile,
        planId: selectedPlanId,
        planName: availablePlans.find(p => p.id === selectedPlanId)?.name || `${selectedCycle} Subscription`,
        billingCycle: selectedCycle,
        basePrice: priceCalculation.basePrice,
        pricingScope: priceCalculation.pricingScope,
        offerDiscount: priceCalculation.offerDiscount,
        couponDiscount: priceCalculation.couponDiscount,
        couponCode: appliedCoupon || undefined,
        finalPaidAmount: priceCalculation.finalPayableAmount,
        isFree: priceCalculation.isFree,
        status: 'ACTIVE',
        state: formData.stateName,
        district: formData.districtName,
        paymentId: confirmedPayment?.id,
        paymentMethod: priceCalculation.isFree ? ('FREE_TIER' as any) : paymentMethod === 'UPI_QR' ? 'UPI_QR' : 'ONLINE_GATEWAY',
        autoRenew: true,
      });

      setSubmittedSubscription(createdSub);
      setSubmitted(true);
      notificationEventService.emitLibraryListingEvent('SUBMITTED', {
        districtName: formData.districtName,
        localityName: formData.localityName,
        pincode: formData.pincode,
        userId: formData.email,
        userName: formData.name,
        userPhone: formData.mobile,
        totalSeats: Number(formData.totalSeats)
      });
      showToast('Library listing registered and subscription activated!', 'success');
    } catch (err: any) {
      console.error('Registration failed:', err);
      showToast('Registration failed: ' + (err.message || 'Please check your inputs'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submitted Confirmation View
  if (submitted && submittedSubscription) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
            SUBSCRIPTION STATUS: {submittedSubscription.status}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950">
            Library Listing Registered Successfully!
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Your self-study library <span className="font-bold text-slate-900">"{formData.businessName}"</span> has been enrolled with the ZYZU'S Study Network. District Admin ({formData.districtName}) has been notified for document accreditation.
          </p>
        </div>

        {/* Subscription Info Card */}
        <Card className="p-6 bg-slate-900 text-white text-left max-w-lg mx-auto rounded-2xl border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Active Plan</p>
              <h4 className="text-lg font-black text-white">{submittedSubscription.planName}</h4>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ₹{submittedSubscription.finalPaidAmount} / {submittedSubscription.billingCycle}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Subscription ID:</span>
              <p className="font-mono font-bold text-slate-200 mt-0.5">{submittedSubscription.id}</p>
            </div>
            <div>
              <span className="text-slate-400">Validity:</span>
              <p className="font-bold text-slate-200 mt-0.5">
                {new Date(submittedSubscription.startDate).toLocaleDateString('en-IN')} – {new Date(submittedSubscription.expiryDate).toLocaleDateString('en-IN')}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Cancellation Window:</span>
              <p className="font-bold text-amber-400 mt-0.5">
                24 Hours (till {new Date(submittedSubscription.cancellationDeadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})
              </p>
            </div>
            <div>
              <span className="text-slate-400">Auto Renewal:</span>
              <p className="font-bold text-emerald-400 mt-0.5">Enabled (Locked Price)</p>
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-300">
            <span className="font-bold text-white">24-Hour Policy:</span> You can cancel this subscription anytime within 24 hours directly from your Billing Portal for an instant refund.
          </div>
        </Card>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link to="/library-owner/dashboard">
            <Button size="md" variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
              Open Library Owner Portal
            </Button>
          </Link>
          <Link to="/library-owner/subscription">
            <Button variant="outline" size="md" icon={<CreditCard className="w-4 h-4" />}>
              View Subscription & Tax Invoice
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="md">Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <BrandLogo variant="primary" size="md" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          List Your Study Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Partner with ZYZU'S to showcase your reading hall, manage desk bookings, and automate student fees across your district.
        </p>
      </div>

      {/* Stepper Navigation */}
      <Stepper steps={steps} currentStep={currentStep} />

      {/* Card Body */}
      <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-xl">
        {/* STEP 0: Owner & Facility Credentials */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">Facility Owner & Login Information</h2>
              <p className="text-xs text-slate-500">Provide legal owner details and secure login credentials.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Owner Full Name"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Mukesh Chandra Sonkar"
              />
              <Input
                label="Library / Business Trade Name"
                required
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                placeholder="e.g. ZYZU'S Premier Study Library"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mobile Number (Primary Login & Alerts)"
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                placeholder="10-digit mobile number"
              />
              <Input
                label="Official Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="owner@zyzus.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Create Password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="At least 6 characters"
              />
              <Input
                label="Confirm Password"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                size="lg"
                variant="primary"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => {
                  if (validateStep1()) setCurrentStep(1);
                }}
              >
                Continue to Location
              </Button>
            </div>
          </div>
        )}

        {/* STEP 1: Location & Desks */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Premises Location & Capacity</h2>
                <p className="text-xs text-slate-500">Specify geographical jurisdiction for District Admin accreditation.</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-bold text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>4-Tier Pricing Enabled</span>
              </div>
            </div>

            {/* Cascading Location Hierarchy */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Location Hierarchy *
                </h3>
                <span className="text-[11px] text-slate-500">Pan-India Master Connected</span>
              </div>

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
                    city: sel.localityName || prev.city,
                    areaId: sel.areaId || '',
                    areaName: sel.areaName || '',
                    area: sel.areaName || sel.localityName || prev.area,
                  }));
                }}
                mode="stacked"
                required={true}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Premises Street Address"
                  required
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Near Tehsil, Main Market Road"
                />
              </div>
              <Input
                label="Pincode"
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                placeholder="233221"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Input
                label="Total Study Desks Capacity"
                type="number"
                min="10"
                max="500"
                value={String(formData.totalSeats)}
                onChange={(e) => handleChange('totalSeats', Number(e.target.value) || 60)}
                placeholder="60"
              />
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.hasAirConditioning}
                    onChange={(e) => handleChange('hasAirConditioning', e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700">Air Conditioned (AC)</span>
                </label>
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.hasHighSpeedWifi}
                    onChange={(e) => handleChange('hasHighSpeedWifi', e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700">High-Speed 5G Wi-Fi</span>
                </label>
              </div>
            </div>

            {/* Dynamic District Rule Notice */}
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-indigo-900">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Pricing for <span className="font-bold">{formData.districtName || 'National'}</span>:
                  {' '}{formData.districtName === 'Ghazipur' ? 'Special Ghazipur District Tier (₹300/mo)' : 'Pan-India Standard Tier (₹500/mo)'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-indigo-700">Dynamic</span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button
                size="md"
                variant="outline"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setCurrentStep(0)}
              >
                Back
              </Button>
              <Button
                size="lg"
                variant="primary"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => {
                  if (validateStep2()) {
                    setCurrentStep(2);
                    resolvePrice();
                  }
                }}
              >
                Continue to Subscription
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Subscription Plan & Payment Gateway */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Select Listing Subscription Plan</h2>
                <p className="text-xs text-slate-500">Choose your duration and billing cycle. Billed securely with 24-hour refund protection.</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                24H Cancellation Guaranteed
              </span>
            </div>

            {/* Plan Duration Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { cycle: 'MONTHLY' as const, name: 'Monthly', months: '1 Mo', discount: 'Regular', popular: false },
                { cycle: 'QUARTERLY' as const, name: 'Quarterly', months: '3 Mo', discount: 'Save 15%', popular: true },
                { cycle: 'HALF_YEARLY' as const, name: 'Half-Yearly', months: '6 Mo', discount: 'Save 20%', popular: false },
                { cycle: 'YEARLY' as const, name: 'Annual', months: '12 Mo', discount: 'Save 25%', popular: false },
              ].map((p) => {
                const isSelected = selectedCycle === p.cycle;
                return (
                  <div
                    key={p.cycle}
                    onClick={() => setSelectedCycle(p.cycle)}
                    className={`relative p-4 rounded-xl cursor-pointer border-2 transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/20 shadow-md ring-2 ring-brand-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2.5 right-2 bg-brand-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                        Popular
                      </span>
                    )}
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{p.name}</p>
                    <h4 className="text-lg font-black text-slate-900 mt-1">{p.months}</h4>
                    <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">{p.discount}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-brand-700">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'}`}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span>{isSelected ? 'Selected' : 'Select'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing Calculation Breakdown */}
            {priceCalculation && (
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-5 shadow-lg border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Fee Assessment</span>
                    <h3 className="text-lg font-black text-white">
                      {priceCalculation.selectedPlan.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">
                      {priceCalculation.isFree ? (
                        <span className="text-emerald-400">FREE</span>
                      ) : (
                        `₹${priceCalculation.finalPayableAmount.toLocaleString('en-IN')}`
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400">Inclusive of all taxes & accreditation fees</p>
                  </div>
                </div>

                {/* 4-Tier Hierarchy Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Base Plan Rate:</span>
                      <span className="font-semibold text-white">₹{priceCalculation.basePrice}</span>
                    </div>
                    {priceCalculation.hierarchyBreakdown.stateDefault && (
                      <div className="flex justify-between text-slate-300">
                        <span>State ({formData.stateName}) Override:</span>
                        <span className="font-semibold text-white">₹{priceCalculation.hierarchyBreakdown.stateDefault.fee}</span>
                      </div>
                    )}
                    {priceCalculation.hierarchyBreakdown.districtDefault && (
                      <div className="flex justify-between text-slate-300">
                        <span>District ({formData.districtName}) Override:</span>
                        <span className="font-semibold text-emerald-400">₹{priceCalculation.hierarchyBreakdown.districtDefault.fee}</span>
                      </div>
                    )}
                    {priceCalculation.hierarchyBreakdown.particularLibrary && (
                      <div className="flex justify-between text-slate-300">
                        <span>Library Override:</span>
                        <span className="font-semibold text-emerald-400">₹{priceCalculation.hierarchyBreakdown.particularLibrary.fee}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {priceCalculation.offerDiscount > 0 && (
                      <div className="flex justify-between text-slate-300">
                        <span>Duration / Offer Discount ({selectedCycle}):</span>
                        <span className="font-semibold text-emerald-400">-₹{priceCalculation.offerDiscount}</span>
                      </div>
                    )}
                    {priceCalculation.couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-300">
                        <span>Coupon ({priceCalculation.couponCode}):</span>
                        <span className="font-semibold">-₹{priceCalculation.couponDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                      <span>Hierarchy Resolution Tier:</span>
                      <span className="font-mono text-indigo-300 text-[11px] uppercase">
                        {priceCalculation.pricingScope}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coupon Input Area */}
                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter promo coupon (e.g. LIBRARY50, WELCOMEFREE)"
                      disabled={Boolean(appliedCoupon)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono tracking-wider uppercase"
                    />
                  </div>
                  {appliedCoupon ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-rose-400 text-rose-300 hover:bg-rose-950/40"
                      onClick={handleRemoveCoupon}
                    >
                      Remove ({appliedCoupon})
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={handleApplyCoupon}
                      isLoading={isResolvingPrice}
                    >
                      Apply Coupon
                    </Button>
                  )}
                </div>

                {couponError && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {couponError}
                  </p>
                )}
              </div>
            )}

            {/* ZERO-PAYMENT / FREE SUBSCRIPTION GATE */}
            {priceCalculation?.isFree ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      Free Registration Tier Activated (₹0)
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      No monetary payment is required. Your study library listing will be registered as <span className="font-bold">Active Free Tier</span> and submitted directly to {formData.districtName} District Admin.
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-emerald-200/80 text-[11px] text-slate-600">
                  <span>Included in Free Tier: Full desk management, daily walk-in attendance, student receipt generation, and district directory listing.</span>
                </div>
              </div>
            ) : (
              /* PAID SUBSCRIPTION GATE (> ₹0) */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Select Payment Mode *
                    </h3>
                    <span className="text-[11px] text-slate-500">256-Bit SSL Secured</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setPaymentMethod('UPI_QR')}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                        paymentMethod === 'UPI_QR'
                          ? 'border-brand-600 bg-white shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">UPI Instant QR Code</h4>
                        <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('CARD_NETBANKING')}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                        paymentMethod === 'CARD_NETBANKING'
                          ? 'border-brand-600 bg-white shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Card / NetBanking Gateway</h4>
                        <p className="text-[11px] text-slate-500">Visa, Mastercard, RuPay, All Banks</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Simulator Widget */}
                  {paymentStatus !== 'PAID' && (
                    <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-3">
                      {paymentMethod === 'UPI_QR' ? (
                        <div className="space-y-2">
                          <div className="w-36 h-36 mx-auto bg-slate-100 rounded-xl p-2 border border-slate-300 flex items-center justify-center shadow-inner">
                            <QrCode className="w-28 h-28 text-slate-800" />
                          </div>
                          <p className="text-xs font-mono font-bold text-slate-700">UPI ID: zyzus.library@okhdfcbank</p>
                          <p className="text-[11px] text-slate-500">Scan using any UPI App to pay ₹{priceCalculation?.finalPayableAmount}</p>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-600 space-y-1">
                          <p className="font-bold text-slate-800">Direct Gateway Checkout</p>
                          <p>Click below to simulate secure banking authentication.</p>
                        </div>
                      )}

                      {/* Simulator failure test control */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2">
                        <label className="text-[11px] text-slate-500 flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={simulateFailure}
                            onChange={(e) => setSimulateFailure(e.target.checked)}
                            className="rounded text-brand-600"
                          />
                          <span>Simulate payment failure (Verify retry without data loss)</span>
                        </label>
                      </div>

                      {paymentError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-left text-xs text-rose-800 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Transaction Failed</p>
                            <p className="text-[11px]">{paymentError}</p>
                          </div>
                        </div>
                      )}

                      <Button
                        size="lg"
                        variant="primary"
                        className="w-full sm:w-auto px-8"
                        onClick={handleExecutePayment}
                        isLoading={paymentStatus === 'PROCESSING'}
                      >
                        {paymentStatus === 'FAILED' ? 'Retry Payment Transaction' : `Pay ₹${priceCalculation?.finalPayableAmount} & Confirm Subscription`}
                      </Button>
                    </div>
                  )}

                  {paymentStatus === 'PAID' && confirmedPayment && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="text-xs font-bold">Payment Verified Successfully!</p>
                          <p className="text-[11px] font-mono text-emerald-700">
                            Txn ID: {confirmedPayment.paymentId} • ₹{confirmedPayment.finalAmount}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        PAID
                      </span>
                    </div>
                  )}
                </div>

                {/* 24-Hour Policy Notice */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold">24-Hour Full Refund Policy:</span> If you wish to cancel this registration subscription within 24 hours of activation, you can do so with 1-click from your billing dashboard for an immediate 100% refund.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-200">
              <Button
                size="md"
                variant="outline"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setCurrentStep(1)}
              >
                Back to Location
              </Button>
              <Button
                size="lg"
                variant="primary"
                onClick={handleFinalSubmit}
                isLoading={isSubmitting}
                disabled={!priceCalculation?.isFree && paymentStatus !== 'PAID'}
              >
                {priceCalculation?.isFree ? 'Submit & Activate Free Listing' : 'Submit Library for District Approval'}
              </Button>
            </div>
          </div>
        )}

        <div className="text-center pt-6 text-xs text-slate-600 border-t border-slate-200 mt-6">
          Already registered as a library owner?{' '}
          <Link to="/login" className="text-brand-600 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </Card>
    </div>
  );
};
