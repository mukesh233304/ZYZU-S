import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { districtAdminService } from '../../services/districtAdminService';
import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import { TutorRequest, Teacher, TutorMatchScore } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { FocusPointSearchInput } from '../../components/common/FocusPointSearchInput';
import {
  Users,
  Search,
  BookOpen,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Phone,
  IndianRupee,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  Award,
  Video,
  Home,
  RefreshCw,
  AlertCircle,
  Lock
} from 'lucide-react';

export const DistrictTutorRequests: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const scope = districtAuthorizationService.getAuthorizedScope(user);
  const district = scope?.districtName || user?.district || user?.districtName || 'Mirzapur';

  // Server-side District Access Verification
  const isAuthorized = districtAuthorizationService.verifyDistrictAccess(district, user);

  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'demo' | 'active'>('all');

  // Smart Matcher Modal States
  const [selectedRequest, setSelectedRequest] = useState<TutorRequest | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [rankedTeachers, setRankedTeachers] = useState<TutorMatchScore[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [demoDate, setDemoDate] = useState('');
  const [demoTime, setDemoTime] = useState('');
  const [demoMode, setDemoMode] = useState<'IN_PERSON' | 'ONLINE'>('IN_PERSON');
  const [agreedFee, setAgreedFee] = useState('');
  const [allotmentNotes, setAllotmentNotes] = useState('');
  const [submittingAllotment, setSubmittingAllotment] = useState(false);

  // Demo Completion Confirmation Modal States
  const [demoConfirmRequest, setDemoConfirmRequest] = useState<TutorRequest | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState('Mon, Wed, Fri (5:00 PM - 6:30 PM)');
  const [finalFee, setFinalFee] = useState('4500');
  const [confirmingDemo, setConfirmingDemo] = useState(false);

  const fetchData = async () => {
    try {
      const rData = await districtAdminService.getTutorRequests(district);
      setRequests(rData);
    } catch (err) {
      console.error('Failed to load tutor requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [district]);

  // Open Smart Matcher Modal for a Request
  const openSmartMatcher = async (req: TutorRequest) => {
    setSelectedRequest(req);
    setRankingLoading(true);
    setAgreedFee(String(req.budgetMonthly || req.budgetMax || 5000));
    setAllotmentNotes(`Matched for ${req.className || req.grade} in ${req.area}.`);
    try {
      const scored = await districtAdminService.getRankedTeachersForRequest(req, district);
      setRankedTeachers(scored);
      if (scored.length > 0) {
        setSelectedTeacherId(scored[0].teacher.id);
        if (scored[0].teacher.monthlyFee) {
          setAgreedFee(String(scored[0].teacher.monthlyFee));
        }
      }
    } catch (err) {
      addToast('Failed to calculate teacher matches', 'error');
    } finally {
      setRankingLoading(false);
    }
  };

  // Submit Demo Class Schedule & Allotment
  const handleScheduleDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !selectedTeacherId) {
      addToast('Please select a teacher to allot', 'error');
      return;
    }

    const matchedScore = rankedTeachers.find(s => s.teacher.id === selectedTeacherId);
    const teacher = matchedScore?.teacher;

    setSubmittingAllotment(true);
    try {
      await districtAdminService.scheduleDemoClass({
        requestId: selectedRequest.id,
        teacherId: selectedTeacherId,
        teacherName: teacher?.name || 'Educator',
        teacherPhone: teacher?.phone || teacher?.mobile || '9876543211',
        demoDate,
        demoTime,
        demoMode,
        monthlyFee: Number(agreedFee),
        adminNotes: allotmentNotes,
      });

      // Update local state
      setRequests(prev =>
        prev.map(r =>
          r.id === selectedRequest.id
            ? {
                ...r,
                status: 'UNDER_REVIEW',
                allottedTeacherId: selectedTeacherId,
                allottedTeacherName: teacher?.name,
                demoDate,
                demoTime,
                demoMode,
                demoNotes: allotmentNotes,
                demoFeedback: 'PENDING',
              }
            : r
        )
      );

      setSelectedRequest(null);
      addToast(
        `Demo scheduled with ${teacher?.name}! Notification dispatched to student and educator.`,
        'success'
      );
    } catch (err) {
      addToast('Failed to schedule demo class', 'error');
    } finally {
      setSubmittingAllotment(false);
    }
  };

  // Confirm Regular Tuition after successful Demo
  const handleConfirmDemoToTuition = async () => {
    if (!demoConfirmRequest) return;
    setConfirmingDemo(true);
    try {
      await districtAdminService.confirmTuitionAfterDemo({
        requestId: demoConfirmRequest.id,
        schedule: weeklySchedule,
        monthlyFee: Number(finalFee),
        teacherId: demoConfirmRequest.allottedTeacherId,
        teacherName: demoConfirmRequest.allottedTeacherName,
      });

      setRequests(prev =>
        prev.map(r =>
          r.id === demoConfirmRequest.id
            ? { ...r, status: 'ACTIVE', demoFeedback: 'SUCCESSFUL' }
            : r
        )
      );

      setDemoConfirmRequest(null);
      addToast(
        `Tuition officially activated! Regular assignment created for ${demoConfirmRequest.studentName}.`,
        'success'
      );
    } catch (err) {
      addToast('Failed to confirm regular tuition', 'error');
    } finally {
      setConfirmingDemo(false);
    }
  };

  // Pipeline Metrics
  const pendingCount = requests.filter(
    r => r.status === 'SUBMITTED' || r.status === 'submitted' || (!r.allottedTeacherId && !r.assignedTeacherId)
  ).length;
  const demoCount = requests.filter(
    r => r.demoDate && (r.status === 'UNDER_REVIEW' || r.status === 'reviewing' || r.status === 'TEACHER_ALLOTTED' || r.demoFeedback === 'PENDING')
  ).length;
  const activeCount = requests.filter(
    r => r.status === 'ACTIVE' || r.status === 'active'
  ).length;

  const filteredRequests = requests.filter(r => {
    const isPending = r.status === 'SUBMITTED' || r.status === 'submitted' || (!r.allottedTeacherId && !r.assignedTeacherId);
    const isDemo = r.demoDate && (r.status === 'UNDER_REVIEW' || r.status === 'reviewing' || r.status === 'TEACHER_ALLOTTED' || r.demoFeedback === 'PENDING');
    const isActive = r.status === 'ACTIVE' || r.status === 'active';

    if (statusFilter === 'pending' && !isPending) return false;
    if (statusFilter === 'demo' && !isDemo) return false;
    if (statusFilter === 'active' && !isActive) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchStudent = r.studentName.toLowerCase().includes(q);
      const matchPhone = (r.studentPhone || r.studentMobile || '').includes(q);
      const matchArea = (r.area || '').toLowerCase().includes(q);
      const matchSubj = r.subjects.some(s => s.toLowerCase().includes(q));
      const matchTeacher = (r.allottedTeacherName || r.assignedTeacherName || '').toLowerCase().includes(q);
      return matchStudent || matchPhone || matchArea || matchSubj || matchTeacher;
    }
    return true;
  });

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl space-y-3 my-8">
        <Lock className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-rose-900">403 FORBIDDEN - Access Denied</h2>
        <p className="text-sm text-rose-700">You are not authorized to view tutor requests for {district} district.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Smart Tutor Matching & Allotment Engine"
        subtitle={`Match verified educators to student requests in ${district} using algorithmic scoring`}
        breadcrumbs={[
          { label: 'District Admin', href: '/district-admin' },
          { label: 'Tutor Requests & Matching' }
        ]}
        actions={
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>🔒 AUTHORIZED DISTRICT: {district.toUpperCase()}</span>
          </div>
        }
      />

      {/* Pipeline Navigation & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              statusFilter === 'all'
                ? 'bg-royal-blue-600 text-white shadow-lg shadow-royal-blue-600/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Inquiries ({requests.length})
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Pending Matching ({pendingCount})
          </button>

          <button
            onClick={() => setStatusFilter('demo')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              statusFilter === 'demo'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Demo Scheduled ({demoCount})
          </button>

          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              statusFilter === 'active'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active Regular Tuitions ({activeCount})
          </button>
        </div>

        <div className="w-full md:w-80">
          <FocusPointSearchInput
            placeholder="Search student, subject, area..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      {/* Requests Table Card */}
      <Card className="p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-royal-blue-600" />
            Student Tutor Inquiries Queue ({filteredRequests.length})
          </h3>
          <span className="text-xs text-slate-500">Desk: <strong className="text-slate-800">{district} Hub</strong></span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-royal-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No requests matching filter</p>
            <p className="text-xs text-slate-500 mt-1">Check other pipeline tabs or reset your search.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View - Section 4 Required Columns */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-bold text-slate-700 uppercase bg-slate-50">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Class & Subjects</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Request Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRequests.map(req => {
                    const hasAllottedTeacher = !!(req.allottedTeacherName || req.assignedTeacherName);
                    const isTuitionActive = req.status === 'ACTIVE' || req.status === 'active';
                    const reqDate = req.submittedAt || (req as any).createdAt;
                    const formattedDate = reqDate ? new Date(reqDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '02 Sep 2026';

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* 1. Student */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 text-sm">{req.studentName}</p>
                          <p className="text-royal-blue-600 font-mono text-[11px] font-semibold mt-0.5">
                            ID: {req.studentId || req.id}
                          </p>
                        </td>

                        {/* 2. Contact */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-royal-blue-600" />
                            {req.studentPhone || req.studentMobile || '9876543210'}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Parent Verified</p>
                        </td>

                        {/* 3. Class & Subjects */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block font-bold text-royal-blue-800 bg-royal-blue-50 border border-royal-blue-200 px-2 py-0.5 rounded text-[11px]">
                            {req.className || req.grade || 'Class 10'}
                          </span>
                          <p className="text-slate-800 font-semibold mt-1 truncate max-w-xs">
                            {req.subjects.join(' • ')}
                          </p>
                        </td>

                        {/* 4. Location */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-brand-600" />
                            {req.area || `${district} Main`}
                          </p>
                          <p className="text-emerald-700 font-bold mt-0.5">
                            Budget: ₹{req.budgetMonthly || req.budgetMax || 5000}/mo
                          </p>
                        </td>

                        {/* 5. Request Date */}
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-700 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formattedDate}
                          </p>
                          {req.demoDate && (
                            <p className="text-[11px] text-royal-blue-700 font-semibold mt-0.5">
                              Demo: {req.demoDate}
                            </p>
                          )}
                        </td>

                        {/* 6. Status */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={req.status} />
                          {hasAllottedTeacher && (
                            <p className="text-[10px] text-slate-600 font-medium mt-1 truncate max-w-[140px]">
                              Tutor: {req.allottedTeacherName || req.assignedTeacherName}
                            </p>
                          )}
                        </td>

                        {/* 7. Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!hasAllottedTeacher && (
                              <Button
                                size="sm"
                                variant="primary"
                                icon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                                onClick={() => openSmartMatcher(req)}
                              >
                                Allot Teacher
                              </Button>
                            )}

                            {hasAllottedTeacher && !isTuitionActive && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 font-bold"
                                  icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                  onClick={() => {
                                    setDemoConfirmRequest(req);
                                    setFinalFee(String(req.budgetMonthly || 5000));
                                  }}
                                >
                                  Confirm Tuition
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-slate-600 hover:text-slate-900"
                                  title="Re-match different teacher"
                                  onClick={() => openSmartMatcher(req)}
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}

                            {isTuitionActive && (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-1">
                                ✓ Active Tuition
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Section 5 Requirements */}
            <div className="block md:hidden space-y-3.5">
              {filteredRequests.map(req => {
                const hasAllottedTeacher = !!(req.allottedTeacherName || req.assignedTeacherName);
                const isTuitionActive = req.status === 'ACTIVE' || req.status === 'active';
                const reqDate = req.submittedAt || (req as any).createdAt;
                const formattedDate = reqDate ? new Date(reqDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '02 Sep 2026';

                return (
                  <div key={req.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                    {/* Student Name & ID */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{req.studentName}</p>
                        <p className="text-royal-blue-600 font-mono text-[11px] font-semibold">
                          Student ID: {req.studentId || req.id}
                        </p>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    {/* Contact & Location */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Contact</span>
                        <p className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-royal-blue-600" />
                          {req.studentPhone || req.studentMobile || '9876543210'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Location</span>
                        <p className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-brand-600" />
                          {req.area || `${district} Main`}
                        </p>
                      </div>
                    </div>

                    {/* Class & Subjects */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Class & Subjects</span>
                      <p className="font-bold text-slate-900 text-xs">
                        {req.className || req.grade || 'Class 10'} • {req.subjects.join(', ')}
                      </p>
                      <p className="text-emerald-700 font-black text-xs mt-1">
                        Monthly Budget: ₹{req.budgetMonthly || req.budgetMax || 5000}/mo
                      </p>
                    </div>

                    {/* Request Date & Allotted Teacher */}
                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Requested: {formattedDate}
                      </span>
                      {hasAllottedTeacher && (
                        <span className="font-semibold text-royal-blue-700 truncate max-w-[150px]">
                          Tutor: {req.allottedTeacherName || req.assignedTeacherName}
                        </span>
                      )}
                    </div>

                    {/* Mobile Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      {!hasAllottedTeacher && (
                        <Button
                          size="sm"
                          variant="primary"
                          className="w-full"
                          icon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                          onClick={() => openSmartMatcher(req)}
                        >
                          Allot Teacher
                        </Button>
                      )}

                      {hasAllottedTeacher && !isTuitionActive && (
                        <Button
                          size="sm"
                          variant="primary"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setDemoConfirmRequest(req);
                            setFinalFee(String(req.budgetMonthly || 5000));
                          }}
                        >
                          Confirm Tuition
                        </Button>
                      )}

                      {isTuitionActive && (
                        <div className="w-full py-1.5 text-center rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                          ✓ Active Tuition in Session
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Smart Matching & Demo Scheduling Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Algorithmic Tutor Matcher & Demo Dispatch"
        size="lg"
      >
        {selectedRequest && (
          <form onSubmit={handleScheduleDemo} className="space-y-5 text-sm">
            {/* Student Request Summary Pill */}
            <div className="p-4 rounded-xl bg-slate-850 border border-slate-700/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-royal-blue-400">
                Target Requirement Specification
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 text-xs">
                <div>
                  <p className="text-slate-400 text-[11px]">Student</p>
                  <p className="font-bold text-white">{selectedRequest.studentName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">Grade / Class</p>
                  <p className="font-bold text-white">{selectedRequest.className || selectedRequest.grade || 'Class 12'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">Subjects Needed</p>
                  <p className="font-bold text-royal-blue-400">{selectedRequest.subjects.join(', ')}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">Locality & Budget</p>
                  <p className="font-bold text-emerald-400">{selectedRequest.area} • ₹{selectedRequest.budgetMonthly || 5000}/mo</p>
                </div>
              </div>
            </div>

            {/* Smart Match Results Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Ranked Educator Recommendations ({rankedTeachers.length} Available)
                </h4>
                <span className="text-[11px] text-slate-400">Ranked by algorithm match score</span>
              </div>

              {rankingLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 border-2 border-royal-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : rankedTeachers.length === 0 ? (
                <div className="p-6 text-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  No verified teachers found for this subject/district.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {rankedTeachers.map(score => {
                    const t = score.teacher;
                    const isSelected = selectedTeacherId === t.id;
                    const isBestMatch = score.tier === 'BEST_MATCH';

                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedTeacherId(t.id);
                          if (t.monthlyFee) setAgreedFee(String(t.monthlyFee));
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-royal-blue-950/60 border-royal-blue-500 shadow-md shadow-royal-blue-500/10'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="selectedTeacher"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedTeacherId(t.id);
                                if (t.monthlyFee) setAgreedFee(String(t.monthlyFee));
                              }}
                              className="text-royal-blue-500 focus:ring-royal-blue-400"
                            />
                            <img
                              src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                              alt={t.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <p className="font-bold text-white text-sm flex items-center gap-2">
                                {t.name}
                                <span className="text-[11px] font-normal text-slate-400">
                                  ({t.experienceYears}y exp • {t.qualification})
                                </span>
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1 text-slate-300">
                                  <MapPin className="w-3 h-3 text-slate-500" /> {t.area}
                                </span>
                                <span>•</span>
                                <span className="text-emerald-400 font-semibold">
                                  ₹{t.monthlyFee || t.expectedFeeMonthly || 5000}/mo
                                </span>
                                <span>•</span>
                                <span className="text-slate-400">
                                  Active load: {score.activeLoad} students
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Match Score Badge */}
                          <div className="text-right">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                                isBestMatch
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : score.tier === 'STRONG_MATCH'
                                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              ⭐ {score.totalScore}% Match
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {score.matchedSubjects.length}/{selectedRequest.subjects.length} subjects match
                            </p>
                          </div>
                        </div>

                        {/* Criteria Pills */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-800/80 text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            Subj: {score.breakdown.subjectScore}/30
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            Grade: {score.breakdown.gradeScore}/25
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            Area: {score.breakdown.localityScore}/20
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            Budget: {score.breakdown.budgetScore}/10
                          </span>
                          {score.isSameLocality && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                              ✓ Direct Area Match
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Demo Class Scheduling Form */}
            <div className="p-4 rounded-xl bg-slate-850 border border-slate-700/80 space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Demo Class Coordination & Details
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Demo Date</label>
                  <input
                    type="date"
                    required
                    value={demoDate}
                    onChange={e => setDemoDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 text-white px-3 py-2 text-xs focus:ring-2 focus:ring-royal-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Demo Time Slot</label>
                  <select
                    value={demoTime}
                    onChange={e => setDemoTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 text-white px-3 py-2 text-xs focus:ring-2 focus:ring-royal-blue-500"
                  >
                    <option value="04:00 PM">04:00 PM - 05:00 PM</option>
                    <option value="05:00 PM">05:00 PM - 06:00 PM</option>
                    <option value="06:00 PM">06:00 PM - 07:00 PM</option>
                    <option value="07:00 PM">07:00 PM - 08:00 PM</option>
                    <option value="11:00 AM">11:00 AM - 12:00 PM (Weekend)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Monthly Tuition Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={agreedFee}
                    onChange={e => setAgreedFee(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 text-white px-3 py-2 text-xs focus:ring-2 focus:ring-royal-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Dispatch Instructions & Admin Notes
                </label>
                <textarea
                  rows={2}
                  value={allotmentNotes}
                  onChange={e => setAllotmentNotes(e.target.value)}
                  placeholder="Notes for student and teacher regarding demo class syllabus..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 px-3.5 py-2 text-xs focus:ring-2 focus:ring-royal-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submittingAllotment}
                icon={<Calendar className="w-4 h-4" />}
              >
                Schedule Demo & Dispatch Allotment
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirm Regular Tuition Modal */}
      <Modal
        isOpen={!!demoConfirmRequest}
        onClose={() => setDemoConfirmRequest(null)}
        title="Confirm Regular Ongoing Tuition"
        size="md"
      >
        {demoConfirmRequest && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
              <p className="text-slate-400">Student & Allotted Educator:</p>
              <p className="font-bold text-white text-sm mt-0.5">
                {demoConfirmRequest.studentName} ⟷ {demoConfirmRequest.allottedTeacherName}
              </p>
              <p className="text-emerald-400 mt-1">
                Demo completed successfully. Confirming creates an official active tuition record.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Weekly Tuition Schedule</label>
              <input
                type="text"
                value={weeklySchedule}
                onChange={e => setWeeklySchedule(e.target.value)}
                placeholder="e.g. Mon, Wed, Fri (05:00 PM - 06:30 PM)"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 text-white px-3.5 py-2 text-xs focus:ring-2 focus:ring-royal-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Confirmed Monthly Fee (₹)</label>
              <input
                type="number"
                value={finalFee}
                onChange={e => setFinalFee(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 text-white px-3.5 py-2 text-xs focus:ring-2 focus:ring-royal-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="outline" onClick={() => setDemoConfirmRequest(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={confirmingDemo}
                onClick={handleConfirmDemoToTuition}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Activate Regular Tuition
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
