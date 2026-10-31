import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Lock,
  Info
} from 'lucide-react';
import { Button } from '../common/Button';
import { financeService } from '../../services/financeService';
import { payrollService } from '../../services/payrollService';
import { settlementService } from '../../services/settlementService';
import { expenditureService } from '../../services/expenditureService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { OfficialDocument } from '../../types/finance';

export interface PaymentTargetDetails {
  id: string;
  targetType: 'QUEUE_ITEM' | 'PAYROLL' | 'SETTLEMENT' | 'CLAIM';
  payeeName: string;
  payeeType: 'TEACHER' | 'LIBRARY_OWNER' | 'DISTRICT_ADMIN' | string;
  district: string;
  amount: number;
  description: string;
  referenceCode?: string;
  bankDetails?: {
    accountHolderName?: string;
    bankName?: string;
    accountNumberMasked?: string;
    ifscCode?: string;
    upiId?: string;
    verified?: boolean;
  };
}

interface ExecutePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: PaymentTargetDetails | null;
  onSuccess: (result: { officialDocument?: OfficialDocument; item?: any; success: boolean }) => void;
}

export const ExecutePaymentModal: React.FC<ExecutePaymentModalProps> = ({
  isOpen,
  onClose,
  target,
  onSuccess
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<'NEFT_RTGS' | 'IMPS' | 'UPI' | 'BANK_TRANSFER'>('NEFT_RTGS');
  const [transactionRef, setTransactionRef] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Generate realistic UTR on target change
  const generateNewUtr = (method = paymentMethod) => {
    const prefix = method === 'NEFT_RTGS' ? 'UTR-NEFT' : method === 'IMPS' ? 'UTR-IMPS' : method === 'UPI' ? 'UPI-REF' : 'CORP-TXN';
    const rand = Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(2, 10);
    return `${prefix}-${dateStr}-${rand}`;
  };

  useEffect(() => {
    if (isOpen && target) {
      setTransactionRef(generateNewUtr(paymentMethod));
      setSimulateFailure(false);
    }
  }, [isOpen, target]);

  if (!isOpen || !target) return null;

  const handleExecutePayment = async () => {
    setSubmitting(true);
    try {
      let res: { success: boolean; item?: any; officialDocument?: OfficialDocument; error?: string };

      if (target.targetType === 'QUEUE_ITEM') {
        res = await financeService.processPayment(
          target.id,
          paymentMethod,
          simulateFailure,
          transactionRef
        );
      } else if (target.targetType === 'PAYROLL') {
        res = await payrollService.payPayrollItem(
          target.id,
          paymentMethod,
          transactionRef
        );
      } else if (target.targetType === 'SETTLEMENT') {
        res = await settlementService.paySettlement(
          target.id,
          paymentMethod,
          transactionRef
        );
      } else if (target.targetType === 'CLAIM') {
        res = await expenditureService.approveAndPayClaim({
          claimId: target.id,
          adminId: user?.id || 'usr-superadmin',
          adminName: user?.name || 'Prof. Alok Tripathi (Super Admin)',
          paymentMethod,
          transactionRef
        });
      } else {
        throw new Error('Unknown payment target type');
      }

      if (res.success) {
        addToast(`Payment of ₹${target.amount.toLocaleString('en-IN')} disbursed successfully!`, 'success');
        onSuccess(res);
        onClose();
      } else {
        addToast(`Payment Failed: ${res.error || 'Gateway Timeout'}`, 'error');
      }
    } catch (e: any) {
      addToast(e?.message || 'Error processing payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getPayeeTypeBadge = (type: string) => {
    switch (type) {
      case 'TEACHER':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Teacher Payroll</span>;
      case 'LIBRARY_OWNER':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">Library Settlement</span>;
      case 'DISTRICT_ADMIN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">District Expenditure</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{type}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Authorize & Disburse Payment
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ZYZU'S Corporate Banking & Direct Escrow Clearance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Payee and Amount Highlight Card */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-200">{target.payeeName}</span>
                {getPayeeTypeBadge(target.payeeType)}
              </div>
              <p className="text-xs text-slate-400 mt-1">{target.description}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                <span>District: <strong className="text-slate-200">{target.district}</strong></span>
                {target.referenceCode && (
                  <>
                    <span>•</span>
                    <span>Ref: <strong className="text-slate-200 font-mono">{target.referenceCode}</strong></span>
                  </>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Net Payable</span>
              <p className="text-2xl font-black text-emerald-400">
                ₹{target.amount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Beneficiary Bank Account */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Verified Beneficiary Account
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                NPCI Bank Verified
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mt-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Bank Name</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {target.bankDetails?.bankName || 'State Bank of India'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Masked Account</span>
                <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {target.bankDetails?.accountNumberMasked || 'XXXX XXXX 4587'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">IFSC Code</span>
                <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {target.bankDetails?.ifscCode || 'SBIN0001244'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Payment Settlement Channel
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'NEFT_RTGS', label: 'NEFT / RTGS Clearance', desc: 'Real-time RBI National Clearing' },
                { id: 'IMPS', label: 'IMPS Instant 24x7', desc: 'Immediate beneficiary credit' },
                { id: 'UPI', label: 'UPI Auto-Disburse', desc: 'NPCI VPA instant settlement' },
                { id: 'BANK_TRANSFER', label: 'Corporate Direct Transfer', desc: 'Direct corporate escrow transfer' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(m.id as any);
                    setTransactionRef(generateNewUtr(m.id as any));
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-900 dark:text-brand-300 font-bold shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold">{m.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction / UTR Reference */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Bank UTR / Transaction Reference
              </label>
              <button
                type="button"
                onClick={() => setTransactionRef(generateNewUtr())}
                className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Auto-Generate UTR
              </button>
            </div>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. UTR-NEFT-2026-981244"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              This UTR reference will be permanently embedded in the generated official financial document and audit trail.
            </p>
          </div>

          {/* Sandbox Failure Simulation Toggle */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Simulate NPCI Gateway Timeout
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Test failure handling, audit log recording, and retry mechanism.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
            />
          </div>

          {/* Security & Audit Notice */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Authorized by Super Admin credentials. Immediate payout will debit ZYZU'S escrow account and notify the recipient in real-time.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="text-xs font-bold"
          >
            Cancel
          </Button>

          <Button
            onClick={handleExecutePayment}
            loading={submitting}
            className="text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 px-5"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            {simulateFailure ? 'Execute (Simulate Failure)' : `Confirm & Disburse ₹${target.amount.toLocaleString('en-IN')}`}
          </Button>
        </div>
      </div>
    </div>
  );
};
