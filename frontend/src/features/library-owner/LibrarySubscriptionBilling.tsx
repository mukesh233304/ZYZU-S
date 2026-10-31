import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { libraryService } from '../../services/libraryService';
import { librarySubscriptionService } from '../../services/librarySubscriptionService';
import { 
  Library, 
  LibrarySubscription, 
  LibrarySubscriptionPlan, 
  LibrarySubscriptionPaymentRecord 
} from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  CreditCard,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Receipt,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  QrCode
} from 'lucide-react';

export const LibrarySubscriptionBilling: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [library, setLibrary] = useState<Library | null>(null);
  const [subscription, setSubscription] = useState<LibrarySubscription | null>(null);
  const [plans, setPlans] = useState<LibrarySubscriptionPlan[]>([]);
  const [payments, setPayments] = useState<LibrarySubscriptionPaymentRecord[]>([]);

  // 24-Hour Timer countdown state
  const [timeLeftString, setTimeLeftString] = useState<string | null>(null);
  const [isWithin24Hours, setIsWithin24Hours] = useState<boolean>(false);

  // Modals
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelCategory, setCancelCategory] = useState('Changed business plan');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewPlanId, setRenewPlanId] = useState('lsp-monthly');
  const [renewSubmitting, setRenewSubmitting] = useState(false);
  const [renewPaymentMethod, setRenewPaymentMethod] = useState<'UPI_QR' | 'ONLINE_GATEWAY'>('UPI_QR');

  const [viewInvoice, setViewInvoice] = useState<LibrarySubscriptionPaymentRecord | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const libs = await libraryService.getLibrariesByOwner(user.id);
      if (libs.length > 0) {
        const activeLib = libs[0];
        setLibrary(activeLib);

        const [sub, allPlans, allPays] = await Promise.all([
          librarySubscriptionService.getSubscriptionByLibraryId(activeLib.id),
          librarySubscriptionService.getAvailablePlans(),
          librarySubscriptionService.getPayments(activeLib.districtName || activeLib.district)
        ]);

        setSubscription(sub || null);
        setPlans(allPlans);
        if (sub) {
          setPayments(allPays.filter(p => p.subscriptionId === sub.id || p.libraryId === activeLib.id));
        }
      }
    } catch (err: any) {
      console.error('Failed to load subscription details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Real-time 24-Hour Cancellation Countdown
  useEffect(() => {
    if (!subscription || !subscription.cancellationDeadline || subscription.status === 'CANCELLED') {
      setIsWithin24Hours(false);
      setTimeLeftString(null);
      return;
    }

    const updateTimer = () => {
      const deadline = new Date(subscription.cancellationDeadline).getTime();
      const now = Date.now();
      const diff = deadline - now;

      if (diff > 0) {
        setIsWithin24Hours(true);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftString(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setIsWithin24Hours(false);
        setTimeLeftString(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [subscription]);

  // Handle Cancellation
  const handleConfirmCancel = async () => {
    if (!subscription) return;
    setCancelSubmitting(true);
    try {
      const res = await librarySubscriptionService.requestCancellation(
        subscription.id,
        cancelReason || cancelCategory,
        cancelCategory
      );

      if (!res.success) {
        showToast(res.error || 'Cancellation failed', 'error');
        return;
      }

      showToast(`Subscription cancelled successfully. Refund of ₹${res.refundAmount} processed.`, 'success');
      setIsCancelModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to cancel subscription', 'error');
    } finally {
      setCancelSubmitting(false);
    }
  };

  // Handle Renewal
  const handleConfirmRenew = async () => {
    if (!subscription) return;
    setRenewSubmitting(true);
    try {
      const updated = await librarySubscriptionService.renewSubscription(
        subscription.id,
        renewPlanId,
        {
          paymentMethod: renewPaymentMethod,
          paymentId: `PAY-REN-${Date.now()}`
        }
      );
      showToast(`Subscription renewed successfully until ${updated.expiryDate}!`, 'success');
      setIsRenewModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to renew subscription', 'error');
    } finally {
      setRenewSubmitting(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    if (!subscription) return;
    try {
      await librarySubscriptionService.toggleAutoRenew(subscription.id, !subscription.autoRenew);
      showToast(`Auto-renewal ${!subscription.autoRenew ? 'enabled' : 'disabled'}.`, 'success');
      fetchData();
    } catch (err: any) {
      showToast('Failed to toggle auto-renew', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
        <p className="text-xs font-semibold">Loading Subscription & Billing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Partner Listing Subscription
              </span>
              {subscription && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  subscription.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : subscription.status === 'GRACE_PERIOD'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/30 animate-pulse'
                    : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                }`}>
                  {subscription.status}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {library?.name || 'Library'} Subscription & Billing
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Manage your active listing tier, billing cycle, automated renewal, 24-hour cancellation, and official ZYZU'S tax invoices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              onClick={() => setIsRenewModalOpen(true)}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Renew / Change Plan
            </Button>
          </div>
        </div>
      </Card>

      {/* Grace Period Warning Alert */}
      {subscription && subscription.status === 'GRACE_PERIOD' && (
        <Card className="p-4 bg-amber-500/10 border-amber-500/30 border text-amber-900 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div className="text-xs">
              <strong className="block font-bold">Your listing subscription is currently in the 7-day Grace Period!</strong>
              <span>Students can still discover your library, but listing visibility will expire soon. Please renew your plan now.</span>
            </div>
          </div>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0" onClick={() => setIsRenewModalOpen(true)}>
            Renew Listing Now
          </Button>
        </Card>
      )}

      {/* Main Grid: Plan Status + 24-Hour Cancellation Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Subscription Details */}
        <Card className="lg:col-span-2 p-6 bg-white border-slate-200 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase font-bold">Current Active Plan</span>
                <h3 className="text-lg font-black text-slate-900">{subscription?.planName || 'Standard Monthly Plan'}</h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-slate-950">
                {subscription?.isFree ? 'FREE' : `₹${subscription?.finalPaidAmount}`}
              </span>
              <span className="text-xs text-slate-500 block">/ {subscription?.billingCycle || 'MONTHLY'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1 font-semibold">Start Date</span>
              <strong className="text-slate-900 font-mono text-sm">{subscription?.startDate || '—'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1 font-semibold">Renewal / Expiry</span>
              <strong className="text-slate-900 font-mono text-sm">{subscription?.expiryDate || '—'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1 font-semibold">Listing Status</span>
              <span className="text-emerald-700 font-black text-xs block">Visible & Active</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1 font-semibold">Price Lock</span>
              <strong className="text-slate-900 text-xs block">{subscription?.priceProtection || 'Standard'}</strong>
            </div>
          </div>

          {/* Auto-Renewal Setting */}
          <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">Automated Subscription Renewal</span>
              <span className="text-[11px] text-slate-500">
                When enabled, the listing plan automatically re-authorizes on the renewal date to avoid grace period disruptions.
              </span>
            </div>
            <button
              onClick={handleToggleAutoRenew}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                subscription?.autoRenew
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {subscription?.autoRenew ? 'AUTO-RENEW ON' : 'AUTO-RENEW OFF'}
            </button>
          </div>
        </Card>

        {/* Right 1 Col: 24-Hour Cancellation Box */}
        <Card className="p-6 bg-white border-slate-200 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900">24-Hour Cancellation</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ZYZU'S offers a strict 24-hour cancellation window from the exact timestamp of activation. Eligible cancellations receive refunds calculated according to the active policy.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <span className="text-slate-500 block font-semibold">Cancellation Window:</span>
              {isWithin24Hours ? (
                <div>
                  <span className="text-base font-black text-emerald-600 font-mono block">
                    {timeLeftString}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Remaining until deadline</span>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-bold text-slate-500 block">
                    {subscription?.status === 'CANCELLED' ? 'Subscription is cancelled' : 'Cancellation window expired'}
                  </span>
                  <span className="text-[10px] text-slate-400">Past 24 hours from activation</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              disabled={!isWithin24Hours || subscription?.status === 'CANCELLED'}
              onClick={() => setIsCancelModalOpen(true)}
              className="w-full text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              {isWithin24Hours ? 'Cancel Subscription' : 'Cancellation Unavailable'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Payment History & Invoices Table */}
      <Card className="p-6 bg-white border-slate-200 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900">Payment History & Tax Invoices</h3>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No payments recorded yet for this library.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-black tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Invoice Number</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Billing Cycle</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Net Paid</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-900">
                      {p.invoiceNumber}
                    </td>
                    <td className="p-3">{p.planName}</td>
                    <td className="p-3">{p.billingCycle}</td>
                    <td className="p-3 font-mono text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-mono font-black text-slate-950">
                      ₹{p.finalAmount}
                    </td>
                    <td className="p-3 font-semibold">{p.paymentMethod}</td>
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
                        onClick={() => setViewInvoice(p)}
                      >
                        <FileText className="w-3 h-3 mr-1" /> View Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL: 24-HOUR CANCELLATION */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Confirm 24-Hour Subscription Cancellation"
        size="md"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-900 font-bold">24-Hour Guarantee Active:</strong>
              <span>
                You are requesting cancellation within the permitted window ({timeLeftString} remaining).
                Your listing will be archived, and refund will be credited back to your original payment method.
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-900 block">Reason Category *</label>
            <select
              value={cancelCategory}
              onChange={e => setCancelCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="Changed business plan">Changed business plan</option>
              <option value="Price too high">Price too high</option>
              <option value="Not ready to list">Not ready to list</option>
              <option value="Technical issue">Technical issue</option>
              <option value="Duplicate listing">Duplicate listing</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-900 block">Additional Explanation (Optional)</label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Tell us what we could improve..."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <strong className="font-mono text-slate-900">₹{subscription?.finalPaidAmount}</strong>
            </div>
            <div className="flex justify-between font-bold text-emerald-700 border-t border-slate-200 pt-1">
              <span>Expected Refund:</span>
              <span className="font-mono">₹{subscription?.finalPaidAmount}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button size="sm" variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Keep Subscription
            </Button>
            <Button
              size="sm"
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
              isLoading={cancelSubmitting}
              onClick={handleConfirmCancel}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: RENEW / CHANGE PLAN */}
      <Modal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        title="Renew or Upgrade Listing Plan"
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">Select a subscription plan to extend your library listing on ZYZU'S:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plans.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setRenewPlanId(p.id)}
                className={`p-3 text-left rounded-xl border-2 transition-all ${
                  renewPlanId === p.id
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">{p.name}</span>
                  {p.savingsPercent && p.savingsPercent > 0 ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Save {p.savingsPercent}%
                    </span>
                  ) : null}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-slate-950">₹{p.basePrice}</span>
                  <span className="text-[11px] text-slate-500 font-medium">/ {p.billingCycle}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-900 block">Payment Method</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRenewPaymentMethod('UPI_QR')}
                className={`p-3 rounded-xl border-2 text-left flex items-center gap-2 ${
                  renewPaymentMethod === 'UPI_QR' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200'
                }`}
              >
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-xs text-slate-900">Instant UPI QR</span>
              </button>
              <button
                type="button"
                onClick={() => setRenewPaymentMethod('ONLINE_GATEWAY')}
                className={`p-3 rounded-xl border-2 text-left flex items-center gap-2 ${
                  renewPaymentMethod === 'ONLINE_GATEWAY' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-xs text-slate-900">Card / NetBanking</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setIsRenewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              isLoading={renewSubmitting}
              onClick={handleConfirmRenew}
            >
              Confirm & Authorize Renewal
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: INVOICE VIEWER */}
      {viewInvoice && (
        <Modal
          isOpen={Boolean(viewInvoice)}
          onClose={() => setViewInvoice(null)}
          title={`ZYZU'S Tax Invoice — ${viewInvoice.invoiceNumber}`}
          size="lg"
        >
          <div className="p-4 space-y-6 text-slate-900 text-xs">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="font-black text-lg tracking-tight text-brand-700">ZYZU'S</span>
                <p className="text-[11px] text-slate-500">Official Educational Space Partner Invoice</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                  PAID
                </span>
                <div className="text-xs font-mono font-bold mt-1">{viewInvoice.invoiceNumber}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 block">Billed Entity:</span>
                <strong className="text-slate-900 text-sm block">{viewInvoice.libraryName}</strong>
                <span>Owner: {viewInvoice.ownerName}</span>
                <div className="text-slate-500">{viewInvoice.district}, {viewInvoice.state}</div>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Invoice Date:</span>
                <span>{new Date(viewInvoice.createdAt).toLocaleDateString()}</span>
                <div className="text-slate-500">Method: {viewInvoice.paymentMethod}</div>
              </div>
            </div>

            <table className="w-full border-t border-b border-slate-200">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold">
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">
                    <strong>{viewInvoice.planName}</strong>
                    <div className="text-slate-500">Library Listing Subscription ({viewInvoice.billingCycle})</div>
                  </td>
                  <td className="p-2 text-right font-mono font-bold">₹{viewInvoice.originalFee}</td>
                </tr>
                {viewInvoice.offerDiscount > 0 && (
                  <tr>
                    <td className="p-2 text-emerald-700">Promotional Offer Discount</td>
                    <td className="p-2 text-right font-mono text-emerald-700">-₹{viewInvoice.offerDiscount}</td>
                  </tr>
                )}
                {viewInvoice.couponDiscount > 0 && (
                  <tr>
                    <td className="p-2 text-purple-700">Coupon Discount ({viewInvoice.couponCode})</td>
                    <td className="p-2 text-right font-mono text-purple-700">-₹{viewInvoice.couponDiscount}</td>
                  </tr>
                )}
                <tr className="font-bold border-t border-slate-200 text-sm">
                  <td className="p-2">Total Net Paid:</td>
                  <td className="p-2 text-right text-slate-950 font-black">₹{viewInvoice.finalAmount}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end gap-3 pt-2">
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                Print / Download PDF
              </Button>
              <Button size="sm" onClick={() => setViewInvoice(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
