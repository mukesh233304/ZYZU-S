import React from 'react';
import { CheckCircle2, Clock, Check, UserCheck, AlertCircle } from 'lucide-react';
import { TutorRequestStatus } from '../../types';

interface StatusTimelineProps {
  currentStatus: TutorRequestStatus;
  submittedDate: string;
  allotmentDate?: string;
  assignedTeacherName?: string;
  allotmentNotes?: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  submittedDate,
  allotmentDate,
  assignedTeacherName,
  allotmentNotes,
}) => {
  const steps = [
    {
      id: 'SUBMITTED',
      label: 'Request Submitted',
      desc: `Submitted on ${new Date(submittedDate).toLocaleDateString()}`,
      icon: Clock,
    },
    {
      id: 'UNDER_REVIEW',
      label: 'Under District Admin Review',
      desc: 'District Admin verifies academic syllabus and locality coverage',
      icon: UserCheck,
    },
    {
      id: 'TEACHER_ALLOTTED',
      label: 'Teacher Allotted',
      desc: assignedTeacherName ? `Allotted to ${assignedTeacherName}` : 'Matching verified district teacher',
      subDesc: allotmentNotes,
      icon: CheckCircle2,
    },
    {
      id: 'ACTIVE',
      label: 'Classes Ongoing',
      desc: 'Tutor conducting regular 1-on-1 sessions',
      icon: Check,
    },
    {
      id: 'COMPLETED',
      label: 'Completed / Finalized',
      desc: 'Academic term curriculum completed',
      icon: Check,
    }
  ];

  const statusOrder: Record<TutorRequestStatus, number> = {
    SUBMITTED: 0,
    UNDER_REVIEW: 1,
    TEACHER_ALLOTTED: 2,
    ACTIVE: 3,
    COMPLETED: 4,
    CANCELLED: -1,
    submitted: 0,
    reviewing: 1,
    teacher_assigned: 2,
    demo_scheduled: 2,
    active: 3,
    completed: 4,
    cancelled: -1,
  };

  const currentIndex = statusOrder[currentStatus] ?? 0;

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Request Cancelled</p>
          <p className="text-xs text-rose-300">This tutor request was cancelled by user or district administration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-2.5 before:w-0.5 before:bg-slate-700">
      {steps.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.id} className="relative group">
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all ${
                isDone
                  ? 'bg-emerald-500 text-white'
                  : isCurrent
                  ? 'bg-brand-500 text-white ring-4 ring-brand-500/20'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              <Icon className="w-3 h-3" />
            </div>

            <div className="ml-3">
              <h4
                className={`text-sm font-semibold tracking-tight ${
                  isCurrent ? 'text-brand-400' : isDone ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                {step.label}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
              {step.subDesc && isDone && (
                <p className="text-xs text-emerald-400 mt-1 italic bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                  {step.subDesc}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
