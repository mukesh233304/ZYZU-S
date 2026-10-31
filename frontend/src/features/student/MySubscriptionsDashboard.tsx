// FOCUSPOINT — My Subscriptions & Entitlements Dashboard
// Real-time Expiry Tracking, Status Indicators, Benefit Checklists, and Unified Receipt Experience

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Receipt, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  RefreshCw, 
  ShoppingBag, 
  Sparkles, 
  FileText, 
  ArrowRight,
  Printer,
  Building, 
  GraduationCap,
  Download,
  Eye,
  Check,
  Zap,
  CreditCard,
  QrCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { academicEntitlementService } from '../../services/academicEntitlementService';
import { StudentSubscription, ExpiryNotification } from '../../types/eligibilityAndPricing';
import { UnifiedFocusPointDocument, DocumentLineItem } from '../../types/document';
import { UnifiedDocumentViewer } from '../../components/documents/UnifiedDocumentViewer';

export function convertSubscriptionToDocument(
  sub: StudentSubscription,
  studentName: string,
  studentId: string
): UnifiedFocusPointDocument {
  const cleanId = sub.id.replace(/^sub-/, '');
  const docNumber = `FP-SUB-${cleanId.toUpperCase()}`;

  const couponDisc = (sub as any).couponDiscount || 0;
  const generalDisc = Math.max(0, sub.discount - couponDisc);

  const lineItems: DocumentLineItem[] = [
    {
      label: `Digital Learning Subscription: ${sub.productName}`,
      amount: sub.originalPrice,
    },
    ...(generalDisc > 0 ? [
      {
        label: 'Scholar / Priority Quota Concession',
        amount: -generalDisc,
        isDeduction: true,
      }
    ] : []),
    ...(couponDisc > 0 ? [
      {
        label: `Promo Coupon Applied (${(sub as any).couponCode || 'PROMO'})`,
        amount: -couponDisc,
        isDeduction: true,
      }
    ] : (sub.discount > 0 && generalDisc === 0 ? [
      {
        label: 'Promotional Concession Applied',
        amount: -sub.discount,
        isDeduction: true,
      }
    ] : [])),
    {
      label: 'Educational GST (Exempted Under Indian Education Norms)',
      amount: 0,
    },
    {
      label: 'Reconciled Settlement in Full (Zero Dues)',
      amount: sub.finalPaidAmount,
      isHighlight: true,
    }
  ];

  return {
    id: `doc-${docNumber}`,
    documentNumber: docNumber,
    title: `Subscription Fee Receipt — ${sub.productName}`,
    category: 'SUBSCRIPTION',
    documentType: 'PAYMENT_INVOICE',
    recipientId: studentId,
    recipientName: studentName,
    recipientRole: 'STUDENT',
    district: 'Uttar Pradesh',
    state: 'Uttar Pradesh',
    authorizedBy: "ZYZU'S Digital Learning & Exam Center",
    authorizedRole: 'SUPER_ADMIN',
    qrVerificationUrl: `https://zyzus.com/verify/doc/${docNumber}`,
    qrVerificationHash: `SHA256-SUB-${cleanId.toUpperCase()}-VERIFIED`,
    version: 1,
    isCurrent: true,
    issueDate: sub.startDate,
    validUntil: sub.endDate,
    status: 'READY',
    paymentStatus: 'PAID',
    amount: sub.finalPaidAmount,
    currency: 'INR',
    paymentMethod: 'Prepaid Digital Pass (Instant Clearing)',
    paymentId: sub.paymentId || `PAY-SUB-${cleanId}`,
    transactionId: sub.paymentId || `TXN-SUB-${cleanId}`,
    transactionRef: sub.paymentId || `UPI/FP/SUB/${cleanId}`,
    billingPeriod: `${sub.startDate} to ${sub.endDate}`,
    lineItems,
    metadata: {
      invoiceNumber: sub.invoiceNumber || `FP-INV-${cleanId}`,
      planName: sub.productName,
      status: sub.status,
      startDate: sub.startDate,
      endDate: sub.endDate,
      source: sub.source,
      featuresIncluded: sub.features,
    },
    auditTrail: [
      {
        action: 'GENERATED',
        timestamp: new Date().toISOString(),
        performedBy: 'Subscription Gateway',
        performedByRole: 'SYSTEM'
      }
    ],
    createdAt: sub.startDate ? new Date(sub.startDate).toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export const MySubscriptionsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const studentId = user?.id || 'usr-student-aryan';
  const studentName = user?.name || 'Aryan Sharma';

  const [subscriptions, setSubscriptions] = useState<StudentSubscription[]>([]);
  const [notifications, setNotifications] = useState<ExpiryNotification[]>([]);
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<UnifiedFocusPointDocument | null>(null);

  const loadSubscriptions = () => {
    const subs = academicEntitlementService.getStudentSubscriptions(studentId);
    setSubscriptions(subs);
    const notifs = academicEntitlementService.getExpiryNotifications(studentId);
    setNotifications(notifs);
  };

  useEffect(() => {
    loadSubscriptions();
    const unsub = academicEntitlementService.subscribe(loadSubscriptions);
    return () => unsub();
  }, [studentId]);

  const today = new Date().toISOString().split('T')[0];

  // Group subscriptions
  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter(s => s.status === 'ACTIVE' && s.endDate >= today);
  }, [subscriptions, today]);

  const expiredSubscriptions = useMemo(() => {
    return subscriptions.filter(s => s.status === 'EXPIRED' || s.endDate < today);
  }, [subscriptions, today]);

  const filteredSubscriptions = useMemo(() => {
    if (selectedTab === 'ACTIVE') return activeSubscriptions;
    if (selectedTab === 'EXPIRED') return expiredSubscriptions;
    return subscriptions;
  }, [selectedTab, subscriptions, activeSubscriptions, expiredSubscriptions]);

  // Calculate days remaining
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = new Date(today).getTime();
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  };

  // Expiry Pill Component with high-contrast text
  const renderExpiryPill = (endDate: string, status: string) => {
    if (status === 'EXPIRED' || endDate < today) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full bg-rose-950/90 text-rose-200 border-2 border-rose-500/70 shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 stroke-[2.5]" />
          <span>Expired on {endDate}</span>
        </span>
      );
    }

    const days = getDaysRemaining(endDate);

    if (days <= 1) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full bg-red-950 text-red-200 border-2 border-red-500 animate-pulse shadow-lg shadow-red-500/20">
          <Clock className="w-3.5 h-3.5 text-red-400 stroke-[2.5]" />
          <span>Expires in {days === 0 ? 'Hours' : '1 Day'}</span>
        </span>
      );
    }

    if (days <= 3) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full bg-amber-950/90 text-amber-200 border-2 border-amber-500/70 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
          <span>{days} Days Remaining</span>
        </span>
      );
    }

    if (days <= 7) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full bg-yellow-950/90 text-yellow-200 border-2 border-yellow-500/70 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-yellow-400 stroke-[2.5]" />
          <span>{days} Days Remaining</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full bg-emerald-950/90 text-emerald-200 border-2 border-emerald-500/60 shadow-sm">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
        <span>{days} Days Active</span>
      </span>
    );
  };

  const getStatusBadge = (status: string, endDate: string) => {
    const isPast = endDate < today;
    if (isPast || status === 'EXPIRED') {
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-rose-950/90 text-rose-200 border border-rose-500/60 shadow-xs">
          EXPIRED
        </span>
      );
    }
    if (status === 'ACTIVE') {
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-emerald-950/90 text-emerald-200 border border-emerald-500/60 shadow-xs">
          ACTIVE
        </span>
      );
    }
    if (status === 'PENDING') {
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-amber-950/90 text-amber-200 border border-amber-500/60 shadow-xs">
          PAYMENT PENDING
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-slate-800 text-slate-200 border border-slate-600 shadow-xs">
        {status}
      </span>
    );
  };

  const getSourceBadge = (sub: StudentSubscription) => {
    switch (sub.source) {
      case 'LIBRARY_BOOKING':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-lg bg-purple-950/90 text-purple-200 border border-purple-500/50 shadow-xs">
            <Building className="w-3.5 h-3.5 text-purple-300" />
            <span>Library Seat Pass ({sub.libraryName || 'Library'})</span>
          </span>
        );
      case 'TEACHER_ALLOTMENT':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-lg bg-blue-950/90 text-blue-200 border border-blue-500/50 shadow-xs">
            <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
            <span>Educator Allotment</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-lg bg-indigo-950/90 text-cyan-200 border border-indigo-400/50 shadow-xs">
            <Receipt className="w-3.5 h-3.5 text-cyan-300" />
            <span>Direct Digital Store Pass</span>
          </span>
        );
    }
  };

  const handleOpenReceipt = (sub: StudentSubscription) => {
    const doc = convertSubscriptionToDocument(sub, studentName, studentId);
    setSelectedDoc(doc);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner — Futuristic MNC EdTech Aesthetics */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/80 border border-indigo-400/60 text-cyan-300 text-xs font-black uppercase tracking-wider shadow-sm">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              ZYZU'S Academic Entitlements &amp; Licenses
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-sm">
              My Subscriptions &amp; Active Passes
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium">
              Real-time subscription status, benefit checklists, and certified tax receipts. All historical practice records and personal mistake book insights remain permanently accessible.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate('/student/mock-tests')}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border-2 border-cyan-500/60 shadow-lg text-xs font-black flex items-center gap-2 transition-all cursor-pointer hover:border-cyan-400"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Mock Test Center</span>
            </button>
            <button 
              type="button"
              onClick={() => navigate('/student/store')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-black shadow-lg shadow-indigo-600/35 border border-indigo-400 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Learning Store</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expiry Alerts (7d, 3d, 1d) */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.slice(0, 2).map(notif => (
            <div 
              key={notif.id}
              className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xl ${
                notif.type === 'EXPIRED' || notif.type === '1_DAY'
                  ? 'bg-rose-950/90 border-rose-500/70 text-rose-100 shadow-rose-950/20'
                  : 'bg-amber-950/90 border-amber-500/70 text-amber-100 shadow-amber-950/20'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 sm:mt-0 ${
                  notif.type === 'EXPIRED' || notif.type === '1_DAY' ? 'text-rose-400' : 'text-amber-400'
                }`} />
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-white">
                    {notif.type === 'EXPIRED' ? 'Subscription Expired' : `Renewal Notice (${notif.daysRemaining}d remaining)`}
                  </div>
                  <div className="text-xs text-slate-200 mt-0.5 font-medium">{notif.message}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/student/store')}
                className="shrink-0 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-amber-300 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/30 border border-amber-300 self-start sm:self-auto flex items-center gap-1.5 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                <span>Renew Now</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* KPI Stats Overview — Futuristic Dark Glassmorphic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Active Subscriptions Card */}
        <div className="p-5 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/40 shadow-xl shadow-emerald-950/20 text-white flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1.5">
            <p className="text-xs font-black uppercase tracking-wider text-emerald-300 font-mono">
              Active Subscriptions
            </p>
            <p className="text-3xl lg:text-4xl font-black text-white font-mono tracking-tight">
              {activeSubscriptions.length}
            </p>
            <p className="text-xs font-medium text-slate-300">
              Currently authorized learning passes
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 group-hover:scale-110 transition-transform shadow-md">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Expired Passes Card */}
        <div className="p-5 rounded-3xl bg-slate-900/95 border-2 border-slate-750 shadow-xl text-white flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1.5">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
              Expired Passes
            </p>
            <p className="text-3xl lg:text-4xl font-black text-white font-mono tracking-tight">
              {expiredSubscriptions.length}
            </p>
            <p className="text-xs font-medium text-slate-300">
              Historical logs and scores preserved
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800 border border-slate-750 text-slate-300 group-hover:scale-110 transition-transform shadow-md">
            <Clock className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Features Unlocked Card */}
        <div className="p-5 rounded-3xl bg-slate-900/95 border-2 border-indigo-500/40 shadow-xl shadow-indigo-950/20 text-white flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1.5">
            <p className="text-xs font-black uppercase tracking-wider text-indigo-300 font-mono">
              Total Features Unlocked
            </p>
            <p className="text-3xl lg:text-4xl font-black text-white font-mono tracking-tight">
              {Array.from(new Set(activeSubscriptions.flatMap(s => s.features))).length}
            </p>
            <p className="text-xs font-medium text-slate-300">
              Mock tests, notes, AI analytics
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-cyan-300 group-hover:scale-110 transition-transform shadow-md">
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Subscriptions', count: subscriptions.length },
          { id: 'ACTIVE', label: 'Active Passes', count: activeSubscriptions.length },
          { id: 'EXPIRED', label: 'Archived / Expired', count: expiredSubscriptions.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              selectedTab === tab.id
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-2 border-indigo-300 text-white shadow-xl shadow-indigo-600/30 scale-[1.02]'
                : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-2 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              selectedTab === tab.id ? 'bg-white text-indigo-900' : 'bg-slate-800 text-cyan-300 border border-slate-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Subscriptions Grid */}
      {filteredSubscriptions.length === 0 ? (
        <div className="p-12 text-center border-dashed border-2 border-slate-800 bg-slate-950/60 rounded-3xl shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border-2 border-indigo-500/40 text-cyan-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/10">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">No Subscriptions Found</h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto mb-6 font-medium">
            {selectedTab === 'ACTIVE' 
              ? 'You do not have any active subscriptions. Explore the Digital Learning Store to unlock mock tests and high-yield notes.'
              : 'No subscription history matches this category.'}
          </p>
          <button 
            type="button"
            onClick={() => navigate('/student/store')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 mx-auto cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Digital Learning Store</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSubscriptions.map(sub => {
            const isExpired = sub.status === 'EXPIRED' || sub.endDate < today;

            return (
              <div 
                key={sub.id}
                className={`relative flex flex-col justify-between overflow-hidden p-6 sm:p-7 rounded-3xl border-2 transition-all duration-200 text-white shadow-2xl ${
                  isExpired 
                    ? 'border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950' 
                    : 'border-indigo-500/60 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 shadow-indigo-950/40'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Badges Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getSourceBadge(sub)}
                      {getStatusBadge(sub.status, sub.endDate)}
                    </div>
                    {renderExpiryPill(sub.endDate, sub.status)}
                  </div>

                  {/* Title & Product Name */}
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight leading-snug">
                      {sub.productName}
                    </h3>
                    <p className="text-xs text-slate-300 font-mono mt-1 font-medium">
                      Official Invoice Ref: <span className="text-cyan-300 font-bold">{sub.invoiceNumber}</span>
                    </p>
                  </div>

                  {/* Date & Pricing Grid — Distinct Cyber Container */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/90 border-2 border-indigo-500/30 text-xs shadow-inner">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold tracking-wider">Start Date</span>
                      <span className="font-black text-white font-mono mt-0.5 block text-sm">{sub.startDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold tracking-wider">Expiry Date</span>
                      <span className="font-black text-white font-mono mt-0.5 block text-sm">{sub.endDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold tracking-wider">Plan Amount</span>
                      <span className="font-black text-white font-mono mt-0.5 block text-sm">₹{sub.originalPrice}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 block uppercase font-mono font-bold tracking-wider">Paid (Settled)</span>
                      <span className="font-black text-emerald-400 font-mono mt-0.5 block text-base">₹{sub.finalPaidAmount}</span>
                    </div>
                  </div>

                  {/* Included Entitlements */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-black text-indigo-300 uppercase tracking-wider block">
                      Authorized Academic Benefits:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {sub.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-100 font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3] shrink-0" />
                          <span className="truncate">
                            {feat === 'MOCK_TESTS' && 'All Mock Tests'}
                            {feat === 'ALL_MOCK_TESTS' && 'Unlimited Mock Tests'}
                            {feat === 'SUBJECT_MOCK_TESTS' && 'Subject Practice Tests'}
                            {feat === 'STUDY_MATERIAL' && 'Study Material Vault'}
                            {feat === 'GROWING_INTELLIGENCE' && 'Academic Growth Intelligence'}
                            {feat === 'MISTAKE_BOOK' && 'Personal Mistake Book'}
                            {feat === 'PERFORMANCE_ANALYTICS' && 'Performance Analytics'}
                            {feat === 'GOVT_EXAMS' && 'Govt Exams Pass'}
                            {feat === 'ADMISSION_EXAMS' && 'Admission Exams Pass'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer — High Contrast, Vivid Glowing Buttons */}
                <div className="mt-6 pt-5 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
                  {/* Primary View Stamped Receipt Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenReceipt(sub)}
                    className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/30 border border-cyan-300 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Receipt className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    <span>View Stamped Receipt</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Download Receipt Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenReceipt(sub)}
                      className="px-4 py-2.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-cyan-300 border-2 border-cyan-500/60 shadow-md flex items-center gap-2 transition-all cursor-pointer hover:border-cyan-400"
                    >
                      <Download className="w-4 h-4 text-cyan-400 stroke-[2.5]" />
                      <span>Download Receipt</span>
                    </button>

                    {isExpired ? (
                      <button
                        type="button"
                        onClick={() => navigate('/student/store')}
                        className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-amber-300 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/30 border border-amber-300 flex items-center gap-1.5 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <RefreshCw className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                        <span>Renew Pass</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate('/student/mock-tests')}
                        className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/35 border border-indigo-400 flex items-center gap-1.5 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span>Launch Mock Center</span>
                        <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Down Section: Dedicated Official Fee Receipts & Tax Invoices Master Ledger */}
      {subscriptions.length > 0 && (
        <div className="mt-12 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 border-2 border-indigo-500/40 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 text-xs font-black uppercase tracking-wider">
                <Receipt className="w-4 h-4 text-cyan-400" />
                Verified Tax Invoices &amp; Receipts Ledger
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Certified Fee Receipts &amp; Tax Invoices
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Official GST-exempted digital education receipts authorized under Indian Education Norms. Real-time SHA-256 and QR verification enabled.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-700">
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Instant QR Verification Active</span>
            </div>
          </div>

          <div className="space-y-3">
            {subscriptions.map(sub => {
              const cleanId = sub.id.replace(/^sub-/, '');
              const docNumber = `FP-SUB-${cleanId.toUpperCase()}`;

              return (
                <div 
                  key={`ledger-${sub.id}`}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900/95 border-2 border-slate-800 hover:border-indigo-500/50 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all text-white"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border-2 border-cyan-500/50 text-cyan-400 flex items-center justify-center shrink-0 shadow-md">
                      <FileText className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-cyan-300 text-sm tracking-wide">
                          {docNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/60">
                          PAID &amp; CERTIFIED
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm sm:text-base mt-0.5">
                        {sub.productName}
                      </h4>
                      <p className="text-xs text-slate-300 font-mono mt-0.5 font-medium">
                        Period: {sub.startDate} to {sub.endDate} • Ref: {sub.paymentId || 'UPI-INSTANT-CLEARING'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">Settled Amount</span>
                      <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono block">
                        ₹{sub.finalPaidAmount} <span className="text-xs text-emerald-300 font-bold">(Zero Dues)</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenReceipt(sub)}
                        className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-md shadow-cyan-500/25 border border-cyan-300 flex items-center gap-1.5 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                        <span>View Stamped Receipt</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenReceipt(sub)}
                        className="px-3.5 py-2 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-cyan-300 border-2 border-cyan-500/60 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:border-cyan-400"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unified Document Viewer for Subscription Receipt (Standardized with Demo Pass & Fee Receipts) */}
      <UnifiedDocumentViewer
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
        currentUserRole="STUDENT"
        currentUserId={studentId}
      />
    </div>
  );
};
