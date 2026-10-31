import React from 'react';
import { UniversalIDCardData } from '../../types';
import { 
  ShieldCheck, 
  Download, 
  Printer, 
  X, 
  QrCode, 
  MapPin, 
  Calendar, 
  GraduationCap 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getCandidateInitials } from './UserAvatar';
import { OfficialStudentIdCard } from './OfficialStudentIdCard';

export interface UniversalIdCardModalProps {
  cardData: UniversalIDCardData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UniversalIdCardModal: React.FC<UniversalIdCardModalProps> = ({
  cardData,
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [cardData?.avatarUrl, isOpen]);

  if (!isOpen || !cardData) return null;

  const isSuperAdmin = cardData.role === 'SUPER_ADMIN' || (cardData as any).role === 'super_admin';
  const isDeleted = isSuperAdmin && localStorage.getItem('fp_super_admin_avatar_deleted') === 'true';
  const saCached = isSuperAdmin && !isDeleted ? (localStorage.getItem('fp_super_admin_avatar') || localStorage.getItem('fp_superadmin_avatar')) : null;

  const resolvedAvatar = isDeleted ? '' : (saCached || cardData.avatarUrl || '');

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        showToast('Canvas rendering not supported on this browser', 'error');
        return;
      }

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 800, 500);
      if (cardData.role === 'SUPER_ADMIN') {
        bgGrad.addColorStop(0, '#2e1065');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
      } else if (cardData.role === 'DISTRICT_ADMIN') {
        bgGrad.addColorStop(0, '#172554');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
      } else if (cardData.role === 'TEACHER') {
        bgGrad.addColorStop(0, '#064e3b');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
      } else if (cardData.role === 'LIBRARY_OWNER') {
        bgGrad.addColorStop(0, '#451a03');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
      } else {
        bgGrad.addColorStop(0, '#1e1b4b');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
      }

      // Fill background
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 800, 500);

      // Card border
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(10, 10, 780, 480);

      // Top holographic stripe
      const stripeGrad = ctx.createLinearGradient(0, 0, 800, 0);
      stripeGrad.addColorStop(0, '#3b82f6');
      stripeGrad.addColorStop(0.5, '#818cf8');
      stripeGrad.addColorStop(1, '#a855f7');
      ctx.fillStyle = stripeGrad;
      ctx.fillRect(10, 10, 780, 10);

      // Header logo box - Official ZYZU'S Emblem
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = '/assets/branding/zyzus-logo-128.png';
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(35, 35, 50, 50, 10);
        ctx.clip();
        ctx.drawImage(logoImg, 35, 35, 50, 50);
        ctx.restore();
      } else {
        ctx.fillStyle = '#1e40af';
        ctx.beginPath();
        ctx.roundRect(35, 35, 50, 50, 10);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('Z', 50, 68);
        logoImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(35, 35, 50, 50, 10);
          ctx.clip();
          ctx.drawImage(logoImg, 35, 35, 50, 50);
          ctx.restore();
        };
      }

      // Header title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px sans-serif';
      ctx.fillText("ZYZU'S", 98, 56);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 12px sans-serif';
      ctx.fillStyle = '#fb923c';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('TUTORS & LIBRARIES', 98, 76);

      // Role Badge
      ctx.fillStyle = cardData.role === 'SUPER_ADMIN' ? '#9333ea' : '#2563eb';
      ctx.beginPath();
      ctx.roundRect(560, 40, 200, 36, 18);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cardData.role.replace(/_/g, ' '), 660, 63);
      ctx.textAlign = 'left';

      // Divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(35, 100);
      ctx.lineTo(765, 100);
      ctx.stroke();

      // Photo Box
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(35, 125, 140, 175, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.stroke();

      // Draw Initials / Silhouette placeholder in photo box
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 44px sans-serif';
      const initials = cardData.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      ctx.fillText(initials || 'ZS', 75, 225);

      // Candidate details
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px sans-serif';
      ctx.fillText(cardData.fullName, 200, 160);

      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(cardData.designation || cardData.role.replace(/_/g, ' '), 200, 192);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`ID: ${cardData.uniqueIdNumber}`, 200, 225);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Territory: ${cardData.districtName}, ${cardData.stateName}`, 200, 260);
      ctx.fillText(`Valid Through: ${cardData.validUntil}`, 200, 290);

      // Bottom Section Divider
      ctx.beginPath();
      ctx.moveTo(35, 380);
      ctx.lineTo(765, 380);
      ctx.stroke();

      // QR Code Box Placeholder
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(40, 400, 60, 60);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('VERIFIED', 46, 435);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('DIGITALLY CRYPTOGRAPHICALLY SIGNED', 115, 425);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText('SECURITY STATUS: 256-BIT SOVEREIGN HASH', 115, 445);

      // Authorized Registrar Signature
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'italic bold 18px serif';
      ctx.textAlign = 'right';
      ctx.fillText('Mukesh Sonkar', 750, 430);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('Authorized National Registrar', 750, 450);
      ctx.textAlign = 'left';

      // Download
      const fileName = `zyzus-identity-card-${cardData.fullName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Official ID Card for ${cardData.fullName} downloaded successfully!`, 'success');
    } catch (err) {
      console.error('ID Card download error:', err);
      showToast('Failed to download ID Card', 'error');
    }
  };

  const roleGradients: Record<string, string> = {
    SUPER_ADMIN: 'from-purple-950 via-slate-900 to-slate-950 border-purple-500/40',
    DISTRICT_ADMIN: 'from-blue-950 via-slate-900 to-slate-950 border-blue-500/40',
    TEACHER: 'from-emerald-950 via-slate-900 to-slate-950 border-emerald-500/40',
    LIBRARY_OWNER: 'from-amber-950 via-slate-900 to-slate-950 border-amber-500/40',
    STUDENT: 'from-slate-900 via-slate-950 to-black border-slate-700',
  };

  const roleBadges: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-500 text-white',
    DISTRICT_ADMIN: 'bg-blue-500 text-white',
    TEACHER: 'bg-emerald-500 text-white',
    LIBRARY_OWNER: 'bg-amber-500 text-slate-950 font-black',
    STUDENT: 'bg-indigo-500 text-white',
  };

  const gradient = roleGradients[cardData.role] || roleGradients.STUDENT;
  const badgeColor = roleBadges[cardData.role] || 'bg-slate-700 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm text-slate-100">Official ZYZU'S Identity Card</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corporate / Student ID Card Preview Box */}
        {cardData.role === 'STUDENT' ? (
          <div className="flex justify-center">
            <OfficialStudentIdCard
              studentName={cardData.fullName}
              studentId={cardData.uniqueIdNumber}
              studentAvatar={resolvedAvatar}
              studentPhone={(cardData as any).mobileNumber || cardData.emergencyContact}
              studentClass={cardData.designation}
              serviceType={
                (cardData as any).serviceType === 'BOTH' ? 'BOTH' :
                (cardData as any).serviceType === 'HOME_TUITION' ? 'HOME_TUITION' :
                'LIBRARY'
              }
              libraryName={(cardData as any).libraryName}
              address={(cardData as any).address || 'Near Pankaj Talkies, Saidpur'}
              district={cardData.districtName || 'Ghazipur'}
              state={cardData.stateName || 'Uttar Pradesh'}
              pincode={(cardData as any).pincode || '233304'}
              issueDate={(cardData as any).issuedDate || cardData.joiningDate || '01 Feb 2026'}
              validUntil={cardData.validUntil || '31 Mar 2027'}
            />
          </div>
        ) : (
          <div id="printable-id-card" className={`relative rounded-2xl p-5 border bg-gradient-to-br ${gradient} shadow-xl overflow-hidden`}>
            {/* Holographic accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <img
                  src="/assets/branding/zyzus-logo-64.png"
                  alt="ZYZU'S"
                  className="w-7 h-7 rounded-lg object-contain shadow-md border border-blue-400/30 shrink-0"
                />
                <div>
                  <h4 className="text-xs font-black tracking-wider text-white">ZYZU'S</h4>
                  <p className="text-[8px] uppercase tracking-wider text-orange-400 font-bold">Tutors & Libraries</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${badgeColor}`}>
                {cardData.role.replace('_', ' ')}
              </span>
            </div>

            {/* Card Body */}
            <div className="flex items-start gap-4 mt-4">
              {/* Photo */}
              <div className="relative shrink-0">
                {resolvedAvatar && !imageError ? (
                  <img
                    src={resolvedAvatar}
                    alt={cardData.fullName}
                    className="w-20 h-24 object-cover rounded-xl border-2 border-white/20 shadow-md"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-20 h-24 rounded-xl border-2 border-white/20 shadow-md bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-500 text-white flex flex-col items-center justify-center select-none">
                    <span className="text-xl font-black">{getCandidateInitials(cardData.fullName)}</span>
                    <span className="text-[8px] uppercase tracking-wider font-bold opacity-90 mt-1">ZYZU'S</span>
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 p-1 rounded-md bg-slate-900 border border-slate-700 text-blue-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="text-base font-black text-white truncate leading-tight">
                  {cardData.fullName}
                </h3>
                <p className="text-xs font-semibold text-blue-300 truncate">
                  {cardData.designation || cardData.role.replace('_', ' ')}
                </p>
                <div className="text-[11px] text-slate-300 font-mono font-bold tracking-wide pt-0.5">
                  ID: {cardData.uniqueIdNumber}
                </div>

                <div className="pt-1.5 space-y-1 text-[10px] text-slate-300">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{cardData.districtName}, {cardData.stateName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Valid Until: <strong>{cardData.validUntil}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Bottom / QR & Signature */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 text-[9px] text-slate-400">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-white text-slate-950 shadow-xs">
                  <QrCode className="w-7 h-7" />
                </div>
                <div className="leading-tight">
                  <p className="text-[8px] uppercase tracking-wider text-slate-400">Security Verification</p>
                  <p className="font-mono text-white text-[9px] font-bold">256-BIT ENCRYPTED</p>
                </div>
              </div>

              <div className="text-right">
                <div className="font-serif italic text-xs text-slate-200 border-b border-white/20 pb-0.5 mb-0.5">
                  Mukesh Sonkar
                </div>
                <p className="text-[8px] uppercase text-slate-400">Authorized Registrar</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-800">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print ID Card</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ID Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
