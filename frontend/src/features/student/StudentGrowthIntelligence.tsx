// FOCUSPOINT — Student "MY GROWTH" Academic Intelligence Command Center

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Award, 
  BookOpen, 
  GraduationCap, 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  RefreshCw, 
  Lightbulb, 
  ShieldCheck, 
  Download, 
  HelpCircle, 
  BarChart3, 
  Zap, 
  Flame,
  ArrowUpRight,
  Printer,
  Users,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { studentPerformanceService } from '../../services/studentPerformanceService';
import { academicEntitlementService } from '../../services/academicEntitlementService';
import { EntitlementEvaluationResult } from '../../types/eligibilityAndPricing';
import { 
  StudentPerformanceMetrics, 
  WeeklyGrowthReport, 
  MonthlyGrowthReport, 
  PersonalizedRecommendation, 
  StudentAchievement,
  SubjectPerformanceSummary
} from '../../types/academicIntelligence';

export const StudentGrowthIntelligence: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const studentId = user?.id || 'usr-student-aryan';

  // Entitlement Access
  const [entitlement, setEntitlement] = useState<EntitlementEvaluationResult>(() =>
    academicEntitlementService.evaluateAccess(studentId, 'GROWING_INTELLIGENCE')
  );

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<StudentPerformanceMetrics | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyGrowthReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyGrowthReport | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  
  // Navigation tabs within My Growth
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WEEKLY' | 'MONTHLY' | 'SUBJECTS' | 'RECOMMENDATIONS' | 'TIMELINE' | 'ACHIEVEMENTS'>('OVERVIEW');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  
  // Report Modal & Parent View Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  const handleCopyWhatsAppSummary = () => {
    if (!metrics) return;
    const studentName = user?.name || 'Aryan Singh';
    const text = `*ZYZU'S Academic Growth Update for ${studentName}*\n*ZYZU'S | Tutors & Libraries*\n` +
      `📅 Period: ${monthlyReport?.monthLabel || 'Current Month'}\n\n` +
      `⭐ *Overall Progress*: ${metrics.hasSufficientData ? `${metrics.averagePercentage}% average score with ${metrics.overallAccuracy}% accuracy across ${metrics.totalTests} assessments.` : 'Baseline initial tests ongoing.'}\n` +
      `📈 *Growth Velocity*: ${metrics.improvementRate >= 0 ? `+${metrics.improvementRate}% improvement` : `${metrics.improvementRate}%`} compared to previous cycle.\n\n` +
      `🌟 *Top Strength*: ${metrics.strongestSubject || 'All subjects balanced'}\n` +
      `🎯 *Focus Area at Home*: ${metrics.subjectNeedingAttention || 'Regular practice on current syllabus'}\n\n` +
      (monthlyReport?.teacherRemarks?.[0] ? `👨‍🏫 *Teacher Note*: "${monthlyReport.teacherRemarks[0]}"\n\n` : '') +
      `💡 *Recommended Home Support*: 15 mins daily formula practice & review mistakes in personal mistake book.\n` +
      `Verify live growth report: https://zyzus.com/student/growth`;

    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, w, mo, r, a] = await Promise.all([
        studentPerformanceService.getPerformanceOverview(studentId),
        studentPerformanceService.getWeeklyGrowthReport(studentId),
        studentPerformanceService.getMonthlyGrowthReport(studentId, selectedMonth),
        studentPerformanceService.getPersonalizedRecommendations(studentId),
        studentPerformanceService.getAchievements(studentId)
      ]);
      setMetrics(m);
      setWeeklyReport(w);
      setMonthlyReport(mo);
      setRecommendations(r);
      setAchievements(a);
      if (m.subjectSummaries.length > 0 && !selectedSubject) {
        setSelectedSubject(m.subjectSummaries[0].subject);
      }
    } catch (err) {
      console.error('Failed to load growth intelligence', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = academicEntitlementService.subscribe(() => {
      setEntitlement(academicEntitlementService.evaluateAccess(studentId, 'GROWING_INTELLIGENCE'));
    });
    return () => unsub();
  }, [studentId, selectedMonth]);

  const getClassificationBadge = (classification: SubjectPerformanceSummary['classification']) => {
    switch (classification) {
      case 'EXCELLENT':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">★ Excellent</span>;
      case 'GOOD':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">✓ Good</span>;
      case 'AVERAGE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">~ Average</span>;
      case 'NEEDS_IMPROVEMENT':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">! Needs Improvement</span>;
      default:
        return null;
    }
  };

  const getTopicMasteryBadge = (status: 'MASTERED' | 'DEVELOPING' | 'CRITICAL_GAP') => {
    switch (status) {
      case 'MASTERED':
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Mastered</span>;
      case 'DEVELOPING':
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Developing</span>;
      case 'CRITICAL_GAP':
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800">Critical Gap</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-44 rounded-2xl bg-slate-900 border border-slate-800" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-28 rounded-xl bg-slate-100 border border-slate-200" />
          <div className="h-28 rounded-xl bg-slate-100 border border-slate-200" />
          <div className="h-28 rounded-xl bg-slate-100 border border-slate-200" />
          <div className="h-28 rounded-xl bg-slate-100 border border-slate-200" />
        </div>
        <div className="h-72 rounded-xl bg-slate-100 border border-slate-200" />
      </div>
    );
  }

  // Strict zero fake data: Only display actual test intelligence if assessments exist
  const hasData = Boolean(metrics && metrics.totalTests > 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner — ZYZU'S Academic Intelligence */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-indigo-500/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>ZYZU'S Academic Intelligence</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex flex-wrap items-baseline gap-2.5">
                <span>My Growth</span>
                <span className="text-slate-400 text-sm sm:text-base font-normal">
                  — Your Personal Learning &amp; Growth Center
                </span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mt-1.5 leading-relaxed">
                Multi-dimensional diagnostic metrics, topic mastery detection, graduated AI interventions, and certified progress statements.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/student/store">
              <Button variant="outline" className="border-indigo-500/50 bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-200 gap-2 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Learning Store
              </Button>
            </Link>
            <Link to="/student/mock-tests">
              <Button variant="outline" className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white gap-2 text-xs font-bold">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                Govt Mock Tests
              </Button>
            </Link>
            <Link to="/student/mistakes">
              <Button variant="outline" className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white gap-2 text-xs font-bold">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                Mistake Book
              </Button>
            </Link>
            {hasData && (
              <>
                <Button 
                  onClick={() => setIsParentModalOpen(true)}
                  variant="outline"
                  className="border-emerald-500/50 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 font-bold gap-2 text-xs"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Parent View
                </Button>
                <Button 
                  onClick={() => setIsReportModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2 text-xs shadow-lg shadow-indigo-600/30"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Monthly Report
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Non-Destructive Entitlement Banner */}
      {!entitlement.hasAccess && (
        <div className={`p-5 rounded-2xl border transition-all ${
          entitlement.accessState === 'EXPIRED' 
            ? 'bg-amber-50 border-amber-300 text-amber-900' 
            : 'bg-indigo-50 border-indigo-300 text-indigo-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {entitlement.accessState === 'EXPIRED' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  {entitlement.accessState === 'EXPIRED' 
                    ? 'Growth Intelligence Pass Expired — Historical Trajectory Preserved' 
                    : 'Unlock Continuous AI Weakness Tracking & Predictive AIR'}
                </div>
                <div className="text-xs mt-1 leading-relaxed text-slate-700">
                  {entitlement.accessState === 'EXPIRED'
                    ? `Your subscription for ${entitlement.matchingSubscription?.productName || 'Growing Intelligence'} expired on ${entitlement.matchingSubscription?.endDate}. All historical velocity graphs, subject mastery records, and monthly reports remain visible below. Renew your subscription to calculate new test analytics and receive live AI recommendations.`
                    : 'Subscribe to any Mock Test or Complete Exam Package to compute real-time mastery metrics from your test attempts and unlock automated weekly progress reports.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                onClick={() => navigate('/student/store')}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {entitlement.accessState === 'EXPIRED' ? 'Renew Intelligence Pass' : 'Browse Store'}
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'OVERVIEW', label: 'My Growth', icon: BarChart3 },
          { id: 'SUBJECTS', label: 'Subject Performance', icon: Target },
          { id: 'TIMELINE', label: 'Test Performance', icon: Clock },
          { id: 'WEEKLY', label: 'Weekly Progress', icon: TrendingUp },
          { id: 'MONTHLY', label: 'Monthly Progress', icon: Calendar },
          { id: 'RECOMMENDATIONS', label: 'Learning Recommendations', icon: Sparkles, badge: recommendations.length },
          { id: 'ACHIEVEMENTS', label: 'Achievements', icon: Award, badge: achievements.length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs md:text-sm whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* EMPTY STATE IF NO DATA AT ALL */}
      {(!metrics || metrics.totalTests === 0) ? (
        <Card className="p-12 text-center border-dashed border-2 border-slate-300 bg-slate-50/60 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center mb-4 shadow-sm border border-indigo-200">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Performance Insights Yet</h3>
          <p className="text-slate-600 text-sm max-w-md mx-auto mb-2">
            Data will appear after your first test.
          </p>
          <p className="text-slate-500 text-xs max-w-md mx-auto mb-6">
            Complete more assessments to unlock this insight, including topic mastery scores, accuracy diagnostics, and personalized recommendations.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/student/mock-tests">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2 text-xs shadow-md">
                <Target className="w-4 h-4" /> Start Your First Mock Test
              </Button>
            </Link>
            <Link to="/student/tutor">
              <Button variant="outline" className="gap-2 text-xs font-bold border-slate-300 text-slate-700">
                <GraduationCap className="w-4 h-4" /> Connect with My Tutor
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* TAB 1: OVERVIEW — MY GROWTH */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Primary Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Tests"
                  value={metrics.totalTests}
                  subtitle={`${metrics.mockTestsCompleted} Govt Mocks • ${metrics.totalTests - metrics.mockTestsCompleted} Classroom Tests`}
                  icon={<BookOpen className="w-5 h-5" />}
                />
                <StatCard
                  title="Average Score"
                  value={`${metrics.averagePercentage}%`}
                  subtitle={metrics.improvementRate > 0 ? `+${metrics.improvementRate}% vs older period` : 'Steady performance'}
                  icon={<BarChart3 className="w-5 h-5" />}
                />
                <StatCard
                  title="Overall Accuracy"
                  value={`${metrics.overallAccuracy}%`}
                  subtitle={`${metrics.totalQuestionsAttempted} Questions Logged`}
                  icon={<Target className="w-5 h-5" />}
                />
                <StatCard
                  title="Attention Area"
                  value={metrics.subjectNeedingAttention || 'None'}
                  subtitle="Identified for intervention"
                  icon={<AlertTriangle className="w-5 h-5" />}
                />
              </div>

              {/* High-Level Diagnostics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Strengths & Areas to Improve Cards */}
                <Card className="p-5 border-slate-200">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-600" />
                      Strengths &amp; Focus Areas
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">Real-time</span>
                  </div>

                  <div className="space-y-4">
                    {/* Strengths */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Strengths
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">
                          Highest Mastery
                        </span>
                      </div>
                      <p className="text-base font-black text-emerald-950 mt-1">
                        {metrics.strongestSubject || 'Data will appear after your first test.'}
                      </p>
                      <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                        Consistently high scores and high accuracy across recent assessments.
                      </p>
                    </div>

                    {/* Areas to Improve */}
                    <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200">
                      <div className="flex items-center justify-between text-xs font-semibold text-rose-800 mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Areas to Improve
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 px-2 py-0.5 rounded text-rose-800">
                          Priority
                        </span>
                      </div>
                      <p className="text-base font-black text-rose-950 mt-1">
                        {metrics.subjectNeedingAttention || 'No weak areas identified.'}
                      </p>
                      <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                        Recommended for targeted practice, formula revision, and teacher guidance.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Subject Mastery Distribution */}
                <Card className="p-5 border-slate-200 md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-brand-600" />
                      Subject Performance Breakdown
                    </h3>
                    <button 
                      onClick={() => setActiveTab('SUBJECTS')}
                      className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
                    >
                      Detailed View <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {metrics.subjectSummaries.map(sub => (
                      <div key={sub.subject} className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 bg-white transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{sub.subject}</span>
                            <span className="text-xs text-slate-500 font-mono">({sub.testCount} tests)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getClassificationBadge(sub.classification)}
                            <span className="font-mono font-bold text-slate-900 text-sm">{sub.averagePercentage}%</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sub.averagePercentage >= 85 ? 'bg-emerald-500' :
                              sub.averagePercentage >= 70 ? 'bg-blue-500' :
                              sub.averagePercentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, sub.averagePercentage)}%` }}
                          />
                        </div>

                        {sub.weakTopics.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600">
                            <span className="text-slate-400 font-semibold">Priority Topics:</span>
                            {sub.weakTopics.map(t => (
                              <span key={t} className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Active AI Interventions Preview */}
              {recommendations.length > 0 && (
                <Card className="p-6 border-brand-200 bg-gradient-to-br from-brand-50/50 via-white to-amber-50/40">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-950 text-sm md:text-base">
                          Graduated Academic Interventions Generated For You
                        </h3>
                        <p className="text-xs text-slate-600">
                          Transparent recommendations derived from your lowest accuracy topics.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('RECOMMENDATIONS')}
                      className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
                    >
                      View All ({recommendations.length}) <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.slice(0, 2).map(rec => (
                      <div key={rec.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              rec.level === 'LEVEL_1_MATERIAL' ? 'bg-blue-100 text-blue-800' :
                              rec.level === 'LEVEL_2_REVISION' ? 'bg-amber-100 text-amber-800' :
                              rec.level === 'LEVEL_3_TEACHER' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {rec.level.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs font-bold text-slate-500">{rec.subject}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mb-1">{rec.title}</h4>
                          <p className="text-xs text-slate-600 mb-3">{rec.description}</p>
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 italic">
                            💡 <span className="font-semibold text-slate-700">Reason:</span> {rec.transparentReason}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500">Action: {rec.actionType.replace(/_/g, ' ')}</span>
                          <button
                            onClick={() => setActiveTab('RECOMMENDATIONS')}
                            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                          >
                            Proceed <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recent Test History Log */}
              <Card className="p-5 border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-600" />
                    Recent Assessments Audit Log
                  </h3>
                  <span className="text-xs text-slate-500">Showing last {metrics.recentTests.length} tests</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                        <th className="py-2.5 px-3">Test Title</th>
                        <th className="py-2.5 px-3">Subject & Topic</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-right">Score</th>
                        <th className="py-2.5 px-3 text-right">Percentage</th>
                        <th className="py-2.5 px-3">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {metrics.recentTests.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-900">{t.testName}</td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-slate-800">{t.subject}</span>
                            {t.topic && <span className="text-slate-500 block text-[11px]">{t.topic}</span>}
                          </td>
                          <td className="py-3 px-3 text-slate-600">{t.testDate}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                            {t.marksObtained} / {t.totalMarks}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              t.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' :
                              t.percentage >= 50 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {t.percentage}%
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {t.source}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: WEEKLY GROWTH */}
          {activeTab === 'WEEKLY' && weeklyReport && (
            <div className="space-y-6">
              <Card className="p-6 border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-brand-600" />
                      Weekly Performance Report ({weeklyReport.weekLabel})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Assessment activity recorded from {weeklyReport.startDate} to {weeklyReport.endDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> +{weeklyReport.previousWeekImprovement}% vs previous week
                    </span>
                  </div>
                </div>

                {/* Metric Strip */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <span className="text-xs text-slate-500 block">Tests Logged</span>
                    <span className="text-xl font-black text-slate-900">{weeklyReport.testsCompleted}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <span className="text-xs text-slate-500 block">Questions Solved</span>
                    <span className="text-xl font-black text-slate-900">{weeklyReport.questionsAttempted}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <span className="text-xs text-slate-500 block">Correct Answers</span>
                    <span className="text-xl font-black text-emerald-600">{weeklyReport.correctCount}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <span className="text-xs text-slate-500 block">Incorrect Answers</span>
                    <span className="text-xl font-black text-rose-600">{weeklyReport.incorrectCount}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <span className="text-xs text-slate-500 block">Study Activity</span>
                    <span className="text-xl font-black text-brand-600">{weeklyReport.learningActivityHours} hrs</span>
                  </div>
                </div>

                {/* Weekly Subject Performance Table */}
                <h4 className="font-bold text-slate-900 text-sm mb-3">Weekly Subject Trajectory</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3 text-center">Tests</th>
                        <th className="py-2.5 px-3 text-right">Average Score</th>
                        <th className="py-2.5 px-3 text-right">Accuracy</th>
                        <th className="py-2.5 px-3 text-center">Trend</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {weeklyReport.subjectWise.map(row => (
                        <tr key={row.subject} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3 font-bold text-slate-900">{row.subject}</td>
                          <td className="py-3 px-3 text-center font-mono">{row.tests}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold">{row.averageScore}%</td>
                          <td className="py-3 px-3 text-right font-mono">{row.accuracy}%</td>
                          <td className="py-3 px-3 text-center">
                            {row.trend === 'UP' ? <span className="text-emerald-600 font-bold">↑ Improving</span> :
                             row.trend === 'DOWN' ? <span className="text-rose-600 font-bold">↓ Declining</span> :
                             <span className="text-slate-500">→ Steady</span>}
                          </td>
                          <td className="py-3 px-3">{getClassificationBadge(row.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: MONTHLY GROWTH */}
          {activeTab === 'MONTHLY' && monthlyReport && (
            <div className="space-y-6">
              <Card className="p-6 border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-brand-600" />
                      Comprehensive Monthly Academic Statement
                    </h3>
                    <p className="text-xs text-slate-500">Consolidated analytics for {monthlyReport.monthLabel}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
                    >
                      <option value="2026-09">September 2026 (Current)</option>
                      <option value="2026-08">August 2026 (Historical)</option>
                    </select>
                    <Button 
                      onClick={() => setIsReportModalOpen(true)}
                      variant="outline" 
                      className="text-xs font-bold gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Statement
                    </Button>
                  </div>
                </div>

                {/* Highlights Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500">Total Marks Scored</span>
                    <p className="text-lg font-black text-slate-900 mt-1 font-mono">
                      {monthlyReport.marksObtained} <span className="text-xs text-slate-500 font-normal">/ {monthlyReport.totalMarks}</span>
                    </p>
                    <span className="text-xs font-bold text-brand-600">{monthlyReport.averagePercentage}% Aggregate</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500">Consistency Index</span>
                    <p className="text-lg font-black text-slate-900 mt-1 font-mono">{monthlyReport.consistencyScore} / 100</p>
                    <span className="text-xs text-emerald-600 font-medium">Regular attendance & testing</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500">Test Sources</span>
                    <p className="text-lg font-black text-slate-900 mt-1 font-mono">
                      {monthlyReport.teacherTestsCount} <span className="text-xs text-slate-500 font-normal">Classroom</span> • {monthlyReport.mockTestsCount} <span className="text-xs text-slate-500 font-normal">Mocks</span>
                    </p>
                    <span className="text-xs text-slate-500">{monthlyReport.selfTestsCount} Self-drills</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500">Net Improvement</span>
                    <p className="text-lg font-black text-emerald-600 mt-1 font-mono">+{monthlyReport.improvementPercentage}%</p>
                    <span className="text-xs text-slate-500">Compared to prior month</span>
                  </div>
                </div>

                {/* Subject Monthly Trends */}
                <h4 className="font-bold text-slate-900 text-sm mb-3">Month-over-Month Subject Comparison</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3 text-right">Current Month</th>
                        <th className="py-2.5 px-3 text-right">Previous Month</th>
                        <th className="py-2.5 px-3 text-right">Variance</th>
                        <th className="py-2.5 px-3">Performance Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {monthlyReport.subjectTrends.map(tr => (
                        <tr key={tr.subject} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3 font-bold text-slate-900">{tr.subject}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold">{tr.percentage}%</td>
                          <td className="py-3 px-3 text-right font-mono text-slate-500">{tr.previousPercentage || 0}%</td>
                          <td className="py-3 px-3 text-right font-mono font-bold">
                            <span className={tr.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                              {tr.change >= 0 ? `+${tr.change}%` : `${tr.change}%`}
                            </span>
                          </td>
                          <td className="py-3 px-3">{getClassificationBadge(tr.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Teacher Remarks Section */}
                {monthlyReport.teacherRemarks && monthlyReport.teacherRemarks.length > 0 && (
                  <div className="mt-6 p-4 rounded-xl bg-brand-50/60 border border-brand-200">
                    <h5 className="font-bold text-brand-950 text-xs flex items-center gap-1.5 mb-2">
                      <GraduationCap className="w-4 h-4 text-brand-700" />
                      Allotted Teacher Qualitative Assessment
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {monthlyReport.teacherRemarks.map((remark, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-brand-600 font-bold">•</span>
                          <span>"{remark}"</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* TAB 4: SUBJECTS DETAILED BREAKDOWN */}
          {activeTab === 'SUBJECTS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Subject Selector Sidebar */}
                <Card className="p-4 border-slate-200 h-fit space-y-2">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Enrolled Subjects
                  </h3>
                  {metrics.subjectSummaries.map(sub => (
                    <button
                      key={sub.subject}
                      onClick={() => setSelectedSubject(sub.subject)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                        selectedSubject === sub.subject
                          ? 'bg-brand-50 border border-brand-300 shadow-xs'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div>
                        <p className={`font-bold text-sm ${selectedSubject === sub.subject ? 'text-brand-950' : 'text-slate-800'}`}>
                          {sub.subject}
                        </p>
                        <span className="text-xs text-slate-500 font-mono">{sub.testCount} tests recorded</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-sm">{sub.averagePercentage}%</span>
                    </button>
                  ))}
                </Card>

                {/* Selected Subject Deep Dive */}
                <div className="md:col-span-2 space-y-6">
                  {(() => {
                    const currentSub = metrics.subjectSummaries.find(s => s.subject === selectedSubject) || metrics.subjectSummaries[0];
                    if (!currentSub) return null;

                    return (
                      <Card className="p-6 border-slate-200 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-black text-slate-950">{currentSub.subject}</h3>
                              {getClassificationBadge(currentSub.classification)}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Last assessed on {currentSub.lastAssessedDate || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-500">Average Performance</span>
                            <p className="text-2xl font-black text-slate-900 font-mono">{currentSub.averagePercentage}%</p>
                          </div>
                        </div>

                        {/* Topics Matrix */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                            <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5 mb-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Demonstrated Strengths
                            </h4>
                            {currentSub.strongTopics.length > 0 ? (
                              <ul className="space-y-1 text-xs text-emerald-900">
                                {currentSub.strongTopics.map(st => (
                                  <li key={st} className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    {st}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-emerald-700 italic">Continue assessments to identify strong chapters.</p>
                            )}
                          </div>

                          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80">
                            <h4 className="font-bold text-rose-900 text-xs flex items-center gap-1.5 mb-2">
                              <AlertTriangle className="w-4 h-4 text-rose-600" /> Focus Areas Requiring Practice
                            </h4>
                            {currentSub.weakTopics.length > 0 ? (
                              <ul className="space-y-1 text-xs text-rose-900">
                                {currentSub.weakTopics.map(wt => (
                                  <li key={wt} className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                    {wt}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-rose-700 italic">No specific weak areas detected.</p>
                            )}
                          </div>
                        </div>

                        {/* Subject Recent Tests */}
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-3">
                            Assessment Log for {currentSub.subject}
                          </h4>
                          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                            {metrics.recentTests.filter(t => t.subject === currentSub.subject).map(test => (
                              <div key={test.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                                <div>
                                  <p className="font-bold text-slate-900 text-xs">{test.testName}</p>
                                  <span className="text-[11px] text-slate-500">{test.testDate} • {test.source}</span>
                                </div>
                                <div className="text-right font-mono">
                                  <span className="font-bold text-slate-900 text-xs">{test.marksObtained} / {test.totalMarks}</span>
                                  <span className="text-[11px] text-slate-500 block">({test.percentage}%)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI GRADUATED RECOMMENDATIONS */}
          {activeTab === 'RECOMMENDATIONS' && (
            <div className="space-y-6">
              <Card className="p-6 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-950 text-base">
                        Personalized Graduated Learning Interventions
                      </h3>
                      <p className="text-xs text-slate-500">
                        Rule 30 Protocol: Level 1 (Material) → Level 2 (Revision Drill) → Level 3 (Specialized Teacher) → Level 4 (Comprehensive Plan)
                      </p>
                    </div>
                  </div>
                </div>

                {recommendations.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl mt-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <h4 className="font-bold text-slate-900 text-sm">No Urgent Interventions Required</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      All your recent assessments meet or exceed expected accuracy standards. Maintain your current study momentum!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 mt-6">
                    {recommendations.map(rec => (
                      <div key={rec.id} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                              rec.level === 'LEVEL_1_MATERIAL' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              rec.level === 'LEVEL_2_REVISION' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              rec.level === 'LEVEL_3_TEACHER' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 
                              'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {rec.level.replace(/_/g, ' ')}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">{rec.subject}</span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">Action: {rec.actionType.replace(/_/g, ' ')}</span>
                        </div>

                        <h4 className="text-base font-bold text-slate-950 mb-1">{rec.title}</h4>
                        <p className="text-xs text-slate-600 mb-4">{rec.description}</p>

                        {/* Transparent Explanation Box */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <span className="font-bold text-slate-800">Transparent Diagnosis: </span>
                            <span className="text-slate-600">{rec.transparentReason}</span>
                          </div>
                        </div>

                        {/* Specific Subsystem Integration Cards */}
                        {rec.level === 'LEVEL_3_TEACHER' && rec.teacherDetails && (
                          <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                                {rec.teacherDetails.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-bold text-slate-950 text-xs md:text-sm">{rec.teacherDetails.name}</p>
                                <span className="text-[11px] text-slate-600">
                                  {rec.teacherDetails.specialization} Specialist • {rec.teacherDetails.experienceYears} yrs exp • {rec.teacherDetails.district}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 text-xs">₹{rec.teacherDetails.feePerMonth}/mo</span>
                              <Link to="/student/request-tutor">
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1">
                                  Book Consultation <ArrowRight className="w-3 h-3" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )}

                        {rec.level === 'LEVEL_1_MATERIAL' && rec.studyMaterialDetails && (
                          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="font-bold text-slate-900 text-xs">{rec.studyMaterialDetails.title}</p>
                                <span className="text-[11px] text-slate-500">{rec.studyMaterialDetails.fileType} Document • Instant Vault Access</span>
                              </div>
                            </div>
                            <Link to="/student/study-material">
                              <Button size="sm" variant="outline" className="text-xs font-bold text-blue-700 border-blue-300">
                                Access Material
                              </Button>
                            </Link>
                          </div>
                        )}

                        {rec.level === 'LEVEL_4_PLAN' && rec.learningPlanDetails && (
                          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 mb-4">
                            <h5 className="font-bold text-emerald-950 text-xs mb-2">4-Week Structured Learning Protocol</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {rec.learningPlanDetails.weeks.map(w => (
                                <div key={w.week} className="p-2.5 rounded-lg bg-white border border-emerald-100 text-xs">
                                  <span className="font-bold text-emerald-800 block">Week {w.week}: {w.title}</span>
                                  <ul className="mt-1 text-[11px] text-slate-600 list-disc list-inside">
                                    {w.tasks.map((task, tidx) => (
                                      <li key={tidx}>{task}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {rec.level === 'LEVEL_2_REVISION' && (
                          <div className="flex justify-end">
                            <Link to="/student/mock-tests">
                              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5">
                                <Target className="w-3.5 h-3.5" /> Start Revision Drill
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* TAB 6: PERFORMANCE TIMELINE */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-6">
              <Card className="p-6 border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-600" />
                  Academic Growth & Intervention Journey
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Chronological trail tracing assessments, weakness diagnostics, interventions, and score progression.
                </p>

                <div className="relative pl-6 border-l-2 border-slate-200 space-y-8">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                    <div>
                      <span className="text-xs font-mono text-slate-400">September 18, 2026</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">Fortnightly Math Assessment</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Scored 23/50 (46%). Commercial arithmetic difficulty flagged in Time & Work. Tier-3 recommendation generated.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                    <div>
                      <span className="text-xs font-mono text-slate-400">September 16, 2026</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">Mid-Month English Review</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Scored 45/50 (90%). Demonstrated high accuracy in Reading Comprehension. Maintained "EXCELLENT" status.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-sm"></div>
                    <div>
                      <span className="text-xs font-mono text-slate-400">September 11, 2026</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">Weekly Math Chapter Test 2</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Scored 24/50 (48%). Profit & Loss false weight trap questions triggered mistake book logging.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-brand-500 border-2 border-white shadow-sm"></div>
                    <div>
                      <span className="text-xs font-mono text-slate-400">September 04, 2026</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">Academic Journey Baseline Initiated</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        First assessment recorded by Dr. Rajesh Sharma. Performance tracking baseline calibrated.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 7: ACHIEVEMENTS */}
          {activeTab === 'ACHIEVEMENTS' && (
            <div className="space-y-6">
              <Card className="p-6 border-slate-200">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950 text-base">Academic Milestones & Badges</h3>
                    <p className="text-xs text-slate-500">Earned through authentic verified assessment milestones</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {achievements.map(ach => (
                    <div key={ach.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        {ach.icon === 'Sparkles' ? <Sparkles className="w-5 h-5" /> :
                         ach.icon === 'Flame' ? <Flame className="w-5 h-5 text-rose-500" /> :
                         <Award className="w-5 h-5 text-amber-600" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{ach.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">{ach.description}</p>
                        <span className="text-[10px] text-amber-800 font-mono font-semibold block mt-2">
                          Unlocked on {new Date(ach.unlockedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* MONTHLY REPORT MODAL */}
      {isReportModalOpen && monthlyReport && (
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          title="ZYZU'S Official Academic Performance Statement"
          maxWidth="2xl"
        >
          <div className="space-y-6 text-slate-900 p-2">
            <div className="border-b-2 border-brand-600 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">ZYZU'S ACADEMIC REPORT</h2>
                <p className="text-xs text-slate-500">Government Exam & Home Tuition Intelligence Engine</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-brand-700">REP-2026-09-{studentId.slice(-6)}</span>
                <p className="text-xs text-slate-400">{monthlyReport.monthLabel}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Candidate</span>
                <span className="font-bold text-slate-900">{user?.name || 'Aryan Singh'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Assessments</span>
                <span className="font-bold text-slate-900">{monthlyReport.totalTests} Recorded</span>
              </div>
              <div>
                <span className="text-slate-400 block">Marks Obtained</span>
                <span className="font-bold text-slate-900">{monthlyReport.marksObtained} / {monthlyReport.totalMarks}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Average Percentage</span>
                <span className="font-bold text-brand-700">{monthlyReport.averagePercentage}%</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Subject Performance Registry</h4>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-2.5">Subject</th>
                    <th className="p-2.5 text-right">Score %</th>
                    <th className="p-2.5 text-right">Prior Month</th>
                    <th className="p-2.5">Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyReport.subjectTrends.map(s => (
                    <tr key={s.subject}>
                      <td className="p-2.5 font-bold">{s.subject}</td>
                      <td className="p-2.5 text-right font-mono font-bold">{s.percentage}%</td>
                      <td className="p-2.5 text-right font-mono text-slate-500">{s.previousPercentage || 0}%</td>
                      <td className="p-2.5">{getClassificationBadge(s.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {monthlyReport.teacherRemarks && monthlyReport.teacherRemarks.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 block mb-1">Teacher Observations:</span>
                <p className="text-slate-600 italic">"{monthlyReport.teacherRemarks[0]}"</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-[11px] text-slate-400">Authenticated by ZYZU'S Central Academic OS</span>
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.print()} 
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold gap-2 text-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsReportModalOpen(false)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      {/* PARENT & GUARDIAN SUMMARY MODAL (Section 39) */}
      {isParentModalOpen && metrics && (
        <Modal
          isOpen={isParentModalOpen}
          onClose={() => setIsParentModalOpen(false)}
          title="Parent & Guardian Academic Progress Summary"
          maxWidth="2xl"
        >
          <div className="space-y-6 text-slate-900 p-2">
            {/* Friendly Non-Technical Banner */}
            <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-300 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base">
                    Weekly Learning Journey for {user?.name || 'Aryan Singh'}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Designed in simple, non-technical language to give parents complete peace of mind and clear guidance on home study encouragement.
                  </p>
                </div>
              </div>
            </div>

            {/* At-A-Glance Progress Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Overall Academic Standing</span>
                <p className="font-extrabold text-sm text-emerald-800 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {metrics.averagePercentage >= 75 ? 'Excelling & On Track' : 
                   metrics.averagePercentage >= 60 ? 'Consistent & Progressing' : 'Needs Practice Support'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Recent Assessment Score</span>
                <p className="font-extrabold text-sm text-slate-900 mt-1 font-mono">
                  {metrics.averagePercentage}% average ({metrics.overallAccuracy}% accuracy)
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Study Trajectory</span>
                <p className={`font-extrabold text-sm mt-1 font-mono ${metrics.improvementRate >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {metrics.improvementRate >= 0 ? `+${metrics.improvementRate}% improvement` : `${metrics.improvementRate}%`}
                </p>
              </div>
            </div>

            {/* Strengths & Practice Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  What Your Child Is Doing Great
                </h4>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Demonstrates strong mastery and confidence in <strong>{metrics.strongestSubject || 'All core subjects'}</strong>. Accuracy in foundational concepts has remained consistently high across weekly assessments.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Where Your Child Needs Encouragement
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Focus area identified in <strong>{metrics.subjectNeedingAttention || 'Regular chapter revision'}</strong>. Practicing mistakes from the Personal Mistake Book for 15 minutes daily will boost exam confidence.
                </p>
              </div>
            </div>

            {/* Teacher Qualitative Feedback */}
            {monthlyReport?.teacherRemarks && monthlyReport.teacherRemarks.length > 0 && (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                <h4 className="font-bold text-blue-950 text-xs flex items-center gap-1.5 mb-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Direct Teacher Note for Parents
                </h4>
                <p className="text-xs text-slate-700 italic">
                  "{monthlyReport.teacherRemarks[0]}"
                </p>
              </div>
            )}

            {/* Practical Home Support Tips */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-2">
                Helpful Tips for Parents at Home:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                <li>Celebrate improvement and positive effort rather than only marks.</li>
                <li>Encourage 15–20 minutes of quiet, distraction-free formula revision in the evening.</li>
                <li>Review the ZYZU'S Mistake Book together on weekends to turn errors into lessons.</li>
              </ul>
            </div>

            {/* Actions: Copy WhatsApp Message & Print */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <span className="text-[11px] text-slate-400">
                ZYZU'S Academic Intelligence • Verified Parent Summary
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button 
                  onClick={handleCopyWhatsAppSummary}
                  className={`text-xs font-bold gap-1.5 flex-1 sm:flex-initial ${
                    copiedWhatsApp ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {copiedWhatsApp ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied for WhatsApp!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Copy WhatsApp Update</span>
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => window.print()}
                  variant="outline"
                  className="text-xs font-bold gap-1.5 border-slate-300"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Card</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsParentModalOpen(false)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
