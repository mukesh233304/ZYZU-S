import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  CalendarCheck,
  DollarSign,
  FileText,
  UserCheck,
  HelpCircle,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { Card } from '../../../components/common/Card';

interface TeacherQuickActionsProps {
  onQuickLogAttendance?: () => void;
  onMarkAttendanceClick?: () => void;
}

export const TeacherQuickActions: React.FC<TeacherQuickActionsProps> = ({
  onQuickLogAttendance,
  onMarkAttendanceClick
}) => {
  const handleMarkAttendance = onQuickLogAttendance || onMarkAttendanceClick || (() => {});
  const actions = [
    {
      label: 'View Students',
      description: 'Active assignments & batches',
      icon: <Users className="w-5 h-5 text-royal-blue-600" />,
      to: '/teacher/students',
      bgHover: 'group-hover:bg-royal-blue-50',
      borderHover: 'hover:border-royal-blue-300'
    },
    {
      label: 'View Schedule',
      description: 'Weekly tuition calendar',
      icon: <Calendar className="w-5 h-5 text-indigo-600" />,
      to: '/teacher/schedule',
      bgHover: 'group-hover:bg-indigo-50',
      borderHover: 'hover:border-indigo-300'
    },
    {
      label: 'Mark Attendance',
      description: 'Log session & notify parents',
      icon: <CalendarCheck className="w-5 h-5 text-emerald-600" />,
      onClick: handleMarkAttendance,
      bgHover: 'group-hover:bg-emerald-50',
      borderHover: 'hover:border-emerald-300',
      highlight: true
    },
    {
      label: 'Revenue & Payout',
      description: 'Earnings, slips & settlements',
      icon: <DollarSign className="w-5 h-5 text-amber-600" />,
      to: '/teacher/revenue',
      bgHover: 'group-hover:bg-amber-50',
      borderHover: 'hover:border-amber-300'
    },
    {
      label: 'My Documents',
      description: 'ID card, certificate & receipts',
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      to: '/teacher/documents',
      bgHover: 'group-hover:bg-blue-50',
      borderHover: 'hover:border-blue-300'
    },
    {
      label: 'Update Profile',
      description: 'Bio, subjects, slots & fee',
      icon: <UserCheck className="w-5 h-5 text-purple-600" />,
      to: '/teacher/profile',
      bgHover: 'group-hover:bg-purple-50',
      borderHover: 'hover:border-purple-300'
    },
    {
      label: 'Help & Support',
      description: 'District admin desk tickets',
      icon: <HelpCircle className="w-5 h-5 text-slate-600" />,
      to: '/teacher/support',
      bgHover: 'group-hover:bg-slate-100',
      borderHover: 'hover:border-slate-300'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <span>Quick Actions</span>
        </h2>
        <span className="text-xs text-slate-600 font-bold hidden sm:inline">
          Frequent educator workflows
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {actions.map((act, index) => {
          const content = (
            <div
              className={`group relative h-full p-4 rounded-2xl bg-white border border-slate-200/80 ${act.borderHover} shadow-2xs hover:shadow-md transition-all flex flex-col justify-between text-left cursor-pointer focus-within:ring-2 focus-within:ring-royal-blue-500`}
            >
              {act.highlight && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              )}
              <div className="space-y-2.5">
                <div
                  className={`w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-colors ${act.bgHover}`}
                >
                  {act.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-royal-blue-600 transition-colors line-clamp-1">
                    {act.label}
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium line-clamp-1 mt-0.5">
                    {act.description}
                  </p>
                </div>
              </div>
            </div>
          );

          if (act.onClick) {
            return (
              <button
                key={index}
                type="button"
                onClick={act.onClick}
                className="w-full text-left focus:outline-none"
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={index} to={act.to!} className="focus:outline-none">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
