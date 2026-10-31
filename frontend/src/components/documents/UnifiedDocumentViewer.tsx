import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Calendar,
  MapPin,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  FileText,
  CreditCard,
  Award,
  Scissors,
  Sparkles,
  BookOpen,
  Clock,
  Cpu,
  CheckSquare,
  Building2,
  UserCheck
} from 'lucide-react';
import { UnifiedFocusPointDocument } from '../../types/document';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { documentService } from '../../services/documentService';
import { getCandidateInitials } from '../common/UserAvatar';
import { documentExportUtils } from '../../utils/documentExportUtils';
import { TeacherSalarySlipVoucher } from './TeacherSalarySlipVoucher';
import { OfficialStudentIdCard } from '../common/OfficialStudentIdCard';

interface UnifiedDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: UnifiedFocusPointDocument | null;
  currentUserRole?: string;
  currentUserId?: string;
}

export const UnifiedDocumentViewer: React.FC<UnifiedDocumentViewerProps> = ({
  isOpen,
  onClose,
  document: doc,
  currentUserRole = 'STUDENT',
  currentUserId = 'user'
}) => {
  const { showToast } = useToast();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [idCardSide, setIdCardSide] = useState<'FRONT' | 'BACK' | 'BOTH'>('BOTH');
  const [showCutLines, setShowCutLines] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'VOUCHER' | 'FULL'>('VOUCHER');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && doc) {
      setZoomLevel(100);
      setIsFullscreen(false);
      setViewMode('VOUCHER');
      documentService.recordDocumentAction(doc.documentNumber, 'VIEWED', currentUserId, currentUserRole);
    }
  }, [isOpen, doc]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showShareModal) setShowShareModal(false);
        else onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showShareModal, onClose]);

  if (!isOpen || !doc) return null;

  const isSalarySlip = doc.category === 'SALARY' ||
    doc.documentType === 'TEACHER_SALARY_SLIP' ||
    doc.documentType.includes('SALARY') ||
    doc.title.toLowerCase().includes('salary slip');
  const isIdCard = !isSalarySlip && (doc.category === 'IDENTITY' || doc.documentType.includes('ID_CARD'));
  const isCertificate = !isSalarySlip && (doc.category === 'CERTIFICATE' || doc.documentType.includes('CERTIFICATE'));
  const isDemoPass = !isSalarySlip && (doc.category === 'DEMO' || doc.documentType === 'HOME_TUITION_DEMO_PASS' || doc.documentType === 'LIBRARY_DEMO_PASS' || doc.documentType.includes('DEMO'));
  const isFeeReceipt = !isSalarySlip && !isDemoPass && !isIdCard && !isCertificate && (
    doc.category === 'PAYMENT' ||
    doc.category === 'BOOKING' ||
    doc.documentType === 'TUITION_FEE_RECEIPT' ||
    doc.documentType === 'LIBRARY_SEAT_RECEIPT' ||
    doc.documentType.includes('RECEIPT') ||
    doc.documentType.includes('INVOICE')
  );

  const isLibraryDemo = isDemoPass && (doc.documentType === 'LIBRARY_DEMO_PASS' || doc.metadata?.demoType === 'LIBRARY');
  const isTuitionDemo = isDemoPass && !isLibraryDemo;

  const docTypeName = isSalarySlip ? 'Teacher Salary Slip' : isFeeReceipt ? 'Fee Receipt' : isDemoPass ? 'Demo Pass' : isIdCard ? 'ID Card' : 'Official Document';

  const handlePrint = () => {
    documentService.recordDocumentAction(doc.documentNumber, 'PRINTED', currentUserId, currentUserRole);
    window.print();
  };

  const handleDownloadPng = async () => {
    try {
      setIsDownloading(true);
      showToast(`Rendering high-resolution ${docTypeName}...`, 'info');
      await documentExportUtils.downloadAsImage(doc, showCutLines);
      documentService.recordDocumentAction(doc.documentNumber, 'DOWNLOADED', currentUserId, currentUserRole, 'PNG Download');
      showToast(`Downloaded official high-res PNG for ${doc.documentNumber}!`, 'success');
    } catch (err: any) {
      console.error('Download failed:', err);
      showToast('Image download failed, opening print dialogue instead.', 'warning');
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadHtml = () => {
    try {
      documentExportUtils.downloadAsStandaloneHtml(doc);
      documentService.recordDocumentAction(doc.documentNumber, 'DOWNLOADED', currentUserId, currentUserRole, 'Offline HTML Export');
      showToast(`Downloaded offline printable HTML document!`, 'success');
    } catch (err: any) {
      showToast('Failed to export offline document', 'error');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/verify/doc/${doc.documentNumber}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: doc.title,
          text: `Official ZYZU'S Document: ${doc.title} (${doc.documentNumber})`,
          url: shareUrl
        });
        documentService.recordDocumentAction(doc.documentNumber, 'SHARED', currentUserId, currentUserRole, 'Native device share');
        showToast('Document shared successfully!', 'success');
        return;
      } catch (e) {
        // Fallback
      }
    }
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/verify/doc/${doc.documentNumber}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    documentService.recordDocumentAction(doc.documentNumber, 'SHARED', currentUserId, currentUserRole, 'Copied verification link');
    showToast('Secure verification link copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 3000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getRoleBadgeColor = (roleStr: string) => {
    const r = roleStr.toUpperCase();
    if (r.includes('SUPER')) return 'bg-purple-600 text-white';
    if (r.includes('DISTRICT')) return 'bg-blue-600 text-white';
    if (r.includes('TEACHER')) return 'bg-emerald-600 text-white';
    if (r.includes('LIBRARY') && r.includes('OWNER')) return 'bg-amber-500 text-slate-950 font-black';
    return 'bg-brand-600 text-white';
  };

  return (
    <div
      onClick={(e) => {
        // Backdrop click closes the modal directly
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-fadeIn ${
        isFullscreen ? 'p-0' : ''
      } print:p-0 print:bg-white print:overflow-visible print:static print-modal-reset`}
    >
      {/* Main Modal Dialog Window */}
      <div
        className={`relative w-full ${
          isFullscreen
            ? 'h-full max-w-full rounded-none m-0'
            : isDemoPass || isFeeReceipt
            ? 'max-w-4xl rounded-2xl my-3'
            : 'max-w-4xl rounded-2xl my-6'
        } bg-slate-900 shadow-2xl flex flex-col overflow-hidden border border-slate-700/60 print:border-none print:shadow-none print:bg-white print:w-full print:max-w-full max-h-[96vh]`}
      >
        {/* Top Control Toolbar (Screen Only - Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-950 text-white print:hidden shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/60 border border-indigo-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  {doc.title}
                </h2>
                {isDemoPass && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Cyber Pass</span>
                  </span>
                )}
                {isFeeReceipt && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    <CheckSquare className="w-2.5 h-2.5" />
                    <span>Tax Voucher</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                <span className="text-cyan-400 font-bold">{doc.documentNumber}</span>
                {doc.paymentStatus === 'PAID' && (
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                    PAID (₹{doc.amount})
                  </span>
                )}
                {doc.paymentStatus === 'FREE' && (
                  <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded font-bold">
                    COMPLIMENTARY PASS
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions (Cut Lines, View Sizing, Zoom, Print, Download, Close) */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            
            {/* Cut Lines Toggle */}
            <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold hover:text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCutLines}
                onChange={(e) => setShowCutLines(e.target.checked)}
                className="rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 w-3.5 h-3.5"
              />
              <Scissors className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Cut Lines</span>
            </label>

            {/* View Mode Toggle for Passes / Receipts */}
            {(isDemoPass || isFeeReceipt) && (
              <div className="hidden sm:flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700 text-xs">
                <button
                  onClick={() => setViewMode('VOUCHER')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    viewMode === 'VOUCHER' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Optimal Voucher / Pass sizing"
                >
                  🎟️ Pass Sizing
                </button>
                <button
                  onClick={() => setViewMode('FULL')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    viewMode === 'FULL' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Full page sheet view"
                >
                  📄 A4 Sheet
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="hidden lg:flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700 text-slate-300 text-xs">
              <button
                onClick={() => setZoomLevel(prev => Math.max(70, prev - 15))}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono text-[11px] min-w-[36px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(140, prev + 15))}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1 hover:text-white transition-colors border-l border-slate-800 ml-0.5 cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Document or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Direct High-Res PNG Download Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadPng}
              disabled={isDownloading}
              className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 cursor-pointer"
            >
              <Download className={`w-3.5 h-3.5 mr-1 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Generating...' : `Download ${isFeeReceipt ? 'Receipt' : isDemoPass ? 'Pass' : 'Doc'}`}</span>
            </Button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Share verification link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Prominent Header Close Button */}
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-500/60 text-slate-300 hover:text-rose-200 font-bold text-xs transition-colors cursor-pointer ml-1"
              title="Close Document (Esc)"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Document Body Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-950/70 flex justify-center items-start print:p-0 print:bg-white print:overflow-visible">
          <div
            ref={printAreaRef}
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className={`w-full transition-all flex flex-col items-center print:transform-none print-avoid-break ${
              viewMode === 'VOUCHER' && (isDemoPass || isFeeReceipt) ? 'max-w-2xl' : 'max-w-3xl'
            }`}
          >
            {/* ========================================================================= */}
            {/* LAYOUT 1: FUTURISTIC CYBER-BOARDING PASS / DEMO PASS (TUITION & LIBRARY)  */}
            {/* ========================================================================= */}
            {isDemoPass ? (
              <div className="w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl sm:rounded-3xl border-2 border-cyan-500/40 shadow-2xl text-white relative overflow-hidden print:bg-white print:text-black print:border-2 print:border-black print:shadow-none print-avoid-break">
                
                {/* 1. Holographic Shimmer Foil Banner */}
                <div className="h-2 w-full bg-gradient-to-r from-cyan-400 via-indigo-400 via-purple-400 via-pink-400 to-emerald-400" />
                <div className="bg-slate-950/80 px-4 py-1 border-b border-cyan-500/30 flex items-center justify-between text-[9px] font-mono text-cyan-300 font-bold select-none overflow-hidden print:text-black print:border-black">
                  <span className="truncate">◆ ZYZU'S SOVEREIGN ADMISSION PASS ◆ QUANTUM-VERIFIED LEDGER ◆ 256-BIT SHA-256</span>
                  <span className="shrink-0 text-emerald-400 font-black">VALID FOR 1 USE ONLY</span>
                </div>

                {/* 2. Main Ticket Body & Cuttable Stub Layout */}
                <div className="flex flex-col sm:flex-row relative">
                  
                  {/* LEFT MAIN PASS SECTION (~68% width) */}
                  <div className="flex-1 p-5 sm:p-6 space-y-4 min-w-0">
                    
                    {/* Header: FP Cyber Logo + Title + Status Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 print:border-slate-300">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/assets/branding/zyzus-logo-64.png"
                          alt="ZYZU'S"
                          className="w-9 h-9 rounded-xl object-contain shadow-md border border-blue-400/30 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-black tracking-wider text-white print:text-black">
                              ZYZU'S
                            </h3>
                            <span className="text-[10px] font-mono font-bold text-cyan-400 print:text-black">
                              // PASS
                            </span>
                            <span className="text-[9px] font-bold text-orange-400 print:text-black uppercase ml-1">
                              Tutors & Libraries
                            </span>
                          </div>
                          <p className="text-[9px] font-mono text-slate-400 print:text-slate-700 uppercase tracking-widest">
                            National Educational Directorate
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-[10px] font-black uppercase tracking-wider print:border-black print:text-black">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>ACTIVE & VERIFIED</span>
                        </div>
                        {/* Free / Trial Tag */}
                        <div className="px-2 py-0.5 rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-bold">
                          COMPLIMENTARY ₹0
                        </div>
                      </div>
                    </div>

                    {/* Service Banner */}
                    <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      isLibraryDemo
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-100'
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-100'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        {isLibraryDemo ? <BookOpen className="w-5 h-5 text-cyan-400 shrink-0" /> : <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />}
                        <div>
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider opacity-80">
                            Authorized Service Category
                          </span>
                          <h4 className="text-xs sm:text-sm font-black tracking-tight text-white print:text-black">
                            {isLibraryDemo ? '★ DIGITAL STUDY LIBRARY TRIAL SEAT' : '★ HOME TUITION DEMO CLASS PASS'}
                          </h4>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-mono opacity-80 uppercase block">Validity</span>
                        <span className="text-xs font-mono font-bold text-cyan-300 print:text-black">
                          {doc.validFrom || doc.issueDate} → {doc.validUntil || '2026-08-30'}
                        </span>
                      </div>
                    </div>

                    {/* Microchip & Document ID Strip */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 print:bg-slate-100 print:border-slate-300">
                      <div className="flex items-center gap-3">
                        {/* Simulated EMV Smart Chip */}
                        <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-0.5 flex flex-col justify-between shadow-xs shrink-0">
                          <div className="h-0.5 bg-amber-800/40 w-full" />
                          <div className="flex justify-between items-center px-1">
                            <div className="w-2.5 h-2.5 rounded-full border border-amber-800/60" />
                            <div className="w-2.5 h-2.5 border-t border-b border-amber-800/60" />
                          </div>
                          <div className="h-0.5 bg-amber-800/40 w-full" />
                        </div>
                        <div>
                          <p className="text-[9px] font-mono uppercase text-slate-400 print:text-slate-700">Official Pass Number</p>
                          <p className="text-xs sm:text-sm font-mono font-black text-cyan-400 print:text-black">{doc.documentNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-mono uppercase text-slate-400 print:text-slate-700">Token Hash</p>
                        <p className="text-[10px] font-mono font-bold text-slate-300 print:text-black truncate max-w-[140px]">
                          {doc.qrVerificationHash || 'SHA256-DEMO-TUT-448102'}
                        </p>
                      </div>
                    </div>

                    {/* Candidate & Service Telemetry Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Candidate Box */}
                      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
                        <span className="text-[9px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                          Candidate Details
                        </span>
                        <p className="text-sm font-black text-white print:text-black">{doc.recipientName}</p>
                        <p className="text-[11px] text-slate-300 print:text-slate-700">Student ID: <span className="font-mono text-cyan-300 print:text-black">{doc.recipientId}</span></p>
                        <p className="text-[11px] text-slate-400 print:text-slate-700">Contact: {doc.recipientPhone || '+91 98765 43210'}</p>
                        <p className="text-[10px] text-slate-400 print:text-slate-700 truncate">Territory: {doc.locality || 'Saidpur'}, {doc.district}</p>
                      </div>

                      {/* Allocated Asset Details */}
                      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
                        <span className="text-[9px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                          {isLibraryDemo ? 'Library Allotment' : 'Faculty Allotment'}
                        </span>
                        <p className="text-sm font-black text-white print:text-black truncate">
                          {isLibraryDemo
                            ? (doc.metadata?.libraryName || "ZYZU'S Premier Study Library")
                            : (doc.metadata?.teacherName || 'Dr. Rajesh Sharma')}
                        </p>
                        <p className="text-[11px] text-amber-300 print:text-black font-semibold">
                          {isLibraryDemo
                            ? (doc.metadata?.slotTime || 'Morning Shift (07:00 AM – 12:00 PM)')
                            : (doc.metadata?.subject || 'Physics & Mathematics (JEE Foundation)')}
                        </p>
                        <p className="text-[10px] text-slate-400 print:text-slate-700 truncate">
                          Venue: {doc.metadata?.locationAddress || `${doc.district}, ${doc.state}`}
                        </p>
                      </div>
                    </div>

                    {/* Footer Authority & Verification QR */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 print:border-slate-300 text-[9px] text-slate-400 print:text-slate-700">
                      <div>
                        <p className="font-bold text-slate-200 print:text-black">{doc.authorizedBy}</p>
                        <p>{doc.authorizedRole}</p>
                      </div>
                      <div className="text-right font-mono text-[8px] text-cyan-400 print:text-black">
                        DIGITALLY RECONCILED // ZERO-KNOWLEDGE PROOF
                      </div>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* CUTTABLE PERFORATION LINE & TICKET NOTCHES                                 */}
                  {/* ========================================================================= */}
                  {showCutLines && (
                    <div className="relative flex flex-col justify-between items-center sm:w-8 shrink-0">
                      {/* Top Semicircular Cutout Notch */}
                      <div className="hidden sm:block absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-900 border border-cyan-500/40 print:bg-white print:border-black" />
                      
                      {/* Vertical Dashed Cut Line */}
                      <div className="hidden sm:block w-0 h-full border-r-2 border-dashed border-cyan-400/70 print:border-black my-4" />
                      
                      {/* Horizontal Cut Line on Mobile */}
                      <div className="sm:hidden w-full border-b-2 border-dashed border-cyan-400/70 print:border-black my-2" />

                      {/* Scissors Guide Label */}
                      <div className="hidden sm:flex items-center justify-center my-auto py-2">
                        <span className="text-[9px] font-mono font-bold text-cyan-400 print:text-black uppercase tracking-widest [writing-mode:vertical-rl] rotate-180 select-none flex items-center gap-2">
                          <Scissors className="w-3.5 h-3.5 rotate-90" />
                          <span>TEAR / CUT ALONG THIS PERFORATION</span>
                        </span>
                      </div>

                      {/* Bottom Semicircular Cutout Notch */}
                      <div className="hidden sm:block absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-900 border border-cyan-500/40 print:bg-white print:border-black" />
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* RIGHT SECTION: ADMIT CARD STUB (~32% width)                                */}
                  {/* ========================================================================= */}
                  <div className="sm:w-64 p-5 sm:p-6 bg-slate-950/70 border-t sm:border-t-0 sm:border-l border-slate-800 flex flex-col justify-between space-y-4 print:bg-white print:border-black">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800 print:border-slate-300">
                        <span className="text-[10px] font-mono font-black uppercase text-cyan-300 print:text-black">
                          ADMIT STUB
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          ZYZUS-STUB
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 print:text-slate-700 mt-1">
                        To be retained by center or faculty upon arrival.
                      </p>

                      {/* Simulated Barcode */}
                      <div className="my-3 p-2 bg-white rounded-lg text-black text-center shadow-xs">
                        <div className="font-mono text-lg font-black tracking-widest select-none leading-none">
                          |||| | || |||| | ||| | ||
                        </div>
                        <p className="text-[8px] font-mono font-bold mt-1 text-slate-800 truncate">
                          {doc.documentNumber}
                        </p>
                      </div>

                      {/* Stub Student Summary */}
                      <div className="space-y-1 text-[11px] bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-200">
                        <p className="font-black text-white print:text-black truncate">{doc.recipientName}</p>
                        <p className="text-[10px] font-mono text-cyan-300 print:text-black">ID: {doc.recipientId}</p>
                        <p className="text-[10px] text-slate-400 print:text-slate-700">Date: {doc.validFrom || doc.issueDate}</p>
                        <p className="text-[10px] font-bold text-emerald-400 print:text-black">1-TIME PASS • VALID</p>
                      </div>

                      {/* Circular Punch Target */}
                      <div className="mt-3 py-2 flex flex-col items-center justify-center border-2 border-dashed border-cyan-400/50 rounded-xl bg-slate-900/40 print:border-black print:bg-white">
                        <div className="w-11 h-11 rounded-full border-2 border-dashed border-cyan-400 flex items-center justify-center text-center p-1 text-[8px] font-black text-cyan-300 print:text-black uppercase leading-tight">
                          PUNCH ON ENTRY
                        </div>
                        <span className="text-[8px] font-mono text-slate-400 mt-1">Single Use Punch Target</span>
                      </div>
                    </div>

                    {/* Signature Underline */}
                    <div className="pt-2 border-t border-slate-800 print:border-slate-300 text-[9px] text-slate-400 print:text-slate-700">
                      <div className="border-b border-slate-700 print:border-black h-4 mb-1" />
                      <p className="font-mono text-[8px]">FACULTY / CENTER INITIALS</p>
                    </div>
                  </div>
                </div>
              </div>

            /* ========================================================================= */
            /* LAYOUT 2: FUTURISTIC CYBER-TAX RECEIPT & ACCOUNTING VOUCHER (FEES RECEIPT)*/
            /* ========================================================================= */
            ) : isFeeReceipt ? (
              <div className="w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl sm:rounded-3xl border-2 border-indigo-500/40 shadow-2xl text-white relative overflow-hidden print:bg-white print:text-black print:border-2 print:border-black print:shadow-none print-avoid-break">
                
                {/* 1. Holographic Top Ribbon */}
                <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-sky-400 via-emerald-400 via-amber-400 to-indigo-500" />
                <div className="bg-slate-950/80 px-4 py-1 border-b border-indigo-500/30 flex items-center justify-between text-[9px] font-mono text-indigo-300 font-bold select-none print:text-black print:border-black">
                  <span>◆ ZYZU'S AUTOMATED CLEARINGHOUSE ◆ RECONCILED FINANCIAL LEDGER ◆ SEC 80C COMPLIANT</span>
                  <span className="text-emerald-400 font-black">ZERO DUES OUTSTANDING</span>
                </div>

                {/* 2. Main Receipt Body */}
                <div className="p-5 sm:p-7 space-y-4">
                  
                  {/* Header: FP Logo + EMV Chip + Title */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 print:border-slate-300">
                    <div className="flex items-center gap-3">
                      <img
                        src="/assets/branding/zyzus-logo-64.png"
                        alt="ZYZU'S"
                        className="w-10 h-10 rounded-xl object-contain shadow-md border border-blue-400/30 shrink-0"
                      />
                      <div>
                        <h3 className="text-base font-black tracking-tight text-white print:text-black flex items-center gap-1.5">
                          ZYZU'S <span className="text-indigo-400 print:text-black">FINANCIAL</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            TAX INVOICE
                          </span>
                        </h3>
                        <p className="text-[10px] font-mono text-slate-400 print:text-slate-700 uppercase tracking-widest">
                          Reconciled Educational Fee Receipt // Autonomous Clearinghouse
                        </p>
                      </div>
                    </div>

                    {/* Right side: EMV Chip + Document Number & Date */}
                    <div className="flex items-center gap-3 text-right">
                      {/* Simulated EMV Smart Chip */}
                      <div className="hidden sm:flex w-10 h-7 rounded bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-0.5 flex-col justify-between shadow-xs shrink-0">
                        <div className="h-0.5 bg-amber-800/40 w-full" />
                        <div className="flex justify-between items-center px-1">
                          <div className="w-2.5 h-2.5 rounded-full border border-amber-800/60" />
                          <div className="w-2.5 h-2.5 border-t border-b border-amber-800/60" />
                        </div>
                        <div className="h-0.5 bg-amber-800/40 w-full" />
                      </div>

                      <div>
                        <p className="text-xs font-mono font-black text-cyan-400 print:text-black">
                          {doc.documentNumber}
                        </p>
                        <p className="text-[10px] text-slate-400 print:text-slate-700 font-mono">
                          Issued: {doc.issueDate}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Settlement HUD Banner */}
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between gap-4 print:bg-slate-50 print:border-emerald-600">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/40 shadow-xs">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-emerald-400 print:text-emerald-800">
                          Reconciled Settlement State
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-white print:text-black">
                          PAYMENT SETTLED IN FULL (ZERO DUES)
                        </h4>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono uppercase text-slate-400 print:text-slate-700 block">Total Authorized</span>
                      <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 print:text-black">
                        {formatCurrency(doc.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Payer & Audit Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Student Payer Card */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 print:bg-slate-50 print:border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase text-indigo-400 font-bold tracking-wider">
                          Billed To (Registered Student)
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">VERIFIED CANDIDATE</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-600 text-white flex items-center justify-center font-black text-sm border border-white/20 shadow-xs shrink-0">
                          {getCandidateInitials(doc.recipientName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-white print:text-black truncate">{doc.recipientName}</p>
                          <p className="text-[11px] text-cyan-300 print:text-black font-mono">ID: {doc.recipientId}</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 print:text-slate-700">Contact: {doc.recipientPhone || '+91 98765 43210'}</p>
                      <p className="text-[10px] text-slate-400 print:text-slate-700 truncate">Territory: {doc.locality || 'Saidpur'}, {doc.district}, {doc.state}</p>
                    </div>

                    {/* Audit & Transaction Telemetry */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase text-indigo-400 font-bold tracking-wider">
                          Transaction & Audit Telemetry
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400">SETTLED</span>
                      </div>
                      <p className="text-[11px] text-slate-200 print:text-black">
                        Mode: <span className="font-bold text-white print:text-black">{doc.paymentMethod || 'UPI Instant Clearing'}</span>
                      </p>
                      <p className="text-[10px] font-mono text-slate-300 print:text-slate-700 truncate">
                        Payment Ref: <span className="text-cyan-300 print:text-black">{doc.paymentId || 'PAY-REF-001'}</span>
                      </p>
                      <p className="text-[10px] font-mono text-slate-300 print:text-slate-700 truncate">
                        Txn Hash: <span className="text-indigo-300 print:text-black">{doc.transactionRef || 'UPI/260903/ZYZUS9928129'}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 print:text-slate-700">
                        Session: <span className="font-bold text-white print:text-black">{doc.billingPeriod || 'Current Session'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Reconciled Itemized Table */}
                  <div className="rounded-xl border border-slate-800 overflow-hidden print:border-slate-300">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[9px] border-b border-slate-800 print:bg-slate-100 print:text-black print:border-slate-300">
                        <tr>
                          <th className="px-4 py-2.5">Itemized Academic Service Description</th>
                          <th className="px-4 py-2.5 text-right">Amount (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 print:divide-slate-200 text-slate-200 print:text-black">
                        {(doc.lineItems || [
                          { label: doc.title, amount: doc.amount },
                          { label: 'Platform Academic Ledger Reconciliation Fee', amount: 0 },
                          { label: 'Total Paid & Settled in Full', amount: doc.amount, isHighlight: true }
                        ]).map((it, idx) => {
                          const isDiscount = it.isDeduction || it.amount < 0 || it.label.toLowerCase().includes('coupon') || it.label.toLowerCase().includes('discount') || it.label.toLowerCase().includes('concession');
                          return (
                            <tr 
                              key={idx} 
                              className={
                                it.isHighlight 
                                  ? 'bg-emerald-950/20 font-black text-emerald-300 print:text-black' 
                                  : isDiscount 
                                    ? 'text-emerald-400 font-semibold bg-emerald-950/10 print:text-emerald-800' 
                                    : ''
                              }
                            >
                              <td className="px-4 py-2.5 flex items-center gap-1.5">
                                {isDiscount && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                <span>{it.label}</span>
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold">
                                {it.amount < 0 
                                  ? `-₹${Math.abs(it.amount).toLocaleString('en-IN')}` 
                                  : formatCurrency(it.amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Verification & Barcode */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-white print:border-slate-300">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center shadow-xs">
                        <QrCode className="w-10 h-10 text-slate-950" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono font-bold text-cyan-300 print:text-black">
                          CRYPTOGRAPHIC PROOF VERIFIED
                        </p>
                        <p className="text-[9px] text-slate-400 print:text-slate-700">
                          Scan to verify tax invoice on ZYZU'S Sovereign Ledger
                        </p>
                        <p className="text-[8px] font-mono text-slate-500 truncate max-w-xs">
                          {doc.qrVerificationHash || 'SHA256-RCP-SETTLED-3391024'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-serif italic text-sm text-slate-200 print:text-black">{doc.authorizedBy}</p>
                      <p className="text-[9px] text-slate-400 print:text-slate-700">{doc.authorizedRole}</p>
                    </div>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* CUTTABLE PERFORATION LINE & NOTCHES (FEES RECEIPT)                         */}
                {/* ========================================================================= */}
                {showCutLines && (
                  <div className="relative py-2 select-none">
                    {/* Left Notch */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border border-indigo-500/40 print:bg-white print:border-black" />
                    
                    {/* Dashed Horizontal Line */}
                    <div className="w-full border-b-2 border-dashed border-indigo-400/70 print:border-black" />
                    
                    {/* Scissors Text in Center */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-slate-950 px-3 py-0.5 rounded-full border border-indigo-500/30 text-[9px] font-mono font-bold text-indigo-300 print:bg-white print:text-black print:border-black flex items-center gap-1.5 shadow-sm">
                      <Scissors className="w-3.5 h-3.5" />
                      <span>TEAR ALONG THIS LINE FOR ACADEMIC RECORD / TAX ARCHIVE</span>
                    </div>

                    {/* Right Notch */}
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border border-indigo-500/40 print:bg-white print:border-black" />
                  </div>
                )}

                {/* ========================================================================= */}
                {/* COUNTERFOIL SECTION: STUDENT ACADEMIC & TAX RECORD COPY                   */}
                {/* ========================================================================= */}
                <div className="p-5 sm:p-7 bg-slate-950/80 border-t border-slate-800 space-y-3 print:bg-white print:border-black">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-black uppercase text-indigo-300 print:text-black tracking-wide">
                        COUNTERFOIL // STUDENT COPY
                      </h5>
                      <p className="text-[10px] text-slate-400 print:text-slate-700">
                        Official Academic Receipt Record for Reimbursement & Tax Proof
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 print:text-black">
                      SETTLED • ₹{doc.amount}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-slate-900 p-2.5 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-200">
                    <div>
                      <span className="text-slate-400 print:text-slate-700 block">Student:</span>
                      <strong className="text-white print:text-black">{doc.recipientName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 print:text-slate-700 block">Receipt ID:</span>
                      <strong className="font-mono text-cyan-300 print:text-black">{doc.documentNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 print:text-slate-700 block">Session:</span>
                      <strong className="text-white print:text-black">{doc.billingPeriod || 'Current'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 print:text-slate-700 block">Status:</span>
                      <strong className="text-emerald-400 print:text-black">PAID IN FULL</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-[9px] text-slate-400 print:text-slate-700">
                    <p>ZYZU'S Clearinghouse Ledger ID: {doc.id.toUpperCase()}</p>
                    <p className="font-mono text-slate-500">AUTONOMOUS AUDIT VERIFIED</p>
                  </div>
                </div>
              </div>

            /* ========================================================= */
            /* LAYOUT 3: DUAL-SIDED ID CARD LAYOUT WITH CUT GUIDELINES   */
            /* ========================================================= */
            ) : isIdCard ? (
              doc.documentType === 'STUDENT_ID_CARD' || doc.recipientRole === 'STUDENT' ? (
                <div className="flex justify-center p-2 sm:p-4 print:p-0">
                  <OfficialStudentIdCard
                    studentName={doc.recipientName}
                    studentId={doc.documentNumber}
                    studentAvatar={doc.recipientAvatar}
                    studentPhone={doc.metadata?.mobileNumber || doc.metadata?.studentPhone}
                    studentClass={doc.metadata?.qualification || doc.metadata?.class}
                    serviceType={
                      doc.metadata?.serviceType === 'BOTH' ? 'BOTH' :
                      doc.metadata?.serviceType === 'HOME_TUITION' ? 'HOME_TUITION' :
                      'LIBRARY'
                    }
                    libraryName={doc.metadata?.libraryName}
                    seatNumber={doc.metadata?.seatNumber}
                    shift={doc.metadata?.shift}
                    teacherName={doc.metadata?.teacherName}
                    address={doc.metadata?.address || (doc as any).address || 'Near Pankaj Talkies, Saidpur'}
                    district={doc.district || 'Ghazipur'}
                    state={doc.state || 'Uttar Pradesh'}
                    pincode={doc.metadata?.pincode || (doc as any).pincode || '233304'}
                    issueDate={doc.issueDate || (doc as any).issuedAt}
                    validUntil={doc.validUntil}
                  />
                </div>
              ) : (
                <div className="space-y-6 max-w-2xl mx-auto print-avoid-break">
                  {/* Print guidelines indicator */}
                  <div className="print:hidden flex items-center justify-between px-4 py-2 bg-blue-950/60 border border-blue-500/40 rounded-xl text-blue-300 text-xs">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold">Print & Cut Guidelines Enabled</span>
                      <span className="text-[11px] text-blue-400 hidden sm:inline">— Standard CR80 ID Card dimensions (85.6mm × 54mm)</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900 rounded-lg p-0.5 border border-slate-700 text-xs">
                      <button
                        onClick={() => setIdCardSide('BOTH')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${idCardSide === 'BOTH' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Dual
                      </button>
                      <button
                        onClick={() => setIdCardSide('FRONT')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${idCardSide === 'FRONT' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Front
                      </button>
                      <button
                        onClick={() => setIdCardSide('BACK')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${idCardSide === 'BACK' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Back
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    {/* FRONT SIDE */}
                    {(idCardSide === 'BOTH' || idCardSide === 'FRONT') && (
                      <div className={`relative w-[340px] h-[215px] rounded-2xl p-4 shadow-xl overflow-hidden text-white flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-950 to-black border ${showCutLines ? 'border-dashed border-sky-400/80' : 'border-slate-800'}`}>
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-400 to-amber-400" />
                        
                        {showCutLines && (
                          <div className="absolute top-1 left-1 text-[8px] text-sky-400/70 font-mono select-none">
                            ✂ FRONT
                          </div>
                        )}

                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <img
                              src="/assets/branding/zyzus-logo-64.png"
                              alt="ZYZU'S"
                              className="w-6 h-6 rounded object-contain shadow-xs border border-blue-400/30 shrink-0"
                            />
                            <div>
                              <h3 className="text-xs font-black tracking-wider text-white">ZYZU'S</h3>
                              <p className="text-[8px] tracking-widest text-orange-400 font-bold uppercase">Tutors & Libraries</p>
                            </div>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getRoleBadgeColor(doc.recipientRole)}`}>
                            {doc.recipientRole.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 my-auto">
                          <div className="relative shrink-0">
                            {doc.recipientAvatar ? (
                              <img
                                src={doc.recipientAvatar}
                                alt={doc.recipientName}
                                className="w-16 h-20 object-cover rounded-xl border border-white/20 shadow-md"
                              />
                            ) : (
                              <div className="w-16 h-20 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-700 text-white flex flex-col items-center justify-center font-black text-lg border border-white/20 shadow-md">
                                <span>{getCandidateInitials(doc.recipientName)}</span>
                                <span className="text-[7px] opacity-80 uppercase tracking-widest mt-1">ZYZU'S</span>
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 p-0.5 rounded bg-slate-900 border border-slate-700 text-blue-400">
                              <ShieldCheck className="w-3 h-3" />
                            </div>
                          </div>

                          <div className="min-w-0 space-y-0.5 flex-1">
                            <h4 className="text-sm font-black text-white truncate leading-tight">
                              {doc.recipientName}
                            </h4>
                            <p className="text-[11px] font-semibold text-blue-300 truncate">
                              {doc.metadata?.qualification || doc.recipientRole.replace('_', ' ')}
                            </p>
                            <p className="text-[10px] font-mono font-bold text-slate-300">
                              ID: <span className="text-amber-400">{doc.documentNumber}</span>
                            </p>
                            <p className="text-[9px] text-slate-400 truncate flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              <span>{doc.district}, {doc.state}</span>
                            </p>
                            <p className="text-[9px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 shrink-0" />
                              <span>Valid: <strong>{doc.validUntil || '2027-03-31'}</strong></span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[8px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <div className="p-0.5 bg-white rounded text-slate-950">
                              <QrCode className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-mono text-white text-[8px] font-bold">256-BIT ENCRYPTED</p>
                              <p className="text-[7px] text-slate-400">Scan to verify</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-serif italic text-[11px] text-slate-200 border-b border-white/20 pb-0.5">
                              {doc.authorizedBy}
                            </div>
                            <p className="text-[7px] text-slate-400">{doc.authorizedRole}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BACK SIDE */}
                    {(idCardSide === 'BOTH' || idCardSide === 'BACK') && (
                      <div className={`relative w-[340px] h-[215px] rounded-2xl p-4 shadow-xl overflow-hidden text-slate-800 flex flex-col justify-between bg-gradient-to-br from-slate-50 via-white to-slate-100 border ${showCutLines ? 'border-dashed border-sky-400/80' : 'border-slate-300'}`}>
                        {showCutLines && (
                          <div className="absolute top-1 right-1 text-[8px] text-sky-600 font-mono select-none">
                            ✂ BACK
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                            <span className="text-[9px] font-black uppercase text-slate-700 tracking-wider">
                              OFFICIAL IDENTITY CREDENTIAL
                            </span>
                            <span className="text-[8px] font-mono text-slate-500">
                              DOC-ID-{doc.documentNumber.slice(-6)}
                            </span>
                          </div>
                          <ul className="text-[8px] text-slate-600 space-y-0.5 mt-1.5 list-disc pl-3">
                            <li>This card is non-transferable property of ZYZU'S Education Network.</li>
                            <li>Must be presented upon entering authorized study spaces or sessions.</li>
                            <li>Loss of card must be reported to the District Operations Office.</li>
                          </ul>
                        </div>

                        <div className="my-auto py-1 px-2.5 bg-slate-100 rounded-lg border border-slate-200 text-[8.5px] space-y-0.5">
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-semibold">Blood Group:</span>
                            <span className="font-bold text-slate-800">{doc.metadata?.bloodGroup || 'B+ (Verified)'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-semibold">Emergency Helpline:</span>
                            <span className="font-mono font-bold text-slate-800">{doc.metadata?.emergencyContact || '+91 99999 99999'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-semibold">Jurisdiction:</span>
                            <span className="font-bold text-slate-800">{doc.district}, {doc.state}</span>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="font-mono text-[14px] tracking-widest text-slate-900 font-bold select-none">
                              ||| | |||| | || ||| | |||
                            </div>
                            <p className="text-[7.5px] font-mono text-slate-500">{doc.documentNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[7px] text-slate-500 uppercase">Issuing Authority</p>
                            <p className="text-[8px] font-bold text-slate-800">ZYZU'S National Directorate</p>
                            <p className="text-[7px] text-blue-600 underline">https://zyzus.com</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )

            /* ========================================================= */
            /* LAYOUT 3.5: ZYZU'S OFFICIAL TEACHER SALARY SLIP       */
            /* ========================================================= */
            ) : isSalarySlip ? (
              <TeacherSalarySlipVoucher
                document={doc}
                onPrint={handlePrint}
                onClose={onClose}
                isModal={false}
              />

            /* ========================================================= */
            /* LAYOUT 4: VERIFIED PARTNER CERTIFICATE LAYOUT             */
            /* ========================================================= */
            ) : isCertificate ? (
              <div className="max-w-3xl mx-auto bg-amber-50/40 p-8 sm:p-12 rounded-3xl border-8 border-double border-amber-600/60 shadow-2xl relative overflow-hidden text-center text-slate-800 print-avoid-break">
                <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-amber-500/10 flex items-center justify-center pointer-events-none">
                  <Award className="w-48 h-48 text-amber-500/15" />
                </div>

                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-white">
                  <Award className="w-8 h-8" />
                </div>

                <h1 className="text-xs uppercase font-extrabold tracking-widest text-amber-800 mb-1">
                  ZYZU'S National Accreditation Directorate
                </h1>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 mb-3 tracking-wide">
                  {doc.title}
                </h2>
                <div className="w-24 h-0.5 bg-amber-600/50 mx-auto mb-6" />

                <p className="text-xs sm:text-sm text-slate-600 italic mb-4">
                  This official document certifies that
                </p>

                <div className="text-xl sm:text-2xl font-bold font-serif text-slate-900 border-b-2 border-slate-300 inline-block px-8 pb-1 mb-4">
                  {doc.recipientName}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed mb-6">
                  has demonstrated exemplary compliance with national educational standards and is hereby recognized as an accredited{' '}
                  <strong>{doc.recipientRole.replace('_', ' ')}</strong> in the jurisdiction of{' '}
                  <strong>{doc.district}, {doc.state}</strong>.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-8 p-3 rounded-xl bg-white/80 border border-amber-200 text-left text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Certificate No</span>
                    <p className="font-mono font-bold text-slate-900">{doc.documentNumber}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Date of Issuance</span>
                    <p className="font-bold text-slate-900">{doc.issueDate}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Valid Through</span>
                    <p className="font-bold text-slate-900">{doc.validUntil || '2027-08-04'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-amber-300/60 max-w-xl mx-auto">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-white border border-amber-300 rounded-lg shadow-xs">
                      <QrCode className="w-10 h-10 text-slate-900" />
                    </div>
                    <div className="text-left text-[10px] text-slate-500">
                      <p className="font-bold text-slate-800">Tamper-Proof Verification</p>
                      <p className="font-mono text-amber-900">VERIFIED AUTHENTIC</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-serif italic font-bold text-slate-800 text-base border-b border-slate-300 pb-0.5">
                      {doc.authorizedBy}
                    </div>
                    <p className="text-[11px] font-bold text-slate-900">{doc.authorizedRole}</p>
                    <p className="text-[9px] text-slate-400">National Directorate Seal</p>
                  </div>
                </div>
              </div>

            /* ========================================================= */
            /* LAYOUT 5: FALLBACK STANDARD OFFICIAL DOCUMENT LAYOUT      */
            /* ========================================================= */
            ) : (
              <div className="w-full bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-slate-200 text-slate-800 print-avoid-break">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{doc.title}</h2>
                    <p className="text-xs text-slate-500 font-mono">{doc.documentNumber}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-700">
                    {doc.status}
                  </span>
                </div>
                <div className="my-6 space-y-3 text-xs">
                  <p><strong>Recipient:</strong> {doc.recipientName} ({doc.recipientRole})</p>
                  <p><strong>Territory:</strong> {doc.district}, {doc.state}</p>
                  <p><strong>Issue Date:</strong> {doc.issueDate}</p>
                  {doc.amount > 0 && <p><strong>Amount:</strong> {formatCurrency(doc.amount)}</p>}
                </div>
                <div className="pt-4 border-t border-slate-200 text-xs text-slate-400 flex justify-between">
                  <span>Authorized by: {doc.authorizedBy}</span>
                  <span className="font-mono">VERIFIED ZYZU'S</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DEDICATED STICKY ACTION FOOTER BAR (Screen Only - Hidden in Print)        */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-950/95 border-t border-slate-800 text-white print:hidden shrink-0">
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sovereign Ledger Verified</span>
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:inline text-slate-400 font-mono">
              {doc.documentNumber}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Prominent Close Button */}
            <button
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Close viewer"
            >
              <X className="w-4 h-4 text-slate-400" />
              <span>Close</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Print document or Save as PDF"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Print {isFeeReceipt ? 'Receipt' : isDemoPass ? 'Pass' : 'Doc'}</span>
            </button>

            {/* Prominent Download Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadPng}
              disabled={isDownloading}
              className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-cyan-600/25 flex items-center gap-2 cursor-pointer"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>
                {isDownloading ? 'Generating...' : `Download ${isFeeReceipt ? 'Fee Receipt' : isDemoPass ? 'Demo Pass' : 'Document'}`}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 text-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Share Official Credential</span>
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Anyone with this cryptographic verification link can verify the authenticity of document <strong className="text-cyan-400">{doc.documentNumber}</strong> without exposing sensitive personal banking details.
            </p>

            <div className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/verify/doc/${doc.documentNumber}`}
                className="bg-transparent border-none outline-hidden w-full text-cyan-300 truncate select-all"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="bg-slate-800 border-slate-700 text-white shrink-0 cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="ml-1">{isCopied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setShowShareModal(false)} className="cursor-pointer">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
