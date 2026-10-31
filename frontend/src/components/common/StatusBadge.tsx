import React from 'react';

export type BadgeType = 
  | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
  | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'FAILED' | 'REFUNDED'
  | 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'
  | 'SUBMITTED' | 'UNDER_REVIEW' | 'TEACHER_ALLOTTED'
  | string;

export interface StatusBadgeProps {
  status: BadgeType;
  size?: 'sm' | 'md';
  text?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', text }) => {
  const normalized = (status || '').toUpperCase().replace(/\s+/g, '_');

  const configs: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    // Approvals
    PENDING: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pending' },
    APPROVED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Approved' },
    VERIFIED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Verified' },
    REJECTED: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Rejected' },
    SUSPENDED: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-600', dot: 'bg-slate-400', label: 'Suspended' },

    // Bookings & Requests
    CONFIRMED: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Confirmed' },
    ACTIVE: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
    COMPLETED: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400', label: 'Completed' },
    CANCELLED: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Cancelled' },
    EXPIRED: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-500', dot: 'bg-slate-400', label: 'Expired' },
    SUBMITTED: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500', label: 'Submitted' },
    REVIEWING: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500', label: 'Reviewing' },
    UNDER_REVIEW: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500', label: 'Under Review' },
    TEACHER_ASSIGNED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Teacher Assigned' },
    TEACHER_ALLOTTED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Teacher Allotted' },
    DEMO_SCHEDULED: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Demo Scheduled' },

    // Payments
    PAID: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Paid' },
    PARTIAL: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Partial' },
    OVERDUE: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Overdue' },
    FAILED: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Failed' },
    REFUNDED: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500', label: 'Refunded' },

    // Attendance
    PRESENT: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Present' },
    CHECKED_IN: { bg: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-800 font-bold', dot: 'bg-emerald-500 animate-pulse', label: 'Checked In' },
    CHECKED_OUT: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-800 font-bold', dot: 'bg-indigo-500', label: 'Checked Out' },
    NOT_STARTED: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400', label: 'Not Checked In' },
    INCOMPLETE: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500', label: 'Incomplete' },
    ABSENT: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Absent' },
    LATE: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Late' },
    LEAVE: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500', label: 'Leave' },
    OPEN: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Open' },
    RESOLVED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Resolved' },
  };

  const config = configs[normalized] || {
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
    label: text || status,
  };

  const displayLabel = text || config.label;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {displayLabel}
    </span>
  );
};
