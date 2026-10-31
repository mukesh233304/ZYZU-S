import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Target, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  BookMarked, 
  Award, 
  TrendingUp, 
  Zap, 
  Play, 
  Flame, 
  Layers, 
  GraduationCap, 
  RotateCcw, 
  AlertTriangle,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { Button } from '../common/Button';
import { ServiceRegistrationGateModal } from '../common/ServiceRegistrationGateModal';
import { useAuth } from '../../context/AuthContext';

interface MockCardData {
  id: string;
  examCode: string;
  examBadge: string;
  badgeColor: string;
  title: string;
  stream: string;
  authority: string;
  questionsCount: number;
  durationMins: number;
  marks: number;
  negativeMarking: string;
  totalMocksInSeries: number;
  rating: number;
  attemptsCount: number;
  highlights: string[];
  isPopular?: boolean;
}

const MOCK_TEST_SERIES_DATA: MockCardData[] = [
  {
    id: 'mock-chs-11-sci',
    examCode: 'CHS',
    examBadge: 'BHU CHS ENTRANCE',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    title: 'BHU Central Hindu School (Class 11 Science)',
    stream: 'CHS',
    authority: 'Banaras Hindu University',
    questionsCount: 100,
    durationMins: 120,
    marks: 100,
    negativeMarking: 'Zero Negative Marking',
    totalMocksInSeries: 15,
    rating: 4.9,
    attemptsCount: 3840,
    highlights: ['5-Year Solved Papers', 'Class 10 Syllabus Aligned', 'All-India Rank Percentile'],
    isPopular: true
  },
  {
    id: 'mock-jnvst-6',
    examCode: 'NAVODAYA',
    examBadge: 'JNVST NAVODAYA',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    title: 'Jawahar Navodaya Vidyalaya Selection Test (Class 6)',
    stream: 'NAVODAYA',
    authority: 'Navodaya Vidyalaya Samiti',
    questionsCount: 80,
    durationMins: 120,
    marks: 100,
    negativeMarking: 'No Negative Marking',
    totalMocksInSeries: 20,
    rating: 4.8,
    attemptsCount: 5120,
    highlights: ['Mental Ability Tests', 'Arithmetic & Hindi Passages', 'OMR & CBT Mode Ready']
  },
  {
    id: 'mock-neet-ug-cbt',
    examCode: 'NEET',
    examBadge: 'NEET UG 2027',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    title: 'NEET UG National Medical Entrance Full CBT',
    stream: 'NEET',
    authority: 'National Testing Agency (NTA)',
    questionsCount: 180,
    durationMins: 200,
    marks: 720,
    negativeMarking: '+4 / -1 Mark Scheme',
    totalMocksInSeries: 30,
    rating: 4.95,
    attemptsCount: 8400,
    highlights: ['Strict NTA 2026 Pattern', 'NCERT Line-by-Line Biology', 'Personal Mistake Book Sync'],
    isPopular: true
  },
  {
    id: 'mock-jee-main',
    examCode: 'JEE',
    examBadge: 'JEE MAIN CBT',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    title: 'JEE Main Engineering CBT Mock Test Series',
    stream: 'JEE',
    authority: 'National Testing Agency (NTA)',
    questionsCount: 75,
    durationMins: 180,
    marks: 300,
    negativeMarking: '+4 / -1 Mark Scheme',
    totalMocksInSeries: 25,
    rating: 4.9,
    attemptsCount: 6200,
    highlights: ['Numerical Value Questions', 'Speed & Accuracy AI Radar', 'Detailed Video Explanations']
  },
  {
    id: 'mock-up-police',
    examCode: 'GOVT_EXAMS',
    examBadge: 'UP POLICE & SI',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    title: 'Uttar Pradesh Police Constable & Sub-Inspector',
    stream: 'GOVT_EXAMS',
    authority: 'UPPRPB Lucknow',
    questionsCount: 150,
    durationMins: 120,
    marks: 300,
    negativeMarking: '+2 / -0.5 Mark Scheme',
    totalMocksInSeries: 22,
    rating: 4.85,
    attemptsCount: 9350,
    highlights: ['State-Wide Ranking', 'General Hindi & Law Modules', 'Real Exam Speed Simulator'],
    isPopular: true
  },
  {
    id: 'mock-ssc-cgl',
    examCode: 'GOVT_EXAMS',
    examBadge: 'SSC CGL TIER-1',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    title: 'Staff Selection Commission CGL Tier-1 CBT Mock',
    stream: 'GOVT_EXAMS',
    authority: 'Staff Selection Commission (SSC)',
    questionsCount: 100,
    durationMins: 60,
    marks: 200,
    negativeMarking: '+2 / -0.5 Mark Scheme',
    totalMocksInSeries: 35,
    rating: 4.9,
    attemptsCount: 7420,
    highlights: ['Strict 60-Minute Pressure Timer', 'Quant & Reasoning Shortcuts', 'Instant Solution Analysis']
  },
  {
    id: 'mock-olympiad-math',
    examCode: 'OLYMPIAD',
    examBadge: 'MATH OLYMPIAD',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    title: 'International Mathematics Olympiad (IMO Level 1 & 2)',
    stream: 'OLYMPIAD',
    authority: 'Science Olympiad Foundation (SOF)',
    questionsCount: 50,
    durationMins: 60,
    marks: 60,
    negativeMarking: 'Zero Negative Marking',
    totalMocksInSeries: 12,
    rating: 4.9,
    attemptsCount: 2900,
    highlights: ['Higher Order Thinking (HOTS)', 'Class 5-10 Difficulty Levels', 'Certificate Benchmark Rank']
  }
];

interface ExamTestIntelligenceSectionProps {
  maxDisplayCount?: number;
}

export const ExamTestIntelligenceSection: React.FC<ExamTestIntelligenceSectionProps> = ({
  maxDisplayCount = 3
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [selectedCbtOption, setSelectedCbtOption] = useState<number>(1);
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [gateServiceInfo, setGateServiceInfo] = useState<{ title: string; desc: string; path: string }>({
    title: 'Government Exam Mock Tests',
    desc: 'Access official test series, CBT simulators, and rank analytics.',
    path: '/mock-tests'
  });

  const streams = [
    { id: 'ALL', label: 'All Exam Streams' },
    { id: 'CHS', label: 'BHU CHS Entrance' },
    { id: 'NAVODAYA', label: 'JNVST Navodaya' },
    { id: 'NEET', label: 'NEET UG' },
    { id: 'JEE', label: 'JEE Main & Adv' },
    { id: 'GOVT_EXAMS', label: 'UP Police & SSC' },
    { id: 'OLYMPIAD', label: 'School Olympiads' },
  ];

  const filteredMocks = selectedStream === 'ALL' 
    ? MOCK_TEST_SERIES_DATA 
    : MOCK_TEST_SERIES_DATA.filter(m => m.stream === selectedStream);

  const displayedMocks = filteredMocks.slice(0, maxDisplayCount);

  const handleStartMock = (mockTitle: string, mockPath: string) => {
    if (!user) {
      setGateServiceInfo({
        title: mockTitle,
        desc: "Sign in or register your free ZYZU'S account to begin this full CBT examination attempt.",
        path: mockPath
      });
      setGateModalOpen(true);
    } else {
      navigate(mockPath);
    }
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14 overflow-hidden">
      {/* Background Decorative Ambient Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-brand-500/10 to-indigo-500/10 border border-purple-300/40 text-purple-700 text-xs font-black uppercase tracking-wider shadow-xs">
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            <span>NTA & Government CBT Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold text-emerald-700 normal-case">Live 2026-2027 Pattern</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Exam Test Series &amp;{' '}
            <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-brand-600 bg-clip-text text-transparent">
              Growing Intelligence
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Practice on authentic computer-based test (CBT) simulators replicating official NTA, BHU CHS, Navodaya, and state exam screens. Every wrong answer is automatically cataloged into your <strong className="text-slate-900">Personal Mistake Book</strong> with AI speed-accuracy diagnostics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/mock-tests">
            <Button
              variant="outline"
              size="md"
              className="border-purple-300 text-purple-900 hover:bg-purple-50 bg-white shadow-xs font-bold rounded-xl"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Further Explore (150+ Tests)
            </Button>
          </Link>
          <button
            onClick={() => handleStartMock('Free Diagnostic Mock Test', '/mock-tests?diagnostic=true')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Try Free Diagnostic CBT</span>
          </button>
        </div>
      </div>

      {/* Futuristic Live CBT Interface Simulator Banner (Interactive Showcase) */}
      <div className="mb-12 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 lg:p-10 shadow-2xl border border-indigo-900/60 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive CBT Question Screen */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono font-bold text-slate-400 ml-2">
                  CBT_ENGINE_v4.2 // OFFICIAL NTA SIMULATOR
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 font-mono text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>01:42:18 REMAINING</span>
              </div>
            </div>

            {/* Question Header */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-black border border-purple-500/30">
                  QUESTION 14 OF 100 • PHYSICS / MECHANICS
                </span>
                <span className="text-emerald-400 font-bold font-mono">+4.0 / -1.0 MARK</span>
              </div>

              <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                A particle moves in a circular path of radius <span className="text-cyan-400 font-mono">R</span> with constant angular acceleration <span className="text-cyan-400 font-mono">α</span>. If it starts from rest, what is the ratio of tangential acceleration to centripetal acceleration after time <span className="text-cyan-400 font-mono">t</span>?
              </p>

              {/* Interactive Options */}
              <div className="space-y-2 pt-2">
                {[
                  { id: 1, text: '1 / (α · t²)', isCorrect: true },
                  { id: 2, text: 'α · t²', isCorrect: false },
                  { id: 3, text: '1 / (2 · α · t)', isCorrect: false },
                  { id: 4, text: 'R · α / t', isCorrect: false },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedCbtOption(opt.id)}
                    className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                      selectedCbtOption === opt.id
                        ? 'bg-purple-600/30 border-purple-400 text-white shadow-xs'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedCbtOption === opt.id ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {String.fromCharCode(64 + opt.id)}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                    {selectedCbtOption === opt.id && (
                      <span className="text-[11px] font-bold text-purple-300 font-mono">SELECTED</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live Question Palette status */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1 flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Answered: <strong>14</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Marked for Review: <strong>4</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Not Visited: <strong>82</strong></span>
              </div>
            </div>
          </div>

          {/* Right Column: AI Test Intelligence & Personal Mistake Book Telemetry */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-950/80 to-slate-950/90 border border-indigo-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Live AI Performance Radar</h4>
                    <p className="text-[11px] text-indigo-300">Synchronized with Student Profile</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  TOP 1.2% NATIONALLY
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy Rate</span>
                  <p className="text-xl font-black text-emerald-400 mt-0.5">94.8%</p>
                  <span className="text-[10px] text-slate-400">Target: &gt;90% for Tier-1</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Speed / Question</span>
                  <p className="text-xl font-black text-cyan-400 mt-0.5">48 sec</p>
                  <span className="text-[10px] text-emerald-400 font-medium">12s faster than avg</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Predicted Percentile</span>
                  <p className="text-xl font-black text-purple-400 mt-0.5">99.2%ile</p>
                  <span className="text-[10px] text-purple-300">Based on 12k attempts</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mistakes Logged</span>
                  <p className="text-xl font-black text-amber-400 mt-0.5">3 Qs</p>
                  <span className="text-[10px] text-amber-300">Auto-sent to Mistake Book</span>
                </div>
              </div>

              {/* Personal Mistake Book Feature Callout */}
              <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                  <BookMarked className="w-4 h-4 text-purple-400" />
                  <span>Personal Mistake Book Sync Active</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  Never repeat the same error. When you mark a question incorrectly or guess, our system auto-indexes it into your revision vault with step-by-step video solutions.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleStartMock('CBT Test Intelligence Center', '/mock-tests')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Full NTA CBT Simulator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-8">
        {streams.map((stream) => (
          <button
            key={stream.id}
            onClick={() => setSelectedStream(stream.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedStream === stream.id
                ? 'bg-purple-700 text-white shadow-md shadow-purple-500/25 scale-102'
                : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {stream.label}
          </button>
        ))}
      </div>

      {/* Mock Tests Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedMocks.map((mock) => (
          <div
            key={mock.id}
            className="group relative p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-purple-400 transition-all duration-300 flex flex-col justify-between space-y-5"
          >
            {/* Top Badges */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${mock.badgeColor}`}>
                  {mock.examBadge}
                </span>
                {mock.isPopular && (
                  <span className="flex items-center gap-1 text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full">
                    <Flame className="w-3 h-3 fill-rose-500 text-rose-500" />
                    TRENDING
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-950 group-hover:text-purple-700 transition-colors leading-snug">
                  {mock.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Authority: <span className="font-semibold text-slate-700">{mock.authority}</span>
                </p>
              </div>

              {/* Specs pill row */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Questions</span>
                  <p className="text-xs font-black text-slate-900">{mock.questionsCount} Qs</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Duration</span>
                  <p className="text-xs font-black text-slate-900">{mock.durationMins} Mins</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Max Marks</span>
                  <p className="text-xs font-black text-purple-700">{mock.marks} Pts</p>
                </div>
              </div>

              {/* Key Highlights */}
              <div className="space-y-1.5 pt-1">
                {mock.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200/60">
                  {mock.totalMocksInSeries} Mocks in Series
                </span>
                <span className="text-slate-500 font-medium">
                  {mock.attemptsCount.toLocaleString('en-IN')} Aspirants Attempted
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link to={`/mock-tests?exam=${mock.examCode}`}>
                  <button className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 font-bold text-xs transition-colors text-center cursor-pointer">
                    View Blueprint
                  </button>
                </Link>
                <button
                  onClick={() => handleStartMock(mock.title, `/mock-tests?exam=${mock.examCode}&start=true`)}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Start CBT</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Further Explore Button & Discovery Banner */}
      <div className="mt-8 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              150+ Online Test Series Available
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Showing 3 of {filteredMocks.length} in preview
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Looking for more CBT mock tests and all-India rankings?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Explore complete mock series for CHS Class 9 &amp; 11, JNVST Navodaya, NEET UG, JEE Main, UP Police Constable, SI, SSC CGL &amp; School Olympiads with instant AI analysis.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 relative z-10">
          <Link 
            to={selectedStream === 'ALL' ? '/mock-tests' : `/mock-tests?exam=${selectedStream}`} 
            className="w-full sm:w-auto"
          >
            <button className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-sm shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer group">
              <span>Further Explore All Mock Tests</span>
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>

      {/* Four Core Pillars of Test Intelligence */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3.5 hover:border-purple-300 transition-colors">
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-950">Official CBT Simulator</h4>
            <p className="text-xs text-slate-600 font-medium mt-0.5">Exact NTA user interface, question palette, and negative marking formulas.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3.5 hover:border-purple-300 transition-colors">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-950">Personal Mistake Book</h4>
            <p className="text-xs text-slate-600 font-medium mt-0.5">Automated logging of incorrect attempts with root cause analysis.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3.5 hover:border-purple-300 transition-colors">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-950">All-India Rank Percentile</h4>
            <p className="text-xs text-slate-600 font-medium mt-0.5">Compare accuracy & speed percentiles against top rankers across India.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3.5 hover:border-purple-300 transition-colors">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-950">Adaptive Re-Attempt Drills</h4>
            <p className="text-xs text-slate-600 font-medium mt-0.5">Micro-drills generated on your identified weak chapters until 100% mastery.</p>
          </div>
        </div>
      </div>

      {/* Service Registration Gate Modal */}
      <ServiceRegistrationGateModal
        isOpen={gateModalOpen}
        onClose={() => setGateModalOpen(false)}
        serviceTitle={gateServiceInfo.title}
        serviceDescription={gateServiceInfo.desc}
        intendedDestination={gateServiceInfo.path}
      />
    </section>
  );
};
