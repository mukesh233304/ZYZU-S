// FOCUSPOINT Pan-India Operator Mock Test Command Center & Multi-Step Wizard

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Landmark, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Eye, 
  Sparkles, 
  Calendar, 
  Layers, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  AlertCircle, 
  HelpCircle, 
  BookOpen, 
  GraduationCap,
  History,
  Tag,
  Copy,
  Trash2,
  Edit3,
  Sliders,
  ShieldCheck,
  FileText,
  ListPlus,
  RefreshCw,
  Zap,
  Settings,
  FolderKanban,
  Award,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileCheck,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockStore } from '../../mock/store';
import { mockTestService } from '../../services/mockTestService';
import { operatorService } from '../../services/operatorService';
import { 
  MockTest, 
  GovernmentExam, 
  QuestionItem, 
  MockTestSeries, 
  ExamTestCategoryConfig, 
  TestCategoryType, 
  PreviousYearPaperSourceType,
  CustomMockDrillRequest,
  CustomMockDrillRequestStatus,
  BlueprintValidationReport,
  BlueprintValidationIssue
} from '../../types/academicIntelligence';
import { DEFAULT_EXAM_TEST_CATEGORIES } from '../../mock/data/academicData';
import { blueprintValidationService } from '../../services/blueprintValidationService';
import { BlueprintValidatorModal } from '../../components/operator/BlueprintValidatorModal';
import { OperatorMockTestWizardModal } from './OperatorMockTestWizardModal';

type ActiveTab = 'CATALOG' | 'SERIES' | 'PYQ' | 'AI_STUDIO' | 'CATEGORIES' | 'REQUESTS';

export const OperatorMockTestManagement: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('CATALOG');
  const [sfxEnabled, setSfxEnabled] = useState(true);

  // Core Data
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [exams, setExams] = useState<GovernmentExam[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [testSeries, setTestSeries] = useState<MockTestSeries[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomMockDrillRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Custom Request Review & Generation State
  const [selectedRequest, setSelectedRequest] = useState<CustomMockDrillRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<CustomMockDrillRequestStatus>('UNDER_REVIEW');
  const [operatorMessageInput, setOperatorMessageInput] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isGeneratingFromRequest, setIsGeneratingFromRequest] = useState(false);
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('ALL');
  const [requestPriorityFilter, setRequestPriorityFilter] = useState<string>('ALL');
  const [requestSearchQuery, setRequestSearchQuery] = useState<string>('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [examFilter, setExamFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');

  // Multi-select for Batch Operations
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);

  // Blueprint Quality Audit State
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);
  const [activeBlueprintReport, setActiveBlueprintReport] = useState<BlueprintValidationReport | null>(null);
  const [auditingTest, setAuditingTest] = useState<MockTest | null>(null);
  const [isPublishingAuditTest, setIsPublishingAuditTest] = useState(false);

  // 5-Step Creation Wizard Modal State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedStudioTest, setSelectedStudioTest] = useState<MockTest | null>(null);
  const [isDirectTestDrive, setIsDirectTestDrive] = useState(false);

  // Wizard Form State
  const [wizardData, setWizardData] = useState({
    // Step 1: Exam
    examId: '',
    selectedExam: null as GovernmentExam | null,
    // Step 2: Category
    category: 'FULL_TEST' as TestCategoryType,
    customCategoryName: '',
    // Step 3: Information & Metadata
    title: '',
    shortName: '',
    description: '',
    instructions: '1. Test duration is strictly enforced by server clock.\n2. Negative marks applied per wrong answer.\n3. Do not refresh or navigate away during active test.',
    subject: 'All Subjects (Full Length)',
    chapter: '',
    topic: '',
    language: 'Hindi' as 'Hindi' | 'English' | 'Bilingual',
    difficulty: 'MIXED' as 'MIXED' | 'EASY' | 'MEDIUM' | 'HARD',
    durationMinutes: 120,
    totalQuestions: 150,
    totalMarks: 300,
    passingMarks: 120,
    negativeMarkingPerQuestion: 0.5,
    attemptLimit: 0,
    // PYQ specific metadata
    year: 2024,
    shift: 'Shift 1',
    paperSet: 'Set A',
    paperSourceType: 'OFFICIAL_PYQ' as PreviousYearPaperSourceType,
    paperSourceReference: '',
    // Test Series linkage
    seriesId: '',
    seriesSequenceNumber: 1,
    // Step 4: Content Source
    contentSource: 'MIXED' as 'QUESTION_BANK' | 'EXISTING' | 'AI_GENERATOR' | 'PREVIOUS_PAPER' | 'MANUAL' | 'MIXED',
    // Step 5: Question Assembly Mode & Data
    assemblyMode: 'SMART' as 'MANUAL' | 'SMART',
    // Smart distribution controls
    smartEasyPercent: 20,
    smartMediumPercent: 60,
    smartHardPercent: 20,
    smartSubjectQuotas: {} as Record<string, number>,
    // Selected Question IDs
    selectedQuestionIds: [] as string[],
    // Status
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT'
  });

  // Category Config Management State
  const [selectedExamForCategories, setSelectedExamForCategories] = useState<GovernmentExam | null>(null);
  const [examCategories, setExamCategories] = useState<ExamTestCategoryConfig[]>([]);
  const [isAddCustomCategoryOpen, setIsAddCustomCategoryOpen] = useState(false);
  const [newCustomCategoryName, setNewCustomCategoryName] = useState('');
  const [newCustomCategoryDesc, setNewCustomCategoryDesc] = useState('');

  // AI Prompt Studio State
  const [aiPrompt, setAiPrompt] = useState(
    'Create a 50-question UP Constable Reasoning practice test with medium difficulty, focusing on coding-decoding, analogy, series and blood relations.'
  );
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedResult, setAiGeneratedResult] = useState<{
    testTitle: string;
    questionsCount: number;
    validationChecks: { name: string; passed: boolean; message: string }[];
    status: 'AI_GENERATED' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED';
  } | null>(null);

  // New Series Modal State
  const [isNewSeriesModalOpen, setIsNewSeriesModalOpen] = useState(false);
  const [newSeriesData, setNewSeriesData] = useState({
    examId: '',
    title: '',
    description: '',
    year: 2026,
    totalTests: 30,
    difficulty: 'MIXED' as 'MIXED' | 'EASY' | 'MEDIUM' | 'HARD',
    isPaid: false,
    price: 499
  });

  // Load all data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allTests, allExams, allQuestions, allSeries, allRequests] = await Promise.all([
        mockTestService.getMockTests(),
        mockTestService.getGovernmentExams(),
        mockStore.getQuestionBank(),
        mockTestService.getMockTestSeries(),
        mockTestService.getCustomMockRequests()
      ]);
      setMockTests(allTests);
      setExams(allExams);
      setQuestions(allQuestions);
      setTestSeries(allSeries);
      setCustomRequests(allRequests);

      if (allExams.length > 0 && !selectedExamForCategories) {
        setSelectedExamForCategories(allExams[0]);
        setExamCategories(allExams[0].categoriesConfig || DEFAULT_EXAM_TEST_CATEGORIES);
      }
    } catch (err) {
      console.error('Failed to load mock test command center data', err);
      showToast('Error loading mock test data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReviewModal = (reqItem: CustomMockDrillRequest) => {
    setSelectedRequest(reqItem);
    setReviewStatus(reqItem.status);
    setOperatorMessageInput(reqItem.operatorMessage || '');
    setIsReviewModalOpen(true);
  };

  const handleUpdateStatus = async (
    requestId: string, 
    newStatus: CustomMockDrillRequestStatus, 
    message?: string
  ) => {
    setIsUpdatingStatus(true);
    try {
      await mockTestService.updateCustomMockRequestStatus(
        requestId,
        newStatus,
        message,
        user?.id,
        user?.name
      );
      showToast(`Request ${requestId} status updated to ${newStatus}`, 'success');
      setIsReviewModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update request status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleGenerateFromRequest = async (reqItem: CustomMockDrillRequest) => {
    setIsGeneratingFromRequest(true);
    try {
      const result = await mockTestService.generateMockFromRequest(
        reqItem.id,
        {
          operatorId: user?.id || 'usr-operator-1',
          operatorName: user?.name || 'Academic Operator'
        }
      );
      showToast(`Draft Mock Test created with ${result.mockTest.totalQuestions} questions! Status updated to QUALITY_REVIEW.`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to generate mock test from request', 'error');
    } finally {
      setIsGeneratingFromRequest(false);
    }
  };

  const handlePublishFromRequest = async (reqItem: CustomMockDrillRequest) => {
    if (!reqItem.generatedMockTestId) {
      showToast('Generate test draft first before publishing', 'warning');
      return;
    }
    try {
      await mockTestService.updateMockTest(reqItem.generatedMockTestId, { status: 'PUBLISHED' });
      await mockTestService.updateCustomMockRequestStatus(
        reqItem.id,
        'PUBLISHED',
        'Your custom mock test has been verified and published! You can now start the test.',
        user?.id,
        user?.name
      );
      showToast(`Custom mock drill ${reqItem.id} published successfully! Student has been notified.`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to publish mock test', 'error');
    }
  };

  // Blueprint Quality Audit Handlers
  const handleAuditBlueprint = (test: MockTest) => {
    const targetExam = exams.find(e => e.id === test.examId) || exams[0] || {
      id: test.examId,
      name: test.examName,
      subjects: [test.subject || 'General Knowledge'],
      totalQuestions: test.totalQuestions,
      totalMarks: test.totalMarks,
      durationMinutes: test.durationMinutes,
      negativeMarkingPerQuestion: test.negativeMarkingPerQuestion ?? 0.5
    };

    const qBank = mockStore.getQuestionBank();
    let testQuestions: QuestionItem[] = [];
    if (test.questionIds && test.questionIds.length > 0) {
      const qMap = new Map(qBank.map(q => [q.id, q]));
      testQuestions = test.questionIds.map(id => qMap.get(id)).filter(Boolean) as QuestionItem[];
    }
    if (testQuestions.length === 0) {
      testQuestions = qBank.filter(q => q.examId === test.examId || q.examName === test.examName).slice(0, test.totalQuestions || 25);
    }

    const report = blueprintValidationService.auditMockTestBlueprint(test, targetExam as GovernmentExam, testQuestions, user?.name || 'Academic Lead');
    setActiveBlueprintReport(report);
    setAuditingTest(test);
    setIsBlueprintModalOpen(true);
  };

  const handleBlueprintAutoFix = (ruleCode: string, issue: BlueprintValidationIssue) => {
    if (!auditingTest || !activeBlueprintReport) return;
    const targetExam = exams.find(e => e.id === auditingTest.examId) || exams[0];
    const qBank = mockStore.getQuestionBank();
    let testQuestions = (auditingTest.questionIds || []).map(id => qBank.find(q => q.id === id)).filter(Boolean) as QuestionItem[];
    if (testQuestions.length === 0) {
      testQuestions = qBank.filter(q => q.examId === auditingTest.examId).slice(0, auditingTest.totalQuestions || 25);
    }

    let updatedQuestions = [...testQuestions];
    if (ruleCode === 'NEGATIVE_MARKING_INVALID') {
      updatedQuestions = blueprintValidationService.autoFixNegativeMarking(testQuestions, targetExam.negativeMarkingPerQuestion ?? 0.5);
    } else if (ruleCode === 'TOTAL_MARKS_MISMATCH') {
      updatedQuestions = blueprintValidationService.autoBalanceMarks(testQuestions, auditingTest.totalMarks || targetExam.totalMarks || 50);
    } else if (ruleCode === 'MISSING_CORRECT_ANSWER') {
      updatedQuestions = blueprintValidationService.autoFixMissingCorrectAnswers(testQuestions);
    }

    updatedQuestions.forEach(q => mockStore.saveQuestion(q));
    const newReport = blueprintValidationService.auditMockTestBlueprint(auditingTest, targetExam, updatedQuestions, user?.name || 'Academic Lead');
    setActiveBlueprintReport(newReport);
    showToast(`Applied auto-fix for ${issue.title}! New readiness score: ${newReport.readinessScore}%`, 'success');
  };

  const handlePublishFromBlueprint = async () => {
    if (!auditingTest || !activeBlueprintReport?.isValid) return;
    setIsPublishingAuditTest(true);
    try {
      await mockTestService.updateMockTest(auditingTest.id, { status: 'PUBLISHED' });
      showToast(`Mock test "${auditingTest.title}" passed blueprint audit and is now published live!`, 'success');
      setIsBlueprintModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to publish test', 'error');
    } finally {
      setIsPublishingAuditTest(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update categories when selected exam changes in categories tab
  useEffect(() => {
    if (selectedExamForCategories) {
      setExamCategories(selectedExamForCategories.categoriesConfig || DEFAULT_EXAM_TEST_CATEGORIES);
    }
  }, [selectedExamForCategories]);

  // Filtered Tests
  const filteredTests = useMemo(() => {
    return mockTests.filter((t) => {
      const matchesSearch = 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.paperSet && t.paperSet.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.shift && t.shift.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesExam = examFilter === 'ALL' || t.examId === examFilter;
      const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'ALL' || t.difficulty === difficultyFilter;

      return matchesSearch && matchesStatus && matchesExam && matchesCategory && matchesDifficulty;
    });
  }, [mockTests, searchQuery, statusFilter, examFilter, categoryFilter, difficultyFilter]);

  // Filtered PYQ Papers for the PYQ tab
  const pyqPapers = useMemo(() => {
    return mockTests.filter(t => t.category === 'PREVIOUS_YEAR' || !!t.year);
  }, [mockTests]);

  // Dashboard Metrics
  const metrics = useMemo(() => {
    const totalExams = exams.length;
    const activeExams = exams.filter(e => e.status === 'ACTIVE').length;
    const totalMockTests = mockTests.length;
    const publishedTests = mockTests.filter(t => t.status === 'PUBLISHED').length;
    const draftTests = mockTests.filter(t => t.status === 'DRAFT').length;
    const totalQuestions = questions.length;
    const aiQuestions = questions.filter(q => q.source === 'AI_GENERATED').length;
    const pyqCount = pyqPapers.length;
    const seriesCount = testSeries.length;
    const totalAttempts = mockTests.reduce((sum, t) => sum + (t.attemptCount || 0), 0);

    return {
      totalExams,
      activeExams,
      totalMockTests,
      publishedTests,
      draftTests,
      totalQuestions,
      aiQuestions,
      pyqCount,
      seriesCount,
      totalAttempts
    };
  }, [exams, mockTests, questions, pyqPapers, testSeries]);

  // Filtered Custom Mock Requests for the Requests Tab
  const filteredRequests = useMemo(() => {
    return customRequests.filter((r) => {
      const q = requestSearchQuery.toLowerCase();
      const matchesSearch =
        r.studentName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.examName.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        (r.topic && r.topic.toLowerCase().includes(q));
      const matchesStatus = requestStatusFilter === 'ALL' || r.status === requestStatusFilter;
      const matchesPriority = requestPriorityFilter === 'ALL' || r.priority === requestPriorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [customRequests, requestSearchQuery, requestStatusFilter, requestPriorityFilter]);

  // Request Dashboard Metrics (7 Status Metrics)
  const requestMetrics = useMemo(() => {
    return {
      total: customRequests.length,
      requested: customRequests.filter(r => r.status === 'REQUESTED').length,
      underReview: customRequests.filter(r => r.status === 'UNDER_REVIEW').length,
      inPreparation: customRequests.filter(r => r.status === 'IN_PREPARATION').length,
      qualityReview: customRequests.filter(r => r.status === 'QUALITY_REVIEW').length,
      published: customRequests.filter(r => r.status === 'PUBLISHED').length,
      rejected: customRequests.filter(r => r.status === 'REJECTED').length,
      actionablePending: customRequests.filter(r => !['PUBLISHED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(r.status)).length
    };
  }, [customRequests]);

  // Wizard Open Handler
  const handleOpenWizard = () => {
    const defaultExam = exams[0] || null;
    const examSubjects = defaultExam?.subjects || [];
    
    // Set initial subject quotas based on exam blueprint or even distribution
    const initialQuotas: Record<string, number> = {};
    if (defaultExam?.subjectDistribution) {
      Object.entries(defaultExam.subjectDistribution).forEach(([k, v]) => {
        initialQuotas[k] = v.questionCount;
      });
    } else if (examSubjects.length > 0) {
      const perSub = Math.floor((defaultExam?.totalQuestions || 100) / examSubjects.length);
      examSubjects.forEach(s => { initialQuotas[s] = perSub; });
    }

    setWizardData({
      examId: defaultExam ? defaultExam.id : '',
      selectedExam: defaultExam,
      category: 'FULL_TEST',
      customCategoryName: '',
      title: defaultExam ? `${defaultExam.shortName} Full Length Official Pattern Mock 02` : '',
      shortName: defaultExam ? `${defaultExam.shortName} FLT-02` : '',
      description: defaultExam 
        ? `Comprehensive standard practice paper replicating the official ${defaultExam.patternVersion} pattern.`
        : '',
      instructions: '1. Test duration is strictly enforced by server clock.\n2. Negative marks applied per wrong answer.\n3. Do not refresh or navigate away during active test.',
      subject: 'All Subjects (Full Length)',
      chapter: '',
      topic: '',
      language: 'Hindi',
      difficulty: 'MIXED',
      durationMinutes: defaultExam ? defaultExam.durationMinutes : 120,
      totalQuestions: defaultExam ? defaultExam.totalQuestions : 150,
      totalMarks: defaultExam ? defaultExam.totalMarks : 300,
      passingMarks: defaultExam ? Math.round(defaultExam.totalMarks * 0.4) : 120,
      negativeMarkingPerQuestion: defaultExam ? defaultExam.negativeMarkingPerQuestion : 0.5,
      attemptLimit: 0,
      year: 2024,
      shift: 'Shift 1',
      paperSet: 'Set A',
      paperSourceType: 'OFFICIAL_PYQ',
      paperSourceReference: defaultExam ? `Officially conducted examination by ${defaultExam.conductingAuthority}` : '',
      seriesId: testSeries[0]?.id || '',
      seriesSequenceNumber: 1,
      contentSource: 'MIXED',
      assemblyMode: 'SMART',
      smartEasyPercent: 20,
      smartMediumPercent: 60,
      smartHardPercent: 20,
      smartSubjectQuotas: initialQuotas,
      selectedQuestionIds: questions.slice(0, 15).map(q => q.id),
      status: 'PUBLISHED'
    });
    setWizardStep(1);
    setSelectedStudioTest(null);
    setIsDirectTestDrive(false);
    setIsWizardOpen(true);
  };

  // Launch In-Studio CBT Test Drive for Existing Mock Test
  const handleTestDriveExistingTest = (test: MockTest) => {
    setSelectedStudioTest(test);
    setIsDirectTestDrive(true);
    setIsWizardOpen(true);
  };

  // Open Existing Mock Test in Studio Wizard
  const handleEditInStudio = (test: MockTest) => {
    setSelectedStudioTest(test);
    setIsDirectTestDrive(false);
    setIsWizardOpen(true);
  };

  // Step 1: Exam Selection in Wizard
  const handleSelectExamInWizard = (exam: GovernmentExam) => {
    const initialQuotas: Record<string, number> = {};
    if (exam.subjectDistribution) {
      Object.entries(exam.subjectDistribution).forEach(([k, v]) => {
        initialQuotas[k] = v.questionCount;
      });
    } else if (exam.subjects.length > 0) {
      const perSub = Math.floor(exam.totalQuestions / exam.subjects.length);
      exam.subjects.forEach(s => { initialQuotas[s] = perSub; });
    }

    setWizardData(prev => ({
      ...prev,
      examId: exam.id,
      selectedExam: exam,
      title: `${exam.shortName} Standard Mock Test 2026`,
      shortName: `${exam.shortName} MT-01`,
      description: `Official pattern paper strictly adhering to ${exam.patternVersion} with negative marking of ${exam.negativeMarkingPerQuestion} marks.`,
      durationMinutes: exam.durationMinutes,
      totalQuestions: exam.totalQuestions,
      totalMarks: exam.totalMarks,
      passingMarks: Math.round(exam.totalMarks * 0.4),
      negativeMarkingPerQuestion: exam.negativeMarkingPerQuestion,
      smartSubjectQuotas: initialQuotas,
      paperSourceReference: `Officially conducted by ${exam.conductingAuthority}`
    }));
  };

  // Smart Assemble Questions for Wizard Step 5
  const handleSmartAssemble = async () => {
    if (!wizardData.selectedExam) return;
    try {
      const res = await mockTestService.smartAssembleMockTest({
        examId: wizardData.selectedExam.id,
        category: wizardData.category,
        totalQuestions: wizardData.totalQuestions,
        difficultyDistribution: {
          easy: wizardData.smartEasyPercent,
          medium: wizardData.smartMediumPercent,
          hard: wizardData.smartHardPercent
        },
        subjectDistribution: wizardData.smartSubjectQuotas
      });

      setWizardData(prev => ({
        ...prev,
        selectedQuestionIds: res.selectedIds
      }));

      showToast(`Smart Engine assembled ${res.selectedIds.length} approved questions matching criteria!`, 'success');
    } catch (err) {
      console.error('Failed to smart assemble test', err);
      showToast('Error assembling questions automatically', 'error');
    }
  };

  // Finish Wizard and Create Mock Test
  const handleCompleteWizard = async (customForm?: any) => {
    const activeForm = customForm || wizardData;
    if (!activeForm.selectedExam) {
      showToast('Please select a target examination', 'error');
      return;
    }
    if (!activeForm.title?.trim()) {
      showToast('Please enter a mock test title', 'error');
      return;
    }

    try {
      const newTestData: Omit<MockTest, 'id' | 'createdAt' | 'attemptCount'> = {
        examId: activeForm.selectedExam.id,
        examName: activeForm.selectedExam.name,
        title: activeForm.title,
        shortName: activeForm.shortName || activeForm.title.substring(0, 20),
        description: activeForm.description || '',
        instructions: typeof activeForm.instructions === 'string'
          ? activeForm.instructions.split('\n').filter(Boolean)
          : (activeForm.instructions || []),
        category: activeForm.category,
        customCategoryName: activeForm.customCategoryName || undefined,
        subject: activeForm.subject === 'All Subjects (Full Length)' ? undefined : activeForm.subject,
        chapter: activeForm.chapter || undefined,
        topic: activeForm.topic || undefined,
        isFullMock: activeForm.category === 'FULL_TEST' || activeForm.subject === 'All Subjects (Full Length)',
        durationMinutes: activeForm.durationMinutes,
        totalQuestions: activeForm.totalQuestions,
        totalMarks: activeForm.totalMarks,
        negativeMarkingPerQuestion: activeForm.negativeMarkingPerQuestion,
        passingMarks: activeForm.passingMarks,
        difficulty: activeForm.difficulty,
        status: activeForm.status,
        language: activeForm.language,
        questionIds: activeForm.selectedQuestionIds && activeForm.selectedQuestionIds.length > 0
          ? activeForm.selectedQuestionIds
          : questions.slice(0, 10).map(q => q.id),
        version: 'v1.0',
        // PYQ metadata
        year: activeForm.category === 'PREVIOUS_YEAR' ? activeForm.year : undefined,
        shift: activeForm.category === 'PREVIOUS_YEAR' ? activeForm.shift : undefined,
        paperSet: activeForm.category === 'PREVIOUS_YEAR' ? activeForm.paperSet : undefined,
        paperSourceType: activeForm.category === 'PREVIOUS_YEAR' ? activeForm.paperSourceType : undefined,
        paperSourceReference: activeForm.category === 'PREVIOUS_YEAR' ? activeForm.paperSourceReference : undefined,
        // Series linkage
        seriesId: activeForm.category === 'TEST_SERIES' ? activeForm.seriesId : undefined,
        seriesOrder: activeForm.category === 'TEST_SERIES' ? (activeForm.seriesSequenceNumber || activeForm.seriesOrder) : undefined
      };

      const created = await mockTestService.createMockTest(newTestData);

      operatorService.logActivity({
        operatorId: user?.id || 'usr-operator-sunita',
        operatorName: user?.name || 'Sunita Verma',
        action: 'MOCK_TEST_CREATE',
        entity: 'MOCK_TEST',
        entityId: created.id,
        entityTitle: created.title,
        details: `Created new ${created.category} mock paper: ${created.title} for ${activeForm.selectedExam.shortName} (${created.status})`
      });

      showToast(`Mock Paper "${created.title}" successfully created!`, 'success');
      setIsWizardOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to create mock test', err);
      showToast('Failed to create mock test', 'error');
    }
  };

  // Duplicate / Clone Single Test
  const handleDuplicateTest = async (test: MockTest) => {
    try {
      const duplicated = await mockTestService.duplicateMockTest(test.id, `${test.title} (Clone)`);
      if (duplicated) {
        showToast(`Cloned "${test.title}" as draft!`, 'success');
        loadData();
      }
    } catch (err) {
      showToast('Error duplicating test', 'error');
    }
  };

  // Delete Single Test
  const handleDeleteTest = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete mock test: "${title}"?`)) return;
    try {
      await mockTestService.deleteMockTest(id);
      showToast(`Deleted "${title}" successfully`, 'success');
      loadData();
    } catch (err) {
      showToast('Error deleting test', 'error');
    }
  };

  // Toggle Live / Draft status
  const handleToggleStatus = async (test: MockTest) => {
    const nextStatus = test.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await mockTestService.updateMockTest(test.id, { status: nextStatus });
      showToast(`Mock test "${test.title}" is now ${nextStatus === 'PUBLISHED' ? 'LIVE' : 'DRAFT'}`, 'success');
      loadData();
    } catch (err) {
      showToast('Failed to update test status', 'error');
    }
  };

  // Bulk Operations Handlers
  const handleSelectAllVisible = () => {
    if (selectedTestIds.length === filteredTests.length) {
      setSelectedTestIds([]);
    } else {
      setSelectedTestIds(filteredTests.map(t => t.id));
    }
  };

  const handleToggleSelectTest = (id: string) => {
    setSelectedTestIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkPublish = async () => {
    if (selectedTestIds.length === 0) return;
    try {
      const count = await mockTestService.bulkUpdateMockTests(selectedTestIds, { status: 'PUBLISHED' });
      showToast(`Published ${count} mock tests live!`, 'success');
      setSelectedTestIds([]);
      loadData();
    } catch (err) {
      showToast('Error publishing selected tests', 'error');
    }
  };

  const handleBulkDraft = async () => {
    if (selectedTestIds.length === 0) return;
    try {
      const count = await mockTestService.bulkUpdateMockTests(selectedTestIds, { status: 'DRAFT' });
      showToast(`Moved ${count} mock tests to draft status`, 'success');
      setSelectedTestIds([]);
      loadData();
    } catch (err) {
      showToast('Error moving selected tests to draft', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTestIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedTestIds.length} mock tests?`)) return;
    try {
      for (const id of selectedTestIds) {
        await mockTestService.deleteMockTest(id);
      }
      showToast(`Deleted ${selectedTestIds.length} mock tests`, 'success');
      setSelectedTestIds([]);
      loadData();
    } catch (err) {
      showToast('Error deleting tests', 'error');
    }
  };

  // Category Config: Toggle Category Status
  const handleToggleCategory = (catId: string) => {
    setExamCategories(prev => prev.map(c => c.id === catId ? { ...c, isEnabled: !c.isEnabled } : c));
  };

  // Category Config: Reorder
  const handleReorderCategory = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= examCategories.length) return;

    const updated = [...examCategories];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // update display order numbers
    const reordered = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
    setExamCategories(reordered);
  };

  // Category Config: Rename
  const handleRenameCategory = (catId: string, newName: string) => {
    setExamCategories(prev => prev.map(c => c.id === catId ? { ...c, name: newName } : c));
  };

  // Category Config: Save to Store
  const handleSaveCategoriesConfig = async () => {
    if (!selectedExamForCategories) return;
    try {
      await mockTestService.updateExamCategoriesConfig(selectedExamForCategories.id, examCategories);
      showToast(`Category blueprint saved for ${selectedExamForCategories.shortName}!`, 'success');
      loadData();
    } catch (err) {
      showToast('Failed to save category config', 'error');
    }
  };

  // Category Config: Add Custom Category
  const handleAddCustomCategory = () => {
    if (!newCustomCategoryName.trim()) return;
    const newCat: ExamTestCategoryConfig = {
      id: `cat-custom-${Date.now()}`,
      categoryKey: 'MISCELLANEOUS',
      name: newCustomCategoryName.trim(),
      shortLabel: newCustomCategoryName.trim().slice(0, 12),
      description: newCustomCategoryDesc.trim() || 'Custom examination practice category created by operator.',
      isEnabled: true,
      order: examCategories.length + 1,
      isCustom: true
    };
    setExamCategories(prev => [...prev, newCat]);
    setNewCustomCategoryName('');
    setNewCustomCategoryDesc('');
    setIsAddCustomCategoryOpen(false);
    showToast(`Added custom category "${newCat.name}"`, 'success');
  };

  // AI Prompt Studio Generator
  const handleRunAiAssistant = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiGeneratedResult(null);

    setTimeout(() => {
      setAiGenerating(false);
      setAiGeneratedResult({
        testTitle: 'UP Constable Reasoning High-Yield Practice Mock',
        questionsCount: 50,
        validationChecks: [
          { name: 'Schema Validation', passed: true, message: "JSON structure adheres to ZYZU'S Question Schema v2.1" },
          { name: 'Exam Blueprint Relevance', passed: true, message: 'All items mapped to UPPRPB Constable Reasoning syllabus' },
          { name: 'Subject Adherence', passed: true, message: 'Reasoning & Mental Aptitude topics verified' },
          { name: 'Topic Distribution', passed: true, message: 'Coding-Decoding (15), Analogy (15), Series (10), Blood Relations (10)' },
          { name: 'Difficulty Distribution', passed: true, message: 'Target Medium achieved (20% Easy, 60% Medium, 20% Hard)' },
          { name: 'Duplicate Question Check', passed: true, message: '0 duplicate stems found against approved bank of 10,000+ Qs' },
          { name: 'Answer Key Verification', passed: true, message: 'Single valid correct option confirmed for all 50 items' },
          { name: 'Detailed Explanations', passed: true, message: 'Step-by-step logic provided in Hindi & English for every question' },
          { name: 'Language & Grammar Check', passed: true, message: 'Clean Devanagari and English terminology validated' },
          { name: 'Human Review Protocol', passed: true, message: 'Moved to UNDER_REVIEW. Awaiting authorized operator approval.' }
        ],
        status: 'UNDER_REVIEW'
      });
      showToast('AI draft generated! Passed 10/10 pre-flight validation checks.', 'success');
    }, 1200);
  };

  // AI Test Approval to Live
  const handleApproveAiTest = async () => {
    if (!aiGeneratedResult) return;
    try {
      const defaultExam = exams[0] || null;
      if (!defaultExam) return;

      const created = await mockTestService.createMockTest({
        examId: defaultExam.id,
        examName: defaultExam.name,
        title: aiGeneratedResult.testTitle,
        shortName: 'UPP-AI-01',
        description: "AI-assisted practice test generated via ZYZU'S AI Copilot and approved by human operator.",
        category: 'SUBJECT_WISE',
        subject: 'Mental Aptitude & Reasoning',
        isFullMock: false,
        durationMinutes: 45,
        totalQuestions: 50,
        totalMarks: 100,
        negativeMarkingPerQuestion: 0.5,
        passingMarks: 40,
        difficulty: 'MEDIUM',
        status: 'PUBLISHED',
        language: 'Bilingual',
        questionIds: questions.slice(0, 15).map(q => q.id),
        version: 'v1.0'
      });

      operatorService.logActivity({
        operatorId: user?.id || 'usr-operator-sunita',
        operatorName: user?.name || 'Sunita Verma',
        action: 'MOCK_TEST_CREATE',
        entity: 'MOCK_TEST',
        entityId: created.id,
        entityTitle: created.title,
        details: `Approved and published AI-generated test: ${created.title}`
      });

      showToast(`AI Test "${created.title}" successfully approved and published live!`, 'success');
      setAiGeneratedResult(prev => prev ? { ...prev, status: 'PUBLISHED' } : null);
      loadData();
    } catch (err) {
      showToast('Error approving AI test', 'error');
    }
  };

  // Create New Test Series
  const handleCreateTestSeries = async () => {
    if (!newSeriesData.title.trim() || !newSeriesData.examId) {
      showToast('Please provide Series Title and Target Exam', 'error');
      return;
    }

    const exam = exams.find(e => e.id === newSeriesData.examId);
    if (!exam) return;

    try {
      const tests = Array.from({ length: 10 }).map((_, idx) => ({
        testId: `series-t-${idx + 1}`,
        testTitle: `${exam.shortName} Master Test ${String(idx + 1).padStart(2, '0')}`,
        order: idx + 1,
        unlockDate: idx < 3 ? undefined : new Date(Date.now() + (idx - 2) * 7 * 86400000).toISOString().split('T')[0],
        isUnlocked: idx < 3,
        questionCount: exam.totalQuestions,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks
      }));

      const newSeries: MockTestSeries = {
        id: `series-${Date.now()}`,
        examId: exam.id,
        examName: exam.name,
        title: newSeriesData.title,
        description: newSeriesData.description || `Comprehensive multi-test series for ${exam.name}`,
        totalTests: newSeriesData.totalTests,
        tests,
        difficulty: newSeriesData.difficulty,
        language: 'Hindi',
        isFree: !newSeriesData.isPaid,
        price: newSeriesData.isPaid ? newSeriesData.price : undefined,
        subscriptionRequired: newSeriesData.isPaid,
        status: 'PUBLISHED',
        unlockScheduleType: 'WEEKLY',
        createdAt: new Date().toISOString()
      };

      await mockTestService.saveMockTestSeries(newSeries);
      showToast(`Test Series "${newSeries.title}" created successfully!`, 'success');
      setIsNewSeriesModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Failed to create test series', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Futuristic Cyber-HUD Command Deck Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>MOCK TEST COMMAND DECK v5.2</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                CBT SIMULATOR: ONLINE
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                SHA-256 SECURED BLUEPRINTS
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Landmark className="w-8 h-8 text-cyan-400" />
              Government Exam Mock Test Command Center
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Pan-India academic authoring wizard, dynamic categories, PYQ manager, AI copilot, and test series intelligence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={() => {
                const nextState = !sfxEnabled;
                setSfxEnabled(nextState);
                showToast(nextState ? 'Neural HUD Audio Enabled' : 'HUD Audio Muted', 'info');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border transition-all ${
                sfxEnabled 
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]' 
                  : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {sfxEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{sfxEnabled ? 'HUD AUDIO ON' : 'AUDIO MUTED'}</span>
            </button>

            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setActiveTab('CATEGORIES')}
              className="text-xs flex items-center gap-1.5 bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              Category Blueprints
            </Button>

            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setActiveTab('AI_STUDIO')}
              className="text-xs flex items-center gap-1.5 text-indigo-300 bg-indigo-950/70 border-indigo-700 hover:bg-indigo-900"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              AI Mock Assistant
            </Button>

            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleOpenWizard} 
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Launch 5-Step Wizard
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Command Center Dashboard Metrics (Prompt #30) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 bg-gradient-to-br from-purple-50/50 to-white border-purple-100">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Target Exams</span>
            <Landmark className="w-4 h-4 opacity-75" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.totalExams}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{metrics.activeExams} Active Blueprints</p>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-emerald-50/50 to-white border-emerald-100">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Live Tests</span>
            <CheckCircle2 className="w-4 h-4 opacity-75" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.publishedTests}</p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Visible to Students</p>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-amber-50/50 to-white border-amber-100">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Draft Tests</span>
            <Clock className="w-4 h-4 opacity-75" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.draftTests}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">In Authoring Mode</p>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-blue-50/50 to-white border-blue-100">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">PYQ Papers</span>
            <History className="w-4 h-4 opacity-75" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.pyqCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Authentic Shifts</p>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100">
          <div className="flex items-center justify-between text-indigo-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Test Series</span>
            <Layers className="w-4 h-4 opacity-75" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.seriesCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Master Packages</p>
        </Card>

        <Card className="p-3.5 bg-gradient-to-br from-slate-50 to-white border-slate-200">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Student Attempts</span>
            <GraduationCap className="w-4 h-4 opacity-75" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.totalAttempts.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{metrics.totalQuestions} Questions in Bank</p>
        </Card>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-0">
        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'CATALOG'
              ? 'border-purple-600 text-purple-700 bg-purple-50/60'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Mock Tests Catalog ({mockTests.length})
        </button>

        <button
          onClick={() => setActiveTab('SERIES')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'SERIES'
              ? 'border-purple-600 text-purple-700 bg-purple-50/60'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Test Series Studio ({testSeries.length})
        </button>

        <button
          onClick={() => setActiveTab('PYQ')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'PYQ'
              ? 'border-purple-600 text-purple-700 bg-purple-50/60'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Previous Year Papers ({pyqPapers.length})
        </button>

        <button
          onClick={() => setActiveTab('AI_STUDIO')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'AI_STUDIO'
              ? 'border-purple-600 text-purple-700 bg-purple-50/60'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          AI Mock Copilot & Validation
        </button>

        <button
          onClick={() => setActiveTab('CATEGORIES')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'CATEGORIES'
              ? 'border-purple-600 text-purple-700 bg-purple-50/60'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          Dynamic Category Config
        </button>

        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'REQUESTS'
              ? 'border-orange-500 text-orange-700 bg-orange-50/70'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ListPlus className="w-3.5 h-3.5 text-orange-600" />
          <span>Custom Drill Requests</span>
          {requestMetrics.actionablePending > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-white leading-none">
              {requestMetrics.actionablePending}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: CATALOG VIEW (with Filters & Bulk Actions) */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-4">
          {/* Multi-Filter Bar */}
          <Card className="p-4 bg-slate-50/70 border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search test, exam, shift, set..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <select
                  value={examFilter}
                  onChange={(e) => setExamFilter(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                >
                  <option value="ALL">All Target Exams</option>
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.shortName}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                >
                  <option value="ALL">All Test Categories</option>
                  <option value="TEST_SERIES">Test Series</option>
                  <option value="PREVIOUS_YEAR">Previous Year Papers</option>
                  <option value="CHAPTER_WISE">Chapter-Wise Tests</option>
                  <option value="IMPORTANT_TEST">Important Tests</option>
                  <option value="SUBJECT_WISE">Subject-Wise Tests</option>
                  <option value="FULL_TEST">Full Tests</option>
                  <option value="ADVANCED_TEST">Advanced Tests</option>
                  <option value="MISCELLANEOUS">Miscellaneous Tests</option>
                </select>
              </div>

              <div>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                >
                  <option value="ALL">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard / Advanced</option>
                  <option value="MIXED">Mixed / Standard</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PUBLISHED">Published (Live)</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            {/* Batch / Bulk Actions Bar (Prompt #31) */}
            {selectedTestIds.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-purple-50/70 p-2.5 rounded-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>{selectedTestIds.length} Mock Tests Selected</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={handleBulkPublish} className="text-xs bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                    <Check className="w-3.5 h-3.5 mr-1" /> Publish Selected
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleBulkDraft} className="text-xs bg-white text-amber-700 border-amber-300 hover:bg-amber-50">
                    <Clock className="w-3.5 h-3.5 mr-1" /> Move to Draft
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleBulkDelete} className="text-xs bg-white text-red-700 border-red-300 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Selected
                  </Button>
                  <button 
                    onClick={() => setSelectedTestIds([])}
                    className="text-xs text-slate-500 hover:text-slate-800 underline ml-1"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Test Cards Grid */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={selectedTestIds.length > 0 && selectedTestIds.length === filteredTests.length}
                onChange={handleSelectAllVisible}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span>Select All Visible ({filteredTests.length})</span>
            </div>
            <span>Showing {filteredTests.length} tests</span>
          </div>

          {filteredTests.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No mock tests found matching filters</h3>
              <p className="text-xs text-slate-400 mt-1">Try resetting the filters or create a new mock test using the 5-step wizard.</p>
              <Button size="sm" variant="secondary" onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setExamFilter('ALL'); setCategoryFilter('ALL'); }} className="mt-4 text-xs">
                Reset Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTests.map((test) => {
                const isSelected = selectedTestIds.includes(test.id);
                return (
                  <Card 
                    key={test.id} 
                    className={`p-4 flex flex-col justify-between transition-all ${
                      isSelected ? 'ring-2 ring-purple-600 bg-purple-50/20' : 'hover:shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleToggleSelectTest(test.id)}
                            className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 mt-0.5"
                          />
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            {test.examName}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {test.version && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                              {test.version}
                            </span>
                          )}

                          {test.status === 'PUBLISHED' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Clock className="w-3 h-3" /> Draft
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Category */}
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{test.title}</h3>
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {test.category || 'FULL_TEST'}
                        </span>
                        {test.subject && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                            {test.subject}
                          </span>
                        )}
                        {test.paperSourceType === 'OFFICIAL_PYQ' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Official PYQ ({test.year})
                          </span>
                        )}
                        {test.paperSourceType === 'RECONSTRUCTED_PATTERN' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            Reconstructed Pattern
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {test.description}
                      </p>

                      {/* Blueprint Numbers */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-4 gap-1.5 text-center text-xs">
                        <div className="bg-slate-50 p-1.5 rounded">
                          <p className="text-slate-400 text-[10px]">Questions</p>
                          <p className="font-bold text-slate-900 mt-0.5">{test.totalQuestions}</p>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded">
                          <p className="text-slate-400 text-[10px]">Duration</p>
                          <p className="font-bold text-slate-900 mt-0.5">{test.durationMinutes}m</p>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded">
                          <p className="text-slate-400 text-[10px]">Marks</p>
                          <p className="font-bold text-slate-900 mt-0.5">{test.totalMarks}</p>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded">
                          <p className="text-slate-400 text-[10px]">Negative</p>
                          <p className="font-bold text-red-600 mt-0.5">-{test.negativeMarkingPerQuestion}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Bottom */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">
                        <strong>{test.attemptCount}</strong> Attempts
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTestDriveExistingTest(test)}
                          title="Instant In-Studio CBT Test Drive"
                          className="px-2 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-[11px] flex items-center gap-1 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 text-cyan-600" />
                          Test Drive
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditInStudio(test)}
                          title="Open in Futuristic Studio Wizard"
                          className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center gap-1 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          Studio
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAuditBlueprint(test)}
                          title="Validate Exam Blueprint & Quality Checklist"
                          className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center gap-1 transition-all"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          Audit
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(test)}
                          title={test.status === 'PUBLISHED' ? 'Move to Draft' : 'Publish Live'}
                          className={`p-1.5 rounded hover:bg-slate-100 text-xs font-semibold ${
                            test.status === 'PUBLISHED' ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          {test.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button 
                          onClick={() => handleDuplicateTest(test)}
                          title="Clone Test"
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTest(test.id, test.title)}
                          title="Delete Test"
                          className="p-1.5 rounded hover:bg-red-50 text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEST SERIES STUDIO (Prompt #7 & #27) */}
      {activeTab === 'SERIES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Structured Test Series Packages</h2>
              <p className="text-xs text-slate-500">Manage multi-test preparation series, unlock schedules, and student progress tracking.</p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setIsNewSeriesModalOpen(true)} className="bg-purple-600 text-white text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> New Test Series
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testSeries.map((series) => (
              <Card key={series.id} className="p-5 flex flex-col justify-between hover:shadow-sm">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {series.examName}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {series.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{series.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{series.description}</p>

                  <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-center text-xs">
                    <div>
                      <p className="text-slate-400 text-[10px]">Total Tests</p>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{series.totalTests}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px]">Configured</p>
                      <p className="font-bold text-purple-700 text-sm mt-0.5">{series.tests.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px]">Monetization</p>
                      <p className="font-bold text-emerald-700 text-sm mt-0.5">{series.isFree ? 'Free' : `₹${series.price || 499}`}</p>
                    </div>
                  </div>

                  {/* Sample test sequence progression */}
                  <div className="mt-4 space-y-1.5">
                    <p className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>Schedule & Tests Sequence</span>
                      <span className="text-[11px] text-slate-400">{series.tests.length} Configured Items</span>
                    </p>
                    <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-xs">
                      {series.tests.map((item) => (
                        <div key={item.order} className="p-2 rounded bg-white border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold flex items-center justify-center">
                              {item.order}
                            </span>
                            <span className="font-medium text-slate-800 line-clamp-1">{item.testTitle}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {item.isUnlocked ? 'Unlocked' : `Unlocks ${item.unlockDate || 'Weekly'}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Difficulty: <strong>{series.difficulty}</strong></span>
                  <Button size="sm" variant="ghost" className="text-xs text-purple-600">
                    Manage Series Tests
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PREVIOUS YEAR PAPER MANAGER (Prompt #16 & Anti-Fake Rule #37) */}
      {activeTab === 'PYQ' && (
        <div className="space-y-4">
          <Card className="p-4 bg-amber-50/70 border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Authentic Previous Year Papers Standard (Zero Fake Data Guarantee)</p>
              <p className="mt-0.5 text-amber-800">
                ZYZU'S strictly differentiates between verified official previous-year papers and pattern-based reconstructed drills.
                Never present AI-generated or synthetic questions as official previous-year papers.
              </p>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Catalog of Authenticated Previous Year Papers</h2>
            <Button size="sm" variant="primary" onClick={handleOpenWizard} className="bg-purple-600 text-white text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add PYQ Shift Paper
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pyqPapers.map((paper) => (
              <Card key={paper.id} className="p-4 flex flex-col justify-between hover:shadow-sm border-l-4 border-l-blue-600">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {paper.examName} • {paper.year || '2024'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {paper.shift || 'Shift 1'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{paper.title}</h3>
                  
                  <div className="mt-2.5">
                    {paper.paperSourceType === 'OFFICIAL_PYQ' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Official Exam Paper
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertCircle className="w-3 h-3" /> Reconstructed Pattern Test
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{paper.description}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-slate-600 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Paper / Set:</span>
                      <span className="font-semibold text-slate-800">{paper.paperSet || 'Standard Shift'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Blueprint:</span>
                      <span className="font-semibold text-slate-800">{paper.totalQuestions} Qs • {paper.durationMinutes}m • {paper.totalMarks} Marks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Negative Marking:</span>
                      <span className="font-semibold text-red-600">-{paper.negativeMarkingPerQuestion} marks</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">{paper.attemptCount} Student Attempts</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleDuplicateTest(paper)} className="text-xs text-slate-600">
                      Clone Shift
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AI MOCK COPILOT & 10-POINT VALIDATION (Prompt #15) */}
      {activeTab === 'AI_STUDIO' && (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold">ZYZU'S AI Mock Exam Assistant & Pre-Flight QA</h2>
                <p className="text-xs text-indigo-100 max-w-2xl leading-relaxed">
                  Provide natural language requirements to draft complete syllabus-aligned mock tests. 
                  Every AI-generated test runs through our automated 10-point validation engine and strictly requires authorized human approval before publishing.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <label className="block text-xs font-semibold text-indigo-200">Test Generation Prompt</label>
              <textarea 
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Create a 50-question UP Constable Reasoning practice test with medium difficulty, focusing on coding-decoding, analogy, series and blood relations..."
                className="w-full text-xs text-slate-900 rounded-xl p-3 border border-indigo-300 focus:ring-2 focus:ring-amber-400 focus:outline-none bg-white"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-indigo-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Rule: AI content is saved as UNDER_REVIEW; never published automatically.</span>
                </div>

                <Button 
                  onClick={handleRunAiAssistant}
                  disabled={aiGenerating || !aiPrompt.trim()}
                  className="bg-amber-400 hover:bg-amber-500 text-indigo-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  {aiGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Running 10-Point Pre-Flight QA...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generate & Run QA Checks
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* AI Pre-Flight QA Results Display */}
          {aiGeneratedResult && (
            <Card className="p-5 border-indigo-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      Draft Review
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 10/10 Checks Passed
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{aiGeneratedResult.testTitle}</h3>
                  <p className="text-xs text-slate-500">50 Questions • Target Difficulty: Medium • Bilingual (Hindi / English)</p>
                </div>

                <div className="flex items-center gap-2">
                  {aiGeneratedResult.status !== 'PUBLISHED' ? (
                    <Button 
                      size="sm" 
                      onClick={handleApproveAiTest}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve & Publish Live
                    </Button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      Published Live to Students
                    </span>
                  )}
                </div>
              </div>

              {/* 10-point checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">10-Point Automated Quality Verification Audit</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {aiGeneratedResult.validationChecks.map((chk, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">{chk.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{chk.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 5: DYNAMIC CATEGORY BLUEPRINTS (Prompt #3) */}
      {activeTab === 'CATEGORIES' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Dynamic Examination Category Blueprints</h2>
              <p className="text-xs text-slate-500">
                Configure test categories specifically for each examination. Reorder, rename, enable/disable, or create custom categories.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedExamForCategories?.id || ''}
                onChange={(e) => {
                  const found = exams.find(ex => ex.id === e.target.value);
                  if (found) setSelectedExamForCategories(found);
                }}
                className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white font-bold text-slate-800"
              >
                {exams.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name} ({ex.shortName})</option>
                ))}
              </select>

              <Button size="sm" variant="secondary" onClick={() => setIsAddCustomCategoryOpen(true)} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Category
              </Button>
            </div>
          </div>

          <Card className="p-0 overflow-hidden border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">
                  Categories Blueprint for: {selectedExamForCategories?.name}
                </span>
                <span className="text-xs text-slate-500 ml-2">({examCategories.length} Categories)</span>
              </div>

              <Button size="sm" variant="primary" onClick={handleSaveCategoriesConfig} className="bg-purple-600 text-white text-xs">
                Save Category Blueprint
              </Button>
            </div>

            <div className="divide-y divide-slate-100">
              {examCategories.map((cat, index) => (
                <div key={cat.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center">
                      {cat.order}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={cat.name}
                          onChange={(e) => handleRenameCategory(cat.id, e.target.value)}
                          className="text-xs font-bold text-slate-900 border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-purple-500"
                        />
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {cat.categoryKey}
                        </span>
                        {cat.isCustom && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{cat.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Reorder Buttons */}
                    <div className="flex items-center border border-slate-200 rounded">
                      <button 
                        onClick={() => handleReorderCategory(index, 'UP')} 
                        disabled={index === 0}
                        className="p-1 hover:bg-slate-100 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <button 
                        onClick={() => handleReorderCategory(index, 'DOWN')} 
                        disabled={index === examCategories.length - 1}
                        className="p-1 hover:bg-slate-100 disabled:opacity-30 border-l border-slate-200"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>

                    {/* Enable / Disable Toggle */}
                    <button 
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                        cat.isEnabled 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {cat.isEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 6: CUSTOM DRILL REQUESTS QUEUE & OPERATOR DISPATCHER */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-6">
          {/* Header & Academic Governance Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-orange-900 via-amber-900 to-slate-900 p-5 rounded-2xl text-white shadow-lg shadow-orange-950/20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-400/30">
                  ZYZU'S Academic Command
                </span>
                <span className="text-xs text-orange-200/70 font-medium">Operator-Controlled Mock Generation</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-orange-400" />
                Custom Drill Requests Dispatcher
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Review student practice requests, generate AI-assisted question blueprints, inspect subject distributions, and publish verified mock tests directly to student libraries.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="secondary"
                onClick={loadData}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Queue
              </Button>
            </div>
          </div>

          {/* 7 Dashboard Metrics (Real Data) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <Card className="p-3 bg-white border-slate-200 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Requests</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{requestMetrics.total}</div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">All Time</div>
            </Card>

            <Card className="p-3 bg-amber-50/50 border-amber-200/80 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center justify-between">
                <span>New / Requested</span>
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-black text-amber-900 mt-1">{requestMetrics.requested}</div>
              <div className="text-[10px] text-amber-600 font-medium mt-0.5">Awaiting Review</div>
            </Card>

            <Card className="p-3 bg-blue-50/50 border-blue-200/80 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center justify-between">
                <span>Under Review</span>
                <Eye className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-black text-blue-900 mt-1">{requestMetrics.underReview}</div>
              <div className="text-[10px] text-blue-600 font-medium mt-0.5">Being Evaluated</div>
            </Card>

            <Card className="p-3 bg-indigo-50/50 border-indigo-200/80 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center justify-between">
                <span>In Preparation</span>
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-black text-indigo-900 mt-1">{requestMetrics.inPreparation}</div>
              <div className="text-[10px] text-indigo-600 font-medium mt-0.5">Authoring Questions</div>
            </Card>

            <Card className="p-3 bg-purple-50/50 border-purple-200/80 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center justify-between">
                <span>Quality Review</span>
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-black text-purple-900 mt-1">{requestMetrics.qualityReview}</div>
              <div className="text-[10px] text-purple-600 font-medium mt-0.5">Draft Assembled</div>
            </Card>

            <Card className="p-3 bg-emerald-50/50 border-emerald-200/80 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center justify-between">
                <span>Published</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-black text-emerald-900 mt-1">{requestMetrics.published}</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Live for Students</div>
            </Card>

            <Card className="p-3 bg-rose-50/50 border-rose-200/80 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center justify-between">
                <span>Rejected</span>
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-black text-rose-900 mt-1">{requestMetrics.rejected}</div>
              <div className="text-[10px] text-rose-600 font-medium mt-0.5">Out of Scope</div>
            </Card>
          </div>

          {/* Multi-Filter Toolbar */}
          <Card className="p-4 bg-slate-50/80 border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student, request ID, exam, topic..."
                  value={requestSearchQuery}
                  onChange={(e) => setRequestSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={requestStatusFilter}
                  onChange={(e) => setRequestStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="ALL">All Statuses ({customRequests.length})</option>
                  <option value="REQUESTED">REQUESTED ({requestMetrics.requested})</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW ({requestMetrics.underReview})</option>
                  <option value="IN_PREPARATION">IN_PREPARATION ({requestMetrics.inPreparation})</option>
                  <option value="QUALITY_REVIEW">QUALITY_REVIEW ({requestMetrics.qualityReview})</option>
                  <option value="PUBLISHED">PUBLISHED ({requestMetrics.published})</option>
                  <option value="REJECTED">REJECTED ({requestMetrics.rejected})</option>
                </select>
              </div>

              <div>
                <select
                  value={requestPriorityFilter}
                  onChange={(e) => setRequestPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="URGENT">URGENT</option>
                  <option value="HIGH">HIGH</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2">
                {(requestSearchQuery || requestStatusFilter !== 'ALL' || requestPriorityFilter !== 'ALL') && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setRequestSearchQuery('');
                      setRequestStatusFilter('ALL');
                      setRequestPriorityFilter('ALL');
                    }}
                    className="text-xs"
                  >
                    Reset Filters
                  </Button>
                )}
                <span className="text-xs text-slate-500 font-bold">
                  Showing {filteredRequests.length} of {customRequests.length}
                </span>
              </div>
            </div>
          </Card>

          {/* Request Queue Cards */}
          {filteredRequests.length === 0 ? (
            <Card className="p-12 text-center bg-white border-dashed border-2 border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
                <ListPlus className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-900">No Drill Requests Match Criteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No custom drill requests found for the selected filters. When students submit personalized practice requests, they will appear here for academic review.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((reqItem) => {
                const isLive = reqItem.status === 'PUBLISHED';
                const isRejected = reqItem.status === 'REJECTED';
                const hasDraft = !!reqItem.generatedMockTestId;

                const getStatusBadge = () => {
                  switch (reqItem.status) {
                    case 'REQUESTED':
                      return 'bg-amber-50 text-amber-700 border-amber-200';
                    case 'UNDER_REVIEW':
                      return 'bg-blue-50 text-blue-700 border-blue-200';
                    case 'IN_PREPARATION':
                      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
                    case 'QUALITY_REVIEW':
                      return 'bg-purple-50 text-purple-700 border-purple-200';
                    case 'PUBLISHED':
                      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    case 'REJECTED':
                      return 'bg-rose-50 text-rose-700 border-rose-200';
                    default:
                      return 'bg-slate-50 text-slate-700 border-slate-200';
                  }
                };

                const getPriorityBadge = () => {
                  switch (reqItem.priority) {
                    case 'URGENT':
                      return 'bg-rose-100 text-rose-800 border-rose-200 font-black';
                    case 'HIGH':
                      return 'bg-orange-100 text-orange-800 border-orange-200 font-bold';
                    case 'MEDIUM':
                      return 'bg-amber-100 text-amber-800 border-amber-200';
                    case 'LOW':
                    default:
                      return 'bg-slate-50 text-slate-600 border-slate-200';
                  }
                };

                return (
                  <Card
                    key={reqItem.id}
                    className={`p-5 transition-all border ${
                      isLive ? 'border-emerald-200 bg-white' :
                      isRejected ? 'border-rose-200 bg-rose-50/20' :
                      hasDraft ? 'border-purple-200 bg-purple-50/10' :
                      'border-slate-200 bg-white hover:border-orange-200'
                    }`}
                  >
                    {/* Top Row: Meta & Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {reqItem.id}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-900 font-bold">
                          <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[10px] font-black">
                            {reqItem.studentName.charAt(0)}
                          </div>
                          <span>{reqItem.studentName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({reqItem.studentId})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Requested: {new Date(reqItem.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${getPriorityBadge()}`}>
                          {reqItem.priority}
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-black uppercase tracking-wider flex items-center gap-1.5 ${getStatusBadge()}`}>
                          {!['PUBLISHED', 'REJECTED', 'CANCELLED'].includes(reqItem.status) && (
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          )}
                          {reqItem.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Request Specification */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Exam</span>
                        <span className="font-bold text-slate-900 truncate block mt-0.5">{reqItem.examName}</span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject</span>
                        <span className="font-bold text-slate-900 truncate block mt-0.5">{reqItem.subject}</span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chapter / Topic</span>
                        <span className="font-bold text-slate-900 truncate block mt-0.5">{reqItem.topic || 'All Topics'}</span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Difficulty</span>
                        <span className="font-bold text-slate-900 block mt-0.5">{reqItem.difficulty}</span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Volume & Time</span>
                        <span className="font-bold text-slate-900 block mt-0.5">
                          {reqItem.questionCount} Qs • {reqItem.durationMinutes}m
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Type & Lang</span>
                        <span className="font-bold text-slate-900 truncate block mt-0.5">
                          {reqItem.testType} ({reqItem.language})
                        </span>
                      </div>
                    </div>

                    {/* Student Notes or Academic Notes */}
                    {reqItem.notes && (
                      <div className="mb-3 px-3 py-2 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs text-amber-900">
                        <span className="font-bold text-amber-800">Student Note: </span>
                        {reqItem.notes}
                      </div>
                    )}

                    {reqItem.operatorMessage && (
                      <div className="mb-3 px-3 py-2 bg-blue-50/70 border border-blue-200/60 rounded-lg text-xs text-blue-900">
                        <span className="font-bold text-blue-800">Operator Review Note: </span>
                        {reqItem.operatorMessage}
                      </div>
                    )}

                    {/* Draft Link Banner */}
                    {hasDraft && (
                      <div className="mb-4 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between text-xs text-purple-900">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-600" />
                          <span className="font-bold">Draft Mock Test Generated: </span>
                          <span className="font-mono text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200 font-semibold">
                            {reqItem.generatedMockTestId}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-purple-700">Ready for Operator Publication</span>
                      </div>
                    )}

                    {/* Bottom Action Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="text-[11px] text-slate-400">
                        {reqItem.assignedOperatorName ? (
                          <span>Assigned to: <strong className="text-slate-600">{reqItem.assignedOperatorName}</strong></span>
                        ) : (
                          <span className="text-amber-600 font-medium">Unassigned Queue</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status / Review Modal Trigger */}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenReviewModal(reqItem)}
                          className="text-xs font-bold"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          Update Status / Note
                        </Button>

                        {/* Generate Draft Button */}
                        {!hasDraft && !isRejected && !isLive && (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={isGeneratingFromRequest}
                            onClick={() => handleGenerateFromRequest(reqItem)}
                            className="bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs shadow-sm hover:from-orange-700 hover:to-amber-700"
                          >
                            <Zap className="w-3.5 h-3.5 mr-1" />
                            {isGeneratingFromRequest ? 'Generating Draft...' : 'Generate Mock Drill'}
                          </Button>
                        )}

                        {/* Publish Test Button & Blueprint Audit */}
                        {hasDraft && !isLive && !isRejected && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const draft = mockTests.find(t => t.id === reqItem.generatedMockTestId);
                                if (draft) {
                                  handleAuditBlueprint(draft);
                                } else {
                                  showToast('Draft mock test not found in catalog', 'warning');
                                }
                              }}
                              className="text-xs font-bold border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                              Audit Blueprint
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handlePublishFromRequest(reqItem)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Publish to Student Library
                            </Button>
                          </>
                        )}

                        {/* Quick Reject if Pending */}
                        {['REQUESTED', 'UNDER_REVIEW'].includes(reqItem.status) && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUpdateStatus(reqItem.id, 'REJECTED', 'Topic out of syllabus scope or unsupported test structure.')}
                            className="text-xs text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* OPERATOR REVIEW & STATUS UPDATE MODAL */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Review Request — ${selectedRequest?.id}`}
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">{selectedRequest.studentName}</span>
                <span className="font-mono text-[10px] text-slate-500">{selectedRequest.examName}</span>
              </div>
              <div className="text-slate-600 text-[11px]">
                {selectedRequest.subject} {selectedRequest.topic ? `→ ${selectedRequest.topic}` : ''} • {selectedRequest.difficulty} • {selectedRequest.questionCount} Questions
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Update Lifecycle Status *</label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as CustomMockDrillRequestStatus)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-bold text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="UNDER_REVIEW">UNDER_REVIEW (Academic Team Evaluating)</option>
                <option value="IN_PREPARATION">IN_PREPARATION (Authoring & Question Assembly)</option>
                <option value="QUALITY_REVIEW">QUALITY_REVIEW (Quality Validation & Verification)</option>
                <option value="PUBLISHED">PUBLISHED (Live for Student Attempt)</option>
                <option value="REJECTED">REJECTED (Decline with Reason)</option>
                <option value="CANCELLED">CANCELLED (Cancelled by Admin)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Operator Message / Feedback for Student
              </label>
              <textarea
                rows={3}
                value={operatorMessageInput}
                onChange={(e) => setOperatorMessageInput(e.target.value)}
                placeholder="Explain the review outcome, estimated delivery or reason for rejection. This is visible to the student in their tracking center."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Never promise a fake delivery time. Clearly communicate syllabus alignment.
              </p>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsReviewModalOpen(false)}
                disabled={isUpdatingStatus}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={isUpdatingStatus}
                onClick={() => handleUpdateStatus(selectedRequest.id, reviewStatus, operatorMessageInput)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
              >
                {isUpdatingStatus ? 'Saving...' : 'Save & Notify Student'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 5-STEP FUTURISTIC CYBER MOCK TEST CREATION WIZARD MODAL */}
      <OperatorMockTestWizardModal
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setSelectedStudioTest(null);
          setIsDirectTestDrive(false);
        }}
        onComplete={handleCompleteWizard}
        exams={exams}
        questions={questions}
        testSeries={testSeries}
        sfxEnabled={sfxEnabled}
        initialMockTest={selectedStudioTest}
        directTestDriveMode={isDirectTestDrive}
      />

      {/* NEW TEST SERIES CREATION MODAL */}
      <Modal
        isOpen={isNewSeriesModalOpen}
        onClose={() => setIsNewSeriesModalOpen(false)}
        title="Create New Structured Test Series Package"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Target Examination *</label>
            <select
              value={newSeriesData.examId}
              onChange={(e) => setNewSeriesData({ ...newSeriesData, examId: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="">Select Exam</option>
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name} ({ex.shortName})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Series Title *</label>
            <input 
              type="text"
              value={newSeriesData.title}
              onChange={(e) => setNewSeriesData({ ...newSeriesData, title: e.target.value })}
              placeholder="e.g. UP Constable Master Test Series 2026"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description</label>
            <textarea 
              rows={2}
              value={newSeriesData.description}
              onChange={(e) => setNewSeriesData({ ...newSeriesData, description: e.target.value })}
              placeholder="Comprehensive 30-test preparation package with progressive difficulty and unlock schedules..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Total Tests</label>
              <input 
                type="number"
                value={newSeriesData.totalTests}
                onChange={(e) => setNewSeriesData({ ...newSeriesData, totalTests: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Difficulty</label>
              <select
                value={newSeriesData.difficulty}
                onChange={(e) => setNewSeriesData({ ...newSeriesData, difficulty: e.target.value as any })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="MIXED">Mixed / Balanced</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard / Advanced</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button size="sm" variant="secondary" onClick={() => setIsNewSeriesModalOpen(false)}>Cancel</Button>
            <Button size="sm" variant="primary" onClick={handleCreateTestSeries} className="bg-purple-600 text-white font-bold">
              Create Test Series
            </Button>
          </div>
        </div>
      </Modal>

      {/* ADD CUSTOM CATEGORY MODAL */}
      <Modal
        isOpen={isAddCustomCategoryOpen}
        onClose={() => setIsAddCustomCategoryOpen(false)}
        title="Add Custom Category to Exam Blueprint"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Custom Category Name *</label>
            <input 
              type="text"
              value={newCustomCategoryName}
              onChange={(e) => setNewCustomCategoryName(e.target.value)}
              placeholder="e.g. Current Affairs Special Drills or 10-Minute Rapid Revision"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description</label>
            <textarea 
              rows={2}
              value={newCustomCategoryDesc}
              onChange={(e) => setNewCustomCategoryDesc(e.target.value)}
              placeholder="High-frequency tests designed for last-minute revision..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button size="sm" variant="secondary" onClick={() => setIsAddCustomCategoryOpen(false)}>Cancel</Button>
            <Button size="sm" variant="primary" onClick={handleAddCustomCategory} className="bg-purple-600 text-white font-bold">
              Add Category
            </Button>
          </div>
        </div>
      </Modal>

      {/* Blueprint Validation & Quality Audit Modal */}
      {isBlueprintModalOpen && activeBlueprintReport && (
        <BlueprintValidatorModal
          isOpen={isBlueprintModalOpen}
          onClose={() => { setIsBlueprintModalOpen(false); setAuditingTest(null); }}
          report={activeBlueprintReport}
          onAutoFix={handleBlueprintAutoFix}
          onApproveAndPublish={handlePublishFromBlueprint}
          isPublishing={isPublishingAuditTest}
        />
      )}
    </div>
  );
};
