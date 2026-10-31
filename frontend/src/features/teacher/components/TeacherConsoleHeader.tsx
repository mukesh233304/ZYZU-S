import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertCircle,
  FileCheck2,
  Calendar,
  Award,
  ChevronRight,
  MapPin,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Teacher } from '../../../types';
import { Button } from '../../../components/common/Button';

interface TeacherConsoleHeaderProps {
  teacher: Teacher | null;
  onOpenVerificationModal?: () => void;
  onOpenVerification?: () => void;
  onOpenCertificateModal?: () => void;
  onOpenCertificate?: () => void;
  certificateEligible?: boolean;
}

export const TeacherConsoleHeader: React.FC<TeacherConsoleHeaderProps> = ({
  teacher,
  onOpenVerificationModal,
  onOpenVerification,
  onOpenCertificateModal,
  onOpenCertificate,
  certificateEligible
}) => {
  const handleOpenVerification = onOpenVerificationModal || onOpenVerification || (() => {});
  const handleOpenCertificate = onOpenCertificateModal || onOpenCertificate || (() => {});
  const currentHour = new Date().getHours();
  const greeting = useMemo(() => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, [currentHour]);

  const firstName = useMemo(() => {
    if (!teacher?.name) return 'Educator';
    return teacher.name.split(' ')[0] || teacher.name;
  }, [teacher?.name]);

  const teacherIdFormatted = useMemo(() => {
    if (!teacher?.id) return 'FP-TCH-00412';
    const cleanNum = teacher.id.replace(/\D/g, '');
    return `FP-TCH-${cleanNum.padStart(5, '0') || '00412'}`;
  }, [teacher?.id]);

  const status = (teacher?.verificationStatus || 'PENDING').toUpperCase();
  const isVerified = status === 'APPROVED' || status === 'VERIFIED';
  const isUnderReview = status === 'PENDING' || status === 'UNDER_REVIEW';
  const isDocsRequired = status === 'DOCUMENTS_REQUIRED' || status === 'INCOMPLETE';
  const isRejected = status === 'REJECTED';
  const isSuspended = status === 'SUSPENDED';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-deep-navy-950 to-blue-950 text-white p-6 sm:p-8 shadow-xl border border-white/10">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-vibrant-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Avatar & Identity Details */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-5">
          <div className="relative shrink-0">
            {teacher?.avatarUrl ? (
              <img
                src={teacher.avatarUrl}
                alt={teacher.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-white/20 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-royal-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg ring-2 ring-white/20">
                {firstName.charAt(0)}
              </div>
            )}

            {/* Micro Status Indicator Badge on Avatar */}
            <span
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-slate-900 shadow-md ${
                isVerified
                  ? 'bg-emerald-500'
                  : isRejected
                  ? 'bg-rose-500'
                  : isDocsRequired
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }`}
              title={`Verification: ${status}`}
            >
              {isVerified ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : isRejected ? (
                <ShieldAlert className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs sm:text-sm font-semibold text-royal-blue-200">
                {greeting},
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-white/10 text-royal-blue-100 border border-white/10">
                {teacherIdFormatted}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-200">
                <MapPin className="w-3 h-3 text-vibrant-orange-400" />
                {teacher?.districtName || teacher?.district || 'Ghazipur'} Desk
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{teacher?.name || 'Educator'}</span>
            </h1>

            {/* Clickable Verification Status Banner / Pill */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={handleOpenVerification}
                className={`group inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                  isVerified
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                    : isRejected
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400/40 hover:bg-rose-500/30'
                    : isDocsRequired
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
                    : isSuspended
                    ? 'bg-slate-500/20 text-slate-200 border-slate-400/40 hover:bg-slate-500/30'
                    : 'bg-blue-500/20 text-blue-300 border-blue-400/40 hover:bg-blue-500/30'
                }`}
                title="Click to view full credential and background verification details"
              >
                {isVerified ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>✓ VERIFIED — Profile verified by ZYZU'S</span>
                  </>
                ) : isUnderReview ? (
                  <>
                    <Clock className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
                    <span>UNDER REVIEW — District desk vetting in progress</span>
                  </>
                ) : isDocsRequired ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>DOCUMENTS REQUIRED — Complete KYC upload</span>
                  </>
                ) : isRejected ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>REJECTED — Update credentials for re-verification</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-slate-300 shrink-0" />
                    <span>STATUS: {status}</span>
                  </>
                )}
                <ChevronRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Command Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
          {/* Certificate Quick Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenCertificate}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold cursor-pointer backdrop-blur-xs shadow-xs"
            icon={<Award className="w-4 h-4 text-amber-400" />}
          >
            {isVerified ? 'Verification Certificate' : 'Certificate Status'}
          </Button>

          <Link to="/teacher/schedule">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold cursor-pointer backdrop-blur-xs shadow-xs"
              icon={<Calendar className="w-4 h-4 text-royal-blue-300" />}
            >
              Weekly Schedule
            </Button>
          </Link>

          <Link to="/teacher/revenue">
            <Button
              variant="primary"
              size="sm"
              className="bg-vibrant-orange-500 hover:bg-vibrant-orange-600 border-none text-white text-xs font-bold shadow-lg shadow-vibrant-orange-500/25 cursor-pointer"
            >
              Revenue & Payout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
