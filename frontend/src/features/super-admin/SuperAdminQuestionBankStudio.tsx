// FOCUSPOINT Super Admin — Central Question Bank & AI Question Studio Core
// Futuristic Cognitive HUD with Real-time AI Generation, Bilingual Authoring (EN/HI),
// Quality & Ambiguity Radar, Duplicate Scanner, Batch Operations, and Student Sandbox Simulator.

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { questionBankService } from '../../services/questionBankService';
import { mockTestService } from '../../services/mockTestService';
import {
  QuestionItem,
  QuestionDifficulty,
  QuestionType,
  GovernmentExam,
  QuestionOption
} from '../../types/academicIntelligence';
import {
  BookOpen,
  Sparkles,
  Search,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Bot,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Layers,
  Filter,
  CheckSquare,
  Square,
  AlertTriangle,
  Play,
  RotateCcw,
  Languages,
  Activity,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Volume2,
  VolumeX,
  FileText,
  SlidersHorizontal,
  X,
  Eye,
  Radar,
  BarChart3,
  Zap,
  Info
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
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      case 'toggle':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.setValueAtTime(480, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      case 'alert':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(200, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.06);
        osc.frequency.setValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
    }
  } catch (e) {
    // Autoplay restrictions
  }
};

type StudioTab = 'explorer' | 'ai_studio' | 'author' | 'radar' | 'analytics' | 'guide';
type LanguageViewMode = 'en' | 'hi' | 'bilingual';

export const SuperAdminQuestionBankStudio: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<StudioTab>('explorer');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [exams, setExams] = useState<GovernmentExam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [languageMode, setLanguageMode] = useState<LanguageViewMode>('bilingual');

  // Sound toggle
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('fp_cyber_sound') === 'muted');
  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem('fp_cyber_sound', next ? 'muted' : 'active');
    if (!next) playCyberSound('confirm');
  };

  // Filters
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Expanded review card
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // AI Generation State
  const [aiExamId, setAiExamId] = useState<string>('');
  const [aiSubject, setAiSubject] = useState<string>('Quantitative Aptitude');
  const [aiTopic, setAiTopic] = useState<string>('Percentage & Profit Loss');
  const [aiDifficulty, setAiDifficulty] = useState<QuestionDifficulty>('MEDIUM');
  const [aiCount, setAiCount] = useState<number>(3);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiBloomLevel, setAiBloomLevel] = useState<string>('Application');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genStep, setGenStep] = useState<number>(0);

  // Question Authoring / Edit Modal
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<QuestionItem> | null>(null);

  // Student Sandbox Simulator State
  const [sandboxQuestion, setSandboxQuestion] = useState<QuestionItem | null>(null);
  const [sandboxSelectedOpt, setSandboxSelectedOpt] = useState<string | null>(null);
  const [sandboxSubmitted, setSandboxSubmitted] = useState<boolean>(false);

  // AI Quality Audit Modal State
  const [auditTargetQuestion, setAuditTargetQuestion] = useState<QuestionItem | null>(null);
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  // Duplicate Scanner State
  const [duplicatePairs, setDuplicatePairs] = useState<any[]>([]);
  const [duplicateScanning, setDuplicateScanning] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [qs, exList] = await Promise.all([
        questionBankService.getQuestions(),
        mockTestService.getGovernmentExams()
      ]);
      setQuestions(qs);
      setExams(exList);
      if (exList.length > 0 && !aiExamId) {
        setAiExamId(exList[0].id);
      }
    } catch (err) {
      showToast('Failed to load question bank data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesExam = selectedExamId === 'all' || q.examId === selectedExamId;
      const matchesSub = selectedSubject === 'all' || q.subject === selectedSubject;
      const matchesDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      const matchesStatus = selectedStatus === 'all' || q.status === selectedStatus;
      
      const allText = `${q.questionText} ${q.hindiQuestionText || ''} ${q.topic} ${q.subject}`.toLowerCase();
      const matchesQuery = !searchQuery.trim() || allText.includes(searchQuery.toLowerCase());

      return matchesExam && matchesSub && matchesDiff && matchesStatus && matchesQuery;
    });
  }, [questions, selectedExamId, selectedSubject, selectedDifficulty, selectedStatus, searchQuery]);

  // Subjects derived
  const subjects = useMemo(() => {
    return Array.from(new Set(questions.map(q => q.subject))).filter(Boolean);
  }, [questions]);

  // Counts
  const aiGeneratedCount = questions.filter(q => q.status === 'AI_GENERATED').length;
  const approvedCount = questions.filter(q => q.status === 'APPROVED').length;
  const publishedCount = questions.filter(q => q.status === 'PUBLISHED').length;

  // Single Question Actions
  const handleApprove = async (id: string) => {
    playCyberSound('confirm');
    try {
      const updated = await questionBankService.approveQuestion(id, user?.name || 'Super Admin');
      if (updated) {
        setQuestions(prev => prev.map(q => (q.id === id ? updated : q)));
        showToast('Question approved by Human-in-the-Loop review', 'success');
      }
    } catch {
      showToast('Failed to approve question', 'error');
    }
  };

  const handlePublish = async (id: string) => {
    playCyberSound('success');
    try {
      const updated = await questionBankService.publishQuestion(id, user?.name || 'Super Admin');
      if (updated) {
        setQuestions(prev => prev.map(q => (q.id === id ? updated : q)));
        showToast('Question published into live test circulation', 'success');
      }
    } catch {
      showToast('Failed to publish question', 'error');
    }
  };

  const handleReject = async (id: string) => {
    playCyberSound('alert');
    try {
      const updated = await questionBankService.rejectQuestion(id, 'Pedagogical refinement required.');
      if (updated) {
        setQuestions(prev => prev.map(q => (q.id === id ? updated : q)));
        showToast('Question marked as REJECTED', 'info');
      }
    } catch {
      showToast('Failed to reject question', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    playCyberSound('alert');
    try {
      await questionBankService.deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
      showToast('Question deleted from bank', 'success');
    } catch {
      showToast('Failed to delete question', 'error');
    }
  };

  // Bulk Operations
  const handleToggleSelectAll = () => {
    playCyberSound('toggle');
    if (selectedIds.length === filteredQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map(q => q.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    playCyberSound('click');
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    playCyberSound('confirm');
    const count = await questionBankService.bulkApproveQuestions(selectedIds, user?.name || 'Super Admin');
    showToast(`Approved ${count} selected questions`, 'success');
    setSelectedIds([]);
    loadData();
  };

  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) return;
    playCyberSound('success');
    const count = await questionBankService.bulkPublishQuestions(selectedIds, user?.name || 'Super Admin');
    showToast(`Published ${count} selected questions to live circulation`, 'success');
    setSelectedIds([]);
    loadData();
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    playCyberSound('alert');
    const count = await questionBankService.bulkRejectQuestions(selectedIds);
    showToast(`Rejected ${count} selected questions`, 'info');
    setSelectedIds([]);
    loadData();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} questions?`)) return;
    playCyberSound('alert');
    const count = await questionBankService.bulkDeleteQuestions(selectedIds);
    showToast(`Deleted ${count} questions`, 'success');
    setSelectedIds([]);
    loadData();
  };

  // AI Question Generation Pipeline
  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiExamId || !aiSubject || !aiTopic) {
      showToast('Please specify Exam, Subject, and Topic', 'error');
      return;
    }

    setIsGenerating(true);
    setGenStep(1);
    playCyberSound('warp');

    const s1 = setTimeout(() => { setGenStep(2); playCyberSound('click'); }, 500);
    const s2 = setTimeout(() => { setGenStep(3); playCyberSound('click'); }, 1100);
    const s3 = setTimeout(() => { setGenStep(4); playCyberSound('click'); }, 1700);

    try {
      const generated = await questionBankService.generateQuestionsWithAI({
        examId: aiExamId,
        subject: aiSubject,
        topic: aiTopic,
        difficulty: aiDifficulty,
        count: aiCount,
        questionType: 'MCQ',
        customPrompt: `${aiPrompt ? aiPrompt + ' ' : ''}[Bloom Taxonomy: ${aiBloomLevel}]`
      });

      setTimeout(() => {
        setQuestions(prev => [...generated, ...prev]);
        setIsGenerating(false);
        setGenStep(5);
        playCyberSound('success');
        showToast(`AI Studio synthesized ${generated.length} questions awaiting Human review`, 'success');
        setActiveTab('explorer');
        if (generated.length > 0) {
          setExpandedId(generated[0].id);
        }
      }, 2300);
    } catch {
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(s3);
      setIsGenerating(false);
      showToast('AI Generation failed', 'error');
    }
  };

  // Apply Prompt Preset
  const applyPromptPreset = (preset: {
    examName: string;
    subject: string;
    topic: string;
    diff: QuestionDifficulty;
    prompt: string;
  }) => {
    playCyberSound('toggle');
    const matched = exams.find(e => e.name.toLowerCase().includes(preset.examName.toLowerCase()));
    if (matched) setAiExamId(matched.id);
    setAiSubject(preset.subject);
    setAiTopic(preset.topic);
    setAiDifficulty(preset.diff);
    setAiPrompt(preset.prompt);
    showToast(`Loaded "${preset.topic}" syllabus template`, 'info');
  };

  // Launch AI Quality Audit
  const handleOpenAiAudit = async (q: QuestionItem) => {
    playCyberSound('warp');
    setAuditTargetQuestion(q);
    setAuditResult(null);
    setAuditLoading(true);
    try {
      const audit = await questionBankService.runAiQualityAudit(q);
      setAuditResult(audit);
      playCyberSound('confirm');
    } catch {
      showToast('Audit failed', 'error');
    } finally {
      setAuditLoading(false);
    }
  };

  // Run Duplicate Scan
  const handleRunDuplicateScan = async () => {
    playCyberSound('warp');
    setDuplicateScanning(true);
    setDuplicatePairs([]);
    try {
      const duplicates = await questionBankService.scanDuplicateQuestions(70);
      setDuplicatePairs(duplicates);
      playCyberSound('confirm');
      showToast(`Scan complete: Found ${duplicates.length} question pairs with high overlap`, 'info');
    } catch {
      showToast('Duplicate scanner failed', 'error');
    } finally {
      setDuplicateScanning(false);
    }
  };

  // Student Sandbox Simulator
  const handleLaunchSandbox = (q: QuestionItem) => {
    playCyberSound('click');
    setSandboxQuestion(q);
    setSandboxSelectedOpt(null);
    setSandboxSubmitted(false);
  };

  // Author / Edit Question
  const handleOpenCreateModal = () => {
    playCyberSound('click');
    setEditingQuestion({
      examId: exams[0]?.id || '',
      examName: exams[0]?.name || 'Staff Selection Commission (SSC CGL)',
      subject: 'Quantitative Aptitude',
      topic: 'Arithmetic Reasoning',
      difficulty: 'MEDIUM',
      questionType: 'MCQ',
      questionText: '',
      hindiQuestionText: '',
      options: [
        { id: 'A', text: '', isCorrect: true },
        { id: 'B', text: '', isCorrect: false },
        { id: 'C', text: '', isCorrect: false },
        { id: 'D', text: '', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: '',
      hindiExplanation: '',
      marks: 2,
      negativeMarks: 0.5,
      language: 'English',
      source: 'STAFF_AUTHORED',
      status: 'APPROVED'
    });
    setIsAuthorModalOpen(true);
  };

  const handleOpenEditModal = (q: QuestionItem) => {
    playCyberSound('click');
    setEditingQuestion({ ...q });
    setIsAuthorModalOpen(true);
  };

  const handleSaveQuestionForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editingQuestion.questionText) {
      showToast('Question statement is required', 'error');
      return;
    }

    playCyberSound('confirm');
    const matchedExam = exams.find(ex => ex.id === editingQuestion.examId);
    const completeItem: QuestionItem = {
      id: editingQuestion.id || `qb-manual-${Date.now()}`,
      examId: editingQuestion.examId || exams[0]?.id || 'ssc-cgl',
      examName: matchedExam ? matchedExam.name : (editingQuestion.examName || 'Competitive Exam'),
      subject: editingQuestion.subject || 'General Studies',
      topic: editingQuestion.topic || 'Core Curriculum',
      difficulty: editingQuestion.difficulty || 'MEDIUM',
      questionType: editingQuestion.questionType || 'MCQ',
      questionText: editingQuestion.questionText,
      hindiQuestionText: editingQuestion.hindiQuestionText,
      options: editingQuestion.options || [],
      correctAnswer: editingQuestion.correctAnswer || 'A',
      explanation: editingQuestion.explanation || 'Solution logic verified.',
      hindiExplanation: editingQuestion.hindiExplanation,
      marks: editingQuestion.marks || 2,
      negativeMarks: editingQuestion.negativeMarks !== undefined ? editingQuestion.negativeMarks : 0.5,
      language: editingQuestion.language || 'English',
      source: editingQuestion.source || 'STAFF_AUTHORED',
      status: editingQuestion.status || 'APPROVED',
      approvedBy: user?.name || 'Super Admin',
      createdAt: editingQuestion.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = await questionBankService.saveQuestion(completeItem);
    setQuestions(prev => {
      const idx = prev.findIndex(item => item.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });

    setIsAuthorModalOpen(false);
    showToast('Question saved successfully into central bank', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Top Futuristic Cognitive HUD Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-700/80 p-5 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-96 h-full bg-radial from-purple-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 shadow-sm">
              <Cpu className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-purple-500/30">
                  COGNITIVE AI STUDIO v6.0 // BILINGUAL ENGINE
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Bank Volume: <strong className="text-white font-bold">{questions.length}</strong> Questions
                </span>
              </div>
              <h1 className="text-sm font-bold text-white tracking-wide mt-0.5 flex items-center gap-2">
                <span>Pan-India Question Bank & AI Authoring Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40">
                  ISO-9001 CURRICULUM CERTIFIED
                </span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { playCyberSound('warp'); setActiveTab('ai_studio'); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch AI Studio</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Author Question</span>
            </button>

            <button
              onClick={() => { playCyberSound('click'); questionBankService.exportQuestions('json', questions); showToast('Exported questions to JSON', 'success'); }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Export Question Bank JSON"
            >
              <Download className="w-4 h-4 text-slate-300" />
            </button>

            <button
              onClick={() => { playCyberSound('click'); loadData(); showToast('Synchronized Question Bank data', 'info'); }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Refresh Question Bank"
            >
              <RefreshCw className={`w-4 h-4 text-purple-400 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute cyber acoustic synthesizer' : 'Mute cyber audio feedback'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
            </button>
          </div>
        </div>

        {/* Quick Telemetry Counters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3.5 border-t border-slate-800 text-[11px] font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Total in Bank</span>
              <p className="font-bold text-white text-base mt-0.5">{questions.length}</p>
            </div>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">AI Drafts Review</span>
              <p className="font-bold text-amber-400 text-base mt-0.5">{aiGeneratedCount}</p>
            </div>
            <Bot className="w-4 h-4 text-amber-400" />
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Approved Ready</span>
              <p className="font-bold text-sky-400 text-base mt-0.5">{approvedCount}</p>
            </div>
            <Check className="w-4 h-4 text-sky-400" />
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Live in Tests</span>
              <p className="font-bold text-emerald-400 text-base mt-0.5">{publishedCount}</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Futuristic HUD Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white p-2 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => { playCyberSound('click'); setActiveTab('explorer'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'explorer'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Bank Explorer</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-50 text-purple-700 font-bold border border-purple-200">
              {filteredQuestions.length}
            </span>
          </button>

          <button
            onClick={() => { playCyberSound('click'); setActiveTab('ai_studio'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ai_studio'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Question Studio</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-50 text-amber-700 font-bold border border-amber-200">
              Neural
            </span>
          </button>

          <button
            onClick={() => { playCyberSound('click'); setActiveTab('radar'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Radar className="w-4 h-4 text-cyan-400" />
            <span>Quality & Duplicate Radar</span>
          </button>

          <button
            onClick={() => { playCyberSound('click'); setActiveTab('analytics'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Curriculum BI</span>
          </button>

          <button
            onClick={() => { playCyberSound('click'); setActiveTab('guide'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Studio Guide</span>
          </button>
        </div>

        {/* Bilingual Language Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <Languages className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
          <button
            onClick={() => { playCyberSound('toggle'); setLanguageMode('en'); }}
            className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
              languageMode === 'en' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => { playCyberSound('toggle'); setLanguageMode('hi'); }}
            className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
              languageMode === 'hi' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            हिंदी
          </button>
          <button
            onClick={() => { playCyberSound('toggle'); setLanguageMode('bilingual'); }}
            className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
              languageMode === 'bilingual' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Bilingual
          </button>
        </div>
      </div>

      {/* TAB 1: BANK EXPLORER */}
      {activeTab === 'explorer' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Exam Selector */}
              <select
                value={selectedExamId}
                onChange={e => { playCyberSound('click'); setSelectedExamId(e.target.value); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="all">All Exams</option>
                {exams.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.shortName || ex.name}
                  </option>
                ))}
              </select>

              {/* Subject Filter */}
              <select
                value={selectedSubject}
                onChange={e => { playCyberSound('click'); setSelectedSubject(e.target.value); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="all">All Subjects</option>
                {subjects.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={e => { playCyberSound('click'); setSelectedDifficulty(e.target.value); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={e => { playCyberSound('click'); setSelectedStatus(e.target.value); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="AI_GENERATED">AI Generated ({aiGeneratedCount})</option>
                <option value="APPROVED">Approved ({approvedCount})</option>
                <option value="PUBLISHED">Published ({publishedCount})</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search statement, topic, formula..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>
          </div>

          {/* Batch Operations Bar (Floats or activates on selection) */}
          <div className="bg-slate-900 text-white p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                {selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-purple-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Select All ({filteredQuestions.length})</span>
              </button>

              {selectedIds.length > 0 && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500 text-white font-bold">
                  {selectedIds.length} Selected
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedIds.length > 0 && (
                <>
                  <button
                    onClick={handleBulkApprove}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>

                  <button
                    onClick={handleBulkPublish}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Publish Live
                  </button>

                  <button
                    onClick={handleBulkReject}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Reject
                  </button>

                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  const targetList = selectedIds.length > 0 
                    ? questions.filter(q => selectedIds.includes(q.id))
                    : filteredQuestions;
                  questionBankService.exportQuestions('csv', targetList);
                  showToast(`Exported ${targetList.length} items to CSV`, 'success');
                }}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Question Items List */}
          {loading ? (
            <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">No Questions Found</h4>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                Try resetting your filters or launch the AI Question Studio to synthesize new practice items.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => {
                const isExpanded = expandedId === q.id;
                const isSelected = selectedIds.includes(q.id);
                const matchedExam = exams.find(e => e.id === q.examId);

                return (
                  <div
                    key={q.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                      isSelected 
                        ? 'border-purple-500 ring-2 ring-purple-500/20' 
                        : q.status === 'AI_GENERATED'
                        ? 'border-amber-200 bg-amber-50/5'
                        : q.status === 'PUBLISHED'
                        ? 'border-slate-200'
                        : 'border-sky-200'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggleSelectOne(q.id)}
                          className="mt-1 text-slate-400 hover:text-purple-600 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 font-mono">
                          #{idx + 1}
                        </span>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 font-mono">
                              {matchedExam ? matchedExam.shortName : q.examName}
                            </span>
                            <span className="text-xs font-semibold text-slate-700">
                              {q.subject} • {q.topic}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                q.difficulty === 'HARD'
                                  ? 'bg-rose-100 text-rose-700'
                                  : q.difficulty === 'MEDIUM'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {q.difficulty}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              +{q.marks} / -{q.negativeMarks}
                            </span>
                          </div>

                          {/* Bilingual Question Text in Card Row */}
                          <p className="text-sm font-semibold text-slate-900 leading-snug cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : q.id)}>
                            {languageMode === 'hi' && q.hindiQuestionText ? q.hindiQuestionText : q.questionText}
                          </p>
                          {languageMode === 'bilingual' && q.hindiQuestionText && (
                            <p className="text-xs text-slate-500 font-normal">
                              {q.hindiQuestionText}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Control Badges */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-mono ${
                            q.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.status === 'APPROVED'
                              ? 'bg-sky-100 text-sky-800'
                              : q.status === 'AI_GENERATED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {q.status.replace(/_/g, ' ')}
                        </span>

                        {/* Student Simulation Button */}
                        <button
                          onClick={() => handleLaunchSandbox(q)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
                          title="Simulate Student Test-Taking Experience"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>

                        {/* AI Quality Audit Button */}
                        <button
                          onClick={() => handleOpenAiAudit(q)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 transition-colors cursor-pointer"
                          title="Run Automated AI Pedagogical Quality & Ambiguity Audit"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(q)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 transition-colors cursor-pointer"
                          title="Edit Question Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : q.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details & Human Review Controls */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-4">
                        {/* Bilingual Statements View */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                              English Question Statement
                            </span>
                            <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                              {q.questionText}
                            </p>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                              Hindi Question Statement (हिंदी)
                            </span>
                            <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                              {q.hindiQuestionText || '(Hindi translation not generated yet)'}
                            </p>
                          </div>
                        </div>

                        {/* Options Grid */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                            Distractor Options & Key
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map(opt => {
                              const isCorrect = opt.id === q.correctAnswer || opt.isCorrect;
                              return (
                                <div
                                  key={opt.id}
                                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                                    isCorrect
                                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                                      : 'border-slate-200 bg-white text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                        isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {opt.id}
                                    </span>
                                    <span>{opt.text}</span>
                                  </div>
                                  {isCorrect && (
                                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">
                                      Correct Key
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Solution Explanation */}
                        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 space-y-1 text-xs">
                          <div className="font-bold text-indigo-950 uppercase flex items-center gap-1.5 text-[11px] font-mono">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            Step-by-Step Pedagogical & Conceptual Solution
                          </div>
                          <p className="text-indigo-950 leading-relaxed whitespace-pre-line text-xs">
                            {q.explanation}
                          </p>
                          {q.hindiExplanation && (
                            <p className="text-indigo-900/80 text-[11px] pt-1 border-t border-indigo-100 mt-2">
                              <strong>हिंदी व्याख्या:</strong> {q.hindiExplanation}
                            </p>
                          )}
                        </div>

                        {/* Quality Review Actions Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="text-xs text-slate-500 space-x-3 font-mono text-[11px]">
                            <span>Source: <strong className="text-slate-700">{q.source}</strong></span>
                            {q.approvedBy && (
                              <span>Verified By: <strong className="text-emerald-700">{q.approvedBy}</strong></span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {q.status === 'AI_GENERATED' && (
                              <>
                                <button
                                  onClick={() => handleReject(q.id)}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Reject Draft
                                </button>
                                <button
                                  onClick={() => handleApprove(q.id)}
                                  className="flex items-center gap-1 px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve Item
                                </button>
                              </>
                            )}

                            {q.status === 'APPROVED' && (
                              <button
                                onClick={() => handlePublish(q.id)}
                                className="flex items-center gap-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Publish to Live
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(q.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI QUESTION STUDIO */}
      {activeTab === 'ai_studio' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Generation Form & Presets */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">Neural Question Generator Engine</h3>
                      <p className="text-xs text-slate-500">Bilingual synthesis calibrated to official commission blueprints</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    ZERO HALLUCINATION GUARD
                  </span>
                </div>

                <form onSubmit={handleGenerateAI} className="space-y-4 text-xs">
                  {/* Exam Selector */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Target Examination *
                    </label>
                    <select
                      value={aiExamId}
                      onChange={e => setAiExamId(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      {exams.map(ex => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name} ({ex.category || 'National Level'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject and Topic */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">
                        Curriculum Subject *
                      </label>
                      <input
                        type="text"
                        value={aiSubject}
                        onChange={e => setAiSubject(e.target.value)}
                        required
                        placeholder="e.g. Quantitative Aptitude"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">
                        Syllabus Topic *
                      </label>
                      <input
                        type="text"
                        value={aiTopic}
                        onChange={e => setAiTopic(e.target.value)}
                        required
                        placeholder="e.g. Percentage & Ratio Variation"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Difficulty, Count & Bloom Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">
                        Commission Difficulty *
                      </label>
                      <select
                        value={aiDifficulty}
                        onChange={e => setAiDifficulty(e.target.value as QuestionDifficulty)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                      >
                        <option value="EASY">EASY (Foundation Level)</option>
                        <option value="MEDIUM">MEDIUM (Tier 1 Standard)</option>
                        <option value="HARD">HARD (Challenging / Tier 2)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">
                        Batch Count (1-10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={aiCount}
                        onChange={e => setAiCount(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">
                        Bloom's Cognitive Level
                      </label>
                      <select
                        value={aiBloomLevel}
                        onChange={e => setAiBloomLevel(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                      >
                        <option value="Recall">Recall / Knowledge</option>
                        <option value="Understanding">Understanding / Conceptual</option>
                        <option value="Application">Application / Multi-step</option>
                        <option value="Analysis">Analysis / Critical Trap</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Guidance Prompt */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Pedagogical Guidance & Commission Shift Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      placeholder="e.g. Focus on questions tested in recent 3 years commission shifts, require 2-step algebraic deduction, ensure bilingual Hindi parity..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-normal"
                    />
                  </div>

                  {/* Generation Progress Indicator (when synthesizing) */}
                  {isGenerating && (
                    <div className="p-4 rounded-xl bg-purple-950 text-white border border-purple-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-purple-300 flex items-center gap-2">
                          <Cpu className="w-4 h-4 animate-spin text-purple-400" />
                          Synthesizing Examination Question Bank Items...
                        </span>
                        <span className="text-purple-400 font-bold">{genStep * 20}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${genStep * 20}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-purple-300/80 font-mono">
                        Stage {genStep}/5: {
                          genStep === 1 ? 'Prompt Blueprint Alignment' :
                          genStep === 2 ? 'Plausible Distractor Synthesis' :
                          genStep === 3 ? 'Bilingual Hindi Translation Check' :
                          genStep === 4 ? 'Mathematical Consistency Verification' : 'Publishing to Draft Review Pool'
                        }
                      </p>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isGenerating ? 'Synthesizing...' : `Generate ${aiCount} Questions with AI`}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Right Column: Instant Syllabus Presets */}
            <div className="space-y-4">
              <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Instant Commission Syllabus Presets
                </h3>
                <p className="text-xs text-slate-500">
                  Pre-configured prompt patterns aligned with official exam blueprints:
                </p>

                <div className="space-y-2.5 pt-1">
                  {[
                    {
                      title: 'SSC CGL Tier 1 Math Drill',
                      examName: 'SSC CGL',
                      subject: 'Quantitative Aptitude',
                      topic: 'Time, Speed and Distance',
                      diff: 'MEDIUM' as QuestionDifficulty,
                      prompt: 'Focus on relative speed of two trains and circular track meetings. Include bilingual Hindi translation.'
                    },
                    {
                      title: 'UPSC CSAT Reasoning Traps',
                      examName: 'UPSC Civil Services',
                      subject: 'General Studies Paper II (CSAT)',
                      topic: 'Logical Deductions & Syllogisms',
                      diff: 'HARD' as QuestionDifficulty,
                      prompt: 'Formulate tricky multi-premise categorical syllogisms where common sense does not apply.'
                    },
                    {
                      title: 'IBPS PO Data Sufficiency',
                      examName: 'Banking',
                      subject: 'Quantitative Reasoning',
                      topic: 'Data Sufficiency Statements',
                      diff: 'HARD' as QuestionDifficulty,
                      prompt: 'Two statement data sufficiency format. Ensure neither statement alone is sufficient.'
                    },
                    {
                      title: 'Railway NTPC Science & Tech',
                      examName: 'Railway NTPC',
                      subject: 'General Awareness',
                      topic: 'Optics and Wave Mechanics',
                      diff: 'EASY' as QuestionDifficulty,
                      prompt: 'Application of total internal reflection and concave mirrors in daily optical instruments.'
                    }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyPromptPreset(preset)}
                      className="w-full p-3 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 text-left transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{preset.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-bold">
                          {preset.diff}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{preset.prompt}</p>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUALITY & DUPLICATE RADAR */}
      {activeTab === 'radar' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Radar className="w-5 h-5 text-cyan-600" />
                  National Question Bank Duplicate & Overlap Scanner
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identifies near-identical question statements, identical numerical parameters, and conceptual duplicates.
                </p>
              </div>

              <Button
                onClick={handleRunDuplicateScan}
                disabled={duplicateScanning}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${duplicateScanning ? 'animate-spin' : ''}`} />
                {duplicateScanning ? 'Scanning Archive...' : 'Scan for Duplicates'}
              </Button>
            </div>

            {duplicateScanning ? (
              <div className="py-16 text-center space-y-3">
                <Radar className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-800">Analyzing pairwise linguistic overlap across questions...</p>
                <p className="text-xs text-slate-500">Checking Jaccard token metrics and subject isolation.</p>
              </div>
            ) : duplicatePairs.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900">Zero Critical Duplicates Detected</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  All active questions in the repository maintain distinct linguistic and pedagogical fingerprints.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Found <strong>{duplicatePairs.length}</strong> Potential Collisions:</span>
                </div>

                <div className="space-y-3">
                  {duplicatePairs.map((pair, pIdx) => (
                    <div key={pIdx} className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          {pair.matchType.replace(/_/g, ' ')} ({pair.similarity}% similarity)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-300">
                          Subject: {pair.q1.subject}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400">ITEM A (#{pair.q1.id})</span>
                          <p className="text-slate-800 font-medium">{pair.q1.questionText}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400">ITEM B (#{pair.q2.id})</span>
                          <p className="text-slate-800 font-medium">{pair.q2.questionText}</p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => { handleDelete(pair.q2.id); setDuplicatePairs(prev => prev.filter((_, idx) => idx !== pIdx)); }}
                          className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 cursor-pointer"
                        >
                          Archive Duplicate (Item B)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 4: CURRICULUM BI */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                Distribution by Difficulty
              </h3>

              <div className="space-y-3 pt-2 text-xs">
                {['EASY', 'MEDIUM', 'HARD'].map(diff => {
                  const count = questions.filter(q => q.difficulty === diff).length;
                  const pct = questions.length > 0 ? ((count / questions.length) * 100).toFixed(0) : '0';
                  return (
                    <div key={diff} className="space-y-1">
                      <div className="flex justify-between font-mono">
                        <span className="font-bold text-slate-700">{diff}</span>
                        <span className="text-slate-500">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            diff === 'HARD' ? 'bg-rose-500' : diff === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4 md:col-span-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Coverage by Subject Curriculum
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                {subjects.slice(0, 8).map(sub => {
                  const subCount = questions.filter(q => q.subject === sub).length;
                  const ready = questions.filter(q => q.subject === sub && (q.status === 'PUBLISHED' || q.status === 'APPROVED')).length;
                  return (
                    <div key={sub} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 truncate max-w-[180px]">{sub}</span>
                        <span className="font-mono text-[11px] font-bold text-purple-700">{subCount} items</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{ready} approved & published</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 5: STUDIO GUIDE */}
      {activeTab === 'guide' && (
        <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Question Bank & AI Studio Operations Manual</h3>
              <p className="text-xs text-slate-500">Human-in-the-Loop workflows, prompt engineering, and publishing safeguards</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-600" />
                Rule 17: Human-in-the-Loop Approval Policy
              </h4>
              <p>
                All questions generated via the AI Studio are tagged as <code>AI_GENERATED</code>. They are strictly quarantined from student mock tests until an authorized administrator verifies pedagogical soundness and marks them <code>APPROVED</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Languages className="w-4 h-4 text-purple-600" />
                Bilingual Parity Architecture
              </h4>
              <p>
                National examinations (SSC, UPSC, Banking, Railway) require simultaneous Hindi and English question statements. Ensure Hindi technical terms align with official commission glossaries.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-600" />
                Student Simulation Sandbox
              </h4>
              <p>
                Click the play icon on any question to test answering it from a student perspective. This ensures options are mutually exclusive and explanations render correctly before publishing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Radar className="w-4 h-4 text-cyan-600" />
                Duplicate Detection Standards
              </h4>
              <p>
                Run the Duplicate Radar periodically to prune near-identical statements, ensuring mock tests offer diverse problem varieties.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* MODAL 1: STUDENT SANDBOX SIMULATOR */}
      {sandboxQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Play className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Student Test Simulation Sandbox</h3>
                  <p className="text-slate-500 text-xs font-mono">
                    {sandboxQuestion.examName} • {sandboxQuestion.subject}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSandboxQuestion(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Question Statement</span>
                <p className="text-sm font-semibold text-slate-900 leading-snug">
                  {sandboxQuestion.questionText}
                </p>
                {sandboxQuestion.hindiQuestionText && (
                  <p className="text-xs text-slate-600 pt-1">
                    {sandboxQuestion.hindiQuestionText}
                  </p>
                )}
              </div>

              {/* Interactive Options */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Select Your Answer:</span>
                <div className="grid grid-cols-1 gap-2">
                  {sandboxQuestion.options.map(opt => {
                    const isSelected = sandboxSelectedOpt === opt.id;
                    const isCorrect = opt.id === sandboxQuestion.correctAnswer || opt.isCorrect;

                    let optStyle = "border-slate-200 hover:bg-slate-50 text-slate-800";
                    if (sandboxSubmitted) {
                      if (isCorrect) optStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                      else if (isSelected && !isCorrect) optStyle = "border-rose-500 bg-rose-50 text-rose-950 font-bold";
                    } else if (isSelected) {
                      optStyle = "border-purple-500 bg-purple-50 text-purple-950 font-bold";
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (!sandboxSubmitted) {
                            playCyberSound('click');
                            setSandboxSelectedOpt(opt.id);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${optStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {sandboxSubmitted && isCorrect && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">
                            Correct Key
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Solution breakdown revealed upon submission */}
              {sandboxSubmitted && (
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      Official Pedagogical Solution
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      sandboxSelectedOpt === sandboxQuestion.correctAnswer
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {sandboxSelectedOpt === sandboxQuestion.correctAnswer ? '+2.0 Marks (Correct)' : '-0.5 Marks (Incorrect)'}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-950 leading-relaxed whitespace-pre-line">
                    {sandboxQuestion.explanation}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setSandboxSelectedOpt(null);
                    setSandboxSubmitted(false);
                    playCyberSound('toggle');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Trial
                </button>

                {!sandboxSubmitted ? (
                  <Button
                    onClick={() => {
                      if (!sandboxSelectedOpt) {
                        showToast('Please select an option first', 'warning');
                        return;
                      }
                      playCyberSound('confirm');
                      setSandboxSubmitted(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setSandboxQuestion(null)}
                    className="cursor-pointer"
                  >
                    Close Simulator
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AI QUALITY & AMBIGUITY AUDIT */}
      {auditTargetQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">AI Pedagogical Quality & Ambiguity Audit</h3>
                  <p className="text-slate-500 text-xs font-mono">
                    Multi-factor inspection for distractors, grammar & syllabus bounds
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuditTargetQuestion(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {auditLoading ? (
                <div className="py-12 text-center space-y-2">
                  <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                  <p className="font-bold text-slate-800">Evaluating distractor mutual exclusivity...</p>
                </div>
              ) : auditResult ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">Quality Score</span>
                      <p className="text-2xl font-black text-emerald-700 mt-0.5">{auditResult.overallScore}%</p>
                      <p className="text-[10px] text-emerald-600 font-bold">Pedagogically Sound</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-center">
                      <span className="text-[10px] font-mono font-bold text-purple-800 uppercase">Ambiguity Index</span>
                      <p className="text-2xl font-black text-purple-700 mt-0.5">{auditResult.ambiguityScore}%</p>
                      <p className="text-[10px] text-purple-600 font-bold">Within ISO Boundary (&lt;5%)</p>
                    </div>
                  </div>

                  {/* Audit Checklist */}
                  <div className="space-y-2 pt-1">
                    <span className="font-bold text-slate-700 uppercase text-[10px] font-mono">Verification Checks:</span>
                    {auditResult.checks.map((chk: any, cIdx: number) => (
                      <div key={cIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">{chk.name}</p>
                          <p className="text-[11px] text-slate-500">{chk.detail}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          chk.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {chk.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <strong className="text-slate-800">Reading Level:</strong> {auditResult.readabilityGrade}
                  </div>
                </>
              ) : null}

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <Button
                  onClick={() => setAuditTargetQuestion(null)}
                  className="bg-slate-900 text-white font-bold cursor-pointer"
                >
                  Close Audit Telemetry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MANUAL QUESTION AUTHORING & EDITING */}
      {isAuthorModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingQuestion.id ? 'Edit Question Details' : 'Author New Exam Question'}
                  </h3>
                  <p className="text-slate-500 text-xs font-mono">
                    Standard Commission Multiple Choice & Bilingual Formatting
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAuthorModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestionForm} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Target Exam *</label>
                  <select
                    value={editingQuestion.examId}
                    onChange={e => setEditingQuestion({ ...editingQuestion, examId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                  >
                    {exams.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Difficulty *</label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={e => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.subject || ''}
                    onChange={e => setEditingQuestion({ ...editingQuestion, subject: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Topic *</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.topic || ''}
                    onChange={e => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">English Question Statement *</label>
                <textarea
                  rows={2}
                  required
                  value={editingQuestion.questionText || ''}
                  onChange={e => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                  placeholder="Enter complete problem text..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Hindi Question Statement (हिंदी अनुवाद)</label>
                <textarea
                  rows={2}
                  value={editingQuestion.hindiQuestionText || ''}
                  onChange={e => setEditingQuestion({ ...editingQuestion, hindiQuestionText: e.target.value })}
                  placeholder="हिंदी में प्रश्न विवरण..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              {/* Options Builder */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 uppercase text-[10px] font-mono">
                  Answer Options & Correct Answer Key *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {editingQuestion.options?.map((opt, oIdx) => (
                    <div key={opt.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Option {opt.id}</span>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="correctAnswerKey"
                            checked={editingQuestion.correctAnswer === opt.id}
                            onChange={() => {
                              const opts = editingQuestion.options!.map(o => ({
                                ...o,
                                isCorrect: o.id === opt.id
                              }));
                              setEditingQuestion({
                                ...editingQuestion,
                                options: opts,
                                correctAnswer: opt.id
                              });
                            }}
                            className="text-emerald-600 cursor-pointer"
                          />
                          <span className="text-[10px] font-bold text-emerald-700">Correct Key</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={e => {
                          const opts = [...editingQuestion.options!];
                          opts[oIdx].text = e.target.value;
                          setEditingQuestion({ ...editingQuestion, options: opts });
                        }}
                        placeholder={`Option ${opt.id} text...`}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Step-by-Step Pedagogical Explanation *</label>
                <textarea
                  rows={2}
                  required
                  value={editingQuestion.explanation || ''}
                  onChange={e => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  placeholder="Explain conceptual proof or calculation..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAuthorModalOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Save Question to Bank
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
