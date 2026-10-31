import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Award,
  ArrowRight
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Teacher } from '../../../types';

interface TeacherProfileCompletenessWidgetProps {
  teacher: Teacher | null;
  onOpenVerificationModal?: () => void;
}

export const TeacherProfileCompletenessWidget: React.FC<TeacherProfileCompletenessWidgetProps> = ({
  teacher,
  onOpenVerificationModal
}) => {
  // Compute true profile completion percentage based on actual fields
  const { percentage, missingItems, steps } = useMemo(() => {
    if (!teacher) {
      return { percentage: 0, missingItems: ['Teacher profile loading...'], steps: [] };
    }

    const items: { label: string; done: boolean; link: string }[] = [
      { label: 'Basic Info & Contact Details', done: !!(teacher.name && teacher.email && teacher.mobile), link: '/teacher/profile' },
      { label: 'Profile Photo Upload', done: !!teacher.avatarUrl, link: '/teacher/profile' },
      { label: 'Teaching Subjects & Classes', done: !!(teacher.subjects && teacher.subjects.length > 0), link: '/teacher/profile' },
      { label: 'Service Areas & Locality', done: !!(teacher.areasServed || teacher.area), link: '/teacher/profile' },
      { label: 'Government ID Proof', done: !!teacher.documentsUploaded?.idProof, link: '/teacher/verification' },
      { label: 'Degree / Academic Transcript', done: !!(teacher.documentsUploaded?.degreeCertificate || (teacher.documentsUploaded as any)?.degree), link: '/teacher/verification' },
      { label: 'Direct Bank Account Setup', done: !!(teacher.bankAccount?.accountNumber), link: '/teacher/revenue' }
    ];

    const completedCount = items.filter(i => i.done).length;
    const computedPercent = Math.round((completedCount / items.length) * 100);
    const missing = items.filter(i => !i.done).map(i => i.label);

    const isVerified = teacher.verificationStatus === 'APPROVED' || (teacher.verificationStatus as any) === 'verified';
    const hasId = !!teacher.documentsUploaded?.idProof;
    const hasDegree = !!(teacher.documentsUploaded?.degreeCertificate || (teacher.documentsUploaded as any)?.degree);
    const hasExp = !!(teacher.documentsUploaded?.experienceLetter || (teacher.documentsUploaded as any)?.experience || (teacher.experienceYears && teacher.experienceYears > 0));

    const verificationSteps = [
      { name: 'Profile Setup', status: computedPercent >= 60 ? 'COMPLETE' : 'IN_PROGRESS', link: '/teacher/profile' },
      { name: 'Identity Proof', status: hasId ? 'COMPLETE' : 'PENDING', link: '/teacher/verification' },
      { name: 'Qualification', status: hasDegree ? 'COMPLETE' : 'PENDING', link: '/teacher/verification' },
      { name: 'Experience', status: hasExp ? 'COMPLETE' : 'OPTIONAL', link: '/teacher/verification' },
      { name: 'Final Verification', status: isVerified ? 'COMPLETE' : 'UNDER_REVIEW', link: '/teacher/verification' }
    ];

    return {
      percentage: computedPercent,
      missingItems: missing,
      steps: verificationSteps
    };
  }, [teacher]);

  return (
    <Card className="p-6 border border-slate-200/80 bg-white shadow-2xs space-y-5">
      {/* Header & Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-royal-blue-600" />
            <span>Profile Completeness</span>
          </h2>
          <span className="text-xs font-black text-royal-blue-700 bg-royal-blue-50 px-2 py-0.5 rounded-full border border-royal-blue-200">
            {percentage}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage === 100
                ? 'bg-emerald-500'
                : percentage >= 70
                ? 'bg-royal-blue-600'
                : 'bg-amber-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {missingItems.length > 0 && (
          <div className="mt-3 text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wide">
              Pending Items to Complete:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-xs font-medium">
              {missingItems.slice(0, 2).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Verification Progress Stepper (Section 30) */}
      <div className="pt-3 border-t border-slate-100">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-3">
          District Accreditation Stepper
        </span>

        <div className="space-y-2">
          {steps.map((st, idx) => {
            const isDone = st.status === 'COMPLETE';
            const isReview = st.status === 'UNDER_REVIEW';

            return (
              <Link
                key={idx}
                to={st.link}
                className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : isReview
                        ? 'bg-blue-100 text-blue-700 animate-pulse'
                        : 'bg-slate-200 text-slate-600 font-bold'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : isReview ? (
                      <Clock className="w-3 h-3" />
                    ) : (
                      <span className="text-[10px] font-bold">{idx + 1}</span>
                    )}
                  </span>
                  <span
                    className={`font-semibold ${
                      isDone
                        ? 'text-slate-900'
                        : isReview
                        ? 'text-royal-blue-700 font-bold'
                        : 'text-slate-700'
                    }`}
                  >
                    {st.name}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      isDone
                        ? 'text-emerald-700 bg-emerald-50'
                        : isReview
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-slate-700 bg-slate-100 font-bold'
                    }`}
                  >
                    {isDone ? 'Done' : isReview ? 'In Review' : 'Pending'}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="pt-2">
        <Link to="/teacher/profile" className="block">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-bold text-royal-blue-700 border-royal-blue-200 hover:bg-royal-blue-50 justify-center"
          >
            <span>Complete Educator Profile</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};
