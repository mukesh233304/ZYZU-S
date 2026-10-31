import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, CalendarCheck, Receipt, BookMarked, 
  Clock, ArrowRight, UserCheck, CheckCircle2, AlertCircle, Bell, 
  Plus, QrCode, ShieldCheck, MapPin, Sparkles, AlertTriangle,
  BookOpen, Download, TrendingUp, Target, Zap, ShoppingBag,
  Award, FileText, Check, ChevronRight, Sliders, ExternalLink,
  RotateCcw, Compass, User, Play
} from 'lucide-react';
import { StatCard, Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { UserAvatar } from '../../components/common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { studentService, StudentDashboardSummary } from '../../services/studentService';
import { demoService } from '../../services/demoService';
import { studyMaterialService } from '../../services/studyMaterialService';
import { studentPerformanceService } from '../../services/studentPerformanceService';
import { academicEntitlementService } from '../../services/academicEntitlementService';
import { mockTestService } from '../../services/mockTestService';
import { mockStore } from '../../mock/store';
import { StudentPerformanceMetrics, PersonalizedRecommendation, CustomMockDrillRequest } from '../../types/academicIntelligence';
import { DemoEligibility, DemoBooking, DownloadAllowance, StudyMaterial, MockTest } from '../../types';
import { DemoIdCardModal } from '../../components/demo/DemoIdCardModal';
import { DemoBookingModal } from '../../components/demo/DemoBookingModal';
import { PersonalQrPassCard } from '../../components/attendance/PersonalQrPassCard';
import { RecentDocumentsWidget } from '../../components/documents/RecentDocumentsWidget';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Growth & Academic Intelligence state
  const [growthMetrics, setGrowthMetrics] = useState<StudentPerformanceMetrics | null>(null);
  const [growthRecommendations, setGrowthRecommendations] = useState<PersonalizedRecommendation[]>([]);

  // Subscriptions state
  const [hasMockSubscription, setHasMockSubscription] = useState(false);

  // Custom Mock Drill Requests state
  const [studentCustomRequests, setStudentCustomRequests] = useState<CustomMockDrillRequest[]>([]);

  // Demo passes state
  const [demoEligibility, setDemoEligibility] = useState<DemoEligibility | null>(null);
  const [selectedDemoForCard, setSelectedDemoForCard] = useState<DemoBooking | null>(null);
  const [demoModalConfig, setDemoModalConfig] = useState<{
    isOpen: boolean;
    serviceType: 'LIBRARY' | 'HOME_TUITION';
  }>({
    isOpen: false,
    serviceType: 'LIBRARY'
  });

  // Study Material & Mock Tests for Continue Learning
  const [studyAllowance, setStudyAllowance] = useState<DownloadAllowance | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<StudyMaterial[]>([]);
  const [availableMockTests, setAvailableMockTests] = useState<MockTest[]>([]);

  const loadDashboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [summary, elig, metrics, recs, customReqs] = await Promise.all([
        studentService.getDashboardData(user.id),
        demoService.checkEligibility(user.id),
        studentPerformanceService.getPerformanceOverview(user.id),
        studentPerformanceService.getPersonalizedRecommendations(user.id),
        mockTestService.getCustomMockRequests(user.id)
      ]);
      setData(summary);
      setDemoEligibility(elig);
      setGrowthMetrics(metrics);
      setGrowthRecommendations(recs);
      setStudentCustomRequests(customReqs);

      // Check student subscriptions
      const subs = academicEntitlementService.getStudentSubscriptions(user.id);
      const isMockActive = subs.some(s => 
        (s.productType === 'MOCK_TEST_SUBSCRIPTION' || 
         s.productType === 'COMPLETE_PACKAGE' || 
         s.productType === 'COMPLETE_EXAM_PACKAGE' || 
         s.productType === 'EXAM_PACKAGE') && s.status === 'ACTIVE'
      );
      setHasMockSubscription(isMockActive);

      // Load study material quota and recommendations
      const allowanceData = studyMaterialService.getDownloadAllowance(
        user.id, 
        (user as any)?.district, 
        (user as any)?.grade
      );
      setStudyAllowance(allowanceData);

      const matList = studyMaterialService.getMaterials({
        class: (user as any)?.grade || 'Class 10'
      }).slice(0, 3);
      setRecentMaterials(matList);

      // Load available mock tests for Continue Learning
      const mockList = (mockStore.getMockTests ? mockStore.getMockTests() : []).slice(0, 3);
      setAvailableMockTests(mockList);

    } catch (e) {
      console.error('Failed to load student dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-36 bg-slate-200 rounded-3xl"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const { activeTutor, activeLibrarySeat, attendance, fees, tutorRequests } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* ========================================================================= */}
      {/* SECTION A: STUDENT WELCOME AREA (PERSONAL LEARNING COMMAND CENTER HEADER) */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden text-white">
        {/* Futuristic luminous glow spheres */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center sm:items-start gap-5 min-w-0 relative z-10">
          <Link to="/student/profile" className="shrink-0 group relative" title="Edit Profile & Photo">
            <div className="p-1 rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <UserAvatar user={user} size="2xl" shape="rounded" showBorder className="ring-2 ring-slate-900" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center shadow-xs" title="Live Synced Profile">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            </span>
          </Link>

          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-black uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>ZYZU'S Student Command Center</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                <span>Active Learner</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate drop-shadow-sm">
              {user?.name || 'Student'}
            </h1>

            {/* Profile Meta: ID, Class, Board, Location */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold pt-0.5">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-cyan-200 font-mono font-bold border border-cyan-500/30 shadow-xs">
                ID: {user?.id || 'FP-STU-001'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-900/70 text-indigo-200 font-bold border border-indigo-400/40 shadow-xs">
                {(user as any)?.grade || (user as any)?.currentClass || 'Class 10'} • {(user as any)?.board || 'CBSE'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{user?.districtName || 'Ghazipur'}, UP</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions in Welcome Area */}
        <div className="flex flex-wrap md:flex-col lg:flex-row items-center gap-2.5 shrink-0 relative z-10">
          <Link to={`/find-tutor?district=${user?.districtId || 'dist-gzp'}${user?.area ? `&area=${encodeURIComponent(user.area)}` : ''}`}>
            <Button size="sm" leftIcon={<GraduationCap className="w-4 h-4" />} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-600/30">
              Request Home Tutor
            </Button>
          </Link>
          <Link to="/find-library">
            <Button variant="outline" size="sm" leftIcon={<BookMarked className="w-4 h-4 text-cyan-300" />} className="w-full sm:w-auto bg-slate-800/80 border-cyan-400/40 text-cyan-200 hover:bg-slate-700 hover:text-white font-black text-xs">
              Book Study Desk
            </Button>
          </Link>
          <Link to="/student/study-material">
            <Button variant="secondary" size="sm" leftIcon={<BookOpen className="w-4 h-4 text-emerald-300" />} className="w-full sm:w-auto bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 font-black text-xs">
              Study Vault ({studyAllowance ? `${studyAllowance.remainingDownloads} Free Left` : 'Vault'})
            </Button>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION B: LEARNING OVERVIEW (8 REAL-DATA METRIC CARDS)                  */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-brand-600" />
            <span>Learning Overview</span>
          </h2>
          <span className="text-[11px] text-slate-600 font-bold">All numbers backed by live ledger records</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* 1. Active Home Tuition */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight block">Home Tuition</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
            </div>
            <div className="my-1.5">
              <span className="text-base sm:text-lg font-black text-slate-950 truncate block">
                {activeTutor ? activeTutor.teacherName : '0 / None'}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 truncate block">
              {activeTutor ? `${activeTutor.subjects?.[0] || 'Tuition Active'}` : 'No active tutor'}
            </span>
          </div>

          {/* 2. Active Library */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-cyan-300 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight block">Library Seat</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            </div>
            <div className="my-1.5">
              <span className="text-base sm:text-lg font-black text-slate-950 truncate block">
                {activeLibrarySeat ? activeLibrarySeat.seatNumber : '0 / None'}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 truncate block">
              {activeLibrarySeat ? activeLibrarySeat.shiftName : 'No active desk'}
            </span>
          </div>

          {/* 3. Active Study Material Access */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight block">Study Material</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            </div>
            <div className="my-1.5">
              <span className="text-base sm:text-lg font-black text-blue-700 truncate block font-mono">
                {studyAllowance ? `${studyAllowance.remainingDownloads}` : '0'} Free
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 truncate block">
              Quota: {studyAllowance?.allowedMonthlyQuota || 5}/mo
            </span>
          </div>

          {/* 4. Active Mock Test Subscription */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight block">Mock Pass</span>
              <span className={`w-1.5 h-1.5 rounded-full ${hasMockSubscription ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            </div>
            <div className="my-1.5">
              <span className={`text-base sm:text-lg font-black truncate block font-mono ${hasMockSubscription ? 'text-emerald-700' : 'text-slate-800'}`}>
                {hasMockSubscription ? 'ACTIVE' : 'Free Tier'}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 truncate block">
              {hasMockSubscription ? 'Full CBT Series' : 'Standard Tests'}
            </span>
          </div>

          {/* 5. Overall Growth */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight block">Growth Score</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            </div>
            <div className="my-1.5">
              <span className="text-base sm:text-lg font-black text-indigo-700 truncate block font-mono">
                {growthMetrics ? `${growthMetrics.overallAccuracy || growthMetrics.averagePercentage || 0}%` : 'N/A'}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 truncate block">
              Accuracy Index
            </span>
          </div>

          {/* 6. Tests Attempted */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-400 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight block">Tests Taken</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            </div>
            <div className="my-1.5">
              <span className="text-base sm:text-lg font-black text-slate-950 font-mono truncate block">
                {growthMetrics?.totalTests || 0}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 truncate block">
              Completed CBTs
            </span>
          </div>

          {/* 7. Recent Performance */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight block">Recent Avg</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="my-1.5">
              <span className="text-base sm:text-lg font-black text-emerald-700 font-mono truncate block">
                {growthMetrics?.averageScore ? `${Math.round(growthMetrics.averageScore)}%` : '0%'}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 truncate block">
              Performance Avg
            </span>
          </div>

          {/* 8. Pending Learning Tasks */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight block">Pending Tasks</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            </div>
            <div className="my-1.5">
              <span className="text-base sm:text-lg font-black text-amber-700 font-mono truncate block">
                {growthRecommendations?.length || 0}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 truncate block">
              Interventions
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION C: CONTINUE LEARNING & NEXT CHALLENGE (MOCK TESTS & MATERIALS)    */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* CUSTOM DRILL IN PROGRESS CARD (Section 22) */}
        {(() => {
          const inProgress = studentCustomRequests.find(r => 
            ['REQUESTED', 'UNDER_REVIEW', 'IN_PREPARATION', 'QUALITY_REVIEW'].includes(r.status)
          );
          if (!inProgress) return null;
          return (
            <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-300 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Sparkles className="w-5 h-5 text-amber-100" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      CUSTOM DRILL IN PROGRESS
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">{inProgress.id}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    {inProgress.examName}: {inProgress.subject} {inProgress.topic ? `→ ${inProgress.topic}` : ''}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Your requested mock drill is being prepared by ZYZU'S academic team ({inProgress.questionCount} Questions • {inProgress.difficulty} difficulty).
                  </p>
                </div>
              </div>

              <Link to="/student/mock-tests?tab=requests" className="shrink-0">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs gap-1.5 shadow-sm w-full sm:w-auto">
                  <span>View Request</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          );
        })()}

        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-slate-950 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            <span>Continue Learning & Mock Practice</span>
          </h2>
          <Link to="/student/study-material" className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1">
            <span>Explore All Materials</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Study Material 1 */}
          {recentMaterials[0] && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-3 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded font-black text-[10px] bg-blue-50 text-blue-900 border border-blue-200">
                    {recentMaterials[0].subject || 'Study Notes'}
                  </span>
                  <span className="text-xs font-black text-emerald-700">
                    {recentMaterials[0].isPaid ? `₹${recentMaterials[0].basePrice}` : 'FREE'}
                  </span>
                </div>
                <h3 className="font-black text-sm text-slate-950 line-clamp-1">{recentMaterials[0].title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                  {recentMaterials[0].description || 'Curated high-yield preparation notes for classroom and competitive mastery.'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Link to="/student/study-material" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full text-xs font-bold border-slate-300 text-slate-900 hover:bg-slate-100">
                    View
                  </Button>
                </Link>
                <Link to="/student/study-material" className="flex-1">
                  <Button size="sm" variant="primary" className="w-full text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-xs">
                    Continue
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* YOUR NEXT CHALLENGE (Section 22) */}
          {availableMockTests[0] ? (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-md flex flex-col justify-between gap-3 relative overflow-hidden border border-indigo-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-1.5 relative z-10">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded font-black text-[10px] bg-amber-400 text-slate-950 uppercase tracking-wider">
                    YOUR NEXT CHALLENGE
                  </span>
                  <span className="text-xs font-bold text-slate-300 font-mono">
                    {availableMockTests[0].durationMinutes || 60} Mins
                  </span>
                </div>
                <h3 className="font-black text-sm text-white line-clamp-1">{availableMockTests[0].title}</h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
                  {availableMockTests[0].examName ? `${availableMockTests[0].examName} • ` : ''}
                  {availableMockTests[0].totalQuestions || 50} Qs • {availableMockTests[0].totalMarks || 100} Marks • Blueprint Verified
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800 relative z-10">
                <Link to="/student/mock-tests" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full text-xs font-bold border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700">
                    All Tests
                  </Button>
                </Link>
                <Link to="/student/mock-tests" className="flex-1">
                  <Button size="sm" className="w-full text-xs font-black bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-sm gap-1">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Test</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <Target className="w-8 h-8 text-slate-400" />
              <p className="text-xs font-bold text-slate-800">CBT Mock Tests Available</p>
              <Link to="/student/mock-tests">
                <Button size="sm" variant="outline" className="text-xs font-bold">
                  Browse Tests
                </Button>
              </Link>
            </div>
          )}

          {/* Test Series / Study Material 2 */}
          {recentMaterials[1] ? (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-3 hover:border-amber-300 hover:shadow-md transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded font-black text-[10px] bg-amber-50 text-amber-900 border border-amber-200">
                    {recentMaterials[1].subject || 'PYQ Papers'}
                  </span>
                  <span className="text-xs font-black text-emerald-700">
                    {recentMaterials[1].isPaid ? `₹${recentMaterials[1].basePrice}` : 'FREE'}
                  </span>
                </div>
                <h3 className="font-black text-sm text-slate-950 line-clamp-1">{recentMaterials[1].title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                  {recentMaterials[1].description || 'Official previous-year question papers with step-by-step solved explanations.'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Link to="/student/study-material" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full text-xs font-bold border-slate-300 text-slate-900 hover:bg-slate-100">
                    View
                  </Button>
                </Link>
                <Link to="/student/study-material" className="flex-1">
                  <Button size="sm" variant="primary" className="w-full text-xs font-black bg-amber-600 hover:bg-amber-500 text-white shadow-xs">
                    Resume
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-400" />
              <p className="text-xs font-bold text-slate-800">PYQ Vault Available</p>
              <Link to="/student/study-material">
                <Button size="sm" variant="outline" className="text-xs font-bold">
                  Explore PYQs
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION D: MY GROWTH SNAPSHOT (REAL DATA OR EXACT REQUIRED NOTICE)       */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-indigo-500/40 p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-900/60 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Personal Growth Intelligence Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>My Growth Snapshot</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl font-medium">
              Real-time performance analytics calibrated strictly from authenticated assessment records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/student/growth">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs gap-1.5 shadow-md shadow-indigo-600/30">
                <TrendingUp className="w-4 h-4" />
                <span>Full Growth Intelligence</span>
              </Button>
            </Link>
            <Link to="/student/mock-tests">
              <Button variant="outline" className="border-indigo-400/40 bg-slate-800/90 hover:bg-slate-700 text-cyan-200 text-xs font-black gap-1.5">
                <Target className="w-4 h-4 text-cyan-300" />
                <span>Government CBT Mocks</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-6">
          {growthMetrics && growthMetrics.totalTests > 0 ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* Total Tests */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 hover:border-cyan-400/50 transition-colors shadow-sm">
                  <span className="text-xs text-cyan-300 block font-bold tracking-wide">Completed Tests</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-black text-white font-mono">{growthMetrics.totalTests}</span>
                    <span className="text-xs text-slate-300 font-semibold">tests</span>
                  </div>
                </div>

                {/* Average Score */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 hover:border-cyan-400/50 transition-colors shadow-sm">
                  <span className="text-xs text-indigo-300 block font-bold tracking-wide">Overall Score</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-black text-cyan-200 font-mono">
                      {growthMetrics.averagePercentage}%
                    </span>
                  </div>
                </div>

                {/* Accuracy */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 hover:border-cyan-400/50 transition-colors shadow-sm">
                  <span className="text-xs text-emerald-300 block font-bold tracking-wide">Accuracy</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
                      {growthMetrics.overallAccuracy}%
                    </span>
                  </div>
                </div>

                {/* Consistency / Improvement */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 hover:border-cyan-400/50 transition-colors shadow-sm">
                  <span className="text-xs text-cyan-300 block font-bold tracking-wide">Weekly Trajectory</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-xl sm:text-2xl font-black font-mono ${growthMetrics.improvementRate >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {growthMetrics.improvementRate >= 0 ? `+${growthMetrics.improvementRate}%` : `${growthMetrics.improvementRate}%`}
                    </span>
                  </div>
                </div>

                {/* Strongest Subject */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 hover:border-cyan-400/50 transition-colors shadow-sm">
                  <span className="text-xs text-emerald-300 block font-bold tracking-wide">Strong Subject</span>
                  <p className="font-black text-sm text-emerald-200 truncate mt-1">
                    {growthMetrics.strongestSubject || 'Evaluating...'}
                  </p>
                </div>

                {/* Focus Area */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 hover:border-cyan-400/50 transition-colors shadow-sm">
                  <span className="text-xs text-rose-300 block font-bold tracking-wide">Areas to Improve</span>
                  <p className="font-black text-sm text-rose-200 truncate mt-1">
                    {growthMetrics.subjectNeedingAttention || 'None detected'}
                  </p>
                </div>
              </div>

              {/* Recommendation Preview */}
              {growthRecommendations.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-950/90 border border-cyan-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Zap className="w-5 h-5 text-cyan-300" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-black text-white">
                        {growthRecommendations[0].title}
                      </p>
                      <p className="text-xs text-slate-200 font-medium line-clamp-1 mt-0.5">
                        {growthRecommendations[0].transparentReason}
                      </p>
                    </div>
                  </div>
                  <Link to="/student/growth" className="shrink-0">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black gap-1 shadow-sm">
                      <span>View Intelligence Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* EXACT REQUIRED INSUFFICIENT DATA QUOTE */
            <div className="p-8 rounded-2xl bg-slate-900/90 border border-dashed border-indigo-400/40 text-center space-y-4 max-w-xl mx-auto shadow-inner">
              <div className="w-14 h-14 rounded-2xl bg-indigo-900/60 text-cyan-300 flex items-center justify-center mx-auto shadow-inner border border-indigo-500/30">
                <Target className="w-7 h-7 text-cyan-300" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-white text-base">Growth Intelligence Locked</h4>
                <p className="text-sm font-black text-cyan-300 drop-shadow-sm">
                  “Complete a few tests to unlock your personalized growth insights.”
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Link to="/student/mock-tests">
                  <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-xs gap-1.5 shadow-md">
                    <Target className="w-3.5 h-3.5 text-white" />
                    <span>Start Mock Test</span>
                  </Button>
                </Link>
                <Link to="/student/study-material">
                  <Button size="sm" variant="outline" className="border-indigo-400/40 bg-white/10 hover:bg-white/20 text-white text-xs font-bold">
                    Browse Notes
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION E: QUICK ACTIONS (10 ROUTING CARDS)                               */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-slate-950 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Personal Learning Quick Actions</span>
          </h2>
          <span className="text-xs text-slate-600 font-bold">10 Core Modules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {/* 1. Study Material Vault */}
          <Link
            to="/student/study-material"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-slate-950 group-hover:text-blue-600 transition-colors">
                Study Material Vault
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold mt-0.5 line-clamp-1">Notes, Books & PYQs</p>
            </div>
          </Link>

          {/* 2. Government Exam Mock Tests */}
          <Link
            to="/student/mock-tests"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-slate-950 group-hover:text-indigo-600 transition-colors">
                Govt Exam Mock Tests
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold mt-0.5 line-clamp-1">CBT Preparation</p>
            </div>
          </Link>

          {/* 3. My Growth Intelligence */}
          <Link
            to="/student/growth"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-slate-950 group-hover:text-emerald-600 transition-colors">
                My Growth Intelligence
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold mt-0.5 line-clamp-1">Personal Diagnostics</p>
            </div>
          </Link>

          {/* 4. Personal Mistake Book */}
          <Link
            to="/student/mistakes"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 shadow-xs">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-slate-950 group-hover:text-amber-600 transition-colors">
                Personal Mistake Book
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold mt-0.5 line-clamp-1">Revision Journal</p>
            </div>
          </Link>

          {/* 5. Digital Learning Store */}
          <Link
            to="/student/store"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-purple-400 hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-slate-950 group-hover:text-purple-600 transition-colors">
                Digital Learning Store
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold mt-0.5 line-clamp-1">Test Series & Packs</p>
            </div>
          </Link>

          {/* 6. My Subscriptions */}
          <Link
            to="/student/subscriptions"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-400 hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-slate-950 group-hover:text-rose-600 transition-colors">
                My Subscriptions
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold mt-0.5 line-clamp-1">Active Entitlements</p>
            </div>
          </Link>

          {/* 7. My Documents */}
          <Link
            to="/student/documents"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-400 hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-slate-950 group-hover:text-cyan-600 transition-colors">
                My Documents & IDs
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold mt-0.5 line-clamp-1">Receipts & ID Cards</p>
            </div>
          </Link>

          {/* 8. My Profile */}
          <Link
            to="/student/profile"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-400 hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-slate-950 group-hover:text-brand-600 transition-colors">
                My Profile
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold mt-0.5 line-clamp-1">Identity & Preferences</p>
            </div>
          </Link>

          {/* 9. Find Home Tutor */}
          <Link
            to="/find-tutor"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-400 hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-slate-950 group-hover:text-brand-600 transition-colors">
                Find Home Tutor
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold mt-0.5 line-clamp-1">Verified Educators</p>
            </div>
          </Link>

          {/* 10. Find Libraries */}
          <Link
            to="/find-library"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-slate-950 group-hover:text-amber-700 transition-colors">
                Find Libraries
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold mt-0.5 line-clamp-1">AC Study Desks</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1-TIME DEMO PASSES PRIVILEGE CARD                                         */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-indigo-500/40 p-6 sm:p-7 text-white shadow-2xl space-y-4 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute left-1/4 top-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-cyan-300 border border-cyan-400/30">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-wide flex items-center gap-2">
                Exclusive 1-Time ZYZU'S Demo Passes
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-black border border-cyan-400/40 uppercase tracking-wider">
                  STUDENT PRIVILEGE
                </span>
              </h2>
              <p className="text-xs text-slate-200 font-medium mt-0.5">
                Experience ZYZU'S services before committing to regular enrollment. Exactly 1 demo per category.
              </p>
            </div>
          </div>

          <Link
            to="/student/bookings"
            className="text-xs font-black text-cyan-300 hover:text-cyan-200 flex items-center gap-1 shrink-0"
          >
            <span>Manage Passes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Library Demo */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 hover:border-cyan-400/40 transition-colors flex items-center justify-between gap-3 shadow-md">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-cyan-300">
                <BookMarked className="w-4 h-4" />
                <span>Digital Library Demo Seat</span>
              </div>
              <p className="text-xs text-slate-100 font-semibold">
                {demoEligibility?.canBookLibrary
                  ? 'Complimentary study desk trial pass'
                  : 'Pass Active • ID: ' + (demoEligibility?.libraryBooking?.demo_booking_id || 'Issued')}
              </p>
            </div>

            {demoEligibility?.canBookLibrary ? (
              <Button
                size="sm"
                onClick={() => setDemoModalConfig({ isOpen: true, serviceType: 'LIBRARY' })}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shrink-0 shadow-md shadow-blue-600/30"
              >
                Book Demo Seat
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (demoEligibility?.libraryBooking) setSelectedDemoForCard(demoEligibility.libraryBooking);
                }}
                className="border-indigo-400/50 bg-white/5 text-cyan-200 hover:bg-white/10 font-black text-xs shrink-0"
              >
                View ID Card
              </Button>
            )}
          </div>

          {/* Home Tuition Demo */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 hover:border-amber-400/40 transition-colors flex items-center justify-between gap-3 shadow-md">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                <GraduationCap className="w-4 h-4" />
                <span>Home Tuition Demo Class</span>
              </div>
              <p className="text-xs text-slate-100 font-semibold">
                {demoEligibility?.canBookHomeTuition
                  ? '1-on-1 trial class with expert tutor'
                  : 'Pass Active • ID: ' + (demoEligibility?.tuitionBooking?.demo_booking_id || 'Issued')}
              </p>
            </div>

            {demoEligibility?.canBookHomeTuition ? (
              <Button
                size="sm"
                onClick={() => setDemoModalConfig({ isOpen: true, serviceType: 'HOME_TUITION' })}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 shadow-md shadow-amber-500/30"
              >
                Book Demo Class
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (demoEligibility?.tuitionBooking) setSelectedDemoForCard(demoEligibility.tuitionBooking);
                }}
                className="border-amber-400/50 bg-white/5 text-amber-200 hover:bg-white/10 font-black text-xs shrink-0"
              >
                View ID Card
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PERSONAL QR ATTENDANCE PASS & ACCESS CARD */}
      {/* ========================================================================= */}
      {user && (
        <PersonalQrPassCard
          studentId={user.id}
          showActions={true}
        />
      )}

      {/* ========================================================================= */}
      {/* OPERATIONAL HUB: LEFT COLUMN TUTOR & ATTENDANCE / RIGHT COLUMN DESK & DOCS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Home Tutor Card */}
          <Card className="space-y-4 bg-white border border-slate-200/90 p-5 sm:p-6 rounded-3xl shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-950">Allotted Home Tutor</h3>
                <p className="text-xs text-slate-600 font-semibold">Verified & credentialed by ZYZU'S Directorate</p>
              </div>
              {activeTutor && <StatusBadge status={activeTutor.status} size="sm" />}
            </div>

            {activeTutor ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-4">
                  <img
                    src={activeTutor.teacherAvatar}
                    alt={activeTutor.teacherName}
                    className="w-14 h-14 rounded-2xl object-cover border border-brand-500/30 shrink-0 shadow-xs"
                  />
                  <div>
                    <h4 className="font-black text-base text-slate-950">{activeTutor.teacherName}</h4>
                    <p className="text-xs text-slate-700 font-bold">{activeTutor.teacherDegree}</p>
                    <p className="text-xs text-slate-700 mt-1 font-medium">
                      Schedule: <strong className="text-slate-950 font-bold">{(activeTutor.preferredDays || ['Mon', 'Wed', 'Fri']).slice(0, 3).join(', ')}</strong> at <strong className="text-slate-950 font-bold">{activeTutor.preferredTime || '05:00 PM'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                  <span className="text-sm font-black text-brand-700">₹{activeTutor.monthlyFee} / mo</span>
                  <Link to="/student/tutor">
                    <Button size="sm" variant="outline" className="border-slate-300 text-slate-900 hover:bg-slate-100 text-xs font-black">Session Details</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-8 px-4 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-full bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-base text-slate-950">No Active Home Tutor</h4>
                  <p className="text-xs text-slate-600 font-semibold max-w-sm mx-auto">
                    You don't have an active home tutor yet. Submit your learning requirements to the District Admin for matching.
                  </p>
                </div>
                <div className="pt-1 flex justify-center">
                  <Link to={`/find-tutor?district=${user?.districtId || 'dist-gzp'}${user?.area ? `&area=${encodeURIComponent(user.area)}` : ''}`}>
                    <Button size="sm" leftIcon={<GraduationCap className="w-4 h-4" />} className="shadow-xs font-black text-xs">
                      Request a Home Tutor
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>

          {/* Recent Attendance Log */}
          <Card className="space-y-4 bg-white border border-slate-200/90 p-5 sm:p-6 rounded-3xl shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-950">Recent Attendance Logs</h3>
                <p className="text-xs text-slate-600 font-semibold">Home tuition sessions & study library check-ins</p>
              </div>
              <Link to="/student/attendance" className="text-xs font-black text-brand-700 hover:underline">
                View Full Log & Chart
              </Link>
            </div>

            {attendance.hasRecords ? (
              <div className="space-y-2.5">
                {(attendance.recentRecords || []).map((rec) => (
                  <div key={rec.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition-colors">
                    <div className="space-y-0.5">
                      <p className="font-black text-slate-950">{rec.targetName}</p>
                      <p className="text-[11px] text-slate-600 font-semibold">{rec.remarks || (rec.type === 'TUTOR' ? 'Home Tuition' : 'Library Access')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-700 font-bold">{rec.date}</span>
                      <StatusBadge status={rec.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 px-4 text-center space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <CalendarCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-black text-slate-950">0% Attendance</p>
                <p className="text-xs text-slate-600 font-semibold">No attendance records available yet.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (1 Col): Study Pass & Recent Docs */}
        <div className="space-y-6">
          
          {/* Study Library Seat Card */}
          <Card className="space-y-4 bg-white border border-slate-200/90 p-5 sm:p-6 rounded-3xl shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-brand-700 uppercase tracking-wider">Study Desk Pass</span>
              {activeLibrarySeat && <StatusBadge status={activeLibrarySeat.status} size="sm" />}
            </div>

            {activeLibrarySeat ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-black text-slate-950 text-base">{activeLibrarySeat.libraryName}</h4>
                  <p className="text-xs text-slate-600 font-semibold">Reserved Study Pass</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Assigned Desk:</span>
                    <strong className="text-brand-700 font-black text-sm">{activeLibrarySeat.seatNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Study Shift:</span>
                    <span className="font-black text-slate-950">{activeLibrarySeat.shiftName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Valid Until:</span>
                    <span className="font-bold text-slate-900">{activeLibrarySeat.endDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-black">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Biometric Turnstile Active</span>
                  </div>
                </div>

                <Link to="/student/bookings" className="block">
                  <Button size="sm" variant="outline" className="w-full border-slate-300 text-slate-900 hover:bg-slate-100 font-black text-xs">
                    Manage Library Booking
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="py-6 px-4 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                  <BookMarked className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-base text-slate-950">No Active Library Seat</h4>
                  <p className="text-xs text-slate-600 font-semibold">
                    You don't have an active study library booking.
                  </p>
                </div>
                <div className="pt-1">
                  <Link to="/find-library">
                    <Button size="sm" variant="secondary" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs">
                      Book a Study Desk
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>

          {/* Official Documents & Receipts Widget */}
          <RecentDocumentsWidget
            userId={user?.id || 'usr-student-aryan'}
            userRole="STUDENT"
            allDocumentsPath="/student/documents"
          />

        </div>

      </div>

      {/* Demo ID Card Modal */}
      {selectedDemoForCard && (
        <DemoIdCardModal
          isOpen={Boolean(selectedDemoForCard)}
          onClose={() => setSelectedDemoForCard(null)}
          booking={selectedDemoForCard}
        />
      )}

      {/* Demo Booking Modal */}
      {demoModalConfig.isOpen && (
        <DemoBookingModal
          isOpen={demoModalConfig.isOpen}
          onClose={() => setDemoModalConfig(prev => ({ ...prev, isOpen: false }))}
          serviceType={demoModalConfig.serviceType}
          onBookingComplete={() => loadDashboard()}
        />
      )}
    </div>
  );
};
