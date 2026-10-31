import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Clock, 
  HelpCircle, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  BookOpen, 
  Layers, 
  Target, 
  Award, 
  AlertCircle, 
  ChevronRight,
  FileCheck2,
  Send,
  Sliders,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { 
  GovernmentExam, 
  CustomMockDrillRequest, 
  CustomMockDrillDifficulty, 
  CustomMockDrillTestType 
} from '../../types/academicIntelligence';
import { mockTestService } from '../../services/mockTestService';

interface CustomMockDrillRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableExams: GovernmentExam[];
  preselectedExam?: GovernmentExam | null;
  studentId: string;
  studentName: string;
  recommendedSubject?: string;
  recommendedTopic?: string;
  onRequestSubmitted: (newRequest: CustomMockDrillRequest) => void;
}

export const CustomMockDrillRequestModal: React.FC<CustomMockDrillRequestModalProps> = ({
  isOpen,
  onClose,
  availableExams,
  preselectedExam,
  studentId,
  studentName,
  recommendedSubject,
  recommendedTopic,
  onRequestSubmitted
}) => {
  // Wizard Step: 1 = Exam, 2 = Subject, 3 = Topic, 4 = Difficulty, 5 = Preferences, 6 = Review, 7 = Submitted
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // Form State
  const [selectedExamId, setSelectedExamId] = useState<string>(preselectedExam?.id || '');
  const [selectedSubject, setSelectedSubject] = useState<string>(recommendedSubject || '');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>(recommendedTopic || '');
  const [difficulty, setDifficulty] = useState<CustomMockDrillDifficulty>('MODERATE');
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [language, setLanguage] = useState<string>('Bilingual');
  const [testType, setTestType] = useState<CustomMockDrillTestType>('Practice Drill');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<CustomMockDrillRequest | null>(null);

  // Update selected exam when preselectedExam changes
  useEffect(() => {
    if (preselectedExam) {
      setSelectedExamId(preselectedExam.id);
      if (preselectedExam.subjects.length > 0 && !selectedSubject) {
        setSelectedSubject(recommendedSubject || preselectedExam.subjects[0]);
      }
    }
  }, [preselectedExam, recommendedSubject]);

  const activeExam = useMemo(() => {
    return availableExams.find(e => e.id === selectedExamId) || preselectedExam || availableExams[0];
  }, [availableExams, selectedExamId, preselectedExam]);

  // Available subjects for the active exam
  const examSubjects = useMemo(() => {
    if (!activeExam) return [];
    return activeExam.subjects || [];
  }, [activeExam]);

  // When active exam changes, auto-select first subject if current not in list
  useEffect(() => {
    if (examSubjects.length > 0 && (!selectedSubject || !examSubjects.includes(selectedSubject))) {
      setSelectedSubject(recommendedSubject && examSubjects.includes(recommendedSubject) ? recommendedSubject : examSubjects[0]);
    }
  }, [examSubjects, selectedSubject, recommendedSubject]);

  // Dynamic topics from the exam configuration or fallback
  const availableTopics = useMemo(() => {
    if (!activeExam) return [];
    if (activeExam.topics && activeExam.topics[selectedSubject]) {
      return activeExam.topics[selectedSubject];
    }
    // Generic syllabus topics for subject
    return [
      'Comprehensive Core Syllabus',
      'High-Yield Important Concepts',
      'Fundamental Principles & Formulations',
      'Application & Advanced Problem Solving',
      'Previous 5-Year Pattern Drill'
    ];
  }, [activeExam, selectedSubject]);

  // Set default topic if not selected
  useEffect(() => {
    if (availableTopics.length > 0 && !selectedTopic) {
      setSelectedTopic(recommendedTopic || availableTopics[0]);
    }
  }, [availableTopics, selectedTopic, recommendedTopic]);

  // Duration auto-recalculation when question count changes
  useEffect(() => {
    setDurationMinutes(Math.round(questionCount * 1.2));
  }, [questionCount]);

  const handleNext = () => {
    if (step === 1 && !selectedExamId) return;
    if (step === 2 && !selectedSubject) return;
    if (step < 6) {
      setStep((prev) => (prev + 1) as any);
    }
  };

  const handleBack = () => {
    if (step > 1 && step <= 6) {
      setStep((prev) => (prev - 1) as any);
    }
  };

  const handleSubmit = async () => {
    if (!activeExam) return;
    setIsSubmitting(true);
    try {
      const request = await mockTestService.submitCustomMockRequest({
        studentId,
        studentName,
        examId: activeExam.id,
        examName: activeExam.shortName || activeExam.name,
        subject: selectedSubject,
        chapter: selectedChapter || undefined,
        topic: selectedTopic || 'Full Subject Drill',
        difficulty,
        questionCount,
        durationMinutes,
        language,
        testType,
        notes: notes.trim() || undefined,
        priority: 'MEDIUM',
        estimatedAvailability: 'Within 24 hours'
      });

      setSubmittedRequest(request);
      onRequestSubmitted(request);
      setStep(7); // Show success screen
    } catch (err: any) {
      console.error('Failed to submit custom mock drill request', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setSubmittedRequest(null);
    onClose();
  };

  const testTypesList: { type: CustomMockDrillTestType; desc: string; badge: string }[] = [
    { type: 'Practice Drill', desc: 'Curated mix of standard questions for routine practice', badge: 'Standard' },
    { type: 'Chapter Drill', desc: 'Intensive focus on a particular chapter or concept cluster', badge: 'Targeted' },
    { type: 'Subject Drill', desc: 'Balanced assessment spanning all chapters of the subject', badge: 'Broad' },
    { type: 'Revision Drill', desc: 'Spaced repetition targeting high-weightage formulas and rules', badge: 'Revision' },
    { type: 'Weak Topic Practice', desc: 'Focused exclusively on error-prone concepts based on your profile', badge: 'Adaptive' },
    { type: 'Previous-Year Based', desc: 'Questions strictly matching official past exam patterns & difficulty', badge: 'PYQ Focus' },
    { type: 'Mixed Practice', desc: 'Speed-based multi-subject problem solving drill', badge: 'Speed' },
    { type: 'Full Mock', desc: 'Comprehensive full-length exam simulation matching actual blueprint', badge: 'Exam Blueprint' }
  ];

  const difficultyLevels: { level: CustomMockDrillDifficulty; label: string; desc: string; color: string }[] = [
    { level: 'EASY', label: 'Easy / Foundational', desc: 'Direct formula and definition questions to build baseline confidence', color: 'border-emerald-300 text-emerald-700 bg-emerald-50' },
    { level: 'MODERATE', label: 'Moderate / Standard', desc: 'Representative exam-level questions with moderate computation', color: 'border-blue-300 text-blue-700 bg-blue-50' },
    { level: 'HARD', label: 'Hard / Conceptual', desc: 'Multi-step reasoning and tricky problem scenarios', color: 'border-amber-300 text-amber-700 bg-amber-50' },
    { level: 'ADVANCED', label: 'Advanced / High Cutoff', desc: 'Top 5% difficulty questions designed for competitive rankers', color: 'border-purple-300 text-purple-700 bg-purple-50' },
    { level: 'MIXED', label: 'Mixed Examination Pattern', desc: 'Balanced distribution (30% Easy, 50% Moderate, 20% Hard)', color: 'border-slate-300 text-slate-800 bg-slate-100' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={step === 7 ? 'Mock Drill Request Submitted' : 'Request a Custom Mock Drill'}
      maxWidth="2xl"
    >
      <div className="space-y-5 text-slate-900">
        {/* Step Indicator (Steps 1-6) */}
        {step <= 6 && (
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>Step {step} of 6: {
                step === 1 ? 'Select Exam' :
                step === 2 ? 'Choose Subject' :
                step === 3 ? 'Target Topic' :
                step === 4 ? 'Difficulty Level' :
                step === 5 ? 'Test Preferences' :
                'Review & Confirm'
              }</span>
              <span className="text-orange-600 font-black">{Math.round((step / 6) * 100)}% Completed</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Informative MNC Quality Guarantee Card */}
        {step <= 6 && (
          <div className="rounded-xl bg-gradient-to-r from-blue-900 to-indigo-950 p-4 text-white shadow-md flex items-start gap-3.5 border border-blue-800/60">
            <div className="p-2 rounded-lg bg-white/10 shrink-0 text-orange-400 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <span className="font-black text-sm text-white tracking-tight flex items-center gap-1.5">
                FOCUSPOINT Academic Quality Assurance
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-orange-500 font-extrabold text-white">Operator Vetted</span>
              </span>
              <p className="text-blue-200 leading-relaxed">
                Personalized mock drills are prepared and published by FocusPoint's academic content team to maintain rigorous question quality, syllabus relevance, and pattern accuracy.
              </p>
            </div>
          </div>
        )}

        {/* Personalized Recommendation Banner if present */}
        {recommendedSubject && step === 1 && (
          <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3.5 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950">
              <span className="font-bold block">Recommended for You:</span>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Based on your recent test diagnostic, practicing <strong className="font-bold">{recommendedSubject}</strong> {recommendedTopic ? `→ ${recommendedTopic}` : ''} will yield your highest projected score improvement.
              </p>
            </div>
          </div>
        )}

        {/* STEP 1: EXAM SELECTION */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600" />
                Select Target Examination
              </label>
              <span className="text-[11px] text-slate-500">{availableExams.length} Exams Configured</span>
            </div>
            <p className="text-xs text-slate-500">
              Choose the competitive examination blueprint you want your custom mock drill to adhere to.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {availableExams.map((exam) => {
                const isSelected = selectedExamId === exam.id;
                return (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => {
                      setSelectedExamId(exam.id);
                      if (exam.subjects.length > 0) {
                        setSelectedSubject(exam.subjects[0]);
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate block">
                          {exam.shortName || exam.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </div>
                      <span className="text-[11px] text-slate-500 line-clamp-1 block">
                        {exam.name}
                      </span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {exam.subjects.length} Subjects
                        </span>
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {exam.totalQuestions} Qs Blueprint
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: SUBJECT SELECTION */}
        {step === 2 && activeExam && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Select Subject for {activeExam.shortName || activeExam.name}
              </label>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Exam: {activeExam.shortName || activeExam.name}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              FocusPoint academic operators will assemble questions specifically matching this syllabus subject.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {examSubjects.map((sub) => {
                const isSelected = selectedSubject === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubject(sub)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-slate-300'}`} />
                      <span className="text-xs font-bold text-slate-900">{sub}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: TOPIC / CHAPTER SELECTION */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Select Target Topic / Concept Area
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Specify the exact topics or concepts you wish to drill. You can choose from standard modules or enter a custom focus topic.
              </p>

              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                {availableTopics.map((topicItem) => {
                  const isSelected = selectedTopic === topicItem;
                  return (
                    <button
                      key={topicItem}
                      type="button"
                      onClick={() => setSelectedTopic(topicItem)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800">{topicItem}</span>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Custom Topic / Subtopic (Optional):
              </label>
              <input
                type="text"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                placeholder="e.g. Quadratic Equations, Syllogisms, Constitutional Amendments"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        )}

        {/* STEP 4: DIFFICULTY SELECTION */}
        {step === 4 && (
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              Target Difficulty Level
            </label>
            <p className="text-xs text-slate-500">
              Choose the question difficulty grading. FocusPoint operators will calibrate problem complexity accordingly.
            </p>

            <div className="space-y-2.5">
              {difficultyLevels.map((dl) => {
                const isSelected = difficulty === dl.level;
                return (
                  <button
                    key={dl.level}
                    type="button"
                    onClick={() => setDifficulty(dl.level)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 shadow-sm ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{dl.label}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${dl.color}`}>
                          {dl.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">{dl.desc}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: PREFERENCES (Questions, Duration, Language, Test Type, Notes) */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Number of Questions:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 15, 25, 50].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      questionCount === count
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Calculated duration: <strong className="text-slate-800">{durationMinutes} Minutes</strong> (~1.2 mins/question)
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Test Type:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {testTypesList.map((tt) => {
                  const isSelected = testType === tt.type;
                  return (
                    <button
                      key={tt.type}
                      type="button"
                      onClick={() => setTestType(tt.type)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-bold text-slate-900 block truncate">{tt.type}</span>
                        <span className="text-[10px] text-slate-500 line-clamp-1">{tt.desc}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        {tt.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Language Medium:
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="English">English</option>
                  <option value="Bilingual">Bilingual (Hindi + English)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Special Focus / Notes for Operator (Optional):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Include 5 PYQs from 2023 shift"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW REQUEST */}
        {step === 6 && activeExam && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Request Summary
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800">
                  Ready to Submit
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">Examination:</span>
                  <span className="font-bold text-slate-900">{activeExam.name} ({activeExam.shortName})</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Subject:</span>
                  <span className="font-bold text-slate-900">{selectedSubject}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Topic / Scope:</span>
                  <span className="font-bold text-slate-900">{selectedTopic || 'Full Subject'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Difficulty:</span>
                  <span className="font-bold text-slate-900">{difficulty}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Test Type:</span>
                  <span className="font-bold text-slate-900">{testType}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Questions & Duration:</span>
                  <span className="font-bold text-slate-900">{questionCount} Qs • {durationMinutes} Mins</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Medium:</span>
                  <span className="font-bold text-slate-900">{language}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Estimated SLA:</span>
                  <span className="font-bold text-emerald-700">Within 24 Hours</span>
                </div>
              </div>

              {notes && (
                <div className="pt-2 border-t border-slate-200 text-xs">
                  <span className="text-[11px] text-slate-500 block">Notes to Operator:</span>
                  <span className="text-slate-700 italic">"{notes}"</span>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 flex items-start gap-2.5 text-xs text-blue-900">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Once submitted, this request will be routed directly to the FocusPoint Mock Test Operations desk. You will receive an in-app notification and your test will appear under <strong>My Requests</strong> as soon as it is vetted and published.
              </span>
            </div>
          </div>
        )}

        {/* STEP 7: SUBMISSION CONFIRMATION */}
        {step === 7 && submittedRequest && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 uppercase tracking-wider inline-block mb-1">
                Request ID: {submittedRequest.id}
              </span>
              <h3 className="text-lg font-black text-slate-950">
                Custom Mock Drill Request Submitted!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                Your practice request has been assigned to the FocusPoint Academic Content Team for quality curation and syllabus validation.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                  {submittedRequest.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Exam:</span>
                <span className="font-bold text-slate-900">{submittedRequest.examName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="font-bold text-slate-900">{submittedRequest.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Questions:</span>
                <span className="font-bold text-slate-900">{submittedRequest.questionCount} Qs ({submittedRequest.difficulty})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Est. Availability:</span>
                <span className="font-bold text-emerald-700">{submittedRequest.estimatedAvailability}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="outline"
                className="text-xs"
                onClick={handleResetAndClose}
              >
                Close
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                onClick={handleResetAndClose}
              >
                Go to My Requests
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons (Steps 1-6) */}
        {step <= 6 && (
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <Button
                variant="outline"
                className="text-xs gap-1"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>
            ) : (
              <Button
                variant="outline"
                className="text-xs"
                onClick={handleResetAndClose}
              >
                Cancel
              </Button>
            )}

            {step < 6 ? (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1"
                onClick={handleNext}
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-blue-600/20"
                onClick={handleSubmit}
                isLoading={isSubmitting}
              >
                <Send className="w-3.5 h-3.5" />
                Submit Custom Mock Request
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
