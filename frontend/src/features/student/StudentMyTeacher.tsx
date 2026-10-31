import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Calendar, Clock, MapPin, Award, 
  ShieldCheck, Phone, Mail, FileText, CheckCircle2, MessageSquare,
  ArrowRight, BookOpen, UserCheck
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState, LoadingSkeleton } from '../../components/common/FeedbackStates';
import { RatingStars } from '../../components/common/RatingStars';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { Teacher, TutorRequest } from '../../types';

export const StudentMyTeacher: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id || 'usr-student-fresh';

  const [data, setData] = useState<{ teacher: Teacher | undefined; request: TutorRequest } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await studentService.getAssignedTeacher(studentId);
        setData(res || null);
      } catch (e) {
        console.error('Failed to load assigned teacher', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Allotted Home Tutor" />
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Allotted Home Tutor"
        description="View credentials, schedule, and verified subject expertise of the educator assigned to you by District Administration."
        breadcrumbs={[
          { label: 'Student Portal', path: '/student/dashboard' },
          { label: 'My Tutor' },
        ]}
      />

      {!data || !data.teacher ? (
        <EmptyState
          title="No Home Tutor Allotted Yet"
          description="You currently do not have an active home tutor assigned. Submit a request or wait for Ghazipur District Administration to finish matching your requested subject and syllabus."
          actionText="Request a Home Tutor"
          onAction={() => window.location.href = '/student/tutor-request'}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Teacher Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <img
                    src={data.teacher.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={data.teacher.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-brand-100 shadow-xs shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-950 tracking-tight">{data.teacher.name}</h2>
                      <span className="p-1 rounded-full bg-emerald-50 text-emerald-600" title="Govt & KYC Verified">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    </div>
                    <p className="text-xs text-brand-700 font-extrabold mt-0.5">
                      {data.teacher.degree || data.teacher.qualification || 'Post Graduate Educator'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {data.teacher.university || 'Affiliated State University'} {data.teacher.passingYear ? `(Class of ${data.teacher.passingYear})` : ''}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <RatingStars rating={data.teacher.rating || 5} reviewsCount={data.teacher.reviewsCount || 12} size="sm" />
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        KYC Verified
                      </span>
                    </div>
                  </div>
                </div>

                <StatusBadge status="ACTIVE" size="sm" />
              </div>

              {/* Allotment Particulars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Assigned Subject(s)</span>
                  <p className="font-extrabold text-brand-700 text-sm mt-0.5">{data.request.subjects.join(', ')}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Class & Board</span>
                  <p className="font-bold text-slate-900 mt-0.5">{data.request.className || 'Academic'} ({data.request.board || 'CBSE / UP Board'})</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Session Timetable</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {(data.request.preferredDays || ['Mon', 'Wed', 'Fri']).join(', ')} at {data.request.preferredTime || '05:00 PM'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Approved Monthly Fee</span>
                  <p className="font-black text-slate-950 text-sm mt-0.5">₹{data.request.budgetMin || 3500} / month</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Allotment Date</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {data.request.allotmentDate ? new Date(data.request.allotmentDate).toLocaleDateString() : 'Active Term'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">District Jurisdiction</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {data.request.districtName || 'Ghazipur'} (Saidpur Education Block)
                  </p>
                </div>
              </div>

              {/* District Admin Note */}
              {data.request.allotmentNotes && (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <p className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>District Administrator Quality Endorsement:</span>
                  </p>
                  <p className="text-emerald-950 leading-relaxed font-medium">{data.request.allotmentNotes}</p>
                </div>
              )}
            </Card>

            {/* Educator Background & Pedagogy */}
            {data.teacher.bio && (
              <Card className="p-6 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-3">
                <h3 className="font-extrabold text-sm text-slate-950">Teaching Pedagogy & Profile</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{data.teacher.bio}</p>
              </Card>
            )}
          </div>

          {/* Right Col: Quick Actions & Support */}
          <div className="space-y-6">
            <Card className="p-6 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-4">
              <h3 className="font-extrabold text-sm text-slate-950">Class Quick Actions</h3>
              <div className="space-y-2.5">
                <Link to="/student/attendance" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start text-slate-700 border-slate-300 hover:bg-slate-50" leftIcon={<Calendar className="w-4 h-4 text-brand-600" />}>
                    View Session Attendance Log
                  </Button>
                </Link>
                <Link to="/student/fees" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start text-slate-700 border-slate-300 hover:bg-slate-50" leftIcon={<FileText className="w-4 h-4 text-emerald-600" />}>
                    Pay Monthly Tuition Fee
                  </Button>
                </Link>
                <Link to="/student/support" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start text-slate-700 border-slate-300 hover:bg-slate-50" leftIcon={<MessageSquare className="w-4 h-4 text-sky-600" />}>
                    Request Schedule Change
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-5 bg-brand-50/50 border border-brand-200/80 rounded-2xl text-xs space-y-2">
              <h4 className="font-bold text-brand-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>ZYZU'S Academic Guarantee</span>
              </h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Every session is tracked via digital attendance. If you ever need a teacher substitution or syllabus realignment, the Ghazipur District Education Desk is ready to assist.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
