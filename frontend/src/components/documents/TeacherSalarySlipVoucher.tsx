import React, { useRef } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Printer,
  Download,
  Share2,
  QrCode,
  Calendar,
  Building2,
  CreditCard,
  Award,
  BookOpen,
  UserCheck,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  IndianRupee,
  FileText
} from 'lucide-react';
import { UnifiedFocusPointDocument } from '../../types/document';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { documentExportUtils } from '../../utils/documentExportUtils';

interface TeacherSalarySlipVoucherProps {
  document: UnifiedFocusPointDocument;
  onPrint?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const TeacherSalarySlipVoucher: React.FC<TeacherSalarySlipVoucherProps> = ({
  document: doc,
  onPrint,
  onClose,
  isModal = true
}) => {
  const { showToast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  const handleCopyHash = () => {
    const text = doc.qrVerificationHash || `SHA256-${doc.documentNumber}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Cryptographic verification hash copied!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    if (onPrint) onPrint();
    else window.print();
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      showToast('Rendering official high-res salary slip...', 'info');
      await documentExportUtils.downloadAsImage(doc, false);
      showToast(`Downloaded official salary slip ${doc.documentNumber}!`, 'success');
    } catch (e) {
      console.error('Download error:', e);
      showToast('Opening print dialog for PDF export...', 'info');
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  // Safe resolved values
  const grossCollection = 16000;
  const teacherShare = 13600;
  const incentiveBonus = 1000;
  const netSalary = doc.amount || 14600;
  const sessionsCompleted = doc.metadata?.completedSessions || doc.metadata?.sessionsCount || 28;
  const assignedStudents = doc.metadata?.assignedStudentsCount || doc.metadata?.studentsCount || 4;
  const attendanceRate = doc.metadata?.attendanceRate || doc.metadata?.attendancePercentage || '100%';
  const billingPeriod = doc.billingPeriod || 'September 2026';
  const issueDateFormatted = new Date(doc.issueDate || '2026-09-15').toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Action Header in Modal or View Mode */}
      {isModal && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 mb-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>ZYZU'S Official Teacher Monthly Salary Slip</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  VERIFIED DISBURSEMENT
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Official electronic compensation slip generated on sovereign ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 text-xs font-semibold"
              icon={<Printer className="w-3.5 h-3.5 mr-1" />}
            >
              Print / Save PDF
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30"
              icon={<Download className="w-3.5 h-3.5 mr-1" />}
            >
              {downloading ? 'Rendering...' : 'Download Image'}
            </Button>
          </div>
        </div>
      )}

      {/* Official A4 Voucher Sheet */}
      <div
        ref={printRef}
        id="salary-slip-printable-area"
        className="relative bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none overflow-hidden"
      >
        {/* Security Watermark Background */}
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.035] rotate-[-25deg] text-slate-950 font-black text-6xl tracking-widest leading-none">
          ZYZU'S DISBURSEMENT OFFICIAL
        </div>

        {/* Top Sovereign Crest & Corporate Identification Header */}
        <div className="pb-6 border-b-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* ZYZU'S Official Brand Crest */}
            <img
              src="/assets/branding/zyzus-logo-128.png"
              alt="ZYZU'S"
              className="w-14 h-14 rounded-2xl object-contain shadow-lg border border-blue-400/30 shrink-0"
            />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-deep-navy-950">
                  ZYZU<span className="text-vibrant-orange-600">'S</span>
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                  GOVT. REG. EDTECH
                </span>
              </div>
              <h1 className="text-xs font-black tracking-wide uppercase text-slate-800 mt-0.5">
                ZYZU'S EdTech Private Limited <span className="text-[10px] text-slate-500 font-normal">(formerly FocusPoint EdTech Private Limited)</span>
              </h1>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Tutors & Libraries</p>
              <p className="text-[10px] text-slate-600 font-medium max-w-md leading-relaxed mt-0.5">
                Central Sovereign Knowledge & Academic Settlement Desk • Ghazipur Education Complex, Uttar Pradesh — 233001
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono text-slate-500 pt-0.5">
                <span>CIN: <strong>U80904UP2026PTC184920</strong></span>
                <span>•</span>
                <span>GSTIN: <strong>09AAACF2026P1Z4</strong></span>
                <span>•</span>
                <span>PAN: <strong>AAACF2026P</strong></span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Direct Bank Settlement</span>
            </span>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Salary Voucher No.</p>
            <p className="text-base font-mono font-black text-royal-blue-900 tracking-tight">
              {doc.documentNumber}
            </p>
            <p className="text-[11px] font-medium text-slate-600">
              Disbursed Date: <strong className="text-slate-900">{issueDateFormatted}</strong>
            </p>
          </div>
        </div>

        {/* Voucher Title Banner */}
        <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-royal-blue-950 via-deep-navy-900 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md print:bg-slate-100 print:text-black print:border print:border-slate-300">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 print:text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Official Disbursement Voucher & Earnings Statement</span>
            </span>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white print:text-black">
              ZYZU'S Official Teacher Monthly Salary Slip
            </h2>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Tutors & Libraries</p>
            <p className="text-xs text-royal-blue-200 print:text-slate-700 font-medium">
              Pay Period: <strong className="text-white print:text-black">{billingPeriod}</strong> • Academic Cycle 2026-27
            </p>
          </div>

          <div className="sm:text-right bg-white/10 print:bg-white px-4 py-2 rounded-xl border border-white/20 print:border-slate-300 shrink-0">
            <span className="text-[10px] uppercase font-bold text-emerald-300 print:text-emerald-800 tracking-wider block">
              Net Amount Credited
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400 print:text-emerald-950">
              {formatCurrency(netSalary)}
            </span>
          </div>
        </div>

        {/* 2-Column Educator Identity & Direct Bank Payout Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5 text-xs">
          {/* Educator Information Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="font-mono text-[10px] font-black uppercase text-royal-blue-900 tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-royal-blue-700" />
                <span>Verified Educator Details</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                ACTIVE FACULTY
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Educator Name:</span>
                <span className="font-extrabold text-slate-900 text-sm">{doc.recipientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">ZYZU'S Teacher ID:</span>
                <span className="font-mono font-bold text-royal-blue-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {doc.recipientId === 'usr-teacher-rajesh' ? 'FP-TCH-000014' : doc.recipientId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Professional Designation:</span>
                <span className="font-bold text-slate-800">{doc.recipientRole || 'Verified Senior Home Educator'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Academic Department:</span>
                <span className="font-semibold text-slate-800">K-12 & Competitive Foundation</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Registered Mobile:</span>
                <span className="font-mono font-semibold text-slate-800">{doc.recipientPhone || '+91 98765 43211'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Assigned Territory:</span>
                <span className="font-semibold text-slate-800">{doc.locality || 'Saidpur'}, {doc.district}, {doc.state}</span>
              </div>
            </div>
          </div>

          {/* Electronic Bank Transfer & Telemetry Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="font-mono text-[10px] font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                <span>Bank Disbursement Telemetry</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                NEFT SETTLED
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Payment Mode:</span>
                <span className="font-bold text-slate-900">{doc.paymentMethod || 'NEFT Direct Bank Transfer'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Credited Bank Account:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {doc.bankAccountMasked || 'XXXX XXXX 3381 (SBI)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Bank IFSC Code:</span>
                <span className="font-mono font-semibold text-slate-800">SBIN0001234 (Saidpur Branch)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Bank Transaction UTR:</span>
                <span className="font-mono font-bold text-emerald-800">{doc.transactionRef || 'SBI-NEFT-99120481'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Payment Ledger Ref:</span>
                <span className="font-mono text-slate-700">{doc.paymentId || 'PAY-SAL-2026-09-01'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Status & Authorization:</span>
                <span className="font-bold text-emerald-800">CREDITED (0 Dues Outstanding)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Teaching Metrics & Performance Indicator Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3 rounded-xl bg-royal-blue-50/70 border border-royal-blue-200 text-center">
            <span className="text-[10px] uppercase font-bold text-royal-blue-700 tracking-wider block">Assigned Learners</span>
            <span className="text-lg font-black font-mono text-royal-blue-950 mt-0.5 block">{assignedStudents} Students</span>
            <span className="text-[9px] text-royal-blue-600 font-medium">Active In-Home Batches</span>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-center">
            <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider block">Completed Sessions</span>
            <span className="text-lg font-black font-mono text-indigo-950 mt-0.5 block">{sessionsCompleted} Classes</span>
            <span className="text-[9px] text-indigo-600 font-medium">1.5 hrs / class logged</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">Attendance Rate</span>
            <span className="text-lg font-black font-mono text-emerald-950 mt-0.5 block">{attendanceRate}</span>
            <span className="text-[9px] text-emerald-600 font-medium">Zero Uninformed Leaves</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block">Pedagogy Rating</span>
            <span className="text-lg font-black font-mono text-amber-950 mt-0.5 block">4.95 / 5.0</span>
            <span className="text-[9px] text-amber-600 font-medium">Parent Verified Satisfaction</span>
          </div>
        </div>

        {/* Itemized Compensation Ledger Table (Earnings vs Deductions) */}
        <div className="my-5 rounded-2xl border-2 border-slate-300 overflow-hidden shadow-xs">
          <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold print:bg-slate-200 print:text-black">
            <span className="uppercase tracking-wider font-mono text-[10px]">
              Detailed Compensation & Honorarium Ledger
            </span>
            <span className="text-[10px] font-mono text-slate-300 print:text-black">
              All Figures in Indian National Rupees (INR)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs">
            {/* Left Column: Earnings Breakdown */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                  A. Gross Earnings & Allowances
                </span>
                <span className="font-mono text-[10px] text-slate-500 uppercase">Amount (₹)</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-medium">Gross Tuition Collections (4 Students @ ₹4,000/mo avg)</span>
                  <span className="font-mono font-semibold text-slate-900">₹{grossCollection.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-slate-800">
                  <span className="font-semibold text-royal-blue-900">Educator Contractual Revenue Share (85%)</span>
                  <span className="font-mono font-bold text-slate-900">₹{teacherShare.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-800">
                  <span className="font-medium flex items-center gap-1">
                    <span>Performance & 100% Punctuality Incentive</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">BONUS</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-800">+₹{incentiveBonus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Curriculum Completion & Milestone Allowance</span>
                  <span className="font-mono text-slate-500">₹0.00</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-black text-slate-900 bg-slate-50 p-2 rounded-lg">
                <span>Total Gross Earnings (A):</span>
                <span className="font-mono text-sm text-slate-900">₹{netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Right Column: Deductions & Retentions */}
            <div className="p-4 space-y-3 bg-slate-50/40">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                  B. Deductions & Recoveries
                </span>
                <span className="font-mono text-[10px] text-slate-500 uppercase">Amount (₹)</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium flex items-center gap-1">
                    <span>Platform Coordination & Infrastructure Fee</span>
                    <span className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-bold">SUBSIDIZED</span>
                  </span>
                  <span className="font-mono text-slate-500">₹0.00</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Tax Deducted at Source (TDS u/s 194J)</span>
                  <span className="font-mono text-slate-500">₹0.00</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Professional Tax (P-Tax)</span>
                  <span className="font-mono text-slate-500">₹0.00</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Security Deposit / Advance Adjustment</span>
                  <span className="font-mono text-slate-500">₹0.00</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-black text-slate-900 bg-slate-100 p-2 rounded-lg">
                <span>Total Deductions (B):</span>
                <span className="font-mono text-sm text-slate-700">₹0.00</span>
              </div>
            </div>
          </div>

          {/* Net Salary Summary Ribbon */}
          <div className="bg-emerald-50 border-t-2 border-emerald-400 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block">
                Net Disbursed Take-Home Remuneration (A - B)
              </span>
              <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                Amount in Words: <strong className="text-slate-950 font-black">Fourteen Thousand Six Hundred Rupees Only</strong>
              </p>
              <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                ✓ Full settlement disbursed to {doc.bankAccountMasked || 'State Bank of India (SBI) A/c XXXX 3381'} on 15 September 2026
              </p>
            </div>

            <div className="text-left sm:text-right bg-white px-5 py-2.5 rounded-xl border border-emerald-300 shadow-xs shrink-0">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Net Monthly Salary</span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-800">
                ₹{netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Verification, Signatures & Legal Authority Section */}
        <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Official Verification QR & Security Hash */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 bg-white p-1 rounded-xl border-2 border-slate-800 shadow-xs shrink-0 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-slate-950" />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-royal-blue-50 text-royal-blue-900 px-2 py-0.5 rounded border border-royal-blue-200">
                  <ShieldCheck className="w-3 h-3 text-royal-blue-700" />
                  <span>SHA-256 SEALED</span>
                </span>
                <p className="text-[10px] font-bold text-slate-800">
                  Public Ledger Audit QR
                </p>
                <p className="text-[9px] text-slate-500 leading-tight">
                  Scan using any phone camera to verify authenticity directly on ZYZU'S sovereign verification server.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <span className="font-mono text-[9px] text-slate-500 truncate max-w-[220px]">
                {doc.qrVerificationHash || 'SHA256-SAL-2026-09-000145'}
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="p-1 text-slate-500 hover:text-slate-800 transition-colors"
                title="Copy hash"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Central Security Guarantee Statement */}
          <div className="space-y-1.5 text-center md:text-left text-[10px] text-slate-600 leading-relaxed border-t md:border-t-0 md:border-l md:border-r border-slate-200 px-0 md:px-4 py-2 md:py-0">
            <p className="font-bold text-slate-800 uppercase tracking-wide">
              Official ZYZU'S Statement
            </p>
            <p>
              This document serves as conclusive legal evidence of professional remuneration disbursed to the educator. Generated through autonomous financial ledger reconciliation in accordance with the IT Act, 2000.
            </p>
            <p className="font-mono text-[9px] text-slate-400">
              Disbursed under Uttar Pradesh Jurisdiction • No Physical Signature Required (Sec 65B IEA)
            </p>
          </div>

          {/* Authorized Signatories & Official Seal */}
          <div className="space-y-3 text-right">
            <div className="flex items-center justify-end gap-3">
              {/* FocusPoint Red/Gold Digital Comptroller Seal */}
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-royal-blue-700 bg-royal-blue-50/50 p-1 flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[7px] font-black text-royal-blue-900 tracking-tighter uppercase">ZYZU'S</span>
                <span className="text-[6px] font-mono text-amber-700 font-bold">★ SEAL ★</span>
                <span className="text-[7px] font-bold text-royal-blue-900 uppercase">ACCOUNTS</span>
              </div>

              <div>
                <div className="font-serif italic text-base font-bold text-royal-blue-950 tracking-wider">
                  Alok Tripathi
                </div>
                <p className="text-xs font-black text-slate-900">Prof. Alok Tripathi</p>
                <p className="text-[10px] font-medium text-slate-600">Comptroller & Super Admin Authority</p>
                <p className="text-[9px] font-mono text-slate-500">ZYZU'S Central Clearinghouse</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Micro Print Bar */}
        <div className="mt-6 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-[9px] font-mono text-slate-400">
          <span>ZYZU'S Sovereign Financial Core v2.4.9</span>
          <span>Verification URL: https://zyzus.com/verify/doc/{doc.documentNumber}</span>
          <span>Printed / Rendered: {new Date().toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};
