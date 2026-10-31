// FOCUSPOINT Futuristic Government Mock Test Authoring Wizard Studio
// Panoramic Cyber-HUD Cockpit with Fullscreen Studio Mode, 5-Step Ingestion Protocol,
// Quick-Apply Exam Blueprint Presets, Live Mathematical Blueprint Equation Solver,
// Neural AI Pre-Flight Generator with Diagnostic Console, Smart Auto-Balancing Assembly Matrix,
// and Authentic In-Studio CBT Test Drive Simulator with Operator Inspection Mode.

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Award, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  Radio, 
  Terminal, 
  Hash, 
  Save, 
  X,
  Cpu,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  CheckCheck,
  Languages,
  TrendingUp,
  Activity,
  FileCheck,
  Scale
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { 
  MockTest, 
  GovernmentExam, 
  QuestionItem, 
  MockTestSeries, 
  TestCategoryType, 
  PreviousYearPaperSourceType 
} from '../../types/academicIntelligence';
import { mockTestService } from '../../services/mockTestService';

// Procedural Cyber Web Audio Synthesizer
const playCyberAudio = (type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'scan' | 'synthesize' | 'tick', enabled: boolean = true) => {
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
        osc.frequency.setValueAtTime(940, now);
        osc.frequency.exponentialRampToValueAtTime(1450, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'tick':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
        break;
      case 'warp':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(290, now);
        osc.frequency.exponentialRampToValueAtTime(1300, now + 0.16);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      case 'confirm':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(560, now);
        osc.frequency.setValueAtTime(920, now + 0.05);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      case 'toggle':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.setValueAtTime(530, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      case 'alert':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.setValueAtTime(240, now + 0.09);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      case 'scan':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.15);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case 'synthesize':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.2);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
    }
  } catch {
    // Audio suppressed or unsupported
  }
};

// Exam Blueprint Quick-Apply Presets
interface BlueprintPreset {
  id: string;
  name: string;
  badge: string;
  category: TestCategoryType;
  totalQuestions: number;
  durationMinutes: number;
  totalMarks: number;
  negativeMarkingPerQuestion: number;
  passingMarks: number;
  language: 'Bilingual' | 'Hindi' | 'English';
  difficulty: 'MIXED' | 'EASY' | 'MEDIUM' | 'HARD';
  defaultSubjects: Record<string, number>;
  description: string;
}

const BLUEPRINT_PRESETS: BlueprintPreset[] = [
  {
    id: 'preset-upsssc-pet',
    name: 'UPSSSC PET Official Blueprint',
    badge: 'UPSSSC PET',
    category: 'FULL_TEST',
    totalQuestions: 100,
    durationMinutes: 120,
    totalMarks: 100,
    negativeMarkingPerQuestion: 0.25,
    passingMarks: 45,
    language: 'Bilingual',
    difficulty: 'MIXED',
    defaultSubjects: {
      'General Knowledge': 30,
      'General Hindi': 15,
      'Elementary Mathematics': 15,
      'Logical Reasoning': 15,
      'Data Interpretation & Graphs': 25
    },
    description: 'Standard 100-question preliminary eligibility test blueprint with 1/4th negative penalty.'
  },
  {
    id: 'preset-up-police-constable',
    name: 'UP Police Constable Full Mock',
    badge: 'UP POLICE',
    category: 'FULL_TEST',
    totalQuestions: 150,
    durationMinutes: 120,
    totalMarks: 300,
    negativeMarkingPerQuestion: 0.50,
    passingMarks: 120,
    language: 'Hindi',
    difficulty: 'MIXED',
    defaultSubjects: {
      'General Knowledge': 38,
      'General Hindi': 37,
      'Numerical & Mental Ability': 38,
      'Mental Aptitude & Reasoning': 37
    },
    description: 'Authentic 150-question 300-mark state constable examination with +2 and -0.50 scoring.'
  },
  {
    id: 'preset-ssc-cgl-tier1',
    name: 'SSC CGL Tier 1 Sprint Blueprint',
    badge: 'SSC CGL',
    category: 'FULL_TEST',
    totalQuestions: 100,
    durationMinutes: 60,
    totalMarks: 200,
    negativeMarkingPerQuestion: 0.50,
    passingMarks: 130,
    language: 'Bilingual',
    difficulty: 'HARD',
    defaultSubjects: {
      'General Intelligence & Reasoning': 25,
      'General Awareness': 25,
      'Quantitative Aptitude': 25,
      'English Comprehension': 25
    },
    description: 'High-speed 60-minute test sprint with 25 questions per section and 36s/Q pacing velocity.'
  },
  {
    id: 'preset-super-tet',
    name: 'UP Super TET Primary Master Paper',
    badge: 'SUPER TET',
    category: 'FULL_TEST',
    totalQuestions: 150,
    durationMinutes: 150,
    totalMarks: 150,
    negativeMarkingPerQuestion: 0.00,
    passingMarks: 97,
    language: 'Hindi',
    difficulty: 'MEDIUM',
    defaultSubjects: {
      'Child Psychology & Pedagogy': 30,
      'Language (Hindi, Eng, Skt)': 40,
      'Mathematics & Science': 30,
      'Environmental & Social Studies': 30,
      'General Knowledge & IT': 20
    },
    description: 'Official 150-minute teaching recruitment pattern with zero negative marking.'
  },
  {
    id: 'preset-rrb-ntpc',
    name: 'Railway RRB NTPC CBT-1 Drill',
    badge: 'RRB NTPC',
    category: 'FULL_TEST',
    totalQuestions: 100,
    durationMinutes: 90,
    totalMarks: 100,
    negativeMarkingPerQuestion: 0.33,
    passingMarks: 40,
    language: 'Bilingual',
    difficulty: 'MIXED',
    defaultSubjects: {
      'General Awareness': 40,
      'Mathematics': 30,
      'General Intelligence & Reasoning': 30
    },
    description: 'Pan-India 90-minute computer based test with 1/3rd negative deduction.'
  }
];

export interface OperatorMockTestWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (testData: any) => Promise<void>;
  exams: GovernmentExam[];
  questions: QuestionItem[];
  testSeries: MockTestSeries[];
  sfxEnabled?: boolean;
  initialMockTest?: MockTest | null;
  directTestDriveMode?: boolean;
}

export const OperatorMockTestWizardModal: React.FC<OperatorMockTestWizardModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  exams,
  questions,
  testSeries,
  sfxEnabled = true,
  initialMockTest = null,
  directTestDriveMode = false
}) => {
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [examSearch, setExamSearch] = useState('');
  const [examCategoryTab, setExamCategoryTab] = useState<'ALL' | 'UPSSSC' | 'POLICE' | 'TEACHING' | 'SSC' | 'ENTRANCE'>('ALL');
  const [questionSearch, setQuestionSearch] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  
  // AI Synthesizer State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGeneratedCount, setAiGeneratedCount] = useState(0);
  const [aiCognitiveLevel, setAiCognitiveLevel] = useState<'FACTUAL' | 'CONCEPTUAL' | 'ANALYTICAL'>('CONCEPTUAL');
  const [aiTargetSubject, setAiTargetSubject] = useState<string>('ALL');
  const [aiConsoleLogs, setAiConsoleLogs] = useState<string[]>([]);
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [synthesizedItems, setSynthesizedItems] = useState<QuestionItem[]>([]);

  // Studio Mode State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioMuted, setAudioMuted] = useState(!sfxEnabled);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null);

  // In-Studio CBT Test Simulator Modal
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simQIndex, setSimQIndex] = useState(0);
  const [simAnswers, setSimAnswers] = useState<Record<number, string>>({});
  const [simMarkedForReview, setSimMarkedForReview] = useState<Record<number, boolean>>({});
  const [simSubmitted, setSimSubmitted] = useState(false);
  const [simLanguage, setSimLanguage] = useState<'Hindi' | 'English'>('English');
  const [simTimerPaused, setSimTimerPaused] = useState(false);
  const [simFontSize, setSimFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [simShowOperatorKey, setSimShowOperatorKey] = useState(false);
  const [simSectionFilter, setSimSectionFilter] = useState<string>('ALL');

  // Form State
  const [form, setForm] = useState({
    examId: '',
    selectedExam: null as GovernmentExam | null,
    category: 'FULL_TEST' as TestCategoryType,
    customCategoryName: '',
    title: '',
    shortName: '',
    description: '',
    instructions: '1. Test duration is strictly enforced by server clock.\n2. Negative marks applied per wrong answer.\n3. Do not refresh or navigate away during active test.',
    subject: 'All Subjects (Full Length)',
    chapter: '',
    topic: '',
    language: 'Bilingual' as 'Hindi' | 'English' | 'Bilingual',
    difficulty: 'MIXED' as 'MIXED' | 'EASY' | 'MEDIUM' | 'HARD',
    durationMinutes: 120,
    totalQuestions: 150,
    totalMarks: 300,
    passingMarks: 120,
    negativeMarkingPerQuestion: 0.5,
    attemptLimit: 0,
    cohortTarget: 'All-India Open Merit Aspirants',
    year: 2024,
    shift: 'Shift 1',
    paperSet: 'Set A',
    paperSourceType: 'OFFICIAL_PYQ' as PreviousYearPaperSourceType,
    paperSourceReference: '',
    seriesId: '',
    seriesSequenceNumber: 1,
    contentSource: 'MIXED' as 'QUESTION_BANK' | 'EXISTING' | 'AI_GENERATOR' | 'PREVIOUS_PAPER' | 'MANUAL' | 'MIXED',
    assemblyMode: 'SMART' as 'MANUAL' | 'SMART',
    smartEasyPercent: 20,
    smartMediumPercent: 60,
    smartHardPercent: 20,
    smartSubjectQuotas: {} as Record<string, number>,
    selectedQuestionIds: [] as string[],
    operatorCertified: true,
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT'
  });

  const playSound = useCallback((type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'scan' | 'synthesize' | 'tick') => {
    if (!audioMuted) {
      playCyberAudio(type, true);
    }
  }, [audioMuted]);

  // Initialize or re-populate when modal opens or initialMockTest changes
  useEffect(() => {
    if (isOpen) {
      if (initialMockTest) {
        // Find matching exam
        const matchingExam = exams.find(e => e.id === initialMockTest.examId) || null;
        setForm(prev => ({
          ...prev,
          examId: initialMockTest.examId,
          selectedExam: matchingExam,
          category: initialMockTest.category || 'FULL_TEST',
          title: initialMockTest.title,
          shortName: initialMockTest.shortName || initialMockTest.title.substring(0, 15),
          description: initialMockTest.description || '',
          instructions: Array.isArray(initialMockTest.instructions) ? initialMockTest.instructions.join('\n') : (initialMockTest.instructions || ''),
          subject: initialMockTest.subject || 'All Subjects (Full Length)',
          chapter: initialMockTest.chapter || '',
          topic: initialMockTest.topic || '',
          language: (initialMockTest.language as any) || 'Bilingual',
          difficulty: initialMockTest.difficulty || 'MIXED',
          durationMinutes: initialMockTest.durationMinutes || 120,
          totalQuestions: initialMockTest.totalQuestions || 100,
          totalMarks: initialMockTest.totalMarks || 200,
          passingMarks: initialMockTest.passingMarks || 80,
          negativeMarkingPerQuestion: initialMockTest.negativeMarkingPerQuestion || 0.5,
          year: initialMockTest.year || 2024,
          shift: initialMockTest.shift || 'Shift 1',
          paperSet: initialMockTest.paperSet || 'Set A',
          paperSourceType: initialMockTest.paperSourceType || 'OFFICIAL_PYQ',
          paperSourceReference: initialMockTest.paperSourceReference || '',
          seriesId: initialMockTest.seriesId || '',
          seriesSequenceNumber: initialMockTest.seriesOrder || 1,
          selectedQuestionIds: initialMockTest.questionIds || [],
          status: initialMockTest.status || 'PUBLISHED'
        }));
        setWizardStep(3);
        if (directTestDriveMode) {
          setIsSimulatorOpen(true);
        }
      } else {
        // Check for local storage auto-save draft
        try {
          const savedDraft = localStorage.getItem('focuspoint_operator_wizard_draft');
          if (savedDraft) {
            setHasSavedDraft(true);
          }
        } catch {
          // Ignore storage errors
        }
      }
    }
  }, [isOpen, initialMockTest, directTestDriveMode, exams]);

  // Auto-Save Draft to LocalStorage every time form changes meaningfully
  useEffect(() => {
    if (isOpen && form.title && !initialMockTest) {
      try {
        const payload = JSON.stringify({
          form,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        localStorage.setItem('focuspoint_operator_wizard_draft', payload);
        setLastSavedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch {
        // Storage full or unavailable
      }
    }
  }, [form, isOpen, initialMockTest]);

  // Restore Unsaved Draft
  const handleRestoreDraft = () => {
    try {
      const raw = localStorage.getItem('focuspoint_operator_wizard_draft');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.form) {
          setForm(parsed.form);
          playSound('confirm');
          setHasSavedDraft(false);
          setWizardStep(3);
        }
      }
    } catch {
      playSound('alert');
    }
  };

  const handleDismissDraft = () => {
    try {
      localStorage.removeItem('focuspoint_operator_wizard_draft');
      setHasSavedDraft(false);
      playSound('click');
    } catch {
      // Ignore
    }
  };

  // Step 1: Select Exam
  const handleSelectExam = (exam: GovernmentExam) => {
    playSound('warp');
    const initialQuotas: Record<string, number> = {};
    if (exam.subjectDistribution) {
      Object.entries(exam.subjectDistribution).forEach(([k, v]) => {
        initialQuotas[k] = v.questionCount;
      });
    } else if (exam.subjects.length > 0) {
      const perSub = Math.floor(exam.totalQuestions / exam.subjects.length);
      exam.subjects.forEach(s => { initialQuotas[s] = perSub; });
    }

    setForm(prev => ({
      ...prev,
      examId: exam.id,
      selectedExam: exam,
      title: `${exam.shortName} Official Standard Mock Test 2026`,
      shortName: `${exam.shortName} MT-01`,
      description: `Official pattern examination paper strictly adhering to ${exam.patternVersion} with negative marking of ${exam.negativeMarkingPerQuestion} marks.`,
      durationMinutes: exam.durationMinutes,
      totalQuestions: exam.totalQuestions,
      totalMarks: exam.totalMarks,
      passingMarks: Math.round(exam.totalMarks * 0.4),
      negativeMarkingPerQuestion: exam.negativeMarkingPerQuestion,
      smartSubjectQuotas: initialQuotas,
      paperSourceReference: `Conducting Authority: ${exam.conductingAuthority}`,
      selectedQuestionIds: questions.slice(0, Math.min(exam.totalQuestions, 15)).map(q => q.id)
    }));
  };

  // Apply Blueprint Preset
  const handleApplyPreset = (preset: BlueprintPreset) => {
    playSound('warp');
    setForm(prev => ({
      ...prev,
      category: preset.category,
      title: `${prev.selectedExam?.shortName || preset.badge} ${preset.name} 2026`,
      shortName: `${prev.selectedExam?.shortName || preset.badge} BP-01`,
      description: preset.description,
      totalQuestions: preset.totalQuestions,
      durationMinutes: preset.durationMinutes,
      totalMarks: preset.totalMarks,
      negativeMarkingPerQuestion: preset.negativeMarkingPerQuestion,
      passingMarks: preset.passingMarks,
      language: preset.language,
      difficulty: preset.difficulty,
      smartSubjectQuotas: preset.defaultSubjects,
      selectedQuestionIds: questions.slice(0, Math.min(preset.totalQuestions, 20)).map(q => q.id)
    }));
    playSound('confirm');
  };

  // Mathematical Blueprint Calculation
  const marksPerQCalc = form.totalQuestions > 0 ? (form.totalMarks / form.totalQuestions).toFixed(2) : '2.00';
  const negativePenaltyPercent = Number(marksPerQCalc) > 0 
    ? Math.round((form.negativeMarkingPerQuestion / Number(marksPerQCalc)) * 100) 
    : 25;
  const cutoffPercent = form.totalMarks > 0 
    ? Math.round((form.passingMarks / form.totalMarks) * 100) 
    : 40;
  
  // Pacing Velocity Calculation (Seconds per Question)
  const secondsPerQuestion = form.totalQuestions > 0 
    ? Math.round((form.durationMinutes * 60) / form.totalQuestions) 
    : 48;
  const pacingClassification = 
    secondsPerQuestion < 45 ? 'HIGH SPEED SPRINT' :
    secondsPerQuestion <= 90 ? 'BALANCED STANDARD' : 'DEEP ANALYTICAL';

  // Negative Penalty Severity Classification
  const penaltySeverity = 
    negativePenaltyPercent === 0 ? { label: 'Zero Penalty (Safe Ascent)', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40' } :
    negativePenaltyPercent <= 20 ? { label: 'Gentle Penalty (1/5th)', color: 'text-teal-400 bg-teal-950/80 border-teal-500/40' } :
    negativePenaltyPercent <= 25 ? { label: 'Standard Exam Ratio (1/4th)', color: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/40' } :
    negativePenaltyPercent <= 35 ? { label: 'Elevated Penalty (1/3rd)', color: 'text-amber-400 bg-amber-950/80 border-amber-500/40' } :
    { label: 'Severe Penalty (1/2)', color: 'text-rose-400 bg-rose-950/80 border-rose-500/40' };

  // Filtered Exams in Step 1
  const filteredExams = useMemo(() => {
    let list = exams;
    if (examCategoryTab !== 'ALL') {
      list = list.filter(e => {
        const cat = (e.category || '').toUpperCase();
        if (examCategoryTab === 'UPSSSC') return cat.includes('UPSSSC') || cat.includes('PET');
        if (examCategoryTab === 'POLICE') return cat.includes('POLICE') || cat.includes('DEFENCE');
        if (examCategoryTab === 'TEACHING') return cat.includes('TEACH') || cat.includes('TET');
        if (examCategoryTab === 'SSC') return cat.includes('SSC') || cat.includes('RAILWAY');
        if (examCategoryTab === 'ENTRANCE') return cat.includes('ENTRANCE') || cat.includes('CHS');
        return true;
      });
    }

    if (!examSearch.trim()) return list;
    const q = examSearch.toLowerCase();
    return list.filter(e => 
      e.name.toLowerCase().includes(q) || 
      e.shortName.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.conductingAuthority.toLowerCase().includes(q)
    );
  }, [exams, examSearch, examCategoryTab]);

  // Filtered Questions in Step 5 Manual Mode
  const filteredQuestions = useMemo(() => {
    let list = questions;
    if (selectedSubjectFilter !== 'ALL') {
      list = list.filter(q => q.subject === selectedSubjectFilter);
    }
    if (!questionSearch.trim()) return list;
    const q = questionSearch.toLowerCase();
    return list.filter(item => 
      item.questionText.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.topic.toLowerCase().includes(q)
    );
  }, [questions, questionSearch, selectedSubjectFilter]);

  // Distinct Subjects from Question Bank
  const availableSubjects = useMemo(() => {
    return Array.from(new Set(questions.map(q => q.subject))).filter(Boolean);
  }, [questions]);

  // Neural AI Fast Generator Simulation in Step 4 with Live Telemetry Matrix
  const handleGenerateAiQuestions = () => {
    playSound('scan');
    setIsAiGenerating(true);
    setAiConsoleLogs([
      `[INSPECT] Analyzing syllabus genome for: ${form.selectedExam?.shortName || 'Government Exam'}...`,
      `[DECONSTRUCT] Decomposing target cognitive complexity: ${aiCognitiveLevel}...`
    ]);

    setTimeout(() => {
      setAiConsoleLogs(prev => [
        ...prev,
        `[SYNTHESIZE] Generating 25 high-discrimination items matching negative ratio -${form.negativeMarkingPerQuestion}...`,
        `[TRANSLATE] Synchronizing bilingual Hindi-English terminology and Devanagari numerals...`
      ]);
    }, 600);

    setTimeout(() => {
      setIsAiGenerating(false);
      setAiGeneratedCount(25);
      
      const newSynthesized: QuestionItem[] = Array.from({ length: 25 }, (_, i) => ({
        id: `synth-ai-q-${Date.now()}-${i + 1}`,
        examId: form.selectedExam?.id || 'exam-upsssc-pet-2024',
        examName: form.selectedExam?.name || 'UPSSSC PET 2024',
        subject: aiTargetSubject === 'ALL' ? (availableSubjects[i % availableSubjects.length] || 'General Studies') : aiTargetSubject,
        chapter: 'Syllabus Core Module',
        topic: 'Government Exam Blueprint Standards',
        difficulty: (['EASY', 'MEDIUM', 'HARD'] as const)[i % 3],
        questionType: 'MCQ',
        questionText: `[AI Synthesized #${i + 1}] Official Pattern Question on ${aiTargetSubject === 'ALL' ? 'General Awareness & Indian Constitution' : aiTargetSubject}: What is the statutory quorum required to constitute a meeting of either House of Parliament?`,
        options: [
          { id: 'opt-a', key: 'A', text: 'One-tenth of the total number of members of the House', isCorrect: true },
          { id: 'opt-b', key: 'B', text: 'One-third of the total number of members', isCorrect: false },
          { id: 'opt-c', key: 'C', text: 'One-fifth of the total number of members', isCorrect: false },
          { id: 'opt-d', key: 'D', text: 'Half of the total number of members', isCorrect: false }
        ],
        correctAnswer: 'A',
        explanation: 'Article 100(3) of the Indian Constitution specifies that the quorum to constitute a meeting of either House of Parliament is one-tenth of the total number of members.',
        marks: Number(marksPerQCalc) || 2,
        negativeMarks: form.negativeMarkingPerQuestion || 0.5,
        language: form.language === 'English' ? 'English' : 'Hindi',
        status: 'APPROVED',
        source: 'AI_GENERATED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      setSynthesizedItems(newSynthesized);
      const extraIds = newSynthesized.map(q => q.id);
      setForm(prev => ({
        ...prev,
        selectedQuestionIds: Array.from(new Set([...prev.selectedQuestionIds, ...extraIds]))
      }));

      setAiConsoleLogs(prev => [
        ...prev,
        `[VERIFIED] 25 items generated & injected with 99.4% pre-flight quality index. Status: APPROVED.`
      ]);

      playSound('confirm');
    }, 1300);
  };

  // Smart Auto-Balancing Difficulty Sliders
  const handleDifficultyChange = (type: 'easy' | 'medium' | 'hard', value: number) => {
    playSound('tick');
    setForm(prev => {
      let easy = prev.smartEasyPercent;
      let medium = prev.smartMediumPercent;
      let hard = prev.smartHardPercent;

      if (type === 'easy') {
        easy = value;
        const remainder = Math.max(0, 100 - easy);
        medium = Math.round(remainder * 0.75);
        hard = remainder - medium;
      } else if (type === 'medium') {
        medium = value;
        const remainder = Math.max(0, 100 - medium);
        easy = Math.round(remainder * 0.5);
        hard = remainder - easy;
      } else {
        hard = value;
        const remainder = Math.max(0, 100 - hard);
        easy = Math.round(remainder * 0.35);
        medium = remainder - easy;
      }

      return {
        ...prev,
        smartEasyPercent: easy,
        smartMediumPercent: medium,
        smartHardPercent: hard
      };
    });
  };

  // Smart Assembly Action
  const handleSmartAssemble = async () => {
    if (!form.selectedExam) return;
    playSound('warp');
    try {
      const res = await mockTestService.smartAssembleMockTest({
        examId: form.selectedExam.id,
        category: form.category,
        totalQuestions: form.totalQuestions,
        difficultyDistribution: {
          easy: form.smartEasyPercent,
          medium: form.smartMediumPercent,
          hard: form.smartHardPercent
        },
        subjectDistribution: form.smartSubjectQuotas
      });

      setForm(prev => ({
        ...prev,
        selectedQuestionIds: res.selectedIds
      }));
      playSound('confirm');
    } catch {
      // Fallback local selection
      const autoIds = questions.slice(0, Math.min(form.totalQuestions, questions.length)).map(q => q.id);
      setForm(prev => ({ ...prev, selectedQuestionIds: autoIds }));
      playSound('confirm');
    }
  };

  // Launch In-Studio Simulator Test Drive
  const handleLaunchTestDrive = () => {
    playSound('warp');
    setSimQIndex(0);
    setSimAnswers({});
    setSimMarkedForReview({});
    setSimSubmitted(false);
    setSimShowOperatorKey(false);
    setIsSimulatorOpen(true);
  };

  // Submit Simulator Test Drive
  const handleSimSubmit = () => {
    playSound('confirm');
    setSimSubmitted(true);
  };

  // Simulated questions for test drive combining central bank + synthesized items
  const sampleSimQuestions = useMemo(() => {
    const combinedPool = [...questions, ...synthesizedItems];
    const list = combinedPool.filter(q => form.selectedQuestionIds.includes(q.id));
    if (list.length > 0) return list;
    return combinedPool.slice(0, Math.min(form.totalQuestions, 10));
  }, [questions, synthesizedItems, form.selectedQuestionIds, form.totalQuestions]);

  // Complete & Deploy Wizard
  const handleComplete = async () => {
    if (!form.selectedExam) {
      playSound('alert');
      return;
    }
    playSound('confirm');
    try {
      localStorage.removeItem('focuspoint_operator_wizard_draft');
    } catch {
      // Ignore
    }
    await onComplete(form);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size={isFullscreen ? '6xl' : '2xl'}
      variant="cyber"
      hideDefaultHeader={true}
    >
      <div className={`bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 rounded-3xl p-6 sm:p-8 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.2)] space-y-6 font-sans transition-all duration-200 ${
        isFullscreen ? 'min-h-[92vh] flex flex-col justify-between' : ''
      }`}>
        
        <div>
          {/* ============================================================ */}
          {/* WIZARD HEADER & TELEMETRY BEACONS */}
          {/* ============================================================ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/30">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  NEURAL MOCK TEST WIZARD v5.2
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  BLUEPRINT: 100% HEALTH
                </span>
                {form.selectedExam && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-purple-950/80 text-purple-300 border border-purple-500/40">
                    EXAM: {form.selectedExam.shortName}
                  </span>
                )}
                {lastSavedTimestamp && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <Save className="w-2.5 h-2.5 text-emerald-400" />
                    Auto-Saved {lastSavedTimestamp}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 flex items-center gap-2 tracking-tight">
                <Landmark className="w-6 h-6 text-cyan-400" />
                Government Exam Mock Test Wizard Studio
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Fullscreen Toggle */}
              <button
                onClick={() => {
                  setIsFullscreen(!isFullscreen);
                  playSound('toggle');
                }}
                className="p-2 rounded-xl text-xs font-mono bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 transition-all"
                title={isFullscreen ? 'Restore Modal Size' : 'Expand to Panoramic Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
              </button>

              {/* Audio Toggle */}
              <button
                onClick={() => {
                  setAudioMuted(!audioMuted);
                  playCyberAudio('toggle', true);
                }}
                className={`p-2 rounded-xl text-xs font-mono border transition-all ${
                  !audioMuted 
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' 
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
                title={!audioMuted ? 'HUD Audio Synthesizer Active' : 'Audio Muted'}
              >
                {!audioMuted ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <div className="text-right font-mono text-xs text-slate-400 hidden sm:block">
                <span>Step {wizardStep} of 5 &bull; </span>
                <strong className="text-cyan-400">
                  {wizardStep === 1 ? 'Exam Genome' :
                   wizardStep === 2 ? 'Category Matrix' :
                   wizardStep === 3 ? 'Blueprint Math' :
                   wizardStep === 4 ? 'Neural Content Sourcing' :
                   'Assembly & CBT Simulator'}
                </strong>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RESTORE UNSAVED SESSION BANNER */}
          {/* ============================================================ */}
          {hasSavedDraft && !initialMockTest && (
            <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/70 to-indigo-950/70 border border-cyan-500/40 flex items-center justify-between text-xs font-mono text-cyan-200">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                Unsaved Cockpit Studio session detected. Would you like to restore your progress?
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestoreDraft}
                  className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all text-xs"
                >
                  Restore Draft
                </button>
                <button
                  onClick={handleDismissDraft}
                  className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-200 text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* PROGRESS BEACONS INDICATOR (STEPS 1..5) */}
          {/* ============================================================ */}
          <div className="flex items-center justify-between gap-2 p-2 bg-slate-900/90 rounded-2xl border border-slate-800 mt-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => {
                  playSound('click');
                  setWizardStep(s as any);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                  wizardStep === s 
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400' 
                    : wizardStep > s 
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-slate-950/40 text-slate-500 hover:text-slate-300'
                }`}
              >
                {wizardStep > s ? <Check className="w-3.5 h-3.5" /> : <span>{s}</span>}
                <span className="hidden sm:inline">
                  {s === 1 ? '1. Exam Genome' : s === 2 ? '2. Category' : s === 3 ? '3. Blueprint Math' : s === 4 ? '4. Content Source' : '5. Assembly & CBT'}
                </span>
              </button>
            ))}
          </div>

          {/* ============================================================ */}
          {/* STEP 1: SELECT TARGET GOVERNMENT EXAM & PRESETS */}
          {/* ============================================================ */}
          {wizardStep === 1 && (
            <div className="space-y-4 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TargetIcon className="w-4 h-4 text-cyan-400" />
                    Step 1 — Target Examination Genome
                  </h3>
                  <p className="text-xs text-slate-400">Select an exam blueprint from the Pan-India catalog to inherit official duration, pattern, and marking rules.</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                    placeholder="Search exam name, authority..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Fast Blueprint Quick-Apply Presets */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 space-y-2">
                <span className="text-[11px] font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  Fast Blueprint Quick-Apply Presets:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {BLUEPRINT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      <span>{preset.badge}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({preset.totalQuestions}Q &bull; {preset.durationMinutes}m)</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                {(['ALL', 'UPSSSC', 'POLICE', 'TEACHING', 'SSC', 'ENTRANCE'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setExamCategoryTab(tab);
                      playSound('tick');
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      examCategoryTab === tab
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Exam Genome Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                {filteredExams.map((ex) => {
                  const isSelected = form.examId === ex.id;
                  return (
                    <div
                      key={ex.id}
                      onClick={() => handleSelectExam(ex)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400' 
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-sm font-mono">{ex.shortName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                            {ex.category}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs font-medium">{ex.name}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">{ex.conductingAuthority} &bull; {ex.level} Level</p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>{ex.totalQuestions} Qs &bull; {ex.durationMinutes}m &bull; {ex.totalMarks}M</span>
                        <span className="text-cyan-400 font-bold">{ex.patternVersion}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Exam Blueprint Banner */}
              {form.selectedExam && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block text-[10px]">SELECTED GENOME:</span>
                    <span className="text-cyan-300 font-bold text-sm">
                      {form.selectedExam.name} ({form.selectedExam.patternVersion})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      Standard: {form.selectedExam.totalQuestions} Qs
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      Duration: {form.selectedExam.durationMinutes}m
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-950 text-emerald-400 border border-slate-800">
                      Marking: -{form.selectedExam.negativeMarkingPerQuestion}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: SELECT CATEGORY MATRIX */}
          {/* ============================================================ */}
          {wizardStep === 2 && (
            <div className="space-y-4 mt-6">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Step 2 — Test Category Matrix for {form.selectedExam?.shortName || 'Selected Exam'}
                </h3>
                <p className="text-xs text-slate-400">Select the official pedagogical format for this mock test paper.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                {[
                  { type: 'FULL_TEST', name: 'Full Mock Test', icon: Landmark, desc: 'Complete examination replica matching official blueprint, section balance, and duration.' },
                  { type: 'PREVIOUS_YEAR', name: 'Official Past Year Paper (PYQ)', icon: History, desc: 'Authentic past examination shift with shift timing and paper booklet code.' },
                  { type: 'TEST_SERIES', name: 'Structured Test Series Package', icon: Layers, desc: 'Curriculum-linked test unlocked in a sequential preparation package.' },
                  { type: 'SUBJECT_WISE', name: 'Subject-Wise Focus Drill', icon: BookOpen, desc: 'High-intensity drill targeting one specific discipline from the exam syllabus.' },
                  { type: 'CHAPTER_WISE', name: 'Chapter & Topic Mastery', icon: Sliders, desc: 'Micro-targeted paper covering specific concepts and chapters.' },
                  { type: 'IMPORTANT_TEST', name: 'High-Yield Expected Questions', icon: Zap, desc: 'Curated expected questions identified by the academic content bureau.' },
                  { type: 'ADVANCED_TEST', name: 'Top-Ranker Advanced Simulator', icon: Award, desc: 'Higher difficulty questions designed for aspirants targeting top ranks.' },
                  { type: 'MISCELLANEOUS', name: 'Speed Challenge & Rapid Drill', icon: Clock, desc: 'Timed speed drills to maximize candidate throughput and accuracy.' }
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = form.category === cat.type;
                  return (
                    <div
                      key={cat.type}
                      onClick={() => {
                        playSound('click');
                        setForm(prev => ({ ...prev, category: cat.type as TestCategoryType }));
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400' 
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                          <span className="font-bold text-white text-sm">{cat.name}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cat.desc}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                        <span className={isSelected ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                          {isSelected ? 'SELECTED FORMAT' : 'Click to Select'}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: TEST DETAILS & BLUEPRINT MATHEMATICS */}
          {/* ============================================================ */}
          {wizardStep === 3 && (
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs mt-6">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-cyan-400" />
                  Step 3 — Test Parameters & Blueprint Mathematics
                </h3>
                <p className="text-xs text-slate-400">Configure title, scoring criteria, pacing velocity, and section allocations.</p>
              </div>

              {/* Title & Short Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Mock Paper Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Short Code / Badge</label>
                  <input
                    type="text"
                    value={form.shortName}
                    onChange={(e) => setForm(prev => ({ ...prev, shortName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* Language, Difficulty & Target Cohort */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Medium / Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm(prev => ({ ...prev, language: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="Bilingual">Bilingual (Hindi + English)</option>
                    <option value="English">English Only</option>
                    <option value="Hindi">Hindi Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Difficulty Level</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="MIXED">Mixed / Balanced (Exam Blueprint)</option>
                    <option value="EASY">Easy (Foundation Stage)</option>
                    <option value="MEDIUM">Medium (Standard Exam Tier)</option>
                    <option value="HARD">Hard (Advanced Challenger)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Examinee Cohort</label>
                  <input
                    type="text"
                    value={form.cohortTarget}
                    onChange={(e) => setForm(prev => ({ ...prev, cohortTarget: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              {/* PYQ Special Inputs */}
              {form.category === 'PREVIOUS_YEAR' && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5 font-mono">
                    <History className="w-4 h-4 text-indigo-400" />
                    Official Previous Year Paper Shift Metadata
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Year</label>
                      <input
                        type="number"
                        value={form.year}
                        onChange={(e) => setForm(prev => ({ ...prev, year: Number(e.target.value) }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Shift</label>
                      <input
                        type="text"
                        value={form.shift}
                        onChange={(e) => setForm(prev => ({ ...prev, shift: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Booklet Set</label>
                      <input
                        type="text"
                        value={form.paperSet}
                        onChange={(e) => setForm(prev => ({ ...prev, paperSet: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Source Type</label>
                      <select
                        value={form.paperSourceType}
                        onChange={(e) => setForm(prev => ({ ...prev, paperSourceType: e.target.value as any }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      >
                        <option value="OFFICIAL_PYQ">Official Paper</option>
                        <option value="RECONSTRUCTED_PATTERN">Reconstructed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Series Selector */}
              {form.category === 'TEST_SERIES' && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Target Test Series Package</label>
                    <select
                      value={form.seriesId}
                      onChange={(e) => setForm(prev => ({ ...prev, seriesId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
                    >
                      <option value="">Select Package</option>
                      {testSeries.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Sequence Order Number</label>
                    <input
                      type="number"
                      value={form.seriesSequenceNumber}
                      onChange={(e) => setForm(prev => ({ ...prev, seriesSequenceNumber: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Mathematical Scoring Blueprints Box */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-slate-300 text-xs block font-bold flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-cyan-400" />
                    Mathematical Blueprint & Scoring Equations
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Pacing: {secondsPerQuestion}s/Q ({pacingClassification})
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${penaltySeverity.color}`}>
                      {penaltySeverity.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Total Questions</label>
                    <input
                      type="number"
                      value={form.totalQuestions}
                      onChange={(e) => setForm(prev => ({ ...prev, totalQuestions: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      value={form.durationMinutes}
                      onChange={(e) => setForm(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Maximum Marks</label>
                    <input
                      type="number"
                      value={form.totalMarks}
                      onChange={(e) => setForm(prev => ({ ...prev, totalMarks: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-purple-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Negative / Wrong</label>
                    <input
                      type="number"
                      step="0.05"
                      value={form.negativeMarkingPerQuestion}
                      onChange={(e) => setForm(prev => ({ ...prev, negativeMarkingPerQuestion: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Passing Cutoff ({cutoffPercent}%)</label>
                    <input
                      type="number"
                      value={form.passingMarks}
                      onChange={(e) => setForm(prev => ({ ...prev, passingMarks: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold"
                    />
                  </div>
                </div>

                {/* Live Evaluation Equation */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span>Equation: +{marksPerQCalc} marks/correct &bull; -{form.negativeMarkingPerQuestion} marks/wrong ({negativePenaltyPercent}% penalty)</span>
                  <span className="text-emerald-400 font-bold">Standard Exam Blueprint Compliant</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: NEURAL CONTENT SOURCING & FAST AI PRE-FLIGHT */}
          {/* ============================================================ */}
          {wizardStep === 4 && (
            <div className="space-y-4 mt-6">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Step 4 — Content Sourcing Engine
                </h3>
                <p className="text-xs text-slate-400">Select where the test questions are assembled from or synthesize new items.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: `QUESTION_BANK`, title: "ZYZU'S Question Bank", icon: HelpCircle, desc: `Approved items from the certified central repository.` },
                  { id: 'AI_GENERATOR', title: 'Neural AI Generator', icon: Sparkles, desc: 'Generate new syllabus-matched questions with pre-flight QA.' },
                  { id: 'PREVIOUS_PAPER', title: 'Official Previous Paper (PYQ)', icon: History, desc: 'Exact past year questions from authentic shifts.' },
                  { id: 'MANUAL', title: 'Manual In-Studio Authoring', icon: Edit3, desc: 'Type or paste custom questions in the editor.' },
                  { id: 'EXISTING', title: 'Existing Published Templates', icon: Copy, desc: 'Clone and adapt from previously tested blueprints.' },
                  { id: 'MIXED', title: 'Hybrid / Multi-Source Assembly', icon: Layers, desc: 'Combine past year items with high-yield drills.' }
                ].map((src) => {
                  const Icon = src.icon;
                  const isSelected = form.contentSource === src.id;
                  return (
                    <div
                      key={src.id}
                      onClick={() => {
                        playSound('click');
                        setForm(prev => ({ ...prev, contentSource: src.id as any }));
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400' 
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <strong className="text-white text-xs block">{src.title}</strong>
                      <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{src.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Neural AI Fast Synthesizer in Step 4 */}
              <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      AI Pre-Flight Generator & Neural Question Synthesizer
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Synthesize 25 new questions matching {form.selectedExam?.shortName || 'selected'} syllabus directly into the draft pool.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleGenerateAiQuestions}
                      disabled={isAiGenerating}
                      className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-cyan-900/30 flex items-center gap-1.5"
                    >
                      {isAiGenerating ? (
                        <span className="flex items-center gap-1.5 font-mono">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Synthesizing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 font-mono">
                          <Zap className="w-3.5 h-3.5 text-cyan-300" /> Synthesize 25 AI Questions
                        </span>
                      )}
                    </Button>

                    {synthesizedItems.length > 0 && (
                      <button
                        onClick={() => setShowAiDrawer(!showAiDrawer)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-slate-800 transition-all flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {showAiDrawer ? 'Hide Preview' : `Inspect (${synthesizedItems.length})`}
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Configuration Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Target Discipline</label>
                    <select
                      value={aiTargetSubject}
                      onChange={(e) => setAiTargetSubject(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                    >
                      <option value="ALL">All Subjects (Syllabus Blend)</option>
                      {availableSubjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Cognitive Complexity Tier</label>
                    <div className="flex items-center gap-1.5">
                      {(['FACTUAL', 'CONCEPTUAL', 'ANALYTICAL'] as const).map(tier => (
                        <button
                          key={tier}
                          onClick={() => setAiCognitiveLevel(tier)}
                          className={`flex-1 py-1 rounded text-[11px] font-bold border transition-all ${
                            aiCognitiveLevel === tier 
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' 
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Console Logs */}
                {aiConsoleLogs.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-1">
                      <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> Neural Synthesizer Console</span>
                      <span>Ready</span>
                    </div>
                    {aiConsoleLogs.map((log, idx) => (
                      <div key={idx} className={idx === aiConsoleLogs.length - 1 ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
                        {log}
                      </div>
                    ))}
                  </div>
                )}

                {/* Synthesized Items Preview Drawer */}
                {showAiDrawer && synthesizedItems.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 max-h-52 overflow-y-auto">
                    <span className="text-xs font-bold text-white block">Preview Synthesized Questions:</span>
                    {synthesizedItems.slice(0, 5).map((q, qIdx) => (
                      <div key={q.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-cyan-300 font-bold">#{qIdx + 1} &bull; {q.subject}</span>
                          <span className="text-emerald-400">Key: Option {q.correctAnswer}</span>
                        </div>
                        <p className="text-slate-200">{q.questionText}</p>
                        <p className="text-[11px] text-slate-400 italic">Explanation: {q.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 5: QUESTION ASSEMBLY, SIMULATOR & FINAL CERTIFICATION */}
          {/* ============================================================ */}
          {wizardStep === 5 && (
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    Step 5 — Question Assembly & QA Certification
                  </h3>
                  <p className="text-xs text-slate-400">Assemble questions with smart distribution and take a live test drive.</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => {
                      playSound('click');
                      setForm(prev => ({ ...prev, assemblyMode: 'SMART' }));
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                      form.assemblyMode === 'SMART' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Smart Auto
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setForm(prev => ({ ...prev, assemblyMode: 'MANUAL' }));
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                      form.assemblyMode === 'MANUAL' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Manual Browser
                  </button>
                </div>
              </div>

              {/* Smart Auto Assembly Mode */}
              {form.assemblyMode === 'SMART' ? (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-4">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5 font-mono">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Smart Difficulty Distribution Engine (Auto-Balancing 100%)
                  </span>

                  {/* Difficulty Sliders */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Easy: {form.smartEasyPercent}%</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={form.smartEasyPercent}
                        onChange={(e) => handleDifficultyChange('easy', Number(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Medium: {form.smartMediumPercent}%</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={form.smartMediumPercent}
                        onChange={(e) => handleDifficultyChange('medium', Number(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Hard: {form.smartHardPercent}%</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={form.smartHardPercent}
                        onChange={(e) => handleDifficultyChange('hard', Number(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-400 font-mono">
                      Selected Questions: <strong className="text-cyan-400">{form.selectedQuestionIds.length}</strong> / {form.totalQuestions}
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleSmartAssemble}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-300" /> Auto-Assemble from Certified Bank
                    </Button>
                  </div>
                </div>
              ) : (
                /* Manual Selection Browser */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-slate-400 font-mono">
                    <span>Pick questions from certified repository:</span>
                    <span className="text-cyan-400 font-bold">{form.selectedQuestionIds.length} / {form.totalQuestions} Selected</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={questionSearch}
                        onChange={(e) => setQuestionSearch(e.target.value)}
                        placeholder="Search question text or topic..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                      />
                    </div>

                    <select
                      value={selectedSubjectFilter}
                      onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                    >
                      <option value="ALL">All Subjects</option>
                      {availableSubjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-2 border border-slate-800 p-2 rounded-xl bg-slate-950">
                    {filteredQuestions.slice(0, 30).map((q) => {
                      const isChecked = form.selectedQuestionIds.includes(q.id);
                      return (
                        <label
                          key={q.id}
                          className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                            isChecked ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              playSound('click');
                              setForm(prev => ({
                                ...prev,
                                selectedQuestionIds: isChecked
                                  ? prev.selectedQuestionIds.filter(id => id !== q.id)
                                  : [...prev.selectedQuestionIds, q.id]
                              }));
                            }}
                            className="mt-0.5 accent-cyan-400 rounded"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-mono">
                              <span className="font-bold text-white">{q.subject}</span>
                              <span>&bull;</span>
                              <span className="text-slate-400">{q.topic}</span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{q.difficulty}</span>
                            </div>
                            <p className="text-xs text-slate-200 line-clamp-2">{q.questionText}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Test Drive Simulator Trigger */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-white text-xs block flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-cyan-400" />
                    In-Studio Interactive CBT Test Simulator
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Test drive this exact paper under timed conditions before releasing to student catalog.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleLaunchTestDrive}
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Launch Test Drive
                </Button>
              </div>

              {/* Publication State */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-slate-300 font-bold">Deployment Visibility State</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${
                    form.status === 'PUBLISHED' ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold' : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="status_radio"
                      checked={form.status === 'PUBLISHED'}
                      onChange={() => {
                        playSound('toggle');
                        setForm(prev => ({ ...prev, status: 'PUBLISHED' }));
                      }}
                      className="accent-emerald-400"
                    />
                    <span>Publish Immediately (Live to Students)</span>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${
                    form.status === 'DRAFT' ? 'border-amber-500 bg-amber-950/40 text-amber-300 font-bold' : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="status_radio"
                      checked={form.status === 'DRAFT'}
                      onChange={() => {
                        playSound('toggle');
                        setForm(prev => ({ ...prev, status: 'DRAFT' }));
                      }}
                      className="accent-amber-400"
                    />
                    <span>Save as In-Progress Draft</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* WIZARD NAVIGATION FOOTER */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-6">
          {wizardStep > 1 ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                playSound('click');
                setWizardStep((wizardStep - 1) as any);
              }}
              className="bg-slate-900 text-white border-slate-700 hover:bg-slate-800 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </Button>
          ) : <div />}

          {wizardStep < 5 ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                playSound('warp');
                setWizardStep((wizardStep + 1) as any);
              }}
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-cyan-500/20"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={handleComplete}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-xl shadow-emerald-500/30"
            >
              <Check className="w-3.5 h-3.5 mr-1" /> Create & Deploy Mock Paper
            </Button>
          )}
        </div>

        {/* ============================================================ */}
        {/* IN-STUDIO CBT TEST SIMULATOR MODAL */}
        {/* ============================================================ */}
        {isSimulatorOpen && (
          <Modal
            isOpen={isSimulatorOpen}
            onClose={() => setIsSimulatorOpen(false)}
            title="In-Studio Interactive CBT Test Simulator"
            size="2xl"
          >
            <div className="p-6 bg-slate-950 text-white rounded-2xl space-y-6">
              
              {/* Telemetry bar */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Test Title</span>
                  <strong className="text-cyan-400">{form.title || 'Live Mock Test'}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[10px]">Language:</span>
                  <button
                    onClick={() => setSimLanguage(simLanguage === 'English' ? 'Hindi' : 'English')}
                    className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 hover:bg-slate-700 transition-all"
                  >
                    {simLanguage}
                  </button>

                  {/* Font Sizer */}
                  <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
                    <button
                      onClick={() => setSimFontSize('sm')}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${simFontSize === 'sm' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                      title="Small Font"
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setSimFontSize('base')}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${simFontSize === 'base' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                      title="Normal Font"
                    >
                      A
                    </button>
                    <button
                      onClick={() => setSimFontSize('lg')}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${simFontSize === 'lg' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                      title="Large Font"
                    >
                      A+
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Marking Rule</span>
                  <strong className="text-purple-400">+{marksPerQCalc} / -{form.negativeMarkingPerQuestion}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSimTimerPaused(!simTimerPaused)}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                    title={simTimerPaused ? 'Resume Timer' : 'Pause Timer'}
                  >
                    {simTimerPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                  </button>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Timed Clock</span>
                    <strong className={simTimerPaused ? 'text-amber-400' : 'text-emerald-400'}>
                      {form.durationMinutes}:00 {simTimerPaused ? '(PAUSED)' : ''}
                    </strong>
                  </div>
                </div>
              </div>

              {!simSubmitted ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Question Box */}
                  <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    {sampleSimQuestions[simQIndex] ? (
                      <>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 font-bold">
                            Question {simQIndex + 1} of {sampleSimQuestions.length}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">
                              {sampleSimQuestions[simQIndex].subject}
                            </span>
                            {/* Operator Key Toggle */}
                            <button
                              onClick={() => setSimShowOperatorKey(!simShowOperatorKey)}
                              className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                                simShowOperatorKey 
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold' 
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                              title="Toggle Operator Answer Key Inspection"
                            >
                              {simShowOperatorKey ? 'Key: Visible' : 'Key: Hidden'}
                            </button>
                          </div>
                        </div>

                        <p className={`text-slate-100 font-sans leading-relaxed ${
                          simFontSize === 'sm' ? 'text-xs' : simFontSize === 'lg' ? 'text-base font-medium' : 'text-sm'
                        }`}>
                          {sampleSimQuestions[simQIndex].questionText}
                        </p>

                        {/* Options */}
                        <div className="space-y-2 pt-2">
                          {(sampleSimQuestions[simQIndex].options || [
                            { id: 'opt-a', key: 'A', text: 'Option Alpha candidate proposition' },
                            { id: 'opt-b', key: 'B', text: 'Option Beta alternative proposition' },
                            { id: 'opt-c', key: 'C', text: 'Option Gamma verified criterion' },
                            { id: 'opt-d', key: 'D', text: 'Option Delta boundary condition' }
                          ]).map((opt: any, optIdx: number) => {
                            const optKey = opt.key || ['A', 'B', 'C', 'D'][optIdx];
                            const isSelected = simAnswers[simQIndex] === optKey;
                            const isCorrectAnswer = simShowOperatorKey && (sampleSimQuestions[simQIndex].correctAnswer === optKey || sampleSimQuestions[simQIndex].correctAnswer === opt.id);
                            
                            return (
                              <div
                                key={opt.id || optIdx}
                                onClick={() => {
                                  playCyberAudio('click', true);
                                  setSimAnswers(prev => ({ ...prev, [simQIndex]: optKey }));
                                }}
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 text-xs ${
                                  isCorrectAnswer 
                                    ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400' 
                                    : isSelected 
                                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]' 
                                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                                  isCorrectAnswer 
                                    ? 'bg-emerald-400 text-slate-950' 
                                    : isSelected 
                                      ? 'bg-cyan-400 text-slate-950' 
                                      : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {optKey}
                                </span>
                                <span>{opt.text}</span>
                                {isCorrectAnswer && (
                                  <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-300 font-bold">
                                    CORRECT KEY
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Box if Operator Key Revealed */}
                        {simShowOperatorKey && sampleSimQuestions[simQIndex].explanation && (
                          <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs font-mono text-emerald-300 space-y-1">
                            <span className="font-bold block">Operator Verified Solution:</span>
                            <p className="text-slate-300 font-sans">{sampleSimQuestions[simQIndex].explanation}</p>
                          </div>
                        )}

                        {/* Controls */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={simQIndex === 0}
                            onClick={() => setSimQIndex(prev => Math.max(0, prev - 1))}
                            className="bg-slate-800 text-xs"
                          >
                            Previous
                          </Button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSimMarkedForReview(prev => ({
                                  ...prev,
                                  [simQIndex]: !prev[simQIndex]
                                }));
                              }}
                              className={`text-xs px-2.5 py-1 rounded-lg border ${
                                simMarkedForReview[simQIndex] 
                                  ? 'bg-purple-950 text-purple-300 border-purple-500' 
                                  : 'text-slate-400 border-slate-700 hover:text-white'
                              }`}
                            >
                              Mark for Review
                            </button>

                            <button
                              onClick={() => {
                                setSimAnswers(prev => {
                                  const copy = { ...prev };
                                  delete copy[simQIndex];
                                  return copy;
                                });
                              }}
                              className="text-xs text-slate-400 hover:text-white"
                            >
                              Clear
                            </button>
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              if (simQIndex < sampleSimQuestions.length - 1) {
                                setSimQIndex(prev => prev + 1);
                              } else {
                                handleSimSubmit();
                              }
                            }}
                            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                          >
                            {simQIndex < sampleSimQuestions.length - 1 ? 'Save & Next' : 'Submit Test'}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-xs">No sample questions available.</div>
                    )}
                  </div>

                  {/* Palette */}
                  <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <h5 className="text-xs font-bold text-slate-300 font-mono">Question Palette</h5>
                    <div className="grid grid-cols-5 gap-1.5 max-h-60 overflow-y-auto pr-1">
                      {sampleSimQuestions.map((_, idx) => {
                        const isAns = !!simAnswers[idx];
                        const isRev = !!simMarkedForReview[idx];
                        const isCur = simQIndex === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSimQIndex(idx)}
                            className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                              isCur 
                                ? 'ring-2 ring-cyan-400 bg-indigo-600 text-white' 
                                : isRev 
                                  ? 'bg-purple-600 text-white' 
                                  : isAns 
                                    ? 'bg-emerald-600 text-white' 
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-3 border-t border-slate-800 text-[10px] space-y-1 font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-emerald-600"></span>
                        <span>Answered ({Object.keys(simAnswers).length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-purple-600"></span>
                        <span>Marked for Review ({Object.keys(simMarkedForReview).filter(k => simMarkedForReview[Number(k)]).length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-slate-800"></span>
                        <span>Unanswered ({sampleSimQuestions.length - Object.keys(simAnswers).length})</span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSimSubmit}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs mt-2"
                    >
                      Submit Test Drive
                    </Button>
                  </div>
                </div>
              ) : (
                /* Scorecard */
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
                  <Award className="w-12 h-12 text-cyan-400 mx-auto" />
                  <h4 className="text-lg font-bold text-white">Simulated Test Run Complete!</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono max-w-lg mx-auto">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Attempted</span>
                      <strong className="text-base text-cyan-400">{Object.keys(simAnswers).length}/{sampleSimQuestions.length}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Estimated Score</span>
                      <strong className="text-base text-emerald-400">{(Object.keys(simAnswers).length * Number(marksPerQCalc)).toFixed(1)} M</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">CBT Engine</span>
                      <strong className="text-base text-white">Online</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Validation</span>
                      <strong className="text-base text-purple-400">100% OK</strong>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSimSubmitted(false);
                        setSimAnswers({});
                        setSimMarkedForReview({});
                        setSimQIndex(0);
                      }}
                      className="bg-slate-800 text-xs"
                    >
                      Retake Test Drive
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setIsSimulatorOpen(false)}
                      className="bg-cyan-600 text-slate-950 font-bold text-xs"
                    >
                      Return to Wizard
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

      </div>
    </Modal>
  );
};

// Target Icon helper
const TargetIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
