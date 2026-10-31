import React, { useState } from 'react';
import { LibraryCertificateData } from '../../types';
import { 
  Award, 
  Download, 
  Printer, 
  X, 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  Building2,
  Share2,
  ExternalLink,
  Lock,
  Calendar,
  MapPin,
  Check
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Button } from './Button';

export interface LibraryCertificateModalProps {
  certificate: LibraryCertificateData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LibraryCertificateModal: React.FC<LibraryCertificateModalProps> = ({
  certificate,
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [showQrVerification, setShowQrVerification] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !certificate) return null;

  // Derive standardized official identifiers
  const rawId = (certificate.libraryId || '').replace(/\D/g, '') || '8012';
  const displayLibId = certificate.libraryId.startsWith('FP-LIB-')
    ? certificate.libraryId
    : `FP-LIB-${rawId.padStart(4, '0')}`;
  
  const displayCertNo = certificate.certificateNumber || 
    (certificate.certificateId?.startsWith('FP-VPL-') 
      ? certificate.certificateId 
      : `FP-VPL-${rawId.padStart(4, '0')}`);

  const verificationUrl = `${window.location.origin}/#/verify/doc/${displayCertNo}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    showToast('Secure verification link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleDownload = () => {
    try {
      // Create high-res A4 Portrait Canvas (1240 x 1754 px at 150 DPI)
      const canvas = document.createElement('canvas');
      canvas.width = 1240;
      canvas.height = 1754;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        showToast('Canvas rendering not supported on this browser', 'error');
        return;
      }

      // 1. Crisp White / Soft Gray Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1240, 1754);

      // Subtle textured tint
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1754);
      bgGrad.addColorStop(0, '#FFFFFF');
      bgGrad.addColorStop(0.5, '#F8FAFC');
      bgGrad.addColorStop(1, '#F1F5F9');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1240, 1754);

      // 2. Deep Navy Outer Frame & Gold Accent Border
      ctx.strokeStyle = '#0F1E36';
      ctx.lineWidth = 14;
      ctx.strokeRect(36, 36, 1168, 1682);

      ctx.strokeStyle = '#D4AF37'; // Subtle Metallic Gold Accent
      ctx.lineWidth = 3;
      ctx.strokeRect(56, 56, 1128, 1642);

      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.strokeRect(66, 66, 1108, 1622);

      // Corner Accents (Subtle Gold)
      const drawCorner = (x: number, y: number, angle: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = '#D4AF37';
        ctx.fillRect(-20, -3, 40, 6);
        ctx.fillRect(-3, -20, 6, 40);
        ctx.restore();
      };
      drawCorner(78, 78, 0);
      drawCorner(1162, 78, Math.PI / 2);
      drawCorner(1162, 1676, Math.PI);
      drawCorner(78, 1676, -Math.PI / 2);

      // 3. Top Security Header
      ctx.fillStyle = '#EA580C'; // FocusPoint Orange Accent
      ctx.fillRect(470, 75, 300, 4);

      // FOCUSPOINT Header
      ctx.fillStyle = '#0F1E36'; // Deep Navy
      ctx.font = '900 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("ZYZU'S", 620, 140);

      ctx.fillStyle = '#F97316'; // FocusPoint Orange
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Tutors & Libraries', 620, 175);

      ctx.fillStyle = '#64748B'; // Soft Gray
      ctx.font = '600 13px sans-serif';
      ctx.fillText('NATIONAL ACCREDITATION & VERIFICATION DIRECTORATE', 620, 205);

      // Decorative divider
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(250, 235);
      ctx.lineTo(990, 235);
      ctx.stroke();

      // 4. VERIFIED & PARTNERED STUDY LIBRARY Ribbon
      ctx.fillStyle = '#0F1E36'; // Deep Navy
      ctx.beginPath();
      ctx.roundRect(300, 265, 640, 52, 26);
      ctx.fill();

      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(300, 265, 640, 52, 26);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 20px sans-serif';
      ctx.fillText('★ VERIFIED & PARTNERED STUDY LIBRARY ★', 620, 298);

      // 5. Library Emblem Graphic - Official ZYZU'S Emblem
      const certLogo = new Image();
      certLogo.crossOrigin = 'anonymous';
      certLogo.src = '/assets/branding/zyzus-logo-128.png';
      if (certLogo.complete && certLogo.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(620, 410, 50, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(certLogo, 570, 360, 100, 100);
        ctx.restore();
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(620, 410, 52, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(620, 410, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#0a192f';
        ctx.font = '900 32px sans-serif';
        ctx.fillText('Z', 620, 415);
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#EA580C';
        ctx.fillText('ACCREDITED', 620, 435);
      }

      // 6. Library Name
      ctx.fillStyle = '#0F1E36';
      ctx.font = '900 42px serif';
      ctx.fillText(certificate.libraryName, 620, 530);

      // Divider below name
      ctx.strokeStyle = '#EA580C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(420, 560);
      ctx.lineTo(820, 560);
      ctx.stroke();

      // 7. Official Certification Statement
      ctx.fillStyle = '#334155';
      ctx.font = '19px serif';
      ctx.fillText('This certifies that the above study library has been approved/verified and partnered with', 620, 620);
      ctx.fillText("ZYZU'S according to the applicable platform verification process.", 620, 655);

      // 8. Official Metadata Credential Box
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(160, 710, 920, 310);
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(160, 710, 920, 310);

      // Inner Grid Lines
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(160, 810);
      ctx.lineTo(1080, 810);
      ctx.moveTo(160, 915);
      ctx.lineTo(1080, 915);
      ctx.moveTo(620, 710);
      ctx.lineTo(620, 915);
      ctx.stroke();

      // Row 1: Library ID & Certificate No
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('LIBRARY ID:', 200, 755);
      ctx.fillStyle = '#0F1E36';
      ctx.font = '900 18px monospace';
      ctx.fillText(displayLibId, 330, 755);

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('CERTIFICATE NO:', 660, 755);
      ctx.fillStyle = '#0F1E36';
      ctx.font = '900 18px monospace';
      ctx.fillText(displayCertNo, 820, 755);

      // Row 2: District & State/UT
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('DISTRICT:', 200, 860);
      ctx.fillStyle = '#0F1E36';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(certificate.districtName || 'Ghazipur', 330, 860);

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('STATE / UT:', 660, 860);
      ctx.fillStyle = '#0F1E36';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(certificate.stateName || 'Uttar Pradesh', 820, 860);

      // Row 3: Official Status
      ctx.textAlign = 'center';
      ctx.fillStyle = '#047857'; // Deep Emerald
      ctx.font = '900 18px sans-serif';
      ctx.fillText('STATUS:  ✓ VERIFIED & PARTNERED', 620, 965);

      // 9. Issued Dates & Validity
      ctx.fillStyle = '#475569';
      ctx.font = '600 16px sans-serif';
      ctx.fillText(`Issued On: ${certificate.issueDate || '05 Feb 2026'}    •    Valid Through: ${certificate.validUntil || '04 Feb 2027'} (1-Year Term)`, 620, 1070);

      // 10. QR Verification Code Representation
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(530, 1120, 180, 180);
      ctx.strokeStyle = '#0F1E36';
      ctx.lineWidth = 2;
      ctx.strokeRect(530, 1120, 180, 180);

      // Draw stylized QR pattern
      ctx.fillStyle = '#0F1E36';
      ctx.fillRect(545, 1135, 45, 45);
      ctx.fillRect(650, 1135, 45, 45);
      ctx.fillRect(545, 1240, 45, 45);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(555, 1145, 25, 25);
      ctx.fillRect(660, 1145, 25, 25);
      ctx.fillRect(555, 1250, 25, 25);
      ctx.fillStyle = '#0F1E36';
      ctx.fillRect(562, 1152, 11, 11);
      ctx.fillRect(667, 1152, 11, 11);
      ctx.fillRect(562, 1257, 11, 11);

      // QR Data dots
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          if ((i + j) % 2 === 0) {
            ctx.fillRect(605 + i * 14, 1195 + j * 14, 8, 8);
          }
        }
      }

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('SCAN TO VERIFY AUTHENTICITY', 620, 1330);
      ctx.font = '10px monospace';
      ctx.fillText(displayCertNo, 620, 1348);

      // 11. Signatures & Official Seals
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0F1E36';
      ctx.font = 'bold 15px serif';
      ctx.fillText('Mukesh Sonkar', 180, 1460);
      ctx.fillStyle = '#64748B';
      ctx.font = '600 12px sans-serif';
      ctx.fillText('Director of Accreditations', 180, 1485);
      ctx.fillText("ZYZU'S National Authority", 180, 1505);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#0F1E36';
      ctx.font = 'bold 15px serif';
      ctx.fillText(certificate.ownerName || 'Authorized Partner', 1060, 1460);
      ctx.fillStyle = '#64748B';
      ctx.font = '600 12px sans-serif';
      ctx.fillText('Accredited Study Library Partner', 1060, 1485);
      ctx.fillText(certificate.libraryName, 1060, 1505);

      // 12. Bottom FocusPoint Brand Mark
      ctx.textAlign = 'center';
      ctx.fillStyle = '#EA580C';
      ctx.font = '900 24px sans-serif';
      ctx.fillText("ZYZU'S", 620, 1590);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 11px sans-serif';
      ctx.fillText('Sovereign EdTech & Study Infrastructure Platform • All Rights Reserved', 620, 1615);

      // Trigger Download
      const fileName = `zyzus-partner-certificate-${certificate.libraryName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Official A4 Certificate for ${certificate.libraryName} downloaded!`, 'success');
    } catch (err) {
      console.error('Certificate download error:', err);
      showToast('Failed to download certificate', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-2xl my-auto">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <Award className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                ZYZU'S Verified & Partnered Study Library Certificate
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Official Platform Certificate • ID: {displayCertNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate A4 Portrait Display Sheet */}
        <div 
          id="focuspoint-library-certificate"
          className="relative bg-white border-8 border-slate-900 rounded-2xl p-6 sm:p-8 text-center shadow-lg overflow-hidden ring-4 ring-amber-500/40"
        >
          {/* Subtle Security watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <Building2 className="w-96 h-96 text-slate-900" />
          </div>

          {/* Gold Filigree Inner Border */}
          <div className="border border-amber-400/80 rounded-xl p-5 sm:p-6 space-y-4 bg-gradient-to-b from-white via-slate-50/50 to-white">
            {/* Header: FocusPoint Branding */}
            <div className="space-y-0.5">
              <div className="inline-block w-16 h-1 bg-brand-500 rounded-full mb-1" />
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 font-sans">
                ZYZU<span className="text-brand-600">'S</span>
              </h2>
              <p className="text-xs font-bold text-slate-600 tracking-wide">
                Tutors & Libraries
              </p>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-widest">
                National Verification Directorate
              </p>
            </div>

            {/* VERIFIED & PARTNERED STUDY LIBRARY Ribbon */}
            <div className="py-1">
              <div className="inline-block px-5 py-2 rounded-full bg-slate-900 text-white border-2 border-amber-400 shadow-sm">
                <span className="text-xs sm:text-sm font-black tracking-wide uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>VERIFIED & PARTNERED STUDY LIBRARY</span>
                </span>
              </div>
            </div>

            {/* Library Emblem / Logo */}
            <div className="py-1 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-amber-400/80 flex flex-col items-center justify-center text-slate-900 shadow-inner">
                <Building2 className="w-6 h-6 text-brand-600" />
                <span className="text-[8px] font-black uppercase text-slate-700 tracking-tighter">PARTNER</span>
              </div>
            </div>

            {/* Library Name */}
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-black text-slate-950 tracking-tight">
                {certificate.libraryName}
              </h1>
              <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-1" />
            </div>

            {/* Official Certification Statement */}
            <div className="max-w-md mx-auto text-xs sm:text-[13px] text-slate-600 leading-relaxed font-serif">
              <p>
                This certifies that the above study library has been approved/verified and partnered with ZYZU'S (Tutors & Libraries) according to the applicable platform verification process.
              </p>
            </div>

            {/* Structured Credentials Grid */}
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto text-left text-xs bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Library ID</span>
                <span className="font-mono font-black text-slate-900">{displayLibId}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Certificate No</span>
                <span className="font-mono font-black text-brand-600">{displayCertNo}</span>
              </div>
              <div className="pt-1 border-t border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">District</span>
                <span className="font-bold text-slate-800">{certificate.districtName || 'Ghazipur'}</span>
              </div>
              <div className="pt-1 border-t border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">State / UT</span>
                <span className="font-bold text-slate-800">{certificate.stateName || 'Uttar Pradesh'}</span>
              </div>
            </div>

            {/* Status Pill */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Status: ✓ VERIFIED & PARTNERED</span>
              </span>
            </div>

            {/* Issued Dates */}
            <div className="text-[11px] text-slate-500 font-medium">
              <span>Issued On: <strong className="text-slate-800">{certificate.issueDate || '05 Feb 2026'}</strong></span>
              <span className="mx-2">•</span>
              <span>Valid Through: <strong className="text-slate-800">{certificate.validUntil || '04 Feb 2027'}</strong></span>
            </div>

            {/* QR Verification Code & FocusPoint Footnote */}
            <div className="pt-2 flex flex-col items-center justify-center space-y-1">
              <button
                type="button"
                onClick={() => setShowQrVerification(true)}
                className="group p-2 rounded-xl bg-white border border-slate-300 hover:border-brand-500 shadow-xs flex flex-col items-center gap-1 transition-all cursor-pointer"
                title="Click to inspect digital verification"
              >
                <QrCode className="w-14 h-14 text-slate-900 group-hover:text-brand-600 transition-colors" />
                <span className="text-[9px] font-bold text-slate-500 group-hover:text-brand-600 flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Click to Validate QR</span>
                </span>
              </button>

              <div className="pt-1">
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  ZYZU'S — TUTORS & LIBRARIES
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive QR Verification Modal Overlay */}
        {showQrVerification && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-between text-white z-20 animate-in fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-black text-sm text-white">ZYZU'S Digital Verification</h4>
                </div>
                <button
                  onClick={() => setShowQrVerification(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Public Authenticity Ledger (Section #7: Safe Public Info Only) */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                <div className="flex items-center gap-2 font-black text-sm text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Certificate Verified</span>
                </div>
                <p className="text-xs text-emerald-200/90 font-medium">
                  This study library is officially accredited, vetted, and partnered with ZYZU'S — Tutors & Libraries.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Library</span>
                  <span className="font-bold text-white text-sm">{certificate.libraryName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Library ID</span>
                    <span className="font-mono text-cyan-300 font-bold">{displayLibId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Certificate</span>
                    <span className="font-mono text-cyan-300 font-bold">{displayCertNo}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Status</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/30 text-emerald-300 font-black text-[11px] border border-emerald-500/40">
                    Verified & Partnered
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center italic">
                Verified against ZYZU'S Sovereign Ledger. Private owner contact & banking telemetry protected.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
              <a
                href={verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Public URL</span>
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQrVerification(false)}
                className="border-slate-700 text-slate-300"
              >
                Close Verification
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShareLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              title="Share verification link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Share Link'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download A4 (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
