// FOCUSPOINT — Government Exam Preparation & Test Series Intelligence Center
// Comprehensive Dynamic Category System, Hierarchical Flow, PYQs, Test Series, and Entitlement Gating

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  Target, 
  Clock, 
  Award, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  BookOpen, 
  GraduationCap, 
  ArrowRight, 
  History, 
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Layers,
  ShoppingBag,
  Sliders,
  Calendar,
  Check,
  CreditCard,
  Zap,
  HelpCircle,
  FileCheck,
  CheckSquare,
  BarChart3,
  RotateCcw,
  Tag,
  ExternalLink,
  ChevronLeft,
  Send,
  MessageSquare,
  ListPlus
} from 'lucide-react';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockTestService } from '../../services/mockTestService';
import { examEligibilityService, EvaluatedExamItem } from '../../services/examEligibilityService';
import { academicEntitlementService } from '../../services/academicEntitlementService';
import { pricingResolutionService } from '../../services/pricingResolutionService';
import { studentPerformanceService } from '../../services/studentPerformanceService';
import { 
  GovernmentExam, 
  MockTest, 
  MockTestAttempt, 
  MockTestSeries, 
  ExamTestCategoryConfig, 
  TestCategoryType,
  CustomMockDrillRequest
} from '../../types/academicIntelligence';
import { DEFAULT_EXAM_TEST_CATEGORIES } from '../../mock/data/academicData';
import { AcademicStream, ResolvedPriceResult } from '../../types/eligibilityAndPricing';
import { CustomMockDrillRequestModal } from '../../components/mock-test/CustomMockDrillRequestModal';

export type LibraryTab = 
  | 'EXAMS'
  | 'RECOMMENDED'
  | 'ASSIGNED'
  | 'REQUESTS'
  | 'SERIES'
  | 'PYQ'
  | 'CHAPTER'
  | 'SUBJECT'
  | 'FULL'
  | 'COMPLETED';

export const GovernmentExamMockTestCenter: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const studentId = user?.id || 'usr-student-aryan';

  // Academic simulation state
  const initialGrade = (user as any)?.grade || (user as any)?.currentClass || 'Class 10';
  const [currentClass, setCurrentClass] = useState<string>(initialGrade);
  const [currentStream, setCurrentStream] = useState<AcademicStream>((user as any)?.stream || 'PCM');

  const [loading, setLoading] = useState(true);
  const [evaluatedExams, setEvaluatedExams] = useState<EvaluatedExamItem[]>([]);
  const [selectedExam, setSelectedExam] = useState<GovernmentExam | null>(null);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [testSeriesList, setTestSeriesList] = useState<MockTestSeries[]>([]);
  const [history, setHistory] = useState<MockTestAttempt[]>([]);

  // Premium MNC Library Tab Navigation State
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('EXAMS');
  const [customRequests, setCustomRequests] = useState<CustomMockDrillRequest[]>([]);
  const [allLibraryTests, setAllLibraryTests] = useState<MockTest[]>([]);
  const [allLibrarySeries, setAllLibrarySeries] = useState<MockTestSeries[]>([]);

  // Navigation flow state within an exam: EXAMS -> EXAM_DASHBOARD -> CATEGORY_TESTS (or HISTORY)
  const [viewMode, setViewMode] = useState<'EXAMS' | 'EXAM_DASHBOARD' | 'CATEGORY_TESTS' | 'HISTORY'>('EXAMS');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<TestCategoryType | 'ALL'>('ALL');

  // Sub-filters for Category Tests View
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterChapter, setFilterChapter] = useState<string>('ALL');
  const [filterYear, setFilterYear] = useState<string>('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ATTEMPTED' | 'UNATTEMPTED'>('ALL');
  const [filterPricing, setFilterPricing] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');

  // Pre-test Briefing & Official Instructions Modal
  const [selectedTestToStart, setSelectedTestToStart] = useState<MockTest | null>(null);
  const [instructionLanguage, setInstructionLanguage] = useState<'Hindi' | 'English'>('Hindi');
  const [instructionsAccepted, setInstructionsAccepted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Student Custom Mock Drill Request Modal State (Operator controlled generation)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestTargetExam, setRequestTargetExam] = useState<GovernmentExam | null>(null);
  const [startingRequestId, setStartingRequestId] = useState<string | null>(null);

  // Paywall & Purchase Modal State
  const [paywallModalOpen, setPaywallModalOpen] = useState(false);
  const [paywallExam, setPaywallExam] = useState<GovernmentExam | null>(null);
  const [paywallProduct, setPaywallProduct] = useState<any>(null);
  const [resolvedPrice, setResolvedPrice] = useState<ResolvedPriceResult | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Practice Mistakes Revision Drill State
  const [isMistakesLoading, setIsMistakesLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const studentSubs = academicEntitlementService.getStudentSubscriptions(studentId);
      const activeExamIds = studentSubs
        .filter(s => s.status === 'ACTIVE' && s.features.includes('MOCK_TESTS'))
        .map(s => s.examId || 'ALL');

      const [evaluated, allHistory, requests, allTests, allSeries] = await Promise.all([
        examEligibilityService.evaluateExamsForStudent(
          {
            studentId,
            currentClass,
            stream: currentStream,
            state: (user as any)?.stateName || 'Uttar Pradesh'
          },
          activeExamIds
        ),
        mockTestService.getStudentMockTestHistory(studentId),
        mockTestService.getCustomMockRequests(studentId),
        mockTestService.getMockTests(),
        mockTestService.getMockTestSeries()
      ]);

      setEvaluatedExams(evaluated);
      setHistory(allHistory);
      setCustomRequests(requests);
      setAllLibraryTests(allTests);
      setAllLibrarySeries(allSeries);
    } catch (err) {
      console.error('Failed to load exam preparation center', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubElig = examEligibilityService.subscribe(loadData);
    const unsubEntitle = academicEntitlementService.subscribe(loadData);
    return () => {
      unsubElig();
      unsubEntitle();
    };
  }, [studentId, currentClass, currentStream]);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'requests') {
      setLibraryTab('REQUESTS');
    } else if (tabParam === 'recommended') {
      setLibraryTab('RECOMMENDED');
    } else if (tabParam === 'assigned') {
      setLibraryTab('ASSIGNED');
    } else if (tabParam === 'series') {
      setLibraryTab('SERIES');
    } else if (tabParam === 'pyq') {
      setLibraryTab('PYQ');
    } else if (tabParam === 'chapter') {
      setLibraryTab('CHAPTER');
    } else if (tabParam === 'subject') {
      setLibraryTab('SUBJECT');
    } else if (tabParam === 'full') {
      setLibraryTab('FULL');
    } else if (tabParam === 'history' || tabParam === 'completed') {
      setLibraryTab('COMPLETED');
    }
  }, [searchParams]);

  // Handle Exam Selection -> Open Exam Dashboard
  const handleSelectExam = async (item: EvaluatedExamItem) => {
    setSelectedExam(item.exam);
    try {
      const [tests, series] = await Promise.all([
        mockTestService.getMockTests(item.exam.id),
        mockTestService.getMockTestSeries(item.exam.id)
      ]);
      setMockTests(tests);
      setTestSeriesList(series);
      setSelectedCategoryKey('ALL');
      setFilterSubject('ALL');
      setFilterChapter('ALL');
      setFilterYear('ALL');
      setFilterDifficulty('ALL');
      setFilterStatus('ALL');
      setFilterPricing('ALL');
      setViewMode('EXAM_DASHBOARD');
    } catch {
      showToast('Failed to load tests for this exam', 'error');
    }
  };

  // Handle Category Selection -> Drill Down into Category Tests
  const handleSelectCategory = (catKey: TestCategoryType | 'ALL') => {
    setSelectedCategoryKey(catKey);
    setFilterSubject('ALL');
    setFilterChapter('ALL');
    setFilterYear('ALL');
    setFilterDifficulty('ALL');
    setFilterStatus('ALL');
    setFilterPricing('ALL');
    setViewMode('CATEGORY_TESTS');
  };

  // Check access before opening pre-test instructions modal
  const handleInitiateTest = (test: MockTest) => {
    if (!selectedExam) return;

    // Check Entitlement Engine if test is not explicitly free
    if (!test.isFree) {
      const accessEval = academicEntitlementService.evaluateAccess(studentId, 'MOCK_TESTS', selectedExam.id);
      if (!accessEval.hasAccess) {
        openPaywallForExam(selectedExam);
        return;
      }
    }

    setInstructionsAccepted(false);
    setInstructionLanguage(test.language === 'English' ? 'English' : 'Hindi');
    setSelectedTestToStart(test);
  };

  const openPaywallForExam = (exam: GovernmentExam) => {
    setPaywallExam(exam);
    const allProducts = pricingResolutionService.getAllProducts();
    const matchingProduct = allProducts.find(p => p.examId === exam.id) || 
                            allProducts.find(p => p.type === 'MOCK_TEST_SUBSCRIPTION') || 
                            allProducts[0];
    
    setPaywallProduct(matchingProduct);

    const priceRes = pricingResolutionService.resolveProductPrice(matchingProduct.id, {
      studentId,
      studentName: user?.name,
      districtId: user?.districtId || 'dist-gzp',
      stateId: user?.stateId || 'loc-state-up',
      libraryId: (user as any)?.libraryId,
      couponCode: couponCode || undefined
    });

    setResolvedPrice(priceRes);
    setPaywallModalOpen(true);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paywallProduct) return;
    const priceRes = pricingResolutionService.resolveProductPrice(paywallProduct.id, {
      studentId,
      studentName: user?.name,
      districtId: user?.districtId || 'dist-gzp',
      stateId: user?.stateId || 'loc-state-up',
      libraryId: (user as any)?.libraryId,
      couponCode
    });
    setResolvedPrice(priceRes);
    showToast(`Pricing updated with coupon: ${couponCode}`, 'info');
  };

  const handleConfirmPurchase = async () => {
    if (!resolvedPrice) return;
    setIsCheckingOut(true);
    try {
      const paymentId = `pay-${Date.now()}`;
      const res = academicEntitlementService.activatePurchase(
        studentId,
        user?.name || 'Aryan Sharma',
        resolvedPrice,
        paymentId
      );

      if (res.success) {
        showToast('Subscription activated successfully! Mock tests are now unlocked.', 'success');
        setPaywallModalOpen(false);
        loadData();
      } else {
        showToast(res.error || 'Payment failed.', 'error');
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleStartAttempt = async () => {
    if (!selectedTestToStart) return;
    if (!instructionsAccepted) {
      showToast('Please check the declaration confirming that you have read all exam instructions.', 'error');
      return;
    }

    setIsStarting(true);
    try {
      const attempt = await mockTestService.startAttempt(
        studentId,
        user?.name || 'Aryan Singh',
        selectedTestToStart.id
      );
      setSelectedTestToStart(null);
      navigate(`/student/mock-tests/attempt/${attempt.id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to initialize mock test session', 'error');
    } finally {
      setIsStarting(false);
    }
  };

  // Launch Personal Mistake Book Revision Drill (Section 20)
  const handlePracticeMistakes = async () => {
    if (!selectedExam) return;
    setIsMistakesLoading(true);
    try {
      const mistakes = await studentPerformanceService.getMistakeBook(studentId);
      const examMistakes = mistakes.filter(m => m.examName.toLowerCase().includes(selectedExam.shortName.toLowerCase()) || 
                                                m.examName.toLowerCase().includes(selectedExam.name.toLowerCase()));
      
      const targetMistakes = examMistakes.length > 0 ? examMistakes : mistakes;

      if (targetMistakes.length === 0) {
        showToast('No mistakes logged yet! Great job. Attempt more tests to populate your Personal Mistake Book.', 'info');
        return;
      }

      const drillTest = await mockTestService.generateCustomMockTest({
        examId: selectedExam.id,
        examName: selectedExam.shortName || selectedExam.name,
        title: `${selectedExam.shortName} — Personal Mistakes Revision Drill`,
        questionCount: Math.min(15, targetMistakes.length),
        difficulty: 'MIXED',
        durationMinutes: 20,
        isFullMock: false
      });

      showToast(`Personal revision test assembled with ${Math.min(15, targetMistakes.length)} mistake questions!`, 'success');
      const attempt = await mockTestService.startAttempt(
        studentId,
        user?.name || 'Aryan Singh',
        drillTest.id
      );
      navigate(`/student/mock-tests/attempt/${attempt.id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate mistake revision test', 'error');
    } finally {
      setIsMistakesLoading(false);
    }
  };

  const handleOpenRequestModal = (exam?: GovernmentExam | null) => {
    setRequestTargetExam(exam || selectedExam || null);
    setIsRequestModalOpen(true);
  };

  const handleStartPublishedMock = async (reqItem: CustomMockDrillRequest) => {
    if (!reqItem.generatedMockTestId) {
      showToast('Mock test details not found for this custom request', 'error');
      return;
    }
    setStartingRequestId(reqItem.id);
    try {
      const attempt = await mockTestService.startAttempt(
        studentId,
        user?.name || 'Aryan Singh',
        reqItem.generatedMockTestId
      );
      showToast(`Starting custom practice drill: ${reqItem.examName}!`, 'success');
      navigate(`/student/mock-tests/attempt/${attempt.id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to start test attempt', 'error');
    } finally {
      setStartingRequestId(null);
    }
  };

  // Configured Categories for the Selected Exam
  const activeCategoriesConfig: ExamTestCategoryConfig[] = useMemo(() => {
    if (!selectedExam) return DEFAULT_EXAM_TEST_CATEGORIES;
    return selectedExam.categoriesConfig && selectedExam.categoriesConfig.length > 0 
      ? selectedExam.categoriesConfig.filter(c => c.isEnabled)
      : DEFAULT_EXAM_TEST_CATEGORIES;
  }, [selectedExam]);

  // Compute test counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activeCategoriesConfig.forEach(cat => {
      counts[cat.categoryKey] = 0;
    });

    mockTests.forEach(test => {
      const catKey = test.category || (test.isFullMock ? 'FULL_TEST' : 'SUBJECT_WISE');
      if (counts[catKey] !== undefined) {
        counts[catKey]++;
      }
    });

    // Special count for test series
    counts['TEST_SERIES'] = testSeriesList.length || counts['TEST_SERIES'] || 0;
    return counts;
  }, [activeCategoriesConfig, mockTests, testSeriesList]);

  // Filtered Tests for the Active View
  const filteredTests = useMemo(() => {
    return mockTests.filter(test => {
      // 1. Category Filter
      if (selectedCategoryKey !== 'ALL') {
        const testCat = test.category || (test.isFullMock ? 'FULL_TEST' : 'SUBJECT_WISE');
        if (testCat !== selectedCategoryKey) return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = test.title.toLowerCase().includes(q);
        const matchesSub = test.subject?.toLowerCase().includes(q) || false;
        const matchesChap = test.chapter?.toLowerCase().includes(q) || false;
        const matchesYear = test.year?.toString().includes(q) || false;
        if (!matchesTitle && !matchesSub && !matchesChap && !matchesYear) return false;
      }

      // 3. Subject Filter
      if (filterSubject !== 'ALL') {
        if (test.subject !== filterSubject) return false;
      }

      // 4. Chapter Filter
      if (filterChapter !== 'ALL') {
        if (test.chapter !== filterChapter) return false;
      }

      // 5. Year Filter (for PYQs)
      if (filterYear !== 'ALL') {
        if (test.year?.toString() !== filterYear) return false;
      }

      // 6. Difficulty Filter
      if (filterDifficulty !== 'ALL') {
        if (test.difficulty !== filterDifficulty) return false;
      }

      // 7. Pricing Filter
      if (filterPricing === 'FREE' && !test.isFree) return false;
      if (filterPricing === 'PAID' && test.isFree) return false;

      // 8. Attempt Status Filter
      if (filterStatus !== 'ALL') {
        const hasAttempted = history.some(h => h.mockTestId === test.id);
        if (filterStatus === 'ATTEMPTED' && !hasAttempted) return false;
        if (filterStatus === 'UNATTEMPTED' && hasAttempted) return false;
      }

      return true;
    });
  }, [
    mockTests, 
    selectedCategoryKey, 
    searchQuery, 
    filterSubject, 
    filterChapter, 
    filterYear, 
    filterDifficulty, 
    filterPricing, 
    filterStatus, 
    history
  ]);

  // Available unique years in current exam mock tests (strictly no fake years)
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    mockTests.forEach(t => {
      if (t.year) years.add(t.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [mockTests]);

  // Available chapters for selected subject
  const availableChapters = useMemo(() => {
    if (!selectedExam || !selectedExam.chapters || filterSubject === 'ALL') return [];
    return selectedExam.chapters[filterSubject] || [];
  }, [selectedExam, filterSubject]);

  // Helper for Category Icons
  const getCategoryIcon = (key: string) => {
    switch (key) {
      case 'TEST_SERIES': return <Layers className="w-5 h-5 text-purple-600" />;
      case 'PREVIOUS_YEAR': return <History className="w-5 h-5 text-blue-600" />;
      case 'CHAPTER_WISE': return <BookOpen className="w-5 h-5 text-indigo-600" />;
      case 'IMPORTANT_TEST': return <Award className="w-5 h-5 text-amber-500" />;
      case 'SUBJECT_WISE': return <GraduationCap className="w-5 h-5 text-emerald-600" />;
      case 'FULL_TEST': return <Target className="w-5 h-5 text-rose-600" />;
      case 'ADVANCED_TEST': return <Sparkles className="w-5 h-5 text-indigo-500" />;
      case 'MISCELLANEOUS': return <Zap className="w-5 h-5 text-amber-600" />;
      default: return <CheckSquare className="w-5 h-5 text-slate-600" />;
    }
  };

  // Group evaluated exams by dynamic display section
  const groupedExams = useMemo(() => {
    const groups: Record<string, EvaluatedExamItem[]> = {};
    evaluatedExams
      .filter(item => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return item.exam.name.toLowerCase().includes(q) ||
               item.exam.shortName.toLowerCase().includes(q) ||
               item.exam.category.toLowerCase().includes(q);
      })
      .forEach(item => {
        if (!groups[item.displaySection]) {
          groups[item.displaySection] = [];
        }
        groups[item.displaySection].push(item);
      });
    return groups;
  }, [evaluatedExams, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <button
          onClick={() => { setViewMode('EXAMS'); setSelectedExam(null); }}
          className={`hover:text-indigo-600 transition-colors flex items-center gap-1 shrink-0 ${viewMode === 'EXAMS' ? 'font-bold text-slate-900' : ''}`}
        >
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <span>Government Exam Center</span>
        </button>

        {selectedExam && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => { setViewMode('EXAM_DASHBOARD'); setSelectedCategoryKey('ALL'); }}
              className={`hover:text-indigo-600 transition-colors shrink-0 ${viewMode === 'EXAM_DASHBOARD' ? 'font-bold text-slate-900' : ''}`}
            >
              {selectedExam.shortName || selectedExam.name}
            </button>
          </>
        )}

        {selectedExam && selectedCategoryKey !== 'ALL' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded shrink-0">
              {activeCategoriesConfig.find(c => c.categoryKey === selectedCategoryKey)?.name || selectedCategoryKey}
            </span>
          </>
        )}
      </div>

      {/* MNC EDTECH MOCK TEST LIBRARY SWITCHER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {[
            { id: 'EXAMS', label: 'All Exams', icon: GraduationCap },
            { id: 'RECOMMENDED', label: 'Recommended', icon: Sparkles },
            { id: 'ASSIGNED', label: 'Assigned to Me', icon: Award },
            { 
              id: 'REQUESTS', 
              label: 'My Custom Requests', 
              icon: ListPlus, 
              badge: customRequests.filter(r => !['PUBLISHED', 'REJECTED', 'CANCELLED'].includes(r.status)).length 
            },
            { id: 'SERIES', label: 'Test Series', icon: Layers },
            { id: 'PYQ', label: 'Previous Year', icon: History },
            { id: 'CHAPTER', label: 'Chapter Tests', icon: BookOpen },
            { id: 'SUBJECT', label: 'Subject Tests', icon: Target },
            { id: 'FULL', label: 'Full Tests', icon: CheckSquare },
            { id: 'COMPLETED', label: 'Completed', icon: RotateCcw }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = libraryTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setLibraryTab(tab.id as LibraryTab);
                  if (tab.id === 'COMPLETED') {
                    setViewMode('HISTORY');
                  }
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => handleOpenRequestModal(selectedExam)}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs gap-1.5 shadow-md shrink-0 w-full md:w-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>REQUEST CUSTOM MOCK DRILL</span>
          </Button>
        </div>
      </div>

      {/* VIEW: MY CUSTOM DRILL REQUESTS */}
      {libraryTab === 'REQUESTS' && (
        <div className="space-y-6">
          {/* Header & Quality Card */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <ListPlus className="w-6 h-6 text-indigo-600" />
                  <span>My Custom Mock Drill Requests</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tell ZYZU'S what you want to practice. Our academic team will prepare and publish your personalized mock drill.
                </p>
              </div>
              <Button
                onClick={() => handleOpenRequestModal(null)}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs gap-1.5 shadow-md shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>New Practice Request</span>
              </Button>
            </div>

            {/* Quality Assurance Card (Section 11) */}
            <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-5 shadow-lg border border-slate-800 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-300/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    CUSTOM MOCK DRILLS — ACADEMIC EXCELLENCE
                  </h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Operator-Assisted
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  Personalized mock drills are prepared and published by ZYZU'S academic content team to maintain question quality, exam relevance and accuracy.
                </p>
              </div>
            </div>

            {/* Metrics Row (Section 12) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 block uppercase">Total Requests</span>
                <span className="text-xl font-black text-slate-900 font-mono">{customRequests.length}</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <span className="text-[11px] font-bold text-indigo-600 block uppercase">Under Review / Prep</span>
                <span className="text-xl font-black text-indigo-700 font-mono">
                  {customRequests.filter(r => ['REQUESTED', 'UNDER_REVIEW', 'IN_PREPARATION'].includes(r.status)).length}
                </span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <span className="text-[11px] font-bold text-purple-600 block uppercase">Quality QA</span>
                <span className="text-xl font-black text-purple-700 font-mono">
                  {customRequests.filter(r => r.status === 'QUALITY_REVIEW').length}
                </span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-600 block uppercase">Published & Ready</span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  {customRequests.filter(r => r.status === 'PUBLISHED').length}
                </span>
              </div>
            </div>
          </div>

          {/* Empty State (Section 23) */}
          {customRequests.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900">NO CUSTOM DRILLS YET</h3>
                <p className="text-xs text-slate-500">
                  Request a personalized mock drill based on the exam, subject or topic you want to practice.
                </p>
              </div>
              <Button
                onClick={() => handleOpenRequestModal(null)}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs gap-2 shadow-md"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>REQUEST CUSTOM MOCK DRILL</span>
              </Button>
            </div>
          ) : (
            /* Custom Request Cards List (Section 20) */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {customRequests.map((req) => {
                const isPublished = req.status === 'PUBLISHED';
                const isRejected = req.status === 'REJECTED';

                // Stepper index
                const stepOrder = ['REQUESTED', 'UNDER_REVIEW', 'IN_PREPARATION', 'QUALITY_REVIEW', 'PUBLISHED'];
                const currentStepIndex = stepOrder.indexOf(req.status);

                return (
                  <Card 
                    key={req.id}
                    className="p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-200 bg-white border-slate-200 relative overflow-hidden space-y-4"
                  >
                    <div>
                      {/* Card Header: Request ID, Date & Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {req.id}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          req.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          req.status === 'QUALITY_REVIEW' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                          req.status === 'IN_PREPARATION' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          req.status === 'UNDER_REVIEW' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
                          req.status === 'REJECTED' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                          'bg-blue-50 text-blue-800 border-blue-300'
                        }`}>
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Request Specs */}
                      <div className="mt-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                              {req.examName}
                            </span>
                            <h4 className="text-base font-black text-slate-900 leading-snug mt-0.5">
                              {req.subject} {req.topic ? `→ ${req.topic}` : ''}
                            </h4>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                            req.difficulty === 'HARD' || req.difficulty === 'ADVANCED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            req.difficulty === 'MODERATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {req.difficulty}
                          </span>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="block font-black text-slate-900 text-xs">{req.questionCount} Qs</span>
                            <span>Questions</span>
                          </div>
                          <div>
                            <span className="block font-black text-slate-900 text-xs">{req.durationMinutes} min</span>
                            <span>Duration</span>
                          </div>
                          <div>
                            <span className="block font-black text-slate-900 text-xs">{req.language}</span>
                            <span>Medium</span>
                          </div>
                          <div>
                            <span className="block font-black text-indigo-600 text-xs truncate">{req.testType.replace('_', ' ')}</span>
                            <span>Test Type</span>
                          </div>
                        </div>

                        {/* Visual Progress Stepper */}
                        {!isRejected && (
                          <div className="pt-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                              Preparation Pipeline:
                            </span>
                            <div className="flex items-center gap-1">
                              {['Requested', 'Under Review', 'In Prep', 'Quality QA', 'Published'].map((label, idx) => {
                                const isDone = currentStepIndex > idx;
                                const isCurrent = currentStepIndex === idx;
                                return (
                                  <div key={label} className="flex-1">
                                    <div className={`h-1.5 rounded-full transition-all ${
                                      isDone ? 'bg-emerald-500' :
                                      isCurrent ? 'bg-amber-400 animate-pulse' :
                                      'bg-slate-200'
                                    }`} />
                                    <span className={`block text-[9px] mt-1 truncate ${
                                      isDone ? 'text-emerald-700 font-bold' :
                                      isCurrent ? 'text-slate-900 font-black' :
                                      'text-slate-400'
                                    }`}>
                                      {label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Operator / Academic Message */}
                        {req.operatorMessage && (
                          <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="font-bold text-[11px] block">ZYZU'S Academic Team Note:</span>
                              <p className="text-slate-700 leading-relaxed text-[11px]">{req.operatorMessage}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-500">
                        {isPublished ? 'Paper verified & live' : 'Hand-curated by academic team'}
                      </span>

                      {isPublished && req.generatedMockTestId ? (
                        <Button
                          size="sm"
                          onClick={() => handleStartPublishedMock(req)}
                          isLoading={startingRequestId === req.id}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Mock Test</span>
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                          <span>In Preparation</span>
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: OTHER LIBRARY TABS (RECOMMENDED, ASSIGNED, SERIES, PYQ, CHAPTER, SUBJECT, FULL) */}
      {libraryTab !== 'EXAMS' && libraryTab !== 'REQUESTS' && libraryTab !== 'COMPLETED' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {libraryTab === 'RECOMMENDED' && <Sparkles className="w-6 h-6 text-amber-500" />}
                {libraryTab === 'ASSIGNED' && <Award className="w-6 h-6 text-indigo-600" />}
                {libraryTab === 'SERIES' && <Layers className="w-6 h-6 text-purple-600" />}
                {libraryTab === 'PYQ' && <History className="w-6 h-6 text-blue-600" />}
                {libraryTab === 'CHAPTER' && <BookOpen className="w-6 h-6 text-indigo-600" />}
                {libraryTab === 'SUBJECT' && <Target className="w-6 h-6 text-emerald-600" />}
                {libraryTab === 'FULL' && <CheckSquare className="w-6 h-6 text-rose-600" />}
                <span>
                  {libraryTab === 'RECOMMENDED' ? 'Recommended Practice Tests' :
                   libraryTab === 'ASSIGNED' ? 'Assigned Practice Tests' :
                   libraryTab === 'SERIES' ? 'Official Test Series' :
                   libraryTab === 'PYQ' ? 'Previous Year Question Papers (PYQ)' :
                   libraryTab === 'CHAPTER' ? 'Chapter-Wise Drill Tests' :
                   libraryTab === 'SUBJECT' ? 'Subject-Wise Practice Tests' :
                   'Full-Length Mock Examinations'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Curated and vetted by ZYZU'S academic team to ensure 100% exam blueprint compliance.
              </p>
            </div>

            <Button
              onClick={() => handleOpenRequestModal(null)}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs gap-1.5 shadow-md shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>REQUEST CUSTOM MOCK DRILL</span>
            </Button>
          </div>

          {/* Render Library Tests Grid */}
          {(() => {
            let filtered = allLibraryTests;
            if (libraryTab === 'RECOMMENDED') {
              filtered = allLibraryTests.filter(t => t.isRecommended || t.category === 'FULL_TEST');
            } else if (libraryTab === 'ASSIGNED') {
              const publishedIds = customRequests.filter(r => r.status === 'PUBLISHED' && r.generatedMockTestId).map(r => r.generatedMockTestId);
              filtered = allLibraryTests.filter(t => publishedIds.includes(t.id));
            } else if (libraryTab === 'PYQ') {
              filtered = allLibraryTests.filter(t => t.paperSourceType === 'OFFICIAL_PYQ' || t.paperSourceType === 'RECONSTRUCTED_PATTERN' || t.category === 'PREVIOUS_YEAR');
            } else if (libraryTab === 'CHAPTER') {
              filtered = allLibraryTests.filter(t => t.category === 'CHAPTER_WISE');
            } else if (libraryTab === 'SUBJECT') {
              filtered = allLibraryTests.filter(t => t.category === 'SUBJECT_WISE');
            } else if (libraryTab === 'FULL') {
              filtered = allLibraryTests.filter(t => t.category === 'FULL_TEST' || t.isFullMock);
            }

            if (filtered.length === 0) {
              return (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Target className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-base font-bold text-slate-900">No Tests Found in this Category</h3>
                    <p className="text-xs text-slate-500">
                      Submit a custom drill request and our academic team will prepare questions aligned to your syllabus.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleOpenRequestModal(null)}
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs gap-1.5 shadow-md"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>REQUEST CUSTOM MOCK DRILL</span>
                  </Button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtered.map((test) => {
                  const testAttempts = history.filter(h => h.mockTestId === test.id);
                  const isAttempted = testAttempts.length > 0;
                  const latestAttempt = testAttempts[0];
                  const bestScore = testAttempts.reduce((max, a) => Math.max(max, a.score || 0), 0);

                  return (
                    <Card
                      key={test.id}
                      className="p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-200 bg-white border-slate-200 relative overflow-hidden"
                    >
                      <div>
                        {/* Badges Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {test.examName || (test.isFullMock ? 'FULL MOCK' : 'DRILL')}
                            </span>
                            {test.isRecommended && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                                ⭐ Recommended
                              </span>
                            )}
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            test.difficulty === 'HARD' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            test.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {test.difficulty}
                          </span>
                        </div>

                        <h4 className="font-black text-slate-900 text-base leading-snug">
                          {test.title}
                        </h4>

                        {(test.subject || test.chapter) && (
                          <p className="text-xs font-medium text-indigo-700 mt-1 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{test.subject}</span>
                            {test.chapter && <span className="text-slate-400">• {test.chapter}</span>}
                          </p>
                        )}

                        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                          {test.description}
                        </p>

                        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl">
                          <div>
                            <span className="block font-black text-slate-900 text-xs">{test.durationMinutes} min</span>
                            <span>Time Limit</span>
                          </div>
                          <div>
                            <span className="block font-black text-slate-900 text-xs">{test.totalQuestions} Qs</span>
                            <span>Questions</span>
                          </div>
                          <div>
                            <span className="block font-black text-slate-900 text-xs">{test.totalMarks} M</span>
                            <span>Max Marks</span>
                          </div>
                          <div>
                            <span className="block font-black text-rose-600 text-xs">-{test.negativeMarkingPerQuestion}</span>
                            <span>Negative M.</span>
                          </div>
                        </div>

                        {isAttempted && (
                          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="text-emerald-900 font-medium">Attempted ({testAttempts.length} times)</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span>Best: <strong className="font-black text-slate-900">{bestScore} M</strong></span>
                              <span>Latest Acc: <strong className="font-black text-emerald-700">{latestAttempt?.accuracy?.toFixed(0)}%</strong></span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          {test.isFree ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              Free Test
                            </span>
                          ) : (
                            <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-600" />
                              Pass Required
                            </span>
                          )}
                          <span className="text-slate-400">• {test.language || 'Hindi'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isAttempted && latestAttempt && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/student/mock-tests/result/${latestAttempt.id}`)}
                              className="text-xs font-bold text-slate-700"
                            >
                              Result
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleInitiateTest(test)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 shadow-sm"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{isAttempted ? 'Re-attempt' : 'Start Test'}</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* VIEW MODE 1: EXAMS DIRECTORY (WHEN IN EXAMS TAB) */}
      {libraryTab === 'EXAMS' && viewMode === 'EXAMS' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 md:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Government Examination Preparation Center
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                  SELECT GOVERNMENT EXAMINATION
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Choose your targeted recruitment examination to unlock authentic previous-year question papers, full-length test series, chapter-wise drills, and mistake-driven practice.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button 
                  onClick={() => setViewMode('HISTORY')}
                  variant="outline" 
                  className="border-slate-700 bg-slate-800/80 text-slate-200 text-xs gap-1.5 hover:bg-slate-700"
                >
                  <History className="w-4 h-4 text-emerald-400" /> My Test History ({history.length})
                </Button>
                <Link to="/student/mistake-book">
                  <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold gap-1.5 shadow-md">
                    <RotateCcw className="w-4 h-4" /> Personal Mistake Book
                  </Button>
                </Link>
              </div>
            </div>

            {/* Profile Simulation Bar */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Sliders className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Eligibility Context:</span>
                <strong className="text-white font-bold">{currentClass}</strong>
                {parseInt(currentClass.replace(/\D/g, '') || '0') >= 10 && (
                  <span className="px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-mono text-[11px] font-bold border border-indigo-700/60">
                    {currentStream} Stream
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Academic Level:</span>
                <select
                  value={currentClass}
                  onChange={(e) => setCurrentClass(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Class 10">Class 10 (Secondary Level)</option>
                  <option value="Class 12">Class 12 (10+2 Intermediate)</option>
                  <option value="Graduate">Graduate Level (Degree Complete)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search UP Constable, SSC CGL, RRB NTPC, PET..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm"
            />
          </div>

          {/* Exams Grid */}
          <div className="space-y-8">
            {Object.keys(groupedExams).length === 0 ? (
              <Card className="p-12 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No government examinations matched your query</p>
                <p className="text-xs text-slate-500 mt-1">Try searching for other examination keywords like "Constable", "SSC", or "NTPC".</p>
              </Card>
            ) : (
              Object.entries(groupedExams).map(([sectionTitle, items]) => (
                <div key={sectionTitle} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                      <h2 className="text-base sm:text-lg font-black text-slate-950">{sectionTitle}</h2>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {items.length} {items.length === 1 ? 'Exam' : 'Exams'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map(item => {
                      const isAvailable = item.accessState === 'AVAILABLE';
                      const isExpired = item.accessState === 'EXPIRED';
                      const isNotEligible = item.accessState === 'NOT_ELIGIBLE';
                      const isSubscriptionRequired = item.accessState === 'ELIGIBLE_SUBSCRIPTION_REQUIRED';

                      return (
                        <Card
                          key={item.exam.id}
                          className="p-5 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white border-slate-200 relative overflow-hidden"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {item.exam.category.replace('_', ' ')}
                              </span>

                              {isAvailable && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Pass
                                </span>
                              )}

                              {isSubscriptionRequired && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md">
                                  <Lock className="w-3.5 h-3.5 text-amber-600" /> Free & Premium Tests
                                </span>
                              )}
                            </div>

                            <h3 className="font-black text-slate-900 text-base leading-snug">
                              {item.exam.name}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                              {item.exam.conductingAuthority}
                            </p>

                            <p className="text-xs text-slate-600 mt-2.5 line-clamp-2">
                              {item.exam.description}
                            </p>

                            {/* Exam Blueprint Pill Grid */}
                            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <div>
                                <span className="block font-black text-slate-900 text-xs">{item.exam.durationMinutes} min</span>
                                <span>Duration</span>
                              </div>
                              <div>
                                <span className="block font-black text-slate-900 text-xs">{item.exam.totalQuestions} Qs</span>
                                <span>Questions</span>
                              </div>
                              <div>
                                <span className="block font-black text-slate-900 text-xs">{item.exam.totalMarks} M</span>
                                <span>Max Marks</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-100">
                            <Button
                              onClick={() => handleSelectExam(item)}
                              className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-2 py-2.5 shadow-sm"
                            >
                              <span>Enter Examination Center</span>
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: EXAM DASHBOARD & CATEGORY SELECTION HUB */}
      {viewMode === 'EXAM_DASHBOARD' && selectedExam && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setViewMode('EXAMS'); setSelectedExam(null); }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to All Government Examinations</span>
            </button>
            <span className="text-xs font-bold text-slate-500">
              Exam Blueprint: <strong className="text-slate-800">{selectedExam.patternVersion}</strong>
            </span>
          </div>

          {/* Exam Hero Banner */}
          <Card className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-400/30 uppercase">
                    {selectedExam.category}
                  </span>
                  <span className="text-xs text-slate-300">• {selectedExam.conductingAuthority}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{selectedExam.name}</h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {selectedExam.description}
                </p>
                {selectedExam.eligibilityDescription && (
                  <p className="text-xs text-amber-300 font-medium flex items-center gap-1.5 pt-1">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Eligibility: {selectedExam.eligibilityDescription}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button
                  onClick={handlePracticeMistakes}
                  isLoading={isMistakesLoading}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold gap-1.5 text-xs shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Practice My Mistakes</span>
                </Button>
                <Button
                  onClick={() => handleOpenRequestModal(selectedExam)}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold gap-1.5 text-xs shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Request Custom Mock Drill</span>
                </Button>
                <Button
                  onClick={() => openPaywallForExam(selectedExam)}
                  variant="outline"
                  className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700 text-xs font-bold gap-1.5"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" /> Pass Plans
                </Button>
              </div>
            </div>

            {/* Official Pattern Key Specs */}
            <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Examination Duration</span>
                <strong className="text-white text-sm font-black">{selectedExam.durationMinutes} Minutes</strong>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Total Questions</span>
                <strong className="text-white text-sm font-black">{selectedExam.totalQuestions} Questions</strong>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Maximum Marks</span>
                <strong className="text-white text-sm font-black">{selectedExam.totalMarks} Marks</strong>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Negative Marking</span>
                <strong className="text-rose-400 text-sm font-black">-{selectedExam.negativeMarkingPerQuestion} per wrong</strong>
              </div>
            </div>
          </Card>

          {/* DYNAMIC TEST CATEGORY SYSTEM (Section 3) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>SELECT TEST CATEGORY</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explore tailored preparation formats configured specifically for {selectedExam.shortName || selectedExam.name}.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSelectCategory('ALL')}
                className="text-xs font-bold text-slate-700"
              >
                <span>View All Tests ({mockTests.length})</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {/* 8 Configured Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeCategoriesConfig.map(cat => {
                const count = categoryCounts[cat.categoryKey] || 0;
                return (
                  <Card
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.categoryKey as TestCategoryType)}
                    className="p-5 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer bg-white border-slate-200 group"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {getCategoryIcon(cat.categoryKey)}
                        </div>
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          count > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count} {count === 1 ? 'Test' : 'Tests'}
                        </span>
                      </div>

                      <h3 className="font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                      <span>Explore Category</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: CATEGORY TESTS WITH ADVANCED DISCOVERY (Section 4 & 5) */}
      {viewMode === 'CATEGORY_TESTS' && selectedExam && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              onClick={() => setViewMode('EXAM_DASHBOARD')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to {selectedExam.shortName} Categories Hub</span>
            </button>

            <span className="text-xs text-slate-500 font-medium">
              Showing tests for <strong className="text-slate-900 font-bold">{selectedExam.name}</strong>
            </span>
          </div>

          {/* Sticky Category Switcher Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => handleSelectCategory('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryKey === 'ALL'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              All Tests ({mockTests.length})
            </button>
            {activeCategoriesConfig.map(cat => {
              const isActive = selectedCategoryKey === cat.categoryKey;
              const count = categoryCounts[cat.categoryKey] || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.categoryKey as TestCategoryType)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.shortLabel}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Category Hero / Blueprint Notice */}
          <Card className="p-5 bg-gradient-to-r from-blue-50/70 via-indigo-50/70 to-purple-50/70 border-indigo-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                  {selectedCategoryKey === 'ALL' ? 'ALL FORMATS' : selectedCategoryKey.replace('_', ' ')}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  {selectedCategoryKey === 'ALL' 
                    ? `${selectedExam.shortName} Full Mock Library`
                    : activeCategoriesConfig.find(c => c.categoryKey === selectedCategoryKey)?.name}
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {selectedCategoryKey === 'PREVIOUS_YEAR'
                    ? 'Authentic previous year question papers. Sourced and verified from official examination archives with transparent labeling.'
                    : selectedCategoryKey === 'TEST_SERIES'
                    ? 'Complete structured preparation series replicating official board difficulty and percentile rankings.'
                    : selectedCategoryKey === 'CHAPTER_WISE'
                    ? 'Assessments organized strictly according to official subjects, chapters, and concept blueprints.'
                    : selectedCategoryKey === 'ADVANCED_TEST'
                    ? 'Advanced Level – Expert Practice Tests with tough cutoffs and multi-step questions.'
                    : selectedCategoryKey === 'SUBJECT_WISE'
                    ? 'Subject-specific assessments to diagnose individual subject strengths and weak areas.'
                    : selectedCategoryKey === 'FULL_TEST'
                    ? `Standard 150-question full mock tests following the official ${selectedExam.patternVersion} pattern.`
                    : selectedCategoryKey === 'IMPORTANT_TEST'
                    ? 'High-priority predicted question papers curated by senior exam educators.'
                    : 'Rapid fire speed challenges, current affairs quizzes, and mixed practice drills.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={handlePracticeMistakes}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Practice Mistakes
                </Button>
                <Button
                  size="sm"
                  onClick={() => openPaywallForExam(selectedExam)}
                  variant="outline"
                  className="bg-white border-slate-300 text-slate-800 font-bold text-xs"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Unlock Pass
                </Button>
              </div>
            </div>
          </Card>

          {/* ADVANCED MULTI-FILTER BAR (Section 5) */}
          <Card className="p-4 bg-white border-slate-200 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by test title, topic, year, or chapter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Subject Filter */}
              <select
                value={filterSubject}
                onChange={(e) => { setFilterSubject(e.target.value); setFilterChapter('ALL'); }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
              >
                <option value="ALL">All Subjects</option>
                {selectedExam.subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Chapter Filter (If chapters configured and subject selected) */}
              {availableChapters.length > 0 && (
                <select
                  value={filterChapter}
                  onChange={(e) => setFilterChapter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
                >
                  <option value="ALL">All Chapters ({availableChapters.length})</option>
                  {availableChapters.map(chap => (
                    <option key={chap} value={chap}>{chap}</option>
                  ))}
                </select>
              )}

              {/* Year Filter (For PYQs) */}
              {availableYears.length > 0 && (selectedCategoryKey === 'PREVIOUS_YEAR' || selectedCategoryKey === 'ALL') && (
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
                >
                  <option value="ALL">All Years ({availableYears.length})</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr.toString()}>{yr}</option>
                  ))}
                </select>
              )}

              {/* Difficulty Filter */}
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
              >
                <option value="ALL">All Status</option>
                <option value="UNATTEMPTED">Unattempted</option>
                <option value="ATTEMPTED">Attempted</option>
              </select>

              {/* Pricing Filter */}
              <select
                value={filterPricing}
                onChange={(e) => setFilterPricing(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
              >
                <option value="ALL">Free & Premium</option>
                <option value="FREE">Free Only</option>
                <option value="PAID">Pass Required</option>
              </select>
            </div>
          </Card>

          {/* Test Series Card (When viewing TEST_SERIES category) */}
          {selectedCategoryKey === 'TEST_SERIES' && testSeriesList.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Full Structured Test Series Packages
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testSeriesList.map(series => {
                  const testsCompleted = history.filter(h => series.tests.some(t => t.testId === h.mockTestId)).length;
                  const pct = Math.round((testsCompleted / (series.tests.length || 1)) * 100);

                  return (
                    <Card key={series.id} className="p-5 bg-white border-slate-200 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          Master Series
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {series.tests.length} Standard Tests
                        </span>
                      </div>

                      <div>
                        <h4 className="font-black text-slate-900 text-base">{series.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{series.description}</p>
                      </div>

                      {/* Series Progress */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Series Progress</span>
                          <span className="font-bold text-indigo-700">{testsCompleted} of {series.tests.length} Attempted ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      {/* Milestone Tests */}
                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <span className="text-[11px] font-bold text-slate-500 block">Milestone Papers:</span>
                        <div className="space-y-1.5">
                          {series.tests.slice(0, 4).map(st => {
                            const matchingMock = mockTests.find(m => m.id === st.testId);
                            const isAttempted = history.some(h => h.mockTestId === st.testId);

                            return (
                              <div key={st.testId} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-2">
                                  {st.isUnlocked ? (
                                    <CheckCircle2 className={`w-4 h-4 ${isAttempted ? 'text-emerald-500' : 'text-slate-400'}`} />
                                  ) : (
                                    <Lock className="w-4 h-4 text-amber-500" />
                                  )}
                                  <span className="font-bold text-slate-800">{st.testTitle}</span>
                                </div>

                                {st.isUnlocked && matchingMock ? (
                                  <button
                                    onClick={() => handleInitiateTest(matchingMock)}
                                    className="text-xs font-bold text-indigo-600 hover:underline"
                                  >
                                    {isAttempted ? 'Re-attempt →' : 'Start →'}
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Unlocks {st.unlockDate || 'Soon'}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* TEST CARDS LIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base">
                Available Tests ({filteredTests.length})
              </h3>
              {filteredTests.length > 0 && (
                <span className="text-xs text-slate-500">
                  Showing {filteredTests.length} curated papers
                </span>
              )}
            </div>

            {/* STRICT EMPTY STATE RULE (Section 37) */}
            {filteredTests.length === 0 ? (
              <Card className="p-12 text-center text-slate-500 bg-white border-slate-200">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h4 className="font-black text-slate-800 text-base">
                  {selectedCategoryKey === 'PREVIOUS_YEAR'
                    ? `Previous-year papers will appear here when published by ZYZU'S.`
                    : `No ${selectedExam.shortName} mock tests are available matching your criteria yet.`}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {selectedCategoryKey === 'PREVIOUS_YEAR'
                    ? 'Our editorial and verification board only uploads authenticated papers with verified answer keys.'
                    : 'Our authorized study material & mock test paper setters are curating high-quality standardized test sets.'}
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFilterSubject('ALL');
                      setFilterChapter('ALL');
                      setFilterYear('ALL');
                      setFilterDifficulty('ALL');
                      setFilterStatus('ALL');
                      setFilterPricing('ALL');
                      setSearchQuery('');
                    }}
                  >
                    Reset All Filters
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs gap-1.5 shadow-sm"
                    onClick={() => handleOpenRequestModal(selectedExam)}
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Request Custom Mock Drill</span>
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredTests.map((test) => {
                  const testAttempts = history.filter(h => h.mockTestId === test.id);
                  const isAttempted = testAttempts.length > 0;
                  const latestAttempt = testAttempts[0];
                  const bestScore = testAttempts.reduce((max, a) => Math.max(max, a.score || 0), 0);

                  const isOfficialPyq = test.paperSourceType === 'OFFICIAL_PYQ';
                  const isReconstructed = test.paperSourceType === 'RECONSTRUCTED_PATTERN';
                  const isAdvanced = test.category === 'ADVANCED_TEST' || test.difficulty === 'HARD';

                  return (
                    <Card
                      key={test.id}
                      className="p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-200 bg-white border-slate-200 relative overflow-hidden"
                    >
                      <div>
                        {/* Badges Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Category Badge */}
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {test.category ? test.category.replace('_', ' ') : (test.isFullMock ? 'FULL MOCK' : 'SECTIONAL')}
                            </span>

                            {/* Official PYQ vs Reconstructed Badge */}
                            {isOfficialPyq && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                Official Previous-Year Paper
                              </span>
                            )}

                            {isReconstructed && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                Reconstructed Previous-Year Pattern Test
                              </span>
                            )}

                            {/* Advanced Badge */}
                            {isAdvanced && !isOfficialPyq && !isReconstructed && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                Advanced Level
                              </span>
                            )}

                            {/* Recommended Badge */}
                            {test.isRecommended && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                                ⭐ Recommended
                              </span>
                            )}
                          </div>

                          {/* Difficulty Pill */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            test.difficulty === 'HARD' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            test.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {test.difficulty}
                          </span>
                        </div>

                        {/* Test Title */}
                        <h4 className="font-black text-slate-900 text-base leading-snug">
                          {test.title}
                        </h4>

                        {/* Subject & Chapter Linkage */}
                        {(test.subject || test.chapter) && (
                          <p className="text-xs font-medium text-indigo-700 mt-1 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{test.subject}</span>
                            {test.chapter && <span className="text-slate-400">• {test.chapter}</span>}
                          </p>
                        )}

                        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                          {test.description}
                        </p>

                        {/* PYQ Reference note if present */}
                        {test.paperSourceReference && (
                          <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                            <strong>Source:</strong> {test.paperSourceReference}
                          </div>
                        )}

                        {/* Spec Grid */}
                        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl">
                          <div>
                            <span className="block font-black text-slate-900 text-xs">{test.durationMinutes} min</span>
                            <span>Time Limit</span>
                          </div>
                          <div>
                            <span className="block font-black text-slate-900 text-xs">{test.totalQuestions} Qs</span>
                            <span>Questions</span>
                          </div>
                          <div>
                            <span className="block font-black text-slate-900 text-xs">{test.totalMarks} M</span>
                            <span>Max Marks</span>
                          </div>
                          <div>
                            <span className="block font-black text-rose-600 text-xs">-{test.negativeMarkingPerQuestion}</span>
                            <span>Negative M.</span>
                          </div>
                        </div>

                        {/* Previous Attempt Summary */}
                        {isAttempted && (
                          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="text-emerald-900 font-medium">Attempted ({testAttempts.length} times)</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span>Best: <strong className="font-black text-slate-900">{bestScore} M</strong></span>
                              <span>Latest Acc: <strong className="font-black text-emerald-700">{latestAttempt?.accuracy?.toFixed(0)}%</strong></span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer CTAs */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          {test.isFree ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              Free Test
                            </span>
                          ) : (
                            <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-600" />
                              Pass Required
                            </span>
                          )}
                          <span className="text-slate-400">• {test.language || 'Hindi'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isAttempted && latestAttempt && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/student/mock-tests/result/${latestAttempt.id}`)}
                              className="text-xs font-bold text-slate-700"
                            >
                              Result
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleInitiateTest(test)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 shadow-sm"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{isAttempted ? 'Re-attempt' : 'Start Test'}</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 4: TEST HISTORY */}
      {viewMode === 'HISTORY' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-lg">My Examination Attempt Records</h3>
              <p className="text-xs text-slate-500">Every mock test submission is evaluated against official negative marking rules.</p>
            </div>
            <button
              onClick={() => { setLibraryTab('EXAMS'); setViewMode('EXAMS'); setSelectedExam(null); }}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Examinations</span>
            </button>
          </div>

          {history.length === 0 ? (
            <Card className="p-12 text-center text-slate-500 bg-white">
              <History className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No mock test attempts recorded yet.</p>
              <p className="text-xs text-slate-500 mt-1">Select an exam and attempt a test to track your performance diagnostics.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {history.map((att) => (
                <Card key={att.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:shadow-md transition-all">
                  <div>
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">{att.examName}</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{att.mockTestTitle}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Attempted on: {new Date(att.startedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="block font-black text-slate-900 text-base">{att.score} / {att.totalMarks}</span>
                      <span className="text-[10px] text-slate-500">Score ({att.percentage?.toFixed(1)}%)</span>
                    </div>
                    <div className="text-center">
                      <span className="block font-black text-emerald-600 text-base">{att.accuracy?.toFixed(1)}%</span>
                      <span className="text-[10px] text-slate-500">Accuracy</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/student/mock-tests/result/${att.id}`)}
                      className="text-xs font-bold gap-1"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>View Report</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRE-TEST INSTRUCTIONS MODAL (Section 21 & Section 39) */}
      {selectedTestToStart && (
        <Modal
          isOpen={!!selectedTestToStart}
          onClose={() => setSelectedTestToStart(null)}
          size="lg"
          title="Official Mock Test Instructions & Declaration"
          description={selectedTestToStart.title}
        >
          <div className="space-y-5 text-slate-900 pt-2">
            {/* Header Badge */}
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">ZYZU'S Standardized Computer-Based Test (CBT) Engine</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  This test replicates the exact environment, timer behavior, negative marking, and question palette of the official recruitment board.
                </p>
              </div>
            </div>

            {/* Test Blueprint Specification Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-slate-500 text-[11px] block">Duration</span>
                <strong className="font-black text-slate-900 text-sm">{selectedTestToStart.durationMinutes} Minutes</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Total Questions</span>
                <strong className="font-black text-slate-900 text-sm">{selectedTestToStart.totalQuestions} Questions</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Maximum Marks</span>
                <strong className="font-black text-slate-900 text-sm">{selectedTestToStart.totalMarks} Marks</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Negative Penalty</span>
                <strong className="font-black text-rose-600 text-sm">-{selectedTestToStart.negativeMarkingPerQuestion} per wrong</strong>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">Preferred Question Display Language:</span>
              <div className="flex items-center gap-2">
                {(['Hindi', 'English'] as const).map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setInstructionLanguage(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      instructionLanguage === lang 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-white text-slate-700 border border-slate-300'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Official Guidelines List */}
            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <span>Examination Guidelines & Marking Scheme:</span>
              </h5>
              <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-600 pl-1 leading-relaxed">
                {selectedTestToStart.instructions && selectedTestToStart.instructions.length > 0 ? (
                  selectedTestToStart.instructions.map((inst, idx) => (
                    <li key={idx}>{inst}</li>
                  ))
                ) : (
                  <>
                    <li>The clock will be set at the server. The countdown timer in the top right corner of the screen will display the remaining time available for you to complete the examination.</li>
                    <li>For every correct response, positive marks are awarded according to the examination blueprint.</li>
                    <li>Negative marking of <strong>-{selectedTestToStart.negativeMarkingPerQuestion} marks</strong> will be deducted for every incorrect option chosen.</li>
                    <li>You can use the Question Palette on the right of the screen to jump to any question directly. Questions marked for review will be evaluated if answered.</li>
                    <li>Any tab switching or window minimizing will be recorded by the anti-cheating integrity monitor.</li>
                  </>
                )}
              </ul>
            </div>

            {/* Declaration Checkbox */}
            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={instructionsAccepted}
                  onChange={(e) => setInstructionsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs text-slate-800 leading-snug">
                  I have read and understood all instructions. All computer hardware allotted to me is in proper working condition. I agree not to switch tabs during the assessment.
                </span>
              </label>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex gap-3 pt-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedTestToStart(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                onClick={handleStartAttempt}
                isLoading={isStarting}
                disabled={!instructionsAccepted}
              >
                Start Examination Now
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Paywall & Subscription Checkout Modal */}
      {paywallModalOpen && paywallExam && resolvedPrice && (
        <Modal
          isOpen={paywallModalOpen}
          onClose={() => setPaywallModalOpen(false)}
          size="md"
          title="Unlock Academic Mock Tests"
          description={`Get complete access to mock test series for ${paywallExam.name}`}
        >
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-900 to-purple-900 text-white flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  {resolvedPrice.appliedScope} SCOPE APPLIED
                </span>
                <p className="text-xs font-bold mt-1 text-indigo-100">{resolvedPrice.appliedScopeName}</p>
                <p className="text-[11px] text-indigo-200 mt-0.5">
                  Priority pricing resolved for student {user?.name} in {user?.districtName || 'Ghazipur'}.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Standard Base Price</span>
                <span className="line-through font-mono">₹{resolvedPrice.basePrice}</span>
              </div>
              {resolvedPrice.scopeDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Scope Special Concession</span>
                  <span className="font-mono">-₹{resolvedPrice.scopeDiscount}</span>
                </div>
              )}
              {resolvedPrice.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({resolvedPrice.couponCode})</span>
                  <span className="font-mono">-₹{resolvedPrice.couponDiscount}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Payable Amount</span>
                <span className="font-mono text-base text-indigo-700">₹{resolvedPrice.payableTotal}</span>
              </div>
            </div>

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon (e.g. FOCUS50)"
                className="flex-1 rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-indigo-600"
              />
              <Button type="submit" size="sm" variant="outline" className="text-xs font-bold shrink-0">
                Apply Code
              </Button>
            </form>

            <div className="pt-2">
              <Button
                onClick={handleConfirmPurchase}
                isLoading={isCheckingOut}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/25"
              >
                Pay ₹{resolvedPrice.payableTotal} & Unlock Mock Tests
              </Button>
              <p className="text-[10px] text-slate-400 text-center mt-2">
                Instant digital activation • Idempotent payment processing • Valid for full plan duration
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* STUDENT CUSTOM MOCK DRILL REQUEST WIZARD MODAL */}
      <CustomMockDrillRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        availableExams={evaluatedExams.map(e => e.exam)}
        preselectedExam={requestTargetExam}
        studentId={studentId}
        studentName={user?.name || 'Aryan Singh'}
        onRequestSubmitted={(newReq: CustomMockDrillRequest) => {
          loadData();
          showToast(`Custom drill request ${newReq.id} submitted! ZYZU'S academic team will prepare your paper.`, 'success');
          setLibraryTab('REQUESTS');
          setViewMode('EXAMS');
        }}
      />
    </div>
  );
};
