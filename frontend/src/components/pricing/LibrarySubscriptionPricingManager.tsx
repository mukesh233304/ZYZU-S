import React, { useState, useEffect } from 'react';
import { 
  LibrarySubscriptionPlan, 
  LibrarySubscriptionPricingRule, 
  LibrarySubscription, 
  LibrarySubscriptionPaymentRecord,
  LibrarySubscriptionCancellationRequest,
  LibrarySubscriptionPriceCalculation,
  LibrarySubscriptionAnalytics,
  LibrarySubscriptionRefundPolicy,
  LibrarySubscriptionPriceProtection
} from '../../types/librarySubscriptionPricing';
import { librarySubscriptionService } from '../../services/librarySubscriptionService';
import { Card, StatCard } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Layers,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  Percent,
  Search,
  RefreshCw,
  Plus,
  ArrowRight,
  ArrowLeft,
  XCircle,
  FileText,
  AlertTriangle,
  History,
  TrendingUp,
  Receipt,
  RotateCcw,
  Zap,
  Globe,
  Sliders,
  DollarSign
} from 'lucide-react';

interface LibrarySubscriptionPricingManagerProps {
  forcedDistrict?: string;
}

export const LibrarySubscriptionPricingManager: React.FC<LibrarySubscriptionPricingManagerProps> = ({
  forcedDistrict
}) => {
  const { showToast } = useToast();
  const isDistrictAdmin = Boolean(forcedDistrict);

  // Tab State
  const [activeTab, setActiveTab] = useState<'RULES' | 'PLANS' | 'SUBSCRIPTIONS' | 'CANCELLATIONS' | 'LEDGER'>('RULES');
  const [loading, setLoading] = useState(true);

  // Data
  const [plans, setPlans] = useState<LibrarySubscriptionPlan[]>([]);
  const [rules, setRules] = useState<LibrarySubscriptionPricingRule[]>([]);
  const [subscriptions, setSubscriptions] = useState<LibrarySubscription[]>([]);
  const [payments, setPayments] = useState<LibrarySubscriptionPaymentRecord[]>([]);
  const [cancellations, setCancellations] = useState<LibrarySubscriptionCancellationRequest[]>([]);
  const [analytics, setAnalytics] = useState<LibrarySubscriptionAnalytics>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    freeListings: 0,
    paidListings: 0,
    expiringSoon: 0,
    gracePeriodCount: 0,
    cancelledCount: 0,
    totalGmv: 0,
    totalNetRevenue: 0,
    totalRefunded: 0,
    planDistribution: {}
  });

  // Filter States
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPlan, setFilterPlan] = useState('ALL');

  // Hierarchy Simulator State
  const [simState, setSimState] = useState('Uttar Pradesh');
  const [simDistrict, setSimDistrict] = useState(forcedDistrict || 'Ghazipur');
  const [simLibraryName, setSimLibraryName] = useState('');
  const [simPlanId, setSimPlanId] = useState('lsp-monthly');
  const [simCouponCode, setSimCouponCode] = useState('');
  const [simResult, setSimResult] = useState<LibrarySubscriptionPriceCalculation | null>(null);

  // 8-Step Wizard Modal State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardSubmitting, setWizardSubmitting] = useState(false);
  const [ruleForm, setRuleForm] = useState<{
    id?: string;
    name: string;
    scope: 'PAN_INDIA' | 'STATE' | 'DISTRICT' | 'PARTICULAR';
    state: string;
    district: string;
    libraryId: string;
    libraryName: string;
    planId: string;
    price: number;
    effectiveFrom: string;
    effectiveUntil: string;
    refundPolicy: LibrarySubscriptionRefundPolicy;
    priceProtection: LibrarySubscriptionPriceProtection;
    lockedCycles: number;
    gracePeriodDays: number;
  }>({
    name: '',
    scope: isDistrictAdmin ? 'DISTRICT' : 'PAN_INDIA',
    state: 'Uttar Pradesh',
    district: forcedDistrict || 'Ghazipur',
    libraryId: '',
    libraryName: '',
    planId: 'lsp-monthly',
    price: 300,
    effectiveFrom: new Date().toISOString().substring(0, 10),
    effectiveUntil: '',
    refundPolicy: 'FULL_24H',
    priceProtection: 'NONE',
    lockedCycles: 2,
    gracePeriodDays: 7
  });

  // Invoice / Receipt Viewer Modal
  const [viewInvoiceRecord, setViewInvoiceRecord] = useState<LibrarySubscriptionPaymentRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pList, rList, sList, payList, canList, aData] = await Promise.all([
        librarySubscriptionService.getAvailablePlans(),
        librarySubscriptionService.getPricingRules(forcedDistrict),
        librarySubscriptionService.getAllSubscriptions(forcedDistrict ? { district: forcedDistrict } : undefined),
        librarySubscriptionService.getPayments(forcedDistrict),
        librarySubscriptionService.getCancellationRequests(),
        librarySubscriptionService.getAnalytics(forcedDistrict)
      ]);

      setPlans(pList);
      setRules(rList);
      setSubscriptions(sList);
      setPayments(payList);
      setCancellations(canList);
      setAnalytics(aData);
    } catch (e: any) {
      showToast(e?.message || 'Failed to load subscription data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [forcedDistrict]);

  // Run Simulator on changes
  useEffect(() => {
    const runSim = async () => {
      try {
        const res = await librarySubscriptionService.calculateSubscriptionPrice({
          state: simState,
          district: simDistrict,
          libraryName: simLibraryName,
          planId: simPlanId,
          couponCode: simCouponCode
        });
        setSimResult(res);
      } catch (err) {
        console.error('Simulator error', err);
      }
    };
    runSim();
  }, [simState, simDistrict, simLibraryName, simPlanId, simCouponCode, rules]);

  // Handle Wizard Submission
  const handleSaveRule = async () => {
    setWizardSubmitting(true);
    try {
      await librarySubscriptionService.savePricingRule(
        {
          id: ruleForm.id || `ls-rule-${Date.now()}`,
          name: ruleForm.name || `${ruleForm.scope} Library Listing Policy`,
          scope: ruleForm.scope,
          planId: ruleForm.planId,
          state: ruleForm.scope !== 'PAN_INDIA' ? ruleForm.state : undefined,
          district: (ruleForm.scope === 'DISTRICT' || ruleForm.scope === 'PARTICULAR') ? ruleForm.district : undefined,
          libraryId: ruleForm.scope === 'PARTICULAR' ? ruleForm.libraryId : undefined,
          libraryName: ruleForm.scope === 'PARTICULAR' ? ruleForm.libraryName : undefined,
          price: Number(ruleForm.price),
          currency: 'INR',
          status: 'ACTIVE',
          effectiveFrom: ruleForm.effectiveFrom,
          effectiveUntil: ruleForm.effectiveUntil || undefined,
          refundPolicy: ruleForm.refundPolicy,
          priceProtection: ruleForm.priceProtection,
          lockedCycles: ruleForm.lockedCycles,
          gracePeriodDays: Number(ruleForm.gracePeriodDays),
          updatedAt: new Date().toISOString(),
          updatedBy: isDistrictAdmin ? `${forcedDistrict} District Admin` : 'Super Admin'
        },
        isDistrictAdmin ? 'district_admin' : 'super_admin',
        forcedDistrict
      );

      showToast('Subscription pricing rule saved successfully!', 'success');
      setIsWizardOpen(false);
      loadData();
    } catch (e: any) {
      showToast(e?.message || 'Failed to save pricing rule', 'error');
    } finally {
      setWizardSubmitting(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!window.confirm('Are you sure you want to deactivate and remove this subscription pricing rule?')) return;
    try {
      await librarySubscriptionService.deletePricingRule(
        ruleId,
        isDistrictAdmin ? 'district_admin' : 'super_admin',
        forcedDistrict
      );
      showToast('Pricing rule removed successfully.', 'success');
      loadData();
    } catch (e: any) {
      showToast(e?.message || 'Failed to delete rule', 'error');
    }
  };

  const handleToggleAutoRenew = async (subId: string, current: boolean) => {
    try {
      await librarySubscriptionService.toggleAutoRenew(subId, !current);
      showToast(`Auto-renew ${!current ? 'enabled' : 'disabled'} for subscription.`, 'success');
      loadData();
    } catch (e: any) {
      showToast('Failed to update auto-renew', 'error');
    }
  };

  const filteredSubscriptions = subscriptions.filter(s => {
    if (filterStatus !== 'ALL' && s.status !== filterStatus) return false;
    if (filterPlan !== 'ALL' && s.planId !== filterPlan) return false;
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      const matchLib = s.libraryName.toLowerCase().includes(q);
      const matchOwner = s.ownerName.toLowerCase().includes(q);
      const matchEmail = s.ownerEmail.toLowerCase().includes(q);
      const matchInv = (s.invoiceNumber || '').toLowerCase().includes(q);
      return matchLib || matchOwner || matchEmail || matchInv;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {isDistrictAdmin ? `District Authority: ${forcedDistrict}` : 'Pan-India Master Authority'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> 4-Tier Engine Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Library Listing Subscription & Pricing Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Configure Pan-India, State, District, and Particular Library listing subscription plans, billing cycles, 24h cancellation rules, and payment-gated activation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-slate-700 hover:bg-slate-800 text-xs"
              onClick={loadData}
              isLoading={loading}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 text-xs font-bold"
              onClick={() => {
                setWizardStep(1);
                setRuleForm({
                  name: '',
                  scope: isDistrictAdmin ? 'DISTRICT' : 'PAN_INDIA',
                  state: 'Uttar Pradesh',
                  district: forcedDistrict || 'Ghazipur',
                  libraryId: '',
                  libraryName: '',
                  planId: 'lsp-monthly',
                  price: 300,
                  effectiveFrom: new Date().toISOString().substring(0, 10),
                  effectiveUntil: '',
                  refundPolicy: 'FULL_24H',
                  priceProtection: 'NONE',
                  lockedCycles: 2,
                  gracePeriodDays: 7
                });
                setIsWizardOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> New Pricing Rule
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Pan-India Plan"
          value="₹500 / mo"
          subtitle="Platform Standard"
          icon={<Globe className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Active Rules"
          value={rules.length.toString()}
          subtitle="Tier Overrides"
          icon={<Layers className="w-5 h-5 text-purple-600" />}
        />
        <StatCard
          title="Subscribed Libraries"
          value={analytics.totalSubscriptions.toString()}
          subtitle={`${analytics.activeSubscriptions} Active`}
          icon={<Building2 className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Free vs Paid"
          value={`${analytics.paidListings}P / ${analytics.freeListings}F`}
          subtitle="Listing Model Split"
          icon={<CreditCard className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          title="Expiring / Grace"
          value={`${analytics.expiringSoon + analytics.gracePeriodCount}`}
          subtitle="Needs Renewal"
          icon={<Clock className="w-5 h-5 text-rose-600" />}
        />
        <StatCard
          title="Net Subscription Rev"
          value={`₹${analytics.totalNetRevenue.toLocaleString()}`}
          subtitle={`GMV: ₹${analytics.totalGmv.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5 text-brand-600" />}
        />
      </div>

      {/* Interactive 4-Tier Hierarchy Simulator */}
      <Card className="p-5 bg-white border-slate-200 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Interactive Hierarchy Pricing Simulator</h2>
              <p className="text-xs text-slate-500">Test how the 4-tier engine resolves listing fees for any location, partner library, and billing plan.</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            Real-Time Engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">1. State</label>
            <select
              value={simState}
              onChange={e => setSimState(e.target.value)}
              disabled={isDistrictAdmin}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="Uttar Pradesh">Uttar Pradesh (UP)</option>
              <option value="Bihar">Bihar</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">2. District</label>
            <select
              value={simDistrict}
              onChange={e => setSimDistrict(e.target.value)}
              disabled={isDistrictAdmin}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="Ghazipur">Ghazipur</option>
              <option value="Varanasi">Varanasi</option>
              <option value="Patna">Patna</option>
              <option value="Lucknow">Lucknow</option>
              <option value="Prayagraj">Prayagraj</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">3. Library Name / Override</label>
            <input
              type="text"
              placeholder="e.g. FocusPoint Premier Study Library - Saidpur"
              value={simLibraryName}
              onChange={e => setSimLibraryName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">4. Subscription Plan</label>
            <select
              value={simPlanId}
              onChange={e => setSimPlanId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              {plans.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.billingCycle})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">5. Promo Coupon Code</label>
            <input
              type="text"
              placeholder="e.g. LIBRARY50, WELCOMEFREE"
              value={simCouponCode}
              onChange={e => setSimCouponCode(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 uppercase"
            />
          </div>
        </div>

        {/* Simulator Results Breakdown */}
        {simResult && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Applicable Priority Tier:</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {simResult.pricingScope}
                </span>
                <span className="text-xs text-slate-500 font-medium">({simResult.ruleName})</span>
              </div>
              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                <span>Base Plan Price: <strong className="text-slate-900">₹{simResult.basePrice}</strong></span>
                {simResult.offerDiscount > 0 && (
                  <span className="text-emerald-700">Special Offer: -₹{simResult.offerDiscount} ({simResult.offerName})</span>
                )}
                {simResult.couponDiscount > 0 && (
                  <span className="text-purple-700">Coupon Discount: -₹{simResult.couponDiscount} ({simResult.couponCode})</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Final Payable Fee</span>
                <span className={`text-xl font-black ${simResult.isFree ? 'text-emerald-600' : 'text-slate-950'}`}>
                  {simResult.isFree ? 'COMPLIMENTARY FREE' : `₹${simResult.finalPayableAmount.toLocaleString()}`}
                </span>
              </div>
              <div className="text-right text-xs">
                <span className="px-2.5 py-1 rounded-full font-bold text-[11px] bg-white border border-slate-300 shadow-sm block">
                  {simResult.paymentRequired ? 'Payment Gated' : 'Payment Bypassed (Direct Approval)'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('RULES')}
          className={`px-4 py-2.5 text-xs font-black tracking-wider uppercase border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'RULES'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Pricing Hierarchy Rules ({rules.length})
        </button>

        <button
          onClick={() => setActiveTab('PLANS')}
          className={`px-4 py-2.5 text-xs font-black tracking-wider uppercase border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'PLANS'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Subscription Plans ({plans.length})
        </button>

        <button
          onClick={() => setActiveTab('SUBSCRIPTIONS')}
          className={`px-4 py-2.5 text-xs font-black tracking-wider uppercase border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'SUBSCRIPTIONS'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Subscribed Libraries ({subscriptions.length})
        </button>

        <button
          onClick={() => setActiveTab('CANCELLATIONS')}
          className={`px-4 py-2.5 text-xs font-black tracking-wider uppercase border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'CANCELLATIONS'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" /> 24h Cancellations ({cancellations.length})
        </button>

        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`px-4 py-2.5 text-xs font-black tracking-wider uppercase border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'LEDGER'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" /> Payments & Invoices ({payments.length})
        </button>
      </div>

      {/* TAB 1: PRICING RULES TABLE */}
      {activeTab === 'RULES' && (
        <Card className="p-5 bg-white border-slate-200 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Active Hierarchy Pricing Policies</h3>
              <p className="text-xs text-slate-500">Tier rules take precedence from Particular Library down to Pan-India default.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-black tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Rule Name & Scope</th>
                  <th className="p-3">Target Location / Entity</th>
                  <th className="p-3">Monthly Base Fee</th>
                  <th className="p-3">Refund Policy</th>
                  <th className="p-3">Price Protection</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {rules.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{r.name}</div>
                      <span className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-black uppercase tracking-wider ${
                        r.scope === 'PARTICULAR' ? 'bg-purple-100 text-purple-800' :
                        r.scope === 'DISTRICT' ? 'bg-indigo-100 text-indigo-800' :
                        r.scope === 'STATE' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {r.scope} TIER
                      </span>
                    </td>
                    <td className="p-3">
                      {r.scope === 'PAN_INDIA' && <span className="text-slate-600">All India Default</span>}
                      {r.scope === 'STATE' && <span className="text-blue-700 font-semibold">{r.state} State</span>}
                      {r.scope === 'DISTRICT' && (
                        <div>
                          <div className="text-indigo-900 font-bold">{r.district} District</div>
                          <div className="text-[11px] text-slate-500">{r.state}</div>
                        </div>
                      )}
                      {r.scope === 'PARTICULAR' && (
                        <div>
                          <div className="text-purple-900 font-bold">{r.libraryName}</div>
                          <div className="text-[11px] text-slate-500">{r.district}, {r.state}</div>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`font-black text-sm ${r.price === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {r.price === 0 ? 'FREE (₹0)' : `₹${r.price.toLocaleString()}/mo`}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-slate-600 font-semibold">{r.refundPolicy}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-slate-600 font-semibold">{r.priceProtection}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteRule(r.id)}
                        disabled={isDistrictAdmin && r.scope !== 'DISTRICT'}
                        className="text-rose-600 hover:text-rose-800 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: SUBSCRIPTION PLANS */}
      {activeTab === 'PLANS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map(plan => (
            <Card key={plan.id} className="p-5 bg-white border-slate-200 shadow-md relative flex flex-col justify-between">
              {plan.isPopular && (
                <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-brand-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                  Most Popular
                </span>
              )}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {plan.billingCycle}
                  </span>
                  {plan.savingsPercent && plan.savingsPercent > 0 ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Save {plan.savingsPercent}%
                    </span>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-950">₹{plan.basePrice}</span>
                    <span className="text-xs text-slate-500 font-semibold">/ {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Included Benefits</span>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Duration: <strong>{plan.durationDays} Days</strong></span>
                <span className="text-emerald-700 font-bold">Active in Catalog</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: SUBSCRIBED LIBRARIES DIRECTORY */}
      {activeTab === 'SUBSCRIPTIONS' && (
        <Card className="p-5 bg-white border-slate-200 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search library, owner, invoice..."
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="GRACE_PERIOD">GRACE_PERIOD</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-black tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Library & Location</th>
                  <th className="p-3">Owner Contact</th>
                  <th className="p-3">Plan & Billing</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Expiry / Renewal</th>
                  <th className="p-3">Auto-Renew</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredSubscriptions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{s.libraryName}</div>
                      <div className="text-[11px] text-slate-500">{s.district}, {s.state}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-900 font-semibold">{s.ownerName}</div>
                      <div className="text-[11px] text-slate-500">{s.ownerMobile}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-indigo-900">{s.planName}</span>
                      <div className="text-[11px] text-slate-500">
                        {s.isFree ? 'Complimentary Free' : `₹${s.finalPaidAmount} (${s.billingCycle})`}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        s.status === 'GRACE_PERIOD' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        s.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-slate-700">{s.expiryDate}</span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleAutoRenew(s.id, s.autoRenew)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.autoRenew ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.autoRenew ? 'ON' : 'OFF'}
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <span className="text-[11px] text-slate-500 font-mono">{s.invoiceNumber}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: 24-HOUR CANCELLATION REQUESTS */}
      {activeTab === 'CANCELLATIONS' && (
        <Card className="p-5 bg-white border-slate-200 shadow-md">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900">24-Hour Subscription Cancellation Ledger</h3>
            <p className="text-xs text-slate-500">Automated audit of library cancellations executed within the guaranteed 24-hour server window.</p>
          </div>

          {cancellations.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No cancellation requests submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Request ID & Library</th>
                    <th className="p-3">Reason Category</th>
                    <th className="p-3">Reason Description</th>
                    <th className="p-3">Paid Amount</th>
                    <th className="p-3">Refund Amount</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {cancellations.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{c.libraryName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{c.id}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {c.reasonCategory}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs truncate text-slate-600">
                        {c.reason}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        ₹{c.paidAmount}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-700">
                        ₹{c.calculatedRefundAmount} ({c.refundPolicy})
                      </td>
                      <td className="p-3 text-[11px] text-slate-500 font-mono">
                        {new Date(c.requestTimestamp).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB 5: PAYMENTS & INVOICES LEDGER */}
      {activeTab === 'LEDGER' && (
        <Card className="p-5 bg-white border-slate-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Subscription Financial Ledger</h3>
              <p className="text-xs text-slate-500">Immutable record of all listing subscription collections, receipts, and invoices.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-black tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Invoice & ID</th>
                  <th className="p-3">Library & Location</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Original Fee</th>
                  <th className="p-3">Net Paid</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-900">
                      {p.invoiceNumber}
                      <div className="text-[10px] text-slate-500 font-normal">{p.id}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{p.libraryName}</div>
                      <div className="text-[11px] text-slate-500">{p.district}, {p.state}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800">{p.planName}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      ₹{p.originalFee}
                    </td>
                    <td className="p-3 font-mono font-black text-slate-950">
                      ₹{p.finalAmount}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        p.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => setViewInvoiceRecord(p)}
                      >
                        <FileText className="w-3 h-3 mr-1" /> View Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 8-STEP PRICING RULE WIZARD MODAL */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Library Listing Subscription Pricing Wizard"
        size="lg"
      >
        <div className="space-y-5">
          {/* Step Indicator */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <button
                key={s}
                onClick={() => setWizardStep(s)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  wizardStep === s
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                    : wizardStep > s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {wizardStep > s ? '✓' : s}
              </button>
            ))}
          </div>

          {/* STEP 1: SCOPE */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-900">Step 1: Select Hierarchy Pricing Tier</h4>
              <p className="text-xs text-slate-500">Pick which tier in the 4-tier engine this subscription rule applies to.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isDistrictAdmin}
                  onClick={() => setRuleForm(prev => ({ ...prev, scope: 'PAN_INDIA' }))}
                  className={`p-3 text-left rounded-xl border-2 transition-all ${
                    ruleForm.scope === 'PAN_INDIA'
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  } ${isDistrictAdmin ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <span className="font-bold text-xs text-slate-900 block">Pan-India Standard</span>
                  <span className="text-[11px] text-slate-500">Default fallback policy across all 700+ districts.</span>
                </button>

                <button
                  type="button"
                  disabled={isDistrictAdmin}
                  onClick={() => setRuleForm(prev => ({ ...prev, scope: 'STATE' }))}
                  className={`p-3 text-left rounded-xl border-2 transition-all ${
                    ruleForm.scope === 'STATE'
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  } ${isDistrictAdmin ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <span className="font-bold text-xs text-slate-900 block">State Standard Override</span>
                  <span className="text-[11px] text-slate-500">Overrides Pan-India standard for an entire state.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRuleForm(prev => ({ ...prev, scope: 'DISTRICT' }))}
                  className={`p-3 text-left rounded-xl border-2 transition-all ${
                    ruleForm.scope === 'DISTRICT'
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs text-slate-900 block">District Override</span>
                  <span className="text-[11px] text-slate-500">Overrides State and Pan-India for a specific district.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRuleForm(prev => ({ ...prev, scope: 'PARTICULAR' }))}
                  className={`p-3 text-left rounded-xl border-2 transition-all ${
                    ruleForm.scope === 'PARTICULAR'
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs text-slate-900 block">Particular Library Override</span>
                  <span className="text-[11px] text-slate-500">Highest priority custom deal for a specific partner library.</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TARGETING */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-900">Step 2: Geographic or Entity Targeting</h4>

              {ruleForm.scope !== 'PAN_INDIA' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">State</label>
                    <select
                      value={ruleForm.state}
                      onChange={e => setRuleForm(prev => ({ ...prev, state: e.target.value }))}
                      disabled={isDistrictAdmin}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                    >
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Maharashtra">Maharashtra</option>
                    </select>
                  </div>

                  {(ruleForm.scope === 'DISTRICT' || ruleForm.scope === 'PARTICULAR') && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">District</label>
                      <select
                        value={ruleForm.district}
                        onChange={e => setRuleForm(prev => ({ ...prev, district: e.target.value }))}
                        disabled={isDistrictAdmin}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                      >
                        <option value="Ghazipur">Ghazipur</option>
                        <option value="Varanasi">Varanasi</option>
                        <option value="Patna">Patna</option>
                        <option value="Lucknow">Lucknow</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {ruleForm.scope === 'PARTICULAR' && (
                <div className="space-y-2">
                  <Input
                    label="Specific Library Name"
                    placeholder="e.g. FocusPoint Premier Study Library - Saidpur"
                    value={ruleForm.libraryName}
                    onChange={e => setRuleForm(prev => ({ ...prev, libraryName: e.target.value }))}
                  />
                  <Input
                    label="Specific Library ID (Optional)"
                    placeholder="e.g. lib-focus-saidpur"
                    value={ruleForm.libraryId}
                    onChange={e => setRuleForm(prev => ({ ...prev, libraryId: e.target.value }))}
                  />
                </div>
              )}

              <Input
                label="Descriptive Rule Policy Name"
                value={ruleForm.name}
                onChange={e => setRuleForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Ghazipur Self-Study Standard Policy"
              />
            </div>
          )}

          {/* STEP 3: BASE MONTHLY FEE */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-900">Step 3: Fee Model & Monthly Rate</h4>
              <p className="text-xs text-slate-500">Enter ₹0 for complimentary free listing or a positive monthly amount. Other billing cycles (Quarterly, Yearly) scale automatically.</p>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Monthly Listing Subscription Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={ruleForm.price}
                  onChange={e => setRuleForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full text-lg font-black bg-slate-50 border border-slate-300 rounded-lg p-3"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1 text-xs">
                <span className="font-bold text-slate-800 block">Scaled Rates for Library Owners:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-700">
                  <div>Monthly: <strong>₹{ruleForm.price}</strong></div>
                  <div>Quarterly (15% off): <strong>₹{Math.round(ruleForm.price * 3 * 0.85)}</strong></div>
                  <div>Half-Yearly (20% off): <strong>₹{Math.round(ruleForm.price * 6 * 0.80)}</strong></div>
                  <div>Yearly (25% off): <strong>₹{Math.round(ruleForm.price * 12 * 0.75)}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SCHEDULE */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-900">Step 4: Validity Schedule</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Effective From Date"
                  type="date"
                  value={ruleForm.effectiveFrom}
                  onChange={e => setRuleForm(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                />
                <Input
                  label="Effective Until Date (Optional)"
                  type="date"
                  value={ruleForm.effectiveUntil}
                  onChange={e => setRuleForm(prev => ({ ...prev, effectiveUntil: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* STEP 5: GRACE PERIOD */}
          {wizardStep === 5 && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-900">Step 5: Grace Period Configuration</h4>
              <p className="text-xs text-slate-500">Define how many days the library listing remains discoverable after subscription expiry before being archived.</p>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Grace Period Duration (Days)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={ruleForm.gracePeriodDays}
                  onChange={e => setRuleForm(prev => ({ ...prev, gracePeriodDays: Number(e.target.value) }))}
                  className="w-full text-base font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>
            </div>
          )}

          {/* STEP 6: 24-HOUR CANCELLATION & REFUND POLICY */}
          {wizardStep === 6 && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-900">Step 6: 24-Hour Refund Policy</h4>
              <p className="text-xs text-slate-500">Configure what refund calculation applies when an owner cancels within the guaranteed 24-hour activation window.</p>

              <div className="space-y-2">
                {[
                  { id: 'FULL_24H', title: 'Option A: 100% Full Refund', desc: 'Full refund of the entire subscription amount paid.' },
                  { id: 'FULL_MINUS_GATEWAY_FEE', title: 'Option B: Full Minus Gateway Processing Charge', desc: 'Full refund minus 2% payment gateway surcharge (min ₹25).' },
                  { id: 'PARTIAL_50', title: 'Option C: 50% Partial Refund', desc: '50% refund credited, 50% retained for listing processing costs.' },
                  { id: 'NO_REFUND', title: 'Option D: No Refund', desc: 'Immediate listing cancellation without any monetary refund.' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRuleForm(prev => ({ ...prev, refundPolicy: opt.id as any }))}
                    className={`w-full p-3 text-left rounded-xl border-2 transition-all ${
                      ruleForm.refundPolicy === opt.id
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">{opt.title}</span>
                    <span className="text-[11px] text-slate-500">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: PRICE PROTECTION */}
          {wizardStep === 7 && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-900">Step 7: Renewal Price Protection Policy</h4>
              <p className="text-xs text-slate-500">Define whether existing library subscribers keep this rate upon renewal if general platform prices increase.</p>

              <div className="space-y-2">
                {[
                  { id: 'NONE', title: 'No Price Protection', desc: 'Renewal will automatically resolve the latest active district or pan-India price.' },
                  { id: 'LOCKED', title: 'Grandfathered Price Lock', desc: 'Subscriber retains this original price for up to 3 subsequent renewal cycles.' },
                  { id: 'PROMOTIONAL', title: 'Promotional Introductory Rate', desc: 'Applies strictly to first purchase; renewal reverts to standard platform tier.' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRuleForm(prev => ({ ...prev, priceProtection: opt.id as any }))}
                    className={`w-full p-3 text-left rounded-xl border-2 transition-all ${
                      ruleForm.priceProtection === opt.id
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">{opt.title}</span>
                    <span className="text-[11px] text-slate-500">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 8: CONFIRMATION */}
          {wizardStep === 8 && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-900">Step 8: Final Review & Impact Assessment</h4>
              
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Scope:</span>
                  <span className="font-bold text-slate-900">{ruleForm.scope}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Target:</span>
                  <span className="font-bold text-slate-900">
                    {ruleForm.scope === 'PAN_INDIA' ? 'Pan-India' : ruleForm.scope === 'STATE' ? ruleForm.state : `${ruleForm.district}, ${ruleForm.state}`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Monthly Base Fee:</span>
                  <span className="font-black text-slate-950">₹{ruleForm.price}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Refund Policy:</span>
                  <span className="font-bold text-slate-900">{ruleForm.refundPolicy}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Price Protection:</span>
                  <span className="font-bold text-slate-900">{ruleForm.priceProtection}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={wizardStep === 1}
              onClick={() => setWizardStep(prev => prev - 1)}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
            </Button>

            {wizardStep < 8 ? (
              <Button
                type="button"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                onClick={() => setWizardStep(prev => prev + 1)}
              >
                Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                isLoading={wizardSubmitting}
                onClick={handleSaveRule}
              >
                Confirm & Deploy Rule
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* INVOICE / RECEIPT VIEWER MODAL */}
      {viewInvoiceRecord && (
        <Modal
          isOpen={Boolean(viewInvoiceRecord)}
          onClose={() => setViewInvoiceRecord(null)}
          title={`ZYZU'S Official Tax Invoice — ${viewInvoiceRecord.invoiceNumber}`}
          size="lg"
        >
          <div className="p-4 space-y-6 text-slate-900">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="font-black text-lg tracking-tight text-brand-700">ZYZU'S</span>
                <p className="text-xs text-brand-600 font-bold tracking-wide">Tutors & Libraries</p>
                <p className="text-[11px] text-slate-500">Pan-India Educational Infrastructure Network</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                  {viewInvoiceRecord.paymentStatus}
                </span>
                <div className="text-xs font-mono font-bold mt-1">{viewInvoiceRecord.invoiceNumber}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block">Billed To:</span>
                <strong className="text-slate-900 block">{viewInvoiceRecord.libraryName}</strong>
                <span>Owner: {viewInvoiceRecord.ownerName}</span>
                <div className="text-slate-500">{viewInvoiceRecord.district}, {viewInvoiceRecord.state}</div>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-semibold block">Billing Date:</span>
                <span>{new Date(viewInvoiceRecord.createdAt).toLocaleDateString()}</span>
                <div className="text-slate-500">Method: {viewInvoiceRecord.paymentMethod}</div>
              </div>
            </div>

            <table className="w-full text-xs text-left border-t border-b border-slate-200">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-2">Description</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">
                    <strong>{viewInvoiceRecord.planName}</strong>
                    <div className="text-slate-500">Listing subscription fee ({viewInvoiceRecord.billingCycle})</div>
                  </td>
                  <td className="p-2 text-right font-mono font-bold">₹{viewInvoiceRecord.originalFee}</td>
                </tr>
                {viewInvoiceRecord.offerDiscount > 0 && (
                  <tr>
                    <td className="p-2 text-emerald-700">Promotional Offer Discount</td>
                    <td className="p-2 text-right font-mono text-emerald-700">-₹{viewInvoiceRecord.offerDiscount}</td>
                  </tr>
                )}
                {viewInvoiceRecord.couponDiscount > 0 && (
                  <tr>
                    <td className="p-2 text-purple-700">Coupon Discount ({viewInvoiceRecord.couponCode})</td>
                    <td className="p-2 text-right font-mono text-purple-700">-₹{viewInvoiceRecord.couponDiscount}</td>
                  </tr>
                )}
                <tr className="font-bold border-t border-slate-200">
                  <td className="p-2 text-slate-900">Total Net Paid:</td>
                  <td className="p-2 text-right text-base text-slate-950 font-black">₹{viewInvoiceRecord.finalAmount}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end gap-3 pt-2">
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                Print / Download PDF
              </Button>
              <Button size="sm" onClick={() => setViewInvoiceRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
