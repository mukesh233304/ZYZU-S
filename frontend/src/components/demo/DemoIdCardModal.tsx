import React from 'react';
import { DemoBooking } from '../../types';
import { 
  ShieldCheck, 
  Download, 
  Printer, 
  X, 
  MapPin, 
  Calendar, 
  Clock,
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface DemoIdCardModalProps {
  booking: DemoBooking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DemoIdCardModal: React.FC<DemoIdCardModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [booking?.id, isOpen]);

  if (!isOpen || !booking) return null;

  const isLibrary = booking.service_type === 'LIBRARY';
  const themeGradient = isLibrary 
    ? 'from-blue-600 via-indigo-600 to-cyan-500'
    : 'from-amber-600 via-orange-600 to-emerald-600';
  
  const qrData = JSON.stringify({
    id: booking.demo_booking_id,
    type: booking.service_type,
    student: booking.student_name,
    venue: booking.service_name,
    date: booking.demo_date,
    time: booking.demo_time,
    status: booking.booking_status
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`;

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
        showToast('Canvas rendering error', 'error');
        return;
      }

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 800, 500);
      if (isLibrary) {
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(0.5, '#1e1b4b');
        bgGrad.addColorStop(1, '#0f172a');
      } else {
        bgGrad.addColorStop(0, '#1c1917');
        bgGrad.addColorStop(0.5, '#2e1065');
        bgGrad.addColorStop(1, '#064e3b');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 800, 500);

      // Header Banner
      const headGrad = ctx.createLinearGradient(0, 0, 800, 0);
      if (isLibrary) {
        headGrad.addColorStop(0, '#2563eb');
        headGrad.addColorStop(1, '#06b6d4');
      } else {
        headGrad.addColorStop(0, '#d97706');
        headGrad.addColorStop(1, '#059669');
      }
      ctx.fillStyle = headGrad;
      ctx.fillRect(0, 0, 800, 75);

      // Header Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('FOCUSPOINT — OFFICIAL DEMO PASS', 30, 46);

      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(isLibrary ? 'DIGITAL LIBRARY DEMO SEAT' : 'HOME TUITION DEMO CLASS', 520, 46);

      // Booking ID badge
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(30, 95, 740, 42);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`ID: ${booking.demo_booking_id}`, 45, 122);

      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`STATUS: ${booking.booking_status} • ${booking.payment_status === 'FREE' ? 'FREE PASS' : 'PAID'}`, 550, 122);

      // Student info
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(booking.student_name || 'FocusPoint Student', 30, 180);

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Contact: ${booking.student_mobile || '+91 98765 43210'}`, 30, 210);
      ctx.fillText(`Category: ${isLibrary ? 'Digital Library' : 'Home Tuition Bureau'}`, 30, 235);
      
      // Venue details
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`Target Service: ${booking.service_name}`, 30, 280);

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Venue / Address: ${booking.service_address || `${booking.district || 'Ghazipur'}, ${booking.state || 'UP'}`}`, 30, 310);
      ctx.fillText(`Scheduled Date: ${booking.demo_date} (${booking.demo_time})`, 30, 340);
      ctx.fillText(`Fee Paid: ${booking.price === 0 ? 'Complimentary ₹0' : `₹${booking.price} (Locked)`}`, 30, 370);

      // Security footer
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(0, 440, 800, 60);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('Authorized FocusPoint 1-Time Demo Pass. Valid for single use only. Non-transferable.', 30, 475);

      // QR Code image
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 570, 180, 190, 190);
        const link = document.createElement('a');
        link.download = `${booking.demo_booking_id}_Pass.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Demo Pass downloaded successfully!', 'success');
      };
      qrImg.onerror = () => {
        // Fallback without QR
        const link = document.createElement('a');
        link.download = `${booking.demo_booking_id}_Pass.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Demo Pass downloaded!', 'success');
      };
      qrImg.src = qrUrl;

    } catch (e) {
      console.error(e);
      showToast('Download error, please use Print button', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              FocusPoint Verified Demo Pass
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Canvas Container */}
        <div className="p-6 overflow-y-auto print:p-0">
          <div 
            id="print-demo-id-card"
            className="relative rounded-2xl overflow-hidden border-2 border-indigo-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl p-6 sm:p-8"
          >
            {/* Ambient background blur */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Badge Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/branding/zyzus-logo-64.png"
                  alt="ZYZU'S"
                  className="w-12 h-12 rounded-xl object-contain shadow-lg border border-blue-400/30 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg tracking-wider text-white">
                      ZYZU'S
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                      DEMO PASS
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium tracking-wide">
                    Tutors & Libraries • Academic Access & Verification
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  booking.payment_status === 'FREE' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isLibrary ? 'Digital Library Demo' : 'Home Tuition Demo'}
                </span>
              </div>
            </div>

            {/* Booking ID Ribbon */}
            <div className="flex items-center justify-between bg-slate-800/80 backdrop-blur-sm border border-slate-700/70 rounded-xl px-4 py-2.5 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Pass ID:</span>
                <span className="font-mono font-bold text-sm sm:text-base text-cyan-300 tracking-wider">
                  {booking.demo_booking_id}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {booking.booking_status}
              </span>
            </div>

            {/* Card Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Left Column: Student Profile */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3 md:col-span-2">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                  <div className="relative">
                    {booking.student_photo && !imageError ? (
                      <img 
                        src={booking.student_photo} 
                        alt={booking.student_name || 'Student'} 
                        onError={() => setImageError(true)}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-indigo-400 shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-700 flex items-center justify-center font-bold text-2xl text-white border-2 border-indigo-400 shadow-md">
                        {(booking.student_name || 'ZS').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -bottom-1.5 -right-1.5 p-1 bg-emerald-500 text-black rounded-full shadow">
                      <Sparkles className="w-3 h-3" />
                    </span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <h3 className="text-xl font-bold text-white tracking-wide">
                      {booking.student_name || "ZYZU'S Student"}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium">
                      Student ID: <span className="text-slate-200 font-mono font-semibold">ZYZUS-STU-{booking.student_id.slice(-6).toUpperCase()}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Mobile: <span className="text-slate-300">{booking.student_mobile || '+91 98765 43210'}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Fee: <span className="font-bold text-emerald-400">{booking.price === 0 ? 'Complimentary ₹0' : `₹${booking.price} (Confirmed)`}</span>
                    </p>
                  </div>
                </div>

                {/* Venue Details */}
                <div className="w-full bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-2 text-left">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        {booking.service_name}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {booking.service_address || `${booking.district || 'Ghazipur'}, ${booking.state || 'Uttar Pradesh'}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300 border-t border-slate-800/80">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      {booking.demo_date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {booking.demo_time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Scannable QR Code */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-xl">
                <img 
                  src={qrUrl} 
                  alt="Scannable QR Pass" 
                  className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-lg"
                />
                <span className="text-[10px] font-bold text-slate-800 tracking-wider uppercase mt-1 text-center">
                  SCAN TO VERIFY PASS
                </span>
              </div>
            </div>

            {/* Micro security note */}
            <div className="mt-6 pt-4 border-t border-slate-800/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>Authorized FocusPoint 1-Time Demo Pass • Non-Transferable</span>
              <span className="text-slate-500 font-mono">Issued: {booking.created_at.substring(0, 10)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/60 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <Printer className="w-4 h-4" />
            Print ID Card
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition"
          >
            <Download className="w-4 h-4" />
            Download Pass
          </button>
        </div>
      </div>
    </div>
  );
};
