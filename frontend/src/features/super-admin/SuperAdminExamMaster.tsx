// FOCUSPOINT Super Admin — Government Exam Master & Mock Test Orchestration Console
// Futuristic Cognitive HUD for National & State Commission Frameworks,
// Real-time Mock Test Assembly, Test Series Packaging, Student Test Simulation Sandbox, and Pattern Radar.

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockTestService } from '../../services/mockTestService';
import { questionBankService } from '../../services/questionBankService';
import {
  GovernmentExam,
  MockTest,
  MockTestSeries,
  QuestionItem,
  TestCategoryType,
  QuestionDifficulty
} from '../../types/academicIntelligence';
import {
  Landmark,
  PlusCircle,
  FileText,
  Clock,
  Layers,
  Sparkles,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit3,
  Copy,
  Download,
  Volume2,
  VolumeX,
  Play,
  CheckSquare,
  Square,
  RotateCcw,
  Eye,
  Zap,
  Award,
  BarChart3,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Activity,
  X,
  SlidersHorizontal,
  Settings,
  HelpCircle,
  Cpu,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

// Cyber Acoustic Synthesizer for tactile feedback
type SfxType = 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'success';

const playCyberSound = (type: SfxType) => {
  try {
    const isMuted = localStorage.getItem('fp_cyber_sound') === 'muted';
    if (isMuted) return;

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'click':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'warp':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(960, now + 0.14);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      case 'confirm':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(840, now + 0.06);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'toggle':
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.03);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      case 'alert':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(220, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
    }
  } catch {
    // Audio context may be restricted by browser policy before first user gesture
  }
};

type ActiveHudTab = 'exam-matrix' | 'mock-deck' | 'smart-assembler' | 'test-series' | 'exam-radar';

export const SuperAdminExamMaster: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Core Data State
  const [exams, setExams] = useState<GovernmentExam[]>([]);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [testSeries, setTestSeries] = useState<MockTestSeries[]>([]);
  const [questionBankCount, setQuestionBankCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Tab & Audio
  const [activeTab, setActiveTab] = useState<ActiveHudTab>('exam-matrix');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => {
    return localStorage.getItem('fp_cyber_sound') === 'muted';
  });

  // Selected Exam for Focused Inspection
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  // Filters — Exams
  const [examCategoryFilter, setExamCategoryFilter] = useState<string>('ALL');
  const [examStatusFilter, setExamStatusFilter] = useState<string>('ALL');
  const [examSearchTerm, setExamSearchTerm] = useState<string>('');

  // Filters — Mock Tests
  const [testExamFilter, setTestExamFilter] = useState<string>('ALL');
  const [testCategoryFilter, setTestCategoryFilter] = useState<string>('ALL');
  const [testStatusFilter, setTestStatusFilter] = useState<string>('ALL');
  const [testDifficultyFilter, setTestDifficultyFilter] = useState<string>('ALL');
  const [testSearchTerm, setTestSearchTerm] = useState<string>('');

  // Batch Operations State for Mock Tests
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);

  // Modals State
  const [isExamModalOpen, setIsExamModalOpen] = useState<boolean>(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [isAssembleModalOpen, setIsAssembleModalOpen] = useState<boolean>(false);
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState<boolean>(false);
  const [isPatternDrawerOpen, setIsPatternDrawerOpen] = useState<boolean>(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState<boolean>(false);
  const [simulationTest, setSimulationTest] = useState<MockTest | null>(null);

  // Exam Form Fields
  const [examName, setExamName] = useState<string>('');
  const [examShortName, setExamShortName] = useState<string>('');
  const [examCategory, setExamCategory] = useState<GovernmentExam['category']>('STATE_EXAMS');
  const [conductingAuthority, setConductingAuthority] = useState<string>('');
  const [examDuration, setExamDuration] = useState<number>(60);
  const [examTotalQuestions, setExamTotalQuestions] = useState<number>(100);
  const [examTotalMarks, setExamTotalMarks] = useState<number>(200);
  const [examNegativePenalty, setExamNegativePenalty] = useState<number>(0.5);
  const [examIsNational, setExamIsNational] = useState<boolean>(true);
  const [examState, setExamState] = useState<string>('Uttar Pradesh');
  const [examLevel, setExamLevel] = useState<GovernmentExam['level']>('GRADUATE');
  const [examSubjectsInput, setExamSubjectsInput] = useState<string>('Quantitative Aptitude, Reasoning, General Awareness, English');
  const [examDescription, setExamDescription] = useState<string>('');
  const [examOfficialUrl, setExamOfficialUrl] = useState<string>('https://ssc.gov.in');
  const [examPatternVersion, setExamPatternVersion] = useState<string>('Pattern-2026.1');
  const [savingExam, setSavingExam] = useState<boolean>(false);

  // Quick Assemble Mock Test State
  const [assembleExamId, setAssembleExamId] = useState<string>('');
  const [assembleTitle, setAssembleTitle] = useState<string>('');
  const [assembleIsFullMock, setAssembleIsFullMock] = useState<boolean>(true);
  const [assembleSubject, setAssembleSubject] = useState<string>('');
  const [assembleDuration, setAssembleDuration] = useState<number>(60);
  const [assembleMarks, setAssembleMarks] = useState<number>(200);
  const [assemblePenalty, setAssemblePenalty] = useState<number>(0.5);
  const [assembleCategory, setAssembleCategory] = useState<TestCategoryType>('FULL_TEST');
  const [assembleDifficulty, setAssembleDifficulty] = useState<QuestionDifficulty | 'MIXED'>('MIXED');
  const [isAssembling, setIsAssembling] = useState<boolean>(false);

  // Series Builder State
  const [seriesTitle, setSeriesTitle] = useState<string>('');
  const [seriesExamId, setSeriesExamId] = useState<string>('');
  const [seriesDescription, setSeriesDescription] = useState<string>('');
  const [seriesPrice, setSeriesPrice] = useState<number>(299);
  const [seriesIsFree, setSeriesIsFree] = useState<boolean>(false);
  const [seriesSchedule, setSeriesSchedule] = useState<'ALL_AT_ONCE' | 'WEEKLY' | 'DAILY'>('ALL_AT_ONCE');
  const [selectedTestsForSeries, setSelectedTestsForSeries] = useState<string[]>([]);
  const [savingSeries, setSavingSeries] = useState<boolean>(false);

  // Simulation Runner State
  const [simulationQuestions, setSimulationQuestions] = useState<QuestionItem[]>([]);
  const [currentSimQuestionIdx, setCurrentSimQuestionIdx] = useState<number>(0);
  const [simSelectedAnswers, setSimSelectedAnswers] = useState<Record<string, string>>({});
  const [simMarkedForReview, setSimMarkedForReview] = useState<Record<string, boolean>>({});
  const [simTimerSeconds, setSimTimerSeconds] = useState<number>(3600);
  const [simSubmitted, setSimSubmitted] = useState<boolean>(false);
  const [simScoreResult, setSimScoreResult] = useState<{
    correctCount: number;
    wrongCount: number;
    unattemptedCount: number;
    totalScore: number;
    maxScore: number;
    accuracyPercentage: number;
  } | null>(null);

  // Initial Data Load
  useEffect(() => {
    loadAllData();
  }, []);

  // Update selected exam on initial load if none selected
  useEffect(() => {
    if (exams.length > 0 && !selectedExamId) {
      setSelectedExamId(exams[0].id);
    }
  }, [exams, selectedExamId]);

  // Simulation timer tick
  useEffect(() => {
    if (!isSimulationModalOpen || simSubmitted) return;
    const interval = setInterval(() => {
      setSimTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSimulationModalOpen, simSubmitted]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [exList, tests, seriesList, qBank] = await Promise.all([
        mockTestService.getGovernmentExams(),
        mockTestService.getMockTests(),
        mockTestService.getMockTestSeries(),
        questionBankService.getQuestions()
      ]);

      setExams(exList);
      setMockTests(tests);
      setTestSeries(seriesList);
      setQuestionBankCount(qBank.length);

      if (exList.length > 0 && !selectedExamId) {
        setSelectedExamId(exList[0].id);
      }
    } catch (err) {
      console.error('Failed to load examination master data', err);
      addToast('Failed to load exam master data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleAudio = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    localStorage.setItem('fp_cyber_sound', next ? 'muted' : 'active');
    if (!next) playCyberSound('confirm');
  };

  const selectedExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || exams[0];
  }, [exams, selectedExamId]);

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter(e => {
      if (examCategoryFilter !== 'ALL' && e.category !== examCategoryFilter) return false;
      if (examStatusFilter !== 'ALL' && e.status !== examStatusFilter) return false;
      if (examSearchTerm.trim()) {
        const query = examSearchTerm.toLowerCase();
        const matchesName = e.name.toLowerCase().includes(query);
        const matchesShort = e.shortName.toLowerCase().includes(query);
        const matchesAuth = e.conductingAuthority.toLowerCase().includes(query);
        const matchesSubjects = e.subjects.some(s => s.toLowerCase().includes(query));
        if (!matchesName && !matchesShort && !matchesAuth && !matchesSubjects) return false;
      }
      return true;
    });
  }, [exams, examCategoryFilter, examStatusFilter, examSearchTerm]);

  // Filtered Mock Tests
  const filteredMockTests = useMemo(() => {
    return mockTests.filter(t => {
      if (testExamFilter !== 'ALL' && t.examId !== testExamFilter) return false;
      if (testCategoryFilter !== 'ALL' && t.category !== testCategoryFilter) return false;
      if (testStatusFilter !== 'ALL' && t.status !== testStatusFilter) return false;
      if (testDifficultyFilter !== 'ALL' && t.difficulty !== testDifficultyFilter) return false;
      if (testSearchTerm.trim()) {
        const query = testSearchTerm.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesExam = t.examName.toLowerCase().includes(query);
        const matchesSub = (t.subject || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesExam && !matchesSub) return false;
      }
      return true;
    });
  }, [mockTests, testExamFilter, testCategoryFilter, testStatusFilter, testDifficultyFilter, testSearchTerm]);

  // Telemetry Aggregates
  const stats = useMemo(() => {
    const totalExams = exams.length;
    const activeExams = exams.filter(e => e.status === 'ACTIVE').length;
    const nationalExams = exams.filter(e => e.isNational).length;
    const totalTests = mockTests.length;
    const publishedTests = mockTests.filter(t => t.status === 'PUBLISHED').length;
    const totalAttempts = mockTests.reduce((acc, t) => acc + (t.attemptCount || 0), 0);
    const avgQuestionsPerTest = totalTests > 0 ? Math.round(mockTests.reduce((acc, t) => acc + t.totalQuestions, 0) / totalTests) : 0;

    return {
      totalExams,
      activeExams,
      nationalExams,
      totalTests,
      publishedTests,
      totalAttempts,
      avgQuestionsPerTest,
      totalSeries: testSeries.length
    };
  }, [exams, mockTests, testSeries]);

  // Open Exam Register / Edit Modal
  const openExamModal = (examToEdit?: GovernmentExam) => {
    playCyberSound('click');
    if (examToEdit) {
      setEditingExamId(examToEdit.id);
      setExamName(examToEdit.name);
      setExamShortName(examToEdit.shortName);
      setExamCategory(examToEdit.category);
      setConductingAuthority(examToEdit.conductingAuthority);
      setExamDuration(examToEdit.durationMinutes);
      setExamTotalQuestions(examToEdit.totalQuestions);
      setExamTotalMarks(examToEdit.totalMarks);
      setExamNegativePenalty(examToEdit.negativeMarkingPerQuestion);
      setExamIsNational(examToEdit.isNational);
      setExamState(examToEdit.applicableState || 'Uttar Pradesh');
      setExamLevel(examToEdit.level);
      setExamSubjectsInput(examToEdit.subjects.join(', '));
      setExamDescription(examToEdit.description || '');
      setExamOfficialUrl(examToEdit.officialSourceUrl || 'https://ssc.gov.in');
      setExamPatternVersion(examToEdit.patternVersion || 'Pattern-2026.1');
    } else {
      setEditingExamId(null);
      setExamName('');
      setExamShortName('');
      setExamCategory('STATE_EXAMS');
      setConductingAuthority('');
      setExamDuration(60);
      setExamTotalQuestions(100);
      setExamTotalMarks(200);
      setExamNegativePenalty(0.5);
      setExamIsNational(true);
      setExamState('Uttar Pradesh');
      setExamLevel('GRADUATE');
      setExamSubjectsInput('Quantitative Aptitude, Reasoning, General Awareness, English');
      setExamDescription('');
      setExamOfficialUrl('https://ssc.gov.in');
      setExamPatternVersion('Pattern-2026.1');
    }
    setIsExamModalOpen(true);
  };

  // Handle Save / Update Exam
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !examShortName.trim() || !conductingAuthority.trim()) {
      playCyberSound('alert');
      addToast('Please fill all mandatory exam identification fields', 'error');
      return;
    }

    try {
      setSavingExam(true);
      const parsedSubjects = examSubjectsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const examId = editingExamId || `exam-${examShortName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      const examPayload: GovernmentExam = {
        id: examId,
        name: examName.trim(),
        shortName: examShortName.trim().toUpperCase(),
        category: examCategory,
        conductingAuthority: conductingAuthority.trim(),
        isNational: examIsNational,
        applicableState: !examIsNational ? examState : undefined,
        level: examLevel,
        subjects: parsedSubjects.length > 0 ? parsedSubjects : ['General Awareness', 'Arithmetic'],
        durationMinutes: Number(examDuration),
        totalQuestions: Number(examTotalQuestions),
        totalMarks: Number(examTotalMarks),
        negativeMarkingPerQuestion: Number(examNegativePenalty),
        languages: ['English', 'Hindi'],
        status: 'ACTIVE',
        patternVersion: examPatternVersion.trim() || 'Pattern-2026.1',
        description: examDescription.trim() || `Official examination pattern administered by ${conductingAuthority}`,
        officialSourceUrl: examOfficialUrl.trim()
      };

      const saved = await mockTestService.saveGovernmentExam(examPayload);
      playCyberSound('success');

      setExams(prev => {
        const idx = prev.findIndex(ex => ex.id === saved.id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [saved, ...prev];
      });

      setSelectedExamId(saved.id);
      setIsExamModalOpen(false);
      addToast(`Commission exam "${saved.name}" successfully registered!`, 'success');
    } catch (err) {
      console.error(err);
      playCyberSound('alert');
      addToast('Failed to save exam profile', 'error');
    } finally {
      setSavingExam(false);
    }
  };

  // Toggle Exam Status
  const handleToggleExamStatus = async (exam: GovernmentExam) => {
    playCyberSound('toggle');
    const newStatus: GovernmentExam['status'] = exam.status === 'ACTIVE' ? 'UPCOMING' : 'ACTIVE';
    const updated = { ...exam, status: newStatus };
    await mockTestService.saveGovernmentExam(updated);
    setExams(prev => prev.map(e => (e.id === exam.id ? updated : e)));
    addToast(`${exam.shortName} status changed to ${newStatus}`, 'info');
  };

  // Delete Exam
  const handleDeleteExam = async (examId: string, examName: string) => {
    if (!window.confirm(`Are you sure you want to decommission and remove "${examName}"?`)) return;
    playCyberSound('alert');
    try {
      const ok = await mockTestService.deleteGovernmentExam(examId);
      if (ok) {
        setExams(prev => prev.filter(e => e.id !== examId));
        if (selectedExamId === examId) {
          const remaining = exams.filter(e => e.id !== examId);
          setSelectedExamId(remaining.length > 0 ? remaining[0].id : '');
        }
        addToast(`Exam "${examName}" removed from repository`, 'info');
      }
    } catch {
      addToast('Error removing exam', 'error');
    }
  };

  // Open Quick Assemble Modal
  const openAssembleModal = (presetExamId?: string) => {
    playCyberSound('warp');
    const targetId = presetExamId || selectedExamId || (exams.length > 0 ? exams[0].id : '');
    setAssembleExamId(targetId);

    const ex = exams.find(e => e.id === targetId);
    if (ex) {
      setAssembleTitle(`${ex.shortName} 2026 Tier-1 All India Live Mock #${String(mockTests.length + 1).padStart(2, '0')}`);
      setAssembleDuration(ex.durationMinutes);
      setAssembleMarks(ex.totalMarks);
      setAssemblePenalty(ex.negativeMarkingPerQuestion);
      setAssembleSubject(ex.subjects[0] || 'General Awareness');
    } else {
      setAssembleTitle(`National Mock Test #${mockTests.length + 1}`);
      setAssembleDuration(60);
      setAssembleMarks(200);
      setAssemblePenalty(0.5);
    }
    setAssembleIsFullMock(true);
    setAssembleCategory('FULL_TEST');
    setAssembleDifficulty('MIXED');
    setIsAssembleModalOpen(true);
  };

  // Execute Mock Test Assembly
  const handleAssembleMockTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assembleExamId || !assembleTitle.trim()) {
      playCyberSound('alert');
      addToast('Exam target and title are required', 'error');
      return;
    }

    const currentExam = exams.find(e => e.id === assembleExamId);

    try {
      setIsAssembling(true);
      playCyberSound('warp');

      // Fetch published questions for target exam
      const bankQuestions = await questionBankService.getQuestions({
        examId: assembleExamId,
        status: 'PUBLISHED'
      });

      const eligibleQuestions =
        !assembleIsFullMock && assembleSubject
          ? bankQuestions.filter(q => q.subject.toLowerCase() === assembleSubject.toLowerCase())
          : bankQuestions;

      if (eligibleQuestions.length === 0) {
        playCyberSound('alert');
        addToast(
          'No published questions available for this exam yet! Please approve and publish questions in Question Bank & AI Studio first.',
          'error'
        );
        return;
      }

      const qIds = eligibleQuestions.map(q => q.id);

      const created = await questionBankService.createMockTestFromBank({
        examId: assembleExamId,
        examName: currentExam ? currentExam.name : 'Government Exam',
        title: assembleTitle.trim(),
        description: `Official national mock test aligned with latest syllabus and exam pattern for ${currentExam?.name || 'examination'}.`,
        subject: !assembleIsFullMock ? assembleSubject : undefined,
        category: assembleCategory,
        isFullMock: assembleIsFullMock,
        durationMinutes: Number(assembleDuration),
        totalQuestions: qIds.length,
        totalMarks: Number(assembleMarks),
        negativeMarkingPerQuestion: Number(assemblePenalty),
        passingMarks: Math.round(Number(assembleMarks) * 0.35),
        difficulty: assembleDifficulty,
        questionIds: qIds,
        status: 'PUBLISHED'
      });

      playCyberSound('success');
      setMockTests(prev => [created, ...prev]);
      setIsAssembleModalOpen(false);
      addToast(`Mock Test "${created.title}" successfully assembled & published!`, 'success');
    } catch (err) {
      console.error(err);
      playCyberSound('alert');
      addToast('Error assembling mock test', 'error');
    } finally {
      setIsAssembling(false);
    }
  };

  // 1-Click Duplicate Mock Test
  const handleDuplicateTest = async (testId: string) => {
    playCyberSound('confirm');
    try {
      const cloned = await mockTestService.duplicateMockTest(testId);
      if (cloned) {
        playCyberSound('success');
        setMockTests(prev => [cloned, ...prev]);
        addToast(`Created variant copy: "${cloned.title}"`, 'success');
      }
    } catch {
      addToast('Failed to duplicate mock test', 'error');
    }
  };

  // Toggle Mock Test Status (PUBLISHED / DRAFT)
  const handleToggleTestStatus = async (test: MockTest) => {
    playCyberSound('toggle');
    const newStatus: MockTest['status'] = test.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const updated = await mockTestService.updateMockTest(test.id, { status: newStatus });
    if (updated) {
      setMockTests(prev => prev.map(t => (t.id === test.id ? updated : t)));
      addToast(`Mock test status updated to ${newStatus}`, 'info');
    }
  };

  // Delete Mock Test
  const handleDeleteTest = async (testId: string, title: string) => {
    if (!window.confirm(`Delete mock test "${title}"?`)) return;
    playCyberSound('alert');
    try {
      const ok = await mockTestService.deleteMockTest(testId);
      if (ok) {
        setMockTests(prev => prev.filter(t => t.id !== testId));
        setSelectedTestIds(prev => prev.filter(id => id !== testId));
        addToast(`Mock test "${title}" deleted`, 'info');
      }
    } catch {
      addToast('Failed to delete mock test', 'error');
    }
  };

  // Batch Operations for Mock Tests
  const handleSelectAllTests = () => {
    playCyberSound('click');
    if (selectedTestIds.length === filteredMockTests.length) {
      setSelectedTestIds([]);
    } else {
      setSelectedTestIds(filteredMockTests.map(t => t.id));
    }
  };

  const handleToggleTestSelection = (testId: string) => {
    playCyberSound('click');
    setSelectedTestIds(prev =>
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  const handleBulkPublishTests = async () => {
    if (selectedTestIds.length === 0) return;
    playCyberSound('confirm');
    await mockTestService.bulkUpdateMockTests(selectedTestIds, { status: 'PUBLISHED' });
    setMockTests(prev =>
      prev.map(t => (selectedTestIds.includes(t.id) ? { ...t, status: 'PUBLISHED' } : t))
    );
    addToast(`Published ${selectedTestIds.length} mock tests to live catalog`, 'success');
    setSelectedTestIds([]);
  };

  const handleBulkDraftTests = async () => {
    if (selectedTestIds.length === 0) return;
    playCyberSound('toggle');
    await mockTestService.bulkUpdateMockTests(selectedTestIds, { status: 'DRAFT' });
    setMockTests(prev =>
      prev.map(t => (selectedTestIds.includes(t.id) ? { ...t, status: 'DRAFT' } : t))
    );
    addToast(`Set ${selectedTestIds.length} mock tests to DRAFT`, 'info');
    setSelectedTestIds([]);
  };

  const handleBulkDeleteTests = async () => {
    if (selectedTestIds.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedTestIds.length} selected mock tests?`)) return;
    playCyberSound('alert');
    for (const id of selectedTestIds) {
      await mockTestService.deleteMockTest(id);
    }
    setMockTests(prev => prev.filter(t => !selectedTestIds.includes(t.id)));
    addToast(`Deleted ${selectedTestIds.length} mock tests`, 'info');
    setSelectedTestIds([]);
  };

  // Export Tests CSV / JSON
  const handleExportTests = (format: 'json' | 'csv') => {
    playCyberSound('click');
    const testsToExport = selectedTestIds.length > 0
      ? mockTests.filter(t => selectedTestIds.includes(t.id))
      : filteredMockTests;

    const data = mockTestService.exportMockTests(format, testsToExport);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zyzus_mock_tests_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Exported ${testsToExport.length} mock tests as ${format.toUpperCase()}`, 'success');
  };

  // Export Exams CSV / JSON
  const handleExportExams = (format: 'json' | 'csv') => {
    playCyberSound('click');
    const data = mockTestService.exportExams(format, filteredExams);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focuspoint_government_exams_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Exported ${filteredExams.length} commission exams as ${format.toUpperCase()}`, 'success');
  };

  // Launch Live Student Test Simulation Sandbox
  const handleLaunchSimulation = async (test: MockTest) => {
    playCyberSound('warp');
    setSimulationTest(test);
    setSimSubmitted(false);
    setSimScoreResult(null);
    setSimSelectedAnswers({});
    setSimMarkedForReview({});
    setCurrentSimQuestionIdx(0);
    setSimTimerSeconds((test.durationMinutes || 60) * 60);

    try {
      const qList = await mockTestService.getQuestionsForTest(test.questionIds);
      setSimulationQuestions(qList);
      setIsSimulationModalOpen(true);
    } catch {
      addToast('Error loading question items for simulation', 'error');
    }
  };

  // Handle Simulation Answer Selection
  const handleSelectSimAnswer = (qId: string, optText: string) => {
    playCyberSound('click');
    setSimSelectedAnswers(prev => ({
      ...prev,
      [qId]: optText
    }));
  };

  // Toggle Mark for Review
  const handleToggleSimReview = (qId: string) => {
    playCyberSound('toggle');
    setSimMarkedForReview(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Submit Simulation & Calculate Score
  const handleSubmitSimulation = () => {
    if (!simulationTest) return;
    playCyberSound('confirm');

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    simulationQuestions.forEach(q => {
      const studentAns = simSelectedAnswers[q.id];
      if (!studentAns) {
        unattempted++;
      } else if (studentAns === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const marksPerQ = simulationTest.totalMarks / (simulationTest.totalQuestions || 1);
    const penaltyPerQ = simulationTest.negativeMarkingPerQuestion || 0;
    const rawScore = correct * marksPerQ - wrong * penaltyPerQ;
    const finalScore = Math.max(0, Math.round(rawScore * 100) / 100);
    const totalAttempted = correct + wrong;
    const accuracy = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;

    setSimScoreResult({
      correctCount: correct,
      wrongCount: wrong,
      unattemptedCount: unattempted,
      totalScore: finalScore,
      maxScore: simulationTest.totalMarks,
      accuracyPercentage: accuracy
    });
    setSimSubmitted(true);
    playCyberSound('success');
    addToast('Simulation submitted! Evaluation complete.', 'success');
  };

  // Create Test Series Package
  const handleCreateTestSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesTitle.trim() || !seriesExamId) {
      playCyberSound('alert');
      addToast('Please specify a title and exam for this package', 'error');
      return;
    }

    try {
      setSavingSeries(true);
      const ex = exams.find(e => e.id === seriesExamId);
      const includedTests = mockTests.filter(t => selectedTestsForSeries.includes(t.id));

      const newSeries: MockTestSeries = {
        id: `series-${Date.now()}`,
        examId: seriesExamId,
        examName: ex ? ex.name : 'Commission Exam',
        title: seriesTitle.trim(),
        description: seriesDescription.trim() || `Comprehensive test series covering all sections for ${ex?.name || 'examination'}.`,
        totalTests: includedTests.length,
        tests: includedTests.map((t, idx) => ({
          testId: t.id,
          testTitle: t.title,
          order: idx + 1,
          isUnlocked: true,
          questionCount: t.totalQuestions,
          durationMinutes: t.durationMinutes,
          totalMarks: t.totalMarks
        })),
        difficulty: 'MIXED',
        language: 'Hindi & English',
        isFree: seriesIsFree,
        price: seriesIsFree ? 0 : Number(seriesPrice),
        subscriptionRequired: !seriesIsFree,
        status: 'PUBLISHED',
        unlockScheduleType: seriesSchedule,
        createdAt: new Date().toISOString()
      };

      const saved = await mockTestService.saveMockTestSeries(newSeries);
      playCyberSound('success');
      setTestSeries(prev => [saved, ...prev]);
      setIsSeriesModalOpen(false);
      setSeriesTitle('');
      setSelectedTestsForSeries([]);
      addToast(`Test series package "${saved.title}" created successfully!`, 'success');
    } catch {
      playCyberSound('alert');
      addToast('Failed to save test series package', 'error');
    } finally {
      setSavingSeries(false);
    }
  };

  const handleDeleteTestSeries = async (id: string, title: string) => {
    if (!window.confirm(`Delete test series "${title}"?`)) return;
    playCyberSound('alert');
    try {
      const ok = await mockTestService.deleteMockTestSeries(id);
      if (ok) {
        setTestSeries(prev => prev.filter(s => s.id !== id));
        addToast(`Test series package removed`, 'info');
      }
    } catch {
      addToast('Failed to delete series package', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20 font-sans text-slate-100">
      {/* =========================================================================
          TOP COMMAND HUD: Telemetry Ribbon & Header Controls
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-cyan-500/30 p-6 shadow-2xl backdrop-blur-xl">
        {/* Futuristic Ambient Glow Background */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-cyan-500/20 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              FOCUSPOINT COGNITIVE ORCHESTRATION ENGINE v2026.4
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Landmark className="w-8 h-8 text-cyan-400" />
              Govt Exam & Mock Master
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              National Commission Exam Blueprinting, Auto-Evaluating Mock Test Engine, Negative Marking Calibrator, and Test Series Packager.
            </p>
          </div>

          {/* Quick HUD Triggers */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleAudio}
              className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
                isAudioMuted
                  ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  : 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
              }`}
              title={isAudioMuted ? 'Unmute cyber acoustic feedback' : 'Mute cyber acoustic feedback'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isAudioMuted ? 'MUTED' : 'HUD AUDIO'}</span>
            </button>

            <button
              onClick={() => openExamModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/60 text-slate-200 rounded-xl text-xs font-bold font-mono tracking-wider transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              REGISTER EXAM
            </button>

            <button
              onClick={() => openAssembleModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white rounded-xl text-xs font-black font-mono tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              <Sparkles className="w-4 h-4" />
              ASSEMBLE MOCK TEST
            </button>
          </div>
        </div>

        {/* Real-time Telemetry Counters Ribbon */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>COMMISSIONS</span>
              <Landmark className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {stats.totalExams}
            </div>
            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
              {stats.activeExams} Active • {stats.nationalExams} National
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-brand-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>MOCK TESTS</span>
              <Layers className="w-3.5 h-3.5 text-brand-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {stats.totalTests}
            </div>
            <div className="text-[11px] text-brand-400 font-mono mt-0.5">
              {stats.publishedTests} Live Catalog
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>STUDENT ATTEMPTS</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-300 mt-1">
              {stats.totalAttempts.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
              Across All Districts
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>QUESTION POOL</span>
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300 mt-1">
              {questionBankCount}
            </div>
            <div className="text-[11px] text-amber-400 font-mono mt-0.5">
              Indexed in Bank
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>TEST SERIES</span>
              <Award className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-300 mt-1">
              {stats.totalSeries}
            </div>
            <div className="text-[11px] text-purple-400 font-mono mt-0.5">
              Curated Packages
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-rose-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>PENALTY RADAR</span>
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-300 mt-1">
              100%
            </div>
            <div className="text-[11px] text-rose-400 font-mono mt-0.5">
              Negative Marking Sync
            </div>
          </div>
        </div>

        {/* HUD Navigation Tabs */}
        <div className="relative z-10 flex flex-wrap gap-2 mt-6 pt-5 border-t border-slate-800">
          {[
            { id: 'exam-matrix', label: 'COMMISSION EXAM MATRIX', icon: Landmark, count: filteredExams.length },
            { id: 'mock-deck', label: 'MOCK TEST COMMAND DECK', icon: Layers, count: filteredMockTests.length },
            { id: 'smart-assembler', label: 'NEURAL MOCK ASSEMBLER', icon: Sparkles, count: undefined },
            { id: 'test-series', label: 'TEST SERIES ARCHITECT', icon: Award, count: testSeries.length },
            { id: 'exam-radar', label: 'CURRICULUM & PATTERN RADAR', icon: BarChart3, count: undefined }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playCyberSound('click');
                  setActiveTab(tab.id as ActiveHudTab);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: COMMISSION EXAM MATRIX
          ========================================================================= */}
      {activeTab === 'exam-matrix' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 px-1">CATEGORY:</span>
              {['ALL', 'SSC', 'RAILWAY', 'STATE_EXAMS', 'BANKING', 'POLICE', 'TEACHING'].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    playCyberSound('click');
                    setExamCategoryFilter(cat);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    examCategoryFilter === cat
                      ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300 shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search exam or authority..."
                  value={examSearchTerm}
                  onChange={e => setExamSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500 text-slate-100 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <button
                onClick={() => handleExportExams('csv')}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono flex items-center gap-1.5"
                title="Export Exams CSV"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">CSV</span>
              </button>
            </div>
          </div>

          {/* Exams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExams.map(exam => {
              const isSelected = selectedExamId === exam.id;
              const examMockTests = mockTests.filter(t => t.examId === exam.id);

              return (
                <div
                  key={exam.id}
                  className={`group relative rounded-2xl p-5 border transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                        {exam.shortName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {exam.category.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleExamStatus(exam)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                        exam.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {exam.status}
                    </button>
                  </div>

                  {/* Name & Conducting Body */}
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {exam.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {exam.conductingAuthority}
                  </p>

                  {/* Pattern Specs Bar */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">DURATION</div>
                      <div className="text-xs font-bold text-slate-200 mt-0.5 font-mono">{exam.durationMinutes}m</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">QUESTIONS</div>
                      <div className="text-xs font-bold text-slate-200 mt-0.5 font-mono">{exam.totalQuestions}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">PENALTY</div>
                      <div className="text-xs font-bold text-rose-400 mt-0.5 font-mono">-{exam.negativeMarkingPerQuestion}</div>
                    </div>
                  </div>

                  {/* Subjects Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                    {exam.subjects.map((sub, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-mono border border-slate-800">
                        {sub}
                      </span>
                    ))}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">
                      {examMockTests.length} Mock Tests Bound
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedExamId(exam.id);
                          setIsPatternDrawerOpen(true);
                          playCyberSound('click');
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800"
                        title="Inspect Syllabus Blueprint"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openExamModal(exam)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800"
                        title="Edit Exam Pattern"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openAssembleModal(exam.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-500/40 text-cyan-200 text-xs font-mono font-bold border border-cyan-500/50 flex items-center gap-1"
                        title="Assemble Mock Test for this Exam"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>TEST</span>
                      </button>

                      <button
                        onClick={() => handleDeleteExam(exam.id, exam.name)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800"
                        title="Decommission Exam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MOCK TEST COMMAND DECK
          ========================================================================= */}
      {activeTab === 'mock-deck' && (
        <div className="space-y-6">
          {/* Deck Filters & Batch Controls */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">EXAM:</span>
                <select
                  value={testExamFilter}
                  onChange={e => {
                    playCyberSound('click');
                    setTestExamFilter(e.target.value);
                  }}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Registered Exams ({mockTests.length} Tests)</option>
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>{e.shortName} — {e.name.slice(0, 32)}...</option>
                  ))}
                </select>

                <select
                  value={testCategoryFilter}
                  onChange={e => {
                    playCyberSound('click');
                    setTestCategoryFilter(e.target.value);
                  }}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="FULL_TEST">Full Length Tests</option>
                  <option value="SUBJECT_WISE">Sectional / Subject-Wise</option>
                  <option value="PREVIOUS_YEAR">Previous Year Papers (PYQ)</option>
                  <option value="CHAPTER_WISE">Chapter Drills</option>
                </select>

                <select
                  value={testStatusFilter}
                  onChange={e => {
                    playCyberSound('click');
                    setTestStatusFilter(e.target.value);
                  }}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PUBLISHED">Published Live</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search mock tests..."
                    value={testSearchTerm}
                    onChange={e => setTestSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  onClick={() => handleExportTests('csv')}
                  className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono flex items-center gap-1.5"
                  title="Export Tests CSV"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
              </div>
            </div>

            {/* Floating Batch Operations Bar */}
            {selectedTestIds.length > 0 && (
              <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold">
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                  <span>{selectedTestIds.length} MOCK TESTS SELECTED FOR BATCH OPERATIONS</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkPublishTests}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PUBLISH ALL</span>
                  </button>

                  <button
                    onClick={handleBulkDraftTests}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold flex items-center gap-1"
                  >
                    <span>SET DRAFT</span>
                  </button>

                  <button
                    onClick={handleBulkDeleteTests}
                    className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-mono font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>DELETE</span>
                  </button>

                  <button
                    onClick={() => setSelectedTestIds([])}
                    className="p-1.5 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Test Cards List */}
          {filteredMockTests.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-200">No mock tests match this filter</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Assemble a new test with the Neural Assembler or adjust your category and search criteria.
              </p>
              <button
                onClick={() => openAssembleModal()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold font-mono"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Assemble Mock Test
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2 text-xs font-mono text-slate-400">
                <button
                  onClick={handleSelectAllTests}
                  className="flex items-center gap-2 hover:text-cyan-300"
                >
                  {selectedTestIds.length === filteredMockTests.length ? (
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                  <span>Select All Filtered ({filteredMockTests.length})</span>
                </button>
                <span>Showing {filteredMockTests.length} tests</span>
              </div>

              {filteredMockTests.map(test => {
                const isSelected = selectedTestIds.includes(test.id);

                return (
                  <div
                    key={test.id}
                    className={`rounded-2xl p-5 border transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Checkbox + Title + Meta */}
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleTestSelection(test.id)}
                          className="mt-1 text-slate-400 hover:text-cyan-400"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold">
                              {test.examName}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-mono">
                              {test.isFullMock ? 'FULL MOCK' : `SECTIONAL: ${test.subject || 'Specialized'}`}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-mono">
                              {test.category || 'TEST_SERIES'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              test.status === 'PUBLISHED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-900 text-slate-400 border border-slate-700'
                            }`}>
                              {test.status}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white mt-1.5">
                            {test.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 mt-2">
                            <span>⏱️ {test.durationMinutes} mins</span>
                            <span>•</span>
                            <span>📝 {test.totalQuestions} Questions</span>
                            <span>•</span>
                            <span>🎯 {test.totalMarks} Marks</span>
                            <span>•</span>
                            <span className="text-rose-400 font-bold">-{test.negativeMarkingPerQuestion} Penalty</span>
                            <span>•</span>
                            <span className="text-emerald-400">👥 {test.attemptCount} Attempts</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions Suite */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => handleLaunchSimulation(test)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-black tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                          title="Simulate this mock test as a student"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>SIMULATE</span>
                        </button>

                        <button
                          onClick={() => handleDuplicateTest(test.id)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300"
                          title="Clone / Duplicate Test"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleTestStatus(test)}
                          className={`p-2 rounded-xl border text-xs font-mono transition-all ${
                            test.status === 'PUBLISHED'
                              ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                              : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                          }`}
                          title={test.status === 'PUBLISHED' ? 'Convert to Draft' : 'Publish Live'}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteTest(test.id, test.title)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 border border-slate-800 text-slate-400 hover:text-rose-400"
                          title="Delete Mock Test"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: NEURAL MOCK ASSEMBLER (Multi-Stage Synthesis Wizard)
          ========================================================================= */}
      {activeTab === 'smart-assembler' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Interactive Assembler Form */}
          <div className="lg:col-span-2 rounded-3xl bg-slate-950 border border-cyan-500/30 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Neural Curriculum Mock Test Assembler
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Compose authentic government mock tests automatically linked to verified questions in the Question Bank.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                AUTO-SYNTHESIS READY
              </span>
            </div>

            <form onSubmit={handleAssembleMockTest} className="space-y-5">
              {/* Target Exam */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                  1. Target Commission Exam *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {exams.map(e => {
                    const isPicked = assembleExamId === e.id;
                    return (
                      <div
                        key={e.id}
                        onClick={() => {
                          playCyberSound('click');
                          setAssembleExamId(e.id);
                          setAssembleTitle(`${e.shortName} 2026 Tier-1 All India Live Mock #${String(mockTests.length + 1).padStart(2, '0')}`);
                          setAssembleDuration(e.durationMinutes);
                          setAssembleMarks(e.totalMarks);
                          setAssemblePenalty(e.negativeMarkingPerQuestion);
                          setAssembleSubject(e.subjects[0] || '');
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isPicked
                            ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs font-mono">{e.shortName}</span>
                          <span className="text-[10px] font-mono text-cyan-400">{e.totalQuestions} Qs • {e.durationMinutes}m</span>
                        </div>
                        <div className="text-xs font-semibold mt-1 text-slate-200 truncate">{e.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Title & Mode */}
              <div className="space-y-3">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                  2. Test Title & Coverage Mode *
                </label>
                <input
                  type="text"
                  value={assembleTitle}
                  onChange={e => setAssembleTitle(e.target.value)}
                  placeholder="e.g. SSC CGL Tier-1 National Live Simulation #05"
                  required
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">TEST STRUCTURE</label>
                    <select
                      value={assembleIsFullMock ? 'FULL' : 'SECTIONAL'}
                      onChange={e => setAssembleIsFullMock(e.target.value === 'FULL')}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none"
                    >
                      <option value="FULL">Full Length Mock (All Subjects)</option>
                      <option value="SECTIONAL">Sectional / Subject Drill</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">TEST CATEGORY</label>
                    <select
                      value={assembleCategory}
                      onChange={e => setAssembleCategory(e.target.value as TestCategoryType)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none"
                    >
                      <option value="FULL_TEST">Full Mock Test</option>
                      <option value="SUBJECT_WISE">Subject Wise Drill</option>
                      <option value="PREVIOUS_YEAR">Previous Year Paper (PYQ)</option>
                      <option value="CHAPTER_WISE">Chapter Wise Test</option>
                    </select>
                  </div>
                </div>

                {!assembleIsFullMock && selectedExam && (
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">TARGET SECTION / SUBJECT</label>
                    <select
                      value={assembleSubject}
                      onChange={e => setAssembleSubject(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none"
                    >
                      {selectedExam.subjects.map((sub, i) => (
                        <option key={i} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Marking Parameters */}
              <div className="space-y-3">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                  3. Examination Parameters & Negative Marking
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">DURATION (MINS)</label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={assembleDuration}
                      onChange={e => setAssembleDuration(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">TOTAL MARKS</label>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      value={assembleMarks}
                      onChange={e => setAssembleMarks(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">WRONG PENALTY</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="5"
                      value={assemblePenalty}
                      onChange={e => setAssemblePenalty(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-rose-400 font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Assembly Trigger */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs font-mono text-slate-400">
                  ⚡ Auto-links published questions matching exam blueprint
                </div>

                <button
                  type="submit"
                  disabled={isAssembling}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 disabled:opacity-50 text-white text-xs font-mono font-black tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAssembling ? 'ASSEMBLING & LINKING...' : 'ASSEMBLE & DEPLOY TEST'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Col: Blueprint Calibration Info */}
          <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 space-y-6">
            <h4 className="text-sm font-black font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Blueprint Verification
            </h4>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>QUESTION POOL POINTER</span>
                <span className="text-cyan-400 font-bold">READY</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>NEGATIVE MARKING ENGINE</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>PASSING THRESHOLD</span>
                <span className="text-slate-200 font-bold">35% CUTOFF</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>BILINGUAL HINDI SUPPORT</span>
                <span className="text-purple-400 font-bold">ENABLED</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-cyan-300 font-mono">RULE 17 PROTOCOL:</div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                The assembler connects only to questions with status <code className="text-cyan-400">PUBLISHED</code>. If you just created AI questions in the AI Studio, approve and publish them first to make them available here.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: TEST SERIES ARCHITECT
          ========================================================================= */}
      {activeTab === 'test-series' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Curated Test Series Packages</h3>
              <p className="text-xs text-slate-400 mt-0.5">Bundle mock tests into structured multi-test series for students.</p>
            </div>

            <button
              onClick={() => {
                playCyberSound('click');
                setSeriesTitle('');
                setSeriesExamId(exams.length > 0 ? exams[0].id : '');
                setSelectedTestsForSeries([]);
                setIsSeriesModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-mono font-bold shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>COMPOSE TEST SERIES</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testSeries.map(series => (
              <div
                key={series.id}
                className="rounded-2xl p-5 bg-slate-950 border border-slate-800 hover:border-purple-500/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
                      {series.examName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 text-[10px] font-mono">
                      {series.isFree ? 'FREE ACCESS' : `₹${series.price || 299}`}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white line-clamp-2">
                    {series.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {series.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500">TESTS INCLUDED</div>
                      <div className="font-bold text-purple-300 mt-0.5">{series.totalTests} Mocks</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">SCHEDULE</div>
                      <div className="font-bold text-slate-200 mt-0.5">{series.unlockScheduleType}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-400">
                    ● {series.status}
                  </span>

                  <button
                    onClick={() => handleDeleteTestSeries(series.id, series.title)}
                    className="p-1.5 text-slate-500 hover:text-rose-400"
                    title="Delete Test Series"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: CURRICULUM & PATTERN RADAR
          ========================================================================= */}
      {activeTab === 'exam-radar' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-950 border border-cyan-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Commission Syllabus & Section Weightage Radar
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Inspect official patterns, negative scoring compliance, and section quotas across examinations.
                </p>
              </div>

              <select
                value={selectedExamId}
                onChange={e => setSelectedExamId(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none"
              >
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.shortName} — {e.name}</option>
                ))}
              </select>
            </div>

            {selectedExam && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pattern Specifications Breakdown */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">OFFICIAL COMMISSION PARAMETERS</h4>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Exam Code & Authority:</span>
                      <span className="text-white font-bold">{selectedExam.shortName} ({selectedExam.conductingAuthority})</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Pattern Version:</span>
                      <span className="text-cyan-400 font-bold">{selectedExam.patternVersion}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Total Duration:</span>
                      <span className="text-white font-bold">{selectedExam.durationMinutes} Minutes</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Total Questions:</span>
                      <span className="text-white font-bold">{selectedExam.totalQuestions} Questions</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Max Marks & Penalty:</span>
                      <span className="text-rose-400 font-bold">{selectedExam.totalMarks} Marks (-{selectedExam.negativeMarkingPerQuestion} each)</span>
                    </div>
                  </div>
                </div>

                {/* Section Quotas & Subjects */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">SYLLABUS SECTIONS & WEIGHTAGE</h4>
                  <div className="space-y-3">
                    {selectedExam.subjects.map((sub, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-200 font-bold">{sub}</span>
                          <span className="text-cyan-400">~{Math.round(selectedExam.totalQuestions / selectedExam.subjects.length)} Qs</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-brand-500 h-full rounded-full"
                            style={{ width: `${Math.round(100 / selectedExam.subjects.length)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: REGISTER / EDIT COMMISSION EXAM
          ========================================================================= */}
      {isExamModalOpen && (
        <Modal
          isOpen={isExamModalOpen}
          onClose={() => setIsExamModalOpen(false)}
          title={editingExamId ? `Edit Examination Pattern: ${examShortName}` : 'Register Government Examination'}
          size="lg"
        >
          <form onSubmit={handleSaveExam} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Exam Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Staff Selection Commission — Combined Graduate Level (SSC CGL)"
                value={examName}
                onChange={e => setExamName(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Short Code *</label>
                <input
                  type="text"
                  placeholder="e.g. SSC CGL"
                  value={examShortName}
                  onChange={e => setExamShortName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Category *</label>
                <select
                  value={examCategory}
                  onChange={e => setExamCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none"
                >
                  <option value="SSC">Staff Selection Commission (SSC)</option>
                  <option value="RAILWAY">Railway Recruitment Boards (RRB)</option>
                  <option value="STATE_EXAMS">State Commission (UPSSSC/BPSC)</option>
                  <option value="BANKING">Banking (IBPS/SBI)</option>
                  <option value="POLICE">Police & Paramilitary</option>
                  <option value="TEACHING">Teacher Eligibility (TET/CTET)</option>
                  <option value="DEFENCE">Defence Services (NDA/CDS)</option>
                  <option value="CIVIL_SERVICES">Civil Services (UPSC/State PCS)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Conducting Authority *</label>
              <input
                type="text"
                placeholder="e.g. Staff Selection Commission (SSC, New Delhi)"
                value={conductingAuthority}
                onChange={e => setConductingAuthority(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase mb-1">Duration (m)</label>
                <input
                  type="number"
                  value={examDuration}
                  onChange={e => setExamDuration(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase mb-1">Total Qs</label>
                <input
                  type="number"
                  value={examTotalQuestions}
                  onChange={e => setExamTotalQuestions(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase mb-1">Max Marks</label>
                <input
                  type="number"
                  value={examTotalMarks}
                  onChange={e => setExamTotalMarks(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase mb-1">Penalty</label>
                <input
                  type="number"
                  step="0.05"
                  value={examNegativePenalty}
                  onChange={e => setExamNegativePenalty(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Syllabus Subjects (Comma Separated) *
              </label>
              <input
                type="text"
                placeholder="Quantitative Aptitude, General Intelligence, English, General Awareness"
                value={examSubjectsInput}
                onChange={e => setExamSubjectsInput(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Official Description / Notes</label>
              <textarea
                rows={2}
                placeholder="Key eligibility criteria and selection posts..."
                value={examDescription}
                onChange={e => setExamDescription(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsExamModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingExam}>
                {savingExam ? 'Saving...' : editingExamId ? 'Update Exam' : 'Register Exam'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 2: ASSEMBLE MOCK TEST MODAL (Direct Trigger)
          ========================================================================= */}
      {isAssembleModalOpen && (
        <Modal
          isOpen={isAssembleModalOpen}
          onClose={() => setIsAssembleModalOpen(false)}
          title={`Assemble Mock Test`}
          size="lg"
        >
          <form onSubmit={handleAssembleMockTest} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Target Exam *</label>
              <select
                value={assembleExamId}
                onChange={e => {
                  setAssembleExamId(e.target.value);
                  const ex = exams.find(x => x.id === e.target.value);
                  if (ex) {
                    setAssembleTitle(`${ex.shortName} Live Mock #${mockTests.length + 1}`);
                    setAssembleDuration(ex.durationMinutes);
                    setAssembleMarks(ex.totalMarks);
                    setAssemblePenalty(ex.negativeMarkingPerQuestion);
                  }
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
              >
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.shortName} — {e.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Mock Test Title *</label>
              <input
                type="text"
                value={assembleTitle}
                onChange={e => setAssembleTitle(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Mode</label>
                <select
                  value={assembleIsFullMock ? 'FULL' : 'SECTIONAL'}
                  onChange={e => setAssembleIsFullMock(e.target.value === 'FULL')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                >
                  <option value="FULL">Full Length Mock</option>
                  <option value="SECTIONAL">Sectional Test</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={assembleCategory}
                  onChange={e => setAssembleCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                >
                  <option value="FULL_TEST">Full Mock Test</option>
                  <option value="SUBJECT_WISE">Sectional Test</option>
                  <option value="PREVIOUS_YEAR">Previous Year Paper</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase mb-1">Duration (m)</label>
                <input
                  type="number"
                  value={assembleDuration}
                  onChange={e => setAssembleDuration(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase mb-1">Total Marks</label>
                <input
                  type="number"
                  value={assembleMarks}
                  onChange={e => setAssembleMarks(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase mb-1">Negative Penalty</label>
                <input
                  type="number"
                  step="0.05"
                  value={assemblePenalty}
                  onChange={e => setAssemblePenalty(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-600"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-900">
              Auto-links verified questions matching this exam and activates instant score evaluation.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsAssembleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isAssembling}>
                {isAssembling ? 'Assembling...' : 'Assemble & Publish Test'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 3: STUDENT TEST SIMULATION SANDBOX (Live Interactive Runner)
          ========================================================================= */}
      {isSimulationModalOpen && simulationTest && (
        <Modal
          isOpen={isSimulationModalOpen}
          onClose={() => setIsSimulationModalOpen(false)}
          title={`Student Test Simulation: ${simulationTest.title}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Header: Scorecard or Live Timer */}
            {!simSubmitted ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white font-bold">{simulationTest.examName} • QUESTION {currentSimQuestionIdx + 1} OF {simulationQuestions.length}</span>
                </div>

                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>
                    TIME REMAINING: {Math.floor(simTimerSeconds / 60)}:
                    {String(simTimerSeconds % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
            ) : (
              simScoreResult && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-mono font-bold">
                        SIMULATION EVALUATION COMPLETE
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1">Official Mock Scorecard</h3>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        {simScoreResult.totalScore} / {simScoreResult.maxScore}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        ACCURACY: {simScoreResult.accuracyPercentage}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-emerald-400 font-bold text-lg">{simScoreResult.correctCount}</div>
                      <div className="text-slate-400 text-[10px]">CORRECT (+{simulationTest.totalMarks / simulationTest.totalQuestions} each)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-rose-400 font-bold text-lg">{simScoreResult.wrongCount}</div>
                      <div className="text-slate-400 text-[10px]">INCORRECT (-{simulationTest.negativeMarkingPerQuestion} penalty)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 font-bold text-lg">{simScoreResult.unattemptedCount}</div>
                      <div className="text-slate-400 text-[10px]">UNATTEMPTED</div>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Question Runner Sandbox */}
            {simulationQuestions.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left 3 Cols: Active Question */}
                <div className="lg:col-span-3 space-y-4 p-5 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-sm">
                  {(() => {
                    const q = simulationQuestions[currentSimQuestionIdx];
                    if (!q) return null;
                    const selectedOpt = simSelectedAnswers[q.id];
                    const isMarked = simMarkedForReview[q.id];

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold font-mono">
                            Question #{currentSimQuestionIdx + 1} • {q.subject}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleSimReview(q.id)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                isMarked
                                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {isMarked ? '★ Marked for Review' : '☆ Mark for Review'}
                            </button>
                            <span className="text-xs font-mono text-slate-500">
                              +{q.marks} / -{q.negativeMarks} marks
                            </span>
                          </div>
                        </div>

                        {/* Statement */}
                        <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                          {q.questionText}
                        </div>

                        {q.hindiQuestionText && (
                          <div className="p-3 bg-amber-50/60 rounded-xl text-xs text-amber-950 font-medium">
                            {q.hindiQuestionText}
                          </div>
                        )}

                        {/* Options Radio List */}
                        <div className="space-y-2 pt-2">
                          {q.options.map((opt, oIdx) => {
                            const isPicked = selectedOpt === opt.text;
                            const isCorrectAns = simSubmitted && opt.text === q.correctAnswer;
                            const isWrongAns = simSubmitted && isPicked && opt.text !== q.correctAnswer;

                            return (
                              <div
                                key={opt.id || oIdx}
                                onClick={() => !simSubmitted && handleSelectSimAnswer(q.id, opt.text)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                  isCorrectAns
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                                    : isWrongAns
                                    ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold'
                                    : isPicked
                                    ? 'bg-brand-50 border-brand-500 text-brand-900 font-semibold'
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-6 h-6 rounded-full bg-white border flex items-center justify-center text-xs font-bold font-mono">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span className="text-xs">{opt.text}</span>
                                </div>

                                {isCorrectAns && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                {isWrongAns && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                              </div>
                            );
                          })}
                        </div>

                        {/* If Submitted, Reveal Solution Explanation */}
                        {simSubmitted && q.explanation && (
                          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                            <div className="font-bold text-slate-900 uppercase">Conceptual Derivation & Solution:</div>
                            <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Navigation Prev / Next */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setCurrentSimQuestionIdx(prev => Math.max(0, prev - 1))}
                      disabled={currentSimQuestionIdx === 0}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-bold text-slate-700"
                    >
                      ← Previous
                    </button>

                    <button
                      onClick={() => setCurrentSimQuestionIdx(prev => Math.min(simulationQuestions.length - 1, prev + 1))}
                      disabled={currentSimQuestionIdx === simulationQuestions.length - 1}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-bold text-slate-700"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Right Col: Question Palette */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="text-xs font-mono font-bold text-slate-300 uppercase">QUESTION PALETTE</div>
                  <div className="grid grid-cols-4 gap-2">
                    {simulationQuestions.map((q, idx) => {
                      const isCurrent = currentSimQuestionIdx === idx;
                      const isAnswered = Boolean(simSelectedAnswers[q.id]);
                      const isMarked = Boolean(simMarkedForReview[q.id]);

                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            playCyberSound('click');
                            setCurrentSimQuestionIdx(idx);
                          }}
                          className={`h-9 rounded-lg font-mono text-xs font-bold transition-all ${
                            isCurrent
                              ? 'ring-2 ring-cyan-400 bg-cyan-600 text-white'
                              : isMarked
                              ? 'bg-purple-900 text-purple-200 border border-purple-500'
                              : isAnswered
                              ? 'bg-emerald-800 text-emerald-100'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {!simSubmitted ? (
                    <button
                      onClick={handleSubmitSimulation}
                      className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-mono font-bold tracking-wider shadow-lg"
                    >
                      SUBMIT TEST SIMULATION
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsSimulationModalOpen(false)}
                      className="w-full mt-4 py-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-mono font-bold"
                    >
                      CLOSE RUNNER
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 4: SYLLABUS & PATTERN INSPECTOR DRAWER
          ========================================================================= */}
      {isPatternDrawerOpen && selectedExam && (
        <Modal
          isOpen={isPatternDrawerOpen}
          onClose={() => setIsPatternDrawerOpen(false)}
          title={`Syllabus & Blueprint: ${selectedExam.name}`}
          size="lg"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-2 border border-slate-800">
              <div className="text-cyan-400 font-bold uppercase">{selectedExam.shortName} • {selectedExam.conductingAuthority}</div>
              <p className="text-slate-400">{selectedExam.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-800">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Pattern Version:</span>
                <span className="font-bold ml-1">{selectedExam.patternVersion}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Academic Level:</span>
                <span className="font-bold ml-1">{selectedExam.level}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-800 uppercase">Registered Syllabus Subjects:</div>
              <div className="flex flex-wrap gap-2">
                {selectedExam.subjects.map((sub, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 font-bold">
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            {selectedExam.officialSourceUrl && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Official Portal:</span>
                <a
                  href={selectedExam.officialSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-600 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>{selectedExam.officialSourceUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 5: CREATE TEST SERIES PACKAGE
          ========================================================================= */}
      {isSeriesModalOpen && (
        <Modal
          isOpen={isSeriesModalOpen}
          onClose={() => setIsSeriesModalOpen(false)}
          title="Compose Test Series Package"
          size="lg"
        >
          <form onSubmit={handleCreateTestSeries} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Target Exam *</label>
              <select
                value={seriesExamId}
                onChange={e => setSeriesExamId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              >
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.shortName} — {e.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Series Package Title *</label>
              <input
                type="text"
                placeholder="e.g. SSC CGL 2026 All India 20 Live Mock Test Series"
                value={seriesTitle}
                onChange={e => setSeriesTitle(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Select Mock Tests to Include *</label>
              <div className="max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl space-y-1.5 bg-slate-50">
                {mockTests.map(t => {
                  const isChecked = selectedTestsForSeries.includes(t.id);
                  return (
                    <label key={t.id} className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedTestsForSeries(prev =>
                            isChecked ? prev.filter(id => id !== t.id) : [...prev, t.id]
                          );
                        }}
                      />
                      <span className="font-semibold text-slate-800">{t.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({t.examName})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={seriesPrice}
                  onChange={e => setSeriesPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">Unlock Schedule</label>
                <select
                  value={seriesSchedule}
                  onChange={e => setSeriesSchedule(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                >
                  <option value="ALL_AT_ONCE">All Tests Unlocked Immediately</option>
                  <option value="WEEKLY">Weekly Schedule</option>
                  <option value="DAILY">Daily Drill Release</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsSeriesModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingSeries}>
                {savingSeries ? 'Composing...' : 'Publish Test Series Package'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
