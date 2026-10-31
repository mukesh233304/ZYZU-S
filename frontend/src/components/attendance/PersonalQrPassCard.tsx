import React, { useState, useEffect } from 'react';
import { 
  QrCode, Download, Printer, RefreshCw, ShieldCheck, 
  AlertTriangle, CheckCircle2, Building, BookOpen, 
  ExternalLink, Sparkles, Clock, Calendar, ChevronRight,
  Info, CreditCard, Eye, Share2, AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PersonalQrPass, StudentActiveAttendanceService } from '../../types';
import { qrPassService } from '../../services/qrPassService';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

interface PersonalQrPassCardProps {
  studentId: string;
  className?: string;
  compact?: boolean;
  onViewHistory?: () => void;
  showActions?: boolean;
}

export const PersonalQrPassCard: React.FC<PersonalQrPassCardProps> = ({
  studentId,
  className = '',
  compact = false,
  onViewHistory,
  showActions = true,
}) => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [pass, setPass] = useState<PersonalQrPass | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [isFullQrOpen, setIsFullQrOpen] = useState(false);
  const [isReissueConfirmOpen, setIsReissueConfirmOpen] = useState(false);
  const [reissueReason, setReissueReason] = useState('Lost or damaged physical pass');
  const [reissuing, setReissuing] = useState(false);

  const loadPass = async () => {
    if (!studentId) return;
    try {
      const data = await qrPassService.getPersonalQrPass(studentId);
      setPass(data);
    } catch (err) {
      console.error('Failed to load personal QR pass', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPass();
  }, [studentId]);

  const handleDownloadPng = async () => {
    if (!pass) return;
    setDownloading(true);
    try {
      const dataUrl = await qrPassService.generatePassCardPng(pass);
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `FocusPoint_Pass_${pass.studentName.replace(/\s+/g, '_')}_${pass.qrId}.png`;
        link.href = dataUrl;
        link.click();
        addToast('High-resolution QR Attendance Pass downloaded!', 'success');
      }
    } catch {
      addToast('Failed to download pass. Please try printing directly.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!pass) return;
    qrPassService.printPassCard(pass);
  };

  const handleReissue = async () => {
    if (!pass) return;
    setReissuing(true);
    try {
      const newPass = await qrPassService.regenerateQrPass(studentId, reissueReason);
      setPass(newPass);
      setIsReissueConfirmOpen(false);
      addToast('Personal QR Attendance Pass reissued successfully!', 'success');
    } catch {
      addToast('Failed to reissue QR pass. Please contact support.', 'error');
    } finally {
      setReissuing(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm animate-pulse space-y-4 ${className}`}>
        <div className="h-6 w-48 bg-slate-200 rounded-md" />
        <div className="h-44 bg-slate-100 rounded-2xl" />
        <div className="h-10 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (!pass) return null;

  const hasTuition = pass.activeServices.some(s => s.serviceType === 'HOME_TUITION');
  const hasLibrary = pass.activeServices.some(s => s.serviceType === 'LIBRARY');
  const hasActiveService = pass.activeServices.length > 0;

  return (
    <div className={`relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl overflow-hidden ${className}`}>
      {/* Decorative Brand Accent Stripe */}
      <div className="h-2 w-full bg-gradient-to-r from-brand-500 via-amber-500 to-indigo-500" />

      {/* Top Bar / Header */}
      <div className="p-6 md:p-7 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <img
              src="/assets/branding/zyzus-logo-64.png"
              alt="ZYZU'S"
              className="w-11 h-11 rounded-2xl object-contain shadow-lg shadow-blue-500/20 border border-blue-400/30 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-black tracking-tight text-white">
                  MY ATTENDANCE PASS
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  {pass.serviceType === 'UNIVERSAL' ? 'Universal Pass' : pass.serviceType === 'HOME_TUITION' ? 'Tuition Pass' : 'Library Pass'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Official ZYZU'S QR Attendance & Physical Access Credential
              </p>
            </div>
          </div>

          {/* Real Status Badge */}
          <div className="flex items-center gap-2">
            {pass.attendanceAllowed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Pass
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="w-3.5 h-3.5" />
                Attendance Restricted
              </span>
            )}
          </div>
        </div>

        {/* Warning if fee is unpaid / suspended */}
        {!pass.attendanceAllowed && pass.pendingInvoice && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-300">
                  Attendance Temporarily Restricted
                </p>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  Fee for {pass.activeMonth} is pending (₹{pass.pendingInvoice.amount.toLocaleString()}). Complete payment to instantly unlock QR attendance.
                </p>
              </div>
            </div>
            <Link
              to="/student/fees"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm shrink-0"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Pay Now (₹{pass.pendingInvoice.amount.toLocaleString()})
            </Link>
          </div>
        )}

        {/* Main Content Grid: Identity & Services on Left, QR Card on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
          {/* Left Column: Student Details & Active Service Cards */}
          <div className="lg:col-span-7 space-y-4">
            {/* Student Profile Ribbon */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <img
                src={pass.studentPhoto}
                alt={pass.studentName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-500/50 shadow-md"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-black text-white truncate">
                  {pass.studentName}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <span className="font-mono text-slate-300 font-bold">ID: {pass.studentId}</span>
                  <span>•</span>
                  <span>{pass.district}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3 text-brand-400" />
                  <span>Period: {pass.validFrom} to {pass.validUntil} ({pass.activeMonth})</span>
                </div>
              </div>
            </div>

            {/* Service Status Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Home Tuition Card */}
              <div className={`p-4 rounded-2xl border transition-all ${
                hasTuition 
                  ? 'bg-slate-800/40 border-slate-700/80 hover:border-brand-500/40' 
                  : 'bg-slate-900/40 border-slate-800/60 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <BookOpen className="w-4 h-4 text-brand-400" />
                    <span>Home Tuition</span>
                  </div>
                  {hasTuition ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500">Inactive</span>
                  )}
                </div>
                {hasTuition ? (
                  <div>
                    {pass.activeServices
                      .filter(s => s.serviceType === 'HOME_TUITION')
                      .map(s => (
                        <div key={s.id} className="space-y-0.5">
                          <p className="text-sm font-bold text-white truncate">{s.teacherName || 'Allotted Educator'}</p>
                          <p className="text-xs text-slate-400 truncate">{s.subject || 'All Core Subjects'}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No active home tutor booked</p>
                )}
              </div>

              {/* Digital Library Card */}
              <div className={`p-4 rounded-2xl border transition-all ${
                hasLibrary 
                  ? 'bg-slate-800/40 border-slate-700/80 hover:border-indigo-500/40' 
                  : 'bg-slate-900/40 border-slate-800/60 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Building className="w-4 h-4 text-indigo-400" />
                    <span>Digital Library</span>
                  </div>
                  {hasLibrary ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500">Inactive</span>
                  )}
                </div>
                {hasLibrary ? (
                  <div>
                    {pass.activeServices
                      .filter(s => s.serviceType === 'LIBRARY')
                      .map(s => (
                        <div key={s.id} className="space-y-0.5">
                          <p className="text-sm font-bold text-white truncate">{s.libraryName || 'FocusPoint Library'}</p>
                          <p className="text-xs text-slate-400 truncate">{s.shiftName} • {s.seatNumber}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No active study desk booked</p>
                )}
              </div>
            </div>

            {/* Instruction Notice */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-800/30 border border-slate-800 text-xs text-slate-400">
              <Info className="w-4 h-4 text-brand-400 shrink-0" />
              <span>
                Carry this printed pass or digital card. Scan to access the <strong>Check-In / Check-Out Attendance Center</strong>.
              </span>
            </div>
          </div>

          {/* Right Column: Physical Card Graphic with Procedural QR Code */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[280px] p-5 rounded-3xl bg-white text-slate-900 border-4 border-slate-200 shadow-2xl relative group">
              {/* Card Header inside White Surface */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <img
                    src="/assets/branding/zyzus-logo-64.png"
                    alt="ZYZU'S"
                    className="w-6 h-6 rounded-md object-contain shadow-xs border border-blue-400/30 shrink-0"
                  />
                  <span className="font-black text-xs tracking-wider text-slate-900 uppercase">ZYZU'S Pass</span>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {pass.status}
                </span>
              </div>

              {/* Procedural High-Contrast QR Code */}
              <div 
                onClick={() => setIsFullQrOpen(true)}
                className="my-4 p-3 bg-slate-50 rounded-2xl border-2 border-slate-300/80 cursor-pointer hover:border-brand-500 transition-all flex flex-col items-center justify-center shadow-inner relative"
                title="Click to view full QR code"
              >
                <svg width="180" height="180" viewBox="0 0 180 180" className="w-full h-auto max-w-[170px]">
                  {/* White background */}
                  <rect width="180" height="180" fill="#ffffff" />
                  {/* Top-Left Corner Finder */}
                  <rect x="10" y="10" width="50" height="50" fill="#0f172a" />
                  <rect x="18" y="18" width="34" height="34" fill="#ffffff" />
                  <rect x="26" y="26" width="18" height="18" fill="#0f172a" />

                  {/* Top-Right Corner Finder */}
                  <rect x="120" y="10" width="50" height="50" fill="#0f172a" />
                  <rect x="128" y="18" width="34" height="34" fill="#ffffff" />
                  <rect x="136" y="26" width="18" height="18" fill="#0f172a" />

                  {/* Bottom-Left Corner Finder */}
                  <rect x="10" y="120" width="50" height="50" fill="#0f172a" />
                  <rect x="18" y="128" width="34" height="34" fill="#ffffff" />
                  <rect x="26" y="136" width="18" height="18" fill="#0f172a" />

                  {/* Timing & Data Matrix */}
                  <rect x="70" y="15" width="8" height="8" fill="#0f172a" />
                  <rect x="85" y="15" width="8" height="8" fill="#0f172a" />
                  <rect x="100" y="15" width="8" height="8" fill="#0f172a" />
                  <rect x="15" y="70" width="8" height="8" fill="#0f172a" />
                  <rect x="15" y="85" width="8" height="8" fill="#0f172a" />
                  <rect x="15" y="100" width="8" height="8" fill="#0f172a" />
                  <rect x="70" y="70" width="40" height="40" fill="#0f172a" />
                  <rect x="80" y="80" width="20" height="20" fill="#ffffff" />
                  <rect x="70" y="120" width="10" height="10" fill="#0f172a" />
                  <rect x="90" y="130" width="12" height="12" fill="#0f172a" />
                  <rect x="120" y="70" width="12" height="12" fill="#0f172a" />
                  <rect x="140" y="85" width="14" height="14" fill="#0f172a" />
                  <rect x="130" y="120" width="12" height="12" fill="#0f172a" />
                  <rect x="150" y="140" width="15" height="15" fill="#0f172a" />
                  <rect x="120" y="150" width="10" height="10" fill="#0f172a" />
                  <rect x="40" y="75" width="10" height="10" fill="#0f172a" />
                  <rect x="40" y="95" width="10" height="10" fill="#0f172a" />
                </svg>

                <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                  <span className="px-3 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-md flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Enlarge QR
                  </span>
                </div>
              </div>

              {/* QR Card Footer */}
              <div className="text-center space-y-1">
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                  Scan this QR to Check In / Out
                </p>
                <p className="text-[10px] font-mono text-slate-500">
                  {pass.qrId} • v{pass.version}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        {showActions && (
          <div className="mt-7 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleDownloadPng}
                disabled={downloading}
                leftIcon={<Download className="w-4 h-4" />}
              >
                {downloading ? 'Preparing PNG...' : 'Download Pass (PNG)'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                leftIcon={<Printer className="w-4 h-4" />}
                className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                Print Pass
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullQrOpen(true)}
                leftIcon={<QrCode className="w-4 h-4" />}
                className="text-slate-300 hover:text-white hover:bg-slate-800/80"
              >
                View Full QR
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsReissueConfirmOpen(true)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reissue / Report Damaged</span>
              </button>

              {onViewHistory && (
                <button
                  type="button"
                  onClick={onViewHistory}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-800"
                >
                  <span>Attendance History</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Full-Screen / Enlarged QR Inspection Modal */}
      {isFullQrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900">Personal Attendance QR</h3>
                <p className="text-xs text-slate-500">{pass.studentName} • {pass.qrId}</p>
              </div>
              <button
                onClick={() => setIsFullQrOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border-2 border-slate-200">
              <div className="w-64 h-64 bg-white p-4 rounded-xl border border-slate-300 shadow-sm flex items-center justify-center">
                <svg width="220" height="220" viewBox="0 0 180 180" className="w-full h-full">
                  <rect width="180" height="180" fill="#ffffff" />
                  <rect x="10" y="10" width="50" height="50" fill="#0f172a" />
                  <rect x="18" y="18" width="34" height="34" fill="#ffffff" />
                  <rect x="26" y="26" width="18" height="18" fill="#0f172a" />
                  <rect x="120" y="10" width="50" height="50" fill="#0f172a" />
                  <rect x="128" y="18" width="34" height="34" fill="#ffffff" />
                  <rect x="136" y="26" width="18" height="18" fill="#0f172a" />
                  <rect x="10" y="120" width="50" height="50" fill="#0f172a" />
                  <rect x="18" y="128" width="34" height="34" fill="#ffffff" />
                  <rect x="26" y="136" width="18" height="18" fill="#0f172a" />
                  <rect x="70" y="15" width="8" height="8" fill="#0f172a" />
                  <rect x="85" y="15" width="8" height="8" fill="#0f172a" />
                  <rect x="100" y="15" width="8" height="8" fill="#0f172a" />
                  <rect x="15" y="70" width="8" height="8" fill="#0f172a" />
                  <rect x="15" y="85" width="8" height="8" fill="#0f172a" />
                  <rect x="15" y="100" width="8" height="8" fill="#0f172a" />
                  <rect x="70" y="70" width="40" height="40" fill="#0f172a" />
                  <rect x="80" y="80" width="20" height="20" fill="#ffffff" />
                  <rect x="70" y="120" width="10" height="10" fill="#0f172a" />
                  <rect x="90" y="130" width="12" height="12" fill="#0f172a" />
                  <rect x="120" y="70" width="12" height="12" fill="#0f172a" />
                  <rect x="140" y="85" width="14" height="14" fill="#0f172a" />
                  <rect x="130" y="120" width="12" height="12" fill="#0f172a" />
                  <rect x="150" y="140" width="15" height="15" fill="#0f172a" />
                  <rect x="120" y="150" width="10" height="10" fill="#0f172a" />
                  <rect x="40" y="75" width="10" height="10" fill="#0f172a" />
                  <rect x="40" y="95" width="10" height="10" fill="#0f172a" />
                </svg>
              </div>

              <p className="mt-4 text-xs font-bold text-slate-800 text-center">
                Scan this QR using your mobile phone camera to open the Attendance Center.
              </p>
              <p className="mt-1 text-[11px] font-mono text-slate-500 break-all text-center">
                Token: {pass.token}
              </p>
            </div>

            {/* Test Simulation Button */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setIsFullQrOpen(false);
                  navigate(`/attendance/pass?token=${encodeURIComponent(pass.token)}`);
                }}
              >
                Test Scan (Open Attendance Center)
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsFullQrOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Reissue Confirmation Modal */}
      {isReissueConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">Reissue QR Attendance Pass</h3>
                <p className="text-xs text-slate-500">Revokes current token and issues version {pass.version + 1}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              If your printed QR pass is damaged, compromised, or unreadable, reissuing will generate a new secure token. Any previous printed copy will be invalidated.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Reason for Reissue</label>
              <select
                value={reissueReason}
                onChange={e => setReissueReason(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
              >
                <option value="Lost or damaged physical pass">Lost or damaged physical pass</option>
                <option value="QR unreadable / ink smudge">QR unreadable / ink smudge</option>
                <option value="Suspected unauthorized scan / compromised">Suspected unauthorized scan / compromised</option>
                <option value="Updated personal details">Updated personal details</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="danger"
                className="w-full"
                onClick={handleReissue}
                disabled={reissuing}
              >
                {reissuing ? 'Reissuing Pass...' : 'Confirm Reissue'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsReissueConfirmOpen(false)}
                disabled={reissuing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
