// FOCUSPOINT — Real-Time Mock Test Attempt Engine

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Send, 
  RotateCcw,
  ShieldAlert,
  Info
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { mockTestService } from '../../services/mockTestService';
import { MockTestAttempt, QuestionItem } from '../../types/academicIntelligence';

export const LiveMockTestAttempt: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [attempt, setAttempt] = useState<MockTestAttempt | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Countdown timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3600);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Time spent tracking
  const questionStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const init = async () => {
      if (!attemptId) return;
      setLoading(true);
      try {
        const att = await mockTestService.getAttempt(attemptId);
        if (!att) {
          showToast('Attempt session not found', 'error');
          navigate('/student/mock-tests');
          return;
        }
        if (att.status === 'COMPLETED') {
          navigate(`/student/mock-tests/history/${att.id}`);
          return;
        }

        const qList = await mockTestService.getQuestionsForTest(att.questionOrder);
        setAttempt(att);
        setQuestions(qList);

        // Calculate initial remaining seconds (e.g. 60 mins default)
        const elapsed = Math.floor((Date.now() - new Date(att.startedAt).getTime()) / 1000);
        const totalDuration = 60 * 60; // 60 minutes
        const remaining = Math.max(0, totalDuration - elapsed);
        setSecondsRemaining(remaining);
      } catch (err) {
        console.error('Failed to initialize test attempt', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [attemptId]);

  // Countdown clock effect
  useEffect(() => {
    if (loading || secondsRemaining <= 0 || !attempt || attempt.status === 'COMPLETED') return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, secondsRemaining, attempt]);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = async (optionText: string) => {
    if (!attempt || !currentQuestion) return;

    const currentAnswer = attempt.answers[currentQuestion.id];
    const isAlreadySelected = currentAnswer?.selectedOptions.includes(optionText);
    const newOptions = isAlreadySelected ? [] : [optionText];

    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    questionStartTimeRef.current = Date.now();

    const updated = await mockTestService.saveAnswer(
      attempt.id,
      currentQuestion.id,
      newOptions,
      undefined,
      currentAnswer?.isMarkedForReview || false,
      timeSpent
    );
    if (updated) {
      setAttempt({ ...updated });
    }
  };

  const handleClearResponse = async () => {
    if (!attempt || !currentQuestion) return;
    const currentAnswer = attempt.answers[currentQuestion.id];

    const updated = await mockTestService.saveAnswer(
      attempt.id,
      currentQuestion.id,
      [],
      undefined,
      currentAnswer?.isMarkedForReview || false,
      0
    );
    if (updated) {
      setAttempt({ ...updated });
    }
  };

  const handleToggleMarkForReview = async () => {
    if (!attempt || !currentQuestion) return;
    const currentAnswer = attempt.answers[currentQuestion.id];
    const isMarked = !currentAnswer?.isMarkedForReview;

    const updated = await mockTestService.saveAnswer(
      attempt.id,
      currentQuestion.id,
      currentAnswer?.selectedOptions || [],
      undefined,
      isMarked,
      0
    );
    if (updated) {
      setAttempt({ ...updated });
    }
  };

  const handleNext = () => {
    questionStartTimeRef.current = Date.now();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    questionStartTimeRef.current = Date.now();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleAutoSubmit = async () => {
    showToast('Time expired! Automatically evaluating your examination...', 'info');
    await handleFinalSubmit();
  };

  const handleFinalSubmit = async () => {
    if (!attempt) return;
    setSubmitting(true);
    try {
      const completed = await mockTestService.submitAttempt(attempt.id);
      showToast('Mock test submitted successfully!', 'success');
      navigate(`/student/mock-tests/history/${completed.id}`);
    } catch (e: any) {
      showToast(e.message || 'Failed to submit test', 'error');
    } finally {
      setSubmitting(false);
      setIsSubmitModalOpen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Palette color coding
  const getQuestionPaletteColor = (qId: string, idx: number) => {
    const isCurrent = idx === currentIndex;
    const ans = attempt?.answers[qId];

    if (!ans) return 'bg-slate-100 text-slate-700 border-slate-300';

    if (ans.isMarkedForReview && ans.isAnswered) {
      return `bg-purple-600 text-white border-purple-700 ring-2 ring-emerald-400 ${isCurrent ? 'scale-110 shadow-md' : ''}`;
    }
    if (ans.isMarkedForReview) {
      return `bg-purple-500 text-white border-purple-600 ${isCurrent ? 'scale-110 shadow-md ring-2 ring-blue-400' : ''}`;
    }
    if (ans.isAnswered) {
      return `bg-emerald-600 text-white border-emerald-700 ${isCurrent ? 'scale-110 shadow-md ring-2 ring-blue-400' : ''}`;
    }
    return `bg-rose-100 text-rose-800 border-rose-200 ${isCurrent ? 'scale-110 shadow-md ring-2 ring-blue-400' : ''}`;
  };

  if (loading || !attempt || !currentQuestion) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Answer statistics
  const answeredCount = Object.values(attempt.answers).filter(a => a.isAnswered).length;
  const markedCount = Object.values(attempt.answers).filter(a => a.isMarkedForReview).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Test Top Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 block">
            {attempt.examName} • LIVE EXAMINATION
          </span>
          <h2 className="text-sm md:text-base font-black truncate max-w-md">
            {attempt.mockTestTitle}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Countdown Clock */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono font-bold text-sm ${
            secondsRemaining < 300 
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' 
              : 'bg-slate-800 text-emerald-400 border border-slate-700'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-600/30"
          >
            <Send className="w-3.5 h-3.5" /> Submit Test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Question Canvas (Left 3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-6 border-slate-200 min-h-[460px] flex flex-col justify-between">
            <div>
              {/* Question Meta Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-blue-600">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-700">{currentQuestion.subject}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{currentQuestion.topic}</span>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    +{currentQuestion.marks} Marks
                  </span>
                  <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                    -{currentQuestion.negativeMarks} Neg.
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-slate-900 text-sm md:text-base font-medium leading-relaxed mb-6 whitespace-pre-line">
                {currentQuestion.questionText}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt, oIdx) => {
                  const isSelected = attempt.answers[currentQuestion.id]?.selectedOptions.includes(opt.text);
                  const optionLetter = String.fromCharCode(65 + oIdx);

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(opt.text)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-950 ring-1 ring-blue-600 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {optionLetter}
                      </div>
                      <span className="text-xs md:text-sm pt-0.5 font-medium">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100 mt-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearResponse}
                  className="text-xs text-slate-600 border-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Response
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleMarkForReview}
                  className={`text-xs gap-1.5 ${
                    attempt.answers[currentQuestion.id]?.isMarkedForReview
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : 'text-purple-700 border-purple-200'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {attempt.answers[currentQuestion.id]?.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="text-xs gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </Button>
                <Button
                  size="sm"
                  onClick={handleNext}
                  disabled={currentIndex === questions.length - 1}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Question Palette & Legend (Right 1 col) */}
        <div className="space-y-4">
          <Card className="p-4 border-slate-200">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
              Question Palette ({questions.length})
            </h3>

            {/* Questions Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-[340px] overflow-y-auto p-1">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    questionStartTimeRef.current = Date.now();
                    setCurrentIndex(idx);
                  }}
                  className={`w-9 h-9 rounded-lg font-mono font-bold text-xs flex items-center justify-center border transition-all cursor-pointer ${getQuestionPaletteColor(
                    q.id,
                    idx
                  )}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white"></span>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-300"></span>
                <span>Not Answered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-purple-500"></span>
                <span>Marked for Review ({markedCount})</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isSubmitModalOpen && (
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          title="Submit Examination Paper?"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-slate-700 p-2">
            <p className="text-slate-600">
              Are you sure you want to finalize and submit your mock test? Instant evaluation and diagnostics will be compiled.
            </p>

            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">Answered</span>
                <span className="text-sm font-black text-emerald-600 font-mono">{answeredCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Unanswered</span>
                <span className="text-sm font-black text-rose-600 font-mono">{unansweredCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Review Flagged</span>
                <span className="text-sm font-black text-purple-600 font-mono">{markedCount}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setIsSubmitModalOpen(false)}
                disabled={submitting}
              >
                Back to Test
              </Button>
              <Button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {submitting ? 'Evaluating...' : 'Confirm Submission'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
