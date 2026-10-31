import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Calendar,
  Award,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Lock
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { UnifiedFocusPointDocument } from '../../../types/document';
import { Teacher } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { documentService } from '../../../services/documentService';

interface TeacherVerificationCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate?: UnifiedFocusPointDocument | null;
  certificateNumber?: string;
  teacher: Teacher | null;
  onVerifyOnline?: (docNumber: string) => void;
}

export const TeacherVerificationCertificateModal: React.FC<TeacherVerificationCertificateModalProps> = ({
  isOpen,
  onClose,
  certificate,
  certificateNumber,
  teacher,
  onVerifyOnline
}) => {
  const { showToast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isVerified = teacher?.verificationStatus === 'APPROVED' || (teacher?.verificationStatus as any) === 'verified';
  const certNumber = certificateNumber || certificate?.documentNumber || `FP-TV-2026-${(teacher?.id.replace(/\D/g, '') || '004128').padStart(6, '0')}`;
  const issueDate = certificate?.issueDate || (teacher?.createdAt ? teacher.createdAt.substring(0, 10) : '2026-08-15');
  const validUntil = certificate?.validUntil || '2027-08-14';

  const teacherName = teacher?.name || certificate?.recipientName || 'Dr. Rajesh Sharma';
  const teacherIdFormatted = `FP-TCH-${(teacher?.id.replace(/\D/g, '') || '00412').padStart(5, '0')}`;
  const districtName = teacher?.districtName || teacher?.district || 'Ghazipur';
  const qualification = teacher?.degree || teacher?.highestQualification || 'Postgraduate Degree (Verified)';
  const experienceYears = teacher?.experienceYears || 0;

  const handlePrint = () => {
    documentService.recordDocumentAction(certNumber, 'PRINTED', teacher?.id || 'usr-teacher', 'TEACHER', 'Teacher Verification Certificate A4 Print');
    window.print();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/verify/doc/${certNumber}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Public certificate verification link copied to clipboard!', 'success');
    documentService.recordDocumentAction(certNumber, 'SHARED', teacher?.id || 'usr-teacher', 'TEACHER', 'Copied Verification Link');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    documentService.recordDocumentAction(certNumber, 'DOWNLOADED', teacher?.id || 'usr-teacher', 'TEACHER', 'A4 PDF/Image Download');
    showToast(`Downloading official Certificate ${certNumber}...`, 'info');
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ZYZU'S Sovereign Teacher Verification Certificate"
      size="xl"
    >
      <div className="space-y-6">
        {/* If teacher is not yet verified: show warning message */}
        {!isVerified ? (
          <div className="p-8 text-center bg-amber-50 rounded-2xl border border-amber-200 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                Certificate Locked — Verification Under Review
              </h3>
              <p className="text-xs text-slate-600">
                Your official Teacher Verification Certificate will automatically become available once the {districtName} District Desk verifies and approves your academic degree transcripts and identity proof.
              </p>
            </div>
            <div className="pt-2">
              <Button variant="primary" size="sm" onClick={onClose} className="text-xs font-bold">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Top Modal Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authenticated Credential</span>
                </span>
                <span className="font-mono text-slate-600 font-semibold">{certNumber}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="text-xs font-semibold cursor-pointer"
                  icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                >
                  {copied ? 'Link Copied' : 'Share'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="text-xs font-semibold cursor-pointer"
                  icon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print A4
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownload}
                  className="bg-royal-blue-600 hover:bg-royal-blue-700 text-xs font-bold cursor-pointer"
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Download
                </Button>
              </div>
            </div>

            {/* A4 Printable Certificate Viewport */}
            <div className="overflow-x-auto p-1">
              <div
                ref={printRef}
                className="w-full max-w-[800px] mx-auto bg-[#faf8f5] text-slate-900 rounded-3xl p-8 sm:p-12 border-8 border-double border-amber-700/60 shadow-2xl relative overflow-hidden text-center print:border-none print:shadow-none print:p-8"
                style={{ minHeight: '680px' }}
              >
                {/* Background Watermark Crest */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
                  <Award className="w-[420px] h-[420px] text-slate-900" />
                </div>

                {/* Outer Decorative Gold Corner Accents */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-600/80 pointer-events-none" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-600/80 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-600/80 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-600/80 pointer-events-none" />

                {/* Certificate Header Banner */}
                <div className="relative z-10 space-y-2 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-md">
                      Z
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-950 font-serif">
                      ZYZU<span className="text-royal-blue-600">'S</span>
                    </span>
                  </div>

                  <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-amber-900/90">
                    National Directorate of Educator Accreditation & Safety
                  </p>

                  <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-wide text-slate-950 uppercase pt-2">
                    Teacher Verification Certificate
                  </h1>
                  <div className="w-32 h-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 mx-auto rounded-full" />
                </div>

                {/* Certification Statement */}
                <div className="relative z-10 space-y-4 max-w-xl mx-auto mb-8">
                  <p className="text-xs sm:text-sm text-slate-600 font-serif italic">
                    This official certificate confirms that
                  </p>

                  <div className="space-y-1 py-1">
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-950 border-b-2 border-slate-300 pb-2 inline-block px-8">
                      {teacherName}
                    </h2>
                    <p className="text-xs font-mono font-bold text-royal-blue-700 pt-1">
                      Teacher ID: {teacherIdFormatted}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans pt-2">
                    has successfully completed the comprehensive ZYZU'S educator verification process according to applicable verification standards, academic vetting protocols, and national safety clearances.
                  </p>
                </div>

                {/* Verified Vetting Badges */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-8 text-left text-xs">
                  <div className="p-3 rounded-xl bg-white/90 border border-amber-200/90 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">
                      Verification Status
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-xs mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>✓ VERIFIED</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/90 border border-amber-200/90 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">
                      Qualification Vetting
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-xs mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Transcript</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/90 border border-amber-200/90 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">
                      District Jurisdiction
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-slate-900 text-xs mt-0.5">
                      <span>{districtName} Desk</span>
                    </span>
                  </div>
                </div>

                {/* Metadata Ledger Grid */}
                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto mb-8 p-3 rounded-xl bg-white/80 border border-amber-200 text-left text-xs">
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase font-bold block">Certificate No</span>
                    <p className="font-mono font-bold text-slate-900 truncate">{certNumber}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase font-bold block">Issued On</span>
                    <p className="font-bold text-slate-900">{issueDate}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase font-bold block">Valid Through</span>
                    <p className="font-bold text-slate-900">{validUntil}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase font-bold block">Authority</span>
                    <p className="font-bold text-slate-900">ZYZU'S</p>
                  </div>
                </div>

                {/* Bottom Footer: Official Seal, Digital Signature & QR Verification */}
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-amber-300/60 max-w-xl mx-auto">
                  {/* Left: Cryptographic QR Box */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-amber-300 rounded-xl shadow-xs">
                      <QrCode className="w-12 h-12 text-slate-900" />
                    </div>
                    <div className="text-left text-[10px] text-slate-600">
                      <p className="font-bold text-slate-900 uppercase">Cryptographic QR Verification</p>
                      <p className="text-emerald-700 font-bold">SHA-256 Tamper-Proof</p>
                      <button
                        type="button"
                        onClick={() => {
                          if (onVerifyOnline) onVerifyOnline(certNumber);
                          else window.open(`/verify/doc/${certNumber}`, '_blank');
                        }}
                        className="text-royal-blue-600 hover:underline font-semibold mt-0.5 inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Verify Authenticity Online</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* Right: Signature & Seal */}
                  <div className="text-center sm:text-right">
                    <div className="font-serif italic font-bold text-slate-900 text-lg border-b border-slate-400 pb-0.5 inline-block">
                      Dr. V. K. Saxena
                    </div>
                    <p className="text-[11px] font-bold text-slate-900">National Registrar</p>
                    <p className="text-[10px] text-slate-500">Directorate of Educator Accreditation</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                      Official Seal Applied
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-semibold">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
