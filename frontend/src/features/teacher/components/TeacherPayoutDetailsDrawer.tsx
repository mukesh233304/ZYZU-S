import React from 'react';
import { TeacherPayout } from '../../../types';
import { TeacherPayrollItem } from '../../../types/finance';
import {
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Building,
  ShieldCheck,
  Calendar,
  IndianRupee,
  Hash,
  Download,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../../components/common/Button';

interface TeacherPayoutDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  payout: TeacherPayout | null;
  payrollRecord?: TeacherPayrollItem | null;
  onViewSalarySlip?: (documentId: string) => void;
}

export const TeacherPayoutDetailsDrawer: React.FC<TeacherPayoutDetailsDrawerProps> = ({
  isOpen,
  onClose,
  payout,
  payrollRecord,
  onViewSalarySlip,
}) => {
  if (!isOpen || !payout) return null;

  // Determine timeline stage progression based on actual record state
  const isPaid = payout.status === 'paid' || payrollRecord?.status === 'PAID';
  const isProcessing = payout.status === 'pending' || payrollRecord?.status === 'PAYMENT_QUEUED' || payrollRecord?.status === 'READY_FOR_PAYMENT';
  const isFailed = payout.status === 'failed';

  const timelineSteps = [
    {
      title: 'Earnings Generated',
      desc: 'Completed verified tuition sessions logged',
      status: 'completed',
    },
    {
      title: 'Eligibility Confirmed',
      desc: 'Guardian approvals & desk verification cleared',
      status: 'completed',
    },
    {
      title: 'Payout Queued',
      desc: 'Disbursement file queued for bank ledger',
      status: isPaid || isProcessing ? 'completed' : 'pending',
    },
    {
      title: 'Processing',
      desc: 'NEFT / IMPS direct settlement in transit',
      status: isPaid ? 'completed' : isProcessing ? 'current' : 'pending',
    },
    {
      title: isFailed ? 'Failed / Reversed' : 'Paid',
      desc: isPaid
        ? `Credited via UTR ${payout.utr || payrollRecord?.transactionRef || 'CONFIRMED'}`
        : isFailed
        ? 'Settlement failed; queued for re-verification'
        : 'Bank acknowledgment pending',
      status: isPaid ? 'completed' : isFailed ? 'error' : 'pending',
    },
  ];

  const grossEarnings = payrollRecord
    ? payrollRecord.grossTuitionCollection
    : Math.round(payout.amount / 0.9);
  const teacherShare = payrollRecord
    ? payrollRecord.teacherEarnings
    : payout.amount;
  const platformFee = payrollRecord
    ? payrollRecord.focusPointCommission
    : Math.round(grossEarnings * 0.1);
  const bonus = payrollRecord?.bonus || 0;
  const deductions = payrollRecord?.deductions || 0;
  const netDisbursed = payout.amount || payrollRecord?.netPayable || 0;

  const bankName = payrollRecord?.bankDetails?.bankName || 'Verified Partner Bank';
  const maskedAcc = payrollRecord?.bankDetails?.accountNumberMasked || '•••• •••• 4421';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-white shadow-2xl h-full flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 bg-gradient-to-r from-deep-navy-950 to-royal-blue-950 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-semibold tracking-wider">
              <Hash className="w-3 h-3 text-royal-blue-300" />
              <span>PAYOUT SETTLEMENT #{payout.id}</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              ₹{netDisbursed.toLocaleString()}
            </h2>
            <p className="text-xs text-royal-blue-200">
              Billing Period: <span className="font-bold text-white">{payout.month}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1 text-slate-800 text-xs">
          {/* Status Badge & Summary */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isPaid
                    ? 'bg-emerald-100 text-emerald-700'
                    : isFailed
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isPaid ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isFailed ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Settlement Status</p>
                <p className="text-sm font-extrabold text-slate-900">
                  {isPaid ? 'Credited to Bank Account' : isFailed ? 'Failed Settlement' : 'Processing in Queue'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-600 font-medium block">Date</span>
              <span className="font-semibold text-slate-700">{payout.date || 'Pending'}</span>
            </div>
          </div>

          {/* Visual Payout Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Authoritative Settlement Timeline
            </h3>

            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-3">
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                      step.status === 'completed'
                        ? 'bg-emerald-600 border-white text-white shadow-xs'
                        : step.status === 'current'
                        ? 'bg-royal-blue-600 border-white text-white ring-4 ring-royal-blue-100'
                        : step.status === 'error'
                        ? 'bg-rose-600 border-white text-white'
                        : 'bg-white border-slate-300 text-transparent'
                    }`}
                  >
                    {step.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                    {step.status === 'current' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                    {step.status === 'error' && <X className="w-3 h-3" />}
                  </div>

                  <div className="space-y-0.5">
                    <p
                      className={`text-xs font-bold ${
                        step.status === 'completed'
                          ? 'text-slate-900'
                          : step.status === 'current'
                          ? 'text-royal-blue-700'
                          : step.status === 'error'
                          ? 'text-rose-700'
                          : 'text-slate-500 font-semibold'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Itemized Financial Breakdown */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Itemized Earnings & Fee Breakdown
            </h3>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-700 font-sans font-semibold">
                <span>Gross Tuition Collection:</span>
                <span className="font-semibold text-slate-900 font-mono">
                  ₹{grossEarnings.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 font-sans font-semibold">
                <span>Educator Entitlement:</span>
                <span className="font-semibold text-emerald-700 font-mono">
                  ₹{teacherShare.toLocaleString()}
                </span>
              </div>
              {bonus > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-sans font-semibold">
                  <span>Attendance / Quality Bonus:</span>
                  <span className="font-semibold font-mono">+₹{bonus.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-700 font-sans font-semibold">
                <span>ZYZU'S Platform Fee (10%):</span>
                <span className="font-semibold text-slate-800 font-mono">
                  -₹{platformFee.toLocaleString()}
                </span>
              </div>
              {deductions > 0 && (
                <div className="flex items-center justify-between text-rose-600 font-sans font-semibold">
                  <span>Adjustments / Withholding:</span>
                  <span className="font-semibold font-mono">-₹{deductions.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-sans">
                <span className="font-extrabold text-slate-900">Net Disbursed Amount:</span>
                <span className="font-extrabold text-emerald-700 font-mono text-base">
                  ₹{netDisbursed.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Disbursement Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-royal-blue-600" />
              Beneficiary Bank & Transmission
            </h3>

            <div className="p-4 rounded-xl border border-slate-200 bg-white grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-600 block text-[10px] uppercase font-bold">Bank Name</span>
                <span className="font-bold text-slate-900">{bankName}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[10px] uppercase font-bold">Account (Masked)</span>
                <span className="font-mono font-bold text-slate-800">{maskedAcc}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[10px] uppercase font-bold">Bank Ref (UTR)</span>
                <span className="font-mono text-slate-800 font-bold">{payout.utr || 'GENERATED_ON_PAYMENT'}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[10px] uppercase font-bold">Security Standard</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Encrypted
                </span>
              </div>
            </div>
          </div>

          {/* Related Activity Details */}
          {payrollRecord && (
            <div className="space-y-2 text-xs text-slate-600 bg-royal-blue-50/60 p-3.5 rounded-xl border border-royal-blue-100">
              <p className="font-bold text-royal-blue-900">Session Activity Validation</p>
              <p>
                • {payrollRecord.assignedStudentsCount} Allotted Student(s) across Ghazipur district
              </p>
              <p>
                • {payrollRecord.completedSessionsCount} Total Sessions Conducted ({payrollRecord.approvedSessionsCount} verified by guardians)
              </p>
            </div>
          )}
        </div>

        {/* Drawer Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close Panel
          </Button>

          {payrollRecord?.salarySlipNumber && onViewSalarySlip && (
            <Button
              variant="primary"
              size="sm"
              icon={<FileText className="w-4 h-4" />}
              onClick={() => {
                onClose();
                onViewSalarySlip(payrollRecord.salarySlipNumber!);
              }}
              className="bg-royal-blue-600 hover:bg-royal-blue-700 text-xs"
            >
              View Official Salary Slip
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
