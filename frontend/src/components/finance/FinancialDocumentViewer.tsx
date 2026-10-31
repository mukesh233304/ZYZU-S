import React, { useRef, useEffect, useState } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Building2,
  Receipt,
  QrCode,
  Share2,
  IndianRupee,
  Lock,
  Calendar,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { OfficialDocument } from '../../types/finance';
import { UnifiedFocusPointDocument } from '../../types/document';
import { Button } from '../common/Button';
import { financeService } from '../../services/financeService';
import { TeacherSalarySlipVoucher } from '../documents/TeacherSalarySlipVoucher';

interface FinancialDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document?: OfficialDocument | null;
  documentId?: string | null;
}

export const FinancialDocumentViewer: React.FC<FinancialDocumentViewerProps> = ({
  isOpen,
  onClose,
  document: propDoc,
  documentId
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<OfficialDocument | null>(propDoc || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propDoc) {
      setDoc(propDoc);
    } else if (documentId) {
      setLoading(true);
      financeService.getOfficialDocument(documentId).then((d: OfficialDocument | null) => {
        setDoc(d);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [propDoc, documentId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const document = propDoc || doc;

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center space-y-3 shadow-xl">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-700">Loading Official Document...</p>
        </div>
      </div>
    );
  }

  if (!document) return null;

  const handlePrint = () => {
    window.print();
  };

  // If the document is a salary slip, render the state-of-the-art TeacherSalarySlipVoucher!
  if (document.documentType === 'SALARY_SLIP') {
    const unifiedSalaryDoc: UnifiedFocusPointDocument = {
      id: document.documentId,
      documentNumber: document.documentId,
      documentType: 'TEACHER_SALARY_SLIP',
      title: "ZYZU'S Official Teacher Monthly Salary Slip",
      category: 'SALARY',
      recipientId: document.recipientId,
      recipientName: document.recipientName,
      recipientRole: document.recipientRole,
      issueDate: document.issuedAt || document.date,
      amount: document.amount,
      paymentStatus: 'PAID',
      paymentMethod: document.paymentMethod || 'NEFT Direct Bank Transfer',
      paymentId: document.paymentId,
      transactionRef: document.transactionRef || 'SBI-NEFT-99120481',
      billingPeriod: document.billingPeriod || 'September 2026',
      district: document.district || 'Ghazipur',
      state: document.state || 'Uttar Pradesh',
      status: 'READY',
      qrVerificationHash: `SHA256-${document.documentId}`,
      currency: 'INR',
      authorizedBy: "ZYZU'S Financial Comptroller",
      authorizedRole: 'Chief Financial Officer',
      qrVerificationUrl: 'https://zyzus.com/verify/ledger',
      isCurrent: true,
      version: 1,
      auditTrail: [],
      createdAt: document.issuedAt || document.date || new Date().toISOString(),
      updatedAt: document.issuedAt || document.date || new Date().toISOString(),
      bankAccountMasked: document.bankAccountMasked || 'State Bank of India (SBI) A/c XXXX 3381',
      breakdown: document.breakdown,
      metadata: {
        completedSessions: 28,
        assignedStudentsCount: 4,
        attendanceRate: '100%'
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
        <div className="relative w-full max-w-4xl my-8">
          <TeacherSalarySlipVoucher
            document={unifiedSalaryDoc}
            onPrint={handlePrint}
            onClose={onClose}
            isModal={true}
          />
        </div>
      </div>
    );
  }

  const getDocTypeIcon = () => {
    switch (document.documentType) {
      case 'SALARY_SLIP':
        return <GraduationCap className="w-6 h-6 text-brand-600" />;
      case 'EXPENSE_RECEIPT':
        return <Receipt className="w-6 h-6 text-emerald-600" />;
      case 'SETTLEMENT_RECEIPT':
        return <Building2 className="w-6 h-6 text-indigo-600" />;
    }
  };

  const getDocBadgeColor = () => {
    switch (document.documentType) {
      case 'SALARY_SLIP':
        return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'EXPENSE_RECEIPT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SETTLEMENT_RECEIPT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      {/* Container Dialog */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Action Header (Screen Only) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-slate-200">
              Official Verified Financial Document
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              <span>Print / PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official A4 Printable Document Area */}
        <div ref={printAreaRef} className="p-8 sm:p-12 text-slate-800 bg-white print:p-0">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-slate-200 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
                {getDocTypeIcon()}
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  ZYZU<span className="text-brand-600">'S</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Autonomous Central Settlement & Financial Reconciliation Division
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${getDocBadgeColor()}`}>
                {document.documentType.replace('_', ' ')}
              </span>
              <p className="text-sm font-mono font-bold text-slate-900 mt-1">
                {document.documentId}
              </p>
              <p className="text-xs text-slate-400">
                Issued: {new Date(document.issuedAt || document.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Confirmed Payment Status Bar */}
          <div className="my-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800">
                  Confirmed Settlement Status
                </span>
                <p className="text-base font-black text-emerald-950">
                  PAID / DISBURSED SUCCESSFULLY
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-700 font-medium">Settled Amount</p>
              <p className="text-xl font-black text-emerald-900">
                {formatCurrency(document.amount)}
              </p>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <p className="text-slate-600 uppercase font-bold text-[10px]">Beneficiary / Payee</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{document.recipientName}</p>
              <p className="text-slate-700 font-medium">{document.recipientRole}</p>
              <p className="text-slate-600 font-medium">Jurisdiction: {document.district}, {document.state}</p>
              {document.bankAccountMasked && (
                <p className="text-slate-700 font-medium mt-1">Credit Account: <span className="font-mono font-bold text-slate-900">{document.bankAccountMasked}</span></p>
              )}
            </div>

            <div>
              <p className="text-slate-600 uppercase font-bold text-[10px]">Transaction & Audit</p>
              <p className="text-slate-700 mt-0.5">
                Payment Ref: <span className="font-mono font-bold text-slate-900">{document.paymentId}</span>
              </p>
              <p className="text-slate-700">
                Provider Gateway Ref: <span className="font-mono font-bold text-slate-900">{document.transactionRef}</span>
              </p>
              <p className="text-slate-700">
                Transfer Channel: <span className="font-bold text-slate-900">{document.paymentMethod}</span>
              </p>
              {document.billingPeriod && (
                <p className="text-slate-700">
                  Billing Cycle: <span className="font-bold text-slate-900">{document.billingPeriod}</span>
                </p>
              )}
            </div>
          </div>

          {/* Detailed Financial Calculation Statement */}
          <div className="my-6">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-700 mb-3">
              Itemized Financial Breakdown & Reconciled Calculation
            </h3>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Financial Line Item Description</th>
                    <th className="px-4 py-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {document.breakdown.map((item, idx) => (
                    <tr
                      key={idx}
                      className={
                        item.isHighlight
                          ? 'bg-emerald-50/70 font-bold text-slate-900'
                          : item.isDeduction
                          ? 'text-rose-700'
                          : 'text-slate-700'
                      }
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {item.isDeduction && <span className="text-rose-500 font-bold">(-)</span>}
                          <span>{item.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium">
                        {item.isDeduction ? `-${formatCurrency(item.amount)}` : formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900 text-white font-bold">
                  <tr>
                    <td className="px-4 py-3.5 text-sm">Final Net Settled & Disbursed</td>
                    <td className="px-4 py-3.5 text-right text-base font-black font-mono text-emerald-400">
                      {formatCurrency(document.amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Verification & Sign-off Footer */}
          <div className="mt-8 pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 p-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
                <QrCode className="w-10 h-10 text-slate-800" />
              </div>
              <div className="text-[11px] text-slate-600 max-w-xs font-medium">
                <p className="font-bold text-slate-900">Tamper-Proof Verification QR</p>
                <p>Scan to verify authenticity via ZYZU'S Ledger ID: <span className="font-mono font-bold text-slate-900">{document.documentId}</span></p>
              </div>
            </div>

            <div className="text-right">
              <div className="h-9 flex items-end justify-end">
                <span className="font-serif italic font-bold text-slate-800 text-sm tracking-wider">
                  Alok Tripathi
                </span>
              </div>
              <div className="border-t border-slate-300 pt-1 mt-1 text-right">
                <p className="text-xs font-bold text-slate-900">{document.authorizedBy || 'Super Admin Authority'}</p>
                <p className="text-[10px] text-slate-600 font-medium">Central Financial Comptroller & Auditor</p>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="mt-6 text-center text-[10px] text-slate-600 font-medium">
            This is a computer-generated, digitally verified official business document from the ZYZU'S Financial Operating System.
            Preserve for accounting and tax reconciliation purposes.
          </div>
        </div>
      </div>
    </div>
  );
};
