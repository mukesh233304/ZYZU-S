import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  MapPin,
  CheckCircle2,
  CalendarCheck,
  Calendar,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { TeacherAssignment, AttendanceRecord } from '../../../types';

interface TodayTeachingSnapshotProps {
  assignments: TeacherAssignment[];
  recentAttendance: AttendanceRecord[];
  onLogAttendance: (studentId: string) => void;
}

export const TodayTeachingSnapshot: React.FC<TodayTeachingSnapshotProps> = ({
  assignments,
  recentAttendance,
  onLogAttendance
}) => {
  const activeAssignments = assignments.filter(a => a.status === 'active');
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Card className="p-6 border border-slate-200/80 bg-white shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-royal-blue-600" />
            <span>Today's Teaching Schedule</span>
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Assigned home tuition slots and verified guardian attendance dispatch
          </p>
        </div>

        <Link
          to="/teacher/schedule"
          className="text-xs font-bold text-royal-blue-600 hover:text-royal-blue-700 flex items-center gap-1"
        >
          <span>Full Schedule</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {activeAssignments.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No Teaching Sessions Scheduled Today</h4>
          <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 font-medium">
            Your daily teaching sessions will appear here as soon as student home tuition allotments are confirmed by the District Desk.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeAssignments.map((a, idx) => {
            // Check if attendance already marked today for this student
            const markedToday = recentAttendance.find(
              att => (att.userId === a.studentId || att.userName === a.studentName) && att.date === todayStr
            );

            // Determine status
            const statusLabel = markedToday
              ? 'Completed'
              : idx === 0
              ? 'Upcoming'
              : 'Attendance Pending';

            const statusClass = markedToday
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : idx === 0
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-amber-50 text-amber-700 border-amber-200';

            return (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-royal-blue-100 text-royal-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {a.studentName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{a.studentName}</h4>
                      <p className="text-[11px] text-slate-600 font-semibold">
                        {a.grade || 'Standard Batch'}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${statusClass} ml-1`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 pt-0.5">
                    <span className="flex items-center gap-1 font-semibold text-royal-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      <BookOpen className="w-3.5 h-3.5 text-royal-blue-500" />
                      {a.subjects.join(', ')}
                    </span>
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {a.schedule || '1.5 hrs session'}
                    </span>
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {a.address || 'Locality Assigned'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  {markedToday ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 w-full sm:w-auto justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Logged ({markedToday.time || 'Today'})</span>
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onLogAttendance(a.studentId)}
                      className="w-full sm:w-auto text-xs font-bold text-royal-blue-700 border-royal-blue-200 hover:bg-royal-blue-50 cursor-pointer"
                      icon={<CheckCircle2 className="w-3.5 h-3.5 text-royal-blue-600" />}
                    >
                      Log Attendance
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
