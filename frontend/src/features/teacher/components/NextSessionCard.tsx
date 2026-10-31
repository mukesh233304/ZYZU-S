import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  BookOpen,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { TeacherAssignment } from '../../../types';

interface NextSessionCardProps {
  assignments: TeacherAssignment[];
  onQuickLog?: (studentId: string) => void;
  onMarkAttendance?: (studentId: string) => void;
}

export const NextSessionCard: React.FC<NextSessionCardProps> = ({
  assignments,
  onQuickLog,
  onMarkAttendance
}) => {
  const handleMarkAttendance = onQuickLog || onMarkAttendance || (() => {});
  // Find the next scheduled session based on active assignments
  const nextSession = useMemo(() => {
    if (!assignments || assignments.length === 0) return null;
    const active = assignments.filter(a => a.status === 'active');
    if (active.length === 0) return null;
    // Select first active assignment for demonstration of authoritative schedule slot
    return active[0];
  }, [assignments]);

  if (!nextSession) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No Upcoming Sessions Right Now</h3>
            <p className="text-xs text-slate-600 font-medium">
              When new student tuition requests are accepted and allotted to your schedule, your next class countdown will appear here.
            </p>
          </div>
        </div>
        <Link to="/teacher/schedule">
          <Button variant="outline" size="sm" className="text-xs shrink-0 font-bold">
            View Schedule
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-royal-blue-900 via-deep-navy-900 to-indigo-950 text-white p-6 shadow-md border border-royal-blue-700/50">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-royal-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-vibrant-orange-500/20 text-amber-300 border border-vibrant-orange-400/40">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Next Scheduled Session
            </span>
            <span className="text-xs text-royal-blue-100 font-mono font-semibold">
              Today's Batch
            </span>
          </div>

          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-lg text-white shrink-0">
              {nextSession.studentName.charAt(0)}
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{nextSession.studentName}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/20 text-white">
                  {nextSession.grade || 'Standard Batch'}
                </span>
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-100 font-medium mt-1">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  {nextSession.subjects.join(', ')}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  {nextSession.schedule || '05:00 PM – 06:30 PM (1.5 hrs)'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  ₹{nextSession.monthlyFee?.toLocaleString()}/mo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkAttendance(nextSession.studentId)}
            className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold cursor-pointer backdrop-blur-xs"
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          >
            Mark Attendance
          </Button>

          <Link to="/teacher/students" className="flex-1 md:flex-none">
            <Button
              variant="primary"
              size="sm"
              className="w-full bg-vibrant-orange-500 hover:bg-vibrant-orange-600 border-none text-white text-xs font-bold shadow-md shadow-vibrant-orange-500/30 cursor-pointer"
            >
              <span>View Session</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
