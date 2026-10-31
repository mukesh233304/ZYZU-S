// FOCUSPOINT Advanced & Futuristic Exam Previous Year Question Paper (PYQ) Digitize & Ingestion Studio
// Complete official shift tracking, sectional blueprint calculation, AI OCR scanning simulation,
// interactive question editor, in-studio CBT test drive simulator, and 1-click catalog deployment.

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  ShieldCheck, 
  Cpu, 
  Eye, 
  Play, 
  Search, 
  Filter, 
  RefreshCw, 
  Check, 
  HelpCircle, 
  Plus, 
  Trash2, 
  BookOpen, 
  Download, 
  ExternalLink,
  Sliders,
  Calendar,
  Zap,
  Award,
  Lock,
  ChevronRight,
  Database,
  Volume2,
  VolumeX,
  Radio,
  Terminal,
  Hash,
  Copy,
  Edit3,
  Save,
  CheckSquare,
  X
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockStore } from '../../mock/store';
import { 
  StudyMaterial, 
  PreviousYearPaperMetadata, 
  PreviousYearPaperSection 
} from '../../types/studyMaterial';
import { operatorService } from '../../services/operatorService';

// Available Target Exams for PYQ Ingestion
const POPULAR_PYQ_EXAMS = [
  { id: 'SSC_CGL', name: 'SSC Combined Graduate Level', category: 'SSC', authority: 'Staff Selection Commission (SSC)', defaultDuration: 60, defaultQCount: 100, defaultMarks: 200, neg: 0.50 },
  { id: 'UP_POLICE', name: 'UP Police Constable Recruitment', category: 'POLICE', authority: 'UPPRPB Lucknow', defaultDuration: 120, defaultQCount: 150, defaultMarks: 300, neg: 0.50 },
  { id: 'NEET_UG', name: 'NEET (Undergraduate) Medical', category: 'MEDICAL', authority: 'National Testing Agency (NTA)', defaultDuration: 200, defaultQCount: 200, defaultMarks: 720, neg: 1.00 },
  { id: 'IIT_JEE', name: 'JEE Main Engineering Entrance', category: 'ENGINEERING', authority: 'National Testing Agency (NTA)', defaultDuration: 180, defaultQCount: 90, defaultMarks: 300, neg: 1.00 },
  { id: 'CTET', name: 'Central Teacher Eligibility Test', category: 'TEACHING', authority: 'CBSE New Delhi', defaultDuration: 150, defaultQCount: 150, defaultMarks: 150, neg: 0.00 },
  { id: 'UP_PET', name: 'UPSSSC Preliminary Eligibility Test', category: 'STATE_EXAMS', authority: 'UPSSSC Lucknow', defaultDuration: 120, defaultQCount: 100, defaultMarks: 100, neg: 0.25 },
  { id: 'CHS_9', name: 'Central Hindu School (CHS BHU Class 9)', category: 'ADMISSION_EXAMS', authority: 'Banaras Hindu University', defaultDuration: 120, defaultQCount: 100, defaultMarks: 100, neg: 0.00 },
  { id: 'NAVODAYA_6', name: 'JNVST Navodaya Class 6 Selection', category: 'ADMISSION_EXAMS', authority: 'Navodaya Vidyalaya Samiti', defaultDuration: 120, defaultQCount: 80, defaultMarks: 100, neg: 0.00 }
];

const AVAILABLE_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
const SHIFTS = [
  { id: 'Shift-1', label: 'Shift-1 (Morning)', timing: '09:00 AM - 10:00 AM' },
  { id: 'Shift-2', label: 'Shift-2 (Afternoon)', timing: '12:30 PM - 01:30 PM' },
  { id: 'Shift-3', label: 'Shift-3 (Evening)', timing: '04:30 PM - 05:30 PM' }
];

// Interactive Question Model for Extracted / Digitized Items
export interface DigitizedQuestionItem {
  id: string;
  questionNumber: number;
  sectionName: string;
  questionText: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  marks: number;
  negativeMarks: number;
  hasFormula: boolean;
  confidence: number;
}

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
        osc.frequency.setValueAtTime(940, now);
        osc.frequency.exponentialRampToValueAtTime(1450, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
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
    }
  } catch {
    // Audio suppressed or unsupported
  }
};

// Initial Seed Extracted Questions Generator
const generateInitialQuestions = (examId: string, examName: string, sections: PreviousYearPaperSection[]): DigitizedQuestionItem[] => {
  const list: DigitizedQuestionItem[] = [];
  let counter = 1;

  sections.forEach((sec) => {
    const count = Math.min(sec.questionCount, 4); // 4 realistic sample questions per section
    for (let i = 1; i <= count; i++) {
      const correctOpt: 'A' | 'B' | 'C' | 'D' = (['A', 'B', 'C', 'D'][(counter - 1) % 4]) as any;
      list.push({
        id: `q-extract-${counter}`,
        questionNumber: counter,
        sectionName: sec.name,
        questionText: `[${examName} Official PYQ] Under ${sec.name}, evaluate the official proposition regarding concept #${counter}: What is the correct standard evaluation matching conducting body parameters?`,
        options: [
          { key: 'A', text: `Proposition Alpha: Verified official baseline criterion for ${sec.name}` },
          { key: 'B', text: `Proposition Beta: Secondary boundary case frequently tested in past shifts` },
          { key: 'C', text: `Proposition Gamma: Distractor concept with subtle dimensional variance` },
          { key: 'D', text: `Proposition Delta: Null condition applicable only in theoretical limit` }
        ],
        correctAnswer: correctOpt,
        explanation: `Official Key Clarification: Option (${correctOpt}) is authenticated against the official answer key released by the exam authority. Complete step-by-step mathematical reasoning verified by ZYZU'S Academic Cell.`,
        marks: Math.round(sec.marks / (sec.questionCount || 1)) || 2,
        negativeMarks: sec.negativeMarks || 0.5,
        hasFormula: i % 2 === 0,
        confidence: 99.4
      });
      counter++;
    }
  });

  return list;
};

export const OperatorPyqDigitizerStudio: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const operatorId = user?.id || 'usr-operator-sunita';
  const operatorName = user?.name || 'Sunita Verma';

  // HUD & Audio States
  const [sfxEnabled, setSfxEnabled] = useState(true);

  // Selected Exam for Intelligence Matrix
  const [matrixExamId, setMatrixExamId] = useState<string>('SSC_CGL');
  const [allMaterials, setAllMaterials] = useState<StudyMaterial[]>([]);

  // Studio Flow States
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isScanningActive, setIsScanningActive] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanComplete, setScanComplete] = useState<boolean>(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [previewTab, setPreviewTab] = useState<'QUESTIONS' | 'ANSWER_KEY' | 'RAW_TEXT'>('QUESTIONS');

  // Interactive Question Editor States
  const [digitizedQuestions, setDigitizedQuestions] = useState<DigitizedQuestionItem[]>([]);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('ALL');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [rawTextDump, setRawTextDump] = useState<string>(
    'Q1. What is the value of gravitational acceleration g at poles?\n(A) Maximum\n(B) Minimum\n(C) Zero\n(D) Constant everywhere\nAnswer: A\nExplanation: g is maximum at the poles due to flattened earth radius.\n\nQ2. Which constitutional amendment introduced GST in India?\n(A) 99th Amendment\n(B) 101st Amendment\n(C) 103rd Amendment\n(D) 105th Amendment\nAnswer: B\nExplanation: The 101st Constitutional Amendment Act, 2016 introduced GST in India.'
  );

  // In-Studio Interactive CBT Test Simulator Modal
  const [isCbtSimulatorOpen, setIsCbtSimulatorOpen] = useState<boolean>(false);
  const [simCurrentQIndex, setSimCurrentQIndex] = useState<number>(0);
  const [simUserAnswers, setSimUserAnswers] = useState<Record<number, string>>({});
  const [simTimeRemaining, setSimTimeRemaining] = useState<number>(3600);
  const [simSubmitted, setSimSubmitted] = useState<boolean>(false);

  // Published Success Modal
  const [publishedItem, setPublishedItem] = useState<StudyMaterial | null>(null);

  // Sound helper
  const playSound = (type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'scan') => {
    playCyberAudio(type, sfxEnabled);
  };

  // Core PYQ Form State
  const [form, setForm] = useState<{
    examId: string;
    examName: string;
    examCategory: string;
    conductingAuthority: string;
    examYear: number;
    tierOrStage: string;
    examDate: string;
    shift: string;
    shiftTiming: string;
    paperCode: string;
    language: string;
    targetClass: string;
    educationStage: any;
    subject: string;
    difficultyLevel: any;
    durationMinutes: number;
    negativeMarking: number;
    sections: PreviousYearPaperSection[];
    masterPaperFileName: string;
    masterPaperPdfUrl: string;
    masterPaperFileSize: string;
    hasOfficialAnswerKey: boolean;
    officialAnswerKeyUrl: string;
    hasStepByStepSolutions: boolean;
    solvedSolutionsPdfUrl: string;
    synthesizeCbtTest: boolean;
    isPaid: boolean;
    basePrice: number;
    applyWatermark: boolean;
    operatorCertified: boolean;
  }>({
    examId: 'SSC_CGL',
    examName: 'SSC Combined Graduate Level',
    examCategory: 'SSC',
    conductingAuthority: 'Staff Selection Commission (SSC)',
    examYear: 2024,
    tierOrStage: 'Tier-1',
    examDate: '2024-09-12',
    shift: 'Shift-1 (Morning)',
    shiftTiming: '09:00 AM - 10:00 AM',
    paperCode: 'CGL-24-S1-A',
    language: 'Bilingual (Hindi + English)',
    targetClass: 'Graduation',
    educationStage: 'GENERAL',
    subject: 'General Studies & Aptitude',
    difficultyLevel: 'MEDIUM',
    durationMinutes: 60,
    negativeMarking: 0.50,
    sections: [
      { name: 'General Intelligence & Reasoning', questionCount: 25, marks: 50, negativeMarks: 0.50 },
      { name: 'General Awareness', questionCount: 25, marks: 50, negativeMarks: 0.50 },
      { name: 'Quantitative Aptitude', questionCount: 25, marks: 50, negativeMarks: 0.50 },
      { name: 'English Comprehension', questionCount: 25, marks: 50, negativeMarks: 0.50 }
    ],
    masterPaperFileName: 'SSC_CGL_2024_Tier1_12Sept_Shift1_Official.pdf',
    masterPaperPdfUrl: '/documents/pyq/ssc-cgl-2024-t1-s1-master.pdf',
    masterPaperFileSize: '8.4 MB',
    hasOfficialAnswerKey: true,
    officialAnswerKeyUrl: '/documents/pyq/ssc-cgl-2024-t1-s1-key.pdf',
    hasStepByStepSolutions: true,
    solvedSolutionsPdfUrl: '/documents/pyq/ssc-cgl-2024-t1-s1-solutions.pdf',
    synthesizeCbtTest: true,
    isPaid: false,
    basePrice: 0,
    applyWatermark: true,
    operatorCertified: true
  });

  const loadAllMaterials = () => {
    try {
      const list = mockStore.getStudyMaterials();
      setAllMaterials(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAllMaterials();
    // Pre-populate questions
    const initialQs = generateInitialQuestions(form.examId, form.examName, form.sections);
    setDigitizedQuestions(initialQs);
  }, []);

  // When exam selection changes, pre-load typical blueprints & questions
  const handleSelectExam = (examId: string) => {
    playSound('warp');
    const selected = POPULAR_PYQ_EXAMS.find(e => e.id === examId);
    if (!selected) return;

    let defaultSections: PreviousYearPaperSection[] = [];
    let defaultStage = 'GENERAL';
    let defaultClass = 'Graduation';

    if (examId === 'SSC_CGL') {
      defaultSections = [
        { name: 'General Intelligence & Reasoning', questionCount: 25, marks: 50, negativeMarks: 0.50 },
        { name: 'General Awareness', questionCount: 25, marks: 50, negativeMarks: 0.50 },
        { name: 'Quantitative Aptitude', questionCount: 25, marks: 50, negativeMarks: 0.50 },
        { name: 'English Comprehension', questionCount: 25, marks: 50, negativeMarks: 0.50 }
      ];
      defaultClass = 'Graduation';
    } else if (examId === 'UP_POLICE') {
      defaultSections = [
        { name: 'General Knowledge (Samanya Gyan)', questionCount: 38, marks: 76, negativeMarks: 0.50 },
        { name: 'General Hindi', questionCount: 37, marks: 74, negativeMarks: 0.50 },
        { name: 'Numerical & Mental Ability', questionCount: 38, marks: 76, negativeMarks: 0.50 },
        { name: 'Mental Aptitude & Reasoning', questionCount: 37, marks: 74, negativeMarks: 0.50 }
      ];
      defaultClass = 'Intermediate (12th)';
      defaultStage = 'SENIOR_SECONDARY';
    } else if (examId === 'NEET_UG') {
      defaultSections = [
        { name: 'Physics (Section A & B)', questionCount: 50, marks: 180, negativeMarks: 1.00 },
        { name: 'Chemistry (Section A & B)', questionCount: 50, marks: 180, negativeMarks: 1.00 },
        { name: 'Botany (Section A & B)', questionCount: 50, marks: 180, negativeMarks: 1.00 },
        { name: 'Zoology (Section A & B)', questionCount: 50, marks: 180, negativeMarks: 1.00 }
      ];
      defaultClass = 'Class 12';
      defaultStage = 'SENIOR_SECONDARY';
    } else if (examId === 'IIT_JEE') {
      defaultSections = [
        { name: 'Physics', questionCount: 30, marks: 100, negativeMarks: 1.00 },
        { name: 'Chemistry', questionCount: 30, marks: 100, negativeMarks: 1.00 },
        { name: 'Mathematics', questionCount: 30, marks: 100, negativeMarks: 1.00 }
      ];
      defaultClass = 'Class 12';
      defaultStage = 'SENIOR_SECONDARY';
    } else {
      defaultSections = [
        { name: 'General Studies & Reasoning', questionCount: 50, marks: 100, negativeMarks: selected.neg },
        { name: 'Subject Knowledge', questionCount: 50, marks: 100, negativeMarks: selected.neg }
      ];
    }

    setForm(prev => ({
      ...prev,
      examId: selected.id,
      examName: selected.name,
      examCategory: selected.category,
      conductingAuthority: selected.authority,
      durationMinutes: selected.defaultDuration,
      negativeMarking: selected.neg,
      sections: defaultSections,
      targetClass: defaultClass,
      educationStage: defaultStage as any,
      paperCode: `${selected.id}-${prev.examYear}-S1`
    }));

    const qs = generateInitialQuestions(selected.id, selected.name, defaultSections);
    setDigitizedQuestions(qs);
  };

  // Section Blueprint Calculations
  const totalQuestionsCalc = form.sections.reduce((acc, s) => acc + (Number(s.questionCount) || 0), 0);
  const totalMarksCalc = form.sections.reduce((acc, s) => acc + (Number(s.marks) || 0), 0);

  // Triggering the Futuristic AI Neural OCR Extraction Simulation
  const handleStartNeuralScan = () => {
    playSound('scan');
    setIsScanningActive(true);
    setScanProgress(10);
    setScanComplete(false);
    setScanLogs(['[0.05s] Ingesting PDF binary stream...', '[0.12s] Resolving multi-column layout geometry...']);

    const steps = [
      { p: 25, log: '[0.28s] Optical symbol recognition: Processing Hindi & English bilingual tokens...' },
      { p: 50, log: '[0.52s] LaTeX expression parser: Extracted mathematical equations and formula radicals...' },
      { p: 75, log: '[0.78s] Answer key correlation: Correlated booklet options against conducting body key...' },
      { p: 90, log: '[0.94s] Step-by-step derivation link: Tagged 100% solutions with verified step marking...' },
      { p: 100, log: '[1.12s] Extraction complete: 100% questions parsed with 99.6% OCR confidence score.' }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const item = steps[stepIndex];
        setScanProgress(item.p);
        setScanLogs(prev => [...prev, item.log]);
        playSound('scan');
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsScanningActive(false);
        setScanComplete(true);
        playSound('confirm');
        showToast('Neural OCR & Layout Extraction 100% verified with 99.6% confidence!', 'success');
      }
    }, 280);
  };

  // Parse Raw Text Dump into Questions
  const handleParseRawText = () => {
    playSound('warp');
    if (!rawTextDump.trim()) {
      showToast('Please paste question text before parsing', 'error');
      return;
    }

    try {
      const qBlocks = rawTextDump.split(/\n\s*\n/).filter(b => b.trim().length > 0);
      const parsed: DigitizedQuestionItem[] = [];

      qBlocks.forEach((block, idx) => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        const qLine = lines.find(l => l.startsWith('Q') || l.match(/^\d+[\.\)]/)) || lines[0] || `Question #${idx + 1}`;
        const optA = lines.find(l => l.startsWith('(A)') || l.startsWith('A.'))?.replace(/^\(A\)\s*|^A\.\s*/, '') || 'Option A proposition';
        const optB = lines.find(l => l.startsWith('(B)') || l.startsWith('B.'))?.replace(/^\(B\)\s*|^B\.\s*/, '') || 'Option B proposition';
        const optC = lines.find(l => l.startsWith('(C)') || l.startsWith('C.'))?.replace(/^\(C\)\s*|^C\.\s*/, '') || 'Option C proposition';
        const optD = lines.find(l => l.startsWith('(D)') || l.startsWith('D.'))?.replace(/^\(D\)\s*|^D\.\s*/, '') || 'Option D proposition';
        const ansLine = lines.find(l => l.toLowerCase().startsWith('answer:') || l.toLowerCase().startsWith('ans:'));
        const matchedAns = ansLine ? ansLine.replace(/[^ABCD]/gi, '').toUpperCase() : 'A';
        const expLine = lines.find(l => l.toLowerCase().startsWith('explanation:') || l.toLowerCase().startsWith('exp:'));
        const expText = expLine ? expLine.replace(/^explanation:\s*|^exp:\s*/i, '') : 'Official verified key explanation.';

        parsed.push({
          id: `raw-q-${Date.now()}-${idx + 1}`,
          questionNumber: idx + 1,
          sectionName: form.sections[0]?.name || 'General Section',
          questionText: qLine,
          options: [
            { key: 'A', text: optA },
            { key: 'B', text: optB },
            { key: 'C', text: optC },
            { key: 'D', text: optD }
          ],
          correctAnswer: (['A', 'B', 'C', 'D'].includes(matchedAns) ? matchedAns : 'A') as any,
          explanation: expText,
          marks: 2,
          negativeMarks: 0.5,
          hasFormula: false,
          confidence: 99.8
        });
      });

      if (parsed.length > 0) {
        setDigitizedQuestions(parsed);
        setScanComplete(true);
        playSound('confirm');
        showToast(`Parsed ${parsed.length} questions from raw text dump cleanly!`, 'success');
      }
    } catch (e) {
      console.error(e);
      playSound('alert');
      showToast('Error parsing raw text stream. Check format.', 'error');
    }
  };

  // Pre-fill from Matrix slot click
  const handleMatrixSlotClick = (examId: string, year: number, shift: typeof SHIFTS[0]) => {
    playSound('warp');
    handleSelectExam(examId);
    setForm(prev => ({
      ...prev,
      examYear: year,
      shift: shift.label,
      shiftTiming: shift.timing,
      paperCode: `${examId}-${year}-${shift.id}-A`,
      masterPaperFileName: `${examId}_${year}_${shift.id}_Master_Booklet.pdf`
    }));
    setCurrentStep(1);
    showToast(`Pre-loaded ${examId} ${year} (${shift.label}) into Digitize Studio!`, 'info');
  };

  // Add Question in Studio
  const handleAddNewQuestion = () => {
    playSound('click');
    const newNum = digitizedQuestions.length + 1;
    const defaultSec = form.sections[0]?.name || 'General Intelligence';
    const newQ: DigitizedQuestionItem = {
      id: `q-manual-${Date.now()}`,
      questionNumber: newNum,
      sectionName: defaultSec,
      questionText: `[Manual Entry] New authentic exam question #${newNum} for ${form.examName}`,
      options: [
        { key: 'A', text: 'Option A candidate proposition' },
        { key: 'B', text: 'Option B candidate proposition' },
        { key: 'C', text: 'Option C candidate proposition' },
        { key: 'D', text: 'Option D candidate proposition' }
      ],
      correctAnswer: 'A',
      explanation: 'Verified solution as approved by operator.',
      marks: 2,
      negativeMarks: 0.5,
      hasFormula: false,
      confidence: 100
    };
    setDigitizedQuestions(prev => [...prev, newQ]);
    setEditingQuestionId(newQ.id);
    showToast(`Appended Question Q.${newNum} to studio grid!`, 'info');
  };

  // Remove Question
  const handleDeleteQuestion = (id: string) => {
    playSound('alert');
    setDigitizedQuestions(prev => prev.filter(q => q.id !== id));
    showToast('Question removed from paper draft', 'info');
  };

  // Update Question Content
  const handleUpdateQuestion = (id: string, updates: Partial<DigitizedQuestionItem>) => {
    setDigitizedQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  // Toggle Option Key
  const handleSetCorrectOption = (qId: string, optKey: 'A' | 'B' | 'C' | 'D') => {
    playSound('toggle');
    handleUpdateQuestion(qId, { correctAnswer: optKey });
  };

  // Filtered Questions for Preview
  const filteredQuestions = useMemo(() => {
    if (selectedSectionFilter === 'ALL') return digitizedQuestions;
    return digitizedQuestions.filter(q => q.sectionName === selectedSectionFilter);
  }, [digitizedQuestions, selectedSectionFilter]);

  // Submission / Publishing Handler
  const handlePublishPaper = async () => {
    if (!form.operatorCertified) {
      playSound('alert');
      showToast('Please certify the authenticity of the paper before publishing.', 'error');
      return;
    }

    playSound('warp');

    const pyqMeta: PreviousYearPaperMetadata = {
      examId: form.examId,
      examName: form.examName,
      examCategory: form.examCategory,
      conductingAuthority: form.conductingAuthority,
      examYear: Number(form.examYear),
      tierOrStage: form.tierOrStage,
      examDate: form.examDate,
      shift: form.shift,
      shiftTiming: form.shiftTiming,
      paperCode: form.paperCode,
      language: form.language,
      totalQuestions: totalQuestionsCalc,
      totalMarks: totalMarksCalc,
      durationMinutes: Number(form.durationMinutes),
      negativeMarking: Number(form.negativeMarking),
      sections: form.sections,
      masterPaperPdfUrl: form.masterPaperPdfUrl,
      masterPaperFileName: form.masterPaperFileName,
      masterPaperFileSize: form.masterPaperFileSize,
      hasOfficialAnswerKey: form.hasOfficialAnswerKey,
      officialAnswerKeyUrl: form.officialAnswerKeyUrl,
      hasStepByStepSolutions: form.hasStepByStepSolutions,
      solvedSolutionsPdfUrl: form.solvedSolutionsPdfUrl,
      isCbtAvailable: form.synthesizeCbtTest,
      ocrConfidenceScore: 99.6,
      aiDigitizedDate: new Date().toISOString().split('T')[0],
      plagiarismAndCopyrightCertified: true,
      watermarked: form.applyWatermark
    };

    const paperTitle = `${form.examName} ${form.examYear} ${form.tierOrStage} Official Paper (${form.shift} Code: ${form.paperCode})`;
    const tagList = [form.examId, `PYQ ${form.examYear}`, form.shift, form.paperCode, 'Official Paper', 'Solved Solutions'];

    const newMaterial: StudyMaterial = {
      id: `pyq-${form.examId.toLowerCase()}-${form.examYear}-${Date.now()}`,
      title: paperTitle,
      description: `Official authentic examination paper conducted by ${form.conductingAuthority} on ${form.examDate || form.examYear}. Includes complete verified answer key, step-by-step bilingual derivations, and interactive CBT test simulation.`,
      category: 'PREVIOUS_YEAR_PAPERS',
      targetClass: form.targetClass,
      educationStage: form.educationStage,
      subject: form.subject,
      academicSession: '2026-2027 (Current)',
      language: form.language,
      difficultyLevel: form.difficultyLevel,
      tags: tagList,
      fullPdfUrl: form.masterPaperPdfUrl,
      fileName: form.masterPaperFileName,
      fileSize: form.masterPaperFileSize,
      pageCount: Math.round(totalQuestionsCalc * 0.35) + 12,
      currentVersion: 'v1.0',
      versionHistory: [
        {
          versionId: `ver-pyq-${Date.now()}`,
          versionNumber: 'v1.0',
          fileUrl: form.masterPaperPdfUrl,
          fileName: form.masterPaperFileName,
          fileSize: form.masterPaperFileSize,
          pageCount: Math.round(totalQuestionsCalc * 0.35) + 12,
          uploadedAt: new Date().toISOString(),
          uploadedBy: operatorName,
          changeLog: 'Initial high-fidelity archival with official conducting body answer key.'
        }
      ],
      isPaid: form.isPaid,
      basePrice: form.isPaid ? Number(form.basePrice) : 0,
      isFeatured: true,
      isVerified: true,
      verifiedBy: 'National Exam Verification Bureau',
      totalDownloads: 120,
      totalPurchases: 0,
      rating: 5.0,
      reviewCount: 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'PUBLISHED',
      targetExams: [form.examId],
      targetGovernmentExams: [form.examId],
      pyqMetadata: pyqMeta
    };

    // Save to mockStore
    mockStore.addStudyMaterial(newMaterial);

    // If CBT generation is enabled, synthesize live mock test
    if (form.synthesizeCbtTest) {
      mockStore.synthesizeCbtMockTestFromPyq(newMaterial);
    }

    // Log Operator Activity
    await operatorService.logActivity({
      operatorId,
      operatorName,
      action: 'MATERIAL_UPLOAD',
      entity: 'STUDY_MATERIAL',
      entityId: newMaterial.id,
      entityTitle: newMaterial.title,
      details: `Digitized & published official exam paper: ${newMaterial.title} (${totalQuestionsCalc} Qs, ${totalMarksCalc} Marks, CBT Enabled: ${form.synthesizeCbtTest})`
    });

    playSound('confirm');
    setPublishedItem(newMaterial);
    loadAllMaterials();
    showToast('Official Exam PYQ Paper digitized and published to catalog!', 'success');
  };

  // Launch In-Studio CBT Test Run
  const handleLaunchCbtSimulator = () => {
    playSound('warp');
    setSimCurrentQIndex(0);
    setSimUserAnswers({});
    setSimTimeRemaining(form.durationMinutes * 60);
    setSimSubmitted(false);
    setIsCbtSimulatorOpen(true);
  };

  // CBT Simulator: Submit Answers
  const handleSimSubmit = () => {
    playSound('confirm');
    setSimSubmitted(true);
  };

  // CBT Score calculation
  const simScoreStats = useMemo(() => {
    if (!digitizedQuestions.length) return { score: 0, attempted: 0, correct: 0, accuracy: 0 };
    let correct = 0;
    let attempted = 0;

    digitizedQuestions.forEach((q, i) => {
      const userAns = simUserAnswers[i];
      if (userAns) {
        attempted++;
        if (userAns === q.correctAnswer) {
          correct++;
        }
      }
    });

    const score = (correct * 2) - ((attempted - correct) * 0.5);
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    return { score, attempted, correct, accuracy };
  }, [digitizedQuestions, simUserAnswers]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* ============================================================ */}
      {/* 1. CYBER-HUD HERO BANNER & REAL-TIME OCR TELEMETRY */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>NEURAL AI PYQ DIGITIZER STUDIO v5.2</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                OCR ENGINE: ONLINE (99.6% CONFIDENCE)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                SHA-256 ANTI-TAMPER
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-cyan-400" />
              Exam Previous Year Paper (PYQ) Studio
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Ingest authentic past examination papers with shift-level accuracy, sectional blueprint math, official answer key validation, and 1-click conversion to interactive Computer-Based Testing (CBT) mock tests.
            </p>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                const nextState = !sfxEnabled;
                setSfxEnabled(nextState);
                playCyberAudio('toggle', nextState);
                showToast(nextState ? 'Neural HUD Audio Enabled' : 'HUD Audio Muted', 'info');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                sfxEnabled 
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]' 
                  : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {sfxEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{sfxEnabled ? 'HUD AUDIO ON' : 'AUDIO MUTED'}</span>
            </button>

            <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-right">
              <p className="text-[10px] uppercase font-mono text-slate-400">Appointed Operator</p>
              <p className="text-xs font-bold text-cyan-300 font-mono">{operatorName} &bull; OPR-IN-2026</p>
            </div>
          </div>
        </div>

        {/* Live Telemetry Ribbon */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>OCR Status: <strong className="text-emerald-400">99.6% Precision</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Vault Archive: <strong className="text-white">{allMaterials.length} Verified Exams</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>CBT Auto-Synthesizer: <strong className="text-amber-400">Active</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Anti-Leak Watermark: <strong className="text-cyan-400">Active</strong></span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. YEAR & SHIFT COVERAGE INTELLIGENCE MATRIX */}
      {/* ============================================================ */}
      <Card className="p-6 bg-slate-900/90 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Year & Shift Coverage Intelligence Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select an exam below to inspect past year shift archives. Click any missing shift to directly launch ingestion for that slot.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {POPULAR_PYQ_EXAMS.map(ex => (
              <button
                key={ex.id}
                onClick={() => {
                  playSound('click');
                  setMatrixExamId(ex.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  matrixExamId === ex.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {ex.id}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 font-semibold">Exam Year</th>
                {SHIFTS.map(s => (
                  <th key={s.id} className="py-3 px-4 font-semibold">{s.label}</th>
                ))}
                <th className="py-3 px-4 font-semibold text-right">Archived Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {AVAILABLE_YEARS.slice(0, 5).map(year => {
                return (
                  <tr key={year} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-cyan-300">
                        {year}
                      </span>
                    </td>

                    {SHIFTS.map(shift => {
                      // Check if already in platform materials
                      const match = allMaterials.find(m => 
                        m.pyqMetadata?.examId === matrixExamId &&
                        m.pyqMetadata?.examYear === year &&
                        m.pyqMetadata?.shift?.toLowerCase().includes(shift.id.toLowerCase())
                      );

                      if (match) {
                        return (
                          <td key={shift.id} className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Verified & Live</span>
                              {match.pyqMetadata?.isCbtAvailable && (
                                <span className="ml-1 px-1 py-0.2 rounded bg-emerald-800/60 text-[9px] font-bold text-emerald-200">CBT</span>
                              )}
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={shift.id} className="py-3.5 px-4">
                          <button
                            onClick={() => handleMatrixSlotClick(matrixExamId, year, shift)}
                            className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/70 hover:bg-cyan-950/60 border border-dashed border-slate-700 hover:border-cyan-400/60 text-slate-400 hover:text-cyan-300 text-[11px] transition-all cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                            <span>+ Digitize Slot</span>
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {year === 2024 ? '98% Coverage' : year === 2023 ? '85% Coverage' : 'Pending Ingestion'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ============================================================ */}
      {/* 3. 6-STEP INGESTION STUDIO WIZARD */}
      {/* ============================================================ */}
      <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 text-white shadow-2xl space-y-8">
        
        {/* Step Indicator Header */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">Ingestion Protocol</span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Step {currentStep} of 6: {
                  currentStep === 1 ? 'Exam & Paper Genome' :
                  currentStep === 2 ? 'Sectional Blueprint & Marking' :
                  currentStep === 3 ? 'Document Vault & Tri-Asset Archival' :
                  currentStep === 4 ? 'Futuristic AI Neural OCR Scanner & Question Editor' :
                  currentStep === 5 ? 'Interactive CBT Conversion & Tier' :
                  'Digital Signature & Holographic Publishing'
                }
              </h2>
            </div>

            {/* Step Navigation Indicator Pills */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
              {[1, 2, 3, 4, 5, 6].map(st => (
                <button
                  key={st}
                  onClick={() => {
                    playSound('click');
                    setCurrentStep(st);
                  }}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === st 
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' 
                      : currentStep > st 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' 
                        : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {currentStep > st ? <Check className="w-3.5 h-3.5" /> : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* STEP 1: Exam & Paper Identity (Genome) */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-3">
              <Zap className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Paper Genome Identification:</strong> Every previous year question paper must be bound to its exact year, shift, tier, and booklet series code so students and algorithms can cross-reference with official answer keys.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Examination *</label>
                <select
                  value={form.examId}
                  onChange={(e) => handleSelectExam(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 outline-none"
                >
                  {POPULAR_PYQ_EXAMS.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name} ({ex.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Examination Year *</label>
                <select
                  value={form.examYear}
                  onChange={(e) => {
                    playSound('click');
                    setForm(prev => ({ ...prev, examYear: Number(e.target.value) }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 outline-none font-mono"
                >
                  {AVAILABLE_YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tier / Stage / Phase *</label>
                <input
                  type="text"
                  value={form.tierOrStage}
                  onChange={(e) => setForm(prev => ({ ...prev, tierOrStage: e.target.value }))}
                  placeholder="e.g. Tier-1, Prelims, Phase-2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Shift / Slot *</label>
                <select
                  value={form.shift}
                  onChange={(e) => {
                    playSound('click');
                    const matched = SHIFTS.find(s => s.label === e.target.value);
                    setForm(prev => ({ 
                      ...prev, 
                      shift: e.target.value,
                      shiftTiming: matched?.timing || prev.shiftTiming 
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 outline-none"
                >
                  {SHIFTS.map(s => (
                    <option key={s.id} value={s.label}>{s.label}</option>
                  ))}
                  <option value="Single Shift">Single Shift (All India)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Exam Conducting Date</label>
                <input
                  type="date"
                  value={form.examDate}
                  onChange={(e) => setForm(prev => ({ ...prev, examDate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Booklet Code / Series Code *</label>
                <input
                  type="text"
                  value={form.paperCode}
                  onChange={(e) => setForm(prev => ({ ...prev, paperCode: e.target.value }))}
                  placeholder="e.g. CGL-24-S1-A, SET-B, CODE-R3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Medium / Language</label>
                <select
                  value={form.language}
                  onChange={(e) => setForm(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 outline-none"
                >
                  <option value="Bilingual (Hindi + English)">Bilingual (Hindi + English)</option>
                  <option value="English Only">English Only</option>
                  <option value="Hindi Only">Hindi Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Academic Level</label>
                <input
                  type="text"
                  value={form.targetClass}
                  onChange={(e) => setForm(prev => ({ ...prev, targetClass: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Conducting Authority</label>
                <input
                  type="text"
                  value={form.conductingAuthority}
                  onChange={(e) => setForm(prev => ({ ...prev, conductingAuthority: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            {/* Genome Hash Indicator */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Generated Genome Identifier:</span>
              <span className="text-cyan-400 font-bold px-3 py-1 rounded bg-slate-900 border border-slate-800">
                {form.examId}_{form.examYear}_{form.shift.replace(/\s+/g, '_')}_{form.paperCode}
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: Sectional Blueprint & Marking */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-3">
              <Layers className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Sectional Blueprint Mathematics:</strong> Ensure question counts and marks match official notifications. The sum calculates live test duration and automated CBT scoring rules.
              </div>
            </div>

            {/* Calculations Banner */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Questions</span>
                <strong className="text-lg text-cyan-400">{totalQuestionsCalc} Questions</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Maximum Marks</span>
                <strong className="text-lg text-purple-400">{totalMarksCalc} Marks</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Test Duration</span>
                <strong className="text-lg text-emerald-400">{form.durationMinutes} Minutes</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Negative Penalty</span>
                <strong className="text-lg text-amber-400">-{form.negativeMarking} Marks</strong>
              </div>
            </div>

            {/* Sections Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Section Configuration ({form.sections.length} Sections)</h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    playSound('click');
                    setForm(prev => ({
                      ...prev,
                      sections: [
                        ...prev.sections,
                        { name: `New Section ${prev.sections.length + 1}`, questionCount: 25, marks: 50, negativeMarks: 0.50 }
                      ]
                    }));
                  }}
                  className="bg-slate-800 text-xs text-cyan-300 border-slate-700 hover:bg-slate-700"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Section
                </Button>
              </div>

              {form.sections.map((sec, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-5">
                    <label className="text-[11px] text-slate-400 block mb-1">Section Name</label>
                    <input
                      type="text"
                      value={sec.name}
                      onChange={(e) => {
                        const copy = [...form.sections];
                        copy[idx].name = e.target.value;
                        setForm(prev => ({ ...prev, sections: copy }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">Questions</label>
                    <input
                      type="number"
                      value={sec.questionCount}
                      onChange={(e) => {
                        const copy = [...form.sections];
                        copy[idx].questionCount = Number(e.target.value);
                        setForm(prev => ({ ...prev, sections: copy }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">Marks</label>
                    <input
                      type="number"
                      value={sec.marks}
                      onChange={(e) => {
                        const copy = [...form.sections];
                        copy[idx].marks = Number(e.target.value);
                        setForm(prev => ({ ...prev, sections: copy }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">Negative</label>
                    <input
                      type="number"
                      step="0.25"
                      value={sec.negativeMarks}
                      onChange={(e) => {
                        const copy = [...form.sections];
                        copy[idx].negativeMarks = Number(e.target.value);
                        setForm(prev => ({ ...prev, sections: copy }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      disabled={form.sections.length <= 1}
                      onClick={() => {
                        playSound('alert');
                        const copy = form.sections.filter((_, i) => i !== idx);
                        setForm(prev => ({ ...prev, sections: copy }));
                      }}
                      className="p-2 text-slate-500 hover:text-red-400 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: Document Vault & Tri-Asset Archival + Raw Text Dump */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Tri-Asset Archival Standard:</strong> For highest credibility, each official examination paper repository hosts three synchronized assets: 1. Official Question Paper Booklet, 2. Provisional & Final Answer Keys, 3. Step-by-Step Solved Solutions.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Asset 1: Master Question Paper PDF */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  1
                </div>
                <h4 className="text-sm font-bold text-white">Master Question Paper PDF</h4>
                <p className="text-xs text-slate-400">Authentic scanned or digitally released question paper booklet.</p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 break-all">
                  {form.masterPaperFileName}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800 font-mono">
                  <span>Size: {form.masterPaperFileSize}</span>
                  <span className="text-emerald-400 font-semibold">&bull; Ready</span>
                </div>
              </div>

              {/* Asset 2: Official Answer Key */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  2
                </div>
                <h4 className="text-sm font-bold text-white">Official Answer Key</h4>
                <p className="text-xs text-slate-400">Conducting authority official key matching the booklet series.</p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 break-all">
                  {form.officialAnswerKeyUrl}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800 font-mono">
                  <span>Cross-Checked: 100%</span>
                  <span className="text-emerald-400 font-semibold">&bull; Verified</span>
                </div>
              </div>

              {/* Asset 3: Solved Explanations */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  3
                </div>
                <h4 className="text-sm font-bold text-white">Step-by-Step Solved Manual</h4>
                <p className="text-xs text-slate-400">Detailed derivations, shortcuts, NCERT references, and diagrams.</p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 break-all">
                  {form.solvedSolutionsPdfUrl}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800 font-mono">
                  <span>Format: PDF + LaTeX</span>
                  <span className="text-emerald-400 font-semibold">&bull; Ready</span>
                </div>
              </div>
            </div>

            {/* Quick Text Stream OCR Ingest Panel */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    Quick Text Stream OCR Ingest (Paste OCR Dump)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Paste raw text questions from paper OCR. The studio splits options, detects answers, and converts them to structured questions.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleParseRawText}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs border-indigo-400 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-300" /> Parse Raw Text Stream
                </Button>
              </div>

              <textarea
                value={rawTextDump}
                onChange={(e) => setRawTextDump(e.target.value)}
                rows={5}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-200 outline-none focus:border-cyan-400"
                placeholder="Paste Q1. Question Text\n(A) Option A\n(B) Option B\nAnswer: A\nExplanation: ..."
              />
            </div>

            {/* Watermark toggle */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Apply ZYZU'S Security Watermark & Official Seal</p>
                <p className="text-xs text-slate-400 mt-0.5">Embeds authenticated anti-tamper operator watermark across all PDF pages.</p>
              </div>
              <input
                type="checkbox"
                checked={form.applyWatermark}
                onChange={(e) => {
                  playSound('toggle');
                  setForm(prev => ({ ...prev, applyWatermark: e.target.checked }));
                }}
                className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: Futuristic AI Neural OCR Scanner & Question Editor */}
        {/* ============================================================ */}
        {currentStep === 4 && (
          <div className="space-y-6">
            
            {/* Neural Scanner Terminal Box */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
              {/* Animated Laser Scanning Line */}
              {isScanningActive && (
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce pointer-events-none"></div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                    <Cpu className="w-3.5 h-3.5 animate-spin" />
                    <span>NEURAL DOCUMENT SCANNER &bull; ACTIVE</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">AI Question Splitter & Equation Extractor</h3>
                  <p className="text-xs text-slate-400">
                    Runs optical symbol recognition, identifies question boundaries, detects LaTeX equations, and extracts answer keys.
                  </p>
                </div>

                <div>
                  <Button
                    variant="primary"
                    onClick={handleStartNeuralScan}
                    disabled={isScanningActive}
                    className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg"
                  >
                    {isScanningActive ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Scanning ({scanProgress}%)
                      </span>
                    ) : scanComplete ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Rescan Document
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Play className="w-3.5 h-3.5" /> Start Neural OCR Scan
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Scan Progress Telemetry */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Optical Parsing Progress</span>
                  <span className="text-cyan-400 font-bold">{scanProgress}% Completed</span>
                </div>
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-300 rounded-full shadow-[0_0_10px_#22d3ee]"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Terminal Logs */}
              {scanLogs.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] font-mono text-cyan-300/80 max-h-28 overflow-y-auto space-y-1">
                  {scanLogs.map((log, lIdx) => (
                    <div key={lIdx}>{log}</div>
                  ))}
                </div>
              )}

              {/* Extraction Stats Telemetry */}
              <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Extracted Questions</span>
                  <strong className="text-base font-bold text-white font-mono">{digitizedQuestions.length}/{totalQuestionsCalc}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">LaTeX Formulas Detected</span>
                  <strong className="text-base font-bold text-cyan-400 font-mono">42 Formulas</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Answer Key Correlation</span>
                  <strong className="text-base font-bold text-emerald-400 font-mono">100% Verified</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Confidence Rating</span>
                  <strong className="text-base font-bold text-indigo-400 font-mono">99.6% Rating</strong>
                </div>
              </div>
            </div>

            {/* Extracted Interactive Preview & Question Editor */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white">Extracted Question Editor & Key Grid</h4>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px]">
                    {digitizedQuestions.length} Questions in Memory
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedSectionFilter}
                    onChange={(e) => setSelectedSectionFilter(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 outline-none"
                  >
                    <option value="ALL">All Sections</option>
                    {form.sections.map((s, idx) => (
                      <option key={idx} value={s.name}>{s.name}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      playSound('click');
                      setPreviewTab('QUESTIONS');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${previewTab === 'QUESTIONS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Interactive Cards
                  </button>

                  <button
                    onClick={() => {
                      playSound('click');
                      setPreviewTab('ANSWER_KEY');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${previewTab === 'ANSWER_KEY' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    100-Key Grid
                  </button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleAddNewQuestion}
                    className="bg-slate-900 border-slate-700 text-cyan-300 text-xs hover:bg-slate-800"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Question
                  </Button>
                </div>
              </div>

              {previewTab === 'QUESTIONS' ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {filteredQuestions.map((q) => {
                    const isEditing = editingQuestionId === q.id;
                    return (
                      <div key={q.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono font-bold">
                              Q.{q.questionNumber} &bull; {q.sectionName}
                            </span>
                            {q.hasFormula && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 text-[10px] font-mono">
                                LaTeX Formatted
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-mono">+{q.marks} / -{q.negativeMarks}</span>
                            <button
                              onClick={() => {
                                playSound('click');
                                setEditingQuestionId(isEditing ? null : q.id);
                              }}
                              className="p-1 text-slate-400 hover:text-cyan-300"
                              title="Edit Question"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1 text-slate-400 hover:text-red-400"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Question Text */}
                        {isEditing ? (
                          <textarea
                            value={q.questionText}
                            onChange={(e) => handleUpdateQuestion(q.id, { questionText: e.target.value })}
                            rows={2}
                            className="w-full p-2.5 rounded-lg bg-slate-950 border border-cyan-500/50 text-xs text-white outline-none font-mono"
                          />
                        ) : (
                          <p className="text-xs text-slate-200 leading-relaxed font-sans">
                            {q.questionText}
                          </p>
                        )}

                        {/* 4 Options Matrix */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt) => {
                            const isCorrect = q.correctAnswer === opt.key;
                            return (
                              <div 
                                key={opt.key}
                                onClick={() => handleSetCorrectOption(q.id, opt.key)}
                                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2 ${
                                  isCorrect 
                                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold shadow-sm' 
                                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 font-mono text-[10px] ${
                                  isCorrect ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {opt.key}
                                </span>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => {
                                      const updatedOpts = q.options.map(o => o.key === opt.key ? { ...o, text: e.target.value } : o);
                                      handleUpdateQuestion(q.id, { options: updatedOpts });
                                    }}
                                    className="w-full bg-transparent border-none text-xs text-white outline-none"
                                  />
                                ) : (
                                  <span className="text-xs">{opt.text}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {isEditing ? (
                          <div className="pt-2">
                            <label className="text-[10px] text-slate-400 block mb-1 font-mono">Step-by-Step Official Explanation</label>
                            <input
                              type="text"
                              value={q.explanation}
                              onChange={(e) => handleUpdateQuestion(q.id, { explanation: e.target.value })}
                              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300 outline-none"
                            />
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{q.explanation}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* 100-Key Interactive Grid */
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Click any option letter below to toggle or override the official answer key for that question:
                  </p>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-72 overflow-y-auto p-3 bg-slate-900 rounded-xl">
                    {digitizedQuestions.map((q, i) => (
                      <div key={q.id} className="p-2 text-center rounded bg-slate-950 border border-slate-800 text-xs">
                        <span className="text-[10px] text-slate-500 block font-mono">Q{q.questionNumber}</span>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {(['A', 'B', 'C', 'D'] as const).map(optKey => (
                            <button
                              key={optKey}
                              onClick={() => handleSetCorrectOption(q.id, optKey)}
                              className={`w-4 h-4 rounded text-[9px] font-mono font-bold ${
                                q.correctAnswer === optKey 
                                  ? 'bg-cyan-500 text-slate-950' 
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {optKey}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 5: Interactive CBT Conversion & Test Simulator */}
        {/* ============================================================ */}
        {currentStep === 5 && (
          <div className="space-y-6">
            
            {/* CBT Mock Test Conversion Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    ZYZU'S CBT Mock Simulator
                  </div>
                  <h3 className="text-base font-bold text-white">Synthesize Live CBT Mock Test</h3>
                  <p className="text-xs text-slate-300 max-w-2xl">
                    When enabled, ZYZU'S automatically generates an interactive online CBT Mock Test so students can attempt this exact {form.examYear} {form.shift} paper under timed real-exam conditions with immediate rank analytics!
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.synthesizeCbtTest}
                    onChange={(e) => {
                      playSound('toggle');
                      setForm(prev => ({ ...prev, synthesizeCbtTest: e.target.checked }));
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {form.synthesizeCbtTest && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono items-center">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CBT Mode</span>
                    <strong className="text-white">Full CBT Replica</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Timed Limit</span>
                    <strong className="text-cyan-400">{form.durationMinutes} Minutes</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Marking Protocol</span>
                    <strong className="text-purple-400">+{Math.round(totalMarksCalc / (totalQuestionsCalc || 1)) || 2} / -{form.negativeMarking}</strong>
                  </div>
                  <div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleLaunchCbtSimulator}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                    >
                      <Play className="w-3.5 h-3.5 mr-1" /> Launch Test Drive
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Commercial Access Tier */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white">Student Access Tier</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => {
                    playSound('click');
                    setForm(prev => ({ ...prev, isPaid: false, basePrice: 0 }));
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    !form.isPaid 
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-md' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-white">Free Open Access</strong>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">Recommended</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Available to all registered ZYZU'S students without monthly quota deduction.</p>
                </div>

                <div 
                  onClick={() => {
                    playSound('click');
                    setForm(prev => ({ ...prev, isPaid: true, basePrice: 49 }));
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    form.isPaid 
                      ? 'bg-purple-950/40 border-purple-400 shadow-md' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-white">Premium Solved Booklet</strong>
                    <span className="text-purple-400 font-bold font-mono">₹49</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Requires standalone purchase or inclusion in Exam Pro Subscription Pass.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 6: Digital Signature & Holographic Publishing */}
        {/* ============================================================ */}
        {currentStep === 6 && (
          <div className="space-y-6">
            
            {/* Live Holographic Student Card Preview */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Live Student Catalog Preview</p>
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold">
                        {form.examId} {form.examYear}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-indigo-950 border border-indigo-500/50 text-indigo-300 text-xs font-semibold">
                        {form.shift}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono text-xs">
                        Code: {form.paperCode}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">
                      {form.examName} ({form.examYear}) Official Solved Paper
                    </h3>
                    <p className="text-xs text-slate-300">
                      Conducted by {form.conductingAuthority} on {form.examDate || form.examYear}. Includes verified answer key, step-by-step solutions, and CBT mode.
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      {form.isPaid ? `₹${form.basePrice}` : 'FREE PYQ'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>{totalQuestionsCalc} Questions</span>
                    <span>&bull;</span>
                    <span>{totalMarksCalc} Marks</span>
                    <span>&bull;</span>
                    <span>{form.durationMinutes} Mins</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {form.synthesizeCbtTest && (
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-semibold">
                        Interactive CBT Ready
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold">
                      100% Solved
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Operator Certification Checkbox */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.operatorCertified}
                  onChange={(e) => {
                    playSound('toggle');
                    setForm(prev => ({ ...prev, operatorCertified: e.target.checked }));
                  }}
                  className="w-5 h-5 accent-cyan-400 rounded cursor-pointer mt-0.5"
                />
                <div>
                  <strong className="text-sm text-white">Operator Quality & Authenticity Certification</strong>
                  <p className="text-xs text-slate-400 mt-0.5">
                    I hereby certify that this previous year question paper, official answer key, and step-by-step derivations have been authenticated against official releases by {form.conductingAuthority}.
                  </p>
                </div>
              </label>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Signing Operator: <strong className="text-white">{operatorName}</strong> (ID: OPR-IN-2026-001)</span>
                <span className="text-cyan-400">Timestamp: {new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <Button
            variant="secondary"
            disabled={currentStep === 1}
            onClick={() => {
              playSound('click');
              setCurrentStep(prev => Math.max(1, prev - 1));
            }}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous Step
          </Button>

          {currentStep < 6 ? (
            <Button
              variant="primary"
              onClick={() => {
                playSound('warp');
                setCurrentStep(prev => Math.min(6, prev + 1));
              }}
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-cyan-500/20"
            >
              Next Step <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handlePublishPaper}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-xl shadow-emerald-500/30"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Deploy PYQ Paper to Catalog & CBT
            </Button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. IN-STUDIO CBT TEST DRIVE SIMULATOR MODAL */}
      {/* ============================================================ */}
      {isCbtSimulatorOpen && (
        <Modal
          isOpen={isCbtSimulatorOpen}
          onClose={() => setIsCbtSimulatorOpen(false)}
          title="In-Studio Interactive CBT Test Simulator"
          size="2xl"
        >
          <div className="p-6 bg-slate-950 text-white rounded-2xl space-y-6">
            
            {/* Header Telemetry */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Test Identity</span>
                <strong className="text-cyan-400">{form.examName} ({form.examYear}) - {form.shift}</strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Timer Remaining</span>
                <strong className="text-amber-400 flex items-center gap-1 text-sm">
                  <Clock className="w-4 h-4" />
                  {Math.floor(simTimeRemaining / 60)}:{(simTimeRemaining % 60).toString().padStart(2, '0')}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Marking Scheme</span>
                <strong className="text-purple-400">+2.00 / -0.50</strong>
              </div>
            </div>

            {!simSubmitted ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Active Question Area */}
                <div className="lg:col-span-8 space-y-4">
                  {digitizedQuestions[simCurrentQIndex] ? (
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40 font-bold">
                          Question {simCurrentQIndex + 1} of {digitizedQuestions.length}
                        </span>
                        <span className="text-slate-400">
                          Section: {digitizedQuestions[simCurrentQIndex].sectionName}
                        </span>
                      </div>

                      <p className="text-sm text-slate-100 font-sans leading-relaxed">
                        {digitizedQuestions[simCurrentQIndex].questionText}
                      </p>

                      {/* Options */}
                      <div className="space-y-2 pt-2">
                        {digitizedQuestions[simCurrentQIndex].options.map(opt => {
                          const isSelected = simUserAnswers[simCurrentQIndex] === opt.key;
                          return (
                            <div
                              key={opt.key}
                              onClick={() => {
                                playCyberAudio('click', true);
                                setSimUserAnswers(prev => ({ ...prev, [simCurrentQIndex]: opt.key }));
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 text-xs ${
                                isSelected 
                                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-md font-semibold' 
                                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                                isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Question Navigation Controls */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={simCurrentQIndex === 0}
                          onClick={() => setSimCurrentQIndex(prev => Math.max(0, prev - 1))}
                          className="bg-slate-800 text-xs"
                        >
                          Previous
                        </Button>

                        <button
                          onClick={() => {
                            setSimUserAnswers(prev => {
                              const copy = { ...prev };
                              delete copy[simCurrentQIndex];
                              return copy;
                            });
                          }}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Clear Selection
                        </button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            if (simCurrentQIndex < digitizedQuestions.length - 1) {
                              setSimCurrentQIndex(prev => prev + 1);
                            } else {
                              handleSimSubmit();
                            }
                          }}
                          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                        >
                          {simCurrentQIndex < digitizedQuestions.length - 1 ? 'Save & Next' : 'Submit Test'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs">No questions loaded in draft.</div>
                  )}
                </div>

                {/* Question Palette */}
                <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h5 className="text-xs font-bold text-slate-300 font-mono">Question Palette</h5>
                  <div className="grid grid-cols-5 gap-1.5 max-h-60 overflow-y-auto pr-1">
                    {digitizedQuestions.map((_, idx) => {
                      const isAnswered = !!simUserAnswers[idx];
                      const isCurrent = simCurrentQIndex === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSimCurrentQIndex(idx)}
                          className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                            isCurrent 
                              ? 'ring-2 ring-cyan-400 bg-indigo-600 text-white' 
                              : isAnswered 
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
                      <span>Answered ({Object.keys(simUserAnswers).length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-slate-800"></span>
                      <span>Unanswered ({digitizedQuestions.length - Object.keys(simUserAnswers).length})</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSimSubmit}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs mt-2"
                  >
                    Submit Test Run
                  </Button>
                </div>
              </div>
            ) : (
              /* Scorecard / Result Summary */
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
                <Award className="w-12 h-12 text-cyan-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Simulated Test Run Complete!</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono max-w-lg mx-auto">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Net Score</span>
                    <strong className="text-base text-cyan-400 font-bold">{simScoreStats.score} Marks</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Attempted</span>
                    <strong className="text-base text-white">{simScoreStats.attempted}/{digitizedQuestions.length}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Correct Answers</span>
                    <strong className="text-base text-emerald-400">{simScoreStats.correct}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Accuracy</span>
                    <strong className="text-base text-purple-400">{simScoreStats.accuracy}%</strong>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSimSubmitted(false);
                      setSimUserAnswers({});
                      setSimCurrentQIndex(0);
                    }}
                    className="bg-slate-800 text-xs"
                  >
                    Retake Simulator
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setIsCbtSimulatorOpen(false)}
                    className="bg-cyan-600 text-slate-950 font-bold text-xs"
                  >
                    Close Simulator
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* 5. PUBLISHED CELEBRATION MODAL */}
      {/* ============================================================ */}
      {publishedItem && (
        <Modal
          isOpen={!!publishedItem}
          onClose={() => setPublishedItem(null)}
          title="Official PYQ Paper Successfully Published!"
          size="lg"
        >
          <div className="p-6 bg-slate-950 text-white rounded-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">{publishedItem.title}</h3>
              <p className="text-xs text-slate-300">
                Official shift paper is now archived in the Study Material Vault and synthesized into live Computer-Based Testing (CBT) mock engines!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Vault Item ID:</span>
                <span className="text-cyan-400">{publishedItem.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Questions:</span>
                <span className="text-white">{totalQuestionsCalc} Questions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CBT Mode:</span>
                <span className="text-emerald-400">Interactive Simulator Active</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/operator/study-material"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all text-center"
              >
                View in Study Material Vault
              </Link>
              <Button
                variant="primary"
                onClick={() => {
                  setPublishedItem(null);
                  handleLaunchCbtSimulator();
                }}
                className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Launch Live CBT Test Run
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPublishedItem(null)}
                className="w-full sm:w-auto bg-slate-800 text-white text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
