import React, { useRef } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  QrCode, 
  User, 
  Camera, 
  BookOpen, 
  Armchair, 
  GraduationCap, 
  CheckCircle2,
  Phone
} from 'lucide-react';
import { getCandidateInitials } from './UserAvatar';

export interface OfficialStudentIdCardProps {
  studentName: string;
  studentId: string;
  studentAvatar?: string;
  studentPhone?: string;
  studentClass?: string;
  serviceType: 'HOME_TUITION' | 'LIBRARY' | 'BOTH';
  libraryName?: string;
  seatNumber?: string;
  shift?: string;
  teacherName?: string;
  subject?: string;
  address?: string;
  district?: string;
  state?: string;
  pincode?: string;
  issueDate?: string;
  validUntil?: string;
  onPhotoUpload?: (file: File) => void;
  isEditablePhoto?: boolean;
  className?: string;
}

export const OfficialStudentIdCard: React.FC<OfficialStudentIdCardProps> = ({
  studentName,
  studentId,
  studentAvatar,
  studentPhone,
  studentClass,
  serviceType = 'LIBRARY',
  libraryName,
  seatNumber,
  shift,
  teacherName,
  subject,
  address,
  district = 'Ghazipur',
  state = 'Uttar Pradesh',
  pincode = '233304',
  issueDate = '01 Feb 2026',
  validUntil = '31 Mar 2027',
  onPhotoUpload,
  isEditablePhoto = false,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanAddress = address || 'Near Pankaj Talkies, Saidpur';

  const handlePhotoClick = () => {
    if (isEditablePhoto && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPhotoUpload) {
      onPhotoUpload(file);
    }
  };

  // Service Badge configurations
  const serviceBadgeConfig = {
    BOTH: {
      label: 'DUAL SERVICE: HOME TUITION & LIBRARY',
      bg: 'bg-gradient-to-r from-purple-900 to-indigo-950',
      border: 'border-purple-400/50',
      text: 'text-purple-200',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
      icon: <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
    },
    HOME_TUITION: {
      label: 'HOME TUITION LEARNER',
      bg: 'bg-gradient-to-r from-emerald-950 to-teal-950',
      border: 'border-emerald-400/50',
      text: 'text-emerald-200',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      icon: <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
    },
    LIBRARY: {
      label: 'VERIFIED STUDY LIBRARY PASS',
      bg: 'bg-gradient-to-r from-blue-950 to-slate-950',
      border: 'border-blue-400/50',
      text: 'text-cyan-200',
      badgeBg: 'bg-blue-500/20 text-cyan-300 border-blue-400/40',
      icon: <Armchair className="w-3.5 h-3.5 text-cyan-400" />
    }
  }[serviceType] || {
    label: 'STUDENT IDENTITY PASS',
    bg: 'bg-slate-950',
    border: 'border-slate-700',
    text: 'text-slate-200',
    badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
    icon: <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
  };

  return (
    <div 
      id="printable-student-id-card"
      className={`w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border-2 border-slate-900 overflow-hidden font-sans relative select-none flex flex-col justify-between ${className}`}
      style={{ minHeight: '560px' }}
    >
      {/* Hidden File Input for photo upload */}
      {isEditablePhoto && (
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />
      )}

      {/* TOP HEADER: FOCUSPOINT THE DIGITAL LIBRARY & HOME TUITION */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 px-5 py-3 text-white border-b-2 border-amber-400 shrink-0">
        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-amber-400 pb-1 border-b border-white/10">
          <span>GOVT ACCREDITED PLATFORM</span>
          <span>SOVEREIGN EDTECH LEDGER</span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-sm">
              Z
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-white leading-none">
                ZYZU<span className="text-orange-400">'S</span>
              </h2>
              <p className="text-[9px] font-bold text-orange-400 tracking-wide mt-0.5">
                TUTORS & LIBRARIES
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-black tracking-wider uppercase">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>ACCREDITED</span>
            </span>
          </div>
        </div>
      </div>

      {/* MAIN BODY: STRICT FIXED CSS GRID (PHOTO NEVER OVERLAPS ADDRESS) */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/80">
        
        {/* ROW 1: PHOTO (Dedicated Column 1) + STUDENT CREDENTIALS (Column 2) */}
        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[110px_1fr] gap-3.5 items-start">
          {/* PHOTO BOX: FIXED MAXIMUM DIMENSIONS & DEDICATED COLUMN */}
          <div className="relative shrink-0">
            <div 
              onClick={handlePhotoClick}
              className={`w-[100px] h-[125px] sm:w-[110px] sm:h-[135px] rounded-2xl border-2 border-slate-900 bg-slate-100 shadow-md overflow-hidden relative flex items-center justify-center ${isEditablePhoto ? 'cursor-pointer group' : ''}`}
            >
              {studentAvatar ? (
                <img 
                  src={studentAvatar} 
                  alt={studentName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-slate-100 via-blue-50 to-slate-200 flex flex-col items-center justify-center text-slate-500 p-2 text-center">
                  <User className="w-10 h-10 text-slate-400 mb-1" />
                  <span className="text-[10px] font-bold text-slate-600 leading-tight">
                    {getCandidateInitials(studentName)}
                  </span>
                  {isEditablePhoto && (
                    <span className="text-[8px] font-bold text-brand-600 mt-1 flex items-center gap-0.5">
                      <Camera className="w-2.5 h-2.5" /> Add Photo
                    </span>
                  )}
                </div>
              )}

              {/* Photo Edit Overlay */}
              {isEditablePhoto && (
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold print:hidden">
                  <Camera className="w-4 h-4 text-cyan-300 mb-0.5" />
                  <span>Update</span>
                </div>
              )}
            </div>

            {/* Small Verified Badge */}
            <div className="absolute -bottom-2 -right-1 p-1 rounded-full bg-emerald-600 text-white shadow-sm ring-2 ring-white">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* STUDENT CREDENTIALS: COLUMN 2 */}
          <div className="space-y-1.5 min-w-0">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">
                Student Name
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight leading-tight truncate">
                {studentName}
              </h3>
            </div>

            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">
                Student ID
              </span>
              <span className="font-mono text-xs font-black text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md inline-block">
                {studentId}
              </span>
            </div>

            {studentClass && (
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">
                  Class / Target
                </span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {studentClass}
                </span>
              </div>
            )}

            {/* Service Badge */}
            <div className="pt-0.5">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-xs ${serviceBadgeConfig.badgeBg}`}>
                {serviceBadgeConfig.icon}
                <span className="truncate">{serviceBadgeConfig.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ROW 2: SERVICE DETAILS (TUITION / LIBRARY DETAILS) */}
        {(libraryName || teacherName || seatNumber || shift) && (
          <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200/90 text-xs space-y-1">
            {libraryName && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500">Library:</span>
                <span className="font-bold text-slate-900 truncate max-w-[220px]">{libraryName}</span>
              </div>
            )}
            {seatNumber && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500">Allocated Desk:</span>
                <span className="font-mono font-black text-brand-700">{seatNumber} ({shift || 'Full Day'})</span>
              </div>
            )}
            {teacherName && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500">Home Tutor:</span>
                <span className="font-bold text-slate-900 truncate max-w-[220px]">{teacherName} {subject ? `(${subject})` : ''}</span>
              </div>
            )}
          </div>
        )}

        {/* ROW 3: DEDICATED STRUCTURED ADDRESS BLOCK (SECTION #37) */}
        {/* Strictly separated from the photo grid to guarantee ZERO OVERLAP */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100">
            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span>Registered Learner Address</span>
          </div>
          
          <div className="text-[11px] leading-snug space-y-1">
            <p className="text-slate-800 font-medium line-clamp-2">
              <strong className="text-slate-900">Address:</strong> {cleanAddress}
            </p>
            <div className="grid grid-cols-3 gap-1 pt-0.5 text-[10px] font-semibold text-slate-600">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">District</span>
                <span className="text-slate-900 font-bold truncate block">{district}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">State</span>
                <span className="text-slate-900 font-bold truncate block">{state}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">PIN</span>
                <span className="font-mono text-slate-900 font-black block">{pincode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 4: VALIDITY, SECURITY QR CODE & AUTHORIZED SEAL */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 flex items-center justify-between gap-2">
          {/* Validity & Telemetry */}
          <div className="space-y-0.5 text-[10px]">
            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Valid Until:</span>
              <strong className="text-slate-900 font-mono font-bold">{validUntil}</strong>
            </div>
            <div className="text-[9px] text-slate-400">
              Issued: <strong className="text-slate-600">{issueDate}</strong>
            </div>
            <div className="text-[8px] font-mono text-emerald-700 font-bold uppercase pt-0.5">
              ✓ SOVEREIGN ID VERIFIED
            </div>
          </div>

          {/* Secure QR Verification */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="p-1 rounded-lg bg-white border border-slate-300 text-slate-950 shadow-xs flex items-center justify-center">
              <QrCode className="w-11 h-11" />
            </div>
            <div className="text-[8px] text-slate-400 leading-tight">
              <span className="font-black text-slate-800 uppercase block">SCAN TO VERIFY</span>
              <span>ZYZU'S Ledger</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER BAR */}
      <div className="bg-slate-900 px-4 py-2 text-white flex items-center justify-between text-[9px] shrink-0 border-t border-slate-800">
        <span className="text-slate-300">Non-transferable official platform credential</span>
        <span className="font-black text-amber-400 uppercase tracking-wider">ZYZUS.COM</span>
      </div>
    </div>
  );
};
