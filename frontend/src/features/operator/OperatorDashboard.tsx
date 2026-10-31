// FOCUSPOINT Futuristic Pan-India Exam & Study Material Command Center Dashboard
// Cyber-HUD Mission Control with Real-Time Telemetry, Working Student Custom Drill Processing,
// Instant PYQ Digitization Launcher, Neural AI Copilot Prompt Console, and Procedural Web Audio FX.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Landmark, 
  HelpCircle, 
  Sparkles, 
  FileText, 
  Download, 
  Eye, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Layers, 
  Activity, 
  Calendar,
  Zap,
  GraduationCap,
  FileSpreadsheet,
  Megaphone,
  Volume2,
  VolumeX,
  Radio,
  Search,
  Filter,
  Check,
  X,
  ChevronRight,
  RefreshCw,
  Play,
  Cpu,
  Award,
  Send,
  Copy,
  Terminal,
  Sliders,
  BarChart3,
  Database,
  Maximize2,
  Minimize2,
  Compass,
  Shield,
  CheckCheck,
  Target,
  Sparkle,
  Flame
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { operatorService } from '../../services/operatorService';
import { mockTestService } from '../../services/mockTestService';
import { mockStore } from '../../mock/store';
import { safeStorage } from '../../utils/storageUtils';
import { 
  OperatorContentMetrics, 
  OperatorActivityLog, 
  StudyMaterialOperator 
} from '../../types/operator';
import { 
  CustomMockDrillRequest, 
  CustomMockDrillRequestStatus,
  GovernmentExam,
  MockTest,
  QuestionItem
} from '../../types/academicIntelligence';
import { OperatorAdvertisementManager } from '../../components/operator/OperatorAdvertisementManager';

// Procedural Cyber Web Audio Synthesizer
const playCyberAudio = (type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'scan', enabled: boolean = true) => {
  if (!enabled) return;
  try {
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
        osc.frequency.setValueAtTime(920, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'warp':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(1250, now + 0.16);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      case 'confirm':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.setValueAtTime(880, now + 0.05);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      case 'toggle':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.setValueAtTime(520, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      case 'alert':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.setValueAtTime(260, now + 0.08);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      case 'scan':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.06);
        osc.frequency.linearRampToValueAtTime(1320, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
        break;
    }
  } catch {
    // Audio suppressed or unsupported
  }
};

// Preset Target Exams for Instant Ingestion
const POPULAR_PYQ_EXAMS = [
  { id: 'SSC_CGL', name: 'SSC Combined Graduate Level', category: 'SSC', authority: 'Staff Selection Commission (SSC)', defaultDuration: 60, defaultQCount: 100, defaultMarks: 200, neg: 0.50 },
  { id: 'UP_POLICE', name: 'UP Police Constable Recruitment', category: 'POLICE', authority: 'UPPRPB Lucknow', defaultDuration: 120, defaultQCount: 150, defaultMarks: 300, neg: 0.50 },
  { id: 'NEET_UG', name: 'NEET (Undergraduate) Medical', category: 'MEDICAL', authority: 'National Testing Agency (NTA)', defaultDuration: 200, defaultQCount: 200, defaultMarks: 720, neg: 1.00 },
  { id: 'IIT_JEE', name: 'JEE Main Engineering Entrance', category: 'ENGINEERING', authority: 'National Testing Agency (NTA)', defaultDuration: 180, defaultQCount: 90, defaultMarks: 300, neg: 1.00 },
  { id: 'CTET', name: 'Central Teacher Eligibility Test', category: 'TEACHING', authority: 'CBSE New Delhi', defaultDuration: 150, defaultQCount: 150, defaultMarks: 150, neg: 0.00 },
  { id: 'UP_PET', name: 'UPSSSC Preliminary Eligibility Test', category: 'STATE_EXAMS', authority: 'UPSSSC Lucknow', defaultDuration: 120, defaultQCount: 100, defaultMarks: 100, neg: 0.25 },
  { id: 'CHS_9', name: 'Central Hindu School (CHS BHU Class 9)', category: 'ADMISSION_EXAMS', authority: 'Banaras Hindu University', defaultDuration: 120, defaultQCount: 100, defaultMarks: 100, neg: 0.00 }
];

export const PRESET_AI_PROMPTS = [
  {
    title: 'Polity: Assertion-Reasoning',
    category: 'SSC / UPSC',
    prompt: 'Synthesize 2 high-difficulty Assertion-Reasoning MCQs on Indian Constitutional Amendments for SSC CGL Tier-1 with bilingual Hindi/English explanations.'
  },
  {
    title: 'UP Police: Hindi Vyakaran',
    category: 'POLICE',
    prompt: 'Generate 2 high-yield MCQs on Sandhi & Samas (संधि एवं समास) aligned with UP Police Constable 2024 examination standard.'
  },
  {
    title: 'NEET: Cell Biology & ATP',
    category: 'MEDICAL',
    prompt: 'Draft 2 NEET-UG level MCQs on Mitochondrial ATP Synthase & Electron Transport Chain with NCERT page references.'
  },
  {
    title: 'JEE: Calculus & Kinematics',
    category: 'ENGINEERING',
    prompt: 'Synthesize 2 high-difficulty JEE Main calculus questions on derivatives, instantaneous acceleration, and tangent slopes with step-by-step LaTeX derivations.'
  },
  {
    title: 'Banking: Seating Puzzle',
    category: 'BANKING',
    prompt: 'Draft 1 circular seating arrangement puzzle with 8 people facing inward/outward with 2 follow-up analytical reasoning MCQs for IBPS PO Prelims.'
  },
  {
    title: 'CTET: Child Pedagogy (CDP)',
    category: 'TEACHING',
    prompt: 'Synthesize 2 bilingual MCQs on Piaget cognitive development stages vs Vygotsky ZPD theory aligned with CTET Paper 1 standard.'
  },
  {
    title: 'UP Special: History & Culture',
    category: 'STATE_EXAMS',
    prompt: 'Generate 2 questions on Uttar Pradesh historical heritage, Mahajanapadas, and folk art forms for UPPSC & UPSSSC prelims.'
  },
  {
    title: 'Duplicate Concept Scan',
    category: 'AUDIT',
    prompt: 'Scan Master Question Bank for duplicate questions and flag questions with >85% lexical or conceptual overlap.'
  }
];

export type CommandViewMode = 'ALL_PANORAMA' | 'DRILL_DISPATCH' | 'NEURAL_AUTHORING' | 'ACADEMIC_INTELLIGENCE';

export const OperatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const operatorId = user?.id || 'usr-operator-sunita';
  const operatorName = user?.name || 'Sunita Verma';

  // HUD, Audio & Futuristic View Toggles
  const [sfxEnabled, setSfxEnabled] = useState(() => {
    return safeStorage.getItem('fp_operator_hud_sfx') !== 'false';
  });
  const [autoPulseActive, setAutoPulseActive] = useState(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'COMMAND_CENTER' | 'PROMOTIONS_ADS'>('COMMAND_CENTER');
  const [commandViewMode, setCommandViewMode] = useState<CommandViewMode>('ALL_PANORAMA');
  const [isPanoramic, setIsPanoramic] = useState<boolean>(() => {
    return safeStorage.getItem('fp_operator_hud_panoramic') === 'true';
  });
  const [currentTimeString, setCurrentTimeString] = useState('');
  const [isBatchSynthesizing, setIsBatchSynthesizing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; activeItem?: string } | null>(null);
  const [aiGenerationPhase, setAiGenerationPhase] = useState<string>('');

  // Core Data
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<OperatorContentMetrics | null>(null);
  const [activities, setActivities] = useState<OperatorActivityLog[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomMockDrillRequest[]>([]);
  const [exams, setExams] = useState<GovernmentExam[]>([]);

  // Telemetry Dynamic Counters (Simulated Live Pulse)
  const [livePulseTick, setLivePulseTick] = useState(0);
  const [systemPingMs, setSystemPingMs] = useState(14);

  // Student Custom Request Processing State
  const [requestFilterStatus, setRequestFilterStatus] = useState<string>('ACTIONABLE');
  const [requestSearch, setRequestSearch] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<CustomMockDrillRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStatusChoice, setReviewStatusChoice] = useState<CustomMockDrillRequestStatus>('UNDER_REVIEW');
  const [reviewOperatorNote, setReviewOperatorNote] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Instant PYQ Digitizer Modal State
  const [isPyqModalOpen, setIsPyqModalOpen] = useState(false);
  const [pyqExamChoice, setPyqExamChoice] = useState(POPULAR_PYQ_EXAMS[0].id);
  const [pyqYear, setPyqYear] = useState('2024');
  const [pyqShift, setPyqShift] = useState('Shift-1 (Morning: 09:00 AM - 10:00 AM)');
  const [pyqOcrMode, setPyqOcrMode] = useState<'FAST' | 'DEEP_STEM'>('FAST');
  const [pyqScanningProgress, setPyqScanningProgress] = useState<number | null>(null);
  const [pyqScanCompleted, setPyqScanCompleted] = useState(false);

  // AI Exam Copilot Embedded Console State
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiOutputResult, setAiOutputResult] = useState<any | null>(null);

  // Activity Log Filter
  const [activitySearchQuery, setActivitySearchQuery] = useState('');

  // Initial Fetch
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [m, logs, requests, allExams] = await Promise.all([
        operatorService.getOperatorContentMetrics(operatorId),
        operatorService.getActivityLogs(operatorId),
        mockTestService.getCustomMockRequests(),
        mockTestService.getGovernmentExams()
      ]);
      setMetrics(m);
      setActivities(logs);
      setCustomRequests(requests);
      setExams(allExams);
    } catch (err) {
      console.error('Failed to load operator command center metrics', err);
      showToast('Error syncing command center telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [operatorId]);

  // Live Telemetry Auto-Pulse Interval
  useEffect(() => {
    if (!autoPulseActive) return;
    const interval = setInterval(() => {
      setLivePulseTick((prev) => prev + 1);
      setSystemPingMs(Math.floor(11 + Math.random() * 8));
    }, 12000);
    return () => clearInterval(interval);
  }, [autoPulseActive]);

  // Audio helper
  const playSound = (type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'scan') => {
    playCyberAudio(type, sfxEnabled);
  };

  // Live IST Digital Chronograph Pulse
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        };
        setCurrentTimeString(new Intl.DateTimeFormat('en-IN', options).format(now));
      } catch {
        setCurrentTimeString(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Tactical Hotkeys Listener ([1-4], [P], [A], [D])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '1') {
        playSound('click');
        setCommandViewMode('ALL_PANORAMA');
      } else if (e.key === '2') {
        playSound('click');
        setCommandViewMode('DRILL_DISPATCH');
      } else if (e.key === '3') {
        playSound('click');
        setCommandViewMode('NEURAL_AUTHORING');
      } else if (e.key === '4') {
        playSound('click');
        setCommandViewMode('ACADEMIC_INTELLIGENCE');
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        playSound('warp');
        setIsPyqModalOpen(true);
      } else if (e.key.toLowerCase() === 'a') {
        playSound('click');
        setCommandViewMode('NEURAL_AUTHORING');
      } else if (e.key.toLowerCase() === 'd') {
        playSound('click');
        setCommandViewMode('DRILL_DISPATCH');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sfxEnabled]);

  // Actionable Custom Requests Count
  const actionableCount = useMemo(() => {
    return customRequests.filter((r) => !['PUBLISHED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(r.status)).length;
  }, [customRequests]);

  // Filtered Custom Mock Requests
  const filteredCustomRequests = useMemo(() => {
    return customRequests.filter((req) => {
      // Status filter
      if (requestFilterStatus === 'ACTIONABLE') {
        if (['PUBLISHED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(req.status)) return false;
      } else if (requestFilterStatus !== 'ALL') {
        if (req.status !== requestFilterStatus) return false;
      }

      // Search query
      if (requestSearch.trim()) {
        const query = requestSearch.toLowerCase();
        const matchesStudent = req.studentName.toLowerCase().includes(query);
        const matchesExam = req.examName.toLowerCase().includes(query);
        const matchesSubject = req.subject.toLowerCase().includes(query);
        const matchesTopic = req.topic?.toLowerCase().includes(query) || false;
        const matchesId = req.id.toLowerCase().includes(query);
        if (!matchesStudent && !matchesExam && !matchesSubject && !matchesTopic && !matchesId) return false;
      }
      return true;
    });
  }, [customRequests, requestFilterStatus, requestSearch]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    if (!activitySearchQuery.trim()) return activities.slice(0, 8);
    const q = activitySearchQuery.toLowerCase();
    return activities.filter((a) => 
      a.action.toLowerCase().includes(q) || 
      a.details.toLowerCase().includes(q) || 
      a.entityTitle.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [activities, activitySearchQuery]);

  // Handler: Open Review Modal for Student Request
  const handleOpenReviewModal = (req: CustomMockDrillRequest) => {
    playSound('click');
    setSelectedRequest(req);
    setReviewStatusChoice(req.status);
    setReviewOperatorNote(req.operatorMessage || '');
    setIsReviewModalOpen(true);
  };

  // Handler: Update Student Request Status & Dispatch Feedback
  const handleSaveRequestReview = async () => {
    if (!selectedRequest) return;
    setIsProcessingAction(true);
    playSound('warp');
    try {
      const updated = await mockTestService.updateCustomMockRequestStatus(
        selectedRequest.id,
        reviewStatusChoice,
        reviewOperatorNote,
        operatorId,
        operatorName
      );

      await operatorService.logActivity({
        operatorId,
        operatorName,
        action: 'MOCK_TEST_EDIT',
        entity: 'MOCK_TEST',
        entityId: selectedRequest.id,
        entityTitle: `Drill Request: ${selectedRequest.examName} - ${selectedRequest.subject}`,
        details: `Updated request status to ${reviewStatusChoice}. Feedback note: "${reviewOperatorNote.slice(0, 60)}..."`
      });

      // Update local state
      setCustomRequests((prev) =>
        prev.map((r) => (r.id === selectedRequest.id && updated ? updated : r))
      );

      playSound('confirm');
      showToast(`Student request #${selectedRequest.id} updated to ${reviewStatusChoice}`, 'success');
      setIsReviewModalOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error(err);
      playSound('alert');
      showToast('Failed to update student request', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handler: Quick Direct Status Bump on Drill Card (Without opening modal)
  const handleQuickStatusBump = async (req: CustomMockDrillRequest, nextStatus: CustomMockDrillRequestStatus) => {
    playSound('warp');
    setIsProcessingAction(true);
    try {
      const updated = await mockTestService.updateCustomMockRequestStatus(
        req.id,
        nextStatus,
        `Operator updated directive to ${nextStatus.replace(/_/g, ' ')}.`,
        operatorId,
        operatorName
      );
      if (updated) {
        setCustomRequests((prev) => prev.map((r) => r.id === req.id ? updated : r));
      }
      playSound('confirm');
      showToast(`Request #${req.id} updated to ${nextStatus.replace(/_/g, ' ')}`, 'success');
    } catch (err) {
      console.error(err);
      playSound('alert');
      showToast('Failed to update status', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handler: 1-Click AI Rapid Synthesis from Student Request
  const handleRapidGenerateFromRequest = async (req: CustomMockDrillRequest) => {
    playSound('warp');
    setIsProcessingAction(true);
    try {
      const { request: updatedReq, mockTest } = await mockTestService.generateMockFromRequest(
        req.id,
        {
          operatorId,
          operatorName,
          customTitle: `${req.examName} Custom Drill — ${req.subject} (${req.testType})`
        }
      );

      await operatorService.logActivity({
        operatorId,
        operatorName,
        action: 'AI_QUESTION_GENERATE',
        entity: 'MOCK_TEST',
        entityId: mockTest.id,
        entityTitle: mockTest.title,
        details: `Synthesized verified draft mock test with ${mockTest.totalQuestions} questions for student ${req.studentName}.`
      });

      setCustomRequests((prev) =>
        prev.map((r) => (r.id === req.id ? updatedReq : r))
      );

      playSound('confirm');
      showToast(`Mock Draft #${mockTest.id} generated! Linked to student request #${req.id}. Ready for Quality Review.`, 'success');
    } catch (err) {
      console.error(err);
      playSound('alert');
      showToast('Rapid mock synthesis failed', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handler: Batch AI Synthesis for all Actionable Ungenerated Student Drills
  const handleBatchSynthesizeAll = async () => {
    const actionable = customRequests.filter((r) => 
      !['PUBLISHED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(r.status) && !r.generatedMockTestId
    );
    if (actionable.length === 0) {
      playSound('alert');
      showToast('No ungenerated actionable student drill requests in queue.', 'info');
      return;
    }
    playSound('warp');
    setIsBatchSynthesizing(true);
    setBatchProgress({ current: 0, total: actionable.length });

    let successCount = 0;
    for (let i = 0; i < actionable.length; i++) {
      const req = actionable[i];
      setBatchProgress({ current: i + 1, total: actionable.length, activeItem: `${req.studentName} — ${req.examName}` });
      try {
        const { request: updatedReq, mockTest } = await mockTestService.generateMockFromRequest(
          req.id,
          {
            operatorId,
            operatorName,
            customTitle: `${req.examName} Custom Drill — ${req.subject} (${req.testType})`
          }
        );
        setCustomRequests((prev) =>
          prev.map((r) => (r.id === req.id ? updatedReq : r))
        );
        successCount++;
        await new Promise((res) => setTimeout(res, 250));
      } catch (e) {
        console.error('Batch synthesis item failed', req.id, e);
      }
    }

    setIsBatchSynthesizing(false);
    setBatchProgress(null);
    playSound('confirm');
    showToast(`⚡ Batch AI Synthesis complete! Synthesized ${successCount} verified student drill drafts.`, 'success');

    await operatorService.logActivity({
      operatorId,
      operatorName,
      action: 'AI_QUESTION_GENERATE',
      entity: 'MOCK_TEST',
      entityId: `batch-${Date.now()}`,
      entityTitle: `Batch AI Drill Synthesis (${successCount} Papers)`,
      details: `Synthesized verified CBT mock test drafts for ${successCount} pending student requests.`
    });
  };

  // Handler: 1-Click Publish Mock Test for Student
  const handlePublishFromRequest = async (req: CustomMockDrillRequest) => {
    playSound('warp');
    setIsProcessingAction(true);
    try {
      if (req.generatedMockTestId) {
        await mockTestService.updateMockTest(req.generatedMockTestId, { status: 'PUBLISHED' });
      }
      const publishedReq = await mockTestService.updateCustomMockRequestStatus(
        req.id,
        'PUBLISHED',
        'Your custom mock test has been verified and published by our academic lead! You can now start the test.',
        operatorId,
        operatorName
      );

      await operatorService.logActivity({
        operatorId,
        operatorName,
        action: 'MOCK_TEST_PUBLISH',
        entity: 'MOCK_TEST',
        entityId: req.generatedMockTestId || req.id,
        entityTitle: `${req.examName} Custom Drill (${req.subject})`,
        details: `Published custom mock drill for student ${req.studentName}. Active in CBT Mock Center.`
      });

      if (publishedReq) {
        setCustomRequests((prev) =>
          prev.map((r) => (r.id === req.id ? publishedReq : r))
        );
      }

      // Refresh metrics
      const newMetrics = await operatorService.getOperatorContentMetrics(operatorId);
      setMetrics(newMetrics);

      playSound('confirm');
      showToast(`Custom Mock Test published successfully! Student ${req.studentName} notified.`, 'success');
    } catch (err) {
      console.error(err);
      playSound('alert');
      showToast('Publishing mock test failed', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handler: Simulate Instant PYQ OCR Scanning & Ingestion
  const handleStartPyqOcrScan = () => {
    playSound('scan');
    setPyqScanningProgress(10);
    setPyqScanCompleted(false);

    const stepInterval = setInterval(() => {
      setPyqScanningProgress((prev) => {
        if (prev === null) return 15;
        if (prev >= 100) {
          clearInterval(stepInterval);
          setPyqScanCompleted(true);
          playSound('confirm');
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  // Handler: Complete PYQ Ingestion into Repository
  const handleCommitPyqIngestion = async () => {
    playSound('warp');
    const examObj = POPULAR_PYQ_EXAMS.find((e) => e.id === pyqExamChoice) || POPULAR_PYQ_EXAMS[0];
    const generatedTitle = `${examObj.name} (${pyqYear}) — ${pyqShift} Official Digitized CBT Paper`;

    try {
      await operatorService.logActivity({
        operatorId,
        operatorName,
        action: 'MATERIAL_UPLOAD',
        entity: 'STUDY_MATERIAL',
        entityId: `pyq-${Date.now()}`,
        entityTitle: generatedTitle,
        details: `Ingested ${examObj.defaultQCount} verified questions via ${pyqOcrMode} OCR engine with ${examObj.authority} scheme.`
      });

      // Increment metrics locally
      setMetrics((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          totalMaterials: prev.totalMaterials + 1,
          publishedMaterials: prev.publishedMaterials + 1,
          totalQuestions: prev.totalQuestions + examObj.defaultQCount,
          approvedQuestions: prev.approvedQuestions + examObj.defaultQCount
        };
      });

      playSound('confirm');
      showToast(`PYQ Paper "${generatedTitle}" successfully digitized and committed to Question Bank!`, 'success');
      setIsPyqModalOpen(false);
      setPyqScanningProgress(null);
      setPyqScanCompleted(false);
    } catch (err) {
      console.error(err);
      playSound('alert');
      showToast('PYQ Ingestion failed', 'error');
    }
  };

  // Handler: Execute Neural Copilot Prompt with Multi-Phase Reasoning Telemetry
  const handleExecuteAiPrompt = async (promptTextOverride?: string) => {
    const textToRun = promptTextOverride || aiPromptInput;
    if (!textToRun.trim()) {
      showToast('Please enter an AI authoring prompt or select a preset', 'warning');
      return;
    }

    playSound('scan');
    setIsAiGenerating(true);
    setAiOutputResult(null);

    // Simulated multi-phase reasoning telemetry stream
    setAiGenerationPhase('Phase 1/4: Ingesting exam syllabus, Bloom weights & difficulty distribution...');
    setTimeout(() => {
      setAiGenerationPhase('Phase 2/4: Formulating bilingual Hindi/English stems and Unicode normalization...');
    }, 300);
    setTimeout(() => {
      setAiGenerationPhase('Phase 3/4: Calibrating pedagogical distractors and misconception traps...');
    }, 600);
    setTimeout(() => {
      setAiGenerationPhase('Phase 4/4: Validating LaTeX formula integrity and negative penalty (-0.50)...');
    }, 900);

    // Simulate high-fidelity AI generation response
    setTimeout(() => {
      playSound('confirm');
      setIsAiGenerating(false);
      setAiGenerationPhase('');

      if (textToRun.toLowerCase().includes('duplicate')) {
        setAiOutputResult({
          type: 'DUPLICATE_AUDIT',
          title: 'Master Question Bank Duplicate Detection Scan Result',
          metrics: {
            scannedQuestions: 1480,
            potentialDuplicatesFound: 2,
            overallIntegrityIndex: '99.86%',
            auditStatus: 'PASSED_WITH_FLAGS'
          },
          flags: [
            {
              id: 'q-dup-01',
              subject: 'Quantitative Aptitude',
              similarity: '94%',
              detail: 'Question on "Compound Interest vs Simple Interest difference in 2 years" matches existing Q-ID #QBK-QA-109 with altered principal amount (₹12,000 vs ₹15,000).'
            },
            {
              id: 'q-dup-02',
              subject: 'General Knowledge',
              similarity: '89%',
              detail: 'Question on "42nd Constitutional Amendment Socialist secular addition" overlaps with Q-ID #QBK-POL-042.'
            }
          ]
        });
      } else {
        setAiOutputResult({
          type: 'QUESTIONS_DRAFT',
          title: 'Synthesized High-Yield Exam Questions',
          promptEcho: textToRun,
          bloomLevel: 'ANALYSIS & APPLICATION',
          items: [
            {
              id: `AI-Q-${Date.now()}-1`,
              questionHindi: 'कथन (A): भारत के राष्ट्रपति को संसद के दोनों सदनों की संयुक्त बैठक बुलाने का अधिकार है।\nकारण (R): धन विधेयक पर गतिरोध होने पर संयुक्त बैठक आयोजित की जा सकती है।',
              questionEnglish: 'Assertion (A): The President of India has the power to summon a joint sitting of both Houses of Parliament.\nReason (R): A joint sitting can be convened to resolve a deadlock over a Money Bill.',
              options: [
                'A और R दोनों सही हैं, और R, A का सही स्पष्टीकरण है',
                'A और R दोनों सही हैं, परंतु R, A का सही स्पष्टीकरण नहीं है',
                'A सही है, परंतु R गलत है (Money Bill does not permit joint sitting)',
                'A गलत है, परंतु R सही है'
              ],
              correctAnswer: 2,
              explanation: 'अनुच्छेद 108 के अनुसार राष्ट्रपति संयुक्त बैठक बुला सकते हैं, परंतु अनुच्छेद 110/109 के तहत धन विधेयक और संविधान संशोधन विधेयक (अनुच्छेद 368) पर संयुक्त बैठक का कोई प्रावधान नहीं है। अतः कथन (A) सही है और कारण (R) असत्य है।'
            },
            {
              id: `AI-Q-${Date.now()}-2`,
              questionHindi: 'किसी गतिशील कण का स्थिति समीकरण s(t) = 3t² + 4t + 5 है। t = 3 सेकंड पर कण का तात्क्षणिक त्वरण (Acceleration) क्या होगा?',
              questionEnglish: 'The position equation of a moving particle is given by s(t) = 3t² + 4t + 5. What will be the instantaneous acceleration of the particle at t = 3 seconds?',
              options: [
                '6 m/s²',
                '12 m/s²',
                '22 m/s²',
                '18 m/s²'
              ],
              correctAnswer: 0,
              explanation: 'वेग v(t) = ds/dt = 6t + 4. त्वरण a(t) = dv/dt = d²s/dt² = 6 m/s² (जो कि समय t पर निर्भर नहीं करता, नियत त्वरण है)। अतः सही उत्तर 6 m/s² है।'
            }
          ]
        });
      }
    }, 1100);
  };

  // Handler: Save AI Synthesized Questions to Master Bank
  const handleCommitAiQuestionsToBank = () => {
    if (!aiOutputResult || aiOutputResult.type !== 'QUESTIONS_DRAFT') return;
    playSound('warp');

    const items = aiOutputResult.items;
    items.forEach((item: any, idx: number) => {
      mockStore.addQuestion({
        id: item.id,
        examId: 'exam-ssc-cgl',
        subject: 'General Awareness',
        topic: 'Polity & Fundamental Law',
        type: 'MCQ',
        question: item.questionHindi,
        options: item.options,
        correctAnswer: item.options[item.correctAnswer],
        explanation: item.explanation,
        difficulty: 'HARD',
        marks: 2,
        negativeMarks: 0.5,
        status: 'APPROVED',
        source: 'AI_GENERATED',
        createdAt: new Date().toISOString()
      });
    });

    setMetrics((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        totalQuestions: prev.totalQuestions + items.length,
        approvedQuestions: prev.approvedQuestions + items.length,
        aiGeneratedQuestions: prev.aiGeneratedQuestions + items.length
      };
    });

    playSound('confirm');
    showToast(`Committed ${items.length} questions into Master Question Bank with full LaTeX/Pedagogical metadata!`, 'success');
    setAiOutputResult(null);
    setAiPromptInput('');
  };

  return (
    <div className={`space-y-8 pb-16 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 transition-all duration-300 ${isPanoramic ? 'max-w-full px-4 sm:px-6' : 'max-w-7xl mx-auto px-4 sm:px-6'}`}>
      
      {/* ============================================================ */}
      {/* 1. CYBER-HUD HERO BANNER & OPERATOR TELEMETRY DECK */}
      {/* ============================================================ */}
      <div className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.15)] overflow-hidden">
        {/* Glow ambient meshes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24 animate-pulse" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Top Telemetry Beacon Status Line */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                STATUS: MISSION ACTIVE
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
                <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                QUANTUM CBT MATRIX v4.2
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-cyan-300 border border-cyan-500/30 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                IST: <strong className="text-white font-mono">{currentTimeString || '14:40:00 IST'}</strong>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-400 border border-slate-700/60">
                <Cpu className="w-3 h-3 text-emerald-400" />
                PING: {systemPingMs}ms (±1.8ms)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-400 border border-slate-700/60">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                HITL QUALITY: STRICT
              </span>
            </div>

            {/* Title & Operator Mission Line */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <span>Pan-India Academic Command Center</span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase font-mono tracking-widest">
                  OPERATOR OS
                </span>
              </h1>
              <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                Authorized Lead: <span className="font-bold text-white">{operatorName}</span> (ID: <code className="text-cyan-300 font-mono font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">{user?.operatorId || 'OPR-IN-2026-001'}</code>). 
                Controlling Pan-India study materials, CBT mock series, student custom drill requests, and neural question synthesis.
              </p>
            </div>
          </div>

          {/* Quick HUD Audio, Pulse, Panoramic & View Controls */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            {/* SFX Audio Button */}
            <button
              onClick={() => {
                const next = !sfxEnabled;
                setSfxEnabled(next);
                safeStorage.setItem('fp_operator_hud_sfx', String(next));
                playCyberAudio('toggle', next);
                showToast(next ? 'Tactile Cyber Audio enabled' : 'Tactile Cyber Audio muted', 'info');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
                sfxEnabled
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Toggle Web Audio SFX"
            >
              {sfxEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>{sfxEnabled ? 'SFX: ON' : 'SFX: MUTED'}</span>
            </button>

            {/* Telemetry Stream Toggle */}
            <button
              onClick={() => {
                playSound('toggle');
                setAutoPulseActive(!autoPulseActive);
                showToast(autoPulseActive ? 'Live Telemetry stream paused' : 'Live Telemetry stream resumed', 'info');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
                autoPulseActive
                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Toggle Live Stream Pulse"
            >
              <Activity className={`w-4 h-4 ${autoPulseActive ? 'text-indigo-400 animate-spin' : 'text-slate-500'}`} />
              <span>{autoPulseActive ? 'AUTO-PULSE' : 'PULSE: PAUSED'}</span>
            </button>

            {/* Panoramic Mode Toggle */}
            <button
              onClick={() => {
                const next = !isPanoramic;
                setIsPanoramic(next);
                safeStorage.setItem('fp_operator_hud_panoramic', String(next));
                playSound('toggle');
                showToast(next ? 'Panoramic HUD mode engaged' : 'Standard container restored', 'info');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
                isPanoramic
                  ? 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Toggle Panoramic Widescreen View"
            >
              {isPanoramic ? <Minimize2 className="w-4 h-4 text-purple-400" /> : <Maximize2 className="w-4 h-4 text-slate-400" />}
              <span>{isPanoramic ? 'PANORAMIC' : 'EXPAND'}</span>
            </button>

            {/* Instant PYQ Digitizer Action Modal Trigger */}
            <Button
              onClick={() => {
                playSound('warp');
                setIsPyqModalOpen(true);
              }}
              variant="primary"
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.4)] border-0"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Digitize Exam PYQ
            </Button>
          </div>
        </div>

        {/* Console Navigation Tab Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                playSound('click');
                setActiveConsoleTab('COMMAND_CENTER');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeConsoleTab === 'COMMAND_CENTER'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              HUD Command Center
            </button>
            <button
              onClick={() => {
                playSound('click');
                setActiveConsoleTab('PROMOTIONS_ADS');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeConsoleTab === 'PROMOTIONS_ADS'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              Homepage Ads & Offers Console
            </button>
          </div>

          {/* Quick Deep Links to Sub-Studios */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link to="/operator/pyq-studio" onClick={() => playSound('click')}>
              <span className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 flex items-center gap-1.5 font-semibold transition-colors">
                <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" /> PYQ Studio
              </span>
            </Link>
            <Link to="/operator/mock-tests" onClick={() => playSound('click')}>
              <span className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 flex items-center gap-1.5 font-semibold transition-colors">
                <Landmark className="w-3.5 h-3.5 text-purple-400" /> Mock Tests
              </span>
            </Link>
            <Link to="/operator/question-bank" onClick={() => playSound('click')}>
              <span className="px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 flex items-center gap-1.5 font-semibold transition-colors">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" /> Master Bank
              </span>
            </Link>
            <Link to="/operator/study-material" onClick={() => playSound('click')}>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 flex items-center gap-1.5 font-semibold transition-colors">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Study Materials
              </span>
            </Link>
            <Link to="/operator/ai-assistant" onClick={() => playSound('click')}>
              <span className="px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/60 flex items-center gap-1.5 font-semibold transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Assistant
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CONDITIONAL TAB CONTENT */}
      {/* ============================================================ */}
      {activeConsoleTab === 'PROMOTIONS_ADS' ? (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <div>
                <p className="font-bold text-amber-300">Operator Dynamic Homepage Advertisement Manager</p>
                <p className="text-xs text-slate-400">Configure hero sliders, banner campaigns, discount promos, and video ads directly across pan-India student landing pages.</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                playSound('click');
                setActiveConsoleTab('COMMAND_CENTER');
              }}
              className="bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              Return to HUD Command Center
            </Button>
          </div>
          <OperatorAdvertisementManager />
        </div>
      ) : (
        <div className="space-y-8">
          {/* ============================================================ */}
          {/* TACTICAL COMMAND VIEW MODE CONTROLLER & RAPID HOTBAR */}
          {/* ============================================================ */}
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tactical Mode Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mr-1 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" /> TACTICAL DECK:
              </span>

              <button
                onClick={() => {
                  playSound('click');
                  setCommandViewMode('ALL_PANORAMA');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 border ${
                  commandViewMode === 'ALL_PANORAMA'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>[1] Mission Panorama</span>
              </button>

              <button
                onClick={() => {
                  playSound('click');
                  setCommandViewMode('DRILL_DISPATCH');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 border ${
                  commandViewMode === 'DRILL_DISPATCH'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>[2] Student Drills Radar</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/30 text-amber-300 font-bold">
                  {actionableCount} Actionable
                </span>
              </button>

              <button
                onClick={() => {
                  playSound('click');
                  setCommandViewMode('NEURAL_AUTHORING');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 border ${
                  commandViewMode === 'NEURAL_AUTHORING'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/60 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                    : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>[3] Neural Copilot Terminal</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/30 text-indigo-300 font-bold">
                  DIRECT
                </span>
              </button>

              <button
                onClick={() => {
                  playSound('click');
                  setCommandViewMode('ACADEMIC_INTELLIGENCE');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 border ${
                  commandViewMode === 'ACADEMIC_INTELLIGENCE'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                    : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>[4] Academic Domain Radar</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/30 text-emerald-300 font-bold">
                  98.6%
                </span>
              </button>
            </div>

            {/* Quick Keyboard Hotbar Guide */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="hidden xl:inline text-slate-500">HOTKEYS:</span>
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300">[1-4] Modes</span>
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-purple-300">[P] Digitize PYQ</span>
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300">[A] AI Copilot</span>
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300">[D] Drills</span>
            </div>
          </div>

          {/* Batch Synthesis Progress Banner */}
          {batchProgress && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)] space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-300 font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                  AI BATCH DRILL SYNTHESIS ACTIVE: <span className="text-white">{batchProgress.activeItem || 'Synthesizing verified questions...'}</span>
                </span>
                <span className="text-amber-400 font-black">
                  {batchProgress.current} / {batchProgress.total} ({Math.round((batchProgress.current / batchProgress.total) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-amber-900/60">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 transition-all duration-300"
                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. HOLOGRAPHIC 8-KPI TELEMETRY GRID (ALL_PANORAMA & ACADEMIC_INTELLIGENCE) */}
          {/* ============================================================ */}
          {(commandViewMode === 'ALL_PANORAMA' || commandViewMode === 'ACADEMIC_INTELLIGENCE') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* KPI 1: Master Question Bank */}
              <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-lg group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-3 h-3 text-cyan-400" /> Question Bank Matrix
                    </span>
                    <h3 className="text-3xl font-black text-white mt-1 font-mono">
                      {loading ? '...' : (metrics?.totalQuestions || 1480).toLocaleString()}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-inner">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> {metrics?.approvedQuestions || 1340} Approved
                  </span>
                  <span className="text-cyan-300 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {metrics?.aiGeneratedQuestions || 420} AI
                  </span>
                </div>
              </div>

              {/* KPI 2: Digitized PYQ Shifts */}
              <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-purple-500/30 hover:border-purple-400 transition-all shadow-lg group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3 h-3 text-purple-400" /> PYQ Shifts Vault
                    </span>
                    <h3 className="text-3xl font-black text-white mt-1 font-mono">
                      {loading ? '...' : '142'}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-950/90 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-300 font-semibold">
                    NTA / SSC / Police Shifts
                  </span>
                  <button
                    onClick={() => {
                      playSound('warp');
                      setIsPyqModalOpen(true);
                    }}
                    className="text-cyan-400 hover:text-cyan-200 underline font-bold"
                  >
                    + Add Shift
                  </button>
                </div>
              </div>

              {/* KPI 3: CBT Mock Test Series */}
              <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-indigo-500/30 hover:border-indigo-400 transition-all shadow-lg group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Landmark className="w-3 h-3 text-indigo-400" /> CBT Mock Series
                    </span>
                    <h3 className="text-3xl font-black text-white mt-1 font-mono">
                      {loading ? '...' : metrics?.totalMockTests}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-950/90 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-inner">
                    <Landmark className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {metrics?.publishedMockTests || 0} Live
                  </span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {metrics?.scheduledMockTests || 0} Sched
                  </span>
                </div>
              </div>

              {/* KPI 4: Student Custom Mock Drill Requests Queue */}
              <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-amber-500/40 hover:border-amber-400 transition-all shadow-lg group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-400 animate-pulse" /> Student Custom Drills
                    </span>
                    <h3 className="text-3xl font-black text-amber-300 mt-1 font-mono">
                      {loading ? '...' : customRequests.length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-950/90 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner">
                    <Zap className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-300 font-bold">
                    {actionableCount} Actionable
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    {customRequests.filter((r) => r.status === 'PUBLISHED').length} Published
                  </span>
                </div>
              </div>

              {/* KPI 5: Study Material Library */}
              <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-lg group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-emerald-400" /> Study Material Vault
                    </span>
                    <h3 className="text-3xl font-black text-white mt-1 font-mono">
                      {loading ? '...' : metrics?.totalMaterials}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-950/90 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-inner">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-semibold">
                    {metrics?.publishedMaterials || 0} Published
                  </span>
                  <span className="text-slate-400">
                    {metrics?.underReviewMaterials || 0} In Review
                  </span>
                </div>
              </div>

              {/* KPI 6: AI HITL Quality Index */}
              <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-lg group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-cyan-400" /> HITL Quality Score
                    </span>
                    <h3 className="text-3xl font-black text-emerald-400 mt-1 font-mono">
                      98.6%
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-inner">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">
                    Reject: <strong className="text-rose-400">{metrics?.rejectionRate || 3.8}%</strong>
                  </span>
                  <span className="text-emerald-300 font-bold">
                    Bloom Verified
                  </span>
                </div>
              </div>

              {/* KPI 7: Pan-India Academic Engagement */}
              <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-blue-500/30 hover:border-blue-400 transition-all shadow-lg group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-blue-400" /> Academic Reach
                    </span>
                    <h3 className="text-3xl font-black text-white mt-1 font-mono">
                      {loading ? '...' : (metrics?.totalViews || 18500).toLocaleString()}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-950/90 border border-blue-500/40 flex items-center justify-center text-blue-300 shadow-inner">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-blue-300">
                    {metrics?.totalDownloads || 2180} Downloads
                  </span>
                  <span className="text-purple-300">
                    {metrics?.totalAttempts || 1420} Attempts
                  </span>
                </div>
              </div>

              {/* KPI 8: Ads & Banner Engine */}
              <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-pink-500/30 hover:border-pink-400 transition-all shadow-lg group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-xl group-hover:bg-pink-500/20 transition-all" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Megaphone className="w-3 h-3 text-pink-400" /> Homepage Ads
                    </span>
                    <h3 className="text-3xl font-black text-white mt-1 font-mono">
                      5 Active
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-pink-950/90 border border-pink-500/40 flex items-center justify-center text-pink-300 shadow-inner">
                    <Megaphone className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-pink-300">
                    CTR: <strong>4.8%</strong>
                  </span>
                  <button
                    onClick={() => {
                      playSound('click');
                      setActiveConsoleTab('PROMOTIONS_ADS');
                    }}
                    className="text-amber-400 hover:text-amber-200 underline font-bold"
                  >
                    Manage Ads
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* 3. STUDENT CUSTOM MOCK DRILL PROCESSING COMMAND DECK */}
          {/* (Visible in ALL_PANORAMA & DRILL_DISPATCH) */}
          {/* ============================================================ */}
          {(commandViewMode === 'ALL_PANORAMA' || commandViewMode === 'DRILL_DISPATCH') && (
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.08)] space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 mb-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    CORE ARCHITECTURE: STUDENTS REQUEST DRILLS, OPERATORS ASSEMBLE & PUBLISH
                  </div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <span>Student Custom Mock Drill Ingestion & Assembly Hub</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      {filteredCustomRequests.length} in view
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Review student requests, dispatch feedback, trigger 1-click AI verified synthesis, and publish custom CBT mock papers.
                  </p>
                </div>

                {/* Batch Action, Status Filters & Search Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* 1-Click Batch AI Synthesis Button */}
                  {actionableCount > 0 && (
                    <button
                      disabled={isBatchSynthesizing || isProcessingAction}
                      onClick={handleBatchSynthesizeAll}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5 disabled:opacity-50"
                      title="Batch synthesize all pending student drill requests with AI"
                    >
                      {isBatchSynthesizing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Synthesizing ({batchProgress?.current}/{batchProgress?.total})...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          ⚡ Synthesize All Actionable ({actionableCount})
                        </>
                      )}
                    </button>
                  )}

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      placeholder="Search student, exam, topic..."
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 text-xs text-slate-200 border border-slate-800 focus:border-amber-500 focus:outline-none w-52 font-mono"
                    />
                    {requestSearch && (
                      <button
                        onClick={() => setRequestSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Filter Selector */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                    {['ACTIONABLE', 'REQUESTED', 'UNDER_REVIEW', 'IN_PREPARATION', 'QUALITY_REVIEW', 'PUBLISHED', 'ALL'].map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          playSound('click');
                          setRequestFilterStatus(st);
                        }}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          requestFilterStatus === st
                            ? 'bg-amber-600 text-slate-950 font-black'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {st.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Request Cards Grid */}
              {filteredCustomRequests.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/60">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-bold text-slate-300">All student drill requests in this queue are resolved!</p>
                  <p className="text-xs text-slate-500 mt-1">No requests match the selected status filter "{requestFilterStatus}".</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCustomRequests.map((req) => {
                    const isPending = !['PUBLISHED', 'REJECTED', 'CANCELLED'].includes(req.status);
                    const isPublished = req.status === 'PUBLISHED';
                    const isQualityReady = req.status === 'QUALITY_REVIEW' && req.generatedMockTestId;

                    return (
                      <div
                        key={req.id}
                        className={`rounded-xl p-4.5 border transition-all flex flex-col justify-between space-y-3 relative ${
                          isPublished
                            ? 'bg-slate-950/70 border-emerald-500/30'
                            : req.priority === 'URGENT' || req.priority === 'HIGH'
                            ? 'bg-slate-950/90 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Top Header of Card */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="font-bold text-slate-400">#{req.id}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                req.priority === 'URGENT'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                                  : req.priority === 'HIGH'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {req.priority} PRIORITY
                            </span>
                          </div>

                          <div>
                            <h4 className="font-bold text-sm text-white line-clamp-1 flex items-center gap-1.5">
                              <span className="text-amber-400">●</span> {req.examName}
                            </h4>
                            <p className="text-xs text-cyan-300 font-medium">
                              {req.subject} {req.topic ? `• ${req.topic}` : ''}
                            </p>
                          </div>

                          {/* Specs Pill Line */}
                          <div className="flex flex-wrap gap-1.5 text-[11px] font-mono text-slate-300">
                            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                              {req.questionCount} Qs
                            </span>
                            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                              {req.durationMinutes} Mins
                            </span>
                            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                              {req.language}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800 text-amber-300">
                              {req.difficulty}
                            </span>
                          </div>

                          {/* Student Info & Note */}
                          <div className="text-xs text-slate-400 border-t border-slate-900 pt-2 space-y-1">
                            <p>
                              Student: <strong className="text-slate-200">{req.studentName}</strong>
                            </p>
                            {req.notes && (
                              <p className="text-[11px] text-slate-500 italic line-clamp-2">
                                "{req.notes}"
                              </p>
                            )}
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-slate-500 text-[11px]">Current Status:</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                                req.status === 'PUBLISHED'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                  : req.status === 'QUALITY_REVIEW'
                                  ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                                  : req.status === 'IN_PREPARATION'
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                                  : req.status === 'UNDER_REVIEW'
                                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                                  : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {req.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        {/* Direct Working Actions per Card */}
                        <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2">
                          {/* Review / Status feedback modal trigger */}
                          <button
                            onClick={() => handleOpenReviewModal(req)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-colors"
                          >
                            Review & Notes
                          </button>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Quick Status Bump Buttons */}
                            {req.status === 'REQUESTED' && (
                              <button
                                disabled={isProcessingAction}
                                onClick={() => handleQuickStatusBump(req, 'UNDER_REVIEW')}
                                className="px-2 py-1 rounded bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-[11px] font-mono border border-indigo-700/60"
                                title="Mark as Under Review"
                              >
                                + Review
                              </button>
                            )}

                            {req.status === 'UNDER_REVIEW' && (
                              <button
                                disabled={isProcessingAction}
                                onClick={() => handleQuickStatusBump(req, 'IN_PREPARATION')}
                                className="px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-[11px] font-mono border border-cyan-700/60"
                                title="Mark as In Preparation"
                              >
                                + Prep
                              </button>
                            )}

                            {/* If not generated yet: 1-Click AI Synthesis */}
                            {!req.generatedMockTestId && isPending && (
                              <button
                                disabled={isProcessingAction}
                                onClick={() => handleRapidGenerateFromRequest(req)}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1 disabled:opacity-50"
                                title="Generate draft mock test from question bank & AI"
                              >
                                <Sparkles className="w-3 h-3 text-cyan-300" />
                                AI Synthesize
                              </button>
                            )}

                            {/* If draft generated and ready for publish: Publish Button */}
                            {isQualityReady && isPending && (
                              <button
                                disabled={isProcessingAction}
                                onClick={() => handlePublishFromRequest(req)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-1 disabled:opacity-50"
                                title="Publish verified mock test for the student"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Publish CBT
                              </button>
                            )}

                            {isPublished && (
                              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Published
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. NEURAL AI COPILOT & ACADEMIC QUESTION RADAR */}
          {/* ============================================================ */}
          {(commandViewMode === 'ALL_PANORAMA' || commandViewMode === 'NEURAL_AUTHORING' || commandViewMode === 'ACADEMIC_INTELLIGENCE') && (
            <div className={`grid grid-cols-1 ${commandViewMode === 'ALL_PANORAMA' ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-6`}>
              
              {/* Neural AI Exam Authoring Copilot */}
              {(commandViewMode === 'ALL_PANORAMA' || commandViewMode === 'NEURAL_AUTHORING') && (
                <div className={`${commandViewMode === 'ALL_PANORAMA' ? 'lg:col-span-7' : 'w-full'} bg-slate-900/90 rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.08)] space-y-4`}>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span>Neural AI Exam Authoring Copilot</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                            DIRECT INFERENCE
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400">Low-latency exam questions synthesis with bilingual Hindi/English LaTeX explanation.</p>
                      </div>
                    </div>

                    <Link to="/operator/ai-assistant" onClick={() => playSound('click')}>
                      <span className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                        Full Studio <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  </div>

                  {/* Prompt Preset Chips (8 Pan-India Presets) */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                    <span className="text-slate-500 text-[11px]">Presets:</span>
                    {PRESET_AI_PROMPTS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          playSound('click');
                          setAiPromptInput(p.prompt);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/50 transition-all text-[11px] flex items-center gap-1"
                      >
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 text-cyan-400/80 font-bold">{p.category}</span>
                        <span>{p.title}</span>
                      </button>
                    ))}
                  </div>

                  {/* Input Prompt Console Bar */}
                  <div className="space-y-2">
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={aiPromptInput}
                        onChange={(e) => setAiPromptInput(e.target.value)}
                        placeholder="Enter authoring prompt or click a preset chip above (e.g. Synthesize 2 high-difficulty Assertion-Reasoning MCQs on Indian Polity for SSC CGL)..."
                        className="w-full rounded-xl bg-slate-950 p-3 text-xs text-slate-100 border border-slate-800 focus:border-cyan-500 focus:outline-none resize-none font-mono"
                      />
                    </div>

                    {/* Reasoning Phase Telemetry Stream Banner */}
                    {aiGenerationPhase && (
                      <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center gap-2 animate-pulse shadow-sm">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                        <span>{aiGenerationPhase}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500">
                        Target Engine: Gemini 1.5 Pro / Flash & Gemma 4 Local Verifier
                      </span>
                      <div className="flex items-center gap-2">
                        {aiPromptInput && (
                          <button
                            onClick={() => setAiPromptInput('')}
                            className="text-xs text-slate-500 hover:text-slate-300 font-mono"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          disabled={isAiGenerating}
                          onClick={() => handleExecuteAiPrompt()}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isAiGenerating ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Synthesizing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" /> Synthesize Questions
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI Output Stream Result Card */}
                  {aiOutputResult && (
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 bg-slate-950/80 rounded-xl p-4 border border-cyan-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                            {aiOutputResult.title}
                          </h4>
                          {aiOutputResult.bloomLevel && (
                            <p className="text-[10px] font-mono text-slate-400">
                              Bloom's Taxonomy Level: <span className="text-emerald-400">{aiOutputResult.bloomLevel}</span>
                            </p>
                          )}
                        </div>

                        {aiOutputResult.type === 'QUESTIONS_DRAFT' && (
                          <button
                            onClick={handleCommitAiQuestionsToBank}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black transition-all flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add to Question Bank
                          </button>
                        )}
                      </div>

                      {/* Render Question Items or Duplicate Flags */}
                      {aiOutputResult.type === 'QUESTIONS_DRAFT' && (
                        <div className="space-y-3 text-xs">
                          {aiOutputResult.items.map((it: any, index: number) => (
                            <div key={it.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                              <p className="font-semibold text-slate-200">
                                <span className="text-cyan-400 font-mono">Q{index + 1}.</span> {it.questionHindi}
                              </p>
                              <p className="text-slate-400 text-[11px] italic">
                                {it.questionEnglish}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                {it.options.map((opt: string, optIdx: number) => (
                                  <div
                                    key={optIdx}
                                    className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 ${
                                      optIdx === it.correctAnswer
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                                    }`}
                                  >
                                    <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                                  </div>
                                ))}
                              </div>
                              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                                <strong className="text-cyan-400">Explanation:</strong> {it.explanation}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {aiOutputResult.type === 'DUPLICATE_AUDIT' && (
                        <div className="space-y-2 text-xs">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                            <div className="p-2 rounded bg-slate-900 border border-slate-800">
                              <p className="text-slate-500">Scanned</p>
                              <p className="font-bold text-white">{aiOutputResult.metrics.scannedQuestions}</p>
                            </div>
                            <div className="p-2 rounded bg-slate-900 border border-slate-800">
                              <p className="text-slate-500">Duplicates</p>
                              <p className="font-bold text-amber-400">{aiOutputResult.metrics.potentialDuplicatesFound}</p>
                            </div>
                            <div className="p-2 rounded bg-slate-900 border border-slate-800">
                              <p className="text-slate-500">Integrity</p>
                              <p className="font-bold text-emerald-400">{aiOutputResult.metrics.overallIntegrityIndex}</p>
                            </div>
                            <div className="p-2 rounded bg-slate-900 border border-slate-800">
                              <p className="text-slate-500">Result</p>
                              <p className="font-bold text-cyan-400">{aiOutputResult.metrics.auditStatus}</p>
                            </div>
                          </div>

                          {aiOutputResult.flags.map((fl: any) => (
                            <div key={fl.id} className="p-2.5 rounded bg-slate-900/90 border border-amber-500/30 text-[11px] text-slate-300 space-y-1">
                              <div className="flex justify-between font-mono">
                                <span className="font-bold text-amber-300">{fl.subject}</span>
                                <span className="text-rose-400 font-bold">{fl.similarity} Overlap</span>
                              </div>
                              <p className="text-slate-400">{fl.detail}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Master Question Bank Radar & Quality Matrix */}
              {(commandViewMode === 'ALL_PANORAMA' || commandViewMode === 'ACADEMIC_INTELLIGENCE') && (
                <div className={`${commandViewMode === 'ALL_PANORAMA' ? 'lg:col-span-5' : 'w-full'} space-y-4`}>
                  <div className="bg-slate-900/90 rounded-2xl p-6 border border-indigo-500/30 shadow-lg space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-400" />
                        Academic Domain Question Radar
                      </h3>
                      <Link to="/operator/question-bank" onClick={() => playSound('click')}>
                        <span className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold">
                          Open Bank <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    </div>

                    {/* Domain Distribution Visual Rows */}
                    <div className="space-y-3 text-xs font-mono">
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>SSC CGL / CHSL / MTS</span>
                          <strong className="text-cyan-400">285 Qs (98% Cov)</strong>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full" style={{ width: '82%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>UP Police & State Constabulary</span>
                          <strong className="text-amber-400">320 Qs (100% Cov)</strong>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: '92%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>NEET-UG & JEE Main (STEM)</span>
                          <strong className="text-purple-400">410 Qs (94% Cov)</strong>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400 rounded-full" style={{ width: '88%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Teaching (CTET / UPTET)</span>
                          <strong className="text-emerald-400">190 Qs (96% Cov)</strong>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: '74%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Admission (CHS BHU / Navodaya)</span>
                          <strong className="text-blue-400">155 Qs (95% Cov)</strong>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: '68%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Difficulty Metric Gauge */}
                    <div className="pt-3 border-t border-slate-800 text-xs font-mono space-y-2">
                      <span className="text-slate-400 font-bold block">Master Difficulty Balance:</span>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        <div className="p-2 rounded bg-slate-950 border border-slate-800">
                          <p className="text-slate-500">Easy</p>
                          <p className="font-bold text-emerald-400 text-xs">28%</p>
                        </div>
                        <div className="p-2 rounded bg-slate-950 border border-slate-800">
                          <p className="text-slate-500">Moderate</p>
                          <p className="font-bold text-cyan-400 text-xs">48%</p>
                        </div>
                        <div className="p-2 rounded bg-slate-950 border border-slate-800">
                          <p className="text-slate-500">Hard</p>
                          <p className="font-bold text-amber-400 text-xs">19%</p>
                        </div>
                        <div className="p-2 rounded bg-slate-950 border border-slate-800">
                          <p className="text-slate-500">Expert</p>
                          <p className="font-bold text-rose-400 text-xs">5%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-Time Live Security & Audit Trail */}
                  <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        Operator Live Audit Stream
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE
                      </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {filteredActivities.length === 0 ? (
                        <p className="text-xs text-slate-500 py-3 text-center">No operator actions logged yet.</p>
                      ) : (
                        filteredActivities.map((act) => (
                          <div
                            key={act.id}
                            className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1 hover:border-cyan-500/30 transition-colors"
                          >
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="font-bold text-cyan-300">{act.action.replace(/_/g, ' ')}</span>
                              <span className="text-slate-500">
                                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-300 text-[11px] line-clamp-1">{act.entityTitle}</p>
                            <p className="text-slate-500 text-[10px] line-clamp-1 italic">{act.details}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ============================================================ */}
          {/* 5. TOP ENGAGEMENT TABLES (ALL_PANORAMA & ACADEMIC_INTELLIGENCE) */}
          {/* ============================================================ */}
          {(commandViewMode === 'ALL_PANORAMA' || commandViewMode === 'ACADEMIC_INTELLIGENCE') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Table 1: Most Viewed Study Materials */}
              <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Top Academic Study Materials</h3>
                  </div>
                  <Link to="/operator/study-material" onClick={() => playSound('click')}>
                    <span className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold">
                      View Vault <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-3">Subject & Title</th>
                        <th className="py-2.5 px-3 text-center">Views</th>
                        <th className="py-2.5 px-3 text-center">Downloads</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {metrics?.topMaterials.map((mat) => (
                        <tr key={mat.id} className="hover:bg-slate-950/60 transition-colors">
                          <td className="py-3 px-3">
                            <p className="font-semibold text-slate-200 line-clamp-1 font-sans">{mat.title}</p>
                            <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] bg-slate-950 text-cyan-300 border border-slate-800">
                              {mat.subject}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center text-slate-300">
                            {mat.views}
                          </td>
                          <td className="py-3 px-3 text-center text-cyan-400 font-bold">
                            {mat.downloads}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link to="/operator/study-material">
                              <button className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-slate-800 text-[11px]">
                                Manage
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Most Attempted CBT Mock Papers */}
              <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white">Most Attempted Live CBT Mock Papers</h3>
                  </div>
                  <Link to="/operator/mock-tests" onClick={() => playSound('click')}>
                    <span className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold">
                      View Series <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-3">Target Exam & Title</th>
                        <th className="py-2.5 px-3 text-center">Attempts</th>
                        <th className="py-2.5 px-3 text-center">Avg Score</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {metrics?.topMockTests.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-950/60 transition-colors">
                          <td className="py-3 px-3">
                            <p className="font-semibold text-slate-200 line-clamp-1 font-sans">{t.title}</p>
                            <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] bg-slate-950 text-purple-300 border border-slate-800">
                              {t.examName}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center text-slate-300 font-bold">
                            {t.attempts}
                          </td>
                          <td className="py-3 px-3 text-center text-emerald-400 font-black">
                            {t.averageScore}%
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link to="/operator/mock-tests">
                              <button className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-purple-300 border border-slate-800 text-[11px]">
                                Manage
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* 6. CRYPTOGRAPHIC MERKLE ROOT TAMPER-SEAL BADGE */}
          {/* ============================================================ */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-inner">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="font-bold text-white flex items-center gap-2">
                  <span>CRYPTOGRAPHIC ACADEMIC INTEGRITY ROOT</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                    VERIFIED HITL
                  </span>
                </p>
                <p className="text-[11px] text-slate-400">
                  SHA-256 Merkle Root: <code className="text-cyan-300 font-bold">0x8a92f03b417c88e2c091d3e87a23c4f9</code> • Tamper-evident academic repository seal.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span>Strict Compliance: <strong>NEP-2020 / NTA Standards</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. MODAL: STUDENT CUSTOM DRILL REVIEW & FEEDBACK (WORKING) */}
      {/* ============================================================ */}
      {isReviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                  STUDENT DRILL DIRECTIVE
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Review Request #{selectedRequest.id}</span>
                </h3>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-slate-400">Student: <strong className="text-white">{selectedRequest.studentName}</strong> (ID: {selectedRequest.studentId})</p>
                <p className="text-slate-400">Target Exam: <strong className="text-cyan-300">{selectedRequest.examName}</strong></p>
                <p className="text-slate-400">Subject / Topic: <strong className="text-amber-300">{selectedRequest.subject}</strong> {selectedRequest.topic && `— ${selectedRequest.topic}`}</p>
                <p className="text-slate-400">Specifications: <span className="text-slate-300 font-mono">{selectedRequest.questionCount} Questions | {selectedRequest.durationMinutes} Mins | {selectedRequest.language} | {selectedRequest.difficulty}</span></p>
                {selectedRequest.notes && (
                  <p className="text-slate-500 italic pt-1 border-t border-slate-900">"{selectedRequest.notes}"</p>
                )}
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 font-mono">Update Directive Status:</label>
                <select
                  value={reviewStatusChoice}
                  onChange={(e) => setReviewStatusChoice(e.target.value as CustomMockDrillRequestStatus)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                >
                  <option value="REQUESTED">REQUESTED (Pending Initial Evaluation)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Academic Team Evaluating Syllabus)</option>
                  <option value="IN_PREPARATION">IN_PREPARATION (Curating & Assembling Questions)</option>
                  <option value="QUALITY_REVIEW">QUALITY_REVIEW (Draft Synthesized / Quality Check)</option>
                  <option value="PUBLISHED">PUBLISHED (Active in Student Mock Test Center)</option>
                  <option value="REJECTED">REJECTED (Out of Scope / Invalid Request)</option>
                </select>
              </div>

              {/* Operator Note to Student */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 font-mono">Operator Feedback / Message to Student:</label>
                <textarea
                  rows={3}
                  value={reviewOperatorNote}
                  onChange={(e) => setReviewOperatorNote(e.target.value)}
                  placeholder="e.g. Assembling 25 questions matching recent UP Police Shift 2 pattern. High-difficulty discount problems included..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none resize-none font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsReviewModalOpen(false)}
                className="bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isProcessingAction}
                onClick={handleSaveRequestReview}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-black"
              >
                {isProcessingAction ? 'Saving Directive...' : 'Commit Status & Notify Student'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. MODAL: INSTANT PYQ DIGITIZER & INGESTION (WORKING) */}
      {/* ============================================================ */}
      {isPyqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                    OFFICIAL SHIFT DIGITIZER
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    Instant Previous Year Question (PYQ) Shift Ingestion
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPyqModalOpen(false);
                  setPyqScanningProgress(null);
                  setPyqScanCompleted(false);
                }}
                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Select Target Exam */}
                <div className="space-y-1">
                  <label className="text-slate-400">Target Competitive Exam:</label>
                  <select
                    value={pyqExamChoice}
                    onChange={(e) => setPyqExamChoice(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {POPULAR_PYQ_EXAMS.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.authority})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Year */}
                <div className="space-y-1">
                  <label className="text-slate-400">Official Exam Year:</label>
                  <select
                    value={pyqYear}
                    onChange={(e) => setPyqYear(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="2025">2025 (Latest Re-Exam Cycle)</option>
                    <option value="2024">2024 (Official Verified Shift)</option>
                    <option value="2023">2023 (Previous Cycle)</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
              </div>

              {/* Shift Timing */}
              <div className="space-y-1">
                <label className="text-slate-400">Official Shift Timing & Batch:</label>
                <select
                  value={pyqShift}
                  onChange={(e) => setPyqShift(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Shift-1 (Morning: 09:00 AM - 10:00 AM)">Shift-1 (Morning: 09:00 AM - 10:00 AM)</option>
                  <option value="Shift-2 (Afternoon: 12:30 PM - 01:30 PM)">Shift-2 (Afternoon: 12:30 PM - 01:30 PM)</option>
                  <option value="Shift-3 (Evening: 04:00 PM - 05:00 PM)">Shift-3 (Evening: 04:00 PM - 05:00 PM)</option>
                </select>
              </div>

              {/* OCR Engine Mode */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">OCR Digitization Engine Mode</p>
                  <p className="text-[11px] text-slate-400 font-sans">Automatic bilingual parsing, Hindi Unicode normalization, formula LaTeX extraction.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPyqOcrMode('FAST')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      pyqOcrMode === 'FAST'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Fast Text OCR
                  </button>
                  <button
                    onClick={() => setPyqOcrMode('DEEP_STEM')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      pyqOcrMode === 'DEEP_STEM'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Deep STEM Math
                  </button>
                </div>
              </div>

              {/* Interactive Scanning Progress Bar */}
              {pyqScanningProgress !== null && (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-cyan-400 font-bold">
                      {pyqScanCompleted ? '✓ OCR PARSE COMPLETE — 100 Qs VALIDATED' : 'SCANNING & DECOMPOSING PDF SECTIONS...'}
                    </span>
                    <span className="text-white font-bold">{pyqScanningProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300"
                      style={{ width: `${pyqScanningProgress}%` }}
                    />
                  </div>
                  {pyqScanCompleted && (
                    <div className="pt-2 text-[11px] text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Sections detected: Section 1 (Reasoning 25Q), Section 2 (GA 25Q), Section 3 (Quant 25Q), Section 4 (English 25Q).
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <Link to="/operator/pyq-studio" onClick={() => setIsPyqModalOpen(false)}>
                <span className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline">
                  Open Full Studio with PDF Uploader →
                </span>
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsPyqModalOpen(false);
                    setPyqScanningProgress(null);
                    setPyqScanCompleted(false);
                  }}
                  className="bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>

                {!pyqScanCompleted ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleStartPyqOcrScan}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg"
                  >
                    <Play className="w-3.5 h-3.5 mr-1" />
                    Simulate OCR Parse
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCommitPyqIngestion}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Commit Ingestion into Bank
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
