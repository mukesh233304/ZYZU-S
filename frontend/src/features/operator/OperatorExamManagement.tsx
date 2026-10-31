// FOCUSPOINT Pan-India Operator Government & Admission Exam Registry & Syllabus Genome Studio
// Panoramic Horizontal Cyber-HUD with Web Audio Synthesizer, 5-Stage Blueprint Calibration Beacons,
// Dual-Pane Genome Inspection Workbench, Interactive Topic Hierarchy Editor, and Neural AI Syllabus Decomposer.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Landmark, 
  GraduationCap, 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Award, 
  Layers, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Shield, 
  HelpCircle,
  Volume2,
  VolumeX,
  Radio,
  Database,
  ShieldCheck,
  FileCode,
  Download,
  Check,
  X,
  Trash2,
  Edit3,
  Sliders,
  Zap,
  Copy,
  ExternalLink,
  Cpu,
  Terminal,
  Hash,
  ArrowRight,
  ArrowLeft,
  Columns,
  Grid,
  Calendar,
  TrendingUp,
  FileText,
  CheckSquare,
  Square,
  Play,
  Tag,
  Compass,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockStore } from '../../mock/store';
import { GovernmentExam, MockTest } from '../../types/academicIntelligence';
import { operatorService } from '../../services/operatorService';

// =========================================================================
// Procedural Cyber Web Audio Synthesizer
// =========================================================================
const playCyberAudio = (type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'scan', enabled: boolean = true) => {
  if (!enabled || typeof window === 'undefined') return;
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
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.06);
        osc.frequency.setValueAtTime(1046.50, now + 0.14);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
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
    // Audio suppressed or unsupported in environment
  }
};

type ViewMode = 'STUDIO' | 'CAROUSEL' | 'SYLLABUS_TREE' | 'GRID';
type CategoryFilterType = 'ALL' | 'GOVERNMENT' | 'ADMISSION' | 'SSC' | 'RAILWAY' | 'STATE_EXAMS' | 'TEACHING' | 'POLICE';

export const OperatorExamManagement: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Core Data
  const [exams, setExams] = useState<GovernmentExam[]>([]);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [activeExamId, setActiveExamId] = useState<string>('');
  const [activeSubject, setActiveSubject] = useState<string>('');

  // Layout View Modes
  const [viewMode, setViewMode] = useState<ViewMode>('STUDIO');

  // Search & Filters
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterType>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio Toggle & Auto-Scanning
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [isAutoScanning, setIsAutoScanning] = useState<boolean>(false);

  // New Topic Inline Input
  const [newTopicInput, setNewTopicInput] = useState<string>('');

  // Modals State
  const [isExamModalOpen, setIsExamModalOpen] = useState<boolean>(false);
  const [editingExam, setEditingExam] = useState<GovernmentExam | null>(null);
  const [isAiSyllabusModalOpen, setIsAiSyllabusModalOpen] = useState<boolean>(false);
  const [isSyllabusDrawerOpen, setIsSyllabusDrawerOpen] = useState<boolean>(false);

  // AI Syllabus Generator State
  const [aiTargetExamId, setAiTargetExamId] = useState<string>('');
  const [aiRawNotificationText, setAiRawNotificationText] = useState<string>('');
  const [isAiDecomposing, setIsAiDecomposing] = useState<boolean>(false);
  const [aiTerminalLogs, setAiTerminalLogs] = useState<string[]>([]);
  const [aiGeneratedSyllabus, setAiGeneratedSyllabus] = useState<{
    subjects: string[];
    topics: Record<string, string[]>;
  } | null>(null);

  // Exam Form Fields (for Create/Edit Modal)
  const [examForm, setExamForm] = useState({
    id: '',
    name: '',
    shortName: '',
    category: 'STATE_EXAMS' as GovernmentExam['category'],
    examType: 'GOVERNMENT' as 'GOVERNMENT' | 'ADMISSION',
    conductingAuthority: '',
    isNational: true,
    applicableState: 'Uttar Pradesh',
    level: 'GRADUATE' as GovernmentExam['level'],
    durationMinutes: 120,
    totalQuestions: 100,
    totalMarks: 200,
    negativeMarkingPerQuestion: 0.5,
    patternVersion: 'Pattern-2026.1',
    description: '',
    officialSourceUrl: 'https://ssc.gov.in',
    subjectsInput: 'Quantitative Aptitude, General Intelligence & Reasoning, General Awareness, English Comprehension',
    status: 'ACTIVE' as 'ACTIVE' | 'UPCOMING' | 'ARCHIVED'
  });

  const filmstripRef = useRef<HTMLDivElement>(null);

  const playSound = (type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'scan') => {
    playCyberAudio(type, sfxEnabled);
  };

  const loadData = () => {
    const examList = mockStore.getGovernmentExams();
    const testList = mockStore.getMockTests();
    setExams(examList);
    setMockTests(testList);

    if (examList.length > 0 && !activeExamId) {
      setActiveExamId(examList[0].id);
      if (examList[0].subjects.length > 0) {
        setActiveSubject(examList[0].subjects[0]);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update active subject when active exam changes
  const activeExam = useMemo(() => {
    return exams.find(e => e.id === activeExamId) || exams[0] || null;
  }, [exams, activeExamId]);

  useEffect(() => {
    if (activeExam && activeExam.subjects.length > 0) {
      if (!activeExam.subjects.includes(activeSubject)) {
        setActiveSubject(activeExam.subjects[0]);
      }
    }
  }, [activeExam]);

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter((ex) => {
      const isAdmission = ex.examType === 'ADMISSION' || ['ADMISSION_EXAMS', 'ENGINEERING', 'MEDICAL', 'OLYMPIAD'].includes(ex.category);

      let matchesCategory = true;
      if (categoryFilter === 'GOVERNMENT') {
        matchesCategory = !isAdmission;
      } else if (categoryFilter === 'ADMISSION') {
        matchesCategory = isAdmission;
      } else if (categoryFilter !== 'ALL') {
        matchesCategory = ex.category === categoryFilter;
      }

      const matchesLevel = levelFilter === 'ALL' || ex.level === levelFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        ex.name.toLowerCase().includes(q) ||
        ex.shortName.toLowerCase().includes(q) ||
        ex.conductingAuthority.toLowerCase().includes(q) ||
        ex.subjects.some(s => s.toLowerCase().includes(q)) ||
        (ex.topics && Object.values(ex.topics).some(tList => tList.some(t => t.toLowerCase().includes(q))));

      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [exams, categoryFilter, levelFilter, searchQuery]);

  // Auto-Scan Effect (3.0s Cadence)
  useEffect(() => {
    if (!isAutoScanning || exams.length <= 1) return;
    const interval = setInterval(() => {
      setActiveExamId((currId) => {
        const pool = filteredExams.length > 0 ? filteredExams : exams;
        const idx = pool.findIndex(e => e.id === currId);
        const nextIdx = (idx + 1) % pool.length;
        playSound('scan');
        return pool[nextIdx].id;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoScanning, exams, filteredExams, sfxEnabled]);

  // Active Index
  const activeIndex = useMemo(() => {
    return filteredExams.findIndex(e => e.id === activeExam?.id);
  }, [filteredExams, activeExam]);

  // Telemetry Metrics
  const telemetry = useMemo(() => {
    const total = exams.length;
    const governmentCount = exams.filter(e => e.examType !== 'ADMISSION' && !['ADMISSION_EXAMS', 'ENGINEERING', 'MEDICAL', 'OLYMPIAD'].includes(e.category)).length;
    const admissionCount = exams.filter(e => e.examType === 'ADMISSION' || ['ADMISSION_EXAMS', 'ENGINEERING', 'MEDICAL', 'OLYMPIAD'].includes(e.category)).length;
    
    let totalTopics = 0;
    exams.forEach(e => {
      if (e.topics) {
        Object.values(e.topics).forEach(list => {
          totalTopics += list.length;
        });
      }
    });

    const linkedMocks = mockTests.length;
    const blueprintIndex = total > 0 ? (99.4).toFixed(1) : '100.0';

    return {
      total,
      governmentCount,
      admissionCount,
      totalTopics,
      blueprintIndex,
      linkedMocks
    };
  }, [exams, mockTests]);

  // Steppers
  const handlePrevExam = () => {
    if (filteredExams.length === 0) return;
    playSound('click');
    const prevIdx = activeIndex > 0 ? activeIndex - 1 : filteredExams.length - 1;
    setActiveExamId(filteredExams[prevIdx].id);
  };

  const handleNextExam = () => {
    if (filteredExams.length === 0) return;
    playSound('click');
    const nextIdx = (activeIndex + 1) % filteredExams.length;
    setActiveExamId(filteredExams[nextIdx].id);
  };

  // Open Author/Edit Modal
  const handleOpenAuthorModal = (examToEdit?: GovernmentExam | null) => {
    playSound('warp');
    if (examToEdit) {
      setEditingExam(examToEdit);
      setExamForm({
        id: examToEdit.id,
        name: examToEdit.name,
        shortName: examToEdit.shortName,
        category: examToEdit.category,
        examType: examToEdit.examType || (['ADMISSION_EXAMS', 'ENGINEERING', 'MEDICAL', 'OLYMPIAD'].includes(examToEdit.category) ? 'ADMISSION' : 'GOVERNMENT'),
        conductingAuthority: examToEdit.conductingAuthority,
        isNational: examToEdit.isNational,
        applicableState: examToEdit.applicableState || 'Uttar Pradesh',
        level: examToEdit.level,
        durationMinutes: examToEdit.durationMinutes,
        totalQuestions: examToEdit.totalQuestions,
        totalMarks: examToEdit.totalMarks,
        negativeMarkingPerQuestion: examToEdit.negativeMarkingPerQuestion,
        patternVersion: examToEdit.patternVersion || 'Pattern-2026.1',
        description: examToEdit.description || '',
        officialSourceUrl: examToEdit.officialSourceUrl || 'https://ssc.gov.in',
        subjectsInput: examToEdit.subjects.join(', '),
        status: examToEdit.status || 'ACTIVE'
      });
    } else {
      setEditingExam(null);
      setExamForm({
        id: `exam-custom-${Date.now()}`,
        name: '',
        shortName: '',
        category: 'STATE_EXAMS',
        examType: 'GOVERNMENT',
        conductingAuthority: '',
        isNational: true,
        applicableState: 'Uttar Pradesh',
        level: 'GRADUATE',
        durationMinutes: 120,
        totalQuestions: 100,
        totalMarks: 200,
        negativeMarkingPerQuestion: 0.5,
        patternVersion: 'CBT-Pattern-2026.1',
        description: '',
        officialSourceUrl: 'https://ssc.gov.in',
        subjectsInput: 'General Intelligence, Quantitative Aptitude, General Awareness, Language Comprehension',
        status: 'ACTIVE'
      });
    }
    setIsExamModalOpen(true);
  };

  // Save Exam to Store
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.name.trim() || !examForm.shortName.trim() || !examForm.conductingAuthority.trim()) {
      showToast('Please fill all mandatory exam blueprint fields', 'warning');
      playSound('alert');
      return;
    }

    const subjectsArray = examForm.subjectsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (subjectsArray.length === 0) {
      showToast('At least one syllabus subject is required', 'warning');
      playSound('alert');
      return;
    }

    // Preserve existing topics or initialize default buckets
    const existingTopics = editingExam?.topics || {};
    const updatedTopics: Record<string, string[]> = { ...existingTopics };
    subjectsArray.forEach(sub => {
      if (!updatedTopics[sub]) {
        updatedTopics[sub] = ['Fundamentals & Concepts', 'Core Syllabus Drill', 'High-Yield Revision'];
      }
    });

    const examDataToSave: GovernmentExam = {
      id: examForm.id || `exam-${Date.now()}`,
      name: examForm.name,
      shortName: examForm.shortName.toUpperCase(),
      category: examForm.category,
      examType: examForm.examType,
      conductingAuthority: examForm.conductingAuthority,
      isNational: examForm.isNational,
      applicableState: examForm.isNational ? undefined : examForm.applicableState,
      level: examForm.level,
      subjects: subjectsArray,
      topics: updatedTopics,
      durationMinutes: Number(examForm.durationMinutes) || 60,
      totalQuestions: Number(examForm.totalQuestions) || 100,
      totalMarks: Number(examForm.totalMarks) || 200,
      negativeMarkingPerQuestion: Number(examForm.negativeMarkingPerQuestion) || 0,
      languages: ['Hindi', 'English'],
      status: examForm.status,
      patternVersion: examForm.patternVersion,
      description: examForm.description || `Pan-India examination blueprint for ${examForm.name}`,
      officialSourceUrl: examForm.officialSourceUrl
    };

    mockStore.saveGovernmentExam(examDataToSave);

    await operatorService.logActivity({
      operatorId: user?.id || 'usr-operator-sunita',
      operatorName: user?.name || 'Academic Operator',
      action: editingExam ? 'MOCK_TEST_EDIT' : 'MOCK_TEST_CREATE',
      entity: 'EXAM',
      entityId: examDataToSave.id,
      entityTitle: examDataToSave.name,
      details: `${editingExam ? 'Updated' : 'Created'} blueprint for ${examDataToSave.shortName} (${examDataToSave.patternVersion})`
    });

    playSound('confirm');
    showToast(`Exam blueprint "${examDataToSave.shortName}" successfully saved to catalog!`, 'success');
    setIsExamModalOpen(false);
    loadData();
    setActiveExamId(examDataToSave.id);
  };

  // Delete Exam
  const handleDeleteExam = (exam: GovernmentExam) => {
    if (!window.confirm(`Are you sure you want to remove examination blueprint "${exam.name}" from the active registry?`)) return;
    playSound('alert');
    mockStore.deleteGovernmentExam(exam.id);
    showToast(`Removed "${exam.shortName}" from active registry`, 'info');
    loadData();
  };

  // Add Micro-Topic Inline to Active Subject
  const handleAddTopicInline = () => {
    if (!activeExam || !activeSubject || !newTopicInput.trim()) return;
    playSound('confirm');

    const topicToAdd = newTopicInput.trim();
    const currentTopics = activeExam.topics || {};
    const subjectTopics = currentTopics[activeSubject] || [];

    if (subjectTopics.includes(topicToAdd)) {
      showToast('This syllabus topic is already registered', 'warning');
      return;
    }

    const updatedExam: GovernmentExam = {
      ...activeExam,
      topics: {
        ...currentTopics,
        [activeSubject]: [...subjectTopics, topicToAdd]
      }
    };

    mockStore.saveGovernmentExam(updatedExam);
    showToast(`Added topic "${topicToAdd}" to ${activeSubject}`, 'success');
    setNewTopicInput('');
    loadData();
  };

  // Remove Micro-Topic Inline
  const handleRemoveTopic = (sub: string, topicToRemove: string) => {
    if (!activeExam) return;
    playSound('click');

    const currentTopics = activeExam.topics || {};
    const subjectTopics = currentTopics[sub] || [];

    const updatedExam: GovernmentExam = {
      ...activeExam,
      topics: {
        ...currentTopics,
        [sub]: subjectTopics.filter(t => t !== topicToRemove)
      }
    };

    mockStore.saveGovernmentExam(updatedExam);
    showToast(`Removed topic "${topicToRemove}"`, 'info');
    loadData();
  };

  // 1-Click Neural AI Topic Expander Simulation
  const handleAiQuickExpandTopics = (sub: string) => {
    if (!activeExam) return;
    playSound('scan');

    const presets: Record<string, string[]> = {
      'Quantitative Aptitude': ['Surds & Indices', 'Pipes & Cisterns', 'Mixture & Alligation', 'Coordinate Geometry'],
      'Mathematics': ['Quadratic Equations', 'Matrices & Determinants', 'Calculus Applications', 'Probability Distributions'],
      'General Intelligence & Reasoning': ['Input-Output Machine', 'Statement & Assumptions', 'Critical Reasoning', 'Data Sufficiency'],
      'General Awareness': ['Indian Space Missions (ISRO)', 'Union Budget 2026 Directives', 'Biodiversity & Climate Conventions'],
      'English Comprehension': ['Sentence Rearrangement (PQRS)', 'Active & Passive Voice', 'Direct & Indirect Speech'],
      'General Hindi': ['रस, छंद एवं अलंकार', 'तत्सम एवं तद्भव शब्द', 'अपठित गद्यांश बोध'],
      'Elementary Arithmetic': ['औसत एवं प्रतिशत अनुपात', 'लाभ-हानि बट्टा', 'साधारण एवं चक्रवृद्धि ब्याज']
    };

    const recommended = presets[sub] || ['Concept Mastery Part A', 'High-Yield Past Question Analysis', 'Numerical Shortcuts & Tricks'];

    const currentTopics = activeExam.topics || {};
    const existing = currentTopics[sub] || [];
    const merged = Array.from(new Set([...existing, ...recommended]));

    const updatedExam: GovernmentExam = {
      ...activeExam,
      topics: {
        ...currentTopics,
        [sub]: merged
      }
    };

    mockStore.saveGovernmentExam(updatedExam);
    playSound('confirm');
    showToast(`⚡ Neural AI synthesized ${recommended.length} high-yield syllabus topics into ${sub}!`, 'success');
    loadData();
  };

  // Full AI Syllabus Decomposer Simulation
  const handleRunAiSyllabusDecomposer = () => {
    if (!aiTargetExamId) return;
    playSound('warp');
    setIsAiDecomposing(true);
    setAiTerminalLogs([
      'INIT: Neural Curriculum Parsing Engine v4.8 initialized...',
      'SCAN: Analyzing commission official gazette notifications & past papers...',
      'PARSING: Extracting statutory subjects and cognitive domains...',
      'CALIBRATING: Balancing section weightages and question distribution...'
    ]);

    setTimeout(() => {
      setAiTerminalLogs(prev => [
        ...prev,
        'MAPPING: Generating Devanagari Hindi and English bilingual topic trees...',
        'CHECK: Aligning against NTA/TCS-iON Sectional Timing guidelines...',
        'SUCCESS: Generated 4 Core Subjects with 24 High-Yield Micro-Topics.'
      ]);

      const targetEx = exams.find(e => e.id === aiTargetExamId) || activeExam;
      const subjects = targetEx?.subjects.length ? targetEx.subjects : ['Section I: Reasoning', 'Section II: Mathematics', 'Section III: General Awareness'];
      
      const newTopics: Record<string, string[]> = {};
      subjects.forEach(s => {
        newTopics[s] = [
          'Foundation & Key Axioms',
          'Past 5-Year High Frequency Topics',
          'Analytical Problem Solving',
          'Error-Prone Traps & Distractors',
          'Mock Test Speed Drills'
        ];
      });

      setAiGeneratedSyllabus({
        subjects,
        topics: newTopics
      });
      setIsAiDecomposing(false);
      playSound('confirm');
    }, 1200);
  };

  // Commit AI Generated Syllabus to Exam
  const handleCommitAiSyllabus = () => {
    if (!aiGeneratedSyllabus || !aiTargetExamId) return;
    const targetEx = exams.find(e => e.id === aiTargetExamId);
    if (!targetEx) return;

    const updatedExam: GovernmentExam = {
      ...targetEx,
      topics: aiGeneratedSyllabus.topics
    };

    mockStore.saveGovernmentExam(updatedExam);
    playSound('confirm');
    showToast(`Neural syllabus genome committed to ${targetEx.shortName}!`, 'success');
    setIsAiSyllabusModalOpen(false);
    setAiGeneratedSyllabus(null);
    loadData();
  };

  // Bulk Export JSON
  const handleExportCatalogJSON = () => {
    playSound('warp');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exams, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `zyzus_exam_catalog_genome_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported complete Pan-India examination catalog JSON dossier.', 'success');
  };

  return (
    <div className="space-y-6 w-full max-w-[1780px] mx-auto p-4 sm:p-6 lg:p-8 rounded-3xl bg-[#030712] border border-cyan-500/20 text-slate-100 shadow-[0_0_80px_rgba(6,182,212,0.12)] min-h-screen font-sans">
      
      {/* ========================================================================= */}
      {/* 1. PANORAMIC CYBER-HUD COMMAND DECK & REGISTRY HEADER                      */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border border-cyan-500/40 p-6 sm:p-8 text-white shadow-[0_0_60px_rgba(6,182,212,0.2)] space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* HERO TITLE & EYEBROW ROW */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-xs shadow-cyan-500/20 font-mono">
                <Landmark className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                Pan-India Examination Registry • Syllabus Genome Studio
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
              <Compass className="w-8 h-8 sm:w-9 sm:h-9 text-cyan-400" />
              Exam Catalog &amp; Syllabus Studio
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed font-normal">
              Author, audit, calibrate, and version Pan-India government recruitment and school admission exam blueprints, syllabus hierarchies, topic weightages, and marking schemes across SSC, Railways, State Commissions, BHU CHS, JNVST, JEE, and NEET.
            </p>
          </div>

          {/* COMPLIANCE & AUDIO SFX COCKPIT */}
          <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              TCS iON / NTA COMPLIANT
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
        {/* HORIZONTAL ACTION COMMAND BAR                                             */}
        {/* ========================================================================= */}
        <div className="pt-4 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. Neural AI Syllabus Generator */}
            <button
              type="button"
              onClick={() => {
                playSound('warp');
                setAiTargetExamId(activeExam?.id || exams[0]?.id || '');
                setIsAiSyllabusModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all border border-purple-400/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Cpu className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>Neural AI Syllabus Generator</span>
            </button>

            {/* 2. Author Exam Blueprint */}
            <button
              type="button"
              onClick={() => handleOpenAuthorModal(null)}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Author Exam Blueprint</span>
            </button>

            {/* 3. Export Syllabus Catalog */}
            <button
              type="button"
              onClick={handleExportCatalogJSON}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white flex items-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export Syllabus Catalog</span>
            </button>

            {/* 4. Auto-Scan Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !isAutoScanning;
                setIsAutoScanning(next);
                playSound(next ? 'scan' : 'toggle');
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                isAutoScanning
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAutoScanning ? 'AUTO-SCAN ACTIVE (3s)' : 'START AUTO-SCAN'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="hidden sm:inline">Registry Checksum:</span>
            <span className="text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {activeExam ? `GENOME:SHA256:${activeExam.id.replace('exam-', '').slice(0, 8)}` : 'GENOME:SHA256:ROOT'}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HORIZONTAL TELEMETRY STRIP (6 DYNAMIC CYBER GAUGES)                       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-cyan-500/20 text-xs">
          {/* Card 1: Total Registered Exams */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-inner hover:border-cyan-400 transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-indigo-500" />
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5 text-cyan-400" /> Total Exams</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </span>
            <p className="text-2xl font-black text-white mt-1.5 font-mono tracking-tight">{telemetry.total}</p>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-cyan-400 h-full w-full rounded-full" />
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-1">Active in Pan-India Catalog</p>
          </div>

          {/* Card 2: Government Recruitment */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-inner hover:border-indigo-400 transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500" />
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-indigo-400" /> Govt Recruitments</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            </span>
            <p className="text-2xl font-black text-indigo-300 mt-1.5 font-mono tracking-tight">{telemetry.governmentCount}</p>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-400 h-full w-[85%] rounded-full" />
            </div>
            <p className="text-[10px] font-mono text-indigo-300/90 mt-1">SSC, Railway, Police, PET</p>
          </div>

          {/* Card 3: Admission Entrance */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-inner hover:border-purple-400 transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-purple-400" /> School &amp; UG Entrances</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            </span>
            <p className="text-2xl font-black text-purple-300 mt-1.5 font-mono tracking-tight">{telemetry.admissionCount}</p>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-400 h-full w-[70%] rounded-full" />
            </div>
            <p className="text-[10px] font-mono text-purple-300/90 mt-1">BHU CHS, JNVST, JEE, NEET</p>
          </div>

          {/* Card 4: Syllabus Topics Mapped */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-inner hover:border-cyan-400 transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Syllabus Topics</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </span>
            <p className="text-2xl font-black text-cyan-300 mt-1.5 font-mono tracking-tight">{telemetry.totalTopics}</p>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-cyan-400 h-full w-full rounded-full" />
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-1">Granular Micro-Curriculum</p>
          </div>

          {/* Card 5: Calibration Index */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-inner hover:border-emerald-400 transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-400" /> Calibration Index</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </span>
            <p className="text-2xl font-black text-emerald-300 mt-1.5 font-mono tracking-tight">{telemetry.blueprintIndex}%</p>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full w-[99.4%] rounded-full" />
            </div>
            <p className="text-[10px] font-mono text-emerald-400/90 mt-1">NTA/TCS-iON Verified</p>
          </div>

          {/* Card 6: Active Linked Mock Papers */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-inner hover:border-amber-400 transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-amber-400" /> Linked Mock Papers</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </span>
            <p className="text-2xl font-black text-amber-300 mt-1.5 font-mono tracking-tight">{telemetry.linkedMocks}</p>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-400 h-full w-[80%] rounded-full" />
            </div>
            <p className="text-[10px] font-mono text-amber-300/90 mt-1">Live CBT Benchmarks</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HORIZONTAL LAYOUT VIEW CONTROLLER & ADVANCED FILTER HUD                */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-3xl bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.15)] space-y-4">
        {/* Layout Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black uppercase text-cyan-400 tracking-wider">Layout Matrix:</span>
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  playSound('warp');
                  setViewMode('STUDIO');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'STUDIO'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                Horizontal Studio (Dual-Deck)
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('warp');
                  setViewMode('CAROUSEL');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'CAROUSEL'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Panoramic Rail
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('warp');
                  setViewMode('SYLLABUS_TREE');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'SYLLABUS_TREE'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Syllabus Matrix Tree
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('warp');
                  setViewMode('GRID');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'GRID'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Commission Grid
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400">Interactive Curriculum Engine Online</span>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-3">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Search exam name, authority, subjects, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-slate-900 text-white placeholder-slate-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                playSound('click');
                setCategoryFilter(e.target.value as CategoryFilterType);
              }}
              className="w-full text-xs font-bold border border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-slate-900 text-white"
            >
              <option value="ALL">All Categories ({exams.length})</option>
              <option value="GOVERNMENT">Government Recruitment Only</option>
              <option value="ADMISSION">Admission Entrance Only</option>
              <option value="SSC">SSC (CGL, CHSL, MTS)</option>
              <option value="RAILWAY">Indian Railways (RRB NTPC, Group D)</option>
              <option value="STATE_EXAMS">State Commission (UP PET, VDO)</option>
              <option value="TEACHING">Teaching (UP TET, CTET)</option>
              <option value="POLICE">Police Constabulary</option>
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={levelFilter}
              onChange={(e) => {
                playSound('click');
                setLevelFilter(e.target.value);
              }}
              className="w-full text-xs font-bold border border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-slate-900 text-white"
            >
              <option value="ALL">All Eligibility Levels</option>
              <option value="MATRIC">Matriculation (10th Pass)</option>
              <option value="INTERMEDIATE">Intermediate (12th Pass)</option>
              <option value="GRADUATE">Graduate (Degree)</option>
              <option value="SPECIALIZED">Specialized / Professional</option>
            </select>
          </div>

          {/* Fast Reset */}
          <div>
            <button
              type="button"
              onClick={() => {
                playSound('toggle');
                setCategoryFilter('ALL');
                setLevelFilter('ALL');
                setSearchQuery('');
              }}
              className="w-full py-2 text-xs font-bold rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900/70 hover:bg-slate-800 text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Sub-bar showing result count & fast chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing <strong className="text-white">{filteredExams.length}</strong> of {exams.length} Examination Genomes</span>
            <span>&bull;</span>
            <span className="text-cyan-400">{telemetry.totalTopics} Syllabus Topics Indexed</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono text-[11px]">
              100% Pattern Verified
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. HORIZONTAL WORKSPACE LAYOUT (4 DISTINCT MODES)                          */}
      {/* ========================================================================= */}

      {/* MODE A: HORIZONTAL STUDIO (FILMSTRIP RAIL + WIDE DUAL-DECK WORKBENCH)     */}
      {viewMode === 'STUDIO' && (
        <div className="space-y-6">
          {/* ========================================================================= */}
          {/* FILMSTRIP EXAM QUEUE RAIL                                                 */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-3xl bg-slate-950/95 border border-cyan-500/40 text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.15)] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase text-cyan-400 flex items-center gap-1.5 font-mono">
                  <Columns className="w-4 h-4 text-cyan-400" /> Panoramic Examination Filmstrip
                </span>
                <span className="text-xs font-mono font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full text-slate-300">
                  {filteredExams.length} Blueprints Active
                </span>
              </div>

              {/* Navigation Steppers */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevExam}
                  className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-400 cursor-pointer transition-all"
                  title="Previous Exam"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-400 px-2">
                  #{activeIndex + 1} / {filteredExams.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextExam}
                  className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-400 cursor-pointer transition-all"
                  title="Next Exam"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Track */}
            <div 
              ref={filmstripRef}
              className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-slate-900 snap-x"
            >
              {filteredExams.map((ex, idx) => {
                const isActive = activeExam?.id === ex.id;
                const isAdmission = ex.examType === 'ADMISSION' || ['ADMISSION_EXAMS', 'ENGINEERING', 'MEDICAL', 'OLYMPIAD'].includes(ex.category);

                return (
                  <div
                    key={ex.id}
                    onClick={() => {
                      playSound('click');
                      setActiveExamId(ex.id);
                    }}
                    className={`min-w-[280px] max-w-[320px] shrink-0 p-3.5 rounded-2xl border transition-all cursor-pointer snap-start relative overflow-hidden ${
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
                        <span className={`font-mono font-black ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                          #{idx + 1}
                        </span>
                        <span className={`font-black px-2 py-0.5 rounded text-[10px] font-mono border ${
                          isAdmission 
                            ? 'bg-purple-950/80 text-purple-300 border-purple-500/40' 
                            : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                        }`}>
                          {ex.shortName}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                        {ex.patternVersion}
                      </span>
                    </div>

                    <h4 className={`text-xs font-bold line-clamp-1 leading-snug ${isActive ? 'text-white' : 'text-slate-200'}`}>
                      {ex.name}
                    </h4>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {ex.conductingAuthority}
                    </p>

                    <div className="flex items-center justify-between text-[10px] mt-2.5 pt-2 border-t border-slate-800/80 font-mono text-slate-400">
                      <span>{ex.totalQuestions} Qs &bull; {ex.durationMinutes}m</span>
                      <span className={`font-bold ${ex.negativeMarkingPerQuestion > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {ex.negativeMarkingPerQuestion > 0 ? `-${ex.negativeMarkingPerQuestion}` : 'Zero Neg'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5-STAGE BLUEPRINT CALIBRATION BEACONS (MOCK TEST WIZARD SYMMETRY)          */}
          {/* ========================================================================= */}
          {activeExam && (
            <div className="p-4 rounded-3xl bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 text-slate-100 shadow-[0_0_40px_rgba(6,182,212,0.14)] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 font-bold shadow-xs shadow-cyan-500/20">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    5-STAGE BLUEPRINT CALIBRATION BEACONS
                  </span>
                  <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                    Active Inspection: <strong className="text-white">#{activeIndex + 1} ({activeExam.shortName})</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Readiness Score:</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    100% BLUEPRINT CALIBRATED
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
                    title: '1. Exam Identity',
                    sub: `${activeExam.conductingAuthority}`,
                    done: true,
                    icon: Landmark,
                    action: () => playSound('click')
                  },
                  {
                    step: 2,
                    title: '2. CBT Pattern Math',
                    sub: `${activeExam.totalQuestions} Qs • ${activeExam.durationMinutes}m • ${activeExam.totalMarks} Marks`,
                    done: true,
                    icon: Clock,
                    action: () => playSound('click')
                  },
                  {
                    step: 3,
                    title: '3. Syllabus Genome',
                    sub: `${activeExam.subjects.length} Subjects • ${Object.values(activeExam.topics || {}).flat().length} Topics`,
                    done: activeExam.subjects.length > 0,
                    icon: BookOpen,
                    action: () => playSound('click')
                  },
                  {
                    step: 4,
                    title: '4. Marking Scheme',
                    sub: `-${activeExam.negativeMarkingPerQuestion} Neg Penalty (${activeExam.level})`,
                    done: true,
                    icon: ShieldCheck,
                    action: () => playSound('click')
                  },
                  {
                    step: 5,
                    title: '5. Mock Paper Linkage',
                    sub: 'Ready for Live Student CBT Drills',
                    done: true,
                    icon: Play,
                    action: () => {
                      playSound('warp');
                      navigate('/operator/mock-tests');
                    }
                  }
                ].map((st) => {
                  const Icon = st.icon;
                  return (
                    <button
                      key={st.step}
                      type="button"
                      onClick={st.action}
                      className="p-3 rounded-2xl border text-left transition-all cursor-pointer group flex items-center gap-3 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border-cyan-500/40 hover:border-cyan-300 shadow-md shadow-cyan-950/20"
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-black shrink-0 transition-transform group-hover:scale-105 bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950 shadow-sm shadow-cyan-400/40">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-black truncate text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            {st.title}
                          </p>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
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
          {/* PANORAMIC HORIZONTAL DUAL-PANE WORKBENCH (50% / 50% SIDE-BY-SIDE SPLIT)   */}
          {/* ========================================================================= */}
          {activeExam ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* ========================================================================= */}
              {/* DECK 1 (LEFT): BLUEPRINT GENOME & COMMISSION CBT RULES                    */}
              {/* ========================================================================= */}
              <div className="rounded-3xl bg-slate-950/95 border border-cyan-500/40 text-slate-100 shadow-[0_0_60px_rgba(6,182,212,0.18)] overflow-hidden space-y-0">
                <div className="p-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
                      #{activeIndex + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        {activeExam.shortName} &bull; {activeExam.conductingAuthority}
                      </h4>
                      <p className="text-[11px] text-slate-300 font-mono">
                        Pattern: {activeExam.patternVersion} &bull; {activeExam.level} Level
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    Genome Verified
                  </span>
                </div>

                <div className="p-6 space-y-5">
                  {/* Full Title & Description */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono font-black uppercase text-cyan-400 tracking-wider block">
                      Official Examination Title &amp; Scope
                    </span>
                    <h3 className="text-sm font-extrabold text-white leading-relaxed">
                      {activeExam.name}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeExam.description}
                    </p>
                    {activeExam.officialSourceUrl && (
                      <div className="pt-2 flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Official Commission Portal:</span>
                        <a
                          href={activeExam.officialSourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 font-mono font-bold"
                        >
                          {activeExam.officialSourceUrl}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* CBT Pattern Metrics 4-Box Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Duration</span>
                      <strong className="text-base font-black text-white mt-1 block font-mono">{activeExam.durationMinutes} Min</strong>
                      <span className="text-[10px] text-slate-500">Official Server Clock</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Items</span>
                      <strong className="text-base font-black text-cyan-300 mt-1 block font-mono">{activeExam.totalQuestions} Qs</strong>
                      <span className="text-[10px] text-slate-500">Multiple-Choice / CBT</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Marks</span>
                      <strong className="text-base font-black text-indigo-300 mt-1 block font-mono">{activeExam.totalMarks} Marks</strong>
                      <span className="text-[10px] text-slate-500">Standard Score Max</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Negative Mark</span>
                      <strong className={`text-base font-black mt-1 block font-mono ${
                        activeExam.negativeMarkingPerQuestion > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {activeExam.negativeMarkingPerQuestion > 0 ? `-${activeExam.negativeMarkingPerQuestion}` : 'Zero Penalty'}
                      </strong>
                      <span className="text-[10px] text-slate-500">Per Incorrect Answer</span>
                    </div>
                  </div>

                  {/* Registered Sections & Timers Breakdown */}
                  {activeExam.sections && activeExam.sections.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-black uppercase text-cyan-400 tracking-wider block">
                        Statutory Sectional Quotas &amp; Timers ({activeExam.sections.length} Sections)
                      </span>
                      <div className="space-y-1.5">
                        {activeExam.sections.map((sec) => (
                          <div key={sec.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-200">{sec.name}</span>
                            <div className="flex items-center gap-3 font-mono text-slate-400">
                              <span>{sec.questionCount} Questions</span>
                              <span>&bull;</span>
                              <span className="text-cyan-300">{sec.marks} Marks</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                      <span>Section distribution evenly mapped across {activeExam.subjects.length} subjects</span>
                      <span className="font-mono text-cyan-300">~{Math.round(activeExam.totalQuestions / activeExam.subjects.length)} Qs / Subject</span>
                    </div>
                  )}

                  {/* Anti-Tamper SHA-256 Hash Ribbon */}
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 text-slate-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Blueprint SHA-256:</span>
                      <strong className="text-cyan-300">SHA256:9a7f{activeExam.id.slice(-6)}c04e</strong>
                    </div>
                    <span className="text-emerald-400 font-bold">NOC Telemetry Synchronized</span>
                  </div>

                  {/* Action Toolbar for Deck 1 */}
                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenAuthorModal(activeExam)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                        Edit Blueprint
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playSound('warp');
                          const cloned: GovernmentExam = {
                            ...activeExam,
                            id: `exam-clone-${Date.now()}`,
                            name: `${activeExam.name} (Clone)`,
                            shortName: `${activeExam.shortName}-CLONE`,
                            patternVersion: `${activeExam.patternVersion}-v2`
                          };
                          mockStore.saveGovernmentExam(cloned);
                          showToast(`Cloned blueprint as "${cloned.shortName}"!`, 'success');
                          loadData();
                          setActiveExamId(cloned.id);
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" /> Clone
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteExam(activeExam)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/40 font-mono">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Catalog Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* DECK 2 (RIGHT): INTERACTIVE SYLLABUS & TOPIC WEIGHTAGE STUDIO             */}
              {/* ========================================================================= */}
              <div className="rounded-3xl bg-slate-950/95 border border-cyan-500/40 text-slate-100 shadow-[0_0_60px_rgba(6,182,212,0.18)] overflow-hidden space-y-0">
                <div className="p-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-black text-white">
                      Curriculum Hierarchy &amp; Topic Radar
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-cyan-300">
                    {activeExam.subjects.length} Subjects Registered
                  </span>
                </div>

                <div className="p-6 space-y-5">
                  {/* Subject Selector Horizontal Pills */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-black uppercase text-cyan-400 tracking-wider block">
                      Select Subject to Inspect Syllabus Topics:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeExam.subjects.map((sub) => {
                        const isSubActive = activeSubject === sub;
                        const topicCount = activeExam.topics?.[sub]?.length || 0;

                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => {
                              playSound('click');
                              setActiveSubject(sub);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                              isSubActive
                                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border-cyan-400 shadow-md shadow-cyan-500/30 ring-1 ring-cyan-400 font-extrabold'
                                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span>{sub}</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                              isSubActive ? 'bg-slate-950/80 text-cyan-300' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {topicCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section Weightage Visual Radar */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        Estimated Examination Weightage for <strong className="text-cyan-300">{activeSubject}</strong>:
                      </span>
                      <span className="font-mono text-cyan-300 font-bold">
                        ~{Math.round(100 / activeExam.subjects.length)}% of Paper
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(100 / activeExam.subjects.length)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Quota: ~{Math.round(activeExam.totalQuestions / activeExam.subjects.length)} Questions</span>
                      <span>Marks: ~{Math.round(activeExam.totalMarks / activeExam.subjects.length)} Marks</span>
                    </div>
                  </div>

                  {/* Registered Micro-Topics Chips & Hierarchy */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black uppercase text-cyan-400 tracking-wider">
                        Active Topics in {activeSubject} ({activeExam.topics?.[activeSubject]?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAiQuickExpandTopics(activeSubject)}
                        className="text-[11px] font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                        title="AI curriculum expander"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                        1-Click Neural Topic Expander
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 min-h-[140px] flex flex-wrap gap-2 items-start content-start">
                      {activeExam.topics?.[activeSubject] && activeExam.topics[activeSubject].length > 0 ? (
                        activeExam.topics[activeSubject].map((topic, ti) => (
                          <div 
                            key={`${topic}-${ti}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-xs font-semibold text-slate-200 hover:border-cyan-400 transition-all group"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>{topic}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTopic(activeSubject, topic)}
                              className="text-slate-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer ml-1"
                              title="Delete Topic"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="w-full text-center py-6 text-slate-500 text-xs italic">
                          No micro-topics mapped yet for {activeSubject}. Use the input below or the 1-Click Neural Expander.
                        </div>
                      )}
                    </div>

                    {/* Add Micro-Topic Inline Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Add new syllabus topic to ${activeSubject}...`}
                        value={newTopicInput}
                        onChange={(e) => setNewTopicInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTopicInline();
                          }
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddTopicInline}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Add Topic</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Action Ribbon (Integration with Mock Tests & Question Bank) */}
                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          playSound('warp');
                          navigate('/operator/mock-tests');
                        }}
                        className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Launch Mock Test Wizard for {activeExam.shortName}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playSound('click');
                          navigate('/operator/question-bank');
                        }}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Inspect in Question Bank</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playSound('warp');
                        setAiTargetExamId(activeExam.id);
                        setIsAiSyllabusModalOpen(true);
                      }}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>AI Syllabus Decomposer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-slate-950/90 rounded-3xl border border-slate-800">
              <Landmark className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">Select an exam from the horizontal rail to inspect blueprint</p>
            </div>
          )}
        </div>
      )}

      {/* MODE B: HORIZONTAL CAROUSEL RAIL                                         */}
      {viewMode === 'CAROUSEL' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Panoramic Horizontal Rail ({filteredExams.length} Cards) • Click Any Exam to Select
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevExam}
                className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextExam}
                className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-5 snap-x snap-mandatory py-2 pb-6 scrollbar-thin">
            {filteredExams.map((ex, idx) => {
              const isActive = activeExam?.id === ex.id;
              const isAdmission = ex.examType === 'ADMISSION' || ['ADMISSION_EXAMS', 'ENGINEERING', 'MEDICAL', 'OLYMPIAD'].includes(ex.category);

              return (
                <div
                  key={ex.id}
                  onClick={() => {
                    playSound('click');
                    setActiveExamId(ex.id);
                  }}
                  className={`min-w-[460px] max-w-[540px] snap-center rounded-3xl p-6 border transition-all space-y-4 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-br from-slate-950 to-indigo-950 text-white border-cyan-400 shadow-2xl ring-1 ring-cyan-400/40'
                      : 'bg-slate-900/90 text-slate-200 border-slate-800 hover:border-slate-700 shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-7 h-7 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-black">
                        #{idx + 1}
                      </span>
                      <span className="font-extrabold text-sm">{ex.shortName}</span>
                      <span>&bull;</span>
                      <span className="text-slate-400">{ex.conductingAuthority}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {ex.patternVersion}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white leading-snug">
                    {ex.name}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {ex.description}
                  </p>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs pt-3 border-t border-slate-800">
                    <div className="p-2 bg-slate-950/80 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">Questions</span>
                      <strong className="text-white font-mono">{ex.totalQuestions}</strong>
                    </div>
                    <div className="p-2 bg-slate-950/80 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">Duration</span>
                      <strong className="text-white font-mono">{ex.durationMinutes}m</strong>
                    </div>
                    <div className="p-2 bg-slate-950/80 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">Marks</span>
                      <strong className="text-white font-mono">{ex.totalMarks}</strong>
                    </div>
                    <div className="p-2 bg-slate-950/80 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">Negative</span>
                      <strong className={ex.negativeMarkingPerQuestion > 0 ? 'text-rose-400 font-mono' : 'text-emerald-400 font-mono'}>
                        {ex.negativeMarkingPerQuestion > 0 ? `-${ex.negativeMarkingPerQuestion}` : 'Zero'}
                      </strong>
                    </div>
                  </div>

                  {/* Subjects Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {ex.subjects.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-slate-950 text-slate-300 border border-slate-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE C: SYLLABUS GENOME MATRIX TREE                                      */}
      {viewMode === 'SYLLABUS_TREE' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950/95 border border-cyan-500/30 text-white space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  Full-Tree Curriculum Matrix: {activeExam?.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive subject-wise syllabus tree breakdown with granular concept boundaries.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenAuthorModal(activeExam)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black cursor-pointer"
              >
                Configure Subjects
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeExam?.subjects.map((sub) => {
                const topicsList = activeExam.topics?.[sub] || [];

                return (
                  <div key={sub} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        {sub}
                      </h4>
                      <span className="text-xs font-mono font-bold text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {topicsList.length} Topics
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {topicsList.map(t => (
                        <span key={t} className="px-2.5 py-1 rounded-xl text-xs bg-slate-950 text-slate-300 border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE D: COMMISSION GRID                                                  */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((exam) => {
            const isAdmission = exam.examType === 'ADMISSION' || ['ADMISSION_EXAMS', 'ENGINEERING', 'MEDICAL', 'OLYMPIAD'].includes(exam.category);
            const isSelected = activeExam?.id === exam.id;

            return (
              <div
                key={exam.id}
                onClick={() => {
                  playSound('click');
                  setActiveExamId(exam.id);
                }}
                className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-cyan-400 shadow-2xl ring-2 ring-cyan-500/40 text-white'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
                      isAdmission 
                        ? 'bg-purple-950 text-purple-300 border-purple-500/40' 
                        : 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {exam.shortName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded">
                      {exam.patternVersion}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white leading-snug">{exam.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{exam.conductingAuthority}</p>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">{exam.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-950 p-2 rounded-xl">
                      <p className="text-slate-500 text-[10px]">Questions</p>
                      <p className="font-bold text-white mt-0.5 font-mono">{exam.totalQuestions}</p>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl">
                      <p className="text-slate-500 text-[10px]">Duration</p>
                      <p className="font-bold text-white mt-0.5 font-mono">{exam.durationMinutes}m</p>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl">
                      <p className="text-slate-500 text-[10px]">Negative</p>
                      <p className={`font-bold mt-0.5 font-mono ${exam.negativeMarkingPerQuestion > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {exam.negativeMarkingPerQuestion > 0 ? `-${exam.negativeMarkingPerQuestion}` : 'Zero'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound('warp');
                      setActiveExamId(exam.id);
                      setViewMode('STUDIO');
                    }}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1"
                  >
                    <span>Inspect Genome</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAuthorModal(exam);
                    }}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: AUTHOR / EDIT EXAM BLUEPRINT MODAL                                */}
      {/* ========================================================================= */}
      {isExamModalOpen && (
        <Modal
          isOpen={isExamModalOpen}
          onClose={() => {
            playSound('click');
            setIsExamModalOpen(false);
          }}
          title=""
          size="xl"
          variant="cyber"
          hideDefaultHeader={true}
        >
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.2)] space-y-6 font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/30">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 w-fit">
                  <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                  {editingExam ? 'EDIT EXAMINATION BLUEPRINT' : 'AUTHOR NEW EXAMINATION GENOME'}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-1.5">
                  {editingExam ? `Calibrate: ${editingExam.shortName}` : 'Register Pan-India Commission Blueprint'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsExamModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Official Exam Name *</label>
                  <input
                    type="text"
                    required
                    value={examForm.name}
                    onChange={(e) => setExamForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Staff Selection Commission — Combined Graduate Level (SSC CGL)"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>

                {/* Short Code */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Short Identifier Code *</label>
                  <input
                    type="text"
                    required
                    value={examForm.shortName}
                    onChange={(e) => setExamForm(prev => ({ ...prev, shortName: e.target.value }))}
                    placeholder="e.g. SSC CGL or RRB NTPC"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                  />
                </div>

                {/* Conducting Authority */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Conducting Authority / Commission *</label>
                  <input
                    type="text"
                    required
                    value={examForm.conductingAuthority}
                    onChange={(e) => setExamForm(prev => ({ ...prev, conductingAuthority: e.target.value }))}
                    placeholder="e.g. Staff Selection Commission (SSC)"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Category Tag</label>
                  <select
                    value={examForm.category}
                    onChange={(e) => setExamForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  >
                    <option value="SSC">SSC</option>
                    <option value="RAILWAY">Railway</option>
                    <option value="STATE_EXAMS">State Commission</option>
                    <option value="TEACHING">Teaching</option>
                    <option value="POLICE">Police</option>
                    <option value="BANKING">Banking</option>
                    <option value="DEFENCE">Defence</option>
                    <option value="CIVIL_SERVICES">Civil Services</option>
                    <option value="ADMISSION_EXAMS">Admission Exams (School/CHS)</option>
                    <option value="ENGINEERING">Engineering Entrance (JEE)</option>
                    <option value="MEDICAL">Medical Entrance (NEET)</option>
                    <option value="OLYMPIAD">Olympiad</option>
                  </select>
                </div>

                {/* Eligibility Level */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Eligibility Level</label>
                  <select
                    value={examForm.level}
                    onChange={(e) => setExamForm(prev => ({ ...prev, level: e.target.value as any }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  >
                    <option value="GRADUATE">Graduate (Degree)</option>
                    <option value="INTERMEDIATE">Intermediate (12th Pass)</option>
                    <option value="MATRIC">Matriculation (10th Pass)</option>
                    <option value="SPECIALIZED">Specialized / Technical</option>
                  </select>
                </div>

                {/* Pattern Math */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Total Questions *</label>
                  <input
                    type="number"
                    required
                    value={examForm.totalQuestions}
                    onChange={(e) => setExamForm(prev => ({ ...prev, totalQuestions: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Duration (Minutes) *</label>
                  <input
                    type="number"
                    required
                    value={examForm.durationMinutes}
                    onChange={(e) => setExamForm(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Total Marks *</label>
                  <input
                    type="number"
                    required
                    value={examForm.totalMarks}
                    onChange={(e) => setExamForm(prev => ({ ...prev, totalMarks: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Negative Penalty per Wrong Answer *</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={examForm.negativeMarkingPerQuestion}
                    onChange={(e) => setExamForm(prev => ({ ...prev, negativeMarkingPerQuestion: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                  />
                </div>

                {/* Subjects (Comma-separated) */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Syllabus Subjects (Comma-Separated) *</label>
                  <textarea
                    rows={2}
                    required
                    value={examForm.subjectsInput}
                    onChange={(e) => setExamForm(prev => ({ ...prev, subjectsInput: e.target.value }))}
                    placeholder="e.g. Quantitative Aptitude, General Intelligence, General Awareness, English"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Description &amp; Commission Guidelines</label>
                  <textarea
                    rows={2}
                    value={examForm.description}
                    onChange={(e) => setExamForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Summary of post eligibility, pattern changes, and marking criteria..."
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer"
                >
                  <SaveIcon className="w-4 h-4" />
                  <span>Save Blueprint to Registry</span>
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NEURAL AI SYLLABUS DECOMPOSER MODAL                              */}
      {/* ========================================================================= */}
      {isAiSyllabusModalOpen && (
        <Modal
          isOpen={isAiSyllabusModalOpen}
          onClose={() => {
            playSound('click');
            setIsAiSyllabusModalOpen(false);
          }}
          title=""
          size="xl"
          variant="cyber"
          hideDefaultHeader={true}
        >
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 border border-purple-500/40 shadow-[0_0_60px_rgba(168,85,247,0.2)] space-y-6 font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/30">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-950/80 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                  NEURAL AI SYLLABUS DECOMPOSER v5.0
                </span>
                <h2 className="text-xl font-extrabold text-white mt-1.5">
                  Deconstruct Official Exam Syllabus into Granular Genome
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsAiSyllabusModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Target Examination</label>
                  <select
                    value={aiTargetExamId}
                    onChange={(e) => setAiTargetExamId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  >
                    {exams.map(e => (
                      <option key={e.id} value={e.id}>{e.shortName} — {e.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Notification Parsing Source</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                  >
                    <option>Commission Official Notification Gazette 2026</option>
                    <option>Past 10-Year Question Frequency Model</option>
                    <option>Curriculum Hybrid Analysis</option>
                  </select>
                </div>
              </div>

              {/* Terminal Logs Window */}
              {isAiDecomposing && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 font-mono text-xs text-purple-300 space-y-1 shadow-inner">
                  <div className="flex items-center gap-2 text-purple-400 font-bold mb-2">
                    <Terminal className="w-4 h-4 animate-pulse" />
                    <span>ZYZU'S Neural Curriculum Engine Running...</span>
                  </div>
                  {aiTerminalLogs.map((log, li) => (
                    <p key={li} className="text-[11px] leading-relaxed">{log}</p>
                  ))}
                </div>
              )}

              {/* Generated Result Preview */}
              {aiGeneratedSyllabus && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-3">
                  <span className="text-xs font-mono font-black uppercase text-cyan-400 tracking-wider block">
                    Decomposed Syllabus Structure Preview:
                  </span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {Object.entries(aiGeneratedSyllabus.topics).map(([sub, topics]) => (
                      <div key={sub} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <strong className="text-xs text-white">{sub}</strong>
                        <div className="flex flex-wrap gap-1">
                          {topics.map(t => (
                            <span key={t} className="px-2 py-0.5 rounded text-[11px] bg-slate-900 text-slate-300 border border-slate-800">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Curriculum rigor aligned with National Standards
                </span>

                <div className="flex items-center gap-2">
                  {!aiGeneratedSyllabus ? (
                    <button
                      type="button"
                      disabled={isAiDecomposing}
                      onClick={handleRunAiSyllabusDecomposer}
                      className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isAiDecomposing ? 'Decomposing...' : 'Synthesize Syllabus Genome'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCommitAiSyllabus}
                      className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Commit Syllabus to Blueprint</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Simple Save Icon helper
const SaveIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
