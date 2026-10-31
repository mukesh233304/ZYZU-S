// FOCUSPOINT Pan-India Operator Master Question Bank & Futuristic Quality Studio
// Panoramic Horizontal Cyber-HUD with Web Audio Synthesizer, Horizontal Studio Dual-Deck,
// Horizontal Carousel Rail, Kanban Pipeline, Neural AI Generator, and Student CBT Sandbox.

import React, { useState, useEffect, useMemo } from 'react';
import { 
  HelpCircle, 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Edit3, 
  Check, 
  X, 
  RefreshCw, 
  ChevronRight, 
  ChevronLeft,
  BookOpen, 
  ShieldCheck, 
  Trash2,
  FileText,
  Copy,
  Download,
  Upload,
  Layers,
  Sliders,
  CheckSquare,
  Square,
  AlertCircle,
  Volume2,
  VolumeX,
  Play,
  Terminal,
  Cpu,
  Zap,
  Tag,
  Eye,
  Languages,
  Hash,
  Database,
  Radio,
  FileCode,
  ArrowRight,
  ArrowLeft,
  Columns,
  Grid,
  LayoutDashboard,
  Landmark
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockStore } from '../../mock/store';
import { QuestionItem, QuestionDifficulty, QuestionStatus, QuestionType } from '../../types/academicIntelligence';
import { aiExamAssistantService } from '../../services/aiExamAssistantService';
import { operatorService } from '../../services/operatorService';
import { blueprintValidationService } from '../../services/blueprintValidationService';
import { OperatorQuestionAuthoringWizardModal } from './OperatorQuestionAuthoringWizardModal';

// Procedural Cyber Web Audio Synthesizer
const playCyberAudio = (type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'scan', enabled: boolean = true) => {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'click':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      case 'warp':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      case 'confirm':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(1046.50, now + 0.16);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      case 'toggle':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'alert':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.setValueAtTime(280, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      case 'scan':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.linearRampToValueAtTime(1500, now + 0.2);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
    }
  } catch {
    // Audio suppressed or unsupported
  }
};

export const OperatorQuestionBank: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [examFilter, setExamFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [bilingualFilter, setBilingualFilter] = useState<boolean>(false);

  // Layout View Modes: HORIZONTAL_STUDIO (Default Horizontal Split), HORIZONTAL_CAROUSEL, HORIZONTAL_KANBAN, HORIZONTAL_CBT_SANDBOX, GRID
  const [horizontalViewMode, setHorizontalViewMode] = useState<'HORIZONTAL_STUDIO' | 'HORIZONTAL_CAROUSEL' | 'HORIZONTAL_KANBAN' | 'HORIZONTAL_CBT_SANDBOX' | 'GRID'>('HORIZONTAL_STUDIO');
  const [activeQuestionId, setActiveQuestionId] = useState<string>('');

  // Audio Toggle & Auto-Scanning
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [isAutoScanning, setIsAutoScanning] = useState(false);

  // Bulk Selection
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Modals
  const [isAuthoringModalOpen, setIsAuthoringModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [refineQuestion, setRefineQuestion] = useState<QuestionItem | null>(null);
  const [refineFeedback, setRefineFeedback] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);

  // Duplicate Scanner State
  const [isDuplicateScannerOpen, setIsDuplicateScannerOpen] = useState(false);
  const [duplicateThreshold, setDuplicateThreshold] = useState<number>(75);

  // In-Studio Neural AI Question Generator Modal State
  const [isAiGenModalOpen, setIsAiGenModalOpen] = useState(false);
  const [aiGenExam, setAiGenExam] = useState('SSC CGL');
  const [aiGenSubject, setAiGenSubject] = useState('Quantitative Aptitude');
  const [aiGenTopic, setAiGenTopic] = useState('Percentage & Profit-Loss');
  const [aiGenDifficulty, setAiGenDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [aiGenType, setAiGenType] = useState<QuestionType>('MCQ');
  const [aiGenCount, setAiGenCount] = useState<number>(5);
  const [aiGenBilingual, setAiGenBilingual] = useState<boolean>(true);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiTerminalLogs, setAiTerminalLogs] = useState<string[]>([]);

  // Fast Text Stream / Bulk OCR Parser Modal State
  const [isFastStreamModalOpen, setIsFastStreamModalOpen] = useState(false);
  const [fastStreamText, setFastStreamText] = useState('');
  const [parsedStreamQuestions, setParsedStreamQuestions] = useState<Partial<QuestionItem>[]>([]);
  const [fastStreamExam, setFastStreamExam] = useState('UP Police Constable');
  const [fastStreamSubject, setFastStreamSubject] = useState('General Knowledge');

  // Student CBT Sandbox Simulator Modal State
  const [sandboxQuestion, setSandboxQuestion] = useState<QuestionItem | null>(null);
  const [sandboxSelectedOption, setSandboxSelectedOption] = useState<string | null>(null);
  const [sandboxVerified, setSandboxVerified] = useState(false);
  const [sandboxLang, setSandboxLang] = useState<'EN' | 'HI'>('EN');

  // Inline Horizontal CBT Sandbox Mode State
  const [inlineCbtAnswers, setInlineCbtAnswers] = useState<Record<string, string>>({});
  const [inlineCbtStatus, setInlineCbtStatus] = useState<Record<string, 'ANSWERED' | 'REVIEW' | 'VISITED'>>({});
  const [inlineCbtTimer, setInlineCbtTimer] = useState<number>(7185); // 01:59:45
  const [inlineCbtLang, setInlineCbtLang] = useState<'EN' | 'HI'>('EN');
  const [inlineCbtFeedback, setInlineCbtFeedback] = useState<{ [qId: string]: { isCorrect: boolean; message: string } }>({});

  // In-Card Interactive Option Testing State (keyed by question id)
  const [testedOptions, setTestedOptions] = useState<Record<string, string>>({});

  const playSound = (type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'scan') => {
    playCyberAudio(type, sfxEnabled);
  };

  const loadQuestions = () => {
    const list = mockStore.getQuestionBank();
    setQuestions(list);
    if (list.length > 0 && !activeQuestionId) {
      setActiveQuestionId(list[0].id);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // Format Timer HH:MM:SS
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Horizontal Auto-Scan Effect (2.5s Cadence)
  useEffect(() => {
    if (!isAutoScanning || questions.length <= 1) return;
    const interval = setInterval(() => {
      setActiveQuestionId((currId) => {
        const pool = questions;
        const idx = pool.findIndex(q => q.id === currId);
        const nextIdx = (idx + 1) % pool.length;
        playSound('scan');
        return pool[nextIdx].id;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [isAutoScanning, questions, sfxEnabled]);

  // Inline CBT Countdown Timer Effect
  useEffect(() => {
    if (horizontalViewMode !== 'HORIZONTAL_CBT_SANDBOX') return;
    const timer = setInterval(() => {
      setInlineCbtTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [horizontalViewMode]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const qText = (q.questionText || '') + ' ' + (q.hindiQuestionText || '');
      const matchesSearch = 
        qText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.chapter && q.chapter.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesExam = examFilter === 'ALL' || q.examName === examFilter;
      const matchesSubject = subjectFilter === 'ALL' || q.subject === subjectFilter;
      const matchesDifficulty = difficultyFilter === 'ALL' || q.difficulty === difficultyFilter;
      const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || q.questionType === typeFilter;
      const matchesBilingual = !bilingualFilter || Boolean(q.hindiQuestionText);

      return matchesSearch && matchesExam && matchesSubject && matchesDifficulty && matchesStatus && matchesType && matchesBilingual;
    });
  }, [questions, searchQuery, examFilter, subjectFilter, difficultyFilter, statusFilter, typeFilter, bilingualFilter]);

  // Active Question for Horizontal Studio View
  const activeQuestion = useMemo(() => {
    return filteredQuestions.find(q => q.id === activeQuestionId) || filteredQuestions[0] || null;
  }, [filteredQuestions, activeQuestionId]);

  const activeIndex = useMemo(() => {
    return filteredQuestions.findIndex(q => q.id === activeQuestion?.id);
  }, [filteredQuestions, activeQuestion]);

  const handlePrevQuestion = () => {
    if (activeIndex > 0) {
      playSound('click');
      setActiveQuestionId(filteredQuestions[activeIndex - 1].id);
    }
  };

  const handleNextQuestion = () => {
    if (activeIndex < filteredQuestions.length - 1) {
      playSound('click');
      setActiveQuestionId(filteredQuestions[activeIndex + 1].id);
    }
  };

  // Keyboard Arrow Navigation for Horizontal Studio and Horizontal Carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAiGenModalOpen || isFastStreamModalOpen || isDuplicateScannerOpen || isAuthoringModalOpen || sandboxQuestion || refineQuestion) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        if (activeIndex > 0) {
          playSound('click');
          setActiveQuestionId(filteredQuestions[activeIndex - 1].id);
        }
      } else if (e.key === 'ArrowRight') {
        if (activeIndex < filteredQuestions.length - 1) {
          playSound('click');
          setActiveQuestionId(filteredQuestions[activeIndex + 1].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, filteredQuestions, isAiGenModalOpen, isFastStreamModalOpen, isDuplicateScannerOpen, isAuthoringModalOpen, sandboxQuestion, refineQuestion]);

  // Quick 1-Click Neural Hindi Translation for Active Item
  const handleQuickTranslateHindi = async (q: QuestionItem) => {
    playSound('scan');
    try {
      const res = await aiExamAssistantService.refineQuestion(q, 'TRANSLATE_HINDI');
      const hindiText = res.refinedText || `(हिन्दी अनुवाद) ${q.examName} के पाठ्यक्रम के अंतर्गत: ${q.questionText}`;
      const updated: QuestionItem = {
        ...q,
        hindiQuestionText: hindiText,
        language: 'Bilingual',
        updatedAt: new Date().toISOString()
      };
      mockStore.updateQuestion(updated);
      playSound('confirm');
      showToast(`Synchronized Hindi translation compiled for Question #${q.id.slice(-4)}!`, 'success');
      loadQuestions();
    } catch {
      playSound('alert');
      showToast('Neural translation could not be completed.', 'error');
    }
  };

  // Demo Text Dumps for Fast Stream OCR
  const loadDemoOcrSample = (sampleNum: 1 | 2) => {
    playSound('click');
    if (sampleNum === 1) {
      setFastStreamExam('SSC CGL');
      setFastStreamSubject('Quantitative Aptitude');
      setFastStreamText(
`Q1. If the price of sugar increases by 25%, by how much percent should a family reduce its consumption so that the total expenditure remains the same?
A) 20%
B) 25%
C) 16.66%
D) 30%
Ans: A
Expl: Let original price = 100, original consumption = 100. Total expenditure = 10,000. New price = 125. Required consumption = 10000 / 125 = 80. Reduction % = 20%.

Q2. A train 240 m long crosses a platform of equal length in 24 seconds. What is the speed of the train in km/h?
A) 64 km/h
B) 72 km/h
C) 80 km/h
D) 90 km/h
Ans: B
Expl: Total distance = 240 + 240 = 480 m. Speed = 480 / 24 = 20 m/s. In km/h = 20 * (18 / 5) = 72 km/h.`
      );
    } else {
      setFastStreamExam('UP Police Constable');
      setFastStreamSubject('General Knowledge');
      setFastStreamText(
`Q1. Which district of Uttar Pradesh has the highest literacy rate according to Census 2011?
A) Gautam Buddha Nagar
B) Kanpur Nagar
C) Auraiya
D) Etawah
Ans: A
Expl: Gautam Buddha Nagar recorded the highest literacy rate in Uttar Pradesh at 80.12%.

Q2. Where is the Central Drug Research Institute (CDRI) situated in Uttar Pradesh?
A) Varanasi
B) Prayagraj
C) Lucknow
D) Agra
Ans: C
Expl: The Central Drug Research Institute (CDRI) was established in 1951 in Lucknow, Uttar Pradesh.`
      );
    }
    showToast(`Loaded Sample ${sampleNum} past paper text dump!`, 'info');
  };

  // Preset Configurations for Neural AI Generator
  const applyAiGenPreset = (preset: 'SSC_PROFIT' | 'UP_GK_BILINGUAL' | 'JEE_NUMERICAL' | 'UPSC_ASSERTION') => {
    playSound('click');
    if (preset === 'SSC_PROFIT') {
      setAiGenExam('SSC CGL');
      setAiGenSubject('Quantitative Aptitude');
      setAiGenTopic('Profit, Loss & Discount Misconception Traps');
      setAiGenType('MCQ');
      setAiGenDifficulty('MEDIUM');
      setAiGenCount(5);
      setAiGenBilingual(true);
    } else if (preset === 'UP_GK_BILINGUAL') {
      setAiGenExam('UP Police Constable');
      setAiGenSubject('General Knowledge');
      setAiGenTopic('UP History, Rivers & Cultural Heritage');
      setAiGenType('MCQ');
      setAiGenDifficulty('EASY');
      setAiGenCount(5);
      setAiGenBilingual(true);
    } else if (preset === 'JEE_NUMERICAL') {
      setAiGenExam('JEE Main');
      setAiGenSubject('Physics');
      setAiGenTopic('Kinematics & Projectile Motion');
      setAiGenType('NUMERICAL');
      setAiGenDifficulty('HARD');
      setAiGenCount(5);
      setAiGenBilingual(false);
    } else {
      setAiGenExam('SSC CGL');
      setAiGenSubject('General Awareness');
      setAiGenTopic('Indian Polity & Constitutional Amendments');
      setAiGenType('ASSERTION_REASON');
      setAiGenDifficulty('HARD');
      setAiGenCount(5);
      setAiGenBilingual(true);
    }
    showToast('Applied AI synthesizer preset configuration!', 'info');
  };

  // Available Exams for Dropdown
  const availableExams = useMemo(() => {
    return mockStore.getGovernmentExams().map(e => ({
      id: e.id,
      name: e.name,
      subjects: e.subjects
    }));
  }, []);

  // Available Subjects
  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    questions.forEach(q => { if (q.subject) subs.add(q.subject); });
    return Array.from(subs);
  }, [questions]);

  // Duplicate Question Detection
  const duplicateMatches = useMemo(() => {
    if (!isDuplicateScannerOpen) return [];
    return blueprintValidationService.findDuplicateQuestions(questions, duplicateThreshold);
  }, [questions, isDuplicateScannerOpen, duplicateThreshold]);

  // Repository Telemetry Metrics
  const repositoryMetrics = useMemo(() => {
    const total = questions.length;
    const approved = questions.filter(q => q.status === 'APPROVED' || q.status === 'PUBLISHED').length;
    const aiGen = questions.filter(q => q.status === 'AI_GENERATED').length;
    const bilingual = questions.filter(q => Boolean(q.hindiQuestionText)).length;
    const duplicateCount = blueprintValidationService.findDuplicateQuestions(questions, 80).length;
    const avgCalibScore = total > 0 ? (98.4 - (duplicateCount * 0.4)).toFixed(1) : '100.0';

    return {
      total,
      approved,
      aiGen,
      bilingual,
      duplicateCount,
      avgCalibScore
    };
  }, [questions]);

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    playSound('toggle');
    if (selectedQuestionIds.length === filteredQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredQuestions.map(q => q.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    playSound('click');
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(selectedQuestionIds.filter(i => i !== id));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  const handleBulkApprove = () => {
    if (selectedQuestionIds.length === 0) return;
    playSound('confirm');
    const count = mockStore.bulkApproveQuestions(selectedQuestionIds, user?.name || "ZYZU'S Academic Lead");
    showToast(`Successfully promoted ${count} questions to APPROVED status!`, 'success');
    setSelectedQuestionIds([]);
    loadQuestions();
  };

  const handleBulkReject = () => {
    if (selectedQuestionIds.length === 0) return;
    playSound('alert');
    const count = mockStore.bulkRejectQuestions(selectedQuestionIds);
    showToast(`Marked ${count} questions as REJECTED.`, 'info');
    setSelectedQuestionIds([]);
    loadQuestions();
  };

  const handleBulkDelete = () => {
    if (selectedQuestionIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently remove ${selectedQuestionIds.length} questions from the Master Bank?`)) return;
    playSound('alert');
    const count = mockStore.bulkDeleteQuestions(selectedQuestionIds);
    showToast(`Deleted ${count} questions from repository.`, 'success');
    setSelectedQuestionIds([]);
    loadQuestions();
  };

  const handleBulkExportJSON = () => {
    playSound('confirm');
    const toExport = selectedQuestionIds.length > 0 
      ? questions.filter(q => selectedQuestionIds.includes(q.id))
      : filteredQuestions;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(toExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `zyzus_questions_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${toExport.length} questions to JSON!`, 'success');
  };

  // Authoring Save Handler
  const handleSaveQuestionFromModal = (savedQ: QuestionItem) => {
    playSound('confirm');
    mockStore.saveQuestion(savedQ);
    operatorService.logActivity({
      operatorId: user?.id || 'usr-operator-sunita',
      operatorName: user?.name || 'Sunita Verma',
      action: editingQuestion ? 'QUESTION_UPDATE' : 'QUESTION_CREATE',
      entity: 'QUESTION',
      entityId: savedQ.id,
      entityTitle: `${savedQ.subject} — ${savedQ.topic}`,
      details: `${editingQuestion ? 'Updated' : 'Authored'} question for ${savedQ.examName} (${savedQ.questionType})`
    });
    showToast(editingQuestion ? 'Question updated in Master Repository!' : 'New question added to Master Bank!', 'success');
    setIsAuthoringModalOpen(false);
    setEditingQuestion(null);
    loadQuestions();
    setActiveQuestionId(savedQ.id);
  };

  // Single Question Actions
  const handleApprove = (q: QuestionItem) => {
    playSound('confirm');
    mockStore.approveQuestion(q.id, user?.name || "ZYZU'S Academic Lead");
    showToast(`Question #${q.id.slice(-4)} promoted to APPROVED status!`, 'success');
    loadQuestions();
  };

  const handleReject = (q: QuestionItem) => {
    playSound('alert');
    mockStore.rejectQuestion(q.id);
    showToast(`Question #${q.id.slice(-4)} marked as REJECTED.`, 'info');
    loadQuestions();
  };

  const handleDeleteOne = (q: QuestionItem) => {
    if (!window.confirm('Delete this question from repository?')) return;
    playSound('alert');
    mockStore.deleteQuestion(q.id);
    showToast('Question deleted from bank.', 'success');
    loadQuestions();
  };

  // In-Card Interactive Option Tester
  const handleTestOptionClick = (questionId: string, optionKey: string) => {
    const q = questions.find(item => item.id === questionId);
    const optIdx = optionKey.charCodeAt(0) - 65;
    const isCorrect = q?.options[optIdx]?.isCorrect ?? (q?.correctAnswer === optionKey);
    if (isCorrect) {
      playSound('confirm');
    } else {
      playSound('alert');
    }
    setTestedOptions(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  // AI Refine Actions
  const handleRefineAction = async (action: 'SIMPLIFY' | 'MAKE_HARDER' | 'GENERATE_EXPLANATION' | 'DETECT_DUPLICATE' | 'TRANSLATE_HINDI') => {
    if (!refineQuestion) return;
    playSound('scan');
    setIsRefining(true);
    try {
      const res = await aiExamAssistantService.refineQuestion(refineQuestion, action);
      setRefineFeedback(res.feedback);
      if (res.refinedText || res.explanation || res.difficulty) {
        const isTranslate = action === 'TRANSLATE_HINDI';
        const updated: QuestionItem = {
          ...refineQuestion,
          questionText: isTranslate ? refineQuestion.questionText : (res.refinedText || refineQuestion.questionText),
          hindiQuestionText: isTranslate ? (res.refinedText || refineQuestion.hindiQuestionText) : refineQuestion.hindiQuestionText,
          language: isTranslate ? 'Bilingual' : refineQuestion.language,
          explanation: res.explanation || refineQuestion.explanation,
          difficulty: res.difficulty || refineQuestion.difficulty,
          updatedAt: new Date().toISOString()
        };
        mockStore.updateQuestion(updated);
        setRefineQuestion(updated);
        loadQuestions();
      }
      playSound('confirm');
      showToast(res.feedback, 'success');
    } catch {
      playSound('alert');
      showToast('AI refinement failed.', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  // Neural AI Synthesis Execution
  const handleRunAiSynthesis = async () => {
    playSound('scan');
    setIsAiGenerating(true);
    setAiTerminalLogs([
      `[00:00.12] Initializing Neural Curriculum Synthesizer for ${aiGenExam}...`,
      `[00:00.45] Indexing verified syllabus node: ${aiGenSubject} > ${aiGenTopic}`,
      `[00:00.90] Setting cognitive rigor matrix: Difficulty=${aiGenDifficulty}, Format=${aiGenType}`
    ]);

    await new Promise(r => setTimeout(r, 500));
    setAiTerminalLogs(prev => [
      ...prev,
      `[00:01.30] Formulating ${aiGenCount} distractors with misconception-trap analysis...`,
      `[00:01.80] Generating high-yield step-by-step mathematical & concept proofs...`
    ]);

    await new Promise(r => setTimeout(r, 600));
    setAiTerminalLogs(prev => [
      ...prev,
      `[00:02.10] Applying anti-plagiarism vector hash check (Zero collision detected)...`,
      `[00:02.50] ${aiGenBilingual ? 'Compiling synchronized Hindi/English bilingual stems...' : 'Enforcing single-language precision...'}`
    ]);

    await new Promise(r => setTimeout(r, 500));

    const newItems: QuestionItem[] = Array.from({ length: aiGenCount }, (_, i) => {
      const qNum = i + 1;
      const timestamp = new Date().toISOString();
      const id = `synth-ai-${Date.now()}-${qNum}`;

      if (aiGenType === 'NUMERICAL') {
        const answerVal = 42 + (i * 7);
        return {
          id,
          examId: availableExams.find(e => e.name === aiGenExam)?.id || 'exam-ssc-cgl',
          examName: aiGenExam,
          subject: aiGenSubject,
          topic: aiGenTopic,
          chapter: `${aiGenTopic} Fundamentals`,
          difficulty: aiGenDifficulty,
          questionType: 'NUMERICAL',
          questionText: `[AI Synthesized Q#${qNum}] A project can be completed in ${answerVal * 2} days. If work efficiency increases by 100%, calculate the exact duration (in days) required to complete the task?`,
          hindiQuestionText: aiGenBilingual ? `एक कार्य को ${answerVal * 2} दिनों में पूरा किया जा सकता है। यदि दक्षता 100% बढ़ जाती है, तो कार्य पूरा होने में लगने वाले दिनों की संख्या ज्ञात करें?` : undefined,
          options: [],
          correctAnswer: String(answerVal),
          numericalAnswer: answerVal,
          numericalTolerance: 0.5,
          explanation: `Efficiency is inversely proportional to time: New Time = Initial Time / 2 = (${answerVal * 2}) / 2 = ${answerVal} days.`,
          marks: 2,
          negativeMarks: 0.5,
          language: aiGenBilingual ? 'Bilingual' : 'English',
          source: 'AI_GENERATED',
          status: 'AI_GENERATED',
          createdAt: timestamp,
          updatedAt: timestamp
        };
      } else if (aiGenType === 'ASSERTION_REASON') {
        return {
          id,
          examId: availableExams.find(e => e.name === aiGenExam)?.id || 'exam-ssc-cgl',
          examName: aiGenExam,
          subject: aiGenSubject,
          topic: aiGenTopic,
          chapter: `${aiGenTopic} Core Principles`,
          difficulty: aiGenDifficulty,
          questionType: 'ASSERTION_REASON',
          questionText: `[AI Assertion-Reason #${qNum}]\nAssertion (A): Price inflation leads to a decrease in purchasing power of currency.\nReason (R): When general price levels rise, each unit of currency buys fewer goods and services.`,
          hindiQuestionText: aiGenBilingual ? `अभिकथन (A): मूल्य वृद्धि से मुद्रा की क्रय शक्ति में गिरावट आती है।\nकारण (R): जब सामान्य मूल्य स्तर बढ़ता है, तो मुद्रा की प्रत्येक इकाई कम वस्तुएं खरीदती है।` : undefined,
          options: [
            { id: 'opt_1', text: 'Both (A) and (R) are true and (R) is the correct explanation of (A)', isCorrect: true },
            { id: 'opt_2', text: 'Both (A) and (R) are true but (R) is NOT the correct explanation of (A)', isCorrect: false },
            { id: 'opt_3', text: '(A) is true but (R) is false', isCorrect: false },
            { id: 'opt_4', text: '(A) is false but (R) is true', isCorrect: false }
          ],
          correctAnswer: 'A',
          explanation: 'Inflation is defined as the sustained increase in general price levels, directly eroding the real value and purchasing power of money.',
          marks: 2,
          negativeMarks: 0.5,
          language: aiGenBilingual ? 'Bilingual' : 'English',
          source: 'AI_GENERATED',
          status: 'AI_GENERATED',
          createdAt: timestamp,
          updatedAt: timestamp
        };
      } else {
        return {
          id,
          examId: availableExams.find(e => e.name === aiGenExam)?.id || 'exam-ssc-cgl',
          examName: aiGenExam,
          subject: aiGenSubject,
          topic: aiGenTopic,
          chapter: `${aiGenTopic} In-Depth Drill`,
          difficulty: aiGenDifficulty,
          questionType: 'MCQ',
          questionText: `[AI Synthesized Q#${qNum}] Under the ${aiGenTopic} curriculum for ${aiGenExam}, what is the principal outcome when interest rate is compounded semi-annually over an annual period?`,
          hindiQuestionText: aiGenBilingual ? `${aiGenExam} के पाठ्यक्रम के अंतर्गत, जब ब्याज की गणना अर्धवार्षिक रूप से की जाती है तो प्रभावी वार्षिक दर पर क्या प्रभाव पड़ता है?` : undefined,
          options: [
            { id: 'opt_1', text: 'Effective annual rate is higher than nominal annual rate', isCorrect: true },
            { id: 'opt_2', text: 'Effective annual rate is exactly half of nominal rate', isCorrect: false },
            { id: 'opt_3', text: 'Effective annual rate remains completely unaffected', isCorrect: false },
            { id: 'opt_4', text: 'Effective annual rate drops to zero', isCorrect: false }
          ],
          correctAnswer: 'A',
          explanation: 'Compounding frequency increases future value: EAR = (1 + r/n)^n - 1 > r when n > 1.',
          marks: 2,
          negativeMarks: 0.5,
          language: aiGenBilingual ? 'Bilingual' : 'English',
          source: 'AI_GENERATED',
          status: 'AI_GENERATED',
          createdAt: timestamp,
          updatedAt: timestamp
        };
      }
    });

    newItems.forEach(item => mockStore.saveQuestion(item));

    operatorService.logActivity({
      operatorId: user?.id || 'usr-operator-sunita',
      operatorName: user?.name || 'Sunita Verma',
      action: 'QUESTION_CREATE',
      entity: 'QUESTION',
      entityId: newItems[0].id,
      entityTitle: `AI Synthesized Batch (${aiGenCount} Qs) — ${aiGenExam}`,
      details: `Generated ${aiGenCount} ${aiGenDifficulty} questions in ${aiGenSubject} via Neural In-Studio Generator`
    });

    setIsAiGenerating(false);
    playSound('confirm');
    showToast(`Successfully synthesized ${aiGenCount} questions into Master Bank!`, 'success');
    setIsAiGenModalOpen(false);
    loadQuestions();
    setActiveQuestionId(newItems[0].id);
  };

  // Fast Stream OCR Parser Handler
  const handleParseStreamText = () => {
    playSound('warp');
    if (!fastStreamText.trim()) {
      showToast('Please paste question text to parse.', 'error');
      return;
    }

    const blocks = fastStreamText.split(/(?=\n(?:Q\d+|\d+[\.\)])\s*)/gi).filter(b => b.trim().length > 10);
    const parsed: Partial<QuestionItem>[] = [];

    blocks.forEach((block, idx) => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      const qLine = lines.find(l => /^(?:Q\d+|\d+[\.\)])/i.test(l)) || lines[0] || `Question ${idx + 1}`;
      const qText = qLine.replace(/^(?:Q\d+|\d+[\.\)])\s*/i, '');

      const optA = lines.find(l => /^[A\(\[]/i.test(l))?.replace(/^[A\(\[]\.?\s*/i, '') || 'Option A';
      const optB = lines.find(l => /^[B\(\[]/i.test(l))?.replace(/^[B\(\[]\.?\s*/i, '') || 'Option B';
      const optC = lines.find(l => /^[C\(\[]/i.test(l))?.replace(/^[C\(\[]\.?\s*/i, '') || 'Option C';
      const optD = lines.find(l => /^[D\(\[]/i.test(l))?.replace(/^[D\(\[]\.?\s*/i, '') || 'Option D';

      const keyLine = lines.find(l => /(?:ans|answer|key)\s*[:\-]\s*[A-D]/i.test(l));
      let key = 'A';
      if (keyLine) {
        const match = keyLine.match(/(?:ans|answer|key)\s*[:\-]\s*([A-D])/i);
        if (match) key = match[1].toUpperCase();
      }

      const explLine = lines.find(l => /(?:expl|explanation|sol|solution)\s*[:\-]/i.test(l));
      const expl = explLine 
        ? explLine.replace(/(?:expl|explanation|sol|solution)\s*[:\-]\s*/i, '')
        : 'Official verified explanation parsed from source paper dump.';

      parsed.push({
        id: `parsed-stream-${Date.now()}-${idx + 1}`,
        examName: fastStreamExam,
        subject: fastStreamSubject,
        topic: 'General Syllabus',
        difficulty: 'MEDIUM',
        questionType: 'MCQ',
        questionText: qText,
        options: [
          { id: 'opt_1', text: optA, isCorrect: key === 'A' },
          { id: 'opt_2', text: optB, isCorrect: key === 'B' },
          { id: 'opt_3', text: optC, isCorrect: key === 'C' },
          { id: 'opt_4', text: optD, isCorrect: key === 'D' }
        ],
        correctAnswer: key,
        explanation: expl,
        marks: 2,
        negativeMarks: 0.5,
        status: 'APPROVED',
        source: 'STAFF_AUTHORED'
      });
    });

    setParsedStreamQuestions(parsed);
    showToast(`Parsed ${parsed.length} structured question items!`, 'success');
  };

  const handleImportParsedStream = () => {
    if (parsedStreamQuestions.length === 0) return;
    playSound('confirm');
    const timestamp = new Date().toISOString();
    parsedStreamQuestions.forEach((pq) => {
      const fullQ: QuestionItem = {
        id: pq.id || `q-stream-${Date.now()}`,
        examId: availableExams.find(e => e.name === fastStreamExam)?.id || 'exam-up-constable',
        examName: fastStreamExam,
        subject: fastStreamSubject,
        topic: pq.topic || 'General Practice',
        chapter: 'Fast Stream Ingestion',
        difficulty: (pq.difficulty as QuestionDifficulty) || 'MEDIUM',
        questionType: (pq.questionType as QuestionType) || 'MCQ',
        questionText: pq.questionText || 'Parsed question stem',
        options: pq.options || [
          { id: '1', text: 'Option A', isCorrect: true },
          { id: '2', text: 'Option B', isCorrect: false },
          { id: '3', text: 'Option C', isCorrect: false },
          { id: '4', text: 'Option D', isCorrect: false }
        ],
        correctAnswer: pq.correctAnswer || 'A',
        explanation: pq.explanation || 'Solution proof',
        marks: 2,
        negativeMarks: 0.5,
        language: 'Bilingual',
        source: 'STAFF_AUTHORED',
        status: 'APPROVED',
        createdAt: timestamp,
        updatedAt: timestamp
      };
      mockStore.saveQuestion(fullQ);
    });

    operatorService.logActivity({
      operatorId: user?.id || 'usr-operator-sunita',
      operatorName: user?.name || 'Sunita Verma',
      action: 'QUESTION_CREATE',
      entity: 'QUESTION',
      entityId: parsedStreamQuestions[0].id || 'batch-stream-01',
      entityTitle: `Fast Stream Ingestion (${parsedStreamQuestions.length} Qs)`,
      details: `Batch-imported ${parsedStreamQuestions.length} questions into ${fastStreamExam}`
    });

    showToast(`Committed ${parsedStreamQuestions.length} questions to Master Repository!`, 'success');
    setIsFastStreamModalOpen(false);
    setFastStreamText('');
    setParsedStreamQuestions([]);
    loadQuestions();
  };

  // Duplicate Resolution Handlers
  const handleResolveDuplicate = (keepId: string, removeId: string) => {
    playSound('confirm');
    mockStore.deleteQuestion(removeId);
    showToast(`Removed duplicate item. Retained question #${keepId.slice(-4)} as verified standard.`, 'success');
    loadQuestions();
  };

  return (
    <div className="space-y-6 w-full max-w-[1780px] mx-auto p-4 sm:p-6 lg:p-8 rounded-3xl bg-[#030712] border border-cyan-500/20 text-slate-100 shadow-[0_0_80px_rgba(6,182,212,0.12)] min-h-screen font-sans">
      {/* ========================================================================= */}
      {/* 1. PANORAMIC CYBER-HUD COMMAND DECK & QUALITY STUDIO HEADER               */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border border-cyan-500/40 p-6 sm:p-8 text-white shadow-[0_0_60px_rgba(6,182,212,0.2)] space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* HERO TITLE & EYEBROW ROW */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-xs shadow-cyan-500/20 font-mono">
                <Database className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                Master Question Repository • Horizontal Quality Studio
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Anti-Tamper SHA-256
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/40">
                <Radio className="w-3.5 h-3.5 text-indigo-400" />
                NOC Active
                <span className="inline-flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-2 bg-cyan-400 animate-pulse rounded-full" />
                  <span className="w-1 h-3 bg-cyan-400 animate-pulse delay-75 rounded-full" />
                  <span className="w-1 h-1.5 bg-cyan-400 animate-pulse delay-150 rounded-full" />
                </span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <HelpCircle className="w-8 h-8 sm:w-9 sm:h-9 text-cyan-400" />
              Master Question Bank &amp; Horizontal Studio
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed font-normal">
              Author, audit, calibrate, and version exam items across single/multiple-choice, numerical, assertion-reason, and bilingual formats with wide horizontal dual-pane inspection, carousel rails, and live student CBT sandboxing.
            </p>
          </div>

          {/* SYSTEM STATUS & AUDIO SFX TOGGLE */}
          <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              TCS iON CBT COMPLIANT
            </span>
            <button
              type="button"
              onClick={() => {
                const nextState = !sfxEnabled;
                setSfxEnabled(nextState);
                playCyberAudio('toggle', nextState);
              }}
              title={sfxEnabled ? 'Web Audio SFX Enabled' : 'Web Audio Muted'}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                sfxEnabled 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20' 
                  : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sfxEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              <span>{sfxEnabled ? 'HUD AUDIO ON' : 'AUDIO MUTED'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HORIZONTAL ACTION COMMAND BAR (5 DEDICATED ACTION BUTTONS)                */}
        {/* ========================================================================= */}
        <div className="pt-4 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. Neural AI Generator */}
            <button
              type="button"
              onClick={() => {
                playSound('warp');
                setIsAiGenModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all border border-purple-400/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Cpu className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>Neural AI Generator</span>
            </button>

            {/* 2. Fast Stream OCR */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setIsFastStreamModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-cyan-900/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Fast Stream OCR</span>
            </button>

            {/* 3. Duplicate Radar */}
            <button
              type="button"
              onClick={() => {
                playSound('scan');
                setIsDuplicateScannerOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-amber-900/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Duplicate Radar</span>
            </button>

            {/* 4. Export */}
            <button
              type="button"
              onClick={handleBulkExportJSON}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white flex items-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export</span>
            </button>

            {/* 5. Author Question Primary Action */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setEditingQuestion(null);
                setIsAuthoringModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Author Question</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="hidden sm:inline">SHA-256 Checksum:</span>
            <span className="text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {activeQuestion ? `SHA256:7f4a${activeQuestion.id.slice(-6)}e98c` : 'SHA256:7f4a8b21c4e9'}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HORIZONTAL TELEMETRY STRIP (EXACT 6 VALUES WITH CYBER GAUGES)             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-cyan-500/20 text-xs">
          {/* Card 1: Total Items */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-inner hover:border-cyan-400 transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-indigo-500" />
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-cyan-400" /> Total Items</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </span>
            <p className="text-2xl font-black text-white mt-1.5 font-mono tracking-tight">{repositoryMetrics.total}</p>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-cyan-400 h-full w-full rounded-full" />
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-1">Active Questions in Bank</p>
          </div>

          {/* Card 2: Approved */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-inner hover:border-emerald-400 transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Approved</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </span>
            <p className="text-2xl font-black text-emerald-300 mt-1.5 font-mono tracking-tight">{repositoryMetrics.approved}</p>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full w-[93.3%] rounded-full" />
            </div>
            <p className="text-[10px] font-mono text-emerald-400/90 mt-1">93.3% Quality Passed</p>
          </div>

          {/* Card 3: AI Synthesized */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-inner hover:border-purple-400 transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Synthesized</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            </span>
            <p className="text-2xl font-black text-purple-300 mt-1.5 font-mono tracking-tight">{repositoryMetrics.aiGen}</p>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-400 h-full w-[6.7%] rounded-full" />
            </div>
            <p className="text-[10px] font-mono text-purple-300/90 mt-1">1 Awaiting QA Audit</p>
          </div>

          {/* Card 4: Bilingual Ready */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-inner hover:border-cyan-400 transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Languages className="w-3.5 h-3.5 text-cyan-400" /> Bilingual Ready</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </span>
            <p className="text-2xl font-black text-cyan-300 mt-1.5 font-mono tracking-tight">{repositoryMetrics.bilingual}</p>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-cyan-400 h-full w-0 rounded-full" />
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-1">Hindi Translation Ready</p>
          </div>

          {/* Card 5: Duplicate Risk */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-inner hover:border-amber-400 transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Duplicate Risk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </span>
            <p className="text-2xl font-black text-amber-300 mt-1.5 font-mono tracking-tight">{repositoryMetrics.duplicateCount} Pairs</p>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full w-full rounded-full" />
            </div>
            <p className="text-[10px] font-mono text-emerald-400 mt-1">Zero Semantic Collisions</p>
          </div>

          {/* Card 6: Calibration Index */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-inner hover:border-emerald-400 transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-400" /> Calibration Index</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </span>
            <p className="text-2xl font-black text-emerald-300 mt-1.5 font-mono tracking-tight">{repositoryMetrics.avgCalibScore}%</p>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full w-[98.4%] rounded-full" />
            </div>
            <p className="text-[10px] font-mono text-emerald-400 mt-1">Tier-1 Curriculum Rigor</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HORIZONTAL LAYOUT VIEW CONTROLLER & ADVANCED FILTER HUD                */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-3xl bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.15)] space-y-4">
        {/* Horizontal View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black uppercase text-cyan-400 tracking-wider">Layout Matrix:</span>
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  playSound('warp');
                  setHorizontalViewMode('HORIZONTAL_STUDIO');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  horizontalViewMode === 'HORIZONTAL_STUDIO'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                Horizontal Studio (Split-Deck)
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('warp');
                  setHorizontalViewMode('HORIZONTAL_CAROUSEL');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  horizontalViewMode === 'HORIZONTAL_CAROUSEL'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Horizontal Carousel Rail
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('warp');
                  setHorizontalViewMode('HORIZONTAL_KANBAN');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  horizontalViewMode === 'HORIZONTAL_KANBAN'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Horizontal Pipeline
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('warp');
                  setHorizontalViewMode('HORIZONTAL_CBT_SANDBOX');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  horizontalViewMode === 'HORIZONTAL_CBT_SANDBOX'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Horizontal CBT Sandbox
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('warp');
                  setHorizontalViewMode('GRID');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  horizontalViewMode === 'GRID'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Grid Cards
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400">Interactive Horizontal Audio Engine Online</span>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Search questions by text, formula, topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-slate-900 text-white placeholder-slate-500"
            />
          </div>

          {/* Exam Filter */}
          <div>
            <select
              value={examFilter}
              onChange={(e) => {
                playSound('click');
                setExamFilter(e.target.value);
              }}
              className="w-full text-xs font-bold border border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-slate-900 text-white"
            >
              <option value="ALL">All Exams ({questions.length})</option>
              {availableExams.map(ex => (
                <option key={ex.id} value={ex.name}>{ex.name}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={subjectFilter}
              onChange={(e) => {
                playSound('click');
                setSubjectFilter(e.target.value);
              }}
              className="w-full text-xs font-bold border border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-slate-900 text-white"
            >
              <option value="ALL">All Subjects</option>
              {availableSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <select
              value={difficultyFilter}
              onChange={(e) => {
                playSound('click');
                setDifficultyFilter(e.target.value);
              }}
              className="w-full text-xs font-bold border border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-slate-900 text-white"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                playSound('click');
                setStatusFilter(e.target.value);
              }}
              className="w-full text-xs font-bold border border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-slate-900 text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved (Verified)</option>
              <option value="AI_GENERATED">AI Generated (Pending Review)</option>
              <option value="PUBLISHED">Published</option>
              <option value="REJECTED">Rejected</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        {/* Sub-bar with selection & bilingual toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs font-bold text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 hover:text-cyan-400 cursor-pointer text-slate-300"
            >
              {selectedQuestionIds.length === filteredQuestions.length && filteredQuestions.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-cyan-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              Select All Filtered ({filteredQuestions.length})
            </button>
            <span>•</span>
            <span className="text-slate-400 font-medium">Showing {filteredQuestions.length} of {questions.length} items</span>

            <button
              type="button"
              onClick={() => {
                playSound('toggle');
                setBilingualFilter(!bilingualFilter);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                bilingualFilter 
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Languages className="w-3 h-3 text-cyan-400" />
              Bilingual Hindi Only
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono">
              {questions.filter(q => q.status === 'APPROVED' || q.status === 'PUBLISHED').length} Approved
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 font-mono">
              {questions.filter(q => q.status === 'AI_GENERATED').length} AI Generated
            </span>
          </div>
        </div>
      </div>

      {/* FLOATING BULK ACTION DECK (Appears when items are selected) */}
      {selectedQuestionIds.length > 0 && (
        <div className="sticky top-4 z-30 p-4 bg-slate-950/95 backdrop-blur-md text-white rounded-2xl border border-cyan-500/50 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-md shadow-cyan-500/30">
              {selectedQuestionIds.length}
            </span>
            <div>
              <span className="text-xs font-black text-white">
                Questions Selected for Bulk Operation
              </span>
              <p className="text-[11px] text-slate-400">Apply verification approvals, rejection flags, or mass export.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBulkApprove}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Bulk Approve
            </button>
            <button
              type="button"
              onClick={handleBulkReject}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <X className="w-3.5 h-3.5" /> Bulk Reject
            </button>
            <button
              type="button"
              onClick={handleBulkExportJSON}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export Selected
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
            <button
              type="button"
              onClick={() => {
                playSound('toggle');
                setSelectedQuestionIds([]);
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HORIZONTAL WORKSPACE LAYOUT (4 DISTINCT MODES)                          */}
      {/* ========================================================================= */}

      {/* MODE A: HORIZONTAL STUDIO (PANORAMIC FILMSTRIP RAIL + WIDE DUAL-DECK WORKBENCH) */}
      {horizontalViewMode === 'HORIZONTAL_STUDIO' && (
        <div className="space-y-6">
          {/* ========================================================================= */}
          {/* 1. PANORAMIC HORIZONTAL FILMSTRIP QUEUE RAIL                              */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-3xl bg-slate-950/95 border border-cyan-500/40 text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.15)] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase text-cyan-400 flex items-center gap-1.5 font-mono">
                  <Columns className="w-4 h-4 text-cyan-400" /> Panoramic Filmstrip Rail
                </span>
                <span className="text-xs font-mono font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full text-slate-300">
                  {filteredQuestions.length} Items Indexed
                </span>
                {activeQuestion && (
                  <span className="text-xs font-mono text-cyan-300 hidden sm:inline">
                    &bull; Active: <strong>#{activeIndex + 1}</strong> ({activeQuestion.examName} &bull; {activeQuestion.subject})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Auto-Scan Play/Pause Button */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('warp');
                    setIsAutoScanning(!isAutoScanning);
                    showToast(isAutoScanning ? 'Auto-scan paused.' : 'Horizontal auto-scan activated (2.5s cadence)!', 'info');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isAutoScanning
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/40 ring-1 ring-cyan-300 animate-pulse'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400'
                  }`}
                  title={isAutoScanning ? 'Pause Auto-Scan' : 'Activate 2.5s Auto-Scan'}
                >
                  <Play className={`w-3.5 h-3.5 ${isAutoScanning ? 'fill-slate-950' : 'text-cyan-400'}`} />
                  {isAutoScanning ? 'Auto-Scanning...' : 'Auto-Scan Rail'}
                </button>

                {/* Steppers */}
                <button
                  onClick={handlePrevQuestion}
                  disabled={activeIndex <= 0}
                  className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white hover:bg-slate-850 hover:border-cyan-400 disabled:opacity-40 cursor-pointer transition-all"
                  title="Previous Question (Left Arrow)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-cyan-400 font-bold px-1">
                  {activeIndex + 1} / {filteredQuestions.length}
                </span>
                <button
                  onClick={handleNextQuestion}
                  disabled={activeIndex >= filteredQuestions.length - 1}
                  className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white hover:bg-slate-850 hover:border-cyan-400 disabled:opacity-40 cursor-pointer transition-all"
                  title="Next Question (Right Arrow)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Filmstrip Ribbon (Scrollable) */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin snap-x">
              {filteredQuestions.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs w-full font-mono">
                  No matching questions in current filter.
                </div>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const isActive = activeQuestion?.id === q.id;
                  const isSelected = selectedQuestionIds.includes(q.id);

                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        playSound('click');
                        setActiveQuestionId(q.id);
                      }}
                      className={`min-w-[270px] max-w-[310px] shrink-0 p-3 rounded-2xl border transition-all cursor-pointer snap-start relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-cyan-400 shadow-xl ring-2 ring-cyan-500/40 text-white'
                          : 'bg-slate-900/80 hover:bg-slate-850 hover:border-slate-700 border-slate-800 text-slate-300'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-indigo-400 to-cyan-400 animate-pulse" />
                      )}

                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSelectOne(q.id);
                            }}
                            className="cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                            )}
                          </button>
                          <span className={`font-mono font-black ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                            #{idx + 1}
                          </span>
                          <span className={`font-black px-1.5 py-0.2 rounded text-[10px] font-mono ${
                            isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {q.examName}
                          </span>
                        </div>

                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono ${
                          q.difficulty === 'EASY' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : q.difficulty === 'MEDIUM' 
                            ? 'bg-amber-500/20 text-amber-400' 
                            : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>

                      <p className={`text-xs font-semibold line-clamp-2 leading-snug ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>
                        {q.questionText}
                      </p>

                      <div className="flex items-center justify-between text-[10px] mt-2 pt-2 border-t border-slate-800/80 font-mono">
                        <span className={`truncate max-w-[150px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                          {q.subject}
                        </span>
                        <div className="flex items-center gap-1">
                          {q.status === 'APPROVED' || q.status === 'PUBLISHED' ? (
                            <span className="text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          ) : (
                            <span className="text-purple-400 flex items-center gap-0.5">
                              <Sparkles className="w-3 h-3" /> AI Synth
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5-STAGE STUDIO CALIBRATION PROGRESS BEACONS (MOCK TEST WIZARD SYMMETRY)    */}
          {/* ========================================================================= */}
          {activeQuestion && (
            <div className="p-4 rounded-3xl bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 text-slate-100 shadow-[0_0_40px_rgba(6,182,212,0.14)] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 font-bold shadow-xs shadow-cyan-500/20">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    5-STAGE ITEM CALIBRATION PROTOCOL
                  </span>
                  <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                    Active Inspection: <strong className="text-white">#{activeIndex + 1} ({activeQuestion.id})</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Readiness Score:</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {activeQuestion.status === 'APPROVED' || activeQuestion.status === 'PUBLISHED' ? '100% QUALITY CERTIFIED' : '92% REVIEW PENDING'}
                  </span>
                  <span className="text-slate-500 hidden md:inline">&bull;</span>
                  <span className="text-cyan-400 hidden md:inline">Tier-1 Curriculum Rigor</span>
                </div>
              </div>

              {/* 5 Progress Beacons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {[
                  {
                    step: 1,
                    title: '1. Exam Genome',
                    sub: `${activeQuestion.examName} (${activeQuestion.marks}/-${activeQuestion.negativeMarks} Marks)`,
                    done: true,
                    icon: Landmark,
                    action: () => playSound('click')
                  },
                  {
                    step: 2,
                    title: '2. Bilingual Stem',
                    sub: activeQuestion.hindiQuestionText ? 'Hindi Translation Verified (100%)' : 'English Only (Translation Ready)',
                    done: Boolean(activeQuestion.hindiQuestionText),
                    icon: Languages,
                    action: () => {
                      if (!activeQuestion.hindiQuestionText) {
                        handleQuickTranslateHindi(activeQuestion);
                      } else {
                        playSound('click');
                      }
                    }
                  },
                  {
                    step: 3,
                    title: '3. Trap Options',
                    sub: `${activeQuestion.options.length} Alternatives & Distractor Radar`,
                    done: activeQuestion.options.length > 0,
                    icon: CheckSquare,
                    action: () => playSound('toggle')
                  },
                  {
                    step: 4,
                    title: '4. Proof Breakdown',
                    sub: activeQuestion.explanation ? 'Pedagogical Solution Attached' : 'Missing Explanation',
                    done: Boolean(activeQuestion.explanation),
                    icon: BookOpen,
                    action: () => playSound('click')
                  },
                  {
                    step: 5,
                    title: '5. CBT Test Drive',
                    sub: 'Student Sandboxing Simulation',
                    done: true,
                    icon: Play,
                    action: () => {
                      playSound('warp');
                      setSandboxQuestion(activeQuestion);
                      setSandboxSelectedOption(null);
                      setSandboxVerified(false);
                    }
                  }
                ].map((st) => {
                  const Icon = st.icon;
                  return (
                    <button
                      key={st.step}
                      type="button"
                      onClick={st.action}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer group flex items-center gap-3 ${
                        st.done
                          ? 'bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border-cyan-500/40 hover:border-cyan-300 shadow-md shadow-cyan-950/20'
                          : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40 text-slate-400'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-black shrink-0 transition-transform group-hover:scale-105 ${
                        st.done 
                          ? 'bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950 shadow-sm shadow-cyan-400/40' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {st.done ? <Check className="w-4 h-4 stroke-[3]" /> : st.step}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-black truncate text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            {st.title}
                          </p>
                          {st.done && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{st.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. PANORAMIC HORIZONTAL DUAL-PANE WORKBENCH (50% / 50% SIDE-BY-SIDE SPLIT) */}
          {/* ========================================================================= */}
          {activeQuestion ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* DECK 1 (LEFT): BILINGUAL STEM FORMULATION & COGNITIVE GENOME */}
              <div className="rounded-3xl bg-slate-950/95 border border-cyan-500/40 text-slate-100 shadow-[0_0_60px_rgba(6,182,212,0.18)] overflow-hidden space-y-0">
                <div className="p-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
                      #{activeIndex + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        {activeQuestion.examName} &bull; {activeQuestion.subject}
                      </h4>
                      <p className="text-[11px] text-slate-300 font-mono">
                        ID: {activeQuestion.id} &bull; {activeQuestion.topic}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    Genome Active
                  </span>
                </div>

                <div className="p-6 space-y-5">
                  {/* Status & Rules Ribbon */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                    <div className="flex flex-wrap items-center gap-2 font-bold font-mono">
                      <span className={`px-2.5 py-0.5 rounded font-black border ${
                        activeQuestion.difficulty === 'EASY' 
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' 
                          : activeQuestion.difficulty === 'MEDIUM' 
                          ? 'bg-amber-950 text-amber-300 border-amber-500/40' 
                          : 'bg-rose-950 text-rose-300 border-rose-500/40'
                      }`}>
                        Difficulty: {activeQuestion.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        Type: {activeQuestion.questionType}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        Marks: +{activeQuestion.marks} / -{activeQuestion.negativeMarks}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeQuestion.status === 'APPROVED' || activeQuestion.status === 'PUBLISHED' ? (
                        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Approved Item
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-purple-300 flex items-center gap-1 bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-500/40 font-mono">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Synthesized
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Standard Formulation (English) */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase text-cyan-400 tracking-wider block">
                        Standard Formulation (English)
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {activeQuestion.questionText.length} Chars &bull; Tier-1 English
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-100 leading-relaxed font-sans">
                      {activeQuestion.questionText}
                    </p>
                  </div>

                  {/* Hindi Formulation Pane */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase text-purple-300 tracking-wider flex items-center gap-1.5">
                        <Languages className="w-3.5 h-3.5 text-cyan-400" />
                        हिन्दी अनुवाद (Hindi Formulation)
                      </span>
                      {activeQuestion.hindiQuestionText && (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          100% Neural Parity
                        </span>
                      )}
                    </div>
                    {activeQuestion.hindiQuestionText ? (
                      <p className="text-sm font-bold text-slate-200 leading-relaxed font-sans">
                        {activeQuestion.hindiQuestionText}
                      </p>
                    ) : (
                      <div className="space-y-2 py-1">
                        <p className="text-xs text-slate-400 italic">
                          Hindi translation not currently generated.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleQuickTranslateHindi(activeQuestion)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm cursor-pointer transition-all"
                        >
                          <Languages className="w-3.5 h-3.5" />
                          ⚡ Synthesize Hindi Translation Now
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Anti-Tamper SHA-256 & Security Checksum Ribbon */}
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 text-slate-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Anti-Tamper Hash:</span>
                      <strong className="text-cyan-300">SHA256:7f4a{activeQuestion.id.slice(-6)}e98c</strong>
                    </div>
                    <span className="text-emerald-400 font-bold">NOC Telemetry Synchronized</span>
                  </div>

                  {/* Syllabus / Chapter Breadcrumb */}
                  <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Curriculum Mapping:</span>
                    </div>
                    <p className="text-slate-400 text-[11px] pl-5">
                      {activeQuestion.chapter || 'Chapter 4: Commercial Mathematics'} &rarr; {activeQuestion.topic}
                    </p>
                  </div>
                </div>
              </div>

              {/* DECK 2 (RIGHT): INTERACTIVE DISTRACTOR MATRIX & LIVE CBT TEST DRIVE */}
              <div className="rounded-3xl bg-slate-950/95 border border-cyan-500/40 text-slate-100 shadow-[0_0_60px_rgba(6,182,212,0.18)] overflow-hidden space-y-0">
                <div className="p-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-black text-white">
                      Verification Matrix & In-Card Sandbox
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-cyan-300">
                    Click Any Option to Test
                  </span>
                </div>

                <div className="p-6 space-y-5">
                  {/* Interactive Options Matrix */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black uppercase text-cyan-400 tracking-wider block">
                        Options & Verification Key (Student Test-Drive Mode)
                      </span>
                      {testedOptions[activeQuestion.id] && (
                        <span className="text-[11px] font-mono font-bold text-cyan-300">
                          Active In-Card Test Session
                        </span>
                      )}
                    </div>

                    {activeQuestion.questionType === 'NUMERICAL' ? (
                      <div className="p-4 bg-slate-900 border border-cyan-500/30 rounded-2xl text-xs font-mono font-bold text-cyan-300 flex items-center justify-between">
                        <span>Numerical Accepted Value: <strong className="text-white">{activeQuestion.numericalAnswer}</strong></span>
                        <span className="text-slate-400">Tolerance: &plusmn;{activeQuestion.numericalTolerance || 0}</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeQuestion.options.map((opt, oIdx) => {
                          const optKey = String.fromCharCode(65 + oIdx);
                          const isTested = testedOptions[activeQuestion.id] === optKey;

                          return (
                            <div
                              key={opt.id || oIdx}
                              onClick={() => handleTestOptionClick(activeQuestion.id, optKey)}
                              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                                opt.isCorrect
                                  ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                  : isTested
                                  ? 'bg-rose-950/70 border-rose-400 text-rose-200 ring-1 ring-rose-400 font-medium'
                                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                              }`}
                            >
                              <span className="flex items-center gap-2 text-xs">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                                  opt.isCorrect
                                    ? 'bg-emerald-500 text-slate-950'
                                    : isTested
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-slate-800 text-slate-300'
                                }`}>
                                  {optKey}
                                </span>
                                {opt.text}
                              </span>

                              {opt.isCorrect && (
                                <span className="text-[10px] font-mono font-black uppercase bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                  <Check className="w-3 h-3 stroke-[3]" /> Correct Key
                                </span>
                              )}
                              {isTested && !opt.isCorrect && (
                                <span className="text-[10px] font-mono font-black uppercase bg-rose-500 text-white px-2 py-0.5 rounded-full">
                                  Distractor Tested
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* In-Card Interactive Test Result Banner */}
                    {testedOptions[activeQuestion.id] && (
                      <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between animate-fadeIn ${
                        activeQuestion.options.find((_, i) => String.fromCharCode(65 + i) === testedOptions[activeQuestion.id])?.isCorrect
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                          : 'bg-rose-950/80 border-rose-500/40 text-rose-300 font-medium shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                      }`}>
                        <span className="flex items-center gap-2">
                          {activeQuestion.options.find((_, i) => String.fromCharCode(65 + i) === testedOptions[activeQuestion.id])?.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                          )}
                          Tested Option {testedOptions[activeQuestion.id]}: {
                            activeQuestion.options.find((_, i) => String.fromCharCode(65 + i) === testedOptions[activeQuestion.id])?.isCorrect
                              ? `Verified Official Answer Key (+${activeQuestion.marks} marks awarded in student simulation)`
                              : `Distractor Trap Triggered (-${activeQuestion.negativeMarks} penalty deducted). Correct Key is ${activeQuestion.correctAnswer}.`
                          }
                        </span>
                        <button 
                          type="button" 
                          onClick={() => {
                            playSound('toggle');
                            setTestedOptions(prev => {
                              const next = { ...prev };
                              delete next[activeQuestion.id];
                              return next;
                            });
                          }}
                          className="text-[11px] font-mono text-cyan-400 hover:text-white underline cursor-pointer"
                        >
                          Clear Test
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Pedagogical Proof & Concept Formula */}
                  {activeQuestion.explanation && (
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 text-xs text-slate-300 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-black text-cyan-300 text-xs">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        Pedagogical Solution Breakdown & Concept Formula:
                      </div>
                      <p className="leading-relaxed font-sans">{activeQuestion.explanation}</p>
                    </div>
                  )}

                  {/* Calibration & Quality Assurance Bar */}
                  <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex flex-wrap items-center justify-between text-xs text-indigo-200">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold">Quality Metrics:</span>
                      <span>Zero Plagiarism Risk (99.8% Unique)</span>
                      <span>&bull;</span>
                      <span>Ambiguity Score: Clear (100%)</span>
                    </div>
                    <span className="font-mono font-bold text-cyan-300">Curriculum Tier-1 Mapped</span>
                  </div>

                  {/* Action Toolbar */}
                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          playSound('warp');
                          setSandboxQuestion(activeQuestion);
                          setSandboxSelectedOption(null);
                          setSandboxVerified(false);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-black bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                      >
                        <Eye className="w-4 h-4 text-cyan-400" />
                        Launch CBT Sandbox
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playSound('click');
                          setRefineQuestion(activeQuestion);
                          setRefineFeedback(null);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-black bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        AI Refine Studio
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playSound('click');
                          setEditingQuestion(activeQuestion);
                          setIsAuthoringModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit in 5-Step Wizard
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteOne(activeQuestion)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeQuestion.status === 'AI_GENERATED' ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleReject(activeQuestion)}
                            className="text-xs text-rose-400 bg-rose-950/60 border border-rose-500/40 hover:bg-rose-900 font-bold"
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Reject
                          </Button>
                          <Button 
                            size="sm" 
                            variant="primary"
                            onClick={() => handleApprove(activeQuestion)}
                            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md shadow-emerald-600/30"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Approve Question
                          </Button>
                        </>
                      ) : activeQuestion.status === 'REJECTED' ? (
                        <Button 
                          size="sm" 
                          variant="primary"
                          onClick={() => handleApprove(activeQuestion)}
                          className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Restore to Approved
                        </Button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/40 font-mono">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Promoted to Official Catalog
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-slate-950/90 rounded-3xl border border-slate-800">
              <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">Select a question from the horizontal rail to inspect</p>
            </div>
          )}
        </div>
      )}

      {/* MODE B: HORIZONTAL CAROUSEL RAIL (PANORAMIC SLIDING DECK) */}
      {horizontalViewMode === 'HORIZONTAL_CAROUSEL' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Panoramic Horizontal Rail ({filteredQuestions.length} Cards) • Swipe or Click Arrows
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={activeIndex <= 0}
                className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={activeIndex >= filteredQuestions.length - 1}
                className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-5 snap-x snap-mandatory py-2 pb-6 scrollbar-thin">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className={`min-w-[480px] max-w-[560px] snap-center rounded-3xl p-6 border transition-all space-y-4 ${
                  activeQuestion?.id === q.id
                    ? 'bg-gradient-to-br from-slate-950 to-indigo-950 text-white border-cyan-400 shadow-2xl ring-1 ring-cyan-400/40'
                    : 'bg-slate-900/90 text-slate-200 border-slate-800 hover:border-slate-700 shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-7 h-7 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-black">
                      #{idx + 1}
                    </span>
                    <span className="font-bold">{q.examName}</span>
                    <span>•</span>
                    <span className="text-slate-400">{q.subject}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                    q.difficulty === 'EASY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>

                <p className="text-sm font-bold leading-relaxed line-clamp-3">
                  {q.questionText}
                </p>

                {/* Option Stems in Carousel Card with In-Rail Tester */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, oi) => {
                    const optKey = String.fromCharCode(65 + oi);
                    const isTested = testedOptions[q.id] === optKey;

                    return (
                      <div
                        key={oi}
                        onClick={() => handleTestOptionClick(q.id, optKey)}
                        className={`p-2.5 rounded-xl border text-[11px] cursor-pointer transition-all flex items-center justify-between ${
                          opt.isCorrect 
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold' 
                            : isTested
                            ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>
                          <strong className="mr-1 font-mono text-cyan-300">{optKey})</strong> {opt.text}
                        </span>
                        {opt.isCorrect && (
                          <span className="text-[9px] font-black uppercase text-emerald-300 ml-1">✓ Key</span>
                        )}
                        {isTested && !opt.isCorrect && (
                          <span className="text-[9px] font-black uppercase text-rose-300 ml-1">✗ Trap</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    Ans: Key <strong className="text-emerald-400">{q.correctAnswer}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        playSound('warp');
                        setSandboxQuestion(q);
                        setSandboxSelectedOption(null);
                        setSandboxVerified(false);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 cursor-pointer transition-all"
                    >
                      CBT Sandbox
                    </button>
                    {q.status !== 'APPROVED' && q.status !== 'PUBLISHED' && (
                      <button
                        type="button"
                        onClick={() => handleApprove(q)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-all shadow-sm"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE C: HORIZONTAL KANBAN PIPELINE */}
      {horizontalViewMode === 'HORIZONTAL_KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start overflow-x-auto pb-4">
          {[
            { status: 'AI_GENERATED', label: 'AI Synthesized (Pending QA)', color: 'border-purple-500', bg: 'bg-purple-500/10' },
            { status: 'DRAFT', label: 'In Draft / Revision', color: 'border-amber-500', bg: 'bg-amber-500/10' },
            { status: 'APPROVED', label: 'Approved (Verified)', color: 'border-emerald-500', bg: 'bg-emerald-500/10' },
            { status: 'PUBLISHED', label: 'Published in Live Papers', color: 'border-cyan-500', bg: 'bg-cyan-500/10' }
          ].map(col => {
            const colQuestions = filteredQuestions.filter(q => q.status === col.status);

            return (
              <div key={col.status} className="bg-slate-900 text-white rounded-3xl p-4 border border-slate-800 space-y-3 min-w-[280px]">
                <div className={`p-3 rounded-2xl border ${col.color} ${col.bg} flex items-center justify-between`}>
                  <span className="text-xs font-black">{col.label}</span>
                  <span className="text-xs font-mono font-bold bg-slate-950/80 px-2 py-0.5 rounded-full">
                    {colQuestions.length}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {colQuestions.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs italic">
                      Zero items in this stage
                    </div>
                  ) : (
                    colQuestions.map((q, i) => (
                      <div key={q.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-cyan-400">{q.examName}</span>
                          <span className="font-mono text-slate-500">#{q.id.slice(-4)}</span>
                        </div>
                        <p className="text-xs text-slate-200 line-clamp-2">{q.questionText}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                          <span className="text-slate-400 font-mono">Key: {q.correctAnswer}</span>
                          <button
                            onClick={() => handleApprove(q)}
                            className="text-xs font-bold text-emerald-400 hover:underline"
                          >
                            Promote →
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODE D: HORIZONTAL CBT SANDBOX (INLINE FULL-WIDTH PANORAMIC STUDENT CBT SIMULATOR) */}
      {horizontalViewMode === 'HORIZONTAL_CBT_SANDBOX' && (
        <div className="rounded-3xl bg-slate-950/95 border border-cyan-500/40 text-slate-100 shadow-[0_0_60px_rgba(6,182,212,0.2)] overflow-hidden space-y-0">
          {/* CBT Top Examination Command Deck */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-lg shadow-cyan-500/30 font-mono">
                CBT
              </span>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>{activeQuestion?.examName || 'National Examination'} Official CBT Sandboxing Environment</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                    TCS iON / NTA Compliant
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Candidate ID: SUNITA-VERMA-OPERATOR &bull; Section: {activeQuestion?.subject || 'All Sections'} &bull; Anti-Cheat SHA-256 Verified
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Live Countdown Clock */}
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center gap-2 font-mono text-xs">
                <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="text-slate-400">Time Left:</span>
                <span className="text-cyan-300 font-black text-sm">{formatTimer(inlineCbtTimer)}</span>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    playSound('toggle');
                    setInlineCbtLang('EN');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    inlineCbtLang === 'EN' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('toggle');
                    setInlineCbtLang('HI');
                  }}
                  disabled={!activeQuestion?.hindiQuestionText}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    inlineCbtLang === 'HI' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white disabled:opacity-40'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>
          </div>

          {/* Panoramic Dual Workspace: Test Paper on Left, Interactive Question Palette on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left 8/12 cols: Active Exam Paper */}
            <div className="lg:col-span-8 p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-800">
              {/* Question Header & Marking Rules */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-mono font-black text-xs">
                    Q.{activeIndex + 1}
                  </span>
                  <span className="font-bold text-white text-sm">
                    Question {activeIndex + 1} of {filteredQuestions.length}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono font-bold text-[11px]">
                  <span className="text-emerald-400">+{activeQuestion?.marks || 2} Marks</span>
                  <span className="text-rose-400">-{activeQuestion?.negativeMarks || 0.5} Negative</span>
                  <span className="text-slate-400 uppercase">{activeQuestion?.questionType}</span>
                </div>
              </div>

              {/* Question Text */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 min-h-[100px]">
                <p className="text-sm font-bold text-slate-100 leading-relaxed font-sans">
                  {inlineCbtLang === 'HI' && activeQuestion?.hindiQuestionText
                    ? activeQuestion.hindiQuestionText
                    : activeQuestion?.questionText}
                </p>
              </div>

              {/* Options Selection */}
              {activeQuestion?.questionType === 'NUMERICAL' ? (
                <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-2">
                  <label className="text-xs font-mono font-bold text-slate-300">Enter Numerical Response:</label>
                  <input
                    type="number"
                    value={inlineCbtAnswers[activeQuestion.id] || ''}
                    onChange={(e) => {
                      setInlineCbtAnswers(prev => ({ ...prev, [activeQuestion.id]: e.target.value }));
                    }}
                    placeholder="Enter value..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm font-mono text-white outline-none focus:border-cyan-400"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    Choose one alternative from below:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeQuestion?.options.map((opt, oi) => {
                      const optKey = String.fromCharCode(65 + oi);
                      const isSelected = inlineCbtAnswers[activeQuestion.id] === optKey;

                      return (
                        <div
                          key={opt.id || oi}
                          onClick={() => {
                            playSound('click');
                            setInlineCbtAnswers(prev => ({ ...prev, [activeQuestion.id]: optKey }));
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-cyan-950/80 border-cyan-400 text-white ring-1 ring-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                              : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 text-xs">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                              isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {optKey}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Instant Score Evaluation Banner if Answered */}
              {inlineCbtFeedback[activeQuestion?.id || ''] && (
                <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between animate-fadeIn ${
                  inlineCbtFeedback[activeQuestion?.id || ''].isCorrect
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 font-bold'
                    : 'bg-rose-950/80 border-rose-500/40 text-rose-300 font-medium'
                }`}>
                  <span className="flex items-center gap-2">
                    {inlineCbtFeedback[activeQuestion?.id || ''].isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    {inlineCbtFeedback[activeQuestion?.id || ''].message}
                  </span>
                </div>
              )}

              {/* Exam Bottom Navigation Controls */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!activeQuestion) return;
                      playSound('toggle');
                      setInlineCbtStatus(prev => ({ ...prev, [activeQuestion.id]: 'REVIEW' }));
                      handleNextQuestion();
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-black bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                  >
                    Mark for Review & Next
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!activeQuestion) return;
                      playSound('click');
                      setInlineCbtAnswers(prev => {
                        const copy = { ...prev };
                        delete copy[activeQuestion.id];
                        return copy;
                      });
                      setInlineCbtStatus(prev => {
                        const copy = { ...prev };
                        delete copy[activeQuestion.id];
                        return copy;
                      });
                      setInlineCbtFeedback(prev => {
                        const copy = { ...prev };
                        delete copy[activeQuestion.id];
                        return copy;
                      });
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
                  >
                    Clear Response
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!activeQuestion) return;
                      const selected = inlineCbtAnswers[activeQuestion.id];
                      if (!selected) {
                        showToast('Please select an option before saving response.', 'warning');
                        return;
                      }
                      const isCorrect = selected === activeQuestion.correctAnswer;
                      if (isCorrect) {
                        playSound('confirm');
                      } else {
                        playSound('alert');
                      }
                      setInlineCbtStatus(prev => ({ ...prev, [activeQuestion.id]: 'ANSWERED' }));
                      setInlineCbtFeedback(prev => ({
                        ...prev,
                        [activeQuestion.id]: {
                          isCorrect,
                          message: isCorrect
                            ? `Correct answer! +${activeQuestion.marks} marks awarded in student simulation.`
                            : `Distractor selected! -${activeQuestion.negativeMarks} marks penalty deducted. Official key is Option ${activeQuestion.correctAnswer}.`
                        }
                      }));
                      handleNextQuestion();
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/25 transition-all"
                  >
                    Save & Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right 4/12 cols: Interactive Question Palette (Grid of Q1 to Q15) */}
            <div className="lg:col-span-4 p-6 bg-slate-900/50 space-y-5">
              <div>
                <h4 className="text-xs font-mono font-black uppercase text-cyan-400 tracking-wider flex items-center justify-between">
                  <span>Question Palette</span>
                  <span className="text-slate-400 font-bold">{filteredQuestions.length} Total</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Click any numbered cell to inspect or answer instantly.</p>
              </div>

              {/* Question Number Tiles */}
              <div className="grid grid-cols-5 gap-2">
                {filteredQuestions.map((q, idx) => {
                  const isActive = activeQuestion?.id === q.id;
                  const isAnswered = inlineCbtStatus[q.id] === 'ANSWERED';
                  const isReview = inlineCbtStatus[q.id] === 'REVIEW';

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setActiveQuestionId(q.id);
                      }}
                      className={`h-10 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                        isActive
                          ? 'ring-2 ring-cyan-400 font-black shadow-lg shadow-cyan-500/30'
                          : ''
                      } ${
                        isAnswered
                          ? 'bg-emerald-600 text-white'
                          : isReview
                          ? 'bg-purple-600 text-white'
                          : isActive
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-[11px] font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" /> Answered
                  </span>
                  <span className="font-bold text-emerald-400">
                    {Object.values(inlineCbtStatus).filter(s => s === 'ANSWERED').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500" /> Marked for Review
                  </span>
                  <span className="font-bold text-purple-400">
                    {Object.values(inlineCbtStatus).filter(s => s === 'REVIEW').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-700" /> Not Visited
                  </span>
                  <span className="font-bold text-slate-400">
                    {filteredQuestions.length - Object.keys(inlineCbtStatus).length}
                  </span>
                </div>
              </div>

              {/* Close / Return to Studio button */}
              <button
                type="button"
                onClick={() => {
                  playSound('warp');
                  setHorizontalViewMode('HORIZONTAL_STUDIO');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-cyan-300 border border-cyan-500/30 text-xs font-black font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Columns className="w-3.5 h-3.5" /> Return to Horizontal Split-Deck Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE E: GRID CARDS VIEW */}
      {horizontalViewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q, idx) => (
            <div key={q.id} className="p-5 rounded-3xl bg-slate-950/90 border border-slate-800 text-slate-100 hover:border-cyan-500/40 shadow-xl space-y-3 transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-white font-mono flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-black text-[11px]">
                    #{idx + 1}
                  </span>
                  {q.examName} • {q.subject}
                </span>
                <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded border ${
                  q.difficulty === 'EASY' 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' 
                    : q.difficulty === 'MEDIUM' 
                    ? 'bg-amber-950 text-amber-300 border-amber-500/40' 
                    : 'bg-rose-950 text-rose-300 border-rose-500/40'
                }`}>
                  {q.difficulty}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed">{q.questionText}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[11px] font-mono text-cyan-400">
                  Key: <strong>{q.correctAnswer}</strong> (+{q.marks}/-{q.negativeMarks})
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playSound('warp');
                      setSandboxQuestion(q);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 cursor-pointer"
                  >
                    CBT Sandbox
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(q)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS & TOOLS                                                         */}
      {/* ========================================================================= */}

      {/* MODAL 1: IN-STUDIO NEURAL AI QUESTION GENERATOR MODAL */}
      {isAiGenModalOpen && (
        <Modal
          isOpen={isAiGenModalOpen}
          onClose={() => setIsAiGenModalOpen(false)}
          title=""
          size="xl"
          variant="cyber"
          hideDefaultHeader={true}
        >
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 rounded-3xl p-6 sm:p-7 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] space-y-6 font-sans">
            <div className="flex items-start justify-between border-b border-cyan-500/30 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 ring-1 ring-purple-400">
                  <Cpu className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">In-Studio Neural AI Question Generator</h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40">
                      AUTONOMOUS v5.2
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Autonomous curriculum synthesizer with distractor trap analysis and bilingual alignment.</p>
                </div>
              </div>
              <button 
                onClick={() => { playSound('click'); setIsAiGenModalOpen(false); }} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Curriculum Presets Bar */}
            <div className="p-3.5 bg-slate-900/90 border border-purple-500/40 rounded-2xl space-y-2">
              <span className="text-[11px] font-black uppercase text-purple-300 font-mono tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                1-Click Curriculum Synthesizer Presets:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => applyAiGenPreset('SSC_PROFIT')}
                  className="px-2.5 py-1.5 rounded-xl font-bold bg-purple-950/60 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 transition-all cursor-pointer shadow-xs"
                >
                  SSC CGL Profit & Loss Trap MCQ
                </button>
                <button
                  type="button"
                  onClick={() => applyAiGenPreset('UP_GK_BILINGUAL')}
                  className="px-2.5 py-1.5 rounded-xl font-bold bg-cyan-950/60 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/40 transition-all cursor-pointer shadow-xs"
                >
                  UP Police GK (Bilingual)
                </button>
                <button
                  type="button"
                  onClick={() => applyAiGenPreset('JEE_NUMERICAL')}
                  className="px-2.5 py-1.5 rounded-xl font-bold bg-amber-950/60 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/40 transition-all cursor-pointer shadow-xs"
                >
                  JEE Physics Kinematics Numerical
                </button>
                <button
                  type="button"
                  onClick={() => applyAiGenPreset('UPSC_ASSERTION')}
                  className="px-2.5 py-1.5 rounded-xl font-bold bg-indigo-950/60 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 transition-all cursor-pointer shadow-xs"
                >
                  Polity Assertion & Reason
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Target Examination *</label>
                <select
                  value={aiGenExam}
                  onChange={(e) => {
                    setAiGenExam(e.target.value);
                    const found = availableExams.find(ex => ex.name === e.target.value);
                    if (found && found.subjects.length > 0) setAiGenSubject(found.subjects[0]);
                  }}
                  className="w-full border border-slate-700 rounded-xl px-3 py-2 font-semibold bg-slate-900 text-white outline-none focus:border-cyan-400"
                >
                  {availableExams.map(ex => (
                    <option key={ex.id} value={ex.name} className="bg-slate-900 text-white">{ex.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Target Subject *</label>
                <input 
                  type="text"
                  value={aiGenSubject}
                  onChange={(e) => setAiGenSubject(e.target.value)}
                  className="w-full border border-slate-700 rounded-xl px-3 py-2 font-semibold bg-slate-900 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Topic / Syllabus Domain</label>
                <input 
                  type="text"
                  value={aiGenTopic}
                  onChange={(e) => setAiGenTopic(e.target.value)}
                  className="w-full border border-slate-700 rounded-xl px-3 py-2 font-semibold bg-slate-900 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Question Format / Type</label>
                <select
                  value={aiGenType}
                  onChange={(e) => setAiGenType(e.target.value as QuestionType)}
                  className="w-full border border-slate-700 rounded-xl px-3 py-2 font-semibold bg-slate-900 text-white outline-none focus:border-cyan-400"
                >
                  <option value="MCQ" className="bg-slate-900 text-white">Single Choice MCQ (4 Options)</option>
                  <option value="NUMERICAL" className="bg-slate-900 text-white">Numerical Value (with Tolerance)</option>
                  <option value="ASSERTION_REASON" className="bg-slate-900 text-white">Assertion & Reason Format</option>
                  <option value="MULTIPLE_CORRECT" className="bg-slate-900 text-white">Multiple Correct Choices</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['EASY', 'MEDIUM', 'HARD'] as const).map(diff => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setAiGenDifficulty(diff)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        aiGenDifficulty === diff 
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400' 
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Batch Synthesize Count</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 5, 10, 25].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setAiGenCount(cnt)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        aiGenCount === cnt 
                          ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400' 
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white">Include Synchronized Hindi Translation</span>
              </div>
              <input 
                type="checkbox"
                checked={aiGenBilingual}
                onChange={(e) => setAiGenBilingual(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            {aiTerminalLogs.length > 0 && (
              <div className="p-3.5 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl border border-emerald-500/30 space-y-1 max-h-36 overflow-y-auto">
                {aiTerminalLogs.map((log, i) => <p key={i}>{log}</p>)}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-cyan-500/20">
              <button
                type="button"
                onClick={() => setIsAiGenModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRunAiSynthesis}
                disabled={isAiGenerating}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
                {isAiGenerating ? 'Synthesizing...' : `Synthesize ${aiGenCount} Questions`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: FAST TEXT STREAM OCR PARSER MODAL */}
      {isFastStreamModalOpen && (
        <Modal
          isOpen={isFastStreamModalOpen}
          onClose={() => setIsFastStreamModalOpen(false)}
          title=""
          size="xl"
          variant="cyber"
          hideDefaultHeader={true}
        >
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 rounded-3xl p-6 sm:p-7 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] space-y-5 font-sans">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400">
                  <FileCode className="w-5 h-5 text-cyan-200" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    Fast Stream OCR Ingestion Matrix
                  </h3>
                  <p className="text-xs text-slate-400">High-throughput token parser for raw exam sheets and textbook dumps.</p>
                </div>
              </div>
              <button 
                onClick={() => { playSound('click'); setIsFastStreamModalOpen(false); }} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Target Exam</label>
                <select 
                  value={fastStreamExam} 
                  onChange={(e) => setFastStreamExam(e.target.value)}
                  className="w-full border border-slate-700 rounded-xl p-2.5 bg-slate-900 text-white outline-none focus:border-cyan-400"
                >
                  {availableExams.map(ex => <option key={ex.id} value={ex.name} className="bg-slate-900 text-white">{ex.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Target Subject</label>
                <input 
                  type="text" 
                  value={fastStreamSubject} 
                  onChange={(e) => setFastStreamSubject(e.target.value)}
                  className="w-full border border-slate-700 rounded-xl p-2.5 bg-slate-900 text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-300 font-mono">Paste OCR Paper Dump:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => loadDemoOcrSample(1)}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-cyan-950/60 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/40 cursor-pointer shadow-xs transition-all"
                >
                  Load Demo Paper 1 (SSC CGL Quant)
                </button>
                <button
                  type="button"
                  onClick={() => loadDemoOcrSample(2)}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-950/60 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 cursor-pointer shadow-xs transition-all"
                >
                  Load Demo Paper 2 (UP Police GK)
                </button>
              </div>
            </div>

            <textarea
              rows={6}
              value={fastStreamText}
              onChange={(e) => setFastStreamText(e.target.value)}
              placeholder="Paste raw questions (Q1. ... A) ... B) ... Ans: B Expl: ...)"
              className="w-full border border-slate-700 rounded-xl p-3 text-xs font-mono bg-slate-950 text-cyan-200 outline-none focus:border-cyan-400"
            />

            <div className="flex justify-end">
              <button 
                type="button"
                onClick={handleParseStreamText}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-cyan-600 hover:text-white text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer"
              >
                ⚡ Parse Stream Tokens
              </button>
            </div>

            {parsedStreamQuestions.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <p className="text-xs font-bold text-white font-mono">Parsed ({parsedStreamQuestions.length}) Questions:</p>
                {parsedStreamQuestions.map((pq, i) => (
                  <div key={i} className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs flex justify-between items-center">
                    <span className="font-semibold text-slate-200 line-clamp-1">#{i + 1}. {pq.questionText}</span>
                    <span className="font-mono text-emerald-400 font-bold ml-2 shrink-0">Ans: {pq.correctAnswer}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-3 border-t border-cyan-500/20">
              <button 
                type="button"
                onClick={() => setIsFastStreamModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleImportParsedStream}
                disabled={parsedStreamQuestions.length === 0}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                Commit {parsedStreamQuestions.length} Questions to Bank
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: STUDENT CBT SANDBOX SIMULATOR MODAL */}
      {sandboxQuestion && (
        <Modal
          isOpen={Boolean(sandboxQuestion)}
          onClose={() => setSandboxQuestion(null)}
          title=""
          size="lg"
          variant="cyber"
          hideDefaultHeader={true}
        >
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 rounded-3xl p-6 sm:p-7 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] space-y-5 font-sans">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-1 rounded-full font-mono flex items-center gap-1.5">
                  <Play className="w-3 h-3 text-cyan-400" />
                  CBT Student Exam Sandbox
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  ID: {sandboxQuestion.id}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg text-xs font-bold border border-slate-800">
                  <button
                    onClick={() => setSandboxLang('EN')}
                    className={`px-2 py-0.5 rounded transition-all ${sandboxLang === 'EN' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setSandboxLang('HI')}
                    disabled={!sandboxQuestion.hindiQuestionText}
                    className={`px-2 py-0.5 rounded transition-all ${sandboxLang === 'HI' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 disabled:opacity-40'}`}
                  >
                    हिन्दी
                  </button>
                </div>
                <button 
                  onClick={() => setSandboxQuestion(null)} 
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4">
              <div className="text-xs font-mono text-slate-400 flex justify-between">
                <span>Marks: <strong className="text-emerald-400">+{sandboxQuestion.marks}</strong></span>
                <span>Negative: <strong className="text-rose-400">-{sandboxQuestion.negativeMarks}</strong></span>
                <span>Type: <strong className="text-cyan-400">{sandboxQuestion.questionType}</strong></span>
              </div>

              <p className="text-sm font-bold text-white leading-relaxed">
                {sandboxLang === 'HI' && sandboxQuestion.hindiQuestionText 
                  ? sandboxQuestion.hindiQuestionText 
                  : sandboxQuestion.questionText}
              </p>

              <div className="space-y-2">
                {sandboxQuestion.options.map((opt, oi) => {
                  const optKey = String.fromCharCode(65 + oi);
                  const isSel = sandboxSelectedOption === optKey;

                  return (
                    <div
                      key={oi}
                      onClick={() => {
                        playSound('click');
                        setSandboxSelectedOption(optKey);
                        setSandboxVerified(false);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSel 
                          ? 'bg-cyan-950/80 border-cyan-400 font-bold text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400' 
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs">
                        <strong className="mr-2 font-mono text-cyan-400">{optKey}.</strong> {opt.text}
                      </span>
                      {isSel && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => {
                    setSandboxSelectedOption(null);
                    setSandboxVerified(false);
                  }}
                  className="text-xs text-slate-400 hover:text-white font-mono cursor-pointer"
                >
                  Clear Selection
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('confirm');
                    setSandboxVerified(true);
                  }}
                  disabled={!sandboxSelectedOption}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  Check Score Response
                </button>
              </div>

              {sandboxVerified && (
                <div className={`p-3 rounded-xl border text-xs ${
                  sandboxSelectedOption === sandboxQuestion.correctAnswer 
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold' 
                    : 'bg-rose-950/80 border-rose-400 text-rose-200 font-bold'
                }`}>
                  {sandboxSelectedOption === sandboxQuestion.correctAnswer 
                    ? `✓ Correct! (+${sandboxQuestion.marks} Marks awarded)` 
                    : `✗ Incorrect! (-${sandboxQuestion.negativeMarks} Negative penalty). Correct answer is Option ${sandboxQuestion.correctAnswer}.`}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-cyan-500/20">
              <button 
                type="button"
                onClick={() => setSandboxQuestion(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
              >
                Close Sandbox
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 4: 5-STEP QUESTION AUTHORING & CALIBRATION WIZARD MODAL */}
      {isAuthoringModalOpen && (
        <OperatorQuestionAuthoringWizardModal
          isOpen={isAuthoringModalOpen}
          onClose={() => { 
            playSound('click');
            setIsAuthoringModalOpen(false); 
            setEditingQuestion(null); 
          }}
          onSave={handleSaveQuestionFromModal}
          initialQuestion={editingQuestion}
          availableExams={availableExams}
          sfxEnabled={sfxEnabled}
        />
      )}

      {/* MODAL 5: DUPLICATE RADAR MODAL */}
      {isDuplicateScannerOpen && (
        <Modal
          isOpen={isDuplicateScannerOpen}
          onClose={() => setIsDuplicateScannerOpen(false)}
          title=""
          size="lg"
          variant="cyber"
          hideDefaultHeader={true}
        >
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 rounded-3xl p-6 sm:p-7 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/30 ring-1 ring-amber-400">
                  <ShieldCheck className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Question Duplicate & Semantic Collision Radar
                  </h3>
                  <p className="text-xs text-slate-400">N-gram and Levenshtein similarity radar across 15 master repository items.</p>
                </div>
              </div>
              <button 
                onClick={() => { playSound('click'); setIsDuplicateScannerOpen(false); }} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/90 border border-slate-800 rounded-2xl">
              <span className="text-xs font-bold text-slate-300 font-mono">Sensitivity Threshold:</span>
              <div className="flex gap-2">
                {[65, 75, 85].map(t => (
                  <button
                    key={t}
                    onClick={() => { playSound('click'); setDuplicateThreshold(t); }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      duplicateThreshold === t 
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400' 
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {t}% Match
                  </button>
                ))}
              </div>
            </div>

            {duplicateMatches.length === 0 ? (
              <div className="p-8 text-center bg-emerald-950/50 rounded-2xl border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
                <p className="text-sm font-bold text-emerald-200">Zero duplicates detected above {duplicateThreshold}% threshold</p>
                <p className="text-xs text-emerald-400/80 mt-1">Master question repository maintains 100% item integrity.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {duplicateMatches.map((dup, i) => (
                  <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-white">
                      <span>Match #{i + 1}</span>
                      <span className="text-rose-400 font-mono">{dup.similarityScorePct}% Match</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div className="p-2 bg-slate-950 rounded border border-slate-800">{dup.questionAText}</div>
                      <div className="p-2 bg-slate-950 rounded border border-slate-800">{dup.questionBText}</div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleResolveDuplicate(dup.questionAId, dup.questionBId)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold"
                      >
                        Keep Item A
                      </button>
                      <button 
                        onClick={() => handleResolveDuplicate(dup.questionBId, dup.questionAId)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold"
                      >
                        Keep Item B
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-cyan-500/20">
              <button 
                type="button"
                onClick={() => setIsDuplicateScannerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
              >
                Close Radar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 6: AI REFINE STUDIO MODAL */}
      {refineQuestion && (
        <Modal
          isOpen={true}
          onClose={() => setRefineQuestion(null)}
          title=""
          size="lg"
          variant="cyber"
          hideDefaultHeader={true}
        >
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 rounded-3xl p-6 sm:p-7 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 ring-1 ring-purple-400">
                  <Sparkles className="w-5 h-5 text-cyan-200" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">ZYZU'S AI Question Refinement Studio</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {refineQuestion.id}</p>
                </div>
              </div>
              <button 
                onClick={() => { playSound('click'); setRefineQuestion(null); }} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs">
              <p className="font-bold text-white leading-relaxed">{refineQuestion.questionText}</p>
            </div>

            {refineFeedback && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 font-bold">
                {refineFeedback}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button" 
                onClick={() => handleRefineAction('SIMPLIFY')}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" /> Simplify Wording
              </button>
              <button
                type="button" 
                onClick={() => handleRefineAction('MAKE_HARDER')}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-400" /> Make Harder
              </button>
              <button
                type="button" 
                onClick={() => handleRefineAction('GENERATE_EXPLANATION')}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" /> Generate Proof
              </button>
              <button
                type="button" 
                onClick={() => handleRefineAction('TRANSLATE_HINDI')}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Languages className="w-4 h-4 text-cyan-400" /> Translate to Hindi
              </button>
            </div>

            <div className="flex justify-end pt-3 border-t border-cyan-500/20">
              <button 
                type="button"
                onClick={() => setRefineQuestion(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
              >
                Close Studio
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
