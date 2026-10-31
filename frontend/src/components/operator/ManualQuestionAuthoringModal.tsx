// FOCUSPOINT Pan-India Operator Manual Question Authoring Studio
// Supports MCQ, Multiple Correct, Numerical, Assertion-Reason, Match the Following, and Bilingual Composition

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Languages, 
  Layers, 
  Sigma, 
  Clock, 
  BookOpen, 
  X, 
  Check, 
  ShieldCheck,
  Split,
  Laptop,
  Smartphone
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { 
  QuestionItem, 
  QuestionType, 
  QuestionDifficulty, 
  QuestionStatus, 
  QuestionOption,
  MatchPair
} from '../../types/academicIntelligence';

interface ManualQuestionAuthoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: QuestionItem) => void;
  initialQuestion?: QuestionItem | null;
  availableExams?: { id: string; name: string; subjects: string[] }[];
}

export const ManualQuestionAuthoringModal: React.FC<ManualQuestionAuthoringModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuestion,
  availableExams = []
}) => {
  // Active authoring view
  const [activeTab, setActiveTab] = useState<'AUTHOR' | 'PREVIEW'>('AUTHOR');
  const [previewDevice, setPreviewDevice] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
  const [activeLanguage, setActiveLanguage] = useState<'ENGLISH' | 'HINDI' | 'SPLIT'>('ENGLISH');

  // Form Fields
  const [examId, setExamId] = useState(initialQuestion?.examId || 'exam-ssc-cgl');
  const [examName, setExamName] = useState(initialQuestion?.examName || 'SSC CGL');
  const [subject, setSubject] = useState(initialQuestion?.subject || 'Quantitative Aptitude');
  const [topic, setTopic] = useState(initialQuestion?.topic || 'Algebra');
  const [chapter, setChapter] = useState(initialQuestion?.chapter || 'Polynomials');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(initialQuestion?.difficulty || 'MEDIUM');
  const [questionType, setQuestionType] = useState<QuestionType>(initialQuestion?.questionType || 'MCQ');
  
  // English Content
  const [questionText, setQuestionText] = useState(initialQuestion?.questionText || '');
  const [assertionText, setAssertionText] = useState(initialQuestion?.assertionText || '');
  const [reasonText, setReasonText] = useState(initialQuestion?.reasonText || '');
  const [passageText, setPassageText] = useState(initialQuestion?.passageText || '');
  const [explanation, setExplanation] = useState(initialQuestion?.explanation || '');
  
  // Hindi Content (Bilingual Support)
  const [hindiQuestionText, setHindiQuestionText] = useState(initialQuestion?.hindiQuestionText || '');
  const [hindiExplanation, setHindiExplanation] = useState(initialQuestion?.hindiExplanation || '');

  // Options
  const [options, setOptions] = useState<QuestionOption[]>(
    initialQuestion?.options && initialQuestion.options.length > 0
      ? initialQuestion.options
      : [
          { id: 'opt_1', text: '', isCorrect: true },
          { id: 'opt_2', text: '', isCorrect: false },
          { id: 'opt_3', text: '', isCorrect: false },
          { id: 'opt_4', text: '', isCorrect: false }
        ]
  );

  // Match the following pairs
  const [matchPairs, setMatchPairs] = useState<MatchPair[]>(
    initialQuestion?.matchPairs || [
      { left: 'List I: Item A', right: 'List II: Match 1' },
      { left: 'List I: Item B', right: 'List II: Match 2' },
      { left: 'List I: Item C', right: 'List II: Match 3' },
      { left: 'List I: Item D', right: 'List II: Match 4' }
    ]
  );

  // Numerical Answer
  const [numericalAnswer, setNumericalAnswer] = useState<number>(initialQuestion?.numericalAnswer || 0);
  const [numericalTolerance, setNumericalTolerance] = useState<number>(initialQuestion?.numericalTolerance || 0);

  // Scoring
  const [marks, setMarks] = useState<number>(initialQuestion?.marks || 2.0);
  const [negativeMarks, setNegativeMarks] = useState<number>(initialQuestion?.negativeMarks || 0.5);
  const [status, setStatus] = useState<QuestionStatus>(initialQuestion?.status || 'APPROVED');

  // Reset form when initialQuestion changes
  useEffect(() => {
    if (initialQuestion) {
      setExamId(initialQuestion.examId);
      setExamName(initialQuestion.examName);
      setSubject(initialQuestion.subject);
      setTopic(initialQuestion.topic);
      setChapter(initialQuestion.chapter || '');
      setDifficulty(initialQuestion.difficulty);
      setQuestionType(initialQuestion.questionType);
      setQuestionText(initialQuestion.questionText);
      setAssertionText(initialQuestion.assertionText || '');
      setReasonText(initialQuestion.reasonText || '');
      setPassageText(initialQuestion.passageText || '');
      setExplanation(initialQuestion.explanation);
      setHindiQuestionText(initialQuestion.hindiQuestionText || '');
      setHindiExplanation(initialQuestion.hindiExplanation || '');
      setOptions(initialQuestion.options.length > 0 ? initialQuestion.options : [
        { id: 'opt_1', text: '', isCorrect: true },
        { id: 'opt_2', text: '', isCorrect: false },
        { id: 'opt_3', text: '', isCorrect: false },
        { id: 'opt_4', text: '', isCorrect: false }
      ]);
      setMarks(initialQuestion.marks);
      setNegativeMarks(initialQuestion.negativeMarks);
      setStatus(initialQuestion.status);
    }
  }, [initialQuestion]);

  // Insert Math Formula symbol at current cursor
  const handleInsertSymbol = (symbol: string) => {
    setQuestionText(prev => prev + ' ' + symbol + ' ');
  };

  // Option Updates
  const handleOptionTextChange = (index: number, text: string) => {
    const updated = [...options];
    updated[index].text = text;
    setOptions(updated);
  };

  const handleToggleCorrectOption = (index: number) => {
    if (questionType === 'MCQ' || questionType === 'ASSERTION_REASON' || questionType === 'TRUE_FALSE') {
      const updated = options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index
      }));
      setOptions(updated);
    } else {
      // Multiple correct allows toggling multiple
      const updated = [...options];
      updated[index].isCorrect = !updated[index].isCorrect;
      setOptions(updated);
    }
  };

  const handleAddOption = () => {
    if (options.length >= 6) return;
    setOptions([
      ...options,
      { id: `opt_${Date.now()}`, text: '', isCorrect: false }
    ]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  // Real-time Validation Checks
  const hasValidQuestionText = questionText.trim().length >= 8;
  const hasSelectedCorrect = questionType === 'NUMERICAL' 
    ? !isNaN(Number(numericalAnswer)) 
    : options.some(o => o.isCorrect);

  const duplicateOptionTexts = options.filter((opt, idx) => 
    opt.text.trim() && options.findIndex(o => o.text.trim().toLowerCase() === opt.text.trim().toLowerCase()) !== idx
  );
  const hasDuplicateOptions = duplicateOptionTexts.length > 0;
  const hasExplanation = explanation.trim().length >= 8;
  const isFormValid = hasValidQuestionText && hasSelectedCorrect && !hasDuplicateOptions;

  // Estimated reading time (seconds)
  const wordCount = (questionText + ' ' + options.map(o => o.text).join(' ')).split(/\s+/).filter(Boolean).length;
  const estimatedReadingSeconds = Math.max(15, Math.round((wordCount / 160) * 60));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const correctAnsLabel = questionType === 'NUMERICAL' 
      ? String(numericalAnswer) 
      : (['A', 'B', 'C', 'D', 'E', 'F'][options.findIndex(o => o.isCorrect)] || 'A');

    const createdQuestion: QuestionItem = {
      id: initialQuestion?.id || `qb-staff-${Date.now()}`,
      examId,
      examName,
      subject,
      topic,
      chapter,
      difficulty,
      questionType,
      questionText,
      hindiQuestionText: hindiQuestionText || undefined,
      assertionText: questionType === 'ASSERTION_REASON' ? assertionText : undefined,
      reasonText: questionType === 'ASSERTION_REASON' ? reasonText : undefined,
      passageText: questionType === 'COMPREHENSION' ? passageText : undefined,
      matchPairs: questionType === 'MATCH_FOLLOWING' ? matchPairs : undefined,
      options,
      correctAnswer: correctAnsLabel,
      correctAnswers: questionType === 'MULTIPLE_CORRECT' ? options.filter(o => o.isCorrect).map(o => o.id) : undefined,
      numericalAnswer: questionType === 'NUMERICAL' ? Number(numericalAnswer) : undefined,
      numericalTolerance: questionType === 'NUMERICAL' ? Number(numericalTolerance) : undefined,
      explanation,
      hindiExplanation: hindiExplanation || undefined,
      marks: Number(marks),
      negativeMarks: Number(negativeMarks),
      language: hindiQuestionText ? 'Bilingual (Hindi + English)' : 'English',
      source: 'STAFF_AUTHORED',
      status,
      approvedBy: status === 'APPROVED' ? 'FocusPoint Academic Lead' : undefined,
      approvedAt: status === 'APPROVED' ? new Date().toISOString() : undefined,
      usageStats: initialQuestion?.usageStats || { mockTestCount: 0, studentAttempts: 0, accuracyRate: 0 },
      createdAt: initialQuestion?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(createdQuestion);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {initialQuestion ? 'Edit Question Item' : 'Manual Question Authoring Studio'}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                PRO MNC EDTECH
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Create syllabus-aligned, multi-format exam questions with real-time validation.
            </p>
          </div>
        </div>
      }
      maxWidth="6xl"
    >
      <div className="space-y-6">
        {/* Navigation & Device Toggle Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('AUTHOR')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeTab === 'AUTHOR'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Authoring Studio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PREVIEW')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'PREVIEW'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Live CBT Preview
            </button>
          </div>

          {activeTab === 'PREVIEW' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Device Simulator:</span>
              <button
                type="button"
                onClick={() => setPreviewDevice('DESKTOP')}
                className={`p-1.5 rounded-lg border transition-all ${
                  previewDevice === 'DESKTOP' 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Desktop CBT View"
              >
                <Laptop className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('MOBILE')}
                className={`p-1.5 rounded-lg border transition-all ${
                  previewDevice === 'MOBILE' 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Mobile Test View"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5" /> Language Mode:
              </span>
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveLanguage('ENGLISH')}
                  className={`px-2.5 py-1 rounded ${activeLanguage === 'ENGLISH' ? 'bg-white shadow text-indigo-700' : 'text-slate-600'}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLanguage('HINDI')}
                  className={`px-2.5 py-1 rounded ${activeLanguage === 'HINDI' ? 'bg-white shadow text-indigo-700' : 'text-slate-600'}`}
                >
                  हिंदी
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLanguage('SPLIT')}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 ${activeLanguage === 'SPLIT' ? 'bg-white shadow text-indigo-700' : 'text-slate-600'}`}
                >
                  <Split className="w-3 h-3" /> Bilingual Split
                </button>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'AUTHOR' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Meta Hierarchy Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">Target Exam</label>
                <select
                  value={examName}
                  onChange={(e) => {
                    setExamName(e.target.value);
                    const found = availableExams.find(x => x.name === e.target.value);
                    if (found) {
                      setExamId(found.id);
                      if (found.subjects?.length) setSubject(found.subjects[0]);
                    }
                  }}
                  className="w-full text-xs font-bold p-2 rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="SSC CGL">SSC CGL</option>
                  <option value="UP Police Constable">UP Police Constable</option>
                  <option value="UPTET Paper 1">UPTET Paper 1</option>
                  <option value="Railway RRB NTPC">Railway RRB NTPC</option>
                  <option value="Banking IBPS PO">Banking IBPS PO</option>
                  <option value="NDA / NA">NDA / NA</option>
                  <option value="JEE Main">JEE Main</option>
                  <option value="NEET UG">NEET UG</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Quantitative Aptitude"
                  className="w-full text-xs font-bold p-2 rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">Topic / Module</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Quadratic Equations"
                  className="w-full text-xs font-bold p-2 rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">Question Type</label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                  className="w-full text-xs font-bold p-2 rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="MCQ">Single Choice (MCQ)</option>
                  <option value="MULTIPLE_CORRECT">Multiple Select (MSQ)</option>
                  <option value="NUMERICAL">Numerical / Integer</option>
                  <option value="ASSERTION_REASON">Assertion & Reason</option>
                  <option value="MATCH_FOLLOWING">Match Following (List I & II)</option>
                  <option value="COMPREHENSION">Passage / Comprehension</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                  className="w-full text-xs font-bold p-2 rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="EASY">Easy (Foundation)</option>
                  <option value="MEDIUM">Medium (Exam Standard)</option>
                  <option value="HARD">Hard (Advanced Distinguisher)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">Marks / Neg</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.25"
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-1/2 text-xs font-bold p-2 rounded-xl bg-white border border-slate-300 text-center"
                    title="Positive Marks"
                  />
                  <input
                    type="number"
                    step="0.25"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(Number(e.target.value))}
                    className="w-1/2 text-xs font-bold p-2 rounded-xl bg-white border border-slate-300 text-center text-rose-600"
                    title="Negative Marks"
                  />
                </div>
              </div>
            </div>

            {/* Math Formula Quick Bar */}
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-900 text-white rounded-xl text-xs">
              <span className="text-[11px] font-mono text-cyan-400 font-bold flex items-center gap-1 mr-1">
                <Sigma className="w-3.5 h-3.5" /> Formula Insert:
              </span>
              {[
                { label: 'x²', val: 'x²' },
                { label: '√x', val: '√(x)' },
                { label: 'a/b', val: '(a/b)' },
                { label: 'π', val: 'π' },
                { label: '±', val: '±' },
                { label: 'Δ', val: 'Δ' },
                { label: 'θ', val: 'θ' },
                { label: '≤', val: '≤' },
                { label: '≥', val: '≥' },
                { label: '∞', val: '∞' },
                { label: '≈', val: '≈' },
                { label: 'Ω', val: 'Ω' },
                { label: 'CO₂', val: 'CO₂' },
                { label: 'H₂O', val: 'H₂O' }
              ].map(sym => (
                <button
                  key={sym.label}
                  type="button"
                  onClick={() => handleInsertSymbol(sym.val)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs border border-slate-700 transition-all hover:scale-105 active:scale-95"
                >
                  {sym.label}
                </button>
              ))}
            </div>

            {/* Special Type Specific Headers */}
            {questionType === 'COMPREHENSION' && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
                <label className="block text-xs font-black text-indigo-950 uppercase flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Passage / Case Study Text (Parent Context)
                </label>
                <textarea
                  rows={4}
                  value={passageText}
                  onChange={(e) => setPassageText(e.target.value)}
                  placeholder="Paste the common reading passage, editorial, or data table here..."
                  className="w-full text-xs p-3 rounded-xl bg-white border border-indigo-200 focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
                />
              </div>
            )}

            {questionType === 'ASSERTION_REASON' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-amber-50/60 border border-amber-200 rounded-2xl">
                <div>
                  <label className="block text-xs font-black text-amber-950 uppercase mb-1">
                    Assertion (A) Statement
                  </label>
                  <textarea
                    rows={3}
                    value={assertionText}
                    onChange={(e) => setAssertionText(e.target.value)}
                    placeholder="Enter Assertion proposition..."
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-amber-200 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-amber-950 uppercase mb-1">
                    Reason (R) Statement
                  </label>
                  <textarea
                    rows={3}
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                    placeholder="Enter Reason proposition..."
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-amber-200 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Question Text Area (Split / Single) */}
            <div className={`grid gap-4 ${activeLanguage === 'SPLIT' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {(activeLanguage === 'ENGLISH' || activeLanguage === 'SPLIT') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                      Question Text (English) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {questionText.length} chars | ~{estimatedReadingSeconds}s read
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Type the exact question stem here..."
                    className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-sans"
                    required
                  />
                </div>
              )}

              {(activeLanguage === 'HINDI' || activeLanguage === 'SPLIT') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                      हिंदी प्रश्न विवरण (Hindi Translation)
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      वैकल्पिक द्विभाषी समर्थन
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={hindiQuestionText}
                    onChange={(e) => setHindiQuestionText(e.target.value)}
                    placeholder="यहाँ हिंदी में प्रश्न लिखें..."
                    className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-sans"
                  />
                </div>
              )}
            </div>

            {/* Numerical Input or Multiple Options Selection */}
            {questionType === 'NUMERICAL' ? (
              <div className="p-5 bg-cyan-50/60 border border-cyan-200 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-cyan-950 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  Numerical Exact Value Key
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Correct Numerical Value:
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={numericalAnswer}
                      onChange={(e) => setNumericalAnswer(Number(e.target.value))}
                      className="w-full text-sm font-mono font-bold p-3 rounded-xl bg-white border border-cyan-300 focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Allowed Tolerance (± Δ):
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={numericalTolerance}
                      onChange={(e) => setNumericalTolerance(Number(e.target.value))}
                      placeholder="0 (Exact value)"
                      className="w-full text-sm font-mono font-bold p-3 rounded-xl bg-white border border-cyan-300 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>
            ) : questionType === 'MATCH_FOLLOWING' ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 uppercase">List Matching Matrix</h4>
                  <span className="text-[11px] text-slate-500">Provide column pairs</span>
                </div>
                <div className="space-y-2">
                  {matchPairs.map((pair, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-3 items-center">
                      <input
                        type="text"
                        value={pair.left}
                        onChange={(e) => {
                          const updated = [...matchPairs];
                          updated[idx].left = e.target.value;
                          setMatchPairs(updated);
                        }}
                        className="text-xs p-2 rounded-xl bg-white border border-slate-300"
                        placeholder={`List I (${idx + 1})`}
                      />
                      <input
                        type="text"
                        value={pair.right}
                        onChange={(e) => {
                          const updated = [...matchPairs];
                          updated[idx].right = e.target.value;
                          setMatchPairs(updated);
                        }}
                        className="text-xs p-2 rounded-xl bg-white border border-slate-300"
                        placeholder={`List II (${idx + 1})`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* MCQ & MSQ Options Matrix */
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                      Answer Choices & Correct Key
                      <span className="text-slate-400 font-normal">
                        ({questionType === 'MULTIPLE_CORRECT' ? 'Click checkboxes for all correct answers' : 'Click radio button for the single correct answer'})
                      </span>
                    </h4>
                  </div>
                  {options.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Choice
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {options.map((opt, idx) => {
                    const label = ['A', 'B', 'C', 'D', 'E', 'F'][idx];
                    const isDup = options.some((o, i) => i !== idx && o.text.trim() && o.text.trim().toLowerCase() === opt.text.trim().toLowerCase());

                    return (
                      <div 
                        key={opt.id || idx}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                          opt.isCorrect 
                            ? 'bg-emerald-50/80 border-emerald-300 shadow-sm' 
                            : isDup 
                            ? 'bg-rose-50 border-rose-300' 
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleCorrectOption(idx)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs transition-all ${
                            opt.isCorrect 
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                          }`}
                          title={opt.isCorrect ? 'Correct Answer' : 'Click to set as correct'}
                        >
                          {opt.isCorrect ? <Check className="w-4 h-4 stroke-[3]" /> : label}
                        </button>

                        <div className="flex-1">
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                            placeholder={`Option ${label} text...`}
                            className="w-full text-xs font-semibold p-2 rounded-lg bg-transparent focus:outline-none"
                            required
                          />
                        </div>

                        {isDup && (
                          <span className="text-[10px] font-black text-rose-600 px-2 py-0.5 rounded bg-rose-100 border border-rose-200">
                            Duplicate Option!
                          </span>
                        )}

                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Remove choice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Explanation & Pedagogy Section */}
            <div className={`grid gap-4 ${activeLanguage === 'SPLIT' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {(activeLanguage === 'ENGLISH' || activeLanguage === 'SPLIT') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                    Step-by-Step Pedagogical Explanation <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Explain the step-by-step reasoning, formulas used, shortcuts, and key learning concepts..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-sans"
                    required
                  />
                </div>
              )}

              {(activeLanguage === 'HINDI' || activeLanguage === 'SPLIT') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                    विस्तृत हिंदी व्याख्या (Hindi Explanation)
                  </label>
                  <textarea
                    rows={3}
                    value={hindiExplanation}
                    onChange={(e) => setHindiExplanation(e.target.value)}
                    placeholder="छात्रों के अध्ययन के लिए हिंदी में स्पष्टीकरण लिखें..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-sans"
                  />
                </div>
              )}
            </div>

            {/* Real-time Validation Assistant Card */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-800/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Real-time Quality Compliance Check
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className={`flex items-center gap-1 ${hasValidQuestionText ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Question Text Valid
                  </span>
                  <span className={`flex items-center gap-1 ${hasSelectedCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer Marked
                  </span>
                  <span className={`flex items-center gap-1 ${!hasDuplicateOptions ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Unique Options
                  </span>
                  <span className={`flex items-center gap-1 ${hasExplanation ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Explanation Present
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`py-2.5 px-6 rounded-xl text-xs font-black shadow-lg transition-all flex items-center gap-2 ${
                    isFormValid 
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 cursor-pointer shadow-emerald-500/25 transform hover:scale-[1.02]' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  {initialQuestion ? 'Save Question Changes' : 'Add to Master Question Bank'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Live CBT Student Simulation Preview */
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>CBT High-Fidelity Simulation:</strong> This live view demonstrates exactly how this question will appear to candidates on the student test taking portal.
              </span>
            </div>

            <div className={`mx-auto transition-all ${previewDevice === 'MOBILE' ? 'max-w-sm' : 'max-w-3xl'}`}>
              <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden">
                {/* CBT Header */}
                <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400">Q.1</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold">
                      {subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">+{marks}</span>
                    <span className="text-rose-400 font-bold">-{negativeMarks}</span>
                  </div>
                </div>

                {/* CBT Question Body */}
                <div className="p-5 space-y-4">
                  {questionType === 'COMPREHENSION' && passageText && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-serif italic">
                      {passageText}
                    </div>
                  )}

                  {questionType === 'ASSERTION_REASON' && (
                    <div className="space-y-2 text-xs text-slate-800 font-medium">
                      <p><strong>Assertion (A):</strong> {assertionText || 'No assertion entered'}</p>
                      <p><strong>Reason (R):</strong> {reasonText || 'No reason entered'}</p>
                    </div>
                  )}

                  <div className="text-sm font-bold text-slate-900 leading-relaxed">
                    {questionText || 'Enter question text in the authoring tab to preview...'}
                  </div>

                  {hindiQuestionText && (
                    <div className="text-xs text-slate-600 leading-relaxed font-sans border-t pt-2 border-slate-100">
                      {hindiQuestionText}
                    </div>
                  )}

                  {/* Options */}
                  {questionType === 'NUMERICAL' ? (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs text-slate-500 font-bold block mb-1">Student Keypad Entry:</span>
                      <input
                        type="text"
                        disabled
                        placeholder={`Correct Key: ${numericalAnswer} (±${numericalTolerance})`}
                        className="w-48 text-sm font-mono p-2 rounded-lg bg-white border border-slate-300 text-slate-600"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {options.map((opt, i) => {
                        const lbl = ['A', 'B', 'C', 'D', 'E', 'F'][i];
                        return (
                          <div
                            key={opt.id || i}
                            className={`p-3 rounded-xl border flex items-center gap-3 text-xs font-medium ${
                              opt.isCorrect 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' 
                                : 'bg-slate-50/70 border-slate-200 text-slate-800'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              opt.isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {lbl}
                            </span>
                            <span className="flex-1">{opt.text || `[Option ${lbl} blank]`}</span>
                            {opt.isCorrect && (
                              <span className="text-[10px] font-black uppercase text-emerald-700 px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200">
                                Correct Key
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation Review Box */}
                  <div className="p-4 bg-indigo-50/80 rounded-xl border border-indigo-200 space-y-1.5 mt-4">
                    <span className="text-[11px] font-black uppercase text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Pedagogical Solution Breakdown
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      {explanation || 'No explanation provided yet.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
