import React from 'react';
import {
  FileText,
  Download,
  Printer,
  Share2,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  CreditCard,
  Award,
  Clock,
  Sparkles,
  QrCode
} from 'lucide-react';
import { UnifiedFocusPointDocument } from '../../types/document';
import { Button } from '../common/Button';

interface DocumentCardProps {
  document: UnifiedFocusPointDocument;
  onView: (doc: UnifiedFocusPointDocument) => void;
  onDownload: (doc: UnifiedFocusPointDocument) => void;
  onPrint: (doc: UnifiedFocusPointDocument) => void;
  onShare: (doc: UnifiedFocusPointDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document: doc,
  onView,
  onDownload,
  onPrint,
  onShare
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'IDENTITY':
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      case 'SALARY':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'PAYMENT':
      case 'BOOKING':
      case 'SUBSCRIPTION':
        return <CreditCard className="w-5 h-5 text-indigo-600" />;
      case 'CERTIFICATE':
        return <Award className="w-5 h-5 text-amber-600" />;
      case 'DEMO':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'IDENTITY':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SALARY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PAYMENT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'SUBSCRIPTION':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'BOOKING':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'CERTIFICATE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DEMO':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const isSalary = doc.category === 'SALARY' || doc.documentType === 'TEACHER_SALARY_SLIP';

  return (
    <div className={`group relative bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between overflow-hidden ${
      isSalary
        ? 'border-emerald-300/90 shadow-xs hover:border-emerald-400 hover:shadow-lg'
        : 'border-slate-200/90 hover:border-slate-300 hover:shadow-lg'
    }`}>
      {/* Top Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        isSalary
          ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
          : doc.category === 'IDENTITY'
          ? 'bg-blue-600'
          : doc.category === 'CERTIFICATE'
          ? 'bg-amber-500'
          : 'bg-brand-600'
      }`} />

      {/* Header with Category & Status */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
              isSalary
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black'
                : getCategoryBadgeClass(doc.category)
            }`}>
              {isSalary ? 'OFFICIAL SALARY SLIP' : doc.category}
            </span>
            {doc.paymentStatus === 'PAID' && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                isSalary
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>{isSalary ? 'NEFT SETTLED' : 'PAID'}</span>
              </span>
            )}
            {doc.paymentStatus === 'FREE' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                FREE
              </span>
            )}
            {doc.version > 1 && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                v{doc.version}
              </span>
            )}
          </div>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
            doc.status === 'READY'
              ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
              : doc.status === 'VIEWED'
              ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
              : doc.status === 'DOWNLOADED'
              ? 'bg-indigo-50 text-indigo-800 font-bold border border-indigo-200'
              : doc.status === 'REPLACED'
              ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
              : 'bg-slate-100 text-slate-700'
          }`}>
            {doc.status}
          </span>
        </div>

        {/* Title & Document Number */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isSalary
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:bg-emerald-100'
              : 'bg-slate-100 group-hover:bg-brand-50'
          }`}>
            {getCategoryIcon(doc.category)}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 leading-snug group-hover:text-royal-blue-600 transition-colors">
              {isSalary && doc.title.toLowerCase().includes('salary slip')
                ? "ZYZU'S Official Teacher Monthly Salary Slip"
                : doc.title}
            </h3>
            <p className="text-xs font-mono font-bold text-royal-blue-900 mt-0.5">
              {doc.documentNumber}
            </p>
          </div>
        </div>

        {/* Info Grid with Sharp High-Contrast Labels */}
        <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Issued On:</span>
            <span className="font-bold text-slate-900">
              {new Date(doc.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {doc.amount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">
                {isSalary ? 'Net Take-Home Pay:' : 'Settled Amount:'}
              </span>
              <span className="font-mono font-black text-emerald-800 text-sm">
                {formatCurrency(doc.amount)}
              </span>
            </div>
          )}

          {isSalary && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600 font-medium">Credit Account:</span>
              <span className="font-mono font-semibold text-slate-800">
                {doc.bankAccountMasked || 'SBI A/c XXXX 3381'}
              </span>
            </div>
          )}

          {doc.billingPeriod && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600 font-medium">Billing Period:</span>
              <span className="font-semibold text-slate-800">
                {doc.billingPeriod}
              </span>
            </div>
          )}

          {doc.metadata?.teacherName && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Educator:</span>
              <span className="font-bold text-slate-900 truncate max-w-[140px]">
                {doc.metadata.teacherName}
              </span>
            </div>
          )}

          {doc.metadata?.libraryName && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Study Facility:</span>
              <span className="font-bold text-slate-900 truncate max-w-[140px]">
                {doc.metadata.libraryName}
              </span>
            </div>
          )}

          {doc.validUntil && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Valid Through:</span>
              <span className="font-bold text-slate-800">
                {doc.validUntil}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onView(doc)}
          className={`flex-1 text-xs py-1.5 font-bold shadow-xs cursor-pointer ${
            isSalary ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
          }`}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          <span>{isSalary ? 'View Salary Slip' : 'View'}</span>
        </Button>

        <button
          onClick={() => onDownload(doc)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
          title="Download PDF"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPrint(doc)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
          title="Print Document"
        >
          <Printer className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onShare(doc)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
          title="Share Document"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
