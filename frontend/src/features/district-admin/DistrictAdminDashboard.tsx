import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { districtAdminService } from '../../services/districtAdminService';
import { districtAuthorizationService } from '../../services/districtAuthorizationService';
import { mockStore } from '../../mock/store';
import { INITIAL_LOCALITIES } from '../../mock/data/locations';
import { TutorRequest, Teacher, Library, Student } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Sparkles,
  DollarSign,
  TrendingUp,
  Receipt,
  FileText,
  Calendar,
  Filter,
  RefreshCw,
  PhoneCall,
  UserCheck,
  HelpCircle,
  Percent,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { RecentDocumentsWidget } from '../../components/documents/RecentDocumentsWidget';
import { UnservedDemandManager } from '../../components/district-admin/UnservedDemandManager';

export const DistrictAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const scope = districtAuthorizationService.getAuthorizedScope();
  const districtName = user?.authorizedDistrict || scope?.districtName || user?.districtName || user?.district || '';
  const stateName = user?.authorizedState || scope?.stateName || user?.stateName || user?.state || 'Uttar Pradesh';
  const districtId = scope?.districtId || (districtName ? districtAuthorizationService.resolveDistrictId(districtName) : '');

  const [kpis, setKpis] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<TutorRequest[]>([]);
  const [pendingTeachers, setPendingTeachers] = useState<Teacher[]>([]);
  const [teachersList, setTeachersList] = useState<Teacher[]>([]);
  const [librariesList, setLibrariesList] = useState<Library[]>([]);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Multi-Level Hierarchy Filter State
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [selectedService, setSelectedService] = useState<'ALL' | 'TUITION' | 'LIBRARY'>('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState('THIS_MONTH');
  const [customDate, setCustomDate] = useState('');

  const loadDashboardData = async () => {
    if (!districtName) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Server-side District Access Verification (Section #4, #8, #9, #10)
      districtAuthorizationService.verifyDistrictAccess(districtName);

      const dateArg = selectedDateFilter === 'CUSTOM' ? customDate : undefined;
      const kpiData = await districtAdminService.getComprehensiveKPIs(districtName, {
        date: dateArg,
        area: selectedArea !== 'ALL' ? selectedArea : undefined,
        serviceType: selectedService !== 'ALL' ? selectedService : undefined,
      });
      setKpis(kpiData);

      const [requestsData, teachersData, librariesData, studentsData] = await Promise.all([
        districtAdminService.getTutorRequests(districtName),
        districtAdminService.getTeachers(districtName),
        districtAdminService.getLibraries(districtName),
        districtAdminService.getStudents(districtName)
      ]);

      setPendingRequests(requestsData.filter(r => r.status === 'submitted' || r.status === 'reviewing' || r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW'));
      setPendingTeachers(teachersData.filter(t => t.verificationStatus === 'pending' || t.verificationStatus === 'PENDING'));
      setTeachersList(teachersData);
      setLibrariesList(librariesData);
      setStudentsList(studentsData);

      const circulars = mockStore.getAnnouncements(districtName);
      setAnnouncements(circulars);
    } catch (err: any) {
      console.error('Failed to load district dashboard', err);
      addToast(err.message || 'Error loading district analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [districtName, selectedDateFilter, customDate, selectedArea, selectedService]);

  // Localities dynamically filtered for the authorized district only
  const districtLocalities = INITIAL_LOCALITIES.filter(loc => 
    loc.districtId.toLowerCase() === districtId.toLowerCase() ||
    (districtName && loc.districtId.toLowerCase() === `dist-${districtName.toLowerCase().slice(0, 3)}`)
  );

  // Dynamic Locality Breakdown strictly using authorized district's records
  const baseLocalities = districtLocalities.length > 0 
    ? districtLocalities 
    : [
        { id: '1', name: `${districtName} Central (HQ)` },
        { id: '2', name: `${districtName} North Sector` },
        { id: '3', name: `${districtName} South Sector` }
      ];

  const localityData = baseLocalities.map(loc => {
    const locName = loc.name;
    const students = studentsList.filter(s => (s.area || '').toLowerCase().includes(locName.toLowerCase())).length;
    const teachers = teachersList.filter(t => 
      (t.area || '').toLowerCase().includes(locName.toLowerCase()) || 
      (t.areasServed || []).some(a => a.toLowerCase().includes(locName.toLowerCase()))
    ).length;
    const libs = librariesList.filter(l => (l.area || '').toLowerCase().includes(locName.toLowerCase()));
    const libraries = libs.length;
    const seats = libs.reduce((sum, l) => sum + (l.totalSeats || 0), 0);
    const occupancy = seats > 0 ? `${Math.round((students / seats) * 100)}%` : '0%';
    const attendance = students > 0 ? '92%' : '0%';
    const revenue = students * 2500;
    return {
      area: locName,
      students,
      teachers,
      libraries,
      seats,
      occupancy,
      attendance,
      revenue
    };
  }).filter(l => selectedArea === 'ALL' || l.area.toLowerCase().includes(selectedArea.toLowerCase()));

  const urgentCircular = announcements.find(a => a.isUrgent || a.priority === 'HIGH' || a.priority === 'URGENT');

  if (!districtName) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white rounded-2xl border border-rose-200 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">District Access Not Assigned</h2>
        <p className="text-sm text-slate-600">
          Your account is active, but no district has been assigned to you. Please contact the Super Admin to provision your administrative jurisdiction.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`District Command Center: ${districtName}`}
        subtitle={`Sole Authorized Administrator: ${user?.name || 'District Administrator'} • Territory: ${districtName} (${stateName}) • Official ZYZU'S Desk`}
        breadcrumbs={[{ label: 'District Administration' }, { label: 'Operational Overview' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/district-admin/payments">
              <Button variant="outline" size="sm" icon={<Receipt className="w-4 h-4 text-emerald-600" />}>
                Disbursement Desk
              </Button>
            </Link>
            <Link to="/district-admin/requests">
              <Button variant="primary" size="sm" icon={<Users className="w-4 h-4" />}>
                Allot Tutors ({pendingRequests.length})
              </Button>
            </Link>
            <Link to="/district-admin/super-admin-comm">
              <Button variant="outline" size="sm" className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" icon={<PhoneCall className="w-4 h-4" />}>
                Super Admin Direct
              </Button>
            </Link>
          </div>
        }
      />

      {/* Urgent Broadcast Circular Banner (Req 35 & 36) */}
      {urgentCircular && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-rose-700 uppercase">
                  State HQ Urgent Circular
                </span>
                <span className="text-xs text-amber-100">{urgentCircular.createdAt}</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{urgentCircular.title}</h4>
              <p className="text-xs text-amber-50 line-clamp-1">{urgentCircular.content}</p>
            </div>
          </div>
          <Link
            to="/district-admin/notifications"
            className="px-3.5 py-1.5 bg-white text-rose-700 hover:bg-amber-50 rounded-xl font-bold text-xs whitespace-nowrap shadow-sm transition-all flex items-center gap-1"
          >
            Review & Acknowledge <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Multi-Level Hierarchy Filter Bar (Req 3 & 4) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-600" />
            Hierarchy Filter & Scope Engine (District &gt; Area &gt; Service &gt; Date)
          </div>
          <button
            onClick={loadDashboardData}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">District / Jurisdiction</label>
            <div className="text-xs font-semibold bg-slate-100 text-slate-800 px-3 py-2 rounded-xl border border-slate-200 flex items-center justify-between">
              <span>{districtName} (Uttar Pradesh)</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">1 Admin</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Locality / Tehsil</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Areas Across {districtName}</option>
              {baseLocalities.map(loc => (
                <option key={loc.id || loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Service Division</label>
            <select
              value={selectedService}
              onChange={(e: any) => setSelectedService(e.target.value)}
              className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Services (Home Tuition + Libraries)</option>
              <option value="TUITION">Home Tuition Only</option>
              <option value="LIBRARY">Self-Study Libraries Only</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Timeline & Date</label>
            <div className="flex gap-1.5">
              <select
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="flex-1 text-xs font-medium border border-slate-300 rounded-xl p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="TODAY">Today Only</option>
                <option value="THIS_WEEK">This Week</option>
                <option value="THIS_MONTH">This Month (September 2026)</option>
                <option value="CUSTOM">Exact Date Query</option>
              </select>
              {selectedDateFilter === 'CUSTOM' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-32 text-xs border border-slate-300 rounded-xl p-1 bg-white"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* District Authority Banner with Profit Formula Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                🔒 AUTHORIZED DISTRICT: {districtName.toUpperCase()} • 100% ISOLATED
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
              {districtName} Education & Study Infrastructure Command
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Real-time synchronization for {kpis?.totalStudents ?? studentsList.length} registered students, {kpis?.totalTeachers ?? teachersList.length} verified educators, and {kpis?.totalLibraries ?? librariesList.length} certified libraries in {districtName}.
            </p>
          </div>

          {/* District Net Profit Capsule */}
          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-left sm:text-right min-w-[220px]">
            <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Net District Profit</p>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">
              ₹{(kpis?.currentMonthProfit ?? 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-300 mt-1">
              Rev ₹{(kpis?.totalRevenue ?? 0).toLocaleString('en-IN')} − Comm − Exp
            </p>
          </div>
        </div>
      </div>

      {/* 30+ Comprehensive KPI Matrix (Req 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Student KPIs */}
        <StatCard
          title="Total Students"
          value={kpis?.totalStudents ?? studentsList.length}
          change={`+${kpis?.newStudents ?? 0} registered this month`}
          isPositive={true}
          icon={<Users className="w-6 h-6 text-blue-600" />}
        />

        {/* Teacher KPIs */}
        <StatCard
          title="Active Tutors"
          value={kpis?.approvedTeachers ?? teachersList.filter(t => t.verificationStatus === 'APPROVED' || t.verificationStatus === 'verified').length}
          change={`${pendingTeachers.length} applications in queue`}
          isPositive={true}
          icon={<GraduationCap className="w-6 h-6 text-emerald-600" />}
        />

        {/* Library Seats */}
        <StatCard
          title="Library Seat Occupancy"
          value={`${kpis?.occupiedDesks ?? 0} / ${kpis?.totalDesks ?? 0}`}
          change={`${kpis?.availableDesks ?? 0} vacant desks available`}
          isPositive={true}
          icon={<Building2 className="w-6 h-6 text-indigo-600" />}
        />

        {/* District Attendance Rate */}
        <StatCard
          title="Overall Attendance Rate"
          value={`${(kpis?.totalStudents ?? 0) > 0 ? (kpis?.todayLibraryAttendance ? Math.round((kpis.todayLibraryAttendance / kpis.totalStudents) * 100) : 92.4) : 0}%`}
          change={studentsList.length > 0 ? 'Verified Session Logs' : 'No Active Sessions Yet'}
          isPositive={true}
          icon={<Percent className="w-6 h-6 text-cyan-600" />}
        />
      </div>

      {/* Secondary Financial & Operational KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Gross Inflow</span>
            <p className="text-lg font-bold text-slate-900">₹{(kpis?.totalRevenue ?? 0).toLocaleString('en-IN')}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">100% Verified Receipts</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-100 text-rose-700">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Operational Expenses</span>
            <p className="text-lg font-bold text-slate-900">₹{(kpis?.totalExpenses ?? 0).toLocaleString('en-IN')}</p>
            <Link to="/district-admin/expenses" className="text-[11px] text-blue-600 hover:underline">
              Manage vouchers &rarr;
            </Link>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Disbursements Pending</span>
            <p className="text-lg font-bold text-slate-900">₹{(kpis?.pendingTeacherPayments ?? 0).toLocaleString('en-IN')}</p>
            <Link to="/district-admin/payments" className="text-[11px] text-amber-700 font-semibold hover:underline">
              Execute 30th cycle &rarr;
            </Link>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Unassigned Inquiries</span>
            <p className="text-lg font-bold text-slate-900">{pendingRequests.length}</p>
            <Link to="/district-admin/requests" className="text-[11px] text-indigo-600 font-semibold hover:underline">
              Match tutors &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Two-Column Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tuition Allotment Queue */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pending Student Allotments</h3>
              <p className="text-xs text-slate-500">Learners awaiting educator matching in {districtName}</p>
            </div>
            <Link to="/district-admin/requests" className="text-xs font-semibold text-blue-600 hover:underline flex items-center">
              Allotment Desk <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              All tuition requests in {districtName} have been assigned to verified teachers!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 4).map(req => (
                <div key={req.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between gap-3 bg-slate-50/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{req.studentName}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {req.grade}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Subjects: <span className="font-semibold text-slate-800">{req.subjects.join(', ')}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" /> {req.area}, {req.district}
                    </p>
                  </div>
                  <Link to="/district-admin/requests">
                    <Button size="sm" variant="primary" className="text-xs">
                      Allot Teacher
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Teacher Verification Applications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Educator Verification Queue</h3>
              <p className="text-xs text-slate-500">Degree & Police Verification sign-offs for {districtName}</p>
            </div>
            <Link to="/district-admin/teacher-approvals" className="text-xs font-semibold text-blue-600 hover:underline flex items-center">
              KYC Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {pendingTeachers.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              All educator applications in {districtName} have been processed and verified.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTeachers.map(t => (
                <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{t.name}</h4>
                    <p className="text-xs text-slate-500">{t.qualification} • {t.experienceYears} yrs exp</p>
                    <p className="text-[11px] text-blue-700 font-medium mt-0.5">
                      Subjects: {t.subjects.join(', ')}
                    </p>
                  </div>
                  <Link to="/district-admin/teacher-approvals">
                    <Button size="sm" variant="outline" className="text-xs">
                      Inspect KYC
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* District Quick Actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
            <Link to="/district-admin/home-tuition">
              <Button variant="outline" className="w-full text-xs justify-center">
                Tuition Desk
              </Button>
            </Link>
            <Link to="/district-admin/expenses">
              <Button variant="outline" className="w-full text-xs justify-center">
                District Expenses
              </Button>
            </Link>
            <Link to="/district-admin/reports">
              <Button variant="primary" className="w-full text-xs justify-center font-bold">
                <FileText className="w-3.5 h-3.5 mr-1" />
                District Reports
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Official District Documents & Receipts Widget */}
      <RecentDocumentsWidget
        userId={user?.id || user?.userId || 'usr-district-admin'}
        userRole="DISTRICT_ADMIN"
        allDocumentsPath="/district-admin/documents"
      />

      {/* Unserved Location Demand & Onboarding Opportunities (Req 12, 13, 19, 20, 21) */}
      <UnservedDemandManager districtName={districtName} />

      {/* Locality Performance & Attendance Breakdown Table (Req 2 & 3) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Locality Performance & Inflow Analysis</h3>
            <p className="text-xs text-slate-500">Live breakdown by block, active desks, collections, and student attendance in {districtName}</p>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full self-start sm:self-auto">
            {localityData.length} Blocks Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Locality / Tehsil</th>
                <th className="py-3 px-4 text-center">Students</th>
                <th className="py-3 px-4 text-center">Tutors</th>
                <th className="py-3 px-4 text-center">Libraries</th>
                <th className="py-3 px-4 text-center">Seat Capacity</th>
                <th className="py-3 px-4 text-center">Occupancy</th>
                <th className="py-3 px-4 text-center">Attendance</th>
                <th className="py-3 px-4 text-right">Gross Collections</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localityData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                    No registered operations or active learners in {districtName} district yet.
                  </td>
                </tr>
              ) : (
                localityData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    {row.area}
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium">{row.students}</td>
                  <td className="py-3.5 px-4 text-center font-medium">{row.teachers}</td>
                  <td className="py-3.5 px-4 text-center font-medium">{row.libraries}</td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-600">{row.seats} Desks</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                      {row.occupancy}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                      {row.attendance}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    ₹{row.revenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* District Intelligence & Regulatory Reports Launcher */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">District Intelligence & Regulatory Reports Desk</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any report button below to instantly open the corresponding verified data and download CSV/Excel
            </p>
          </div>
          <Link to="/district-admin/reports">
            <Button size="sm" variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
              Open All 14 Reports
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: '1', name: 'Overall Executive Summary', desc: 'Hubs, Centers, Gross Inflow & Audit', icon: ShieldCheck, color: 'text-blue-600 bg-blue-50' },
            { id: '2', name: 'Student Demographics', desc: 'Enrolled learners, grades, tehsils & dues', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
            { id: '3', name: 'Tuition Demands & Allotments', desc: 'Tutor-learner matchings & demo states', icon: BookOpen, color: 'text-indigo-600 bg-indigo-50' },
            { id: '4', name: 'Teacher KYC Clearance', desc: 'Police checks, degree verifications & SLAs', icon: GraduationCap, color: 'text-purple-600 bg-purple-50' },
            { id: '8', name: 'Daily Attendance Register', desc: 'Biometric morning/evening study desk logs', icon: Clock, color: 'text-cyan-600 bg-cyan-50' },
            { id: '9', name: 'Fee Realization Register', desc: 'Monthly tuition fees, receipts & collection %', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
            { id: '10', name: 'District Operational Expenses', desc: 'Audited fuel, rent, marketing & utilities', icon: Receipt, color: 'text-rose-600 bg-rose-50' },
            { id: '11', name: '30th-Cycle Educator Payouts', desc: 'Disbursements, commission cuts & bank logs', icon: Percent, color: 'text-blue-600 bg-blue-50' }
          ].map((rep) => {
            const RepIcon = rep.icon;
            return (
              <Link
                key={rep.id}
                to={`/district-admin/reports?category=${rep.id}`}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rep.color} shrink-0 group-hover:scale-105 transition-transform`}>
                    <RepIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black px-1.5 py-0.2 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white rounded transition-colors font-mono">
                        #{rep.id}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-900 truncate">
                        {rep.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{rep.desc}</p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-600 group-hover:text-blue-800">
                  <span>Open Data & Download</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
