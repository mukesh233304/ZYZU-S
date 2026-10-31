import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, ArrowRight, ShieldCheck, 
  Clock, BookOpen, Award, FileText, ChevronRight, 
  BarChart3, Zap, BrainCircuit, BookMarked, UserCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { ServiceRegistrationGateModal } from '../../components/common/ServiceRegistrationGateModal';
import { FocusPointAdCarousel } from '../../components/common/FocusPointAdCarousel';
import { notificationEventService } from '../../services/notificationEventService';

export const MockTestsPublicPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gateOpen, setGateOpen] = useState(false);
  const [selectedExamTab, setSelectedExamTab] = useState('ALL');

  // AI Agent Event Hook: Detect mock test exploration
  useEffect(() => {
    if (selectedExamTab === 'ALL') return;
    const timer = setTimeout(() => {
      notificationEventService.emitMockTestSearch({
        examCategory: selectedExamTab,
        districtName: user?.districtName || 'Pan-India',
        userId: user?.id,
        userName: user?.name,
        userPhone: user?.phone
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedExamTab, user]);

  const handleStartTest = (examTitle: string) => {
    notificationEventService.emitMockTestSearch({
      query: examTitle,
      examCategory: selectedExamTab !== 'ALL' ? selectedExamTab : undefined,
      districtName: user?.districtName || 'Pan-India',
      userId: user?.id,
      userName: user?.name,
      userPhone: user?.phone
    });

    if (user) {
      navigate('/student/mock-tests');
    } else {
      setGateOpen(true);
    }
  };

  const EXAMS = [
    {
      id: 'chs-9',
      category: 'CHS',
      title: 'BHU CHS Class 9 Entrance Test Series 2026',
      totalTests: 15,
      questions: 100,
      duration: '120 Mins',
      languages: 'Hindi & English',
      badge: 'Bestseller',
      highlight: 'Full Length + 5 Year PYQ Solved'
    },
    {
      id: 'chs-11-sci',
      category: 'CHS',
      title: 'BHU CHS Class 11 Math & Biology Stream Test Series',
      totalTests: 18,
      questions: 100,
      duration: '120 Mins',
      languages: 'Hindi & English',
      badge: 'Popular',
      highlight: 'Chapterwise + Mock Ranks'
    },
    {
      id: 'navodaya-6',
      category: 'NAVODAYA',
      title: 'JNVST Class 6 Navodaya Vidyalaya Selection Test',
      totalTests: 20,
      questions: 80,
      duration: '120 Mins',
      languages: 'Hindi & English',
      badge: 'Trending',
      highlight: 'Mental Ability + Math + Language'
    },
    {
      id: 'neet-bio-chem',
      category: 'NEET',
      title: 'NEET UG 2026 High-Yield Full Mock Diagnostic',
      totalTests: 25,
      questions: 200,
      duration: '200 Mins',
      languages: 'English',
      badge: 'Elite AI',
      highlight: 'NTA Standard Mistake Book Sync'
    },
    {
      id: 'jee-main',
      category: 'JEE',
      title: 'JEE Main CBT Full Mock & Previous Year Series',
      totalTests: 30,
      questions: 75,
      duration: '180 Mins',
      languages: 'English',
      badge: 'Intelligent',
      highlight: 'Speed vs Accuracy Analytics'
    },
    {
      id: 'govt-ssc-up',
      category: 'GOVERNMENT',
      title: 'UP Police & SSC Constable / SI Complete Mock Test',
      totalTests: 22,
      questions: 150,
      duration: '120 Mins',
      languages: 'Hindi',
      badge: 'Govt Prep',
      highlight: 'All-India Rank Percentile'
    },
    {
      id: 'olympiad-math',
      category: 'OLYMPIAD',
      title: 'IMO & NSO Science & Math Olympiad Foundation',
      totalTests: 12,
      questions: 50,
      duration: '60 Mins',
      languages: 'English',
      badge: 'Foundation',
      highlight: 'Logic & Critical Thinking'
    }
  ];

  const filteredExams = selectedExamTab === 'ALL'
    ? EXAMS
    : EXAMS.filter(e => e.category === selectedExamTab);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/50">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black uppercase tracking-wider shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Official Exam Test Series & Test Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
            Government Exam & School Entrance <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
              Mock Test Intelligence
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Real exam simulation, All-India Rank analytics, personal mistake book tracking, and verified previous-year question papers for CHS, Navodaya, NEET, JEE, and Government exams.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button
              size="lg"
              onClick={() => handleStartTest('Free Diagnostic Test')}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="shadow-xl shadow-brand-500/25 font-bold"
            >
              Start Free Practice Test
            </Button>
            {user ? (
              <Link to="/student/mock-tests">
                <Button size="lg" variant="outline" className="border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold">
                  Go to Student Test Center
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setGateOpen(true)}
                className="border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold"
              >
                Sign In to Save Scores
              </Button>
            )}
          </div>

          {/* Value Tags */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-slate-400 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>NTA CBT Interface</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Personal Mistake Book</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Detailed Step Solutions</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>State & District Ranks</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* FOCUSPOINT ADVERTISEMENT CAROUSEL — SERVICE ENGINE (MOCK TESTS) */}
        <FocusPointAdCarousel page="MOCK_TESTS" className="mb-8" />

        {/* Category Switcher Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Browse by Target Examination
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Curated by top educators and district toppers with authentic previous year weightage.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 overflow-x-auto max-w-full">
            {['ALL', 'CHS', 'NAVODAYA', 'NEET', 'JEE', 'GOVERNMENT', 'OLYMPIAD'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedExamTab(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedExamTab === cat
                    ? 'bg-slate-950 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {cat === 'ALL' ? 'All Exams' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-brand-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[10px] font-black uppercase tracking-wider">
                    {exam.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                    {exam.badge}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-950 leading-snug">
                  {exam.title}
                </h3>

                <p className="text-xs text-brand-700 font-bold bg-brand-50/50 px-2.5 py-1 rounded-lg border border-brand-100 inline-block">
                  ✓ {exam.highlight}
                </p>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Tests</span>
                    <span className="font-black text-slate-900">{exam.totalTests} Mocks</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Questions</span>
                    <span className="font-black text-slate-900">{exam.questions} Qs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Duration</span>
                    <span className="font-black text-slate-900">{exam.duration}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{exam.languages}</span>
                <Button
                  size="sm"
                  onClick={() => handleStartTest(exam.title)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="font-bold shadow-xs"
                >
                  Attempt Mock
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Service Registration Gate */}
      <ServiceRegistrationGateModal
        isOpen={gateOpen}
        onClose={() => setGateOpen(false)}
        serviceTitle="Government Exam Mock Tests"
        serviceDescription="Sign in or register to access full-length test series, personal mistake book tracking, and percentile analytics."
        intendedDestination="/student/mock-tests"
      />
    </div>
  );
};
